import { SwipeeGameConfig, SwipeeGameState, SwipeeScore } from '../core/types';

export type GameEvent = {
  event_name: 'STARTED' | 'STOPPED';
  event_time: number;
  presentationId: string;
};

export type GameData = {
  presentationId: string;
  config: SwipeeGameConfig;
  state: SwipeeGameState;
};

export interface GameStore {
  // Game states slice
  game_states: GameEvent[];
  addGameEvent: (event: GameEvent) => void;
  getGameEvents: (presentationId: string) => GameEvent[];
  
  // Game data slice
  game_datas: GameData[];
  setGameData: (data: GameData) => void;
  getGameData: (presentationId: string) => GameData | undefined;
  
  // Game scores slice
  game_scores: SwipeeScore[];
  addScore: (score: SwipeeScore) => void;
  getScores: (presentationId: string) => SwipeeScore[];
  
  // Game actions
  initGame: (config: SwipeeGameConfig) => void;
  startGame: () => void;
  stopGame: () => void;
  submitAnswer: (isSwipedRight: boolean) => void;
  
  // MQTT connection
  mqttService: any | null;
  connectMQTT: (topic: string) => void;
  disconnectMQTT: () => void;
  loadGameState: (presentationId: string) => Promise<boolean>;
} 