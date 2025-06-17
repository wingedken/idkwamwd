import React, { useState, useEffect } from 'react';
import { Play, Square, MapPin, Clock, Zap, AlertTriangle, CheckCircle, Navigation } from 'lucide-react';

interface TimeEntry {
  id: string;
  taskId: string;
  taskTitle: string;
  customer: string;
  startTime: Date;
  endTime?: Date;
  location?: { lat: number; lng: number };
  isAutomatic: boolean;
  notes?: string;
}

interface SmartTimeTrackerProps {
  currentTask?: any;
  onTimeStart: (taskId: string, location?: { lat: number; lng: number }) => void;
  onTimeStop: (entryId: string, location?: { lat: number; lng: number }) => void;
  activeEntry?: TimeEntry;
}

export default function SmartTimeTracker({ 
  currentTask, 
  onTimeStart, 
  onTimeStop, 
  activeEntry 
}: SmartTimeTrackerProps) {
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationPermission, setLocationPermission] = useState<'granted' | 'denied' | 'prompt'>('prompt');
  const [isNearTask, setIsNearTask] = useState(false);
  const [autoStartEnabled, setAutoStartEnabled] = useState(true);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [showManualEntry, setShowManualEntry] = useState(false);

  // Get current location
  const getCurrentLocation = async () => {
    if (!navigator.geolocation) {
      setLocationPermission('denied');
      return;
    }

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000
        });
      });

      const location = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      };

      setCurrentLocation(location);
      setLocationPermission('granted');
      
      // Check if near current task
      if (currentTask && currentTask.location) {
        const distance = calculateDistance(location, currentTask.location);
        setIsNearTask(distance <= 100); // Within 100 meters
      }

    } catch (error) {
      console.error('Location error:', error);
      setLocationPermission('denied');
    }
  };

  // Calculate distance between two points
  const calculateDistance = (pos1: { lat: number; lng: number }, pos2: { lat: number; lng: number }) => {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = pos1.lat * Math.PI/180;
    const φ2 = pos2.lat * Math.PI/180;
    const Δφ = (pos2.lat-pos1.lat) * Math.PI/180;
    const Δλ = (pos2.lng-pos1.lng) * Math.PI/180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c;
  };

  // Auto-start timer when near task
  useEffect(() => {
    if (autoStartEnabled && isNearTask && currentTask && !activeEntry) {
      onTimeStart(currentTask.id, currentLocation || undefined);
    }
  }, [isNearTask, currentTask, activeEntry, autoStartEnabled, currentLocation, onTimeStart]);

  // Update elapsed time
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (activeEntry) {
      interval = setInterval(() => {
        const elapsed = Date.now() - activeEntry.startTime.getTime();
        setElapsedTime(Math.floor(elapsed / 1000));
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [activeEntry]);

  // Watch location changes
  useEffect(() => {
    let watchId: number;

    if (locationPermission === 'granted' && autoStartEnabled) {
      watchId = navigator.geolocation.watchPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setCurrentLocation(location);

          if (currentTask && currentTask.location) {
            const distance = calculateDistance(location, currentTask.location);
            setIsNearTask(distance <= 100);
          }
        },
        (error) => console.error('Location watch error:', error),
        { enableHighAccuracy: true, maximumAge: 30000 }
      );
    }

    return () => {
      if (watchId) navigator.geolocation.clearWatch(watchId);
    };
  }, [locationPermission, autoStartEnabled, currentTask]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleManualStart = () => {
    if (currentTask) {
      onTimeStart(currentTask.id, currentLocation || undefined);
    }
  };

  const handleStop = () => {
    if (activeEntry) {
      onTimeStop(activeEntry.id, currentLocation || undefined);
    }
  };

  return (
    <div className="space-y-4">
      {/* Location Status */}
      <div className={`p-4 rounded-lg border ${
        locationPermission === 'granted' 
          ? 'bg-green-50 border-green-200' 
          : 'bg-yellow-50 border-yellow-200'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <MapPin className={`h-5 w-5 mr-2 ${
              locationPermission === 'granted' ? 'text-green-600' : 'text-yellow-600'
            }`} />
            <div>
              <h4 className={`text-sm font-medium ${
                locationPermission === 'granted' ? 'text-green-800' : 'text-yellow-800'
              }`}>
                {locationPermission === 'granted' ? 'Lokation aktiv' : 'Lokation påkrævet'}
              </h4>
              <p className={`text-sm ${
                locationPermission === 'granted' ? 'text-green-700' : 'text-yellow-700'
              }`}>
                {locationPermission === 'granted' 
                  ? 'Automatisk tidsregistrering er aktiveret'
                  : 'Tillad lokation for automatisk start/stop'
                }
              </p>
            </div>
          </div>
          
          {locationPermission !== 'granted' && (
            <button
              onClick={getCurrentLocation}
              className="px-3 py-1 bg-yellow-600 text-white text-sm rounded-md hover:bg-yellow-700"
            >
              Aktiver lokation
            </button>
          )}
        </div>
      </div>

      {/* Current Task Status */}
      {currentTask && (
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-lg font-medium text-gray-900">{currentTask.title}</h3>
              <p className="text-sm text-gray-600">{currentTask.customer}</p>
            </div>
            
            {isNearTask && (
              <div className="flex items-center text-green-600">
                <CheckCircle className="h-5 w-5 mr-1" />
                <span className="text-sm font-medium">På lokation</span>
              </div>
            )}
          </div>

          {/* Active Timer */}
          {activeEntry ? (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="h-3 w-3 bg-blue-600 rounded-full animate-pulse mr-3"></div>
                  <div>
                    <div className="text-2xl font-bold text-blue-900">{formatTime(elapsedTime)}</div>
                    <div className="text-sm text-blue-700">
                      Startet kl. {activeEntry.startTime.toLocaleTimeString('da-DK', { hour: '2-digit', minute: '2-digit' })}
                      {activeEntry.isAutomatic && ' (automatisk)'}
                    </div>
                  </div>
                </div>
                
                <button
                  onClick={handleStop}
                  className="inline-flex items-center px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700"
                >
                  <Square className="h-4 w-4 mr-2" />
                  Stop
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {/* Auto-start indicator */}
              {autoStartEnabled && locationPermission === 'granted' && (
                <div className="flex items-center text-sm text-gray-600">
                  <Zap className="h-4 w-4 mr-2 text-blue-500" />
                  Timer starter automatisk når du ankommer til opgaven
                </div>
              )}

              {/* Manual start button */}
              <button
                onClick={handleManualStart}
                className="w-full inline-flex justify-center items-center px-4 py-3 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700"
              >
                <Play className="h-4 w-4 mr-2" />
                Start opgave
              </button>

              {/* Manual entry option */}
              <button
                onClick={() => setShowManualEntry(!showManualEntry)}
                className="w-full text-sm text-gray-500 hover:text-gray-700 underline"
              >
                Manuel tidsregistrering
              </button>
            </div>
          )}
        </div>
      )}

      {/* Settings */}
      <div className="bg-white rounded-lg shadow p-4">
        <h4 className="text-sm font-medium text-gray-900 mb-3">Indstillinger</h4>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-gray-700">Automatisk start/stop</div>
              <div className="text-sm text-gray-500">Start timer når du ankommer til opgaven</div>
            </div>
            <button
              onClick={() => setAutoStartEnabled(!autoStartEnabled)}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                autoStartEnabled ? 'bg-blue-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition duration-200 ease-in-out ${
                  autoStartEnabled ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Manual Entry Modal */}
      {showManualEntry && (
        <ManualTimeEntryModal 
          onClose={() => setShowManualEntry(false)}
          onSubmit={(data) => {
            console.log('Manual time entry:', data);
            setShowManualEntry(false);
          }}
        />
      )}
    </div>
  );
}

function ManualTimeEntryModal({ onClose, onSubmit }: { onClose: () => void; onSubmit: (data: any) => void }) {
  const [formData, setFormData] = useState({
    startTime: '',
    endTime: '',
    notes: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose}></div>

        <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>

        <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
          <div>
            <div className="mt-3 text-center sm:mt-0 sm:text-left">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Manuel tidsregistrering
              </h3>
              
              <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Start tid</label>
                    <input
                      type="time"
                      required
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      value={formData.startTime}
                      onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Slut tid</label>
                    <input
                      type="time"
                      required
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      value={formData.endTime}
                      onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Noter (valgfrit)</label>
                  <textarea
                    rows={3}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Tilføj noter om arbejdet..."
                  />
                </div>
              </form>
            </div>
          </div>
          
          <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
            <button
              type="submit"
              onClick={handleSubmit}
              className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:col-start-2 sm:text-sm"
            >
              Gem tidsregistrering
            </button>
            <button
              type="button"
              onClick={onClose}
              className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:col-start-1 sm:text-sm"
            >
              Annuller
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}