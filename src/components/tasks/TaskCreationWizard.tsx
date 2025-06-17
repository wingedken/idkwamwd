import React, { useState, useEffect } from 'react';
import { X, ArrowRight, ArrowLeft, CheckCircle, AlertTriangle, MapPin, Clock, User, FileText, Repeat, Zap } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { taskService } from '../../services/taskService';
import SmartCVRLookup from '../smart/SmartCVRLookup';
import SmartAddressLookup from '../smart/SmartAddressLookup';
import type { Task, Customer, Employee, TaskTemplate } from '../../types';

interface TaskCreationWizardProps {
  onClose: () => void;
  onTaskCreated: (task: Task) => void;
  customers: Customer[];
  employees: Employee[];
  templates: TaskTemplate[];
}

const TASK_TYPES = [
  { id: 'cleaning', name: 'Rengøring', icon: '🧼', estimatedDuration: 120, skills: ['cleaning'] },
  { id: 'window_cleaning', name: 'Vinduespolering', icon: '🪟', estimatedDuration: 90, skills: ['window_cleaning'] },
  { id: 'floor_treatment', name: 'Gulvbehandling', icon: '🧽', estimatedDuration: 180, skills: ['floor_treatment'] },
  { id: 'pressure_washing', name: 'Højtryksspuling', icon: '💦', estimatedDuration: 60, skills: ['pressure_washing'] },
  { id: 'maintenance', name: 'Vedligeholdelse', icon: '🔧', estimatedDuration: 120, skills: ['maintenance'] },
  { id: 'custom', name: 'Brugerdefineret', icon: '⚙️', estimatedDuration: 60, skills: [] }
];

const PRIORITIES = [
  { value: 'low', label: 'Lav', color: 'text-green-600' },
  { value: 'medium', label: 'Medium', color: 'text-yellow-600' },
  { value: 'high', label: 'Høj', color: 'text-orange-600' },
  { value: 'urgent', label: 'Akut', color: 'text-red-600' }
];

const RECURRENCE_PATTERNS = [
  { value: '', label: 'Engangsopgave' },
  { value: 'daily', label: 'Dagligt' },
  { value: 'weekly', label: 'Ugentligt' },
  { value: 'biweekly', label: 'Hver 14. dag' },
  { value: 'monthly', label: 'Månedligt' },
  { value: 'quarterly', label: 'Kvartalsvis' }
];

export default function TaskCreationWizard({ 
  onClose, 
  onTaskCreated, 
  customers, 
  employees, 
  templates 
}: TaskCreationWizardProps) {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Form data
  const [formData, setFormData] = useState({
    // Step 1: Opgavetype og grundlæggende info
    task_type: '',
    title: '',
    description: '',
    estimated_duration: 60,
    
    // Step 2: Kunde og lokation
    customer_id: '',
    customer_address_id: '',
    new_customer: {
      name: '',
      cvr: '',
      email: '',
      phone: '',
      contact_person: ''
    },
    new_address: {
      street: '',
      postal_code: '',
      city: '',
      type: 'main'
    },
    
    // Step 3: Planlægning
    scheduled_date: new Date().toISOString().split('T')[0],
    time_window: {
      start: '08:00',
      end: '16:00'
    },
    priority: 'medium' as const,
    recurrence_pattern: '',
    recurrence_end_date: '',
    
    // Step 4: Tildeling og færdigheder
    assigned_employees: [] as string[],
    required_skills: [] as string[],
    
    // Step 5: Dokumentation
    documentation_requirements: [] as Array<{
      type: 'text' | 'photo' | 'signature' | 'checklist';
      title: string;
      description?: string;
      required: boolean;
    }>
  });

  // Auto-fill fra skabelon
  const applyTemplate = (template: TaskTemplate) => {
    setFormData(prev => ({
      ...prev,
      task_type: template.task_type,
      title: template.title,
      description: template.description || '',
      estimated_duration: template.estimated_duration,
      required_skills: template.required_skills,
      priority: template.priority,
      documentation_requirements: template.documentation_requirements
    }));
  };

  // Auto-fill fra opgavetype
  const selectTaskType = (taskType: typeof TASK_TYPES[0]) => {
    setFormData(prev => ({
      ...prev,
      task_type: taskType.id,
      title: taskType.id === 'custom' ? '' : taskType.name,
      estimated_duration: taskType.estimatedDuration,
      required_skills: taskType.skills
    }));
  };

  // CVR data auto-fill
  const handleCVRData = (cvrData: any) => {
    setFormData(prev => ({
      ...prev,
      new_customer: {
        ...prev.new_customer,
        name: cvrData.name,
        cvr: cvrData.cvr || '',
        phone: cvrData.phone || prev.new_customer.phone,
        email: cvrData.email || prev.new_customer.email
      },
      new_address: {
        ...prev.new_address,
        street: cvrData.address || '',
        postal_code: cvrData.postalCode || '',
        city: cvrData.city || ''
      }
    }));
  };

  // Adresse auto-fill
  const handleAddressSelected = (addressData: any) => {
    setFormData(prev => ({
      ...prev,
      new_address: {
        ...prev.new_address,
        street: addressData.street,
        postal_code: addressData.postalCode,
        city: addressData.city
      }
    }));
  };

  // Intelligent medarbejdertildeling
  const autoAssignEmployees = () => {
    const availableEmployees = employees.filter(emp => 
      emp.is_active && 
      (formData.required_skills.length === 0 || 
       formData.required_skills.some(skill => emp.skills.includes(skill)))
    );

    if (availableEmployees.length > 0) {
      // Vælg den bedst matchende medarbejder
      const bestMatch = availableEmployees.reduce((best, current) => {
        const bestSkillMatch = formData.required_skills.filter(skill => best.skills.includes(skill)).length;
        const currentSkillMatch = formData.required_skills.filter(skill => current.skills.includes(skill)).length;
        return currentSkillMatch > bestSkillMatch ? current : best;
      });

      setFormData(prev => ({
        ...prev,
        assigned_employees: [bestMatch.id]
      }));
    }
  };

  // Validering
  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    switch (step) {
      case 1:
        if (!formData.task_type) newErrors.task_type = 'Vælg opgavetype';
        if (!formData.title) newErrors.title = 'Indtast titel';
        if (formData.estimated_duration < 15) newErrors.estimated_duration = 'Minimum 15 minutter';
        break;
      
      case 2:
        if (!formData.customer_id && !formData.new_customer.name) {
          newErrors.customer = 'Vælg kunde eller opret ny';
        }
        if (formData.customer_id && !formData.customer_address_id) {
          newErrors.address = 'Vælg adresse';
        }
        if (!formData.customer_id && !formData.new_address.street) {
          newErrors.new_address = 'Indtast adresse';
        }
        break;
      
      case 3:
        if (!formData.scheduled_date) newErrors.scheduled_date = 'Vælg dato';
        break;
      
      case 4:
        if (formData.assigned_employees.length === 0) {
          newErrors.assigned_employees = 'Tildel mindst én medarbejder';
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Navigation
  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 5));
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  // Opret opgave
  const createTask = async () => {
    if (!validateStep(4)) return;

    setIsLoading(true);
    try {
      // Opret kunde hvis nødvendigt
      let customerId = formData.customer_id;
      let customerAddressId = formData.customer_address_id;

      if (!customerId && formData.new_customer.name) {
        // Opret ny kunde og adresse
        // Dette ville normalt være et API kald
        customerId = 'new-customer-id';
        customerAddressId = 'new-address-id';
      }

      const taskData: Partial<Task> = {
        company_id: user?.company_id,
        customer_id: customerId,
        customer_address_id: customerAddressId,
        title: formData.title,
        description: formData.description,
        task_type: formData.task_type,
        estimated_duration: formData.estimated_duration,
        documentation_requirements: formData.documentation_requirements,
        priority: formData.priority,
        time_window: formData.time_window.start !== formData.time_window.end ? formData.time_window : undefined,
        status: 'scheduled',
        assigned_employees: formData.assigned_employees,
        required_skills: formData.required_skills,
        recurrence_pattern: formData.recurrence_pattern ? {
          type: formData.recurrence_pattern as any,
          interval: 1,
          end_date: formData.recurrence_end_date || undefined
        } : undefined,
        created_by: user?.id
      };

      const result = await taskService.createTask(taskData);
      
      if (result.success && result.data) {
        onTaskCreated(result.data);
        onClose();
      } else {
        setErrors({ general: result.error || 'Kunne ikke oprette opgave' });
      }
    } catch (error: any) {
      setErrors({ general: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Vælg opgavetype</h3>
              
              {/* Skabeloner */}
              {templates.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Populære skabeloner</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {templates.slice(0, 4).map(template => (
                      <button
                        key={template.id}
                        onClick={() => applyTemplate(template)}
                        className="p-3 text-left border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors"
                      >
                        <div className="font-medium text-sm">{template.name}</div>
                        <div className="text-xs text-gray-500">{template.usage_count} gange brugt</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Opgavetyper */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {TASK_TYPES.map(type => (
                  <button
                    key={type.id}
                    onClick={() => selectTaskType(type)}
                    className={`p-4 border-2 rounded-lg text-center transition-all ${
                      formData.task_type === type.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-2xl mb-2">{type.icon}</div>
                    <div className="text-sm font-medium">{type.name}</div>
                    <div className="text-xs text-gray-500">{type.estimatedDuration} min</div>
                  </button>
                ))}
              </div>
              {errors.task_type && <p className="text-red-600 text-sm mt-1">{errors.task_type}</p>}
            </div>

            {/* Titel og beskrivelse */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Titel *</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Opgavetitel..."
                />
                {errors.title && <p className="text-red-600 text-sm mt-1">{errors.title}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Estimeret varighed (min) *</label>
                <input
                  type="number"
                  min="15"
                  step="15"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  value={formData.estimated_duration}
                  onChange={(e) => setFormData(prev => ({ ...prev, estimated_duration: parseInt(e.target.value) || 60 }))}
                />
                {errors.estimated_duration && <p className="text-red-600 text-sm mt-1">{errors.estimated_duration}</p>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Beskrivelse</label>
              <textarea
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Detaljeret beskrivelse af opgaven..."
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Kunde og lokation</h3>
              
              {/* Kunde valg */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Vælg kunde</label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  value={formData.customer_id}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    customer_id: e.target.value,
                    customer_address_id: '' // Reset adresse når kunde ændres
                  }))}
                >
                  <option value="">Vælg eksisterende kunde eller opret ny</option>
                  {customers.map(customer => (
                    <option key={customer.id} value={customer.id}>
                      {customer.name} {customer.cvr ? `(${customer.cvr})` : ''}
                    </option>
                  ))}
                </select>
              </div>

              {/* Eksisterende kunde - adresse valg */}
              {formData.customer_id && (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Vælg adresse</label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    value={formData.customer_address_id}
                    onChange={(e) => setFormData(prev => ({ ...prev, customer_address_id: e.target.value }))}
                  >
                    <option value="">Vælg adresse</option>
                    {customers
                      .find(c => c.id === formData.customer_id)
                      ?.addresses.map(address => (
                        <option key={address.id} value={address.id}>
                          {address.street}, {address.postal_code} {address.city} ({address.type})
                        </option>
                      ))}
                  </select>
                  {errors.address && <p className="text-red-600 text-sm mt-1">{errors.address}</p>}
                </div>
              )}

              {/* Ny kunde */}
              {!formData.customer_id && (
                <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium text-gray-900">Opret ny kunde</h4>
                  
                  {/* CVR opslag */}
                  <SmartCVRLookup onDataFound={handleCVRData} />
                  
                  {/* Kunde info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Virksomhedsnavn *</label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                        value={formData.new_customer.name}
                        onChange={(e) => setFormData(prev => ({ 
                          ...prev, 
                          new_customer: { ...prev.new_customer, name: e.target.value }
                        }))}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Kontaktperson</label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                        value={formData.new_customer.contact_person}
                        onChange={(e) => setFormData(prev => ({ 
                          ...prev, 
                          new_customer: { ...prev.new_customer, contact_person: e.target.value }
                        }))}
                      />
                    </div>
                  </div>

                  {/* Adresse */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Adresse *</label>
                    <SmartAddressLookup
                      onAddressSelected={handleAddressSelected}
                      placeholder="Søg efter adresse..."
                    />
                  </div>
                  
                  {errors.customer && <p className="text-red-600 text-sm mt-1">{errors.customer}</p>}
                  {errors.new_address && <p className="text-red-600 text-sm mt-1">{errors.new_address}</p>}
                </div>
              )}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Planlægning</h3>
              
              {/* Dato og tidsvindue */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Dato *</label>
                  <input
                    type="date"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    value={formData.scheduled_date}
                    onChange={(e) => setFormData(prev => ({ ...prev, scheduled_date: e.target.value }))}
                  />
                  {errors.scheduled_date && <p className="text-red-600 text-sm mt-1">{errors.scheduled_date}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Fra tid</label>
                  <input
                    type="time"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    value={formData.time_window.start}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      time_window: { ...prev.time_window, start: e.target.value }
                    }))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Til tid</label>
                  <input
                    type="time"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    value={formData.time_window.end}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      time_window: { ...prev.time_window, end: e.target.value }
                    }))}
                  />
                </div>
              </div>

              {/* Prioritet */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Prioritet</label>
                <div className="grid grid-cols-4 gap-2">
                  {PRIORITIES.map(priority => (
                    <button
                      key={priority.value}
                      onClick={() => setFormData(prev => ({ ...prev, priority: priority.value as any }))}
                      className={`p-3 text-center border rounded-lg transition-colors ${
                        formData.priority === priority.value
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className={`font-medium ${priority.color}`}>{priority.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Gentagelse */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Gentagelse</label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  value={formData.recurrence_pattern}
                  onChange={(e) => setFormData(prev => ({ ...prev, recurrence_pattern: e.target.value }))}
                >
                  {RECURRENCE_PATTERNS.map(pattern => (
                    <option key={pattern.value} value={pattern.value}>
                      {pattern.label}
                    </option>
                  ))}
                </select>

                {formData.recurrence_pattern && (
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Slut dato (valgfrit)</label>
                    <input
                      type="date"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                      value={formData.recurrence_end_date}
                      onChange={(e) => setFormData(prev => ({ ...prev, recurrence_end_date: e.target.value }))}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Tildeling</h3>
                <button
                  onClick={autoAssignEmployees}
                  className="inline-flex items-center px-3 py-1 border border-blue-300 rounded-lg text-sm font-medium text-blue-700 bg-blue-50 hover:bg-blue-100"
                >
                  <Zap className="h-4 w-4 mr-1" />
                  Auto-tildel
                </button>
              </div>

              {/* Påkrævede færdigheder */}
              {formData.required_skills.length > 0 && (
                <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                  <h4 className="text-sm font-medium text-blue-800 mb-2">Påkrævede færdigheder:</h4>
                  <div className="flex flex-wrap gap-1">
                    {formData.required_skills.map(skill => (
                      <span key={skill} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Medarbejder valg */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {employees.filter(emp => emp.is_active).map(employee => {
                  const hasRequiredSkills = formData.required_skills.length === 0 || 
                    formData.required_skills.some(skill => employee.skills.includes(skill));
                  const isSelected = formData.assigned_employees.includes(employee.id);

                  return (
                    <div
                      key={employee.id}
                      onClick={() => {
                        setFormData(prev => ({
                          ...prev,
                          assigned_employees: isSelected
                            ? prev.assigned_employees.filter(id => id !== employee.id)
                            : [...prev.assigned_employees, employee.id]
                        }));
                      }}
                      className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        isSelected
                          ? 'border-blue-500 bg-blue-50'
                          : hasRequiredSkills
                          ? 'border-green-200 bg-green-50 hover:border-green-300'
                          : 'border-gray-200 bg-gray-50 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">{employee.user_id}</span>
                        {hasRequiredSkills && (
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        )}
                        {!hasRequiredSkills && formData.required_skills.length > 0 && (
                          <AlertTriangle className="h-5 w-5 text-orange-500" />
                        )}
                      </div>
                      <div className="text-sm text-gray-600">
                        Færdigheder: {employee.skills.join(', ') || 'Ingen specifikke'}
                      </div>
                    </div>
                  );
                })}
              </div>
              {errors.assigned_employees && <p className="text-red-600 text-sm mt-1">{errors.assigned_employees}</p>}
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Dokumentation</h3>
              
              {/* Dokumentationskrav */}
              <div className="space-y-4">
                {formData.documentation_requirements.map((req, index) => (
                  <div key={index} className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">{req.title}</span>
                      <button
                        onClick={() => {
                          setFormData(prev => ({
                            ...prev,
                            documentation_requirements: prev.documentation_requirements.filter((_, i) => i !== index)
                          }));
                        }}
                        className="text-red-600 hover:text-red-800"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="text-sm text-gray-600">
                      Type: {req.type} • {req.required ? 'Påkrævet' : 'Valgfrit'}
                    </div>
                  </div>
                ))}

                {/* Tilføj dokumentationskrav */}
                <button
                  onClick={() => {
                    setFormData(prev => ({
                      ...prev,
                      documentation_requirements: [
                        ...prev.documentation_requirements,
                        {
                          type: 'photo',
                          title: 'Billede af udført arbejde',
                          required: true
                        }
                      ]
                    }));
                  }}
                  className="w-full p-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-gray-400 hover:text-gray-800 transition-colors"
                >
                  <FileText className="h-6 w-6 mx-auto mb-2" />
                  Tilføj dokumentationskrav
                </button>
              </div>

              {/* Opsummering */}
              <div className="mt-8 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-3">Opsummering</h4>
                <div className="space-y-2 text-sm">
                  <div><strong>Opgave:</strong> {formData.title}</div>
                  <div><strong>Type:</strong> {TASK_TYPES.find(t => t.id === formData.task_type)?.name}</div>
                  <div><strong>Varighed:</strong> {formData.estimated_duration} minutter</div>
                  <div><strong>Prioritet:</strong> {PRIORITIES.find(p => p.value === formData.priority)?.label}</div>
                  <div><strong>Medarbejdere:</strong> {formData.assigned_employees.length} tildelt</div>
                  {formData.recurrence_pattern && (
                    <div><strong>Gentagelse:</strong> {RECURRENCE_PATTERNS.find(p => p.value === formData.recurrence_pattern)?.label}</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose}></div>

        <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>

        <div className="inline-block align-bottom bg-white rounded-xl px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full sm:p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Opret ny opgave</h2>
              <p className="text-sm text-gray-600">Trin {currentStep} af 5</p>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Progress */}
          <div className="mb-8">
            <div className="flex items-center">
              {[1, 2, 3, 4, 5].map(step => (
                <React.Fragment key={step}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    step <= currentStep ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
                  }`}>
                    {step}
                  </div>
                  {step < 5 && (
                    <div className={`flex-1 h-1 mx-2 ${
                      step < currentStep ? 'bg-blue-600' : 'bg-gray-200'
                    }`}></div>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="mb-8">
            {renderStep()}
          </div>

          {/* Error */}
          {errors.general && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm">{errors.general}</p>
            </div>
          )}

          {/* Footer */}
          <div className="flex justify-between">
            <button
              onClick={prevStep}
              disabled={currentStep === 1}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Tilbage
            </button>

            <div className="flex space-x-3">
              <button
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Annuller
              </button>

              {currentStep < 5 ? (
                <button
                  onClick={nextStep}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                >
                  Næste
                  <ArrowRight className="h-4 w-4 ml-2" />
                </button>
              ) : (
                <button
                  onClick={createTask}
                  disabled={isLoading}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-green-600 hover:bg-green-700 disabled:opacity-50"
                >
                  {isLoading ? 'Opretter...' : 'Opret opgave'}
                  <CheckCircle className="h-4 w-4 ml-2" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}