import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function TestimonialsPanel() {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedTestimonial, setSelectedTestimonial] = useState(null);

  useEffect(() => {
    fetchTestimonials();
  }, []);

  async function fetchTestimonials() {
    setLoading(true);
    try {
      const res = await axios.get('/api/testimonials');
      setTestimonials(res.data);
    } catch (e) {
      setError('Failed to load testimonials');
    }
    setLoading(false);
  }

  if (loading) return <div className="text-center py-12 text-gray-500">Loading testimonials...</div>;
  if (error) return <div className="text-center py-12 text-red-500">{error}</div>;
  if (testimonials.length === 0) return null;

  return (
    <section className="testimonials-panel py-4">
      {/* Section Header */}
      <div className="text-center mb-12">
        <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
          ❤️ Voices of Hope
        </h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Hear from families and volunteers whose lives have been transformed by rescue
        </p>
        <div className="w-20 h-1 bg-gradient-to-r from-red-500 to-red-600 mx-auto mt-6"></div>
      </div>

      {/* Testimonials Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {testimonials.map((t, index) => (
          <div
            key={t._id}
            className="group relative cursor-pointer"
            onClick={() => setSelectedTestimonial(t)}
            style={{
              animation: `fadeInUp 0.6s ease-out ${index * 0.1}s both`
            }}
          >
            {/* Card Background with Hover Effect */}
            <div className="relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 p-8 h-full overflow-hidden">
              {/* Decorative Background */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-red-50 rounded-full -mr-16 -mt-16 group-hover:bg-red-100 transition-colors duration-500"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-yellow-50 rounded-full -ml-12 -mb-12 group-hover:bg-yellow-100 transition-colors duration-500"></div>

              {/* Content */}
              <div className="relative z-10">
                {/* Stars */}
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="text-xl">⭐</span>
                  ))}
                </div>

                {/* Quote - Truncated */}
                <blockquote className="mb-6">
                  <p className="text-lg md:text-xl font-semibold text-gray-800 leading-relaxed italic line-clamp-4">
                    "{t.quote}"
                  </p>
                </blockquote>

                {/* Divider */}
                <div className="w-12 h-1 bg-gradient-to-r from-red-500 to-red-400 mb-6"></div>

                {/* Author Info */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    {/* Avatar */}
                    <div className="relative">
                      {t.photoUrl ? (
                        <img
                          src={t.photoUrl}
                          alt={t.name}
                          className="w-16 h-16 rounded-full object-cover border-3 border-red-100 shadow-md"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-red-400 to-red-600 flex items-center justify-center text-white font-bold text-xl shadow-md border-3 border-red-100">
                          {t.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white"></div>
                    </div>

                    {/* Author Details */}
                    <div>
                      <div className="font-bold text-gray-900 text-lg">{t.name}</div>
                      {t.role && (
                        <div className="text-sm text-red-600 font-medium">{t.role}</div>
                      )}
                    </div>
                  </div>

                  {/* Read More Arrow */}
                  <div className="text-2xl group-hover:translate-x-1 transition-transform duration-300">→</div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom CTA */}
      <div className="mt-16 text-center">
        <p className="text-gray-600 mb-6">
          Ready to write your own rescue story?
        </p>
        <button
          onClick={() => window.location.href = '/animals'}
          className="inline-block bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold py-4 px-8 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
        >
          Start Your Journey →
        </button>
      </div>

      {/* Full Story Modal */}
      {selectedTestimonial && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm"
          onClick={() => setSelectedTestimonial(null)}
        >
          <div
            className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto transform transition-all duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header with Close Button */}
            <div className="sticky top-0 bg-gradient-to-r from-red-50 to-yellow-50 p-8 flex justify-between items-start border-b border-red-100">
              <div></div>
              <button
                onClick={() => setSelectedTestimonial(null)}
                className="text-gray-400 hover:text-gray-600 text-2xl transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-8 md:p-12">
              {/* Avatar Section */}
              <div className="text-center mb-8">
                <div className="inline-block relative mb-6">
                  {selectedTestimonial.photoUrl ? (
                    <img
                      src={selectedTestimonial.photoUrl}
                      alt={selectedTestimonial.name}
                      className="w-24 h-24 rounded-full object-cover border-4 border-red-200 shadow-lg"
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-red-400 to-red-600 flex items-center justify-center text-white font-bold text-4xl shadow-lg border-4 border-red-200">
                      {selectedTestimonial.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="absolute -bottom-2 -right-2 w-7 h-7 bg-green-500 rounded-full border-4 border-white"></div>
                </div>

                {/* Name and Role */}
                <h3 className="text-3xl font-bold text-gray-900 mb-2">
                  {selectedTestimonial.name}
                </h3>
                {selectedTestimonial.role && (
                  <p className="text-lg text-red-600 font-semibold mb-4">
                    {selectedTestimonial.role}
                  </p>
                )}

                {/* Stars */}
                <div className="flex gap-1 justify-center mb-6">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="text-2xl">⭐</span>
                  ))}
                </div>
              </div>

              {/* Divider */}
              <div className="w-20 h-1 bg-gradient-to-r from-red-500 to-red-400 mx-auto mb-8"></div>

              {/* Full Quote */}
              <blockquote className="mb-8">
                <p className="text-2xl md:text-3xl font-semibold text-gray-800 leading-relaxed italic text-center">
                  "{selectedTestimonial.quote}"
                </p>
              </blockquote>

              {/* Divider */}
              <div className="w-20 h-1 bg-gradient-to-r from-red-500 to-red-400 mx-auto mb-8"></div>

              {/* Close Button */}
              <div className="text-center">
                <button
                  onClick={() => setSelectedTestimonial(null)}
                  className="inline-block bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold py-3 px-8 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Animations */}
      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .testimonials-panel {
          background: linear-gradient(135deg, #fafafa 0%, #f5f5f5 100%);
          border-radius: 24px;
          padding: 3rem 2rem;
        }

        .line-clamp-4 {
          display: -webkit-box;
          -webkit-line-clamp: 4;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        @media (max-width: 768px) {
          .testimonials-panel {
            padding: 2rem 1rem;
          }
        }
      `}</style>
    </section>
  );
}
