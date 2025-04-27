import { SwipeeQuestion } from '../types';

export type Direction = 'left' | 'right' | 'up' | 'down';

/**
 * Handles swipe logic and returns the next question to show
 * @param questions - Array of all questions
 * @param currentIndex - Current question index
 * @param direction - Swipe direction
 * @returns Next question index to show, or -1 if no more questions
 */
export const handleSwipe = (
  questions: SwipeeQuestion[],
  currentIndex: number,
  direction: Direction
): number => {
  // If no questions or invalid current index, return -1
  if (!questions.length || currentIndex < 0 || currentIndex >= questions.length) {
    return -1;
  }

  // Only handle left/right swipes
  if (direction !== 'left' && direction !== 'right') {
    return currentIndex;
  }

  // Calculate next index
  const nextIndex = currentIndex + 1;

  // If next index is beyond questions length, return -1
  if (nextIndex >= questions.length) {
    return -1;
  }

  return nextIndex;
};

/**
 * Checks if the swipe direction matches the correct answer
 * @param question - Current question
 * @param direction - Swipe direction
 * @returns true if the swipe direction matches the correct answer
 */
export const isCorrectAnswer = (
  question: SwipeeQuestion,
  direction: Direction
): boolean => {
  if (!question || !question.options.length) {
    return false;
  }

  // Only handle left/right swipes
  if (direction !== 'left' && direction !== 'right') {
    return false;
  }

  const isRight = direction === 'right';
  return isRight === question.options[0].isCorrect;
}; 