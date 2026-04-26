// ============================================================
// routes/stories.js
// Story CRUD — no auth required to read stories.
// Supports filtering by ageGroup, readingLevel, genre,
// full-text search, and featured flag.
// ============================================================

const express = require('express');
const router  = express.Router();
const Story   = require('../models/Story');

// ----------------------------------------------------------
// GET /api/stories
// Query params: ageGroup, readingLevel, genre, search, featured
// Returns a list of stories (pages field excluded for speed).
// ----------------------------------------------------------
router.get('/', async (req, res) => {
  try {
    const { ageGroup, readingLevel, genre, featured, search } = req.query;

    // Build a dynamic filter object
    const filter = {};
    if (ageGroup     && ageGroup     !== 'all') filter.ageGroup     = ageGroup;
    if (readingLevel && readingLevel !== 'all') filter.readingLevel = readingLevel;
    if (genre        && genre        !== 'all') filter.genre        = genre;
    if (featured === 'true') filter.isFeatured = true;

    // Text search across title, description, and tags
    if (search) {
      filter.$or = [
        { title:       { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags:        { $in: [new RegExp(search, 'i')] } }
      ];
    }

    // Return all matching stories; exclude page content (heavy) for the list view
    const stories = await Story.find(filter)
      .select('-pages')
      .sort({ isFeatured: -1, createdAt: -1 });

    res.json({ success: true, stories, total: stories.length });

  } catch (err) {
    console.error('Fetch stories error:', err.message);
    res.status(500).json({ success: false, message: 'Could not fetch stories.' });
  }
});

// ----------------------------------------------------------
// GET /api/stories/:id
// Returns a single story INCLUDING all pages.
// Also increments the view counter.
// ----------------------------------------------------------
router.get('/:id', async (req, res) => {
  try {
    // findByIdAndUpdate with $inc is atomic — safe for concurrent reads
    const story = await Story.findByIdAndUpdate(
      req.params.id,
      { $inc: { views: 1 } },
      { new: true }
    );
    if (!story) {
      return res.status(404).json({ success: false, message: 'Story not found.' });
    }
    res.json({ success: true, story });
  } catch (err) {
    console.error('Fetch story error:', err.message);
    res.status(500).json({ success: false, message: 'Could not fetch story.' });
  }
});

// ----------------------------------------------------------
// POST /api/stories/:id/like
// Increments the like counter for a story.
// Simple — no duplicate-prevention (keeping it basic).
// ----------------------------------------------------------
router.post('/:id/like', async (req, res) => {
  try {
    const story = await Story.findByIdAndUpdate(
      req.params.id,
      { $inc: { likes: 1 } },
      { new: true }
    );
    if (!story) return res.status(404).json({ success: false, message: 'Story not found.' });
    res.json({ success: true, likes: story.likes });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Could not like story.' });
  }
});

module.exports = router;
