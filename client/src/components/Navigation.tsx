import { Link } from 'wouter';

interface NavigationProps {
  activeRoute: string;
  setActiveRoute: (route: string) => void;
}

const Navigation = ({ activeRoute, setActiveRoute }: NavigationProps) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 glass-card backdrop-blur-md border-t border-white/20 dark:border-neutral-700/20 py-2 z-10">
      <div className="flex justify-around">
        <Link href="/">
          <a 
            className={`nav-btn ${activeRoute === '/' ? 'active' : ''}`}
            onClick={() => setActiveRoute('/')}
          >
            <i className="ri-home-5-line text-xl"></i>
            <span className="text-xs mt-1">Home</span>
          </a>
        </Link>
        
        <Link href="/stats">
          <a 
            className={`nav-btn ${activeRoute === '/stats' ? 'active' : ''}`}
            onClick={() => setActiveRoute('/stats')}
          >
            <i className="ri-pie-chart-line text-xl"></i>
            <span className="text-xs mt-1">Stats</span>
          </a>
        </Link>
        
        <Link href="/categories">
          <a 
            className={`nav-btn ${activeRoute === '/categories' ? 'active' : ''}`}
            onClick={() => setActiveRoute('/categories')}
          >
            <i className="ri-price-tag-3-line text-xl"></i>
            <span className="text-xs mt-1">Categories</span>
          </a>
        </Link>
        
        <Link href="/settings">
          <a 
            className={`nav-btn ${activeRoute === '/settings' ? 'active' : ''}`}
            onClick={() => setActiveRoute('/settings')}
          >
            <i className="ri-settings-4-line text-xl"></i>
            <span className="text-xs mt-1">Settings</span>
          </a>
        </Link>
      </div>
    </div>
  );
};

export default Navigation;
