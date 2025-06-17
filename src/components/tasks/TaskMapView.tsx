import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Navigation, User, Clock, Phone, ChevronLeft, ChevronRight, Maximize2, Minimize2 } from 'lucide-react';
import L from 'leaflet';

// Fix for default markers
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface Employee {
  id: string;
  name: string;
  email: string;
  phone: string;
  skills: string[];
  currentLocation?: { lat: number; lng: number };
  isActive: boolean;
  color: string;
}

interface Task {
  id: string;
  title: string;
  description: string;
  customerId: string;
  customerName: string;
  address: string;
  coordinates: { lat: number; lng: number };
  startTime: Date;
  endTime: Date;
  estimatedDuration: number;
  assignedEmployees: string[];
  requiredSkills: string[];
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  isRecurring: boolean;
  recurrencePattern?: string;
  notes?: string;
  documentationRequired: boolean;
}

interface Route {
  id: string;
  employeeId: string;
  date: Date;
  tasks: Task[];
  optimizedOrder: string[];
  totalDistance: number;
  totalDuration: number;
  startLocation: { lat: number; lng: number };
  isOptimized: boolean;
}

interface TaskMapViewProps {
  employees: Employee[];
  tasks: Task[];
  routes: Route[];
  selectedDate: Date;
  onTaskMove: (taskId: string, newEmployeeId: string, newStartTime: Date) => void;
  onEmployeeSelect: (employeeId: string | null) => void;
  selectedEmployee: string | null;
}

export default function TaskMapView({
  employees,
  tasks,
  routes,
  selectedDate,
  onTaskMove,
  onEmployeeSelect,
  selectedEmployee
}: TaskMapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<L.Map | null>(null);
  const [markers, setMarkers] = useState<L.Marker[]>([]);
  const [routeLines, setRouteLines] = useState<L.Polyline[]>([]);
  const [employeeMarkers, setEmployeeMarkers] = useState<L.Marker[]>([]);
  const [isMapReady, setIsMapReady] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [selectedEmployeeIndex, setSelectedEmployeeIndex] = useState(0);
  const [showAllRoutes, setShowAllRoutes] = useState(true);

  // Filtrer opgaver for valgte dato
  const dayTasks = tasks.filter(task => 
    task.startTime.toDateString() === selectedDate.toDateString()
  );

  // Aktive medarbejdere
  const activeEmployees = employees.filter(emp => emp.isActive);

  // Initialize map
  useEffect(() => {
    if (!mapRef.current || leafletMapRef.current) return;

    const mapInstance = L.map(mapRef.current, {
      zoomControl: true,
      attributionControl: true,
    }).setView([55.6761, 12.5683], 12);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(mapInstance);

    leafletMapRef.current = mapInstance;
    setIsMapReady(true);

    return () => {
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
        setIsMapReady(false);
      }
    };
  }, []);

  // Update task markers
  useEffect(() => {
    if (!leafletMapRef.current || !isMapReady) return;

    // Clear existing markers
    markers.forEach(marker => leafletMapRef.current!.removeLayer(marker));
    setMarkers([]);

    if (dayTasks.length === 0) return;

    const newMarkers: L.Marker[] = [];

    // Filter tasks based on selected employee
    const tasksToShow = selectedEmployee 
      ? dayTasks.filter(task => task.assignedEmployees.includes(selectedEmployee))
      : dayTasks;

    tasksToShow.forEach((task) => {
      const employee = employees.find(emp => task.assignedEmployees.includes(emp.id));
      const color = employee?.color || '#6B7280';
      
      const customIcon = L.divIcon({
        html: `
          <div style="
            background-color: ${color};
            width: 32px;
            height: 32px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: bold;
            font-size: 12px;
            border: 3px solid white;
            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          ">
            ${task.status === 'completed' ? '✓' : 
              task.status === 'in_progress' ? '▶' : 
              task.priority === 'urgent' ? '!' : '●'}
          </div>
        `,
        className: 'custom-marker',
        iconSize: [32, 32],
        iconAnchor: [16, 16]
      });

      const marker = L.marker([task.coordinates.lat, task.coordinates.lng], {
        icon: customIcon
      }).addTo(leafletMapRef.current!);

      marker.bindPopup(`
        <div style="min-width: 250px; font-family: system-ui;">
          <div style="border-bottom: 2px solid ${color}; padding-bottom: 8px; margin-bottom: 8px;">
            <h3 style="margin: 0; font-weight: bold; color: #1f2937;">${task.title}</h3>
            <p style="margin: 4px 0 0 0; color: #6b7280; font-size: 14px;">${task.customerName}</p>
          </div>
          
          <div style="margin-bottom: 8px;">
            <p style="margin: 0; font-size: 13px; color: #374151;">
              <strong>📍 Adresse:</strong><br>
              ${task.address}
            </p>
          </div>
          
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 8px;">
            <div>
              <p style="margin: 0; font-size: 12px; color: #6b7280;">
                <strong>⏱️ Tid:</strong><br>
                ${task.startTime.toLocaleTimeString('da-DK', { hour: '2-digit', minute: '2-digit' })} - 
                ${task.endTime.toLocaleTimeString('da-DK', { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
            <div>
              <p style="margin: 0; font-size: 12px; color: #6b7280;">
                <strong>👤 Medarbejder:</strong><br>
                ${employee?.name || 'Ikke tildelt'}
              </p>
            </div>
          </div>
          
          <div style="text-align: center; margin-top: 8px;">
            <span style="
              background-color: ${color}; 
              color: white; 
              padding: 4px 8px; 
              border-radius: 12px; 
              font-size: 11px; 
              font-weight: bold;
            ">
              ${task.status === 'completed' ? '✅ Afsluttet' : 
                task.status === 'in_progress' ? '🔄 I gang' : '⏳ Afventer'}
            </span>
          </div>
          
          <div style="text-align: center; margin-top: 8px;">
            <button onclick="window.open('https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(task.address)}', '_blank')" 
                    style="background: #3B82F6; color: white; border: none; padding: 6px 12px; border-radius: 6px; font-size: 12px; cursor: pointer;">
              🧭 Navigation
            </button>
          </div>
        </div>
      `, {
        maxWidth: 300,
        className: 'custom-popup'
      });

      newMarkers.push(marker);
    });

    setMarkers(newMarkers);

    // Fit map to show all markers
    if (newMarkers.length > 0) {
      const group = new L.featureGroup(newMarkers);
      leafletMapRef.current.fitBounds(group.getBounds().pad(0.1));
    }
  }, [dayTasks, selectedEmployee, employees, isMapReady]);

  // Update employee location markers
  useEffect(() => {
    if (!leafletMapRef.current || !isMapReady) return;

    // Clear existing employee markers
    employeeMarkers.forEach(marker => leafletMapRef.current!.removeLayer(marker));
    setEmployeeMarkers([]);

    const newEmployeeMarkers: L.Marker[] = [];

    // Filter employees based on selection
    const employeesToShow = selectedEmployee 
      ? employees.filter(emp => emp.id === selectedEmployee)
      : employees.filter(emp => emp.isActive);

    employeesToShow.forEach(employee => {
      if (!employee.currentLocation) return;

      const currentIcon = L.divIcon({
        html: `
          <div style="
            background-color: ${employee.color};
            width: 24px;
            height: 24px;
            border-radius: 50%;
            border: 4px solid white;
            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
            position: relative;
          ">
            <div style="
              position: absolute;
              top: -8px;
              left: -8px;
              width: 40px;
              height: 40px;
              border-radius: 50%;
              background-color: ${employee.color}33;
              animation: pulse 2s infinite;
            "></div>
          </div>
          <style>
            @keyframes pulse {
              0% { transform: scale(1); opacity: 1; }
              50% { transform: scale(1.3); opacity: 0.5; }
              100% { transform: scale(1); opacity: 1; }
            }
          </style>
        `,
        className: 'employee-location-marker',
        iconSize: [24, 24],
        iconAnchor: [12, 12]
      });

      const marker = L.marker([employee.currentLocation.lat, employee.currentLocation.lng], {
        icon: currentIcon,
        zIndexOffset: 1000
      }).addTo(leafletMapRef.current!);

      marker.bindPopup(`
        <div style="text-align: center; font-family: system-ui;">
          <h3 style="margin: 0 0 8px 0; color: ${employee.color};">📍 ${employee.name}</h3>
          <p style="margin: 0; font-size: 12px; color: #6b7280;">
            Live position<br>
            Opdateret: ${new Date().toLocaleTimeString('da-DK')}
          </p>
          <div style="margin-top: 8px;">
            <a href="tel:${employee.phone}" style="color: ${employee.color}; text-decoration: none; font-size: 12px;">
              📞 ${employee.phone}
            </a>
          </div>
        </div>
      `);

      newEmployeeMarkers.push(marker);
    });

    setEmployeeMarkers(newEmployeeMarkers);
  }, [employees, selectedEmployee, isMapReady]);

  // Update route lines
  useEffect(() => {
    if (!leafletMapRef.current || !isMapReady) return;

    // Clear existing route lines
    routeLines.forEach(line => leafletMapRef.current!.removeLayer(line));
    setRouteLines([]);

    const newRouteLines: L.Polyline[] = [];

    // Filter routes based on selection
    const routesToShow = selectedEmployee 
      ? routes.filter(route => route.employeeId === selectedEmployee)
      : showAllRoutes ? routes : [];

    routesToShow.forEach(route => {
      const employee = employees.find(emp => emp.id === route.employeeId);
      if (!employee) return;

      const routeCoords: [number, number][] = [];
      
      // Add start location
      routeCoords.push([route.startLocation.lat, route.startLocation.lng]);
      
      // Add task locations in optimized order
      route.optimizedOrder.forEach(taskId => {
        const task = route.tasks.find(t => t.id === taskId);
        if (task) {
          routeCoords.push([task.coordinates.lat, task.coordinates.lng]);
        }
      });

      if (routeCoords.length > 1) {
        const polyline = L.polyline(routeCoords, {
          color: employee.color,
          weight: 4,
          opacity: 0.8,
          dashArray: selectedEmployee ? undefined : '10, 5'
        }).addTo(leafletMapRef.current!);

        polyline.bindPopup(`
          <div style="text-align: center; font-family: system-ui;">
            <h4 style="margin: 0 0 8px 0; color: ${employee.color};">
              🚗 ${employee.name}s rute
            </h4>
            <p style="margin: 0; font-size: 13px; color: #374151;">
              ${route.tasks.length} stop • ${Math.round(route.totalDistance)}km • ${Math.round(route.totalDuration / 60)}t
            </p>
            ${route.isOptimized ? '<p style="margin: 4px 0 0 0; font-size: 11px; color: #10B981;">✨ AI Optimeret</p>' : ''}
          </div>
        `);

        newRouteLines.push(polyline);
      }
    });

    setRouteLines(newRouteLines);
  }, [routes, selectedEmployee, showAllRoutes, employees, isMapReady]);

  const handleEmployeeNavigation = (direction: 'prev' | 'next') => {
    if (direction === 'prev') {
      setSelectedEmployeeIndex(prev => prev > 0 ? prev - 1 : activeEmployees.length - 1);
    } else {
      setSelectedEmployeeIndex(prev => prev < activeEmployees.length - 1 ? prev + 1 : 0);
    }
    
    const newSelectedEmployee = activeEmployees[selectedEmployeeIndex];
    onEmployeeSelect(newSelectedEmployee.id);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('da-DK', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className={`relative ${isFullscreen ? 'fixed inset-0 z-50 bg-white' : 'h-96'}`}>
      {/* Map Controls */}
      <div className="absolute top-4 right-4 z-[1000] flex flex-col space-y-2">
        <button
          onClick={() => setIsFullscreen(!isFullscreen)}
          className="p-2 bg-white rounded-lg shadow-md hover:bg-gray-50 transition-colors"
          title={isFullscreen ? 'Minimér kort' : 'Fuld skærm'}
        >
          {isFullscreen ? (
            <Minimize2 className="h-5 w-5 text-gray-600" />
          ) : (
            <Maximize2 className="h-5 w-5 text-gray-600" />
          )}
        </button>
        
        <button
          onClick={() => setShowAllRoutes(!showAllRoutes)}
          className={`p-2 rounded-lg shadow-md transition-colors ${
            showAllRoutes ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'
          }`}
          title="Vis alle ruter"
        >
          <Navigation className="h-5 w-5" />
        </button>
      </div>

      {/* Mobile Employee Navigation */}
      <div className="absolute top-4 left-4 z-[1000] md:hidden">
        <div className="bg-white rounded-lg shadow-md p-2 flex items-center space-x-2">
          <button
            onClick={() => handleEmployeeNavigation('prev')}
            className="p-1 text-gray-600 hover:text-gray-800"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          
          <div className="px-3 py-1 bg-gray-100 rounded text-sm font-medium">
            {selectedEmployee ? 
              employees.find(emp => emp.id === selectedEmployee)?.name :
              'Alle medarbejdere'
            }
          </div>
          
          <button
            onClick={() => handleEmployeeNavigation('next')}
            className="p-1 text-gray-600 hover:text-gray-800"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Employee Filter (Desktop) */}
      <div className="absolute top-4 left-4 z-[1000] hidden md:block">
        <div className="bg-white rounded-lg shadow-md p-3 max-w-xs">
          <h4 className="text-sm font-medium text-gray-900 mb-2">Medarbejdere</h4>
          <div className="space-y-2">
            <button
              onClick={() => onEmployeeSelect(null)}
              className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${
                !selectedEmployee ? 'bg-blue-100 text-blue-800' : 'hover:bg-gray-100'
              }`}
            >
              Vis alle
            </button>
            
            {activeEmployees.map(employee => (
              <button
                key={employee.id}
                onClick={() => onEmployeeSelect(employee.id === selectedEmployee ? null : employee.id)}
                className={`w-full text-left px-3 py-2 rounded text-sm transition-colors flex items-center ${
                  selectedEmployee === employee.id ? 'bg-blue-100 text-blue-800' : 'hover:bg-gray-100'
                }`}
              >
                <div 
                  className="w-3 h-3 rounded-full mr-2"
                  style={{ backgroundColor: employee.color }}
                ></div>
                {employee.name}
                {employee.currentLocation && (
                  <div className="ml-auto w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Map Container */}
      <div 
        ref={mapRef} 
        className={`w-full ${isFullscreen ? 'h-full' : 'h-96'} rounded-lg`}
        style={{ zIndex: 1 }}
      />

      {/* Loading Overlay */}
      {!isMapReady && (
        <div className="absolute inset-0 bg-gray-100 rounded-lg flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
            <p className="text-gray-600">Indlæser smart kort...</p>
          </div>
        </div>
      )}

      {/* Route Summary */}
      {selectedEmployee && (
        <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg p-4 max-w-sm z-[1000]">
          <div className="flex items-center mb-3">
            <User className="h-5 w-5 text-blue-600 mr-2" />
            <span className="font-medium text-gray-900">
              {employees.find(emp => emp.id === selectedEmployee)?.name}s rute
            </span>
          </div>
          
          <div className="space-y-2">
            {dayTasks
              .filter(task => task.assignedEmployees.includes(selectedEmployee))
              .sort((a, b) => a.startTime.getTime() - b.startTime.getTime())
              .slice(0, 3)
              .map((task, index) => (
                <div key={task.id} className="flex items-center text-sm">
                  <span className="w-5 h-5 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center text-xs font-medium mr-2">
                    {index + 1}
                  </span>
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{task.title}</div>
                    <div className="text-gray-500 text-xs">{formatTime(task.startTime)}</div>
                  </div>
                </div>
              ))}
            
            {dayTasks.filter(task => task.assignedEmployees.includes(selectedEmployee)).length > 3 && (
              <div className="text-xs text-gray-500 text-center pt-2">
                +{dayTasks.filter(task => task.assignedEmployees.includes(selectedEmployee)).length - 3} flere opgaver
              </div>
            )}
          </div>
        </div>
      )}

      {/* No Tasks Message */}
      {dayTasks.length === 0 && isMapReady && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-50 bg-opacity-90 rounded-lg">
          <div className="text-center">
            <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-gray-900 mb-1">Ingen opgaver på kortet</h3>
            <p className="text-gray-600">Tildel opgaver til medarbejdere for at se ruter</p>
          </div>
        </div>
      )}
    </div>
  );
}