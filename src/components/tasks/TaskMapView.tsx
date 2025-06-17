import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Navigation, User, Clock, Phone, ChevronLeft, ChevronRight, Maximize2, Minimize2, Layers, Route, Zap } from 'lucide-react';
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
  startAddress: string;
  currentLocation?: { lat: number; lng: number };
  isActive: boolean;
  color: string;
}

interface Task {
  id: string;
  title: string;
  description: string;
  taskType: string;
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
  lastUpdated: Date;
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
  const [mapStyle, setMapStyle] = useState<'street' | 'satellite'>('street');

  // Filtrer opgaver for valgte dato
  const dayTasks = tasks.filter(task => 
    task.startTime.toDateString() === selectedDate.toDateString()
  );

  // Aktive medarbejdere
  const activeEmployees = employees.filter(emp => emp.isActive);

  // Initialize map med OpenStreetMap som beskrevet
  useEffect(() => {
    if (!mapRef.current || leafletMapRef.current) return;

    const mapInstance = L.map(mapRef.current, {
      zoomControl: true,
      attributionControl: true,
    }).setView([55.6761, 12.5683], 12);

    // Standard OpenStreetMap som beskrevet
    const streetLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19,
    });

    // Satellite view (Esri)
    const satelliteLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
      attribution: '© Esri',
      maxZoom: 19,
    });

    streetLayer.addTo(mapInstance);

    // Store layers for switching
    (mapInstance as any)._streetLayer = streetLayer;
    (mapInstance as any)._satelliteLayer = satelliteLayer;

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

  // Switch map style
  useEffect(() => {
    if (!leafletMapRef.current || !isMapReady) return;

    const map = leafletMapRef.current as any;
    
    if (mapStyle === 'satellite') {
      map.removeLayer(map._streetLayer);
      map.addLayer(map._satelliteLayer);
    } else {
      map.removeLayer(map._satelliteLayer);
      map.addLayer(map._streetLayer);
    }
  }, [mapStyle, isMapReady]);

  // Update task markers - alle medarbejderes ruter vises samtidig i forskellige farver som beskrevet
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

    tasksToShow.forEach((task, index) => {
      const employee = employees.find(emp => task.assignedEmployees.includes(emp.id));
      const color = employee?.color || '#6B7280';
      
      // Forskellige ikoner baseret på status og prioritet
      let iconContent = '●';
      if (task.status === 'completed') iconContent = '✓';
      else if (task.status === 'in_progress') iconContent = '▶';
      else if (task.priority === 'urgent') iconContent = '!';
      else if (task.priority === 'high') iconContent = '↑';
      
      const customIcon = L.divIcon({
        html: `
          <div style="
            background-color: ${color};
            width: 36px;
            height: 36px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: bold;
            font-size: 14px;
            border: 3px solid white;
            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
            position: relative;
          ">
            ${iconContent}
            <div style="
              position: absolute;
              top: -8px;
              right: -8px;
              background: white;
              color: ${color};
              border-radius: 50%;
              width: 18px;
              height: 18px;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 10px;
              font-weight: bold;
              border: 1px solid ${color};
            ">
              ${index + 1}
            </div>
          </div>
        `,
        className: 'custom-marker',
        iconSize: [36, 36],
        iconAnchor: [18, 18]
      });

      const marker = L.marker([task.coordinates.lat, task.coordinates.lng], {
        icon: customIcon
      }).addTo(leafletMapRef.current!);

      // Forbedret popup med mere information
      marker.bindPopup(`
        <div style="min-width: 280px; font-family: system-ui;">
          <div style="border-bottom: 2px solid ${color}; padding-bottom: 8px; margin-bottom: 8px;">
            <h3 style="margin: 0; font-weight: bold; color: #1f2937; font-size: 16px;">${task.title}</h3>
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
          
          <div style="margin-bottom: 8px;">
            <p style="margin: 0; font-size: 12px; color: #6b7280;">
              <strong>🔧 Færdigheder:</strong><br>
              ${task.requiredSkills.join(', ') || 'Ingen specifikke'}
            </p>
          </div>
          
          ${task.notes ? `
            <div style="margin-bottom: 8px; padding: 6px; background: #f3f4f6; border-radius: 4px;">
              <p style="margin: 0; font-size: 11px; color: #374151;">
                <strong>📝 Noter:</strong> ${task.notes}
              </p>
            </div>
          ` : ''}
          
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
            ${task.isRecurring ? '<span style="margin-left: 4px; background: #3B82F6; color: white; padding: 2px 6px; border-radius: 8px; font-size: 10px;">🔄 Gentages</span>' : ''}
          </div>
          
          <div style="text-align: center; margin-top: 8px; display: flex; gap: 4px;">
            <button onclick="window.open('https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(task.address)}', '_blank')" 
                    style="flex: 1; background: #3B82F6; color: white; border: none; padding: 6px 12px; border-radius: 6px; font-size: 12px; cursor: pointer;">
              🧭 Navigation
            </button>
            <button onclick="window.open('tel:${employee?.phone}', '_blank')" 
                    style="background: #10B981; color: white; border: none; padding: 6px 8px; border-radius: 6px; font-size: 12px; cursor: pointer;">
              📞
            </button>
          </div>
        </div>
      `, {
        maxWidth: 320,
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

  // Update employee location markers (live tracking) som beskrevet
  useEffect(() => {
    if (!leafletMapRef.current || !isMapReady) return;

    // Clear existing employee markers
    employeeMarkers.forEach(marker => leafletMapRef.current!.removeLayer(marker));
    setEmployeeMarkers([]);

    const newEmployeeMarkers: L.Marker[] = [];

    // Filter employees based on selection
    const employeesToShow = selectedEmployee 
      ? employees.filter(emp => emp.id === selectedEmployee)
      : employees.filter(emp => emp.isActive && emp.currentLocation);

    employeesToShow.forEach(employee => {
      if (!employee.currentLocation) return;

      // Live lokation med pulserende effekt som beskrevet
      const currentIcon = L.divIcon({
        html: `
          <div style="
            background-color: ${employee.color};
            width: 28px;
            height: 28px;
            border-radius: 50%;
            border: 4px solid white;
            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
            position: relative;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: bold;
            font-size: 12px;
          ">
            👤
            <div style="
              position: absolute;
              top: -12px;
              left: -12px;
              width: 52px;
              height: 52px;
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
        iconSize: [28, 28],
        iconAnchor: [14, 14]
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
          <div style="margin-top: 8px; display: flex; gap: 4px; justify-content: center;">
            <a href="tel:${employee.phone}" style="background: ${employee.color}; color: white; padding: 4px 8px; border-radius: 4px; text-decoration: none; font-size: 12px;">
              📞 Ring
            </a>
            <a href="mailto:${employee.email}" style="background: #6B7280; color: white; padding: 4px 8px; border-radius: 4px; text-decoration: none; font-size: 12px;">
              ✉️ Email
            </a>
          </div>
        </div>
      `);

      newEmployeeMarkers.push(marker);
    });

    setEmployeeMarkers(newEmployeeMarkers);
  }, [employees, selectedEmployee, isMapReady]);

  // Update route lines (optimized routes) som beskrevet
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
      
      // Add start location (company address)
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
          weight: selectedEmployee ? 5 : 3,
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
            <p style="margin: 4px 0 0 0; font-size: 10px; color: #6B7280;">
              Opdateret: ${route.lastUpdated.toLocaleTimeString('da-DK')}
            </p>
          </div>
        `);

        newRouteLines.push(polyline);
      }
    });

    setRouteLines(newRouteLines);
  }, [routes, selectedEmployee, showAllRoutes, employees, isMapReady]);

  // Mobile Employee Navigation som beskrevet
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
          <Route className="h-5 w-5" />
        </button>

        <button
          onClick={() => setMapStyle(mapStyle === 'street' ? 'satellite' : 'street')}
          className="p-2 bg-white rounded-lg shadow-md hover:bg-gray-50 transition-colors"
          title="Skift korttype"
        >
          <Layers className="h-5 w-5 text-gray-600" />
        </button>
      </div>

      {/* Mobile Employee Navigation som beskrevet */}
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
          <h4 className="text-sm font-medium text-gray-900 mb-2 flex items-center">
            <User className="h-4 w-4 mr-2" />
            Medarbejdere
          </h4>
          <div className="space-y-2">
            <button
              onClick={() => onEmployeeSelect(null)}
              className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${
                !selectedEmployee ? 'bg-blue-100 text-blue-800' : 'hover:bg-gray-100'
              }`}
            >
              Vis alle ({dayTasks.length} opgaver)
            </button>
            
            {activeEmployees.map(employee => {
              const employeeTasks = dayTasks.filter(task => task.assignedEmployees.includes(employee.id));
              
              return (
                <button
                  key={employee.id}
                  onClick={() => onEmployeeSelect(employee.id === selectedEmployee ? null : employee.id)}
                  className={`w-full text-left px-3 py-2 rounded text-sm transition-colors flex items-center justify-between ${
                    selectedEmployee === employee.id ? 'bg-blue-100 text-blue-800' : 'hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center">
                    <div 
                      className="w-3 h-3 rounded-full mr-2"
                      style={{ backgroundColor: employee.color }}
                    ></div>
                    <span>{employee.name}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <span className="text-xs text-gray-500">({employeeTasks.length})</span>
                    {employee.currentLocation && (
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    )}
                  </div>
                </button>
              );
            })}
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
            <p className="text-gray-600">Indlæser smart kort med live tracking...</p>
          </div>
        </div>
      )}

      {/* Enhanced Route Summary som beskrevet */}
      {selectedEmployee && (
        <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg p-4 max-w-sm z-[1000]">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center">
              <User className="h-5 w-5 text-blue-600 mr-2" />
              <span className="font-medium text-gray-900">
                {employees.find(emp => emp.id === selectedEmployee)?.name}s rute
              </span>
            </div>
            <button
              onClick={() => {
                // Trigger ruteoptimering
                console.log('Optimize route for', selectedEmployee);
              }}
              className="p-1 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded"
              title="Optimer rute"
            >
              <Zap className="h-4 w-4" />
            </button>
          </div>
          
          {/* Route stats */}
          <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
            <div className="bg-blue-50 rounded p-2 text-center">
              <div className="font-bold text-blue-700">
                {dayTasks.filter(task => task.assignedEmployees.includes(selectedEmployee)).length}
              </div>
              <div className="text-blue-600">Stop</div>
            </div>
            <div className="bg-green-50 rounded p-2 text-center">
              <div className="font-bold text-green-700">
                {Math.round(dayTasks.filter(task => task.assignedEmployees.includes(selectedEmployee))
                  .reduce((sum, task) => sum + task.estimatedDuration, 0) / 60)}t
              </div>
              <div className="text-green-600">Tid</div>
            </div>
          </div>
          
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {dayTasks
              .filter(task => task.assignedEmployees.includes(selectedEmployee))
              .sort((a, b) => a.startTime.getTime() - b.startTime.getTime())
              .slice(0, 4)
              .map((task, index) => (
                <div key={task.id} className="flex items-center text-sm">
                  <span className="w-5 h-5 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center text-xs font-medium mr-2 flex-shrink-0">
                    {index + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-900 truncate">{task.title}</div>
                    <div className="text-gray-500 text-xs">{formatTime(task.startTime)}</div>
                  </div>
                </div>
              ))}
            
            {dayTasks.filter(task => task.assignedEmployees.includes(selectedEmployee)).length > 4 && (
              <div className="text-xs text-gray-500 text-center pt-2">
                +{dayTasks.filter(task => task.assignedEmployees.includes(selectedEmployee)).length - 4} flere opgaver
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
            <p className="text-gray-600">Tildel opgaver til medarbejdere for at se ruter og live tracking</p>
          </div>
        </div>
      )}
    </div>
  );
}