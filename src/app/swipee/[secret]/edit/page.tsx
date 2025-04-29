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
import { 
  Add as AddIcon, 
  Delete as DeleteIcon, 
  BrokenImage as BrokenImageIcon, 
  ArrowUpward as ArrowUpIcon, 
  ArrowDownward as ArrowDownIcon, 
  Image as ImageIcon, 
  RadioButtonUnchecked,
  RadioButtonChecked,
  PhotoLibrary as PhotoLibraryIcon, 
  Close as CloseIcon 
} from '@mui/icons-material';
import { APIService } from '@/shared/services/apiService';
import { SwipeeQuestion, SwipeeOption } from '@/modules/swipee/types';
import { v4 as uuidv4 } from 'uuid';

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

const optionContainerStyle = (theme: any) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: 1,
  padding: 2,
  borderRadius: 1,
  backgroundColor: theme.palette.background.paper,
  '& .option-row': {
    display: 'flex',
    alignItems: 'center',
    gap: 1,
    width: '100%',
  },
  '& .option-content': {
    display: 'flex',
    alignItems: 'center',
    gap: 1,
    flex: 1,
  },
  '& .option-actions': {
    display: 'flex',
    alignItems: 'center',
    gap: 1,
  },
  '& .MuiSwitch-root': {
    width: 36,
    height: 20,
    padding: 0,
    marginRight: 1,
    '& .MuiSwitch-switchBase': {
      padding: 0,
      margin: 2,
      transitionDuration: '300ms',
      transform: 'translateX(16px)',
      '&.Mui-checked': {
        transform: 'translateX(0)',
        '& + .MuiSwitch-track': {
          backgroundColor: '#4CAF50',
          opacity: 1,
          border: 0,
        },
      },
      '& + .MuiSwitch-track': {
        backgroundColor: '#FF4081',
        opacity: 1,
        border: 0,
      },
    },
    '& .MuiSwitch-thumb': {
      boxSizing: 'border-box',
      width: 16,
      height: 16,
      borderRadius: '50%',
      backgroundColor: '#fff',
    },
    '& .MuiSwitch-track': {
      borderRadius: 20,
      opacity: 1,
      transition: theme.transitions.create(['background-color'], {
        duration: 500,
      }),
    },
  },
});

const optionStyle = (isCorrect: boolean) => ({
  flex: 1,
  '& .MuiInputBase-root': {
    backgroundColor: isCorrect ? '#e8f5e9' : '#ffebee',
    transition: 'background-color 0.3s ease',
  },
});

const QuestionEditor = ({ question, onUpdate, onDelete }: QuestionEditorProps) => {
  const [option, setOption] = useState(question.option);
  const [editingImageUrl, setEditingImageUrl] = useState<{ url: string } | null>(null);

  const handleOptionChange = (field: keyof SwipeeOption, value: any) => {
    const newOption = { ...option, [field]: value };
    setOption(newOption);
    onUpdate({ ...question, option: newOption });
  };

  return (
    <Paper sx={optionContainerStyle}>
      <Box className="option-row">
        <Box className="option-content">
          <Switch
            checked={option.isCorrect}
            onChange={(e) => handleOptionChange('isCorrect', e.target.checked)}
            inputProps={{ 'aria-label': 'correct answer toggle' }}
          />
          <TextField
            fullWidth
            variant="outlined"
            size="small"
            value={option.title}
            onChange={(e) => handleOptionChange('title', e.target.value)}
            placeholder="Option title"
            sx={optionStyle(option.isCorrect)}
          />
        </Box>
        <Box className="option-actions">
          <Tooltip title="Edit Image URL">
            <IconButton
              size="small"
              onClick={() => setEditingImageUrl({ url: option.imageUrl })}
              sx={{ color: 'grey.500' }}
            >
              {option.imageUrl ? <PhotoLibraryIcon /> : <BrokenImageIcon />}
            </IconButton>
          </Tooltip>
          <IconButton
            size="small"
            onClick={() => onDelete(question.id)}
            sx={{ color: 'grey.500' }}
          >
            <DeleteIcon />
          </IconButton>
        </Box>
      </Box>
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
    </Paper>
  );
};

export default function EditPage({ searchParams }: EditPageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [questions, setQuestions] = useState<SwipeeQuestion[]>([]);
  const [title, setTitle] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout>();

  // Load current questions
  useEffect(() => {
    const loadQuestions = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const gameStore = await APIService.getGameStore<{ questions: SwipeeQuestion[]; title: string }>(
          searchParams.presentationId,
          searchParams.slideId
        );

        if (gameStore) {
          setQuestions(gameStore.configs?.questions || []);
          setTitle(gameStore.configs?.title || '');
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
          { questions, title }
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
  }, [questions, title, searchParams.presentationId, searchParams.slideId]);

  const handleAddQuestion = () => {
    const newQuestion: SwipeeQuestion = {
      id: uuidv4(),
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

      <TextField
        fullWidth
        variant="outlined"
        label="Slide Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        sx={{ mb: 4 }}
      />

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