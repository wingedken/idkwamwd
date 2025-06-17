import React, { useState } from 'react';
import { CheckSquare, Clock, MapPin, Calendar, Filter } from 'lucide-react';

interface EmployeeTask {
  id: string;
  title: string;
  customer: string;
  address: string;
  date: string;
  estimatedTime: number;
  status: 'upcoming' | 'today' | 'completed' | 'overdue';
  description: string;
}

const mockTasks: EmployeeTask[] = [
  {
    id: '1',
    title: 'Ugentlig rengøring',
    customer: 'Netto Supermarked',
    address: 'Hovedgade 123, 2000 Frederiksberg',
    date: '2024-01-22',
    estimatedTime: 4,
    status: 'today',
    description: 'Fuldstændig rengøring af butikslokaler, toiletter og kunderum'
  },
  {
    id: '2',
    title: 'Vinduespolering',
    customer: 'Kontorbygning A/S',
    address: 'Erhvervsvej 45, 2100 København Ø',
    date: '2024-01-22',
    estimatedTime: 3,
    status: 'today',
    description: 'Polering af alle vinduer indvendigt og udvendigt'
  },
  {
    id: '3',
    title: 'Dybderengøring',
    customer: 'Restaurant Bella',
    address: 'Cafégade 78, 2200 København N',
    date: '2024-01-21',
    estimatedTime: 8,
    status: 'completed',
    description: 'Komplet rengøring af køkken og spiseareal'
  },
  {
    id: '4',
    title: 'Gulvbehandling',
    customer: 'Fitness Center',
    address: 'Sportsvej 12, 2300 København S',
    date: '2024-01-23',
    estimatedTime: 5,
    status: 'upcoming',
    description: 'Specialbehandling af træningslokaler'
  }
];

export default function EmployeeTasks() {
  const [tasks] = useState(mockTasks);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredTasks = tasks.filter(task => 
    statusFilter === 'all' || task.status === statusFilter
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'today': return 'bg-blue-100 text-blue-800';
      case 'upcoming': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'today': return 'I dag';
      case 'upcoming': return 'Kommende';
      case 'completed': return 'Afsluttet';
      case 'overdue': return 'Forsinket';
      default: return status;
    }
  };

  const getStatusCount = (status: string) => {
    return tasks.filter(task => task.status === status).length;
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Mine opgaver</h2>
        <p className="text-gray-600">Overblik over alle dine tildelte opgaver</p>
      </div>

      {/* Task Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{getStatusCount('today')}</div>
            <div className="text-sm text-gray-500">I dag</div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">{getStatusCount('upcoming')}</div>
            <div className="text-sm text-gray-500">Kommende</div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{getStatusCount('completed')}</div>
            <div className="text-sm text-gray-500">Afsluttet</div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">{getStatusCount('overdue')}</div>
            <div className="text-sm text-gray-500">Forsinket</div>
          </div>
        </div>
      </div>

      {/* Filter */}
      <div className="flex items-center space-x-4">
        <Filter className="h-5 w-5 text-gray-400" />
        <select
          className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all">Alle opgaver</option>
          <option value="today">I dag</option>
          <option value="upcoming">Kommende</option>
          <option value="completed">Afsluttet</option>
          <option value="overdue">Forsinket</option>
        </select>
      </div>

      {/* Tasks List */}
      <div className="space-y-4">
        {filteredTasks.map((task) => (
          <div key={task.id} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center mb-2">
                  <h3 className="text-lg font-medium text-gray-900 mr-3">{task.title}</h3>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(task.status)}`}>
                    {getStatusText(task.status)}
                  </span>
                </div>
                
                <p className="text-sm text-gray-600 mb-3">{task.description}</p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                  <div className="flex items-center">
                    <CheckSquare className="h-4 w-4 mr-2 text-gray-400" />
                    <span>{task.customer}</span>
                  </div>
                  
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                    <span>{task.address}</span>
                  </div>
                  
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                    <span>{new Date(task.date).toLocaleDateString('da-DK')}</span>
                  </div>
                </div>
              </div>
              
              <div className="ml-4 text-right">
                <div className="flex items-center text-sm text-gray-500 mb-2">
                  <Clock className="h-4 w-4 mr-1" />
                  {task.estimatedTime} timer
                </div>
                
                {task.status === 'today' && (
                  <button className="px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors">
                    Start opgave
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredTasks.length === 0 && (
        <div className="text-center py-12">
          <CheckSquare className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Ingen opgaver</h3>
          <p className="mt-1 text-sm text-gray-500">
            Der er ingen opgaver der matcher det valgte filter.
          </p>
        </div>
      )}
    </div>
  );
}