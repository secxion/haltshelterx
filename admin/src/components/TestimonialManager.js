import React, { useEffect, useState } from 'react';
import axios from 'axios';

const initialForm = { name: '', role: '', quote: '', photoUrl: '' };

export default function TestimonialManager() {
  const [testimonials, setTestimonials] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [photoPreview, setPhotoPreview] = useState(null);
  const [photoFile, setPhotoFile] = useState(null);

  // Get auth headers with JWT token
  function getAuthHeaders() {
    const token = localStorage.getItem('adminToken');
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  useEffect(() => {
    fetchTestimonials();
  }, []);

  async function fetchTestimonials() {
    setLoading(true);
    setError('');
    try {
      const res = await axios.get('/api/testimonials');
      setTestimonials(res.data);
    } catch (e) {
      console.error('Error fetching testimonials:', e);
      setError('Failed to load testimonials');
    }
    setLoading(false);
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  }

  function handlePhotoChange(e) {
    const file = e.target.files[0];
    if (file) {
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  }

  function handleCancel() {
    setForm(initialForm);
    setEditingId(null);
    setPhotoPreview(null);
    setPhotoFile(null);
    setError('');
    setSuccess('');
  }

  function handleEdit(testimonial) {
    setForm(testimonial);
    setEditingId(testimonial._id);
    setPhotoPreview(testimonial.photoUrl || null);
    setPhotoFile(null);
    setError('');
    setSuccess('');
  }

  async function handleDelete(id) {
    if (!window.confirm('Are you sure you want to delete this testimonial?')) return;
    setSubmitting(true);
    try {
      await axios.delete(`/api/testimonials/${id}`, { headers: getAuthHeaders() });
      setSuccess('Testimonial deleted successfully');
      fetchTestimonials();
    } catch (e) {
      console.error('Error deleting testimonial:', e);
      setError(e.response?.data?.error || 'Failed to delete testimonial');
    }
    setSubmitting(false);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess('');
    try {
      const submitForm = { ...form };
      
      // If a new photo file was selected, use it; otherwise keep the existing photoUrl
      if (photoFile) {
        submitForm.photoUrl = photoPreview; // Use base64 data URL for now
      }
      
      const config = { headers: getAuthHeaders() };
      
      if (editingId) {
        await axios.put(`/api/testimonials/${editingId}`, submitForm, config);
        setSuccess('Testimonial updated successfully');
      } else {
        await axios.post('/api/testimonials', submitForm, config);
        setSuccess('Testimonial added successfully');
      }
      setForm(initialForm);
      setEditingId(null);
      setPhotoPreview(null);
      setPhotoFile(null);
      await fetchTestimonials();
    } catch (e) {
      console.error('Error saving testimonial:', e);
      setError(e.response?.data?.error || 'Failed to save testimonial');
    }
    setSubmitting(false);
  }

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '12px' }}>
          {editingId ? 'Edit Testimonial' : 'Add New Testimonial'}
        </h2>
        
        {error && <div style={{ color: '#d32f2f', marginBottom: '12px', padding: '12px', backgroundColor: '#ffebee', borderRadius: '4px', borderLeft: '4px solid #d32f2f' }}>{error}</div>}
        {success && <div style={{ color: '#388e3c', marginBottom: '12px', padding: '12px', backgroundColor: '#e8f5e9', borderRadius: '4px', borderLeft: '4px solid #388e3c' }}>{success}</div>}
        
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px', backgroundColor: '#f5f5f5', padding: '20px', borderRadius: '8px' }}>
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Name (required)"
            required
            style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '14px' }}
          />
          
          <input
            type="text"
            name="role"
            value={form.role}
            onChange={handleChange}
            placeholder="Role (e.g., Adopter, Volunteer)"
            style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '14px' }}
          />
          
          <textarea
            name="quote"
            value={form.quote}
            onChange={handleChange}
            placeholder="Testimonial quote (required)"
            required
            rows={4}
            style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '14px', fontFamily: 'inherit' }}
          />
          
          <div style={{ padding: '16px', backgroundColor: 'white', borderRadius: '8px', border: '2px dashed #1976d2' }}>
            <label style={{ display: 'block', marginBottom: '12px', fontWeight: 'bold', color: '#333' }}>
              📷 Upload Photo (Optional)
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handlePhotoChange}
              style={{
                display: 'block',
                marginBottom: photoPreview ? '12px' : '0',
                padding: '8px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                width: '100%',
                cursor: 'pointer'
              }}
            />
            {photoPreview && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <img
                  src={photoPreview}
                  alt="Preview"
                  style={{
                    width: '100px',
                    height: '100px',
                    borderRadius: '50%',
                    objectFit: 'cover',
                    border: '2px solid #1976d2',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                  }}
                />
                <div>
                  <p style={{ margin: '0 0 8px 0', fontSize: '12px', color: '#666' }}>✓ Photo selected</p>
                  <button
                    type="button"
                    onClick={() => {
                      setPhotoPreview(null);
                      setPhotoFile(null);
                    }}
                    style={{
                      padding: '6px 12px',
                      backgroundColor: '#f44336',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '12px'
                    }}
                  >
                    Remove Photo
                  </button>
                </div>
              </div>
            )}
          </div>
          
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              type="submit"
              disabled={submitting || loading}
              style={{
                padding: '12px 20px',
                backgroundColor: '#1976d2',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: submitting || loading ? 'not-allowed' : 'pointer',
                opacity: submitting || loading ? 0.6 : 1,
                fontWeight: 'bold',
                fontSize: '14px'
              }}
            >
              {submitting ? 'Saving...' : (editingId ? 'Update' : 'Add')} Testimonial
            </button>
            
            {editingId && (
              <button
                type="button"
                onClick={handleCancel}
                disabled={submitting}
                style={{
                  padding: '12px 20px',
                  backgroundColor: '#757575',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: submitting ? 'not-allowed' : 'pointer',
                  opacity: submitting ? 0.6 : 1,
                  fontWeight: 'bold',
                  fontSize: '14px'
                }}
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      <div>
        <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '12px' }}>Testimonials ({testimonials.length})</h3>
        
        {loading ? (
          <div style={{ textAlign: 'center', padding: '20px', color: '#666' }}>Loading testimonials...</div>
        ) : testimonials.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '20px', color: '#999', backgroundColor: '#f9f9f9', borderRadius: '4px' }}>No testimonials yet. Add your first one!</div>
        ) : (
          <div style={{ display: 'grid', gap: '12px' }}>
            {testimonials.map(t => (
              <div
                key={t._id}
                style={{
                  padding: '16px',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  backgroundColor: 'white',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                  display: 'flex',
                  gap: '12px'
                }}
              >
                {t.photoUrl && (
                  <img
                    src={t.photoUrl}
                    alt={t.name}
                    style={{
                      width: '80px',
                      height: '80px',
                      borderRadius: '50%',
                      objectFit: 'cover',
                      flexShrink: 0,
                      border: '2px solid #e0e0e0'
                    }}
                  />
                )}
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '8px' }}>
                    <div>
                      <strong style={{ fontSize: '16px', color: '#333' }}>{t.name}</strong>
                      {t.role && <span style={{ marginLeft: '8px', color: '#666', fontSize: '14px' }}>({t.role})</span>}
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        onClick={() => handleEdit(t)}
                        disabled={submitting}
                        style={{
                          padding: '6px 12px',
                          backgroundColor: '#ff9800',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: submitting ? 'not-allowed' : 'pointer',
                          fontSize: '12px',
                          opacity: submitting ? 0.6 : 1
                        }}
                      >
                        ✏️ Edit
                      </button>
                      <button
                        onClick={() => handleDelete(t._id)}
                        disabled={submitting}
                        style={{
                          padding: '6px 12px',
                          backgroundColor: '#d32f2f',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: submitting ? 'not-allowed' : 'pointer',
                          fontSize: '12px',
                          opacity: submitting ? 0.6 : 1
                        }}
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  </div>
                  <p style={{ margin: '8px 0', fontStyle: 'italic', color: '#555', lineHeight: '1.5' }}>"{t.quote}"</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
