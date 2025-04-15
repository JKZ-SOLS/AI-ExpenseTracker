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
  duration = 5000,
  type = 'info',
  onClose,
  isVisible,
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
    const animationFrame = () => {
      const now = Date.now();
      const elapsed = now - startTime;
      const remaining = duration - elapsed;
      const newProgress = (remaining / duration) * 100;

      if (remaining <= 0) {
        setIsClosing(true);
        setTimeout(() => {
          onClose?.();
        }, 300);
      } else {
        setProgress(newProgress);
        requestId = requestAnimationFrame(animationFrame);
      }
    };

    let requestId = requestAnimationFrame(animationFrame);
    return () => cancelAnimationFrame(requestId);
  }, [isVisible, duration, onClose]);

  // Handle dismiss
  const handleDismiss = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose?.();
    }, 300);
  };

  if (!isVisible) return null;

  const typeStyles = {
    success: 'bg-success/80 border-success text-success-foreground',
    info: 'bg-primary/80 border-primary text-primary-foreground',
    warning: 'bg-warning/80 border-warning text-warning-foreground',
    error: 'bg-destructive/80 border-destructive text-destructive-foreground',
  };

  const typeProgressStyles = {
    success: 'bg-success',
    info: 'bg-primary',
    warning: 'bg-warning',
    error: 'bg-destructive',
  };

  return (
    <div
      role="alert"
      aria-live="assertive"
      className={cn(
        'fixed top-4 left-1/2 transform -translate-x-1/2 w-[90%] max-w-md z-[100]',
        'transition-all duration-300 ease-in-out',
        isClosing ? 'opacity-0 -translate-y-4' : 'opacity-100 translate-y-0',
      )}
    >
      <div
        className={cn(
          'rounded-lg shadow-xl border p-4 relative overflow-hidden',
          typeStyles[type],
        )}
      >
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-medium text-sm">{title}</h3>
            <p className="text-xs mt-1">{message}</p>
          </div>
          <button
            onClick={handleDismiss}
            aria-label="Close notification"
            className="p-1 rounded-full hover:bg-black/20 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Progress bar */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/10">
          <div
            className={cn('h-full transition-none', typeProgressStyles[type])}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
};