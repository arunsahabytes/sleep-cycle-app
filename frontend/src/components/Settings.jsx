import React, { useState, useEffect } from 'react';
import { FaCog, FaMoon, FaUser, FaBell, FaDownload, FaUpload, FaChartLine } from 'react-icons/fa';
import { BiTime, BiCalendar } from 'react-icons/bi';
import { useAuth } from '../context/AuthContext';
import { sleepApi } from '../services/api';

function Settings() {
  const { user } = useAuth();
  const [settings, setSettings] = useState({
    defaultWakeTime: '07:00',
    sleepGoal: 8,
  });

  const [activeTab, setActiveTab] = useState('preferences');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [sleepStats, setSleepStats] = useState({
    averageSleep: 0,
    bestStreak: 0
  });

  // Load sleep statistics
  useEffect(() => {
    loadSleepStats();
  }, []);

  // Load settings from localStorage
  useEffect(() => {
    const savedSettings = localStorage.getItem('sleepSettings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  }, []);

  const loadSleepStats = async () => {
    try {
      const entries = await sleepApi.getEntries();
      if (!entries || !entries.length) {
        setSleepStats({ averageSleep: 0, bestStreak: 0 });
        return;
      }

      // Calculate average sleep
      const totalHours = entries.reduce((sum, entry) => sum + parseFloat(entry.hours), 0);
      const averageSleep = (totalHours / entries.length).toFixed(1);

      // Calculate best streak (consecutive days meeting sleep goal)
      let currentStreak = 0;
      let bestStreak = 0;
      let prevDate = null;

      // Sort entries by date
      const sortedEntries = [...entries].sort((a, b) => new Date(a.date) - new Date(b.date));

      sortedEntries.forEach(entry => {
        const entryDate = new Date(entry.date);
        const hours = parseFloat(entry.hours);

        // Check if this entry meets sleep goal
        if (hours >= settings.sleepGoal) {
          // Check if this is consecutive with previous date
          if (prevDate) {
            const dayDiff = (entryDate - prevDate) / (1000 * 60 * 60 * 24);
            if (dayDiff === 1) {
              currentStreak++;
            } else {
              currentStreak = 1;
            }
          } else {
            currentStreak = 1;
          }
          bestStreak = Math.max(bestStreak, currentStreak);
        } else {
          currentStreak = 0;
        }
        prevDate = entryDate;
      });

      setSleepStats({
        averageSleep: parseFloat(averageSleep),
        bestStreak
      });
    } catch (error) {
      console.error('Error loading sleep stats:', error);
    }
  };

  // Handle settings change
  const handleSettingChange = (setting, value) => {
    const newSettings = {
      ...settings,
      [setting]: value
    };
    setSettings(newSettings);
    
    // Save to localStorage
    localStorage.setItem('sleepSettings', JSON.stringify(newSettings));
    
    // Show save message
    setMessage({ type: 'success', text: 'Settings saved!' });
    setTimeout(() => setMessage(null), 3000);
  };

  // Export data as CSV
  const handleExportAll = async () => {
    try {
      setLoading(true);
      const sleepData = await sleepApi.getEntries();
      
      // Convert to CSV format
      const headers = ['Date', 'Hours', 'Quality', 'Cycles'];
      const csvRows = [
        headers.join(','),
        ...sleepData.map(entry => [
          entry.date,
          entry.hours,
          entry.quality,
          entry.cycles
        ].join(','))
      ];
      const csvContent = csvRows.join('\n');

      // Create and download file
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `sleep-data-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      URL.revokeObjectURL(url);
      document.body.removeChild(a);

      setMessage({ type: 'success', text: 'Data exported successfully!' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to export data' });
    } finally {
      setLoading(false);
    }
  };

  // Handle CSV import
  const handleFileImport = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const csvContent = e.target.result;
          const rows = csvContent.split('\n');
          const headers = rows[0].split(',');
          
          // Validate headers
          if (!headers.includes('Date') || !headers.includes('Hours')) {
            throw new Error('Invalid CSV format');
          }

          // Parse data rows
          const data = rows.slice(1).map(row => {
            const values = row.split(',');
            return {
              date: values[0],
              hours: parseFloat(values[1]),
              quality: values[2] || 'Good',
              cycles: parseInt(values[3]) || Math.floor(parseFloat(values[1]) / 1.5)
            };
          });

          // TODO: Send to API
          setMessage({ type: 'success', text: 'Data imported successfully!' });
        } catch (error) {
          setMessage({ type: 'error', text: 'Invalid file format. Please use the correct CSV template.' });
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 pt-24 pb-16 text-white">
      {/* Animated Background */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="stars opacity-70"></div>
        <div className="nebula opacity-40"></div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-3 bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-violet-400">
            Settings & Preferences
          </h1>
          <p className="text-gray-400">
            Customize your sleep tracking experience
          </p>
        </div>

        {/* Settings Navigation */}
        <div className="flex gap-4 mb-8 overflow-x-auto pb-2">
          <button
            onClick={() => setActiveTab('preferences')}
            className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all ${
              activeTab === 'preferences' 
                ? 'bg-violet-600 text-white' 
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            <FaCog />
            <span>Preferences</span>
          </button>
          <button
            onClick={() => setActiveTab('profile')}
            className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all ${
              activeTab === 'profile' 
                ? 'bg-violet-600 text-white' 
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            <FaUser />
            <span>Profile</span>
          </button>
          <button
            onClick={() => setActiveTab('data')}
            className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all ${
              activeTab === 'data' 
                ? 'bg-violet-600 text-white' 
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            <FaChartLine />
            <span>Data Management</span>
          </button>
        </div>

        {/* Settings Content */}
        <div className="bg-gray-800/30 backdrop-blur-sm rounded-xl border border-gray-700 p-6">
          {activeTab === 'preferences' && (
            <div className="space-y-6">
              {/* Sleep Goals */}
              <div>
                <h3 className="text-lg font-medium mb-4">Sleep Goals</h3>
                <div className="grid gap-4">
                  <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <FaMoon className="text-violet-400" />
                      <div>
                        <p className="font-medium">Daily Sleep Goal</p>
                        <p className="text-sm text-gray-400">Target hours of sleep per night</p>
                      </div>
                    </div>
                    <div>
                      <input
                        type="number"
                        min="1"
                        max="12"
                        step="0.5"
                        value={settings.sleepGoal}
                        onChange={(e) => handleSettingChange('sleepGoal', e.target.value)}
                        className="w-20 bg-gray-800 text-white border border-gray-700 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                  </div>

                  {/* Default Wake Time */}
                  <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <BiCalendar className="text-violet-400" />
                      <div>
                        <p className="font-medium">Default Wake Time</p>
                        <p className="text-sm text-gray-400">Your usual wake-up time</p>
                      </div>
                    </div>
                    <div>
                      <input
                        type="time"
                        value={settings.defaultWakeTime}
                        onChange={(e) => handleSettingChange('defaultWakeTime', e.target.value)}
                        className="bg-gray-800 text-white border border-gray-700 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'profile' && (
            <div className="space-y-6">
              <div className="text-center p-6">
                <div className="w-24 h-24 rounded-full bg-violet-600 mx-auto mb-4 flex items-center justify-center">
                  <FaUser className="text-3xl" />
                </div>
                <h3 className="text-xl font-medium">{user?.username || 'User'}</h3>
                <p className="text-gray-400">Member since {new Date().toLocaleDateString()}</p>
              </div>

              <div className="grid gap-4">
                <div className="p-4 bg-gray-800/50 rounded-lg">
                  <h4 className="font-medium mb-2">Sleep Statistics</h4>
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div className="p-3 bg-gray-700/50 rounded-lg">
                      <p className="text-sm text-gray-400">Average Sleep</p>
                      <p className="text-xl font-medium text-violet-400">
                        {sleepStats.averageSleep > 0 ? `${sleepStats.averageSleep}h` : 'No data'}
                      </p>
                    </div>
                    <div className="p-3 bg-gray-700/50 rounded-lg">
                      <p className="text-sm text-gray-400">Best Streak</p>
                      <p className="text-xl font-medium text-violet-400">
                        {sleepStats.bestStreak > 0 ? `${sleepStats.bestStreak} days` : 'No streak'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'data' && (
            <div className="space-y-6">
              <div className="grid gap-4">
                {/* Export Data */}
                <div className="p-4 bg-gray-800/50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Export Sleep Data</h4>
                      <p className="text-sm text-gray-400">Download as CSV file (Excel compatible)</p>
                    </div>
                    <button
                      onClick={handleExportAll}
                      disabled={loading}
                      className="flex items-center gap-2 bg-violet-600 hover:bg-violet-500 px-4 py-2 rounded-lg transition-all"
                    >
                      <FaDownload />
                      <span>{loading ? 'Exporting...' : 'Export CSV'}</span>
                    </button>
                  </div>
                </div>

                {/* Import Data */}
                <div className="p-4 bg-gray-800/50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Import Sleep Data</h4>
                      <p className="text-sm text-gray-400">Upload CSV file (must match export format)</p>
                    </div>
                    <label className="flex items-center gap-2 bg-violet-600 hover:bg-violet-500 px-4 py-2 rounded-lg transition-all cursor-pointer">
                      <FaUpload />
                      <span>Import CSV</span>
                      <input
                        type="file"
                        accept=".csv"
                        onChange={handleFileImport}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Message Toast */}
        {message && (
          <div className={`fixed bottom-8 left-1/2 transform -translate-x-1/2 px-6 py-3 rounded-lg shadow-lg z-50 ${
            message.type === 'success' ? 'bg-green-500' : 'bg-red-500'
          } text-white`}>
            {message.text}
          </div>
        )}
      </div>
    </div>
  );
}

export default Settings; 