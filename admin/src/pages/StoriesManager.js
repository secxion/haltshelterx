import React, { useState, useEffect } from 'react';
import {
  PencilIcon,
  TrashIcon,
  PlusIcon,
  EyeIcon,
  PhotoIcon
} from '@heroicons/react/24/outline';
import { API_BASE_URL, getUploadUrl } from '../config';

const MAIN_SITE_URL = process.env.REACT_APP_MAIN_SITE_URL || 'http://localhost:3001';

const StoriesManager = () => {
  // Helper function to resolve image URLs for different sources
  const getImageUrl = (imageUrl) => {
    if (!imageUrl) return '';
    
    // If it's a data URL (base64 encoded image), return as-is
    if (imageUrl.startsWith('data:')) {
      return imageUrl;
    }
    
    // If it's already a full URL (uploaded images), return as-is
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
      return imageUrl;
    }
    
    // If it's a relative path (public images), convert to main website URL
    if (imageUrl.startsWith('/images/')) {
      return `${MAIN_SITE_URL}${imageUrl}`;
    }
    
    // If it's just a filename or other format, assume it's from uploads
    if (!imageUrl.startsWith('/')) {
      return getUploadUrl(imageUrl);
    }
    
    return imageUrl;
  };

  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingStory, setEditingStory] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    excerpt: '',
    category: 'Success Story',
    content: '',
    featuredImage: null,
    featuredImageAlt: '',
    featuredImageCaption: '',
    images: [],
    galleryFiles: null,
    status: 'published'
  });

  const categories = [
    'Success Story',
    'Recent Rescue',
    'Medical Success',
    'Volunteer Spotlight',
    'Foster Story',
    'Memorial',
    'News',
    'Event'
  ];

  // Fetch stories
  const fetchStories = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/stories`);
      const data = await response.json();
      console.log('Admin Panel - API Response:', data);
      console.log('Admin Panel - Stories count:', data.data ? data.data.length : 0);
      if (data.data && data.data.length > 0) {
        console.log('Admin Panel - First story:', data.data[0]);
        console.log('Admin Panel - First story featured image:', data.data[0].featuredImage);
      }
      setStories(data.data || []);
    } catch (error) {
      console.error('Error fetching stories:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStories();
  }, []);

  // Handle image file selection
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({ ...prev, featuredImage: file }));
    }
  };

  // Handle gallery file selection
  const handleGalleryChange = (e) => {
    const newFiles = Array.from(e.target.files || []);
    const currentFiles = formData.galleryFiles ? Array.from(formData.galleryFiles) : [];
    const combinedFiles = [...currentFiles, ...newFiles];
    
    if (combinedFiles.length > 10) {
      alert(`Maximum 10 images allowed. You selected ${combinedFiles.length} total.`);
      e.target.value = '';
      return;
    }
    
    const dt = new DataTransfer();
    combinedFiles.forEach(file => dt.items.add(file));
    
    setFormData(prev => ({ ...prev, galleryFiles: dt.files }));
    e.target.value = '';
  };

  // Convert file to base64
  const convertImageToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.featuredImage && !editingStory?.featuredImage?.url) {
      alert('Please select a featured image for the story.');
      return;
    }
    
    try {
      // Convert featured image to base64 if selected
      let featuredImageData = null;
      if (formData.featuredImage instanceof File) {
        const base64 = await convertImageToBase64(formData.featuredImage);
        featuredImageData = {
          url: base64,
          alt: formData.featuredImageAlt,
          caption: formData.featuredImageCaption
        };
      } else if (editingStory?.featuredImage) {
        featuredImageData = editingStory.featuredImage;
      }

      // Convert gallery files to base64
      let galleryImages = [...(formData.images || [])];
      
      if (formData.galleryFiles && formData.galleryFiles.length > 0) {
        const newImages = await Promise.all(
          Array.from(formData.galleryFiles).map(async (file) => {
            const base64 = await convertImageToBase64(file);
            return {
              url: base64,
              alt: '',
              caption: ''
            };
          })
        );
        galleryImages = [...galleryImages, ...newImages];
      }

      const storyData = {
        title: formData.title,
        excerpt: formData.excerpt,
        content: formData.content,
        category: formData.category,
        status: formData.status,
        featuredImage: featuredImageData,
        images: galleryImages
      };

      const token = localStorage.getItem('adminToken');
      const url = editingStory 
        ? `${API_BASE_URL}/stories/${editingStory._id}`
        : `${API_BASE_URL}/stories`;
      
      const method = editingStory ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify(storyData),
      });

      if (response.ok) {
        await fetchStories();
        resetForm();
        alert(editingStory ? 'Story updated successfully!' : 'Story created successfully!');
      } else {
        const errorData = await response.json().catch(() => ({}));
        alert(`Error saving story: ${errorData.error || errorData.errors?.[0]?.msg || response.statusText}`);
      }
    } catch (error) {
      console.error('Error saving story:', error);
      alert('Error saving story: ' + error.message);
    }
  };

  // Handle delete
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this story?')) {
      try {
        // Get admin token for authentication
        const token = localStorage.getItem('adminToken');
        
        const response = await fetch(`${API_BASE_URL}/stories/${id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': token ? `Bearer ${token}` : '',
          },
        });

        if (response.ok) {
          await fetchStories();
          alert('Story deleted successfully!');
        } else {
          const errorData = await response.json().catch(() => ({}));
          alert(`Error deleting story: ${errorData.error || response.statusText}`);
        }
      } catch (error) {
        console.error('Error deleting story:', error);
        alert('Error deleting story');
      }
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      title: '',
      excerpt: '',
      category: 'Success Story',
      content: '',
      featuredImage: null,
      featuredImageAlt: '',
      featuredImageCaption: '',
      images: [],
      galleryFiles: null,
      status: 'published'
    });
    setEditingStory(null);
    setShowForm(false);
  };

  // Handle edit
  const handleEdit = (story) => {
    setFormData({
      title: story.title || '',
      excerpt: story.excerpt || '',
      category: story.category || 'Success Story',
      content: story.content || '',
      featuredImage: null,
      featuredImageAlt: story.featuredImage?.alt || '',
      featuredImageCaption: story.featuredImage?.caption || '',
      images: story.images || [],
      galleryFiles: null,
      status: story.status || 'published'
    });
    setEditingStory(story);
    setShowForm(true);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Stories Management</h1>
          <p className="mt-2 text-gray-600">
            Manage animal rescue stories and success stories
          </p>
          <div className="mt-4">
            <a 
              href="http://localhost:3001/stories" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              🌐 View Stories on Main Website
            </a>
          </div>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          <PlusIcon className="h-4 w-4 mr-2" />
          Add New Story
        </button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-2xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {editingStory ? 'Edit Story' : 'Add New Story'}
              </h3>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Title</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Excerpt</label>
                  <textarea
                    required
                    rows={2}
                    value={formData.excerpt}
                    onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                    placeholder="Brief description of the story (max 500 characters)"
                    maxLength={500}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  />
                  <p className="mt-1 text-sm text-gray-500">{formData.excerpt.length}/500 characters</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  >
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Featured Image</label>
                  {formData.featuredImage && (
                    <div className="mb-3">
                      <img
                        src={URL.createObjectURL(formData.featuredImage)}
                        alt="Featured preview"
                        className="w-full h-48 object-cover rounded-lg border border-gray-300"
                      />
                    </div>
                  )}
                  {!formData.featuredImage && editingStory?.featuredImage?.url && (
                    <div className="mb-3">
                      <img
                        src={editingStory.featuredImage.url}
                        alt="Featured preview"
                        className="w-full h-48 object-cover rounded-lg border border-gray-300"
                      />
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Featured Image Alt Text</label>
                  <input
                    type="text"
                    value={formData.featuredImageAlt}
                    onChange={(e) => setFormData(prev => ({ ...prev, featuredImageAlt: e.target.value }))}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Gallery Images (up to 10)</label>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleGalleryChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 shadow-sm"
                  />
                  <p className="text-xs text-gray-500 mt-1">Upload additional images for the story gallery</p>

                  {/* Show existing gallery images */}
                  {formData.images && formData.images.length > 0 && (
                    <div className="mt-3 mb-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Current Gallery Images</h4>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {formData.images.map((img, idx) => (
                          <div key={idx} className="relative group">
                            <img
                              src={img.url}
                              alt={`Gallery ${idx}`}
                              className="w-full h-24 object-cover rounded-lg border border-gray-300"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Show new gallery files */}
                  {formData.galleryFiles && formData.galleryFiles.length > 0 && (
                    <div className="mt-3 mb-3">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">New Gallery Images</h4>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-3">
                        {Array.from(formData.galleryFiles).map((file, index) => (
                          <div key={index} className="relative group">
                            <img
                              src={URL.createObjectURL(file)}
                              alt={`New ${index}`}
                              className="w-full h-24 object-cover rounded-lg border border-gray-300"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                const dt = new DataTransfer();
                                Array.from(formData.galleryFiles).forEach((f, i) => {
                                  if (i !== index) dt.items.add(f);
                                });
                                setFormData(prev => ({ ...prev, galleryFiles: dt.files }));
                              }}
                              className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                            >
                              ✕
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Content</label>
                  <textarea
                    required
                    rows={6}
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  >
                    {editingStory ? 'Update' : 'Create'} Story
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Stories Grid */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {stories.length === 0 ? (
            <li className="px-6 py-12 text-center">
              <PhotoIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No stories</h3>
              <p className="mt-1 text-sm text-gray-500">Get started by creating a new story.</p>
              <div className="mt-6">
                <button
                  onClick={() => setShowForm(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
                >
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Add New Story
                </button>
              </div>
            </li>
          ) : (
            stories.map((story) => (
              <li key={story._id}>
                <div className="px-4 py-4 flex items-center justify-between">
                  <div className="flex items-center">
                    {story.featuredImage?.url ? (
                      <img
                        className="h-10 w-10 rounded-lg object-cover"
                        src={getImageUrl(story.featuredImage.url)}
                        alt={story.featuredImage.altText || story.title}
                        onError={(e) => {
                          console.error('Story list image failed to load:', e.target.src);
                          console.log('Story:', story.title);
                          // Hide broken image
                          e.target.style.display = 'none';
                          e.target.parentNode.querySelector('.fallback-icon').style.display = 'flex';
                        }}
                        onLoad={() => {
                          console.log('Story list image loaded:', story.featuredImage.url);
                        }}
                      />
                    ) : null}
                    <div className="h-10 w-10 rounded-lg bg-gray-200 flex items-center justify-center fallback-icon" style={{display: story.featuredImage?.url ? 'none' : 'flex'}}>
                      <PhotoIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <div className="ml-4">
                      <div className="flex items-center">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {story.title}
                        </p>
                        <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          story.category === 'Success Story' ? 'bg-green-100 text-green-800' :
                          story.category === 'Recent Rescue' ? 'bg-blue-100 text-blue-800' :
                          story.category === 'Medical Success' ? 'bg-purple-100 text-purple-800' :
                          story.category === 'Foster Story' ? 'bg-yellow-100 text-yellow-800' :
                          story.category === 'Volunteer Spotlight' ? 'bg-pink-100 text-pink-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {story.category}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500">
                        {new Date(story.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => window.open(`http://localhost:3001/stories/${story.slug}`, '_blank')}
                      className="text-gray-400 hover:text-gray-500"
                      title="View Story"
                    >
                      <EyeIcon className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleEdit(story)}
                      className="text-primary-600 hover:text-primary-900"
                      title="Edit Story"
                    >
                      <PencilIcon className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(story._id)}
                      className="text-red-600 hover:text-red-900"
                      title="Delete Story"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
};

export default StoriesManager;
