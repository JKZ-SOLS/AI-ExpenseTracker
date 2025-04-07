import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import { Notification } from '@/components/ui/notification';

// Define different types of tips
export type TipType = 'spending' | 'saving' | 'insight' | 'feature' | 'warning';

// Define the structure of a tip
export interface Tip {
  id: string;
  title: string;
  message: string;
  type: TipType;
  notificationType?: 'success' | 'info' | 'warning' | 'error';
}

// The AI tips database
const tipBank: Tip[] = [
  {
    id: 'tip-1',
    title: 'Spending Tip',
    message: 'Try categorizing your food expenses between groceries and dining out to better track your spending habits.',
    type: 'spending',
    notificationType: 'info'
  },
  {
    id: 'tip-2',
    title: 'Saving Strategy',
    message: 'Consider setting up a 50/30/20 budget: 50% for needs, 30% for wants, and 20% for savings and debt repayment.',
    type: 'saving',
    notificationType: 'success'
  },
  {
    id: 'tip-3',
    title: 'Did you know?',
    message: 'Your biggest expense category this month is transportation. Consider carpooling or using public transit to save money.',
    type: 'insight',
    notificationType: 'warning'
  },
  {
    id: 'tip-4',
    title: 'Feature Spotlight',
    message: 'Try our new voice input feature! Just tap the microphone and say "spent 500 on groceries yesterday".',
    type: 'feature',
    notificationType: 'info'
  },
  {
    id: 'tip-5',
    title: 'Spending Insight',
    message: 'Weekend spending tends to be higher. Try planning activities in advance to better control impulse purchases.',
    type: 'insight',
    notificationType: 'info'
  },
  {
    id: 'tip-6',
    title: 'Saving Challenge',
    message: 'Try the no-spend challenge: pick one day a week where you commit to spending no money at all.',
    type: 'saving',
    notificationType: 'success'
  },
  {
    id: 'tip-7',
    title: 'Feature Tip',
    message: 'Use categories with emojis or icons to make your expense tracking more visual and engaging.',
    type: 'feature',
    notificationType: 'info'
  },
  {
    id: 'tip-8',
    title: 'Spending Pattern',
    message: 'Small, frequent purchases can add up quickly. Try tracking all purchases under 100 in a separate category.',
    type: 'spending',
    notificationType: 'warning'
  },
  {
    id: 'tip-9',
    title: 'Monthly Review',
    message: 'Set aside 15 minutes at the end of each month to review your spending and set goals for next month.',
    type: 'saving',
    notificationType: 'success'
  },
  {
    id: 'tip-10',
    title: 'Export Your Data',
    message: 'Remember you can export your transactions to Excel for deeper analysis or sharing with financial advisors.',
    type: 'feature',
    notificationType: 'info'
  }
];

// Define context type
interface TipsContextType {
  showRandomTip: () => void;
  showTip: (tipId: string) => void;
  showCustomTip: (tip: Omit<Tip, 'id'>) => void;
  dismissTip: () => void;
}

// Create context
export const TipsContext = createContext<TipsContextType | undefined>(undefined);

// TipsProvider component
export const TipsProvider = ({ children }: { children: ReactNode }) => {
  const [currentTip, setCurrentTip] = useState<Tip | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [shownTipIds, setShownTipIds] = useState<Set<string>>(new Set());
  const [lastShownTime, setLastShownTime] = useState(0);

  // Initialize with a random tip after a delay
  useEffect(() => {
    const timer = setTimeout(() => {
      showRandomTip();
    }, 5000); // Show first tip after 5 seconds
    
    return () => clearTimeout(timer);
  }, []);

  // Show tips periodically
  useEffect(() => {
    const tipInterval = 5 * 60 * 1000; // 5 minutes between tips
    const timer = setInterval(() => {
      // Only show if there's no active tip
      if (!isVisible) {
        showRandomTip();
      }
    }, tipInterval);
    
    return () => clearInterval(timer);
  }, [isVisible]);

  // Show a random tip
  const showRandomTip = useCallback(() => {
    // Don't show tips too frequently
    const now = Date.now();
    if (now - lastShownTime < 60000) { // At least 1 minute between tips
      return;
    }
    
    // Filter tips that haven't been shown yet, or all tips if all have been shown
    const unseenTips = tipBank.filter(tip => !shownTipIds.has(tip.id));
    const tipsToChooseFrom = unseenTips.length > 0 ? unseenTips : tipBank;
    
    // Select a random tip
    const randomIndex = Math.floor(Math.random() * tipsToChooseFrom.length);
    const selectedTip = tipsToChooseFrom[randomIndex];
    
    setCurrentTip(selectedTip);
    setIsVisible(true);
    setLastShownTime(now);
    
    // Mark this tip as shown
    setShownTipIds(prev => {
      const newSet = new Set(prev);
      newSet.add(selectedTip.id);
      return newSet;
    });
  }, [shownTipIds, lastShownTime]);

  // Show a specific tip by ID
  const showTip = useCallback((tipId: string) => {
    const tip = tipBank.find(t => t.id === tipId);
    if (tip) {
      setCurrentTip(tip);
      setIsVisible(true);
      setLastShownTime(Date.now());
    }
  }, []);

  // Show a custom tip
  const showCustomTip = useCallback((tipData: Omit<Tip, 'id'>) => {
    const customTip: Tip = {
      ...tipData,
      id: `custom-${Date.now()}`
    };
    setCurrentTip(customTip);
    setIsVisible(true);
    setLastShownTime(Date.now());
  }, []);

  // Dismiss the current tip
  const dismissTip = useCallback(() => {
    setIsVisible(false);
  }, []);

  return (
    <TipsContext.Provider
      value={{
        showRandomTip,
        showTip,
        showCustomTip,
        dismissTip
      }}
    >
      {children}
      
      {currentTip && (
        <Notification
          title={currentTip.title}
          message={currentTip.message}
          type={currentTip.notificationType || 'info'}
          duration={3000} // 3 seconds, as requested
          isVisible={isVisible}
          onClose={dismissTip}
        />
      )}
    </TipsContext.Provider>
  );
};

// Custom hook to use tips context
export const useTips = () => {
  const context = useContext(TipsContext);
  if (context === undefined) {
    throw new Error('useTips must be used within a TipsProvider');
  }
  return context;
};