import { SwipeeGame, createDummyQuestions } from './game';
import { SwipeeGameConfig } from './types';

describe('SwipeeGame', () => {
  let game: SwipeeGame;
  let config: SwipeeGameConfig;

  beforeEach(() => {
    config = {
      presentationId: 'test-presentation',
      slideId: 'test-slide',
      questions: createDummyQuestions(),
    };
    game = new SwipeeGame(config);
  });

  test('should initialize with correct state', () => {
    const state = game.getGameState();
    expect(state.isStarted).toBe(false);
    expect(state.currentQuestionIndex).toBe(0);
    expect(state.timeSpent).toBe(0);
  });

  test('should start game correctly', () => {
    game.start();
    const state = game.getGameState();
    expect(state.isStarted).toBe(true);
    expect(state.currentQuestionIndex).toBe(0);
  });

  test('should return current question after start', () => {
    game.start();
    const question = game.getCurrentQuestion();
    expect(question).toEqual(config.questions[0]);
  });

  test('should correctly evaluate right swipe for correct answer', () => {
    game.start();
    // First question has correct answer as first option (right swipe)
    const isCorrect = game.submitAnswer(true);
    expect(isCorrect).toBe(true);
    expect(game.getGameState().currentQuestionIndex).toBe(1);
  });

  test('should correctly evaluate left swipe for incorrect answer', () => {
    game.start();
    // First question has incorrect answer as second option (left swipe)
    const isCorrect = game.submitAnswer(false);
    expect(isCorrect).toBe(false);
    expect(game.getGameState().currentQuestionIndex).toBe(1);
  });

  test('should calculate score correctly', () => {
    const score = game.calculateScore(3);
    expect(score).toBe(60); // 3 correct out of 5 questions = 60%
  });

  test('should return null for current question when game is not started', () => {
    const question = game.getCurrentQuestion();
    expect(question).toBeNull();
  });

  test('should return null for current question when all questions are answered', () => {
    game.start();
    // Answer all questions
    config.questions.forEach(() => {
      game.submitAnswer(true);
    });
    const question = game.getCurrentQuestion();
    expect(question).toBeNull();
  });
}); 