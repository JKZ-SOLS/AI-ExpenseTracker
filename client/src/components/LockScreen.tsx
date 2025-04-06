import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

// Props to receive authentication handling from parent
interface LockScreenProps {
  onLogin?: (pin: string) => boolean;
}

const LockScreen = ({ onLogin }: LockScreenProps) => {
  const [enteredPin, setEnteredPin] = useState<string>('');
  const { toast } = useToast();
  
  // Default settings
  const settings = {
    fingerprintEnabled: true
  };

  // Default PIN
  const defaultPin = '1234';
  
  // Basic login function if none provided
  const login = (pin: string) => {
    if (onLogin) {
      return onLogin(pin);
    }
    
    // Fallback logic with hardcoded PIN for demo
    if (pin === '' && settings.fingerprintEnabled) {
      return true;
    }
    return pin === defaultPin;
  };

  const updatePinDisplay = (pin: string) => {
    setEnteredPin(pin);
    
    if (pin.length === 4) {
      setTimeout(() => {
        if (login(pin)) {
          // Successful login handled by parent component
          // This allows bypassing the context issue
        } else {
          // Wrong PIN animation and feedback
          toast({
            variant: "destructive",
            title: "Incorrect PIN",
            description: "The PIN you entered is incorrect. Please try again."
          });
          setEnteredPin('');
        }
      }, 300);
    }
  };

  const handleKeyPress = (key: string) => {
    if (key === 'fingerprint') {
      if (settings.fingerprintEnabled) {
        // Simulate successful fingerprint auth for demo
        login('');
      } else {
        toast({
          title: "Fingerprint Not Enabled",
          description: "Please enable fingerprint authentication in settings."
        });
      }
    } else if (key === 'backspace') {
      if (enteredPin.length > 0) {
        updatePinDisplay(enteredPin.slice(0, -1));
      }
    } else if (enteredPin.length < 4) {
      updatePinDisplay(enteredPin + key);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-br from-primary/90 to-secondary/90">
      <div className="mb-10 text-white text-center">
        <h1 className="text-3xl font-semibold mb-2">Expense Tracker</h1>
        <p className="text-white/80">Enter your PIN to unlock</p>
      </div>
      
      <div className="flex justify-center space-x-4 mb-8">
        {[1, 2, 3, 4].map((dot) => (
          <div 
            key={dot}
            className={`w-3 h-3 rounded-full border border-white ${
              dot <= enteredPin.length ? 'bg-white' : 'bg-white/20'
            }`}
          />
        ))}
      </div>
      
      <div className="grid grid-cols-3 gap-4 max-w-xs">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
          <button 
            key={num}
            className="keypad-button" 
            onClick={() => handleKeyPress(num.toString())}
          >
            {num}
          </button>
        ))}
        <button 
          className="keypad-button" 
          onClick={() => handleKeyPress('fingerprint')}
        >
          <i className="ri-fingerprint-line"></i>
        </button>
        <button 
          className="keypad-button" 
          onClick={() => handleKeyPress('0')}
        >
          0
        </button>
        <button 
          className="keypad-button" 
          onClick={() => handleKeyPress('backspace')}
        >
          <i className="ri-delete-back-2-line"></i>
        </button>
      </div>
    </div>
  );
};

export default LockScreen;
