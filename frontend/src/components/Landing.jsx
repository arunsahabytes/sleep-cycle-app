import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaMoon, FaClock, FaChartLine, FaRegMoon, FaRegStar, FaCloud, FaRegHeart, FaChartBar, FaArrowRight } from 'react-icons/fa';
import { FaRegLightbulb } from 'react-icons/fa';
import { BiAlarm } from 'react-icons/bi';

function Landing() {
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToFeatures = () => {
    document.getElementById('features').scrollIntoView({ behavior: 'smooth' });
  };

  const handleGetStarted = () => {
    try {
      navigate('/calculator');
    } catch (error) {
      console.error('Navigation error:', error);
      // Fallback to window.location if navigate fails
      window.location.href = '/calculator';
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Hero Section */}
      <div className="relative isolate overflow-hidden pt-10">
        {/* Grid Pattern */}
        <svg
          className="absolute inset-0 -z-10 h-full w-full stroke-gray-700/40 [mask-image:radial-gradient(100%_100%_at_top_right,white,transparent)]"
          aria-hidden="true"
        >
          <defs>
            <pattern
              id="83fd4e5a-9d52-42fc-97b6-718e5d7ee527"
              width={200}
              height={200}
              x="100%"
              y={-1}
              patternUnits="userSpaceOnUse"
            >
              <path d="M100 200V.5M.5 .5H200" fill="none" />
            </pattern>
          </defs>
          <svg x="100%" y={-1} className="overflow-visible fill-gray-800/20">
            <path
              d="M-100.5 0h201v201h-201Z M699.5 0h201v201h-201Z M499.5 400h201v201h-201Z M-300.5 600h201v201h-201Z"
              strokeWidth={0}
            />
          </svg>
          <rect width="100%" height="100%" strokeWidth={0} fill="url(#83fd4e5a-9d52-42fc-97b6-718e5d7ee527)" />
        </svg>

        {/* Gradient Blur */}
        <div
          className="absolute left-[max(-7rem,calc(50%-52rem))] top-[max(0rem,calc(50%-30rem))] -z-10 transform-gpu blur-3xl sm:left-[max(-7rem,calc(50%-30rem))]"
          aria-hidden="true"
        >
          <div
            className="aspect-[1097/845] w-[68.5625rem] bg-gradient-to-r from-[#8b5cf6] to-[#3b82f6] opacity-20"
            style={{
              clipPath:
                'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
            }}
          />
        </div>
        
        <div className="mx-auto max-w-7xl px-4 py-12 sm:py-16 lg:flex lg:items-center lg:gap-x-8 lg:px-8">
          <div className="mx-auto max-w-2xl lg:mx-0 lg:flex-auto">
            {/* Badge */}
            <div className="flex mb-4">
              <div className="relative flex items-center gap-x-4 rounded-full px-4 py-1 text-sm leading-6 text-gray-300 ring-1 ring-gray-600/30 hover:ring-gray-500/40">
                <span className="font-semibold text-purple-400">Beta v1.0</span>
                <span className="h-4 w-px bg-gray-600/30" aria-hidden="true" />
                <a href="#" className="flex items-center gap-x-1">
                  <span className="absolute inset-0" aria-hidden="true" />
                  Read the announcement
                  <FaArrowRight className="-mr-1 h-3 w-3 text-gray-500" aria-hidden="true" />
                </a>
              </div>
            </div>
            
            {/* Heading */}
            <h1 className="mt-6 max-w-lg text-4xl font-bold tracking-tight text-white sm:text-6xl bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-blue-400">
              Unlock Your Perfect Sleep Schedule
            </h1>
            <p className="mt-4 text-lg leading-8 text-gray-300">
              Optimize your rest and wake up refreshed. Calculate your ideal sleep cycles based on proven sleep science.
            </p>
            
            {/* Buttons */}
            <div className="mt-8 flex items-center gap-x-6">
              <button
                onClick={() => navigate('/calculator')}
                className="rounded-md bg-purple-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-purple-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-600 transition-all hover:shadow-lg hover:shadow-purple-500/20 hover:-translate-y-0.5"
              >
                Find Your Sleep Schedule
              </button>
              <a href="#features" className="text-sm font-semibold leading-6 text-gray-300 hover:text-white">
                Learn more <span aria-hidden="true">→</span>
              </a>
            </div>
          </div>
          
          {/* Image */}
          <div className="mt-10 sm:mt-16 lg:mt-0 lg:flex-shrink-0 lg:flex-grow">
            <div className="relative aspect-[4/3] w-full max-w-md overflow-hidden rounded-2xl border border-purple-500/20 shadow-xl shadow-purple-900/20">
              <img 
                src="/photo-1541781774459-bb2af2f05b55.jpg" 
                alt="Person sleeping peacefully" 
                className="h-full w-full object-cover object-center"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 via-gray-900/20 to-transparent"></div>
              <div className="absolute bottom-4 left-4 flex items-center space-x-2">
                <FaMoon className="text-purple-400 text-lg" />
                <span className="text-white text-sm font-medium">Peaceful rest awaits</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div id="features" className="mx-auto max-w-7xl px-6 py-16 sm:py-24 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-base font-semibold leading-7 text-purple-400">Everything you need</h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-blue-400">
            Features Designed for Better Sleep
          </p>
          <p className="mt-4 text-lg leading-8 text-gray-300">
            From calculating cycles to tracking progress, we've got you covered.
          </p>
        </div>
        <div className="mx-auto mt-12 max-w-2xl sm:mt-16 lg:mt-20 lg:max-w-none">
          <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-10 lg:max-w-none lg:grid-cols-3">
            {/* Feature 1 */}
            <div className="relative pl-16">
              <dt className="text-base font-semibold leading-7 text-white">
                <div className="absolute left-0 top-0 flex h-12 w-12 items-center justify-center rounded-lg bg-purple-600">
                  <BiAlarm className="h-6 w-6 text-white" aria-hidden="true" />
                </div>
                Cycle Calculation
              </dt>
              <dd className="mt-2 text-base leading-7 text-gray-300">
                Calculate wake-up or sleep times based on 90-minute sleep cycles for optimal rest.
              </dd>
            </div>
            {/* Feature 2 */}
            <div className="relative pl-16">
              <dt className="text-base font-semibold leading-7 text-white">
                <div className="absolute left-0 top-0 flex h-12 w-12 items-center justify-center rounded-lg bg-purple-600">
                  <FaChartBar className="h-6 w-6 text-white" aria-hidden="true" />
                </div>
                Weekly Stats
              </dt>
              <dd className="mt-2 text-base leading-7 text-gray-300">
                Track your saved sleep cycles over the week to visualize patterns and consistency.
              </dd>
            </div>
            {/* Feature 3 */}
            <div className="relative pl-16">
              <dt className="text-base font-semibold leading-7 text-white">
                <div className="absolute left-0 top-0 flex h-12 w-12 items-center justify-center rounded-lg bg-purple-600">
                  <FaRegLightbulb className="h-6 w-6 text-white" aria-hidden="true" />
                </div>
                Sleep Tips
              </dt>
              <dd className="mt-2 text-base leading-7 text-gray-300">
                Get dynamic tips based on your selected sleep duration to improve your habits.
              </dd>
            </div>
          </dl>
        </div>
      </div>

      {/* CTA Section */}
      <div className="relative isolate overflow-hidden">
        <div className="px-6 py-16 sm:px-6 sm:py-24 lg:px-8">
          <div className="mx-auto max-w-2xl text-center relative z-10">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Ready to improve your sleep?
              <br />
              Start calculating today.
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-lg leading-8 text-gray-300">
              Find your perfect sleep schedule and wake up feeling energized and refreshed every day.
            </p>
            <div className="mt-8 flex items-center justify-center gap-x-6">
              <button
                onClick={() => navigate('/calculator')}
                className="rounded-md bg-purple-600 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-purple-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-600 transition-all hover:shadow-lg hover:shadow-purple-500/20 hover:-translate-y-0.5"
              >
                Start Your Sleep Journey
              </button>
              <a href="#features" className="text-sm font-semibold leading-6 text-white">
                Learn more <span aria-hidden="true">→</span>
              </a>
            </div>
          </div>
        </div>
        <svg
          viewBox="0 0 1024 1024"
          className="absolute left-1/2 top-1/2 -z-10 h-[64rem] w-[64rem] -translate-x-1/2 [mask-image:radial-gradient(closest-side,white,transparent)]"
          aria-hidden="true"
        >
          <circle cx={512} cy={512} r={512} fill="url(#8d958450-c69f-4251-94bc-4e091a323369)" fillOpacity="0.7" />
          <defs>
            <radialGradient id="8d958450-c69f-4251-94bc-4e091a323369">
              <stop stopColor="#7775D6" />
              <stop offset={1} stopColor="#E935C1" />
            </radialGradient>
          </defs>
        </svg>
      </div>
    </div>
  );
}

export default Landing; 