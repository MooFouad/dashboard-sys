import React, { useState, useEffect } from 'react';
import { Bell, BellOff, Mail, TestTube, AlertCircle, RefreshCw, X } from 'lucide-react';
import pushNotificationService from '../../services/pushNotificationService';
import api from '../../services/api';

const NotificationModal = ({ isOpen, onClose }) => {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [debugLog, setDebugLog] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [notificationTypes, setNotificationTypes] = useState({
    vehicle: true,
    homeRent: true,
    electricity: true,
    absher: true,
    socialInsurance: true,
    gosi: true
  });

  const addDebugLog = (msg) => {
    console.log(msg);
    setDebugLog(prev => [...prev, `${new Date().toLocaleTimeString()}: ${msg}`]);
  };

  useEffect(() => {
    if (isOpen) {
      checkPushSubscription();
      loadSubscriptions();
      const savedEmail = localStorage.getItem('gts_notification_email');
      if (savedEmail) {
        setEmail(savedEmail);
      }
    }
  }, [isOpen]);

  const loadSubscriptions = async () => {
    try {
      const data = await api.get('/notifications/subscriptions');
      setSubscriptions(data.subscriptions || []);
    } catch (error) {
      console.error('Error loading subscriptions:', error);
    }
  };

  const checkPushSubscription = async () => {
    try {
      if (!pushNotificationService.isSupported()) {
        return;
      }

      const subscribed = await pushNotificationService.isSubscribed();
      setIsSubscribed(subscribed);
    } catch (error) {
      console.error('Error checking subscription:', error);
    }
  };

  const handleSubscribe = async () => {
    if (!email || !email.includes('@')) {
      setMessage('Please enter a valid email address');
      return;
    }

    const selectedTypes = Object.keys(notificationTypes).filter(key => notificationTypes[key]);
    if (selectedTypes.length === 0) {
      setMessage('Please select at least one notification type');
      return;
    }

    setLoading(true);
    setMessage('');
    setDebugLog([]);
    addDebugLog('🔔 Starting notification subscription...');

    try {
      if (!pushNotificationService.isSupported()) {
        throw new Error('Your browser does not support push notifications');
      }
      addDebugLog('✅ Browser support verified');

      addDebugLog(`Current permission: ${Notification.permission}`);

      if (Notification.permission === 'denied') {
        throw new Error('Notification permission denied. Please enable it in browser settings.');
      }

      addDebugLog(`📝 Subscribing to notifications with email and types: ${selectedTypes.join(', ')}...`);
      await pushNotificationService.subscribe(email, selectedTypes);

      addDebugLog('✅ Subscribe method completed');

      setMessage(`✅ Successfully subscribed! You will receive notifications daily at 9 AM.`);
      addDebugLog('✅ Subscription complete!');

      const isNowSubscribed = await pushNotificationService.isSubscribed();
      addDebugLog(`Verification result: ${isNowSubscribed ? '✅ Confirmed' : '❌ Not found'}`);

      if (!isNowSubscribed) {
        throw new Error('Subscription verification failed');
      }

      await loadSubscriptions();
      setIsSubscribed(false);
      setEmail('');

    } catch (error) {
      console.error('❌ Subscription error:', error);
      addDebugLog(`❌ FAILED: ${error.message}`);
      setMessage(`❌ Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleTestNotification = async () => {
    setLoading(true);
    setMessage('');
    addDebugLog('🧪 Sending test notifications...');

    try {
      const subscribed = await pushNotificationService.isSubscribed();

      if (!subscribed && subscriptions.length === 0) {
        setMessage('⚠️ Please subscribe first before sending test notifications');
        addDebugLog('⚠️ Not subscribed');
        setLoading(false);
        return;
      }

      let testEmail = localStorage.getItem('gts_notification_email');
      if (!testEmail && subscriptions.length > 0) {
        testEmail = subscriptions[0].userEmail;
      }

      if (subscribed) {
        addDebugLog('📱 Sending browser push notification...');
        try {
          await pushNotificationService.sendTestNotification();
          addDebugLog('✅ Test push notification sent');
        } catch (pushError) {
          addDebugLog(`⚠️ Push notification failed: ${pushError.message}`);
        }
      }

      if (testEmail) {
        addDebugLog(`📧 Sending test email to ${testEmail}...`);
        try {
          await pushNotificationService.sendTestEmail(testEmail);
          addDebugLog(`✅ Test email sent to ${testEmail}`);
        } catch (emailError) {
          addDebugLog(`⚠️ Email test failed: ${emailError.message}`);
        }
      }

      setMessage('✅ Test notifications sent! Check your browser and email.');
    } catch (error) {
      setMessage(`❌ Error: ${error.message}`);
      addDebugLog(`❌ Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckNow = async () => {
    setLoading(true);
    setMessage('');
    setDebugLog([]);
    addDebugLog('🔍 Checking for expiring items...');

    try {
      if (subscriptions.length === 0) {
        setMessage('⚠️ Please subscribe first to receive notifications');
        addDebugLog('⚠️ No active subscriptions found');
        setLoading(false);
        return;
      }

      addDebugLog('📋 Scanning all vehicles, contracts, and bills...');
      addDebugLog('📧 Looking for items expiring within 10 days...');

      const response = await api.post('/notifications/check-now');

      addDebugLog(`✅ Check complete!`);
      addDebugLog(`📊 Results:`);
      addDebugLog(`   - Total items found: ${response.result.total}`);
      addDebugLog(`   - Push notifications: ${response.result.push}`);
      addDebugLog(`   - Email notifications: ${response.result.email}`);

      if (response.result.total === 0) {
        setMessage('ℹ️ No items expiring within 10 days. Everything is up to date!');
        addDebugLog('✅ All items are current - no action needed');
      } else {
        setMessage(`✅ Found ${response.result.total} item(s) needing attention! Notifications sent successfully.`);
        addDebugLog('📬 Check your email inbox and browser notifications');
        addDebugLog(`💡 ${response.result.email} email(s) sent, ${response.result.push} push notification(s) sent`);
      }
    } catch (error) {
      console.error('Check now error:', error);
      const errorMsg = error.response?.data?.error || error.message || 'Unknown error occurred';
      setMessage(`❌ Error: ${errorMsg}`);
      addDebugLog(`❌ Failed: ${errorMsg}`);

      if (error.response?.status === 401) {
        addDebugLog('⚠️ Authentication error - you may need to log in');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveSubscription = async (subscription) => {
    if (!window.confirm(`Remove subscription for ${subscription.userEmail}?`)) {
      return;
    }

    setLoading(true);
    try {
      await api.post('/notifications/unsubscribe', { endpoint: subscription.endpoint });
      setMessage('✅ Subscription removed');
      await loadSubscriptions();

      if (subscription.userEmail === email) {
        setIsSubscribed(false);
        setEmail('');
        localStorage.removeItem('gts_notification_email');
      }
    } catch (error) {
      setMessage(`❌ Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
        <div
          className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-700 dark:to-blue-800 text-white px-6 py-4 rounded-t-xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Bell size={28} />
              <h2 className="text-2xl font-bold">Notification System</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              aria-label="Close"
            >
              <X size={24} />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {!pushNotificationService.isSupported() ? (
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="text-yellow-600 dark:text-yellow-400 flex-shrink-0" size={24} />
                  <div>
                    <h3 className="font-semibold text-yellow-900 dark:text-yellow-200">Push Notifications Not Supported</h3>
                    <p className="text-yellow-800 dark:text-yellow-300 mt-1">
                      Your browser does not support push notifications. Please try Chrome, Firefox, or Edge.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <>
                {/* Info Card */}
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
                  <h3 className="font-semibold text-blue-900 dark:text-blue-200 mb-2">📬 How It Works</h3>
                  <p className="text-sm text-blue-800 dark:text-blue-300">
                    Subscribe to receive browser push notifications AND email alerts daily at 9 AM, starting 10 days before expiration dates.
                  </p>
                </div>

                {/* Notification Types */}
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    <Bell size={16} className="inline mr-2" />
                    Choose Notification Types
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {[
                      { key: 'vehicle', icon: '🚗', label: 'Vehicles', desc: 'License, inspection & insurance' },
                      { key: 'homeRent', icon: '🏠', label: 'Home Rent', desc: 'Contract ending dates' },
                      { key: 'electricity', icon: '⚡', label: 'Electricity', desc: 'Unpaid bill due dates' },
                      { key: 'absher', icon: '📋', label: 'Tamm', desc: 'Vehicle registration alerts' },
                      { key: 'socialInsurance', icon: '🛡️', label: 'Social Insurance', desc: 'Insurance expiration' },
                      { key: 'gosi', icon: '👥', label: 'GOSI', desc: 'Engagement end dates' }
                    ].map(type => (
                      <label key={type.key} className="flex items-start gap-3 p-3 border dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                        <input
                          type="checkbox"
                          checked={notificationTypes[type.key]}
                          onChange={(e) => setNotificationTypes({ ...notificationTypes, [type.key]: e.target.checked })}
                          disabled={isSubscribed}
                          className="mt-1 w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                        />
                        <div className="flex-1">
                          <div className="font-medium text-gray-900 dark:text-gray-100">
                            {type.icon} {type.label}
                          </div>
                          <p className="text-xs text-gray-600 dark:text-gray-400">{type.desc}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Email Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <Mail size={16} className="inline mr-2" />
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your-email@example.com"
                    disabled={isSubscribed}
                    className="w-full px-4 py-2 border dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {/* Debug Log */}
                {debugLog.length > 0 && (
                  <div className="bg-gray-900 text-green-400 rounded-lg p-4 font-mono text-xs max-h-48 overflow-y-auto">
                    {debugLog.map((log, index) => (
                      <div key={index} className="mb-1">{log}</div>
                    ))}
                  </div>
                )}

                {/* Message */}
                {message && (
                  <div className={`p-3 rounded-lg ${
                    message.includes('✅') ? 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200' :
                    message.includes('⚠️') ? 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200' :
                    'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200'
                  }`}>
                    {message}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={handleSubscribe}
                    disabled={loading || !email || !email.includes('@')}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <Bell size={18} />
                    {loading ? 'Subscribing...' : 'Subscribe'}
                  </button>

                  <button
                    onClick={handleTestNotification}
                    disabled={loading || (subscriptions.length === 0 && !isSubscribed)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                  >
                    <TestTube size={18} />
                    Send Test
                  </button>

                  <button
                    onClick={handleCheckNow}
                    disabled={loading}
                    className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors"
                  >
                    <Bell size={18} />
                    Check Real Items
                  </button>
                </div>

                {/* Active Subscriptions */}
                {subscriptions.length > 0 && (
                  <div className="bg-gray-50 dark:bg-gray-700/50 border dark:border-gray-600 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">
                      📋 Active Subscriptions ({subscriptions.length})
                    </h3>
                    <div className="space-y-2">
                      {subscriptions.map((subscription) => {
                        const types = subscription.notificationTypes || [];
                        const typeIcons = { vehicle: '🚗', homeRent: '🏠', electricity: '⚡', absher: '📋', socialInsurance: '🛡️', gosi: '👥' };

                        return (
                          <div key={subscription._id} className="flex items-start justify-between bg-white dark:bg-gray-800 p-3 rounded-lg border dark:border-gray-600">
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <Mail size={16} className="text-blue-600" />
                                <span className="text-sm font-medium dark:text-gray-100">{subscription.userEmail}</span>
                              </div>
                              <div className="flex flex-wrap gap-1 mt-2">
                                {types.map(type => (
                                  <span key={type} className="inline-flex items-center gap-1 px-2 py-0.5 text-xs bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-200 rounded-full">
                                    {typeIcons[type]}
                                  </span>
                                ))}
                              </div>
                            </div>
                            <button
                              onClick={() => handleRemoveSubscription(subscription)}
                              disabled={loading}
                              className="flex items-center gap-1 px-3 py-1 text-sm bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 rounded hover:bg-red-200 dark:hover:bg-red-900/60 disabled:opacity-50 transition-colors"
                            >
                              <BellOff size={14} />
                              Remove
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default NotificationModal;
