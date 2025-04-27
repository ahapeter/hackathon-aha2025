import { create } from 'zustand';
import { SwipeeGame } from '../core/game';
import { SwipeeGameConfig, SwipeeGameState, SwipeeScore } from '../core/types';
import { GameStore, GameEvent, GameData } from './types';
import { MQTTService } from '@shared/services/mqtt';
import axios from 'axios';

export const useGameStore = create<GameStore>()((set, get) => ({
  // Game states slice
  game_states: [],
  addGameEvent: (event: GameEvent) => {
    set((state) => ({
      game_states: [...state.game_states, event]
    }));
  },
  getGameEvents: (presentationId: string) => {
    return get().game_states.filter(event => event.presentationId === presentationId);
  },

  // Game data slice
  game_datas: [],
  setGameData: (data: GameData) => {
    set((state) => ({
      game_datas: [
        ...state.game_datas.filter(g => g.presentationId !== data.presentationId),
        data
      ]
    }));
  },
  getGameData: (presentationId: string) => {
    return get().game_datas.find(data => data.presentationId === presentationId);
  },

  // Game scores slice
  game_scores: [],
  addScore: (score: SwipeeScore) => {
    set((state) => ({
      game_scores: [...state.game_scores, score]
    }));
  },
  getScores: (presentationId: string) => {
    return get().game_scores.filter(score => score.presentationId === presentationId);
  },

  // MQTT service
  mqttService: null,

  // Game actions
  initGame: (config: SwipeeGameConfig) => {
    const game = new SwipeeGame(config);
    const gameData: GameData = {
      presentationId: config.presentationId,
      config: config,
      state: game.getGameState()
    };
    get().setGameData(gameData);
  },

  startGame: async () => {
    const { getGameData, setGameData, addGameEvent, mqttService } = get();
    const gameData = getGameData(get().game_datas[0]?.presentationId);
    
    if (gameData) {
      const game = new SwipeeGame(gameData.config);
      game.start();
      
      const newGameData: GameData = {
        ...gameData,
        state: game.getGameState()
      };
      setGameData(newGameData);

      // Add start event
      const startEvent: GameEvent = {
        event_name: 'STARTED',
        event_time: Date.now(),
        presentationId: gameData.presentationId
      };
      addGameEvent(startEvent);

      // Save game state to server
      try {
        await axios.post('/api/game-state', {
          presentationId: gameData.presentationId,
          config: gameData.config,
          state: newGameData.state,
        });
      } catch (error) {
        console.error('Failed to save game state:', error);
      }

      if (mqttService) {
        mqttService.publish(`swipee/game/${gameData.presentationId}`, {
          type: 'GAME_START',
          payload: gameData.config
        });
      }
    }
  },

  stopGame: async () => {
    const { getGameData, setGameData, addGameEvent, mqttService } = get();
    const gameData = getGameData(get().game_datas[0]?.presentationId);
    
    if (gameData) {
      const game = new SwipeeGame(gameData.config);
      game.stop();
      
      const newGameData: GameData = {
        ...gameData,
        state: game.getGameState()
      };
      setGameData(newGameData);

      // Add stop event
      const stopEvent: GameEvent = {
        event_name: 'STOPPED',
        event_time: Date.now(),
        presentationId: gameData.presentationId
      };
      addGameEvent(stopEvent);

      // Delete game state from server
      try {
        await axios.delete(`/api/game-state?presentationId=${gameData.presentationId}`);
      } catch (error) {
        console.error('Failed to delete game state:', error);
      }

      if (mqttService) {
        mqttService.publish(`swipee/game/${gameData.presentationId}`, {
          type: 'GAME_STOP',
          payload: null
        });
      }
    }
  },

  submitAnswer: (isSwipedRight: boolean) => {
    const { getGameData, setGameData, addScore, mqttService } = get();
    const gameData = getGameData(get().game_datas[0]?.presentationId);
    
    if (gameData) {
      const game = new SwipeeGame(gameData.config);
      const isCorrect = game.submitAnswer(isSwipedRight);
      
      const newGameData: GameData = {
        ...gameData,
        state: game.getGameState()
      };
      setGameData(newGameData);

      if (mqttService) {
        mqttService.publish(`swipee/game/${gameData.presentationId}`, {
          type: 'SCORE_UPDATE',
          payload: { isCorrect }
        });
      }
    }
  },

  connectMQTT: (topic: string) => {
    const mqttService = new MQTTService();
    mqttService.subscribe(topic);
    set({ mqttService });
  },

  disconnectMQTT: () => {
    const { mqttService } = get();
    if (mqttService) {
      mqttService.disconnect();
      set({ mqttService: null });
    }
  },

  loadGameState: async (presentationId: string) => {
    try {
      const response = await axios.get(`/api/game-state?presentationId=${presentationId}`);
      const { config, state } = response.data;
      
      const gameData: GameData = {
        presentationId,
        config,
        state
      };
      get().setGameData(gameData);

      // If game is running, add a STARTED event
      if (state.isStarted) {
        const startEvent: GameEvent = {
          event_name: 'STARTED',
          event_time: response.data.startedAt,
          presentationId
        };
        get().addGameEvent(startEvent);
      }

      return true;
    } catch (error) {
      console.error('Failed to load game state:', error);
      return false;
    }
  },
})); 