import React, { useState, useEffect } from 'react';
import { Plus, Calendar, MapPin, Users, Clock, CheckSquare, Navigation, Zap, AlertTriangle, RefreshCw, List, Map, Eye, Settings, UserPlus, X, Filter, MoreVertical, Building, User } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import RouteMap from '../../components/map/RouteMap';

interface Task {
  id: string;
  title: string;
  customer: string;
  customerAddress: string;
  coordinates: { lat: number; lng: number };
  estimatedTime: number;
  priority: 1 | 2 | 3 | 4 | 5;
  startDate: string;
  timeWindow?: { start: string; end: string };
  assignedEmployees: string[];
  status: 'pending' | 'assigned' | 'in_progress' | 'completed';
  skills: string[];
  routeOrder?: number;
  type: 'vinduespolering' | 'algerens' | 'fliserens' | 'rengøring' | 'specialrens';
  description?: string;
  flexibility: 'strict' | 'flexible' | 'very_flexible';
}

interface Employee {
  id: string;
  name: string;
  skills: string[];
  maxTasksPerDay: number;
  tasksToday: Task[];
  color: string;
  workingHours: { start: string; end: string };
  isAvailable: boolean;
  currentLocation?: { lat: number; lng: number };
  role: string;
  efficiency: number;
}

interface Customer {
  id: string;
  name: string;
  addresses: {
    id: string;
    street: string;
    postalCode: string;
    city: string;
    coordinates: { lat: number; lng: number };
  }[];
}

// Predefined skills with icons
const availableSkills = [
  { id: 'vinduespolering_trad', name: 'Vinduespolering (Traditionel)', icon: '🪟' },
  { id: 'vinduespolering_rent', name: 'Vinduespolering (Rentvandsanlæg)', icon: '💧' },
  { id: 'algerens', name: 'Algerens', icon: '🧽' },
  { id: 'fliserens', name: 'Fliserens', icon: '🧹' },
  { id: 'rengoring', name: 'Rengøring', icon: '🧼' },
  { id: 'hojtryk', name: 'Højtryksspuling', icon: '💦' },
  { id: 'gulvbehandling', name: 'Gulvbehandling', icon: '🧴' },
  { id: 'taepper', name: 'Tæpperens', icon: '🧶' },
  { id: 'hojde', name: 'Højdearbejde', icon: '🪜' },
  { id: 'specialrens', name: 'Specialrens', icon: '🧪' }
];

export default function TaskManagement() {
  const { user } = useAuth();
  const [activeView, setActiveView] = useState<'calendar' | 'map'>('calendar');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEmployeeRouteMap, setShowEmployeeRouteMap] = useState<string | null>(null);
  const [showFullRouteMap, setShowFullRouteMap] = useState(false);
  const [draggedTask, setDraggedTask] = useState<string | null>(null);
  const [draggedFromEmployee, setDraggedFromEmployee] = useState<string | null>(null);
  const [selectedEmployeeForOptimization, setSelectedEmployeeForOptimization] = useState<string>('');

  useEffect(() => {
    loadData();
  }, [selectedDate, user]);

  const loadData = async () => {
    setIsLoading(true);
    
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Mock customers data - matches the customer management
    const mockCustomers: Customer[] = [
      {
        id: '1',
        name: 'Netto Supermarked',
        addresses: [
          {
            id: '1',
            street: 'Hovedgade 123',
            postalCode: '2000',
            city: 'Frederiksberg',
            coordinates: { lat: 55.6761, lng: 12.5683 }
          }
        ]
      },
      {
        id: '2',
        name: 'Kontorbygning A/S',
        addresses: [
          {
            id: '2',
            street: 'Erhvervsvej 45',
            postalCode: '2100',
            city: 'København Ø',
            coordinates: { lat: 55.6861, lng: 12.5783 }
          }
        ]
      },
      {
        id: '3',
        name: 'Restaurant Bella',
        addresses: [
          {
            id: '3',
            street: 'Cafégade 78',
            postalCode: '2200',
            city: 'København N',
            coordinates: { lat: 55.6961, lng: 12.5883 }
          }
        ]
      },
      {
        id: '4',
        name: 'Fitness Center Pro',
        addresses: [
          {
            id: '4',
            street: 'Sportsvej 12',
            postalCode: '2300',
            city: 'København S',
            coordinates: { lat: 55.6461, lng: 12.6083 }
          }
        ]
      }
    ];

    // Mock employees data - matches the employee management
    const mockEmployees: Employee[] = [
      {
        id: '1',
        name: 'Lars Nielsen',
        role: 'Vinduespolerer',
        skills: ['vinduespolering_trad', 'vinduespolering_rent', 'hojde'],
        maxTasksPerDay: 4,
        tasksToday: [],
        color: '#3B82F6',
        workingHours: { start: '07:00', end: '15:00' },
        isAvailable: true,
        currentLocation: { lat: 55.6761, lng: 12.5683 },
        efficiency: 94
      },
      {
        id: '2',
        name: 'Peter Andersen',
        role: 'Specialtekniker',
        skills: ['algerens', 'hojtryk', 'specialrens'],
        maxTasksPerDay: 3,
        tasksToday: [],
        color: '#10B981',
        workingHours: { start: '08:00', end: '16:00' },
        isAvailable: true,
        currentLocation: { lat: 55.6861, lng: 12.5783 },
        efficiency: 92
      },
      {
        id: '3',
        name: 'Maria Hansen',
        role: 'Rengøringsassistent',
        skills: ['rengoring', 'gulvbehandling', 'taepper'],
        maxTasksPerDay: 5,
        tasksToday: [],
        color: '#F59E0B',
        workingHours: { start: '06:00', end: '14:00' },
        isAvailable: true,
        currentLocation: { lat: 55.6961, lng: 12.5883 },
        efficiency: 89
      }
    ];

    // Mock tasks data - realistic for service industry
    const mockTasks: Task[] = [
      {
        id: '1',
        title: 'Vinduespolering - Butiksfacade',
        customer: 'Netto Supermarked',
        customerAddress: 'Hovedgade 123, 2000 Frederiksberg',
        coordinates: { lat: 55.6761, lng: 12.5683 },
        estimatedTime: 180,
        priority: 4,
        startDate: selectedDate,
        timeWindow: { start: '08:00', end: '12:00' },
        assignedEmployees: [],
        status: 'pending',
        skills: ['vinduespolering_trad'],
        type: 'vinduespolering',
        description: 'Polering af store butiksvinduer og indgangsparti',
        flexibility: 'strict'
      },
      {
        id: '2',
        title: 'Algerens - Terrasse og gangstier',
        customer: 'Kontorbygning A/S',
        customerAddress: 'Erhvervsvej 45, 2100 København Ø',
        coordinates: { lat: 55.6861, lng: 12.5783 },
        estimatedTime: 240,
        priority: 3,
        startDate: selectedDate,
        timeWindow: { start: '09:00', end: '15:00' },
        assignedEmployees: [],
        status: 'pending',
        skills: ['algerens', 'hojtryk'],
        type: 'algerens',
        description: 'Fjernelse af alger fra terrasse og hovedindgang',
        flexibility: 'flexible'
      },
      {
        id: '3',
        title: 'Kontorrengøring - Ugentlig',
        customer: 'Restaurant Bella',
        customerAddress: 'Cafégade 78, 2200 København N',
        coordinates: { lat: 55.6961, lng: 12.5883 },
        estimatedTime: 120,
        priority: 2,
        startDate: selectedDate,
        assignedEmployees: [],
        status: 'pending',
        skills: ['rengoring'],
        type: 'rengøring',
        description: 'Ugentlig rengøring af kontorfaciliteter',
        flexibility: 'very_flexible'
      },
      {
        id: '4',
        title: 'Specialrens - Træningsudstyr',
        customer: 'Fitness Center Pro',
        customerAddress: 'Sportsvej 12, 2300 København S',
        coordinates: { lat: 55.6461, lng: 12.6083 },
        estimatedTime: 150,
        priority: 3,
        startDate: selectedDate,
        assignedEmployees: [],
        status: 'pending',
        skills: ['specialrens', 'rengoring'],
        type: 'specialrens',
        description: 'Specialrens af træningsudstyr og faciliteter',
        flexibility: 'flexible'
      }
    ];

    setCustomers(mockCustomers);
    setTasks(mockTasks);
    setEmployees(mockEmployees);
    setIsLoading(false);
  };

  // INDIVIDUEL MEDARBEJDER OPTIMERING
  const optimizeEmployeeRoute = async (employeeId: string) => {
    const employee = employees.find(emp => emp.id === employeeId);
    if (!employee) return;

    setIsOptimizing(true);
    
    // Simuler optimering
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const employeeTasks = tasks.filter(task => task.assignedEmployees.includes(employeeId));
    
    if (employeeTasks.length === 0) {
      setIsOptimizing(false);
      return;
    }

    // Optimer opgaver
    const optimizedTasks = optimizeTasksWithGraphHopper(employeeTasks, employee);
    
    // Opdater kun denne medarbejders opgaver
    const updatedTasks = tasks.map(task => {
      const optimizedTask = optimizedTasks.find(opt => opt.id === task.id);
      if (optimizedTask) {
        return { ...task, routeOrder: optimizedTask.routeOrder };
      }
      return task;
    });
    
    setTasks(updatedTasks);
    setIsOptimizing(false);
  };

  const optimizeTasksWithGraphHopper = (tasks: Task[], employee: Employee) => {
    // Sorter efter tidsvinduer først
    const timeWindowTasks = tasks.filter(t => t.timeWindow);
    const flexibleTasks = tasks.filter(t => !t.timeWindow);

    timeWindowTasks.sort((a, b) => {
      if (a.timeWindow && b.timeWindow) {
        return a.timeWindow.start.localeCompare(b.timeWindow.start);
      }
      return 0;
    });

    // Optimer fleksible opgaver efter afstand og prioritet
    flexibleTasks.sort((a, b) => {
      const priorityWeight = 0.6;
      const distanceWeight = 0.4;
      
      const aScore = (a.priority * priorityWeight) + (calculateDistance(a.coordinates, employee.currentLocation || { lat: 55.6761, lng: 12.5683 }) * distanceWeight);
      const bScore = (b.priority * priorityWeight) + (calculateDistance(b.coordinates, employee.currentLocation || { lat: 55.6761, lng: 12.5683 }) * distanceWeight);
      
      return bScore - aScore;
    });

    const optimizedTasks = [...timeWindowTasks, ...flexibleTasks];
    return optimizedTasks.map((task, index) => ({
      ...task,
      routeOrder: index + 1
    }));
  };

  const calculateDistance = (pos1: { lat: number; lng: number }, pos2: { lat: number; lng: number }) => {
    const R = 6371;
    const dLat = (pos2.lat - pos1.lat) * Math.PI / 180;
    const dLon = (pos2.lng - pos1.lng) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(pos1.lat * Math.PI / 180) * Math.cos(pos2.lat * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  // FORBEDRET DRAG & DROP
  const handleDragStart = (e: React.DragEvent, taskId: string, fromEmployee?: string) => {
    setDraggedTask(taskId);
    setDraggedFromEmployee(fromEmployee || null);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', taskId);
    
    // Visual feedback
    const dragElement = e.target as HTMLElement;
    dragElement.style.opacity = '0.5';
    dragElement.style.transform = 'rotate(3deg) scale(0.95)';
    dragElement.style.transition = 'all 0.2s ease';
  };

  const handleDragEnd = (e: React.DragEvent) => {
    const dragElement = e.target as HTMLElement;
    dragElement.style.opacity = '1';
    dragElement.style.transform = 'none';
    setDraggedTask(null);
    setDraggedFromEmployee(null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetEmployeeId: string) => {
    e.preventDefault();
    
    const taskId = e.dataTransfer.getData('text/plain');
    if (!taskId) return;

    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    const employee = employees.find(emp => emp.id === targetEmployeeId);
    if (!employee) return;

    // Tjek tilgængelighed
    if (!employee.isAvailable) {
      alert(`${employee.name} er ikke tilgængelig i dag`);
      return;
    }

    // Færdighedstjek
    const missingSkills = task.skills.filter(skill => !employee.skills.includes(skill));
    if (missingSkills.length > 0) {
      alert(`${employee.name} mangler følgende færdigheder: ${missingSkills.join(', ')}`);
      return;
    }

    // Kapacitetstjek
    const currentTasks = tasks.filter(t => t.assignedEmployees.includes(targetEmployeeId));
    if (currentTasks.length >= employee.maxTasksPerDay) {
      alert(`${employee.name} har allerede maksimalt antal opgaver (${employee.maxTasksPerDay})`);
      return;
    }

    // Konfliktkontrol
    if (task.timeWindow) {
      const conflicts = currentTasks.filter(t => {
        if (!t.timeWindow) return false;
        return timeWindowsOverlap(task.timeWindow!, t.timeWindow);
      });

      if (conflicts.length > 0) {
        const conflictTitles = conflicts.map(c => c.title).join(', ');
        alert(`Tidskonflikt! Opgaven overlapper med: ${conflictTitles}`);
        return;
      }
    }

    // Flyt opgave
    moveTaskToEmployee(taskId, targetEmployeeId);
  };

  const timeWindowsOverlap = (window1: { start: string; end: string }, window2: { start: string; end: string }) => {
    const start1 = parseTime(window1.start);
    const end1 = parseTime(window1.end);
    const start2 = parseTime(window2.start);
    const end2 = parseTime(window2.end);

    return start1 < end2 && start2 < end1;
  };

  const parseTime = (time: string): number => {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  };

  const moveTaskToEmployee = (taskId: string, toEmployeeId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    // Opdater opgaven med ny tildeling
    const updatedTasks = tasks.map(t => {
      if (t.id === taskId) {
        return {
          ...t,
          assignedEmployees: toEmployeeId ? [toEmployeeId] : [],
          status: toEmployeeId ? 'assigned' as const : 'pending' as const
        };
      }
      return t;
    });

    setTasks(updatedTasks);

    // Opdater medarbejdernes opgavelister
    setEmployees(employees.map(emp => {
      const empTasks = updatedTasks.filter(task => task.assignedEmployees.includes(emp.id));
      return { ...emp, tasksToday: empTasks };
    }));
  };

  const assignTaskToEmployees = (taskId: string, employeeIds: string[]) => {
    setTasks(tasks.map(task => {
      if (task.id === taskId) {
        return {
          ...task,
          assignedEmployees: employeeIds,
          status: employeeIds.length > 0 ? 'assigned' as const : 'pending' as const
        };
      }
      return task;
    }));

    // Opdater medarbejdernes opgavelister
    setEmployees(employees.map(emp => {
      const empTasks = tasks.filter(task => 
        task.assignedEmployees.includes(emp.id) || 
        (task.id === taskId && employeeIds.includes(emp.id))
      );
      return { ...emp, tasksToday: empTasks };
    }));
  };

  const handleCreateTask = (taskData: any) => {
    const customer = customers.find(c => c.id === taskData.customerId);
    const address = customer?.addresses.find(a => a.id === taskData.addressId);
    
    if (!customer || !address) return;

    const newTask: Task = {
      id: Date.now().toString(),
      title: taskData.title,
      customer: customer.name,
      customerAddress: `${address.street}, ${address.postalCode} ${address.city}`,
      coordinates: address.coordinates,
      estimatedTime: taskData.estimatedTime,
      priority: taskData.priority,
      startDate: taskData.startDate,
      timeWindow: taskData.hasTimeWindow ? { start: taskData.startTime, end: taskData.endTime } : undefined,
      assignedEmployees: [],
      status: 'pending',
      skills: taskData.skills,
      type: taskData.type,
      description: taskData.description,
      flexibility: taskData.flexibility
    };

    setTasks([...tasks, newTask]);
    setShowCreateModal(false);
  };

  const getUnassignedTasks = () => {
    return tasks.filter(task => 
      task.startDate === selectedDate && 
      task.assignedEmployees.length === 0
    );
  };

  const getTaskStats = () => {
    const dayTasks = tasks.filter(t => t.startDate === selectedDate);
    return {
      total: dayTasks.length,
      unassigned: dayTasks.filter(t => t.assignedEmployees.length === 0).length,
      assigned: dayTasks.filter(t => t.assignedEmployees.length > 0).length,
      conflicts: dayTasks.filter(t => hasTimeConflicts(t)).length,
      missingSkills: dayTasks.filter(t => t.assignedEmployees.some(empId => {
        const emp = employees.find(e => e.id === empId);
        return emp && !t.skills.every(skill => emp.skills.includes(skill));
      })).length
    };
  };

  const hasTimeConflicts = (task: Task) => {
    if (!task.timeWindow || task.assignedEmployees.length === 0) return false;
    
    const employeeId = task.assignedEmployees[0];
    const otherTasks = tasks.filter(t => 
      t.id !== task.id && 
      t.assignedEmployees.includes(employeeId) && 
      t.timeWindow
    );

    return otherTasks.some(t => timeWindowsOverlap(task.timeWindow!, t.timeWindow!));
  };

  const stats = getTaskStats();

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
            <h1 className="text-2xl font-bold text-gray-900">Opgaver & Ruter</h1>
            <p className="text-gray-600 mt-1">Intelligent planlægning med ruteoptimering og live feedback</p>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center bg-gray-50 rounded-lg px-3 py-2">
              <Calendar className="h-4 w-4 text-gray-400 mr-2" />
              <input
                type="date"
                className="bg-transparent border-none focus:outline-none text-sm"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
            </div>
            
            <button 
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors shadow-sm"
            >
              <Plus className="h-4 w-4 mr-2" />
              Ny opgave
            </button>

            <button
              onClick={() => setShowFullRouteMap(true)}
              className="inline-flex items-center px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 transition-colors shadow-sm"
            >
              <Map className="h-4 w-4 mr-2" />
              Fuldt rutekort
            </button>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setActiveView('calendar')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                activeView === 'calendar' 
                  ? 'bg-white text-gray-900 shadow-sm' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <List className="h-4 w-4 mr-2 inline" />
              Kalender
            </button>
            <button
              onClick={() => setActiveView('map')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                activeView === 'map' 
                  ? 'bg-white text-gray-900 shadow-sm' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Map className="h-4 w-4 mr-2 inline" />
              Kort
            </button>
          </div>

          {/* Individuel optimering */}
          <div className="flex items-center space-x-3">
            <select
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
              value={selectedEmployeeForOptimization}
              onChange={(e) => setSelectedEmployeeForOptimization(e.target.value)}
            >
              <option value="">Vælg medarbejder til optimering</option>
              {employees.filter(emp => emp.isAvailable).map(emp => (
                <option key={emp.id} value={emp.id}>{emp.name}</option>
              ))}
            </select>
            
            <button
              onClick={() => selectedEmployeeForOptimization && optimizeEmployeeRoute(selectedEmployeeForOptimization)}
              disabled={!selectedEmployeeForOptimization || isOptimizing}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
            >
              {isOptimizing ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Optimerer...
                </>
              ) : (
                <>
                  <Zap className="h-4 w-4 mr-2" />
                  Optimer rute
                </>
              )}
            </button>
          </div>
        </div>

        {/* Enhanced Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-blue-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-blue-700">{stats.total}</div>
            <div className="text-sm text-blue-600">Total opgaver</div>
          </div>
          
          <div className="bg-orange-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-orange-700">{stats.unassigned}</div>
            <div className="text-sm text-orange-600">Ikke tildelt</div>
          </div>
          
          <div className="bg-green-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-green-700">{stats.assigned}</div>
            <div className="text-sm text-green-600">Tildelt</div>
          </div>
          
          <div className="bg-red-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-red-700">{stats.conflicts}</div>
            <div className="text-sm text-red-600">Konflikter</div>
          </div>

          <div className="bg-purple-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-purple-700">{stats.missingSkills}</div>
            <div className="text-sm text-purple-600">Mangler færdigheder</div>
          </div>
        </div>
      </div>

      {/* Warnings */}
      {(stats.conflicts > 0 || stats.missingSkills > 0) && (
        <div className="space-y-3">
          {stats.conflicts > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <div className="flex">
                <AlertTriangle className="h-5 w-5 text-red-400 mr-3 mt-0.5" />
                <div>
                  <h4 className="text-sm font-medium text-red-800">
                    {stats.conflicts} opgaver har tidskonflikter
                  </h4>
                  <p className="text-sm text-red-700 mt-1">
                    Overlappende tidsvinduer for samme medarbejder. Juster tildeling eller tidspunkter.
                  </p>
                </div>
              </div>
            </div>
          )}

          {stats.missingSkills > 0 && (
            <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
              <div className="flex">
                <AlertTriangle className="h-5 w-5 text-orange-400 mr-3 mt-0.5" />
                <div>
                  <h4 className="text-sm font-medium text-orange-800">
                    {stats.missingSkills} opgaver har medarbejdere uden nødvendige færdigheder
                  </h4>
                  <p className="text-sm text-orange-700 mt-1">
                    Tildel opgaver til medarbejdere med de rigtige kvalifikationer.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Content */}
      {activeView === 'calendar' ? (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Unassigned Tasks */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="px-4 py-3 border-b border-gray-200 bg-gray-50 rounded-t-xl">
                <h3 className="text-sm font-medium text-gray-900">
                  Ikke tildelt ({getUnassignedTasks().length})
                </h3>
              </div>
              <div 
                className="p-4 space-y-3 min-h-[500px]"
                onDragOver={(e) => handleDragOver(e)}
                onDrop={(e) => handleDrop(e, '')}
              >
                {getUnassignedTasks().map(task => (
                  <TaskCard 
                    key={task.id} 
                    task={task} 
                    onDragStart={handleDragStart}
                    onDragEnd={handleDragEnd}
                    isDraggable={true}
                    onAssignEmployees={assignTaskToEmployees}
                    employees={employees}
                  />
                ))}
                
                {getUnassignedTasks().length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <CheckSquare className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                    <p className="text-sm">Alle opgaver tildelt</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Employee Columns */}
          <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-6">
            {employees.map(employee => (
              <EmployeeColumn 
                key={employee.id}
                employee={employee}
                tasks={tasks.filter(t => t.assignedEmployees.includes(employee.id))}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onOptimizeRoute={() => optimizeEmployeeRoute(employee.id)}
                onViewRoute={() => setShowEmployeeRouteMap(employee.id)}
                isOptimizing={isOptimizing && selectedEmployeeForOptimization === employee.id}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
              />
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">
                Rutekort for {new Date(selectedDate).toLocaleDateString('da-DK')}
              </h3>
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                  <span>Afventer</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                  <span>I gang</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                  <span>Afsluttet</span>
                </div>
              </div>
            </div>
          </div>
          
          <RouteMap
            tasks={tasks.filter(t => t.startDate === selectedDate && t.assignedEmployees.length > 0).map(task => ({
              id: task.id,
              title: task.title,
              customer: task.customer,
              address: task.customerAddress,
              coordinates: task.coordinates,
              status: task.status,
              routeOrder: task.routeOrder || 1,
              estimatedTime: task.estimatedTime
            }))}
            showRoute={true}
            onTaskClick={(taskId) => {
              console.log('Task clicked:', taskId);
            }}
          />
        </div>
      )}

      {/* Modals */}
      {showCreateModal && (
        <CreateTaskModal
          customers={customers}
          employees={employees}
          availableSkills={availableSkills}
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreateTask}
          selectedDate={selectedDate}
        />
      )}

      {showEmployeeRouteMap && (
        <EmployeeRouteMapModal
          employee={employees.find(emp => emp.id === showEmployeeRouteMap)!}
          tasks={tasks.filter(t => t.assignedEmployees.includes(showEmployeeRouteMap))}
          onClose={() => setShowEmployeeRouteMap(null)}
        />
      )}

      {showFullRouteMap && (
        <FullRouteMapModal
          employees={employees}
          tasks={tasks.filter(t => t.startDate === selectedDate && t.assignedEmployees.length > 0)}
          onClose={() => setShowFullRouteMap(false)}
        />
      )}

      {/* Help Section */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
        <div className="flex">
          <Zap className="h-6 w-6 text-blue-400 mr-4 mt-1" />
          <div>
            <h4 className="text-lg font-medium text-blue-800 mb-3">🚀 Smart Planlægningsfunktioner</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-700">
              <div>
                <h5 className="font-medium mb-2">Drag & Drop Planlægning</h5>
                <ul className="space-y-1">
                  <li>• Træk opgaver til medarbejdere for at tildele dem</li>
                  <li>• Automatisk færdighedstjek og konfliktdetektering</li>
                  <li>• Blokering mod fejltildelinger</li>
                  <li>• Visuel feedback under træk</li>
                </ul>
              </div>
              <div>
                <h5 className="font-medium mb-2">Intelligent Optimering</h5>
                <ul className="space-y-1">
                  <li>• Ruteoptimering per medarbejder</li>
                  <li>• Individuel optimering per medarbejder</li>
                  <li>• Tidsvinduer prioriteres højest</li>
                  <li>• Afstand og prioritet kombineres smart</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Task Card Component med forbedret design
function TaskCard({ 
  task, 
  onDragStart, 
  onDragEnd,
  isDraggable = false,
  onAssignEmployees,
  employees,
  fromEmployee
}: { 
  task: Task; 
  onDragStart: (e: React.DragEvent, taskId: string, fromEmployee?: string) => void;
  onDragEnd: (e: React.DragEvent) => void;
  isDraggable?: boolean;
  onAssignEmployees?: (taskId: string, employeeIds: string[]) => void;
  employees?: Employee[];
  fromEmployee?: string;
}) {
  const [showAssignModal, setShowAssignModal] = useState(false);

  const getPriorityColor = (priority: number) => {
    if (priority >= 4) return 'border-l-red-500 bg-red-50';
    if (priority >= 3) return 'border-l-orange-500 bg-orange-50';
    return 'border-l-blue-500 bg-blue-50';
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'vinduespolering': return '🪟';
      case 'algerens': return '🧽';
      case 'fliserens': return '🧹';
      case 'rengøring': return '🧼';
      case 'specialrens': return '🧪';
      default: return '🔧';
    }
  };

  const getFlexibilityColor = (flexibility: string) => {
    switch (flexibility) {
      case 'strict': return 'bg-red-100 text-red-800';
      case 'flexible': return 'bg-yellow-100 text-yellow-800';
      case 'very_flexible': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <>
      <div 
        className={`p-3 border-l-4 rounded-lg ${getPriorityColor(task.priority)} ${
          isDraggable ? 'cursor-move hover:shadow-md' : ''
        } transition-all duration-200`}
        draggable={isDraggable}
        onDragStart={(e) => onDragStart(e, task.id, fromEmployee)}
        onDragEnd={onDragEnd}
      >
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center">
            <span className="text-lg mr-2">{getTypeIcon(task.type)}</span>
            <h4 className="text-sm font-medium text-gray-900 leading-tight">{task.title}</h4>
          </div>
          <div className="flex items-center space-x-1">
            <span className="text-xs font-medium text-gray-600">P{task.priority}</span>
            {task.flexibility !== 'flexible' && (
              <span className={`text-xs px-1 py-0.5 rounded ${getFlexibilityColor(task.flexibility)}`}>
                {task.flexibility === 'strict' ? 'Fast' : 'Fleks'}
              </span>
            )}
          </div>
        </div>
        
        <p className="text-sm text-gray-600 mb-2">{task.customer}</p>
        
        <div className="space-y-1 text-xs text-gray-500 mb-3">
          <div className="flex items-center">
            <Clock className="h-3 w-3 mr-1" />
            {task.estimatedTime} min
          </div>
          
          {task.timeWindow ? (
            <div className="flex items-center">
              <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-medium">
                {task.timeWindow.start} - {task.timeWindow.end}
              </span>
            </div>
          ) : (
            <div className="flex items-center">
              <AlertTriangle className="h-3 w-3 mr-1 text-orange-500" />
              <span className="text-orange-600">Fleksibel tid</span>
            </div>
          )}

          <div className="text-xs text-gray-400">
            {task.skills.join(' • ')}
          </div>
        </div>

        {/* Assigned employees */}
        {task.assignedEmployees.length > 0 && (
          <div className="mb-2">
            <div className="flex items-center text-xs text-gray-600">
              <Users className="h-3 w-3 mr-1" />
              {task.assignedEmployees.length} medarbejder(e)
            </div>
          </div>
        )}

        {/* Assign button */}
        {onAssignEmployees && employees && (
          <button
            onClick={() => setShowAssignModal(true)}
            className="w-full mt-2 px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
          >
            <UserPlus className="h-3 w-3 mr-1 inline" />
            Tildel medarbejdere
          </button>
        )}
      </div>

      {/* Assign Modal */}
      {showAssignModal && onAssignEmployees && employees && (
        <AssignEmployeesModal
          task={task}
          employees={employees}
          onAssign={(employeeIds) => {
            onAssignEmployees(task.id, employeeIds);
            setShowAssignModal(false);
          }}
          onClose={() => setShowAssignModal(false)}
        />
      )}
    </>
  );
}

// Employee Column Component med forbedret design
function EmployeeColumn({ 
  employee, 
  tasks,
  onDragOver,
  onDrop,
  onOptimizeRoute,
  onViewRoute,
  isOptimizing,
  onDragStart,
  onDragEnd
}: { 
  employee: Employee; 
  tasks: Task[];
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent, employeeId: string) => void;
  onOptimizeRoute: () => void;
  onViewRoute: () => void;
  isOptimizing?: boolean;
  onDragStart: (e: React.DragEvent, taskId: string, fromEmployee?: string) => void;
  onDragEnd: (e: React.DragEvent) => void;
}) {
  const totalTime = tasks.reduce((sum, task) => sum + task.estimatedTime, 0);
  const isOverloaded = tasks.length > employee.maxTasksPerDay;
  const hasConflicts = tasks.some(task => {
    if (!task.timeWindow) return false;
    return tasks.some(otherTask => 
      otherTask.id !== task.id && 
      otherTask.timeWindow && 
      timeWindowsOverlap(task.timeWindow!, otherTask.timeWindow!)
    );
  });

  const timeWindowsOverlap = (window1: { start: string; end: string }, window2: { start: string; end: string }) => {
    const parseTime = (timeStr: string): number => {
      const [hours, minutes] = timeStr.split(':').map(Number);
      return hours * 60 + minutes;
    };

    const start1 = parseTime(window1.start);
    const end1 = parseTime(window1.end);
    const start2 = parseTime(window2.start);
    const end2 = parseTime(window2.end);

    return start1 < end2 && start2 < end1;
  };

  return (
    <div className={`bg-white rounded-xl shadow-sm border-2 transition-all ${
      !employee.isAvailable 
        ? 'border-red-200 bg-red-50' 
        : isOverloaded 
          ? 'border-orange-200 bg-orange-50' 
          : hasConflicts
            ? 'border-yellow-200 bg-yellow-50'
            : 'border-gray-200'
    }`}>
      <div className="px-4 py-3 border-b border-gray-200 rounded-t-xl bg-gray-50">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center">
            <div 
              className="w-3 h-3 rounded-full mr-2"
              style={{ backgroundColor: employee.color }}
            ></div>
            <h3 className="text-sm font-medium text-gray-900">{employee.name}</h3>
            {!employee.isAvailable && (
              <span className="ml-2 text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full">
                Fravær
              </span>
            )}
          </div>
          <span className={`text-xs px-2 py-1 rounded-full ${
            isOverloaded ? 'bg-red-100 text-red-800' : 
            tasks.length === employee.maxTasksPerDay ? 'bg-orange-100 text-orange-800' :
            'bg-blue-100 text-blue-800'
          }`}>
            {tasks.length}/{employee.maxTasksPerDay}
          </span>
        </div>
        
        <div className="text-xs text-gray-500 mb-2">
          {employee.role}
        </div>

        <div className="text-xs text-gray-500 mb-3">
          {Math.round(totalTime / 60)}t {totalTime % 60}m • {employee.workingHours.start}-{employee.workingHours.end}
        </div>

        {/* Status indicators */}
        {hasConflicts && (
          <div className="text-xs text-yellow-700 bg-yellow-100 px-2 py-1 rounded mb-2">
            ⚠️ Tidskonflikter
          </div>
        )}

        {/* Action buttons */}
        <div className="flex space-x-1">
          <button
            onClick={onOptimizeRoute}
            disabled={tasks.length === 0 || !employee.isAvailable || isOptimizing}
            className="flex-1 px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 disabled:opacity-50 transition-colors"
          >
            {isOptimizing ? (
              <>
                <RefreshCw className="h-3 w-3 mr-1 inline animate-spin" />
                Optimerer
              </>
            ) : (
              <>
                <Zap className="h-3 w-3 mr-1 inline" />
                Optimer
              </>
            )}
          </button>
          <button
            onClick={onViewRoute}
            disabled={tasks.length === 0}
            className="flex-1 px-2 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200 disabled:opacity-50 transition-colors"
          >
            <Eye className="h-3 w-3 mr-1 inline" />
            Se rute
          </button>
        </div>
      </div>
      
      <div 
        className={`p-4 space-y-3 min-h-[500px] border-2 border-dashed transition-colors ${
          employee.isAvailable 
            ? 'border-transparent hover:border-blue-300' 
            : 'border-red-200'
        }`}
        onDragOver={onDragOver}
        onDrop={(e) => onDrop(e, employee.id)}
      >
        {tasks
          .sort((a, b) => (a.routeOrder || 0) - (b.routeOrder || 0))
          .map((task, index) => (
            <div key={task.id} className="relative">
              <div className="absolute -left-1 top-1 w-5 h-5 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold z-10">
                {task.routeOrder || index + 1}
              </div>
              <div className="ml-4">
                <TaskCard 
                  task={task} 
                  onDragStart={onDragStart}
                  onDragEnd={onDragEnd}
                  isDraggable={true}
                  fromEmployee={employee.id}
                />
              </div>
            </div>
          ))}
        
        {tasks.length === 0 && (
          <div className={`text-center py-8 border-2 border-dashed rounded-lg transition-colors ${
            employee.isAvailable 
              ? 'text-gray-400 border-gray-200' 
              : 'text-red-400 border-red-200'
          }`}>
            <Users className="h-8 w-8 mx-auto mb-2" />
            <p className="text-sm">
              {employee.isAvailable ? 'Træk opgaver hertil' : 'Ikke tilgængelig'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// Assign Employees Modal
function AssignEmployeesModal({ 
  task, 
  employees, 
  onAssign, 
  onClose 
}: {
  task: Task;
  employees: Employee[];
  onAssign: (employeeIds: string[]) => void;
  onClose: () => void;
}) {
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>(task.assignedEmployees);

  const toggleEmployee = (employeeId: string) => {
    setSelectedEmployees(prev => 
      prev.includes(employeeId) 
        ? prev.filter(id => id !== employeeId)
        : [...prev, employeeId]
    );
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose}></div>

        <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>

        <div className="inline-block align-bottom bg-white rounded-xl px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Tildel medarbejdere</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <h4 className="font-medium text-gray-900">{task.title}</h4>
            <p className="text-sm text-gray-600">{task.customer}</p>
            <div className="text-xs text-gray-500 mt-1">
              Kræver: {task.skills.join(', ')}
            </div>
          </div>

          <div className="space-y-3">
            {employees.map(employee => {
              const hasSkills = task.skills.every(skill => employee.skills.includes(skill));
              const isSelected = selectedEmployees.includes(employee.id);
              const isAvailable = employee.isAvailable;
              
              return (
                <div 
                  key={employee.id}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    !isAvailable 
                      ? 'border-red-200 bg-red-50 opacity-50' :
                    isSelected 
                      ? 'border-blue-500 bg-blue-50' 
                      : hasSkills 
                        ? 'border-gray-200 hover:border-gray-300' 
                        : 'border-orange-200 bg-orange-50'
                  }`}
                  onClick={() => hasSkills && isAvailable && toggleEmployee(employee.id)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-gray-900">{employee.name}</div>
                      <div className="text-sm text-gray-600">{employee.role}</div>
                      {!isAvailable && (
                        <div className="text-xs text-red-600">Ikke tilgængelig (fravær)</div>
                      )}
                    </div>
                    <div className="flex items-center">
                      {!hasSkills && (
                        <span className="text-xs text-orange-600 mr-2">Mangler færdigheder</span>
                      )}
                      <input
                        type="checkbox"
                        checked={isSelected}
                        disabled={!hasSkills || !isAvailable}
                        onChange={() => {}}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-6 flex space-x-3">
            <button
              onClick={() => onAssign(selectedEmployees)}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Tildel ({selectedEmployees.length})
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Annuller
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Create Task Modal
function CreateTaskModal({
  customers,
  employees,
  availableSkills,
  onClose,
  onSubmit,
  selectedDate
}: {
  customers: Customer[];
  employees: Employee[];
  availableSkills: { id: string; name: string; icon: string }[];
  onClose: () => void;
  onSubmit: (data: any) => void;
  selectedDate: string;
}) {
  const [formData, setFormData] = useState({
    title: '',
    customerId: '',
    addressId: '',
    type: 'rengøring' as 'vinduespolering' | 'algerens' | 'fliserens' | 'rengøring' | 'specialrens',
    description: '',
    estimatedTime: 60,
    priority: 3 as 1 | 2 | 3 | 4 | 5,
    startDate: selectedDate,
    hasTimeWindow: false,
    startTime: '08:00',
    endTime: '12:00',
    skills: [] as string[],
    flexibility: 'flexible' as 'strict' | 'flexible' | 'very_flexible'
  });

  const [selectedCustomerAddresses, setSelectedCustomerAddresses] = useState<any[]>([]);

  // Update available addresses when customer changes
  useEffect(() => {
    if (formData.customerId) {
      const customer = customers.find(c => c.id === formData.customerId);
      if (customer) {
        setSelectedCustomerAddresses(customer.addresses);
        if (customer.addresses.length > 0) {
          setFormData(prev => ({
            ...prev,
            addressId: customer.addresses[0].id
          }));
        }
      } else {
        setSelectedCustomerAddresses([]);
      }
    } else {
      setSelectedCustomerAddresses([]);
    }
  }, [formData.customerId, customers]);

  // Set default skills based on task type
  useEffect(() => {
    let defaultSkills: string[] = [];
    
    switch (formData.type) {
      case 'vinduespolering':
        defaultSkills = ['vinduespolering_trad'];
        break;
      case 'algerens':
        defaultSkills = ['algerens'];
        break;
      case 'fliserens':
        defaultSkills = ['fliserens'];
        break;
      case 'rengøring':
        defaultSkills = ['rengoring'];
        break;
      case 'specialrens':
        defaultSkills = ['specialrens'];
        break;
    }
    
    setFormData(prev => ({
      ...prev,
      skills: defaultSkills
    }));
  }, [formData.type]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleSkillToggle = (skillId: string) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.includes(skillId)
        ? prev.skills.filter(id => id !== skillId)
        : [...prev.skills, skillId]
    }));
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'vinduespolering': return '🪟';
      case 'algerens': return '🧽';
      case 'fliserens': return '🧹';
      case 'rengøring': return '🧼';
      case 'specialrens': return '🧪';
      default: return '🔧';
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose}></div>

        <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>

        <div className="inline-block align-bottom bg-white rounded-xl px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full sm:p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-medium text-gray-900">Opret ny opgave</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X className="h-5 w-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Info */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Opgavetype</label>
              <div className="grid grid-cols-5 gap-2">
                {[
                  { value: 'rengøring', label: 'Rengøring' },
                  { value: 'vinduespolering', label: 'Vinduespolering' },
                  { value: 'algerens', label: 'Algerens' },
                  { value: 'fliserens', label: 'Fliserens' },
                  { value: 'specialrens', label: 'Specialrens' }
                ].map(type => (
                  <label
                    key={type.value}
                    className={`flex flex-col items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                      formData.type === type.value
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <input
                      type="radio"
                      name="type"
                      value={type.value}
                      checked={formData.type === type.value}
                      onChange={() => setFormData({ ...formData, type: type.value as any })}
                      className="sr-only"
                    />
                    <span className="text-2xl mb-1">{getTypeIcon(type.value)}</span>
                    <span className="text-xs text-center">{type.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Opgavetitel *</label>
              <input
                type="text"
                required
                className="mt-1 block w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="F.eks. Ugentlig rengøring"
              />
            </div>

            {/* Customer and Address */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Kunde *</label>
                <select
                  required
                  className="mt-1 block w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  value={formData.customerId}
                  onChange={(e) => setFormData({ ...formData, customerId: e.target.value })}
                >
                  <option value="">Vælg kunde</option>
                  {customers.map(customer => (
                    <option key={customer.id} value={customer.id}>{customer.name}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Adresse *</label>
                <select
                  required
                  disabled={!formData.customerId}
                  className="mt-1 block w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:text-gray-500"
                  value={formData.addressId}
                  onChange={(e) => setFormData({ ...formData, addressId: e.target.value })}
                >
                  <option value="">Vælg adresse</option>
                  {selectedCustomerAddresses.map(address => (
                    <option key={address.id} value={address.id}>
                      {address.street}, {address.postalCode} {address.city}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Time and Priority */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Estimeret tid (minutter) *</label>
                <input
                  type="number"
                  required
                  min="15"
                  step="15"
                  className="mt-1 block w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  value={formData.estimatedTime}
                  onChange={(e) => setFormData({ ...formData, estimatedTime: parseInt(e.target.value) })}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Prioritet *</label>
                <select
                  required
                  className="mt-1 block w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) as 1 | 2 | 3 | 4 | 5 })}
                >
                  <option value="1">1 - Meget lav</option>
                  <option value="2">2 - Lav</option>
                  <option value="3">3 - Normal</option>
                  <option value="4">4 - Høj</option>
                  <option value="5">5 - Meget høj</option>
                </select>
              </div>
            </div>

            {/* Date and Time Window */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-gray-700">Dato *</label>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="hasTimeWindow"
                    checked={formData.hasTimeWindow}
                    onChange={(e) => setFormData({ ...formData, hasTimeWindow: e.target.checked })}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="hasTimeWindow" className="ml-2 block text-sm text-gray-700">
                    Specifikt tidsvindue
                  </label>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <input
                    type="date"
                    required
                    className="mt-1 block w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  />
                </div>
                
                {formData.hasTimeWindow && (
                  <>
                    <div>
                      <input
                        type="time"
                        required={formData.hasTimeWindow}
                        className="mt-1 block w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        value={formData.startTime}
                        onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                      />
                    </div>
                    
                    <div>
                      <input
                        type="time"
                        required={formData.hasTimeWindow}
                        className="mt-1 block w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        value={formData.endTime}
                        onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                      />
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Flexibility */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fleksibilitet *</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { value: 'strict', label: 'Fast tid', description: 'Opgaven skal udføres præcis i det angivne tidsrum' },
                  { value: 'flexible', label: 'Fleksibel', description: 'Opgaven kan udføres +/- 2 timer fra angivet tid' },
                  { value: 'very_flexible', label: 'Meget fleksibel', description: 'Opgaven kan udføres når som helst på dagen' }
                ].map(flex => (
                  <label
                    key={flex.value}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      formData.flexibility === flex.value
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <input
                      type="radio"
                      name="flexibility"
                      value={flex.value}
                      checked={formData.flexibility === flex.value}
                      onChange={() => setFormData({ ...formData, flexibility: flex.value as any })}
                      className="sr-only"
                    />
                    <div className="font-medium text-sm mb-1">{flex.label}</div>
                    <div className="text-xs text-gray-500">{flex.description}</div>
                  </label>
                ))}
              </div>
            </div>

            {/* Skills */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Krævede færdigheder *</label>
              <div className="grid grid-cols-2 gap-2">
                {availableSkills.map(skill => (
                  <div key={skill.id} className="flex items-center">
                    <input
                      type="checkbox"
                      id={`skill-${skill.id}`}
                      checked={formData.skills.includes(skill.id)}
                      onChange={() => handleSkillToggle(skill.id)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor={`skill-${skill.id}`} className="ml-2 block text-sm text-gray-900">
                      {skill.icon} {skill.name}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Beskrivelse</label>
              <textarea
                rows={3}
                className="mt-1 block w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Detaljeret beskrivelse af opgaven..."
              />
            </div>

            {/* Submit */}
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
              >
                Annuller
              </button>
              <button
                type="submit"
                className="px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors"
              >
                Opret opgave
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

// Employee Route Map Modal
function EmployeeRouteMapModal({ 
  employee, 
  tasks, 
  onClose 
}: {
  employee: Employee;
  tasks: Task[];
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose}></div>

        <div className="relative bg-white rounded-xl shadow-xl w-full max-w-4xl h-[80vh] overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">
              {employee.name}s rute
            </h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X className="h-6 w-6" />
            </button>
          </div>

          <div className="h-full">
            <RouteMap
              tasks={tasks.map(task => ({
                id: task.id,
                title: task.title,
                customer: task.customer,
                address: task.customerAddress,
                coordinates: task.coordinates,
                status: task.status,
                routeOrder: task.routeOrder || 1,
                estimatedTime: task.estimatedTime
              }))}
              employeeName={employee.name}
              showRoute={true}
              onTaskClick={(taskId) => console.log('Task clicked:', taskId)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// Full Route Map Modal
function FullRouteMapModal({ 
  employees, 
  tasks, 
  onClose 
}: {
  employees: Employee[];
  tasks: Task[];
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose}></div>

        <div className="relative bg-white rounded-xl shadow-xl w-full max-w-6xl h-[90vh] overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">
              Alle ruter - {new Date().toLocaleDateString('da-DK')}
            </h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X className="h-6 w-6" />
            </button>
          </div>

          <div className="flex h-full">
            {/* Sidebar med medarbejdere */}
            <div className="w-64 border-r border-gray-200 p-4 overflow-y-auto">
              <h4 className="font-medium text-gray-900 mb-3">Medarbejdere</h4>
              {employees.map(employee => {
                const employeeTasks = tasks.filter(t => t.assignedEmployees.includes(employee.id));
                return (
                  <div key={employee.id} className="mb-3 p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center mb-2">
                      <div 
                        className="w-3 h-3 rounded-full mr-2"
                        style={{ backgroundColor: employee.color }}
                      ></div>
                      <span className="font-medium text-sm">{employee.name}</span>
                    </div>
                    <div className="text-xs text-gray-600">
                      {employeeTasks.length} opgaver
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Kort */}
            <div className="flex-1">
              <RouteMap
                tasks={tasks.map(task => ({
                  id: task.id,
                  title: task.title,
                  customer: task.customer,
                  address: task.customerAddress,
                  coordinates: task.coordinates,
                  status: task.status,
                  routeOrder: task.routeOrder || 1,
                  estimatedTime: task.estimatedTime
                }))}
                showRoute={true}
                onTaskClick={(taskId) => console.log('Task clicked:', taskId)}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}