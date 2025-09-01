import { useState, useEffect, useCallback } from 'react';
import { FaMoon, FaSun, FaRegLightbulb, FaCalculator } from 'react-icons/fa';
import { BiAlarm, BiMoon } from 'react-icons/bi';
import { BsLightning, BsStars } from 'react-icons/bs';
import { format, addMinutes, subMinutes, parse } from 'date-fns';
import Clock from 'react-clock';
import 'react-clock/dist/Clock.css';
import { sleepApi } from '../services/api';

function SleepCalculator() {
  const [mode, setMode] = useState('sleep');
  const [selectedTime, setSelectedTime] = useState(new Date());
  const [sleepCycles, setSleepCycles] = useState([]);
  const [selectedCycle, setSelectedCycle] = useState(null);
  const [showSaveConfirmation, setShowSaveConfirmation] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);
  const [animateCalculate, setAnimateCalculate] = useState(false);
  
  // Keep track of current time for "Sleep Now" mode
  const [currentTime, setCurrentTime] = useState(new Date());

  // Add this state
  const [defaultWakeTime, setDefaultWakeTime] = useState(null);

  // Update current time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  // Update or initialize selectedTime based on mode
  useEffect(() => {
    // Only initialize the time once when the component mounts or mode switches
    if (mode === 'sleep' && !selectedTime) {
      setSelectedTime(new Date());
    }
  }, [mode]);

  // Add this useEffect
  useEffect(() => {
    // Load default wake time from localStorage
    const savedWakeTime = localStorage.getItem('defaultWakeTime');
    if (savedWakeTime) {
      setDefaultWakeTime(savedWakeTime);
    }
  }, []);

  // Load default wake time from settings
  useEffect(() => {
    const savedSettings = localStorage.getItem('sleepSettings');
    if (savedSettings) {
      const settings = JSON.parse(savedSettings);
      if (settings.defaultWakeTime) {
        setDefaultWakeTime(settings.defaultWakeTime);
      }
    }
  }, []);

  // Function to calculate sleep cycles - only triggered by Calculate button
  const calculateSleepCycles = () => {
    setIsCalculating(true);
    setAnimateCalculate(true);
    
    // Slight delay for animation effect
    setTimeout(() => {
      try {
        let baseTime = selectedTime;
        
        // Validate baseTime
        if (!(baseTime instanceof Date) || isNaN(baseTime.getTime())) {
          console.error("Invalid baseTime for calculation:", baseTime);
          setSleepCycles([]); // Clear cycles if time is invalid
          setIsCalculating(false);
          return;
        }

        const cycles = [];
        const CYCLE_LENGTH = 90; // minutes
        const FALL_ASLEEP_TIME = 14; // minutes

        // Calculate cycles (4-7 cycles for proper sleep duration)
        const cycleRange = mode === 'sleep' ? [1, 2, 3, 4, 5, 6, 7] : [7, 6, 5, 4, 3, 2, 1];
        
        for (const i of cycleRange) {
          let cycleTime;
          if (mode === 'sleep') {
            // Add fall asleep time to initial calculation (from selected bedtime)
            cycleTime = addMinutes(baseTime, FALL_ASLEEP_TIME + (CYCLE_LENGTH * i));
          } else {
            // Subtract from wake time to get bedtimes
            cycleTime = subMinutes(baseTime, FALL_ASLEEP_TIME + (CYCLE_LENGTH * i));
          }

          const totalMinutes = CYCLE_LENGTH * i;
          const totalHours = totalMinutes / 60;

          cycles.push({
            time: format(cycleTime, 'h:mm a'),
            cycles: i, // Use actual cycle count for both modes
            minutes: totalMinutes,
            hours: totalHours,
            quality: getQualityForCycles(i),
            category: getCycleCategory(i)
          });
        }

        // For wake mode, optimal sleep times should appear first
        if (mode === 'wake') {
          cycles.reverse();
        }

        setSleepCycles(cycles);
        setIsCalculating(false);
        
        // Reset animation flag after a delay
        setTimeout(() => {
          setAnimateCalculate(false);
        }, 500);
      } catch (error) {
        console.error('Error calculating sleep cycles:', error);
        setSleepCycles([]); // Clear cycles on error
        setIsCalculating(false);
        setAnimateCalculate(false);
      }
    }, 300);
  };

  const getQualityForCycles = (cycles) => {
    if (cycles <= 3) return { label: 'Minimal Sleep', color: 'red' };
    if (cycles <= 6) return { label: 'Optimal', color: 'green' };
    return { label: 'Extended', color: 'purple' };
  };

  const getCycleCategory = (cycles) => {
    if (cycles <= 3) {
      return {
        type: 'emergency',
        label: 'Not Recommended',
        description: mode === 'sleep' 
          ? 'Less than 4.5 hours of sleep. Not recommended for regular use.'
          : 'These bedtimes will result in less than 4.5 hours of sleep. Not recommended.'
      };
    }
    if (cycles >= 4 && cycles <= 6) {
      return {
        type: 'recommended',
        label: 'Recommended',
        description: mode === 'sleep'
          ? '6-9 hours of sleep. Ideal duration for most adults.'
          : 'These bedtimes will give you 6-9 hours of sleep. Perfect for most adults.'
      };
    }
    return {
      type: 'extended',
      label: 'Extended Sleep',
      description: mode === 'sleep'
        ? 'More than 9 hours of sleep. May be beneficial for some individuals.'
        : 'These bedtimes will give you more than 9 hours of sleep. Consider if you need extra rest.'
    };
  };

  const getQualityBgClass = (quality) => {
    if (quality.color === 'yellow') return 'bg-yellow-500/20';
    if (quality.color === 'orange') return 'bg-orange-500/20';
    if (quality.color === 'blue') return 'bg-blue-500/20';
    if (quality.color === 'violet') return 'bg-violet-500/20';
    if (quality.color === 'purple') return 'bg-purple-500/20';
    return 'bg-gray-500/20';
  };

  const getQualityTextClass = (quality) => {
    if (quality.color === 'yellow') return 'text-yellow-400';
    if (quality.color === 'orange') return 'text-orange-400';
    if (quality.color === 'blue') return 'text-blue-400';
    if (quality.color === 'violet') return 'text-violet-400';
    if (quality.color === 'purple') return 'text-purple-400';
    return 'text-gray-400';
  };

  const handleTimeChange = (e) => {
    try {
      const timeString = e.target.value;
      if (!timeString) return; // Avoid issues with empty input
      
      // Parse the HH:mm time string into a Date object relative to today
      const parsedTime = parse(timeString, 'HH:mm', new Date());

      if (!isNaN(parsedTime.getTime())) {
        setSelectedTime(parsedTime);
      } else {
        console.error("Invalid time format entered:", timeString);
      }
    } catch (error) {
      console.error('Error handling time change:', error);
    }
  };

  const mapQualityToEnum = (qualityLabel) => {
    switch (qualityLabel) {
      case 'Minimal Sleep':
        return 'Light';
      case 'Optimal':
        return 'Good';
      case 'Extended':
        return 'Optimal';
      default:
        return 'Good';
    }
  };

  const saveSleepCycle = async (cycle) => {
    try {
      // Prevent double submission
      if (showSaveConfirmation) return;

      // Format data for API
      const cycleToSave = {
        date: new Date().toISOString().split('T')[0],
        hours: parseFloat((cycle.minutes / 60).toFixed(2)),
        quality: mapQualityToEnum(cycle.quality.label),
        cycles: cycle.cycles
      };
      
      console.log('Saving sleep cycle:', cycleToSave);
      
      // Validate data before saving
      if (cycleToSave.hours <= 0 || cycleToSave.hours > 24) {
        throw new Error('Invalid sleep duration');
      }
      
      if (cycleToSave.cycles <= 0 || cycleToSave.cycles > 10) {
        throw new Error('Invalid number of sleep cycles');
      }

      // Get existing entries for today
      const entries = await sleepApi.getEntries();
      const today = new Date().toISOString().split('T')[0];
      const existingEntry = entries.find(entry => {
        const entryDate = new Date(entry.date).toISOString().split('T')[0];
        return entryDate === today;
      });

      let response;
      if (existingEntry) {
        // Update existing entry
        response = await sleepApi.updateEntry(existingEntry._id, cycleToSave);
      } else {
        // Create new entry
        response = await sleepApi.addEntry(cycleToSave);
      }

      if (response) {
        // Show confirmation
        setShowSaveConfirmation(true);
        setTimeout(() => {
          setShowSaveConfirmation(false);
          setSelectedCycle(null); // Clear selection after successful save
        }, 3000);
      }
    } catch (err) {
      console.error('Error saving sleep cycle:', err);
      alert(err.message || 'Failed to save sleep cycle. Please try again.');
    }
  };

  const getSleepTip = (cycles) => {
    if (cycles <= 3) {
      return {
        icon: <BsLightning className="text-red-500" />,
        text: "This amount of sleep is not recommended for regular use. Only for emergency situations."
      };
    }
    if (cycles >= 4 && cycles <= 6) {
      return {
        icon: <BsStars className="text-green-500" />,
        text: "This is an optimal amount of sleep (6-9 hours). Great for maintaining a healthy sleep schedule!"
      };
    }
    return {
      icon: <BiAlarm className="text-purple-500" />,
      text: "Extended sleep duration. Make sure this aligns with your body's needs."
    };
  };

  // Get formatted time for display
  const getFormattedTime = () => {
    if (!selectedTime || isNaN(selectedTime.getTime())) return "";
    return format(selectedTime, 'h:mm a');
  };

  // Function to use default wake time
  const useDefaultTime = () => {
    if (defaultWakeTime) {
      const [hours, minutes] = defaultWakeTime.split(':');
      const newTime = new Date();
      newTime.setHours(parseInt(hours, 10));
      newTime.setMinutes(parseInt(minutes, 10));
      setSelectedTime(newTime);
    }
  };

  const saveSleepEntry = async (hours, quality = 'Good') => {
    try {
      if (!user) {
        alert('Please log in to save sleep entries');
        return;
      }

      const cycles = Math.floor((hours * 60) / 90);
      const today = new Date();
      const formattedDate = format(today, 'yyyy-MM-dd');

      // Check if entry already exists for today
      const existingEntries = await sleepApi.getEntries();
      const existingEntry = existingEntries.find(entry => entry.date === formattedDate);

      let response;
      if (existingEntry) {
        // Update existing entry
        response = await sleepApi.updateEntry(existingEntry._id, {
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

      if (response) {
        setMessage({ type: 'success', text: 'Sleep entry saved successfully!' });
        setTimeout(() => setMessage(null), 3000);
      }
    } catch (error) {
      console.error('Error saving sleep entry:', error);
      setMessage({ type: 'error', text: 'Failed to save sleep entry. Please try again.' });
      setTimeout(() => setMessage(null), 3000);
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
        {/* Mode Selection */}
        <div className="flex justify-center gap-4 mb-12">
          <button
            onClick={() => {
              setMode('sleep');
              setSelectedCycle(null);
            }}
            className={`flex items-center gap-2 px-8 py-3 rounded-full text-sm font-medium transition-all duration-300
              ${mode === 'sleep' 
                ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-500/30' 
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}
          >
            <FaMoon className="text-lg" />
            Sleep Now
          </button>
          <button
            onClick={() => {
              setMode('wake');
              setSelectedCycle(null);
            }}
            className={`flex items-center gap-2 px-8 py-3 rounded-full text-sm font-medium transition-all duration-300
              ${mode === 'wake' 
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/30' 
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}
          >
            <FaSun className="text-lg" />
            Wake Up At
          </button>
        </div>

        {/* Time Input Section with Clock */}
        <div className="bg-gray-800/30 backdrop-blur-sm rounded-3xl border border-gray-700 p-8 mb-8 relative overflow-hidden">
          {/* Background Glow */}
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/5 to-violet-600/10 z-0"></div>
          
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between">
            {/* React Clock */}
            <div className="mb-6 md:mb-0 relative">
              <div className="p-4 rounded-full bg-gray-900/40 backdrop-blur-sm shadow-lg border border-violet-500/20">
                <div className="react-clock-wrapper">
                  <Clock 
                    value={selectedTime} 
                    size={180}
                    renderNumbers={true}
                    className="custom-clock"
                  />
                </div>
              </div>
              <style>
                {`
                /* Custom clock styling to match app theme */
                .react-clock {
                  --clock-face-color: rgba(49, 46, 129, 0.1);
                  --clock-mark-color: rgba(167, 139, 250, 0.7);
                  --clock-hour-hand-color: rgba(139, 92, 246, 0.9);
                  --clock-minute-hand-color: rgba(124, 58, 237, 0.9);
                  --clock-second-hand-color: rgba(196, 181, 253, 0.7);
                }
                .react-clock__face {
                  border: 1px solid rgba(167, 139, 250, 0.3);
                  background: var(--clock-face-color);
                }
                .react-clock__hand__body {
                  background-color: var(--clock-hour-hand-color);
                  filter: drop-shadow(0 0 2px rgba(139, 92, 246, 0.5));
                }
                .react-clock__hour-hand .react-clock__hand__body {
                  background-color: var(--clock-hour-hand-color);
                }
                .react-clock__minute-hand .react-clock__hand__body {
                  background-color: var(--clock-minute-hand-color);
                }
                .react-clock__second-hand .react-clock__hand__body {
                  background-color: var(--clock-second-hand-color);
                }
                .react-clock__mark__body {
                  background-color: var(--clock-mark-color);
                }
                .react-clock__second-hand__body {
                  display: none;
                }
                .react-clock__mark--number {
                  color: rgba(167, 139, 250, 0.9);
                  font-weight: 500;
                }
                .react-clock-wrapper {
                  position: relative;
                }
                .react-clock-wrapper::after {
                  content: '';
                  position: absolute;
                  top: 0;
                  left: 0;
                  right: 0;
                  bottom: 0;
                  border-radius: 50%;
                  box-shadow: 0 0 30px rgba(139, 92, 246, 0.2);
                  z-index: -1;
                }
                `}
              </style>
              <p className="text-center text-violet-300 mt-4 font-medium">
                {mode === 'sleep' ? "Bedtime" : "Wake-up Time"}
              </p>
            </div>
            
            {/* Digital Time Display and Input */}
            <div className="flex flex-col items-center">
              {/* Digital Clock Display */}
              <div className="mb-5 text-center">
                <div className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-violet-500 animate-pulse">
                  {getFormattedTime()}
                </div>
              </div>
              
              {/* Time Input */}
              <div className="flex items-center gap-4">
                <div className="relative">
                  <input
                    type="time"
                    value={selectedTime instanceof Date && !isNaN(selectedTime.getTime()) ? format(selectedTime, 'HH:mm') : ''}
                    onChange={handleTimeChange}
                    className="bg-gray-900/60 text-lg font-medium text-white focus:outline-none focus:ring-2 focus:ring-violet-500 rounded-lg px-6 py-3 w-48 border border-gray-700 pr-12 transition-all"
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                    <BiAlarm className="text-xl text-violet-400" />
                  </div>
                </div>
                
                {mode === 'wake' && defaultWakeTime && (
                  <button
                    onClick={useDefaultTime}
                    className="px-4 py-2 bg-violet-600/30 hover:bg-violet-600/50 rounded-lg text-sm text-violet-300 transition-all flex items-center gap-2"
                  >
                    <BiAlarm className="text-violet-400" />
                    Use Default ({defaultWakeTime})
                  </button>
                )}
                
                <button
                  onClick={calculateSleepCycles}
                  disabled={isCalculating}
                  className={`bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white px-6 py-3 rounded-lg font-medium flex items-center gap-2 shadow-lg shadow-indigo-600/20 transition-all duration-300 hover:-translate-y-0.5
                    ${animateCalculate ? 'animate-pulse' : ''}`}
                >
                  <FaCalculator className={`text-sm ${isCalculating ? 'animate-spin' : ''}`} />
                  {isCalculating ? 'Calculating...' : 'Calculate'}
                </button>
              </div>
              
              <p className="text-gray-400 text-sm mt-4 max-w-md text-center">
                {mode === 'sleep' 
                  ? "Enter your bedtime to calculate ideal wake-up times based on sleep cycles" 
                  : "Enter your desired wake-up time to find the best times to go to sleep"}
              </p>
            </div>
          </div>
        </div>

        {/* Results Section with Title */}
        <h2 className="text-2xl font-bold text-white mb-5 flex items-center gap-3">
          {mode === 'sleep' ? (
            <>
              <FaSun className="text-amber-400" />
              <span>Recommended Wake-up Times</span>
            </>
          ) : (
            <>
              <FaMoon className="text-violet-400" />
              <span>Recommended Bedtimes</span>
            </>
          )}
        </h2>
        
        {/* Sleep Cycles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {isCalculating ? (
            <div className="col-span-full flex justify-center py-10">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-violet-500"></div>
            </div>
          ) : sleepCycles.length > 0 ? (
            <>
              {/* Category Headers */}
              {['recommended', 'emergency', 'extended'].map((category) => {
                const categoryCycles = sleepCycles.filter(cycle => cycle.category.type === category);
                if (categoryCycles.length === 0) return null;
                
                return (
                  <div key={category} className="col-span-full">
                    <div className="flex items-center gap-3 mb-3 mt-4">
                      <div className={`w-2 h-2 rounded-full ${
                        category === 'recommended' ? 'bg-violet-500' :
                        category === 'emergency' ? 'bg-orange-500' :
                        'bg-purple-500'
                      }`}></div>
                      <h3 className="text-lg font-medium text-white">
                        {categoryCycles[0].category.label}
                      </h3>
                      <span className="text-sm text-gray-400">
                        {categoryCycles[0].category.description}
                      </span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {categoryCycles.map((cycle, index) => (
                        <div
                          key={index}
                          onClick={() => setSelectedCycle(cycle)}
                          className={`bg-gray-800/30 backdrop-blur-sm rounded-xl border ${
                            selectedCycle === cycle ? 'border-violet-500 bg-violet-900/20' : 'border-gray-700'
                          } p-6 cursor-pointer transition-all duration-300 hover:bg-gray-800/50 hover:border-violet-500/50 relative overflow-hidden ${
                            selectedCycle === cycle ? 'transform scale-105' : ''
                          }`}
                        >
                          {/* Subtle gradient background for cards */}
                          <div className="absolute inset-0 bg-gradient-to-br from-gray-800/0 to-violet-900/10 -z-10"></div>
                          
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <BiAlarm className="text-2xl text-violet-400" />
                              <span className="text-xl font-semibold text-white">{cycle.time}</span>
                            </div>
                            <div className={`px-3 py-1 rounded-full text-sm ${getQualityBgClass(cycle.quality)} ${getQualityTextClass(cycle.quality)}`}>
                              {cycle.quality.label}
                            </div>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-400 mt-4 flex-wrap">
                            <div className="flex items-center gap-1.5">
                              <BiAlarm className="text-violet-400" />
                              <span>{cycle.minutes} minutes</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <FaMoon className="text-violet-400" />
                              <span>{cycle.cycles} sleep cycles</span>
                            </div>
                          </div>
                          
                          {/* Save button with transition */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedCycle(cycle); // Ensure cycle is selected
                              saveSleepCycle(cycle);
                            }}
                            className={`mt-4 w-full flex items-center justify-center gap-2 py-2.5 transition-all duration-300 rounded-lg text-white text-sm font-medium
                              ${selectedCycle === cycle 
                               ? 'bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 shadow-lg shadow-indigo-600/20' 
                               : 'bg-gray-700 hover:bg-gray-600'}`}
                          >
                            <FaMoon className="text-sm" />
                            Save This Cycle
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </>
          ) : (
            <div className="col-span-full text-center text-gray-500 py-8">
              Click "Calculate" to see sleep cycle recommendations
            </div>
          )}
        </div>

        {/* Sleep Tips */}
        <div className="bg-gray-800/30 backdrop-blur-sm rounded-xl border border-gray-700 p-6">
          <div className="flex items-center gap-3 mb-4">
            <BiMoon className="text-violet-400 text-xl" />
            <h3 className="text-lg font-semibold text-white">Sleep Tips</h3>
          </div>
          <div className="space-y-4 text-sm text-gray-300">
            <div className="flex items-start gap-3">
              <FaMoon className="text-violet-400 mt-1" />
              <p>Complete sleep cycles are typically 90 minutes long</p>
            </div>
            <div className="flex items-start gap-3">
              <BiAlarm className="text-violet-400 mt-1" />
              <p>Aim for 5-6 complete sleep cycles (7.5-9 hours) for optimal rest</p>
            </div>
            <div className="flex items-start gap-3">
              <BsLightning className="text-violet-400 mt-1" />
              <p>It takes about 14 minutes to fall asleep after going to bed</p>
            </div>
            {selectedCycle && (
              <div className="flex items-start gap-3 mt-4 p-4 bg-gray-800/50 rounded-lg border border-gray-700 transition-all duration-300">
                {getSleepTip(selectedCycle.cycles).icon}
                <p>{getSleepTip(selectedCycle.cycles).text}</p>
              </div>
            )}
          </div>
        </div>
        
        {/* Save Confirmation Toast */}
        {showSaveConfirmation && (
          <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-fadeIn">
            Sleep cycle saved to weekly stats!
          </div>
        )}
      </div>
    </div>
  );
}

export default SleepCalculator; 