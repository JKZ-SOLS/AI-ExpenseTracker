import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface NotificationProps {
  title: string;
  message: string;
  duration?: number; // Duration in milliseconds
  type?: 'success' | 'info' | 'warning' | 'error';
  onClose?: () => void;
  isVisible: boolean;
}

export const Notification = ({
  title,
  message,
  duration = 3000,
  type = 'info',
  onClose,
  isVisible
}: NotificationProps) => {
  const [progress, setProgress] = useState(100);
  const [isClosing, setIsClosing] = useState(false);

  // Reset progress when notification changes
  useEffect(() => {
    if (isVisible) {
      setProgress(100);
      setIsClosing(false);
    }
  }, [isVisible, title, message]);

  // Handle auto-dismiss with progress bar
  useEffect(() => {
    if (!isVisible || duration <= 0) return;

    const startTime = Date.now();
    const endTime = startTime + duration;
    
    const intervalId = setInterval(() => {
      const now = Date.now();
      const remaining = endTime - now;
      const newProgress = (remaining / duration) * 100;
      
      if (remaining <= 0) {
        clearInterval(intervalId);
        setIsClosing(true);
        setTimeout(() => {
          if (onClose) onClose();
        }, 300); // Allow time for exit animation
      } else {
        setProgress(newProgress);
      }
    }, 16); // Approx 60fps

    return () => clearInterval(intervalId);
  }, [isVisible, duration, onClose]);

  // Handle dismiss
  const handleDismiss = () => {
    setIsClosing(true);
    setTimeout(() => {
      if (onClose) onClose();
    }, 300);
  };

  if (!isVisible) return null;

  const typeStyles = {
    success: 'bg-success/15 border-success',
    info: 'bg-primary/15 border-primary',
    warning: 'bg-warning/15 border-warning',
    error: 'bg-destructive/15 border-destructive'
  };

  const typeProgressStyles = {
    success: 'bg-success',
    info: 'bg-primary',
    warning: 'bg-warning',
    error: 'bg-destructive'
  };

  return (
    <div 
      className={cn(
        'fixed bottom-4 left-1/2 transform -translate-x-1/2 w-[90%] max-w-md z-50',
        'transition-all duration-300 ease-in-out',
        isClosing ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'
      )}
    >
      <div 
        className={cn(
          'rounded-lg shadow-lg border p-4 relative overflow-hidden',
          typeStyles[type]
        )}
      >
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-medium text-sm">{title}</h3>
            <p className="text-xs opacity-80 mt-1">{message}</p>
          </div>
          <button 
            onClick={handleDismiss}
            className="p-1 rounded-full hover:bg-black/10 transition-colors"
          >
            <X size={16} />
          </button>
        </div>
        
        {/* Progress bar */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/10">
          <div 
            className={cn('h-full transition-all', typeProgressStyles[type])}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
};