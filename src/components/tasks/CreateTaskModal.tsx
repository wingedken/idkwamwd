import React, { useState } from 'react';
import { X, MapPin, Clock, User, AlertTriangle, Calendar, Repeat, FileText } from 'lucide-react';
import SmartAddressLookup from '../smart/SmartAddressLookup';
import SmartCVRLookup from '../smart/SmartCVRLookup';

interface Employee {
  id: string;
  name: string;
  email: string;
  phone: string;
  skills: string[];
  currentLocation?: { lat: number; lng: number };
  isActive: boolean;
  color: string;
}

interface Task {
  id: string;
  title: string;
  description: string;
  customerId: string;
  customerName: string;
  address: string;
  coordinates: { lat: number; lng: number };
  startTime: Date;
  endTime: Date;
  estimatedDuration: number;
  assignedEmployees: string[];
  requiredSkills: string[];
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  isRecurring: boolean;
  recurrencePattern?: string;
  notes?: string;
  documentationRequired: boolean;
}

interface CreateTaskModalProps {
  employees: Employee[];
  onClose: () => void;
  onSubmit: (task: Partial<Task>) => void;
}

const taskTypes = [
  { id: 'vinduespolering', name: 'Vinduespolering', skills: ['vinduespolering_trad', 'vinduespolering_rent'], icon: '🪟' },
  { id: 'rengoring', name: 'Rengøring', skills: ['rengoring'], icon: '🧼' },
  { id: 'gulvbehandling', name: 'Gulvbehandling', skills: ['gulvbehandling'], icon: '🧴' },
  { id: 'algerens', name: 'Algerens', skills: ['algerens'], icon: '🧽' },
  { id: 'hojtryk', name: 'Højtryksspuling', skills: ['hojtryk'], icon: '💦' },
  { id: 'specialrens', name: 'Specialrens', skills: ['specialrens'], icon: '🧪' },
  { id: 'custom', name: 'Brugerdefineret', skills: [], icon: '⚙️' }
];

const recurrenceOptions = [
  { value: '', label: 'Engangsopgave' },
  { value: 'daily', label: 'Dagligt' },
  { value: 'weekly', label: 'Ugentligt' },
  { value: 'biweekly', label: 'Hver 14. dag' },
  { value: 'monthly', label: 'Månedligt' },
  { value: 'quarterly', label: 'Kvartalsvis' }
];

export default function CreateTaskModal({ employees, onClose, onSubmit }: CreateTaskModalProps) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    taskType: '',
    customerName: '',
    customerCVR: '',
    address: '',
    coordinates: { lat: 0, lng: 0 },
    date: new Date().toISOString().split('T')[0],
    startTime: '08:00',
    estimatedDuration: 120,
    assignedEmployees: [] as string[],
    requiredSkills: [] as string[],
    priority: 'medium' as const,
    isRecurring: false,
    recurrencePattern: '',
    notes: '',
    documentationRequired: false
  });

  const [availableEmployees, setAvailableEmployees] = useState<Employee[]>([]);
  const [showCVRLookup, setShowCVRLookup] = useState(false);

  // Opdater tilgængelige medarbejdere baseret på færdigheder
  React.useEffect(() => {
    if (formData.requiredSkills.length === 0) {
      setAvailableEmployees(employees.filter(emp => emp.isActive));
    } else {
      setAvailableEmployees(
        employees.filter(emp => 
          emp.isActive && 
          formData.requiredSkills.some(skill => emp.skills.includes(skill))
        )
      );
    }
  }, [formData.requiredSkills, employees]);

  const handleTaskTypeSelect = (taskType: any) => {
    setFormData(prev => ({
      ...prev,
      taskType: taskType.id,
      title: taskType.id === 'custom' ? '' : taskType.name,
      requiredSkills: taskType.skills
    }));
  };

  const handleAddressSelected = (addressData: any) => {
    // Simuler koordinater baseret på adresse (i produktion ville dette være et rigtigt API kald)
    const mockCoordinates = {
      lat: 55.6761 + (Math.random() - 0.5) * 0.1,
      lng: 12.5683 + (Math.random() - 0.5) * 0.1
    };

    setFormData(prev => ({
      ...prev,
      address: addressData.fullAddress,
      coordinates: mockCoordinates
    }));
  };

  const handleCVRDataFound = (cvrData: any) => {
    setFormData(prev => ({
      ...prev,
      customerName: cvrData.name,
      customerCVR: prev.customerCVR,
      address: `${cvrData.address}, ${cvrData.postalCode} ${cvrData.city}`,
      coordinates: {
        lat: 55.6761 + (Math.random() - 0.5) * 0.1,
        lng: 12.5683 + (Math.random() - 0.5) * 0.1
      }
    }));
    setShowCVRLookup(false);
  };

  const handleEmployeeToggle = (employeeId: string) => {
    setFormData(prev => ({
      ...prev,
      assignedEmployees: prev.assignedEmployees.includes(employeeId)
        ? prev.assignedEmployees.filter(id => id !== employeeId)
        : [...prev.assignedEmployees, employeeId]
    }));
  };

  const handleSubmit = () => {
    const startDateTime = new Date(`${formData.date}T${formData.startTime}`);
    const endDateTime = new Date(startDateTime.getTime() + formData.estimatedDuration * 60000);

    const taskData: Partial<Task> = {
      title: formData.title,
      description: formData.description,
      customerId: 'temp-' + Date.now(),
      customerName: formData.customerName,
      address: formData.address,
      coordinates: formData.coordinates,
      startTime: startDateTime,
      endTime: endDateTime,
      estimatedDuration: formData.estimatedDuration,
      assignedEmployees: formData.assignedEmployees,
      requiredSkills: formData.requiredSkills,
      status: 'pending',
      priority: formData.priority,
      isRecurring: formData.isRecurring,
      recurrencePattern: formData.recurrencePattern || undefined,
      notes: formData.notes || undefined,
      documentationRequired: formData.documentationRequired
    };

    onSubmit(taskData);
    onClose();
  };

  const canProceedToStep2 = formData.taskType && formData.title && formData.customerName;
  const canProceedToStep3 = formData.address && formData.date && formData.startTime;
  const canSubmit = formData.assignedEmployees.length > 0;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose}></div>

        <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>

        <div className="inline-block align-bottom bg-white rounded-xl px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full sm:p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900">Opret ny opgave</h3>
              <div className="flex items-center mt-2">
                {[1, 2, 3].map(stepNumber => (
                  <div key={stepNumber} className="flex items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      step >= stepNumber ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
                    }`}>
                      {stepNumber}
                    </div>
                    {stepNumber < 3 && (
                      <div className={`w-12 h-1 mx-2 ${
                        step > stepNumber ? 'bg-blue-600' : 'bg-gray-200'
                      }`}></div>
                    )}
                  </div>
                ))}
              </div>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Step 1: Opgavetype og kunde */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h4 className="text-md font-medium text-gray-900 mb-4">Vælg opgavetype</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {taskTypes.map(type => (
                    <button
                      key={type.id}
                      onClick={() => handleTaskTypeSelect(type)}
                      className={`p-4 border-2 rounded-lg text-center transition-colors ${
                        formData.taskType === type.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="text-2xl mb-2">{type.icon}</div>
                      <div className="text-sm font-medium">{type.name}</div>
                    </button>
                  ))}
                </div>
              </div>

              {formData.taskType === 'custom' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Opgavetitel
                  </label>
                  <input
                    type="text"
                    className="block w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Indtast opgavetitel..."
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Beskrivelse (valgfrit)
                </label>
                <textarea
                  rows={3}
                  className="block w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Beskriv opgaven i detaljer..."
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Kunde
                  </label>
                  <button
                    onClick={() => setShowCVRLookup(true)}
                    className="text-sm text-blue-600 hover:text-blue-700"
                  >
                    CVR opslag
                  </button>
                </div>
                
                {showCVRLookup ? (
                  <div className="border border-gray-200 rounded-lg p-4">
                    <SmartCVRLookup
                      onDataFound={handleCVRDataFound}
                      initialCVR={formData.customerCVR}
                    />
                    <button
                      onClick={() => setShowCVRLookup(false)}
                      className="mt-2 text-sm text-gray-500 hover:text-gray-700"
                    >
                      Annuller CVR opslag
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                      type="text"
                      className="block w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                      value={formData.customerName}
                      onChange={(e) => setFormData(prev => ({ ...prev, customerName: e.target.value }))}
                      placeholder="Kundenavn..."
                    />
                    <input
                      type="text"
                      className="block w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                      value={formData.customerCVR}
                      onChange={(e) => setFormData(prev => ({ ...prev, customerCVR: e.target.value }))}
                      placeholder="CVR (valgfrit)..."
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 2: Lokation og tid */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Adresse
                </label>
                <SmartAddressLookup
                  onAddressSelected={handleAddressSelected}
                  placeholder="Søg efter adresse..."
                  initialValue={formData.address}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Dato
                  </label>
                  <input
                    type="date"
                    className="block w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                    value={formData.date}
                    onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Starttid
                  </label>
                  <input
                    type="time"
                    className="block w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                    value={formData.startTime}
                    onChange={(e) => setFormData(prev => ({ ...prev, startTime: e.target.value }))}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Estimeret varighed (minutter)
                  </label>
                  <input
                    type="number"
                    min="15"
                    step="15"
                    className="block w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                    value={formData.estimatedDuration}
                    onChange={(e) => setFormData(prev => ({ ...prev, estimatedDuration: parseInt(e.target.value) }))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Prioritet
                  </label>
                  <select
                    className="block w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                    value={formData.priority}
                    onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value as any }))}
                  >
                    <option value="low">Lav</option>
                    <option value="medium">Medium</option>
                    <option value="high">Høj</option>
                    <option value="urgent">Akut</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Gentagelse
                  </label>
                  <select
                    className="block w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                    value={formData.recurrencePattern}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      recurrencePattern: e.target.value,
                      isRecurring: e.target.value !== ''
                    }))}
                  >
                    {recurrenceOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="documentation"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  checked={formData.documentationRequired}
                  onChange={(e) => setFormData(prev => ({ ...prev, documentationRequired: e.target.checked }))}
                />
                <label htmlFor="documentation" className="ml-2 block text-sm text-gray-900">
                  Dokumentation påkrævet
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Noter (valgfrit)
                </label>
                <textarea
                  rows={3}
                  className="block w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Særlige instruktioner eller noter..."
                />
              </div>
            </div>
          )}

          {/* Step 3: Medarbejdertildeling */}
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <h4 className="text-md font-medium text-gray-900 mb-4">
                  Tildel medarbejdere
                </h4>
                
                {formData.requiredSkills.length > 0 && (
                  <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                    <div className="text-sm font-medium text-blue-800 mb-2">Påkrævede færdigheder:</div>
                    <div className="flex flex-wrap gap-2">
                      {formData.requiredSkills.map(skill => (
                        <span key={skill} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {availableEmployees.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <User className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                    <p>Ingen medarbejdere har de nødvendige færdigheder</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {availableEmployees.map(employee => (
                      <div
                        key={employee.id}
                        className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                          formData.assignedEmployees.includes(employee.id)
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => handleEmployeeToggle(employee.id)}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center">
                            <div 
                              className="w-3 h-3 rounded-full mr-2"
                              style={{ backgroundColor: employee.color }}
                            ></div>
                            <span className="font-medium">{employee.name}</span>
                          </div>
                          {formData.assignedEmployees.includes(employee.id) && (
                            <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
                              <span className="text-white text-xs">✓</span>
                            </div>
                          )}
                        </div>
                        
                        <div className="text-sm text-gray-600 mb-2">{employee.email}</div>
                        
                        <div className="flex flex-wrap gap-1">
                          {employee.skills.slice(0, 3).map(skill => (
                            <span key={skill} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                              {skill}
                            </span>
                          ))}
                          {employee.skills.length > 3 && (
                            <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                              +{employee.skills.length - 3}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="flex justify-between pt-6 border-t border-gray-200">
            <div>
              {step > 1 && (
                <button
                  onClick={() => setStep(step - 1)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                >
                  Tilbage
                </button>
              )}
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
              >
                Annuller
              </button>
              
              {step < 3 ? (
                <button
                  onClick={() => setStep(step + 1)}
                  disabled={
                    (step === 1 && !canProceedToStep2) ||
                    (step === 2 && !canProceedToStep3)
                  }
                  className="px-4 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Næste
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={!canSubmit}
                  className="px-4 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Opret opgave
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}