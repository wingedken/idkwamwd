import React, { useState, useEffect } from 'react';
import { Plus, Search, Building, User, Phone, Mail, MapPin, Edit, Eye, MessageCircle, Calendar, X, Hash, Building2, Home, Star } from 'lucide-react';
import SmartCVRLookup from '../../components/smart/SmartCVRLookup';
import SmartAddressLookup from '../../components/smart/SmartAddressLookup';

interface CustomerAddress {
  id: string;
  type: 'main' | 'billing' | 'service';
  name: string; // "Hovedkontor", "Afdeling Syd", etc.
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
  customerNumber: string;
  name: string;
  cvr?: string;
  email: string;
  phone: string;
  contactPerson?: string;
  customerType: 'Privat' | 'Erhverv';
  preferredContact: 'phone' | 'email' | 'sms';
  notes?: string;
  isActive: boolean;
  totalTasks: number;
  lastService: string;
  lastContact?: string;
  createdAt: string;
  updatedAt: string;
  addresses: CustomerAddress[];
  primaryAddressId?: string; // Reference to main address
}

const mockCustomers: Customer[] = [
  {
    id: '1',
    customerNumber: '#1043',
    name: 'Netto Supermarked A/S',
    cvr: '12345678',
    email: 'kontakt@netto.dk',
    phone: '+45 70 12 34 56',
    contactPerson: 'Karen Jensen',
    customerType: 'Erhverv',
    preferredContact: 'email',
    notes: 'Stor butikskæde med flere lokationer. Kontakt Karen for koordinering.',
    isActive: true,
    totalTasks: 24,
    lastService: '2024-01-20',
    lastContact: '2024-01-18',
    createdAt: '2023-06-15',
    updatedAt: '2024-01-20',
    primaryAddressId: 'addr-1-1',
    addresses: [
      {
        id: 'addr-1-1',
        type: 'main',
        name: 'Hovedkontor',
        street: 'Hovedgade 123',
        postalCode: '2000',
        city: 'Frederiksberg',
        contactPerson: 'Karen Jensen',
        phone: '+45 70 12 34 56',
        email: 'karen@netto.dk',
        isActive: true
      },
      {
        id: 'addr-1-2',
        type: 'service',
        name: 'Butik Randers',
        street: 'Storegade 45',
        postalCode: '8900',
        city: 'Randers',
        contactPerson: 'Lars Andersen',
        phone: '+45 70 12 34 57',
        notes: 'Ugentlig rengøring, nøgle hos Lars',
        isActive: true
      },
      {
        id: 'addr-1-3',
        type: 'service',
        name: 'Butik Aalborg',
        street: 'Nørregade 78',
        postalCode: '9000',
        city: 'Aalborg',
        contactPerson: 'Mette Nielsen',
        phone: '+45 70 12 34 58',
        notes: 'Månedlig dybderengøring',
        isActive: true
      }
    ]
  },
  {
    id: '2',
    customerNumber: '#1044',
    name: 'Kontorbygning A/S',
    cvr: '87654321',
    email: 'facility@kontorbygning.dk',
    phone: '+45 80 12 34 56',
    contactPerson: 'Lars Andersen',
    customerType: 'Erhverv',
    preferredContact: 'phone',
    notes: 'Ejendomsselskab med flere kontorbygninger.',
    isActive: true,
    totalTasks: 18,
    lastService: '2024-01-18',
    lastContact: '2024-01-15',
    createdAt: '2023-08-22',
    updatedAt: '2024-01-18',
    primaryAddressId: 'addr-2-1',
    addresses: [
      {
        id: 'addr-2-1',
        type: 'main',
        name: 'Hovedkontor',
        street: 'Erhvervsvej 45',
        postalCode: '2100',
        city: 'København Ø',
        contactPerson: 'Lars Andersen',
        phone: '+45 80 12 34 56',
        email: 'lars@kontorbygning.dk',
        isActive: true
      },
      {
        id: 'addr-2-2',
        type: 'service',
        name: 'Bygning Nord',
        street: 'Kongensgade 12',
        postalCode: '2200',
        city: 'København N',
        contactPerson: 'Susanne Møller',
        phone: '+45 80 12 34 60',
        notes: 'Vinduespolering hver 14. dag',
        isActive: true
      }
    ]
  },
  {
    id: '3',
    customerNumber: '#1045',
    name: 'Jens Hansen',
    email: 'jens.hansen@email.dk',
    phone: '+45 20 12 34 56',
    customerType: 'Privat',
    preferredContact: 'sms',
    notes: 'Privat kunde - rengøring af villa hver 14. dag.',
    isActive: true,
    totalTasks: 12,
    lastService: '2024-01-19',
    lastContact: '2024-01-17',
    createdAt: '2023-09-10',
    updatedAt: '2024-01-19',
    primaryAddressId: 'addr-3-1',
    addresses: [
      {
        id: 'addr-3-1',
        type: 'main',
        name: 'Privatbolig',
        street: 'Byvej 78',
        postalCode: '2200',
        city: 'København N',
        isActive: true
      }
    ]
  }
];

export default function CustomerManagement() {
  const [customers, setCustomers] = useState(mockCustomers);
  const [filteredCustomers, setFilteredCustomers] = useState(mockCustomers);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState<CustomerAddress | null>(null);
  const [filterType, setFilterType] = useState<'all' | 'Privat' | 'Erhverv'>('all');

  // Lynhurtig søgning
  useEffect(() => {
    let filtered = customers;

    // Søgning
    if (searchTerm) {
      const query = searchTerm.toLowerCase();
      filtered = filtered.filter(customer =>
        customer.name.toLowerCase().includes(query) ||
        customer.customerNumber.toLowerCase().includes(query) ||
        customer.email.toLowerCase().includes(query) ||
        customer.phone.includes(searchTerm) ||
        customer.cvr?.includes(searchTerm) ||
        customer.contactPerson?.toLowerCase().includes(query) ||
        customer.addresses.some(addr => 
          addr.street.toLowerCase().includes(query) ||
          addr.city.toLowerCase().includes(query) ||
          addr.postalCode.includes(searchTerm) ||
          addr.name.toLowerCase().includes(query)
        )
      );
    }

    // Filtrering efter type
    if (filterType !== 'all') {
      filtered = filtered.filter(customer => customer.customerType === filterType);
    }

    setFilteredCustomers(filtered);
  }, [searchTerm, customers, filterType]);

  const handleCreateCustomer = (customerData: any) => {
    const newCustomer: Customer = {
      id: Date.now().toString(),
      customerNumber: `#${(1047 + customers.length).toString()}`,
      ...customerData,
      customerType: customerData.cvr ? 'Erhverv' : 'Privat',
      isActive: true,
      totalTasks: 0,
      lastService: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      addresses: customerData.addresses || [],
      primaryAddressId: customerData.addresses?.[0]?.id
    };

    setCustomers([...customers, newCustomer]);
    setShowCreateModal(false);
  };

  const handleEditCustomer = (customerData: any) => {
    setCustomers(customers.map(customer => 
      customer.id === selectedCustomer?.id 
        ? { 
            ...customer, 
            ...customerData,
            customerType: customerData.cvr ? 'Erhverv' : 'Privat',
            updatedAt: new Date().toISOString()
          }
        : customer
    ));
    setShowEditModal(false);
    setSelectedCustomer(null);
  };

  const handleAddAddress = (addressData: any) => {
    if (!selectedCustomer) return;

    const newAddress: CustomerAddress = {
      id: `addr-${selectedCustomer.id}-${Date.now()}`,
      ...addressData,
      isActive: true
    };

    const updatedCustomer = {
      ...selectedCustomer,
      addresses: [...selectedCustomer.addresses, newAddress],
      primaryAddressId: selectedCustomer.primaryAddressId || newAddress.id
    };

    setCustomers(customers.map(c => 
      c.id === selectedCustomer.id ? updatedCustomer : c
    ));

    setSelectedCustomer(updatedCustomer);
    setShowAddressModal(false);
  };

  const handleEditAddress = (addressData: any) => {
    if (!selectedCustomer || !selectedAddress) return;

    const updatedCustomer = {
      ...selectedCustomer,
      addresses: selectedCustomer.addresses.map(addr =>
        addr.id === selectedAddress.id ? { ...addr, ...addressData } : addr
      )
    };

    setCustomers(customers.map(c => 
      c.id === selectedCustomer.id ? updatedCustomer : c
    ));

    setSelectedCustomer(updatedCustomer);
    setSelectedAddress(null);
    setShowAddressModal(false);
  };

  const handleDeleteAddress = (addressId: string) => {
    if (!selectedCustomer) return;
    
    if (selectedCustomer.addresses.length <= 1) {
      alert('En kunde skal have mindst én adresse');
      return;
    }

    if (window.confirm('Er du sikker på, at du vil slette denne adresse?')) {
      const updatedCustomer = {
        ...selectedCustomer,
        addresses: selectedCustomer.addresses.filter(addr => addr.id !== addressId),
        primaryAddressId: selectedCustomer.primaryAddressId === addressId 
          ? selectedCustomer.addresses.find(addr => addr.id !== addressId)?.id 
          : selectedCustomer.primaryAddressId
      };

      setCustomers(customers.map(c => 
        c.id === selectedCustomer.id ? updatedCustomer : c
      ));

      setSelectedCustomer(updatedCustomer);
    }
  };

  const handleSetPrimaryAddress = (addressId: string) => {
    if (!selectedCustomer) return;

    const updatedCustomer = {
      ...selectedCustomer,
      primaryAddressId: addressId
    };

    setCustomers(customers.map(c => 
      c.id === selectedCustomer.id ? updatedCustomer : c
    ));

    setSelectedCustomer(updatedCustomer);
  };

  const handleCustomerClick = (customer: Customer) => {
    setSelectedCustomer(customer);
    setShowDetailModal(true);
  };

  const handleContactCustomer = (customer: Customer, method: 'phone' | 'email' | 'sms') => {
    // Opdater sidste kontakt
    setCustomers(customers.map(c => 
      c.id === customer.id 
        ? { ...c, lastContact: new Date().toISOString().split('T')[0] }
        : c
    ));

    // Simuler kontakt
    switch (method) {
      case 'phone':
        window.open(`tel:${customer.phone}`);
        break;
      case 'email':
        window.open(`mailto:${customer.email}`);
        break;
      case 'sms':
        window.open(`sms:${customer.phone}`);
        break;
    }
  };

  const getCustomerTypeColor = (type: string) => {
    return type === 'Erhverv' 
      ? 'bg-blue-100 text-blue-800' 
      : 'bg-green-100 text-green-800';
  };

  const getPreferredContactIcon = (method: string) => {
    switch (method) {
      case 'phone': return Phone;
      case 'email': return Mail;
      case 'sms': return MessageCircle;
      default: return Phone;
    }
  };

  const getAddressTypeIcon = (type: string) => {
    switch (type) {
      case 'main': return Building2;
      case 'billing': return Hash;
      case 'service': return MapPin;
      default: return MapPin;
    }
  };

  const getAddressTypeText = (type: string) => {
    switch (type) {
      case 'main': return 'Hovedadresse';
      case 'billing': return 'Faktureringsadresse';
      case 'service': return 'Serviceadresse';
      default: return type;
    }
  };

  const getPrimaryAddress = (customer: Customer) => {
    return customer.addresses.find(addr => addr.id === customer.primaryAddressId) || customer.addresses[0];
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Kunder</h1>
            <p className="text-gray-600 mt-1">Professionelt kundekartotek med flere adresser per kunde</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors shadow-sm"
          >
            <Plus className="h-4 w-4 mr-2" />
            Opret kunde
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
              placeholder="Søg på navn, kundenummer, CVR, telefon, email, adresse eller lokationsnavn..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Filters */}
          <div className="flex items-center space-x-4">
            <select
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as any)}
            >
              <option value="all">Alle typer</option>
              <option value="Erhverv">Erhverv</option>
              <option value="Privat">Privat</option>
            </select>

            <div className="ml-auto text-sm text-gray-500">
              Viser {filteredCustomers.length} af {customers.length} kunder
            </div>
          </div>
        </div>
      </div>

      {/* Customer Performance Summary */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-6">Kundeoversigt</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-900">
              {customers.filter(c => c.customerType === 'Erhverv').length}
            </div>
            <div className="text-sm text-gray-500 mt-1">Erhvervskunder</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-900">
              {customers.filter(c => c.customerType === 'Privat').length}
            </div>
            <div className="text-sm text-gray-500 mt-1">Private kunder</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-900">
              {customers.reduce((sum, c) => sum + c.addresses.length, 0)}
            </div>
            <div className="text-sm text-gray-500 mt-1">Serviceadresser</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-900">
              {customers.reduce((sum, c) => sum + c.totalTasks, 0)}
            </div>
            <div className="text-sm text-gray-500 mt-1">Opgaver i alt</div>
          </div>
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Kunde
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Kontakt
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Hovedadresse
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Adresser
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Opgaver
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Handlinger
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredCustomers.map((customer) => {
                const PreferredIcon = getPreferredContactIcon(customer.preferredContact);
                const primaryAddress = getPrimaryAddress(customer);
                
                return (
                  <tr 
                    key={customer.id} 
                    className="hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => handleCustomerClick(customer)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                            {customer.customerType === 'Erhverv' ? (
                              <Building className="h-5 w-5 text-blue-600" />
                            ) : (
                              <User className="h-5 w-5 text-blue-600" />
                            )}
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="flex items-center">
                            <div className="text-sm font-medium text-gray-900">{customer.name}</div>
                            <span className="ml-2 text-xs text-gray-500">{customer.customerNumber}</span>
                          </div>
                          {customer.contactPerson && (
                            <div className="text-sm text-gray-500">Kontakt: {customer.contactPerson}</div>
                          )}
                          {customer.cvr && (
                            <div className="text-xs text-gray-400">CVR: {customer.cvr}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="space-y-1">
                        <div className="flex items-center text-sm text-gray-900">
                          <Mail className="h-4 w-4 mr-2 text-gray-400" />
                          {customer.email}
                        </div>
                        <div className="flex items-center text-sm text-gray-900">
                          <Phone className="h-4 w-4 mr-2 text-gray-400" />
                          {customer.phone}
                        </div>
                        <div className="flex items-center text-xs text-gray-500">
                          <PreferredIcon className="h-3 w-3 mr-1" />
                          Foretrukken kontakt
                        </div>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      {primaryAddress && (
                        <div>
                          <div className="text-sm text-gray-900">{primaryAddress.street}</div>
                          <div className="text-sm text-gray-500">{primaryAddress.postalCode} {primaryAddress.city}</div>
                          {primaryAddress.name !== 'Privatbolig' && (
                            <div className="text-xs text-gray-400">{primaryAddress.name}</div>
                          )}
                        </div>
                      )}
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className="text-sm font-medium text-gray-900">{customer.addresses.length}</span>
                        <span className="ml-1 text-sm text-gray-500">
                          {customer.addresses.length === 1 ? 'adresse' : 'adresser'}
                        </span>
                        {customer.addresses.length > 1 && (
                          <span className="ml-2 inline-flex px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                            Flere lokationer
                          </span>
                        )}
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getCustomerTypeColor(customer.customerType)}`}>
                        {customer.customerType}
                      </span>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{customer.totalTasks}</div>
                      {customer.lastService && (
                        <div className="text-xs text-gray-500">
                          Sidst: {new Date(customer.lastService).toLocaleDateString('da-DK')}
                        </div>
                      )}
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleContactCustomer(customer, customer.preferredContact);
                          }}
                          className="text-blue-600 hover:text-blue-900 p-1 rounded"
                          title={`Kontakt via ${customer.preferredContact}`}
                        >
                          <PreferredIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedCustomer(customer);
                            setShowEditModal(true);
                          }}
                          className="text-gray-600 hover:text-gray-900 p-1 rounded"
                          title="Rediger kunde"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCustomerClick(customer);
                          }}
                          className="text-gray-600 hover:text-gray-900 p-1 rounded"
                          title="Se detaljer"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredCustomers.length === 0 && (
          <div className="text-center py-12">
            <Building className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Ingen kunder fundet</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm ? 'Prøv at justere dine søgekriterier' : 'Opret din første kunde for at komme i gang'}
            </p>
          </div>
        )}
      </div>

      {/* Modals */}
      {showCreateModal && (
        <CreateCustomerModal 
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreateCustomer}
        />
      )}

      {showEditModal && selectedCustomer && (
        <EditCustomerModal
          customer={selectedCustomer}
          onClose={() => {
            setShowEditModal(false);
            setSelectedCustomer(null);
          }}
          onSubmit={handleEditCustomer}
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
          onContact={handleContactCustomer}
          onAddAddress={() => {
            setSelectedAddress(null);
            setShowAddressModal(true);
          }}
          onEditAddress={(address) => {
            setSelectedAddress(address);
            setShowAddressModal(true);
          }}
          onDeleteAddress={handleDeleteAddress}
          onSetPrimaryAddress={handleSetPrimaryAddress}
        />
      )}

      {showAddressModal && selectedCustomer && (
        <AddressModal
          customer={selectedCustomer}
          address={selectedAddress}
          onClose={() => {
            setShowAddressModal(false);
            setSelectedAddress(null);
          }}
          onSubmit={selectedAddress ? handleEditAddress : handleAddAddress}
        />
      )}
    </div>
  );
}

// Create Customer Modal
function CreateCustomerModal({ onClose, onSubmit }: { onClose: () => void; onSubmit: (data: any) => void }) {
  const [formData, setFormData] = useState({
    name: '',
    cvr: '',
    email: '',
    phone: '',
    contactPerson: '',
    preferredContact: 'email' as 'phone' | 'email' | 'sms',
    notes: '',
    addresses: [
      {
        id: `addr-new-${Date.now()}`,
        type: 'main' as 'main' | 'billing' | 'service',
        name: 'Hovedadresse',
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

  const handleCVRDataFound = (cvrData: any) => {
    setFormData(prev => ({
      ...prev,
      name: cvrData.name,
      phone: cvrData.phone || prev.phone,
      email: cvrData.email || prev.email,
      addresses: prev.addresses.map((addr, index) => 
        index === 0 ? {
          ...addr,
          street: cvrData.address,
          postalCode: cvrData.postalCode,
          city: cvrData.city,
          name: 'Hovedkontor'
        } : addr
      )
    }));
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose}></div>

        <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>

        <div className="inline-block align-bottom bg-white rounded-xl px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-3xl sm:w-full sm:p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-medium text-gray-900">Opret ny kunde</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 rounded-full p-1 hover:bg-gray-100">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* CVR Lookup */}
            <SmartCVRLookup 
              onDataFound={handleCVRDataFound}
              initialCVR={formData.cvr}
            />

            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {formData.cvr ? 'Firmanavn' : 'Navn'} *
                </label>
                <input
                  type="text"
                  required
                  className="block w-full px-4 py-3 rounded-lg border border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder={formData.cvr ? "Firmanavn" : "Fornavn Efternavn"}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Kontaktperson</label>
                <input
                  type="text"
                  className="block w-full px-4 py-3 rounded-lg border border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                  value={formData.contactPerson}
                  onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                  placeholder="Navn på kontaktperson"
                />
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

            {/* Primary Address */}
            <div className="border border-gray-200 rounded-lg p-4">
              <h4 className="text-md font-medium text-gray-900 mb-4">Hovedadresse</h4>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Adresse *</label>
                  <SmartAddressLookup
                    onAddressSelected={(addressData) => handleAddressSelected(addressData, 0)}
                    placeholder="Indtast adresse for automatisk udfyldning..."
                    initialValue={formData.addresses[0]?.street}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Postnummer *</label>
                    <input
                      type="text"
                      required
                      className="block w-full px-4 py-3 rounded-lg border border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                      value={formData.addresses[0]?.postalCode || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        addresses: formData.addresses.map((addr, index) => 
                          index === 0 ? { ...addr, postalCode: e.target.value } : addr
                        )
                      })}
                      placeholder="1234"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">By *</label>
                    <input
                      type="text"
                      required
                      className="block w-full px-4 py-3 rounded-lg border border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                      value={formData.addresses[0]?.city || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        addresses: formData.addresses.map((addr, index) => 
                          index === 0 ? { ...addr, city: e.target.value } : addr
                        )
                      })}
                      placeholder="By"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Preferred Contact */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Foretrukken kontaktmetode</label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { value: 'phone', label: 'Telefon', icon: Phone },
                  { value: 'email', label: 'Email', icon: Mail },
                  { value: 'sms', label: 'SMS', icon: MessageCircle }
                ].map(({ value, label, icon: Icon }) => (
                  <label key={value} className="relative">
                    <input
                      type="radio"
                      name="preferredContact"
                      value={value}
                      checked={formData.preferredContact === value}
                      onChange={(e) => setFormData({ ...formData, preferredContact: e.target.value as any })}
                      className="sr-only"
                    />
                    <div className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      formData.preferredContact === value
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}>
                      <Icon className="h-5 w-5 mx-auto mb-1" />
                      <div className="text-xs text-center">{label}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Interne noter</label>
              <textarea
                rows={3}
                className="block w-full px-4 py-3 rounded-lg border border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Tilføj noter om kunden..."
              />
            </div>

            {/* Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="text-sm font-medium text-blue-800 mb-2">💡 Flere adresser</h4>
              <div className="text-sm text-blue-700">
                <p>Du kan tilføje flere serviceadresser efter oprettelse af kunden. Dette er perfekt til:</p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>Butikskæder med flere lokationer</li>
                  <li>Ejendomsselskaber med forskellige bygninger</li>
                  <li>Virksomheder med hovedkontor og afdelinger</li>
                </ul>
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                Annuller
              </button>
              <button
                type="submit"
                className="px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
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

// Edit Customer Modal (simplified - just basic info)
function EditCustomerModal({ customer, onClose, onSubmit }: { 
  customer: Customer; 
  onClose: () => void; 
  onSubmit: (data: any) => void;
}) {
  const [formData, setFormData] = useState({
    name: customer.name,
    cvr: customer.cvr || '',
    email: customer.email,
    phone: customer.phone,
    contactPerson: customer.contactPerson || '',
    preferredContact: customer.preferredContact,
    notes: customer.notes || ''
  });

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
            <h3 className="text-lg font-medium text-gray-900">Rediger kunde</h3>
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
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">CVR</label>
                <input
                  type="text"
                  className="block w-full px-4 py-3 rounded-lg border border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                  value={formData.cvr}
                  onChange={(e) => setFormData({ ...formData, cvr: e.target.value })}
                />
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
                />
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
                Gem ændringer
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

// Customer Detail Modal with Address Management
function CustomerDetailModal({ 
  customer, 
  onClose, 
  onEdit, 
  onContact,
  onAddAddress,
  onEditAddress,
  onDeleteAddress,
  onSetPrimaryAddress
}: { 
  customer: Customer; 
  onClose: () => void; 
  onEdit: () => void;
  onContact: (customer: Customer, method: 'phone' | 'email' | 'sms') => void;
  onAddAddress: () => void;
  onEditAddress: (address: CustomerAddress) => void;
  onDeleteAddress: (addressId: string) => void;
  onSetPrimaryAddress: (addressId: string) => void;
}) {
  const getAddressTypeIcon = (type: string) => {
    switch (type) {
      case 'main': return Building2;
      case 'billing': return Hash;
      case 'service': return MapPin;
      default: return MapPin;
    }
  };

  const getAddressTypeText = (type: string) => {
    switch (type) {
      case 'main': return 'Hovedadresse';
      case 'billing': return 'Faktureringsadresse';
      case 'service': return 'Serviceadresse';
      default: return type;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose}></div>

        <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>

        <div className="inline-block align-bottom bg-white rounded-xl px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-6xl sm:w-full sm:p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <div className="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center mr-4">
                {customer.customerType === 'Erhverv' ? (
                  <Building2 className="h-6 w-6 text-blue-600" />
                ) : (
                  <User className="h-6 w-6 text-blue-600" />
                )}
              </div>
              <div>
                <h3 className="text-xl font-medium text-gray-900">{customer.name}</h3>
                <div className="flex items-center space-x-3 mt-1">
                  <span className="text-sm text-gray-500">{customer.customerNumber}</span>
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                    customer.customerType === 'Erhverv' 
                      ? 'bg-blue-100 text-blue-800' 
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {customer.customerType}
                  </span>
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
                    <span className="text-sm text-gray-900">{customer.email}</span>
                    <button
                      onClick={() => onContact(customer, 'email')}
                      className="ml-auto text-blue-600 hover:text-blue-700 text-sm"
                    >
                      Send email
                    </button>
                  </div>
                  
                  <div className="flex items-center">
                    <Phone className="h-5 w-5 text-gray-400 mr-3" />
                    <span className="text-sm text-gray-900">{customer.phone}</span>
                    <button
                      onClick={() => onContact(customer, 'phone')}
                      className="ml-auto text-blue-600 hover:text-blue-700 text-sm"
                    >
                      Ring op
                    </button>
                  </div>
                  
                  {customer.contactPerson && (
                    <div className="flex items-center">
                      <User className="h-5 w-5 text-gray-400 mr-3" />
                      <span className="text-sm text-gray-900">Kontakt: {customer.contactPerson}</span>
                    </div>
                  )}
                  
                  {customer.cvr && (
                    <div className="flex items-center">
                      <Hash className="h-5 w-5 text-gray-400 mr-3" />
                      <span className="text-sm text-gray-900">CVR: {customer.cvr}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Addresses */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-medium text-gray-900">
                    Adresser ({customer.addresses.length})
                  </h4>
                  <button
                    onClick={onAddAddress}
                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 transition-colors"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Tilføj adresse
                  </button>
                </div>
                
                <div className="space-y-4">
                  {customer.addresses.map(address => {
                    const AddressIcon = getAddressTypeIcon(address.type);
                    const isPrimary = address.id === customer.primaryAddressId;
                    
                    return (
                      <div key={address.id} className={`border rounded-lg p-4 ${
                        isPrimary ? 'border-blue-300 bg-blue-50' : 'border-gray-200 bg-white'
                      }`}>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center mb-2">
                              <AddressIcon className="h-5 w-5 text-gray-400 mr-2" />
                              <h5 className="text-sm font-medium text-gray-900">{address.name}</h5>
                              {isPrimary && (
                                <span className="ml-2 inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                                  <Star className="h-3 w-3 mr-1" />
                                  Primær
                                </span>
                              )}
                              <span className="ml-2 inline-flex px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
                                {getAddressTypeText(address.type)}
                              </span>
                            </div>
                            
                            <div className="text-sm text-gray-600 mb-2">
                              {address.street}, {address.postalCode} {address.city}
                            </div>
                            
                            {address.contactPerson && (
                              <div className="text-sm text-gray-600 mb-1">
                                Kontakt: {address.contactPerson}
                              </div>
                            )}
                            
                            {address.phone && (
                              <div className="text-sm text-gray-600 mb-1">
                                Telefon: {address.phone}
                              </div>
                            )}
                            
                            {address.notes && (
                              <div className="text-sm text-gray-500 italic">
                                {address.notes}
                              </div>
                            )}
                          </div>
                          
                          <div className="flex items-center space-x-2 ml-4">
                            {!isPrimary && (
                              <button
                                onClick={() => onSetPrimaryAddress(address.id)}
                                className="text-blue-600 hover:text-blue-700 text-xs"
                                title="Sæt som primær adresse"
                              >
                                <Star className="h-4 w-4" />
                              </button>
                            )}
                            <button
                              onClick={() => onEditAddress(address)}
                              className="text-gray-600 hover:text-gray-900 text-xs"
                              title="Rediger adresse"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            {customer.addresses.length > 1 && (
                              <button
                                onClick={() => onDeleteAddress(address.id)}
                                className="text-red-600 hover:text-red-900 text-xs"
                                title="Slet adresse"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Notes */}
              {customer.notes && (
                <div>
                  <h4 className="text-lg font-medium text-gray-900 mb-4">Noter</h4>
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <p className="text-sm text-gray-700">{customer.notes}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Quick Actions */}
              <div>
                <h4 className="text-lg font-medium text-gray-900 mb-4">Handlinger</h4>
                <div className="space-y-2">
                  <button
                    onClick={() => onContact(customer, 'email')}
                    className="w-full flex items-center px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                  >
                    <Mail className="h-4 w-4 mr-2" />
                    Send besked
                  </button>
                  
                  <button
                    onClick={() => onContact(customer, 'phone')}
                    className="w-full flex items-center px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                  >
                    <Phone className="h-4 w-4 mr-2" />
                    Ring op
                  </button>
                  
                  <button
                    className="w-full flex items-center px-3 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Opret opgave
                  </button>
                </div>
              </div>

              {/* Customer Stats */}
              <div>
                <h4 className="text-lg font-medium text-gray-900 mb-4">Statistik</h4>
                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Opgaver i alt:</span>
                    <span className="text-sm font-medium text-gray-900">{customer.totalTasks}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Serviceadresser:</span>
                    <span className="text-sm font-medium text-gray-900">{customer.addresses.length}</span>
                  </div>
                  
                  {customer.lastService && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Seneste service:</span>
                      <span className="text-sm font-medium text-gray-900">
                        {new Date(customer.lastService).toLocaleDateString('da-DK')}
                      </span>
                    </div>
                  )}
                  
                  {customer.lastContact && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Seneste kontakt:</span>
                      <span className="text-sm font-medium text-gray-900">
                        {new Date(customer.lastContact).toLocaleDateString('da-DK')}
                      </span>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Oprettet:</span>
                    <span className="text-sm font-medium text-gray-900">
                      {new Date(customer.createdAt).toLocaleDateString('da-DK')}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-gray-200 text-xs text-gray-500">
            <div className="flex justify-between">
              <div>Kundenummer: {customer.customerNumber}</div>
              <div>Sidst opdateret: {new Date(customer.updatedAt).toLocaleDateString('da-DK')}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Address Modal (Add/Edit)
function AddressModal({ 
  customer, 
  address, 
  onClose, 
  onSubmit 
}: { 
  customer: Customer; 
  address?: CustomerAddress | null; 
  onClose: () => void; 
  onSubmit: (data: any) => void;
}) {
  const [formData, setFormData] = useState({
    type: address?.type || 'service' as 'main' | 'billing' | 'service',
    name: address?.name || '',
    street: address?.street || '',
    postalCode: address?.postalCode || '',
    city: address?.city || '',
    contactPerson: address?.contactPerson || '',
    phone: address?.phone || '',
    email: address?.email || '',
    notes: address?.notes || ''
  });

  const handleAddressSelected = (addressData: any) => {
    setFormData(prev => ({
      ...prev,
      street: addressData.street,
      postalCode: addressData.postalCode,
      city: addressData.city
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
            <h3 className="text-lg font-medium text-gray-900">
              {address ? 'Rediger adresse' : 'Tilføj ny adresse'}
            </h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 rounded-full p-1 hover:bg-gray-100">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Address Type and Name */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type *</label>
                <select
                  required
                  className="block w-full px-4 py-3 rounded-lg border border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                >
                  <option value="main">Hovedadresse</option>
                  <option value="billing">Faktureringsadresse</option>
                  <option value="service">Serviceadresse</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Navn/Betegnelse *</label>
                <input
                  type="text"
                  required
                  className="block w-full px-4 py-3 rounded-lg border border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="f.eks. Hovedkontor, Butik Randers, Afdeling Nord"
                />
              </div>
            </div>

            {/* Address */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Adresse *</label>
              <SmartAddressLookup
                onAddressSelected={handleAddressSelected}
                placeholder="Indtast adresse for automatisk udfyldning..."
                initialValue={formData.street}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Postnummer *</label>
                <input
                  type="text"
                  required
                  className="block w-full px-4 py-3 rounded-lg border border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                  value={formData.postalCode}
                  onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                  placeholder="1234"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">By *</label>
                <input
                  type="text"
                  required
                  className="block w-full px-4 py-3 rounded-lg border border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  placeholder="By"
                />
              </div>
            </div>

            {/* Contact Info */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Kontaktperson</label>
                <input
                  type="text"
                  className="block w-full px-4 py-3 rounded-lg border border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                  value={formData.contactPerson}
                  onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                  placeholder="Navn på kontaktperson"
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
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Noter</label>
              <textarea
                rows={3}
                className="block w-full px-4 py-3 rounded-lg border border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Særlige instruktioner, nøgleoplysninger, etc."
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
                {address ? 'Gem ændringer' : 'Tilføj adresse'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}