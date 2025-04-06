import { Link } from 'wouter';
import TransactionItem from '../components/TransactionItem';
import { useExpense } from '../context/ExpenseContext';
import { formatCurrency } from '../lib/utils';
import { useAuth } from '../context/AuthContext';

const HomePage = () => {
  const { settings } = useAuth();
  const { transactions, categories, balance, monthlyIncome, monthlyExpenses } = useExpense();
  
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
  
  return (
    <div className="min-h-screen pb-20">
      <div className="p-4 pt-12">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold">My Wallet</h1>
          <button className="w-10 h-10 rounded-full flex items-center justify-center bg-white/10 dark:bg-neutral-700/20 text-lg">
            <i className="ri-notification-3-line"></i>
          </button>
        </div>
        
        {/* Balance Card - SadaPay Style */}
        <div className="balance-card mb-6">
          <h2 className="text-sm font-medium text-white/80 mb-1">Current Balance</h2>
          <div className="flex items-end">
            <span className="text-4xl font-bold">{formatCurrency(balance, settings.currency)}</span>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mt-6 bg-black/20 -mx-6 -mb-6 p-4 rounded-b-2xl">
            <div>
              <p className="text-xs text-white/70 mb-1">This Month Income</p>
              <div className="flex items-center">
                <i className="ri-arrow-up-circle-fill text-[#4dff34] mr-1"></i>
                <span className="text-lg font-semibold text-[#4dff34]">{formatCurrency(monthlyIncome, settings.currency)}</span>
              </div>
            </div>
            <div>
              <p className="text-xs text-white/70 mb-1">This Month Expenses</p>
              <div className="flex items-center">
                <i className="ri-arrow-down-circle-fill text-red-400 mr-1"></i>
                <span className="text-lg font-semibold text-red-400">{formatCurrency(monthlyExpenses, settings.currency)}</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Quick Actions */}
        <div className="flex justify-between mb-6">
          <Link href="/add-transaction?type=expense" className="flex flex-col items-center p-2 bg-[#126611]/20 rounded-lg w-[30%]">
            <div className="icon-circle mb-1">
              <i className="ri-add-line text-lg"></i>
            </div>
            <span className="text-xs text-white/90">Add Expense</span>
          </Link>
          <Link href="/add-transaction?type=income" className="flex flex-col items-center p-2 bg-[#126611]/20 rounded-lg w-[30%]">
            <div className="icon-circle mb-1">
              <i className="ri-money-dollar-circle-line text-lg"></i>
            </div>
            <span className="text-xs text-white/90">Add Income</span>
          </Link>
          <Link href="/stats" className="flex flex-col items-center p-2 bg-[#126611]/20 rounded-lg w-[30%]">
            <div className="icon-circle mb-1">
              <i className="ri-pie-chart-line text-lg"></i>
            </div>
            <span className="text-xs text-white/90">View Stats</span>
          </Link>
        </div>
        
        {/* Recent Transactions */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-semibold text-white">Recent Transactions</h2>
            <Link href="/stats">
              <a className="text-xs text-[#39cc28]">View All</a>
            </Link>
          </div>
          
          {recentTransactions.length > 0 ? (
            <div className="rounded-lg bg-[#126611]/10 border border-[#126611]/20">
              {recentTransactions.map(transaction => (
                <TransactionItem key={transaction.id} transaction={transaction} />
              ))}
            </div>
          ) : (
            <div className="rounded-lg p-6 text-center bg-[#126611]/10 border border-[#126611]/20">
              <p className="text-sm text-white/70">No transactions yet</p>
              <Link href="/add-transaction">
                <a className="text-[#39cc28] text-sm mt-2 block">Add your first transaction</a>
              </Link>
            </div>
          )}
        </div>
        
        {/* Monthly Spending by Category */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-semibold text-white">Monthly Spending</h2>
            <Link href="/stats">
              <a className="text-xs text-[#39cc28]">See Details</a>
            </Link>
          </div>
          
          <div className="rounded-lg p-4 bg-[#126611]/10 border border-[#126611]/20">
            {topCategories.length > 0 ? (
              topCategories.map(category => {
                const percentage = monthlyExpenses > 0 
                  ? Math.round((category.total / monthlyExpenses) * 100) 
                  : 0;
                
                return (
                  <div key={category.id} className="flex items-center justify-between mb-3 last:mb-0">
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center bg-[#126611]/30 mr-3">
                        <i className={category.icon + ' text-[#4dff34]'}></i>
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
