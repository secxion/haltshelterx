import React from 'react';
import TestimonialManager from '../components/TestimonialManager';

export default function TestimonialsAdminPage() {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Manage Testimonials</h1>
      <TestimonialManager />
    </div>
  );
}
