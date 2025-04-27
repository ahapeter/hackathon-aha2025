import mqtt, { MqttClient } from 'mqtt';
import { MQTTMessage } from '@modules/swipee/core/types';

export class MQTTService {
  private client: MqttClient | null = null;
  private messageHandlers: ((message: MQTTMessage) => void)[] = [];

  constructor() {
    this.connect();
  }

  private connect() {
    this.client = mqtt.connect('wss://broker.emqx.io:8084/mqtt');

    this.client?.on('connect', () => {
      console.log('Connected to MQTT broker');
    });

    this.client?.on('message', (topic: string, message: Buffer) => {
      try {
        const parsedMessage = JSON.parse(message.toString()) as MQTTMessage;
        this.messageHandlers.forEach(handler => handler(parsedMessage));
      } catch (error: unknown) {
        console.error('Error parsing MQTT message:', error);
      }
    });

    this.client?.on('error', (error: Error) => {
      console.error('MQTT connection error:', error);
    });
  }

  public subscribe(topic: string) {
    if (this.client) {
      this.client.subscribe(topic);
    }
  }

  public publish(topic: string, message: MQTTMessage) {
    if (this.client) {
      this.client.publish(topic, JSON.stringify(message));
    }
  }

  public onMessage(handler: (message: MQTTMessage) => void) {
    this.messageHandlers.push(handler);
  }

  public disconnect() {
    if (this.client) {
      this.client.end();
      this.client = null;
    }
  }
} 