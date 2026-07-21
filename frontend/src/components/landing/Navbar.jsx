import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, Menu, X, Moon, Sun } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { NAV_LINKS } from '../../utils/constants';
import Button from '../common/Button';

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { isAuthenticated, user, getDashboardRoute } = useAuth();
  const { darkMode, toggleDarkMode } = useTheme();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleDashboard = () => {
    if (user?.role) {
      navigate(getDashboardRoute(user.role));
    }
  };

  return (
    <nav
      className={`fixed top-0 z-50 w-full transition-all duration-300 ${
        scrolled
          ? 'glass border-b border-gray-200/50 shadow-sm dark:border-gray-800/50'
          : 'bg-transparent'
      }`}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-2">
          <Heart className={`h-8 w-8 ${scrolled ? 'text-primary-600' : 'text-white'}`} />
          <span className={`text-xl font-bold ${scrolled ? 'text-gray-900 dark:text-white' : 'text-white'}`}>
            HealthCare AI
          </span>
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className={`text-sm font-medium transition-colors hover:text-primary-500 ${
                scrolled ? 'text-gray-700 dark:text-gray-300' : 'text-white/90 hover:text-white'
              }`}
            >
              {link.label}
            </a>
          ))}
        </div>

        <div className="hidden items-center gap-3 md:flex">
          <button
            onClick={toggleDarkMode}
            className={`rounded-lg p-2 transition-colors ${
              scrolled
                ? 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'
                : 'text-white/80 hover:text-white'
            }`}
          >
            {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>

          {isAuthenticated ? (
            <Button onClick={handleDashboard} variant="secondary" size="sm">
              Dashboard
            </Button>
          ) : (
            <>
              <Link to="/login">
                <Button variant="ghost" size="sm" className={scrolled ? '' : 'text-white hover:bg-white/10'}>
                  Login
                </Button>
              </Link>
              <Link to="/register">
                <Button variant={scrolled ? 'primary' : 'secondary'} size="sm">
                  Register
                </Button>
              </Link>
            </>
          )}
        </div>

        <button
          className="md:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? (
            <X className={`h-6 w-6 ${scrolled ? 'text-gray-900 dark:text-white' : 'text-white'}`} />
          ) : (
            <Menu className={`h-6 w-6 ${scrolled ? 'text-gray-900 dark:text-white' : 'text-white'}`} />
          )}
        </button>
      </div>

      {mobileOpen && (
        <div className="glass border-t border-gray-200/50 md:hidden dark:border-gray-800/50">
          <div className="space-y-1 px-4 py-4">
            {NAV_LINKS.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="block rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </a>
            ))}
            <div className="flex items-center gap-2 border-t border-gray-200 pt-4 dark:border-gray-700">
              <button onClick={toggleDarkMode} className="rounded-lg p-2 text-gray-600 dark:text-gray-400">
                {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </button>
              {isAuthenticated ? (
                <Button onClick={handleDashboard} className="flex-1" size="sm">Dashboard</Button>
              ) : (
                <>
                  <Link to="/login" className="flex-1" onClick={() => setMobileOpen(false)}>
                    <Button variant="ghost" className="w-full" size="sm">Login</Button>
                  </Link>
                  <Link to="/register" className="flex-1" onClick={() => setMobileOpen(false)}>
                    <Button className="w-full" size="sm">Register</Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
