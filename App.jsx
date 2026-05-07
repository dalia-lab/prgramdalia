import React, { useState, useEffect, useCallback } from 'react';
import { 
  Moon, Sun, RefreshCw, Activity, Shield, Users, TrendingUp, 
  Calendar, Filter, Database, Wifi, WifiOff, Zap, Bell,
  Thermometer, BarChart3, Brain
} from 'lucide-react';
import EnhancedOverviewCards from './components/EnhancedOverviewCards';
import EnhancedEventTimeline from './components/EnhancedEventTimeline';
import EnhancedCharts from './components/EnhancedCharts';
import EnhancedAIInsights from './components/EnhancedAIInsights';
import { 
  generateMockData, 
  generateNewEvent, 
  generateNewTemperatureReading,
  getFilteredData 
} from './services/enhancedMockData';
import { 
  getConnectionStatus, 
  subscribeToEvents, 
  subscribeToTemperatureData 
} from './services/firebaseService';

function App() {
  const [data, setData] = useState([]);
  const [temperatureData, setTemperatureData] = useState([]);
  const [sensorData, setSensorData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [filteredTempData, setFilteredTempData] = useState([]);
  const [darkMode, setDarkMode] = useState(false);
  const [dateFilter, setDateFilter] = useState('month');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [isLoading, setIsLoading] = useState(true);
  const [dataSource, setDataSource] = useState('loading'); // 'firebase', 'mock', 'loading', 'error'
  const [error, setError] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState({ isInitialized: false, isConfigured: false, mode: 'mock' });

  // Initialize connection status
  useEffect(() => {
    setConnectionStatus(getConnectionStatus());
  }, []);

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Check Firebase connection status
        const status = getConnectionStatus();
        setConnectionStatus(status);
        
        // Generate enhanced mock data with temperature and sensor data
        const mockData = generateMockData();
        
        setDataSource(status.mode === 'live' ? 'firebase' : 'mock');
        
        setData(mockData.events);
        setTemperatureData(mockData.temperatureData);
        setSensorData(mockData.sensorData);
        
        const filteredEvents = getFilteredData(mockData.events, dateFilter);
        const filteredTemp = getFilteredData(mockData.temperatureData, dateFilter);
        
        setFilteredData(filteredEvents);
        setFilteredTempData(filteredTemp);
        setLastRefresh(new Date());
      } catch (err) {
        console.error('Error loading data:', err);
        setError(err.message);
        setDataSource('error');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // Update filtered data when data or filter changes
  useEffect(() => {
    if (data.length > 0) {
      const filteredEvents = getFilteredData(data, dateFilter);
      setFilteredData(filteredEvents);
    }
    if (temperatureData.length > 0) {
      const filteredTemp = getFilteredData(temperatureData, dateFilter);
      setFilteredTempData(filteredTemp);
    }
  }, [data, temperatureData, dateFilter]);

  // Refresh handler - regenerate enhanced mock data
  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    setError(null);
    
    try {
      const status = getConnectionStatus();
      setConnectionStatus(status);
      
      // Generate fresh enhanced mock data
      const freshData = generateMockData();
      
      setDataSource(status.mode === 'live' ? 'firebase' : 'mock');
      
      setData(freshData.events);
      setTemperatureData(freshData.temperatureData);
      setSensorData(freshData.sensorData);
      
      const filteredEvents = getFilteredData(freshData.events, dateFilter);
      const filteredTemp = getFilteredData(freshData.temperatureData, dateFilter);
      
      setFilteredData(filteredEvents);
      setFilteredTempData(filteredTemp);
      setLastRefresh(new Date());
    } catch (err) {
      console.error('Error refreshing data:', err);
      setError(err.message);
    } finally {
      setIsRefreshing(false);
    }
  }, [dateFilter]);

  // Auto-refresh every 60 seconds - simulates real-time monitoring
  useEffect(() => {
    const interval = setInterval(() => {
      if (dataSource === 'mock' || dataSource === 'firebase') {
        // Add new event (30% chance)
        if (Math.random() < 0.3) {
          const newEvent = generateNewEvent();
          setData(prevData => [newEvent, ...prevData.slice(0, 499)]);
        }
        
        // Add new temperature reading
        const newTemp = generateNewTemperatureReading();
        setTemperatureData(prevData => [newTemp, ...prevData.slice(0, 1000)]);
        
        setLastRefresh(new Date());
      }
    }, 60000); // 60 seconds

    return () => clearInterval(interval);
  }, [dataSource]);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  // Loading skeleton
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="animate-pulse">
          <div className="h-16 bg-gray-200 dark:bg-gray-800 border-b border-gray-300 dark:border-gray-700"></div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Overview Cards Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {[...Array(12)].map((_, i) => (
                <div key={i} className="h-36 bg-gray-200 dark:bg-gray-800 rounded-xl"></div>
              ))}
            </div>
            {/* Charts Skeleton */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-80 bg-gray-200 dark:bg-gray-800 rounded-xl"></div>
              ))}
            </div>
            {/* AI Insights & Timeline Skeleton */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 h-96 bg-gray-200 dark:bg-gray-800 rounded-xl"></div>
              <div className="h-96 bg-gray-200 dark:bg-gray-800 rounded-xl"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${darkMode ? 'dark' : ''}`}>
      <div className="bg-gray-50 dark:bg-gray-900 min-h-screen transition-colors duration-300">
        {/* Header */}
        <header className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-md shadow-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div className="flex items-center">
                <div className="p-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl mr-3 shadow-lg shadow-blue-500/30">
                  <Shield className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                    Smart Monitoring Dashboard
                  </h1>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    AI-Powered Real-Time Security & Environmental Analytics
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                {/* Date Filter */}
                <div className="relative">
                  <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <select
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 hover:border-gray-400 dark:hover:border-gray-500 transition-colors"
                  >
                    <option value="day">Today</option>
                    <option value="week">Last 7 Days</option>
                    <option value="month">Last 30 Days</option>
                  </select>
                </div>

                {/* Refresh Button */}
                <button
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                  className="relative p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all duration-200 disabled:opacity-50 group"
                  title="Refresh data"
                >
                  <RefreshCw className={`h-5 w-5 ${isRefreshing ? 'animate-spin' : 'group-hover:rotate-180'} transition-transform duration-300`} />
                  {isRefreshing && (
                    <div className="absolute inset-0 rounded-lg border-2 border-blue-500 animate-pulse"></div>
                  )}
                </button>

                {/* Dark Mode Toggle */}
                <button
                  onClick={toggleDarkMode}
                  className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all duration-200 group"
                  title="Toggle dark mode"
                >
                  <div className="relative">
                    {darkMode ? (
                      <Sun className="h-5 w-5 group-hover:rotate-180 transition-transform duration-300" />
                    ) : (
                      <Moon className="h-5 w-5 group-hover:rotate-12 transition-transform duration-300" />
                    )}
                  </div>
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Status Bar */}
          <div className="mb-6 flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center space-x-4 flex-wrap">
              {/* Live Status Indicator */}
              <div className="flex items-center">
                <div className={`h-2.5 w-2.5 rounded-full live-indicator mr-2 ${
                  dataSource === 'firebase' ? 'bg-green-500' : 
                  dataSource === 'mock' ? 'bg-blue-500' : 'bg-red-500'
                }`}></div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {dataSource === 'firebase' ? 'Live Firebase' : 
                   dataSource === 'mock' ? 'Demo Mode' : 'Connecting...'}
                </span>
              </div>
              
              {/* Data Source Badge */}
              <div className={`flex items-center px-3 py-1.5 rounded-full text-xs font-medium ${
                dataSource === 'firebase' 
                  ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border border-green-200 dark:border-green-800' 
                  : dataSource === 'mock'
                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border border-blue-200 dark:border-blue-800'
                  : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400 border border-gray-200 dark:border-gray-700'
              }`}>
                {dataSource === 'firebase' ? (
                  <><Wifi className="h-3 w-3 mr-1.5" /> Firebase RTDB</>
                ) : dataSource === 'mock' ? (
                  <><Database className="h-3 w-3 mr-1.5" /> Mock Data</>
                ) : (
                  <><WifiOff className="h-3 w-3 mr-1.5" /> Disconnected</>
                )}
              </div>

              {/* Temperature Status */}
              <div className="flex items-center px-3 py-1.5 rounded-full text-xs font-medium bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 border border-orange-200 dark:border-orange-800">
                <Thermometer className="h-3 w-3 mr-1.5" />
                {filteredTempData.length > 0 
                  ? `${filteredTempData[0]?.temperature?.toFixed(1)}°C` 
                  : '--°C'}
              </div>
              
              {/* Events Count */}
              <div className="flex items-center px-3 py-1.5 rounded-full text-xs font-medium bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 border border-purple-200 dark:border-purple-800">
                <Activity className="h-3 w-3 mr-1.5" />
                {filteredData.length} events
              </div>
              
              {/* Error Display */}
              {error && (
                <div className="flex items-center text-sm text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-900/20 px-3 py-1.5 rounded-full">
                  <AlertTriangle className="h-3 w-3 mr-1.5" />
                  {error}
                </div>
              )}
            </div>
            
            {/* Auto-refresh Indicator */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                <Zap className="h-4 w-4 mr-1.5 text-yellow-500" />
                Auto-refresh: 60s
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {dateFilter === 'day' ? 'Today' : dateFilter === 'week' ? 'Last 7 days' : 'Last 30 days'}
              </div>
            </div>
          </div>

          {/* Overview Cards with Temperature & Sensor Data */}
          <EnhancedOverviewCards 
            data={filteredData} 
            temperatureData={filteredTempData}
            sensorData={sensorData}
          />

          {/* Charts Grid - Full Width */}
          <div className="mt-8">
            <EnhancedCharts 
              data={filteredData} 
              temperatureData={filteredTempData}
            />
          </div>

          {/* AI Insights and Event Timeline Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
            {/* AI Insights Panel */}
            <div className="lg:col-span-1">
              <EnhancedAIInsights 
                data={filteredData} 
                temperatureData={filteredTempData}
                sensorData={sensorData}
              />
            </div>

            {/* Event Timeline & Sensor Status */}
            <div className="lg:col-span-2">
              <EnhancedEventTimeline 
                data={filteredData}
                temperatureData={filteredTempData}
                sensorData={sensorData}
              />
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border-t border-gray-200 dark:border-gray-700 mt-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex flex-col md:flex-row justify-between items-center text-sm text-gray-500 dark:text-gray-400 gap-4">
              <div className="flex items-center space-x-6 flex-wrap justify-center">
                <div className="flex items-center">
                  <Activity className="h-4 w-4 mr-1.5 text-blue-500" />
                  Last updated: {lastRefresh.toLocaleTimeString()}
                </div>
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1.5 text-blue-500" />
                  {new Date().toLocaleDateString()}
                </div>
                <div className="flex items-center">
                  <Thermometer className="h-4 w-4 mr-1.5 text-orange-500" />
                  {filteredTempData.length} temp readings
                </div>
                <div className="flex items-center">
                  <Shield className="h-4 w-4 mr-1.5 text-green-500" />
                  {sensorData.length} sensors active
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <span className="font-medium">{filteredData.length} events</span>
                <span className="text-gray-300 dark:text-gray-600">•</span>
                <span>{dateFilter === 'day' ? 'Today' : dateFilter === 'week' ? 'Last 7 days' : 'Last 30 days'}</span>
                <span className="text-gray-300 dark:text-gray-600">•</span>
                <span className="flex items-center">
                  <Brain className="h-4 w-4 mr-1.5 text-purple-500" />
                  AI-Powered
                </span>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default App;
