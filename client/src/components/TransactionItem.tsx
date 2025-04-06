import { Transaction } from '@shared/schema';
import { format } from 'date-fns';
import { useMemo, useState } from 'react';
import { useExpense } from '../context/ExpenseContext';
import { formatCurrency } from '../lib/utils';
import { useAuth } from '../context/AuthContext';
import { Pencil, Trash2, DollarSign, ShoppingBag } from 'lucide-react';
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
            {transaction.type === 'expense' ? 
              <ShoppingBag size={18} /> : 
              <DollarSign size={18} />
            }
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
