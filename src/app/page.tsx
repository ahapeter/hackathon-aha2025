'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Container, Typography, Box, CircularProgress } from '@mui/material';
import { APIService } from '@/shared/services/apiService';
import { createDummyQuestions } from '@/modules/swipee/core/game';

const DEMO_PRESENTATION_ID = 'demo';
const DEMO_SLIDE_ID = 'demo';

export default function HomePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  useEffect(() => {
    const initializeGame = async () => {
      // Check if we're already on the demo URL
      const presentationId = searchParams.get('presentationId');
      const slideId = searchParams.get('slideId');
      
      // If not on demo URL, redirect first
      if (presentationId !== DEMO_PRESENTATION_ID || slideId !== DEMO_SLIDE_ID) {
        // Redirect to demo URL
        const demoUrl = `/?presentationId=${DEMO_PRESENTATION_ID}&slideId=${DEMO_SLIDE_ID}`;
        router.replace(demoUrl);
        return;
      }

      // Check if demo data exists
      const gameStore = await APIService.getGameStore<{ questions: any[] }>(
        DEMO_PRESENTATION_ID,
        DEMO_SLIDE_ID
      );

      // Only initialize if no data exists or questions array is empty
      if (!gameStore || !gameStore.configs?.questions?.length) {
        console.log('Initializing demo with dummy questions');
        // Initialize game store with dummy questions
        const success = await APIService.initGame(
          DEMO_PRESENTATION_ID,
          DEMO_SLIDE_ID,
          { questions: createDummyQuestions() }
        );

        if (!success) {
          console.error('Failed to initialize game store');
        }
      }
    };

    initializeGame();
  }, [searchParams, router]);

  // Show loading state while checking/redirecting
  if (
    searchParams.get('presentationId') !== DEMO_PRESENTATION_ID || 
    searchParams.get('slideId') !== DEMO_SLIDE_ID
  ) {
    return (
      <Container maxWidth="sm" sx={{ py: 8, textAlign: 'center' }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Preparing demo game session...
        </Typography>
      </Container>
    );
  }

  // Show main content once we're on the demo URL
  return (
    <Container maxWidth="lg" sx={{ py: 8 }}>
      <Typography variant="h2" component="h1" align="center" gutterBottom>
        Welcome to Swipee Game Demo
      </Typography>
      
      <Box sx={{ mt: 6, display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'center' }}>
        <Typography variant="h5" align="center">
          Demo Game Session
        </Typography>

        <Box sx={{ mt: 4, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Typography variant="h6" align="center">
            Quick Links:
          </Typography>
          
          <Typography 
            component="a" 
            href={`/swipee/${DEMO_PRESENTATION_ID}/edit?presentationId=${DEMO_PRESENTATION_ID}&slideId=${DEMO_SLIDE_ID}`}
            sx={{ color: 'primary.main', textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
          >
            ✏️ Edit Game
          </Typography>

          <Typography 
            component="a" 
            href={`/swipee/${DEMO_PRESENTATION_ID}/present?presentationId=${DEMO_PRESENTATION_ID}&slideId=${DEMO_SLIDE_ID}`}
            sx={{ color: 'primary.main', textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
          >
            🎮 Present Game
          </Typography>
          
          <Typography 
            component="a" 
            href={`/swipee/audience?presentationId=${DEMO_PRESENTATION_ID}&slideId=${DEMO_SLIDE_ID}&audienceId=demo-player&audienceName=Demo Player&audienceEmoji=🎮`}
            sx={{ color: 'primary.main', textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
          >
            👥 Join as Player
          </Typography>
        </Box>

        <Typography variant="body2" color="text.secondary" sx={{ mt: 4 }}>
          This is a demo session with pre-loaded questions. Feel free to edit, present, or play!
        </Typography>
      </Box>
    </Container>
  );
} 