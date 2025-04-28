'use client';

import { useEffect, useState, useMemo } from 'react';
import { useSwipeeStore } from '@/modules/swipee/store/swipeeStore';
import { Box, Typography, Container, Paper, CircularProgress, Stack, IconButton } from '@mui/material';
import { useParams } from 'next/navigation';
import { connectToGame, disconnectFromGame, onGameStateChange, offGameStateChange, MqttMessage } from '@/shared/services/mqttService';
import TinderCard from 'react-tinder-card';
import { SwipeeQuestion, SwipeeState, SwipeeConfigs } from '@/modules/swipee/types';
import { APIService } from '@/shared/services/apiService';
import { handleSwipe, isCorrectAnswer, Direction } from '@/modules/swipee/core/swipeLogic';
import { initializeScoreService, submitScore, SCORE_EVENT } from '@/modules/swipee/services/scoreService';
import { eventBus } from '@/shared/utils/eventBus';
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
  height: 300,
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
  const [gameState, setGameState] = useState<SwipeeState>({
    isStarted: false,
    questions: [],
    currentQuestionIndex: -1,
    timeSpent: 0
  });
  const [answeredQuestions, setAnsweredQuestions] = useState<Record<string, boolean>>({});
  const [currentOptionIndex, setCurrentOptionIndex] = useState(0);

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

        if (!gameStore) {
          setError('Game not found. Please check your link.');
          return;
        }

        // Check if game is running from the latest state
        const latestState = gameStore.states[gameStore.states.length - 1];
        const isStarted = latestState?.event_name === 'STARTED';
        
        // Store all questions and set current question if game is running
        if (gameStore.configs && gameStore.configs.questions) {
          setGameState({
            isStarted,
            questions: gameStore.configs.questions,
            currentQuestionIndex: isStarted ? 0 : -1,
            timeSpent: isStarted ? Math.floor((Date.now() - latestState.timestamp) / 1000) : 0
          });
        }

        // Connect to MQTT
        await connectToGame(searchParams.presentationId);
        
        // Subscribe to game state changes
        onGameStateChange((message: MqttMessage) => {
          if (message.type === 'GAME_STATE') {
            setGameState(prev => ({
              ...prev,
              isStarted: message.data.isStarted,
              currentQuestionIndex: message.data.isStarted ? 0 : -1,
              timeSpent: message.data.isStarted ? 0 : prev.timeSpent
            }));
          }
        });

      } catch (err) {
        setError('Failed to load game state. Please try again.');
        console.error('Game state loading error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadGameState();

    return () => {
      offGameStateChange(() => {});
      disconnectFromGame();
    };
  }, [searchParams.presentationId, searchParams.slideId]);

  // Initialize score service
  useEffect(() => {
    initializeScoreService();
    return () => {
      eventBus.off(SCORE_EVENT, () => {});
    };
  }, []);

  useEffect(() => {
    // Randomly select an option when current question changes
    if (gameState.currentQuestionIndex >= 0) {
      setCurrentOptionIndex(Math.floor(Math.random() * 2));
    }
  }, [gameState.currentQuestionIndex]);

  const onSwipe = async (direction: Direction) => {
    if (!gameState.isStarted || gameState.currentQuestionIndex === -1) return;
    
    const currentQuestion = gameState.questions[gameState.currentQuestionIndex];
    console.log('currentQuestion', currentQuestion);
    const isCorrect = isCorrectAnswer(currentQuestion, direction);
    
    // Get next question index using pure function
    const nextIndex = handleSwipe(gameState.questions, gameState.currentQuestionIndex, direction);
    console.log('nextIndex', nextIndex);
    
    setGameState(prev => ({
      ...prev,
      currentQuestionIndex: nextIndex
    }));

    // Submit score asynchronously via event bus
    submitScore({
      presentationId: searchParams.presentationId,
      slideId: searchParams.slideId,
      audienceId: searchParams.audienceId,
      audienceName: searchParams.audienceName,
      audienceEmoji: searchParams.audienceEmoji,
      score: isCorrect ? 1 : 0,
      timestamp: Date.now()
    });
  };

  const cardContainerStyle = useMemo(() => ({
    width: '100%',
    maxWidth: 300,
    height: 300,
    position: 'relative' as const,
    margin: '0 auto',
  }), []);

  const handleSwipeAction = (direction: Direction) => {
    if (direction === 'up' || direction === 'down') {
      // Mark as skipped
      if (currentQuestion) {
        setAnsweredQuestions(prev => ({
          ...prev,
          [currentQuestion.id]: false
        }));
      }
    } else {
      onSwipe(direction);
      // Mark as answered
      if (currentQuestion) {
        setAnsweredQuestions(prev => ({
          ...prev,
          [currentQuestion.id]: true
        }));
      }
    }
  };

  const handleButtonSwipe = (direction: Direction) => {
    handleSwipeAction(direction);
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

  if (!gameState.isStarted) {
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

  const currentQuestion = gameState.questions[gameState.currentQuestionIndex];
  const currentOption = currentQuestion?.options[currentOptionIndex];

  return (
    <Container maxWidth="sm" sx={{ 
      py: 3, 
      display: 'flex', 
      flexDirection: 'column', 
      minHeight: '100vh',
      color: COLORS.darkGray,
    }}>
      <Box sx={{ textAlign: 'center', mb: 3 }}>
        {gameState.currentQuestionIndex === 0 && (
          <Typography 
            variant="h5" 
            gutterBottom 
            sx={{ 
              fontWeight: 700,
              fontSize: { xs: '1.5rem', sm: '1.75rem' },
              mb: 2,
            }}
          >
            Swipe right if you think it's correct, left if you think it's wrong
          </Typography>
        )}
        <Typography 
          variant="body1" 
          sx={{ 
            color: 'text.secondary',
            fontSize: '1rem',
          }}
        >
          Playing as: {searchParams.audienceName} {searchParams.audienceEmoji}
        </Typography>
      </Box>

      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center',
        alignItems: 'center',
        gap: 1,
        mb: 2,
        flexWrap: 'wrap',
        px: 2
      }}>
        {gameState.questions.map((question, index) => (
          <Box
            key={question.id}
            sx={{
              width: 12,
              height: 12,
              borderRadius: '50%',
              transition: 'all 0.2s ease',
              bgcolor: index === gameState.currentQuestionIndex 
                ? 'primary.main'
                : answeredQuestions[question.id]
                  ? 'success.main'
                  : index < gameState.currentQuestionIndex
                    ? 'error.main'
                    : 'grey.300',
              transform: index === gameState.currentQuestionIndex ? 'scale(1.2)' : 'scale(1)',
            }}
          />
        ))}
      </Box>

      {gameState.currentQuestionIndex === -1 ? (
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
              color: COLORS.lightBlue,
              fontWeight: 700,
              fontSize: { xs: '2rem', sm: '2.5rem' },
            }} 
            gutterBottom
          >
            Game Complete! 🎉
          </Typography>
          
          <Box>
            <Typography 
              variant="h5" 
              sx={{ 
                fontWeight: 600,
                color: COLORS.darkGray,
              }} 
              gutterBottom
            >
              Your Score: {Object.values(answeredQuestions).filter(Boolean).length} / {gameState.questions.length}
            </Typography>
          </Box>

          <Box sx={{ 
            display: 'flex',
            flexDirection: 'column',
            gap: 3,
            maxWidth: 600,
            mx: 'auto',
            width: '100%'
          }}>
            {gameState.questions.map((question, index) => {
              const userAnswer = answeredQuestions[question.id];
              const shownOption = question.options[0];
              const wasCorrect = userAnswer === shownOption.isCorrect;
              
              return (
                <Paper
                  key={question.id}
                  sx={{
                    p: 3,
                    display: 'flex',
                    alignItems: 'stretch',
                    gap: 3,
                    bgcolor: 'white',
                    borderRadius: 4,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                    border: `2px solid ${wasCorrect ? COLORS.teal : COLORS.pink}`,
                    overflow: 'hidden'
                  }}
                >
                  <Box sx={{ 
                    minWidth: 32, 
                    height: 32, 
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: wasCorrect ? COLORS.teal : COLORS.pink,
                    color: 'white',
                    fontWeight: 'bold',
                    mt: 1
                  }}>
                    {wasCorrect ? <Check /> : <Close />}
                  </Box>
                  
                  <Box sx={{ 
                    flex: 1,
                    display: 'flex',
                    flexDirection: { xs: 'column', sm: 'row' },
                    gap: 3,
                    alignItems: 'flex-start'
                  }}>
                    {shownOption.imageUrl && (
                      <Box 
                        sx={{ 
                          width: { xs: '100%', sm: 160 },
                          height: { xs: 200, sm: 160 },
                          borderRadius: 3,
                          overflow: 'hidden',
                          flexShrink: 0,
                          boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                        }}
                      >
                        <img 
                          src={shownOption.imageUrl} 
                          alt={shownOption.title}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover'
                          }}
                        />
                      </Box>
                    )}
                    
                    <Box sx={{ flex: 1 }}>
                      <Typography 
                        variant="h6" 
                        sx={{ 
                          mb: 2,
                          fontSize: '1.25rem',
                          fontWeight: 600,
                        }}
                      >
                        {shownOption.title}
                      </Typography>
                      <Box sx={{ 
                        display: 'flex', 
                        flexWrap: 'wrap',
                        alignItems: 'center',
                        gap: 2
                      }}>
                        <Box sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1,
                          bgcolor: 'rgba(0,0,0,0.05)',
                          borderRadius: 3,
                          px: 2,
                          py: 1,
                        }}>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            Your answer:
                          </Typography>
                          {userAnswer ? (
                            <ThumbUp sx={{ fontSize: 18, color: COLORS.teal }} />
                          ) : (
                            <ThumbDown sx={{ fontSize: 18, color: COLORS.pink }} />
                          )}
                        </Box>
                        <Box sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1,
                          bgcolor: 'rgba(0,0,0,0.05)',
                          borderRadius: 3,
                          px: 2,
                          py: 1,
                        }}>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            Correct answer:
                          </Typography>
                          <Typography 
                            variant="body2" 
                            sx={{ 
                              fontWeight: 600,
                              color: shownOption.isCorrect ? COLORS.teal : COLORS.pink
                            }}
                          >
                            {shownOption.isCorrect ? 'True' : 'False'}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                  </Box>
                </Paper>
              );
            })}
          </Box>
        </Box>
      ) : (
        <>
          <Box sx={cardContainerStyle}>
            {currentQuestion && currentOption && (
              <TinderCard
                key={`${currentQuestion.id}-${currentOptionIndex}`}
                onSwipe={handleSwipeAction}
                preventSwipe={[]}
                swipeRequirementType="position"
                swipeThreshold={100}
              >
                <Paper
                  elevation={4}
                  sx={{
                    ...cardStyle,
                    backgroundImage: currentOption.imageUrl ? `url(${currentOption.imageUrl})` : 'none',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                    borderRadius: 2,
                    border: '1px solid #eee',
                  }}
                >
                  {!currentOption.imageUrl && (
                    <Box sx={{ p: 3, width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Typography variant="h5" sx={{ textAlign: 'center' }}>
                        {currentOption.title}
                      </Typography>
                    </Box>
                  )}
                  {currentOption.imageUrl && (
                    <Box
                      sx={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        p: 2,
                        background: 'rgba(0, 0, 0, 0.7)',
                        color: 'white',
                        borderBottomLeftRadius: 'inherit',
                        borderBottomRightRadius: 'inherit',
                      }}
                    >
                      <Typography variant="h6">{currentOption.title}</Typography>
                    </Box>
                  )}
                </Paper>
              </TinderCard>
            )}
          </Box>

          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center',
            mt: 4,
            gap: 4
          }}>
            <IconButton 
              onClick={() => handleButtonSwipe('left')} 
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
              <ThumbDown sx={{ fontSize: 32 }} />
            </IconButton>
            <IconButton 
              onClick={() => handleButtonSwipe('right')} 
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
              <ThumbUp sx={{ fontSize: 32 }} />
            </IconButton>
          </Box>
        </>
      )}
    </Container>
  );
} 