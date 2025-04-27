import { eventBus } from '@/shared/utils/eventBus';
import { APIService } from '@/shared/services/apiService';

interface ScoreEvent {
  presentationId: string;
  slideId: string;
  audienceId: string;
  audienceName: string;
  audienceEmoji: string;
  score: number;
  timestamp: number;
}

export const SCORE_EVENT = 'swipee:score';

export const initializeScoreService = () => {
  eventBus.on(SCORE_EVENT, async (event: ScoreEvent) => {
    try {
      await APIService.updateGameState(
        event.presentationId,
        event.slideId,
        'score',
        {
          audienceId: event.audienceId,
          audienceName: event.audienceName,
          audienceEmoji: event.audienceEmoji,
          score: event.score,
          timestamp: event.timestamp
        }
      );
    } catch (error) {
      console.error('Failed to update score:', error);
      // TODO: Implement retry logic or error handling
    }
  });
};

export const submitScore = (event: ScoreEvent) => {
  eventBus.emit(SCORE_EVENT, event);
}; 