// Base types for all modules
export type GameEvent = {
  event_name: string;
  timestamp: number;
};

export type GameScore = {
  audienceId: string;
  audienceName?: string;
  audienceEmoji?: string;
  score: number;
  timestamp: number;
};

// Generic store structure for all games
export interface GameStore<TConfig> {
  type: string;
  states: GameEvent[];
  scores: GameScore[];
  configs: TConfig;
}

// Store data structure with presentation and slide IDs as keys
export interface StoreData {
  [key: string]: GameStore<any>;
}

// Helper function to generate store key
export const getStoreKey = (presentationId: string, slideId: string): string => {
  return `${presentationId}-${slideId}`;
}; 