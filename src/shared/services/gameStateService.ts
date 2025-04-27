import fs from 'fs';
import path from 'path';
import { SwipeeGameConfig, SwipeeGameState, SwipeeScore } from '@/modules/swipee/core/types';
import { GameEvent, GameData } from '@/modules/swipee/store/types';

interface StoredGameData {
  events: GameEvent[];
  data: GameData;
  scores: SwipeeScore[];
}

export class GameStateService {
  private static getGameStatePath(presentationId: string): string {
    const stateDir = path.join(process.cwd(), 'data', 'game-states');
    if (!fs.existsSync(stateDir)) {
      fs.mkdirSync(stateDir, { recursive: true });
    }
    return path.join(stateDir, `${presentationId}.json`);
  }

  static saveGameState(presentationId: string, config: SwipeeGameConfig, state: SwipeeGameState): void {
    const data: StoredGameData = {
      events: [],
      data: {
        presentationId,
        config,
        state,
      },
      scores: [],
    };
    const filePath = this.getGameStatePath(presentationId);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  }

  static loadGameState(presentationId: string): StoredGameData | null {
    const filePath = this.getGameStatePath(presentationId);
    if (!fs.existsSync(filePath)) {
      return null;
    }
    const data = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(data) as StoredGameData;
  }

  static deleteGameState(presentationId: string): void {
    const filePath = this.getGameStatePath(presentationId);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }

  static addGameEvent(presentationId: string, event: GameEvent): void {
    const filePath = this.getGameStatePath(presentationId);
    if (fs.existsSync(filePath)) {
      const data = JSON.parse(fs.readFileSync(filePath, 'utf-8')) as StoredGameData;
      data.events.push(event);
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    }
  }

  static addGameScore(presentationId: string, score: SwipeeScore): void {
    const filePath = this.getGameStatePath(presentationId);
    if (fs.existsSync(filePath)) {
      const data = JSON.parse(fs.readFileSync(filePath, 'utf-8')) as StoredGameData;
      data.scores.push(score);
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    }
  }
} 