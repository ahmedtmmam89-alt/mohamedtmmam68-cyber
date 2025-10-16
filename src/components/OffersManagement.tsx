import { useState, useEffect } from 'react';
import { Tag, Plus, Edit2, Trash2, Play, Pause, Clock, TrendingUp, Calendar } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface PricingPlan {
  id: string;
  price: number;
  category_name: string;
  sport_name: string;
}

interface Offer {
  id: string;
  pricing_plan_id: string;
  original_price: number;
  offer_price: number;
  discount_percentage: number;
  start_date: string;
  end_date: string;
  status: 'scheduled' | 'active' | 'expired' | 'paused';
  created_at: string;
  plan_details?: {
    category_name: string;
    sport_name: string;
  };
}

export default function OffersManagement() {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [pricingPlans, setPricingPlans] = useState<PricingPlan[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingOffer, setEditingOffer] = useState<Offer | null>(null);
  const [filter, setFilter] = useState<'all' | 'scheduled' | 'active' | 'expired' | 'paused'>('all');

  const [formData, setFormData] = useState({
    pricing_plan_id: '',
    original_price: '',
    offer_price: '',
    start_date: '',
    end_date: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      await supabase.rpc('update_offer_status');

      const [plansResult, offersResult] = await Promise.all([
        supabase
          .from('pricing_plans')
          .select(`
            id,
            price,
            athlete_categories!inner(name),
            sports!inner(name)
          `)
          .eq('is_active', true),
        supabase
          .from('price_offers')
          .select(`
            *,
            pricing_plans!inner(
              athlete_categories!inner(name),
              sports!inner(name)
            )
          `)
          .order('created_at', { ascending: false }),
      ]);

      if (plansResult.data) {
        const formattedPlans = plansResult.data.map((plan: any) => ({
          id: plan.id,
          price: plan.price,
          category_name: plan.athlete_categories.name,
          sport_name: plan.sports.name,
        }));
        setPricingPlans(formattedPlans);
      }

      if (offersResult.data) {
        const formattedOffers = offersResult.data.map((offer: any) => ({
          ...offer,
          plan_details: {
            category_name: offer.pricing_plans.athlete_categories.name,
            sport_name: offer.pricing_plans.sports.name,
          },
        }));
        setOffers(formattedOffers);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const updated = { ...prev, [name]: value };

      if (name === 'pricing_plan_id') {
        const selectedPlan = pricingPlans.find((p) => p.id === value);
        if (selectedPlan) {
          updated.original_price = selectedPlan.price.toString();
        }
      }

      return updated;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const offerData = {
        pricing_plan_id: formData.pricing_plan_id,
        original_price: parseFloat(formData.original_price),
        offer_price: parseFloat(formData.offer_price),
        start_date: new Date(formData.start_date).toISOString(),
        end_date: new Date(formData.end_date).toISOString(),
        created_by: (await supabase.auth.getUser()).data.user?.id,
      };

      if (editingOffer) {
        const { error } = await supabase
          .from('price_offers')
          .update(offerData)
          .eq('id', editingOffer.id);

        if (error) throw error;
      } else {
        const { error } = await supabase.from('price_offers').insert(offerData);

        if (error) throw error;
      }

      setShowCreateForm(false);
      setEditingOffer(null);
      setFormData({
        pricing_plan_id: '',
        original_price: '',
        offer_price: '',
        start_date: '',
        end_date: '',
      });
      loadData();
    } catch (error: any) {
      console.error('Error saving offer:', error);
      alert(error.message || 'Failed to save offer');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (offer: Offer) => {
    setEditingOffer(offer);
    setFormData({
      pricing_plan_id: offer.pricing_plan_id,
      original_price: offer.original_price.toString(),
      offer_price: offer.offer_price.toString(),
      start_date: new Date(offer.start_date).toISOString().slice(0, 16),
      end_date: new Date(offer.end_date).toISOString().slice(0, 16),
    });
    setShowCreateForm(true);
  };

  const handleDelete = async (offerId: string) => {
    if (!confirm('Are you sure you want to delete this offer?')) return;

    try {
      const { error } = await supabase.from('price_offers').delete().eq('id', offerId);

      if (error) throw error;

      loadData();
    } catch (error: any) {
      console.error('Error deleting offer:', error);
      alert(error.message || 'Failed to delete offer');
    }
  };

  const handleTogglePause = async (offer: Offer) => {
    try {
      const newStatus = offer.status === 'paused' ? 'active' : 'paused';
      const { error } = await supabase
        .from('price_offers')
        .update({
          status: newStatus,
          paused_at: newStatus === 'paused' ? new Date().toISOString() : null,
        })
        .eq('id', offer.id);

      if (error) throw error;

      loadData();
    } catch (error: any) {
      console.error('Error toggling pause:', error);
      alert(error.message || 'Failed to update offer status');
    }
  };

  const filteredOffers = offers.filter((offer) => filter === 'all' || offer.status === filter);

  const stats = {
    total: offers.length,
    active: offers.filter((o) => o.status === 'active').length,
    scheduled: offers.filter((o) => o.status === 'scheduled').length,
    expired: offers.filter((o) => o.status === 'expired').length,
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-500/10 text-green-500 border-green-500';
      case 'scheduled':
        return 'bg-blue-500/10 text-blue-500 border-blue-500';
      case 'expired':
        return 'bg-gray-500/10 text-gray-500 border-gray-500';
      case 'paused':
        return 'bg-orange-500/10 text-orange-500 border-orange-500';
      default:
        return 'bg-gray-500/10 text-gray-500 border-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold flex items-center gap-3">
            <Tag className="w-8 h-8 text-red-500" />
            Offers Management
          </h2>
          <p className="text-gray-400 mt-1">Create and manage promotional offers for your pricing plans</p>
        </div>
        <button
          onClick={() => {
            setShowCreateForm(true);
            setEditingOffer(null);
            setFormData({
              pricing_plan_id: '',
              original_price: '',
              offer_price: '',
              start_date: '',
              end_date: '',
            });
          }}
          className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300 flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Create Offer
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total Offers</p>
              <p className="text-3xl font-bold mt-1">{stats.total}</p>
            </div>
            <TrendingUp className="w-10 h-10 text-gray-500" />
          </div>
        </div>
        <div className="bg-gray-800 rounded-lg p-6 border border-green-500/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Active</p>
              <p className="text-3xl font-bold mt-1 text-green-500">{stats.active}</p>
            </div>
            <Play className="w-10 h-10 text-green-500" />
          </div>
        </div>
        <div className="bg-gray-800 rounded-lg p-6 border border-blue-500/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Scheduled</p>
              <p className="text-3xl font-bold mt-1 text-blue-500">{stats.scheduled}</p>
            </div>
            <Calendar className="w-10 h-10 text-blue-500" />
          </div>
        </div>
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Expired</p>
              <p className="text-3xl font-bold mt-1">{stats.expired}</p>
            </div>
            <Clock className="w-10 h-10 text-gray-500" />
          </div>
        </div>
      </div>

      {/* Create/Edit Form */}
      {showCreateForm && (
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h3 className="text-xl font-bold mb-4">{editingOffer ? 'Edit Offer' : 'Create New Offer'}</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Pricing Plan</label>
                <select
                  name="pricing_plan_id"
                  value={formData.pricing_plan_id}
                  onChange={handleInputChange}
                  required
                  disabled={!!editingOffer}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-red-500 transition-colors disabled:opacity-50"
                >
                  <option value="">Select a plan</option>
                  {pricingPlans.map((plan) => (
                    <option key={plan.id} value={plan.id}>
                      {plan.category_name} - {plan.sport_name} ({plan.price} EGP)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Original Price (EGP)</label>
                <input
                  type="number"
                  name="original_price"
                  value={formData.original_price}
                  onChange={handleInputChange}
                  required
                  step="0.01"
                  min="0"
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-red-500 transition-colors"
                  placeholder="2000"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Offer Price (EGP)</label>
                <input
                  type="number"
                  name="offer_price"
                  value={formData.offer_price}
                  onChange={handleInputChange}
                  required
                  step="0.01"
                  min="0"
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-red-500 transition-colors"
                  placeholder="1500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Discount</label>
                <div className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white">
                  {formData.original_price && formData.offer_price
                    ? (
                        ((parseFloat(formData.original_price) - parseFloat(formData.offer_price)) /
                          parseFloat(formData.original_price)) *
                        100
                      ).toFixed(2)
                    : '0'}
                  %
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Start Date & Time</label>
                <input
                  type="datetime-local"
                  name="start_date"
                  value={formData.start_date}
                  onChange={handleInputChange}
                  required
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-red-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">End Date & Time</label>
                <input
                  type="datetime-local"
                  name="end_date"
                  value={formData.end_date}
                  onChange={handleInputChange}
                  required
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-red-500 transition-colors"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={loading}
                className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300 disabled:opacity-50"
              >
                {loading ? 'Saving...' : editingOffer ? 'Update Offer' : 'Create Offer'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowCreateForm(false);
                  setEditingOffer(null);
                }}
                className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filter */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {['all', 'active', 'scheduled', 'expired', 'paused'].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status as any)}
            className={`px-4 py-2 rounded-lg font-semibold transition-all duration-300 whitespace-nowrap ${
              filter === status
                ? 'bg-red-500 text-white'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>

      {/* Offers List */}
      <div className="space-y-4">
        {filteredOffers.length === 0 ? (
          <div className="bg-gray-800 rounded-lg p-12 border border-gray-700 text-center">
            <Tag className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">No offers found</p>
            <p className="text-gray-500 text-sm mt-2">Create your first offer to get started</p>
          </div>
        ) : (
          filteredOffers.map((offer) => (
            <div
              key={offer.id}
              className="bg-gray-800 rounded-lg p-6 border border-gray-700 hover:border-gray-600 transition-all duration-300"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <h3 className="text-xl font-bold">
                      {offer.plan_details?.category_name} - {offer.plan_details?.sport_name}
                    </h3>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(
                        offer.status
                      )}`}
                    >
                      {offer.status.toUpperCase()}
                    </span>
                  </div>

                  <div className="grid md:grid-cols-4 gap-4 mb-3">
                    <div>
                      <p className="text-gray-400 text-sm">Original Price</p>
                      <p className="text-lg font-semibold">{offer.original_price} EGP</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Offer Price</p>
                      <p className="text-lg font-semibold text-green-500">{offer.offer_price} EGP</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Discount</p>
                      <p className="text-lg font-semibold text-red-500">{offer.discount_percentage}%</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Duration</p>
                      <p className="text-lg font-semibold">
                        {Math.ceil(
                          (new Date(offer.end_date).getTime() - new Date(offer.start_date).getTime()) /
                            (1000 * 60 * 60 * 24)
                        )}{' '}
                        days
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 text-sm text-gray-400">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>Start: {new Date(offer.start_date).toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      <span>End: {new Date(offer.end_date).toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  {(offer.status === 'active' || offer.status === 'paused') && (
                    <button
                      onClick={() => handleTogglePause(offer)}
                      className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-all duration-300"
                      title={offer.status === 'paused' ? 'Resume' : 'Pause'}
                    >
                      {offer.status === 'paused' ? (
                        <Play className="w-5 h-5 text-green-500" />
                      ) : (
                        <Pause className="w-5 h-5 text-orange-500" />
                      )}
                    </button>
                  )}
                  <button
                    onClick={() => handleEdit(offer)}
                    className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-all duration-300"
                    title="Edit"
                  >
                    <Edit2 className="w-5 h-5 text-blue-500" />
                  </button>
                  <button
                    onClick={() => handleDelete(offer.id)}
                    className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-all duration-300"
                    title="Delete"
                  >
                    <Trash2 className="w-5 h-5 text-red-500" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
