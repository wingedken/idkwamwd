import React, { useState, useEffect } from 'react';
import { Calendar, Map, Plus, Search, Filter, Users, Navigation, Zap, Settings, Clock, CheckSquare, AlertTriangle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import TaskCalendar from '../../components/tasks/TaskCalendar';
import TaskCreationWizard from '../../components/tasks/TaskCreationWizard';
import { taskService } from '../../services/taskService';
import { routeService } from '../../services/routeService';
import type { Task, Employee, Customer, TaskTemplate } from '../../types';

// Mock data - i produktion ville dette komme fra API
const mockEmployees: Employee[] = [
  {
    id: '1',
    user_id: 'Lars Nielsen',
    company_id: 'company-1',
    role_id: 'cleaner',
    skills: ['cleaning', 'window_cleaning'],
    start_address: 'Erhvervsvej 123, 2000 Frederiksberg',
    current_location: { lat: 55.6761, lng: 12.5683 },
    is_active: true,
    color: '#3B82F6',
    created_at: '2024-01-01',
    updated_at: '2024-01-01'
  },
  {
    id: '2',
    user_id: 'Maria Hansen',
    company_id: 'company-1',
    role_id: 'cleaner',
    skills: ['cleaning', 'floor_treatment'],
    start_address: 'Erhvervsvej 123, 2000 Frederiksberg',
    current_location: { lat: 55.6861, lng: 12.5783 },
    is_active: true,
    color: '#10B981',
    created_at: '2024-01-01',
    updated_at: '2024-01-01'
  }
];

const mockCustomers: Customer[] = [
  {
    id: '1',
    company_id: 'company-1',
    name: 'Netto Supermarked',
    cvr: '12345678',
    email: 'kontakt@netto.dk',
    phone: '+45 70 12 34 56',
    contact_person: 'Karen Jensen',
    addresses: [
      {
        id: '1',
        customer_id: '1',
        type: 'Hovedadresse',
        street: 'Hovedgade 123',
        postal_code: '2000',
        city: 'Frederiksberg',
        contact_person: 'Karen Jensen',
        phone: '+45 70 12 34 56',
        coordinates: { lat: 55.6761, lng: 12.5683 },
        is_primary: true,
        is_active: true
      }
    ],
    is_active: true,
    created_at: '2024-01-01',
    updated_at: '2024-01-01'
  }
];

const mockTemplates: TaskTemplate[] = [
  {
    id: '1',
    company_id: 'company-1',
    name: 'Standard rengøring',
    task_type: 'cleaning',
    title: 'Ugentlig rengøring',
    description: 'Standard rengøring af faciliteter',
    estimated_duration: 120,
    documentation_requirements: [
      {
        type: 'photo',
        title: 'Billede af udført arbejde',
        required: true
      }
    ],
    required_skills: ['cleaning'],
    priority: 'medium',
    usage_count: 15,
    created_by: 'user-1',
    created_at: '2024-01-01',
    updated_at: '2024-01-01'
  }
];

export default function TaskManagement() {
  const { user } = useAuth();
  
  // State
  const [viewMode, setViewMode] = useState<'calendar' | 'map'>('calendar');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [tasks, setTasks] = useState<Task[]>([]);
  const [employees] = useState<Employee[]>(mockEmployees);
  const [customers] = useState<Customer[]>(mockCustomers);
  const [templates] = useState<TaskTemplate[]>(mockTemplates);
  const [isLoading, setIsLoading] = useState(false);
  const [showCreateWizard, setShowCreateWizard] = useState(false);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterEmployee, setFilterEmployee] = useState<string>('all');

  // Load tasks
  useEffect(() => {
    loadTasks();
  }, [selectedDate, user?.company_id]);

  const loadTasks = async () => {
    if (!user?.company_id) return;
    
    setIsLoading(true);
    try {
      const result = await taskService.getTasksByCompany(user.company_id, {
        date: selectedDate.toISOString().split('T')[0]
      });
      
      if (result.success && result.data) {
        setTasks(result.data);
      }
    } catch (error) {
      console.error('Error loading tasks:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Filter tasks
  const filteredTasks = tasks.filter(task => {
    if (searchTerm && !task.title.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    
    if (filterStatus !== 'all' && task.status !== filterStatus) {
      return false;
    }
    
    if (filterEmployee !== 'all' && !task.assigned_employees.includes(filterEmployee)) {
      return false;
    }
    
    return true;
  });

  // Handlers
  const handleTaskCreated = (task: Task) => {
    setTasks(prev => [...prev, task]);
  };

  const handleTaskClick = (task: Task) => {
    console.log('Task clicked:', task);
    // Åbn task detail modal
  };

  const handleTaskMove = async (taskId: string, newEmployeeId: string, newStartTime: Date) => {
    try {
      const result = await taskService.updateTask(taskId, {
        assigned_employees: [newEmployeeId]
        // I produktion ville vi også opdatere start_time
      });
      
      if (result.success) {
        loadTasks(); // Reload tasks
      }
    } catch (error) {
      console.error('Error moving task:', error);
    }
  };

  const handleOptimizeRoutes = async () => {
    setIsLoading(true);
    try {
      // Optimer ruter for alle medarbejdere
      for (const employee of employees) {
        const employeeTasks = tasks.filter(task => 
          task.assigned_employees.includes(employee.id)
        );
        
        if (employeeTasks.length > 1) {
          await routeService.createOrUpdateRoute({
            employee_id: employee.id,
            date: selectedDate.toISOString().split('T')[0],
            task_ids: employeeTasks.map(t => t.id),
            start_location: { lat: 55.6761, lng: 12.5683 } // Company address
          });
        }
      }
      
      console.log('Routes optimized');
    } catch (error) {
      console.error('Error optimizing routes:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Statistics
  const stats = {
    total: filteredTasks.length,
    scheduled: filteredTasks.filter(t => t.status === 'scheduled').length,
    inProgress: filteredTasks.filter(t => t.status === 'in_progress').length,
    completed: filteredTasks.filter(t => t.status === 'completed').length,
    conflicts: 0 // Would be calculated based on overlapping times
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Opgaver & Ruter</h1>
            <p className="text-gray-600 mt-1">
              Intelligent opgavestyring med automatisk ruteplanlægning
            </p>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={handleOptimizeRoutes}
              disabled={isLoading}
              className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
            >
              <Zap className="h-4 w-4 mr-2" />
              {isLoading ? 'Optimerer...' : 'AI Optimering'}
            </button>
            
            <button
              onClick={() => setShowCreateWizard(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Ny opgave
            </button>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-blue-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-blue-700">{stats.total}</div>
            <div className="text-sm text-blue-600">Total</div>
          </div>
          <div className="bg-yellow-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-yellow-700">{stats.scheduled}</div>
            <div className="text-sm text-yellow-600">Planlagt</div>
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
            <div className="text-2xl font-bold text-red-700">{stats.conflicts}</div>
            <div className="text-sm text-red-600">Konflikter</div>
          </div>
        </div>

        {/* View toggle and filters */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          {/* View mode */}
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
              <option value="draft">Kladde</option>
              <option value="scheduled">Planlagt</option>
              <option value="in_progress">I gang</option>
              <option value="completed">Afsluttet</option>
            </select>

            <select
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
              value={filterEmployee}
              onChange={(e) => setFilterEmployee(e.target.value)}
            >
              <option value="all">Alle medarbejdere</option>
              {employees.filter(emp => emp.is_active).map(employee => (
                <option key={employee.id} value={employee.id}>
                  {employee.user_id}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Main content */}
      {viewMode === 'calendar' ? (
        <TaskCalendar
          tasks={filteredTasks}
          employees={employees}
          selectedDate={selectedDate}
          onDateChange={setSelectedDate}
          onTaskClick={handleTaskClick}
          onTaskMove={handleTaskMove}
          onCreateTask={() => setShowCreateWizard(true)}
        />
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="text-center py-12">
            <Map className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-lg font-medium text-gray-900">Kortvisning</h3>
            <p className="mt-1 text-gray-500">
              Kortvisning med GPS-tracking kommer snart
            </p>
          </div>
        </div>
      )}

      {/* Task Creation Wizard */}
      {showCreateWizard && (
        <TaskCreationWizard
          onClose={() => setShowCreateWizard(false)}
          onTaskCreated={handleTaskCreated}
          customers={customers}
          employees={employees}
          templates={templates}
        />
      )}
    </div>
  );
}