const mongoose = require('mongoose');

const processedEventSchema = new mongoose.Schema({
  eventId: { 
    type: String, 
    required: true, 
    unique: true, 
    index: true 
  },
  eventType: String,
  processedAt: { 
    type: Date, 
    default: Date.now 
  },
  expiresAt: { 
    type: Date, 
    default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), 
    index: { expires: 0 } 
  }
});

module.exports = mongoose.model('ProcessedEvent', processedEventSchema);
