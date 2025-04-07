import { Transaction } from '@shared/schema';
import { format } from 'date-fns';
import { useMemo, useState } from 'react';
import { useExpense } from '../context/ExpenseContext';
import { formatCurrency } from '../lib/utils';
import { useAuth } from '../context/AuthContext';
import { 
  Pencil, Trash2, DollarSign, ShoppingBag, 
  Coffee, Utensils, Home, Car, Stethoscope, Smartphone,
  CreditCard, Gift, Briefcase, Users, Plane, Gamepad2
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface TransactionItemProps {
  transaction: Transaction;
}

const TransactionItem = ({ transaction }: TransactionItemProps) => {
  const { categories, updateTransaction, deleteTransaction } = useExpense();
  const { settings } = useAuth();
  const { toast } = useToast();
  const [showActions, setShowActions] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  
  const category = useMemo(() => {
    return categories.find(c => c.id === transaction.categoryId);
  }, [categories, transaction.categoryId]);
  
  const amountPrefix = transaction.type === 'expense' ? '- ' : '+ ';
  
  // Function to get the icon based on category name
  const getCategoryIcon = () => {
    if (!category) {
      return transaction.type === 'expense' ? <ShoppingBag size={18} /> : <DollarSign size={18} />;
    }
    
    const categoryName = category.name.toLowerCase();
    
    if (transaction.type === 'income') {
      return <DollarSign size={18} />;
    }
    
    // Return different icons based on category name
    if (categoryName.includes('food') || categoryName.includes('restaurant') || categoryName.includes('dining')) {
      return <Utensils size={18} />;
    } else if (categoryName.includes('coffee') || categoryName.includes('cafe')) {
      return <Coffee size={18} />;
    } else if (categoryName.includes('home') || categoryName.includes('rent') || categoryName.includes('house')) {
      return <Home size={18} />;
    } else if (categoryName.includes('car') || categoryName.includes('transport') || categoryName.includes('gas')) {
      return <Car size={18} />;
    } else if (categoryName.includes('health') || categoryName.includes('medical') || categoryName.includes('doctor')) {
      return <Stethoscope size={18} />;
    } else if (categoryName.includes('phone') || categoryName.includes('mobile') || categoryName.includes('tech')) {
      return <Smartphone size={18} />;
    } else if (categoryName.includes('entertainment') || categoryName.includes('game')) {
      return <Gamepad2 size={18} />;
    } else if (categoryName.includes('gift') || categoryName.includes('present')) {
      return <Gift size={18} />;
    } else if (categoryName.includes('travel') || categoryName.includes('vacation')) {
      return <Plane size={18} />;
    } else if (categoryName.includes('credit') || categoryName.includes('bill') || categoryName.includes('payment')) {
      return <CreditCard size={18} />;
    } else if (categoryName.includes('work') || categoryName.includes('business')) {
      return <Briefcase size={18} />;
    } else if (categoryName.includes('family') || categoryName.includes('friend') || categoryName.includes('social')) {
      return <Users size={18} />;
    }
    
    // Default to shopping bag if no match
    return <ShoppingBag size={18} />;
  };
  
  const handleEditClick = () => {
    // This would navigate to the edit transaction page with the transaction ID
    window.location.href = `/add-transaction?edit=${transaction.id}`;
  };

  const handleDeleteClick = () => {
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    try {
      await deleteTransaction(transaction.id);
      toast({
        title: "Transaction deleted",
        description: "The transaction has been removed successfully.",
      });
      setShowDeleteDialog(false);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete the transaction. Please try again.",
      });
    }
  };
  
  return (
    <>
      <div 
        className="transaction-item"
        onClick={() => setShowActions(!showActions)}
      >
        <div className="flex items-center">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center bg-[#126611] mr-3 ${transaction.type === 'expense' ? 'text-red-400' : 'text-[#4dff34]'}`}>
            {getCategoryIcon()}
          </div>
          <div>
            <h3 className="font-medium text-sm text-white">{transaction.description}</h3>
            <p className="text-xs text-white/60">
              {format(new Date(transaction.date), 'MMM dd, yyyy')} · {format(new Date(transaction.date), 'hh:mm a')}
            </p>
          </div>
        </div>
        <div className="flex items-center">
          <span className={`font-semibold mr-2 ${transaction.type === 'expense' ? 'expense-amount' : 'income-amount'}`}>
            {amountPrefix}{formatCurrency(transaction.amount, settings.currency)}
          </span>
          {showActions && (
            <div className="flex space-x-2">
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  handleEditClick();
                }}
                className="p-1 bg-[#126611] rounded-full text-[#4dff34]"
              >
                <Pencil size={14} />
              </button>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteClick();
                }}
                className="p-1 bg-[#126611] rounded-full text-red-400"
              >
                <Trash2 size={14} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="bg-black border border-[#126611]/50">
          <DialogHeader>
            <DialogTitle className="text-white">Confirm Deletion</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-white/80">Are you sure you want to delete this transaction? This action cannot be undone.</p>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowDeleteDialog(false)}
              className="border-[#126611]/70 text-white"
            >
              Cancel
            </Button>
            <Button 
              onClick={confirmDelete}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default TransactionItem;
