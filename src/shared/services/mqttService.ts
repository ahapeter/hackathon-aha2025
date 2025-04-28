import mqtt from 'mqtt';

// Types
export interface MqttMessage {
  type: string;
  data: any;
}

export interface GameStateMessage extends MqttMessage {
  type: 'GAME_STATE';
  data: {
    isStarted: boolean;
    timestamp: number;
  };
}

// Constants
const MQTT_HOST = 'dev.ahaslide.com';
const MQTT_PORT = 443;
const MQTT_GAME_TOPIC_PREFIX = 'swipee/game';

// MQTT Client state
let client: mqtt.MqttClient | null = null;
let isConnected = false;
let currentTopic: string | null = null;
let messageHandlers: ((message: MqttMessage) => void)[] = [];
let connectionPromise: Promise<void> | null = null;

/**
 * Connect to MQTT broker
 * @param presentationId - The presentation ID to connect to
 * @returns Promise that resolves when connected
 */
export const connectToGame = async (presentationId: string): Promise<void> => {
  const url = `wss://${MQTT_HOST}:${MQTT_PORT}/mqtt`;
  const topic = `${MQTT_GAME_TOPIC_PREFIX}/${presentationId}`;

  // If already connected to the same topic, return
  if (client && isConnected && currentTopic === topic) {
    return;
  }

  // If there's an existing connection promise, wait for it
  if (connectionPromise) {
    await connectionPromise;
    if (currentTopic === topic) {
      return;
    }
  }

  // Clean up existing connection if any
  if (client) {
    await disconnectFromGame();
  }

  connectionPromise = new Promise((resolve, reject) => {
    console.log('Connecting to MQTT');
    try {
      client = mqtt.connect(url, {
        keepalive: 30,
        reconnectPeriod: 1000,
      });

      client.on('connect', () => {
        console.log('MQTT Connected');
        isConnected = true;
        currentTopic = topic;
        
        // Subscribe to game topic
        client!.subscribe(topic, (err) => {
          if (err) {
            console.error('MQTT Subscribe error:', err);
            reject(err);
            return;
          }
          console.log(`Subscribed to ${topic}`);
          resolve();
        });
      });

      client.on('error', (err) => {
        console.error('MQTT Connection error:', err);
        isConnected = false;
        currentTopic = null;
        reject(err);
      });

      client.on('close', () => {
        console.log('MQTT Connection closed');
        isConnected = false;
        currentTopic = null;
      });

      client.on('message', (receivedTopic, message) => {
        if (receivedTopic === topic) {
          try {
            const parsedMessage = JSON.parse(message.toString()) as MqttMessage;
            messageHandlers.forEach(handler => handler(parsedMessage));
          } catch (err) {
            console.error('Failed to parse MQTT message:', err);
          }
        }
      });

      // Set timeout for connection
      setTimeout(() => {
        if (!isConnected) {
          reject(new Error('MQTT Connection timeout'));
        }
      }, 5000);
    } catch (err) {
      console.error('MQTT Setup error:', err);
      reject(err);
    }
  });

  try {
    await connectionPromise;
  } finally {
    connectionPromise = null;
  }
};

/**
 * Disconnect from MQTT broker
 */
export const disconnectFromGame = async (): Promise<void> => {
  messageHandlers = [];
  if (!client) return;

  return new Promise((resolve) => {
    client!.end(true, {}, () => {
      client = null;
      isConnected = false;
      currentTopic = null;
      resolve();
    });
  });
};

/**
 * Send a game state update
 * @param presentationId - The presentation ID
 * @param isStarted - Whether the game is started
 */
export const sendGameState = async (presentationId: string, isStarted: boolean): Promise<void> => {
  if (!client || !isConnected) {
    throw new Error('MQTT client not connected');
  }

  const message: GameStateMessage = {
    type: 'GAME_STATE',
    data: {
      isStarted,
      timestamp: Date.now()
    }
  };

  return new Promise((resolve, reject) => {
    client!.publish(
      `${MQTT_GAME_TOPIC_PREFIX}/${presentationId}`,
      JSON.stringify(message),
      (error) => {
        if (error) {
          console.error('MQTT Publish error:', error);
          reject(error);
        } else {
          resolve();
        }
      }
    );
  });
};

/**
 * Subscribe to game state updates
 * @param handler - Callback function to handle game state updates
 */
export const onGameStateChange = (handler: (message: MqttMessage) => void): void => {
  messageHandlers.push(handler);
};

/**
 * Unsubscribe from game state updates
 * @param handler - The handler to remove
 */
export const offGameStateChange = (handler: (message: MqttMessage) => void): void => {
  messageHandlers = messageHandlers.filter(h => h !== handler);
}; 