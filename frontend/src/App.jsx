import React, { useState, useEffect, Suspense, lazy } from 'react';
import Header from './components/layout/Header';
import Sidebar from './components/layout/Sidebar';
import StatusLegend from './components/common/StatusLegend';
import LoadingSpinner from './components/common/LoadingSpinner';
// Services imported via initializeDemoData
import pushNotificationService from './services/pushNotificationService';
import { initializeDemoData } from './services/demoDataLoader';

// Lazy load container components for code splitting
const HomeRentsContainer = lazy(() => import('./components/homeRents/HomeRentsContainer'));
const ElectricityContainer = lazy(() => import('./components/electricity/ElectricityContainer'));
const AbsherContainer = lazy(() => import('./components/absher/AbsherContainer'));
const SocialInsuranceContainer = lazy(() => import('./components/socialInsurance/SocialInsuranceContainer'));
const GOSIContainer = lazy(() => import('./components/gosi/GOSIContainer'));

// Lazy load notification components to prevent errors
const NotificationModal = lazy(() =>
  import('./components/common/NotificationModal').catch(() => ({
    default: () => <div>Notification Modal Not Available</div>
  }))
);

const NotificationDiagnostics = lazy(() =>
  import('./components/common/NotificationDiagnostics').catch(() => ({
    default: () => <div>Diagnostics Not Available</div>
  }))
);

const App = () => {
  const [activeTab, setActiveTab] = useState('absher');
  const [showSettings, setShowSettings] = useState(false);
  const [showDiagnostics, setShowDiagnostics] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const [showNotificationBanner, setShowNotificationBanner] = useState(false);
  const [counts, setCounts] = useState({
    vehicles: 0,
    homeRents: 0,
    electricity: 0,
    absher: 0,
    socialInsurance: 0,
    gosi: 0
  });

  useEffect(() => {
    // Initialize demo data instantly (no backend required)
    initializeDemoData();

    // Load counts instantly from localStorage
    const loadCountsFromLocalStorage = () => {
      try {
        const storagePrefix = 'gts_dashboard_';
        const getCount = (key) => {
          const data = localStorage.getItem(storagePrefix + key);
          return data ? JSON.parse(data).length : 0;
        };

        setCounts({
          vehicles: getCount('vehicles'),
          homeRents: getCount('homeRents'),
          electricity: getCount('electricity'),
          absher: getCount('absher'),
          socialInsurance: getCount('socialInsurance'),
          gosi: getCount('gosi')
        });
      } catch (error) {
        console.error('Error loading counts from localStorage:', error);
      }
    };

    loadCountsFromLocalStorage();

    // Listen for count updates
    const handleCountUpdate = (event) => {
      const { type, count } = event.detail;
      setCounts(prevCounts => ({
        ...prevCounts,
        [type]: count
      }));
    };

    window.addEventListener('itemCountUpdate', handleCountUpdate);

    return () => {
      window.removeEventListener('itemCountUpdate', handleCountUpdate);
    };
  }, []);

  // Auto-initialize notification system on first visit
  useEffect(() => {
    const initializeNotifications = async () => {
      try {
        // Check if we should show the notification prompt
        const hasBeenPrompted = localStorage.getItem('gts_notification_prompted');
        const isAlreadySubscribed = await pushNotificationService.isSubscribed();

        // If user hasn't been prompted and isn't subscribed, show banner
        if (!hasBeenPrompted && !isAlreadySubscribed && pushNotificationService.isSupported()) {
          // Show banner immediately (instant loading mode)
          setShowNotificationBanner(true);
        }
      } catch (error) {
        console.error('Error initializing notifications:', error);
      }
    };

    initializeNotifications();
  }, []);

  const handleEnableNotifications = async () => {
    try {
      const userEmail = prompt('Enter your email to receive notifications:');
      if (!userEmail || !userEmail.includes('@')) {
        alert('Please enter a valid email address');
        return;
      }

      // Subscribe with all notification types enabled by default
      await pushNotificationService.subscribe(userEmail, [
        'vehicle',
        'homeRent',
        'electricity',
        'absher',
        'socialInsurance',
        'gosi'
      ]);

      setShowNotificationBanner(false);
      localStorage.setItem('gts_notification_prompted', 'true');
      alert('Notifications enabled successfully! You will receive alerts for expiring items.');
    } catch (error) {
      console.error('Failed to enable notifications:', error);
      alert('Failed to enable notifications: ' + error.message);
    }
  };

  const handleDismissNotificationBanner = () => {
    setShowNotificationBanner(false);
    localStorage.setItem('gts_notification_prompted', 'true');
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const handleSettingsClick = () => {
    setShowSettings(!showSettings);
    setShowDiagnostics(false);
    setSidebarOpen(false); // Close mobile sidebar when opening modal
  };

  const handleDiagnosticsClick = () => {
    setShowDiagnostics(!showDiagnostics);
    setShowSettings(false);
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const toggleSidebarCollapse = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-950 flex flex-col transition-colors duration-200">
      <Header
        sidebarCollapsed={sidebarCollapsed}
        sidebarOpen={sidebarOpen}
        onToggleSidebar={toggleSidebar}
        onNotificationClick={handleSettingsClick}
      />

      {/* Notification Banner - Auto-prompt on first visit */}
      {showNotificationBanner && (
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 text-white shadow-lg">
          <div className="max-w-7xl mx-auto px-4 py-3 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center flex-1 min-w-0">
                <span className="flex p-2 rounded-lg bg-blue-700 dark:bg-blue-800">
                  <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                </span>
                <p className="ml-3 font-medium text-sm sm:text-base">
                  <span className="md:hidden">Get expiry alerts!</span>
                  <span className="hidden md:inline">
                    Enable notifications to get alerts for expiring licenses, contracts, and bills
                  </span>
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleEnableNotifications}
                  className="bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors shadow-sm"
                >
                  Enable Notifications
                </button>
                <button
                  onClick={handleDismissNotificationBanner}
                  className="text-white hover:text-blue-100 dark:hover:text-blue-200 p-2 rounded-lg hover:bg-blue-600 dark:hover:bg-blue-700 transition-colors"
                  aria-label="Dismiss"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar - Mobile & Desktop */}
        <Sidebar
          activeTab={activeTab}
          onTabChange={handleTabChange}
          vehiclesCount={counts.vehicles}
          homeRentsCount={counts.homeRents}
          electricityCount={counts.electricity}
          absherCount={counts.absher}
          socialInsuranceCount={counts.socialInsurance}
          gosiCount={counts.gosi}
          isOpen={sidebarOpen}
          onToggle={toggleSidebar}
          onDiagnosticsClick={handleDiagnosticsClick}
          isCollapsed={sidebarCollapsed}
          onToggleCollapse={toggleSidebarCollapse}
        />

        {/* Main Content Area */}
        <main className={`flex-1 overflow-y-auto transition-all duration-300 ${sidebarCollapsed ? 'md:ml-20' : 'md:ml-64'}`}>
          <StatusLegend />

          {/* Notification Diagnostics Panel */}
          {showDiagnostics && (
            <div className="max-w-7xl mx-auto px-4 py-4">
              <Suspense fallback={<LoadingSpinner message="Loading diagnostics..." />}>
                <NotificationDiagnostics />
              </Suspense>
            </div>
          )}

          <div className="p-2 sm:p-4">
            <Suspense fallback={<LoadingSpinner message="Loading content..." />}>
              <div className={activeTab === 'absher' ? 'block' : 'hidden'}>
                <AbsherContainer />
              </div>

              <div className={activeTab === 'homeRents' ? 'block' : 'hidden'}>
                <HomeRentsContainer />
              </div>

              <div className={activeTab === 'electricity' ? 'block' : 'hidden'}>
                <ElectricityContainer />
              </div>

              <div className={activeTab === 'socialInsurance' ? 'block' : 'hidden'}>
                <SocialInsuranceContainer />
              </div>

              <div className={activeTab === 'gosi' ? 'block' : 'hidden'}>
                <GOSIContainer />
              </div>
            </Suspense>
          </div>
        </main>
      </div>

      {/* Notification Modal */}
      <Suspense fallback={null}>
        <NotificationModal
          isOpen={showSettings}
          onClose={() => setShowSettings(false)}
        />
      </Suspense>
    </div>
  );
};

export default App;