import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiService } from '../services/api';

const FosterAnimals = () => {
  const [animals, setAnimals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewingAnimal, setViewingAnimal] = useState(null);
  const [fosteringAnimal, setFosteringAnimal] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    fetch('/api/animals/foster-eligible')
      .then(res => res.json())
      .then(data => {
        setAnimals(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const AnimalDetailModal = ({ animal, onClose }) => {
    if (!animal) return null;

    const nextImage = () => {
      if (animal.images && animal.images.length > 1) {
        setCurrentImageIndex((prev) => (prev + 1) % animal.images.length);
      }
    };

    const prevImage = () => {
      if (animal.images && animal.images.length > 1) {
        setCurrentImageIndex((prev) => (prev - 1 + animal.images.length) % animal.images.length);
      }
    };

    return (
      <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50" onClick={onClose}>
        <div className="relative top-10 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white" onClick={(e) => e.stopPropagation()}>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-900">💝 Meet {animal.name}</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-xl"
            >
              ✕
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Image Gallery */}
            <div>
              <div className="relative">
                {animal.images && animal.images.length > 0 ? (
                  <>
                    <img
                      src={animal.images[currentImageIndex].url}
                      alt={animal.images[currentImageIndex].altText || animal.name}
                      className="w-full h-80 object-cover rounded-lg"
                    />
                    {animal.images.length > 1 && (
                      <>
                        <button
                          onClick={prevImage}
                          className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70"
                        >
                          ←
                        </button>
                        <button
                          onClick={nextImage}
                          className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70"
                        >
                          →
                        </button>
                        <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-1">
                          {animal.images.map((_, index) => (
                            <button
                              key={index}
                              onClick={() => setCurrentImageIndex(index)}
                              className={`w-2 h-2 rounded-full ${
                                index === currentImageIndex ? 'bg-white' : 'bg-white bg-opacity-50'
                              }`}
                            />
                          ))}
                        </div>
                      </>
                    )}
                  </>
                ) : (
                  <div className="w-full h-80 bg-gray-200 rounded-lg flex items-center justify-center text-6xl">
                    🐾
                  </div>
                )}
              </div>
            </div>

            {/* Animal Details */}
            <div className="space-y-4">
              {/* Basic Info */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">Basic Information</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div><span className="font-medium">Species:</span> {animal.species}</div>
                  <div><span className="font-medium">Breed:</span> {animal.breed || 'Mixed'}</div>
                  <div><span className="font-medium">Age:</span> {animal.age || 'Unknown'}</div>
                  <div><span className="font-medium">Gender:</span> {animal.gender || 'Unknown'}</div>
                  <div><span className="font-medium">Size:</span> {animal.size || 'Unknown'}</div>
                </div>
              </div>

              {/* Description */}
              {animal.description && (
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-2">About {animal.name}</h3>
                  <p className="text-sm text-gray-700">{animal.description}</p>
                </div>
              )}

              {/* Medical Status */}
              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">Medical Status</h3>
                <div className="space-y-1 text-sm">
                  <div>✅ Spayed/Neutered: {animal.isSpayedNeutered ? 'Yes' : 'No'}</div>
                  <div>✅ Vaccinated: {animal.isVaccinated ? 'Yes' : 'No'}</div>
                  <div>✅ Microchipped: {animal.isMicrochipped ? 'Yes' : 'No'}</div>
                </div>
              </div>

              {/* Special Needs */}
              {animal.specialNeeds && animal.specialNeedsDescription && (
                <div className="bg-yellow-50 p-4 rounded-lg border-l-4 border-yellow-400">
                  <h3 className="font-semibold text-gray-900 mb-2">💛 Special Needs</h3>
                  <p className="text-sm text-gray-700">{animal.specialNeedsDescription}</p>
                </div>
              )}

              {/* Foster Info */}
              <div className="bg-purple-50 p-4 rounded-lg border-l-4 border-purple-400">
                <h3 className="font-semibold text-gray-900 mb-2">💝 Foster Care Information</h3>
                <p className="text-sm text-gray-700 mb-2">
                  {animal.name} needs a temporary loving home. We provide all supplies, medical care, and support—you provide the love and safe space.
                </p>
                <p className="text-sm font-medium text-purple-700">
                  Duration: Typically 2-8 weeks until adoption
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setFosteringAnimal(animal);
                    onClose();
                  }}
                  className="flex-1 bg-purple-600 hover:bg-purple-700 text-white text-center py-3 px-4 rounded-lg font-semibold transition-colors"
                >
                  💝 Foster {animal.name}
                </button>
                <Link
                  to="/donate"
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white text-center py-3 px-4 rounded-lg font-semibold transition-colors"
                >
                  💕 Support Care
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Foster Application Form Modal Component
  const FosterApplicationModal = ({ animal, onClose }) => {
    const [formData, setFormData] = useState({
      name: '',
      email: '',
      phone: '',
      age: '',
      address: '',
      homeType: '',
      hasOtherPets: '',
      otherPetsDetails: '',
      experience: '',
      availability: '',
      availabilityDays: [],
      availabilityTimes: [],
      hoursPerWeek: '',
      references: '',
      reason: ''
    });
    const [submitting, setSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState('');

    if (!animal) return null;

    const handleInputChange = (e) => {
      const { name, value } = e.target;
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
      setSubmitError('');
    };

    const handleSubmit = async (e) => {
      e.preventDefault();
      setSubmitting(true);
      setSubmitError('');

      try {
        // Split name into first and last name
        const nameParts = formData.name.trim().split(' ');
        const firstName = nameParts[0] || '';
        const lastName = nameParts.slice(1).join(' ') || nameParts[0] || 'N/A';

        const applicationData = {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          age: formData.age,
          address: formData.address,
          interests: ['fostering'],
          availability: [formData.availability || 'Flexible/As needed'],
          availabilityDays: formData.availabilityDays,
          availabilityTimes: formData.availabilityTimes,
          hoursPerWeek: formData.hoursPerWeek,
          experience: `${formData.experience}\n\nHome Type: ${formData.homeType}\nHas Other Pets: ${formData.hasOtherPets}\n${formData.otherPetsDetails ? 'Other Pets Details: ' + formData.otherPetsDetails : ''}`,
          message: `🏠 FOSTER APPLICATION FOR: ${animal.name} (${animal.species})\n\n💭 Reason for fostering: ${formData.reason}\n📋 References: ${formData.references || 'None provided'}`
        };

        const response = await apiService.volunteers.apply(applicationData);

        if (!response.data || !response.data.success) {
          throw new Error(response.data?.error || 'Failed to submit application');
        }

        // Success!
        alert(`Thank you! Your foster application for ${animal.name} has been submitted successfully. We'll contact you within 24-48 hours.`);
        onClose();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } catch (error) {
        console.error('Foster application error:', error);
        
        // Handle specific error messages from axios
        let errorMessage = 'Failed to submit application. Please try again.';
        
        if (error.response) {
          // Server responded with error status
          if (error.response.status === 409) {
            errorMessage = '⚠️ An application with this email address already exists. Please use a different email or contact us if you need to update your existing application.';
          } else if (error.response.data?.error) {
            errorMessage = error.response.data.error;
          } else if (error.response.data?.message) {
            errorMessage = error.response.data.message;
          }
        } else if (error.request) {
          // Request made but no response
          errorMessage = '⚠️ Cannot connect to server. Please check your internet connection and try again.';
        } else if (error.message) {
          errorMessage = error.message;
        }
        
        setSubmitError(errorMessage);
      } finally {
        setSubmitting(false);
      }
    };

    return (
      <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50" onClick={onClose}>
        <div className="relative top-10 mx-auto p-6 border w-11/12 max-w-3xl shadow-lg rounded-md bg-white mb-10" onClick={(e) => e.stopPropagation()}>
          {/* Header */}
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-2xl font-bold text-purple-800 mb-2">💝 Foster Application for {animal.name}</h2>
              <p className="text-gray-600">Help {animal.name} find their forever home by providing temporary love and care</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
            >
              ✕
            </button>
          </div>

          {/* Animal Info Card */}
          <div className="bg-purple-50 border-2 border-purple-200 rounded-lg p-4 mb-6 flex items-center gap-4">
            {animal.images && animal.images.length > 0 && (
              <img
                src={animal.images[0].url}
                alt={animal.name}
                className="w-20 h-20 object-cover rounded-full border-2 border-purple-300"
              />
            )}
            <div>
              <h3 className="font-bold text-lg">{animal.name}</h3>
              <p className="text-gray-700">{animal.species} • {animal.breed} • {animal.age}</p>
              {animal.specialNeeds && (
                <p className="text-yellow-700 text-sm font-medium mt-1">⚠️ Has special needs</p>
              )}
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Personal Info */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="John Doe"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="john@example.com"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="(555) 123-4567"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Age *</label>
                <input
                  type="number"
                  name="age"
                  value={formData.age}
                  onChange={handleInputChange}
                  required
                  min="18"
                  max="100"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="25"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address *</label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="123 Main St, San Luis Obispo, CA 93401"
                />
              </div>
            </div>

            {/* Home Info */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Home Type *</label>
                <select
                  name="homeType"
                  value={formData.homeType}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">Select...</option>
                  <option value="House">House</option>
                  <option value="Apartment">Apartment</option>
                  <option value="Condo">Condo</option>
                  <option value="Townhouse">Townhouse</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Do you have other pets? *</label>
                <select
                  name="hasOtherPets"
                  value={formData.hasOtherPets}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">Select...</option>
                  <option value="No">No</option>
                  <option value="Yes - Dogs">Yes - Dogs</option>
                  <option value="Yes - Cats">Yes - Cats</option>
                  <option value="Yes - Both">Yes - Both</option>
                  <option value="Yes - Other">Yes - Other</option>
                </select>
              </div>
            </div>

            {formData.hasOtherPets && formData.hasOtherPets !== 'No' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tell us about your other pets</label>
                <textarea
                  name="otherPetsDetails"
                  value={formData.otherPetsDetails}
                  onChange={handleInputChange}
                  rows="2"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Breeds, ages, temperament..."
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Animal Care Experience *</label>
              <textarea
                name="experience"
                value={formData.experience}
                onChange={handleInputChange}
                required
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Describe your experience with pets, especially with this type of animal..."
              />
            </div>

            {/* Availability Section */}
            <div className="space-y-4 border-t pt-4">
              <h4 className="font-semibold text-gray-900">📅 Availability</h4>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">When can you start? *</label>
                <select
                  name="availability"
                  value={formData.availability}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">Select...</option>
                  <option value="Immediately">Immediately</option>
                  <option value="Within 1 week">Within 1 week</option>
                  <option value="Within 2 weeks">Within 2 weeks</option>
                  <option value="Within a month">Within a month</option>
                  <option value="Flexible/As needed">Flexible/As needed</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Available days *</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
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
                        className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                      />
                      <span className="text-sm text-gray-700">{day}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Preferred times *</label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
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
                        className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                      />
                      <span className="text-sm text-gray-700">{time}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Hours per week *</label>
                <select
                  name="hoursPerWeek"
                  value={formData.hoursPerWeek}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
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
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Why do you want to foster {animal.name}? *</label>
              <textarea
                name="reason"
                value={formData.reason}
                onChange={handleInputChange}
                required
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Tell us what draws you to this animal and fostering in general..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">References (Optional)</label>
              <textarea
                name="references"
                value={formData.references}
                onChange={handleInputChange}
                rows="2"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Veterinarian, previous pet care references, etc."
              />
            </div>

            {submitError && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
                <p className="text-red-700">{submitError}</p>
              </div>
            )}

            {/* Info Box */}
            <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded">
              <p className="text-sm text-blue-800">
                <strong>📋 Next Steps:</strong> After submission, we'll review your application and contact you within 24-48 hours to schedule a home visit and orientation. We provide all supplies, food, and medical care—you provide the love!
              </p>
            </div>

            {/* Buttons */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-6 py-3 border-2 border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? 'Submitting...' : `💝 Submit Application`}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto py-12 px-4">
      <div className="flex justify-center mb-6">
        <img src="/haltfav.png" alt="" className="w-16 h-16 animate-heartBeat" />
      </div>
      <h1 className="text-4xl font-bold mb-4 text-center">💝 Open Your Heart, Open Your Home</h1>
      <p className="text-gray-700 text-center mb-2 text-lg max-w-3xl mx-auto">
        These precious souls are ready for foster care—temporary love that makes permanent miracles possible.
      </p>
      <p className="text-gray-600 text-center mb-8 max-w-2xl mx-auto">
        Give them a safe haven while they await their forever families. We provide everything—you provide the love. ❤️
      </p>

      {/* Why Foster Section */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-6 mb-8 border-2 border-purple-200">
        <h2 className="text-2xl font-bold text-center mb-4 text-purple-800">🏡 Why Foster Saves Lives</h2>
        <div className="grid md:grid-cols-3 gap-4 text-center">
          <div className="bg-white p-4 rounded-lg">
            <div className="text-3xl mb-2">🐾</div>
            <h3 className="font-semibold mb-1">More Lives Saved</h3>
            <p className="text-sm text-gray-600">Every foster opens space to rescue another animal in need</p>
          </div>
          <div className="bg-white p-4 rounded-lg">
            <div className="text-3xl mb-2">💪</div>
            <h3 className="font-semibold mb-1">Better Outcomes</h3>
            <p className="text-sm text-gray-600">Animals in foster homes are healthier, happier, and more adoptable</p>
          </div>
          <div className="bg-white p-4 rounded-lg">
            <div className="text-3xl mb-2">✨</div>
            <h3 className="font-semibold mb-1">Pure Joy</h3>
            <p className="text-sm text-gray-600">Experience the magic of transformation and healing firsthand</p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading foster animals...</p>
        </div>
      ) : animals.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-xl text-gray-700 mb-4">🎉 Great news! All our animals currently have foster homes.</p>
          <p className="text-gray-600 mb-6">But we always need more foster families for future rescues.</p>
          <Link
            to="/volunteer"
            className="inline-block bg-purple-600 hover:bg-purple-700 text-white py-3 px-6 rounded-lg font-semibold transition-colors"
          >
            💝 Become a Foster Parent
          </Link>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {animals.map(animal => {
              const imageUrl = animal.images && animal.images.length > 0 
                ? animal.images[0].url 
                : '/images/animals/default.jpg';
              
              return (
                <div key={animal._id} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                  <div className="relative h-64">
                    <img 
                      src={imageUrl} 
                      alt={animal.name} 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = '/images/animals/default.jpg';
                      }}
                    />
                    {animal.specialNeeds && (
                      <div className="absolute top-2 right-2 bg-yellow-400 text-yellow-900 px-2 py-1 rounded-full text-xs font-semibold">
                        💛 Special Needs
                      </div>
                    )}
                  </div>
                  <div className="p-5">
                    <h2 className="text-2xl font-bold mb-2 text-gray-900">{animal.name}</h2>
                    <div className="text-gray-600 mb-3 space-y-1">
                      <p className="flex items-center gap-2">
                        <span className="font-medium">Species:</span> {animal.species}
                      </p>
                      {animal.breed && (
                        <p className="flex items-center gap-2">
                          <span className="font-medium">Breed:</span> {animal.breed}
                        </p>
                      )}
                      {animal.age && (
                        <p className="flex items-center gap-2">
                          <span className="font-medium">Age:</span> {animal.age}
                        </p>
                      )}
                    </div>
                    {animal.description && (
                      <p className="text-gray-700 text-sm mb-4 line-clamp-2">
                        {animal.description}
                      </p>
                    )}
                    <button
                      onClick={() => {
                        setViewingAnimal(animal);
                        setCurrentImageIndex(0);
                      }}
                      className="w-full bg-purple-600 text-white px-4 py-3 rounded-lg hover:bg-purple-700 transition-all transform hover:scale-105 font-semibold"
                    >
                      💕 Learn More & Foster
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* CTA Section */}
          <div className="bg-gradient-to-r from-red-50 to-pink-50 rounded-lg p-8 text-center border-2 border-red-200">
            <h2 className="text-2xl font-bold mb-3 text-red-800">❤️ Every Foster Makes a Difference</h2>
            <p className="text-gray-700 mb-6 max-w-2xl mx-auto">
              Can't foster right now? You can still help by sponsoring their care, sharing their profiles, or donating supplies.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/donate"
                className="bg-red-600 hover:bg-red-700 text-white py-3 px-8 rounded-lg font-semibold transition-colors"
              >
                💕 Sponsor Care
              </Link>
              <Link
                to="/volunteer"
                className="bg-purple-600 hover:bg-purple-700 text-white py-3 px-8 rounded-lg font-semibold transition-colors"
              >
                💝 Become a Foster Parent
              </Link>
            </div>
          </div>
        </>
      )}

      {/* Modals */}
      {viewingAnimal && (
        <AnimalDetailModal
          animal={viewingAnimal}
          onClose={() => {
            setViewingAnimal(null);
            setCurrentImageIndex(0);
          }}
        />
      )}

      {fosteringAnimal && (
        <FosterApplicationModal
          animal={fosteringAnimal}
          onClose={() => setFosteringAnimal(null)}
        />
      )}
    </div>
  );
};

export default FosterAnimals;
