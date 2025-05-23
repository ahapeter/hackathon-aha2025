'use client';

import { useEffect, useState } from 'react';
import { useSwipeeStore } from '@/modules/swipee/store/swipeeStore';
import { Box, Button, Typography, Container, CircularProgress, Paper } from '@mui/material';
import { PlayArrow, Stop } from '@mui/icons-material';
import { APIService } from '@/shared/services/apiService';
import { SwipeeConfigs, SwipeeState, SwipeeOption } from '@/modules/swipee/types';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { alpha } from '@mui/material/styles';
import { SwipeeQuestion } from '@/modules/swipee/types';

interface PresentPageProps {
  params: {
    secret: string;
  };
  searchParams: {
    presentationId: string;
    slideId: string;
    isPresenting?: string;
  };
}

interface OptionWithQuestionId extends SwipeeOption {
  questionId: string;
}

// Add style constants
const COLORS = {
  teal: '#20E8B5',
  pink: '#FF4081',
  darkGray: '#333333',
  lightBlue: '#4A90E2',
  background: '#FFFFFF',
};

const buttonStyle = {
  borderRadius: '24px',
  textTransform: 'none',
  fontWeight: 600,
  px: 4,
  py: 2,
  boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 6px 12px rgba(0,0,0,0.15)',
  },
  transition: 'all 0.2s ease',
};

// Update preview styles
const previewStyles = {
  container: {
    width: '100%',
    aspectRatio: '16/9',
    maxWidth: '1200px',
    margin: '0 auto',
    position: 'relative',
    overflow: 'hidden',
    bgcolor: 'background.paper',
    borderRadius: 2,
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
  },
  questionsContainer: {
    width: '100%',
    height: '100%',
    overflowY: 'auto' as const,
    '&::-webkit-scrollbar': {
      width: '8px',
    },
    '&::-webkit-scrollbar-track': {
      background: 'grey.100',
      borderRadius: '4px',
    },
    '&::-webkit-scrollbar-thumb': {
      background: 'grey.400',
      borderRadius: '4px',
      '&:hover': {
        background: 'grey.500',
      },
    },
  },
  questionContainer: {
    width: '100%',
    minHeight: '100%',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 2,
    p: 2,
  },
  lanesContainer: {
    display: 'flex',
    height: '100%',
    gap: 2,
  },
  lane: {
    width: '33.33%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 2,
    p: 2,
    position: 'relative' as const,
    '&:not(:last-child)': {
      borderRight: '1px solid',
      borderColor: 'divider',
    },
  },
  option: {
    width: '100%',
    aspectRatio: '16/9',
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    gap: 1,
    p: 2,
    borderRadius: 2,
    transition: 'all 0.2s ease',
  },
  optionImage: {
    width: '100%',
    aspectRatio: '16/9',
    objectFit: 'cover' as const,
    borderRadius: 1,
    bgcolor: 'grey.100',
  },
  optionTitle: {
    textAlign: 'center' as const,
    fontWeight: 500,
    fontSize: '0.875rem',
  },
  correctOption: {
    bgcolor: '#4CAF5010', // Light green background
    border: '2px solid #4CAF50', // Green border
    '&::after': {
      content: '""',
      position: 'absolute' as const,
      top: 8,
      right: 8,
      width: 16,
      height: 16,
      borderRadius: '50%',
      bgcolor: '#4CAF50', // Green circle indicator
    },
  },
  incorrectOption: {
    bgcolor: '#F4433610', // Light red background
    border: '2px solid #F44336', // Red border
    '&::after': {
      content: '""',
      position: 'absolute' as const,
      top: 8,
      right: 8,
      width: 16,
      height: 16,
      borderRadius: '50%',
      bgcolor: '#F44336', // Red circle indicator
    },
  },
};

const optionStyles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: 1,
    width: '100%',
    height: '100%',
  },
  lane: {
    display: 'flex',
    flexDirection: 'column',
    gap: 1.5,
    flex: 1,
    minHeight: 0,
    overflow: 'auto',
    p: 1,
  },
  optionCard: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: 1.5,
    borderRadius: 1,
    border: '2px solid',
    position: 'relative',
    transition: 'all 0.2s ease',
    '& img': {
      width: '100%',
      aspectRatio: '16/9',
      objectFit: 'cover',
      borderRadius: 1,
      mb: 0.5,
    },
  },
  optionText: {
    textAlign: 'center',
    fontSize: '0.9rem',
    fontWeight: 500,
    mt: 0.5,
  },
  correctOption: {
    borderColor: '#4CAF50',
    bgcolor: alpha('#4CAF50', 0.1),
    '&::after': {
      content: '""',
      position: 'absolute',
      top: 8,
      right: 8,
      width: 8,
      height: 8,
      borderRadius: '50%',
      bgcolor: '#4CAF50',
    },
  },
  incorrectOption: {
    borderColor: '#FF4081',
    bgcolor: alpha('#FF4081', 0.1),
    '&::after': {
      content: '""',
      position: 'absolute',
      top: 8,
      right: 8,
      width: 8,
      height: 8,
      borderRadius: '50%',
      bgcolor: '#FF4081',
    },
  },
};

const PreviewLayout = ({ questions }: { questions: SwipeeQuestion[] }) => {
  // Distribute questions across lanes
  const lanes: SwipeeQuestion[][] = [[], [], []];
  
  questions.forEach((question, index) => {
    const laneIndex = index % 3; // Use modulo to distribute across all lanes
    lanes[laneIndex].push(question);
  });

  return (
    <Box sx={{ 
      display: 'flex', 
      gap: 1, 
      height: '100vh', 
      p: 1,
      bgcolor: '#f5f5f5',
    }}>
      {lanes.map((laneQuestions, laneIndex) => (
        <Box key={laneIndex} sx={optionStyles.lane}>
          {laneQuestions.map((question) => (
            <Box
              key={question.id}
              sx={{
                ...optionStyles.optionCard,
                ...(question.option.isCorrect ? optionStyles.correctOption : optionStyles.incorrectOption),
              }}
            >
              {question.option.imageUrl && (
                <img src={question.option.imageUrl} alt={question.option.title} />
              )}
              <Typography sx={optionStyles.optionText}>
                {question.option.title}
              </Typography>
            </Box>
          ))}
        </Box>
      ))}
    </Box>
  );
};

export default function PresentPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [gameState, setGameState] = useState<SwipeeState>({
    isStarted: false,
    questions: [],
    currentQuestionIndex: -1,
    timeSpent: 0
  });
  const [slideTitle, setSlideTitle] = useState('');
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { connectMQTT, disconnectMQTT, mqttClient } = useSwipeeStore();

  const isPresenting = searchParams.get('isPresenting') === 'true';
  const presentationId = searchParams.get('presentationId') || '';
  const slideId = searchParams.get('slideId') || '';

  // Load game state from API
  useEffect(() => {
    const loadGameState = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const gameStore = await APIService.getGameStore<SwipeeConfigs>(
          searchParams.get('presentationId') || '',
          searchParams.get('slideId') || ''
        );

        if (!gameStore) {
          setError('Game not found. Please check your link.');
          return;
        }

        // Check if game is running from the latest state
        const latestState = gameStore.states[gameStore.states.length - 1];
        const isStarted = latestState?.event_name === 'STARTED';
        
        // Store all questions and set current question if game is running
        if (gameStore.configs && gameStore.configs.questions) {
          const newGameState: SwipeeState = {
            isStarted,
            questions: gameStore.configs.questions,
            currentQuestionIndex: isStarted ? 0 : -1,
            timeSpent: isStarted ? Math.floor((Date.now() - latestState.timestamp) / 1000) : 0
          };
          setGameState(newGameState);
          setSlideTitle(gameStore.configs.title || '');
        }

        // Connect to MQTT if isPresenting
        if (isPresenting) {
          const topic = `swipee/${presentationId}`;
          connectMQTT(topic);
          await handleStartGame();
        }
      } catch (err) {
        console.error('Game state loading error:', err);
        setError('Failed to load game state. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    loadGameState();

    return () => {
      disconnectMQTT();
    };
  }, [searchParams, connectMQTT, disconnectMQTT]);

  // Subscribe to MQTT messages
  useEffect(() => {
    if (mqttClient && isPresenting) {
      mqttClient.onMessage((message) => {
        if (message.type === 'GAME_START') {
          setGameState(prev => ({ ...prev, isStarted: true }));
        } else if (message.type === 'GAME_STOP') {
          setGameState(prev => ({ ...prev, isStarted: false }));
          router.push(`/swipee/${params.secret}/present?presentationId=${presentationId}&slideId=${slideId}`);
        }
      });
    }
  }, [mqttClient, isPresenting, params.secret, presentationId, slideId, router]);

  const handleStartGame = async () => {
    try {
      if (!presentationId || !slideId) {
        throw new Error('Missing presentationId or slideId');
      }

      // Update game state in store
      await APIService.updateGameState(presentationId, slideId, 'event', {
        event_name: 'STARTED',
        timestamp: Date.now()
      });

      // Publish MQTT message
      if (mqttClient) {
        mqttClient.publish(`swipee/${presentationId}`, {
          type: 'GAME_START',
          payload: null
        });
      }

      setGameState(prev => ({
        ...prev,
        isStarted: true,
        timeSpent: 0
      }));
      setError(null);
    } catch (err) {
      console.error('Start game error:', err);
      setError('Failed to start game');
    }
  };

  const handleStopGame = async () => {
    try {
      if (!presentationId || !slideId) {
        throw new Error('Missing presentationId or slideId');
      }

      // Update game state in store
      await APIService.updateGameState(presentationId, slideId, 'event', {
        event_name: 'STOPPED',
        timestamp: Date.now()
      });

      // Publish MQTT message
      if (mqttClient) {
        mqttClient.publish(`swipee/${presentationId}`, {
          type: 'GAME_STOP',
          payload: null
        });
      }

      setGameState(prev => ({
        ...prev,
        isStarted: false
      }));

      // Redirect to present page without isPresenting parameter
      router.push(`/swipee/${params.secret}/present?presentationId=${presentationId}&slideId=${slideId}`);
    } catch (err) {
      console.error('Stop game error:', err);
      setError('Failed to stop game');
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {slideTitle && (
        <Typography 
          variant="h4" 
          sx={{ 
            textAlign: 'center',
            mb: 4,
            fontWeight: 700,
            color: COLORS.darkGray
          }}
        >
          {slideTitle}
        </Typography>
      )}
      
      {isLoading ? (
        <Box sx={{ 
          py: 6, 
          textAlign: 'center',
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
        }}>
          <CircularProgress size={48} sx={{ color: COLORS.teal }} />
          <Typography 
            variant="h6" 
            sx={{ 
              mt: 3,
              color: COLORS.darkGray,
              fontWeight: 500,
            }}
          >
            Loading game...
          </Typography>
        </Box>
      ) : error ? (
        <Box sx={{ py: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="error" gutterBottom>
            {error}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Please check your connection and try again.
          </Typography>
        </Box>
      ) : !isPresenting ? (
        <Box sx={{ 
          py: 6,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 4
        }}>
          <PreviewLayout questions={gameState?.questions || []} />
        </Box>
      ) : (
        <Box sx={{ 
          py: 6,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 4,
          minHeight: '100vh',
          justifyContent: 'center'
        }}>
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center',
            gap: 4,
            width: '100%',
          }}>
            {gameState?.isStarted ? (
              <>
                <Box sx={{ 
                  position: 'relative',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: 4
                }}>
                  <Box sx={{ position: 'relative' }}>
                    <CircularProgress 
                      size={200} 
                      thickness={2} 
                      sx={{ 
                        color: COLORS.teal,
                      }}
                    />
                    <Typography 
                      variant="h2" 
                      sx={{ 
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        fontWeight: 700,
                        fontSize: { xs: '3rem', sm: '4rem' },
                        color: COLORS.darkGray,
                      }}
                    >
                      {formatTime(gameState.timeSpent)}
                    </Typography>
                  </Box>
                  <Button
                    variant="contained"
                    onClick={handleStopGame}
                    sx={{
                      ...buttonStyle,
                      bgcolor: COLORS.pink,
                      '&:hover': {
                        ...buttonStyle['&:hover'],
                        bgcolor: COLORS.pink,
                      }
                    }}
                  >
                    Stop Game
                  </Button>
                </Box>
              </>
            ) : (
              <Button
                variant="contained"
                startIcon={<PlayArrow />}
                onClick={handleStartGame}
                size="large"
                sx={{
                  ...buttonStyle,
                  bgcolor: COLORS.teal,
                  '&:hover': {
                    ...buttonStyle['&:hover'],
                    bgcolor: COLORS.teal,
                  }
                }}
              >
                Start Game
              </Button>
            )}
          </Box>

          <Box sx={{ mt: 2 }}>
            <Typography variant="body1" align="center">
              Game Status: {gameState?.isStarted ? 'Running' : 'Stopped'}
            </Typography>
            <Typography variant="body2" align="center" color="text.secondary" sx={{ mt: 1 }}>
              Share the audience link with your participants
            </Typography>
          </Box>
        </Box>
      )}
    </Container>
  );
} 