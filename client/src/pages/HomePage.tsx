import { Link } from 'wouter';
import TransactionItem from '../components/TransactionItem';
import { useExpense } from '../context/ExpenseContext';
import { formatCurrency } from '../lib/utils';
import { useAuth } from '../context/AuthContext';
import { Plus, ArrowUpCircle, ArrowDownCircle, DollarSign, PieChart, Bell, ShoppingBag } from 'lucide-react';
import { useNotification } from '../components/ui/notification';

const HomePage = () => {
  const { settings } = useAuth();
  const { transactions, categories, balance, monthlyIncome, monthlyExpenses } = useExpense();
  const { showNotification } = useNotification();
  
  // Get latest 3 transactions
  const recentTransactions = transactions.slice(0, 3);
  
  // Get top 3 expense categories for the current month
  const topCategories = categories
    .filter(cat => cat.type === 'expense')
    .map(category => {
      const total = transactions
        .filter(t => 
          t.categoryId === category.id && 
          t.type === 'expense' && 
          new Date(t.date).getMonth() === new Date().getMonth()
        )
        .reduce((sum, t) => sum + t.amount, 0);
      
      return {
        ...category,
        total
      };
    })
    .sort((a, b) => b.total - a.total)
    .slice(0, 3);
    
  // Handle notification button click
  const handleNotificationClick = () => {
    // Example notifications
    const notificationTypes = [
      {
        title: "Daily Expense Reminder",
        message: "Don't forget to track your expenses today",
        type: "info" as const,
        duration: 5000
      },
      {
        title: "Budget Alert",
        message: "You've reached 80% of your monthly budget",
        type: "warning" as const,
        duration: 6000
      },
      {
        title: "Expense Saved",
        message: "Your transaction has been saved successfully",
        type: "success" as const,
        duration: 4000
      }
    ];
    
    // Show a random notification
    const randomNotification = notificationTypes[Math.floor(Math.random() * notificationTypes.length)];
    showNotification(randomNotification);
  };
  
  return (
    <div className="min-h-screen pb-20">
      <div className="p-4 pt-12">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold">My Wallet</h1>
          <button 
            onClick={handleNotificationClick}
            className="w-10 h-10 rounded-full flex items-center justify-center bg-[#00D632] text-white hover:bg-[#00A226] transition-colors"
          >
            <Bell size={20} />
          </button>
        </div>
        
        {/* Balance and Mini Cards Container */}
        <div className="grid grid-cols-5 gap-4 mb-6">
          {/* Balance Card - Dark with Green Text */}
          <div className="balance-card col-span-3">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-sm font-medium opacity-80 mb-1">Cash Balance</h2>
                <div className="flex items-end">
                  <span className="text-4xl font-bold">{formatCurrency(balance, settings.currency)}</span>
                </div>
              </div>
              <div className="w-8 h-8 bg-[#00A226]/20 rounded-full flex items-center justify-center">
                <DollarSign size={16} />
              </div>
            </div>
          </div>
          
          {/* Mini Cards - Green with Black Text */}
          <div className="col-span-2 flex flex-col gap-3">
            <Link href="/add-transaction?type=income" className="mini-card">
              <p className="text-xs opacity-80 mb-1">Monthly Income</p>
              <div className="flex items-center justify-between">
                <span className="text-base font-semibold">{formatCurrency(monthlyIncome, settings.currency)}</span>
                <div className="bg-black/20 rounded-full p-1">
                  <ArrowUpCircle size={16} className="text-black" />
                </div>
              </div>
              <div className="text-xs mt-1 opacity-70">Tap to add income</div>
            </Link>
            <Link href="/add-transaction?type=expense" className="mini-card">
              <p className="text-xs opacity-80 mb-1">Monthly Expenses</p>
              <div className="flex items-center justify-between">
                <span className="text-base font-semibold">{formatCurrency(monthlyExpenses, settings.currency)}</span>
                <div className="bg-black/20 rounded-full p-1">
                  <ArrowDownCircle size={16} className="text-black" />
                </div>
              </div>
              <div className="text-xs mt-1 opacity-70">Tap to add expense</div>
            </Link>
          </div>
        </div>
        
        {/* Recent Transactions */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-semibold text-white">Recent Transactions</h2>
            <Link href="/transactions-history" className="text-xs text-[#00A226]">
              View All
            </Link>
          </div>
          
          {recentTransactions.length > 0 ? (
            <div className="rounded-lg bg-[#00A226]/10 border border-[#00A226]/20">
              {recentTransactions.map(transaction => (
                <TransactionItem key={transaction.id} transaction={transaction} />
              ))}
            </div>
          ) : (
            <div className="rounded-lg p-6 text-center bg-[#00A226]/10 border border-[#00A226]/20">
              <p className="text-sm text-white/70">No transactions yet</p>
              <Link href="/add-transaction" className="text-[#00A226] text-sm mt-2 block">
                Add your first transaction
              </Link>
            </div>
          )}
        </div>
        
        {/* Monthly Spending by Category */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-semibold text-white">Monthly Spending</h2>
            <Link href="/stats" className="text-xs text-[#00A226]">
              See Details
            </Link>
          </div>
          
          <div className="rounded-lg p-4 bg-[#00A226]/10 border border-[#00A226]/20">
            {topCategories.length > 0 ? (
              topCategories.map(category => {
                const percentage = monthlyExpenses > 0 
                  ? Math.round((category.total / monthlyExpenses) * 100) 
                  : 0;
                
                return (
                  <div key={category.id} className="flex items-center justify-between mb-3 last:mb-0">
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center bg-[#00A226] mr-3">
                        <ShoppingBag size={16} className="text-black" />
                      </div>
                      <span className="text-sm text-white">{category.name}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-semibold text-white">{formatCurrency(category.total, settings.currency)}</span>
                      <div className="text-xs text-white/60">{percentage}%</div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-3">
                <p className="text-sm text-white/70">No expense data available</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
