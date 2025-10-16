import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase, ClientRegistration, ClientProgress } from '../lib/supabase';
import { User, TrendingUp, Calendar, Activity, LogOut } from 'lucide-react';

export default function ClientDashboard() {
  const { profile, signOut } = useAuth();
  const [registration, setRegistration] = useState<ClientRegistration | null>(null);
  const [progress, setProgress] = useState<ClientProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [newWeight, setNewWeight] = useState('');
  const [newNotes, setNewNotes] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadData();
  }, [profile]);

  const loadData = async () => {
    if (!profile) return;

    try {
      const { data: regData } = await supabase
        .from('client_registrations')
        .select('*')
        .eq('user_id', profile.id)
        .maybeSingle();

      setRegistration(regData);

      const { data: progressData } = await supabase
        .from('client_progress')
        .select('*')
        .eq('client_id', profile.id)
        .order('recorded_at', { ascending: false });

      setProgress(progressData || []);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddProgress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('client_progress')
        .insert({
          client_id: profile.id,
          weight: parseFloat(newWeight),
          notes: newNotes,
        });

      if (error) throw error;

      setNewWeight('');
      setNewNotes('');
      await loadData();
    } catch (error) {
      console.error('Error adding progress:', error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-gray-400">Loading...</div>
      </div>
    );
  }

  const latestWeight = progress.length > 0 ? progress[0].weight : registration?.weight || 0;
  const initialWeight = registration?.weight || 0;
  const goalWeight = registration?.goal_weight || 0;
  const weightChange = latestWeight - initialWeight;
  const progressPercentage = goalWeight && initialWeight !== goalWeight
    ? Math.min(Math.abs((initialWeight - latestWeight) / (initialWeight - goalWeight)) * 100, 100)
    : 0;

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">Welcome, {profile?.full_name}</h1>
            <p className="text-gray-400">Track your fitness journey</p>
          </div>
          <button
            onClick={() => signOut()}
            className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Sign Out
          </button>
        </div>

        {!registration && (
          <div className="bg-yellow-900/30 border border-yellow-500 rounded-lg p-6 mb-8">
            <p className="text-yellow-200">
              You haven't submitted a registration form yet. Complete your profile to get started!
            </p>
          </div>
        )}

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center gap-3 mb-2">
              <Activity className="w-6 h-6 text-blue-500" />
              <h3 className="text-lg font-semibold">Current Weight</h3>
            </div>
            <p className="text-3xl font-bold text-blue-500">{latestWeight.toFixed(1)} kg</p>
            {weightChange !== 0 && (
              <p className={`text-sm mt-2 ${weightChange < 0 ? 'text-green-500' : 'text-red-500'}`}>
                {weightChange > 0 ? '+' : ''}{weightChange.toFixed(1)} kg from start
              </p>
            )}
          </div>

          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp className="w-6 h-6 text-green-500" />
              <h3 className="text-lg font-semibold">Goal Weight</h3>
            </div>
            <p className="text-3xl font-bold text-green-500">
              {goalWeight ? `${goalWeight.toFixed(1)} kg` : 'Not set'}
            </p>
            {goalWeight && (
              <p className="text-sm text-gray-400 mt-2">
                {Math.abs(latestWeight - goalWeight).toFixed(1)} kg to go
              </p>
            )}
          </div>

          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center gap-3 mb-2">
              <Calendar className="w-6 h-6 text-red-500" />
              <h3 className="text-lg font-semibold">Progress</h3>
            </div>
            <p className="text-3xl font-bold text-red-500">{progressPercentage.toFixed(0)}%</p>
            <div className="w-full bg-gray-700 rounded-full h-2 mt-3">
              <div
                className="bg-red-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>
        </div>

        {registration && (
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 mb-8">
            <div className="flex items-center gap-3 mb-4">
              <User className="w-6 h-6 text-blue-500" />
              <h2 className="text-2xl font-bold">Your Profile</h2>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <p className="text-gray-400 text-sm">Email</p>
                <p className="font-semibold">{registration.email}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Phone</p>
                <p className="font-semibold">{registration.phone}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Age</p>
                <p className="font-semibold">{registration.age} years</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Height</p>
                <p className="font-semibold">{registration.height} cm</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Fitness Goal</p>
                <p className="font-semibold capitalize">{registration.fitness_goal.replace('-', ' ')}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Activity Level</p>
                <p className="font-semibold capitalize">{registration.activity_level.replace('-', ' ')}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Status</p>
                <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                  registration.status === 'active' ? 'bg-green-900/50 text-green-300' :
                  registration.status === 'approved' ? 'bg-blue-900/50 text-blue-300' :
                  registration.status === 'pending' ? 'bg-yellow-900/50 text-yellow-300' :
                  'bg-gray-700 text-gray-300'
                }`}>
                  {registration.status}
                </span>
              </div>
            </div>
          </div>
        )}

        <div className="grid lg:grid-cols-2 gap-8">
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h2 className="text-2xl font-bold mb-4">Add Progress Entry</h2>
            <form onSubmit={handleAddProgress} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Current Weight (kg)
                </label>
                <input
                  type="number"
                  value={newWeight}
                  onChange={(e) => setNewWeight(e.target.value)}
                  step="0.1"
                  min="20"
                  max="300"
                  required
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
                  placeholder="70.5"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Notes (Optional)
                </label>
                <textarea
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  rows={3}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors resize-none"
                  placeholder="How are you feeling? Any observations?"
                />
              </div>
              <button
                type="submit"
                disabled={saving}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? 'Saving...' : 'Add Entry'}
              </button>
            </form>
          </div>

          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h2 className="text-2xl font-bold mb-4">Progress History</h2>
            {progress.length === 0 ? (
              <p className="text-gray-400 text-center py-8">No progress entries yet. Add your first entry!</p>
            ) : (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {progress.map((entry) => (
                  <div key={entry.id} className="bg-gray-900 rounded-lg p-4 border border-gray-700">
                    <div className="flex justify-between items-start mb-2">
                      <p className="text-2xl font-bold text-blue-500">{entry.weight.toFixed(1)} kg</p>
                      <p className="text-sm text-gray-400">
                        {new Date(entry.recorded_at).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </p>
                    </div>
                    {entry.notes && (
                      <p className="text-gray-300 text-sm">{entry.notes}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
