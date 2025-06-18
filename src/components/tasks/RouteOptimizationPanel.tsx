import React, { useState } from 'react';
import { X, Zap, MapPin, Clock, User, TrendingUp, Settings, Play, RotateCcw } from 'lucide-react';

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

interface OptimizationSuggestion {
  employeeId: string;
  employeeName: string;
  currentRoute: {
    tasks: Task[];
    totalDistance: number;
    totalDuration: number;
    efficiency: number;
  };
  optimizedRoute: {
    tasks: Task[];
    totalDistance: number;
    totalDuration: number;
    efficiency: number;
  };
  improvements: {
    distanceSaved: number;
    timeSaved: number;
    efficiencyGain: number;
  };
}

interface RouteOptimizationPanelProps {
  employees: Employee[];
  tasks: Task[];
  selectedDate: Date;
  onClose: () => void;
  onOptimize: (employeeId: string, date: Date) => Promise<void>;
}

export default function RouteOptimizationPanel({
  employees,
  tasks,
  selectedDate,
  onClose,
  onOptimize
}: RouteOptimizationPanelProps) {
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [optimizationResults, setOptimizationResults] = useState<OptimizationSuggestion[]>([]);
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([]);
  const [optimizationSettings, setOptimizationSettings] = useState({
    prioritizeTime: true,
    prioritizeDistance: false,
    respectTimeWindows: true,
    allowReassignment: false,
    maxTravelTime: 60,
    workingHours: { start: '08:00', end: '16:00' }
  });

  // Filtrer opgaver for valgte dato
  const dayTasks = tasks.filter(task => 
    task.startTime.toDateString() === selectedDate.toDateString()
  );

  // Aktive medarbejdere med opgaver
  const employeesWithTasks = employees.filter(emp => 
    emp.isActive && dayTasks.some(task => task.assignedEmployees.includes(emp.id))
  );

  const handleEmployeeToggle = (employeeId: string) => {
    setSelectedEmployees(prev => 
      prev.includes(employeeId)
        ? prev.filter(id => id !== employeeId)
        : [...prev, employeeId]
    );
  };

  const handleOptimizeAll = async () => {
    setIsOptimizing(true);
    
    try {
      // Simuler AI optimering
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const suggestions: OptimizationSuggestion[] = [];
      
      for (const employee of employeesWithTasks) {
        if (selectedEmployees.length === 0 || selectedEmployees.includes(employee.id)) {
          const employeeTasks = dayTasks.filter(task => 
            task.assignedEmployees.includes(employee.id)
          );
          
          if (employeeTasks.length > 1) {
            // Simuleret optimering
            const currentDistance = Math.random() * 50 + 20;
            const optimizedDistance = currentDistance * (0.7 + Math.random() * 0.2);
            const currentDuration = employeeTasks.reduce((sum, task) => sum + task.estimatedDuration, 0);
            const optimizedDuration = currentDuration * (0.8 + Math.random() * 0.15);
            
            suggestions.push({
              employeeId: employee.id,
              employeeName: employee.name,
              currentRoute: {
                tasks: employeeTasks,
                totalDistance: currentDistance,
                totalDuration: currentDuration,
                efficiency: 75 + Math.random() * 15
              },
              optimizedRoute: {
                tasks: [...employeeTasks].sort(() => Math.random() - 0.5),
                totalDistance: optimizedDistance,
                totalDuration: optimizedDuration,
                efficiency: 85 + Math.random() * 10
              },
              improvements: {
                distanceSaved: currentDistance - optimizedDistance,
                timeSaved: currentDuration - optimizedDuration,
                efficiencyGain: 10 + Math.random() * 15
              }
            });
          }
        }
      }
      
      setOptimizationResults(suggestions);
    } catch (error) {
      console.error('Optimization failed:', error);
    } finally {
      setIsOptimizing(false);
    }
  };

  const handleApplySuggestion = async (suggestion: OptimizationSuggestion) => {
    await onOptimize(suggestion.employeeId, selectedDate);
    // Fjern suggestion fra listen efter anvendelse
    setOptimizationResults(prev => 
      prev.filter(s => s.employeeId !== suggestion.employeeId)
    );
  };

  const getTotalImprovements = () => {
    return optimizationResults.reduce((totals, suggestion) => ({
      distanceSaved: totals.distanceSaved + suggestion.improvements.distanceSaved,
      timeSaved: totals.timeSaved + suggestion.improvements.timeSaved,
      efficiencyGain: totals.efficiencyGain + suggestion.improvements.efficiencyGain
    }), { distanceSaved: 0, timeSaved: 0, efficiencyGain: 0 });
  };

  const totalImprovements = getTotalImprovements();

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose}></div>

        <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>

        <div className="inline-block align-bottom bg-white rounded-xl px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-6xl sm:w-full sm:p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg mr-3">
                <Zap className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900">AI Ruteoptimering</h3>
                <p className="text-sm text-gray-600">
                  Optimer ruter automatisk for at spare tid og brændstof
                </p>
              </div>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X className="h-6 w-6" />
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Settings Panel */}
            <div className="lg:col-span-1 space-y-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-md font-medium text-gray-900 mb-4 flex items-center">
                  <Settings className="h-5 w-5 mr-2" />
                  Optimeringsindstillinger
                </h4>
                
                <div className="space-y-4">
                  <div>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        checked={optimizationSettings.prioritizeTime}
                        onChange={(e) => setOptimizationSettings(prev => ({
                          ...prev,
                          prioritizeTime: e.target.checked
                        }))}
                      />
                      <span className="ml-2 text-sm text-gray-700">Prioriter tidsbesparelse</span>
                    </label>
                  </div>
                  
                  <div>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        checked={optimizationSettings.prioritizeDistance}
                        onChange={(e) => setOptimizationSettings(prev => ({
                          ...prev,
                          prioritizeDistance: e.target.checked
                        }))}
                      />
                      <span className="ml-2 text-sm text-gray-700">Prioriter afstandsbesparelse</span>
                    </label>
                  </div>
                  
                  <div>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        checked={optimizationSettings.respectTimeWindows}
                        onChange={(e) => setOptimizationSettings(prev => ({
                          ...prev,
                          respectTimeWindows: e.target.checked
                        }))}
                      />
                      <span className="ml-2 text-sm text-gray-700">Respekter tidsvinduer</span>
                    </label>
                  </div>
                  
                  <div>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        checked={optimizationSettings.allowReassignment}
                        onChange={(e) => setOptimizationSettings(prev => ({
                          ...prev,
                          allowReassignment: e.target.checked
                        }))}
                      />
                      <span className="ml-2 text-sm text-gray-700">Tillad omfordeling af opgaver</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Employee Selection */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-md font-medium text-gray-900 mb-4 flex items-center">
                  <User className="h-5 w-5 mr-2" />
                  Vælg medarbejdere
                </h4>
                
                <div className="space-y-2">
                  <button
                    onClick={() => setSelectedEmployees(
                      selectedEmployees.length === employeesWithTasks.length 
                        ? [] 
                        : employeesWithTasks.map(emp => emp.id)
                    )}
                    className="w-full text-left px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded"
                  >
                    {selectedEmployees.length === employeesWithTasks.length ? 'Fravælg alle' : 'Vælg alle'}
                  </button>
                  
                  {employeesWithTasks.map(employee => {
                    const employeeTasks = dayTasks.filter(task => 
                      task.assignedEmployees.includes(employee.id)
                    );
                    
                    return (
                      <label key={employee.id} className="flex items-center p-2 hover:bg-gray-100 rounded">
                        <input
                          type="checkbox"
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          checked={selectedEmployees.includes(employee.id)}
                          onChange={() => handleEmployeeToggle(employee.id)}
                        />
                        <div className="ml-3 flex-1">
                          <div className="flex items-center">
                            <div 
                              className="w-3 h-3 rounded-full mr-2"
                              style={{ backgroundColor: employee.color }}
                            ></div>
                            <span className="text-sm font-medium text-gray-900">{employee.name}</span>
                          </div>
                          <div className="text-xs text-gray-500">{employeeTasks.length} opgaver</div>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Optimize Button */}
              <button
                onClick={handleOptimizeAll}
                disabled={isOptimizing || employeesWithTasks.length === 0}
                className="w-full inline-flex justify-center items-center px-4 py-3 border border-transparent rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isOptimizing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Optimerer...
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-2" />
                    Start optimering
                  </>
                )}
              </button>
            </div>

            {/* Results Panel */}
            <div className="lg:col-span-2">
              {optimizationResults.length > 0 && (
                <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
                  <h4 className="text-md font-medium text-green-800 mb-3 flex items-center">
                    <TrendingUp className="h-5 w-5 mr-2" />
                    Samlede forbedringer
                  </h4>
                  
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-green-700">
                        {totalImprovements.distanceSaved.toFixed(1)}km
                      </div>
                      <div className="text-sm text-green-600">Afstand sparet</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-green-700">
                        {Math.round(totalImprovements.timeSaved)}min
                      </div>
                      <div className="text-sm text-green-600">Tid sparet</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-green-700">
                        {totalImprovements.efficiencyGain.toFixed(1)}%
                      </div>
                      <div className="text-sm text-green-600">Effektivitetsforbedring</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Optimization Results */}
              <div className="space-y-4">
                {optimizationResults.map(suggestion => (
                  <div key={suggestion.employeeId} className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center">
                        <div 
                          className="w-4 h-4 rounded-full mr-3"
                          style={{ 
                            backgroundColor: employees.find(emp => emp.id === suggestion.employeeId)?.color 
                          }}
                        ></div>
                        <h5 className="text-lg font-medium text-gray-900">{suggestion.employeeName}</h5>
                      </div>
                      
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleApplySuggestion(suggestion)}
                          className="px-3 py-1 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 transition-colors"
                        >
                          Anvend
                        </button>
                        <button
                          onClick={() => setOptimizationResults(prev => 
                            prev.filter(s => s.employeeId !== suggestion.employeeId)
                          )}
                          className="px-3 py-1 bg-gray-300 text-gray-700 text-sm rounded-md hover:bg-gray-400 transition-colors"
                        >
                          Afvis
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      {/* Current Route */}
                      <div className="bg-red-50 rounded-lg p-3">
                        <h6 className="text-sm font-medium text-red-800 mb-2">Nuværende rute</h6>
                        <div className="space-y-1 text-sm text-red-700">
                          <div className="flex justify-between">
                            <span>Afstand:</span>
                            <span>{suggestion.currentRoute.totalDistance.toFixed(1)}km</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Tid:</span>
                            <span>{Math.round(suggestion.currentRoute.totalDuration / 60)}t {suggestion.currentRoute.totalDuration % 60}m</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Effektivitet:</span>
                            <span>{suggestion.currentRoute.efficiency.toFixed(1)}%</span>
                          </div>
                        </div>
                      </div>

                      {/* Optimized Route */}
                      <div className="bg-green-50 rounded-lg p-3">
                        <h6 className="text-sm font-medium text-green-800 mb-2">Optimeret rute</h6>
                        <div className="space-y-1 text-sm text-green-700">
                          <div className="flex justify-between">
                            <span>Afstand:</span>
                            <span>{suggestion.optimizedRoute.totalDistance.toFixed(1)}km</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Tid:</span>
                            <span>{Math.round(suggestion.optimizedRoute.totalDuration / 60)}t {suggestion.optimizedRoute.totalDuration % 60}m</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Effektivitet:</span>
                            <span>{suggestion.optimizedRoute.efficiency.toFixed(1)}%</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Improvements */}
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Forbedringer:</span>
                        <div className="space-x-4">
                          <span className="text-green-600">
                            -{suggestion.improvements.distanceSaved.toFixed(1)}km
                          </span>
                          <span className="text-green-600">
                            -{Math.round(suggestion.improvements.timeSaved)}min
                          </span>
                          <span className="text-green-600">
                            +{suggestion.improvements.efficiencyGain.toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {optimizationResults.length === 0 && !isOptimizing && (
                  <div className="text-center py-12">
                    <Zap className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">Ingen optimeringsresultater</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Klik "Start optimering" for at få AI-forslag til ruteoptimeringar
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}