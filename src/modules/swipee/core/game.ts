import { SwipeeGameConfig, SwipeeGameState, SwipeeQuestion, SwipeeScore } from './types';

export class SwipeeGame {
  private config: SwipeeGameConfig;
  private state: SwipeeGameState;

  constructor(config: SwipeeGameConfig) {
    this.config = config;
    this.state = {
      isStarted: false,
      currentQuestionIndex: 0,
      timeSpent: 0,
    };
  }

  public start(): void {
    this.state.isStarted = true;
    this.state.timeSpent = 0;
    this.state.currentQuestionIndex = 0;
  }

  public stop(): void {
    this.state.isStarted = false;
  }

  public getCurrentQuestion(): SwipeeQuestion | null {
    if (!this.state.isStarted || this.state.currentQuestionIndex >= this.config.questions.length) {
      return null;
    }
    return this.config.questions[this.state.currentQuestionIndex];
  }

  public submitAnswer(isSwipedRight: boolean): boolean {
    const currentQuestion = this.getCurrentQuestion();
    if (!currentQuestion) return false;

    const correctOption = currentQuestion.options.find(opt => opt.isCorrect);
    if (!correctOption) return false;

    // For right swipe, we consider it as choosing the first option
    const isCorrect = (isSwipedRight && currentQuestion.options[0].isCorrect) ||
                     (!isSwipedRight && currentQuestion.options[1].isCorrect);

    this.state.currentQuestionIndex++;
    return isCorrect;
  }

  public calculateScore(correctAnswers: number): number {
    const totalQuestions = this.config.questions.length;
    return Math.round((correctAnswers / totalQuestions) * 100);
  }

  public getGameState(): SwipeeGameState {
    return { ...this.state };
  }

  public getConfig(): SwipeeGameConfig {
    return { ...this.config };
  }
}

export const createDummyQuestions = (): SwipeeQuestion[] => [
  {
    id: '1',
    options: [
      {
        title: 'Paris is the capital of France',
        imageUrl: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34',
        isCorrect: true,
      },
      {
        title: 'London is the capital of France',
        imageUrl: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad',
        isCorrect: false,
      },
    ],
  },
  {
    id: '2',
    options: [
      {
        title: 'Mount Everest is the highest mountain',
        imageUrl: 'https://images.unsplash.com/photo-1516911064819-3bae0f8ad7d3',
        isCorrect: true,
      },
      {
        title: 'K2 is the highest mountain',
        imageUrl: 'https://images.unsplash.com/photo-1486911278844-a81c5267e227',
        isCorrect: false,
      },
    ],
  },
  {
    id: '3',
    options: [
      {
        title: 'The Earth is round',
        imageUrl: 'https://images.unsplash.com/photo-1614730321146-b6fa6a46bcb4',
        isCorrect: true,
      },
      {
        title: 'The Earth is flat',
        imageUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa',
        isCorrect: false,
      },
    ],
  },
  {
    id: '4',
    options: [
      {
        title: 'Water freezes at 0°C',
        imageUrl: 'https://images.unsplash.com/photo-1612968738155-87c12572b0d4',
        isCorrect: true,
      },
      {
        title: 'Water freezes at 10°C',
        imageUrl: 'https://images.unsplash.com/photo-1580937851511-a8aa4e4fa3b9',
        isCorrect: false,
      },
    ],
  },
  {
    id: '5',
    options: [
      {
        title: 'The sun is a star',
        imageUrl: 'https://images.unsplash.com/photo-1532693322450-2cb5c511067d',
        isCorrect: true,
      },
      {
        title: 'The sun is a planet',
        imageUrl: 'https://images.unsplash.com/photo-1614642264762-d0a3b8bf3700',
        isCorrect: false,
      },
    ],
  },
]; 