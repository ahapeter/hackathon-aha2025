'use client';

import { useEffect, useState, useRef } from 'react';
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
  Paper,
  Radio,
  Tooltip,
  alpha
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon, Save as SaveIcon, BrokenImage as BrokenImageIcon, ArrowUpward as ArrowUpIcon, ArrowDownward as ArrowDownIcon, Image as ImageIcon, CheckCircle as CheckCircleIcon, RadioButtonUnchecked as UncheckedIcon, PhotoLibrary as PhotoLibraryIcon, Close as CloseIcon } from '@mui/icons-material';
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

interface QuestionEditorProps {
  question: SwipeeQuestion;
  onUpdate: (updatedQuestion: SwipeeQuestion) => void;
  onDelete: (questionId: string) => void;
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

// Update option styles
const optionStyles = {
  container: {
    display: 'flex',
    alignItems: 'center',
    gap: 1,
    p: 1,
    borderRadius: 1,
    bgcolor: (theme: any) => alpha(theme.palette.background.paper, 0.7),
    '&:hover': {
      bgcolor: (theme: any) => alpha(theme.palette.background.paper, 0.9),
    },
    transition: 'all 0.2s ease',
  },
  correctButton: {
    p: 0.5,
    '&:hover': {
      bgcolor: 'transparent',
    },
  },
  correctIcon: {
    color: '#4CAF50',
    fontSize: 24,
  },
  uncheckedIcon: {
    color: 'text.secondary',
    fontSize: 24,
  },
  textField: {
    flex: 1,
    '& .MuiOutlinedInput-root': {
      bgcolor: 'background.paper',
    },
  },
  actionButton: {
    p: 0.5,
    color: 'text.secondary',
    '&:hover': {
      color: 'text.primary',
    },
  },
  imageIcon: {
    color: 'text.secondary',
    opacity: 0.7,
    width: 20,
    height: 20,
  },
  optionRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 1,
  },
};

const QuestionEditor = ({ question, onUpdate, onDelete }: QuestionEditorProps) => {
  const [option, setOption] = useState(question.option);
  const [editingImageUrl, setEditingImageUrl] = useState<{ url: string } | null>(null);

  const handleOptionChange = (field: keyof SwipeeOption, value: any) => {
    const newOption = { ...option, [field]: value };
    setOption(newOption);
    onUpdate({ ...question, option: newOption });
  };

  return (
    <Paper sx={{ p: 3, mb: 3, position: 'relative' }}>
      <IconButton 
        onClick={() => onDelete(question.id)} 
        sx={{ 
          position: 'absolute',
          top: 8,
          right: 8,
          color: 'text.secondary',
          opacity: 0.7,
          '&:hover': {
            opacity: 1,
            color: 'error.main',
          },
        }}
      >
        <CloseIcon sx={{ fontSize: 20 }} />
      </IconButton>

      <Box sx={optionStyles.container}>
        <Box sx={optionStyles.optionRow}>
          <Tooltip title="Mark as correct answer" placement="top">
            <IconButton
              sx={optionStyles.correctButton}
              onClick={() => handleOptionChange('isCorrect', !option.isCorrect)}
            >
              {option.isCorrect ? (
                <CheckCircleIcon sx={optionStyles.correctIcon} />
              ) : (
                <UncheckedIcon sx={optionStyles.uncheckedIcon} />
              )}
            </IconButton>
          </Tooltip>

          <TextField
            sx={optionStyles.textField}
            size="small"
            value={option.title}
            onChange={(e) => handleOptionChange('title', e.target.value)}
            placeholder="Enter option text"
          />

          <Box sx={{ position: 'relative' }}>
            <Tooltip title={option.imageUrl ? "Edit image URL" : "Add image URL"} placement="top">
              <IconButton 
                sx={optionStyles.actionButton}
                onClick={() => setEditingImageUrl({ url: option.imageUrl })}
              >
                <PhotoLibraryIcon sx={optionStyles.imageIcon} />
              </IconButton>
            </Tooltip>
            {editingImageUrl && (
              <Paper
                sx={{
                  position: 'absolute',
                  top: '100%',
                  right: 0,
                  mt: 1,
                  p: 2,
                  zIndex: 1,
                  minWidth: 300,
                  boxShadow: 4,
                }}
              >
                <TextField
                  fullWidth
                  size="small"
                  label="Image URL"
                  value={editingImageUrl.url}
                  onChange={(e) => setEditingImageUrl({ url: e.target.value })}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleOptionChange('imageUrl', editingImageUrl.url);
                      setEditingImageUrl(null);
                    } else if (e.key === 'Escape') {
                      setEditingImageUrl(null);
                    }
                  }}
                  autoFocus
                />
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                  Press Enter to save, Escape to cancel
                </Typography>
              </Paper>
            )}
          </Box>
        </Box>
      </Box>
    </Paper>
  );
};

export default function EditPage({ searchParams }: EditPageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [questions, setQuestions] = useState<SwipeeQuestion[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout>();

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

  // Auto-save effect
  useEffect(() => {
    if (questions.length === 0) return;

    // Clear any existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Set new timeout for saving
    saveTimeoutRef.current = setTimeout(async () => {
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
    }, 200);

    // Cleanup timeout on unmount
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [questions, searchParams.presentationId, searchParams.slideId]);

  const handleAddQuestion = () => {
    const newQuestion: SwipeeQuestion = {
      id: Date.now().toString(),
      option: {
        title: '',
        imageUrl: '',
        isCorrect: false
      }
    };
    setQuestions([...questions, newQuestion]);
  };

  const handleDeleteQuestion = async (questionId: string) => {
    try {
      // Remove from local state
      const newQuestions = questions.filter(q => q.id !== questionId);
      setQuestions(newQuestions);
    } catch (err) {
      setError('Failed to delete question. Please try again.');
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
        {isSaving && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CircularProgress size={20} />
            <Typography variant="body2" color="text.secondary">
              Saving...
            </Typography>
          </Box>
        )}
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
        <QuestionEditor
          key={question.id}
          question={question}
          onUpdate={(updatedQuestion) => {
            const newQuestions = questions.map(q => q.id === updatedQuestion.id ? updatedQuestion : q);
            setQuestions(newQuestions);
          }}
          onDelete={(questionId) => {
            handleDeleteQuestion(questionId);
          }}
        />
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