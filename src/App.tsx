import { useState } from 'react';
import { Dumbbell, Calculator, Apple, UserPlus, Menu, X, Instagram, Facebook, Mail, Phone, LogIn, Trophy } from 'lucide-react';
import HomePage from './components/HomePage';
import CalorieCalculator from './components/CalorieCalculator';
import FoodSuggestions from './components/FoodSuggestions';
import JoinNow from './components/JoinNow';
import AthletePrograms from './components/AthletePrograms';
import Auth from './components/Auth';
import ClientDashboard from './components/ClientDashboard';
import TrainerDashboard from './components/TrainerDashboard';
import { AuthProvider, useAuth } from './contexts/AuthContext';

function AppContent() {
  const [currentPage, setCurrentPage] = useState('home');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const { user, profile, loading } = useAuth();

  const navigation = [
    { name: 'Home', id: 'home', icon: Dumbbell },
    { name: 'Calculator', id: 'calculator', icon: Calculator },
    { name: 'Food Plan', id: 'food', icon: Apple },
    { name: 'Programs', id: 'programs', icon: Trophy },
    { name: 'Join Now', id: 'join', icon: UserPlus },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (user && profile) {
    if (profile.role === 'trainer') {
      return <TrainerDashboard />;
    } else {
      return <ClientDashboard />;
    }
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage onJoinClick={() => setCurrentPage('join')} />;
      case 'calculator':
        return <CalorieCalculator />;
      case 'food':
        return <FoodSuggestions />;
      case 'programs':
        return <AthletePrograms />;
      case 'join':
        return <JoinNow />;
      default:
        return <HomePage onJoinClick={() => setCurrentPage('join')} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 bg-gray-900/95 backdrop-blur-sm border-b border-gray-800 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-2">
              <Dumbbell className="w-8 h-8 text-red-500" />
              <span className="text-xl font-bold">FitPro Trainer</span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-1">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setCurrentPage(item.id);
                      setMobileMenuOpen(false);
                    }}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-300 ${
                      currentPage === item.id
                        ? 'bg-red-500 text-white'
                        : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.name}</span>
                  </button>
                );
              })}
              <button
                onClick={() => setShowAuth(true)}
                className="flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-300 bg-blue-600 hover:bg-blue-700 text-white ml-2"
              >
                <LogIn className="w-4 h-4" />
                <span>Sign In</span>
              </button>
            </div>

            {/* Mobile buttons */}
            <div className="md:hidden flex items-center gap-2">
              <button
                onClick={() => setShowAuth(true)}
                className="p-2 rounded-lg hover:bg-gray-800"
              >
                <LogIn className="w-5 h-5" />
              </button>
              <button
                className="p-2 rounded-lg hover:bg-gray-800"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-gray-800 border-t border-gray-700">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setCurrentPage(item.id);
                      setMobileMenuOpen(false);
                    }}
                    className={`flex items-center space-x-2 w-full px-4 py-3 rounded-lg transition-all duration-300 ${
                      currentPage === item.id
                        ? 'bg-red-500 text-white'
                        : 'text-gray-300 hover:bg-gray-700'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <main className="pt-16">
        {renderPage()}
      </main>

      {/* Auth Modal */}
      {showAuth && <Auth onClose={() => setShowAuth(false)} />}

      {/* Footer */}
      <footer className="bg-gray-950 border-t border-gray-800 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Dumbbell className="w-6 h-6 text-red-500" />
                <span className="text-lg font-bold">FitPro Trainer</span>
              </div>
              <p className="text-gray-400">
                Transform your body and mind with personalized training programs designed for your success.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Contact</h3>
              <div className="space-y-2">
                <a href="mailto:trainer@fitpro.com" className="flex items-center space-x-2 text-gray-400 hover:text-red-500 transition-colors">
                  <Mail className="w-4 h-4" />
                  <span>trainer@fitpro.com</span>
                </a>
                <a href="tel:+1234567890" className="flex items-center space-x-2 text-gray-400 hover:text-red-500 transition-colors">
                  <Phone className="w-4 h-4" />
                  <span>+1 (234) 567-890</span>
                </a>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Follow Us</h3>
              <div className="flex space-x-4">
                <a href="#" className="p-2 bg-gray-800 rounded-lg hover:bg-red-500 transition-colors">
                  <Instagram className="w-5 h-5" />
                </a>
                <a href="#" className="p-2 bg-gray-800 rounded-lg hover:bg-red-500 transition-colors">
                  <Facebook className="w-5 h-5" />
                </a>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center">
            <button
              onClick={() => setCurrentPage('join')}
              className="bg-red-500 hover:bg-red-600 text-white px-8 py-3 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 mb-4"
            >
              Join Now
            </button>
            <p className="text-gray-400 text-sm">
              © 2025 FitPro Trainer. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
