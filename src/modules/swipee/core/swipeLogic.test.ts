import { handleSwipe, isCorrectAnswer } from './swipeLogic';
import { SwipeeQuestion } from '../types';

describe('handleSwipe', () => {
  const mockQuestions: SwipeeQuestion[] = [
    {
      id: '1',
      options: [
        { title: 'Option 1', imageUrl: 'url1', isCorrect: true },
        { title: 'Option 2', imageUrl: 'url2', isCorrect: false }
      ]
    },
    {
      id: '2',
      options: [
        { title: 'Option 1', imageUrl: 'url1', isCorrect: false },
        { title: 'Option 2', imageUrl: 'url2', isCorrect: true }
      ]
    }
  ];

  it('should return next index for valid swipe', () => {
    expect(handleSwipe(mockQuestions, 0, 'right')).toBe(1);
    expect(handleSwipe(mockQuestions, 0, 'left')).toBe(1);
  });

  it('should return -1 when at last question', () => {
    expect(handleSwipe(mockQuestions, 1, 'right')).toBe(-1);
    expect(handleSwipe(mockQuestions, 1, 'left')).toBe(-1);
  });

  it('should return -1 for empty questions array', () => {
    expect(handleSwipe([], 0, 'right')).toBe(-1);
  });

  it('should return -1 for invalid current index', () => {
    expect(handleSwipe(mockQuestions, -1, 'right')).toBe(-1);
    expect(handleSwipe(mockQuestions, 2, 'right')).toBe(-1);
  });

  it('should return current index for up/down swipes', () => {
    expect(handleSwipe(mockQuestions, 0, 'up')).toBe(0);
    expect(handleSwipe(mockQuestions, 0, 'down')).toBe(0);
  });
});

describe('isCorrectAnswer', () => {
  const mockQuestion: SwipeeQuestion = {
    id: '1',
    options: [
      { title: 'Option 1', imageUrl: 'url1', isCorrect: true },
      { title: 'Option 2', imageUrl: 'url2', isCorrect: false }
    ]
  };

  it('should return true for correct right swipe', () => {
    expect(isCorrectAnswer(mockQuestion, 'right')).toBe(true);
  });

  it('should return true for correct left swipe', () => {
    const questionWithLeftCorrect: SwipeeQuestion = {
      id: '1',
      options: [
        { title: 'Option 1', imageUrl: 'url1', isCorrect: false },
        { title: 'Option 2', imageUrl: 'url2', isCorrect: true }
      ]
    };
    expect(isCorrectAnswer(questionWithLeftCorrect, 'left')).toBe(true);
  });

  it('should return false for incorrect swipe', () => {
    expect(isCorrectAnswer(mockQuestion, 'left')).toBe(false);
  });

  it('should return false for up/down swipes', () => {
    expect(isCorrectAnswer(mockQuestion, 'up')).toBe(false);
    expect(isCorrectAnswer(mockQuestion, 'down')).toBe(false);
  });

  it('should return false for invalid question', () => {
    expect(isCorrectAnswer(null as any, 'right')).toBe(false);
  });

  it('should return false for question with no options', () => {
    const questionWithoutOptions: SwipeeQuestion = {
      id: '1',
      options: [
        { title: 'Option 1', imageUrl: 'url1', isCorrect: true },
        { title: 'Option 2', imageUrl: 'url2', isCorrect: false }
      ]
    };
    expect(isCorrectAnswer(questionWithoutOptions, 'right')).toBe(true);
  });
}); 