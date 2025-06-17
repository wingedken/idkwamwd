import React from 'react';
import { Settings, Database, Mail, Shield } from 'lucide-react';

export default function AdminSettings() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Systemindstillinger</h1>
        <p className="mt-1 text-sm text-gray-600">Administrer systemkonfiguration og indstillinger</p>
      </div>

      {/* Settings Sections */}
      <div className="space-y-6">
        {/* Database Settings */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center mb-4">
              <Database className="h-5 w-5 text-gray-400 mr-3" />
              <h3 className="text-lg font-medium text-gray-900">Database</h3>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-gray-900">Supabase Integration</h4>
                  <p className="text-sm text-gray-500">Forbindelsestatus til Supabase database</p>
                </div>
                <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                  Forbundet
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-gray-900">Automatisk backup</h4>
                  <p className="text-sm text-gray-500">Daglig sikkerhedskopiering af data</p>
                </div>
                <button className="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent bg-blue-600 transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
                  <span className="translate-x-5 pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"></span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Security Settings */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center mb-4">
              <Shield className="h-5 w-5 text-gray-400 mr-3" />
              <h3 className="text-lg font-medium text-gray-900">Sikkerhed</h3>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-gray-900">To-faktor autentificering</h4>
                  <p className="text-sm text-gray-500">Kræv 2FA for alle administratorer</p>
                </div>
                <button className="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent bg-blue-600 transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
                  <span className="translate-x-5 pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"></span>
                </button>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-gray-900">Session timeout</h4>
                  <p className="text-sm text-gray-500">Automatisk log ud efter inaktivitet</p>
                </div>
                <select className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:ring-blue-500 focus:border-blue-500">
                  <option>30 minutter</option>
                  <option>1 time</option>
                  <option>2 timer</option>
                  <option>4 timer</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors">
          Gem indstillinger
        </button>
      </div>
    </div>
  );
}