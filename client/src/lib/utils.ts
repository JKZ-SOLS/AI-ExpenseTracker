import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currency: string): string {
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency === 'PKR' ? 'PKR' : 'USD',
    currencyDisplay: 'narrowSymbol',
    maximumFractionDigits: 0,
  });
  
  // For PKR, we want to display "Rs. X,XXX" instead of "₨X,XXX"
  if (currency === 'PKR') {
    return formatter.format(amount).replace('PKR', 'Rs.');
  }
  
  return formatter.format(amount);
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat('en-US').format(num);
}

export function formatDate(date: string | Date): string {
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatTime(date: string | Date): string {
  const d = new Date(date);
  return d.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

// Function to calculate percentage change
export function getPercentageChange(oldValue: number, newValue: number): number {
  if (oldValue === 0) return newValue > 0 ? 100 : 0;
  return ((newValue - oldValue) / Math.abs(oldValue)) * 100;
}

// Generate a random color with a specific hue range
export function getRandomColor(hueStart: number = 0, hueEnd: number = 360): string {
  const hue = Math.floor(Math.random() * (hueEnd - hueStart)) + hueStart;
  return `hsl(${hue}, 70%, 60%)`;
}
