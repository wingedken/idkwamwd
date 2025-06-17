import React from 'react';
import { Users, Building, CheckSquare, DollarSign, Clock, TrendingUp, Plus, ArrowRight, Calendar } from 'lucide-react';

const stats = [
  {
    name: 'Medarbejdere',
    value: '12',
    change: '+2',
    changeType: 'increase',
    icon: Users,
    color: 'blue'
  },
  {
    name: 'Kunder',
    value: '48',
    change: '+5',
    changeType: 'increase',
    icon: Building,
    color: 'green'
  },
  {
    name: 'Opgaver',
    value: '24',
    change: '-3',
    changeType: 'decrease',
    icon: CheckSquare,
    color: 'orange'
  },
  {
    name: 'Omsætning',
    value: '184.500 kr',
    change: '+12%',
    changeType: 'increase',
    icon: DollarSign,
    color: 'purple'
  },
];

const recentTasks = [
  {
    id: 1,
    title: 'Rengøring - Netto Supermarked',
    employee: 'Maria Hansen',
    status: 'Pågår',
    time: '2t tilbage'
  },
  {
    id: 2,
    title: 'Vinduespolering - Kontorbygning',
    employee: 'Lars Nielsen',
    status: 'Afsluttet',
    time: '14:30'
  },
  {
    id: 3,
    title: 'Gulvbehandling - Restaurant',
    employee: 'Peter Andersen',
    status: 'Planlagt',
    time: '16:00'
  },
];

const quickActions = [
  {
    title: 'Opret medarbejder',
    description: 'Tilføj ny medarbejder',
    href: '/virksomhedsejer/employees',
    icon: Users,
    color: 'blue'
  },
  {
    title: 'Tilføj kunde',
    description: 'Registrer ny kunde',
    href: '/virksomhedsejer/customers',
    icon: Building,
    color: 'green'
  },
  {
    title: 'Planlæg opgave',
    description: 'Opret ny opgave',
    href: '/virksomhedsejer/tasks',
    icon: CheckSquare,
    color: 'orange'
  },
];

export default function CompanyOverview() {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pågår': return 'bg-blue-100 text-blue-800';
      case 'Afsluttet': return 'bg-green-100 text-green-800';
      case 'Planlagt': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatColor = (color: string) => {
    const colors = {
      blue: 'from-blue-500 to-blue-600',
      green: 'from-green-500 to-green-600',
      orange: 'from-orange-500 to-orange-600',
      purple: 'from-purple-500 to-purple-600'
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl shadow-lg text-white p-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Velkommen tilbage! 👋</h1>
            <p className="text-blue-100 text-lg">
              {new Date().toLocaleDateString('da-DK', { 
                weekday: 'long', 
                day: 'numeric',
                month: 'long'
              })}
            </p>
          </div>
          <div className="flex items-center space-x-2 bg-white bg-opacity-20 rounded-lg px-4 py-2">
            <Calendar className="h-5 w-5" />
            <span className="font-medium">I dag</span>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.name} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <div className={`p-3 rounded-lg bg-gradient-to-r ${getStatColor(stat.color)}`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4 flex-1">
                <div className="flex items-baseline">
                  <div className="text-2xl font-bold text-gray-900">
                    {stat.value}
                  </div>
                  <div className={`ml-2 text-sm font-medium ${
                    stat.changeType === 'increase' 
                      ? 'text-green-600' 
                      : stat.changeType === 'decrease'
                      ? 'text-red-600'
                      : 'text-gray-500'
                  }`}>
                    {stat.change}
                  </div>
                </div>
                <div className="text-sm text-gray-600">
                  {stat.name}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Recent Tasks */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">
                Seneste opgaver
              </h3>
              <a href="/virksomhedsejer/tasks" className="text-sm text-blue-600 hover:text-blue-700 flex items-center font-medium">
                Se alle <ArrowRight className="inline h-4 w-4 ml-1" />
              </a>
            </div>
          </div>
          <div className="p-6 space-y-4">
            {recentTasks.map((task) => (
              <div key={task.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{task.title}</p>
                  <p className="text-sm text-gray-600">{task.employee}</p>
                </div>
                <div className="ml-4 flex items-center space-x-3">
                  <span className={`inline-flex px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(task.status)}`}>
                    {task.status}
                  </span>
                  <span className="text-sm text-gray-500">{task.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">
              Hurtige handlinger
            </h3>
          </div>
          <div className="p-6 space-y-4">
            {quickActions.map((action, index) => (
              <a
                key={index}
                href={action.href}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors group"
              >
                <div className="flex items-center">
                  <div className={`p-3 rounded-lg bg-gradient-to-r ${getStatColor(action.color)} group-hover:scale-105 transition-transform`}>
                    <action.icon className="h-5 w-5 text-white" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-900">{action.title}</p>
                    <p className="text-sm text-gray-600">{action.description}</p>
                  </div>
                </div>
                <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-gray-600" />
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Today's Summary */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            Dagens overblik
          </h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            <div className="text-center p-6 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg">
              <div className="text-3xl font-bold text-blue-700">8</div>
              <div className="text-sm text-blue-600 mt-1">Opgaver</div>
            </div>
            <div className="text-center p-6 bg-gradient-to-r from-green-50 to-green-100 rounded-lg">
              <div className="text-3xl font-bold text-green-700">5</div>
              <div className="text-sm text-green-600 mt-1">Medarbejdere</div>
            </div>
            <div className="text-center p-6 bg-gradient-to-r from-orange-50 to-orange-100 rounded-lg">
              <div className="text-3xl font-bold text-orange-700">32t</div>
              <div className="text-sm text-orange-600 mt-1">Arbejdstid</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}