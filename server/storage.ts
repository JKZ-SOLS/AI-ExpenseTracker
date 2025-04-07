import { Category, Transaction, Settings, Reminder, InsertCategory, InsertTransaction, InsertSettings, InsertReminder } from '@shared/schema';

// Storage interface
export interface IStorage {
  // Categories
  getCategories(): Promise<Category[]>;
  getCategory(id: number): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;
  updateCategory(id: number, category: Partial<Category>): Promise<Category>;
  deleteCategory(id: number): Promise<void>;
  
  // Transactions
  getTransactions(): Promise<Transaction[]>;
  getTransaction(id: number): Promise<Transaction | undefined>;
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  updateTransaction(id: number, transaction: Partial<Transaction>): Promise<Transaction>;
  deleteTransaction(id: number): Promise<void>;
  
  // Settings
  getSettings(id: number): Promise<Settings | undefined>;
  updateSettings(id: number, settings: Partial<Settings>): Promise<Settings>;
  
  // Reminders
  getReminders(): Promise<Reminder[]>;
  getReminder(id: number): Promise<Reminder | undefined>;
  createReminder(reminder: InsertReminder): Promise<Reminder>;
  updateReminder(id: number, reminder: Partial<Reminder>): Promise<Reminder>;
  deleteReminder(id: number): Promise<void>;
}

export class MemStorage implements IStorage {
  private categories: Map<number, Category>;
  private transactions: Map<number, Transaction>;
  private settingsMap: Map<number, Settings>;
  private remindersMap: Map<number, Reminder>;
  private categoryId: number;
  private transactionId: number;
  private reminderId: number;
  
  constructor() {
    this.categories = new Map();
    this.transactions = new Map();
    this.settingsMap = new Map();
    this.remindersMap = new Map();
    this.categoryId = 1;
    this.transactionId = 1;
    this.reminderId = 1;
    
    // Initialize with default categories
    const defaultCategories: InsertCategory[] = [
      { name: 'Groceries', type: 'expense', icon: 'ri-shopping-basket-2-line', description: 'Essential items' },
      { name: 'Transport', type: 'expense', icon: 'ri-car-line', description: 'Fuel, fare, maintenance' },
      { name: 'Dining', type: 'expense', icon: 'ri-restaurant-line', description: 'Restaurants, takeout' },
      { name: 'Salary', type: 'income', icon: 'ri-briefcase-line', description: 'Regular employment' },
      { name: 'Investments', type: 'income', icon: 'ri-bank-line', description: 'Returns & dividends' },
    ];
    
    defaultCategories.forEach(category => {
      this.createCategory(category);
    });
    
    // Initialize with default settings
    this.settingsMap.set(1, {
      id: 1,
      currency: 'PKR',
      darkMode: 0,
      fingerprintEnabled: 1,
      pin: '1234',
      reminderEnabled: 1,
      reminderTime: '20:00'
    });
    
    // Initialize with default reminder for daily expense tracking
    this.remindersMap.set(1, {
      id: 1,
      title: 'Daily Expense Reminder',
      message: 'Don\'t forget to log your expenses for today!',
      time: '20:00',
      isActive: 1,
      lastTriggered: new Date()
    });
  }
  
  // Categories
  async getCategories(): Promise<Category[]> {
    return Array.from(this.categories.values());
  }
  
  async getCategory(id: number): Promise<Category | undefined> {
    return this.categories.get(id);
  }
  
  async createCategory(category: InsertCategory): Promise<Category> {
    const id = this.categoryId++;
    const newCategory: Category = { 
      ...category, 
      id,
      description: category.description ?? null,
      icon: category.icon || 'default',
      color: category.color ?? null
    };
    this.categories.set(id, newCategory);
    return newCategory;
  }
  
  async updateCategory(id: number, categoryUpdate: Partial<Category>): Promise<Category> {
    const category = this.categories.get(id);
    if (!category) {
      throw new Error(`Category with id ${id} not found`);
    }
    
    const updatedCategory: Category = { ...category, ...categoryUpdate };
    this.categories.set(id, updatedCategory);
    return updatedCategory;
  }
  
  async deleteCategory(id: number): Promise<void> {
    if (!this.categories.has(id)) {
      throw new Error(`Category with id ${id} not found`);
    }
    
    this.categories.delete(id);
  }
  
  // Transactions
  async getTransactions(): Promise<Transaction[]> {
    return Array.from(this.transactions.values());
  }
  
  async getTransaction(id: number): Promise<Transaction | undefined> {
    return this.transactions.get(id);
  }
  
  async createTransaction(transaction: InsertTransaction): Promise<Transaction> {
    const id = this.transactionId++;
    const newTransaction: Transaction = { 
      ...transaction, 
      id,
      date: transaction.date || new Date()
    };
    this.transactions.set(id, newTransaction);
    return newTransaction;
  }
  
  async updateTransaction(id: number, transactionUpdate: Partial<Transaction>): Promise<Transaction> {
    const transaction = this.transactions.get(id);
    if (!transaction) {
      throw new Error(`Transaction with id ${id} not found`);
    }
    
    const updatedTransaction: Transaction = { ...transaction, ...transactionUpdate };
    this.transactions.set(id, updatedTransaction);
    return updatedTransaction;
  }
  
  async deleteTransaction(id: number): Promise<void> {
    if (!this.transactions.has(id)) {
      throw new Error(`Transaction with id ${id} not found`);
    }
    
    this.transactions.delete(id);
  }
  
  // Settings
  async getSettings(id: number): Promise<Settings | undefined> {
    return this.settingsMap.get(id);
  }
  
  async updateSettings(id: number, settingsUpdate: Partial<Settings>): Promise<Settings> {
    const settings = this.settingsMap.get(id);
    if (!settings) {
      throw new Error(`Settings with id ${id} not found`);
    }
    
    const updatedSettings: Settings = { ...settings, ...settingsUpdate };
    this.settingsMap.set(id, updatedSettings);
    return updatedSettings;
  }
  
  // Reminders
  async getReminders(): Promise<Reminder[]> {
    return Array.from(this.remindersMap.values());
  }
  
  async getReminder(id: number): Promise<Reminder | undefined> {
    return this.remindersMap.get(id);
  }
  
  async createReminder(reminder: InsertReminder): Promise<Reminder> {
    const id = this.reminderId++;
    const newReminder: Reminder = { 
      ...reminder, 
      id, 
      lastTriggered: null,
      isActive: reminder.isActive ?? 1 
    };
    this.remindersMap.set(id, newReminder);
    return newReminder;
  }
  
  async updateReminder(id: number, reminderUpdate: Partial<Reminder>): Promise<Reminder> {
    const reminder = this.remindersMap.get(id);
    if (!reminder) {
      throw new Error(`Reminder with id ${id} not found`);
    }
    
    const updatedReminder: Reminder = { ...reminder, ...reminderUpdate };
    this.remindersMap.set(id, updatedReminder);
    return updatedReminder;
  }
  
  async deleteReminder(id: number): Promise<void> {
    if (!this.remindersMap.has(id)) {
      throw new Error(`Reminder with id ${id} not found`);
    }
    
    this.remindersMap.delete(id);
  }
}

export const storage = new MemStorage();
