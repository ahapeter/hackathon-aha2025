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
  Radio
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

// Add style constants to match present page
const optionStyles = {
  container: {
    p: 2,
    borderRadius: 2,
    transition: 'all 0.2s ease',
    position: 'relative',
    mb: 2,
  },
  correctOption: {
    bgcolor: '#4CAF5010', // Light green background
    border: '2px solid #4CAF50', // Green border
    '&::after': {
      content: '""',
      position: 'absolute',
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
      position: 'absolute',
      top: 8,
      right: 8,
      width: 16,
      height: 16,
      borderRadius: '50%',
      bgcolor: '#F44336', // Red circle indicator
    },
  },
};

const QuestionEditor = ({ question, onUpdate, onDelete }: QuestionEditorProps) => {
  const [title, setTitle] = useState(question.title);
  const [options, setOptions] = useState(question.options);

  const handleOptionChange = (index: number, field: keyof SwipeeOption, value: any) => {
    const newOptions = [...options] as [SwipeeOption, SwipeeOption];
    if (field === 'isCorrect') {
      // When setting an option as correct, make sure the other is incorrect
      newOptions[0] = { ...newOptions[0], isCorrect: index === 0 };
      newOptions[1] = { ...newOptions[1], isCorrect: index === 1 };
    } else {
      newOptions[index] = { ...newOptions[index], [field]: value };
    }
    setOptions(newOptions);
    onUpdate({ ...question, options: newOptions });
  };

  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Box sx={{ mb: 2 }}>
        <TextField
          fullWidth
          label="Question Title"
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            onUpdate({ ...question, title: e.target.value });
          }}
          sx={{ mb: 2 }}
        />
      </Box>

      {options.map((option, index) => (
        <Box 
          key={index} 
          sx={{ 
            ...optionStyles.container,
            ...(option.isCorrect ? optionStyles.correctOption : optionStyles.incorrectOption),
          }}
        >
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <TextField
              fullWidth
              label={`Option ${index + 1} Title`}
              value={option.title}
              onChange={(e) => handleOptionChange(index, 'title', e.target.value)}
            />
            <TextField
              fullWidth
              label={`Option ${index + 1} Image URL`}
              value={option.imageUrl}
              onChange={(e) => handleOptionChange(index, 'imageUrl', e.target.value)}
            />
            <FormControlLabel
              control={
                <Radio
                  checked={option.isCorrect}
                  onChange={() => handleOptionChange(index, 'isCorrect', true)}
                  sx={{
                    '&.Mui-checked': {
                      color: option.isCorrect ? '#4CAF50' : '#F44336'
                    }
                  }}
                />
              }
              label="Correct"
            />
          </Box>
        </Box>
      ))}

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
        <IconButton onClick={() => onDelete(question.id)} color="error">
          <DeleteIcon />
        </IconButton>
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
      title: '',
      options: [
        { title: '', imageUrl: '', isCorrect: true },  // First option defaults to correct
        { title: '', imageUrl: '', isCorrect: false }
      ]
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