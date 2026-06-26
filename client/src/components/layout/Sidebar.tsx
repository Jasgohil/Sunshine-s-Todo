import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  ListTodo,
  Calendar,
  History,
  Timer,
  BookOpen,
  Heart,
  User,
  ShieldCheck,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Sun
} from 'lucide-react';

interface SidebarProps {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ collapsed, setCollapsed }) => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const menuItems = [
    { path: '/', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/todo', label: 'To-Do', icon: ListTodo },
    { path: '/calendar', label: 'Calendar', icon: Calendar },
    { path: '/timeline', label: 'Timeline', icon: History },
    { path: '/pomodoro', label: 'Pomodoro', icon: Timer },
    { path: '/journal', label: 'Journal', icon: BookOpen },
    { path: '/jazzy', label: "Jazzy's Corner", icon: Heart },
  ];

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <motion.aside
      animate={{ width: collapsed ? '70px' : '260px' }}
      transition={{ duration: 0.3, ease: [0.25, 0.8, 0.25, 1] as any }}
      className="fixed top-0 left-0 h-screen bg-sidebar border-r border-border flex flex-col z-30 select-none text-foreground"
    >
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-border">
        <AnimatePresence mode="wait">
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="flex items-center gap-2 font-bold text-lg text-sunshine-gold"
            >
              <Sun className="h-6 width-6 animate-spin-slow text-sunshine-gold" />
              <span className="bg-gradient-to-r from-sunshine-gold to-sunshine-orange bg-clip-text text-transparent font-extrabold tracking-wide">
                SUNSHINE
              </span>
            </motion.div>
          )}
        </AnimatePresence>
        
        {collapsed && (
          <div className="mx-auto text-sunshine-gold">
            <Sun className="h-6 width-6 animate-spin-slow" />
          </div>
        )}

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded-lg bg-card border border-border text-sunshine-textMuted hover:text-sunshine-gold hover:border-sunshine-gold transition-colors duration-200"
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto overflow-x-hidden scrollbar-none">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-4 px-3 py-3 rounded-xl transition-all duration-200 group relative ${
                isActive
                  ? 'bg-gradient-to-r from-sunshine-gold/10 to-sunshine-orange/5 border-l-4 border-sunshine-gold text-sunshine-gold font-medium'
                  : 'text-sunshine-textNearWhite hover:bg-card hover:text-sunshine-gold border-l-4 border-transparent'
              }`
            }
          >
            <item.icon size={20} className="min-w-[20px] group-hover:scale-110 transition-transform duration-200" />
            <AnimatePresence>
              {!collapsed && (
                <motion.span
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 'auto' }}
                  exit={{ opacity: 0, width: 0 }}
                  className="whitespace-nowrap font-medium text-sm"
                >
                  {item.label}
                </motion.span>
              )}
            </AnimatePresence>

            {/* Tooltip on collapse */}
            {collapsed && (
              <div className="absolute left-16 scale-0 rounded bg-card border border-border px-2 py-1 text-xs font-semibold text-sunshine-gold shadow-md group-hover:scale-100 transition-all duration-100 origin-left z-50 whitespace-nowrap">
                {item.label}
              </div>
            )}
          </NavLink>
        ))}

        {/* Admin Dashboard Link (if admin) */}
        {isAdmin && (
          <NavLink
            to="/admin"
            className={({ isActive }) =>
              `flex items-center gap-4 px-3 py-3 rounded-xl transition-all duration-200 group relative ${
                isActive
                  ? 'bg-gradient-to-r from-red-500/10 to-orange-500/5 border-l-4 border-red-500 text-red-500 font-medium'
                  : 'text-sunshine-textNearWhite hover:bg-card hover:text-red-400 border-l-4 border-transparent'
              }`
            }
          >
            <ShieldCheck size={20} className="min-w-[20px] group-hover:scale-110 transition-transform duration-200 text-red-400 group-hover:text-red-500" />
            <AnimatePresence>
              {!collapsed && (
                <motion.span
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 'auto' }}
                  exit={{ opacity: 0, width: 0 }}
                  className="whitespace-nowrap font-medium text-sm"
                >
                  Admin Panel
                </motion.span>
              )}
            </AnimatePresence>
            {collapsed && (
              <div className="absolute left-16 scale-0 rounded bg-card border border-border px-2 py-1 text-xs font-semibold text-red-400 shadow-md group-hover:scale-100 transition-all duration-100 origin-left z-50 whitespace-nowrap">
                Admin Panel
              </div>
            )}
          </NavLink>
        )}
      </nav>

      {/* User profile & Settings at Bottom */}
      <div className="p-3 border-t border-border bg-[#0E0E0E]/50">
        <NavLink
          to="/profile"
          className={({ isActive }) =>
            `flex items-center gap-3 px-2 py-2 rounded-xl transition-all duration-200 group relative ${
              isActive
                ? 'bg-card text-sunshine-gold border border-sunshine-gold/30'
                : 'text-sunshine-textNearWhite hover:bg-card hover:text-sunshine-gold border border-transparent'
            }`
          }
        >
          <img
            src={user?.photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${user?.displayName}`}
            alt="Avatar"
            className="w-9 h-9 rounded-xl border border-border bg-card object-cover"
          />
          <AnimatePresence>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                className="flex flex-col flex-1 overflow-hidden"
              >
                <span className="text-xs font-semibold text-sunshine-textNearWhite truncate group-hover:text-sunshine-gold transition-colors duration-200">
                  {user?.displayName}
                </span>
                <span className="text-[10px] text-sunshine-textMuted truncate">
                  {user?.email}
                </span>
              </motion.div>
            )}
          </AnimatePresence>
          {!collapsed && <User size={14} className="text-sunshine-textMuted group-hover:text-sunshine-gold transition-colors duration-200" />}
          {collapsed && (
            <div className="absolute left-16 scale-0 rounded bg-card border border-border px-2 py-1 text-xs font-semibold text-sunshine-gold shadow-md group-hover:scale-100 transition-all duration-100 origin-left z-50 whitespace-nowrap">
              Profile & Settings
            </div>
          )}
        </NavLink>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="w-full mt-2 flex items-center gap-4 px-3 py-2.5 rounded-xl text-red-400 hover:bg-red-500/10 hover:text-red-500 transition-all duration-200 group relative border border-transparent"
        >
          <LogOut size={18} className="min-w-[18px] group-hover:translate-x-0.5 transition-transform duration-200" />
          <AnimatePresence>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                className="whitespace-nowrap font-semibold text-xs"
              >
                Sign Out
              </motion.span>
            )}
          </AnimatePresence>
          {collapsed && (
            <div className="absolute left-16 scale-0 rounded bg-card border border-border px-2 py-1 text-xs font-semibold text-red-500 shadow-md group-hover:scale-100 transition-all duration-100 origin-left z-50 whitespace-nowrap">
              Sign Out
            </div>
          )}
        </button>
      </div>
    </motion.aside>
  );
};

export default Sidebar;
