import React, { useState, useEffect } from 'react';
import { Plus, Search, Building, MapPin, Phone, Mail, Edit, Eye, Trash2, Filter } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import SmartCVRLookup from '../../components/smart/SmartCVRLookup';
import SmartAddressLookup from '../../components/smart/SmartAddressLookup';

interface CustomerAddress {
  id: string;
  type: string;
  street: string;
  postalCode: string;
  city: string;
  contactPerson?: string;
  phone?: string;
  email?: string;
  notes?: string;
  isActive: boolean;
}

interface Customer {
  id: string;
  name: string;
  cvr?: string;
  email?: string;
  phone?: string;
  contactPerson?: string;
  notes?: string;
  isActive: boolean;
  addresses: CustomerAddress[];
  totalTasks: number;
  lastTaskDate?: string;
  createdAt: string;
}

// Mock data for customers
const mockCustomers: Customer[] = [
  {
    id: '1',
    name: 'Netto Supermarked',
    cvr: '12345678',
    email: 'kontakt@netto.dk',
    phone: '+45 70 12 34 56',
    contactPerson: 'Karen Jensen',
    notes: 'Ugentlig rengøring, særlig fokus på kundeområder',
    isActive: true,
    totalTasks: 24,
    lastTaskDate: '2024-01-22',
    createdAt: '2023-06-15',
    addresses: [
      {
        id: '1',
        type: 'Hovedadresse',
        street: 'Hovedgade 123',
        postalCode: '2000',
        city: 'Frederiksberg',
        contactPerson: 'Karen Jensen',
        phone: '+45 70 12 34 56',
        email: 'karen@netto.dk',
        isActive: true
      }
    ]
  },
  {
    id: '2',
    name: 'Kontorbygning A/S',
    cvr: '87654321',
    email: 'facility@kontorbygning.dk',
    phone: '+45 80 12 34 56',
    contactPerson: 'Lars Andersen',
    notes: 'Månedlig dybderengøring, vinduespolering hver 14. dag',
    isActive: true,
    totalTasks: 18,
    lastTaskDate: '2024-01-20',
    createdAt: '2023-08-10',
    addresses: [
      {
        id: '2',
        type: 'Hovedkontor',
        street: 'Erhvervsvej 45',
        postalCode: '2100',
        city: 'København Ø',
        contactPerson: 'Lars Andersen',
        phone: '+45 80 12 34 56',
        email: 'lars@kontorbygning.dk',
        isActive: true
      },
      {
        id: '3',
        type: 'Filial',
        street: 'Butiksgade 67',
        postalCode: '2200',
        city: 'København N',
        contactPerson: 'Maria Nielsen',
        phone: '+45 81 12 34 56',
        email: 'maria@kontorbygning.dk',
        isActive: true
      }
    ]
  },
  {
    id: '3',
    name: 'Restaurant Bella',
    cvr: '55667788',
    email: 'info@restaurantbella.dk',
    phone: '+45 90 12 34 56',
    contactPerson: 'Maria Rossi',
    notes: 'Specialrens af køkken, højtryksspuling af terrasse',
    isActive: true,
    totalTasks: 12,
    lastTaskDate: '2024-01-18',
    createdAt: '2023-11-05',
    addresses: [
      {
        id: '4',
        type: 'Restaurant',
        street: 'Cafégade 78',
        postalCode: '2200',
        city: 'København N',
        contactPerson: 'Maria Rossi',
        phone: '+45 90 12 34 56',
        email: 'maria@restaurantbella.dk',
        isActive: true
      }
    ]
  }
];

export default function CustomerManagement() {
  const { user } = useAuth();
  const [customers, setCustomers] = useState<Customer[]>(mockCustomers);
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>(mockCustomers);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Filter customers based on search term and filters
  useEffect(() => {
    let filtered = customers;

    // Search filter
    if (searchTerm) {
      const query = searchTerm.toLowerCase();
      filtered = filtered.filter(customer =>
        customer.name.toLowerCase().includes(query) ||
        customer.email?.toLowerCase().includes(query) ||
        customer.phone?.includes(query) ||
        customer.cvr?.includes(query) ||
        customer.contactPerson?.toLowerCase().includes(query) ||
        customer.addresses.some(addr => 
          addr.street.toLowerCase().includes(query) ||
          addr.city.toLowerCase().includes(query) ||
          addr.postalCode.includes(query)
        )
      );
    }

    // Status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(customer => {
        if (filterStatus === 'active') return customer.isActive;
        if (filterStatus === 'inactive') return !customer.isActive;
        return true;
      });
    }

    setFilteredCustomers(filtered);
  }, [searchTerm, customers, filterStatus]);

  const handleCreateCustomer = (customerData: any) => {
    const newCustomer: Customer = {
      id: Date.now().toString(),
      ...customerData,
      isActive: true,
      totalTasks: 0,
      createdAt: new Date().toISOString(),
      addresses: customerData.addresses || []
    };

    setCustomers([...customers, newCustomer]);
    setShowCreateModal(false);
  };

  const handleEditCustomer = (customerData: any) => {
    if (!selectedCustomer) return;

    setCustomers(customers.map(customer => 
      customer.id === selectedCustomer.id ? { ...customer, ...customerData } : customer
    ));
    setShowEditModal(false);
    setSelectedCustomer(null);
  };

  const handleDeleteCustomer = (id: string) => {
    if (window.confirm('Er du sikker på, at du vil slette denne kunde?')) {
      setCustomers(customers.filter(customer => customer.id !== id));
    }
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
            <h1 className="text-2xl font-bold text-gray-900">Kunder</h1>
            <p className="text-gray-600 mt-1">Administrer dine kunder og deres adresser</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors shadow-sm"
          >
            <Plus className="h-4 w-4 mr-2" />
            Ny kunde
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
              placeholder="Søg efter navn, email, telefon, CVR eller adresse..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-gray-400" />
              <select
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="all">Alle kunder</option>
                <option value="active">Aktive</option>
                <option value="inactive">Inaktive</option>
              </select>
            </div>

            <div className="ml-auto text-sm text-gray-500">
              Viser {filteredCustomers.length} af {customers.length} kunder
            </div>
          </div>
        </div>
      </div>

      {/* Customer Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-blue-100">
              <Building className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <div className="text-2xl font-bold text-gray-900">{customers.length}</div>
              <div className="text-sm text-gray-600">Samlede kunder</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-green-100">
              <Building className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <div className="text-2xl font-bold text-gray-900">
                {customers.filter(c => c.isActive).length}
              </div>
              <div className="text-sm text-gray-600">Aktive kunder</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-orange-100">
              <MapPin className="h-6 w-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <div className="text-2xl font-bold text-gray-900">
                {customers.reduce((sum, c) => sum + c.addresses.length, 0)}
              </div>
              <div className="text-sm text-gray-600">Adresser</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-purple-100">
              <Building className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <div className="text-2xl font-bold text-gray-900">
                {customers.reduce((sum, c) => sum + c.totalTasks, 0)}
              </div>
              <div className="text-sm text-gray-600">Samlede opgaver</div>
            </div>
          </div>
        </div>
      </div>

      {/* Customers Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3">
        {filteredCustomers.map((customer) => (
          <div key={customer.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center">
                <div className="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center">
                  <Building className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-3">
                  <h3 className="text-lg font-medium text-gray-900">{customer.name}</h3>
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                    customer.isActive
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {customer.isActive ? 'Aktiv' : 'Inaktiv'}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="space-y-3 mb-4">
              {customer.contactPerson && (
                <div className="flex items-center text-sm text-gray-600">
                  <span className="font-medium">Kontakt:</span>
                  <span className="ml-2">{customer.contactPerson}</span>
                </div>
              )}
              
              {customer.email && (
                <div className="flex items-center text-sm text-gray-600">
                  <Mail className="h-4 w-4 mr-2 text-gray-400" />
                  <span>{customer.email}</span>
                </div>
              )}
              
              {customer.phone && (
                <div className="flex items-center text-sm text-gray-600">
                  <Phone className="h-4 w-4 mr-2 text-gray-400" />
                  <span>{customer.phone}</span>
                </div>
              )}
              
              {customer.cvr && (
                <div className="flex items-center text-sm text-gray-600">
                  <Building className="h-4 w-4 mr-2 text-gray-400" />
                  <span>CVR: {customer.cvr}</span>
                </div>
              )}

              <div className="flex items-center text-sm text-gray-600">
                <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                <span>{customer.addresses.length} adresse{customer.addresses.length !== 1 ? 'r' : ''}</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
              <div className="text-sm text-gray-500">
                <span className="font-medium text-gray-900">{customer.totalTasks}</span> opgaver
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => {
                    setSelectedCustomer(customer);
                    setShowDetailModal(true);
                  }}
                  className="p-1 text-gray-400 hover:text-gray-600 rounded"
                  title="Se detaljer"
                >
                  <Eye className="h-4 w-4" />
                </button>
                <button
                  onClick={() => {
                    setSelectedCustomer(customer);
                    setShowEditModal(true);
                  }}
                  className="p-1 text-gray-400 hover:text-gray-600 rounded"
                  title="Rediger kunde"
                >
                  <Edit className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDeleteCustomer(customer.id)}
                  className="p-1 text-red-400 hover:text-red-600 rounded"
                  title="Slet kunde"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredCustomers.length === 0 && (
        <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-200">
          <Building className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Ingen kunder fundet</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm || filterStatus !== 'all'
              ? 'Prøv at justere dine søgekriterier'
              : 'Opret din første kunde for at komme i gang'}
          </p>
        </div>
      )}

      {/* Modals */}
      {showCreateModal && (
        <CustomerFormModal 
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreateCustomer}
          title="Opret ny kunde"
        />
      )}

      {showEditModal && selectedCustomer && (
        <CustomerFormModal 
          onClose={() => {
            setShowEditModal(false);
            setSelectedCustomer(null);
          }}
          onSubmit={handleEditCustomer}
          title="Rediger kunde"
          customer={selectedCustomer}
        />
      )}

      {showDetailModal && selectedCustomer && (
        <CustomerDetailModal
          customer={selectedCustomer}
          onClose={() => {
            setShowDetailModal(false);
            setSelectedCustomer(null);
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

// Customer Form Modal (Create/Edit)
function CustomerFormModal({ 
  onClose, 
  onSubmit, 
  title,
  customer
}: { 
  onClose: () => void; 
  onSubmit: (data: any) => void;
  title: string;
  customer?: Customer;
}) {
  const [formData, setFormData] = useState({
    name: customer?.name || '',
    cvr: customer?.cvr || '',
    email: customer?.email || '',
    phone: customer?.phone || '',
    contactPerson: customer?.contactPerson || '',
    notes: customer?.notes || '',
    addresses: customer?.addresses || [
      {
        id: '',
        type: 'Hovedadresse',
        street: '',
        postalCode: '',
        city: '',
        contactPerson: '',
        phone: '',
        email: '',
        notes: '',
        isActive: true
      }
    ]
  });

  const [showCVRLookup, setShowCVRLookup] = useState(false);

  const handleCVRDataFound = (cvrData: any) => {
    setFormData(prev => ({
      ...prev,
      name: cvrData.name,
      cvr: prev.cvr,
      email: cvrData.email || prev.email,
      phone: cvrData.phone || prev.phone,
      addresses: prev.addresses.map((addr, index) => 
        index === 0 ? {
          ...addr,
          street: cvrData.address,
          postalCode: cvrData.postalCode,
          city: cvrData.city
        } : addr
      )
    }));
    setShowCVRLookup(false);
  };

  const handleAddressSelected = (addressData: any, addressIndex: number) => {
    setFormData(prev => ({
      ...prev,
      addresses: prev.addresses.map((addr, index) => 
        index === addressIndex ? {
          ...addr,
          street: addressData.street,
          postalCode: addressData.postalCode,
          city: addressData.city
        } : addr
      )
    }));
  };

  const addAddress = () => {
    setFormData(prev => ({
      ...prev,
      addresses: [...prev.addresses, {
        id: '',
        type: 'Filial',
        street: '',
        postalCode: '',
        city: '',
        contactPerson: '',
        phone: '',
        email: '',
        notes: '',
        isActive: true
      }]
    }));
  };

  const removeAddress = (index: number) => {
    if (formData.addresses.length > 1) {
      setFormData(prev => ({
        ...prev,
        addresses: prev.addresses.filter((_, i) => i !== index)
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose}></div>

        <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>

        <div className="inline-block align-bottom bg-white rounded-xl px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full sm:p-6">
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
            <div>
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-md font-medium text-gray-900">Grundoplysninger</h4>
                <button
                  type="button"
                  onClick={() => setShowCVRLookup(true)}
                  className="text-sm text-blue-600 hover:text-blue-700"
                >
                  CVR opslag
                </button>
              </div>

              {showCVRLookup ? (
                <div className="border border-gray-200 rounded-lg p-4 mb-4">
                  <SmartCVRLookup
                    onDataFound={handleCVRDataFound}
                    initialCVR={formData.cvr}
                  />
                  <button
                    type="button"
                    onClick={() => setShowCVRLookup(false)}
                    className="mt-2 text-sm text-gray-500 hover:text-gray-700"
                  >
                    Annuller CVR opslag
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Firmanavn *</label>
                    <input
                      type="text"
                      required
                      className="block w-full px-4 py-3 rounded-lg border border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Firmanavn"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">CVR-nummer</label>
                    <input
                      type="text"
                      className="block w-full px-4 py-3 rounded-lg border border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                      value={formData.cvr}
                      onChange={(e) => setFormData({ ...formData, cvr: e.target.value })}
                      placeholder="12345678"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Contact Info */}
            <div>
              <h4 className="text-md font-medium text-gray-900 mb-4">Kontaktoplysninger</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Kontaktperson</label>
                  <input
                    type="text"
                    className="block w-full px-4 py-3 rounded-lg border border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                    value={formData.contactPerson}
                    onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                    placeholder="Fornavn Efternavn"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    className="block w-full px-4 py-3 rounded-lg border border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="email@eksempel.dk"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Telefon</label>
                  <input
                    type="tel"
                    className="block w-full px-4 py-3 rounded-lg border border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+45 12 34 56 78"
                  />
                </div>
              </div>
            </div>

            {/* Addresses */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-md font-medium text-gray-900">Adresser</h4>
                <button
                  type="button"
                  onClick={addAddress}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Tilføj adresse
                </button>
              </div>

              <div className="space-y-6">
                {formData.addresses.map((address, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h5 className="text-sm font-medium text-gray-900">
                        Adresse {index + 1}
                      </h5>
                      {formData.addresses.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeAddress(index)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                        <select
                          className="block w-full px-4 py-3 rounded-lg border border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                          value={address.type}
                          onChange={(e) => {
                            const newAddresses = [...formData.addresses];
                            newAddresses[index].type = e.target.value;
                            setFormData({ ...formData, addresses: newAddresses });
                          }}
                        >
                          <option value="Hovedadresse">Hovedadresse</option>
                          <option value="Filial">Filial</option>
                          <option value="Lager">Lager</option>
                          <option value="Kontor">Kontor</option>
                          <option value="Andet">Andet</option>
                        </select>
                      </div>
                    </div>

                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Adresse</label>
                      <SmartAddressLookup
                        onAddressSelected={(addressData) => handleAddressSelected(addressData, index)}
                        placeholder="Søg efter adresse..."
                        initialValue={`${address.street}, ${address.postalCode} ${address.city}`.trim().replace(/^,\s*/, '')}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Kontaktperson</label>
                        <input
                          type="text"
                          className="block w-full px-4 py-3 rounded-lg border border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                          value={address.contactPerson}
                          onChange={(e) => {
                            const newAddresses = [...formData.addresses];
                            newAddresses[index].contactPerson = e.target.value;
                            setFormData({ ...formData, addresses: newAddresses });
                          }}
                          placeholder="Kontaktperson for denne adresse"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Telefon</label>
                        <input
                          type="tel"
                          className="block w-full px-4 py-3 rounded-lg border border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                          value={address.phone}
                          onChange={(e) => {
                            const newAddresses = [...formData.addresses];
                            newAddresses[index].phone = e.target.value;
                            setFormData({ ...formData, addresses: newAddresses });
                          }}
                          placeholder="+45 12 34 56 78"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <input
                          type="email"
                          className="block w-full px-4 py-3 rounded-lg border border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                          value={address.email}
                          onChange={(e) => {
                            const newAddresses = [...formData.addresses];
                            newAddresses[index].email = e.target.value;
                            setFormData({ ...formData, addresses: newAddresses });
                          }}
                          placeholder="email@eksempel.dk"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Noter
              </label>
              <textarea
                rows={3}
                className="block w-full px-4 py-3 rounded-lg border border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Særlige instruktioner eller noter om kunden..."
              />
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
                {customer ? 'Gem ændringer' : 'Opret kunde'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

// Customer Detail Modal
function CustomerDetailModal({ 
  customer, 
  onClose, 
  onEdit 
}: { 
  customer: Customer; 
  onClose: () => void; 
  onEdit: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose}></div>

        <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>

        <div className="inline-block align-bottom bg-white rounded-xl px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full sm:p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <div className="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center mr-4">
                <Building className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-xl font-medium text-gray-900">{customer.name}</h3>
                <div className="flex items-center space-x-3 mt-1">
                  <span className="text-sm text-gray-500">
                    Kunde siden {new Date(customer.createdAt).toLocaleDateString('da-DK')}
                  </span>
                  {customer.cvr && (
                    <span className="text-sm text-gray-500">CVR: {customer.cvr}</span>
                  )}
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
                  {customer.contactPerson && (
                    <div className="flex items-center">
                      <span className="text-sm font-medium text-gray-700 w-24">Kontakt:</span>
                      <span className="text-sm text-gray-900">{customer.contactPerson}</span>
                    </div>
                  )}
                  
                  {customer.email && (
                    <div className="flex items-center">
                      <Mail className="h-5 w-5 text-gray-400 mr-3" />
                      <span className="text-sm text-gray-900">{customer.email}</span>
                      <a
                        href={`mailto:${customer.email}`}
                        className="ml-auto text-blue-600 hover:text-blue-700 text-sm"
                      >
                        Send email
                      </a>
                    </div>
                  )}
                  
                  {customer.phone && (
                    <div className="flex items-center">
                      <Phone className="h-5 w-5 text-gray-400 mr-3" />
                      <span className="text-sm text-gray-900">{customer.phone}</span>
                      <a
                        href={`tel:${customer.phone}`}
                        className="ml-auto text-blue-600 hover:text-blue-700 text-sm"
                      >
                        Ring op
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {/* Addresses */}
              <div>
                <h4 className="text-lg font-medium text-gray-900 mb-4">Adresser</h4>
                <div className="space-y-4">
                  {customer.addresses.map((address, index) => (
                    <div key={address.id || index} className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h5 className="text-sm font-medium text-gray-900">{address.type}</h5>
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          address.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {address.isActive ? 'Aktiv' : 'Inaktiv'}
                        </span>
                      </div>
                      
                      <div className="text-sm text-gray-600 mb-2">
                        <div className="flex items-start">
                          <MapPin className="h-4 w-4 mr-2 mt-0.5 text-gray-400" />
                          <span>{address.street}, {address.postalCode} {address.city}</span>
                        </div>
                      </div>
                      
                      {(address.contactPerson || address.phone || address.email) && (
                        <div className="text-sm text-gray-600 space-y-1">
                          {address.contactPerson && (
                            <div>Kontakt: {address.contactPerson}</div>
                          )}
                          {address.phone && (
                            <div>Telefon: {address.phone}</div>
                          )}
                          {address.email && (
                            <div>Email: {address.email}</div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Notes */}
              {customer.notes && (
                <div>
                  <h4 className="text-lg font-medium text-gray-900 mb-4">Noter</h4>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-700">{customer.notes}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Statistics */}
              <div>
                <h4 className="text-lg font-medium text-gray-900 mb-4">Statistik</h4>
                <div className="bg-gray-50 rounded-lg p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Samlede opgaver</span>
                    <span className="text-sm font-medium text-gray-900">{customer.totalTasks}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Adresser</span>
                    <span className="text-sm font-medium text-gray-900">{customer.addresses.length}</span>
                  </div>
                  
                  {customer.lastTaskDate && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Sidste opgave</span>
                      <span className="text-sm font-medium text-gray-900">
                        {new Date(customer.lastTaskDate).toLocaleDateString('da-DK')}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Quick Actions */}
              <div>
                <h4 className="text-lg font-medium text-gray-900 mb-4">Handlinger</h4>
                <div className="space-y-2">
                  <button className="w-full flex items-center px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors">
                    <Plus className="h-4 w-4 mr-2" />
                    Opret opgave
                  </button>
                  
                  <button className="w-full flex items-center px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors">
                    <Building className="h-4 w-4 mr-2" />
                    Se opgaver
                  </button>
                  
                  <button className="w-full flex items-center px-3 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors">
                    <Mail className="h-4 w-4 mr-2" />
                    Send email
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