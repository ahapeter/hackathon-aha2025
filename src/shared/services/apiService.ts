import { GameStore, GameEvent, GameScore } from '../types/store';

export class APIService {
  static async getGameStore<TConfig>(presentationId: string, slideId: string): Promise<GameStore<TConfig> | null> {
    try {
      const response = await fetch(`/api/game-state?presentationId=${presentationId}&slideId=${slideId}`);
      if (!response.ok) return null;
      return await response.json();
    } catch (error) {
      console.error('Failed to get game store:', error);
      return null;
    }
  }

  static async initGame<TConfig>(presentationId: string, slideId: string, config: TConfig): Promise<boolean> {
    try {
      console.log('Initializing game:', presentationId, slideId, config);
      const response = await fetch('/api/game-state', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ presentationId, slideId, config })
      });
      return response.ok;
    } catch (error) {
      console.error('Failed to initialize game:', error);
      return false;
    }
  }

  static async updateGameState(
    presentationId: string, 
    slideId: string, 
    type: 'event' | 'score', 
    data: GameEvent | GameScore
  ): Promise<boolean> {
    try {
      const response = await fetch('/api/game-state', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ presentationId, slideId, type, data })
      });
      return response.ok;
    } catch (error) {
      console.error('Failed to update game state:', error);
      return false;
    }
  }

  static async deleteGameState(presentationId: string, slideId: string): Promise<boolean> {
    try {
      const response = await fetch(`/api/game-state?presentationId=${presentationId}&slideId=${slideId}`, {
        method: 'DELETE'
      });
      return response.ok;
    } catch (error) {
      console.error('Failed to delete game state:', error);
      return false;
    }
  }
} 