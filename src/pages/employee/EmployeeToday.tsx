import React, { useState } from 'react';
import { Calendar, Clock, MapPin, CheckSquare, Play, Square } from 'lucide-react';

interface TodayTask {
  id: string;
  title: string;
  customer: string;
  address: string;
  estimatedTime: number;
  status: 'pending' | 'in_progress' | 'completed';
  startTime?: string;
  endTime?: string;
}

const mockTodayTasks: TodayTask[] = [
  {
    id: '1',
    title: 'Ugentlig rengøring',
    customer: 'Netto Supermarked',
    address: 'Hovedgade 123, 2000 Frederiksberg',
    estimatedTime: 4,
    status: 'completed',
    startTime: '08:00',
    endTime: '12:15'
  },
  {
    id: '2',
    title: 'Vinduespolering',
    customer: 'Kontorbygning A/S',
    address: 'Erhvervsvej 45, 2100 København Ø',
    estimatedTime: 3,
    status: 'in_progress',
    startTime: '13:30'
  },
  {
    id: '3',
    title: 'Gulvbehandling',
    customer: 'Restaurant Bella',
    address: 'Cafégade 78, 2200 København N',
    estimatedTime: 2,
    status: 'pending'
  }
];

export default function EmployeeToday() {
  const [tasks, setTasks] = useState(mockTodayTasks);

  const startTask = (taskId: string) => {
    setTasks(tasks.map(task => 
      task.id === taskId 
        ? { ...task, status: 'in_progress', startTime: new Date().toLocaleTimeString('da-DK', { hour: '2-digit', minute: '2-digit' }) }
        : task
    ));
  };

  const completeTask = (taskId: string) => {
    setTasks(tasks.map(task => 
      task.id === taskId 
        ? { ...task, status: 'completed', endTime: new Date().toLocaleTimeString('da-DK', { hour: '2-digit', minute: '2-digit' }) }
        : task
    ));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Afventer';
      case 'in_progress': return 'I gang';
      case 'completed': return 'Afsluttet';
      default: return status;
    }
  };

  const completedTasks = tasks.filter(task => task.status === 'completed').length;
  const totalTasks = tasks.length;
  const totalHours = tasks
    .filter(task => task.status === 'completed')
    .reduce((sum, task) => sum + task.estimatedTime, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">I dag</h1>
        <p className="mt-1 text-sm text-gray-600">
          {new Date().toLocaleDateString('da-DK', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </p>
      </div>

      {/* Daily Summary */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CheckSquare className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Opgaver afsluttet
                  </dt>
                  <dd className="text-2xl font-semibold text-gray-900">
                    {completedTasks}/{totalTasks}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Clock className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Timer arbejdet
                  </dt>
                  <dd className="text-2xl font-semibold text-gray-900">
                    {totalHours}t
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <MapPin className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Lokationer besøgt
                  </dt>
                  <dd className="text-2xl font-semibold text-gray-900">
                    {completedTasks}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Today's Tasks */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Dagens opgaver
          </h3>
        </div>
        <ul className="divide-y divide-gray-200">
          {tasks.map((task, index) => (
            <li key={task.id}>
              <div className="px-4 py-4 sm:px-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-blue-600">{index + 1}</span>
                      </div>
                    </div>
                    <div className="ml-4">
                      <div className="flex items-center">
                        <p className="text-sm font-medium text-gray-900">{task.title}</p>
                        <span className={`ml-2 inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${getStatusColor(task.status)}`}>
                          {getStatusText(task.status)}
                        </span>
                      </div>
                      <div className="mt-1">
                        <p className="text-sm text-gray-600">{task.customer}</p>
                        <div className="flex items-center mt-1 text-sm text-gray-500">
                          <MapPin className="flex-shrink-0 mr-1.5 h-4 w-4" />
                          <span>{task.address}</span>
                        </div>
                        <div className="flex items-center mt-1 text-sm text-gray-500">
                          <Clock className="flex-shrink-0 mr-1.5 h-4 w-4" />
                          <span>Estimeret tid: {task.estimatedTime} timer</span>
                          {task.startTime && (
                            <span className="ml-4">
                              Start: {task.startTime}
                              {task.endTime && ` - Slut: ${task.endTime}`}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    {task.status === 'pending' && (
                      <button
                        onClick={() => startTask(task.id)}
                        className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        <Play className="h-4 w-4 mr-1" />
                        Start
                      </button>
                    )}
                    
                    {task.status === 'in_progress' && (
                      <button
                        onClick={() => completeTask(task.id)}
                        className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                      >
                        <Square className="h-4 w-4 mr-1" />
                        Afslut
                      </button>
                    )}
                    
                    {task.status === 'completed' && (
                      <span className="inline-flex items-center px-3 py-2 text-sm leading-4 font-medium text-gray-500">
                        <CheckSquare className="h-4 w-4 mr-1" />
                        Afsluttet
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* End Day */}
      {completedTasks === totalTasks && (
        <div className="rounded-md bg-green-50 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <CheckSquare className="h-5 w-5 text-green-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-green-800">
                Alle opgaver afsluttet!
              </h3>
              <div className="mt-2 text-sm text-green-700">
                <p>Du kan nu afslutte din arbejdsdag.</p>
              </div>
              <div className="mt-4">
                <div className="-mx-2 -my-1.5 flex">
                  <button
                    type="button"
                    className="bg-green-50 px-2 py-1.5 rounded-md text-sm font-medium text-green-800 hover:bg-green-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-green-50 focus:ring-green-600"
                  >
                    Afslut arbejdsdag
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}