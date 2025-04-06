import { useState, useEffect } from 'react';
import { useLocation, useRoute } from 'wouter';
import { useExpense } from '../context/ExpenseContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { formatCurrency } from '../lib/utils';

const AddTransactionPage = () => {
  const [, navigate] = useLocation();
  const [_, params] = useRoute('/add-transaction');
  const { categories, addTransaction } = useExpense();
  const { settings } = useAuth();
  const { toast } = useToast();
  
  const urlParams = new URLSearchParams(location.search);
  const initialType = urlParams.get('type') === 'income' ? 'income' : 'expense';
  
  const [type, setType] = useState<'expense' | 'income'>(initialType);
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState<number | ''>('');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  
  const filteredCategories = categories.filter(c => c.type === type);
  
  useEffect(() => {
    // Reset category when type changes
    setCategoryId('');
  }, [type]);
  
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow numbers and a single decimal point
    const value = e.target.value.replace(/[^0-9.]/g, '');
    
    // Prevent multiple decimal points
    const parts = value.split('.');
    if (parts.length > 2) {
      return;
    }
    
    setAmount(value);
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate inputs
    if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      toast({
        variant: "destructive",
        title: "Invalid amount",
        description: "Please enter a valid amount greater than zero.",
      });
      return;
    }
    
    if (!description.trim()) {
      toast({
        variant: "destructive",
        title: "Missing description",
        description: "Please enter a description for this transaction.",
      });
      return;
    }
    
    if (categoryId === '') {
      toast({
        variant: "destructive",
        title: "Category required",
        description: "Please select a category for this transaction.",
      });
      return;
    }
    
    const parsedAmount = parseFloat(amount);
    const dateObj = date ? new Date(date) : new Date();
    
    // Add transaction
    addTransaction({
      type,
      amount: parsedAmount,
      description,
      categoryId: categoryId as number,
      date: dateObj.toISOString(),
    });
    
    toast({
      title: "Transaction added",
      description: `${type === 'expense' ? 'Expense' : 'Income'} of ${formatCurrency(parsedAmount, settings.currency)} has been added.`,
    });
    
    // Navigate back to home
    navigate('/');
  };
  
  return (
    <div className="min-h-screen pb-20">
      <div className="p-4 pt-12">
        <div className="flex items-center mb-6">
          <button 
            className="mr-4 h-10 w-10 rounded-full flex items-center justify-center bg-white/20 dark:bg-neutral-700/20"
            onClick={() => navigate('/')}
          >
            <i className="ri-arrow-left-s-line text-xl"></i>
          </button>
          <h1 className="text-2xl font-semibold">
            Add {type === 'expense' ? 'Expense' : 'Income'}
          </h1>
        </div>
        
        <div className="glass-card rounded-xl p-5 mb-6">
          <form onSubmit={handleSubmit}>
            {/* Transaction Type */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Transaction Type</label>
              <div className="flex rounded-md overflow-hidden bg-white/20 dark:bg-neutral-700/20 p-1">
                <button
                  type="button"
                  className={`flex-1 py-2 rounded-md ${type === 'expense' ? 'bg-primary text-white' : ''}`}
                  onClick={() => setType('expense')}
                >
                  Expense
                </button>
                <button
                  type="button"
                  className={`flex-1 py-2 rounded-md ${type === 'income' ? 'bg-success text-white' : ''}`}
                  onClick={() => setType('income')}
                >
                  Income
                </button>
              </div>
            </div>
            
            {/* Amount Input */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Amount ({settings.currency})</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-neutral-500">
                    {settings.currency === 'PKR' ? 'Rs.' : '$'}
                  </span>
                </div>
                <Input
                  type="text"
                  value={amount}
                  onChange={handleAmountChange}
                  className="pl-12"
                  placeholder="0.00"
                  required
                />
              </div>
            </div>
            
            {/* Category Selection */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Category</label>
              {filteredCategories.length > 0 ? (
                <Select value={categoryId.toString()} onValueChange={(value) => setCategoryId(parseInt(value))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredCategories.map(category => (
                      <SelectItem key={category.id} value={category.id.toString()}>
                        <div className="flex items-center">
                          <i className={`${category.icon} mr-2`}></i>
                          <span>{category.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <div className="text-center p-3 border border-dashed rounded-md border-neutral-300/50 dark:border-neutral-600/50">
                  <p className="text-sm mb-2">No categories available</p>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => navigate('/categories')}
                  >
                    Add Categories
                  </Button>
                </div>
              )}
            </div>
            
            {/* Description Input */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Description</label>
              <Input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter description"
                required
              />
            </div>
            
            {/* Date Input */}
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">Date</label>
              <Input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                max={new Date().toISOString().split('T')[0]}
                required
              />
            </div>
            
            {/* Submit Button */}
            <Button 
              type="submit" 
              className="w-full py-3"
              disabled={!amount || !description || categoryId === ''}
            >
              Save Transaction
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddTransactionPage;
