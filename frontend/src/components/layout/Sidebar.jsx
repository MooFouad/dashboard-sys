import React from 'react';
import { Car, Home, Zap, Shield, Info, X, Menu, User, LogOut, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const Sidebar = ({
  activeTab,
  onTabChange,
  vehiclesCount,
  homeRentsCount,
  electricityCount,
  absherCount,
  socialInsuranceCount,
  gosiCount,
  isOpen,
  onToggle,
  onDiagnosticsClick,
  isCollapsed,
  onToggleCollapse
}) => {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    if (window.confirm('Are you sure you want to logout?')) {
      await logout();
    }
  };
  const handleTabChange = (tab) => {
    if (tab !== activeTab) {
      onTabChange(tab);
      // Close sidebar on mobile after selection
      if (window.innerWidth < 768) {
        onToggle();
      }
    }
  };

  const navItems = [
    {
      id: 'absher',
      label: 'Tamm - Istemarah',
      icon: Car,
      count: absherCount
    },
    {
      id: 'homeRents',
      label: 'Home Rents',
      icon: Home,
      count: homeRentsCount
    },
    {
      id: 'electricity',
      label: 'Electricity',
      icon: Zap,
      count: electricityCount
    },
    {
      id: 'socialInsurance',
      label: 'Social Insurance',
      icon: Shield,
      count: socialInsuranceCount
    },
    {
      id: 'gosi',
      label: 'GOSI',
      icon: null, // Will use image instead
      count: gosiCount,
      useImage: true
    }
  ];

  const itemClasses = (tab) =>
    `flex items-center justify-between px-4 py-3 rounded-lg transition-all duration-200 cursor-pointer ${
      activeTab === tab
        ? 'bg-blue-600 dark:bg-blue-700 text-white shadow-md'
        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-blue-600 dark:hover:text-blue-400'
    }`;

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 z-30"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full bg-white dark:bg-gray-900 shadow-xl z-40 transition-all duration-300 ease-in-out flex flex-col
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          md:translate-x-0
          ${isCollapsed ? 'md:w-20' : 'md:w-64'}
          w-64`}
      >
        {/* Sidebar Header */}
        <div className="p-4 border-b dark:border-gray-700 bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-800 dark:to-blue-900">
          <div className={`flex items-center ${isCollapsed ? 'md:justify-center' : ''}`}>
            <div className={`flex items-center gap-3 ${isCollapsed ? 'md:flex-col md:gap-1' : ''}`}>
              <img
                src="/logo.svg"
                alt="GTS logo"
                className="h-10 w-10 object-contain bg-white rounded-lg p-1"
              />
              <div className={`text-white ${isCollapsed ? 'md:hidden' : ''}`}>
                <h2 className="font-bold text-lg">GTS</h2>
                <p className="text-xs text-blue-100">Management</p>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-2">
          {navItems.map((item) => (
            <div
              key={item.id}
              onClick={() => handleTabChange(item.id)}
              className={`${itemClasses(item.id)} ${isCollapsed ? 'md:justify-center md:px-2' : ''} relative group`}
              title={isCollapsed ? item.label : ''}
            >
              <div className={`flex items-center gap-3 ${isCollapsed ? 'md:flex-col md:gap-1' : ''}`}>
                {item.useImage ? (
                  <img src="/gosi-logo.png" alt="GOSI" className="w-5 h-5" />
                ) : (
                  <item.icon size={20} />
                )}
                <span className={`font-medium ${isCollapsed ? 'md:hidden' : ''}`}>{item.label}</span>
              </div>
              <span
                className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                  activeTab === item.id
                    ? 'bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400'
                    : 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                } ${isCollapsed ? 'md:hidden' : ''}`}
              >
                {item.count}
              </span>

              {/* Tooltip for collapsed state */}
              {isCollapsed && (
                <div className="hidden md:block absolute left-full ml-2 px-3 py-2 bg-gray-900 dark:bg-gray-700 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                  {item.label} ({item.count})
                </div>
              )}
            </div>
          ))}
        </nav>

        {/* Bottom Actions */}
        <div className="border-t dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
          <div className="p-4 space-y-2">
            <button
              onClick={() => {
                onDiagnosticsClick();
                if (window.innerWidth < 768) onToggle();
              }}
              className={`w-full flex items-center gap-3 px-4 py-2.5 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition ${isCollapsed ? 'md:justify-center md:px-2' : ''}`}
              title="Notification Diagnostics"
            >
              <Info size={18} />
              <span className={`text-sm font-medium ${isCollapsed ? 'md:hidden' : ''}`}>Diagnostics</span>
            </button>
          </div>

          {/* User Profile & Logout */}
          <div className="p-4 border-t dark:border-gray-700 bg-white dark:bg-gray-900">
            <div className={`flex items-center gap-3 mb-3 ${isCollapsed ? 'md:flex-col md:px-0' : 'px-2'}`}>
              <div className="flex-shrink-0 w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                <User size={20} className="text-blue-600 dark:text-blue-400" />
              </div>
              <div className={`flex-1 min-w-0 ${isCollapsed ? 'md:hidden' : ''}`}>
                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">{user?.name || 'User'}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user?.role || 'Role'}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-red-600 dark:bg-red-700 text-white rounded-lg hover:bg-red-700 dark:hover:bg-red-600 transition font-medium ${isCollapsed ? 'md:px-2' : ''}`}
              title="Logout"
            >
              <LogOut size={18} />
              <span className={isCollapsed ? 'md:hidden' : ''}>Logout</span>
            </button>
          </div>

          {/* Desktop Collapse Toggle Button - Bottom */}
          <div className={`hidden md:flex p-4 border-t dark:border-gray-700`}>
            <button
              onClick={onToggleCollapse}
              className={`w-full flex items-center gap-3 py-2.5 bg-blue-600 dark:bg-blue-700 text-white rounded-lg shadow-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition font-medium ${
                isCollapsed ? 'justify-center px-2' : 'justify-center px-4'
              }`}
              title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {isCollapsed ? (
                <ChevronRight size={20} />
              ) : (
                <>
                  <ChevronLeft size={20} />
                  <span>Collapse Sidebar</span>
                </>
              )}
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
