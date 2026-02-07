import React from 'react';
import { Link } from 'react-router-dom';
import { HeartIcon, EnvelopeIcon, PhoneIcon } from '@heroicons/react/24/outline';
import { FaFacebook } from 'react-icons/fa';
import { navigateTo } from '../../utils/navigationUtils';

const Footer = () => {
  // Allow overriding the Facebook URL via environment variable for easy updates without code changes
  const fbUrl = process.env.REACT_APP_FACEBOOK_URL || 'https://www.facebook.com/profile.php?id=827913347067008';
  return (
    <footer className="bg-gradient-to-b from-gray-900 to-gray-950 text-white border-t-4 border-amber-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-10 lg:gap-12">
          {/* Brand */}
          <div className="space-y-5">
            <div className="flex items-center">
              <img src="/halt.png" alt="HALT Shelter" className="h-20 w-auto transition-transform duration-300 hover:scale-105" />
            </div>
            <p className="text-gray-300 text-sm leading-relaxed tracking-wide">
              <span className="font-black text-amber-400 block mb-3">Helping Animals Live & Thrive.</span>
              <span>From rescue to forever homes, we transform lives through compassion. Every donation, every adoption, every act of kindness creates miracles.</span>
            </p>
            <div className="flex space-x-4 pt-2">
              {/* Facebook only - update the href to your page's actual slug if different */}
              <a 
                href={fbUrl} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-gray-300 hover:text-amber-400 transition-all duration-200 transform hover:scale-110" 
                aria-label="Helping Animals Live & Thrive - Facebook"
              >
                <FaFacebook className="h-6 w-6" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <nav className="space-y-5" aria-label="Quick Links">
            <h3 className="text-base font-black text-white border-b-3 border-amber-400 pb-3 tracking-tight">Quick Links</h3>
            <ul className="space-y-3">
              <li>
                <Link 
                  to="/about" 
                  className="text-gray-300 hover:text-amber-400 transition-all duration-200 transform hover:translate-x-1 flex items-center gap-2 font-medium tracking-wide"
                  aria-label="About Us"
                >
                  <span className="text-amber-400" aria-hidden="true">→</span> About Us
                </Link>
              </li>
              <li>
                <Link 
                  to="/stories" 
                  className="text-gray-300 hover:text-amber-400 transition-all duration-200 transform hover:translate-x-1 flex items-center gap-2 font-medium tracking-wide"
                  aria-label="Success Stories"
                >
                  <span className="text-amber-400" aria-hidden="true">→</span> Success Stories
                </Link>
              </li>
              <li>
                <Link 
                  to="/volunteer" 
                  className="text-gray-300 hover:text-amber-400 transition-all duration-200 transform hover:translate-x-1 flex items-center gap-2 font-medium tracking-wide"
                  aria-label="Volunteer With Us"
                >
                  <span className="text-amber-400" aria-hidden="true">→</span> Volunteer
                </Link>
              </li>
              <li>
                <a 
                  href="#"
                  onClick={(e) => { e.preventDefault(); navigateTo('/blog', { category: 'pet-care' }); }}
                  className="text-gray-300 hover:text-amber-400 transition-all duration-200 transform hover:translate-x-1 flex items-center gap-2 font-medium tracking-wide cursor-pointer"
                  aria-label="Pet Care Guides"
                >
                  <span className="text-amber-400" aria-hidden="true">→</span> Pet Care Guides
                </a>
              </li>
            </ul>
          </nav>

          {/* Support */}
          <nav className="space-y-5" aria-label="Support">
            <h3 className="text-base font-black text-white border-b-3 border-amber-400 pb-3 tracking-tight">Support</h3>
            <ul className="space-y-3">
              <li>
                <Link 
                  to="/donate" 
                  className="text-gray-300 hover:text-amber-400 transition-all duration-200 transform hover:translate-x-1 flex items-center gap-2 font-medium tracking-wide"
                  aria-label="Make a One-Time Donation"
                >
                  <span className="text-amber-400" aria-hidden="true">→</span> One-Time Donation
                </Link>
              </li>
              <li>
                <a 
                  href="#"
                  onClick={(e) => { e.preventDefault(); navigateTo('/donate', { recurrence: 'monthly' }); }}
                  className="text-gray-300 hover:text-amber-400 transition-all duration-200 transform hover:translate-x-1 flex items-center gap-2 font-medium tracking-wide cursor-pointer"
                  aria-label="Start Monthly Giving"
                >
                  <span className="text-amber-400" aria-hidden="true">→</span> Monthly Giving
                </a>
              </li>
            </ul>
          </nav>

          {/* Contact - Simplified for better fit */}
          <address className="space-y-5 not-italic">
            <h3 className="text-base font-black text-white border-b-3 border-amber-400 pb-3 tracking-tight">Contact</h3>
            <div className="space-y-4">
              <a 
                href="mailto:contact@haltshelter.org"
                className="flex items-center gap-3 text-gray-300 hover:text-amber-400 transition-all duration-200 group"
                aria-label="Email us at contact@haltshelter.org"
              >
                <EnvelopeIcon className="h-5 w-5 text-amber-400 flex-shrink-0 group-hover:scale-110 transition-transform" aria-hidden="true" />
                <span className="text-sm break-all font-medium tracking-wide">contact@haltshelter.org</span>
              </a>
              <a 
                href="tel:+18054529111"
                className="flex items-center gap-3 text-gray-300 hover:text-amber-400 transition-all duration-200 group"
                aria-label="Call us at +1 (805) 452-9111"
              >
                <PhoneIcon className="h-5 w-5 text-amber-400 flex-shrink-0 group-hover:scale-110 transition-transform" aria-hidden="true" />
                <span className="text-sm font-medium tracking-wide">+1 (805) 452-9111</span>
              </a>
            </div>
          </address>
        </div>

        {/* Sponsors Section */}
        {/* <section className="mt-12 sm:mt-16 pt-8 sm:pt-12 border-t border-gray-700" aria-label="Corporate Partners">
          <h2 className="text-lg font-bold text-white mb-8 text-center">Proud Corporate Partners</h2>
          <FooterSponsors />
        </section> */}

        {/* Footer Bottom */}
        <div className="mt-12 sm:mt-16 pt-10 border-t-2 border-gray-700">
          <div className="flex flex-col md:flex-row justify-between items-center gap-5">
            <p className="text-gray-400 text-xs sm:text-sm text-center md:text-left tracking-wide">
              © 2025 HALTSHELTER. All rights reserved. | 501(c)(3) Nonprofit | EIN: 41-2531054
            </p>
            <nav className="flex gap-8 sm:gap-10" aria-label="Footer Legal Links">
              <a 
                href="/privacy"
                className="text-gray-400 hover:text-amber-400 text-xs sm:text-sm transition-all duration-200 font-medium tracking-wide"
                aria-label="View our Privacy Policy"
              >
                Privacy Policy
              </a>
              <a 
                href="/terms"
                className="text-gray-400 hover:text-amber-400 text-xs sm:text-sm transition-all duration-200 font-medium tracking-wide"
                aria-label="View our Terms of Service"
              >
                Terms of Service
              </a>
            </nav>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
