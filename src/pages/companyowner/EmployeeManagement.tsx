import React, { useState, useEffect } from 'react';
import { Plus, Search, User, Phone, Mail, Edit, Eye, Trash2, UserPlus, Calendar, Clock, CheckSquare, Users } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface Skill {
  id: string;
  name: string;
  icon: string;
}

interface Employee {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  skills: string[];
  hasLogin: boolean;
  isActive: boolean;
  tasksCompleted: number;
  hoursThisWeek: number;
  efficiency: number;
  address?: string;
  city?: string;
  postalCode?: string;
  startDate?: string;
  licenseStatus: 'ok' | 'extra' | 'missing';
  currentTasks: {
    id: string;
    title: string;
    time: string;
    customer: string;
  }[];
}

// Predefined skills with icons
const availableSkills: Skill[] = [
  { id: 'vinduespolering_trad', name: 'Vinduespolering (Traditionel)', icon: '🪟' },
  { id: 'vinduespolering_rent', name: 'Vinduespolering (Rentvandsanlæg)', icon: '💧' },
  { id: 'algerens', name: 'Algerens', icon: '🧽' },
  { id: 'fliserens', name: 'Fliserens', icon: '🧹' },
  { id: 'rengoring', name: 'Rengøring', icon: '🧼' },
  { id: 'hojtryk', name: 'Højtryksspuling', icon: '💦' },
  { id: 'gulvbehandling', name: 'Gulvbehandling', icon: '🧴' },
  { id: 'taepper', name: 'Tæpperens', icon: '🧶' },
  { id: 'hojde', name: 'Højdearbejde', icon: '🪜' },
  { id: 'specialrens', name: 'Specialrens', icon: '🧪' }
];

// Predefined roles with associated skills
const roleSkills = {
  'Vinduespolerer': ['vinduespolering_trad', 'vinduespolering_rent', 'hojde'],
  'Rengøringsassistent': ['rengoring', 'taepper', 'gulvbehandling'],
  'Specialtekniker': ['algerens', 'fliserens', 'hojtryk', 'specialrens'],
  'Teamleder': ['rengoring', 'vinduespolering_trad', 'gulvbehandling'],
  'Servicetekniker': ['hojtryk', 'specialrens', 'algerens', 'fliserens']
};

// Mock data for employees
const mockEmployees: Employee[] = [
  {
    id: '1',
    name: 'Lars Nielsen',
    email: 'lars@eksempelservice.dk',
    phone: '+45 20 12 34 56',
    role: 'Vinduespolerer',
    skills: ['vinduespolering_trad', 'vinduespolering_rent', 'hojde'],
    hasLogin: true,
    isActive: true,
    tasksCompleted: 24,
    hoursThisWeek: 38,
    efficiency: 94,
    address: 'Medarbejdervej 12',
    city: 'København',
    postalCode: '2100',
    startDate: '2022-03-15',
    licenseStatus: 'ok',
    currentTasks: [
      { id: 't1', title: 'Vinduespolering', time: '13:00-15:30', customer: 'Kontorbygning A/S' },
      { id: 't2', title: 'Facaderens', time: '16:00-17:30', customer: 'Butikscenter Nord' }
    ]
  },
  {
    id: '2',
    name: 'Maria Hansen',
    email: 'maria@eksempelservice.dk',
    phone: '+45 30 12 34 56',
    role: 'Rengøringsassistent',
    skills: ['rengoring', 'taepper', 'gulvbehandling'],
    hasLogin: true,
    isActive: true,
    tasksCompleted: 18,
    hoursThisWeek: 42,
    efficiency: 89,
    address: 'Servicevej 45',
    city: 'Frederiksberg',
    postalCode: '2000',
    startDate: '2021-08-10',
    licenseStatus: 'extra',
    currentTasks: [
      { id: 't3', title: 'Kontorrengøring', time: '08:00-12:00', customer: 'Advokatfirma Hansen' }
    ]
  },
  {
    id: '3',
    name: 'Peter Andersen',
    email: 'peter@eksempelservice.dk',
    phone: '+45 40 12 34 56',
    role: 'Specialtekniker',
    skills: ['algerens', 'fliserens', 'hojtryk', 'specialrens'],
    hasLogin: true,
    isActive: true,
    tasksCompleted: 15,
    hoursThisWeek: 36,
    efficiency: 92,
    address: 'Teknikervej 78',
    city: 'København',
    postalCode: '2200',
    startDate: '2023-01-05',
    licenseStatus: 'ok',
    currentTasks: [
      { id: 't4', title: 'Algerens', time: '09:00-14:00', customer: 'Boligforening Øst' },
      { id: 't5', title: 'Fliserens', time: '15:00-17:00', customer: 'Restaurant Bella' }
    ]
  },
  {
    id: '4',
    name: 'Sofie Jensen',
    email: 'sofie@eksempelservice.dk',
    phone: '+45 50 12 34 56',
    role: 'Teamleder',
    skills: ['rengoring', 'vinduespolering_trad', 'gulvbehandling'],
    hasLogin: true,
    isActive: false,
    tasksCompleted: 0,
    hoursThisWeek: 0,
    efficiency: 0,
    address: 'Ledervej 10',
    city: 'København',
    postalCode: '2300',
    startDate: '2020-05-20',
    licenseStatus: 'missing',
    currentTasks: []
  }
];

export default function EmployeeManagement() {
  const { user } = useAuth();
  const [employees, setEmployees] = useState<Employee[]>(mockEmployees);
  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>(mockEmployees);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [filterSkills, setFilterSkills] = useState<string[]>([]);

  // Filter employees based on search term and filters
  useEffect(() => {
    let filtered = employees;

    // Search filter
    if (searchTerm) {
      const query = searchTerm.toLowerCase();
      filtered = filtered.filter(employee =>
        employee.name.toLowerCase().includes(query) ||
        employee.email.toLowerCase().includes(query) ||
        employee.phone.includes(query) ||
        employee.role.toLowerCase().includes(query) ||
        employee.city?.toLowerCase().includes(query)
      );
    }

    // Skills filter
    if (filterSkills.length > 0) {
      filtered = filtered.filter(employee =>
        filterSkills.some(skill => employee.skills.includes(skill))
      );
    }

    setFilteredEmployees(filtered);
  }, [searchTerm, employees, filterSkills]);

  const handleCreateEmployee = (employeeData: any) => {
    const newEmployee: Employee = {
      id: Date.now().toString(),
      ...employeeData,
      hasLogin: true, // All employees get login automatically
      isActive: true,
      tasksCompleted: 0,
      hoursThisWeek: 0,
      efficiency: 85,
      licenseStatus: 'ok',
      currentTasks: []
    };

    setEmployees([...employees, newEmployee]);
    setShowCreateModal(false);
  };

  const handleEditEmployee = (employeeData: any) => {
    if (!selectedEmployee) return;

    setEmployees(employees.map(emp => 
      emp.id === selectedEmployee.id ? { ...emp, ...employeeData } : emp
    ));
    setShowEditModal(false);
    setSelectedEmployee(null);
  };

  const handleDeleteEmployee = (id: string) => {
    if (window.confirm('Er du sikker på, at du vil slette denne medarbejder?')) {
      setEmployees(employees.filter(emp => emp.id !== id));
    }
  };

  const getSkillName = (skillId: string) => {
    const skill = availableSkills.find(s => s.id === skillId);
    return skill ? skill.name : skillId;
  };

  const getSkillIcon = (skillId: string) => {
    const skill = availableSkills.find(s => s.id === skillId);
    return skill ? skill.icon : '🔧';
  };

  const isLoading = false;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Medarbejdere</h1>
            <p className="text-gray-600 mt-1">Administrer dit team med færdigheder og opgavetildeling</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors shadow-sm"
          >
            <Plus className="h-4 w-4 mr-2" />
            Opret medarbejder
          </button>
        </div>

        {/* Search and Filters */}
        <div className="space-y-4">
          {/* Search */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Søg efter navn, email, telefon eller by..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center space-x-2">
              <select
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                value={filterSkills.length === 1 ? filterSkills[0] : ''}
                onChange={(e) => {
                  if (e.target.value === '') {
                    setFilterSkills([]);
                  } else {
                    setFilterSkills([e.target.value]);
                  }
                }}
              >
                <option value="">Alle færdigheder</option>
                {availableSkills.map(skill => (
                  <option key={skill.id} value={skill.id}>
                    {skill.icon} {skill.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="ml-auto text-sm text-gray-500">
              Viser {filteredEmployees.length} af {employees.length} medarbejdere
            </div>
          </div>
        </div>
      </div>

      {/* Team Performance Summary */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-6">Team Performance</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-900">
              {Math.round(filteredEmployees.reduce((sum, emp) => sum + emp.efficiency, 0) / filteredEmployees.length || 0)}%
            </div>
            <div className="text-sm text-gray-500 mt-1">Gennemsnitlig effektivitet</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-900">
              {filteredEmployees.reduce((sum, emp) => sum + emp.tasksCompleted, 0)}
            </div>
            <div className="text-sm text-gray-500 mt-1">Opgaver afsluttet</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-900">
              {filteredEmployees.reduce((sum, emp) => sum + emp.hoursThisWeek, 0)}t
            </div>
            <div className="text-sm text-gray-500 mt-1">Timer denne uge</div>
          </div>
        </div>
      </div>

      {/* Employees Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Medarbejder
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Kontakt
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rolle
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Opgaver
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Effektivitet
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Handlinger
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredEmployees.map((employee) => (
                <tr 
                  key={employee.id} 
                  className="hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => {
                    setSelectedEmployee(employee);
                    setShowDetailModal(true);
                  }}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                          <User className="h-5 w-5 text-blue-600" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{employee.name}</div>
                        <div className="text-sm text-gray-500">{employee.role}</div>
                      </div>
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="space-y-1">
                      <div className="flex items-center text-sm text-gray-900">
                        <Mail className="h-4 w-4 mr-2 text-gray-400" />
                        {employee.email}
                      </div>
                      <div className="flex items-center text-sm text-gray-900">
                        <Phone className="h-4 w-4 mr-2 text-gray-400" />
                        {employee.phone}
                      </div>
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{employee.role}</div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{employee.tasksCompleted} afsluttet</div>
                    <div className="text-sm text-gray-500">
                      {employee.currentTasks.length > 0 
                        ? `${employee.currentTasks.length} aktive opgaver` 
                        : 'Ingen aktive opgaver'}
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`text-sm font-medium ${
                      employee.efficiency >= 90 ? 'text-green-600' :
                      employee.efficiency >= 70 ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {employee.efficiency}%
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                      <div 
                        className={`h-2 rounded-full ${
                          employee.efficiency >= 90 ? 'bg-green-500' :
                          employee.efficiency >= 70 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${employee.efficiency}%` }}
                      ></div>
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedEmployee(employee);
                          setShowEditModal(true);
                        }}
                        className="text-gray-600 hover:text-gray-900 p-1 rounded"
                        title="Rediger medarbejder"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteEmployee(employee.id);
                        }}
                        className="text-red-600 hover:text-red-900 p-1 rounded"
                        title="Slet medarbejder"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredEmployees.length === 0 && (
          <div className="text-center py-12">
            <User className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Ingen medarbejdere fundet</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm || filterSkills.length > 0
                ? 'Prøv at justere dine søgekriterier'
                : 'Opret din første medarbejder for at komme i gang'}
            </p>
          </div>
        )}
      </div>

      {/* Modals */}
      {showCreateModal && (
        <EmployeeFormModal 
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreateEmployee}
          availableSkills={availableSkills}
          title="Opret ny medarbejder"
          roleSkills={roleSkills}
        />
      )}

      {showEditModal && selectedEmployee && (
        <EmployeeFormModal 
          onClose={() => {
            setShowEditModal(false);
            setSelectedEmployee(null);
          }}
          onSubmit={handleEditEmployee}
          availableSkills={availableSkills}
          title="Rediger medarbejder"
          employee={selectedEmployee}
          roleSkills={roleSkills}
        />
      )}

      {showDetailModal && selectedEmployee && (
        <EmployeeDetailModal
          employee={selectedEmployee}
          availableSkills={availableSkills}
          onClose={() => {
            setShowDetailModal(false);
            setSelectedEmployee(null);
          }}
          onEdit={() => {
            setShowDetailModal(false);
            setShowEditModal(true);
          }}
        />
      )}
    </div>
  );
}

// Employee Form Modal (Create/Edit)
function EmployeeFormModal({ 
  onClose, 
  onSubmit, 
  availableSkills,
  title,
  employee,
  roleSkills
}: { 
  onClose: () => void; 
  onSubmit: (data: any) => void;
  availableSkills: Skill[];
  title: string;
  employee?: Employee;
  roleSkills: Record<string, string[]>;
}) {
  const [formData, setFormData] = useState({
    name: employee?.name || '',
    email: employee?.email || '',
    phone: employee?.phone || '',
    role: employee?.role || '',
    skills: employee?.skills || [],
    address: employee?.address || '',
    city: employee?.city || '',
    postalCode: employee?.postalCode || '',
    startDate: employee?.startDate || new Date().toISOString().split('T')[0],
    customSkill: '',
  });

  // Update skills when role changes
  useEffect(() => {
    if (formData.role && roleSkills[formData.role]) {
      setFormData(prev => ({
        ...prev,
        skills: roleSkills[formData.role]
      }));
    }
  }, [formData.role, roleSkills]);

  const handleSkillToggle = (skillId: string) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.includes(skillId)
        ? prev.skills.filter(id => id !== skillId)
        : [...prev.skills, skillId]
    }));
  };

  const handleAddCustomSkill = () => {
    if (!formData.customSkill.trim()) return;
    
    const customSkillId = formData.customSkill.toLowerCase().replace(/\s+/g, '_');
    
    if (!formData.skills.includes(customSkillId)) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, customSkillId],
        customSkill: ''
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const { customSkill, ...submitData } = formData;
    onSubmit(submitData);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose}></div>

        <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>

        <div className="inline-block align-bottom bg-white rounded-xl px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full sm:p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-medium text-gray-900">{title}</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 rounded-full p-1 hover:bg-gray-100">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Navn *</label>
                <input
                  type="text"
                  required
                  className="block w-full px-4 py-3 rounded-lg border border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Fornavn Efternavn"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Rolle *</label>
                <select
                  required
                  className="block w-full px-4 py-3 rounded-lg border border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                >
                  <option value="">Vælg rolle</option>
                  <option value="Vinduespolerer">Vinduespolerer</option>
                  <option value="Rengøringsassistent">Rengøringsassistent</option>
                  <option value="Specialtekniker">Specialtekniker</option>
                  <option value="Teamleder">Teamleder</option>
                  <option value="Servicetekniker">Servicetekniker</option>
                </select>
              </div>
            </div>

            {/* Contact Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                <input
                  type="email"
                  required
                  className="block w-full px-4 py-3 rounded-lg border border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="email@eksempel.dk"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Telefon *</label>
                <input
                  type="tel"
                  required
                  className="block w-full px-4 py-3 rounded-lg border border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+45 12 34 56 78"
                />
              </div>
            </div>

            {/* Address */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Adresse</label>
                <input
                  type="text"
                  className="block w-full px-4 py-3 rounded-lg border border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Gadenavn og nummer"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Postnummer</label>
                <input
                  type="text"
                  className="block w-full px-4 py-3 rounded-lg border border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                  value={formData.postalCode}
                  onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                  placeholder="1234"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">By</label>
                <input
                  type="text"
                  className="block w-full px-4 py-3 rounded-lg border border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  placeholder="By"
                />
              </div>
            </div>

            {/* Start Date - Only for editing */}
            {employee && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Startdato</label>
                <input
                  type="date"
                  className="block w-full px-4 py-3 rounded-lg border border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                />
              </div>
            )}

            {/* Skills */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Færdigheder</label>
              <div className="grid grid-cols-2 gap-3">
                {availableSkills.map(skill => (
                  <div 
                    key={skill.id} 
                    className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                      formData.skills.includes(skill.id) 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => handleSkillToggle(skill.id)}
                  >
                    <input
                      type="checkbox"
                      id={`skill-${skill.id}`}
                      checked={formData.skills.includes(skill.id)}
                      onChange={() => {}}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor={`skill-${skill.id}`} className="ml-2 block text-sm text-gray-900 cursor-pointer flex-1">
                      <span className="mr-2">{skill.icon}</span> {skill.name}
                    </label>
                  </div>
                ))}
              </div>

              {/* Custom Skill */}
              <div className="mt-4 flex">
                <input
                  type="text"
                  placeholder="Tilføj anden færdighed..."
                  className="flex-1 px-4 py-3 rounded-l-lg border border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                  value={formData.customSkill}
                  onChange={(e) => setFormData({ ...formData, customSkill: e.target.value })}
                />
                <button
                  type="button"
                  onClick={handleAddCustomSkill}
                  className="inline-flex items-center px-4 py-3 border border-transparent rounded-r-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Tilføj
                </button>
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
              >
                Annuller
              </button>
              <button
                type="submit"
                className="px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors"
              >
                {employee ? 'Gem ændringer' : 'Opret medarbejder'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

// Employee Detail Modal
function EmployeeDetailModal({ 
  employee, 
  availableSkills,
  onClose, 
  onEdit 
}: { 
  employee: Employee; 
  availableSkills: Skill[];
  onClose: () => void; 
  onEdit: () => void;
}) {
  const getSkillName = (skillId: string) => {
    const skill = availableSkills.find(s => s.id === skillId);
    return skill ? skill.name : skillId;
  };

  const getSkillIcon = (skillId: string) => {
    const skill = availableSkills.find(s => s.id === skillId);
    return skill ? skill.icon : '🔧';
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose}></div>

        <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>

        <div className="inline-block align-bottom bg-white rounded-xl px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full sm:p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <div className="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center mr-4">
                <User className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-xl font-medium text-gray-900">{employee.name}</h3>
                <div className="flex items-center space-x-3 mt-1">
                  <span className="text-sm text-gray-500">{employee.role}</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={onEdit}
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors"
              >
                <Edit className="h-4 w-4 mr-1" />
                Rediger
              </button>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-600 rounded-full p-1 hover:bg-gray-100">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Contact Information */}
            <div className="lg:col-span-2 space-y-6">
              <div>
                <h4 className="text-lg font-medium text-gray-900 mb-4">Kontaktoplysninger</h4>
                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                  <div className="flex items-center">
                    <Mail className="h-5 w-5 text-gray-400 mr-3" />
                    <span className="text-sm text-gray-900">{employee.email}</span>
                    <a
                      href={`mailto:${employee.email}`}
                      className="ml-auto text-blue-600 hover:text-blue-700 text-sm"
                      onClick={(e) => e.stopPropagation()}
                    >
                      Send email
                    </a>
                  </div>
                  
                  <div className="flex items-center">
                    <Phone className="h-5 w-5 text-gray-400 mr-3" />
                    <span className="text-sm text-gray-900">{employee.phone}</span>
                    <a
                      href={`tel:${employee.phone}`}
                      className="ml-auto text-blue-600 hover:text-blue-700 text-sm"
                      onClick={(e) => e.stopPropagation()}
                    >
                      Ring op
                    </a>
                  </div>
                  
                  {employee.address && (
                    <div className="flex items-start">
                      <svg className="h-5 w-5 text-gray-400 mr-3 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span className="text-sm text-gray-900">
                        {employee.address}, {employee.postalCode} {employee.city}
                      </span>
                    </div>
                  )}
                  
                  {employee.startDate && (
                    <div className="flex items-center">
                      <Calendar className="h-5 w-5 text-gray-400 mr-3" />
                      <span className="text-sm text-gray-900">
                        Startdato: {new Date(employee.startDate).toLocaleDateString('da-DK')}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Skills */}
              <div>
                <h4 className="text-lg font-medium text-gray-900 mb-4">Færdigheder</h4>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="grid grid-cols-2 gap-3">
                    {employee.skills.map(skillId => (
                      <div key={skillId} className="flex items-center p-3 bg-blue-50 rounded-lg">
                        <span className="text-xl mr-2">{getSkillIcon(skillId)}</span>
                        <span className="text-sm text-gray-900">{getSkillName(skillId)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Current Tasks */}
              <div>
                <h4 className="text-lg font-medium text-gray-900 mb-4">Aktuelle opgaver</h4>
                {employee.currentTasks.length > 0 ? (
                  <div className="space-y-3">
                    {employee.currentTasks.map(task => (
                      <div key={task.id} className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h5 className="text-sm font-medium text-gray-900">{task.title}</h5>
                          <span className="text-sm text-gray-500">{task.time}</span>
                        </div>
                        <p className="text-sm text-gray-600">{task.customer}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-gray-50 rounded-lg p-6 text-center">
                    <CheckSquare className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">Ingen aktive opgaver</p>
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Performance */}
              <div>
                <h4 className="text-lg font-medium text-gray-900 mb-4">Performance</h4>
                <div className="bg-gray-50 rounded-lg p-4 space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-gray-600">Effektivitet</span>
                      <span className={`text-sm font-medium ${
                        employee.efficiency >= 90 ? 'text-green-600' :
                        employee.efficiency >= 70 ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {employee.efficiency}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${
                          employee.efficiency >= 90 ? 'bg-green-500' :
                          employee.efficiency >= 70 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${employee.efficiency}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Opgaver afsluttet</span>
                    <span className="text-sm font-medium text-gray-900">{employee.tasksCompleted}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Timer denne uge</span>
                    <span className="text-sm font-medium text-gray-900">{employee.hoursThisWeek}t</span>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div>
                <h4 className="text-lg font-medium text-gray-900 mb-4">Handlinger</h4>
                <div className="space-y-2">
                  <button className="w-full flex items-center px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors">
                    <CheckSquare className="h-4 w-4 mr-2" />
                    Tildel opgave
                  </button>
                  
                  <button className="w-full flex items-center px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors">
                    <Clock className="h-4 w-4 mr-2" />
                    Se tidsregistrering
                  </button>
                  
                  <button className="w-full flex items-center px-3 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors">
                    <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Administrer færdigheder
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Loading state
const isLoading = false;