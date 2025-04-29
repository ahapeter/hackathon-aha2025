export interface SwipeeOption {
  title: string;
  imageUrl: string;
  isCorrect: boolean;
}

export interface SwipeeQuestion {
  id: string;
  option: SwipeeOption;
}

export interface SwipeeConfigs {
  questions: SwipeeQuestion[];
}

export interface SwipeeState {
  isStarted: boolean;
  questions: SwipeeQuestion[];
  currentQuestionIndex: number;
  timeSpent: number;
} 