import React, { useEffect, useRef, useState } from 'react';
import { MapPin, Navigation, Layers, Maximize2, Minimize2, Clock, Users, Route } from 'lucide-react';
import L from 'leaflet';

// Fix for default markers
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface MapTask {
  id: string;
  title: string;
  customer: string;
  address: string;
  coordinates: { lat: number; lng: number };
  status: 'pending' | 'in_progress' | 'completed';
  routeOrder: number;
  estimatedTime: number;
}

interface RouteMapProps {
  tasks: MapTask[];
  employeeName?: string;
  currentLocation?: { lat: number; lng: number };
  onTaskClick?: (taskId: string) => void;
  showRoute?: boolean;
  isFullscreen?: boolean;
  onToggleFullscreen?: () => void;
}

export default function RouteMap({ 
  tasks, 
  employeeName, 
  currentLocation, 
  onTaskClick, 
  showRoute = true,
  isFullscreen = false,
  onToggleFullscreen 
}: RouteMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<L.Map | null>(null);
  const [markers, setMarkers] = useState<L.Marker[]>([]);
  const [routeLines, setRouteLines] = useState<L.Polyline[]>([]);
  const [currentLocationMarker, setCurrentLocationMarker] = useState<L.Marker | null>(null);
  const [isMapReady, setIsMapReady] = useState(false);

  // Initialize map
  useEffect(() => {
    if (!mapRef.current || leafletMapRef.current) return;

    // Create map centered on Copenhagen
    const mapInstance = L.map(mapRef.current, {
      zoomControl: true,
      attributionControl: true,
    }).setView([55.6761, 12.5683], 12);

    // Add OpenStreetMap tiles
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

  // Update markers when tasks change
  useEffect(() => {
    if (!leafletMapRef.current || !isMapReady) return;

    // Clear existing markers
    markers.forEach(marker => leafletMapRef.current!.removeLayer(marker));
    setMarkers([]);

    if (tasks.length === 0) return;

    const newMarkers: L.Marker[] = [];

    // Group tasks by employee (based on similar coordinates or route order)
    const employeeGroups = groupTasksByEmployee(tasks);

    // Add task markers with different colors per employee
    const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];
    
    employeeGroups.forEach((group, groupIndex) => {
      const color = colors[groupIndex % colors.length];
      
      group.tasks.forEach((task) => {
        // Custom icon based on status and employee group
        const iconColor = task.status === 'completed' ? '#10B981' : 
                         task.status === 'in_progress' ? '#3B82F6' : color;
        
        const customIcon = L.divIcon({
          html: `
            <div style="
              background-color: ${iconColor};
              width: 32px;
              height: 32px;
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              color: white;
              font-weight: bold;
              font-size: 14px;
              border: 3px solid white;
              box-shadow: 0 2px 8px rgba(0,0,0,0.3);
            ">
              ${task.routeOrder}
            </div>
          `,
          className: 'custom-marker',
          iconSize: [32, 32],
          iconAnchor: [16, 16]
        });

        const marker = L.marker([task.coordinates.lat, task.coordinates.lng], {
          icon: customIcon
        }).addTo(leafletMapRef.current!);

        // Enhanced popup with more info
        marker.bindPopup(`
          <div style="min-width: 250px; font-family: system-ui;">
            <div style="border-bottom: 2px solid ${iconColor}; padding-bottom: 8px; margin-bottom: 8px;">
              <h3 style="margin: 0; font-weight: bold; color: #1f2937;">${task.title}</h3>
              <p style="margin: 4px 0 0 0; color: #6b7280; font-size: 14px;">${task.customer}</p>
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
                  <strong>⏱️ Estimeret tid:</strong><br>
                  ${task.estimatedTime} min
                </p>
              </div>
              <div>
                <p style="margin: 0; font-size: 12px; color: #6b7280;">
                  <strong>📋 Rækkefølge:</strong><br>
                  Stop #${task.routeOrder}
                </p>
              </div>
            </div>
            
            <div style="text-align: center; margin-top: 8px;">
              <span style="
                background-color: ${iconColor}; 
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
          </div>
        `, {
          maxWidth: 300,
          className: 'custom-popup'
        });

        if (onTaskClick) {
          marker.on('click', () => onTaskClick(task.id));
        }

        newMarkers.push(marker);
      });
    });

    setMarkers(newMarkers);

    // Fit map to show all markers with padding
    if (newMarkers.length > 0) {
      const group = new L.featureGroup(newMarkers);
      leafletMapRef.current.fitBounds(group.getBounds().pad(0.1));
    }
  }, [tasks, onTaskClick, isMapReady]);

  // Update route lines
  useEffect(() => {
    if (!leafletMapRef.current || !showRoute || tasks.length < 2 || !isMapReady) return;

    // Clear existing route lines
    routeLines.forEach(line => leafletMapRef.current!.removeLayer(line));
    setRouteLines([]);

    // Group tasks by employee and create routes
    const employeeGroups = groupTasksByEmployee(tasks);
    const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];
    const newRouteLines: L.Polyline[] = [];

    employeeGroups.forEach((group, groupIndex) => {
      if (group.tasks.length < 2) return;

      const color = colors[groupIndex % colors.length];
      const sortedTasks = group.tasks.sort((a, b) => a.routeOrder - b.routeOrder);

      // Create route coordinates
      const routeCoords = sortedTasks.map(task => 
        [task.coordinates.lat, task.coordinates.lng] as [number, number]
      );

      // Add current location as start point if available
      if (currentLocation && groupIndex === 0) {
        routeCoords.unshift([currentLocation.lat, currentLocation.lng]);
      }

      // Create polyline with employee-specific color
      const polyline = L.polyline(routeCoords, {
        color: color,
        weight: 4,
        opacity: 0.8,
        dashArray: groupIndex === 0 ? undefined : '10, 5' // Solid line for first employee
      }).addTo(leafletMapRef.current!);

      // Add popup to route line
      polyline.bindPopup(`
        <div style="text-align: center; font-family: system-ui;">
          <h4 style="margin: 0 0 8px 0; color: ${color};">
            🚗 Rute ${groupIndex + 1}
          </h4>
          <p style="margin: 0; font-size: 13px; color: #374151;">
            ${sortedTasks.length} stop • ${Math.round(sortedTasks.reduce((sum, t) => sum + t.estimatedTime, 0) / 60)}t
          </p>
        </div>
      `);

      newRouteLines.push(polyline);
    });

    setRouteLines(newRouteLines);
  }, [tasks, showRoute, currentLocation, isMapReady]);

  // Update current location marker
  useEffect(() => {
    if (!leafletMapRef.current || !currentLocation || !isMapReady) return;

    // Remove existing current location marker
    if (currentLocationMarker) {
      leafletMapRef.current.removeLayer(currentLocationMarker);
    }

    // Create current location icon
    const currentIcon = L.divIcon({
      html: `
        <div style="
          background-color: #10B981;
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
            background-color: rgba(16, 185, 129, 0.3);
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
      className: 'current-location-marker',
      iconSize: [24, 24],
      iconAnchor: [12, 12]
    });

    const marker = L.marker([currentLocation.lat, currentLocation.lng], {
      icon: currentIcon,
      zIndexOffset: 1000 // Ensure it's on top
    }).addTo(leafletMapRef.current);

    marker.bindPopup(`
      <div style="text-align: center; font-family: system-ui;">
        <h3 style="margin: 0 0 8px 0; color: #10B981;">📍 Din position</h3>
        ${employeeName ? `<p style="margin: 0; font-weight: bold;">${employeeName}</p>` : ''}
        <p style="margin: 4px 0 0 0; font-size: 12px; color: #6b7280;">
          Opdateret: ${new Date().toLocaleTimeString('da-DK')}
        </p>
      </div>
    `);

    setCurrentLocationMarker(marker);
  }, [currentLocation, employeeName, isMapReady]);

  // Group tasks by employee (simple grouping by route order proximity)
  const groupTasksByEmployee = (tasks: MapTask[]) => {
    // For now, we'll group tasks that are close in route order
    // In a real implementation, you'd group by actual employee assignment
    const groups: { tasks: MapTask[] }[] = [];
    const sortedTasks = [...tasks].sort((a, b) => a.routeOrder - b.routeOrder);
    
    let currentGroup: MapTask[] = [];
    
    sortedTasks.forEach((task, index) => {
      if (currentGroup.length === 0) {
        currentGroup.push(task);
      } else {
        // Start new group if route order jumps significantly
        const lastTask = currentGroup[currentGroup.length - 1];
        if (task.routeOrder - lastTask.routeOrder > 3) {
          groups.push({ tasks: currentGroup });
          currentGroup = [task];
        } else {
          currentGroup.push(task);
        }
      }
    });
    
    if (currentGroup.length > 0) {
      groups.push({ tasks: currentGroup });
    }
    
    return groups;
  };

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'completed').length;
  const totalTime = tasks.reduce((sum, t) => sum + t.estimatedTime, 0);

  return (
    <div className={`relative ${isFullscreen ? 'fixed inset-0 z-50 bg-white' : 'h-96'}`}>
      {/* Map controls */}
      <div className="absolute top-4 right-4 z-[1000] flex flex-col space-y-2">
        {onToggleFullscreen && (
          <button
            onClick={onToggleFullscreen}
            className="p-2 bg-white rounded-lg shadow-md hover:bg-gray-50 transition-colors"
            title={isFullscreen ? 'Minimér kort' : 'Fuld skærm'}
          >
            {isFullscreen ? (
              <Minimize2 className="h-5 w-5 text-gray-600" />
            ) : (
              <Maximize2 className="h-5 w-5 text-gray-600" />
            )}
          </button>
        )}
      </div>

      {/* Map container */}
      <div 
        ref={mapRef} 
        className={`w-full ${isFullscreen ? 'h-full' : 'h-96'} rounded-lg`}
        style={{ zIndex: 1 }}
      />

      {/* Loading overlay */}
      {!isMapReady && (
        <div className="absolute inset-0 bg-gray-100 rounded-lg flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
            <p className="text-gray-600">Indlæser smart kort...</p>
          </div>
        </div>
      )}

      {/* Enhanced route info */}
      {totalTasks > 0 && (
        <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg p-4 max-w-xs z-[1000]">
          <div className="flex items-center mb-3">
            <Route className="h-5 w-5 text-blue-600 mr-2" />
            <span className="font-medium text-gray-900">
              {employeeName ? `${employeeName}s rute` : 'Ruteoversigt'}
            </span>
          </div>
          
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="text-center p-2 bg-blue-50 rounded">
              <div className="font-bold text-blue-900">{totalTasks}</div>
              <div className="text-blue-700 text-xs">Stop</div>
            </div>
            <div className="text-center p-2 bg-green-50 rounded">
              <div className="font-bold text-green-900">{completedTasks}</div>
              <div className="text-green-700 text-xs">Afsluttet</div>
            </div>
          </div>
          
          <div className="mt-3 pt-3 border-t border-gray-200">
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>Total tid:</span>
              <span className="font-medium">{Math.round(totalTime / 60)}t {totalTime % 60}m</span>
            </div>
            <div className="flex items-center justify-between text-sm text-gray-600 mt-1">
              <span>Fremgang:</span>
              <span className="font-medium">{totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0}%</span>
            </div>
          </div>
        </div>
      )}

      {/* No tasks message */}
      {totalTasks === 0 && isMapReady && (
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