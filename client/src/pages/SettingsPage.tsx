import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../hooks/useTheme';
import { useExpense } from '../context/ExpenseContext';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { FileUp, FileDown } from 'lucide-react';
import * as XLSX from 'xlsx';
import { formatCurrency, formatDate } from '@/lib/utils';

const SettingsPage = () => {
  const { settings, updateSettings, logout, changePin } = useAuth();
  const { toggleTheme, isDarkMode } = useTheme();
  const { toast } = useToast();
  const { transactions, categories, addTransaction, addCategory } = useExpense();
  
  const [isPinDialogOpen, setIsPinDialogOpen] = useState(false);
  const [currentPin, setCurrentPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const fileInputRef = useState<HTMLInputElement | null>(null);
  
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
  
  const handleExit = () => {
    // On mobile, this would close the app
    logout();
  };
  
  // Function to export transactions to Excel
  const exportToExcel = () => {
    // Filter transactions by selected month and year
    const filteredTransactions = transactions.filter(transaction => {
      const transactionDate = new Date(transaction.date);
      return (
        transactionDate.getMonth() === selectedMonth && 
        transactionDate.getFullYear() === selectedYear
      );
    });
    
    if (filteredTransactions.length === 0) {
      toast({
        variant: "destructive",
        title: "No data to export",
        description: "There are no transactions for the selected month and year.",
      });
      setIsExportDialogOpen(false);
      return;
    }
    
    // Prepare data for export
    const worksheetData = filteredTransactions.map(transaction => {
      // Find category name
      const category = categories.find(cat => cat.id === transaction.categoryId);
      
      return {
        'Date': formatDate(transaction.date),
        'Type': transaction.type,
        'Category': category ? category.name : 'Unknown',
        'Amount': transaction.amount,
        'Amount (Formatted)': formatCurrency(transaction.amount, settings.currency),
        'Description': transaction.description || '-'
      };
    });
    
    // Create workbook and worksheet
    const worksheet = XLSX.utils.json_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Transactions');
    
    // Generate filename with month and year
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
      'July', 'August', 'September', 'October', 'November', 'December'];
    const filename = `Expenses_${monthNames[selectedMonth]}_${selectedYear}.xlsx`;
    
    // Export file
    XLSX.writeFile(workbook, filename);
    setIsExportDialogOpen(false);
    
    toast({
      title: "Export successful",
      description: `Transactions exported to ${filename}`,
    });
  };
  
  // Function to handle file import
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        
        // Get first worksheet
        const worksheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[worksheetName];
        
        // Convert to JSON
        const jsonData: any[] = XLSX.utils.sheet_to_json(worksheet);
        
        if (jsonData.length === 0) {
          toast({
            variant: "destructive",
            title: "Import failed",
            description: "The file doesn't contain any data or is in an invalid format.",
          });
          return;
        }
        
        // Check if the data has the expected fields
        const requiredFields = ['Date', 'Type', 'Category', 'Amount', 'Description'];
        const hasRequiredFields = requiredFields.every(field => 
          jsonData[0].hasOwnProperty(field) || 
          jsonData[0].hasOwnProperty(field.toLowerCase())
        );
        
        if (!hasRequiredFields) {
          toast({
            variant: "destructive",
            title: "Import failed",
            description: "The file format is invalid. Please use a file exported from this app.",
          });
          return;
        }
        
        // Keep track of imported items
        let importedCount = 0;
        let categoriesCreated = 0;
        
        // Process data and add transactions
        for (const item of jsonData) {
          // First, ensure the category exists
          const categoryName = item.Category || item.category;
          let categoryId;
          
          const existingCategory = categories.find(cat => 
            cat.name.toLowerCase() === categoryName.toLowerCase()
          );
          
          if (existingCategory) {
            categoryId = existingCategory.id;
          } else {
            // Create a new category
            const newCategory = await addCategory({
              name: categoryName,
              type: "expense", // Default to expense type for imported categories
              icon: 'default',
              color: '#00A226'
            });
            categoryId = newCategory.id;
            categoriesCreated++;
          }
          
          // Create the transaction
          await addTransaction({
            date: new Date(item.Date || item.date),
            type: item.Type || item.type,
            amount: parseFloat(item.Amount || item.amount),
            categoryId,
            description: item.Description || item.description || ''
          });
          
          importedCount++;
        }
        
        setIsImportDialogOpen(false);
        
        toast({
          title: "Import successful",
          description: `Imported ${importedCount} transactions and created ${categoriesCreated} new categories.`,
        });
      } catch (error) {
        console.error('Import error:', error);
        toast({
          variant: "destructive",
          title: "Import failed",
          description: "An error occurred while importing the file.",
        });
      }
    };
    
    reader.readAsArrayBuffer(file);
  };
  
  return (
    <div className="min-h-screen pb-20">
      <div className="p-4 pt-12">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold">Settings</h1>
        </div>
        
        {/* Data Management Section */}
        <div className="glass-card rounded-xl p-5 mb-6">
          <h2 className="font-semibold mb-4">Data Management</h2>
          
          <div className="grid grid-cols-2 gap-4">
            <button 
              onClick={() => setIsExportDialogOpen(true)}
              className="flex flex-col items-center justify-center p-4 bg-[#00A226]/10 rounded-xl border border-[#00A226]/30 hover:bg-[#00A226]/20 transition-colors"
            >
              <FileDown className="w-8 h-8 mb-2 text-[#00A226]" />
              <span className="text-sm font-medium">Export Data</span>
            </button>
            
            <button 
              onClick={() => setIsImportDialogOpen(true)}
              className="flex flex-col items-center justify-center p-4 bg-[#00A226]/10 rounded-xl border border-[#00A226]/30 hover:bg-[#00A226]/20 transition-colors"
            >
              <FileUp className="w-8 h-8 mb-2 text-[#00A226]" />
              <span className="text-sm font-medium">Import Data</span>
            </button>
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
            
{/* Dark theme switch removed - app will always use dark mode */}
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
        
        {/* Exit App Button */}
        <button 
          className="w-full py-3 bg-danger/10 text-danger font-medium rounded-xl mb-6"
          onClick={handleExit}
        >
          Exit App
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
      
      {/* Export Dialog */}
      <Dialog open={isExportDialogOpen} onOpenChange={setIsExportDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Export Transactions</DialogTitle>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Select the month and year of transactions you want to export to Excel.
            </p>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Month</label>
                <select 
                  className="w-full p-2 rounded-md border border-neutral-300/30 dark:border-neutral-600/30 bg-transparent"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                >
                  <option value={0}>January</option>
                  <option value={1}>February</option>
                  <option value={2}>March</option>
                  <option value={3}>April</option>
                  <option value={4}>May</option>
                  <option value={5}>June</option>
                  <option value={6}>July</option>
                  <option value={7}>August</option>
                  <option value={8}>September</option>
                  <option value={9}>October</option>
                  <option value={10}>November</option>
                  <option value={11}>December</option>
                </select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Year</label>
                <select 
                  className="w-full p-2 rounded-md border border-neutral-300/30 dark:border-neutral-600/30 bg-transparent"
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                >
                  {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - 5 + i).map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsExportDialogOpen(false)}>Cancel</Button>
            <Button 
              className="bg-[#00A226] hover:bg-[#00A226]/80"
              onClick={exportToExcel}
            >
              Export
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Import Dialog */}
      <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Import Transactions</DialogTitle>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Select an Excel file (.xlsx) containing transaction data to import.
            </p>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">File</label>
              <div className="flex">
                <Input 
                  type="file" 
                  accept=".xlsx, .xls"
                  onChange={handleFileUpload}
                  className="flex-1"
                />
              </div>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                The file should contain columns for Date, Type, Category, Amount, and Description.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsImportDialogOpen(false)}>Cancel</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SettingsPage;
