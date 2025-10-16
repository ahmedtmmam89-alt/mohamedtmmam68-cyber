import { TrendingUp, Users, Award, Dumbbell, Target, Heart, Zap } from 'lucide-react';

interface HomePageProps {
  onJoinClick: () => void;
}

export default function HomePage({ onJoinClick }: HomePageProps) {
  const stats = [
    { icon: Award, value: 'Certified', label: 'Professional Trainer' },
    { icon: TrendingUp, value: 'Proven', label: 'Success Rate' },
    { icon: Heart, value: 'Personalized', label: 'Nutrition Plans' },
    { icon: Dumbbell, value: 'Custom', label: 'Training Programs' },
  ];

  const features = [
    {
      icon: Dumbbell,
      title: 'Custom Training Plans',
      description: 'Personalized workout programs designed specifically for your body type, goals, and fitness level.'
    },
    {
      icon: Target,
      title: 'Goal-Oriented Approach',
      description: 'Whether you want to lose weight, build muscle, or improve fitness, we create a roadmap to your success.'
    },
    {
      icon: Heart,
      title: 'Nutrition Guidance',
      description: 'Tailored meal plans and dietary advice to fuel your workouts and optimize results.'
    },
    {
      icon: Zap,
      title: 'Progress Tracking',
      description: 'Regular check-ins and adjustments ensure you stay on track and continuously improve.'
    }
  ];

  const testimonials = [
    {
      name: 'Nima Muhammad',
      text: 'As a breastfeeding mother, I was worried about side effects. The trainer helped me regain my health and lose fat safely without any side effects. The constant follow-up and support made all the difference!',
      result: 'Transformed',
    },
    {
      name: 'Abdul Rahman',
      text: 'I lost weight without feeling hungry or affecting my health. The personalized nutrition plan was perfect and sustainable!',
      result: 'Success',
    },
    {
      name: 'Shaimaa',
      text: 'Not only did I lose weight, but my health improved dramatically and my entire lifestyle changed for the better!',
      result: 'Life Changed',
    },
  ];

  return (
    <div className="animate-fade-in">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-red-950/20 to-gray-900">
        <div className="absolute inset-0 bg-[url('https://images.pexels.com/photos/1552242/pexels-photo-1552242.jpeg')] bg-cover bg-center opacity-20"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-gray-900/50"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center z-10">
          <div className="inline-block bg-red-500/10 border border-red-500/30 rounded-full px-6 py-2 mb-6 animate-slide-up">
            <span className="text-red-400 font-semibold">Your Fitness Journey Starts Here</span>
          </div>

          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold mb-6 animate-slide-up">
            <span className="text-white">Build Your</span>
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-red-400 to-orange-500 mt-2">
              Dream Physique
            </span>
          </h1>

          <p className="text-xl md:text-2xl text-gray-300 mb-10 max-w-3xl mx-auto animate-slide-up-delay leading-relaxed">
            Professional training programs, personalized nutrition plans, and expert guidance to help you achieve extraordinary results
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-slide-up-delay-2">
            <button
              onClick={onJoinClick}
              className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-10 py-4 rounded-lg text-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-2xl hover:shadow-red-500/50 w-full sm:w-auto"
            >
              Start Your Transformation
            </button>
            <a
              href="#programs"
              className="bg-gray-800 hover:bg-gray-700 text-white border-2 border-gray-700 hover:border-red-500 px-10 py-4 rounded-lg text-lg font-semibold transition-all duration-300 w-full sm:w-auto"
            >
              View Programs
            </a>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16 animate-slide-up-delay-3">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div key={index} className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 border border-gray-700 hover:border-red-500 transition-all duration-300">
                  <Icon className="w-8 h-8 text-red-500 mx-auto mb-2" />
                  <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
                  <div className="text-gray-400 text-sm">{stat.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Why Choose <span className="text-red-500">FitPro Trainer</span>
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Everything you need to achieve your fitness goals in one place
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-red-500 transition-all duration-300 hover:transform hover:scale-105"
                >
                  <div className="bg-red-500/10 w-14 h-14 rounded-lg flex items-center justify-center mb-4">
                    <Icon className="w-7 h-7 text-red-500" />
                  </div>
                  <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                  <p className="text-gray-400 leading-relaxed">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-24 bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="order-2 lg:order-1">
              <div className="inline-block bg-red-500/10 border border-red-500/30 rounded-full px-4 py-1 mb-4">
                <span className="text-red-400 text-sm font-semibold">Proven Results</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                Your Success Is <span className="text-red-500">My Mission</span>
              </h2>
              <p className="text-gray-300 text-lg mb-4 leading-relaxed">
                As a certified personal trainer and nutrition coach, I specialize in creating personalized programs that deliver real results while prioritizing your health and wellbeing.
              </p>
              <p className="text-gray-300 text-lg mb-8 leading-relaxed">
                Whether you're looking to lose weight, build muscle, improve athletic performance, or simply feel healthier, I provide customized programs tailored to your unique goals, lifestyle, and body type.
              </p>

              <div className="grid sm:grid-cols-2 gap-4 mb-8">
                <div className="flex items-center space-x-3 bg-gray-900 p-4 rounded-lg">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <p className="text-gray-300 font-medium">Custom workout plans</p>
                </div>
                <div className="flex items-center space-x-3 bg-gray-900 p-4 rounded-lg">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <p className="text-gray-300 font-medium">Personalized nutrition</p>
                </div>
                <div className="flex items-center space-x-3 bg-gray-900 p-4 rounded-lg">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <p className="text-gray-300 font-medium">Progress tracking</p>
                </div>
                <div className="flex items-center space-x-3 bg-gray-900 p-4 rounded-lg">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <p className="text-gray-300 font-medium">24/7 support</p>
                </div>
              </div>

              <button
                onClick={onJoinClick}
                className="bg-red-500 hover:bg-red-600 text-white px-8 py-4 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105"
              >
                Start Your Journey Today
              </button>
            </div>

            <div className="order-1 lg:order-2 relative">
              <div className="relative rounded-2xl overflow-hidden border-4 border-red-500 shadow-2xl shadow-red-500/20">
                <img
                  src="/Screenshot_2025-10-03-04-25-50-37_948cd9899890cbd5c2798760b2b95377 copy copy.jpg"
                  alt="Professional Trainer"
                  className="w-full h-[500px] object-cover"
                />
              </div>
              <a
                href="https://www.instagram.com/iatd.egy?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw=="
                target="_blank"
                rel="noopener noreferrer"
                className="absolute -bottom-8 -left-8 bg-gradient-to-br from-red-500 to-red-600 text-white p-8 rounded-2xl shadow-2xl hover:from-red-600 hover:to-red-700 transition-all duration-300 transform hover:scale-105 cursor-pointer"
              >
                <div className="text-3xl font-bold mb-1">Certified</div>
                <div className="text-base font-semibold">from IATD</div>
              </a>
              <div className="absolute -top-8 -right-8 bg-gray-900 border-2 border-red-500 text-white p-6 rounded-2xl shadow-2xl">
                <div className="text-3xl font-bold text-red-500 mb-1">Expert</div>
                <div className="text-sm font-semibold">Guidance</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-block bg-red-500/10 border border-red-500/30 rounded-full px-4 py-1 mb-4">
              <span className="text-red-400 text-sm font-semibold">Real Results</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Success <span className="text-red-500">Stories</span>
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              See what our members have achieved with dedication and expert guidance
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="bg-gray-800 rounded-xl p-8 border border-gray-700 hover:border-red-500 transition-all duration-300 hover:transform hover:scale-105 relative"
              >
                <div className="absolute top-6 right-6">
                  <div className="bg-gradient-to-br from-green-500 to-green-600 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg">
                    {testimonial.result}
                  </div>
                </div>

                <div className="mb-6">
                  <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center mb-4">
                    <span className="text-2xl">⭐</span>
                  </div>
                  <p className="text-gray-300 text-lg leading-relaxed italic mb-6">
                    "{testimonial.text}"
                  </p>
                </div>

                <div className="border-t border-gray-700 pt-4">
                  <div className="font-bold text-lg text-white">{testimonial.name}</div>
                  <div className="text-gray-400 text-sm">Verified Member</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section id="programs" className="py-24 bg-gradient-to-br from-red-600 via-red-500 to-orange-500 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.pexels.com/photos/841130/pexels-photo-841130.jpeg')] bg-cover bg-center opacity-10"></div>
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-6xl font-bold mb-6 text-white">
            Ready to Transform Your Life?
          </h2>
          <p className="text-xl md:text-2xl mb-10 text-red-50 max-w-3xl mx-auto leading-relaxed">
            Join many successful members who have achieved their fitness goals with proven training programs and expert support
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <button
              onClick={onJoinClick}
              className="bg-white text-red-600 hover:bg-gray-100 px-10 py-5 rounded-lg text-lg font-bold transition-all duration-300 transform hover:scale-105 shadow-2xl w-full sm:w-auto"
            >
              Start Your Journey Now
            </button>
            <button
              className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-red-600 px-10 py-5 rounded-lg text-lg font-bold transition-all duration-300 w-full sm:w-auto"
            >
              View Pricing Plans
            </button>
          </div>

          <div className="flex flex-wrap justify-center gap-8 text-white">
            <div className="flex items-center gap-2">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="font-semibold">No Long-Term Contracts</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="font-semibold">Money-Back Guarantee</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="font-semibold">Expert Support</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
