import { useEffect, useState } from "react";
import { Route, Switch } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import HomePage from "@/pages/HomePage";
import StatsPage from "@/pages/StatsPage";
import CategoriesPage from "@/pages/CategoriesPage";
import SettingsPage from "@/pages/SettingsPage";
import LockScreen from "@/components/LockScreen";
import Navigation from "@/components/Navigation";
import { useAuth } from "./context/AuthContext";
import AddTransactionPage from "./pages/AddTransactionPage";
import TransactionsHistoryPage from "./pages/TransactionsHistoryPage";
import { useTheme } from "./hooks/useTheme";
import { ExpenseProvider } from "./context/ExpenseContext";
import { TipsProvider } from "./context/TipsContext";

function App() {
  // Temporary solution to bypass auth context issue
  const [isAuthenticated, setIsAuthenticated] = useState(false); 
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [activeRoute, setActiveRoute] = useState("/");
  
  // Load settings from localStorage directly
  useEffect(() => {
    try {
      const settingsStr = localStorage.getItem('settings');
      if (settingsStr) {
        const settings = JSON.parse(settingsStr);
        setIsDarkMode(settings.darkMode || false);
      }
      
      // For demo purposes, we'll consider the user authenticated by default
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  }, []);

  useEffect(() => {
    // Handle back button and update active route
    const handleRouteChange = () => {
      setActiveRoute(window.location.pathname);
    };
    
    window.addEventListener('popstate', handleRouteChange);
    return () => window.removeEventListener('popstate', handleRouteChange);
  }, []);
  
  // Handle login
  const handleLogin = (pin: string) => {
    // For simplicity, use 1234 as the PIN or allow fingerprint authentication (empty pin)
    if (pin === '1234' || pin === '') {
      setIsAuthenticated(true);
      return true;
    }
    return false;
  };
  
  if (!isAuthenticated) {
    return <LockScreen onLogin={handleLogin} />;
  }

  // Only render ExpenseProvider when authenticated
  return (
    <TipsProvider>
      <ExpenseProvider>
        <div className="min-h-screen bg-black text-white">
          <Switch>
            <Route path="/" component={HomePage} />
            <Route path="/stats" component={StatsPage} />
            <Route path="/categories" component={CategoriesPage} />
            <Route path="/settings" component={SettingsPage} />
            <Route path="/add-transaction" component={AddTransactionPage} />
            <Route path="/transactions-history" component={TransactionsHistoryPage} />
          </Switch>
          
          <Navigation activeRoute={activeRoute} setActiveRoute={setActiveRoute} />
          <Toaster />
        </div>
      </ExpenseProvider>
    </TipsProvider>
  );
}

export default App;
