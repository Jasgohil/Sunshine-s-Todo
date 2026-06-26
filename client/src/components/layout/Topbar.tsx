import React, { useState, useEffect } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Bell, Search, LogOut, User as UserIcon, Settings, ShieldAlert } from 'lucide-react';

const Topbar: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [greeting, setGreeting] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Calculate dynamic page title
  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/') return 'Dashboard';
    if (path === '/todo') return 'Tasks & To-Dos';
    if (path === '/calendar') return 'Calendar Schedule';
    if (path === '/timeline') return 'Event Timeline';
    if (path === '/pomodoro') return 'Focus & Pomodoro';
    if (path === '/journal') return 'My Private Journal';
    if (path === '/jazzy') return "Jazzy's Inspiration";
    if (path === '/profile') return 'Profile Settings';
    if (path === '/admin') return 'Admin Portal';
    return 'Sunshine';
  };

  // Determine time-aware greeting
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) {
      setGreeting('Good morning');
    } else if (hour < 17) {
      setGreeting('Good afternoon');
    } else {
      setGreeting('Good evening');
    }
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className="h-16 border-b border-border bg-[#0D0D0D]/80 backdrop-blur-md flex items-center justify-between px-6 sticky top-0 z-20 select-none text-foreground">
      {/* Left Side: Title & Greeting */}
      <div className="flex flex-col">
        <h2 className="text-lg font-bold tracking-tight text-sunshine-textNearWhite capitalize">
          {getPageTitle()}
        </h2>
        <span className="text-xs text-sunshine-textMuted">
          {greeting}, <span className="text-sunshine-gold font-semibold">{user?.displayName}</span>
        </span>
      </div>

      {/* Middle Side: Global Search Bar */}
      <div className="hidden md:flex items-center flex-1 max-w-md mx-8 relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sunshine-textMuted" size={16} />
        <input
          type="text"
          placeholder="Search tasks, journal entries, events..."
          className="w-full h-10 pl-10 pr-4 rounded-xl bg-card border border-border text-xs text-sunshine-textNearWhite placeholder-sunshine-textMuted focus:outline-none focus:border-sunshine-gold focus:ring-1 focus:ring-sunshine-gold/30 transition-all duration-200"
        />
      </div>

      {/* Right Side: Notifications & Profile Dropdown */}
      <div className="flex items-center gap-4">
        {/* Notification Bell */}
        <button className="p-2 rounded-xl bg-card border border-border text-sunshine-textNearWhite hover:text-sunshine-gold hover:border-sunshine-gold transition-all duration-200 relative">
          <Bell size={18} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-sunshine-orange animate-pulse"></span>
        </button>

        {/* User Profile Menu */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 focus:outline-none"
          >
            <img
              src={user?.photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${user?.displayName}`}
              alt="Avatar"
              className="w-9 h-9 rounded-xl border border-border bg-card object-cover cursor-pointer hover:border-sunshine-gold transition-colors duration-200"
            />
          </button>

          {dropdownOpen && (
            <>
              {/* Overlay click catcher */}
              <div
                className="fixed inset-0 z-40"
                onClick={() => setDropdownOpen(false)}
              ></div>

              <div className="absolute right-0 mt-2 w-56 rounded-xl bg-card border border-border shadow-2xl z-50 overflow-hidden py-1 transform origin-top-right transition-all duration-200 select-none">
                <div className="px-4 py-2.5 border-b border-border bg-[#141414]">
                  <p className="text-xs font-semibold text-sunshine-textNearWhite truncate">
                    {user?.displayName}
                  </p>
                  <p className="text-[10px] text-sunshine-textMuted truncate">
                    {user?.email}
                  </p>
                </div>

                <Link
                  to="/profile"
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center gap-3 px-4 py-2 text-xs text-sunshine-textNearWhite hover:bg-muted hover:text-sunshine-gold transition-colors duration-150"
                >
                  <UserIcon size={14} className="text-sunshine-textMuted" />
                  My Profile
                </Link>

                <Link
                  to="/profile"
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center gap-3 px-4 py-2 text-xs text-sunshine-textNearWhite hover:bg-muted hover:text-sunshine-gold transition-colors duration-150"
                >
                  <Settings size={14} className="text-sunshine-textMuted" />
                  Settings
                </Link>



                <button
                  onClick={() => {
                    setDropdownOpen(false);
                    handleLogout();
                  }}
                  className="w-full text-left flex items-center gap-3 px-4 py-2 text-xs text-red-400 hover:bg-red-500/10 hover:text-red-500 transition-colors duration-150 border-t border-border"
                >
                  <LogOut size={14} className="text-red-400" />
                  Sign Out
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Topbar;
