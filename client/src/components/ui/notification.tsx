import React, { useEffect, useState } from 'react';
import { Bell, X } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  duration?: number;
}

interface NotificationContextType {
  notifications: Notification[];
  showNotification: (notification: Omit<Notification, 'id'>) => void;
  dismissNotification: (id: string) => void;
}

const NotificationContext = React.createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const showNotification = (notification: Omit<Notification, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 9);
    setNotifications(prev => [...prev, { ...notification, id }]);
  };

  const dismissNotification = (id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        showNotification,
        dismissNotification,
      }}
    >
      {children}
      <NotificationContainer 
        notifications={notifications} 
        dismissNotification={dismissNotification} 
      />
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = React.useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

const NotificationContainer: React.FC<{
  notifications: Notification[];
  dismissNotification: (id: string) => void;
}> = ({ notifications, dismissNotification }) => {
  return (
    <div className="fixed top-0 right-0 z-50 p-4 space-y-4 w-full md:max-w-sm">
      <AnimatePresence>
        {notifications.map(notification => (
          <NotificationItem
            key={notification.id}
            notification={notification}
            onDismiss={() => dismissNotification(notification.id)}
          />
        ))}
      </AnimatePresence>
    </div>
  );
};

const NotificationItem: React.FC<{
  notification: Notification;
  onDismiss: () => void;
}> = ({ notification, onDismiss }) => {
  const [progress, setProgress] = useState(100);
  const duration = notification.duration || 5000;
  
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss();
    }, duration);
    
    // Create progress animation
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, (duration - elapsed) / duration * 100);
      setProgress(remaining);
      
      if (elapsed >= duration) {
        clearInterval(interval);
      }
    }, 50);

    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, [notification, onDismiss, duration]);

  const getBackgroundColor = () => {
    switch (notification.type) {
      case 'success':
        return 'bg-[#00A226]';
      case 'error':
        return 'bg-red-600';
      case 'warning':
        return 'bg-amber-500';
      default:
        return 'bg-[#00A226]';
    }
  };

  const getIcon = () => {
    switch (notification.type) {
      case 'info':
      case 'success':
      case 'warning':
      case 'error':
      default:
        return <Bell className="w-5 h-5" />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.9 }}
      transition={{ duration: 0.2 }}
      className={`${getBackgroundColor()} text-black px-4 pt-3 rounded-lg shadow-lg flex flex-col relative overflow-hidden`}
    >
      <div className="flex items-start pb-3">
        <div className="mr-3 pt-0.5">
          {getIcon()}
        </div>
        <div className="flex-1">
          <h3 className="font-semibold">{notification.title}</h3>
          <p className="text-sm opacity-90">{notification.message}</p>
        </div>
        <button onClick={onDismiss} className="p-1">
          <X className="w-5 h-5" />
        </button>
      </div>
      
      {/* Progress bar */}
      <div 
        className="h-1 bg-white/30 absolute bottom-0 left-0 transition-all" 
        style={{ width: `${progress}%` }}
      />
    </motion.div>
  );
};