import React, { useState, useEffect } from 'react';
import { Calendar, ChevronLeft, ChevronRight, Plus, Filter, Users, MapPin, Clock, AlertTriangle } from 'lucide-react';
import type { Task, Employee } from '../../types';

interface TaskCalendarProps {
  tasks: Task[];
  employees: Employee[];
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  onTaskClick: (task: Task) => void;
  onTaskMove: (taskId: string, newEmployeeId: string, newStartTime: Date) => void;
  onCreateTask: () => void;
}

export default function TaskCalendar({
  tasks,
  employees,
  selectedDate,
  onDateChange,
  onTaskClick,
  onTaskMove,
  onCreateTask
}: TaskCalendarProps) {
  const [viewMode, setViewMode] = useState<'day' | 'week'>('day');
  const [draggedTask, setDraggedTask] = useState<string | null>(null);
  const [draggedFromEmployee, setDraggedFromEmployee] = useState<string | null>(null);
  const [hoveredSlot, setHoveredSlot] = useState<{ employeeId: string; time: Date } | null>(null);

  // Generer tidsintervaller (6:00 - 20:00, hvert 30. minut)
  const timeSlots = [];
  for (let hour = 6; hour <= 20; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      if (hour === 20 && minute > 0) break;
      timeSlots.push(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate(), hour, minute));
    }
  }

  // Filtrer opgaver for valgte dato
  const dayTasks = tasks.filter(task => {
    const taskDate = new Date(task.created_at);
    return taskDate.toDateString() === selectedDate.toDateString();
  });

  // Få opgaver for specifik medarbejder og tid
  const getTasksForEmployeeAndTime = (employeeId: string, timeSlot: Date) => {
    return dayTasks.filter(task => {
      if (!task.assigned_employees.includes(employeeId)) return false;
      
      // Simpel tidscheck - i produktion ville dette være mere sofistikeret
      const taskStart = new Date(task.created_at);
      const taskEnd = new Date(taskStart.getTime() + task.estimated_duration * 60000);
      const slotEnd = new Date(timeSlot.getTime() + 30 * 60000);
      
      return (taskStart < slotEnd && taskEnd > timeSlot);
    });
  };

  // Tjek for konflikter
  const hasConflict = (employeeId: string, timeSlot: Date) => {
    const tasksAtTime = getTasksForEmployeeAndTime(employeeId, timeSlot);
    return tasksAtTime.length > 1;
  };

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, taskId: string, employeeId: string) => {
    setDraggedTask(taskId);
    setDraggedFromEmployee(employeeId);
    e.dataTransfer.effectAllowed = 'move';
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
    
    if (draggedTask && draggedFromEmployee) {
      const employee = employees.find(emp => emp.id === employeeId);
      const task = tasks.find(t => t.id === draggedTask);
      
      if (employee && task) {
        // Tjek færdigheder
        const hasRequiredSkills = task.required_skills.every(skill => 
          employee.skills.includes(skill)
        );
        
        if (!hasRequiredSkills && task.required_skills.length > 0) {
          const confirmed = window.confirm(
            `⚠️ ${employee.user_id} har ikke alle nødvendige færdigheder for denne opgave.\n\nVil du fortsætte alligevel?`
          );
          if (!confirmed) return;
        }
        
        // Tjek for konflikter
        const wouldHaveConflict = getTasksForEmployeeAndTime(employeeId, timeSlot).length > 0;
        if (wouldHaveConflict && employeeId !== draggedFromEmployee) {
          const confirmed = window.confirm(
            `⚠️ Dette vil skabe en tidskonflikt for ${employee.user_id}.\n\nVil du fortsætte alligevel?`
          );
          if (!confirmed) return;
        }
        
        onTaskMove(draggedTask, employeeId, timeSlot);
      }
    }
    
    setDraggedTask(null);
    setDraggedFromEmployee(null);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('da-DK', { hour: '2-digit', minute: '2-digit' });
  };

  const getTaskHeight = (task: Task) => {
    const durationInSlots = Math.ceil(task.estimated_duration / 30);
    return Math.max(durationInSlots * 60, 60); // 60px per 30-min slot, minimum 60px
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 border-gray-300 text-gray-800';
      case 'scheduled': return 'bg-yellow-100 border-yellow-300 text-yellow-800';
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

  // Navigation
  const navigateDate = (direction: 'prev' | 'next') => {
    const newDate = new Date(selectedDate);
    if (viewMode === 'day') {
      newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1));
    } else {
      newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
    }
    onDateChange(newDate);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h3 className="text-lg font-medium text-gray-900">Opgavekalender</h3>
            
            {/* View mode toggle */}
            <div className="flex space-x-1 bg-gray-200 rounded-lg p-1">
              <button
                onClick={() => setViewMode('day')}
                className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                  viewMode === 'day' 
                    ? 'bg-white text-gray-900 shadow-sm' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Dag
              </button>
              <button
                onClick={() => setViewMode('week')}
                className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                  viewMode === 'week' 
                    ? 'bg-white text-gray-900 shadow-sm' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Uge
              </button>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* Date navigation */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => navigateDate('prev')}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              
              <div className="text-lg font-medium text-gray-900 min-w-[200px] text-center">
                {selectedDate.toLocaleDateString('da-DK', { 
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                })}
              </div>
              
              <button
                onClick={() => navigateDate('next')}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>

            <button
              onClick={onCreateTask}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Ny opgave
            </button>
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="flex">
        {/* Time column */}
        <div className="w-20 flex-shrink-0 border-r border-gray-200 bg-gray-50">
          <div className="h-16 border-b border-gray-200 flex items-center justify-center">
            <Clock className="h-4 w-4 text-gray-400" />
          </div>
          {timeSlots.map((timeSlot, index) => (
            <div 
              key={timeSlot.getTime()} 
              className={`h-15 border-b border-gray-100 p-2 text-xs text-gray-500 ${
                index % 2 === 0 ? 'font-medium border-b-gray-200' : ''
              }`}
            >
              {index % 2 === 0 ? formatTime(timeSlot) : ''}
            </div>
          ))}
        </div>

        {/* Employee columns */}
        <div className="flex-1 overflow-x-auto">
          <div className="flex min-w-full">
            {employees.filter(emp => emp.is_active).map(employee => (
              <div key={employee.id} className="flex-1 min-w-[200px] border-r border-gray-200">
                {/* Employee header */}
                <div className="h-16 border-b border-gray-200 p-4 bg-gray-50">
                  <div className="flex items-center">
                    <div 
                      className="w-3 h-3 rounded-full mr-2"
                      style={{ backgroundColor: employee.color }}
                    ></div>
                    <div>
                      <div className="font-medium text-gray-900 text-sm">{employee.user_id}</div>
                      <div className="text-xs text-gray-500">
                        {dayTasks.filter(task => task.assigned_employees.includes(employee.id)).length} opgaver
                      </div>
                    </div>
                  </div>
                </div>

                {/* Time slots */}
                <div className="relative">
                  {timeSlots.map((timeSlot, slotIndex) => {
                    const tasksAtTime = getTasksForEmployeeAndTime(employee.id, timeSlot);
                    const hasConflictAtTime = hasConflict(employee.id, timeSlot);
                    const isHovered = hoveredSlot?.employeeId === employee.id && 
                                     hoveredSlot?.time.getTime() === timeSlot.getTime();
                    
                    return (
                      <div
                        key={timeSlot.getTime()}
                        className={`h-15 border-b border-gray-100 relative transition-colors ${
                          hasConflictAtTime ? 'bg-red-50' : 
                          isHovered ? 'bg-blue-50' : ''
                        } ${slotIndex % 2 === 0 ? 'border-b-gray-200' : ''}`}
                        onDragOver={(e) => handleDragOver(e, employee.id, timeSlot)}
                        onDragLeave={handleDragLeave}
                        onDrop={(e) => handleDrop(e, employee.id, timeSlot)}
                      >
                        {/* Tasks */}
                        {tasksAtTime.map(task => {
                          const isFirstSlot = true; // Simplified for demo
                          
                          if (!isFirstSlot) return null;
                          
                          return (
                            <div
                              key={task.id}
                              draggable
                              onDragStart={(e) => handleDragStart(e, task.id, employee.id)}
                              onClick={() => onTaskClick(task)}
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
                                </div>
                              </div>
                              
                              <div className="text-xs text-gray-600 mb-1 truncate">
                                {/* Customer name would be here */}
                                Kunde
                              </div>
                              
                              <div className="flex items-center text-xs text-gray-500">
                                <Clock className="h-3 w-3 mr-1" />
                                <span>{task.estimated_duration} min</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* No employees message */}
      {employees.filter(emp => emp.is_active).length === 0 && (
        <div className="p-12 text-center">
          <Users className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Ingen aktive medarbejdere</h3>
          <p className="mt-1 text-sm text-gray-500">
            Opret medarbejdere for at kunne tildele opgaver
          </p>
        </div>
      )}
    </div>
  );
}