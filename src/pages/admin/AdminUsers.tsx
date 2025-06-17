import React, { useState } from 'react';
import { Plus, Search, Building2, User, Phone, Mail } from 'lucide-react';
import { useSupabaseQuery, useSupabaseMutation } from '../../hooks/useSupabaseQuery';
import { userService } from '../../services/userService';
import { useAuth } from '../../contexts/AuthContext';

interface CompanyOwnerStats {
  user_id: string;
  user_name: string;
  user_email: string;
  user_phone: string | null;
  company_id: string;
  company_name: string;
  employee_count: number;
  user_created_at: string;
  user_is_active: boolean;
}

export default function AdminUsers() {
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const { user } = useAuth();

  const { data: companyOwners, isLoading, refetch } = useSupabaseQuery(
    () => userService.getCompanyOwners(),
    [user?.id]
  );

  const { mutate: toggleUserStatus } = useSupabaseMutation(
    async ({ id, isActive }: { id: string; isActive: boolean }) => {
      return await userService.toggleStatus(id, !isActive);
    }
  );

  const handleToggleStatus = async (id: string, isActive: boolean) => {
    await toggleUserStatus({ id, isActive });
    refetch();
  };

  const filteredOwners = (companyOwners?.data as CompanyOwnerStats[] || []).filter(owner =>
    owner.user_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    owner.user_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    owner.company_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
            <h1 className="text-2xl font-bold text-gray-900">Virksomhedsejere</h1>
            <p className="text-gray-600 mt-1">Administrer alle virksomhedsejere i systemet</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors shadow-sm"
          >
            <Plus className="h-4 w-4 mr-2" />
            Ny virksomhedsejer
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
            placeholder="Søg efter navn, email eller virksomhed..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Users Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3">
        {filteredOwners.map((owner) => (
          <div key={owner.user_id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center">
                <div className="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center">
                  <User className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-3">
                  <h3 className="text-lg font-medium text-gray-900">{owner.user_name}</h3>
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                    owner.user_is_active
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {owner.user_is_active ? 'Aktiv' : 'Inaktiv'}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="space-y-3 mb-4">
              <div className="flex items-center text-sm text-gray-600">
                <Mail className="h-4 w-4 mr-2 text-gray-400" />
                <span>{owner.user_email}</span>
              </div>
              
              {owner.user_phone && (
                <div className="flex items-center text-sm text-gray-600">
                  <Phone className="h-4 w-4 mr-2 text-gray-400" />
                  <span>{owner.user_phone}</span>
                </div>
              )}
              
              <div className="flex items-center text-sm text-gray-600">
                <Building2 className="h-4 w-4 mr-2 text-gray-400" />
                <span>{owner.company_name}</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
              <div className="text-sm text-gray-500">
                <span className="font-medium text-gray-900">{owner.employee_count}</span> medarbejdere
              </div>
              
              <button
                onClick={() => handleToggleStatus(owner.user_id, owner.user_is_active)}
                className={`inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-lg ${
                  owner.user_is_active
                    ? 'text-red-700 bg-red-100 hover:bg-red-200'
                    : 'text-green-700 bg-green-100 hover:bg-green-200'
                } transition-colors`}
              >
                {owner.user_is_active ? 'Deaktiver' : 'Aktiver'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredOwners.length === 0 && (
        <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-200">
          <User className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Ingen virksomhedsejere</h3>
          <p className="mt-1 text-sm text-gray-500">
            Opret den første virksomhedsejer for at komme i gang.
          </p>
        </div>
      )}

      {/* Create User Modal */}
      {showCreateModal && (
        <CreateUserModal 
          onClose={() => setShowCreateModal(false)} 
          onSuccess={() => {
            setShowCreateModal(false);
            refetch();
          }}
        />
      )}
    </div>
  );
}

function CreateUserModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    companyName: '',
    phone: '',
    address: '',
    cvr: '',
    postalCode: '',
    city: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { createCompanyOwner } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const result = await createCompanyOwner({
        email: formData.email,
        password: formData.password,
        name: formData.name,
        phone: formData.phone || undefined,
        companyName: formData.companyName,
        companyData: {
          cvr: formData.cvr || undefined,
          address: formData.address || undefined,
          postalCode: formData.postalCode || undefined,
          city: formData.city || undefined,
          phone: formData.phone || undefined,
        },
      });

      if (!result.success) {
        setError(result.error || 'Oprettelse fejlede');
        return;
      }

      onSuccess();
    } catch (error) {
      console.error('Error creating company owner:', error);
      setError('Der opstod en fejl ved oprettelse');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-10 overflow-y-auto">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose}></div>

        <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>

        <div className="inline-block align-bottom bg-white rounded-xl px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
          <div>
            <div className="mt-3 text-center sm:mt-0 sm:text-left">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Opret ny virksomhedsejer
              </h3>
              
              {error && (
                <div className="mt-3 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
                  {error}
                </div>
              )}
              
              <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Navn</label>
                    <input
                      type="text"
                      required
                      className="mt-1 block w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <input
                      type="email"
                      required
                      className="mt-1 block w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Adgangskode</label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    className="mt-1 block w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Virksomhedsnavn</label>
                  <input
                    type="text"
                    required
                    className="mt-1 block w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    value={formData.companyName}
                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                  />
                </div>
              </form>
            </div>
          </div>
          <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
            <button
              type="submit"
              onClick={handleSubmit}
              disabled={isLoading}
              className="w-full inline-flex justify-center rounded-lg border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:col-start-2 sm:text-sm disabled:opacity-50 transition-colors"
            >
              {isLoading ? 'Opretter...' : 'Opret'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="mt-3 w-full inline-flex justify-center rounded-lg border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:col-start-1 sm:text-sm transition-colors"
            >
              Annuller
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}