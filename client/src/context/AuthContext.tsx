import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiRequest } from '../lib/queryClient';

interface Settings {
  currency: string;
  darkMode: boolean;
  fingerprintEnabled: boolean;
  pin: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  settings: Settings;
  login: (pin: string) => boolean;
  logout: () => void;
  updateSettings: (newSettings: Settings) => void;
  changePin: (newPin: string) => void;
}

const defaultSettings: Settings = {
  currency: 'PKR',
  darkMode: false,
  fingerprintEnabled: true,
  pin: '1234' // Default PIN
};

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [settings, setSettings] = useState<Settings>(() => {
    // Load settings from localStorage if available
    const savedSettings = localStorage.getItem('settings');
    return savedSettings ? JSON.parse(savedSettings) : defaultSettings;
  });

  // Save settings to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('settings', JSON.stringify(settings));
  }, [settings]);

  const login = (pin: string) => {
    // For fingerprint auth, pin will be empty
    if (pin === '' && settings.fingerprintEnabled) {
      setIsAuthenticated(true);
      return true;
    }
    
    // PIN validation
    if (pin === settings.pin) {
      setIsAuthenticated(true);
      return true;
    }
    
    return false;
  };

  const logout = () => {
    setIsAuthenticated(false);
  };

  const updateSettings = async (newSettings: Settings) => {
    try {
      // Save settings to backend (for future implementation)
      await apiRequest('POST', '/api/settings', newSettings);
      setSettings(newSettings);
    } catch (error) {
      // Fallback to just updating local state if API call fails
      setSettings(newSettings);
    }
  };

  const changePin = (newPin: string) => {
    setSettings(prev => ({
      ...prev,
      pin: newPin
    }));
  };

  return (
    <AuthContext.Provider value={{
      isAuthenticated,
      settings,
      login,
      logout,
      updateSettings,
      changePin
    }}>
      {children}
    </AuthContext.Provider>
  );
};

// Create a default context that can be safely used when the provider is not available
// This is useful during development and helps prevent the "must be used within a provider" errors
const defaultAuthContext: AuthContextType = {
  isAuthenticated: false,
  settings: defaultSettings,
  login: () => false,
  logout: () => {},
  updateSettings: () => {},
  changePin: () => {}
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  return context || defaultAuthContext;
};
