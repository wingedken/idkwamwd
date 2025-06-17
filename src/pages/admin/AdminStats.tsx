import React from 'react';
import { Users, Building2, TrendingUp, Activity } from 'lucide-react';

const stats = [
  {
    name: 'Samlede virksomheder',
    value: '24',
    change: '+12%',
    changeType: 'increase',
    icon: Building2,
  },
  {
    name: 'Aktive medarbejdere',
    value: '156',
    change: '+8%',
    changeType: 'increase',
    icon: Users,
  },
  {
    name: 'Månedlig vækst',
    value: '18%',
    change: '+3%',
    changeType: 'increase',
    icon: TrendingUp,
  },
  {
    name: 'System oppetid',
    value: '99.9%',
    change: '0%',
    changeType: 'neutral',
    icon: Activity,
  },
];

export default function AdminStats() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Systemstatistik</h1>
        <p className="mt-1 text-sm text-gray-600">Overblik over systemets performance og brug</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.name} className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <stat.icon className="h-6 w-6 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      {stat.name}
                    </dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">
                        {stat.value}
                      </div>
                      <div className={`ml-2 flex items-baseline text-sm font-semibold ${
                        stat.changeType === 'increase' 
                          ? 'text-green-600' 
                          : stat.changeType === 'decrease'
                          ? 'text-red-600'
                          : 'text-gray-500'
                      }`}>
                        {stat.change}
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Seneste aktivitet</h3>
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-2 h-2 mt-2 bg-green-400 rounded-full"></div>
              <div className="min-w-0 flex-1">
                <p className="text-sm text-gray-900">
                  Ny virksomhed registreret: <span className="font-medium">Rengøring Plus</span>
                </p>
                <p className="text-xs text-gray-500">2 timer siden</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-2 h-2 mt-2 bg-blue-400 rounded-full"></div>
              <div className="min-w-0 flex-1">
                <p className="text-sm text-gray-900">
                  12 nye medarbejdere oprettet i dag
                </p>
                <p className="text-xs text-gray-500">4 timer siden</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-2 h-2 mt-2 bg-yellow-400 rounded-full"></div>
              <div className="min-w-0 flex-1">
                <p className="text-sm text-gray-900">
                  System backup gennemført succesfuldt
                </p>
                <p className="text-xs text-gray-500">6 timer siden</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}