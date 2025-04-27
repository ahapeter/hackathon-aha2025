'use client';

import { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Button,
  Card,
  CardContent,
  CardActions,
  TextField,
  Switch,
  IconButton,
  CircularProgress,
  FormControlLabel,
  Divider,
  Paper
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon, Save as SaveIcon, BrokenImage as BrokenImageIcon } from '@mui/icons-material';
import { APIService } from '@/shared/services/apiService';
import { SwipeeQuestion, SwipeeOption } from '@/modules/swipee/types';

interface EditPageProps {
  searchParams: {
    presentationId: string;
    slideId: string;
  };
}

interface ImagePreviewProps {
  url: string;
  size?: number;
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
  px: 3,
  py: 1.5,
  boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 6px 12px rgba(0,0,0,0.15)',
  },
  transition: 'all 0.2s ease',
};

const cardStyle = {
  borderRadius: 4,
  boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
  overflow: 'hidden',
  transition: 'all 0.2s ease',
  '&:hover': {
    boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
  },
};

const ImagePreview = ({ url, size = 120 }: ImagePreviewProps) => {
  const [error, setError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Reset states when URL changes
  useEffect(() => {
    setError(false);
    setIsLoading(true);
  }, [url]);

  if (!url) {
    return (
      <Paper 
        sx={{ 
          width: size, 
          height: size, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          bgcolor: 'grey.100'
        }}
      >
        <Typography variant="caption" color="text.secondary" align="center">
          No Image
        </Typography>
      </Paper>
    );
  }

  return (
    <Paper 
      sx={{ 
        width: size, 
        height: size, 
        overflow: 'hidden',
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      {isLoading && <CircularProgress size={24} />}
      {error ? (
        <Box sx={{ textAlign: 'center', p: 1 }}>
          <BrokenImageIcon color="error" />
          <Typography variant="caption" color="error" display="block">
            Failed to load
          </Typography>
        </Box>
      ) : (
        <img
          src={url}
          alt="Option preview"
          onLoad={() => setIsLoading(false)}
          onError={() => {
            setError(true);
            setIsLoading(false);
          }}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            display: error ? 'none' : 'block'
          }}
        />
      )}
    </Paper>
  );
};

export default function EditPage({ searchParams }: EditPageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [questions, setQuestions] = useState<SwipeeQuestion[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  // Load current questions
  useEffect(() => {
    const loadQuestions = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const gameStore = await APIService.getGameStore<{ questions: SwipeeQuestion[] }>(
          searchParams.presentationId,
          searchParams.slideId
        );

        if (gameStore) {
          setQuestions(gameStore.configs?.questions || []);
        }
      } catch (err) {
        setError('Failed to load questions. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    loadQuestions();
  }, [searchParams.presentationId, searchParams.slideId]);

  const handleAddQuestion = () => {
    const newQuestion: SwipeeQuestion = {
      id: `q${Date.now()}`,
      options: [
        { title: 'Option 1', imageUrl: '', isCorrect: true },
        { title: 'Option 2', imageUrl: '', isCorrect: false }
      ] as [SwipeeOption, SwipeeOption]  // Type assertion to ensure it's a tuple of 2
    };
    setQuestions([...questions, newQuestion]);
  };

  const handleDeleteQuestion = async (questionId: string) => {
    try {
      // Remove from local state
      const newQuestions = questions.filter(q => q.id !== questionId);
      setQuestions(newQuestions);

      // Sync with API
      const success = await APIService.initGame(
        searchParams.presentationId,
        searchParams.slideId,
        { questions: newQuestions }
      );

      if (!success) {
        // Revert local state if API call fails
        setQuestions(questions);
        setError('Failed to delete question. Please try again.');
      }
    } catch (err) {
      // Revert local state on error
      setQuestions(questions);
      setError('Failed to delete question. Please try again.');
    }
  };

  const handleOptionChange = (questionId: string, optionIndex: number, field: keyof SwipeeOption, value: string | boolean) => {
    setQuestions(questions.map(question => {
      if (question.id === questionId) {
        const newOptions = [...question.options] as [SwipeeOption, SwipeeOption];
        newOptions[optionIndex] = {
          ...newOptions[optionIndex],
          [field]: value
        };
        return { ...question, options: newOptions };
      }
      return question;
    }));
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      setError(null);

      const success = await APIService.initGame(
        searchParams.presentationId,
        searchParams.slideId,
        { questions }
      );

      if (!success) {
        setError('Failed to save questions. Please try again.');
      }
    } catch (err) {
      setError('Failed to save questions. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <Container maxWidth="sm" sx={{ py: 8, textAlign: 'center' }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Loading questions...
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4, color: COLORS.darkGray }}>
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        mb: 4 
      }}>
        <Typography 
          variant="h4" 
          sx={{ 
            fontWeight: 700,
            color: COLORS.darkGray,
          }}
        >
          Edit Questions
        </Typography>
        <Button
          variant="contained"
          startIcon={<SaveIcon />}
          onClick={handleSave}
          disabled={isSaving}
          sx={{
            ...buttonStyle,
            bgcolor: COLORS.teal,
            '&:hover': {
              ...buttonStyle['&:hover'],
              bgcolor: COLORS.teal,
            }
          }}
        >
          {isSaving ? 'Saving...' : 'Save Changes'}
        </Button>
      </Box>

      {error && (
        <Paper 
          sx={{ 
            p: 2, 
            mb: 3, 
            bgcolor: 'error.light',
            color: 'white',
            borderRadius: 3,
          }}
        >
          <Typography>{error}</Typography>
        </Paper>
      )}

      {questions.map((question, index) => (
        <Card 
          key={question.id} 
          sx={{ 
            ...cardStyle,
            mb: 3,
          }}
        >
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between',
              alignItems: 'center',
              mb: 3,
            }}>
              <Typography 
                variant="h6" 
                sx={{ 
                  fontWeight: 600,
                  color: COLORS.darkGray,
                }}
              >
                Question {index + 1}
              </Typography>
              <IconButton
                onClick={() => handleDeleteQuestion(question.id)}
                sx={{ 
                  color: COLORS.pink,
                  '&:hover': {
                    bgcolor: `${COLORS.pink}10`,
                  }
                }}
              >
                <DeleteIcon />
              </IconButton>
            </Box>

            {question.options.map((option, optionIndex) => (
              <Box 
                key={optionIndex}
                sx={{ 
                  mb: optionIndex === 0 ? 3 : 0,
                  p: 2,
                  bgcolor: 'grey.50',
                  borderRadius: 3,
                }}
              >
                <Typography 
                  variant="subtitle1" 
                  sx={{ 
                    mb: 2,
                    fontWeight: 600,
                    color: COLORS.darkGray,
                  }}
                >
                  Option {optionIndex + 1}
                </Typography>
                <Box sx={{ 
                  display: 'flex',
                  gap: 3,
                  flexDirection: { xs: 'column', sm: 'row' },
                  alignItems: { xs: 'stretch', sm: 'flex-start' },
                }}>
                  <Box sx={{ flex: 1 }}>
                    <TextField
                      fullWidth
                      label="Title"
                      value={option.title}
                      onChange={(e) => handleOptionChange(question.id, optionIndex, 'title', e.target.value)}
                      sx={{ 
                        mb: 2,
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                        }
                      }}
                    />
                    <TextField
                      fullWidth
                      label="Image URL"
                      value={option.imageUrl}
                      onChange={(e) => handleOptionChange(question.id, optionIndex, 'imageUrl', e.target.value)}
                      sx={{ 
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                        }
                      }}
                    />
                  </Box>
                  <Box sx={{ 
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 2,
                  }}>
                    <ImagePreview url={option.imageUrl} size={160} />
                    <FormControlLabel
                      control={
                        <Switch
                          checked={option.isCorrect}
                          onChange={(e) => handleOptionChange(question.id, optionIndex, 'isCorrect', e.target.checked)}
                          sx={{
                            '& .MuiSwitch-switchBase.Mui-checked': {
                              color: COLORS.teal,
                              '& + .MuiSwitch-track': {
                                backgroundColor: COLORS.teal,
                              },
                            },
                          }}
                        />
                      }
                      label={
                        <Typography 
                          sx={{ 
                            color: option.isCorrect ? COLORS.teal : COLORS.darkGray,
                            fontWeight: 500,
                          }}
                        >
                          Is Correct
                        </Typography>
                      }
                    />
                  </Box>
                </Box>
              </Box>
            ))}
          </CardContent>
        </Card>
      ))}

      <Box sx={{ textAlign: 'center', mt: 4 }}>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAddQuestion}
          sx={{
            ...buttonStyle,
            bgcolor: COLORS.lightBlue,
            '&:hover': {
              ...buttonStyle['&:hover'],
              bgcolor: COLORS.lightBlue,
            }
          }}
        >
          Add Question
        </Button>
      </Box>
    </Container>
  );
} 