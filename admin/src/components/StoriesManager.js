import React, { useState, useEffect } from 'react';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  DocumentTextIcon,
  CalendarIcon,
  TagIcon,
  StarIcon,
  CheckCircleIcon,
  ClockIcon,
  ArchiveBoxIcon
} from '@heroicons/react/24/outline';
import { API_BASE_URL } from '../config';

const StoriesManager = () => {
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingStory, setEditingStory] = useState(null);
  const [errors, setErrors] = useState([]);

  const [formData, setFormData] = useState({
    title: '',
    excerpt: '',
    content: '',
    category: 'Success Story',
    featuredImage: null,
    featuredImageAlt: '',
    featuredImageCaption: '',
    images: [],
    galleryFiles: null,
    tags: [],
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

  useEffect(() => {
    fetchStories();
  }, []);

  const fetchStories = async () => {
    try {
      setLoading(true);
      const adminToken = localStorage.getItem('adminToken');

      const response = await fetch(`${API_BASE_URL}/stories`, {
        headers: {
          'Authorization': `Bearer ${adminToken}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      
      if (data.success || data.data) {
        setStories(data.data || data);
      }
    } catch (error) {
      console.error('Error fetching stories:', error);
      setErrors([{ msg: 'Failed to fetch stories' }]);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async (story) => {
    try {
      const adminToken = localStorage.getItem('adminToken');
      const response = await fetch(`${API_BASE_URL}/stories/${story._id}`, {
        headers: {
          'Authorization': `Bearer ${adminToken}`
        }
      });

      const data = await response.json();
      setEditingStory(data.story || data.data);
      setFormData({
        title: data.story?.title || '',
        excerpt: data.story?.excerpt || '',
        content: data.story?.content || '',
        category: data.story?.category || 'Success Story',
        status: data.story?.status || 'published',
        tags: data.story?.tags || [],
        featuredImage: null,
        featuredImageAlt: data.story?.featuredImage?.alt || '',
        featuredImageCaption: data.story?.featuredImage?.caption || '',
        images: data.story?.images || [],
        galleryFiles: null
      });
      setShowForm(true);
      setErrors([]);
    } catch (error) {
      console.error('Error fetching story details:', error);
      setErrors([{ msg: 'Failed to load story details' }]);
    }
  };

  const handleDelete = async (storyId) => {
    if (!window.confirm('Are you sure you want to delete this story?')) return;

    try {
      const adminToken = localStorage.getItem('adminToken');
      const response = await fetch(`${API_BASE_URL}/stories/${storyId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${adminToken}`
        }
      });

      if (response.ok) {
        setStories(stories.filter(s => s._id !== storyId));
        alert('Story deleted successfully');
      }
    } catch (error) {
      console.error('Error deleting story:', error);
      setErrors([{ msg: 'Failed to delete story' }]);
    }
  };

  const convertImageToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors([]);

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
        // Keep existing featured image if not changing
        featuredImageData = editingStory.featuredImage;
      }

      if (!featuredImageData) {
        setErrors([{ msg: 'Featured image is required' }]);
        return;
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
        tags: formData.tags,
        featuredImage: featuredImageData,
        images: galleryImages
      };

      const adminToken = localStorage.getItem('adminToken');
      const url = editingStory
        ? `${API_BASE_URL}/stories/${editingStory._id}`
        : `${API_BASE_URL}/stories`;

      const method = editingStory ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${adminToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(storyData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        setErrors(errorData.errors || [{ msg: errorData.error || 'Failed to save story' }]);
        return;
      }

      const result = await response.json();
      
      alert(editingStory ? 'Story updated successfully!' : 'Story created successfully!');
      resetForm();
      fetchStories();
      setShowForm(false);
    } catch (error) {
      console.error('Error submitting form:', error);
      setErrors([{ msg: error.message || 'An error occurred while saving the story' }]);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      excerpt: '',
      content: '',
      category: 'Success Story',
      featuredImage: null,
      featuredImageAlt: '',
      featuredImageCaption: '',
      images: [],
      galleryFiles: null,
      tags: [],
      status: 'published'
    });
    setEditingStory(null);
    setErrors([]);
  };

  if (loading) {
    return <div className="p-6 text-center">Loading stories...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Stories Manager</h1>
        {!showForm && (
          <button
            onClick={() => {
              resetForm();
              setShowForm(true);
            }}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            New Story
          </button>
        )}
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              {editingStory ? 'Edit Story' : 'Create New Story'}
            </h2>
            <button
              onClick={() => {
                setShowForm(false);
                resetForm();
              }}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>

          {errors.length > 0 && (
            <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-4">
              {errors.map((error, idx) => (
                <p key={idx} className="text-red-600 text-sm">
                  {error.msg}
                </p>
              ))}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            {/* Excerpt */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Excerpt</label>
              <textarea
                value={formData.excerpt}
                onChange={(e) => setFormData(prev => ({ ...prev, excerpt: e.target.value }))}
                maxLength="500"
                rows="3"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                required
              />
              <p className="text-xs text-gray-500 mt-1">{formData.excerpt.length}/500 characters</p>
            </div>

            {/* Content */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Content</label>
              <textarea
                value={formData.content}
                onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                rows="8"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                required
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* Featured Image */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Featured Image</label>
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
                onChange={(e) => setFormData(prev => ({ ...prev, featuredImage: e.target.files[0] }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              />
            </div>

            {/* Featured Image Alt */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Featured Image Alt Text</label>
              <input
                type="text"
                value={formData.featuredImageAlt}
                onChange={(e) => setFormData(prev => ({ ...prev, featuredImageAlt: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              />
            </div>

            {/* Gallery Images */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Gallery Images (up to 10)</label>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => {
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
                }}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
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

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
              <input
                type="text"
                placeholder="Add a tag and press Enter"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && e.target.value.trim()) {
                    e.preventDefault();
                    setFormData(prev => ({
                      ...prev,
                      tags: [...new Set([...prev.tags, e.target.value.trim()])]
                    }));
                    e.target.value = '';
                  }
                }}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 mb-2"
              />
              <div className="flex flex-wrap gap-2">
                {formData.tags.map(tag => (
                  <span
                    key={tag}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({
                        ...prev,
                        tags: prev.tags.filter(t => t !== tag)
                      }))}
                      className="ml-2 text-blue-600 hover:text-blue-800"
                    >
                      ✕
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="archived">Archived</option>
              </select>
            </div>

            {/* Buttons */}
            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                className="flex-1 bg-blue-600 text-white rounded-lg py-2 hover:bg-blue-700 font-medium"
              >
                {editingStory ? 'Update Story' : 'Create Story'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  resetForm();
                }}
                className="flex-1 bg-gray-300 text-gray-700 rounded-lg py-2 hover:bg-gray-400 font-medium"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Stories List */}
      {!showForm && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Published</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {stories.map((story) => (
                <tr key={story._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      {story.featuredImage?.url ? (
                        <img
                          className="h-10 w-10 rounded-lg object-cover mr-3"
                          src={story.featuredImage.url}
                          alt={story.featuredImage.alt}
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-lg bg-gray-200 flex items-center justify-center mr-3">
                          <DocumentTextIcon className="h-5 w-5 text-gray-400" />
                        </div>
                      )}
                      <div>
                        <div className="text-sm font-medium text-gray-900">{story.title}</div>
                        <div className="text-xs text-gray-500">{story.excerpt.substring(0, 50)}...</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {story.category}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      story.status === 'published' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {story.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {story.publishedAt ? new Date(story.publishedAt).toLocaleDateString() : 'Not published'}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => handleEdit(story)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <PencilIcon className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(story._id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default StoriesManager;
