import { useState, useEffect } from 'react';
import { FaMoon, FaBed, FaChartBar, FaStar, FaPlus, FaEdit, FaBug, FaExclamationTriangle, FaDownload, FaArrowLeft, FaArrowRight } from 'react-icons/fa';
import { BiAlarm, BiCalendar, BiSave, BiHappy, BiSad } from 'react-icons/bi';
import { FaRegLightbulb } from 'react-icons/fa';
import { BsEmojiSmile, BsEmojiNeutral, BsEmojiFrown, BsEmojiDizzy } from 'react-icons/bs';
import { sleepApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { FaSpinner } from 'react-icons/fa';
import { format, parseISO, startOfWeek, addDays, subWeeks, addWeeks, isSameWeek } from 'date-fns';

function WeeklyStats() {
  const { user } = useAuth();
  const [sleepData, setSleepData] = useState([]);
  const [bestDay, setBestDay] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showInputForm, setShowInputForm] = useState(false);
  const [debugMode, setDebugMode] = useState(false);
  const [graphType, setGraphType] = useState('both');
  const [currentWeekStart, setCurrentWeekStart] = useState(startOfWeek(new Date()));
  
  // Navigation functions
  const goToPreviousWeek = () => {
    const newWeekStart = subWeeks(currentWeekStart, 1);
    setCurrentWeekStart(newWeekStart);
  };

  const goToNextWeek = () => {
    const newWeekStart = addWeeks(currentWeekStart, 1);
    setCurrentWeekStart(newWeekStart);
  };

  const goToCurrentWeek = () => {
    const newWeekStart = startOfWeek(new Date());
    setCurrentWeekStart(newWeekStart);
  };

  // Add week navigation UI after the header
  useEffect(() => {
    const weekDays = Array(7).fill(null).map((_, index) => {
      const date = addDays(currentWeekStart, index);
      return {
        date: format(date, 'yyyy-MM-dd'),
        day: format(date, 'EEE'),
        dayIndex: index,
        hours: 0,
        quality: 'No Data',
        cycles: 0,
        hasSleepData: false
      };
    });
    setSleepData(weekDays);
    loadSleepData();
  }, [currentWeekStart]);

  // Form states
  const [selectedDate, setSelectedDate] = useState('');
  const [sleepHours, setSleepHours] = useState(7);
  const [sleepQuality, setSleepQuality] = useState('Good');
  const [selectedDay, setSelectedDay] = useState(null);
  const [showSaveConfirmation, setShowSaveConfirmation] = useState(false);

  // Error and loading states
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Add these new state variables
  const [sleepGoal, setSleepGoal] = useState(8);
  const [showGoalLine, setShowGoalLine] = useState(true);

  // Load sleep goal from settings
  useEffect(() => {
    const savedSettings = localStorage.getItem('sleepSettings');
    if (savedSettings) {
      const settings = JSON.parse(savedSettings);
      setSleepGoal(parseFloat(settings.sleepGoal) || 8);
    }
  }, []);

  // Initialize week data structure
  useEffect(() => {
    const weekDays = Array(7).fill(null).map((_, index) => {
      const date = addDays(currentWeekStart, index);
      return {
        date: format(date, 'yyyy-MM-dd'),
        day: format(date, 'EEE'),
        dayIndex: index,
        hours: 0,
        quality: 'No Data',
        cycles: 0,
        hasSleepData: false
      };
    });
    setSleepData(weekDays);
    loadSleepData();
  }, [currentWeekStart]);

  // Load sleep data from API
  const loadSleepData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const data = await sleepApi.getEntries();
      if (!data || !Array.isArray(data)) {
        throw new Error('Invalid data format received from server');
      }
      
      // Create a map of the selected week's days
      const weekDays = Array(7).fill(null).map((_, index) => {
        const date = addDays(currentWeekStart, index);
        return {
          date: format(date, 'yyyy-MM-dd'),
          day: format(date, 'EEE'),
          dayIndex: index,
          hours: 0,
          quality: 'No Data',
          cycles: 0,
          hasSleepData: false
        };
      });
      
      // Process each entry and match with the correct day
      data.forEach(entry => {
        const entryDate = parseISO(entry.date);
        const entryDateStr = format(entryDate, 'yyyy-MM-dd');
        
        // Find the matching day in weekDays array by exact date match
        const matchingDay = weekDays.find(day => day.date === entryDateStr);
        
        if (matchingDay) {
          const dayIndex = weekDays.indexOf(matchingDay);
          weekDays[dayIndex] = {
            ...weekDays[dayIndex],
            hours: parseFloat(entry.hours) || 0,
            quality: entry.quality || 'Good',
            cycles: Math.round((parseFloat(entry.hours) || 0) / 1.5),
            hasSleepData: true,
            _id: entry._id
          };
        }
      });
      
      setSleepData(weekDays);
      
      // Find best day for the current week
      const daysWithData = weekDays.filter(day => day.hasSleepData);
      if (daysWithData.length > 0) {
        const best = daysWithData.reduce((prev, curr) => 
          (curr.hours >= 7 && curr.hours <= 9) ? curr : prev
        );
        setBestDay(best);
      } else {
        setBestDay(null);
      }
      
    } catch (err) {
      console.error('Error loading sleep data:', err);
      setError('Failed to load your sleep data. Please try again later.');
    } finally {
      setIsLoading(false);
      setLoading(false);
    }
  };

  // Set today's date
  const setTodayDate = () => {
    const today = new Date();
    const formattedDate = format(today, 'yyyy-MM-dd');
    setSelectedDate(formattedDate);
    // Find today's index in the week data
    const todayIndex = today.getDay();
    setSelectedDay(formattedDate); // Set selectedDay to the formatted date string
  };

  // Select a specific day
  const selectDay = (index) => {
    const selectedData = sleepData[index];
    if (!selectedData) return;
    
    const selectedDateStr = selectedData.date;
    setSelectedDate(selectedDateStr);
    setSelectedDay(selectedDateStr);
    
    if (selectedData.hasSleepData) {
      setSleepHours(selectedData.hours.toString());
      setSleepQuality(selectedData.quality);
    } else {
      setSleepHours('7');
      setSleepQuality('Good');
    }
    setShowInputForm(true);
  };

  // Save manual sleep data to API
  const saveManualSleepData = async () => {
    try {
      if (!selectedDate || !sleepHours) {
        alert('Please select a date and enter sleep hours');
        return;
      }

      const hours = parseFloat(sleepHours);
      if (isNaN(hours) || hours < 0 || hours > 24) {
        alert('Please enter valid sleep hours between 0 and 24');
        return;
      }

      // Check authentication
      if (!user) {
        alert('Please log in to save sleep entries');
        return;
      }

      // Map sleep quality based on hours
      let quality;
      if (hours < 6) {
        quality = 'Light';
      } else if (hours < 8) {
        quality = 'Good';
      } else {
        quality = 'Optimal';
      }

      // Calculate cycles (assuming each cycle is ~90 minutes)
      const cycles = Math.floor((hours * 60) / 90);

      // Format date to match backend expectations (YYYY-MM-DD)
      const selectedDateObj = new Date(selectedDate);
      const formattedDate = format(selectedDateObj, 'yyyy-MM-dd');

      // Check if an entry already exists for this date
      const existingEntry = await sleepApi.getEntries();
      const existingDayEntry = existingEntry.find(entry => entry.date === formattedDate);

      let response;
      if (existingDayEntry) {
        // Update existing entry
        response = await sleepApi.updateEntry(existingDayEntry._id, {
          date: formattedDate,
          hours,
          quality,
          cycles
        });
      } else {
        // Create new entry
        response = await sleepApi.addEntry({
          date: formattedDate,
          hours,
          quality,
          cycles
        });
      }

      if (!response) {
        throw new Error('No response received from server');
      }

      // Show success message
      setShowSaveConfirmation(true);
      setTimeout(() => setShowSaveConfirmation(false), 3000);

      // Clear form
      setSelectedDate('');
      setSelectedDay(null);
      setSleepHours('');
      setSleepQuality('');
      setShowInputForm(false);

      // Refresh the data
      loadSleepData();

    } catch (error) {
      console.error('Error saving sleep entry:', error);
      let errorMessage = 'Failed to save sleep entry. ';
      
      if (error.message.includes('No authentication token found')) {
        errorMessage += 'Please log in again.';
      } else if (error.message.includes('401')) {
        errorMessage += 'Your session has expired. Please log in again.';
      } else {
        errorMessage += error.message || 'Please try again.';
      }
      
      alert(errorMessage);
      setShowInputForm(true);
      
      if (error.message.includes('No authentication token') || error.message.includes('401')) {
        window.location.href = '/login';
      }
    }
  };

  // Reset all data
  const resetAllData = async () => {
    if (!window.confirm('Are you sure you want to reset all sleep data? This action cannot be undone.')) {
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const entries = await sleepApi.getEntries();
      
      // Delete all entries
      const deletePromises = entries.map(entry => sleepApi.deleteEntry(entry._id));
      await Promise.all(deletePromises);
      
      // Reset local state
      const startDate = startOfWeek(new Date());
      const weekDays = Array(7).fill(null).map((_, index) => ({
        date: format(addDays(startDate, index), 'yyyy-MM-dd'),
        day: format(addDays(startDate, index), 'EEE'),
        dayIndex: index,
        hours: 0,
        quality: 'No Data',
        cycles: 0,
        hasSleepData: false
      }));
      
      setSleepData(weekDays);
      setBestDay(null);
      setSelectedDay(null);
      setSelectedDate('');
      setSleepHours(7);
      setSleepQuality('Good');
      setShowInputForm(false);
      
      // Show confirmation
      alert('All sleep data has been successfully reset.');
    } catch (err) {
      console.error('Error resetting data:', err);
      setError('Failed to reset sleep data. Please try again.');
      alert('Failed to reset sleep data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const getQualityColor = (quality) => {
    if (!quality || quality === 'No Data') return 'gray';
    if (quality === 'Light') return 'blue';
    if (quality === 'Good') return 'indigo';
    return 'violet';
  };

  const getQualityIconClass = (quality) => {
    const color = getQualityColor(quality);
    return `text-${color}-400`;
  };

  const getQualityBgClass = (quality) => {
    const color = getQualityColor(quality);
    return `bg-${color}-500/20`;
  };

  const getQualityTextClass = (quality) => {
    const color = getQualityColor(quality);
    return `text-${color}-400`;
  };

  // Get the maximum sleep hours for scaling the graph (with a minimum of 12 for scale)
  const maxHours = 12;
  
  // Helper to create gradient colors based on hours slept
  const getBarColor = (hours) => {
    if (!hours || hours === 0) return 'bg-gray-200';
    if (hours < sleepGoal) return 'bg-red-500';
    if (hours <= sleepGoal + 1) return 'bg-green-500';
    return 'bg-blue-500';
  };

  // Get sleep quality emoji based on hours
  const getSleepQualityEmoji = (hours) => {
    if (hours === 0) return null;
    if (hours < 6) return <BsEmojiFrown className="text-red-400" title="Insufficient sleep" />;
    if (hours < 7) return <BsEmojiNeutral className="text-blue-400" title="Adequate sleep" />;
    if (hours <= 9) return <BsEmojiSmile className="text-green-400" title="Optimal sleep" />;
    return <BsEmojiDizzy className="text-purple-400" title="Extended sleep" />;
  };

  // Get stroke color for the line based on hours
  const getLineStrokeColor = (hours) => {
    if (!hours || hours === 0) return '#CBD5E0';
    if (hours < 6) return '#F56565';
    if (hours < 7) return '#ECC94B';
    if (hours <= 9) return '#48BB78';
    return '#4299E1';
  };

  // Generate SVG path for line graph
  const generateLinePath = () => {
    // Filter days with data only
    const validPoints = sleepData
      .map((day, index) => ({ 
        index,
        hours: day.hasSleepData ? day.hours : 0
      }))
      .filter(point => point.hours > 0);
    
    if (validPoints.length === 0) return "";
    
    // Graph width divided by number of days (7)
    const segmentWidth = 100 / 7;
    // Calculate x position (centered in each segment)
    const getX = (index) => (index * segmentWidth) + (segmentWidth / 2);
    // Calculate y position (inverted since SVG y=0 is at top)
    const getY = (hours) => 100 - ((hours / maxHours) * 100);
    
    if (validPoints.length === 1) {
      // Just return a point marker
      const point = validPoints[0];
      return `M${getX(point.index)},${getY(point.hours)} a2,2 0 1,0 0.1,0`;
    }

    // Sort by index to connect points in order
    validPoints.sort((a, b) => a.index - b.index);
    
    // Create path starting from the first point
    let path = `M${getX(validPoints[0].index)},${getY(validPoints[0].hours)}`;
    
    // Add line segments to each subsequent point
    for (let i = 1; i < validPoints.length; i++) {
      path += ` L${getX(validPoints[i].index)},${getY(validPoints[i].hours)}`;
    }
    
    return path;
  };

  // Render graph component
  const renderGraph = () => {
    const maxHours = 12;
    const barWidth = 100 / sleepData.length;
    
    return (
      <div className="relative w-full h-64 mt-4">
        {/* Bar Chart */}
        {graphType !== 'line' && (
          <div className="absolute inset-0 flex items-end justify-around">
            {sleepData.map((day, index) => (
              <div
                key={day.date}
                className="relative flex flex-col items-center w-full"
                onClick={() => selectDay(index)}
              >
                <div 
                  className={`w-${Math.floor(barWidth)}% ${getBarColor(day.hours)} rounded-t transition-all duration-300 cursor-pointer hover:opacity-80`}
                  style={{
                    height: `${(day.hours / maxHours) * 100}%`,
                    minHeight: day.hours ? '4px' : '0'
                  }}
                >
                  <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs">
                    {day.hours > 0 ? `${day.hours}h` : ''}
                  </div>
                </div>
                <div className="mt-2 text-xs">{day.day}</div>
              </div>
            ))}
          </div>
        )}
        
        {/* Line Graph */}
        {graphType !== 'bar' && (
          <svg
            className="absolute inset-0"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
          >
            <path
              d={generateLinePath()}
              fill="none"
              stroke={getLineStrokeColor(8)}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {sleepData.map((day, index) => (
              day.hasSleepData && (
                <circle
                  key={day.date}
                  cx={`${(index * (100 / (sleepData.length - 1))) + (100 / (sleepData.length * 2))}%`}
                  cy={`${100 - ((day.hours / maxHours) * 100)}%`}
                  r="2"
                  fill={getLineStrokeColor(day.hours)}
                  className="cursor-pointer hover:r-3 transition-all duration-300"
                  onClick={() => selectDay(index)}
                />
              )
            ))}
          </svg>
        )}
      </div>
    );
  };

  // Error Message Component
  const ErrorMessage = () => {
    if (!error) return null;
    
    return (
      <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center gap-2">
        <FaExclamationTriangle />
        {error}
      </div>
    );
  };

  // Loading Spinner Component
  const LoadingSpinner = () => {
    if (!isLoading) return null;
    
    return (
      <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-gray-800 rounded-lg p-6 flex items-center gap-3">
          <FaSpinner className="text-violet-500 text-2xl animate-spin" />
          <span className="text-white">Loading...</span>
        </div>
      </div>
    );
  };

  // Add this function after other function definitions
  const exportSleepData = () => {
    try {
      // Convert sleep data to CSV format
      const headers = ['Date', 'Hours', 'Quality', 'Cycles'];
      const csvData = sleepData
        .filter(day => day.hasSleepData)
        .map(day => [
          day.date,
          day.hours,
          day.quality,
          day.cycles
        ]);
      
      // Add headers to CSV data
      const csvContent = [
        headers.join(','),
        ...csvData.map(row => row.join(','))
      ].join('\n');
      
      // Create and download file
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `sleep-data-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error exporting data:', error);
      alert('Failed to export data. Please try again.');
    }
  };

  return (
    <div className="min-h-screen pt-16 pb-16 bg-gray-900 text-white">
      {/* Animated Background */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="stars opacity-70"></div>
        <div className="nebula opacity-40"></div>
      </div>
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-3 bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-violet-400">
            Your Sleep Insights
          </h1>
          <p className="text-gray-400 max-w-lg mx-auto">
            Track your sleep patterns over time and identify trends to improve your rest quality
          </p>
        </div>
        
        {/* Controls */}
        <div className="flex flex-wrap gap-3 justify-center mb-6">
          <button 
            onClick={() => setShowInputForm(!showInputForm)}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg transition-all"
            style={{ backgroundColor: 'var(--accent-primary)' }}
          >
            <FaPlus />
            <span>Add Sleep Entry</span>
          </button>
          
          <button 
            onClick={resetAllData}
            className="flex items-center gap-2 px-4 py-2 rounded-lg transition-all"
            style={{ 
              backgroundColor: 'var(--bg-secondary)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border-primary)'
            }}
          >
            <BiCalendar />
            <span>Reset All Data</span>
          </button>
          
          <button 
            onClick={exportSleepData}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-lg transition-all"
            style={{ backgroundColor: 'var(--success)' }}
          >
            <FaDownload />
            <span>Export Data</span>
          </button>
        </div>

        {/* Graph Type Selector */}
        <div className="flex justify-center gap-2 mb-4">
          <button
            onClick={() => setGraphType('bar')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
              graphType === 'bar' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            Bar Graph
          </button>
          <button
            onClick={() => setGraphType('line')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
              graphType === 'line' 
                ? 'bg-violet-600 text-white' 
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            Line Graph
          </button>
          <button
            onClick={() => setGraphType('both')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
              graphType === 'both' 
                ? 'bg-indigo-600 text-white' 
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            Combined
          </button>
        </div>

        {/* Sleep Quality Legend */}
        <div className="flex justify-center flex-wrap gap-2 mb-4 text-xs bg-gray-800/40 rounded-lg py-2 px-3">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <span className="text-red-400"><BsEmojiFrown className="inline mr-1" /> &lt;6h (Insufficient)</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
            <span className="text-blue-400"><BsEmojiNeutral className="inline mr-1" /> 6-7h (Adequate)</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span className="text-green-400"><BsEmojiSmile className="inline mr-1" /> 7-9h (Optimal)</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-purple-500"></div>
            <span className="text-purple-400"><BsEmojiDizzy className="inline mr-1" /> &gt;9h (Extended)</span>
          </div>
        </div>

        {/* Day Selector */}
        <div className="flex justify-center gap-2 mb-6">
          {sleepData.map((day, index) => (
            <button
              key={index}
              onClick={() => selectDay(index)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                selectedDate === day.date
                  ? 'bg-violet-600 text-white' 
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              {day.day}
            </button>
          ))}
        </div>

        {/* Simplified Manual Input Form */}
        {showInputForm && (
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/40 p-5 mb-6 shadow-lg">
            <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
              <FaEdit className="text-violet-400" />
              <span>Quick Sleep Entry</span>
            </h3>
            
            {/* Date Selection with Today button */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-300 mb-1">When did you sleep?</label>
              <div className="flex gap-2">
                <input 
                  type="date" 
                  className="flex-1 bg-gray-900/60 border border-gray-700 rounded-lg px-3 py-2 text-white"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                />
                <button 
                  onClick={setTodayDate}
                  className="bg-gray-700 hover:bg-gray-600 px-3 py-2 rounded-lg text-sm"
                >
                  Today
                </button>
              </div>
            </div>
            
            {/* Simple Hours Slider */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Hours of Sleep: <span className="text-white font-bold">{sleepHours}</span>
                <span className="ml-2">
                  {getSleepQualityEmoji(parseFloat(sleepHours))}
                </span>
              </label>
              <input
                type="range"
                min="1"
                max="12"
                step="0.5"
                value={sleepHours}
                onChange={(e) => setSleepHours(e.target.value)}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>1hr</span>
                <span>4hrs</span>
                <span>7hrs</span>
                <span>10hrs</span>
                <span>12hrs</span>
              </div>
            </div>
            
            {/* Simple Quality Selector */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-300 mb-2">How was your sleep quality?</label>
              <div className="flex gap-2">
                <button
                  className={`flex-1 py-2 rounded-lg ${sleepQuality === 'Light' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300'}`}
                  onClick={() => setSleepQuality('Light')}
                >
                  Light
                </button>
                <button
                  className={`flex-1 py-2 rounded-lg ${sleepQuality === 'Good' ? 'bg-indigo-600 text-white' : 'bg-gray-700 text-gray-300'}`}
                  onClick={() => setSleepQuality('Good')}
                >
                  Good
                </button>
                <button
                  className={`flex-1 py-2 rounded-lg ${sleepQuality === 'Optimal' ? 'bg-violet-600 text-white' : 'bg-gray-700 text-gray-300'}`}
                  onClick={() => setSleepQuality('Optimal')}
                >
                  Optimal
                </button>
              </div>
            </div>
            
            <div className="flex justify-end">
              <button 
                onClick={saveManualSleepData}
                className="flex items-center gap-2 bg-violet-600 hover:bg-violet-500 text-white px-6 py-2 rounded-lg transition-all"
                disabled={!selectedDate}
              >
                <BiSave />
                <span>Save</span>
              </button>
            </div>
          </div>
        )}

        <ErrorMessage />
        <LoadingSpinner />

        {/* Main Dashboard */}
        <div className="bg-gray-800/30 backdrop-blur-sm rounded-3xl border border-gray-700/50 p-6 mb-8 relative overflow-hidden">
          {/* Background Glow */}
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/5 to-violet-600/10 z-0"></div>
          
          <div className="relative z-10">
            {/* Section Title */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <FaChartBar className="text-violet-400 text-xl" />
                <h3 className="text-lg font-semibold">Weekly Sleep Overview</h3>
              </div>
              
              {bestDay && bestDay.hasSleepData && (
                <div className="bg-gray-800/50 rounded-xl p-2 border border-gray-700/50 backdrop-blur-sm">
                  <div className="text-xs text-gray-400">Best Sleep: {bestDay.day}</div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-lg font-bold text-white">{bestDay.hours.toFixed(1)}</span>
                    <span className="text-xs text-gray-400">hrs</span>
                    <span className="ml-1">{getSleepQualityEmoji(bestDay.hours)}</span>
                  </div>
                </div>
              )}
            </div>
            
            {/* Add week navigation UI after the header */}
            <div className="flex items-center justify-between mb-6 px-4">
              <button
                onClick={goToPreviousWeek}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-800/50 hover:bg-gray-700/50 transition-all"
              >
                <FaArrowLeft />
                Previous Week
              </button>
              
              <div className="flex flex-col items-center">
                <button
                  onClick={goToCurrentWeek}
                  className="px-4 py-2 rounded-lg bg-violet-600/50 hover:bg-violet-500/50 transition-all text-sm"
                >
                  Current Week
                </button>
                <span className="text-sm text-gray-400 mt-2">
                  Week of {format(currentWeekStart, 'MMM d, yyyy')}
                </span>
              </div>
              
              <button
                onClick={goToNextWeek}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-800/50 hover:bg-gray-700/50 transition-all"
              >
                Next Week
                <FaArrowRight />
              </button>
            </div>
            
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <div className="w-12 h-12 border-2 border-violet-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : (
              <>
                {/* Sleep Duration Graph */}
                <div className="relative h-96 mt-4 mb-8 bg-gray-900/50 rounded-3xl p-6 border border-gray-700/30 overflow-hidden">
                  {/* Night sky background */}
                  <div className="absolute inset-0 bg-gradient-to-b from-gray-900 via-[#0F1A4D] to-[#0A1130]">
                    {/* Subtle stars in background */}
                    <div className="absolute inset-0 opacity-30">
                      {Array.from({ length: 50 }).map((_, i) => (
                        <div
                          key={i}
                          className="absolute w-0.5 h-0.5 bg-white rounded-full animate-twinkle"
                          style={{
                            top: `${Math.random() * 100}%`,
                            left: `${Math.random() * 100}%`,
                            animationDelay: `${Math.random() * 3}s`
                          }}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Y-axis labels */}
                  <div className="absolute left-0 top-0 bottom-0 w-16 flex flex-col justify-between text-xs">
                    {Array.from({length: 13}, (_, i) => 12 - i).map(hour => (
                      <div key={hour} className="flex items-center justify-end pr-4 text-gray-400/80">
                        <span className="font-light">{hour}h</span>
                      </div>
                    ))}
                  </div>

                  {/* Sleep Goal Line */}
                  {showGoalLine && (
                    <div 
                      className="absolute left-16 right-0 z-10 pointer-events-none"
                      style={{ 
                        bottom: `${(sleepGoal / maxHours) * 100}%`,
                      }}
                    >
                      {/* Goal line with gradient */}
                      <div className="relative w-full">
                        {/* Gradient line */}
                        <div className="absolute inset-0 h-[2px] bg-gradient-to-r from-yellow-500/20 via-yellow-500/40 to-yellow-500/20"></div>
                        
                        {/* Glowing effect */}
                        <div className="absolute inset-0 h-[2px] bg-yellow-500/20 blur-[2px]"></div>
                        
                        {/* Label */}
                        <div className="absolute -left-14 top-0 transform -translate-y-1/2 bg-gray-800/90 px-2 py-1 rounded text-xs text-yellow-500 flex items-center gap-1.5">
                          <FaStar className="text-yellow-500" />
                          Goal: {sleepGoal}h
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Add toggle for goal line */}
                  <div className="absolute top-4 right-4 z-20">
                    <button
                      onClick={() => setShowGoalLine(!showGoalLine)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                        showGoalLine 
                          ? 'bg-yellow-500/20 text-yellow-500' 
                          : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                      }`}
                    >
                      {showGoalLine ? 'Hide Goal' : 'Show Goal'}
                    </button>
                  </div>

                  {/* Graph Area */}
                  <div className="ml-16 h-full relative">
                    {/* Horizontal grid lines */}
                    <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                      {Array.from({length: 13}, (_, i) => (
                        <div key={i} className="border-t border-gray-600/20 w-full h-0"></div>
                      ))}
                    </div>

                    {/* Line Graph */}
                    {(graphType === 'line' || graphType === 'both') && (
                      <div className="absolute inset-0 pointer-events-none">
                        <svg
                          width="100%"
                          height="100%"
                          viewBox="0 0 100 100"
                          preserveAspectRatio="none"
                          className="overflow-visible"
                        >
                          {/* Gradient Definitions */}
                          <defs>
                            <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                              <stop offset="0%" stopColor="#818cf8" />
                              <stop offset="100%" stopColor="#a78bfa" />
                            </linearGradient>
                            <filter id="glow">
                              <feGaussianBlur stdDeviation="1" result="coloredBlur"/>
                              <feMerge>
                                <feMergeNode in="coloredBlur"/>
                                <feMergeNode in="SourceGraphic"/>
                              </feMerge>
                            </filter>
                          </defs>

                          {/* Connecting lines */}
                          {sleepData.map((day, index) => {
                            if (!day.hasSleepData || index === sleepData.length - 1) return null;
                            const nextDay = sleepData[index + 1];
                            if (!nextDay.hasSleepData) return null;

                            const segmentWidth = 100 / 7;
                            const x1 = (index * segmentWidth) + (segmentWidth / 2);
                            const y1 = 100 - ((day.hours / maxHours) * 100);
                            const x2 = ((index + 1) * segmentWidth) + (segmentWidth / 2);
                            const y2 = 100 - ((nextDay.hours / maxHours) * 100);

                            return (
                              <line
                                key={`line-${index}`}
                                x1={x1}
                                y1={y1}
                                x2={x2}
                                y2={y2}
                                stroke="url(#lineGradient)"
                                strokeWidth="1"
                                filter="url(#glow)"
                              />
                            );
                          })}

                          {/* Data points as stars */}
                          {sleepData.map((day, index) => {
                            if (!day.hasSleepData) return null;

                            const segmentWidth = 100 / 7;
                            const cx = (index * segmentWidth) + (segmentWidth / 2);
                            const cy = 100 - ((day.hours / maxHours) * 100);

                            return (
                              <g key={`star-${index}`}>
                                {/* Star shape */}
                                <path
                                  d={`M ${cx},${cy-2} l 1,2 2,0.5 -1.5,1.5 0.5,2 -2,-1 -2,1 0.5,-2 -1.5,-1.5 2,-0.5 z`}
                                  fill={getLineStrokeColor(day.hours)}
                                  filter="url(#glow)"
                                />
                              </g>
                            );
                          })}
                        </svg>
                      </div>
                    )}

                    {/* Bar Graph */}
                    {(graphType === 'bar' || graphType === 'both') && (
                      <div className="absolute inset-0 flex items-end">
                        <div className="w-full h-full flex justify-between items-end">
                          {sleepData.map((day, index) => (
                            <div 
                              key={index} 
                              className="flex flex-col items-center flex-1 px-1 group cursor-pointer"
                              onClick={() => selectDay(index)}
                            >
                              <div className="relative w-full h-full flex items-end justify-center">
                                {/* Bar */}
                                {day.hasSleepData && (
                                  <div 
                                    className={`w-3/4 rounded-t-md transition-all duration-500 ${getBarColor(day.hours)}`}
                                    style={{ 
                                      height: `${Math.max((day.hours / maxHours) * 100, 2)}%`,
                                      opacity: graphType === 'both' ? '0.7' : '1'
                                    }}
                                  >
                                    {/* Tooltip */}
                                    <div className="opacity-0 group-hover:opacity-100 absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-gray-800/90 backdrop-blur-sm text-white text-xs px-3 py-2 rounded-lg pointer-events-none whitespace-nowrap transition-all duration-200 z-10 border border-gray-700/50">
                                      <div className="font-medium flex items-center gap-1">
                                        {day.hours.toFixed(1)} hours
                                        <span className="ml-1">{getSleepQualityEmoji(day.hours)}</span>
                                      </div>
                                      <div className="text-gray-400 text-[10px] mt-1">{day.cycles} cycles</div>
                                    </div>
                                  </div>
                                )}
                              </div>

                              {/* Day label with emoji */}
                              <div className="mt-4 flex flex-col items-center gap-1">
                                <span className={day.hasSleepData ? 'text-gray-300' : 'text-gray-600'}>
                                  {day.day}
                                </span>
                                {day.hasSleepData && (
                                  <div className="text-lg">
                                    {getSleepQualityEmoji(day.hours)}
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Daily Sleep Cards */}
                <div className="space-y-3">
                  {!sleepData.some(day => day.hasSleepData) ? (
                    <div className="text-center py-6 bg-gray-800/20 rounded-lg border border-gray-700/50">
                      <p className="text-gray-400">No sleep data recorded yet</p>
                      <p className="text-sm text-gray-500 mt-1">
                        Click "Add Sleep Entry" above to log your sleep
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {sleepData.filter(day => day.hasSleepData).map((day) => (
                        <div
                          key={day.date}
                          className="bg-gray-800/30 backdrop-blur-sm rounded-xl border border-gray-700/50 p-4 hover:bg-gray-800/40 transition-all"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className={`p-2 rounded-lg ${getQualityBgClass(day.quality)}`}>
                                <FaMoon className={`text-lg ${getQualityTextClass(day.quality)}`} />
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="font-medium">{day.day}</span>
                                  <span className="text-xs text-gray-400">{day.date}</span>
                                </div>
                                <div className="flex items-center gap-4 mt-1 text-sm text-gray-300">
                                  <div className="flex items-center gap-1.5">
                                    <BiAlarm className="text-violet-400" />
                                    <span className="flex items-center">
                                      {day.hours.toFixed(1)} hrs
                                      <span className="ml-1">{getSleepQualityEmoji(day.hours)}</span>
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-1.5">
                                    <FaBed className="text-violet-400" />
                                    <span>{day.cycles} cycles</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Replace the existing warning message section with this combined feedback section */}
                {(() => {
                  const daysWithData = sleepData.filter(day => day.hasSleepData);
                  const daysBelow = daysWithData.filter(day => day.hours < sleepGoal).length;
                  const daysAbove = daysWithData.filter(day => day.hours >= sleepGoal).length;
                  
                  if (daysWithData.length === 0) return null;

                  return (
                    <div className="mt-4 space-y-3">
                      {/* Warning for below goal */}
                      {daysBelow >= 3 && (
                        <div className="p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-sm text-red-400">
                          <p className="flex items-center gap-2">
                            <FaExclamationTriangle />
                            You've been below your sleep goal for {daysBelow} days. Try to get more rest to meet your target of {sleepGoal} hours.
                          </p>
                        </div>
                      )}
                      
                      {/* Positive feedback for meeting goal */}
                      {daysAbove >= 3 && (
                        <div className="p-3 bg-green-500/20 border border-green-500/30 rounded-lg text-sm text-green-400">
                          <p className="flex items-center gap-2">
                            <FaStar className="text-yellow-400" />
                            Great job! You've met your sleep goal of {sleepGoal} hours for {daysAbove} days. Keep up the good work!
                          </p>
                        </div>
                      )}
                      
                      {/* Special achievement for perfect week */}
                      {daysWithData.length >= 5 && daysAbove === daysWithData.length && (
                        <div className="p-3 bg-violet-500/20 border border-violet-500/30 rounded-lg text-sm text-violet-400">
                          <p className="flex items-center gap-2">
                            <FaRegLightbulb className="text-yellow-400" />
                            Outstanding! You've consistently met your sleep goal every day this week. Your sleep habits are excellent!
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })()}
              </>
            )}
          </div>
        </div>
        
        {/* Tips Section */}
        <div className="bg-gray-800/30 backdrop-blur-sm rounded-xl border border-gray-700/50 p-5">
          <div className="flex items-center gap-3 mb-3">
            <FaRegLightbulb className="text-amber-400 text-lg" />
            <h3 className="text-base font-medium">Sleep Tips</h3>
          </div>
          <div className="text-sm text-gray-300">
            <p>Track your sleep consistently to identify patterns and improve your sleep quality over time.</p>
            <p className="mt-2">Aim for 7-9 hours of sleep for optimal health and cognitive function.</p>
          </div>
        </div>
      </div>

      {/* Add these new styles at the end of the file */}
      <style>
        {`
          @keyframes twinkle {
            0%, 100% { opacity: 0.4; }
            50% { opacity: 0.8; }
          }

          .animate-twinkle {
            animation: twinkle 3s ease-in-out infinite;
          }
        `}
      </style>
    </div>
  );
}

export default WeeklyStats; 