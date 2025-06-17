import React, { useState } from 'react';
import { X, Save, Trash2, Copy, Calendar, Clock, User, MapPin, Plus, Search } from 'lucide-react';

interface TaskTemplate {
  id: string;
  name: string;
  description: string;
  taskType: string;
  estimatedDuration: number;
  requiredSkills: string[];
  priority: 'low' | 'medium' | 'high' | 'urgent';
  isRecurring: boolean;
  recurrencePattern?: string;
  documentationRequired: boolean;
  notes?: string;
  createdAt: Date;
  usageCount: number;
}

interface TaskTemplateManagerProps {
  onClose: () => void;
  onApplyTemplate: (template: TaskTemplate) => void;
}

// Mock skabeloner for danske servicevirksomheder som beskrevet
const mockTemplates: TaskTemplate[] = [
  {
    id: '1',
    name: 'Ugentlig vinduespolering - Butikker',
    description: 'Standard vinduespolering for butikker og kontorer med høj kundetrafik',
    taskType: 'vinduespolering',
    estimatedDuration: 180,
    requiredSkills: ['vinduespolering_trad'],
    priority: 'medium',
    isRecurring: true,
    recurrencePattern: 'weekly',
    documentationRequired: false,
    notes: 'Husk at tjekke for skader på vinduer og rapporter til kunde',
    createdAt: new Date('2024-01-01'),
    usageCount: 24
  },
  {
    id: '2',
    name: 'Månedlig dybderengøring - Kontorer',
    description: 'Komplet rengøring af alle kontorfaciliteter inkl. mødelokaler',
    taskType: 'rengoring',
    estimatedDuration: 480,
    requiredSkills: ['rengoring', 'gulvbehandling'],
    priority: 'high',
    isRecurring: true,
    recurrencePattern: 'monthly',
    documentationRequired: true,
    notes: 'Inkluderer alle overflader, køkken, toiletter og specialområder',
    createdAt: new Date('2024-01-01'),
    usageCount: 12
  },
  {
    id: '3',
    name: 'Akut rengøring - Spild/uheld',
    description: 'Hurtig rengøring ved akutte situationer og uheld',
    taskType: 'rengoring',
    estimatedDuration: 120,
    requiredSkills: ['rengoring'],
    priority: 'urgent',
    isRecurring: false,
    documentationRequired: false,
    notes: 'Prioriter synlige områder først, dokumenter skader hvis nødvendigt',
    createdAt: new Date('2024-01-01'),
    usageCount: 8
  },
  {
    id: '4',
    name: 'Kvartalvis algerens - Facader',
    description: 'Fjernelse af alger fra facader og udendørsområder',
    taskType: 'algerens',
    estimatedDuration: 360,
    requiredSkills: ['algerens', 'hojtryk'],
    priority: 'medium',
    isRecurring: true,
    recurrencePattern: 'quarterly',
    documentationRequired: true,
    notes: 'Vær opmærksom på vejrforhold, undgå arbejde ved frost',
    createdAt: new Date('2024-01-01'),
    usageCount: 4
  },
  {
    id: '5',
    name: 'Gulvbehandling - Specialgulve',
    description: 'Professionel behandling af træ, sten og specialgulve',
    taskType: 'gulvbehandling',
    estimatedDuration: 300,
    requiredSkills: ['gulvbehandling'],
    priority: 'medium',
    isRecurring: true,
    recurrencePattern: 'quarterly',
    documentationRequired: true,
    notes: 'Test altid produkter på lille område først',
    createdAt: new Date('2024-01-01'),
    usageCount: 6
  }
];

export default function TaskTemplateManager({ onClose, onApplyTemplate }: TaskTemplateManagerProps) {
  const [templates, setTemplates] = useState<TaskTemplate[]>(mockTemplates);
  const [selectedTemplate, setSelectedTemplate] = useState<TaskTemplate | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');

  // Hurtig søgning og filtrering som beskrevet
  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.taskType.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = filterType === 'all' || template.taskType === filterType;
    
    return matchesSearch && matchesType;
  });

  const handleApplyTemplate = (template: TaskTemplate) => {
    // Opdater usage count
    setTemplates(prev => prev.map(t => 
      t.id === template.id 
        ? { ...t, usageCount: t.usageCount + 1 }
        : t
    ));
    
    onApplyTemplate(template);
    onClose();
  };

  const handleDeleteTemplate = (templateId: string) => {
    if (window.confirm('Er du sikker på, at du vil slette denne skabelon?')) {
      setTemplates(prev => prev.filter(t => t.id !== templateId));
    }
  };

  const handleDuplicateTemplate = (template: TaskTemplate) => {
    const newTemplate: TaskTemplate = {
      ...template,
      id: Date.now().toString(),
      name: `${template.name} (kopi)`,
      createdAt: new Date(),
      usageCount: 0
    };
    
    setTemplates(prev => [...prev, newTemplate]);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'Akut';
      case 'high': return 'Høj';
      case 'medium': return 'Medium';
      case 'low': return 'Lav';
      default: return priority;
    }
  };

  const getRecurrenceText = (pattern?: string) => {
    switch (pattern) {
      case 'daily': return 'Dagligt';
      case 'weekly': return 'Ugentligt';
      case 'biweekly': return 'Hver 14. dag';
      case 'monthly': return 'Månedligt';
      case 'quarterly': return 'Kvartalsvis';
      default: return 'Engangs';
    }
  };

  const getTaskTypeIcon = (taskType: string) => {
    switch (taskType) {
      case 'vinduespolering': return '🪟';
      case 'rengoring': return '🧼';
      case 'gulvbehandling': return '🧴';
      case 'algerens': return '🧽';
      case 'hojtryk': return '💦';
      case 'fliserens': return '🧹';
      case 'taepper': return '🧶';
      case 'specialrens': return '🧪';
      default: return '⚙️';
    }
  };

  const uniqueTaskTypes = [...new Set(templates.map(t => t.taskType))];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose}></div>

        <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>

        <div className="inline-block align-bottom bg-white rounded-xl px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm: align-middle sm:max-w-7xl sm:w-full sm:p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900">Opgaveskabeloner</h3>
              <p className="text-sm text-gray-600">Gendan og administrer dine opgaveskabeloner for hurtigere oprettelse</p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowCreateForm(true)}
                className="inline-flex items-center px-3 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors"
              >
                <Plus className="h-4 w-4 mr-2" />
                Ny skabelon
              </button>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                <X className="h-6 w-6" />
              </button>
            </div>
          </div>

          {/* Search and Filter som beskrevet */}
          <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0 md:space-x-4">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                placeholder="Søg skabeloner..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <select
              className="border border-gray-300 rounded-lg px-3 py-3 text-sm focus:ring-blue-500 focus:border-blue-500"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              <option value="all">Alle typer</option>
              {uniqueTaskTypes.map(type => (
                <option key={type} value={type}>
                  {getTaskTypeIcon(type)} {type}
                </option>
              ))}
            </select>
          </div>

          {/* Templates Grid som beskrevet */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTemplates.map(template => (
              <div key={template.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center flex-1">
                    <div className="text-2xl mr-3">{getTaskTypeIcon(template.taskType)}</div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-md font-medium text-gray-900 truncate">{template.name}</h4>
                      <p className="text-sm text-gray-600 line-clamp-2 mt-1">{template.description}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-1 ml-2">
                    <button
                      onClick={() => handleDuplicateTemplate(template)}
                      className="p-1 text-gray-400 hover:text-gray-600"
                      title="Dupliker skabelon"
                    >
                      <Copy className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteTemplate(template.id)}
                      className="p-1 text-gray-400 hover:text-red-600"
                      title="Slet skabelon"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center text-gray-600">
                      <Clock className="h-4 w-4 mr-1" />
                      <span>{Math.round(template.estimatedDuration / 60)}t {template.estimatedDuration % 60}m</span>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full ${getPriorityColor(template.priority)}`}>
                      {getPriorityText(template.priority)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center text-gray-600">
                      <Calendar className="h-4 w-4 mr-1" />
                      <span>{getRecurrenceText(template.recurrencePattern)}</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <User className="h-4 w-4 mr-1" />
                      <span>{template.usageCount} gange</span>
                    </div>
                  </div>

                  {template.requiredSkills.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {template.requiredSkills.slice(0, 2).map(skill => (
                        <span key={skill} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                          {skill}
                        </span>
                      ))}
                      {template.requiredSkills.length > 2 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                          +{template.requiredSkills.length - 2}
                        </span>
                      )}
                    </div>
                  )}

                  {template.documentationRequired && (
                    <div className="flex items-center text-xs text-orange-600">
                      <MapPin className="h-3 w-3 mr-1" />
                      Dokumentation påkrævet
                    </div>
                  )}
                </div>

                <div className="flex space-x-2">
                  <button
                    onClick={() => setSelectedTemplate(template)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                  >
                    Forhåndsvis
                  </button>
                  <button
                    onClick={() => handleApplyTemplate(template)}
                    className="flex-1 px-3 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors"
                  >
                    Anvend
                  </button>
                </div>
              </div>
            ))}
          </div>

          {filteredTemplates.length === 0 && (
            <div className="text-center py-12">
              <Save className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Ingen skabeloner fundet</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm || filterType !== 'all' 
                  ? 'Prøv at justere din søgning eller filter' 
                  : 'Opret din første skabelon for at spare tid på opgaveoprettelse'}
              </p>
            </div>
          )}

          {/* Template Preview Modal */}
          {selectedTemplate && (
            <div className="fixed inset-0 z-60 overflow-y-auto">
              <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                <div className="fixed inset-0 bg-gray-500 bg-opacity-75" onClick={() => setSelectedTemplate(null)}></div>
                
                <div className="inline-block align-bottom bg-white rounded-xl px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full sm:p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <div className="text-3xl mr-3">{getTaskTypeIcon(selectedTemplate.taskType)}</div>
                      <h4 className="text-lg font-medium text-gray-900">{selectedTemplate.name}</h4>
                    </div>
                    <button onClick={() => setSelectedTemplate(null)} className="text-gray-400 hover:text-gray-600">
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-600">{selectedTemplate.description}</p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-gray-700">Varighed:</span>
                        <div>{Math.round(selectedTemplate.estimatedDuration / 60)}t {selectedTemplate.estimatedDuration % 60}m</div>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Prioritet:</span>
                        <div>{getPriorityText(selectedTemplate.priority)}</div>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Gentagelse:</span>
                        <div>{getRecurrenceText(selectedTemplate.recurrencePattern)}</div>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Brugt:</span>
                        <div>{selectedTemplate.usageCount} gange</div>
                      </div>
                    </div>
                    
                    {selectedTemplate.requiredSkills.length > 0 && (
                      <div>
                        <span className="font-medium text-gray-700 block mb-2">Påkrævede færdigheder:</span>
                        <div className="flex flex-wrap gap-1">
                          {selectedTemplate.requiredSkills.map(skill => (
                            <span key={skill} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {selectedTemplate.notes && (
                      <div>
                        <span className="font-medium text-gray-700 block mb-1">Instruktioner:</span>
                        <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded">{selectedTemplate.notes}</p>
                      </div>
                    )}

                    {selectedTemplate.documentationRequired && (
                      <div className="flex items-center text-sm text-orange-600 bg-orange-50 p-2 rounded">
                        <MapPin className="h-4 w-4 mr-2" />
                        Dokumentation påkrævet
                      </div>
                    )}
                  </div>
                  
                  <div className="flex space-x-3 mt-6">
                    <button
                      onClick={() => setSelectedTemplate(null)}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                    >
                      Luk
                    </button>
                    <button
                      onClick={() => {
                        handleApplyTemplate(selectedTemplate);
                        setSelectedTemplate(null);
                      }}
                      className="flex-1 px-4 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors"
                    >
                      Anvend skabelon
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}