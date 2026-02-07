import React, { useState, useEffect } from 'react';
import { Elements } from '@stripe/react-stripe-js';
import { Link, useNavigate } from 'react-router-dom';
import { HeartIcon, ShieldCheckIcon, CreditCardIcon, GiftIcon } from '@heroicons/react/24/outline';
import { stripeService } from '../services/stripe';
import { apiService } from '../services/api';
import { navigateTo, getPageData } from '../utils/navigationUtils';
import PaymentForm from '../components/Stripe/PaymentForm';

const Donate = () => {
  const navigate = useNavigate();
  const [selectedAmount, setSelectedAmount] = useState('');
  const [customAmount, setCustomAmount] = useState('');
  const [isEmergency, setIsEmergency] = useState(false);
  const [donationType, setDonationType] = useState('one-time'); // 'one-time' or 'monthly'
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  
  // Real data from backend
  const [fundingNeeds, setFundingNeeds] = useState([]);
  const [impactStats, setImpactStats] = useState({
    rescuedThisMonth: 0,
    adoptionsThisMonth: 0,
    medicalTreatments: 0,
    spayNeuterCount: 0
  });
  const [dataLoading, setDataLoading] = useState(true);

  // Fetch funding needs and impact stats
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [fundingRes, impactRes] = await Promise.all([
          apiService.fundingNeeds.getAll(),
          apiService.stats.getImpact()
        ]);
        
        // Store all funding needs (emergency ones first)
        const needs = fundingRes.data?.fundingNeeds || [];
        setFundingNeeds(needs.sort((a, b) => {
          if (a.type === 'emergency' && b.type !== 'emergency') return -1;
          if (a.type !== 'emergency' && b.type === 'emergency') return 1;
          return (b.priority || 0) - (a.priority || 0);
        }));
        
        if (impactRes.data?.impact) {
          setImpactStats(impactRes.data.impact);
        }
      } catch (error) {
        console.error('Error fetching donate page data:', error);
      } finally {
        setDataLoading(false);
      }
    };
    
    fetchData();
  }, []);

  useEffect(() => {
    // Check if data was passed via navigationUtils
    const pageData = getPageData('/donate');
    if (pageData) {
      if (pageData.emergency) setIsEmergency(true);
      if (pageData.recurrence === 'monthly') setDonationType('monthly');
    } else {
      // Fallback to URL parameters for backwards compatibility
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('emergency') === 'true') {
        setIsEmergency(true);
      }
      if (urlParams.get('recurrence') === 'monthly') {
        setDonationType('monthly');
      }
    }
  }, []);

  const donationAmounts = [
    { amount: 25, impact: '🍽️ Feeds 5 rescued animals nutritious meals for a day' },
    { amount: 50, impact: '💊 Provides essential veterinary care and vaccinations' },
    { amount: 100, impact: '🏠 Sponsors an animal\'s safe shelter stay & rehabilitation' },
    { amount: 250, impact: '❤️‍🩹 Covers life-saving emergency medical treatment' },
    { amount: 500, impact: '🚑 Funds a complete rescue operation from street to safety' },
    { amount: 1000, impact: '⭐ Supports shelter operations & transforms multiple lives' }
  ];

  const emergencyAmounts = [
    { amount: 50, impact: '💉 Critical emergency medication - saves a life today' },
    { amount: 150, impact: '🏥 Emergency surgery supplies for immediate intervention' },
    { amount: 300, impact: '🩺 Complete emergency veterinary care & recovery' },
    { amount: 750, impact: '🚨 Multi-animal emergency response & critical care' },
    { amount: 1500, impact: '🚑 Mobile emergency unit - reaching animals in crisis' }
  ];

  const currentAmounts = isEmergency ? emergencyAmounts : donationAmounts;

  const handleAmountSelect = (amount) => {
    setSelectedAmount(amount.toString());
    setCustomAmount('');
  };

  const handleCustomAmountChange = (e) => {
    setCustomAmount(e.target.value);
    setSelectedAmount('');
  };

  const getFinalAmount = () => {
    return customAmount || selectedAmount;
  };

  const handleDonateClick = () => {
    const amount = getFinalAmount();
    if (amount && amount > 0) {
      setShowPaymentForm(true);
      // Scroll to top when showing payment form
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePaymentSuccess = (donationData) => {
    // Store donation details and redirect with clean URL
    // IMPORTANT: Store amount in CENTS to preserve accuracy
    // DonateSuccess.js will convert to dollars for display
    
    const amountInCents = donationData.amount 
      ? donationData.amount
      : ((parseFloat(selectedAmount) || parseFloat(customAmount) || 0) * 100);
    
    const donationDetails = {
      amount: amountInCents.toString(), // Store in cents as string
      type: donationType,
      emergency: isEmergency
    };
    
    // Store in sessionStorage
    sessionStorage.setItem('_donate_success_data', JSON.stringify(donationDetails));
    
    // Use React Router navigate instead of window.location.href to preserve sessionStorage
    navigate('/donate/success');
  };

  const handleBackToForm = () => {
    setShowPaymentForm(false);
  };

  // If showing payment form, render Stripe Elements
  if (showPaymentForm) {
    const amount = parseFloat(getFinalAmount());
    
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-6 sm:px-8 py-16">
          <div className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-200">
            <div className="mb-6">
              <button
                onClick={handleBackToForm}
                className="text-red-700 hover:text-red-900 font-black mb-4 flex items-center gap-2"
              >
                ← Back to donation options
              </button>
              <h2 className="text-3xl font-black text-gray-900 tracking-tight">
                Complete Your ${amount} {isEmergency ? 'Emergency ' : ''}{donationType === 'monthly' ? 'Monthly ' : ''}Donation
              </h2>
            </div>
            
            <Elements stripe={stripeService.getStripe()}>
              <PaymentForm
                amount={amount}
                isEmergency={isEmergency}
                donationType={donationType}
                onSuccess={handlePaymentSuccess}
                onError={(error) => {
                  console.error('Payment error:', error);
                  // Could show error message here
                }}
              />
            </Elements>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-red-800 via-red-700 to-red-900 text-white">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 py-20">
          <div className="text-center">
            {isEmergency ? (
              <>
                <div className="mb-6">
                  <span className="bg-amber-300 text-red-900 px-5 py-2.5 rounded-full text-sm font-black uppercase tracking-widest">
                    🚨 Emergency Fund
                  </span>
                </div>
                <h1 className="text-6xl md:text-7xl font-black mb-6 tracking-tight">
                  Help Save a Life <span className="text-amber-300">Today</span>
                </h1>
                <p className="text-lg md:text-xl text-red-100 max-w-3xl mx-auto leading-relaxed">
                  <span className="block mb-3">When an animal arrives in critical condition, every moment matters.</span>
                  <span className="text-amber-200 font-black">Your emergency donation provides immediate life-saving care and hope for recovery.</span>
                </p>
              </>
            ) : (
              <>
                <h1 className="text-6xl md:text-7xl font-black mb-6 tracking-tight">
                  Make a <span className="text-amber-300">Difference</span> Today
                </h1>
                <p className="text-lg md:text-xl text-red-100 max-w-3xl mx-auto leading-relaxed">
                  <span className="block mb-3">From frightened and alone to loved and thriving...</span>
                  <span className="text-amber-200 font-black">Your generosity gives animals the second chance they deserve and helps them discover what it truly means to be loved.</span>
                </p>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 sm:px-8 py-16">
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Donation Form */}
          <div className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-200">
            <div className="flex items-center mb-6">
              <HeartIcon className="w-8 h-8 text-red-700 mr-3" />
              <h2 className="text-2xl font-black text-gray-900 tracking-tight">
                {isEmergency ? 'Emergency Donation' : 'Choose Your Donation Amount'}
              </h2>
            </div>

            {/* Toggle Emergency/Regular */}
            <div className="mb-6">
              <div className="flex gap-3">
                <button
                  onClick={() => setIsEmergency(false)}
                  className={`flex-1 py-3 px-6 rounded-xl font-black text-sm transition-all duration-200 ${
                    !isEmergency 
                      ? 'bg-red-700 text-white shadow-lg border-b-3 border-amber-400' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Regular Donation
                </button>
                <button
                  onClick={() => setIsEmergency(true)}
                  className={`flex-1 py-3 px-6 rounded-xl font-black text-sm transition-all duration-200 ${
                    isEmergency 
                      ? 'bg-red-700 text-white shadow-lg border-b-3 border-amber-400' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Emergency Fund
                </button>
              </div>
            </div>

            {/* Amount Selection */}
            <div className="mb-8">
              <label className="block text-lg font-black text-gray-900 mb-4 tracking-tight">
                Select Amount
              </label>
              <div className="grid grid-cols-2 gap-4">
                {currentAmounts.map((option) => (
                  <button
                    key={option.amount}
                    onClick={() => handleAmountSelect(option.amount)}
                    className={`p-4 rounded-xl border-2 text-left transition-all duration-300 hover:scale-105 ${
                      selectedAmount === option.amount.toString()
                        ? 'border-red-700 bg-red-50 shadow-md'
                        : 'border-gray-300 bg-white hover:border-red-400'
                    }`}
                  >
                    <div className="font-black text-lg text-gray-900">${option.amount}</div>
                    <div className="text-sm font-medium text-gray-600 mt-1">{option.impact}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Amount */}
            <div className="mb-8">
              <label className="block text-lg font-black text-gray-900 mb-2 tracking-tight">
                Or Enter Custom Amount
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 text-lg font-black">$</span>
                <input
                  type="number"
                  min="1"
                  placeholder="0"
                  value={customAmount}
                  onChange={handleCustomAmountChange}
                  className="w-full pl-8 pr-4 py-3 border-2 border-gray-300 rounded-xl focus:border-red-700 focus:outline-none focus:shadow-md text-lg font-semibold transition-all duration-200"
                />
              </div>
            </div>

            {/* Donation Options */}
            <div className="mb-8">
              <div className="flex gap-3">
                <button 
                  onClick={() => setDonationType('one-time')}
                  className={`flex-1 py-3 px-6 rounded-xl font-black text-sm transition-all duration-200 ${
                    donationType === 'one-time'
                      ? 'bg-red-700 text-white shadow-lg border-b-3 border-amber-400'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  One-Time
                </button>
                <button 
                  onClick={() => setDonationType('monthly')}
                  className={`flex-1 py-3 px-6 rounded-xl font-black text-sm transition-all duration-200 ${
                    donationType === 'monthly'
                      ? 'bg-red-700 text-white shadow-lg border-b-3 border-amber-400'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Monthly
                </button>
              </div>
              <p className="text-sm font-medium text-gray-600 mt-3 text-center">
                Monthly donors receive exclusive updates and special supporter perks
              </p>
            </div>

            {/* Secure Donation Button */}
            <button 
              onClick={handleDonateClick}
              disabled={!getFinalAmount()}
              className="w-full bg-red-700 hover:bg-red-800 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-black py-4 px-8 rounded-xl text-lg transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105"
            >
              <div className="flex items-center justify-center">
                <ShieldCheckIcon className="w-6 h-6 mr-2" />
                {getFinalAmount() ? `Donate $${getFinalAmount()} Securely` : 'Select Amount to Continue'}
              </div>
            </button>

            {/* Security Note */}
            <div className="mt-6 text-center">
              <div className="flex items-center justify-center text-sm font-medium text-gray-600">
                <CreditCardIcon className="w-4 h-4 mr-1" />
                Secured by SSL encryption • Tax-deductible
              </div>
            </div>
          </div>

          {/* Impact Information */}
          <div className="space-y-12">
            {/* Trust Indicators */}
            <div className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-200">
              <h3 className="text-2xl font-black text-gray-900 mb-6 tracking-tight">Why Donate to HALTSHELTER?</h3>
              <div className="space-y-6">
                <div className="flex items-start">
                  <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mr-4 mt-0 flex-shrink-0">
                    <ShieldCheckIcon className="w-6 h-6 text-amber-700" />
                  </div>
                  <div>
                    <h4 className="font-black text-gray-900 text-lg">501(c)(3) Nonprofit</h4>
                    <p className="text-gray-600 font-medium">Your donation is tax-deductible. EIN: 41-2531054</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mr-4 mt-0 flex-shrink-0">
                    <HeartIcon className="w-6 h-6 text-amber-700" />
                  </div>
                  <div>
                    <h4 className="font-black text-gray-900 text-lg">Direct Impact</h4>
                    <p className="text-gray-600 font-medium">100% of donations go directly to animal care and rescue operations</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mr-4 mt-0 flex-shrink-0">
                    <GiftIcon className="w-6 h-6 text-amber-700" />
                  </div>
                  <div>
                    <h4 className="font-black text-gray-900 text-lg">Transparent</h4>
                    <p className="text-gray-600 font-medium">Monthly impact reports show exactly how your money helps</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Current Needs */}
            <div className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-200">
              <h3 className="text-2xl font-black text-gray-900 mb-6 tracking-tight">Current Funding Needs</h3>
              {dataLoading ? (
                <div className="text-gray-500 text-center py-8">
                  <div className="inline-block">
                    <div className="w-12 h-12 border-4 border-gray-200 border-t-red-700 rounded-full animate-spin"></div>
                  </div>
                </div>
              ) : fundingNeeds.length > 0 ? (
                <div className="space-y-5">
                  {fundingNeeds.map((need, index) => {
                    const isEmergencyNeed = need.type === 'emergency';
                    const progress = need.goalAmount > 0 ? Math.min(100, (need.currentAmount / need.goalAmount) * 100) : 0;
                    
                    return (
                      <div key={need._id} className={`border-l-4 border-amber-500 pl-4 py-3`}>
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="font-black text-gray-900 text-lg">{need.title}</h4>
                          {isEmergencyNeed && (
                            <span className="bg-red-700 text-white text-xs px-3 py-1 rounded-full font-black">🚨 Urgent</span>
                          )}
                        </div>
                        <p className="text-gray-600 text-sm font-medium mb-3">{need.description}</p>
                        <div>
                          <div className="flex justify-between text-sm mb-2">
                            <span className="text-amber-700 font-black">
                              ${need.currentAmount?.toLocaleString() || 0} raised
                            </span>
                            <span className="text-gray-600 font-medium">
                              of ${need.goalAmount?.toLocaleString() || 0} goal
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-3">
                            <div 
                              className={`h-3 rounded-full ${isEmergencyNeed ? 'bg-red-700' : 'bg-amber-500'}`}
                              style={{ width: `${progress}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-gray-600 text-center py-6 font-medium">No active funding needs at this time.</p>
              )}
            </div>

            {/* Recent Impact */}
            <div className="bg-gray-900 rounded-2xl shadow-2xl p-8 border border-gray-700">
              <h3 className="text-2xl font-black text-white mb-6 tracking-tight">Recent Impact</h3>
              {dataLoading ? (
                <div className="text-gray-400 text-center py-8">
                  <div className="inline-block">
                    <div className="w-12 h-12 border-4 border-gray-700 border-t-amber-300 rounded-full animate-spin"></div>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-6">
                  <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
                    <p className="text-gray-300 text-sm font-medium mb-2">Animals rescued this month</p>
                    <p className="text-amber-300 font-black text-2xl">{impactStats.rescuedThisMonth}</p>
                  </div>
                  <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
                    <p className="text-gray-300 text-sm font-medium mb-2">Successful adoptions</p>
                    <p className="text-amber-300 font-black text-2xl">{impactStats.adoptionsThisMonth}</p>
                  </div>
                  <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
                    <p className="text-gray-300 text-sm font-medium mb-2">Medical treatments provided</p>
                    <p className="text-amber-300 font-black text-2xl">{impactStats.medicalTreatments}</p>
                  </div>
                  <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
                    <p className="text-gray-300 text-sm font-medium mb-2">Community pets spayed/neutered</p>
                    <p className="text-amber-300 font-black text-2xl">{impactStats.spayNeuterCount}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Other Ways to Help */}
            <div className="bg-red-50 rounded-2xl border-2 border-red-200 p-8 hover:bg-red-100 transition-colors duration-200">
              <h3 className="text-2xl font-black text-gray-900 mb-6 tracking-tight">Other Ways to Help</h3>
              <div className="space-y-4">
                <Link to="/volunteer" className="flex items-center gap-3 text-red-700 hover:text-red-900 font-black text-lg group">
                  <span className="group-hover:scale-110 transition-transform duration-200">→</span>
                  <span>Volunteer your time</span>
                </Link>
                <a href="mailto:contact@haltshelter.org?subject=Corporate%20Sponsorship%20Inquiry" className="flex items-center gap-3 text-red-700 hover:text-red-900 font-black text-lg group">
                  <span className="group-hover:scale-110 transition-transform duration-200">→</span>
                  <span>Corporate sponsorship opportunities</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Donate;
