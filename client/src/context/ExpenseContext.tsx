import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Transaction, Category, InsertTransaction, InsertCategory } from '@shared/schema';
import { apiRequest } from '../lib/queryClient';

interface ExpenseContextType {
  transactions: Transaction[];
  categories: Category[];
  balance: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  addTransaction: (transaction: InsertTransaction) => Promise<Transaction>;
  updateTransaction: (transaction: Transaction) => Promise<Transaction>;
  deleteTransaction: (id: number) => Promise<void>;
  addCategory: (category: InsertCategory) => Promise<Category>;
  updateCategory: (category: Category) => Promise<Category>;
  deleteCategory: (id: number) => Promise<void>;
}

const ExpenseContext = createContext<ExpenseContextType | undefined>(undefined);

export const ExpenseProvider = ({ children }: { children: ReactNode }) => {
  // Use a default currency setting directly
  const [currencySetting, setCurrencySetting] = useState('PKR');
  
  // Try to load currency from localStorage if available
  useEffect(() => {
    try {
      const settingsStr = localStorage.getItem('settings');
      if (settingsStr) {
        const settings = JSON.parse(settingsStr);
        setCurrencySetting(settings.currency || 'PKR');
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  }, []);
  
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const savedTransactions = localStorage.getItem('transactions');
    return savedTransactions ? JSON.parse(savedTransactions) : [];
  });
  
  const [categories, setCategories] = useState<Category[]>(() => {
    const savedCategories = localStorage.getItem('categories');
    if (savedCategories) {
      return JSON.parse(savedCategories);
    }
    
    // Default categories if none are saved
    return [
      { id: 1, name: 'Groceries', type: 'expense', icon: 'ri-shopping-basket-2-line', description: 'Essential items' },
      { id: 2, name: 'Transport', type: 'expense', icon: 'ri-car-line', description: 'Fuel, fare, maintenance' },
      { id: 3, name: 'Dining', type: 'expense', icon: 'ri-restaurant-line', description: 'Restaurants, takeout' },
      { id: 4, name: 'Salary', type: 'income', icon: 'ri-briefcase-line', description: 'Regular employment' },
      { id: 5, name: 'Investments', type: 'income', icon: 'ri-bank-line', description: 'Returns & dividends' },
    ];
  });
  
  // Auto-save to localStorage
  useEffect(() => {
    localStorage.setItem('transactions', JSON.stringify(transactions));
  }, [transactions]);
  
  useEffect(() => {
    localStorage.setItem('categories', JSON.stringify(categories));
  }, [categories]);
  
  // Calculate balance
  const balance = transactions.reduce((sum, t) => {
    return t.type === 'income' ? sum + t.amount : sum - t.amount;
  }, 0);
  
  // Calculate monthly income and expenses
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  
  const monthlyIncome = transactions
    .filter(t => {
      const date = new Date(t.date);
      return t.type === 'income' && 
            date.getMonth() === currentMonth && 
            date.getFullYear() === currentYear;
    })
    .reduce((sum, t) => sum + t.amount, 0);
  
  const monthlyExpenses = transactions
    .filter(t => {
      const date = new Date(t.date);
      return t.type === 'expense' && 
            date.getMonth() === currentMonth && 
            date.getFullYear() === currentYear;
    })
    .reduce((sum, t) => sum + t.amount, 0);
  
  // Transaction CRUD operations
  const addTransaction = async (transaction: InsertTransaction): Promise<Transaction> => {
    try {
      const response = await apiRequest('POST', '/api/transactions', transaction);
      const newTransaction: Transaction = await response.json();
      setTransactions(prev => [newTransaction, ...prev].sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      ));
      return newTransaction;
    } catch (error) {
      // Fallback to client-side only if API call fails
      const newTransaction: Transaction = {
        ...transaction,
        id: transactions.length > 0 ? Math.max(...transactions.map(t => t.id)) + 1 : 1,
        date: transaction.date || new Date(), // Ensure date is never undefined
      };
      setTransactions(prev => [newTransaction, ...prev].sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      ));
      return newTransaction;
    }
  };
  
  const updateTransaction = async (transaction: Transaction): Promise<Transaction> => {
    try {
      const response = await apiRequest('PATCH', `/api/transactions/${transaction.id}`, transaction);
      const updatedTransaction: Transaction = await response.json();
      setTransactions(prev => prev.map(t => 
        t.id === transaction.id ? updatedTransaction : t
      ));
      return updatedTransaction;
    } catch (error) {
      // Fallback to client-side only
      setTransactions(prev => prev.map(t => 
        t.id === transaction.id ? transaction : t
      ));
      return transaction;
    }
  };
  
  const deleteTransaction = async (id: number): Promise<void> => {
    try {
      await apiRequest('DELETE', `/api/transactions/${id}`);
      setTransactions(prev => prev.filter(t => t.id !== id));
    } catch (error) {
      // Fallback to client-side only
      setTransactions(prev => prev.filter(t => t.id !== id));
    }
  };
  
  // Category CRUD operations
  const addCategory = async (category: InsertCategory): Promise<Category> => {
    try {
      const response = await apiRequest('POST', '/api/categories', category);
      const newCategory: Category = await response.json();
      setCategories(prev => [...prev, newCategory]);
      return newCategory;
    } catch (error) {
      // Fallback to client-side only
      const newCategory: Category = {
        ...category,
        id: categories.length > 0 ? Math.max(...categories.map(c => c.id)) + 1 : 1,
        description: category.description || null,
        icon: category.icon || "ri-file-list-line",
      };
      setCategories(prev => [...prev, newCategory]);
      return newCategory;
    }
  };
  
  const updateCategory = async (category: Category): Promise<Category> => {
    try {
      const response = await apiRequest('PATCH', `/api/categories/${category.id}`, category);
      const updatedCategory: Category = await response.json();
      setCategories(prev => prev.map(c => 
        c.id === category.id ? updatedCategory : c
      ));
      return updatedCategory;
    } catch (error) {
      // Fallback to client-side only
      setCategories(prev => prev.map(c => 
        c.id === category.id ? category : c
      ));
      return category;
    }
  };
  
  const deleteCategory = async (id: number): Promise<void> => {
    try {
      await apiRequest('DELETE', `/api/categories/${id}`);
      setCategories(prev => prev.filter(c => c.id !== id));
    } catch (error) {
      // Fallback to client-side only
      setCategories(prev => prev.filter(c => c.id !== id));
    }
  };
  
  return (
    <ExpenseContext.Provider value={{
      transactions,
      categories,
      balance,
      monthlyIncome,
      monthlyExpenses,
      addTransaction,
      updateTransaction,
      deleteTransaction,
      addCategory,
      updateCategory,
      deleteCategory,
    }}>
      {children}
    </ExpenseContext.Provider>
  );
};

export const useExpense = () => {
  const context = useContext(ExpenseContext);
  if (context === undefined) {
    throw new Error('useExpense must be used within an ExpenseProvider');
  }
  return context;
};
