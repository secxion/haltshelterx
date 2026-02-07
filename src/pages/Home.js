import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { HeartIcon, UsersIcon, HomeIcon, SparklesIcon } from '@heroicons/react/24/outline';
import { FaEnvelope } from 'react-icons/fa';
import { apiService, handleApiError } from '../services/api';
import { navigateTo } from '../utils/navigationUtils';
import NewsletterModal from '../components/Newsletter/NewsletterModal';
import TestimonialsPanel from '../components/TestimonialsPanel';

// Simple confirmation modal for newsletter confirmation
function NewsletterConfirmedModal({ isOpen, onClose }) {
  if (!isOpen) return null;
  return (
    <div className="newsletter-modal-backdrop" style={{zIndex: 1000}}>
      <div className="newsletter-modal-container" style={{maxWidth: 400, margin: '10% auto', background: 'white', borderRadius: 16, boxShadow: '0 4px 32px #0002', padding: 32, textAlign: 'center'}}>
        <img src="/haltfav.png" alt="HALT Heart" style={{width: 64, height: 64, marginBottom: 16}} />
        <h2 style={{color: '#16a34a', fontWeight: 800, fontSize: 24, marginBottom: 12}}>Thank you for confirming!</h2>
        <p style={{color: '#444', marginBottom: 24}}>You're now subscribed to the HALT newsletter.<br/>Watch your inbox for heartwarming stories and updates.</p>
        <button onClick={onClose} style={{background: '#facc15', color: '#222', fontWeight: 700, border: 'none', borderRadius: 8, padding: '10px 28px', fontSize: 16, cursor: 'pointer'}}>Close</button>
      </div>
    </div>
  );
}

const Home = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [newsletterModalOpen, setNewsletterModalOpen] = useState(false);
  const [featuredStories, setFeaturedStories] = useState([]);
  const [newsletterConfirmedModalOpen, setNewsletterConfirmedModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterGdprConsent, setNewsletterGdprConsent] = useState(false);
  const [newsletterStatus, setNewsletterStatus] = useState('');
  const [newsletterError, setNewsletterError] = useState('');

  const [stats, setStats] = useState([
    { label: 'Animals Rescued', value: 0, icon: HeartIcon },
    { label: 'Adoptions This Year', value: 0, icon: HomeIcon },
    { label: 'Active Volunteers', value: 0, icon: UsersIcon },
    { label: 'Lives Transformed', value: 0, icon: SparklesIcon },
  ]);

  // Handle newsletter modal from query parameter
  useEffect(() => {
    const newsletter = searchParams.get('newsletter');
    if (newsletter === 'true') {
      setNewsletterModalOpen(true);
      setSearchParams({});
    } else if (newsletter === 'confirmed') {
      setNewsletterModalOpen(false);
      setNewsletterConfirmedModalOpen(true);
      setSearchParams({});
      // Auto-close after 7s
      setTimeout(() => setNewsletterConfirmedModalOpen(false), 7000);
    }
  }, [searchParams, setSearchParams]);


  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await apiService.stats.getDashboard();
        const payload = response.data || {};
        const s = payload.stats || payload;

        // Use server-provided values or fallback to initial values
        setStats([
          { label: 'Animals Rescued', value: s.animalsRescued ?? 0, icon: HeartIcon },
          { label: 'Adoptions This Year', value: s.adoptionsThisMonth ?? 0, icon: HomeIcon },
          { label: 'Active Volunteers', value: s.activeVolunteers ?? 0, icon: UsersIcon },
          { label: 'Lives Transformed', value: s.livesTransformed ?? 0, icon: SparklesIcon },
        ]);
      } catch (err) {
        // fallback: keep default stats
        console.error('Error fetching dashboard stats:', err);
      }
    };
    fetchStats();
  }, []);

  // Fetch featured stories from backend
  useEffect(() => {
    const fetchFeaturedStories = async () => {
      try {
        setLoading(true);
        const response = await apiService.stories.getFeatured();
        setFeaturedStories(response.data.stories || response.data || []);
      } catch (err) {
        console.error('Error fetching featured stories:', err);
        const errorInfo = handleApiError(err);
        setError(errorInfo.message);
        
        // Fallback to mock data if API fails
        setFeaturedStories([
          {
            _id: '1',
            title: "Bella's Second Chance",
            excerpt: "Rescued from neglect, Bella found her forever family and now helps other rescue dogs as a therapy companion.",
            featuredImage: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1zbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxOCIgZmlsbD0iIzZiNzI4MCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPlJlc2N1ZSBTdG9yeTwvdGV4dD48L3N2Zz4=",
            category: "Success Story",
            slug: "bellas-second-chance"
          },
          {
            _id: '2',
            title: "Emergency Kitten Rescue",
            excerpt: "Five orphaned kittens found shelter during the storm and are now thriving in their new homes.",
            featuredImage: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1zbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxOCIgZmlsbD0iIzZiNzI4MCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPlJlc2N1ZSBTdG9yeTwvdGV4dD48L3N2Zz4=",
            category: "Recent Rescue",
            slug: "emergency-kitten-rescue"
          },
          {
            _id: '3',
            title: "Max's Medical Miracle",
            excerpt: "Thanks to donor support, Max received life-saving surgery and is now running free with his adopted family.",
            featuredImage: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1zbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxOCIgZmlsbD0iIzZiNzI4MCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPlJlc2N1ZSBTdG9yeTwvdGV4dD48L3N2Zz4=",
            category: "Medical Success",
            slug: "maxs-medical-miracle"
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedStories();
  }, []);

  // Remove client-side mutation of Animals Rescued.
  // Frontend will display the server-provided `stats.animalsRescued` when available.
  // This avoids per-browser increments. Keep a light fallback value of 107.

  // Handle newsletter subscription
  const handleNewsletterSubmit = async (e) => {
    e.preventDefault();
    setNewsletterError('');
    
    if (!newsletterEmail) {
      setNewsletterError('Email is required');
      return;
    }
    
    if (!newsletterGdprConsent) {
      setNewsletterError('Please accept our privacy policy to subscribe');
      return;
    }

    try {
      setNewsletterStatus('loading');
      await apiService.newsletter.subscribe(newsletterEmail, {
        gdprConsent: true,
        preferences: {
          generalNews: true,
          animalUpdates: true,
          events: true,
          fundraising: true
        }
      });
      setNewsletterStatus('success');
      setNewsletterEmail('');
      setNewsletterGdprConsent(false);
      setTimeout(() => setNewsletterStatus(''), 5000);
    } catch (err) {
      console.error('Newsletter subscription error:', err);
      const errorMsg = err.response?.data?.error || 'Failed to subscribe. Please try again.';
      setNewsletterStatus('error');
      setNewsletterError(errorMsg);
      setTimeout(() => setNewsletterStatus(''), 5000);
    }
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-red-800 via-red-700 to-red-600 text-white overflow-hidden bg-cover bg-center" style={{backgroundImage: 'url(/the-power-of-persistence-james-and-the-dog-training-program.jpg)'}}>
        {/* Decorative background elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white opacity-5 rounded-full -mr-40 -mt-40"></div>
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-white opacity-5 rounded-full -ml-36 -mb-36"></div>
        <div className="absolute inset-0 bg-black opacity-30"></div>
        
        {/* Decorative Logo Icons */}
        <img 
          src="/haltfav.png" 
          alt="" 
          className="absolute top-10 right-10 w-16 h-16 opacity-15 hidden lg:block"
        />
        <img 
          src="/haltfav.png" 
          alt="" 
          className="absolute bottom-10 left-10 w-20 h-20 opacity-15 hidden lg:block"
        />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32 lg:py-40">
          <div className="text-center space-y-10">
            {/* Logo Icon with Animation */}
            <div className="flex justify-center mb-8 sm:mb-10">
              <img 
                src="/haltfav.png" 
                alt="HALT Logo" 
                className="w-24 h-24 sm:w-32 sm:h-32 drop-shadow-2xl animate-bounce"
              />
            </div>
            
            {/* HALT Brand Identity */}
            <div>
              <h1 className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-black mb-10 sm:mb-12 tracking-tighter leading-none">
                <span className="text-amber-200">H</span>ALT<br/>
                <span className="text-amber-200">SHELTER</span>
              </h1>
              
              {/* HALT Meaning - Enhanced Styling */}
              <div className="text-base sm:text-lg md:text-xl lg:text-2xl font-semibold text-white mb-12 sm:mb-14 space-y-3 tracking-wide">
                <div className="bg-black/25 backdrop-blur-sm rounded-xl p-6 sm:p-8 max-w-3xl mx-auto border border-white/15">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                    <div className="flex items-center justify-center gap-4 group">
                      <span className="bg-gradient-to-br from-amber-300 to-amber-400 text-red-900 px-4 py-3 rounded-lg font-black text-xl group-hover:scale-110 transition-transform duration-200 shadow-md">H</span>
                      <span>elping</span>
                    </div>
                    <div className="flex items-center justify-center gap-4 group">
                      <span className="bg-gradient-to-br from-amber-300 to-amber-400 text-red-900 px-4 py-3 rounded-lg font-black text-xl group-hover:scale-110 transition-transform duration-200 shadow-md">A</span>
                      <span>nimals</span>
                    </div>
                    <div className="flex items-center justify-center gap-4 group">
                      <span className="bg-gradient-to-br from-amber-300 to-amber-400 text-red-900 px-4 py-3 rounded-lg font-black text-xl group-hover:scale-110 transition-transform duration-200 shadow-md">L</span>
                      <span>ive &</span>
                    </div>
                    <div className="flex items-center justify-center gap-4 group">
                      <span className="bg-gradient-to-br from-amber-300 to-amber-400 text-red-900 px-4 py-3 rounded-lg font-black text-xl group-hover:scale-110 transition-transform duration-200 shadow-md">T</span>
                      <span>hrive</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Main Tagline */}
            <div className="space-y-8">
              <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black leading-tight tracking-tight">
                Every Animal Deserves
                <span className="block text-amber-200 mt-3">Love, Care & A Forever Home</span>
              </h2>
              <p className="text-xl sm:text-2xl md:text-3xl lg:text-3xl text-red-50 max-w-3xl mx-auto leading-relaxed font-medium tracking-wide">
                From rescue to rehabilitation, from healing to happiness. We're here for animals who need us most. Together, we transform lives and create loving families.
              </p>
            </div>
            
            {/* CTA Buttons - Enhanced */}
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-stretch sm:items-center max-w-2xl mx-auto pt-8 sm:pt-10">
              <Link 
                to="/donate?recurrence=monthly" 
                className="group relative bg-gradient-to-r from-amber-400 to-amber-300 hover:from-amber-300 hover:to-amber-200 text-red-900 font-black py-4 px-8 sm:px-10 rounded-xl text-lg transition-all duration-200 transform hover:scale-105 hover:shadow-2xl shadow-xl flex items-center justify-center gap-3 overflow-hidden"
              >
                <span className="text-2xl">💝</span>
                <span>Donate Now - Save a Life</span>
                <span className="absolute -right-8 top-1/2 -translate-y-1/2 text-4xl group-hover:right-0 transition-all duration-300 opacity-0 group-hover:opacity-100">→</span>
              </Link>
              <Link 
                to="/stories" 
                className="group border-2 border-white hover:bg-white hover:text-red-700 text-white font-black py-4 px-8 sm:px-10 rounded-xl text-lg transition-all duration-200 transform hover:scale-105 hover:shadow-2xl shadow-lg flex items-center justify-center gap-3 tracking-wide"
              >
                <span className="text-2xl">📖</span>
                <span>Success Stories</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Impact Stats */}
      <section className="py-20 sm:py-28 bg-gradient-to-b from-gray-900 to-gray-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14 sm:mb-18">
            <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black mb-6 leading-tight tracking-tight">
              🏆 Our Impact This Year
            </h2>
            <p className="text-xl sm:text-2xl md:text-3xl text-gray-300 max-w-3xl mx-auto leading-relaxed tracking-wide">
              Every number represents a life saved, a family made whole, and hope restored through community support
            </p>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {stats.map((stat, index) => (
              <div 
                key={index} 
                className="text-center bg-gradient-to-br from-gray-700 to-gray-800 p-6 sm:p-8 rounded-2xl border border-gray-600 hover:border-amber-400 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl shadow-lg group"
              >
                <div className="mx-auto w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 transition-transform duration-300">
                  <stat.icon className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                </div>
                <div className="text-3xl sm:text-4xl md:text-5xl font-black text-amber-400 mb-2 sm:mb-3 tracking-tight">
                  {stat.value}
                </div>
                <div className="text-sm sm:text-base md:text-lg text-gray-300 font-semibold leading-snug tracking-wide">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Emergency Banner */}
      <section className="bg-gradient-to-r from-red-800 via-red-700 to-red-600 text-white py-10 sm:py-14 border-b-4 border-amber-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8 md:gap-10">
            <div className="text-center md:text-left">
              <h3 className="text-2xl sm:text-3xl md:text-4xl font-black mb-4 sm:mb-5 flex items-center justify-center md:justify-start gap-3 tracking-tight">
                <span className="text-3xl sm:text-4xl animate-pulse">🚨</span>
                Emergency Rescue Fund
              </h3>
              <p className="text-lg sm:text-xl text-red-50 font-medium tracking-wide">
                Critical cases need immediate medical attention. Your emergency donation can save a life today.
              </p>
            </div>
            <Link 
              to="/donate?emergency=true" 
              className="group w-full md:w-auto bg-gradient-to-r from-amber-400 to-amber-300 hover:from-amber-300 hover:to-amber-200 text-red-900 font-black py-4 px-8 sm:px-10 rounded-xl transition-all duration-200 transform hover:scale-105 hover:shadow-2xl shadow-xl whitespace-nowrap text-center text-lg flex items-center justify-center gap-2 md:gap-3 tracking-wide"
            >
              <span>🔴</span>
              <span>Emergency Donate</span>
            </Link>
          </div>
        </div>
      </section>

      {/* In Action / Recent Rescues & Victories */}
      <section className="py-20 sm:py-28 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14 sm:mb-18">
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-gray-900 mb-6 leading-tight tracking-tight">
              🎯 In Action: Recent Rescues & Victories
            </h2>
            <p className="text-lg sm:text-xl md:text-2xl text-gray-700 max-w-3xl mx-auto leading-relaxed tracking-wide">
              See how your support powers real-life rescues, medical miracles, and happy endings every week. These are the moments that define our mission.
            </p>
          </div>
          {/* Wrap all conditional blocks in a fragment to fix adjacent JSX error */}
          <>
            {/* Loading State */}
            {loading && (
              <div className="text-center py-12" aria-live="polite">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-red-600 border-t-yellow-400" role="status"></div>
                <p className="mt-4 text-gray-600 text-lg font-medium">Loading inspiring stories...</p>
              </div>
            )}
            {/* Error State */}
            {error && !loading && (
              <div className="text-center py-8">
                <div className="bg-yellow-50 border-2 border-yellow-300 rounded-xl p-6 max-w-md mx-auto">
                  <p className="text-yellow-800 font-medium text-lg">
                    📶 Having trouble loading stories. Showing our latest updates instead!
                  </p>
                </div>
              </div>
            )}
            {/* Stories Grid */}
            {!loading && (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-10">
                {featuredStories.map((story) => (
                  <div key={story._id || story.id} className="group bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:scale-105 border border-gray-200 hover:border-red-400 cursor-pointer" onClick={() => navigate(`/stories/${story._id || story.id}`, { state: { story } })}>
                    <div className="relative overflow-hidden h-56 sm:h-64 bg-gray-200">
                      <img 
                        src={story.featuredImage?.url || story.featuredImage || story.image || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxOCIgZmlsbD0iIzZiNzI4MCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPlJlc2N1ZSBTdG9yeTwvdGV4dD48L3N2Zz4='} 
                        alt={story.title} 
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                        onError={(e) => {
                          e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxOCIgZmlsbD0iIzZiNzI4MCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPlJlc2N1ZSBTdG9yeTwvdGV4dD48L3N2Zz4=';
                        }}
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                        <span className="text-white font-black text-lg tracking-wide">Read Story →</span>
                      </div>
                    </div>
                    <div className="p-6 sm:p-7">
                      <h3 className="text-lg sm:text-xl font-black text-gray-900 group-hover:text-red-600 transition-colors line-clamp-2 mb-3 leading-snug tracking-tight">
                        {story.title}
                      </h3>
                      <p className="text-sm sm:text-base text-gray-600 line-clamp-2 group-hover:text-gray-700 leading-relaxed">
                        {story.excerpt || story.content?.substring(0, 100)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div className="flex justify-center mt-14 sm:mt-16">
              <Link to="/stories" className="bg-gradient-to-r from-red-700 to-red-800 hover:from-red-800 hover:to-red-900 text-white font-black py-4 px-8 sm:px-10 rounded-xl transition-all duration-200 transform hover:scale-105 hover:shadow-2xl shadow-lg text-lg flex items-center gap-3 tracking-wide">
                <span>📖</span>
                <span>View All Stories</span>
                <span>→</span>
              </Link>
            </div>
          </>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-12 sm:py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <TestimonialsPanel />
        </div>
      </section>

      {/* Resources Section */}
      <section className="bg-white py-12 border-t border-gray-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">📚 Resources for Pet Lovers</h2>
          <p className="text-lg text-gray-700 mb-8">Learn more about animal care, adoption, and advocacy. Explore our guides and tips to help you and your pet thrive.</p>
          <div className="flex flex-wrap justify-center gap-6 text-lg">
            <a href="#" onClick={(e) => { e.preventDefault(); navigateTo('/blog', { category: 'pet-care' }); }} className="bg-blue-50 hover:bg-blue-100 text-blue-800 font-semibold py-3 px-6 rounded-lg border border-blue-200 transition-colors cursor-pointer">Pet Care Guides</a>
            <a href="#" onClick={(e) => { e.preventDefault(); navigateTo('/blog', { category: 'adoption-tips' }); }} className="bg-green-50 hover:bg-green-100 text-green-800 font-semibold py-3 px-6 rounded-lg border border-green-200 transition-colors cursor-pointer">Adoption Tips</a>
            <a href="#" onClick={(e) => { e.preventDefault(); navigateTo('/blog', { category: 'animal-health' }); }} className="bg-purple-50 hover:bg-purple-100 text-purple-800 font-semibold py-3 px-6 rounded-lg border border-purple-200 transition-colors cursor-pointer">Animal Health</a>
            <a href="#" onClick={(e) => { e.preventDefault(); navigateTo('/blog', { category: 'community-outreach' }); }} className="bg-yellow-50 hover:bg-yellow-100 text-yellow-800 font-semibold py-3 px-6 rounded-lg border border-yellow-200 transition-colors cursor-pointer">Community Outreach</a>
            <Link to="/blog" className="bg-gray-50 hover:bg-gray-100 text-gray-800 font-semibold py-3 px-6 rounded-lg border border-gray-200 transition-colors">All Articles</Link>
          </div>
        </div>
      </section>

      {/* Foster & Volunteer Banner */}
      <section className="bg-blue-50 py-10 border-t border-blue-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex-1 text-center md:text-left">
            <h2 className="text-2xl sm:text-3xl font-bold text-blue-900 mb-2">🐾 Foster or Volunteer—Change a Life!</h2>
            <p className="text-blue-700 mb-4 max-w-xl">Not ready to adopt? Fostering gives animals a safe, loving home while they wait for adoption. Or, join our amazing team of volunteers and make a difference every day!</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
              <Link to="/foster" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors">Become a Foster</Link>
              <Link to="/volunteer" className="bg-white border border-blue-600 text-blue-700 hover:bg-blue-100 font-bold py-3 px-6 rounded-lg transition-colors">Volunteer With Us</Link>
            </div>
          </div>
          <div className="flex-1 flex justify-center md:justify-end">
            <img src="https://bestfriends.org/sites/default/files/styles/large/public/2025-06/Jennifer-300x300.jpg?itok=L5wgSgQM" alt="Happy foster pet" className="w-40 h-40 rounded-full object-cover shadow-lg border-4 border-blue-200" />
          </div>
        </div>
      </section>

      {/* Support Us & Shop Section */}
      <section className="bg-gray-50 py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              🤝 Support Us & Shop
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-600">
              Every contribution, big or small, helps us save more lives. Show your support or shop for a cause!
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md text-center hover:shadow-lg transition-shadow" tabIndex={0} aria-label="One-Time Donation">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <HeartIcon className="w-6 h-6 sm:w-8 sm:h-8 text-red-600" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">One-Time Donation</h3>
              <p className="text-gray-600 mb-4 text-sm sm:text-base">Make an immediate impact with a one-time gift</p>
              <Link to="/donate?recurrence=monthly" className="text-red-600 hover:text-red-800 font-semibold">
                Donate Now →
              </Link>
            </div>
            <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md text-center hover:shadow-lg transition-shadow" tabIndex={0} aria-label="Monthly Giving">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <UsersIcon className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">Monthly Giving</h3>
              <p className="text-gray-600 mb-4 text-sm sm:text-base">Support our work each month with a recurring donation</p>
              <Link to="/donate?recurrence=monthly" className="text-blue-600 hover:text-blue-800 font-semibold">
                Donate Monthly →
              </Link>
            </div>
            <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md text-center hover:shadow-lg transition-shadow" tabIndex={0} aria-label="Volunteer">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <HomeIcon className="w-6 h-6 sm:w-8 sm:h-8 text-green-600" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">Volunteer</h3>
              <p className="text-gray-600 mb-4 text-sm sm:text-base">Give your time and skills to help animals directly</p>
              <Link to="/volunteer" className="text-green-600 hover:text-green-800 font-semibold">
                Get Involved →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter Signup */}
      <section className="bg-red-600 text-white py-12 sm:py-16">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black mb-4 flex items-center justify-center gap-2">
              <FaEnvelope className="inline-block" /> Stay Connected
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-red-100">
              Get rescue updates, adoption news, and inspiration delivered to your inbox
            </p>
          </div>

          {/* Newsletter Status Messages */}
          {newsletterStatus === 'success' && (
            <div className="bg-green-500 border border-green-600 text-white px-4 py-3 rounded-lg mb-6 animate-slideDown">
              ✅ Check your email to confirm your subscription!
            </div>
          )}
          {newsletterStatus === 'error' && (
            <div className="bg-red-700 border border-red-800 text-white px-4 py-3 rounded-lg mb-6 animate-slideDown">
              ❌ {newsletterError || 'Something went wrong. Please try again.'}
            </div>
          )}

          <form onSubmit={handleNewsletterSubmit} className="space-y-4">
            {/* Email Input */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <FaEnvelope className="absolute left-3 top-3 text-gray-300 mt-1" />
                <input 
                  type="email" 
                  placeholder="Enter your email"
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  className="w-full pl-10 px-4 py-3 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-yellow-400 font-medium"
                  required
                  disabled={newsletterStatus === 'loading'}
                />
              </div>
              <button 
                type="submit"
                disabled={newsletterStatus === 'loading'}
                className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-black px-6 py-3 rounded-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
              >
                {newsletterStatus === 'loading' ? 'Subscribing...' : 'Subscribe'}
              </button>
            </div>

            {/* GDPR Consent Checkbox */}
            <div className="bg-red-500 bg-opacity-50 p-4 rounded-lg">
              <label className="flex items-start gap-3 cursor-pointer">
                <input 
                  type="checkbox"
                  checked={newsletterGdprConsent}
                  onChange={(e) => setNewsletterGdprConsent(e.target.checked)}
                  className="mt-1 w-5 h-5 accent-yellow-400 rounded focus:ring-2 focus:ring-yellow-400"
                />
                <span className="text-sm text-red-100">
                  I agree to receive updates and newsletters. I can unsubscribe at any time. 
                  <Link to="/privacy" className="text-yellow-300 hover:text-yellow-200 underline">Privacy Policy</Link>
                </span>
              </label>
            </div>

            <p className="text-xs text-red-100 text-center">
              We'll send a confirmation link to your email. Unsubscribe anytime.
            </p>
          </form>
        </div>
      </section>

      {/* Social Proof removed per request */}

      {/* Newsletter Modal */}
      <NewsletterModal 
        isOpen={newsletterModalOpen}
        onClose={() => setNewsletterModalOpen(false)}
      />
      <NewsletterConfirmedModal
        isOpen={newsletterConfirmedModalOpen}
        onClose={() => setNewsletterConfirmedModalOpen(false)}
      />
    </div>
  );
}

export default Home;
