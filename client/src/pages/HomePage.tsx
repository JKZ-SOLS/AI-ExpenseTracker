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
        
        {/* Balance Card */}
        <div className="glass-card rounded-xl p-6 mb-6 relative overflow-hidden bg-primary bg-opacity-10 border border-primary/20">
          <div className="absolute -right-6 -top-4 w-28 h-28 bg-primary rounded-full opacity-10"></div>
          <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-secondary rounded-full opacity-5"></div>
          
          <h2 className="text-sm font-medium opacity-80 mb-1">Current Balance</h2>
          <div className="flex items-end">
            <span className="text-3xl font-bold">{formatCurrency(balance, settings.currency)}</span>
            <span className="text-sm ml-2 mb-1 opacity-60">{settings.currency}</span>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mt-6">
            <div>
              <p className="text-xs opacity-70 mb-1">Income</p>
              <div className="flex items-center">
                <i className="ri-arrow-up-circle-fill text-success mr-1"></i>
                <span className="text-lg font-semibold text-success">{formatCurrency(monthlyIncome, settings.currency)}</span>
              </div>
            </div>
            <div>
              <p className="text-xs opacity-70 mb-1">Expenses</p>
              <div className="flex items-center">
                <i className="ri-arrow-down-circle-fill text-danger mr-1"></i>
                <span className="text-lg font-semibold text-danger">{formatCurrency(monthlyExpenses, settings.currency)}</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Quick Actions */}
        <div className="flex justify-between mb-6">
          <Link href="/add-transaction?type=expense">
            <a className="flex flex-col items-center p-2 bg-white/10 dark:bg-neutral-700/20 rounded-lg w-[30%]">
              <div className="w-10 h-10 rounded-full flex items-center justify-center bg-primary/20 mb-1">
                <i className="ri-add-line text-primary text-lg"></i>
              </div>
              <span className="text-xs">Add Expense</span>
            </a>
          </Link>
          <Link href="/add-transaction?type=income">
            <a className="flex flex-col items-center p-2 bg-white/10 dark:bg-neutral-700/20 rounded-lg w-[30%]">
              <div className="w-10 h-10 rounded-full flex items-center justify-center bg-success/20 mb-1">
                <i className="ri-money-dollar-circle-line text-success text-lg"></i>
              </div>
              <span className="text-xs">Add Income</span>
            </a>
          </Link>
          <Link href="/stats">
            <a className="flex flex-col items-center p-2 bg-white/10 dark:bg-neutral-700/20 rounded-lg w-[30%]">
              <div className="w-10 h-10 rounded-full flex items-center justify-center bg-secondary/20 mb-1">
                <i className="ri-pie-chart-line text-secondary text-lg"></i>
              </div>
              <span className="text-xs">View Stats</span>
            </a>
          </Link>
        </div>
        
        {/* Recent Transactions */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-semibold">Recent Transactions</h2>
            <Link href="/stats">
              <a className="text-xs text-primary">View All</a>
            </Link>
          </div>
          
          {recentTransactions.length > 0 ? (
            recentTransactions.map(transaction => (
              <TransactionItem key={transaction.id} transaction={transaction} />
            ))
          ) : (
            <div className="glass-card rounded-lg p-6 text-center">
              <p className="text-sm opacity-70">No transactions yet</p>
              <Link href="/add-transaction">
                <a className="text-primary text-sm mt-2 block">Add your first transaction</a>
              </Link>
            </div>
          )}
        </div>
        
        {/* Monthly Spending by Category */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-semibold">Monthly Spending</h2>
            <Link href="/stats">
              <a className="text-xs text-primary">See Details</a>
            </Link>
          </div>
          
          <div className="glass-card rounded-lg p-4">
            {topCategories.length > 0 ? (
              topCategories.map(category => {
                const percentage = monthlyExpenses > 0 
                  ? Math.round((category.total / monthlyExpenses) * 100) 
                  : 0;
                
                return (
                  <div key={category.id} className="flex items-center justify-between mb-3 last:mb-0">
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center bg-danger/10 mr-3">
                        <i className={category.icon + ' text-danger'}></i>
                      </div>
                      <span className="text-sm">{category.name}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-semibold">{formatCurrency(category.total, settings.currency)}</span>
                      <div className="text-xs opacity-60">{percentage}%</div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-3">
                <p className="text-sm opacity-70">No expense data available</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
