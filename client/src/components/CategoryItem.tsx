import { useState } from 'react';
import { Category } from '@shared/schema';
import { useExpense } from '../context/ExpenseContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface CategoryItemProps {
  category: Category;
}

const CategoryItem = ({ category }: CategoryItemProps) => {
  const { deleteCategory, updateCategory } = useExpense();
  const { toast } = useToast();
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editedName, setEditedName] = useState(category.name);
  const [editedDescription, setEditedDescription] = useState(category.description || '');
  
  const handleDelete = () => {
    deleteCategory(category.id);
    toast({
      title: "Category deleted",
      description: `${category.name} has been deleted.`,
    });
  };
  
  const handleEdit = () => {
    if (!editedName.trim()) {
      toast({
        variant: "destructive",
        title: "Invalid name",
        description: "Category name cannot be empty",
      });
      return;
    }
    
    updateCategory({
      ...category,
      name: editedName,
      description: editedDescription,
    });
    
    setIsEditOpen(false);
    toast({
      title: "Category updated",
      description: `${category.name} has been updated to ${editedName}.`,
    });
  };
  
  const bgColorClass = category.type === 'expense' 
    ? 'bg-danger/10 text-danger' 
    : 'bg-success/10 text-success';
  
  return (
    <>
      <div className="glass-card rounded-lg p-4 mb-3 flex items-center justify-between">
        <div className="flex items-center">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${bgColorClass} mr-3`}>
            <i className={category.icon}></i>
          </div>
          <div>
            <h3 className="font-medium text-sm">{category.name}</h3>
            <p className="text-xs opacity-60">{category.description}</p>
          </div>
        </div>
        <div className="flex">
          <button 
            className="w-8 h-8 flex items-center justify-center rounded-full bg-white/20 dark:bg-neutral-700/20 mr-2"
            onClick={() => setIsEditOpen(true)}
          >
            <i className="ri-pencil-line"></i>
          </button>
          <button 
            className="w-8 h-8 flex items-center justify-center rounded-full bg-white/20 dark:bg-neutral-700/20"
            onClick={handleDelete}
          >
            <i className="ri-delete-bin-line text-danger"></i>
          </button>
        </div>
      </div>
      
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Category</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Name</label>
              <Input 
                value={editedName} 
                onChange={(e) => setEditedName(e.target.value)} 
                placeholder="Category name"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <Input 
                value={editedDescription} 
                onChange={(e) => setEditedDescription(e.target.value)} 
                placeholder="Short description"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>Cancel</Button>
            <Button onClick={handleEdit}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CategoryItem;
