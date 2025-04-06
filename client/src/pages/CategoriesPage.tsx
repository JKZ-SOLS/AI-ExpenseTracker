import { useState } from 'react';
import CategoryItem from '../components/CategoryItem';
import { useExpense } from '../context/ExpenseContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

const CategoriesPage = () => {
  const { categories, addCategory } = useExpense();
  const { toast } = useToast();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newType, setNewType] = useState<'expense' | 'income'>('expense');
  const [newIcon, setNewIcon] = useState('ri-shopping-basket-2-line');
  
  const expenseCategories = categories.filter(c => c.type === 'expense');
  const incomeCategories = categories.filter(c => c.type === 'income');
  
  const handleAddCategory = () => {
    if (!newName.trim()) {
      toast({
        variant: "destructive",
        title: "Invalid name",
        description: "Category name cannot be empty",
      });
      return;
    }
    
    addCategory({
      name: newName,
      type: newType,
      icon: newIcon,
      description: newDescription,
    });
    
    // Reset form
    setNewName('');
    setNewDescription('');
    setNewType('expense');
    setNewIcon('ri-shopping-basket-2-line');
    setIsAddOpen(false);
    
    toast({
      title: "Category added",
      description: `${newName} has been added to your categories.`,
    });
  };
  
  const iconOptions = [
    { value: 'ri-shopping-basket-2-line', label: 'Groceries' },
    { value: 'ri-car-line', label: 'Transport' },
    { value: 'ri-restaurant-line', label: 'Dining' },
    { value: 'ri-home-line', label: 'Housing' },
    { value: 'ri-medicine-bottle-line', label: 'Health' },
    { value: 'ri-briefcase-line', label: 'Salary' },
    { value: 'ri-bank-line', label: 'Investments' },
    { value: 'ri-gift-line', label: 'Gifts' },
    { value: 'ri-game-line', label: 'Entertainment' },
    { value: 'ri-shirt-line', label: 'Clothing' },
    { value: 'ri-tools-line', label: 'Services' },
    { value: 'ri-file-list-line', label: 'Others' },
  ];
  
  return (
    <div className="min-h-screen pb-20">
      <div className="p-4 pt-12">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold">Categories</h1>
          <button 
            className="h-10 w-10 rounded-full flex items-center justify-center bg-primary text-white"
            onClick={() => setIsAddOpen(true)}
          >
            <i className="ri-add-line"></i>
          </button>
        </div>
        
        {/* Expense Categories */}
        <div className="mb-6">
          <h2 className="font-semibold mb-4">Expense Categories</h2>
          
          {expenseCategories.length > 0 ? (
            expenseCategories.map(category => (
              <CategoryItem key={category.id} category={category} />
            ))
          ) : (
            <div className="glass-card rounded-lg p-6 text-center">
              <p className="text-sm opacity-70">No expense categories yet</p>
              <button 
                className="text-primary text-sm mt-2"
                onClick={() => {
                  setNewType('expense');
                  setIsAddOpen(true);
                }}
              >
                Add your first expense category
              </button>
            </div>
          )}
        </div>
        
        {/* Income Categories */}
        <div className="mb-6">
          <h2 className="font-semibold mb-4">Income Categories</h2>
          
          {incomeCategories.length > 0 ? (
            incomeCategories.map(category => (
              <CategoryItem key={category.id} category={category} />
            ))
          ) : (
            <div className="glass-card rounded-lg p-6 text-center">
              <p className="text-sm opacity-70">No income categories yet</p>
              <button 
                className="text-primary text-sm mt-2"
                onClick={() => {
                  setNewType('income');
                  setIsAddOpen(true);
                }}
              >
                Add your first income category
              </button>
            </div>
          )}
        </div>
      </div>
      
      {/* Add Category Dialog */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Category</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Category Type</label>
              <Select 
                value={newType} 
                onValueChange={(value) => setNewType(value as 'expense' | 'income')}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="expense">Expense</SelectItem>
                  <SelectItem value="income">Income</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Name</label>
              <Input 
                value={newName} 
                onChange={(e) => setNewName(e.target.value)} 
                placeholder="Category name"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <Input 
                value={newDescription} 
                onChange={(e) => setNewDescription(e.target.value)} 
                placeholder="Short description"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Icon</label>
              <Select value={newIcon} onValueChange={setNewIcon}>
                <SelectTrigger>
                  <SelectValue>
                    <div className="flex items-center">
                      <i className={`${newIcon} mr-2`}></i>
                      <span>
                        {iconOptions.find(option => option.value === newIcon)?.label || 'Select icon'}
                      </span>
                    </div>
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {iconOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex items-center">
                        <i className={`${option.value} mr-2`}></i>
                        <span>{option.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddOpen(false)}>Cancel</Button>
            <Button onClick={handleAddCategory}>Add Category</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CategoriesPage;
