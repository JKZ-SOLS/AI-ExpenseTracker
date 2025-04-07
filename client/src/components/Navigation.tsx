import { Link, useLocation } from 'wouter';
import { Home, PieChart, Tag, Settings } from 'lucide-react';

interface NavigationProps {
  activeRoute: string;
  setActiveRoute: (route: string) => void;
}

const Navigation = ({ activeRoute, setActiveRoute }: NavigationProps) => {
  // The NavItem component to avoid repetition
  const NavItem = ({ href, icon, label }: { href: string, icon: React.ReactNode, label: string }) => {
    const isActive = activeRoute === href;
    return (
      <Link href={href}>
        <div 
          className={`nav-btn ${isActive ? 'active' : ''}`}
          onClick={() => setActiveRoute(href)}
        >
          {icon}
          <span className="text-xs mt-1">{label}</span>
        </div>
      </Link>
    );
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 glass-card backdrop-blur-md border-t border-white/20 dark:border-neutral-700/20 py-2 z-10">
      <div className="flex justify-around">
        <NavItem 
          href="/" 
          icon={<Home size={20} />} 
          label="Home"
        />
        
        <NavItem 
          href="/stats" 
          icon={<PieChart size={20} />} 
          label="Stats"
        />
        
        <NavItem 
          href="/categories" 
          icon={<Tag size={20} />} 
          label="Categories"
        />
        
        <NavItem 
          href="/settings" 
          icon={<Settings size={20} />} 
          label="Settings"
        />
      </div>
    </div>
  );
};

export default Navigation;
