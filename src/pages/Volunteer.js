import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { HeartIcon, UserGroupIcon, TruckIcon, HomeIcon, CameraIcon, MegaphoneIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { apiService, handleApiError } from '../services/api';

export default function Volunteer() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    age: '',
    interests: [],
    availability: [],
    availabilityDays: [],
    availabilityTimes: [],
    hoursPerWeek: '',
    experience: '',
    message: ''
  });
  const [submitStatus, setSubmitStatus] = useState('');
  const [errors, setErrors] = useState({});

  const volunteerOpportunities = [
    {
      id: 'animal-care',
      title: 'Animal Care',
      icon: HeartIcon,
      description: 'Feed, clean, exercise, and provide loving attention to animals in our care',
      commitment: '4+ hours/week',
      requirements: 'Animal experience preferred but not required. Training provided.'
    },
    {
      id: 'transport',
      title: 'Transport & Rescue',
      icon: TruckIcon,
      description: 'Help transport animals to/from vet appointments, foster homes, and adoption events',
      commitment: 'Flexible schedule',
      requirements: 'Valid driver\'s license and reliable vehicle required.'
    },
    {
      id: 'fostering',
      title: 'Foster Care',
      icon: HomeIcon,
      description: 'Provide temporary homes for animals who need extra care or space',
      commitment: 'Varies by animal needs',
      requirements: 'Home visit and application process required.'
    },
    {
      id: 'events',
      title: 'Events & Outreach',
      icon: UserGroupIcon,
      description: 'Help at adoption events, fundraisers, and community outreach programs',
      commitment: 'Weekend events',
      requirements: 'Friendly personality and enthusiasm for our mission.'
    },
    {
      id: 'photography',
      title: 'Photography & Media',
      icon: CameraIcon,
      description: 'Take photos/videos of animals for adoption listings and social media',
      commitment: '2-4 hours/month',
      requirements: 'Photography skills and own equipment preferred.'
    },
    {
      id: 'fundraising',
      title: 'Fundraising & Marketing',
      icon: MegaphoneIcon,
      description: 'Help with grant writing, social media, and fundraising campaigns',
      commitment: 'Remote work possible',
      requirements: 'Marketing, writing, or social media experience helpful.'
    }
  ];

  const availabilityOptions = [
    'Weekday mornings',
    'Weekday afternoons',
    'Weekday evenings',
    'Weekend mornings',
    'Weekend afternoons',
    'Weekend evenings',
    'Flexible/As needed'
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleCheckboxChange = (e, field) => {
    const { value, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [field]: checked
        ? [...prev[field], value]
        : prev[field].filter(item => item !== value)
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
    if (formData.interests.length === 0) newErrors.interests = 'Please select at least one area of interest';
    if (formData.availability.length === 0) newErrors.availability = 'Please select your availability';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setSubmitStatus('loading');
      await apiService.volunteers.apply(formData);
      setSubmitStatus('success');
      
      // Scroll to top to show success message
      window.scrollTo({ top: 0, behavior: 'smooth' });
      
      // Reset form
      setFormData({
        name: '',
        email: '',
        phone: '',
        age: '',
        interests: [],
        availability: [],
        availabilityDays: [],
        availabilityTimes: [],
        hoursPerWeek: '',
        experience: '',
        message: ''
      });
    } catch (err) {
      console.error('Volunteer registration error:', err);
      const errorInfo = handleApiError(err);
      setSubmitStatus('error');
      setErrors({ submit: errorInfo.message });
    }
  };

  if (submitStatus === 'success') {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-6 sm:px-8 py-16">
          <div className="bg-white rounded-2xl shadow-2xl p-10 text-center border border-gray-200">
            <div className="relative w-32 h-32 mx-auto mb-8">
              <img 
                src="/haltfav.png" 
                alt="HALT Heart" 
                className="w-full h-full animate-heartBeat"
              />
            </div>
            <h1 className="text-4xl font-black text-gray-900 mb-4 tracking-tight">
              Thank You for Your Interest! 🎉
            </h1>
            <p className="text-lg font-medium text-gray-600 mb-8">
              We've received your volunteer application and will be in touch within 2-3 business days 
              to discuss next steps and answer any questions you might have.
            </p>
            <div className="bg-amber-50 border-2 border-amber-400 rounded-xl p-5 mb-8">
              <p className="text-amber-900 font-black flex items-center justify-center gap-2">
                <span className="text-2xl">📬</span>
                A confirmation email has been sent to you. <strong className="ml-1">Please check your spam/junk folder</strong> if you don't see it in your inbox.
              </p>
            </div>
            <div className="bg-red-50 border-2 border-red-200 rounded-xl p-8 mb-8">
              <h3 className="text-xl font-black text-gray-900 mb-4 tracking-tight">What happens next?</h3>
              <ul className="text-gray-700 space-y-3 text-left font-medium">
                <li className="flex items-start gap-3">
                  <span className="text-amber-500 font-black text-xl flex-shrink-0">✓</span>
                  <span>Our volunteer coordinator will review your application</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-amber-500 font-black text-xl flex-shrink-0">✓</span>
                  <span>We'll schedule a brief phone interview to discuss your interests</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-amber-500 font-black text-xl flex-shrink-0">✓</span>
                  <span>You'll receive orientation and training for your chosen volunteer roles</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-amber-500 font-black text-xl flex-shrink-0">✓</span>
                  <span>Start making a difference in the lives of animals in need!</span>
                </li>
              </ul>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => setSubmitStatus('')}
                className="bg-red-700 hover:bg-red-800 text-white font-black py-3 px-8 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105"
              >
                Submit Another Application
              </button>
              <Link
                to="/"
                className="border-2 border-red-700 text-red-700 hover:bg-red-700 hover:text-white font-black py-3 px-8 rounded-xl transition-all duration-200 text-center"
              >
                Return to Homepage
              </Link>
            </div>
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
            <h1 className="text-6xl md:text-7xl font-black mb-6 tracking-tight">
              Transform Lives <span className="text-amber-300">Together</span>
            </h1>
            <p className="text-lg md:text-xl text-red-100 max-w-3xl mx-auto leading-relaxed font-medium">
              Your time, compassion, and dedication create miracles. Join a community of changemakers who believe every animal deserves a second chance, a loving touch, and hope for tomorrow.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 sm:px-8 py-16">
        {/* Volunteer Opportunities */}
        <div className="mb-16">
          <h2 className="text-5xl font-black text-gray-900 text-center mb-4 tracking-tight">
            Ways to Make <span className="text-amber-300">Miracles</span>
          </h2>
          <p className="text-gray-600 font-medium text-center mb-12 max-w-2xl mx-auto">Choose the volunteer path that resonates with your heart—each one creates lasting change for animals in need.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {volunteerOpportunities.map((opportunity) => {
              const Icon = opportunity.icon;
              return (
                <div key={opportunity.id} className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-200 hover:scale-105 duration-300 transition-transform">
                  <div className="w-14 h-14 bg-amber-100 rounded-full flex items-center justify-center mb-5 flex-shrink-0">
                    <Icon className="w-7 h-7 text-amber-700" />
                  </div>
                  <h3 className="text-xl font-black text-gray-900 mb-3 tracking-tight">{opportunity.title}</h3>
                  <p className="text-gray-700 font-medium mb-5">{opportunity.description}</p>
                  <div className="space-y-3 border-t border-gray-200 pt-4">
                    <div>
                      <span className="font-black text-gray-900">Time Commitment:</span>
                      <p className="text-gray-600 font-medium mt-1">{opportunity.commitment}</p>
                    </div>
                    <div>
                      <span className="font-black text-gray-900">Requirements:</span>
                      <p className="text-gray-600 font-medium mt-1">{opportunity.requirements}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Volunteer Registration Form */}
        <div className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-200">
          <h2 className="text-3xl font-black text-gray-900 mb-8 text-center tracking-tight">
            Ready to Get Started? Apply Today!
          </h2>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Personal Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-black text-gray-900 mb-2 tracking-tight">
                  Full Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-0 focus:border-red-700 transition-colors ${
                    errors.name ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter your full name"
                />
                {errors.name && <p className="text-red-500 text-sm mt-1 font-medium">{errors.name}</p>}
              </div>

              <div>
                <label className="block text-sm font-black text-gray-900 mb-2 tracking-tight">
                  Email Address *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-0 focus:border-red-700 transition-colors ${
                    errors.email ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter your email address"
                />
                {errors.email && <p className="text-red-500 text-sm mt-1 font-medium">{errors.email}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-black text-gray-900 mb-2 tracking-tight">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-0 focus:border-red-700 transition-colors ${
                    errors.phone ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter your phone number"
                />
                {errors.phone && <p className="text-red-500 text-sm mt-1 font-medium">{errors.phone}</p>}
              </div>

              <div>
                <label className="block text-sm font-black text-gray-900 mb-2 tracking-tight">
                  Age
                </label>
                <input
                  type="number"
                  name="age"
                  value={formData.age}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-0 focus:border-red-700 transition-colors"
                  placeholder="Enter your age"
                  min="16"
                  max="100"
                />
              </div>
            </div>

            {/* Areas of Interest */}
            <div>
              <label className="block text-sm font-black text-gray-900 mb-4 tracking-tight">
                Areas of Interest * (Select all that apply)
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {volunteerOpportunities.map((opportunity) => (
                  <label key={opportunity.id} className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      value={opportunity.id}
                      checked={formData.interests.includes(opportunity.id)}
                      onChange={(e) => handleCheckboxChange(e, 'interests')}
                      className="h-5 w-5 text-red-700 border-2 border-gray-300 rounded-lg cursor-pointer"
                    />
                    <span className="ml-3 font-medium text-gray-700">{opportunity.title}</span>
                  </label>
                ))}
              </div>
              {errors.interests && <p className="text-red-500 text-sm mt-2 font-medium">{errors.interests}</p>}
            </div>

            {/* Availability */}
            <div>
              <label className="block text-sm font-black text-gray-900 mb-4 tracking-tight">
                Availability * (Select all that apply)
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {availabilityOptions.map((option) => (
                  <label key={option} className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      value={option}
                      checked={formData.availability.includes(option)}
                      onChange={(e) => handleCheckboxChange(e, 'availability')}
                      className="h-5 w-5 text-red-700 border-2 border-gray-300 rounded-lg cursor-pointer"
                    />
                    <span className="ml-3 font-medium text-gray-700">{option}</span>
                  </label>
                ))}
              </div>
              {errors.availability && <p className="text-red-500 text-sm mt-2 font-medium">{errors.availability}</p>}
            </div>

            {/* Available Days */}
            <div>
              <label className="block text-sm font-black text-gray-900 mb-3 tracking-tight">
                Available Days (Optional)
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => (
                  <label key={day} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.availabilityDays.includes(day)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFormData(prev => ({
                            ...prev,
                            availabilityDays: [...prev.availabilityDays, day]
                          }));
                        } else {
                          setFormData(prev => ({
                            ...prev,
                            availabilityDays: prev.availabilityDays.filter(d => d !== day)
                          }));
                        }
                      }}
                      className="h-5 w-5 text-red-700 border-2 border-gray-300 rounded-lg cursor-pointer"
                    />
                    <span className="text-sm font-medium text-gray-700">{day}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Available Times */}
            <div>
              <label className="block text-sm font-black text-gray-900 mb-3 tracking-tight">
                Preferred Times (Optional)
              </label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {['Morning (6am-12pm)', 'Afternoon (12pm-6pm)', 'Evening (6pm-12am)'].map(time => (
                  <label key={time} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.availabilityTimes.includes(time)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFormData(prev => ({
                            ...prev,
                            availabilityTimes: [...prev.availabilityTimes, time]
                          }));
                        } else {
                          setFormData(prev => ({
                            ...prev,
                            availabilityTimes: prev.availabilityTimes.filter(t => t !== time)
                          }));
                        }
                      }}
                      className="h-5 w-5 text-red-700 border-2 border-gray-300 rounded-lg cursor-pointer"
                    />
                    <span className="text-sm font-medium text-gray-700">{time}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Hours Per Week */}
            <div>
              <label className="block text-sm font-black text-gray-900 mb-2 tracking-tight">
                Hours per Week (Optional)
              </label>
              <select
                name="hoursPerWeek"
                value={formData.hoursPerWeek}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-0 focus:border-red-700 transition-colors font-medium"
              >
                <option value="">Select...</option>
                <option value="1-3">1-3 hours</option>
                <option value="4-6">4-6 hours</option>
                <option value="7-10">7-10 hours</option>
                <option value="11-15">11-15 hours</option>
                <option value="16-20">16-20 hours</option>
                <option value="20+">20+ hours</option>
              </select>
            </div>

            {/* Experience */}
            <div>
              <label className="block text-sm font-black text-gray-900 mb-2 tracking-tight">
                Previous Experience with Animals (Optional)
              </label>
              <textarea
                name="experience"
                value={formData.experience}
                onChange={handleInputChange}
                rows={4}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-0 focus:border-red-700 transition-colors font-medium"
                placeholder="Tell us about any previous experience with animals, volunteering, or relevant skills..."
              />
            </div>

            {/* Additional Message */}
            <div>
              <label className="block text-sm font-black text-gray-900 mb-2 tracking-tight">
                Additional Comments or Questions (Optional)
              </label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-0 focus:border-red-700 transition-colors font-medium"
                placeholder="Anything else you'd like us to know?"
              />
            </div>

            {/* Submit Button */}
            <div className="text-center pt-4">
              {errors.submit && (
                <p className="text-red-500 text-sm mb-4 font-medium">{errors.submit}</p>
              )}
              
              <button
                type="submit"
                disabled={submitStatus === 'loading'}
                className="bg-red-700 hover:bg-red-800 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-black py-4 px-8 rounded-xl text-lg transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105"
              >
                {submitStatus === 'loading' ? 'Submitting...' : 'Submit Application'}
              </button>
              
              <p className="text-sm font-medium text-gray-600 mt-4">
                By submitting this form, you agree to be contacted by HALT Shelter regarding volunteer opportunities.
              </p>
            </div>
          </form>
        </div>

        {/* Additional Information */}
        <div className="mt-16 grid grid-cols-1 lg:grid-cols-2 gap-10">
          <div className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-200">
            <h3 className="text-2xl font-black text-gray-900 mb-6 tracking-tight">Volunteer Benefits</h3>
            <ul className="space-y-4 text-gray-700 font-medium">
              <li className="flex items-start gap-3">
                <span className="text-amber-500 font-black text-xl flex-shrink-0">✓</span>
                <span>Make a direct impact in saving animal lives</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-amber-500 font-black text-xl flex-shrink-0">✓</span>
                <span>Gain valuable experience and skills</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-amber-500 font-black text-xl flex-shrink-0">✓</span>
                <span>Connect with like-minded animal lovers</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-amber-500 font-black text-xl flex-shrink-0">✓</span>
                <span>Flexible scheduling to fit your lifestyle</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-amber-500 font-black text-xl flex-shrink-0">✓</span>
                <span>Comprehensive training and support</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-amber-500 font-black text-xl flex-shrink-0">✓</span>
                <span>Volunteer appreciation events and recognition</span>
              </li>
            </ul>
          </div>

          <div className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-200">
            <h3 className="text-2xl font-black text-gray-900 mb-6 tracking-tight">Frequently Asked Questions</h3>
            <div className="space-y-5">
              <div>
                <h4 className="font-black text-gray-900 mb-2">Do I need previous experience?</h4>
                <p className="text-gray-600 font-medium text-sm">No! We provide comprehensive training for all volunteer roles. Your enthusiasm and commitment matter most.</p>
              </div>
              <div>
                <h4 className="font-black text-gray-900 mb-2">What's the minimum age requirement?</h4>
                <p className="text-gray-600 font-medium text-sm">Volunteers must be 16 or older. Volunteers under 18 need parental consent.</p>
              </div>
              <div>
                <h4 className="font-black text-gray-900 mb-2">How much time do I need to commit?</h4>
                <p className="text-gray-600 font-medium text-sm">We appreciate any time you can give! Most volunteers contribute 2-4 hours per week, but we're flexible.</p>
              </div>
              <div>
                <h4 className="font-black text-gray-900 mb-2">Can I bring my own pet?</h4>
                <p className="text-gray-600 font-medium text-sm">For safety reasons, personal pets are not allowed in our facilities except for special approved events.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
