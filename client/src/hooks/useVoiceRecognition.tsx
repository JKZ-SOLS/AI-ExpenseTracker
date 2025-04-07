import { useState, useEffect, useCallback } from 'react';
// Import the type definitions
import '../types/speech-recognition.d.ts';

interface VoiceRecognitionState {
  isListening: boolean;
  transcript: string;
  error: string | null;
}

interface VoiceRecognitionOptions {
  language?: string;
  continuous?: boolean;
  interimResults?: boolean;
  onResult?: (transcript: string) => void;
  onError?: (error: string) => void;
}

const isVoiceRecognitionSupported = () => {
  return 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window;
};

export const useVoiceRecognition = (options: VoiceRecognitionOptions = {}) => {
  const [state, setState] = useState<VoiceRecognitionState>({
    isListening: false,
    transcript: '',
    error: null,
  });

  const [recognition, setRecognition] = useState<SpeechRecognition | null>(null);

  useEffect(() => {
    if (!isVoiceRecognitionSupported()) {
      setState(prev => ({ ...prev, error: 'Voice recognition is not supported in this browser' }));
      return;
    }

    // Initialize speech recognition
    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognitionAPI) {
      setState(prev => ({ ...prev, error: 'Speech recognition not available' }));
      return;
    }
    const recognitionInstance = new SpeechRecognitionAPI();
    
    // Set recognition options
    recognitionInstance.lang = options.language || 'en-US';
    recognitionInstance.continuous = options.continuous ?? false;
    recognitionInstance.interimResults = options.interimResults ?? false;

    // Set up event handlers
    recognitionInstance.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map(result => result[0].transcript)
        .join(' ');
      
      setState(prev => ({ ...prev, transcript }));
      
      if (options.onResult) {
        options.onResult(transcript);
      }
    };

    recognitionInstance.onerror = (event) => {
      const errorMessage = event.error || 'Unknown error occurred';
      setState(prev => ({ ...prev, error: errorMessage, isListening: false }));
      
      if (options.onError) {
        options.onError(errorMessage);
      }
    };

    recognitionInstance.onend = () => {
      setState(prev => ({ ...prev, isListening: false }));
    };

    setRecognition(recognitionInstance);

    return () => {
      if (recognitionInstance) {
        // Cleanup event handlers
        recognitionInstance.onresult = null;
        recognitionInstance.onerror = null;
        recognitionInstance.onend = null;
        
        // Stop listening if needed
        if (state.isListening) {
          recognitionInstance.stop();
        }
      }
    };
  }, []);

  const startListening = useCallback(() => {
    if (!recognition) return;
    
    try {
      recognition.start();
      setState(prev => ({ ...prev, isListening: true, error: null }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setState(prev => ({ ...prev, error: errorMessage, isListening: false }));
      
      if (options.onError) {
        options.onError(errorMessage);
      }
    }
  }, [recognition, options]);

  const stopListening = useCallback(() => {
    if (!recognition) return;
    
    try {
      recognition.stop();
      setState(prev => ({ ...prev, isListening: false }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setState(prev => ({ ...prev, error: errorMessage }));
      
      if (options.onError) {
        options.onError(errorMessage);
      }
    }
  }, [recognition, options]);

  const resetTranscript = useCallback(() => {
    setState(prev => ({ ...prev, transcript: '', error: null }));
  }, []);

  return {
    ...state,
    startListening,
    stopListening,
    resetTranscript,
    isSupported: isVoiceRecognitionSupported(),
  };
};