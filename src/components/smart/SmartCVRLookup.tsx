import React, { useState } from 'react';
import { Search, Building, MapPin, Phone, Mail, Users, Loader2, CheckCircle, AlertTriangle } from 'lucide-react';
import { cvrService } from '../../services/cvrService';

interface CVRData {
  name: string;
  address: string;
  postalCode: string;
  city: string;
  phone?: string;
  email?: string;
  status: string;
  industry?: string;
  employees?: number;
}

interface SmartCVRLookupProps {
  onDataFound: (data: CVRData) => void;
  initialCVR?: string;
}

export default function SmartCVRLookup({ onDataFound, initialCVR = '' }: SmartCVRLookupProps) {
  const [cvr, setCvr] = useState(initialCVR);
  const [isLoading, setIsLoading] = useState(false);
  const [cvrData, setCvrData] = useState<CVRData | null>(null);
  const [error, setError] = useState<string>('');
  const [hasSearched, setHasSearched] = useState(false);

  const handleCVRChange = (value: string) => {
    // Kun tillad cifre og formatér automatisk
    const cleaned = value.replace(/\D/g, '');
    const formatted = cleaned.slice(0, 8);
    setCvr(formatted);
    setError('');
    setCvrData(null);
    setHasSearched(false);
  };

  const handleLookup = async () => {
    if (!cvrService.validateCVR(cvr)) {
      setError('CVR-nummer skal være 8 cifre');
      return;
    }

    setIsLoading(true);
    setError('');
    setHasSearched(true);

    const result = await cvrService.lookupCVR(cvr);

    if (result.error) {
      setError(result.error);
      setCvrData(null);
    } else if (result.data) {
      setCvrData(result.data);
      onDataFound(result.data);
    }

    setIsLoading(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleLookup();
    }
  };

  const isValidCVR = cvrService.validateCVR(cvr);

  return (
    <div className="space-y-4">
      {/* CVR Input */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          CVR-nummer
        </label>
        <div className="flex rounded-md shadow-sm">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Building className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className={`block w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                error ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="12345678"
              value={cvr}
              onChange={(e) => handleCVRChange(e.target.value)}
              onKeyPress={handleKeyPress}
              maxLength={8}
            />
          </div>
          <button
            type="button"
            onClick={handleLookup}
            disabled={!isValidCVR || isLoading}
            className="ml-3 inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700 text-sm font-medium hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Search className="h-5 w-5" />
            )}
            <span className="ml-2">
              {isLoading ? 'Søger...' : 'Opslag'}
            </span>
          </button>
        </div>
        
        {/* Validation feedback */}
        <div className="mt-1 text-xs">
          {cvr && !isValidCVR && (
            <span className="text-red-600">CVR-nummer skal være 8 cifre</span>
          )}
          {cvr && isValidCVR && !hasSearched && (
            <span className="text-green-600">Klar til opslag</span>
          )}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="rounded-lg bg-red-50 p-4 border border-red-200">
          <div className="flex">
            <AlertTriangle className="h-5 w-5 text-red-400" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                CVR Opslag Fejlede
              </h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CVR Data Display */}
      {cvrData && (
        <div className="rounded-lg bg-green-50 border border-green-200 p-4">
          <div className="flex items-start">
            <CheckCircle className="h-5 w-5 text-green-400 mt-0.5" />
            <div className="ml-3 flex-1">
              <h3 className="text-sm font-medium text-green-800 mb-3">
                CVR Data Fundet
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="space-y-2">
                  <div className="flex items-center text-green-700">
                    <Building className="h-4 w-4 mr-2" />
                    <span className="font-medium">Virksomhed:</span>
                    <span className="ml-1">{cvrData.name}</span>
                  </div>
                  
                  <div className="flex items-center text-green-700">
                    <MapPin className="h-4 w-4 mr-2" />
                    <span className="font-medium">Adresse:</span>
                    <span className="ml-1">{cvrData.address}</span>
                  </div>
                  
                  <div className="flex items-center text-green-700">
                    <span className="font-medium">By:</span>
                    <span className="ml-1">{cvrData.postalCode} {cvrData.city}</span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  {cvrData.phone && (
                    <div className="flex items-center text-green-700">
                      <Phone className="h-4 w-4 mr-2" />
                      <span className="font-medium">Telefon:</span>
                      <span className="ml-1">{cvrData.phone}</span>
                    </div>
                  )}
                  
                  {cvrData.email && (
                    <div className="flex items-center text-green-700">
                      <Mail className="h-4 w-4 mr-2" />
                      <span className="font-medium">Email:</span>
                      <span className="ml-1">{cvrData.email}</span>
                    </div>
                  )}
                  
                  {cvrData.employees && (
                    <div className="flex items-center text-green-700">
                      <Users className="h-4 w-4 mr-2" />
                      <span className="font-medium">Medarbejdere:</span>
                      <span className="ml-1">{cvrData.employees}</span>
                    </div>
                  )}
                </div>
              </div>
              
              {cvrData.industry && (
                <div className="mt-3 text-green-700">
                  <span className="font-medium">Branche:</span>
                  <span className="ml-1">{cvrData.industry}</span>
                </div>
              )}
              
              <div className="mt-3 text-green-700">
                <span className="font-medium">Status:</span>
                <span className={`ml-1 px-2 py-1 text-xs rounded-full ${
                  cvrData.status === 'Aktiv' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {cvrData.status}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Help Text */}
      <div className="text-xs text-gray-500">
        <p>💡 <strong>Tip:</strong> Indtast CVR-nummer for automatisk at hente virksomhedsoplysninger fra CVR-registeret.</p>
      </div>
    </div>
  );
}