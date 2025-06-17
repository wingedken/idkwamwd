import React from 'react';
import { Building2, CreditCard, Mail, Shield } from 'lucide-react';

export default function CompanySettings() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Virksomhedsindstillinger</h2>
        <p className="text-gray-600">Administrer din virksomheds konfiguration</p>
      </div>

      {/* Company Information */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center">
            <Building2 className="h-5 w-5 text-gray-400 mr-3" />
            <h3 className="text-lg font-medium text-gray-900">Virksomhedsoplysninger</h3>
          </div>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Virksomhedsnavn</label>
              <input
                type="text"
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                defaultValue="Eksempel Service ApS"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">CVR-nummer</label>
              <input
                type="text"
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                defaultValue="12345678"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Adresse</label>
              <input
                type="text"
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                defaultValue="Erhvervsvej 123, 2000 Frederiksberg"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Telefon</label>
              <input
                type="tel"
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                defaultValue="+45 70 12 34 56"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Accounting Integration */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center">
            <CreditCard className="h-5 w-5 text-gray-400 mr-3" />
            <h3 className="text-lg font-medium text-gray-900">Regnskabsintegration</h3>
          </div>
        </div>
        <div className="p-6">
          <p className="text-sm text-gray-600 mb-4">
            Vælg dit regnskabssystem for at aktivere kunde- og fakturafunktioner.
          </p>
          
          <div className="space-y-4">
            {[
              { name: 'Dinero', status: 'not_connected', description: 'Populært online regnskabssystem' },
              { name: 'e-conomic', status: 'not_connected', description: 'Professionelt regnskabssystem' },
              { name: 'Billy', status: 'not_connected', description: 'Simpelt og brugervenligt' },
            ].map((system) => (
              <div key={system.name} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div>
                  <h4 className="text-sm font-medium text-gray-900">{system.name}</h4>
                  <p className="text-sm text-gray-500">{system.description}</p>
                </div>
                <button className="px-4 py-2 text-sm font-medium text-blue-600 border border-blue-600 rounded-md hover:bg-blue-50 transition-colors">
                  Forbind
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Email Settings */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center">
            <Mail className="h-5 w-5 text-gray-400 mr-3" />
            <h3 className="text-lg font-medium text-gray-900">Email-indstillinger</h3>
          </div>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Afsender email</label>
              <input
                type="email"
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                defaultValue="fakturaer@eksempelservice.dk"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Email signatur</label>
              <textarea
                rows={4}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                defaultValue="Med venlig hilsen,&#10;Eksempel Service ApS&#10;Tlf: +45 70 12 34 56&#10;www.eksempelservice.dk"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Security Settings */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center">
            <Shield className="h-5 w-5 text-gray-400 mr-3" />
            <h3 className="text-lg font-medium text-gray-900">Sikkerhedsindstillinger</h3>
          </div>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-gray-900">Kræv adgangskode ændring</h4>
                <p className="text-sm text-gray-500">Medarbejdere skal ændre adgangskode hver 90. dag</p>
              </div>
              <button className="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent bg-gray-200 transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
                <span className="translate-x-0 pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"></span>
              </button>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-gray-900">Log aktivitet</h4>
                <p className="text-sm text-gray-500">Gem log over alle systemaktiviteter</p>
              </div>
              <button className="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent bg-blue-600 transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
                <span className="translate-x-5 pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"></span>
              </button>
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