import { useState } from 'react';
import { Apple, TrendingDown, TrendingUp, Activity } from 'lucide-react';

export default function FoodSuggestions() {
  const [selectedGoal, setSelectedGoal] = useState<'cutting' | 'maintenance' | 'bulking'>('maintenance');

  const goals = [
    {
      id: 'cutting' as const,
      name: 'Cutting',
      icon: TrendingDown,
      color: 'green',
      description: 'High protein, lower calories for fat loss',
    },
    {
      id: 'maintenance' as const,
      name: 'Maintenance',
      icon: Activity,
      color: 'blue',
      description: 'Balanced nutrition to maintain weight',
    },
    {
      id: 'bulking' as const,
      name: 'Bulking',
      icon: TrendingUp,
      color: 'red',
      description: 'Higher calories for muscle gain',
    },
  ];

  const mealPlans = {
    cutting: {
      breakfast: [
        { name: 'Greek Yogurt Bowl', calories: 250, protein: 20, carbs: 30, fats: 5, description: 'Greek yogurt with berries, almonds, and honey' },
        { name: 'Egg White Omelette', calories: 200, protein: 25, carbs: 10, fats: 6, description: 'Egg whites with spinach, tomatoes, and mushrooms' },
        { name: 'Protein Oatmeal', calories: 280, protein: 18, carbs: 35, fats: 8, description: 'Oats with protein powder, banana, and cinnamon' },
      ],
      lunch: [
        { name: 'Grilled Chicken Salad', calories: 350, protein: 40, carbs: 20, fats: 12, description: 'Mixed greens, grilled chicken, vegetables, light dressing' },
        { name: 'Tuna Wrap', calories: 320, protein: 35, carbs: 30, fats: 8, description: 'Whole wheat wrap with tuna, lettuce, cucumber' },
        { name: 'Turkey & Veggie Bowl', calories: 340, protein: 38, carbs: 25, fats: 10, description: 'Lean turkey with quinoa and roasted vegetables' },
      ],
      dinner: [
        { name: 'Baked Salmon', calories: 400, protein: 45, carbs: 20, fats: 15, description: 'Salmon fillet with sweet potato and broccoli' },
        { name: 'Chicken Stir-fry', calories: 380, protein: 42, carbs: 30, fats: 12, description: 'Chicken breast with mixed vegetables and brown rice' },
        { name: 'Lean Beef & Veggies', calories: 390, protein: 40, carbs: 25, fats: 14, description: 'Lean beef with cauliflower rice and green beans' },
      ],
      snacks: [
        { name: 'Protein Shake', calories: 150, protein: 25, carbs: 10, fats: 2, description: 'Whey protein with water or almond milk' },
        { name: 'Cottage Cheese', calories: 120, protein: 18, carbs: 8, fats: 3, description: 'Low-fat cottage cheese with cucumber' },
        { name: 'Hard-boiled Eggs', calories: 140, protein: 12, carbs: 2, fats: 10, description: '2 hard-boiled eggs' },
      ],
    },
    maintenance: {
      breakfast: [
        { name: 'Whole Grain Toast & Eggs', calories: 350, protein: 22, carbs: 40, fats: 12, description: 'Whole grain bread with scrambled eggs and avocado' },
        { name: 'Protein Pancakes', calories: 380, protein: 25, carbs: 45, fats: 10, description: 'Pancakes with protein powder, topped with berries' },
        { name: 'Smoothie Bowl', calories: 360, protein: 20, carbs: 50, fats: 10, description: 'Protein smoothie with granola and fruit' },
      ],
      lunch: [
        { name: 'Chicken Burrito Bowl', calories: 500, protein: 40, carbs: 50, fats: 18, description: 'Rice, chicken, beans, salsa, and guacamole' },
        { name: 'Pasta with Chicken', calories: 520, protein: 38, carbs: 55, fats: 16, description: 'Whole wheat pasta with grilled chicken and marinara' },
        { name: 'Salmon Poke Bowl', calories: 480, protein: 35, carbs: 48, fats: 18, description: 'Salmon with rice, edamame, and vegetables' },
      ],
      dinner: [
        { name: 'Steak & Potatoes', calories: 550, protein: 45, carbs: 50, fats: 20, description: 'Lean steak with roasted potatoes and asparagus' },
        { name: 'Chicken Fajitas', calories: 520, protein: 42, carbs: 48, fats: 18, description: 'Chicken fajitas with peppers, onions, and tortillas' },
        { name: 'Fish Tacos', calories: 500, protein: 38, carbs: 52, fats: 16, description: 'Grilled fish tacos with cabbage slaw and avocado' },
      ],
      snacks: [
        { name: 'Peanut Butter & Apple', calories: 200, protein: 8, carbs: 25, fats: 10, description: 'Apple slices with natural peanut butter' },
        { name: 'Trail Mix', calories: 180, protein: 6, carbs: 20, fats: 10, description: 'Mixed nuts and dried fruit' },
        { name: 'Greek Yogurt', calories: 150, protein: 15, carbs: 18, fats: 4, description: 'Greek yogurt with honey' },
      ],
    },
    bulking: {
      breakfast: [
        { name: 'Protein Breakfast Burrito', calories: 550, protein: 35, carbs: 60, fats: 18, description: 'Eggs, cheese, potatoes, and sausage in tortilla' },
        { name: 'Loaded Oatmeal', calories: 500, protein: 28, carbs: 70, fats: 15, description: 'Oats with protein powder, nuts, banana, and honey' },
        { name: 'Steak & Eggs', calories: 580, protein: 45, carbs: 30, fats: 28, description: 'Lean steak with 3 whole eggs and toast' },
      ],
      lunch: [
        { name: 'Double Chicken Bowl', calories: 700, protein: 60, carbs: 75, fats: 20, description: 'Extra chicken with rice, beans, and avocado' },
        { name: 'Loaded Pasta', calories: 720, protein: 50, carbs: 85, fats: 22, description: 'Pasta with meat sauce, cheese, and garlic bread' },
        { name: 'Beef & Rice Bowl', calories: 680, protein: 55, carbs: 70, fats: 22, description: 'Ground beef with rice, vegetables, and cheese' },
      ],
      dinner: [
        { name: 'Ribeye & Sweet Potato', calories: 750, protein: 55, carbs: 65, fats: 30, description: 'Ribeye steak with large sweet potato and butter' },
        { name: 'Chicken Parmesan', calories: 720, protein: 58, carbs: 70, fats: 25, description: 'Breaded chicken with pasta and cheese' },
        { name: 'Salmon & Quinoa', calories: 680, protein: 50, carbs: 60, fats: 28, description: 'Fatty salmon with quinoa and roasted vegetables' },
      ],
      snacks: [
        { name: 'Mass Gainer Shake', calories: 400, protein: 30, carbs: 50, fats: 10, description: 'Protein powder with milk, banana, and peanut butter' },
        { name: 'Bagel with Cream Cheese', calories: 350, protein: 12, carbs: 50, fats: 12, description: 'Whole grain bagel with cream cheese' },
        { name: 'Protein Bars', calories: 300, protein: 20, carbs: 35, fats: 10, description: 'High-protein energy bar' },
      ],
    },
  };

  const currentPlan = mealPlans[selectedGoal];

  return (
    <div className="min-h-screen py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12 animate-slide-up">
          <Apple className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Food Suggestions
          </h1>
          <p className="text-gray-400 text-lg">
            Healthy meal recommendations based on your fitness goals
          </p>
        </div>

        {/* Goal Selection */}
        <div className="grid md:grid-cols-3 gap-6 mb-12 animate-slide-up-delay">
          {goals.map((goal) => {
            const Icon = goal.icon;
            const isSelected = selectedGoal === goal.id;
            return (
              <button
                key={goal.id}
                onClick={() => setSelectedGoal(goal.id)}
                className={`p-6 rounded-lg border-2 transition-all duration-300 transform hover:scale-105 ${
                  isSelected
                    ? `border-${goal.color}-500 bg-${goal.color}-500/10`
                    : 'border-gray-700 bg-gray-800 hover:border-gray-600'
                }`}
              >
                <Icon className={`w-12 h-12 ${isSelected ? `text-${goal.color}-500` : 'text-gray-400'} mx-auto mb-3`} />
                <h3 className="text-xl font-semibold mb-2">{goal.name}</h3>
                <p className="text-gray-400 text-sm">{goal.description}</p>
              </button>
            );
          })}
        </div>

        {/* Meal Suggestions */}
        <div className="space-y-8">
          {/* Breakfast */}
          <div className="animate-slide-up-delay-2">
            <h2 className="text-3xl font-bold mb-6 flex items-center">
              <span className="text-red-500 mr-3">Breakfast</span>
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              {currentPlan.breakfast.map((meal, index) => (
                <MealCard key={index} meal={meal} />
              ))}
            </div>
          </div>

          {/* Lunch */}
          <div className="animate-slide-up-delay-3">
            <h2 className="text-3xl font-bold mb-6 flex items-center">
              <span className="text-red-500 mr-3">Lunch</span>
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              {currentPlan.lunch.map((meal, index) => (
                <MealCard key={index} meal={meal} />
              ))}
            </div>
          </div>

          {/* Dinner */}
          <div className="animate-slide-up-delay-4">
            <h2 className="text-3xl font-bold mb-6 flex items-center">
              <span className="text-red-500 mr-3">Dinner</span>
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              {currentPlan.dinner.map((meal, index) => (
                <MealCard key={index} meal={meal} />
              ))}
            </div>
          </div>

          {/* Snacks */}
          <div className="animate-slide-up-delay-5">
            <h2 className="text-3xl font-bold mb-6 flex items-center">
              <span className="text-red-500 mr-3">Snacks</span>
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              {currentPlan.snacks.map((meal, index) => (
                <MealCard key={index} meal={meal} />
              ))}
            </div>
          </div>
        </div>

        {/* Nutrition Tips */}
        <div className="mt-12 bg-gray-800 rounded-lg p-8 border border-gray-700">
          <h3 className="text-2xl font-semibold mb-6">Nutrition Tips</h3>
          <div className="grid md:grid-cols-2 gap-6 text-gray-300">
            <div>
              <h4 className="font-semibold text-white mb-2">Stay Hydrated</h4>
              <p className="text-sm">
                Drink at least 2-3 liters of water daily. Proper hydration improves performance, recovery, and helps control appetite.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-2">Meal Timing</h4>
              <p className="text-sm">
                Eat protein within 2 hours post-workout for optimal recovery. Spread your meals throughout the day to maintain energy levels.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-2">Protein Priority</h4>
              <p className="text-sm">
                Aim for 1.6-2.2g of protein per kg of body weight daily. Protein supports muscle growth, recovery, and helps you feel full.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-2">Flexible Approach</h4>
              <p className="text-sm">
                These are suggestions, not strict rules. An 80/20 approach (80% whole foods, 20% flexibility) is sustainable long-term.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface Meal {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  description: string;
}

function MealCard({ meal }: { meal: Meal }) {
  return (
    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 hover:border-red-500 transition-all duration-300 hover:transform hover:scale-105">
      <h3 className="text-xl font-semibold mb-2">{meal.name}</h3>
      <p className="text-gray-400 text-sm mb-4">{meal.description}</p>

      <div className="space-y-2 mb-4">
        <div className="flex justify-between text-sm">
          <span className="text-gray-400">Calories:</span>
          <span className="font-semibold text-red-500">{meal.calories} kcal</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-400">Protein:</span>
          <span className="font-semibold">{meal.protein}g</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-400">Carbs:</span>
          <span className="font-semibold">{meal.carbs}g</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-400">Fats:</span>
          <span className="font-semibold">{meal.fats}g</span>
        </div>
      </div>
    </div>
  );
}
