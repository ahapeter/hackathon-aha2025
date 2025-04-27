import { create } from 'zustand';
import { SwipeeConfigs, SwipeeQuestion } from '../types';
import { MQTTService } from '@/shared/services/mqtt';
import { APIService } from '@/shared/services/apiService';

interface SwipeeStore {
  // MQTT Service
  mqttClient: MQTTService | null;
  connectMQTT: (topic: string) => void;
  disconnectMQTT: () => void;

  // Game Management
  initGame: (presentationId: string, slideId: string, configs: SwipeeConfigs) => Promise<void>;
  startGame: (presentationId: string, slideId: string) => Promise<void>;
  stopGame: (presentationId: string, slideId: string) => Promise<void>;
  submitAnswer: (
    presentationId: string,
    slideId: string,
    audienceId: string,
    audienceName: string,
    audienceEmoji: string,
    isCorrect: boolean
  ) => Promise<void>;
}

export const useSwipeeStore = create<SwipeeStore>((set, get) => ({
  // MQTT Service
  mqttClient: null,
  connectMQTT: (topic: string) => {
    const mqttClient = new MQTTService();
    mqttClient.subscribe(topic);
    set({ mqttClient });
  },
  disconnectMQTT: () => {
    const { mqttClient } = get();
    if (mqttClient) {
      mqttClient.disconnect();
      set({ mqttClient: null });
    }
  },

  // Game Management
  initGame: async (presentationId: string, slideId: string, configs: SwipeeConfigs) => {
    await APIService.initGame(presentationId, slideId, configs);
  },

  startGame: async (presentationId: string, slideId: string) => {
    await APIService.updateGameState(presentationId, slideId, 'event', {
      event_name: 'STARTED',
      timestamp: Date.now()
    });
  },

  stopGame: async (presentationId: string, slideId: string) => {
    await APIService.updateGameState(presentationId, slideId, 'event', {
      event_name: 'STOPPED',
      timestamp: Date.now()
    });
  },

  submitAnswer: async (
    presentationId: string,
    slideId: string,
    audienceId: string,
    audienceName: string,
    audienceEmoji: string,
    isCorrect: boolean
  ) => {
    await APIService.updateGameState(presentationId, slideId, 'score', {
      audienceId,
      audienceName,
      audienceEmoji,
      score: isCorrect ? 1 : 0,
      timestamp: Date.now()
    });
  }
})); 