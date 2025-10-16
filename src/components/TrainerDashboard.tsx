import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase, ClientRegistration, Profile, ClientProgress } from '../lib/supabase';
import { Users, CheckCircle, Clock, TrendingUp, LogOut, X, Eye, ShoppingCart, Tag } from 'lucide-react';
import ProgramPaymentsAdmin from './ProgramPaymentsAdmin';
import OffersManagement from './OffersManagement';

export default function TrainerDashboard() {
  const { profile, signOut } = useAuth();
  const [registrations, setRegistrations] = useState<ClientRegistration[]>([]);
  const [clients, setClients] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedClient, setSelectedClient] = useState<ClientRegistration | null>(null);
  const [clientProgress, setClientProgress] = useState<ClientProgress[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'registrations' | 'payments' | 'offers'>('registrations');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const { data: regData } = await supabase
        .from('client_registrations')
        .select('*')
        .order('created_at', { ascending: false });

      setRegistrations(regData || []);

      const { data: clientData } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'client');

      setClients(clientData || []);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateRegistrationStatus = async (id: string, status: string) => {
    try {
      const { error } = await supabase
        .from('client_registrations')
        .update({ status })
        .eq('id', id);

      if (error) throw error;
      await loadData();
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const viewClientDetails = async (registration: ClientRegistration) => {
    setSelectedClient(registration);

    if (registration.user_id) {
      const { data } = await supabase
        .from('client_progress')
        .select('*')
        .eq('client_id', registration.user_id)
        .order('recorded_at', { ascending: false });

      setClientProgress(data || []);
    } else {
      setClientProgress([]);
    }
  };

  const filteredRegistrations = statusFilter === 'all'
    ? registrations
    : registrations.filter(r => r.status === statusFilter);

  const stats = {
    total: registrations.length,
    pending: registrations.filter(r => r.status === 'pending').length,
    active: registrations.filter(r => r.status === 'active').length,
    approved: registrations.filter(r => r.status === 'approved').length,
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-gray-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">Trainer Dashboard</h1>
            <p className="text-gray-400">Welcome, {profile?.full_name}</p>
          </div>
          <button
            onClick={() => signOut()}
            className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Sign Out
          </button>
        </div>

        <div className="flex gap-4 mb-8 overflow-x-auto">
          <button
            onClick={() => setActiveTab('registrations')}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all whitespace-nowrap ${
              activeTab === 'registrations'
                ? 'bg-red-500 text-white'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            <Users className="w-5 h-5" />
            Client Registrations
          </button>
          <button
            onClick={() => setActiveTab('payments')}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all whitespace-nowrap ${
              activeTab === 'payments'
                ? 'bg-red-500 text-white'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            <ShoppingCart className="w-5 h-5" />
            Program Payments
          </button>
          <button
            onClick={() => setActiveTab('offers')}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all whitespace-nowrap ${
              activeTab === 'offers'
                ? 'bg-red-500 text-white'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            <Tag className="w-5 h-5" />
            Offers Management
          </button>
        </div>

        {activeTab === 'registrations' && (
          <>
            <div className="grid md:grid-cols-4 gap-6 mb-8">
              <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                <div className="flex items-center gap-3 mb-2">
                  <Users className="w-6 h-6 text-blue-500" />
                  <h3 className="text-lg font-semibold">Total Registrations</h3>
                </div>
                <p className="text-3xl font-bold text-blue-500">{stats.total}</p>
              </div>

              <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                <div className="flex items-center gap-3 mb-2">
                  <Clock className="w-6 h-6 text-yellow-500" />
                  <h3 className="text-lg font-semibold">Pending</h3>
                </div>
                <p className="text-3xl font-bold text-yellow-500">{stats.pending}</p>
              </div>

              <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                <div className="flex items-center gap-3 mb-2">
                  <CheckCircle className="w-6 h-6 text-green-500" />
                  <h3 className="text-lg font-semibold">Active</h3>
                </div>
                <p className="text-3xl font-bold text-green-500">{stats.active}</p>
              </div>

              <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                <div className="flex items-center gap-3 mb-2">
                  <TrendingUp className="w-6 h-6 text-red-500" />
                  <h3 className="text-lg font-semibold">Approved</h3>
                </div>
                <p className="text-3xl font-bold text-red-500">{stats.approved}</p>
              </div>
            </div>

            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Client Registrations</h2>
            <div className="flex gap-2">
              {['all', 'pending', 'approved', 'active', 'inactive'].map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors capitalize ${
                    statusFilter === status
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          {filteredRegistrations.length === 0 ? (
            <p className="text-center text-gray-400 py-12">No registrations found</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left border-b border-gray-700">
                    <th className="pb-3 font-semibold text-gray-300">Name</th>
                    <th className="pb-3 font-semibold text-gray-300">Email</th>
                    <th className="pb-3 font-semibold text-gray-300">Goal</th>
                    <th className="pb-3 font-semibold text-gray-300">Status</th>
                    <th className="pb-3 font-semibold text-gray-300">Date</th>
                    <th className="pb-3 font-semibold text-gray-300">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRegistrations.map((reg) => (
                    <tr key={reg.id} className="border-b border-gray-700 hover:bg-gray-700/50">
                      <td className="py-4">{reg.full_name}</td>
                      <td className="py-4 text-gray-400">{reg.email}</td>
                      <td className="py-4 capitalize">{reg.fitness_goal.replace('-', ' ')}</td>
                      <td className="py-4">
                        <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                          reg.status === 'active' ? 'bg-green-900/50 text-green-300' :
                          reg.status === 'approved' ? 'bg-blue-900/50 text-blue-300' :
                          reg.status === 'pending' ? 'bg-yellow-900/50 text-yellow-300' :
                          'bg-gray-700 text-gray-300'
                        }`}>
                          {reg.status}
                        </span>
                      </td>
                      <td className="py-4 text-gray-400">
                        {new Date(reg.created_at).toLocaleDateString()}
                      </td>
                      <td className="py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => viewClientDetails(reg)}
                            className="p-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {reg.status === 'pending' && (
                            <button
                              onClick={() => updateRegistrationStatus(reg.id, 'approved')}
                              className="px-3 py-2 bg-green-600 hover:bg-green-700 rounded-lg transition-colors text-sm"
                            >
                              Approve
                            </button>
                          )}
                          {reg.status === 'approved' && (
                            <button
                              onClick={() => updateRegistrationStatus(reg.id, 'active')}
                              className="px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors text-sm"
                            >
                              Activate
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        </>
        )}

        {activeTab === 'payments' && <ProgramPaymentsAdmin />}

        {activeTab === 'offers' && <OffersManagement />}
      </div>

      {selectedClient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-8 relative">
            <button
              onClick={() => setSelectedClient(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-200 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>

            <h2 className="text-3xl font-bold mb-6">{selectedClient.full_name}</h2>

            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div>
                <p className="text-gray-400 text-sm">Email</p>
                <p className="font-semibold">{selectedClient.email}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Phone</p>
                <p className="font-semibold">{selectedClient.phone}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Age</p>
                <p className="font-semibold">{selectedClient.age} years</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Height</p>
                <p className="font-semibold">{selectedClient.height} cm</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Current Weight</p>
                <p className="font-semibold">{selectedClient.weight} kg</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Goal Weight</p>
                <p className="font-semibold">{selectedClient.goal_weight || 'Not set'} kg</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Fitness Goal</p>
                <p className="font-semibold capitalize">{selectedClient.fitness_goal.replace('-', ' ')}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Activity Level</p>
                <p className="font-semibold capitalize">{selectedClient.activity_level.replace('-', ' ')}</p>
              </div>
              {selectedClient.dietary_preferences && (
                <div className="md:col-span-2">
                  <p className="text-gray-400 text-sm">Dietary Preferences</p>
                  <p className="font-semibold">{selectedClient.dietary_preferences}</p>
                </div>
              )}
              {selectedClient.medical_conditions && (
                <div className="md:col-span-2">
                  <p className="text-gray-400 text-sm">Medical Conditions</p>
                  <p className="font-semibold">{selectedClient.medical_conditions}</p>
                </div>
              )}
            </div>

            {clientProgress.length > 0 && (
              <div className="mt-6">
                <h3 className="text-xl font-bold mb-4">Progress History</h3>
                <div className="space-y-3">
                  {clientProgress.map((entry) => (
                    <div key={entry.id} className="bg-gray-900 rounded-lg p-4 border border-gray-700">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-xl font-bold text-blue-500">{entry.weight.toFixed(1)} kg</p>
                          {entry.notes && (
                            <p className="text-gray-300 text-sm mt-1">{entry.notes}</p>
                          )}
                        </div>
                        <p className="text-sm text-gray-400">
                          {new Date(entry.recorded_at).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
