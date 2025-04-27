import axios, { AxiosError } from 'axios';

const TEST_PRESENTATION_ID = 'test-presentation-123';

// Sample game configuration
const sampleConfig = {
  presentationId: TEST_PRESENTATION_ID,
  questions: [
    { text: 'Is Earth round?', correctAnswer: true },
    { text: 'Is the sky blue?', correctAnswer: true }
  ],
  timeLimit: 30
};

// Sample game state
const sampleState = {
  isStarted: true,
  currentQuestionIndex: 0,
  startedAt: Date.now(),
  endedAt: null
};

async function runTests() {
  try {
    console.log('Starting game state API tests...\n');

    // Test 1: Save game state
    console.log('Test 1: Saving game state...');
    await axios.post('http://localhost:3000/api/game-state', {
      presentationId: TEST_PRESENTATION_ID,
      config: sampleConfig,
      state: sampleState
    });
    console.log('✅ Game state saved successfully\n');

    // Test 2: Add game event
    console.log('Test 2: Adding game event...');
    await axios.put('http://localhost:3000/api/game-state', {
      type: 'event',
      presentationId: TEST_PRESENTATION_ID,
      data: {
        event_name: 'STARTED',
        event_time: Date.now(),
        presentationId: TEST_PRESENTATION_ID
      }
    });
    console.log('✅ Game event added successfully\n');

    // Test 3: Add score
    console.log('Test 3: Adding score...');
    await axios.put('http://localhost:3000/api/game-state', {
      type: 'score',
      presentationId: TEST_PRESENTATION_ID,
      data: {
        presentationId: TEST_PRESENTATION_ID,
        userId: 'test-user-1',
        score: 100,
        timestamp: Date.now()
      }
    });
    console.log('✅ Score added successfully\n');

    // Test 4: Load game state
    console.log('Test 4: Loading game state...');
    const response = await axios.get(`http://localhost:3000/api/game-state?presentationId=${TEST_PRESENTATION_ID}`);
    console.log('Game state loaded:', JSON.stringify(response.data, null, 2));
    console.log('✅ Game state loaded successfully\n');

    // Test 5: Delete game state
    console.log('Test 5: Deleting game state...');
    await axios.delete(`http://localhost:3000/api/game-state?presentationId=${TEST_PRESENTATION_ID}`);
    console.log('✅ Game state deleted successfully\n');

    // Verify deletion
    try {
      await axios.get(`http://localhost:3000/api/game-state?presentationId=${TEST_PRESENTATION_ID}`);
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