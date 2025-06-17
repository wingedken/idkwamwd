import React, { useState } from 'react';
import { Plus, Search, Building, MapPin, Phone, Mail, Edit, Eye, Trash2 } from 'lucide-react';
import SmartCVRLookup from '../../components/smart/SmartCVRLookup';
import SmartAddressLookup from '../../components/smart/SmartAddressLookup';

interface Customer {
  id: string;
  name: string;
  cvr?: string;
  email?: string;
  phone?: string;
  contactPerson?: string;
  addresses: CustomerAddress[];
  isActive: boolean;
  createdAt: string;
}

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

// Mock data
const mockCustomers: Customer[] = [
  {
    id: '1',
    name: 'Netto Supermarked',
    cvr: '12345678',
    email: 'kontakt@netto.dk',
    phone: '+45 70 12 34 56',
    contactPerson: 'Karen Jensen',
    isActive: true,
    createdAt: '2024-01-15',
    addresses: [
      {
        id: '1',
        type: 'Hovedadresse',
        street: 'Hovedgade 123',
        postalCode: '2000',
        city: 'Frederiksberg',
        contactPerson: 'Karen Jensen',
        phone: '+45 70 12 34 56',
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
    isActive: true,
    createdAt: '2024-01-10',
    addresses: [
      {
        id: '2',
        type: 'Hovedkontor',
        street: 'Erhvervsvej 45',
        postalCode: '2100',
        city: 'København Ø',
        contactPerson: 'Lars Andersen',
        phone: '+45 80 12 34 56',
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
        isActive: true
      }
    ]
  }
];

export default function CustomerManagement() {
  const [customers, setCustomers] = useState<Customer[]>(mockCustomers);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.cvr?.includes(searchTerm) ||
    customer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.contactPerson?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateCustomer = (customerData: any) => {
    const newCustomer: Customer = {
      id: Date.now().toString(),
      ...customerData,
      isActive: true,
      createdAt: new Date().toISOString().split('T')[0],
      addresses: customerData.addresses || []
    };

    setCustomers([...customers, newCustomer]);
    setShowCreateModal(false);
  };

  const handleDeleteCustomer = (id: string) => {
    if (window.confirm('Er du sikker på, at du vil slette denne kunde?')) {
      setCustomers(customers.filter(customer => customer.id !== id));
    }
  };

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

        {/* Search */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Søg efter navn, CVR, email eller kontaktperson..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
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
                  {customer.cvr && (
                    <p className="text-sm text-gray-500">CVR: {customer.cvr}</p>
                  )}
                </div>
              </div>
            </div>
            
            <div className="space-y-3 mb-4">
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
              
              {customer.contactPerson && (
                <div className="flex items-center text-sm text-gray-600">
                  <span className="font-medium">Kontakt: {customer.contactPerson}</span>
                </div>
              )}
              
              <div className="flex items-center text-sm text-gray-600">
                <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                <span>{customer.addresses.length} adresse{customer.addresses.length !== 1 ? 'r' : ''}</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
              <div className="text-sm text-gray-500">
                Oprettet: {new Date(customer.createdAt).toLocaleDateString('da-DK')}
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => {
                    setSelectedCustomer(customer);
                    setShowDetailModal(true);
                  }}
                  className="text-gray-600 hover:text-gray-900 p-1 rounded"
                  title="Se detaljer"
                >
                  <Eye className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDeleteCustomer(customer.id)}
                  className="text-red-600 hover:text-red-900 p-1 rounded"
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
            {searchTerm 
              ? 'Prøv at justere dine søgekriterier'
              : 'Opret din første kunde for at komme i gang'}
          </p>
        </div>
      )}

      {/* Create Customer Modal */}
      {showCreateModal && (
        <CreateCustomerModal 
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreateCustomer}
        />
      )}

      {/* Customer Detail Modal */}
      {showDetailModal && selectedCustomer && (
        <CustomerDetailModal
          customer={selectedCustomer}
          onClose={() => {
            setShowDetailModal(false);
            setSelectedCustomer(null);
          }}
        />
      )}
    </div>
  );
}

// Create Customer Modal
function CreateCustomerModal({ 
  onClose, 
  onSubmit 
}: { 
  onClose: () => void; 
  onSubmit: (data: any) => void;
}) {
  const [formData, setFormData] = useState({
    name: '',
    cvr: '',
    email: '',
    phone: '',
    contactPerson: '',
    addresses: [
      {
        type: 'Hovedadresse',
        street: '',
        postalCode: '',
        city: '',
        contactPerson: '',
        phone: '',
        email: '',
        notes: ''
      }
    ]
  });

  const handleCVRData = (cvrData: any) => {
    setFormData(prev => ({
      ...prev,
      name: cvrData.name,
      phone: cvrData.phone || prev.phone,
      email: cvrData.email || prev.email,
      addresses: [{
        ...prev.addresses[0],
        street: cvrData.address,
        postalCode: cvrData.postalCode,
        city: cvrData.city
      }]
    }));
  };

  const handleAddressSelected = (addressData: any) => {
    setFormData(prev => ({
      ...prev,
      addresses: [{
        ...prev.addresses[0],
        street: addressData.street,
        postalCode: addressData.postalCode,
        city: addressData.city
      }]
    }));
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

        <div className="inline-block align-bottom bg-white rounded-xl px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full sm:p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-medium text-gray-900">Opret ny kunde</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* CVR Lookup */}
            <div>
              <SmartCVRLookup 
                onDataFound={handleCVRData}
                initialCVR={formData.cvr}
              />
            </div>

            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Virksomhedsnavn *</label>
                <input
                  type="text"
                  required
                  className="block w-full px-4 py-3 rounded-lg border border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Kontaktperson</label>
                <input
                  type="text"
                  className="block w-full px-4 py-3 rounded-lg border border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  value={formData.contactPerson}
                  onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                />
              </div>
            </div>

            {/* Contact Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  className="block w-full px-4 py-3 rounded-lg border border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Telefon</label>
                <input
                  type="tel"
                  className="block w-full px-4 py-3 rounded-lg border border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
            </div>

            {/* Address */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Adresse</label>
              <SmartAddressLookup
                onAddressSelected={handleAddressSelected}
                placeholder="Søg efter adresse..."
                initialValue={`${formData.addresses[0].street} ${formData.addresses[0].postalCode} ${formData.addresses[0].city}`.trim()}
              />
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Annuller
              </button>
              <button
                type="submit"
                className="px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
              >
                Opret kunde
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
  onClose 
}: { 
  customer: Customer; 
  onClose: () => void;
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
                {customer.cvr && (
                  <p className="text-sm text-gray-500">CVR: {customer.cvr}</p>
                )}
              </div>
            </div>
            
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Contact Information */}
            <div>
              <h4 className="text-lg font-medium text-gray-900 mb-4">Kontaktoplysninger</h4>
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                {customer.email && (
                  <div className="flex items-center">
                    <Mail className="h-5 w-5 text-gray-400 mr-3" />
                    <span className="text-sm text-gray-900">{customer.email}</span>
                  </div>
                )}
                
                {customer.phone && (
                  <div className="flex items-center">
                    <Phone className="h-5 w-5 text-gray-400 mr-3" />
                    <span className="text-sm text-gray-900">{customer.phone}</span>
                  </div>
                )}
                
                {customer.contactPerson && (
                  <div className="flex items-center">
                    <span className="text-sm text-gray-900">
                      <strong>Kontaktperson:</strong> {customer.contactPerson}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Addresses */}
            <div>
              <h4 className="text-lg font-medium text-gray-900 mb-4">Adresser</h4>
              <div className="space-y-4">
                {customer.addresses.map((address) => (
                  <div key={address.id} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h5 className="text-sm font-medium text-gray-900">{address.type}</h5>
                    </div>
                    
                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                        <span>{address.street}, {address.postalCode} {address.city}</span>
                      </div>
                      
                      {address.contactPerson && (
                        <div>
                          <strong>Kontakt:</strong> {address.contactPerson}
                        </div>
                      )}
                      
                      {address.phone && (
                        <div className="flex items-center">
                          <Phone className="h-4 w-4 mr-2 text-gray-400" />
                          <span>{address.phone}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}