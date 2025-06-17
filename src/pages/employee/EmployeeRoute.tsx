import React, { useState, useEffect } from 'react';
import { MapPin, Navigation, Clock, CheckCircle, AlertTriangle, RefreshCw, Map, List } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import RouteMap from '../../components/map/RouteMap';

interface RouteTask {
  id: string;
  title: string;
  customer: string;
  address: string;
  coordinates: { lat: number; lng: number };
  estimatedTime: number;
  priority: number;
  status: 'pending' | 'in_progress' | 'completed';
  timeWindow?: { start: string; end: string };
  routeOrder: number;
}

export default function EmployeeRoute() {
  const { user } = useAuth();
  const [routeTasks, setRouteTasks] = useState<RouteTask[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [draggedTask, setDraggedTask] = useState<string | null>(null);
  const [draggedFromIndex, setDraggedFromIndex] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [isMapFullscreen, setIsMapFullscreen] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    loadMyRoute();
    getCurrentLocation();
  }, [user]);

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.log('Location access denied or unavailable');
          // Fallback til København centrum
          setCurrentLocation({ lat: 55.6761, lng: 12.5683 });
        }
      );
    } else {
      // Fallback til København centrum
      setCurrentLocation({ lat: 55.6761, lng: 12.5683 });
    }
  };

  const loadMyRoute = async () => {
    setIsLoading(true);
    
    // Simuler loading af medarbejderens rute
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Mock data for medarbejderens rute med koordinater
    const mockRoute: RouteTask[] = [
      {
        id: '1',
        title: 'Ugentlig rengøring',
        customer: 'Netto Supermarked',
        address: 'Hovedgade 123, 2000 Frederiksberg',
        coordinates: { lat: 55.6761, lng: 12.5683 },
        estimatedTime: 240,
        priority: 3,
        status: 'completed',
        timeWindow: { start: '08:00', end: '12:00' },
        routeOrder: 1
      },
      {
        id: '2',
        title: 'Vinduespolering',
        customer: 'Kontorbygning A/S',
        address: 'Erhvervsvej 45, 2100 København Ø',
        coordinates: { lat: 55.6861, lng: 12.5783 },
        estimatedTime: 180,
        priority: 4,
        status: 'in_progress',
        timeWindow: { start: '13:00', end: '16:00' },
        routeOrder: 2
      },
      {
        id: '3',
        title: 'Gulvbehandling',
        customer: 'Restaurant Bella',
        address: 'Cafégade 78, 2200 København N',
        coordinates: { lat: 55.6961, lng: 12.5883 },
        estimatedTime: 120,
        priority: 2,
        status: 'pending',
        timeWindow: { start: '17:00', end: '19:00' },
        routeOrder: 3
      }
    ];

    setRouteTasks(mockRoute);
    setIsLoading(false);
  };

  // Drag and Drop for medarbejdere - ENKELT VERSION
  const handleDragStart = (taskId: string, index: number) => {
    setDraggedTask(taskId);
    setDraggedFromIndex(index);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    
    if (draggedTask === null || draggedFromIndex === null) return;

    const newTasks = [...routeTasks];
    const draggedTaskData = newTasks[draggedFromIndex];
    
    // Fjern fra gammel position
    newTasks.splice(draggedFromIndex, 1);
    
    // Indsæt på ny position
    newTasks.splice(dropIndex, 0, draggedTaskData);
    
    // Opdater route order
    newTasks.forEach((task, index) => {
      task.routeOrder = index + 1;
    });
    
    setRouteTasks(newTasks);
    setDraggedTask(null);
    setDraggedFromIndex(null);
    
    // Her ville vi gemme til serveren
    console.log('Route updated and saved:', newTasks);
  };

  const updateTaskStatus = (taskId: string, newStatus: 'pending' | 'in_progress' | 'completed') => {
    setRouteTasks(tasks => 
      tasks.map(task => 
        task.id === taskId ? { ...task, status: newStatus } : task
      )
    );
  };

  const handleTaskClick = (taskId: string) => {
    const task = routeTasks.find(t => t.id === taskId);
    if (task) {
      console.log('Task clicked:', task.title);
      // Her kunne vi navigere til opgavedetaljer eller starte navigation
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-orange-100 text-orange-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Afventer';
      case 'in_progress': return 'I gang';
      case 'completed': return 'Afsluttet';
      default: return status;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return CheckCircle;
      case 'in_progress': return Clock;
      default: return MapPin;
    }
  };

  const completedTasks = routeTasks.filter(task => task.status === 'completed').length;
  const totalTime = routeTasks.reduce((sum, task) => sum + task.estimatedTime, 0);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Min rute</h1>
            <p className="text-gray-600 mt-1">
              Dagens optimerede rute - skift mellem liste og kort
            </p>
          </div>
          
          {/* View Toggle */}
          <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('list')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                viewMode === 'list' 
                  ? 'bg-white text-gray-900 shadow-sm' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <List className="h-4 w-4 mr-2 inline" />
              Liste
            </button>
            <button
              onClick={() => setViewMode('map')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                viewMode === 'map' 
                  ? 'bg-white text-gray-900 shadow-sm' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Map className="h-4 w-4 mr-2 inline" />
              Kort
            </button>
          </div>
        </div>

        {/* Route Summary */}
        <div className="grid grid-cols-3 gap-6">
          <div className="bg-blue-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-blue-700">
              {completedTasks}/{routeTasks.length}
            </div>
            <div className="text-sm text-blue-600">Afsluttet</div>
          </div>
          
          <div className="bg-green-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-green-700">
              {Math.round(totalTime / 60)}t
            </div>
            <div className="text-sm text-green-600">Estimeret tid</div>
          </div>
          
          <div className="bg-orange-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-orange-700">
              {routeTasks.length > 0 ? Math.round((completedTasks / routeTasks.length) * 100) : 0}%
            </div>
            <div className="text-sm text-orange-600">Fremgang</div>
          </div>
        </div>
      </div>

      {/* Content baseret på view mode */}
      {viewMode === 'map' ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">Rutekort</h3>
              <div className="flex items-center text-sm text-gray-500">
                <Navigation className="h-4 w-4 mr-2" />
                GPS-lignende visning med realtidslokation
              </div>
            </div>
          </div>
          
          <RouteMap
            tasks={routeTasks}
            employeeName={user?.name}
            currentLocation={currentLocation}
            onTaskClick={handleTaskClick}
            showRoute={true}
            isFullscreen={isMapFullscreen}
            onToggleFullscreen={() => setIsMapFullscreen(!isMapFullscreen)}
          />
        </div>
      ) : (
        /* Liste visning */
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">
                Min dagsrute
              </h3>
              <div className="flex items-center text-sm text-gray-500">
                <RefreshCw className="h-4 w-4 mr-2" />
                Træk og slip for at ændre rækkefølge
              </div>
            </div>
          </div>
          
          <div className="divide-y divide-gray-200">
            {routeTasks.map((task, index) => {
              const StatusIcon = getStatusIcon(task.status);
              
              return (
                <div key={task.id}>
                  <div
                    draggable
                    onDragStart={() => handleDragStart(task.id, index)}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, index)}
                    className="px-6 py-4 hover:bg-gray-50 transition-colors cursor-move"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="flex items-center mr-4">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium mr-3 ${
                            task.status === 'completed' ? 'bg-green-100 text-green-600' :
                            task.status === 'in_progress' ? 'bg-blue-100 text-blue-600' :
                            'bg-gray-100 text-gray-600'
                          }`}>
                            {task.routeOrder}
                          </div>
                          <StatusIcon className={`h-5 w-5 ${
                            task.status === 'completed' ? 'text-green-600' :
                            task.status === 'in_progress' ? 'text-blue-600' :
                            'text-gray-400'
                          }`} />
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="text-sm font-medium text-gray-900">{task.title}</h4>
                            <div className="flex items-center space-x-2">
                              <span className={`inline-flex px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(task.status)}`}>
                                {getStatusText(task.status)}
                              </span>
                              {task.priority > 3 && (
                                <span className="inline-flex px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">
                                  <AlertTriangle className="h-3 w-3 mr-1" />
                                  Høj
                                </span>
                              )}
                            </div>
                          </div>
                          
                          <p className="text-sm text-gray-600 mb-2">{task.customer}</p>
                          
                          <div className="flex items-center justify-between text-sm text-gray-500">
                            <div className="flex items-center">
                              <MapPin className="h-4 w-4 mr-1" />
                              {task.address}
                            </div>
                            <div className="flex items-center space-x-4">
                              <div className="flex items-center">
                                <Clock className="h-4 w-4 mr-1" />
                                {task.estimatedTime} min
                              </div>
                              {task.timeWindow && (
                                <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">
                                  {task.timeWindow.start} - {task.timeWindow.end}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="ml-4">
                        {task.status === 'pending' && (
                          <button 
                            onClick={() => updateTaskStatus(task.id, 'in_progress')}
                            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                          >
                            <Navigation className="h-4 w-4 mr-1" />
                            Start
                          </button>
                        )}
                        
                        {task.status === 'in_progress' && (
                          <button 
                            onClick={() => updateTaskStatus(task.id, 'completed')}
                            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-lg text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Afslut
                          </button>
                        )}
                        
                        {task.status === 'completed' && (
                          <span className="inline-flex items-center px-3 py-2 text-sm leading-4 font-medium text-green-600">
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Afsluttet
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Info */}
      <div className="bg-green-50 border border-green-200 rounded-xl p-4">
        <div className="flex">
          <CheckCircle className="h-5 w-5 text-green-400 mr-3 mt-0.5" />
          <div>
            <h4 className="text-sm font-medium text-green-800 mb-2">
              🗺️ Smart Navigation & Live Opdateringer
            </h4>
            <div className="text-sm text-green-700 space-y-1">
              <p>• <strong>Kortvisning:</strong> Se din rute på interaktivt kort med GPS-position</p>
              <p>• <strong>Drag & drop:</strong> Ændre rækkefølgen ved forsinkelse eller spring over</p>
              <p>• <strong>Realtid:</strong> Ændringer gemmes automatisk og vises til din chef</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}