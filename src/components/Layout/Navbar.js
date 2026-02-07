import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { HeartIcon, Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import { navigateTo } from '../../utils/navigationUtils';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  const navigation = [
    { name: 'Home', href: '/', current: location.pathname === '/' },
    { name: 'Animals', href: '/animals', current: location.pathname === '/animals' },
  { name: 'Donate', href: '/donate', current: location.pathname === '/donate' },
    { name: 'Stories', href: '/stories', current: location.pathname === '/stories' },
    { name: 'Blog', href: '/blog', current: location.pathname === '/blog' },
    { name: 'About', href: '/about', current: location.pathname === '/about' },
    { name: 'Volunteer', href: '/volunteer', current: location.pathname === '/volunteer' },
  ];

  return (
    <nav className="bg-white shadow-xl sticky top-0 z-50 transition-all duration-300 ease-out border-b-2 border-red-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <div className="flex items-center gap-3">
            <Link to="/" className="flex-shrink-0 flex items-center gap-3 group">
              <img src="/halt.png" alt="HALT Shelter" className="h-28 sm:h-32 w-auto transition-transform duration-300 group-hover:scale-105" />
              <div className="hidden sm:block">
                <div className="text-lg md:text-xl font-black text-red-700 tracking-tight leading-none">HALT</div>
                <div className="text-sm font-semibold text-gray-600 tracking-wide">SHELTER</div>
              </div>
            </Link>
          </div>

          {/* Desktop navigation - show at xl (1280px+) to prevent crowding */}
          <div className="hidden xl:flex items-center gap-1 2xl:gap-2">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`px-3 2xl:px-4 py-2 text-sm font-black transition-all duration-200 ease-out transform hover:scale-105 tracking-tight whitespace-nowrap ${
                  item.current
                    ? 'text-red-700 border-b-3 border-red-700 bg-red-50'
                    : 'text-gray-700 hover:text-red-700 hover:bg-red-50'
                }`}
              >
                {item.name}
              </Link>
            ))}
            <a
              href="#"
              onClick={(e) => { e.preventDefault(); navigateTo('/donate', { recurrence: 'monthly' }); }}
              className="ml-2 bg-gradient-to-r from-amber-400 to-amber-300 hover:from-amber-300 hover:to-amber-200 text-red-900 px-4 2xl:px-5 py-2 rounded-lg text-sm font-black hover:shadow-lg transition-all duration-200 ease-out transform hover:scale-105 cursor-pointer whitespace-nowrap tracking-wide"
            >
              Donate Monthly
            </a>
          </div>

          {/* Mobile menu button - show until xl breakpoint */}
          <div className="xl:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-700 hover:text-red-700 focus:outline-none focus:text-red-700 transition-all duration-200 transform hover:scale-110"
            >
              {isMenuOpen ? (
                <XMarkIcon className="h-7 w-7 animate-spin-slow" />
              ) : (
                <Bars3Icon className="h-7 w-7 transition-transform duration-300" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="xl:hidden bg-gradient-to-b from-white to-red-50 shadow-lg border-t-2 border-red-100 animate-slideDown">
          <div className="px-3 pt-3 pb-4 space-y-2 sm:px-4 max-h-[calc(100vh-5rem)] overflow-y-auto">
            {navigation.map((item, index) => (
              <Link
                key={item.name}
                to={item.href}
                className={`block px-4 py-3 min-h-[48px] text-base font-black tracking-tight transition-all duration-200 ease-out transform hover:translate-x-1 hover:scale-105 rounded-lg ${
                  item.current
                    ? 'text-red-700 bg-red-100 border-l-4 border-red-700'
                    : 'text-gray-700 hover:text-red-700 hover:bg-red-50'
                }`}
                onClick={() => setIsMenuOpen(false)}
                style={{
                  animation: `slideInLeft 0.3s ease-out ${index * 0.05}s both`
                }}
              >
                {item.name}
              </Link>
            ))}
            <a
              href="#"
              onClick={(e) => { e.preventDefault(); setIsMenuOpen(false); navigateTo('/donate', { recurrence: 'monthly' }); }}
              className="block mx-2 mt-5 bg-gradient-to-r from-amber-400 to-amber-300 hover:from-amber-300 hover:to-amber-200 text-red-900 px-5 py-3 min-h-[48px] rounded-lg text-base font-black tracking-wide hover:shadow-lg transition-all duration-200 transform hover:scale-105 text-center cursor-pointer"
              style={{
                animation: `slideInLeft 0.3s ease-out ${navigation.length * 0.05 + 0.05}s both`
              }}
            >
              Donate Monthly
            </a>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
