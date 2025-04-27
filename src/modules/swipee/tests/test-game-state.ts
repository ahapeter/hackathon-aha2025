import axios, { AxiosError } from 'axios';
import { SwipeeGameConfig, SwipeeGameState, SwipeeScore, SwipeeQuestion, SwipeeOption } from '../core/types';
import { GameEvent } from '../store/types';

const TEST_PRESENTATION_ID = 'test-presentation-123';
const BASE_URL = 'http://localhost:3000';

// Sample game configuration
const sampleConfig: SwipeeGameConfig = {
  presentationId: TEST_PRESENTATION_ID,
  slideId: 'slide-1',
  questions: [
    {
      id: 'q1',
      options: [
        { title: 'Yes', imageUrl: '', isCorrect: true },
        { title: 'No', imageUrl: '', isCorrect: false }
      ]
    },
    {
      id: 'q2',
      options: [
        { title: 'Yes', imageUrl: '', isCorrect: true },
        { title: 'No', imageUrl: '', isCorrect: false }
      ]
    }
  ]
};

// Sample game state
const sampleState: SwipeeGameState = {
  isStarted: true,
  currentQuestionIndex: 0,
  timeSpent: 0
};

async function runTests() {
  try {
    console.log('Starting game state API tests...\n');

    // Test 1: Save game state
    console.log('Test 1: Saving game state...');
    await axios.post(`${BASE_URL}/api/game-state`, {
      presentationId: TEST_PRESENTATION_ID,
      config: sampleConfig,
      state: sampleState
    });
    console.log('✅ Game state saved successfully\n');

    // Test 2: Add game event
    console.log('Test 2: Adding game event...');
    const event: GameEvent = {
      event_name: 'STARTED',
      event_time: Date.now(),
      presentationId: TEST_PRESENTATION_ID
    };
    await axios.put(`${BASE_URL}/api/game-state`, {
      type: 'event',
      presentationId: TEST_PRESENTATION_ID,
      data: event
    });
    console.log('✅ Game event added successfully\n');

    // Test 3: Add score
    console.log('Test 3: Adding score...');
    const score: SwipeeScore = {
      presentationId: TEST_PRESENTATION_ID,
      activityId: 'activity-1',
      audienceId: 'audience-1',
      audienceName: 'Test User',
      audienceEmoji: '👋',
      score: 100
    };
    await axios.put(`${BASE_URL}/api/game-state`, {
      type: 'score',
      presentationId: TEST_PRESENTATION_ID,
      data: score
    });
    console.log('✅ Score added successfully\n');

    // Test 4: Load game state
    console.log('Test 4: Loading game state...');
    const response = await axios.get(`${BASE_URL}/api/game-state?presentationId=${TEST_PRESENTATION_ID}`);
    console.log('Game state loaded:', JSON.stringify(response.data, null, 2));
    console.log('✅ Game state loaded successfully\n');

    // Test 5: Delete game state
    console.log('Test 5: Deleting game state...');
    await axios.delete(`${BASE_URL}/api/game-state?presentationId=${TEST_PRESENTATION_ID}`);
    console.log('✅ Game state deleted successfully\n');

    // Verify deletion
    try {
      await axios.get(`${BASE_URL}/api/game-state?presentationId=${TEST_PRESENTATION_ID}`);
    } catch (error) {
      if ((error as AxiosError)?.response?.status === 404) {
        console.log('✅ Verified game state was deleted\n');
      }
    }

    console.log('All tests completed successfully! 🎉');
  } catch (error) {
    console.error('Test failed:', (error as AxiosError)?.response?.data || (error as Error).message);
  }
}

runTests(); 