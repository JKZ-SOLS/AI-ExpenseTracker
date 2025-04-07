import { useState, useEffect, useRef } from 'react';
import { useLocation, useRoute } from 'wouter';
import { useExpense } from '../context/ExpenseContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useVoiceRecognition } from '../hooks/useVoiceRecognition';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { formatCurrency } from '../lib/utils';
import { Mic, MicOff, Loader2 } from 'lucide-react';

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
  const [isProcessingVoice, setIsProcessingVoice] = useState(false);
  
  const filteredCategories = categories.filter(c => c.type === type);
  
  // Voice recognition setup
  const { 
    transcript, 
    isListening, 
    startListening, 
    stopListening, 
    resetTranscript,
    isSupported,
    error: voiceError
  } = useVoiceRecognition({
    language: 'en-US',
    continuous: false,
    onResult: (text) => {
      console.log('Voice recognized:', text);
    },
    onError: (error) => {
      console.error('Voice recognition error:', error);
      toast({
        variant: "destructive",
        title: "Voice Recognition Error",
        description: error,
      });
    }
  });
  
  useEffect(() => {
    // Reset category when type changes
    setCategoryId('');
  }, [type]);
  
  // Process voice input when transcript changes
  useEffect(() => {
    if (!transcript || isProcessingVoice) return;
    
    setIsProcessingVoice(true);
    
    try {
      // Parse the transcript to extract expense details
      // Example format: "spent 500 on groceries yesterday" or "earned 1000 from salary today"
      const lowerTranscript = transcript.toLowerCase();
      
      // Try to determine transaction type
      if (lowerTranscript.includes('spent') || lowerTranscript.includes('paid') || lowerTranscript.includes('bought')) {
        setType('expense');
      } else if (lowerTranscript.includes('earned') || lowerTranscript.includes('received') || lowerTranscript.includes('got')) {
        setType('income');
      }
      
      // Try to extract amount
      const amountRegex = /\d+(\.\d+)?/;
      const amountMatch = lowerTranscript.match(amountRegex);
      if (amountMatch && amountMatch[0]) {
        setAmount(amountMatch[0]);
      }
      
      // Set description based on the transcript
      // Remove amount and type indicators for cleaner description
      let processedDescription = transcript
        .replace(/spent|paid|bought|earned|received|got/gi, '')
        .replace(/\d+(\.\d+)?/g, '')
        .replace(/on|for|from/gi, '')
        .replace(/yesterday|today|tomorrow/gi, '')
        .trim();
      
      // If description is still too generic, use the full transcript
      if (processedDescription.length < 5) {
        processedDescription = transcript;
      }
      
      setDescription(processedDescription);
      
      // Try to match category based on keywords
      const matchedCategory = filteredCategories.find(category => 
        lowerTranscript.includes(category.name.toLowerCase())
      );
      
      if (matchedCategory) {
        setCategoryId(matchedCategory.id);
      }
      
      // Try to set date if mentioned
      if (lowerTranscript.includes('yesterday')) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        setDate(yesterday.toISOString().split('T')[0]);
      } else if (lowerTranscript.includes('tomorrow')) {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        setDate(tomorrow.toISOString().split('T')[0]);
      } else {
        // Default to today
        setDate(new Date().toISOString().split('T')[0]);
      }
      
      toast({
        title: "Voice input processed",
        description: "Please review and adjust the details if needed.",
      });
    } catch (error) {
      console.error('Error processing voice input:', error);
      toast({
        variant: "destructive",
        title: "Failed to process voice input",
        description: "Please try again or enter details manually.",
      });
    } finally {
      setIsProcessingVoice(false);
      resetTranscript();
    }
  }, [transcript, filteredCategories, resetTranscript]);
  
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
      date: dateObj,
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
        
        {/* Voice Input Control */}
        {isSupported && (
          <div className="mb-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium mb-1">Voice Input</h3>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  {isListening 
                    ? "Say something like \"spent 500 on groceries yesterday\"..." 
                    : "Tap the microphone and speak to add a transaction"}
                </p>
              </div>
              <Button
                type="button"
                size="icon"
                variant={isListening ? "destructive" : "outline"}
                onClick={isListening ? stopListening : startListening}
                disabled={isProcessingVoice}
                className="h-12 w-12 rounded-full"
              >
                {isListening ? (
                  <MicOff className="h-6 w-6" />
                ) : isProcessingVoice ? (
                  <Loader2 className="h-6 w-6 animate-spin" />
                ) : (
                  <Mic className="h-6 w-6" />
                )}
              </Button>
            </div>
            
            {transcript && (
              <div className="mt-2 p-3 bg-primary/10 rounded-md">
                <p className="text-sm">{transcript}</p>
              </div>
            )}
            
            {voiceError && (
              <div className="mt-2 p-3 bg-destructive/10 rounded-md">
                <p className="text-sm text-destructive">{voiceError}</p>
              </div>
            )}
          </div>
        )}

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
