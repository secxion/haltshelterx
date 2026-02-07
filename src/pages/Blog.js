import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  CalendarIcon,
  UserIcon,
  ClockIcon,
  TagIcon,
  EyeIcon,
  ChevronLeftIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';
import { getPageData } from '../utils/navigationUtils';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
const SERVER_BASE_URL = process.env.REACT_APP_SERVER_URL || 'http://localhost:5000';

export default function Blog() {
  const [blogs, setBlogs] = useState([]);
  const [featuredBlogs, setFeaturedBlogs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 9,
    total: 0,
    pages: 0
  });

  const categoryLabels = {
    'pet-care': 'Pet Care',
    'adoption-tips': 'Adoption Tips',
    'animal-health': 'Animal Health',
    'success-stories': 'Success Stories',
    'shelter-updates': 'Shelter Updates',
    'volunteer-spotlights': 'Volunteer Spotlights',
    'fundraising-events': 'Fundraising Events',
    'community-outreach': 'Community Outreach',
    'educational': 'Educational',
    'announcements': 'Announcements'
  };

  useEffect(() => {
    // Check if category was passed via navigationUtils
    const pageData = getPageData('/blog');
    if (pageData && pageData.category) {
      setSelectedCategory(pageData.category);
    }
    
    // Also check URL params for backwards compatibility
    const urlParams = new URLSearchParams(window.location.search);
    const urlCategory = urlParams.get('category');
    if (urlCategory) {
      setSelectedCategory(urlCategory);
    }
    
    fetchBlogs();
    fetchFeaturedBlogs();
    fetchCategories();
  }, [selectedCategory, searchTerm, pagination.page]);

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        status: 'published'
      });

      if (selectedCategory) params.append('category', selectedCategory);
      if (searchTerm) params.append('search', searchTerm);

      const response = await fetch(`${API_BASE_URL}/blog?${params}`);
      const data = await response.json();

      if (data.success) {
        setBlogs(data.data);
        setPagination(prev => ({
          ...prev,
          total: data.pagination.total,
          pages: data.pagination.pages
        }));
      }
    } catch (error) {
      console.error('Error fetching blogs:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFeaturedBlogs = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/blog/featured`);
      const data = await response.json();

      if (data.success) {
        setFeaturedBlogs(data.data);
      }
    } catch (error) {
      console.error('Error fetching featured blogs:', error);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/blog/categories`);
      const data = await response.json();

      if (data.success) {
        // Extract just the category names from the response
        const categoryNames = data.data.map(item => item.category);
        setCategories(categoryNames);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const calculateReadTime = (content) => {
    if (!content || typeof content !== 'string') {
      return 1; // Default to 1 minute if content is undefined/null
    }
    const wordsPerMinute = 200;
    const wordCount = content.split(' ').length;
    return Math.ceil(wordCount / wordsPerMinute);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPagination(prev => ({ ...prev, page: 1 }));
    fetchBlogs();
  };

  const BlogCard = ({ blog, featured = false }) => (
    <article className="bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden transition-all duration-300 hover:shadow-2xl hover:border-red-400 transform hover:scale-105">
      {blog.featuredImage?.url && (
        <div className={`relative group overflow-hidden ${featured ? 'h-80' : 'h-64'}`}>
          <img
            src={blog.featuredImage.url.startsWith('data:') ? blog.featuredImage.url : `${SERVER_BASE_URL}${blog.featuredImage.url}`}
            alt={blog.featuredImage.alt || blog.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
          {/* Hover Overlay */}
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
            <span className="text-white font-black text-lg tracking-wide">Read Article →</span>
          </div>
          {blog.isFeatured && (
            <div className="absolute top-4 left-4 z-10">
              <span className="bg-amber-300 text-amber-900 px-4 py-1.5 rounded-full text-xs font-black flex items-center tracking-wide border border-amber-400">
                <TagIcon className="w-3 h-3 mr-1" />
                Featured
              </span>
            </div>
          )}
          <div className="absolute top-4 right-4 z-10">
            <span className="bg-amber-300 text-amber-900 px-4 py-1.5 rounded-full text-xs font-black tracking-wide">
              {categoryLabels[blog.category] || blog.category}
            </span>
          </div>
        </div>
      )}
      
      <div className="p-7 space-y-4">
        <div className="flex items-center text-sm text-gray-600 font-semibold gap-3">
          <CalendarIcon className="w-4 h-4" />
          <span>{formatDate(blog.publishedAt || blog.createdAt)}</span>
          <UserIcon className="w-4 h-4" />
          <span>{blog.author?.name || 'HALT Team'}</span>
          <ClockIcon className="w-4 h-4" />
          <span>{calculateReadTime(blog.content)} min</span>
          {blog.views > 0 && (
            <>
              <EyeIcon className="w-4 h-4" />
              <span>{blog.views} views</span>
            </>
          )}
        </div>

        <h2 className={`font-black text-gray-900 line-clamp-2 ${featured ? 'text-2xl' : 'text-lg'} leading-snug tracking-tight`}>
          {blog.title}
        </h2>

        <p className="text-gray-600 text-sm line-clamp-3 font-medium leading-relaxed">
          {blog.excerpt}
        </p>

        {blog.tags && blog.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-2">
            {blog.tags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs font-medium"
              >
                {tag}
              </span>
            ))}
            {blog.tags.length > 3 && (
              <span className="text-gray-600 text-xs font-semibold">+{blog.tags.length - 3} more</span>
            )}
          </div>
        )}

        <div className="pt-3 border-t border-gray-200">
          <button
            onClick={() => window.location.href = `/blog/${blog.slug}`}
            className="inline-flex items-center bg-red-700 hover:bg-red-800 text-white font-black py-2.5 px-5 rounded-lg transition-all duration-200 hover:shadow-lg cursor-pointer tracking-wide"
          >
            Read Article
            <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </article>
  );

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-red-800 via-red-700 to-red-900 text-white py-20">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-8">
          <div className="text-center space-y-4">
            <div className="flex justify-center mb-6">
              <img src="/haltfav.png" alt="" className="w-20 h-20 opacity-90" />
            </div>
            <h1 className="text-6xl md:text-7xl font-black tracking-tight">
              Knowledge That <span className="text-amber-300">Saves</span> Lives
            </h1>
            <p className="text-xl text-red-50 max-w-3xl mx-auto font-medium tracking-wide">
              Discover stories of transformation, expert care guidance, and compassionate insights. Every article brings you closer to understanding how love changes everything for animals in need.
            </p>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-8 py-16">
        {/* Search and Filters */}
        <div className="mb-14 space-y-6">
          <div className="flex flex-col md:flex-row gap-8 items-stretch justify-between">
            {/* Search */}
            <form onSubmit={handleSearch} className="flex-1 max-w-md">
              <div className="relative">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search blog posts by title or keywords..."
                  className="w-full pl-12 pr-5 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-red-700 focus:border-amber-400 focus:shadow-lg transition-all duration-200 font-medium"
                />
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
            </form>

            {/* Category Filter */}
            <div className="flex flex-wrap gap-3 items-center md:justify-end">
              <button
                onClick={() => {
                  setSelectedCategory('');
                  setPagination(prev => ({ ...prev, page: 1 }));
                }}
                className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-200 ${
                  selectedCategory === '' 
                    ? 'bg-red-700 text-white shadow-lg scale-105 border-b-3 border-amber-400' 
                    : 'bg-gray-800 text-gray-100 hover:bg-gray-700'
                }`}
              >
                All
              </button>
              {categories.map(category => (
                <button
                  key={category}
                  onClick={() => {
                    setSelectedCategory(category);
                    setPagination(prev => ({ ...prev, page: 1 }));
                  }}
                  className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-200 ${
                    selectedCategory === category 
                      ? 'bg-red-700 text-white shadow-lg scale-105 border-b-3 border-amber-400' 
                      : 'bg-gray-800 text-gray-100 hover:bg-gray-700'
                  }`}
                >
                  {categoryLabels[category] || category}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Featured Posts */}
        {featuredBlogs.length > 0 && !selectedCategory && !searchTerm && (
          <section className="mb-16">
            <h2 className="text-4xl font-black text-gray-900 mb-10 tracking-tight">Featured <span className="text-red-700">Articles</span></h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              {featuredBlogs.slice(0, 3).map((blog, index) => (
                <BlogCard key={blog._id} blog={blog} featured={index === 0} />
              ))}
            </div>
          </section>
        )}

        {/* Main Blog Grid */}
        <section>
          {loading ? (
            <div className="text-center py-20">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-red-700"></div>
              <p className="mt-4 text-gray-700 font-semibold text-lg">Loading inspiring articles...</p>
            </div>
          ) : blogs.length === 0 ? (
            <div className="text-center py-20">
              <svg className="w-24 h-24 text-gray-400 mx-auto mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C6.5 6.253 2 10.998 2 17s4.5 10.747 10 10.747c5.5 0 10-4.746 10-10.747m0-13V6c0-1.1.9-2 2-2h2a2 2 0 012 2v9m-6 4v2m0 0v2m0-2h2m-2 0h-2" />
              </svg>
              <h3 className="text-2xl font-black text-gray-900 mb-3 tracking-tight">No Articles Found</h3>
              <p className="text-gray-600 text-lg mb-6">
                {searchTerm ? `No articles match \"${searchTerm}\"` : selectedCategory ? `No articles in ${categoryLabels[selectedCategory] || selectedCategory}` : 'No articles yet.'}
              </p>
              {(searchTerm || selectedCategory) && (
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedCategory('');
                    setPagination(prev => ({ ...prev, page: 1 }));
                  }}
                  className="bg-red-700 hover:bg-red-800 text-white font-bold py-2.5 px-6 rounded-lg transition-colors duration-200"
                >
                  Clear Filters
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-10">
                <h2 className="text-4xl font-black text-gray-900 tracking-tight">
                  Latest <span className="text-red-700">Articles</span>
                </h2>
                <div className="text-sm text-gray-600 font-semibold">
                  <span className="text-red-700 font-black">{pagination.total}</span> {pagination.total === 1 ? 'post' : 'posts'} found
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                {blogs.map(blog => (
                  <BlogCard key={blog._id} blog={blog} />
                ))}
              </div>

              {/* Pagination */}
              {pagination.pages > 1 && (
                <div className="mt-16 flex items-center justify-center">
                  <nav className="flex items-center gap-2">
                    <button
                      onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                      disabled={pagination.page === 1}
                      className="p-2.5 rounded-lg border-2 border-gray-300 text-gray-600 hover:bg-gray-100 hover:border-red-400 disabled:opacity-50 disabled:cursor-not-allowed font-bold transition-all duration-200"
                    >
                      <ChevronLeftIcon className="w-5 h-5" />
                    </button>
                    
                    {Array.from({ length: pagination.pages }, (_, i) => i + 1).map(page => (
                      <button
                        key={page}
                        onClick={() => setPagination(prev => ({ ...prev, page }))}
                        className={`px-4 py-2.5 rounded-lg font-bold transition-all duration-200 ${
                          page === pagination.page
                            ? 'bg-red-700 text-white shadow-lg'
                            : 'text-gray-700 bg-gray-100 hover:bg-gray-800 hover:text-white'
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                    
                    <button
                      onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                      disabled={pagination.page === pagination.pages}
                      className="p-2.5 rounded-lg border-2 border-gray-300 text-gray-600 hover:bg-gray-100 hover:border-red-400 disabled:opacity-50 disabled:cursor-not-allowed font-bold transition-all duration-200"
                    >
                      <ChevronRightIcon className="w-5 h-5" />
                    </button>
                  </nav>
                </div>
              )}
            </>
          )}
        </section>
      </div>
    </main>
  );
}
