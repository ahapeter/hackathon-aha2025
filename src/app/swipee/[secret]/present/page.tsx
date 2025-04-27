'use client';

import { useEffect, useState } from 'react';
import { useSwipeeStore } from '@/modules/swipee/store/swipeeStore';
import { Box, Button, Typography, Container, CircularProgress } from '@mui/material';
import { PlayArrow, Stop } from '@mui/icons-material';
import { APIService } from '@/shared/services/apiService';
import { SwipeeConfigs, SwipeeState } from '@/modules/swipee/types';

interface PresentPageProps {
  params: {
    secret: string;
  };
  searchParams: {
    presentationId: string;
    slideId: string;
  };
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

export default function PresentPage({ params, searchParams }: PresentPageProps) {
  const { connectMQTT, disconnectMQTT } = useSwipeeStore();
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [gameState, setGameState] = useState<SwipeeState>({
    isStarted: false,
    questions: [],
    currentQuestionIndex: -1,
    timeSpent: 0
  });

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
          // Initialize new game if not found
          await APIService.initGame(searchParams.presentationId, searchParams.slideId, {});
          setGameState({
            isStarted: false,
            questions: [],
            currentQuestionIndex: -1,
            timeSpent: 0
          });
        } else {
          // Check if game is running from the latest state
          const latestState = gameStore.states[gameStore.states.length - 1];
          const isStarted = latestState?.event_name === 'STARTED';
          setGameState({
            isStarted,
            questions: gameStore.configs?.questions || [],
            currentQuestionIndex: -1,
            timeSpent: isStarted ? Math.floor((Date.now() - latestState.timestamp) / 1000) : 0
          });
          if (isStarted) {
            setTimeElapsed(Math.floor((Date.now() - latestState.timestamp) / 1000));
          }
        }

        // Connect to MQTT for real-time updates
        connectMQTT(`swipee/game/${searchParams.presentationId}`);
      } catch (err) {
        setError('Failed to load game state. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    loadGameState();

    return () => {
      disconnectMQTT();
    };
  }, [searchParams.presentationId, searchParams.slideId, connectMQTT, disconnectMQTT]);

  // Timer effect
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (gameState.isStarted) {
      timer = setInterval(() => {
        setTimeElapsed(prev => prev + 1);
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [gameState.isStarted]);

  const handleStart = async () => {
    try {
      const success = await APIService.updateGameState(
        searchParams.presentationId,
        searchParams.slideId,
        'event',
        { event_name: 'STARTED', timestamp: Date.now() }
      );

      if (success) {
        setTimeElapsed(0);
        setGameState(prev => ({
          ...prev,
          isStarted: true,
          timeSpent: 0
        }));
      } else {
        setError('Failed to start game. Please try again.');
      }
    } catch (err) {
      setError('Failed to start game. Please try again.');
    }
  };

  const handleStop = async () => {
    try {
      const success = await APIService.updateGameState(
        searchParams.presentationId,
        searchParams.slideId,
        'event',
        { event_name: 'STOPPED', timestamp: Date.now() }
      );

      if (success) {
        setGameState(prev => ({
          ...prev,
          isStarted: false
        }));
      } else {
        setError('Failed to stop game. Please try again.');
      }
    } catch (err) {
      setError('Failed to stop game. Please try again.');
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (isLoading) {
    return (
      <Container maxWidth="sm" sx={{ 
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
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="sm" sx={{ 
        py: 6, 
        textAlign: 'center',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
      }}>
        <Typography 
          variant="h6" 
          sx={{ 
            color: COLORS.pink,
            fontWeight: 600,
            mb: 2,
          }}
        >
          {error}
        </Typography>
        <Typography 
          variant="body1" 
          sx={{ 
            color: COLORS.darkGray,
            opacity: 0.7,
          }}
        >
          Please check your connection and try again.
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm" sx={{ 
      py: 6,
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      color: COLORS.darkGray,
    }}>
      <Typography 
        variant="h3" 
        sx={{ 
          fontWeight: 700,
          textAlign: 'center',
          mb: 6,
          color: COLORS.darkGray,
        }}
      >
        Swipee Game
      </Typography>

      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center',
        width: '100%',
      }}>
        {gameState.isStarted ? (
          <>
            <Box sx={{ 
              position: 'relative',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              mb: 4,
            }}>
              <CircularProgress 
                size={200} 
                thickness={2} 
                sx={{ 
                  color: COLORS.teal,
                  position: 'absolute',
                }}
              />
              <Typography 
                variant="h2" 
                sx={{ 
                  fontWeight: 700,
                  fontSize: { xs: '3rem', sm: '4rem' },
                  color: COLORS.darkGray,
                }}
              >
                {formatTime(timeElapsed)}
              </Typography>
            </Box>
            <Button
              variant="contained"
              startIcon={<Stop />}
              onClick={handleStop}
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
          </>
        ) : (
          <Button
            variant="contained"
            startIcon={<PlayArrow />}
            onClick={handleStart}
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

      <Box sx={{ mt: 6 }}>
        <Typography variant="body1" align="center">
          Game Status: {gameState.isStarted ? 'Running' : 'Stopped'}
        </Typography>
        <Typography variant="body2" align="center" color="text.secondary" sx={{ mt: 1 }}>
          Share the audience link with your participants
        </Typography>
      </Box>
    </Container>
  );
} 