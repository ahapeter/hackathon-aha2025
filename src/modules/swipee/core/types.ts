export interface SwipeeOption {
  title: string;
  imageUrl: string;
  isCorrect: boolean;
}

export interface SwipeeQuestion {
  id: string;
  options: [SwipeeOption, SwipeeOption];
}

export interface SwipeeGameConfig {
  presentationId: string;
  slideId: string;
  questions: SwipeeQuestion[];
}

export interface SwipeeGameState {
  isStarted: boolean;
  currentQuestionIndex: number;
  timeSpent: number;
}

export interface SwipeeScore {
  presentationId: string;
  activityId: string;
  audienceId: string;
  audienceName: string;
  audienceEmoji: string;
  score: number;
}

export interface MQTTMessage {
  type: 'GAME_START' | 'GAME_STOP' | 'SCORE_UPDATE';
  payload: any;
} 