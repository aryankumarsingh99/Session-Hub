'use client';
import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function Home() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hoveredCard, setHoveredCard] = useState(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    setIsLoaded(true);
    
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-zinc-100 dark:from-gray-900 dark:via-slate-900 dark:to-zinc-900 relative overflow-hidden" >
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div 
          className="absolute -top-40 -right-40 w-80 h-80 bg-blue-400/10 rounded-full blur-3xl animate-pulse"
          style={{
            transform: `translate(${mousePosition.x * 0.02}px, ${mousePosition.y * 0.02}px)`
          }}
        />
        <div 
          className="absolute -bottom-40 -left-40 w-96 h-96 bg-purple-400/10 rounded-full blur-3xl animate-pulse"
          style={{
            transform: `translate(${mousePosition.x * -0.01}px, ${mousePosition.y * -0.01}px)`
          }}
        />
        <div 
          className="absolute top-1/2 left-1/2 w-64 h-64 bg-indigo-400/5 rounded-full blur-2xl animate-ping"
          style={{
            transform: `translate(-50%, -50%) translate(${mousePosition.x * 0.01}px, ${mousePosition.y * 0.01}px)`
          }}
        />
      </div>

      <div className="container mx-auto px-4 py-16 relative z-10">
        {/* Hero Section with Staggered Animation */}
        <div className={`text-center transition-all duration-1000 ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6 relative">
            <span className="inline-block animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              Welcome to{' '}
            </span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 dark:from-blue-400 dark:via-purple-400 dark:to-indigo-400 inline-block animate-fade-in-up hover:scale-105 transition-transform duration-300" 
                  style={{ animationDelay: '0.4s' }}>
              SessionHub
            </span>
          </h1>
          
          <p className={`text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto transition-all duration-700 ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-5 opacity-0'}`}
             style={{ transitionDelay: '0.6s' }}>
            Professional wellness session management platform. Create, manage, and
            share your wellness sessions with ease.
          </p>
          
          <div className={`flex flex-col sm:flex-row gap-4 justify-center transition-all duration-700 ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-5 opacity-0'}`}
               style={{ transitionDelay: '0.8s' }}>
            <Link
              href="/auth/login"
              className="group bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 rounded-lg font-medium transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-blue-500/25 relative overflow-hidden"
            >
              <span className="relative z-10 flex items-center justify-center">
                <svg className="w-5 h-5 mr-2 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Sign In
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-blue-700 to-purple-700 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
            </Link>
            
            <Link
              href="/auth/register"
              className="group bg-white/90 backdrop-blur-sm hover:bg-white text-blue-600 border-2 border-blue-600/50 hover:border-blue-600 px-8 py-3 rounded-lg font-medium transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-purple-500/25 dark:bg-gray-800/90 dark:text-blue-400 dark:border-blue-400/50 dark:hover:bg-gray-800 dark:hover:border-blue-400 relative overflow-hidden"
            >
              <span className="relative z-10 flex items-center justify-center">
                <svg className="w-5 h-5 mr-2 transition-transform group-hover:rotate-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Get Started
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 translate-x-full group-hover:translate-x-0 transition-transform duration-500"></div>
            </Link>
          </div>
        </div>

        {/* Features Section with Hover Effects */}
        <div className="mt-16 grid md:grid-cols-3 gap-8">
          {[
            {
              icon: 'M12 6v6m0 0v6m0-6h6m-6 0H6',
              title: 'Create Sessions',
              description: 'Easily create and manage your wellness sessions with our intuitive interface.',
              color: 'blue',
              delay: '1s'
            },
            {
              icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
              title: 'Manage Drafts',
              description: 'Save your work as drafts and publish when ready. Auto-save keeps your progress safe.',
              color: 'green',
              delay: '1.2s'
            },
            {
              icon: 'M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z',
              title: 'Share & Discover',
              description: 'Share your sessions with the community and discover new wellness content.',
              color: 'purple',
              delay: '1.4s'
            }
          ].map((feature, index) => (
            <div
              key={index}
              className={`group text-center p-6 bg-white/80 backdrop-blur-sm dark:bg-gray-800/80 rounded-xl shadow-sm hover:shadow-xl transition-all duration-500 transform hover:scale-105 hover:-translate-y-2 cursor-pointer border border-gray-200/50 dark:border-gray-700/50 hover:border-${feature.color}-200 dark:hover:border-${feature.color}-600 ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}
              style={{ transitionDelay: feature.delay }}
              onMouseEnter={() => setHoveredCard(index)}
              onMouseLeave={() => setHoveredCard(null)}
            >
              <div className={`w-12 h-12 bg-${feature.color}-100 dark:bg-${feature.color}-900 rounded-xl mx-auto mb-4 flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:rotate-6 ${hoveredCard === index ? 'shadow-lg' : ''}`}>
                <svg
                  className={`w-6 h-6 text-${feature.color}-600 dark:text-${feature.color}-400 transition-all duration-300 group-hover:scale-110`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={hoveredCard === index ? 3 : 2}
                    d={feature.icon}
                  />
                </svg>
              </div>
              
              <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white transition-colors duration-300 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                {feature.title}
              </h3>
              
              <p className="text-gray-600 dark:text-gray-300 transition-colors duration-300 group-hover:text-gray-700 dark:group-hover:text-gray-200">
                {feature.description}
              </p>
              
              {/* Hover Effect Overlay */}
              <div className={`absolute inset-0 bg-gradient-to-br from-${feature.color}-500/5 to-purple-500/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10`} />
            </div>
          ))}
        </div>

        {/* Stats Section with Counter Animation */}
        <div className={`mt-16 bg-white/90 backdrop-blur-sm dark:bg-gray-800/90 rounded-2xl shadow-xl p-8 border border-gray-200/50 dark:border-gray-700/50 transition-all duration-700 ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}
             style={{ transitionDelay: '1.6s' }}>
          <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-8">
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Join Our Growing Community
            </span>
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            {[
              { number: '1,200', label: 'Wellness Sessions', color: 'blue', suffix: '+' },
              { number: '500', label: 'Active Users', color: 'green', suffix: '+' },
              { number: '50', label: 'Session Views', color: 'purple', suffix: 'K+' }
            ].map((stat, index) => (
              <div 
                key={index}
                className="group cursor-pointer transition-transform duration-300 hover:scale-110"
              >
                <div className={`text-3xl font-bold text-${stat.color}-600 dark:text-${stat.color}-400 mb-2 transition-all duration-300 group-hover:scale-125`}>
                  <CountUpAnimation 
                    end={parseInt(stat.number.replace(',', ''))} 
                    suffix={stat.suffix}
                    duration={2000}
                    delay={1800 + (index * 200)}
                  />
                </div>
                <div className="text-gray-600 dark:text-gray-300 transition-colors duration-300 group-hover:text-gray-800 dark:group-hover:text-gray-200">
                  {stat.label}
                </div>
                
                {/* Animated underline */}
                <div className={`h-0.5 bg-gradient-to-r from-${stat.color}-500 to-purple-500 mx-auto mt-2 transition-all duration-300 w-0 group-hover:w-full`} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}

// Counter Animation Component
function CountUpAnimation({ end, suffix = '', duration = 2000, delay = 0 }) {
  const [count, setCount] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setHasStarted(true);
    }, delay);

    return () => clearTimeout(timer);
  }, [delay]);

  useEffect(() => {
    if (!hasStarted) return;

    let startTime = null;
    const animate = (currentTime) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      
      setCount(Math.floor(progress * end));
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [end, duration, hasStarted]);

  return (
    <span>
      {count.toLocaleString()}{suffix}
    </span>
  );
}
