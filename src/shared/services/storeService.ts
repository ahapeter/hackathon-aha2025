import fs from 'fs';
import path from 'path';
import { GameStore, StoreData, GameEvent, GameScore, getStoreKey } from '../types/store';

export class StoreService {
  private static getStorePath(): string {
    const storeDir = path.join(process.cwd(), 'data', 'store');
    if (!fs.existsSync(storeDir)) {
      fs.mkdirSync(storeDir, { recursive: true });
    }
    return path.join(storeDir, 'store.json');
  }

  private static loadStore(): StoreData {
    const storePath = this.getStorePath();
    if (!fs.existsSync(storePath)) {
      return {};
    }
    const data = fs.readFileSync(storePath, 'utf-8');
    return JSON.parse(data) as StoreData;
  }

  private static saveStore(store: StoreData): void {
    const storePath = this.getStorePath();
    fs.writeFileSync(storePath, JSON.stringify(store, null, 2));
  }

  static initializeGame<TConfig>(
    presentationId: string,
    slideId: string,
    type: string,
    configs: TConfig
  ): void {
    const store = this.loadStore();
    const key = getStoreKey(presentationId, slideId);

    store[key] = {
      type,
      states: [],
      scores: [],
      configs
    };

    this.saveStore(store);
  }

  static getGameStore<TConfig>(
    presentationId: string,
    slideId: string
  ): GameStore<TConfig> | null {
    const store = this.loadStore();
    const key = getStoreKey(presentationId, slideId);
    return store[key] || null;
  }

  static addGameEvent(
    presentationId: string,
    slideId: string,
    event: Omit<GameEvent, 'timestamp'>
  ): void {
    const store = this.loadStore();
    const key = getStoreKey(presentationId, slideId);

    if (!store[key]) {
      throw new Error('Game not found');
    }

    store[key].states.push({
      ...event,
      timestamp: Date.now()
    });

    this.saveStore(store);
  }

  static addGameScore(
    presentationId: string,
    slideId: string,
    score: Omit<GameScore, 'timestamp'>
  ): void {
    const store = this.loadStore();
    const key = getStoreKey(presentationId, slideId);

    if (!store[key]) {
      throw new Error('Game not found');
    }

    store[key].scores.push({
      ...score,
      timestamp: Date.now()
    });

    this.saveStore(store);
  }

  static updateGameConfigs<TConfig>(
    presentationId: string,
    slideId: string,
    configs: TConfig
  ): void {
    const store = this.loadStore();
    const key = getStoreKey(presentationId, slideId);

    if (!store[key]) {
      throw new Error('Game not found');
    }

    store[key].configs = configs;
    this.saveStore(store);
  }

  static deleteGame(presentationId: string, slideId: string): void {
    const store = this.loadStore();
    const key = getStoreKey(presentationId, slideId);

    if (store[key]) {
      delete store[key];
      this.saveStore(store);
    }
  }
} 