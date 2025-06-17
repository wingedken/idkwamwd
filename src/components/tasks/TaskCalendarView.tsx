import React, { useState, useRef, useEffect } from 'react';
import { Clock, User, MapPin, AlertTriangle, CheckCircle, Navigation, Phone, Mail } from 'lucide-react';

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

interface TaskCalendarViewProps {
  employees: Employee[];
  tasks: Task[];
  selectedDate: Date;
  onTaskMove: (taskId: string, newEmployeeId: string, newStartTime: Date) => void;
  onTaskUpdate: (taskId: string, updates: Partial<Task>) => void;
  onEmployeeSelect: (employeeId: string | null) => void;
  selectedEmployee: string | null;
}

export default function TaskCalendarView({
  employees,
  tasks,
  selectedDate,
  onTaskMove,
  onTaskUpdate,
  onEmployeeSelect,
  selectedEmployee
}: TaskCalendarViewProps) {
  const [draggedTask, setDraggedTask] = useState<string | null>(null);
  const [draggedFromEmployee, setDraggedFromEmployee] = useState<string | null>(null);
  const [draggedFromTime, setDraggedFromTime] = useState<Date | null>(null);
  const [showEmployeeDetails, setShowEmployeeDetails] = useState<string | null>(null);
  const calendarRef = useRef<HTMLDivElement>(null);

  // Generer tidsintervaller (8:00 - 18:00, hvert 30. minut)
  const timeSlots = [];
  for (let hour = 8; hour <= 18; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      if (hour === 18 && minute > 0) break;
      timeSlots.push(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate(), hour, minute));
    }
  }

  // Filtrer opgaver for valgte dato
  const dayTasks = tasks.filter(task => 
    task.startTime.toDateString() === selectedDate.toDateString()
  );

  // Få opgaver for specifik medarbejder og tid
  const getTasksForEmployeeAndTime = (employeeId: string, timeSlot: Date) => {
    return dayTasks.filter(task => {
      if (!task.assignedEmployees.includes(employeeId)) return false;
      
      const taskStart = task.startTime;
      const taskEnd = task.endTime;
      const slotEnd = new Date(timeSlot.getTime() + 30 * 60000);
      
      return (taskStart < slotEnd && taskEnd > timeSlot);
    });
  };

  // Tjek for konflikter
  const hasConflict = (employeeId: string, timeSlot: Date) => {
    const tasksAtTime = getTasksForEmployeeAndTime(employeeId, timeSlot);
    return tasksAtTime.length > 1;
  };

  // Beregn overbelastning
  const getWorkloadForEmployee = (employeeId: string) => {
    const employeeTasks = dayTasks.filter(task => task.assignedEmployees.includes(employeeId));
    const totalMinutes = employeeTasks.reduce((sum, task) => sum + task.estimatedDuration, 0);
    const workingHours = 8; // 8 timers arbejdsdag
    const workingMinutes = workingHours * 60;
    
    return {
      totalMinutes,
      percentage: (totalMinutes / workingMinutes) * 100,
      isOverloaded: totalMinutes > workingMinutes
    };
  };

  const handleDragStart = (e: React.DragEvent, taskId: string, employeeId: string, startTime: Date) => {
    setDraggedTask(taskId);
    setDraggedFromEmployee(employeeId);
    setDraggedFromTime(startTime);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, employeeId: string, timeSlot: Date) => {
    e.preventDefault();
    
    if (draggedTask && draggedFromEmployee && draggedFromTime) {
      // Tjek om det er en gyldig flytning
      const employee = employees.find(emp => emp.id === employeeId);
      const task = tasks.find(t => t.id === draggedTask);
      
      if (employee && task) {
        // Tjek færdigheder
        const hasRequiredSkills = task.requiredSkills.every(skill => 
          employee.skills.includes(skill)
        );
        
        if (!hasRequiredSkills) {
          alert(`${employee.name} har ikke de nødvendige færdigheder for denne opgave.`);
          return;
        }
        
        // Tjek for konflikter
        const wouldHaveConflict = getTasksForEmployeeAndTime(employeeId, timeSlot).length > 0;
        if (wouldHaveConflict && employeeId !== draggedFromEmployee) {
          const confirmed = window.confirm(
            `Dette vil skabe en tidskonflikt for ${employee.name}. Vil du fortsætte alligevel?`
          );
          if (!confirmed) return;
        }
        
        onTaskMove(draggedTask, employeeId, timeSlot);
      }
    }
    
    setDraggedTask(null);
    setDraggedFromEmployee(null);
    setDraggedFromTime(null);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('da-DK', { hour: '2-digit', minute: '2-digit' });
  };

  const getTaskHeight = (task: Task) => {
    const durationInSlots = Math.ceil(task.estimatedDuration / 30);
    return Math.max(durationInSlots * 60, 60); // Minimum 60px højde
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 border-yellow-300 text-yellow-800';
      case 'in_progress': return 'bg-blue-100 border-blue-300 text-blue-800';
      case 'completed': return 'bg-green-100 border-green-300 text-green-800';
      case 'cancelled': return 'bg-red-100 border-red-300 text-red-800';
      default: return 'bg-gray-100 border-gray-300 text-gray-800';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'urgent': return <AlertTriangle className="h-3 w-3 text-red-500" />;
      case 'high': return <AlertTriangle className="h-3 w-3 text-orange-500" />;
      default: return null;
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Employee Headers */}
      <div className="flex border-b border-gray-200 bg-gray-50">
        <div className="w-20 flex-shrink-0 p-4 border-r border-gray-200">
          <span className="text-sm font-medium text-gray-500">Tid</span>
        </div>
        
        {employees.filter(emp => emp.isActive).map(employee => {
          const workload = getWorkloadForEmployee(employee.id);
          
          return (
            <div 
              key={employee.id} 
              className={`flex-1 p-4 border-r border-gray-200 cursor-pointer transition-colors ${
                selectedEmployee === employee.id ? 'bg-blue-50' : 'hover:bg-gray-100'
              }`}
              onClick={() => onEmployeeSelect(selectedEmployee === employee.id ? null : employee.id)}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  <div 
                    className="w-3 h-3 rounded-full mr-2"
                    style={{ backgroundColor: employee.color }}
                  ></div>
                  <span className="font-medium text-gray-900">{employee.name}</span>
                  {employee.currentLocation && (
                    <div className="ml-2 w-2 h-2 bg-green-400 rounded-full animate-pulse" title="Live lokation"></div>
                  )}
                </div>
                
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowEmployeeDetails(showEmployeeDetails === employee.id ? null : employee.id);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <User className="h-4 w-4" />
                </button>
              </div>
              
              {/* Workload indicator */}
              <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                <div 
                  className={`h-2 rounded-full transition-all ${
                    workload.isOverloaded ? 'bg-red-500' : 
                    workload.percentage > 80 ? 'bg-yellow-500' : 'bg-green-500'
                  }`}
                  style={{ width: `${Math.min(workload.percentage, 100)}%` }}
                ></div>
              </div>
              
              <div className="text-xs text-gray-500">
                {Math.round(workload.totalMinutes / 60)}t / 8t
                {workload.isOverloaded && (
                  <span className="text-red-500 ml-1">⚠️ Overbelastet</span>
                )}
              </div>
              
              {/* Employee details dropdown */}
              {showEmployeeDetails === employee.id && (
                <div className="absolute z-10 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 p-4">
                  <div className="space-y-2">
                    <div className="flex items-center text-sm">
                      <Mail className="h-4 w-4 mr-2 text-gray-400" />
                      <span>{employee.email}</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <Phone className="h-4 w-4 mr-2 text-gray-400" />
                      <span>{employee.phone}</span>
                    </div>
                    <div className="pt-2 border-t border-gray-200">
                      <span className="text-xs font-medium text-gray-500">Færdigheder:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {employee.skills.map(skill => (
                          <span key={skill} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Calendar Grid */}
      <div ref={calendarRef} className="flex-1 overflow-auto">
        <div className="flex">
          {/* Time Column */}
          <div className="w-20 flex-shrink-0 border-r border-gray-200">
            {timeSlots.map(timeSlot => (
              <div key={timeSlot.getTime()} className="h-16 border-b border-gray-100 p-2 text-xs text-gray-500">
                {formatTime(timeSlot)}
              </div>
            ))}
          </div>
          
          {/* Employee Columns */}
          {employees.filter(emp => emp.isActive).map(employee => (
            <div key={employee.id} className="flex-1 border-r border-gray-200 relative">
              {timeSlots.map(timeSlot => {
                const tasksAtTime = getTasksForEmployeeAndTime(employee.id, timeSlot);
                const hasConflictAtTime = hasConflict(employee.id, timeSlot);
                
                return (
                  <div
                    key={timeSlot.getTime()}
                    className={`h-16 border-b border-gray-100 relative ${
                      hasConflictAtTime ? 'bg-red-50' : ''
                    }`}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, employee.id, timeSlot)}
                  >
                    {tasksAtTime.map(task => {
                      const isFirstSlot = task.startTime.getHours() === timeSlot.getHours() && 
                                         task.startTime.getMinutes() === timeSlot.getMinutes();
                      
                      if (!isFirstSlot) return null;
                      
                      return (
                        <div
                          key={task.id}
                          draggable
                          onDragStart={(e) => handleDragStart(e, task.id, employee.id, task.startTime)}
                          className={`absolute left-1 right-1 rounded border-l-4 p-2 cursor-move shadow-sm ${getStatusColor(task.status)}`}
                          style={{ 
                            height: `${getTaskHeight(task)}px`,
                            borderLeftColor: employee.color,
                            zIndex: 10
                          }}
                        >
                          <div className="flex items-start justify-between mb-1">
                            <span className="text-xs font-medium truncate">{task.title}</span>
                            {getPriorityIcon(task.priority)}
                          </div>
                          
                          <div className="text-xs text-gray-600 mb-1 truncate">
                            {task.customerName}
                          </div>
                          
                          <div className="flex items-center text-xs text-gray-500">
                            <Clock className="h-3 w-3 mr-1" />
                            <span>{formatTime(task.startTime)} - {formatTime(task.endTime)}</span>
                          </div>
                          
                          <div className="flex items-center text-xs text-gray-500 mt-1">
                            <MapPin className="h-3 w-3 mr-1" />
                            <span className="truncate">{task.address}</span>
                          </div>
                          
                          {task.isRecurring && (
                            <div className="absolute top-1 right-1">
                              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            </div>
                          )}
                          
                          {task.documentationRequired && (
                            <div className="absolute top-1 right-3">
                              <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Selected Employee Route Panel */}
      {selectedEmployee && (
        <div className="border-t border-gray-200 bg-gray-50 p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-medium text-gray-900">
              {employees.find(emp => emp.id === selectedEmployee)?.name}s rute
            </h3>
            <button
              onClick={() => onEmployeeSelect(null)}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {dayTasks
              .filter(task => task.assignedEmployees.includes(selectedEmployee))
              .sort((a, b) => a.startTime.getTime() - b.startTime.getTime())
              .map((task, index) => (
                <div key={task.id} className="bg-white rounded-lg p-3 border border-gray-200">
                  <div className="flex items-center mb-2">
                    <span className="w-6 h-6 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center text-xs font-medium mr-2">
                      {index + 1}
                    </span>
                    <span className="font-medium text-gray-900">{task.title}</span>
                  </div>
                  
                  <div className="text-sm text-gray-600 mb-1">{task.customerName}</div>
                  <div className="text-sm text-gray-500">{formatTime(task.startTime)} - {formatTime(task.endTime)}</div>
                  
                  <div className="flex items-center justify-between mt-2">
                    <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(task.status)}`}>
                      {task.status === 'pending' ? 'Afventer' :
                       task.status === 'in_progress' ? 'I gang' :
                       task.status === 'completed' ? 'Afsluttet' : 'Annulleret'}
                    </span>
                    
                    <button
                      onClick={() => {
                        // Åbn navigation til opgave
                        const url = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(task.address)}`;
                        window.open(url, '_blank');
                      }}
                      className="text-blue-600 hover:text-blue-700"
                    >
                      <Navigation className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}