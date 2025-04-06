import { Transaction } from '@shared/schema';
import { format } from 'date-fns';
import { useMemo } from 'react';
import { useExpense } from '../context/ExpenseContext';
import { formatCurrency } from '../lib/utils';
import { useAuth } from '../context/AuthContext';

interface TransactionItemProps {
  transaction: Transaction;
}

const TransactionItem = ({ transaction }: TransactionItemProps) => {
  const { categories } = useExpense();
  const { settings } = useAuth();
  
  const category = useMemo(() => {
    return categories.find(c => c.id === transaction.categoryId);
  }, [categories, transaction.categoryId]);
  
  const iconClass = useMemo(() => {
    return category?.icon || 'ri-money-dollar-circle-line';
  }, [category]);
  
  const bgColorClass = useMemo(() => {
    if (transaction.type === 'expense') {
      return 'bg-danger/10 text-danger';
    }
    return 'bg-success/10 text-success';
  }, [transaction.type]);
  
  const amountPrefix = transaction.type === 'expense' ? '- ' : '+ ';
  
  return (
    <div className="glass-card rounded-lg p-4 mb-3 flex items-center justify-between">
      <div className="flex items-center">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${bgColorClass} mr-3`}>
          <i className={iconClass}></i>
        </div>
        <div>
          <h3 className="font-medium text-sm">{transaction.description}</h3>
          <p className="text-xs opacity-60">
            {format(new Date(transaction.date), 'MMM dd, yyyy')} · {format(new Date(transaction.date), 'hh:mm a')}
          </p>
        </div>
      </div>
      <span className={`font-semibold ${transaction.type === 'expense' ? 'text-danger' : 'text-success'}`}>
        {amountPrefix}{formatCurrency(transaction.amount, settings.currency)}
      </span>
    </div>
  );
};

export default TransactionItem;
