import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { CheckCircle, XCircle, Eye, ExternalLink, Clock, DollarSign } from 'lucide-react';

type ProgramPurchase = {
  id: string;
  customer_name: string;
  customer_email: string;
  payment_method: string;
  payment_proof_url: string;
  status: 'pending' | 'approved' | 'rejected';
  admin_notes: string;
  created_at: string;
  approved_at: string | null;
  program: {
    name: string;
    price: number;
    offer_price: number | null;
  };
};

export default function ProgramPaymentsAdmin() {
  const [purchases, setPurchases] = useState<ProgramPurchase[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [selectedPurchase, setSelectedPurchase] = useState<ProgramPurchase | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    loadPurchases();
  }, []);

  const loadPurchases = async () => {
    try {
      const { data, error } = await supabase
        .from('program_purchases')
        .select(`
          *,
          program:athlete_programs(name, price, offer_price)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPurchases(data || []);
    } catch (error) {
      console.error('Error loading purchases:', error);
    } finally {
      setLoading(false);
    }
  };

  const updatePurchaseStatus = async (id: string, status: 'approved' | 'rejected') => {
    setProcessing(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();

      const { error } = await supabase
        .from('program_purchases')
        .update({
          status,
          admin_notes: adminNotes,
          approved_by: user?.id,
          approved_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (error) throw error;

      await loadPurchases();
      setSelectedPurchase(null);
      setAdminNotes('');
    } catch (error) {
      console.error('Error updating purchase:', error);
    } finally {
      setProcessing(false);
    }
  };

  const filteredPurchases = filter === 'all'
    ? purchases
    : purchases.filter(p => p.status === filter);

  const stats = {
    pending: purchases.filter(p => p.status === 'pending').length,
    approved: purchases.filter(p => p.status === 'approved').length,
    rejected: purchases.filter(p => p.status === 'rejected').length,
  };

  const getPaymentMethodLabel = (method: string) => {
    switch (method) {
      case 'instapay':
        return 'InstaPay';
      case 'vodafone_cash':
        return 'Vodafone Cash';
      case 'bank_transfer':
        return 'Bank Transfer';
      default:
        return method;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-400">Loading purchases...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Program Payments</h2>
        <p className="text-gray-400">Manage athlete program purchase requests</p>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <div className="bg-gray-800 rounded-lg p-6 border border-yellow-500/30">
          <div className="flex items-center gap-3 mb-2">
            <Clock className="w-6 h-6 text-yellow-500" />
            <h3 className="text-lg font-semibold">Pending</h3>
          </div>
          <p className="text-3xl font-bold text-yellow-500">{stats.pending}</p>
        </div>

        <div className="bg-gray-800 rounded-lg p-6 border border-green-500/30">
          <div className="flex items-center gap-3 mb-2">
            <CheckCircle className="w-6 h-6 text-green-500" />
            <h3 className="text-lg font-semibold">Approved</h3>
          </div>
          <p className="text-3xl font-bold text-green-500">{stats.approved}</p>
        </div>

        <div className="bg-gray-800 rounded-lg p-6 border border-red-500/30">
          <div className="flex items-center gap-3 mb-2">
            <XCircle className="w-6 h-6 text-red-500" />
            <h3 className="text-lg font-semibold">Rejected</h3>
          </div>
          <p className="text-3xl font-bold text-red-500">{stats.rejected}</p>
        </div>
      </div>

      <div className="flex gap-2">
        {(['all', 'pending', 'approved', 'rejected'] as const).map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors capitalize ${
              filter === status
                ? 'bg-red-500 text-white'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      {filteredPurchases.length === 0 ? (
        <div className="bg-gray-800 rounded-lg p-12 text-center border border-gray-700">
          <p className="text-gray-400">No purchases found</p>
        </div>
      ) : (
        <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-900">
                <tr className="text-left">
                  <th className="px-6 py-4 font-semibold text-gray-300">Customer</th>
                  <th className="px-6 py-4 font-semibold text-gray-300">Program</th>
                  <th className="px-6 py-4 font-semibold text-gray-300">Payment</th>
                  <th className="px-6 py-4 font-semibold text-gray-300">Amount</th>
                  <th className="px-6 py-4 font-semibold text-gray-300">Status</th>
                  <th className="px-6 py-4 font-semibold text-gray-300">Date</th>
                  <th className="px-6 py-4 font-semibold text-gray-300">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPurchases.map((purchase) => (
                  <tr key={purchase.id} className="border-t border-gray-700 hover:bg-gray-700/50">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-semibold">{purchase.customer_name}</p>
                        <p className="text-sm text-gray-400">{purchase.customer_email}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium">{purchase.program.name}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-300">
                        {getPaymentMethodLabel(purchase.payment_method)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1">
                        <DollarSign className="w-4 h-4 text-green-500" />
                        <span className="font-semibold">
                          {purchase.program.offer_price || purchase.program.price} EGP
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                          purchase.status === 'approved'
                            ? 'bg-green-900/50 text-green-300'
                            : purchase.status === 'pending'
                            ? 'bg-yellow-900/50 text-yellow-300'
                            : 'bg-red-900/50 text-red-300'
                        }`}
                      >
                        {purchase.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-400 text-sm">
                      {new Date(purchase.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => {
                          setSelectedPurchase(purchase);
                          setAdminNotes(purchase.admin_notes || '');
                        }}
                        className="p-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {selectedPurchase && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-6">Purchase Details</h2>

            <div className="space-y-4 mb-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-400">Customer Name</p>
                  <p className="font-semibold">{selectedPurchase.customer_name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Email</p>
                  <p className="font-semibold">{selectedPurchase.customer_email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Program</p>
                  <p className="font-semibold">{selectedPurchase.program.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Amount</p>
                  <p className="font-semibold text-green-500">
                    {selectedPurchase.program.offer_price || selectedPurchase.program.price} EGP
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Payment Method</p>
                  <p className="font-semibold">
                    {getPaymentMethodLabel(selectedPurchase.payment_method)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Status</p>
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                      selectedPurchase.status === 'approved'
                        ? 'bg-green-900/50 text-green-300'
                        : selectedPurchase.status === 'pending'
                        ? 'bg-yellow-900/50 text-yellow-300'
                        : 'bg-red-900/50 text-red-300'
                    }`}
                  >
                    {selectedPurchase.status}
                  </span>
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-400 mb-2">Payment Proof</p>
                <a
                  href={selectedPurchase.payment_proof_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                  View Screenshot
                </a>
              </div>

              {selectedPurchase.status === 'pending' && (
                <div>
                  <label className="block text-sm font-medium mb-2">Admin Notes</label>
                  <textarea
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    rows={3}
                    className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-red-500"
                    placeholder="Add notes (optional)"
                  />
                </div>
              )}

              {selectedPurchase.admin_notes && selectedPurchase.status !== 'pending' && (
                <div>
                  <p className="text-sm text-gray-400 mb-1">Admin Notes</p>
                  <p className="text-gray-300">{selectedPurchase.admin_notes}</p>
                </div>
              )}
            </div>

            <div className="flex gap-3">
              {selectedPurchase.status === 'pending' ? (
                <>
                  <button
                    onClick={() => updatePurchaseStatus(selectedPurchase.id, 'approved')}
                    disabled={processing}
                    className="flex-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition-all disabled:opacity-50"
                  >
                    <CheckCircle className="w-5 h-5" />
                    {processing ? 'Processing...' : 'Approve'}
                  </button>
                  <button
                    onClick={() => updatePurchaseStatus(selectedPurchase.id, 'rejected')}
                    disabled={processing}
                    className="flex-1 flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-semibold transition-all disabled:opacity-50"
                  >
                    <XCircle className="w-5 h-5" />
                    {processing ? 'Processing...' : 'Reject'}
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setSelectedPurchase(null)}
                  className="flex-1 bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold transition-all"
                >
                  Close
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
