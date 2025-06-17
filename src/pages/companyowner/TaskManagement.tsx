import React, { useState, useEffect } from 'react';
import { Calendar, Map, Users, Plus, Settings, Filter, Search, Clock, MapPin, User, AlertTriangle, CheckCircle, Navigation, Zap } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import TaskCalendarView from '../../components/tasks/TaskCalendarView';
import TaskMapView from '../../components/tasks/TaskMapView';
import CreateTaskModal from '../../components/tasks/CreateTaskModal';
import TaskTemplateModal from '../../components/tasks/TaskTemplateModal';
import RouteOptimizationPanel from '../../components/tasks/RouteOptimizationPanel';

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
}

const mockEmployees: Employee[] = [
  {
    id: '1',
    name: 'Lars Nielsen',
    email: 'lars@eksempelservice.dk',
    phone: '+45 20 12 34 56',
    skills: ['vinduespolering_trad', 'vinduespolering_rent', 'hojde'],
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
    customerId: '2',
    customerName: 'Kontorbygning A/S',
    address: 'Erhvervsvej 45, 2100 København Ø',
    coordinates: { lat: 55.6861, lng: 12.5783 },
    startTime: new Date(2024, 0, 22, 13, 0),
    endTime: new Date(2024, 0, 22, 16, 0),
    estimatedDuration: 180,
    assignedEmployees: ['2'],
    requiredSkills: ['rengoring'],
    status: 'pending',
    priority: 'high',
    isRecurring: false,
    documentationRequired: true,
    createdBy: 'admin',
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

export default function TaskManagement() {
  const { user } = useAuth();
  const [viewMode, setViewMode] = useState<'calendar' | 'map'>('calendar');
  const [employees, setEmployees] = useState<Employee[]>(mockEmployees);
  const [tasks, setTasks] = useState<Task[]>(mockTasks);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedEmployee, setSelectedEmployee] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [showOptimizationPanel, setShowOptimizationPanel] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSkills, setFilterSkills] = useState<string[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(false);

  // Live location updates (simuleret)
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

  const handleTaskCreate = (taskData: Partial<Task>) => {
    const newTask: Task = {
      id: Date.now().toString(),
      ...taskData as Task,
      createdBy: user?.id || '',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    setTasks(prev => [...prev, newTask]);
  };

  const handleTaskUpdate = (taskId: string, updates: Partial<Task>) => {
    setTasks(prev => prev.map(task => 
      task.id === taskId 
        ? { ...task, ...updates, updatedAt: new Date() }
        : task
    ));
  };

  const handleTaskMove = (taskId: string, newEmployeeId: string, newStartTime: Date) => {
    handleTaskUpdate(taskId, {
      assignedEmployees: [newEmployeeId],
      startTime: newStartTime,
      endTime: new Date(newStartTime.getTime() + (tasks.find(t => t.id === taskId)?.estimatedDuration || 60) * 60000)
    });
  };

  const handleRouteOptimization = async (employeeId: string, date: Date) => {
    setIsLoading(true);
    
    // Simuler GraphHopper API kald
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const employeeTasks = tasks.filter(task => 
      task.assignedEmployees.includes(employeeId) &&
      task.startTime.toDateString() === date.toDateString()
    );

    // Simuleret optimering
    const optimizedOrder = employeeTasks
      .sort((a, b) => a.startTime.getTime() - b.startTime.getTime())
      .map(task => task.id);

    const newRoute: Route = {
      id: Date.now().toString(),
      employeeId,
      date,
      tasks: employeeTasks,
      optimizedOrder,
      totalDistance: Math.random() * 50 + 20,
      totalDuration: employeeTasks.reduce((sum, task) => sum + task.estimatedDuration, 0),
      startLocation: { lat: 55.6761, lng: 12.5683 }, // Virksomhedens adresse
      isOptimized: true
    };

    setRoutes(prev => [...prev.filter(r => r.employeeId !== employeeId || r.date.toDateString() !== date.toDateString()), newRoute]);
    setIsLoading(false);
  };

  const filteredTasks = tasks.filter(task => {
    if (searchTerm && !task.title.toLowerCase().includes(searchTerm.toLowerCase()) && 
        !task.customerName.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    if (filterStatus !== 'all' && task.status !== filterStatus) {
      return false;
    }
    if (filterSkills.length > 0 && !filterSkills.some(skill => task.requiredSkills.includes(skill))) {
      return false;
    }
    return true;
  });

  const getTaskStats = () => {
    const today = new Date().toDateString();
    const todayTasks = tasks.filter(task => task.startTime.toDateString() === today);
    
    return {
      total: todayTasks.length,
      pending: todayTasks.filter(t => t.status === 'pending').length,
      inProgress: todayTasks.filter(t => t.status === 'in_progress').length,
      completed: todayTasks.filter(t => t.status === 'completed').length,
      overdue: todayTasks.filter(t => t.status === 'pending' && t.startTime < new Date()).length
    };
  };

  const stats = getTaskStats();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Opgaver & Ruter</h1>
            <p className="text-gray-600 mt-1">
              Administrer opgaver, tildel medarbejdere og optimer ruter i realtid
            </p>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowTemplateModal(true)}
              className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
            >
              <Settings className="h-4 w-4 mr-2" />
              Skabeloner
            </button>
            
            <button
              onClick={() => setShowOptimizationPanel(true)}
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

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-blue-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-blue-700">{stats.total}</div>
            <div className="text-sm text-blue-600">I dag</div>
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
        </div>

        {/* View Toggle & Filters */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          {/* View Toggle */}
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

          {/* Filters */}
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

            <input
              type="date"
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
              value={selectedDate.toISOString().split('T')[0]}
              onChange={(e) => setSelectedDate(new Date(e.target.value))}
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
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

      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 flex items-center space-x-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <span className="text-gray-900">Optimerer ruter...</span>
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

      {showTemplateModal && (
        <TaskTemplateModal
          onClose={() => setShowTemplateModal(false)}
          onApplyTemplate={(template) => {
            // Implementer skabelon anvendelse
            console.log('Apply template:', template);
          }}
        />
      )}

      {showOptimizationPanel && (
        <RouteOptimizationPanel
          employees={employees}
          tasks={tasks}
          selectedDate={selectedDate}
          onClose={() => setShowOptimizationPanel(false)}
          onOptimize={handleRouteOptimization}
        />
      )}
    </div>
  );
}