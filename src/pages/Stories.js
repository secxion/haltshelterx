import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BookOpenIcon, HeartIcon, ClockIcon, TagIcon } from '@heroicons/react/24/outline';
import { apiService, handleApiError } from '../services/api';

export default function Stories() {
  const navigate = useNavigate();
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const categories = [
    { id: 'all', name: 'All Stories', icon: BookOpenIcon },
    { id: 'Success Story', name: 'Success Stories', icon: HeartIcon },
    { id: 'Recent Rescue', name: 'Recent Rescues', icon: ClockIcon },
    { id: 'Medical Success', name: 'Medical Miracles', icon: TagIcon },
    { id: 'News', name: 'News & Updates', icon: BookOpenIcon },
    { id: 'Foster Story', name: 'Foster Stories', icon: HeartIcon },
    { id: 'Volunteer Spotlight', name: 'Volunteer Spotlight', icon: TagIcon }
  ];

  // Fetch stories from backend
  useEffect(() => {
    const fetchStories = async () => {
      try {
        setLoading(true);
        // Always request all stories (set a high limit)
        const response = await apiService.stories.getAll({ limit: 100 });
        setStories(response.data.data || []);
      } catch (err) {
        console.error('Error fetching stories:', err);
        const errorInfo = handleApiError(err);
        setError(errorInfo.message);
        // Fallback to mock data if API fails
        setStories([
          {
            _id: '1',
            title: "Bella's Second Chance",
            slug: 'bellas-second-chance',
            excerpt: "Rescued from neglect, Bella found her forever family and now helps other rescue dogs as a therapy companion.",
            featuredImage: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxOCIgZmlsbD0iIzZiNzI4MCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPlJlc2N1ZSBTdG9yeTwvdGV4dD48L3N2Zz4=",
            category: 'Success Story',
            publishedAt: '2024-01-15',
            readTime: 5,
            tags: ['rescue', 'therapy', 'success']
          },
          {
            _id: '2',
            title: "Emergency Kitten Rescue",
            slug: 'emergency-kitten-rescue',
            excerpt: "Five orphaned kittens found shelter during the storm and are now thriving in their new homes.",
            featuredImage: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxOCIgZmlsbD0iIzZiNzI4MCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPlJlc2N1ZSBTdG9yeTwvdGV4dD48L3N2Zz4=",
            category: 'Recent Rescue',
            publishedAt: '2024-01-10',
            readTime: 3,
            tags: ['kittens', 'emergency', 'storm']
          },
          {
            _id: '3',
            title: "Max's Medical Miracle",
            slug: 'maxs-medical-miracle',
            excerpt: "Thanks to donor support, Max received life-saving surgery and is now running free with his adopted family.",
            featuredImage: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxOCIgZmlsbD0iIzZiNzI4MCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPlJlc2N1ZSBTdG9yeTwvdGV4dD48L3N2Zz4=",
            category: 'Medical Success',
            publishedAt: '2024-01-05',
            readTime: 7,
            tags: ['surgery', 'medical', 'donation']
          },
          {
            _id: '4',
            title: "Luna's Journey Home",
            slug: 'lunas-journey-home',
            excerpt: "After months of rehabilitation, Luna overcame her fear of humans and found a patient, loving family.",
            featuredImage: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxOCIgZmlsbD0iIzZiNzI4MCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPlJlc2N1ZSBTdG9yeTwvdGV4dD48L3N2Zz4=",
            category: 'Foster Story',
            publishedAt: '2024-01-01',
            readTime: 6,
            tags: ['rehabilitation', 'fear', 'patience']
          },
          {
            _id: '5',
            title: "Rescue Operation: Highway Heroes",
            slug: 'highway-heroes',
            excerpt: "A coordinated rescue effort saved 12 animals from an abandoned property along the interstate.",
            featuredImage: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxOCIgZmlsbD0iIzZiNzI4MCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPlJlc2N1ZSBTdG9yeTwvdGV4dD48L3N2Zz4=",
            category: 'News',
            publishedAt: '2023-12-28',
            readTime: 8,
            tags: ['large-rescue', 'coordination', 'interstate']
          },
          {
            _id: '6',
            title: "Charlie's Cancer Battle",
            slug: 'charlies-cancer-battle',
            excerpt: "With cutting-edge treatment and community support, Charlie beat cancer and inspired our medical program.",
            featuredImage: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxOCIgZmlsbD0iIzZiNzI4MCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPlJlc2N1ZSBTdG9yeTwvdGV4dD48L3N2Zz4=",
            category: 'medical',
            publishedAt: '2023-12-20',
            readTime: 10,
            tags: ['cancer', 'treatment', 'medical-program']
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchStories();
  }, []);

  // Filter stories based on category and search
  const filteredStories = stories.filter(story => {
    const matchesCategory = selectedCategory === 'all' || story.category === selectedCategory;
    const matchesSearch = story.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         story.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (story.tags && story.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())));
    
    // Debug logging
    if (selectedCategory !== 'all') {
      console.log(`Story: ${story.title}, Category: "${story.category}", Selected: "${selectedCategory}", Matches: ${matchesCategory}`);
    }
    
    return matchesCategory && matchesSearch;
  });

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'Success Story': return 'bg-green-100 text-green-800';
      case 'Recent Rescue': return 'bg-blue-100 text-blue-800';
      case 'Medical Success': return 'bg-purple-100 text-purple-800';
      case 'Foster Story': return 'bg-yellow-100 text-yellow-800';
      case 'Volunteer Spotlight': return 'bg-pink-100 text-pink-800';
      case 'News': return 'bg-indigo-100 text-indigo-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-red-800 via-red-700 to-red-900 text-white relative overflow-hidden py-20">
        <img 
          src="/haltfav.png" 
          alt="" 
          className="absolute top-10 right-10 w-20 h-20 opacity-5 hidden lg:block"
        />
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-8">
          <div className="text-center space-y-4">
            <h1 className="text-6xl md:text-7xl font-black tracking-tight mb-6">
              Tales of <span className="text-amber-300">Resilience</span>
            </h1>
            <p className="text-xl md:text-2xl text-red-50 max-w-3xl mx-auto font-medium tracking-wide">
              From despair to joy, from abandonment to belonging—witness the transformative power of compassion and courage
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-8 py-16">
        {/* Filters and Search */}
        <div className="mb-12 space-y-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
            {/* Category Filters */}
            <div className="flex flex-wrap gap-3">
              {categories.map((category) => {
                const Icon = category.icon;
                return (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`flex items-center px-5 py-2.5 rounded-full font-semibold transition-all duration-200 ${
                      selectedCategory === category.id
                        ? 'bg-red-700 text-white shadow-lg scale-105 border-b-3 border-amber-400'
                        : 'bg-gray-800 text-gray-100 hover:bg-gray-700 hover:text-white'
                    }`}
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {category.name}
                  </button>
                );
              })}
            </div>

            {/* Search */}
            <div className="lg:w-80">
              <input
                type="text"
                placeholder="Search stories by title, excerpt, or tags..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-5 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-red-700 focus:border-amber-400 focus:shadow-lg transition-all duration-200 font-medium"
              />
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-red-700"></div>
            <p className="mt-4 text-gray-700 font-semibold text-lg">Loading inspiring stories...</p>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="text-center py-12">
            <div className="bg-yellow-50 border-2 border-yellow-300 rounded-xl p-8 max-w-2xl mx-auto shadow-lg">
              <p className="text-yellow-800 font-semibold text-lg">
                📶 Having trouble loading stories from our database. Showing some of our favorite rescue stories instead!
              </p>
            </div>
          </div>
        )}

        {/* Stories Grid */}
        {!loading && (
          <>
            {filteredStories.length === 0 ? (
              <div className="text-center py-20">
                <BookOpenIcon className="w-20 h-20 text-gray-400 mx-auto mb-6" />
                <h3 className="text-2xl font-black text-gray-900 mb-3 tracking-tight">No Stories Found</h3>
                <p className="text-gray-600 text-lg">
                  {searchTerm ? `No stories match "${searchTerm}"` : 'No stories in this category yet.'}
                </p>
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="mt-6 bg-red-700 hover:bg-red-800 text-white font-bold py-2 px-6 rounded-lg transition-colors duration-200"
                  >
                    Clear search
                  </button>
                )}
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                  {filteredStories.map((story) => (
                    <article key={story._id} className="bg-white rounded-2xl shadow-2xl overflow-hidden hover:shadow-2xl hover:border-red-400 border border-gray-200 transition-all duration-300 transform hover:scale-105">
                      <div className="aspect-w-16 aspect-h-10 relative group overflow-hidden">
                        <img 
                          src={story.featuredImage?.url || story.featuredImage || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxOCIgZmlsbD0iIzZiNzI4MCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPlJlc2N1ZSBTdG9yeTwvdGV4dD48L3N2Zz4='} 
                          alt={story.featuredImage?.altText || story.title}
                          className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-500"
                          onError={(e) => {
                            e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxOCIgZmlsbD0iIzZiNzI4MCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPlJlc2N1ZSBTdG9yeTwvdGV4dD48L3N2Zz4=';
                          }}
                        />
                        {/* Hover Overlay */}
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                          <span className="text-white font-black text-lg tracking-wide">Read Story →</span>
                        </div>
                        {story.images && story.images.length > 0 && (
                          <div className="absolute bottom-3 right-3 bg-black/70 text-white px-2.5 py-1 text-xs font-semibold rounded-lg border border-amber-400/50">
                            +{story.images.length} photos
                          </div>
                        )}
                      </div>
                      
                      {/* Gallery Thumbnails */}
                      {story.images && story.images.length > 0 && (
                        <div className="px-6 pt-4 pb-2 bg-gray-50 border-t border-gray-200">
                          <div className="grid grid-cols-4 gap-2">
                            {story.images.slice(0, 4).map((img, idx) => (
                              <img
                                key={idx}
                                src={img.url}
                                alt={`Gallery ${idx + 1}`}
                                className="w-full h-12 object-cover rounded-lg border border-gray-200 hover:border-red-400 transition-colors"
                                onError={(e) => {
                                  e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PC9zdmc+';
                                }}
                              />
                            ))}
                          </div>
                        </div>
                      )}
                      
                      <div className="p-7 space-y-4">
                        <div className="flex items-center justify-between gap-3">
                          <span className="inline-block px-4 py-1.5 rounded-full text-xs font-black bg-amber-300 text-amber-900 tracking-wide">
                            {story.category.charAt(0).toUpperCase() + story.category.slice(1)}
                          </span>
                          {story.readTime && (
                            <span className="text-xs text-gray-600 font-semibold flex items-center">
                              <ClockIcon className="w-3 h-3 mr-1" />
                              {story.readTime} min
                            </span>
                          )}
                        </div>
                        
                        <h2 className="text-lg font-bold text-gray-900 line-clamp-2 leading-snug">
                          {story.title}
                        </h2>
                        
                        <p className="text-gray-600 text-sm line-clamp-3 leading-relaxed font-medium">
                          {story.excerpt}
                        </p>
                        
                        {story.tags && story.tags.length > 0 && (
                          <div className="flex flex-wrap gap-2 pt-2">
                            {story.tags.slice(0, 3).map((tag, index) => (
                              <span 
                                key={index}
                                className="inline-block bg-gray-100 text-gray-700 text-xs px-3 py-1 rounded-full font-medium"
                              >
                                #{tag}
                              </span>
                            ))}
                          </div>
                        )}
                        
                        <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                          <button 
                            onClick={() => navigate(`/stories/${story._id}`, { state: { story } })}
                            className="inline-block bg-red-700 hover:bg-red-800 text-white font-black py-2.5 px-5 rounded-lg transition-all duration-200 hover:shadow-lg cursor-pointer tracking-wide"
                          >
                            Read Story →
                          </button>
                          
                          {story.publishedAt && (
                            <span className="text-xs text-gray-500 font-semibold">
                              {formatDate(story.publishedAt)}
                            </span>
                          )}
                        </div>
                      </div>
                    </article>
                  ))}
                </div>

                {/* Results Count */}
                <div className="mt-12 text-center text-gray-600 font-semibold">
                  Showing <span className="text-red-700 font-black">{filteredStories.length}</span> of <span className="text-red-700 font-black">{stories.length}</span> stories
                  {selectedCategory !== 'all' && ` in ${categories.find(c => c.id === selectedCategory)?.name}`}
                  {searchTerm && ` matching "${searchTerm}"`}
                </div>
              </>
            )}
          </>
        )}

        {/* Call to Action */}
        <div className="mt-20 bg-gradient-to-r from-red-800 to-red-700 text-white rounded-2xl p-10 text-center shadow-2xl">
          <h3 className="text-3xl font-black mb-4 tracking-tight">Help Us Write More <span className="text-amber-300">Happy Endings</span></h3>
          <p className="text-red-50 mb-8 text-lg font-medium max-w-2xl mx-auto">
            Every donation helps us rescue more animals and create more success stories like these.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/donate"
              className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-bold py-3 px-6 rounded-lg transition-colors"
            >
              💝 Donate Now
            </Link>
            <Link
              to="/volunteer"
              className="border-2 border-white hover:bg-white hover:text-red-600 font-bold py-3 px-6 rounded-lg transition-colors"
            >
              🤝 Volunteer
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
