import React, { useState, useRef, useEffect } from 'react';
import { Clock, User, MapPin, AlertTriangle, CheckCircle, Navigation, Phone, Mail, Zap } from 'lucide-react';

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
  const [hoveredSlot, setHoveredSlot] = useState<{ employeeId: string; time: Date } | null>(null);
  const calendarRef = useRef<HTMLDivElement>(null);

  // Generer tidsintervaller (8:00 - 18:00, hvert 15. minut for præcision som beskrevet)
  const timeSlots = [];
  for (let hour = 8; hour <= 18; hour++) {
    for (let minute = 0; minute < 60; minute += 15) {
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
      const slotEnd = new Date(timeSlot.getTime() + 15 * 60000);
      
      return (taskStart < slotEnd && taskEnd > timeSlot);
    });
  };

  // Tjek for konflikter (overlap) som beskrevet
  const hasConflict = (employeeId: string, timeSlot: Date) => {
    const tasksAtTime = getTasksForEmployeeAndTime(employeeId, timeSlot);
    return tasksAtTime.length > 1;
  };

  // Beregn overbelastning for medarbejder som beskrevet
  const getWorkloadForEmployee = (employeeId: string) => {
    const employeeTasks = dayTasks.filter(task => task.assignedEmployees.includes(employeeId));
    const totalMinutes = employeeTasks.reduce((sum, task) => sum + task.estimatedDuration, 0);
    const workingHours = 8; // 8 timers arbejdsdag
    const workingMinutes = workingHours * 60;
    
    return {
      totalMinutes,
      percentage: (totalMinutes / workingMinutes) * 100,
      isOverloaded: totalMinutes > workingMinutes,
      efficiency: Math.min((totalMinutes / workingMinutes) * 100, 100)
    };
  };

  // Tjek om medarbejder er nær opgave (baseret på live lokation)
  const isEmployeeNearTask = (employeeId: string, task: Task) => {
    const employee = employees.find(emp => emp.id === employeeId);
    if (!employee?.currentLocation) return false;
    
    // Beregn afstand (simpel implementering)
    const distance = Math.sqrt(
      Math.pow(employee.currentLocation.lat - task.coordinates.lat, 2) +
      Math.pow(employee.currentLocation.lng - task.coordinates.lng, 2)
    ) * 111000; // Konverter til meter (approx)
    
    return distance < 100; // Inden for 100 meter
  };

  // Drag and drop funktionalitet som beskrevet
  const handleDragStart = (e: React.DragEvent, taskId: string, employeeId: string, startTime: Date) => {
    setDraggedTask(taskId);
    setDraggedFromEmployee(employeeId);
    setDraggedFromTime(startTime);
    e.dataTransfer.effectAllowed = 'move';
    
    // Tilføj visual feedback
    e.dataTransfer.setData('text/plain', taskId);
  };

  const handleDragOver = (e: React.DragEvent, employeeId: string, timeSlot: Date) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setHoveredSlot({ employeeId, time: timeSlot });
  };

  const handleDragLeave = () => {
    setHoveredSlot(null);
  };

  const handleDrop = (e: React.DragEvent, employeeId: string, timeSlot: Date) => {
    e.preventDefault();
    setHoveredSlot(null);
    
    if (draggedTask && draggedFromEmployee && draggedFromTime) {
      const employee = employees.find(emp => emp.id === employeeId);
      const task = tasks.find(t => t.id === draggedTask);
      
      if (employee && task) {
        // Tjek færdigheder som beskrevet
        const hasRequiredSkills = task.requiredSkills.every(skill => 
          employee.skills.includes(skill)
        );
        
        if (!hasRequiredSkills) {
          alert(`${employee.name} har ikke de nødvendige færdigheder for denne opgave:\n${task.requiredSkills.join(', ')}`);
          return;
        }
        
        // Tjek for konflikter og advar blødt som beskrevet
        const wouldHaveConflict = getTasksForEmployeeAndTime(employeeId, timeSlot).length > 0;
        if (wouldHaveConflict && employeeId !== draggedFromEmployee) {
          const confirmed = window.confirm(
            `⚠️ Dette vil skabe en tidskonflikt for ${employee.name}.\n\nVil du fortsætte alligevel? Du kan optimere ruten bagefter.`
          );
          if (!confirmed) return;
        }
        
        // Tjek overbelastning som beskrevet
        const workload = getWorkloadForEmployee(employeeId);
        if (workload.isOverloaded) {
          const confirmed = window.confirm(
            `⚠️ ${employee.name} vil være overbelastet (${Math.round(workload.percentage)}% af arbejdstid).\n\nVil du fortsætte alligevel?`
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
    const durationInSlots = Math.ceil(task.estimatedDuration / 15);
    return Math.max(durationInSlots * 40, 40); // 40px per 15-min slot, minimum 40px
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
      {/* Medarbejder headers med live status som beskrevet */}
      <div className="flex border-b border-gray-200 bg-gray-50 sticky top-0 z-10">
        <div className="w-20 flex-shrink-0 p-4 border-r border-gray-200">
          <span className="text-sm font-medium text-gray-500">Tid</span>
        </div>
        
        {/* Hver medarbejder får sin egen kolonne som beskrevet */}
        {employees.filter(emp => emp.isActive).map(employee => {
          const workload = getWorkloadForEmployee(employee.id);
          const employeeTasks = dayTasks.filter(task => task.assignedEmployees.includes(employee.id));
          
          return (
            <div 
              key={employee.id} 
              className={`flex-1 p-4 border-r border-gray-200 cursor-pointer transition-all duration-200 ${
                selectedEmployee === employee.id ? 'bg-blue-50 border-blue-200' : 'hover:bg-gray-100'
              }`}
              onClick={() => onEmployeeSelect(selectedEmployee === employee.id ? null : employee.id)}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center">
                  <div 
                    className="w-4 h-4 rounded-full mr-3 shadow-sm"
                    style={{ backgroundColor: employee.color }}
                  ></div>
                  <div>
                    <span className="font-medium text-gray-900">{employee.name}</span>
                    {/* Live lokation indikator som beskrevet */}
                    {employee.currentLocation && (
                      <div className="flex items-center mt-1">
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse mr-1"></div>
                        <span className="text-xs text-green-600">Live</span>
                      </div>
                    )}
                  </div>
                </div>
                
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowEmployeeDetails(showEmployeeDetails === employee.id ? null : employee.id);
                  }}
                  className="text-gray-400 hover:text-gray-600 p-1 rounded hover:bg-gray-200"
                >
                  <User className="h-4 w-4" />
                </button>
              </div>
              
              {/* Workload indicator med forbedret visualisering som beskrevet */}
              <div className="mb-2">
                <div className="flex justify-between text-xs text-gray-600 mb-1">
                  <span>Belastning</span>
                  <span>{Math.round(workload.percentage)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-300 ${
                      workload.isOverloaded ? 'bg-red-500' : 
                      workload.percentage > 80 ? 'bg-yellow-500' : 'bg-green-500'
                    }`}
                    style={{ width: `${Math.min(workload.percentage, 100)}%` }}
                  ></div>
                </div>
              </div>
              
              <div className="text-xs text-gray-500 flex justify-between">
                <span>{employeeTasks.length} opgaver</span>
                <span>{Math.round(workload.totalMinutes / 60)}t/{Math.round(workload.totalMinutes % 60)}m</span>
              </div>
              
              {/* Overbelastning advarsel som beskrevet */}
              {workload.isOverloaded && (
                <div className="text-xs text-red-600 mt-1 flex items-center">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  Overbelastet
                </div>
              )}
              
              {/* Employee details dropdown */}
              {showEmployeeDetails === employee.id && (
                <div className="absolute z-20 mt-2 w-72 bg-white rounded-lg shadow-lg border border-gray-200 p-4">
                  <div className="space-y-3">
                    <div className="flex items-center text-sm">
                      <Mail className="h-4 w-4 mr-2 text-gray-400" />
                      <span>{employee.email}</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <Phone className="h-4 w-4 mr-2 text-gray-400" />
                      <span>{employee.phone}</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                      <span>{employee.startAddress}</span>
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
                    {employee.currentLocation && (
                      <div className="pt-2 border-t border-gray-200">
                        <span className="text-xs font-medium text-green-600">
                          📍 Live lokation aktiv
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Kalender grid med forbedret drag & drop som beskrevet */}
      <div ref={calendarRef} className="flex-1 overflow-auto">
        <div className="flex">
          {/* Tidskolonne - rækkerne viser tidsintervaller som beskrevet */}
          <div className="w-20 flex-shrink-0 border-r border-gray-200 bg-gray-50">
            {timeSlots.map((timeSlot, index) => (
              <div key={timeSlot.getTime()} className={`h-10 border-b border-gray-100 p-2 text-xs text-gray-500 ${
                index % 4 === 0 ? 'font-medium' : ''
              }`}>
                {index % 4 === 0 ? formatTime(timeSlot) : ''}
              </div>
            ))}
          </div>
          
          {/* Medarbejder kolonner - opgaver vises som blokke som beskrevet */}
          {employees.filter(emp => emp.isActive).map(employee => (
            <div key={employee.id} className="flex-1 border-r border-gray-200 relative">
              {timeSlots.map((timeSlot, slotIndex) => {
                const tasksAtTime = getTasksForEmployeeAndTime(employee.id, timeSlot);
                const hasConflictAtTime = hasConflict(employee.id, timeSlot);
                const isHovered = hoveredSlot?.employeeId === employee.id && 
                                 hoveredSlot?.time.getTime() === timeSlot.getTime();
                
                return (
                  <div
                    key={timeSlot.getTime()}
                    className={`h-10 border-b border-gray-100 relative transition-colors ${
                      hasConflictAtTime ? 'bg-red-50' : 
                      isHovered ? 'bg-blue-50' : ''
                    } ${slotIndex % 4 === 0 ? 'border-b-gray-200' : ''}`}
                    onDragOver={(e) => handleDragOver(e, employee.id, timeSlot)}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, employee.id, timeSlot)}
                  >
                    {/* Opgaver som blokke der kan trækkes rundt som beskrevet */}
                    {tasksAtTime.map(task => {
                      const isFirstSlot = Math.floor((task.startTime.getHours() * 60 + task.startTime.getMinutes() - 8 * 60) / 15) === slotIndex;
                      
                      if (!isFirstSlot) return null;
                      
                      const isNearTask = isEmployeeNearTask(employee.id, task);
                      
                      return (
                        <div
                          key={task.id}
                          draggable
                          onDragStart={(e) => handleDragStart(e, task.id, employee.id, task.startTime)}
                          className={`absolute left-1 right-1 rounded border-l-4 p-2 cursor-move shadow-sm transition-all hover:shadow-md ${getStatusColor(task.status)} ${
                            draggedTask === task.id ? 'opacity-50 scale-95' : ''
                          }`}
                          style={{ 
                            height: `${getTaskHeight(task)}px`,
                            borderLeftColor: employee.color,
                            zIndex: draggedTask === task.id ? 20 : 10
                          }}
                        >
                          <div className="flex items-start justify-between mb-1">
                            <span className="text-xs font-medium truncate flex-1">{task.title}</span>
                            <div className="flex items-center space-x-1 ml-1">
                              {getPriorityIcon(task.priority)}
                              {isNearTask && (
                                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" title="Medarbejder er nær opgaven"></div>
                              )}
                            </div>
                          </div>
                          
                          <div className="text-xs text-gray-600 mb-1 truncate">
                            {task.customerName}
                          </div>
                          
                          <div className="flex items-center text-xs text-gray-500">
                            <Clock className="h-3 w-3 mr-1" />
                            <span>{formatTime(task.startTime)}-{formatTime(task.endTime)}</span>
                          </div>
                          
                          {task.estimatedDuration > 60 && (
                            <div className="flex items-center text-xs text-gray-500 mt-1">
                              <MapPin className="h-3 w-3 mr-1" />
                              <span className="truncate">{task.address}</span>
                            </div>
                          )}
                          
                          {/* Indikatorer */}
                          <div className="absolute top-1 right-1 flex space-x-1">
                            {task.isRecurring && (
                              <div className="w-2 h-2 bg-blue-500 rounded-full" title="Tilbagevendende opgave"></div>
                            )}
                            {task.documentationRequired && (
                              <div className="w-2 h-2 bg-orange-500 rounded-full" title="Dokumentation påkrævet"></div>
                            )}
                          </div>
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

      {/* Valgt medarbejders rute panel som beskrevet */}
      {selectedEmployee && (
        <div className="border-t border-gray-200 bg-gray-50 p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900 flex items-center">
              <Navigation className="h-5 w-5 mr-2 text-blue-600" />
              {employees.find(emp => emp.id === selectedEmployee)?.name}s rute
            </h3>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => {
                  // Trigger ruteoptimering for valgte medarbejder
                  console.log('Optimize route for', selectedEmployee);
                }}
                className="inline-flex items-center px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
              >
                <Zap className="h-4 w-4 mr-1" />
                Optimer
              </button>
              <button
                onClick={() => onEmployeeSelect(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {dayTasks
              .filter(task => task.assignedEmployees.includes(selectedEmployee))
              .sort((a, b) => a.startTime.getTime() - b.startTime.getTime())
              .map((task, index) => (
                <div key={task.id} className="bg-white rounded-lg p-3 border border-gray-200 hover:shadow-sm transition-shadow">
                  <div className="flex items-center mb-2">
                    <span className="w-6 h-6 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center text-xs font-medium mr-2">
                      {index + 1}
                    </span>
                    <span className="font-medium text-gray-900 text-sm truncate">{task.title}</span>
                  </div>
                  
                  <div className="text-sm text-gray-600 mb-1 truncate">{task.customerName}</div>
                  <div className="text-sm text-gray-500 mb-2">{formatTime(task.startTime)} - {formatTime(task.endTime)}</div>
                  
                  <div className="flex items-center justify-between">
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
                      className="text-blue-600 hover:text-blue-700 p-1 rounded hover:bg-blue-50"
                      title="Åbn navigation"
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