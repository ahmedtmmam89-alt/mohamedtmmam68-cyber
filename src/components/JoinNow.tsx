import { useState, useEffect } from 'react';
import { UserPlus, Check, Dumbbell, Zap, Target, Waves, Circle, Activity, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import OfferCountdown from './OfferCountdown';

interface Sport {
  id: string;
  name: string;
  slug: string;
  icon: string;
  description: string;
}

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  display_order: number;
}

interface PricingPlan {
  id: string;
  category_id: string;
  sport_id: string;
  price: number;
  currency: string;
  features: string[];
  category_name: string;
  sport_name: string;
}

interface ActiveOffer {
  offer_id: string;
  offer_price: number;
  discount_percentage: number;
  end_date: string;
}

const iconMap: Record<string, any> = {
  dumbbell: Dumbbell,
  zap: Zap,
  target: Target,
  waves: Waves,
  circle: Circle,
  activity: Activity,
};

export default function JoinNow() {
  const [sports, setSports] = useState<Sport[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [pricingPlans, setPricingPlans] = useState<PricingPlan[]>([]);
  const [activeOffers, setActiveOffers] = useState<Record<string, ActiveOffer>>({});

  const [selectedSport, setSelectedSport] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    age: '',
    weight: '',
    height: '',
    goalWeight: '',
    activityLevel: 'sedentary',
    dietaryPreferences: '',
    medicalConditions: '',
    fitnessGoal: 'weight-loss',
  });

  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (selectedSport && selectedCategory) {
      loadActiveOffers();
    }
  }, [selectedSport, selectedCategory]);

  const loadInitialData = async () => {
    try {
      const [sportsData, categoriesData, plansData] = await Promise.all([
        supabase.from('sports').select('*').eq('is_active', true).order('name'),
        supabase.from('athlete_categories').select('*').order('display_order'),
        supabase
          .from('pricing_plans')
          .select(`
            *,
            athlete_categories!inner(name),
            sports!inner(name)
          `)
          .eq('is_active', true),
      ]);

      if (sportsData.data) setSports(sportsData.data);
      if (categoriesData.data) setCategories(categoriesData.data);

      if (plansData.data) {
        const formattedPlans = plansData.data.map((plan: any) => ({
          id: plan.id,
          category_id: plan.category_id,
          sport_id: plan.sport_id,
          price: plan.price,
          currency: plan.currency,
          features: plan.features || [],
          category_name: plan.athlete_categories.name,
          sport_name: plan.sports.name,
        }));
        setPricingPlans(formattedPlans);
      }

      if (sportsData.data && sportsData.data.length > 0) {
        setSelectedSport(sportsData.data[0].id);
      }
      if (categoriesData.data && categoriesData.data.length > 0) {
        setSelectedCategory(categoriesData.data[0].id);
      }
    } catch (err) {
      console.error('Error loading data:', err);
    }
  };

  const loadActiveOffers = async () => {
    try {
      const { data, error } = await supabase.rpc('update_offer_status');

      const { data: offersData } = await supabase
        .from('price_offers')
        .select('*, pricing_plans!inner(*)')
        .eq('status', 'active')
        .lte('start_date', new Date().toISOString())
        .gte('end_date', new Date().toISOString());

      if (offersData) {
        const offersMap: Record<string, ActiveOffer> = {};
        offersData.forEach((offer: any) => {
          offersMap[offer.pricing_plan_id] = {
            offer_id: offer.id,
            offer_price: offer.offer_price,
            discount_percentage: offer.discount_percentage,
            end_date: offer.end_date,
          };
        });
        setActiveOffers(offersMap);
      }
    } catch (err) {
      console.error('Error loading offers:', err);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const selectedPlan = pricingPlans.find(
      (p) => p.category_id === selectedCategory && p.sport_id === selectedSport
    );

    if (!selectedPlan) {
      setError('Please select a valid plan');
      setLoading(false);
      return;
    }

    try {
      const { error: insertError } = await supabase.from('client_registrations').insert({
        full_name: formData.name,
        email: formData.email,
        phone: formData.phone,
        age: parseInt(formData.age),
        weight: parseFloat(formData.weight),
        height: parseFloat(formData.height),
        goal_weight: formData.goalWeight ? parseFloat(formData.goalWeight) : null,
        fitness_goal: formData.fitnessGoal,
        activity_level: formData.activityLevel,
        dietary_preferences: formData.dietaryPreferences,
        medical_conditions: formData.medicalConditions,
        status: 'pending',
      });

      if (insertError) throw insertError;

      setSubmitted(true);
    } catch (err: any) {
      setError(err.message || 'Failed to submit registration');
    } finally {
      setLoading(false);
    }
  };

  const getIconComponent = (iconName: string) => {
    return iconMap[iconName] || Dumbbell;
  };

  const selectedPlan = pricingPlans.find(
    (p) => p.category_id === selectedCategory && p.sport_id === selectedSport
  );

  const selectedPlanOffer = selectedPlan ? activeOffers[selectedPlan.id] : null;
  const displayPrice = selectedPlanOffer ? selectedPlanOffer.offer_price : selectedPlan?.price;
  const hasActiveOffer = !!selectedPlanOffer;

  if (submitted) {
    return (
      <div className="min-h-screen py-20 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <div className="max-w-2xl mx-auto text-center animate-slide-up">
          <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Welcome Aboard, {formData.name}!
          </h1>
          <p className="text-xl text-gray-300 mb-8">
            Thank you for joining FitPro Trainer. We're excited to help you achieve your fitness goals!
          </p>
          <div className="bg-gray-800 rounded-lg p-8 border border-gray-700 text-left mb-8">
            <h3 className="text-2xl font-semibold mb-4">What Happens Next?</h3>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-white font-bold">1</span>
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Check Your Email</h4>
                  <p className="text-gray-400 text-sm">
                    You'll receive a welcome email at {formData.email} with next steps and access to your training portal.
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-white font-bold">2</span>
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Initial Consultation</h4>
                  <p className="text-gray-400 text-sm">
                    We'll schedule your first consultation to discuss your goals, assess your current fitness level, and create your personalized plan.
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-white font-bold">3</span>
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Start Your Journey</h4>
                  <p className="text-gray-400 text-sm">
                    Begin your transformation with professional guidance and support!
                  </p>
                </div>
              </div>
            </div>
          </div>
          <button
            onClick={() => setSubmitted(false)}
            className="bg-red-500 hover:bg-red-600 text-white px-8 py-3 rounded-lg font-semibold transition-all duration-300"
          >
            Submit Another Application
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12 animate-slide-up">
          <UserPlus className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Join My Gym</h1>
          <p className="text-gray-400 text-lg">
            Choose your sport and athlete level to start your transformation
          </p>
        </div>

        {/* Sport Selection */}
        <div className="mb-12 animate-slide-up-delay">
          <h2 className="text-2xl font-bold mb-6 text-center">Select Your Sport</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {sports.map((sport) => {
              const Icon = getIconComponent(sport.icon);
              const isSelected = selectedSport === sport.id;
              return (
                <button
                  key={sport.id}
                  onClick={() => setSelectedSport(sport.id)}
                  className={`p-6 rounded-lg border-2 transition-all duration-300 ${
                    isSelected
                      ? 'border-red-500 bg-red-500/10 shadow-lg shadow-red-500/20'
                      : 'border-gray-700 bg-gray-800 hover:border-gray-600'
                  }`}
                >
                  <Icon className={`w-10 h-10 mx-auto mb-2 ${isSelected ? 'text-red-500' : 'text-gray-400'}`} />
                  <div className="text-sm font-semibold text-center">{sport.name}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Category Selection with Pricing */}
        <div className="mb-12 animate-slide-up-delay-2">
          <h2 className="text-2xl font-bold mb-6 text-center">Choose Your Athlete Level</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {categories.map((category) => {
              const plan = pricingPlans.find(
                (p) => p.category_id === category.id && p.sport_id === selectedSport
              );
              const isSelected = selectedCategory === category.id;
              const offer = plan ? activeOffers[plan.id] : null;
              const price = offer ? offer.offer_price : plan?.price;
              const hasOffer = !!offer;

              return (
                <div
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`relative bg-gray-800 rounded-lg p-6 border-2 transition-all duration-300 cursor-pointer ${
                    isSelected
                      ? 'border-red-500 shadow-lg shadow-red-500/20 transform scale-105'
                      : 'border-gray-700 hover:border-gray-600'
                  }`}
                >
                  {category.slug === 'midterm' && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <span className="bg-red-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
                        Most Popular
                      </span>
                    </div>
                  )}

                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold">{category.name}</h3>
                    <div
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                        isSelected ? 'border-red-500 bg-red-500' : 'border-gray-600'
                      }`}
                    >
                      {isSelected && <Check className="w-4 h-4 text-white" />}
                    </div>
                  </div>

                  <p className="mb-4">{category.description}</p>

                  {hasOffer && offer && (
                    <OfferCountdown endDate={offer.end_date} onExpire={loadActiveOffers} />
                  )}

                  <div className="mb-4">
                    {hasOffer && (
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-gray-400 line-through text-lg">{plan?.price} EGP</span>
                        <span className="bg-green-500 text-white text-xs font-bold px-2 py-1 rounded">
                          Save {offer?.discount_percentage}%
                        </span>
                      </div>
                    )}
                    <div className="flex items-baseline">
                      <span className="text-4xl font-bold text-red-500">{price}</span>
                      <span className="text-gray-400 ml-2">EGP/month</span>
                    </div>
                  </div>

                  {plan && plan.features && (
                    <div className="space-y-2">
                      {plan.features.map((feature: string, index: number) => (
                        <div key={index} className="flex items-start space-x-2">
                          <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                          <span className="text-sm">{feature}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Call-to-action banner when no offer */}
        {!hasActiveOffer && selectedPlan && (
          <div className="mb-8 animate-slide-up-delay-3">
            <div className="bg-gradient-to-r from-red-500 to-orange-500 rounded-lg p-6 text-center">
              <AlertCircle className="w-12 h-12 text-white mx-auto mb-3" />
              <h3 className="text-2xl font-bold text-white mb-2">
                Join Now Before Price Increases
              </h3>
              <p className="text-white/90">
                Lock in today's price and start your transformation journey
              </p>
            </div>
          </div>
        )}

        {/* Sign-up Form */}
        <div className="max-w-3xl mx-auto bg-gray-800 rounded-lg p-8 border border-gray-700 animate-slide-up-delay-3">
          <h2 className="text-3xl font-bold mb-6">Your Information</h2>
          {error && (
            <div className="mb-6 bg-red-900/50 border border-red-500 text-red-200 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-red-500 transition-colors"
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Email Address</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-red-500 transition-colors"
                  placeholder="john@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Phone Number</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-red-500 transition-colors"
                  placeholder="+20 123 456 7890"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Age</label>
                <input
                  type="number"
                  name="age"
                  value={formData.age}
                  onChange={handleInputChange}
                  required
                  min="13"
                  max="100"
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-red-500 transition-colors"
                  placeholder="25"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Current Weight (kg)</label>
                <input
                  type="number"
                  name="weight"
                  value={formData.weight}
                  onChange={handleInputChange}
                  required
                  step="0.1"
                  min="20"
                  max="300"
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-red-500 transition-colors"
                  placeholder="70.5"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Height (cm)</label>
                <input
                  type="number"
                  name="height"
                  value={formData.height}
                  onChange={handleInputChange}
                  required
                  step="0.1"
                  min="100"
                  max="250"
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-red-500 transition-colors"
                  placeholder="175"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Goal Weight (kg)</label>
                <input
                  type="number"
                  name="goalWeight"
                  value={formData.goalWeight}
                  onChange={handleInputChange}
                  step="0.1"
                  min="20"
                  max="300"
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-red-500 transition-colors"
                  placeholder="65"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Fitness Goal</label>
                <select
                  name="fitnessGoal"
                  value={formData.fitnessGoal}
                  onChange={handleInputChange}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-red-500 transition-colors"
                >
                  <option value="weight-loss">Weight Loss</option>
                  <option value="muscle-gain">Muscle Gain</option>
                  <option value="maintenance">Maintenance</option>
                  <option value="athletic-performance">Athletic Performance</option>
                  <option value="general-fitness">General Fitness</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Activity Level</label>
                <select
                  name="activityLevel"
                  value={formData.activityLevel}
                  onChange={handleInputChange}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-red-500 transition-colors"
                >
                  <option value="sedentary">Sedentary (Little to no exercise)</option>
                  <option value="light">Light (Exercise 1-3 days/week)</option>
                  <option value="moderate">Moderate (Exercise 3-5 days/week)</option>
                  <option value="active">Active (Exercise 6-7 days/week)</option>
                  <option value="very-active">Very Active (Physical job or training twice per day)</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Dietary Preferences (Optional)
                </label>
                <input
                  type="text"
                  name="dietaryPreferences"
                  value={formData.dietaryPreferences}
                  onChange={handleInputChange}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-red-500 transition-colors"
                  placeholder="e.g., Vegetarian, Vegan, No dairy"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Medical Conditions (Optional)
                </label>
                <input
                  type="text"
                  name="medicalConditions"
                  value={formData.medicalConditions}
                  onChange={handleInputChange}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-red-500 transition-colors"
                  placeholder="Any injuries or medical conditions we should know about"
                />
              </div>
            </div>

            <div className="bg-gray-900 rounded-lg p-6 border border-gray-700">
              <h3 className="font-semibold mb-3">Selected Plan Summary</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-gray-300">
                  <span>Sport:</span>
                  <span className="font-semibold">{sports.find((s) => s.id === selectedSport)?.name}</span>
                </div>
                <div className="flex justify-between text-gray-300">
                  <span>Level:</span>
                  <span className="font-semibold">{categories.find((c) => c.id === selectedCategory)?.name}</span>
                </div>
                {selectedPlanOffer && (
                  <div className="flex justify-between text-green-400">
                    <span>Discount:</span>
                    <span className="font-semibold">{selectedPlanOffer.discount_percentage}% OFF</span>
                  </div>
                )}
                <div className="flex justify-between items-center pt-2 border-t border-gray-700">
                  <span className="text-lg font-semibold">Total:</span>
                  <div className="text-right">
                    {selectedPlanOffer && (
                      <div className="text-gray-400 line-through text-sm">{selectedPlan?.price} EGP</div>
                    )}
                    <div className="text-2xl font-bold text-red-500">
                      {displayPrice} EGP
                      <span className="text-sm text-gray-400 font-normal">/month</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-red-500 hover:bg-red-600 text-white py-4 rounded-lg text-lg font-semibold transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {loading ? 'Submitting...' : 'Complete Registration'}
            </button>

            <p className="text-center text-gray-400 text-sm">
              By registering, you agree to our terms of service and privacy policy.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
