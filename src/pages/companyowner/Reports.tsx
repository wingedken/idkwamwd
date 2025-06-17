import React from 'react';
import { BarChart3, TrendingUp, Clock, DollarSign } from 'lucide-react';

export default function Reports() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Rapporter</h2>
        <p className="text-gray-600">Få indsigt i din virksomheds performance</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Clock className="h-6 w-6 text-blue-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Timer denne uge
                  </dt>
                  <dd className="text-2xl font-semibold text-gray-900">
                    324
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
                <BarChart3 className="h-6 w-6 text-green-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Afsluttede opgaver
                  </dt>
                  <dd className="text-2xl font-semibold text-gray-900">
                    87
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
                <TrendingUp className="h-6 w-6 text-purple-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Effektivitet
                  </dt>
                  <dd className="text-2xl font-semibold text-gray-900">
                    94%
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
                <DollarSign className="h-6 w-6 text-orange-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Omsætning (måned)
                  </dt>
                  <dd className="text-2xl font-semibold text-gray-900">
                    184.500 kr
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Placeholder */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Ugentlige timer</h3>
          <div className="h-64 flex items-center justify-center bg-gray-50 rounded">
            <p className="text-gray-500">Diagram kommer her (Chart.js integration)</p>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Opgavefordeling</h3>
          <div className="h-64 flex items-center justify-center bg-gray-50 rounded">
            <p className="text-gray-500">Diagram kommer her (Chart.js integration)</p>
          </div>
        </div>
      </div>

      {/* Employee Performance */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Medarbejder performance</h3>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {[
              { name: 'Maria Hansen', hours: 42, tasks: 12, efficiency: 96 },
              { name: 'Lars Nielsen', hours: 38, tasks: 10, efficiency: 94 },
              { name: 'Peter Andersen', hours: 40, tasks: 11, efficiency: 92 },
            ].map((employee, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center mr-4">
                    <span className="text-sm font-medium text-blue-600">
                      {employee.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">{employee.name}</h4>
                  </div>
                </div>
                
                <div className="flex space-x-8 text-sm text-gray-600">
                  <div className="text-center">
                    <div className="font-medium text-gray-900">{employee.hours}t</div>
                    <div>Timer</div>
                  </div>
                  <div className="text-center">
                    <div className="font-medium text-gray-900">{employee.tasks}</div>
                    <div>Opgaver</div>
                  </div>
                  <div className="text-center">
                    <div className="font-medium text-gray-900">{employee.efficiency}%</div>
                    <div>Effektivitet</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}