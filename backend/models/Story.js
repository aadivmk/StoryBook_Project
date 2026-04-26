// ============================================================
// models/Story.js
// Story schema — stores all pages, metadata, and filters.
// Supports age group, genre, reading level filtering.
// ============================================================

const mongoose = require('mongoose');

// Each page of a story (text + visual hints for frontend)
const pageSchema = new mongoose.Schema({
  pageNumber:      { type: Number, required: true },
  text:            { type: String, required: true },
  backgroundEmoji: { type: String, default: '🌟' },  // used by reader animation
  characters:      [String]                            // emojis displayed on that page
});

const storySchema = new mongoose.Schema({
  title:        { type: String, required: true, trim: true },
  description:  { type: String, required: true },

  // Filter fields — used by the library page
  ageGroup:     { type: String, enum: ['3-5', '4-7', '6-9', '7-10', 'all'], required: true },
  readingLevel: { type: String, enum: ['beginner', 'intermediate', 'advanced'], required: true },
  genre:        { type: String, enum: ['fantasy', 'adventure', 'nature', 'science', 'folklore', 'mystery'], required: true },

  // Visual identity for the library card
  coverEmoji:  { type: String, default: '📖' },
  coverColor:  { type: String, default: '#FFD700' },

  pages:       [pageSchema],
  duration:    { type: Number, default: 5 },   // estimated reading time in minutes
  tags:        [String],                        // e.g. ["courage", "friendship"]
  moral:       { type: String, default: '' },  // "moral of the story" shown at the end

  isFeatured:  { type: Boolean, default: false },
  views:       { type: Number, default: 0 },   // incremented on each read
  likes:       { type: Number, default: 0 },

  createdAt:   { type: Date, default: Date.now }
});

module.exports = mongoose.model('Story', storySchema);
