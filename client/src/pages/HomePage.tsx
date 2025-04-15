import { Link } from 'wouter';
import TransactionItem from '../components/TransactionItem';
import { useExpense } from '../context/ExpenseContext';
import { formatCurrency } from '../lib/utils';
import { useAuth } from '../context/AuthContext';
import { Plus, ArrowUpCircle, ArrowDownCircle, DollarSign, PieChart, Bell, ShoppingBag } from 'lucide-react';
import { useTips } from '../context/TipsContext';



const HomePage = () => {
  const { settings } = useAuth();
  const { transactions, categories, balance, monthlyIncome, monthlyExpenses } = useExpense();
  const { showRandomTip, showCustomTip } = useTips();
  
  // Helper function to determine the size class based on the balance amount length
  const getBalanceSizeClass = (balance: number, currency: string): string => {
    const formattedBalance = formatCurrency(balance, currency);
    const length = formattedBalance.length;
    
    if (length > 12) {
      return 'text-sm'; // Smallest font for very large numbers
    } else if (length > 8) {
      return 'text-md'; // Medium font for moderately large numbers
    } else {
      return 'text-lg'; // Largest font for small numbers
    }
  };
  
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
    
  // Handle AI tip button click
  const handleTipClick = () => {
    // Custom AI tips based on user's data
    const customTips = [
      {
        title: "Spending Pattern Detected",
        message: "Your weekend spending is typically 40% higher than weekday spending. Consider planning weekend activities in advance.",
        type: "insight" as const,
        notificationType: "info" as const
      },
      {
        title: "Budget Alert",
        message: `You've spent ${formatCurrency(monthlyExpenses, settings.currency)} this month, which is ${monthlyIncome > 0 ? Math.round((monthlyExpenses / monthlyIncome) * 100) : 0}% of your income.`,
        type: "spending" as const,
        notificationType: "warning" as const
      },
      {
        title: "AI Suggestion",
        message: topCategories.length > 0 
          ? `Your highest spending category is ${topCategories[0].name}. Consider setting a specific budget for this category.`
          : "Start categorizing your expenses to get personalized insights.",
        type: "insight" as const,
        notificationType: "success" as const
      }
    ];
    
    // Show a random AI tip
    const randomTip = customTips[Math.floor(Math.random() * customTips.length)];
    showCustomTip(randomTip);
  };
  
  return (
    <div className="min-h-screen pb-20">
      <div className="p-4 pt-12">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold">My Wallet</h1>
          <button 
            onClick={handleTipClick}
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
              <div className="w-full">
                <h2 className="text-sm font-medium opacity-80 mb-1">Cash Balance</h2>
                <div className="w-full overflow-hidden">
                  <span className={`font-bold balance-amount ${getBalanceSizeClass(balance, settings.currency)}`}>
                    {formatCurrency(balance, settings.currency)}
                  </span>
                </div>
              </div>
              <div className="w-8 h-8 bg-[#00A226]/20 rounded-full flex items-center justify-center flex-shrink-0 ml-2">
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
            <Link href="/add-transaction?type=expense" className="mini-card" style={{ textDecoration: "none" }}>
              <p className="text-xs opacity-80 mb-1 ">Monthly Expenses</p>
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
