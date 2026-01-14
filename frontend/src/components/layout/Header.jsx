import React from 'react';
import { Menu, X, Info, Moon, Sun, Bell } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';

const Header = ({ sidebarCollapsed, sidebarOpen, onToggleSidebar, onNotificationClick }) => {
  const { user } = useAuth();
  const { themeMode, toggleTheme, isDark } = useTheme();
  const isGuest = user?.isGuest;

  const getThemeIcon = () => {
    if (themeMode === 'auto') {
      return isDark ? <Moon size={20} /> : <Sun size={20} />;
    }
    return isDark ? <Sun size={20} /> : <Moon size={20} />;
  };
  const getThemeTitle = () => {
    if (themeMode === 'auto') {
      return `Auto mode (currently ${isDark ? 'dark' : 'light'}) - Click for light mode`;
    }
    if (themeMode === 'light') {
      return 'Light mode - Click for dark mode';
    }
    return 'Dark mode - Click for auto mode';
  };
  return (
    <div className="bg-white dark:bg-gray-900 shadow-lg transition-colors duration-200">
      <div className="w-full px-4 sm:px-6 py-3 sm:py-4">
        <div className={`flex items-center justify-between transition-all duration-300 ${sidebarCollapsed ? 'md:ml-20' : 'md:ml-64'}`}>
          <div className="flex items-center gap-3">
            <img
              src="/logo.svg"
              alt="GTS logo"
              className="h-12 sm:h-16 w-auto object-contain"
            />
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-gray-100 hidden md:block">
                GTS Management System
              </h1>
              {/* Demo Mode Badge */}
              {/* <span className="hidden lg:inline-flex items-center gap-1 px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 text-xs font-semibold rounded-full border border-blue-200 dark:border-blue-700">
                <Info size={12} />
                Portfolio Demo
              </span> */}
              {/* Guest User Badge */}
              {/* {isGuest && (
                <span className="hidden lg:inline-flex items-center px-2 py-1 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 text-xs font-semibold rounded-full border border-green-200 dark:border-green-700">
                  Guest Mode
                </span>
              )} */}
            </div>
          </div>
          {/* Right Side Actions */}
          <div className="flex items-center gap-2">
            {/* Notification System Button - Desktop */}
            <button
              onClick={onNotificationClick}
              className="hidden md:flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-blue-600 dark:bg-blue-700 text-white hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors duration-200 shadow-md"
              title="Open Notification System"
              aria-label="Notification System"
            >
              <Bell size={20} />
              <span className="text-sm font-medium">Notification System</span>
            </button>
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="hidden md:flex items-center justify-center gap-1 p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200"
              title={getThemeTitle()}
              aria-label="Toggle theme"
            >
              {getThemeIcon()}
              {themeMode === 'auto' && (
                <span className="text-xs font-medium">Auto</span>
              )}
            </button>
            {/* Notification System Button - Mobile (before menu) */}
            <button
              onClick={onNotificationClick}
              className="md:hidden p-2 bg-blue-600 dark:bg-blue-700 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors duration-200 shadow-md"
              title="Notification System"
              aria-label="Notification System"
            >
              <Bell size={20} />
            </button>
            {/* Mobile Menu Button */}
            <button
              onClick={onToggleSidebar}
              className="md:hidden p-2 bg-gray-600 dark:bg-gray-700 text-white rounded-lg hover:bg-gray-700 dark:hover:bg-gray-600 transition"
              title={sidebarOpen ? "Close menu" : "Open menu"}
            >
              {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;