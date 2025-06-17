import React from 'react';
import { FileText, AlertTriangle } from 'lucide-react';

export default function Invoicing() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Fakturering</h2>
        <p className="text-gray-600">Administrer fakturaer og betalinger</p>
      </div>

      {/* Integration Required Notice */}
      <div className="bg-orange-50 border border-orange-200 rounded-md p-6">
        <div className="flex">
          <div className="flex-shrink-0">
            <AlertTriangle className="h-6 w-6 text-orange-400" />
          </div>
          <div className="ml-3">
            <h3 className="text-lg font-medium text-orange-800">
              Regnskabsintegration påkrævet
            </h3>
            <div className="mt-2 text-sm text-orange-700">
              <p className="mb-3">
                For at bruge faktureringsfunktionen skal du først forbinde et af følgende regnskabssystemer:
              </p>
              <ul className="list-disc list-inside space-y-1">
                <li>Dinero</li>
                <li>e-conomic</li>
                <li>Billy</li>
              </ul>
              <p className="mt-3">
                Gå til <strong>Indstillinger</strong> for at opsætte integrationen.
              </p>
            </div>
            <div className="mt-4">
              <button className="inline-flex items-center px-4 py-2 bg-orange-600 text-white text-sm font-medium rounded-md hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-colors">
                <FileText className="h-4 w-4 mr-2" />
                Opsæt regnskabsintegration
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Placeholder for future invoicing functionality */}
      <div className="bg-white shadow rounded-lg p-6 opacity-50">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Fakturaer</h3>
        <div className="text-center py-12">
          <FileText className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Ingen fakturaer endnu</h3>
          <p className="mt-1 text-sm text-gray-500">
            Fakturaer vil blive vist her når regnskabsintegration er aktiveret.
          </p>
        </div>
      </div>
    </div>
  );
}