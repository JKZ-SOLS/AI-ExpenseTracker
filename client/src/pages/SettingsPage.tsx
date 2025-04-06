import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../hooks/useTheme';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/toggle';

const SettingsPage = () => {
  const { settings, updateSettings, logout, changePin } = useAuth();
  const { toggleTheme, isDarkMode } = useTheme();
  const { toast } = useToast();
  
  const [isPinDialogOpen, setIsPinDialogOpen] = useState(false);
  const [currentPin, setCurrentPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  
  const handleCurrencyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    updateSettings({ ...settings, currency: e.target.value });
    toast({
      title: "Currency updated",
      description: `Currency changed to ${e.target.value}`,
    });
  };
  
  const handleThemeToggle = () => {
    toggleTheme();
    updateSettings({ ...settings, darkMode: !isDarkMode });
  };
  
  const handleFingerprintToggle = () => {
    updateSettings({ ...settings, fingerprintEnabled: !settings.fingerprintEnabled });
    toast({
      title: settings.fingerprintEnabled ? "Fingerprint disabled" : "Fingerprint enabled",
      description: settings.fingerprintEnabled 
        ? "You will need to use your PIN to unlock the app." 
        : "You can now use your fingerprint to unlock the app.",
    });
  };
  
  const handlePinChange = () => {
    if (currentPin !== settings.pin) {
      toast({
        variant: "destructive",
        title: "Incorrect PIN",
        description: "The current PIN you entered is incorrect.",
      });
      return;
    }
    
    if (newPin.length !== 4 || !/^\d+$/.test(newPin)) {
      toast({
        variant: "destructive",
        title: "Invalid PIN",
        description: "PIN must be exactly 4 digits.",
      });
      return;
    }
    
    if (newPin !== confirmPin) {
      toast({
        variant: "destructive",
        title: "PINs don't match",
        description: "The new PIN and confirmation PIN don't match.",
      });
      return;
    }
    
    changePin(newPin);
    setIsPinDialogOpen(false);
    setCurrentPin('');
    setNewPin('');
    setConfirmPin('');
    
    toast({
      title: "PIN changed",
      description: "Your PIN has been updated successfully.",
    });
  };
  
  const handleLogout = () => {
    logout();
  };
  
  return (
    <div className="min-h-screen pb-20">
      <div className="p-4 pt-12">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold">Settings</h1>
        </div>
        
        {/* Profile Section */}
        <div className="glass-card rounded-xl p-5 mb-6 flex items-center">
          <div className="w-14 h-14 rounded-full bg-primary/20 flex items-center justify-center mr-4">
            <span className="text-xl font-semibold text-primary">US</span>
          </div>
          <div>
            <h2 className="font-semibold">User</h2>
            <p className="text-xs opacity-60">Personal Expense Tracker</p>
          </div>
        </div>
        
        {/* Settings List */}
        <div className="glass-card rounded-xl overflow-hidden mb-6">
          <div className="p-4 border-b border-neutral-200/30 dark:border-neutral-700/30">
            <h2 className="font-semibold mb-4">General</h2>
            
            {/* Currency Setting */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <div className="w-9 h-9 rounded-full bg-white/20 dark:bg-neutral-700/20 flex items-center justify-center mr-3">
                  <i className="ri-money-dollar-circle-line"></i>
                </div>
                <span>Currency</span>
              </div>
              <select 
                className="bg-transparent border border-neutral-300/30 dark:border-neutral-600/30 rounded-md py-1 px-2"
                value={settings.currency}
                onChange={handleCurrencyChange}
              >
                <option value="PKR">PKR</option>
                <option value="USD">USD</option>
              </select>
            </div>
            
            {/* Theme Setting */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-9 h-9 rounded-full bg-white/20 dark:bg-neutral-700/20 flex items-center justify-center mr-3">
                  <i className="ri-contrast-2-line"></i>
                </div>
                <span>Dark Theme</span>
              </div>
              <Switch checked={isDarkMode} onCheckedChange={handleThemeToggle} />
            </div>
          </div>
          
          <div className="p-4 border-b border-neutral-200/30 dark:border-neutral-700/30">
            <h2 className="font-semibold mb-4">Security</h2>
            
            {/* PIN Setting */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <div className="w-9 h-9 rounded-full bg-white/20 dark:bg-neutral-700/20 flex items-center justify-center mr-3">
                  <i className="ri-lock-password-line"></i>
                </div>
                <span>Change PIN</span>
              </div>
              <button 
                className="text-primary"
                onClick={() => setIsPinDialogOpen(true)}
              >
                Change
              </button>
            </div>
            
            {/* Fingerprint Setting */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-9 h-9 rounded-full bg-white/20 dark:bg-neutral-700/20 flex items-center justify-center mr-3">
                  <i className="ri-fingerprint-line"></i>
                </div>
                <span>Fingerprint Unlock</span>
              </div>
              <Switch
                checked={settings.fingerprintEnabled}
                onCheckedChange={handleFingerprintToggle}
              />
            </div>
          </div>
          
          <div className="p-4">
            <h2 className="font-semibold mb-4">About</h2>
            
            {/* Version Info */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <div className="w-9 h-9 rounded-full bg-white/20 dark:bg-neutral-700/20 flex items-center justify-center mr-3">
                  <i className="ri-information-line"></i>
                </div>
                <span>Version</span>
              </div>
              <span className="text-sm opacity-60">1.0.0</span>
            </div>
            
            {/* Help */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-9 h-9 rounded-full bg-white/20 dark:bg-neutral-700/20 flex items-center justify-center mr-3">
                  <i className="ri-question-line"></i>
                </div>
                <span>Help & Support</span>
              </div>
              <i className="ri-arrow-right-s-line"></i>
            </div>
          </div>
        </div>
        
        {/* Logout Button */}
        <button 
          className="w-full py-3 bg-danger/10 text-danger font-medium rounded-xl mb-6"
          onClick={handleLogout}
        >
          Log Out
        </button>
      </div>
      
      {/* Change PIN Dialog */}
      <Dialog open={isPinDialogOpen} onOpenChange={setIsPinDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change PIN</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Current PIN</label>
              <Input 
                type="password" 
                maxLength={4}
                value={currentPin} 
                onChange={(e) => setCurrentPin(e.target.value)} 
                placeholder="Enter current PIN"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">New PIN</label>
              <Input 
                type="password" 
                maxLength={4}
                value={newPin} 
                onChange={(e) => setNewPin(e.target.value)} 
                placeholder="Enter new PIN"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Confirm New PIN</label>
              <Input 
                type="password" 
                maxLength={4}
                value={confirmPin} 
                onChange={(e) => setConfirmPin(e.target.value)} 
                placeholder="Confirm new PIN"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPinDialogOpen(false)}>Cancel</Button>
            <Button onClick={handlePinChange}>Change PIN</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SettingsPage;
