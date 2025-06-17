import React, { useState, useEffect } from 'react';
import { Calendar, Map, Plus, Search, Filter, Users, Navigation, Zap, Settings, Clock, CheckSquare, AlertTriangle, Maximize2, Minimize2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import TaskCalendarView from '../../components/tasks/TaskCalendarView';
import TaskMapView from '../../components/tasks/TaskMapView';
import CreateTaskModal from '../../components/tasks/CreateTaskModal';
import TaskTemplateManager from '../../components/tasks/TaskTemplateManager';

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
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
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

// Mock data med danske servicevirksomheds-opgaver
const mockEmployees: Employee[] = [
  {
    id: '1',
    name: 'Lars Nielsen',
    email: 'lars@eksempelservice.dk',
    phone: '+45 20 12 34 56',
    skills: ['vinduespolering_trad', 'vinduespolering_rent', 'hojde'],
    startAddress: 'Erhvervsvej 123, 2000 Frederiksberg',
    currentLocation: { lat: 55.6761, lng: 12.5683 },
    isActive: true,
    color: '#3B82F6'
  },
  {
    id: '2',
    name: 'Maria Hansen',
    email: 'maria@eksempelservice.dk',
    phone: '+45 30 12 34 56',
    skills: ['rengoring', 'taepper', 'gulvbehandling'],
    startAddress: 'Erhvervsvej 123, 2000 Frederiksberg',
    currentLocation: { lat: 55.6861, lng: 12.5783 },
    isActive: true,
    color: '#10B981'
  },
  {
    id: '3',
    name: 'Peter Andersen',
    email: 'peter@eksempelservice.dk',
    phone: '+45 40 12 34 56',
    skills: ['algerens', 'fliserens', 'hojtryk', 'specialrens'],
    startAddress: 'Erhvervsvej 123, 2000 Frederiksberg',
    currentLocation: { lat: 55.6961, lng: 12.5883 },
    isActive: true,
    color: '#F59E0B'
  }
];

const mockTasks: Task[] = [
  {
    id: '1',
    title: 'Ugentlig vinduespolering',
    description: 'Polering af alle vinduer indvendigt og udvendigt',
    taskType: 'vinduespolering',
    customerId: '1',
    customerName: 'Netto Supermarked',
    address: 'Hovedgade 123, 2000 Frederiksberg',
    coordinates: { lat: 55.6761, lng: 12.5683 },
    startTime: new Date(2024, 0, 22, 8, 0),
    endTime: new Date(2024, 0, 22, 12, 0),
    estimatedDuration: 240,
    assignedEmployees: ['1'],
    requiredSkills: ['vinduespolering_trad'],
    status: 'pending',
    priority: 'medium',
    isRecurring: true,
    recurrencePattern: 'weekly',
    documentationRequired: false,
    createdBy: 'admin',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: '2',
    title: 'Kontorrengøring',
    description: 'Fuldstændig rengøring af kontorfaciliteter',
    taskType: 'rengoring',
    customerId: '2',
    customerName: 'Kontorbygning A/S',
    address: 'Erhvervsvej 45, 2100 København Ø',
    coordinates: { lat: 55.6861, lng: 12.5783 },
    startTime: new Date(2024, 0, 22, 13, 0),
    endTime: new Date(2024, 0, 22, 16, 0),
    estimatedDuration: 180,
    assignedEmployees: ['2'],
    requiredSkills: ['rengoring'],
    status: 'in_progress',
    priority: 'high',
    isRecurring: false,
    documentationRequired: true,
    createdBy: 'admin',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: '3',
    title: 'Algerens af facade',
    description: 'Fjernelse af alger fra bygningens facade',
    taskType: 'algerens',
    customerId: '3',
    customerName: 'Restaurant Bella',
    address: 'Cafégade 78, 2200 København N',
    coordinates: { lat: 55.6961, lng: 12.5883 },
    startTime: new Date(2024, 0, 22, 9, 0),
    endTime: new Date(2024, 0, 22, 14, 0),
    estimatedDuration: 300,
    assignedEmployees: ['3'],
    requiredSkills: ['algerens', 'hojtryk'],
    status: 'pending',
    priority: 'medium',
    isRecurring: false,
    documentationRequired: true,
    createdBy: 'admin',
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

export default function TaskManagement() {
  const { user } = useAuth();
  
  // State for view management - to hovedvisninger som beskrevet
  const [viewMode, setViewMode] = useState<'calendar' | 'map'>('calendar');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedEmployee, setSelectedEmployee] = useState<string | null>(null);
  
  // State for data
  const [employees, setEmployees] = useState<Employee[]>(mockEmployees);
  const [tasks, setTasks] = useState<Task[]>(mockTasks);
  const [routes, setRoutes] = useState<Route[]>([]);
  
  // State for modals and panels
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showTemplateManager, setShowTemplateManager] = useState(false);
  
  // State for filters og søgning
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSkills, setFilterSkills] = useState<string[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterEmployee, setFilterEmployee] = useState<string>('all');
  
  // State for loading
  const [isLoading, setIsLoading] = useState(false);

  // Live location updates (simuleret WebSocket/Supabase real-time)
  useEffect(() => {
    const interval = setInterval(() => {
      setEmployees(prev => prev.map(emp => ({
        ...emp,
        currentLocation: emp.currentLocation ? {
          lat: emp.currentLocation.lat + (Math.random() - 0.5) * 0.001,
          lng: emp.currentLocation.lng + (Math.random() - 0.5) * 0.001
        } : undefined
      })));
    }, 30000); // Opdater hver 30 sekund

    return () => clearInterval(interval);
  }, []);

  // Filtrer opgaver baseret på søgning og filtre
  const filteredTasks = tasks.filter(task => {
    // Søgning
    if (searchTerm && !task.title.toLowerCase().includes(searchTerm.toLowerCase()) && 
        !task.customerName.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !task.address.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    
    // Status filter
    if (filterStatus !== 'all' && task.status !== filterStatus) {
      return false;
    }
    
    // Medarbejder filter
    if (filterEmployee !== 'all' && !task.assignedEmployees.includes(filterEmployee)) {
      return false;
    }
    
    // Færdigheder filter
    if (filterSkills.length > 0 && !filterSkills.some(skill => task.requiredSkills.includes(skill))) {
      return false;
    }
    
    return true;
  });

  // Håndter opgave oprettelse
  const handleTaskCreate = (taskData: Partial<Task>) => {
    const newTask: Task = {
      id: Date.now().toString(),
      ...taskData as Task,
      createdBy: user?.id || '',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    setTasks(prev => [...prev, newTask]);
    
    // Trigger automatisk ruteoptimering hvis ønsket
    if (newTask.assignedEmployees.length > 0) {
      handleAutoRouteOptimization(newTask.assignedEmployees[0], newTask.startTime);
    }
  };

  // Håndter opgave opdatering
  const handleTaskUpdate = (taskId: string, updates: Partial<Task>) => {
    setTasks(prev => prev.map(task => 
      task.id === taskId 
        ? { ...task, ...updates, updatedAt: new Date() }
        : task
    ));
  };

  // Håndter opgave flytning (drag & drop) - central funktion for begge visninger
  const handleTaskMove = (taskId: string, newEmployeeId: string, newStartTime: Date) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    const newEndTime = new Date(newStartTime.getTime() + task.estimatedDuration * 60000);
    
    handleTaskUpdate(taskId, {
      assignedEmployees: [newEmployeeId],
      startTime: newStartTime,
      endTime: newEndTime
    });

    // Trigger ruteoptimering for begge medarbejdere
    handleAutoRouteOptimization(newEmployeeId, newStartTime);
    if (task.assignedEmployees[0] !== newEmployeeId) {
      handleAutoRouteOptimization(task.assignedEmployees[0], newStartTime);
    }
  };

  // Automatisk ruteoptimering med GraphHopper
  const handleAutoRouteOptimization = async (employeeId: string, date: Date) => {
    // Kun optimer hvis der er mere end én opgave for medarbejderen den dag
    const employeeTasks = tasks.filter(task => 
      task.assignedEmployees.includes(employeeId) &&
      task.startTime.toDateString() === date.toDateString()
    );

    if (employeeTasks.length > 1) {
      await handleRouteOptimization(employeeId, date);
    }
  };

  // GraphHopper ruteoptimering
  const handleRouteOptimization = async (employeeId: string, date: Date) => {
    setIsLoading(true);
    
    try {
      // Simuler GraphHopper API kald
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const employee = employees.find(emp => emp.id === employeeId);
      if (!employee) return;

      const employeeTasks = tasks.filter(task => 
        task.assignedEmployees.includes(employeeId) &&
        task.startTime.toDateString() === date.toDateString()
      );

      // Simuleret optimering (i produktion ville dette være GraphHopper API)
      const optimizedOrder = employeeTasks
        .sort((a, b) => {
          // Simpel optimering baseret på prioritet og tid
          if (a.priority !== b.priority) {
            const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
            return priorityOrder[b.priority] - priorityOrder[a.priority];
          }
          return a.startTime.getTime() - b.startTime.getTime();
        })
        .map(task => task.id);

      // Parse start adresse koordinater (simuleret)
      const startCoords = { lat: 55.6761, lng: 12.5683 }; // Virksomhedens adresse

      const newRoute: Route = {
        id: Date.now().toString(),
        employeeId,
        date,
        tasks: employeeTasks,
        optimizedOrder,
        totalDistance: Math.random() * 50 + 20, // Simuleret
        totalDuration: employeeTasks.reduce((sum, task) => sum + task.estimatedDuration, 0),
        startLocation: startCoords,
        isOptimized: true,
        lastUpdated: new Date()
      };

      setRoutes(prev => [
        ...prev.filter(r => r.employeeId !== employeeId || r.date.toDateString() !== date.toDateString()),
        newRoute
      ]);

    } catch (error) {
      console.error('Route optimization failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Beregn dagens statistikker
  const getDayStats = () => {
    const today = selectedDate.toDateString();
    const dayTasks = tasks.filter(task => task.startTime.toDateString() === today);
    
    return {
      total: dayTasks.length,
      pending: dayTasks.filter(t => t.status === 'pending').length,
      inProgress: dayTasks.filter(t => t.status === 'in_progress').length,
      completed: dayTasks.filter(t => t.status === 'completed').length,
      overdue: dayTasks.filter(t => 
        t.status === 'pending' && t.startTime < new Date()
      ).length,
      conflicts: getConflicts(dayTasks).length
    };
  };

  // Tjek for konflikter (overlap og overbelastning)
  const getConflicts = (dayTasks: Task[]) => {
    const conflicts: string[] = [];
    
    employees.forEach(employee => {
      const employeeTasks = dayTasks.filter(task => 
        task.assignedEmployees.includes(employee.id)
      );
      
      for (let i = 0; i < employeeTasks.length; i++) {
        for (let j = i + 1; j < employeeTasks.length; j++) {
          const task1 = employeeTasks[i];
          const task2 = employeeTasks[j];
          
          if (task1.startTime < task2.endTime && task2.startTime < task1.endTime) {
            conflicts.push(`${employee.name}: ${task1.title} og ${task2.title}`);
          }
        }
      }
    });
    
    return conflicts;
  };

  const stats = getDayStats();

  return (
    <div className="space-y-6">
      {/* Header med statistikker */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Opgaver & Ruter</h1>
            <p className="text-gray-600 mt-1">
              Intuitivt system til opgavestyring og ruteplanlægning med live opdateringer
            </p>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowTemplateManager(true)}
              className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
            >
              <Settings className="h-4 w-4 mr-2" />
              Skabeloner
            </button>
            
            <button
              onClick={() => {
                // Trigger AI optimering for alle medarbejdere
                employees.forEach(emp => {
                  handleAutoRouteOptimization(emp.id, selectedDate);
                });
              }}
              className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
            >
              <Zap className="h-4 w-4 mr-2" />
              AI Optimering
            </button>
            
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-sm"
            >
              <Plus className="h-4 w-4 mr-2" />
              Ny opgave
            </button>
          </div>
        </div>

        {/* Dagens statistikker */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-6">
          <div className="bg-blue-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-blue-700">{stats.total}</div>
            <div className="text-sm text-blue-600">Total</div>
          </div>
          <div className="bg-yellow-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-yellow-700">{stats.pending}</div>
            <div className="text-sm text-yellow-600">Afventer</div>
          </div>
          <div className="bg-green-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-green-700">{stats.inProgress}</div>
            <div className="text-sm text-green-600">I gang</div>
          </div>
          <div className="bg-emerald-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-emerald-700">{stats.completed}</div>
            <div className="text-sm text-emerald-600">Afsluttet</div>
          </div>
          <div className="bg-red-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-red-700">{stats.overdue}</div>
            <div className="text-sm text-red-600">Forsinkede</div>
          </div>
          <div className="bg-orange-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-orange-700">{stats.conflicts}</div>
            <div className="text-sm text-orange-600">Konflikter</div>
          </div>
        </div>

        {/* Visningsvalg og filtre */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          {/* Visningsvalg - to hovedvisninger som beskrevet */}
          <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('calendar')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                viewMode === 'calendar' 
                  ? 'bg-white text-gray-900 shadow-sm' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Calendar className="h-4 w-4 mr-2 inline" />
              Kalender
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

          {/* Filtre og søgning */}
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Søg opgaver..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <select
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">Alle status</option>
              <option value="pending">Afventer</option>
              <option value="in_progress">I gang</option>
              <option value="completed">Afsluttet</option>
            </select>

            <select
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
              value={filterEmployee}
              onChange={(e) => setFilterEmployee(e.target.value)}
            >
              <option value="all">Alle medarbejdere</option>
              {employees.filter(emp => emp.isActive).map(employee => (
                <option key={employee.id} value={employee.id}>
                  {employee.name}
                </option>
              ))}
            </select>

            <input
              type="date"
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
              value={selectedDate.toISOString().split('T')[0]}
              onChange={(e) => setSelectedDate(new Date(e.target.value))}
            />
          </div>
        </div>
      </div>

      {/* Advarsler for konflikter og overbelastning */}
      {stats.conflicts > 0 && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <div className="flex">
            <AlertTriangle className="h-5 w-5 text-orange-400 mr-3 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium text-orange-800">
                {stats.conflicts} tidskonflikt{stats.conflicts !== 1 ? 'er' : ''} fundet
              </h4>
              <div className="mt-2 text-sm text-orange-700">
                <p>Der er overlap mellem opgaver for samme medarbejder. Brug AI optimering eller flyt opgaver manuelt.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Hovedindhold - Kalender eller Kort visning */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {viewMode === 'calendar' ? (
          <TaskCalendarView
            employees={employees}
            tasks={filteredTasks}
            selectedDate={selectedDate}
            onTaskMove={handleTaskMove}
            onTaskUpdate={handleTaskUpdate}
            onEmployeeSelect={setSelectedEmployee}
            selectedEmployee={selectedEmployee}
          />
        ) : (
          <TaskMapView
            employees={employees}
            tasks={filteredTasks}
            routes={routes}
            selectedDate={selectedDate}
            onTaskMove={handleTaskMove}
            onEmployeeSelect={setSelectedEmployee}
            selectedEmployee={selectedEmployee}
          />
        )}
      </div>

      {/* Loading overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 flex items-center space-x-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <span className="text-gray-900">Optimerer ruter med GraphHopper...</span>
          </div>
        </div>
      )}

      {/* Modals */}
      {showCreateModal && (
        <CreateTaskModal
          employees={employees}
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleTaskCreate}
        />
      )}

      {showTemplateManager && (
        <TaskTemplateManager
          onClose={() => setShowTemplateManager(false)}
          onApplyTemplate={(template) => {
            // Implementer skabelon anvendelse
            console.log('Apply template:', template);
          }}
        />
      )}
    </div>
  );
}