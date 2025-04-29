'use client';

import { useEffect, useState, useMemo, useRef } from 'react';
import { useSwipeeStore } from '@/modules/swipee/store/swipeeStore';
import { Box, Typography, Container, Paper, CircularProgress, Stack, IconButton, Button } from '@mui/material';
import { useParams } from 'next/navigation';
import { MQTTService } from '@/shared/services/mqtt';
import { MQTTMessage } from '@/modules/swipee/core/types';
import TinderCard from 'react-tinder-card';
import { SwipeeQuestion, SwipeeState, SwipeeConfigs } from '@/modules/swipee/types';
import { APIService } from '@/shared/services/apiService';
import { ArrowForward, ArrowBack, ThumbUp, ThumbDown, ArrowUpward, ArrowDownward, Check, Close } from '@mui/icons-material';

interface AudiencePageProps {
  searchParams: {
    presentationId: string;
    slideId: string;
    audienceId: string;
    audienceName: string;
    audienceEmoji: string;
  };
}

// Add styles constants
const COLORS = {
  teal: '#20E8B5',
  pink: '#FF4081',
  darkGray: '#333333',
  lightBlue: '#4A90E2',
};

const cardStyle = {
  position: 'absolute',
  width: '100%',
  maxWidth: 300,
  height: 400,
  padding: 0,
  cursor: 'grab',
  borderRadius: 4,
  boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
  transition: 'transform 0.2s ease',
  '&:hover': {
    transform: 'scale(1.02)',
  },
};

const buttonStyle = {
  borderRadius: 24,
  p: 2.5,
  transition: 'all 0.2s ease',
  boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 6px 12px rgba(0,0,0,0.15)',
  },
};

export default function AudiencePage({ searchParams }: AudiencePageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [gameState, setGameState] = useState<SwipeeState | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<SwipeeQuestion | null>(null);
  const [isGameStarted, setIsGameStarted] = useState(false);
  const [isGameEnded, setIsGameEnded] = useState(false);
  const [score, setScore] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [slideTitle, setSlideTitle] = useState('');
  const cardRef = useRef<any>(null);

  const { connectMQTT, disconnectMQTT, mqttClient } = useSwipeeStore();

  // Update current question when game state changes
  useEffect(() => {
    console.log('Game state changed:', gameState);
    if (gameState && gameState.isStarted && gameState.currentQuestionIndex >= 0) {
      const newQuestion = gameState.questions[gameState.currentQuestionIndex];
      console.log('Setting current question:', newQuestion);
      setCurrentQuestion(newQuestion);
    }
  }, [gameState]);

  // Debug render state
  useEffect(() => {
    console.log('Rendering with currentQuestion:', currentQuestion);
    console.log('Rendering with hasAnswered:', hasAnswered);
    console.log('Rendering with gameState:', gameState);
    if (currentQuestion) {
      console.log('Rendering image with URL:', currentQuestion.option.imageUrl);
    }
  }, [currentQuestion, hasAnswered, gameState]);

  // Load game state from API
  useEffect(() => {
    const loadGameState = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const gameStore = await APIService.getGameStore<SwipeeConfigs>(
          searchParams.presentationId,
          searchParams.slideId
        );

        console.log('Loaded game store:', gameStore);

        if (!gameStore) {
          setError('Game not found. Please check your link.');
          return;
        }

        // Check if game is running from the latest state
        const latestState = gameStore.states[gameStore.states.length - 1];
        const isStarted = latestState?.event_name === 'STARTED';
        
        // Store all questions and set current question if game is running
        if (gameStore.configs && gameStore.configs.questions) {
          const newGameState = {
            isStarted,
            questions: gameStore.configs.questions,
            currentQuestionIndex: isStarted ? 0 : -1,
            timeSpent: isStarted ? Math.floor((Date.now() - latestState.timestamp) / 1000) : 0
          };
          console.log('Setting new game state:', newGameState);
          setGameState(newGameState);
          setSlideTitle(gameStore.configs.title || '');
        }

        // Connect to MQTT
        const topic = `swipee/${searchParams.presentationId}`;
        connectMQTT(topic);
      } catch (err) {
        setError('Failed to load game state. Please try again.');
        console.error('Game state loading error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadGameState();

    return () => {
      disconnectMQTT();
    };
  }, [searchParams.presentationId, searchParams.slideId, connectMQTT, disconnectMQTT]);

  // Subscribe to MQTT messages
  useEffect(() => {
    if (mqttClient) {
      mqttClient.onMessage((message: MQTTMessage) => {
        if (message.type === 'GAME_START') {
          setGameState(prev => prev ? {
            ...prev,
            isStarted: true,
            currentQuestionIndex: 0,
            timeSpent: 0
          } : null);
        } else if (message.type === 'GAME_STOP') {
          setGameState(prev => prev ? {
            ...prev,
            isStarted: false,
            currentQuestionIndex: -1
          } : null);
        }
      });
    }
  }, [mqttClient]);

  const onSwipe = async (direction: string) => {
    if (!currentQuestion || hasAnswered || isSubmitting) return;

    setIsSubmitting(true);
    setHasAnswered(true);

    try {
      const isSwipedRight = direction === 'right';
      const isCorrect = isSwipedRight === currentQuestion.option.isCorrect;

      await useSwipeeStore.getState().submitAnswer(
        searchParams.presentationId,
        searchParams.slideId,
        searchParams.audienceId,
        searchParams.audienceName,
        searchParams.audienceEmoji,
        isCorrect
      );

      setScore((prev) => prev + (isCorrect ? 1 : 0));
    } catch (error) {
      console.error('Failed to submit answer:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const cardContainerStyle = useMemo(() => ({
    width: '100%',
    maxWidth: 300,
    height: 400,
    position: 'relative' as const,
    margin: '0 auto',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 400
  }), []);

  const handleSwipeAction = (direction: 'left' | 'right' | 'up' | 'down') => {
    if (direction === 'up' || direction === 'down') {
      // Mark as skipped
      if (currentQuestion) {
        setHasAnswered(true);
      }
    } else {
      onSwipe(direction);
    }
  };

  const handleButtonSwipe = (direction: 'left' | 'right') => {
    handleSwipeAction(direction);
  };

  const handleGameStateChange = (newState: SwipeeState) => {
    if (!newState) return;
    
    setGameState(newState);
    setCurrentQuestion(newState.questions[newState.currentQuestionIndex]);
    setIsGameStarted(newState.isStarted);
    setIsGameEnded(newState.currentQuestionIndex === -1);
  };

  if (isLoading) {
    return (
      <Container maxWidth="sm" sx={{ py: 4, textAlign: 'center' }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Loading game...
        </Typography>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="sm" sx={{ py: 4, textAlign: 'center' }}>
        <Typography variant="h6" color="error" gutterBottom>
          {error}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Please check your connection and try again.
        </Typography>
      </Container>
    );
  }

  if (!gameState?.isStarted) {
    return (
      <Container maxWidth="sm" sx={{ 
        py: 6,
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        color: COLORS.darkGray,
      }}>
        <Typography 
          variant="h4" 
          sx={{ 
            fontWeight: 700,
            textAlign: 'center',
            mb: 3,
          }}
        >
          Waiting for Game to Start
        </Typography>
        <CircularProgress 
          size={64} 
          sx={{ 
            color: COLORS.teal,
            mb: 4,
          }} 
        />
        <Typography 
          variant="body1" 
          sx={{ 
            textAlign: 'center',
            color: COLORS.darkGray,
            opacity: 0.7,
          }}
        >
          The host will start the game soon. Get ready to swipe!
        </Typography>
        <Typography 
          variant="body2" 
          sx={{ 
            mt: 2,
            textAlign: 'center',
            color: COLORS.darkGray,
            opacity: 0.5,
          }}
        >
          Playing as: {searchParams.audienceName} {searchParams.audienceEmoji}
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm" sx={{ py: 4, height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {slideTitle && (
        <Typography 
          variant="h5" 
          sx={{ 
            textAlign: 'center',
            mb: 3,
            fontWeight: 600,
            color: COLORS.darkGray
          }}
        >
          {slideTitle}
        </Typography>
      )}
      
      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flex: 1 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Box sx={{ textAlign: 'center', color: 'error.main' }}>
          <Typography variant="h6">{error}</Typography>
        </Box>
      ) : !gameState?.isStarted ? (
        <Box sx={{ 
          textAlign: 'center', 
          mt: 4,
          display: 'flex',
          flexDirection: 'column',
          gap: 4,
          px: 2
        }}>
          <Typography 
            variant="h4" 
            sx={{ 
              fontWeight: 700,
              textAlign: 'center',
              mb: 3,
            }}
          >
            Waiting for Game to Start
          </Typography>
          <CircularProgress 
            size={64} 
            sx={{ 
              color: COLORS.teal,
              mb: 4,
            }} 
          />
          <Typography 
            variant="body1" 
            sx={{ 
              textAlign: 'center',
              color: COLORS.darkGray,
              opacity: 0.7,
            }}
          >
            The host will start the game soon. Get ready to swipe!
          </Typography>
          <Typography 
            variant="body2" 
            sx={{ 
              mt: 2,
              textAlign: 'center',
              color: COLORS.darkGray,
              opacity: 0.5,
            }}
          >
            Playing as: {searchParams.audienceName} {searchParams.audienceEmoji}
          </Typography>
        </Box>
      ) : (
        <>
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'center',
            alignItems: 'center',
            gap: 1,
            mb: 2,
            flexWrap: 'wrap',
            px: 2
          }}>
            {gameState?.questions.map((question, index) => (
              <Box
                key={question.id}
                sx={{
                  width: 12,
                  height: 12,
                  borderRadius: '50%',
                  transition: 'all 0.2s ease',
                  bgcolor: index === gameState.currentQuestionIndex 
                    ? 'primary.main'
                    : hasAnswered && question.option.isCorrect
                      ? 'success.main'
                      : index < gameState.currentQuestionIndex
                        ? 'error.main'
                        : 'grey.300',
                  transform: index === gameState.currentQuestionIndex ? 'scale(1.2)' : 'scale(1)',
                }}
              />
            ))}
          </Box>

          <Box sx={cardContainerStyle}>
            {currentQuestion && !hasAnswered && (
              <Box sx={{ 
                position: 'relative', 
                width: '100%', 
                height: '100%',
                minHeight: 400,
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center'
              }}>
                <Box sx={{
                  width: '100%',
                  height: '100%',
                  position: 'relative'
                }}>
                  <TinderCard
                    ref={cardRef}
                    onSwipe={(dir) => {
                      handleSwipeAction(dir);
                    }}
                    onCardLeftScreen={(dir) => {
                      // Handle card leaving screen
                    }}
                    preventSwipe={['up', 'down']}
                    swipeRequirementType="position"
                    swipeThreshold={100}
                    className="swipe"
                  >
                    <Paper
                      elevation={4}
                      sx={{
                        ...cardStyle,
                        position: 'relative',
                        width: '100%',
                        height: '100%',
                        minHeight: 400,
                        display: 'flex',
                        flexDirection: 'column',
                        overflow: 'hidden',
                        touchAction: 'none'
                      }}
                    >
                      {currentQuestion.option.imageUrl ? (
                        <Box 
                          sx={{
                            width: '100%',
                            height: '100%',
                            minHeight: 400,
                            position: 'relative',
                            overflow: 'hidden'
                          }}
                        >
                          <img
                            src={currentQuestion.option.imageUrl}
                            alt={currentQuestion.option.title}
                            style={{
                              position: 'absolute',
                              top: 0,
                              left: 0,
                              right: 0,
                              bottom: 0,
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover',
                              display: 'block'
                            }}
                          />
                          <Box
                            sx={{
                              position: 'absolute',
                              bottom: 0,
                              left: 0,
                              right: 0,
                              p: 2,
                              background: 'rgba(0, 0, 0, 0.7)',
                              color: 'white',
                            }}
                          >
                            <Typography variant="h6">{currentQuestion.option.title}</Typography>
                          </Box>
                        </Box>
                      ) : (
                        <Box sx={{ 
                          p: 3, 
                          width: '100%', 
                          height: '100%', 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center',
                          bgcolor: 'background.paper'
                        }}>
                          <Typography 
                            variant="h5" 
                            sx={{ 
                              textAlign: 'center',
                              fontWeight: 500,
                              color: 'text.primary'
                            }}
                          >
                            {currentQuestion.option.title}
                          </Typography>
                        </Box>
                      )}
                    </Paper>
                  </TinderCard>
                </Box>
              </Box>
            )}
          </Box>

          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center',
            mt: 4,
            gap: 4
          }}>
            <Button 
              onClick={() => handleButtonSwipe('left')} 
              variant="contained"
              sx={{ 
                ...buttonStyle,
                bgcolor: COLORS.pink,
                color: 'white',
                '&:hover': {
                  ...buttonStyle['&:hover'],
                  bgcolor: COLORS.pink,
                }
              }}
            >
              False
            </Button>
            <Button 
              onClick={() => handleButtonSwipe('right')} 
              variant="contained"
              sx={{ 
                ...buttonStyle,
                bgcolor: COLORS.teal,
                color: 'white',
                '&:hover': {
                  ...buttonStyle['&:hover'],
                  bgcolor: COLORS.teal,
                }
              }}
            >
              True
            </Button>
          </Box>
        </>
      )}
      <Typography 
        variant="body2" 
        sx={{ 
          mt: 2,
          textAlign: 'center',
          color: COLORS.darkGray,
          opacity: 0.5,
        }}
      >
        Playing as: {searchParams.audienceName} {searchParams.audienceEmoji}
      </Typography>
    </Container>
  );
} 