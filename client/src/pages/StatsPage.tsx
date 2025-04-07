import { useState, useMemo } from 'react';
import { useExpense } from '../context/ExpenseContext';
import { formatCurrency } from '../lib/utils';
import { DonutChart, DonutChartData } from '../components/ui/donut-chart';
import { useAuth } from '../context/AuthContext';
import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns';

type TimeRange = 'month' | 'year';

const StatsPage = () => {
  const [timeRange, setTimeRange] = useState<TimeRange>('month');
  const { transactions, categories } = useExpense();
  const { settings } = useAuth();
  
  // Calculate totals for selected time range
  const { income, expenses, savings, savingsRate, categoryData, monthlyComparisonData } = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    let filteredTransactions = transactions;
    
    if (timeRange === 'month') {
      filteredTransactions = transactions.filter(t => {
        const date = new Date(t.date);
        return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
      });
    } else {
      filteredTransactions = transactions.filter(t => {
        const date = new Date(t.date);
        return date.getFullYear() === currentYear;
      });
    }
    
    const income = filteredTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
      
    const expenses = filteredTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const savings = income - expenses;
    const savingsRate = income > 0 ? (savings / income) * 100 : 0;
    
    // Category data for pie chart
    const categoryTotals = new Map<number, number>();
    
    filteredTransactions
      .filter(t => t.type === 'expense')
      .forEach(t => {
        const current = categoryTotals.get(t.categoryId) || 0;
        categoryTotals.set(t.categoryId, current + t.amount);
      });
    
    const categoryColors = [
      '#7209B7', '#3A0CA3', '#4361EE', '#4CC9F0', '#56CFE1', '#72EFDD'
    ];
    
    const categoryData: DonutChartData[] = Array.from(categoryTotals.entries())
      .map(([categoryId, amount], index) => {
        const category = categories.find(c => c.id === categoryId);
        return {
          name: category?.name || 'Other',
          value: amount,
          color: categoryColors[index % categoryColors.length],
        };
      })
      .sort((a, b) => b.value - a.value)
      .map(item => ({
        ...item,
        percentage: expenses > 0 ? Math.round((item.value / expenses) * 100) : 0
      }));
    
    // Monthly comparison data (for last 5 months)
    const monthlyComparisonData = [];
    for (let i = 4; i >= 0; i--) {
      const targetMonth = subMonths(now, i);
      const monthStart = startOfMonth(targetMonth);
      const monthEnd = endOfMonth(targetMonth);
      
      const monthlyExpense = transactions
        .filter(t => {
          const date = new Date(t.date);
          return t.type === 'expense' && date >= monthStart && date <= monthEnd;
        })
        .reduce((sum, t) => sum + t.amount, 0);
      
      monthlyComparisonData.push({
        month: format(targetMonth, 'MMM'),
        amount: monthlyExpense,
        isCurrentMonth: i === 0
      });
    }
    
    return { income, expenses, savings, savingsRate, categoryData, monthlyComparisonData };
  }, [transactions, categories, timeRange]);
  
  return (
    <div className="min-h-screen pb-20">
      <div className="p-4 pt-12">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold">Statistics</h1>
          <div className="glass-card rounded-full overflow-hidden p-1 flex bg-white/20 dark:bg-neutral-700/20">
            <button 
              className={`px-4 py-1 rounded-full text-sm ${timeRange === 'month' ? 'bg-primary text-white' : ''}`}
              onClick={() => setTimeRange('month')}
            >
              Month
            </button>
            <button 
              className={`px-4 py-1 text-sm ${timeRange === 'year' ? 'bg-primary text-white' : ''}`}
              onClick={() => setTimeRange('year')}
            >
              Year
            </button>
          </div>
        </div>
        
        {/* Stats Summary */}
        <div className="glass-card rounded-xl p-5 mb-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs opacity-70 mb-1">Income</p>
              <div className="flex items-center">
                <i className="ri-arrow-up-circle-fill text-success mr-1"></i>
                <span className="text-lg font-semibold text-success">{formatCurrency(income, settings.currency)}</span>
              </div>
            </div>
            <div>
              <p className="text-xs opacity-70 mb-1">Expenses</p>
              <div className="flex items-center">
                <i className="ri-arrow-down-circle-fill text-danger mr-1"></i>
                <span className="text-lg font-semibold text-danger">{formatCurrency(expenses, settings.currency)}</span>
              </div>
            </div>
            <div>
              <p className="text-xs opacity-70 mb-1">Savings</p>
              <div className="flex items-center">
                <i className="ri-money-dollar-box-line text-primary mr-1"></i>
                <span className="text-lg font-semibold text-primary">{formatCurrency(savings, settings.currency)}</span>
              </div>
            </div>
            <div>
              <p className="text-xs opacity-70 mb-1">Saving Rate</p>
              <div className="flex items-center">
                <i className="ri-percent-line text-secondary mr-1"></i>
                <span className="text-lg font-semibold text-secondary">{savingsRate.toFixed(1)}%</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Expense Chart */}
        <div className="glass-card rounded-xl p-5 mb-6">
          <h2 className="font-semibold mb-4">
            {timeRange === 'month' 
              ? `${format(new Date(), 'MMMM yyyy')} Expenses` 
              : `${new Date().getFullYear()} Expenses`}
          </h2>
          
          {categoryData.length > 0 ? (
            <>
              <div className="flex justify-center mb-6">
                <DonutChart 
                  data={categoryData}
                  innerLabel={
                    <>
                      <span className="text-xs opacity-70">Total</span>
                      <span className="text-xl font-bold">{formatCurrency(expenses, settings.currency)}</span>
                    </>
                  }
                  width={200}
                  height={200}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                {categoryData.map((category, index) => (
                  <div key={index} className="flex items-center">
                    <div 
                      className="w-3 h-3 rounded-full mr-2"
                      style={{ backgroundColor: category.color }}
                    ></div>
                    <span className="text-xs">{category.name} ({category.percentage}%)</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-4">
              <p className="text-sm opacity-70">No expense data available</p>
            </div>
          )}
        </div>
        
        {/* Monthly Comparison - only show if there's data */}
        {monthlyComparisonData.some(item => item.amount > 0) && (
          <div className="glass-card rounded-xl p-5 mb-6">
            <h2 className="font-semibold mb-4">Monthly Comparison</h2>
            <div className="flex justify-between h-40 items-end mb-2">
              {monthlyComparisonData.map((item, index) => {
                // Find the highest amount to calculate percentages
                const maxAmount = Math.max(...monthlyComparisonData.map(item => item.amount));
                const heightPercentage = maxAmount > 0 ? (item.amount / maxAmount) * 100 : 0;
                
                return (
                  <div key={item.month} className="flex flex-col items-center">
                    <div 
                      className={`w-8 ${item.isCurrentMonth ? 'bg-primary' : 'bg-primary/20'} rounded-t-md`} 
                      style={{ height: `${heightPercentage}%` }}
                    ></div>
                    <span className="text-xs mt-1">{item.month}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StatsPage;
