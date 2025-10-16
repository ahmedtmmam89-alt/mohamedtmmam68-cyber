import { useState, useEffect } from 'react';
import { User, Dumbbell, ShoppingCart, Clock, Tag } from 'lucide-react';
import { supabase } from '../lib/supabase';
import PaymentConfirmation from './PaymentConfirmation';

type AthleteProgram = {
  id: string;
  name: string;
  gender: 'male' | 'female';
  category: 'normal' | 'advanced' | 'premium';
  duration_weeks: number;
  description: string;
  price: number;
  offer_price: number | null;
  file_url: string;
  is_active: boolean;
};

export default function AthletePrograms() {
  const [programs, setPrograms] = useState<AthleteProgram[]>([]);
  const [selectedGender, setSelectedGender] = useState<'male' | 'female'>('male');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'normal' | 'advanced' | 'premium'>('all');
  const [loading, setLoading] = useState(true);
  const [selectedProgram, setSelectedProgram] = useState<AthleteProgram | null>(null);
  const [showPaymentForm, setShowPaymentForm] = useState(false);

  useEffect(() => {
    loadPrograms();
  }, []);

  const loadPrograms = async () => {
    try {
      const { data, error } = await supabase
        .from('athlete_programs')
        .select('*')
        .eq('is_active', true)
        .order('category', { ascending: true })
        .order('name', { ascending: true });

      if (error) throw error;
      setPrograms(data || []);
    } catch (error) {
      console.error('Error loading programs:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredPrograms = programs.filter(
    (p) =>
      p.gender === selectedGender &&
      (selectedCategory === 'all' || p.category === selectedCategory)
  );

  const handlePurchaseClick = (program: AthleteProgram) => {
    setSelectedProgram(program);
    setShowPaymentForm(true);
  };

  const getCategoryBadgeColor = (category: string) => {
    switch (category) {
      case 'normal':
        return 'bg-blue-500';
      case 'advanced':
        return 'bg-orange-500';
      case 'premium':
        return 'bg-purple-600';
      default:
        return 'bg-gray-500';
    }
  };

  const getCategoryLabel = (category: string) => {
    return category.charAt(0).toUpperCase() + category.slice(1);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading programs...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            <Dumbbell className="inline-block w-12 h-12 text-red-500 mb-2" />
            <br />
            Athlete Programs
          </h1>
          <p className="text-xl text-gray-300">
            Professional training programs tailored for your goals
          </p>
        </div>

        <div className="mb-8 flex flex-col md:flex-row gap-4 items-center justify-center">
          <div className="flex gap-2">
            <button
              onClick={() => setSelectedGender('male')}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${
                selectedGender === 'male'
                  ? 'bg-red-500 text-white'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              <User className="w-5 h-5" />
              Male Programs
            </button>
            <button
              onClick={() => setSelectedGender('female')}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${
                selectedGender === 'female'
                  ? 'bg-red-500 text-white'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              <User className="w-5 h-5" />
              Female Programs
            </button>
          </div>

          <div className="flex gap-2 flex-wrap justify-center">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                selectedCategory === 'all'
                  ? 'bg-gray-700 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setSelectedCategory('normal')}
              className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                selectedCategory === 'normal'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              Normal
            </button>
            <button
              onClick={() => setSelectedCategory('advanced')}
              className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                selectedCategory === 'advanced'
                  ? 'bg-orange-500 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              Advanced
            </button>
            <button
              onClick={() => setSelectedCategory('premium')}
              className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                selectedCategory === 'premium'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              Premium
            </button>
          </div>
        </div>

        {filteredPrograms.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg">No programs available in this category</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPrograms.map((program) => (
              <div
                key={program.id}
                className="bg-gray-800 rounded-xl overflow-hidden hover:transform hover:scale-105 transition-all duration-300 border-2 border-gray-700"
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <span
                      className={`${getCategoryBadgeColor(
                        program.category
                      )} text-white text-xs font-bold px-3 py-1 rounded-full`}
                    >
                      {getCategoryLabel(program.category)}
                    </span>
                    <div className="flex items-center text-gray-400 text-sm">
                      <Clock className="w-4 h-4 mr-1" />
                      {program.duration_weeks} weeks
                    </div>
                  </div>

                  <h3 className="text-xl font-bold mb-3">{program.name}</h3>
                  <p className="text-gray-400 text-sm mb-6 line-clamp-3">
                    {program.description}
                  </p>

                  <div className="mb-4">
                    {program.offer_price ? (
                      <div className="flex items-center gap-2">
                        <span className="text-3xl font-bold text-red-500">
                          {program.offer_price} EGP
                        </span>
                        <span className="text-lg text-gray-500 line-through">
                          {program.price} EGP
                        </span>
                        <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                          OFFER
                        </span>
                      </div>
                    ) : (
                      <span className="text-3xl font-bold">{program.price} EGP</span>
                    )}
                    {program.offer_price && program.category !== 'premium' && (
                      <p className="text-xs text-gray-400 mt-1">
                        3-day offer • Every two weeks: {program.price} EGP
                      </p>
                    )}
                  </div>

                  <button
                    onClick={() => handlePurchaseClick(program)}
                    className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-3 rounded-lg transition-all duration-300 flex items-center justify-center gap-2"
                  >
                    <ShoppingCart className="w-5 h-5" />
                    Confirm Payment Manually
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-12 bg-gray-800 rounded-xl p-6 border border-gray-700">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <Tag className="w-6 h-6 text-red-500" />
            Pricing Plans
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-900 p-4 rounded-lg border border-blue-500">
              <h3 className="text-lg font-bold text-blue-400 mb-2">Normal Athlete Plan</h3>
              <p className="text-2xl font-bold mb-1">300 EGP</p>
            </div>
            <div className="bg-gray-900 p-4 rounded-lg border border-orange-500">
              <h3 className="text-lg font-bold text-orange-400 mb-2">Advanced Athlete Plan</h3>
              <p className="text-2xl font-bold mb-1">600 EGP</p>
            </div>
            <div className="bg-gray-900 p-4 rounded-lg border border-purple-600">
              <h3 className="text-lg font-bold text-purple-400 mb-2">Expert</h3>
              <p className="text-2xl font-bold mb-1">900 EGP</p>
            </div>
          </div>
        </div>
      </div>

      {showPaymentForm && selectedProgram && (
        <PaymentConfirmation
          program={selectedProgram}
          onClose={() => {
            setShowPaymentForm(false);
            setSelectedProgram(null);
          }}
        />
      )}
    </div>
  );
}
