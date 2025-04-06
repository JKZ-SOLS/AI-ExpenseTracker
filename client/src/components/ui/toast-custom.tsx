import { useState, useEffect } from 'react';
import { toast } from '@/hooks/use-toast';

interface CustomToastProps {
  message: string;
  type: 'success' | 'error' | 'info';
  duration?: number;
}

export const showCustomToast = ({ message, type, duration = 3000 }: CustomToastProps) => {
  toast({
    title: type === 'success' ? 'Success' : type === 'error' ? 'Error' : 'Info',
    description: message,
    variant: type === 'error' ? 'destructive' : 'default',
    duration
  });
};

export const CustomToast = ({ message, type, duration = 3000 }: CustomToastProps) => {
  const [visible, setVisible] = useState(true);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
    }, duration);
    
    return () => clearTimeout(timer);
  }, [duration]);
  
  if (!visible) return null;
  
  const bgClass = type === 'success' 
    ? 'bg-success/90 text-white' 
    : type === 'error' 
      ? 'bg-danger/90 text-white' 
      : 'bg-primary/90 text-white';
  
  const iconClass = type === 'success' 
    ? 'ri-checkbox-circle-line' 
    : type === 'error' 
      ? 'ri-error-warning-line' 
      : 'ri-information-line';
  
  return (
    <div className={`fixed top-4 left-1/2 transform -translate-x-1/2 min-w-[280px] max-w-[90%] rounded-lg px-4 py-3 shadow-lg ${bgClass} flex items-center z-50`}>
      <i className={`${iconClass} text-xl mr-2`}></i>
      <p>{message}</p>
      <button className="ml-auto" onClick={() => setVisible(false)}>
        <i className="ri-close-line"></i>
      </button>
    </div>
  );
};
