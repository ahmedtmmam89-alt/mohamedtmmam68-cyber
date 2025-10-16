import { useState } from 'react';
import { Calculator, TrendingDown, TrendingUp, Activity } from 'lucide-react';

export default function CalorieCalculator() {
  const [formData, setFormData] = useState({
    weight: '',
    height: '',
    age: '',
    gender: 'male',
    activityLevel: 'moderate',
  });

  const [results, setResults] = useState<{
    maintenance: number;
    cutting: number;
    bulking: number;
  } | null>(null);

  const activityLevels = [
    { value: 'sedentary', label: 'Sedentary (little/no exercise)', multiplier: 1.2 },
    { value: 'light', label: 'Light (1-3 days/week)', multiplier: 1.375 },
    { value: 'moderate', label: 'Moderate (3-5 days/week)', multiplier: 1.55 },
    { value: 'active', label: 'Active (6-7 days/week)', multiplier: 1.725 },
    { value: 'veryActive', label: 'Very Active (2x/day)', multiplier: 1.9 },
  ];

  const calculateCalories = (e: React.FormEvent) => {
    e.preventDefault();

    const weight = parseFloat(formData.weight);
    const height = parseFloat(formData.height);
    const age = parseFloat(formData.age);

    let bmr: number;
    if (formData.gender === 'male') {
      bmr = 10 * weight + 6.25 * height - 5 * age + 5;
    } else {
      bmr = 10 * weight + 6.25 * height - 5 * age - 161;
    }

    const activityMultiplier = activityLevels.find(
      (level) => level.value === formData.activityLevel
    )?.multiplier || 1.55;

    const maintenance = Math.round(bmr * activityMultiplier);
    const cutting = Math.round(maintenance - 500);
    const bulking = Math.round(maintenance + 300);

    setResults({ maintenance, cutting, bulking });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="min-h-screen py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12 animate-slide-up">
          <Calculator className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Calorie Calculator
          </h1>
          <p className="text-gray-400 text-lg">
            Calculate your daily calorie needs based on your goals
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Calculator Form */}
          <div className="bg-gray-800 rounded-lg p-8 border border-gray-700 animate-slide-up-delay">
            <h2 className="text-2xl font-semibold mb-6">Your Information</h2>
            <form onSubmit={calculateCalories} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Weight (kg)
                </label>
                <input
                  type="number"
                  name="weight"
                  value={formData.weight}
                  onChange={handleInputChange}
                  required
                  step="0.1"
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-red-500 transition-colors"
                  placeholder="70"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Height (cm)
                </label>
                <input
                  type="number"
                  name="height"
                  value={formData.height}
                  onChange={handleInputChange}
                  required
                  step="0.1"
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-red-500 transition-colors"
                  placeholder="175"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Age
                </label>
                <input
                  type="number"
                  name="age"
                  value={formData.age}
                  onChange={handleInputChange}
                  required
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-red-500 transition-colors"
                  placeholder="25"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Gender
                </label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleInputChange}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-red-500 transition-colors"
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Activity Level
                </label>
                <select
                  name="activityLevel"
                  value={formData.activityLevel}
                  onChange={handleInputChange}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-red-500 transition-colors"
                >
                  {activityLevels.map((level) => (
                    <option key={level.value} value={level.value}>
                      {level.label}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                className="w-full bg-red-500 hover:bg-red-600 text-white py-3 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105"
              >
                Calculate Calories
              </button>
            </form>
          </div>

          {/* Results */}
          <div className="space-y-4 animate-slide-up-delay-2">
            {results ? (
              <>
                <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg p-6 border border-gray-700">
                  <div className="flex items-center space-x-3 mb-4">
                    <Activity className="w-8 h-8 text-blue-500" />
                    <h3 className="text-xl font-semibold">Maintenance</h3>
                  </div>
                  <div className="text-4xl font-bold text-blue-500 mb-2">
                    {results.maintenance} <span className="text-lg text-gray-400">cal/day</span>
                  </div>
                  <p className="text-gray-400">
                    To maintain your current weight
                  </p>
                </div>

                <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg p-6 border border-gray-700">
                  <div className="flex items-center space-x-3 mb-4">
                    <TrendingDown className="w-8 h-8 text-green-500" />
                    <h3 className="text-xl font-semibold">Cutting</h3>
                  </div>
                  <div className="text-4xl font-bold text-green-500 mb-2">
                    {results.cutting} <span className="text-lg text-gray-400">cal/day</span>
                  </div>
                  <p className="text-gray-400">
                    For safe weight loss (0.5kg/week)
                  </p>
                </div>

                <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg p-6 border border-gray-700">
                  <div className="flex items-center space-x-3 mb-4">
                    <TrendingUp className="w-8 h-8 text-red-500" />
                    <h3 className="text-xl font-semibold">Bulking</h3>
                  </div>
                  <div className="text-4xl font-bold text-red-500 mb-2">
                    {results.bulking} <span className="text-lg text-gray-400">cal/day</span>
                  </div>
                  <p className="text-gray-400">
                    For lean muscle gain
                  </p>
                </div>

                <div className="bg-gray-800 rounded-lg p-6 border border-green-500">
                  <p className="text-green-400 font-semibold mb-2">
                    Great job taking the first step!
                  </p>
                  <p className="text-gray-300 text-sm">
                    Remember, these are estimates. For a personalized nutrition plan that adapts to your progress, consider joining our training program with daily or weekly follow-ups.
                  </p>
                </div>
              </>
            ) : (
              <div className="bg-gray-800 rounded-lg p-8 border border-gray-700 text-center">
                <Calculator className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-400 mb-2">
                  Fill in your details
                </h3>
                <p className="text-gray-500">
                  Enter your information on the left to calculate your daily calorie needs
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-12 bg-gray-800 rounded-lg p-8 border border-gray-700">
          <h3 className="text-2xl font-semibold mb-4">Understanding Your Results</h3>
          <div className="grid md:grid-cols-3 gap-6 text-sm text-gray-300">
            <div>
              <h4 className="font-semibold text-white mb-2">Maintenance Calories</h4>
              <p>
                This is the amount of calories you need to consume to maintain your current weight. Eat this amount consistently to stay at your current body composition.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-2">Cutting Calories</h4>
              <p>
                To lose fat safely, aim for this calorie target. A 500-calorie deficit typically results in about 0.5kg of fat loss per week when combined with proper training.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-2">Bulking Calories</h4>
              <p>
                To build muscle, you need a slight calorie surplus. This target helps you gain lean muscle while minimizing fat gain when paired with resistance training.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
