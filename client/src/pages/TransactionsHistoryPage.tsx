import { useState } from 'react';
import { useExpense } from '../context/ExpenseContext';
import TransactionItem from '../components/TransactionItem';
import { ArrowLeft } from 'lucide-react';
import { useLocation } from 'wouter';

const TransactionsHistoryPage = () => {
  const [location, setLocation] = useLocation();
  const { transactions } = useExpense();
  const [filter, setFilter] = useState<'all' | 'income' | 'expense'>('all');
  
  // Filter transactions by type
  const filteredTransactions = transactions.filter(transaction => {
    if (filter === 'all') return true;
    return transaction.type === filter;
  });
  
  // Sort transactions by date (newest first)
  const sortedTransactions = [...filteredTransactions].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <div className="min-h-screen pb-20">
      <div className="p-4 pt-12">
        <div className="flex items-center mb-6">
          <button 
            onClick={() => setLocation('/')}
            className="mr-4 w-10 h-10 rounded-full flex items-center justify-center bg-[#00A226]/20"
          >
            <ArrowLeft size={20} className="text-[#00D632]" />
          </button>
          <h1 className="text-2xl font-semibold">Transaction History</h1>
        </div>
        
        {/* Filter Buttons */}
        <div className="flex gap-3 mb-6">
          <button 
            className={`px-4 py-2 rounded-lg text-sm ${filter === 'all' ? 'bg-[#00A226] text-black' : 'bg-[#00A226]/20 text-white'}`}
            onClick={() => setFilter('all')}
          >
            All
          </button>
          <button 
            className={`px-4 py-2 rounded-lg text-sm ${filter === 'income' ? 'bg-[#00A226] text-black' : 'bg-[#00A226]/20 text-white'}`}
            onClick={() => setFilter('income')}
          >
            Income
          </button>
          <button 
            className={`px-4 py-2 rounded-lg text-sm ${filter === 'expense' ? 'bg-[#00A226] text-black' : 'bg-[#00A226]/20 text-white'}`}
            onClick={() => setFilter('expense')}
          >
            Expense
          </button>
        </div>
        
        {/* Transactions List */}
        {sortedTransactions.length > 0 ? (
          <div className="rounded-lg bg-[#00A226]/10 border border-[#00A226]/20">
            {sortedTransactions.map(transaction => (
              <TransactionItem key={transaction.id} transaction={transaction} />
            ))}
          </div>
        ) : (
          <div className="rounded-lg p-6 text-center bg-[#00A226]/10 border border-[#00A226]/20">
            <p className="text-sm text-white/70">No transactions found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TransactionsHistoryPage;