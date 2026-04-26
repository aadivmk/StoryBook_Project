// ============================================================
// server.js — StoryLand Backend Entry Point
//
// Stack : Node.js + Express + MongoDB (via Mongoose)
// Auth  : Simple email/password (no JWT, no bcrypt)
// DB    : Two collections — users, stories
//
// How to run:
//   1. Make sure MongoDB is running  →  mongod
//   2. Install deps                  →  npm install
//   3. Start server                  →  node server.js
//   4. API available at http://localhost:5000/api
// ============================================================

const express  = require('express');
const mongoose = require('mongoose');
const cors     = require('cors');
const path     = require('path');
require('dotenv').config();

const app = express();

// ── Middleware ────────────────────────────────────────────
// Allow the frontend (opened directly from disk or Live Server) to call the API
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://127.0.0.1:5500',
    'http://localhost:5500',
    'null'           // allows file:// origin (opening HTML directly in browser)
  ],
  credentials: true
}));
app.use(express.json());                                      // parse JSON bodies
app.use(express.urlencoded({ extended: true }));              // parse form bodies
app.use(express.static(path.join(__dirname, '../frontend'))); // serve frontend files

// ── Database connection ───────────────────────────────────
mongoose
  .connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/storybook_db')
  .then(async () => {
    console.log('✅  MongoDB connected successfully');
    await seedDatabase();   // populate sample stories on first run
  })
  .catch(err => console.error('❌  MongoDB connection error:', err.message));

// ── API Routes ────────────────────────────────────────────
app.use('/api/auth',    require('./routes/auth'));    // register / login
app.use('/api/stories', require('./routes/stories')); // story library

// Health-check endpoint (useful for testing)
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'StoryLand API is running 🚀' });
});

// Fallback: serve the frontend for any non-API route
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/pages/index.html'));
});

// ── Start server ──────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀  Server running  →  http://localhost:${PORT}`);
  console.log(`📚  StoryLand API ready!`);
});

// ============================================================
// seedDatabase()
// Inserts sample stories the first time the server starts
// (only runs when the stories collection is empty).
// ============================================================
async function seedDatabase() {
  const Story = require('./models/Story');
  const count = await Story.countDocuments();
  if (count > 0) return; // already seeded

  const stories = [
    // ── Story 1 ──────────────────────────────────────────
    {
      title:        'The Brave Little Star',
      description:  'A tiny star learns that courage comes from within as it lights up the darkest corners of the sky.',
      ageGroup:     '3-5',
      readingLevel: 'beginner',
      genre:        'fantasy',
      coverEmoji:   '⭐',
      coverColor:   '#FFD700',
      duration:     5,
      moral:        'Even the smallest heart can shine the brightest light. Courage lives inside you!',
      isFeatured:   true,
      tags:         ['courage', 'kindness', 'stars'],
      pages: [
        { pageNumber: 1, text: 'Once upon a time, high up in the night sky, there lived a tiny little star named Stella. Stella was the smallest star in the whole galaxy, and she always felt a little bit shy.', backgroundEmoji: '🌌', characters: ['⭐', '🌙'] },
        { pageNumber: 2, text: 'One night, the moon said, "Stella, the children below are afraid of the dark. Will you shine brighter to help them?" Stella trembled. "But I am so small!" she whispered.', backgroundEmoji: '🌙', characters: ['🌙', '⭐'] },
        { pageNumber: 3, text: 'Stella took a deep breath and thought of all the scared children. With all her heart, she began to glow — first a little, then brighter, and BRIGHTER!', backgroundEmoji: '✨', characters: ['⭐', '💫'] },
        { pageNumber: 4, text: 'The children looked up and smiled. "Look at that beautiful star!" they cried. Stella smiled too. She learned that even the smallest heart can shine the brightest light.', backgroundEmoji: '🌟', characters: ['⭐', '👧', '👦'] },
        { pageNumber: 5, text: 'From that night on, Stella shone every single night — not because she had to, but because she WANTED to. And every child who saw her felt a little braver too. THE END ✨', backgroundEmoji: '🌠', characters: ['⭐', '🌙', '💫'] }
      ]
    },

    // ── Story 2 ──────────────────────────────────────────
    {
      title:        'Dragon Who Loved Cookies',
      description:  'A fire-breathing dragon discovers the magic of sharing when he meets a little baker.',
      ageGroup:     '4-7',
      readingLevel: 'beginner',
      genre:        'adventure',
      coverEmoji:   '🐉',
      coverColor:   '#FF6B35',
      duration:     7,
      moral:        'Sharing kindness is the sweetest treat of all. Friendship starts with a simple smile.',
      isFeatured:   true,
      tags:         ['friendship', 'sharing', 'dragons'],
      pages: [
        { pageNumber: 1, text: 'Deep in the Crumbly Mountains lived a dragon named Blaze. Blaze was VERY good at breathing fire, but what he loved most in the whole world was... COOKIES!', backgroundEmoji: '🏔️', characters: ['🐉', '🍪'] },
        { pageNumber: 2, text: 'One day, Blaze smelled the most amazing smell — warm chocolate chip cookies! He followed his nose to a tiny little bakery in the village.', backgroundEmoji: '🏘️', characters: ['🐉', '🏪'] },
        { pageNumber: 3, text: 'A little girl named Mia was baking. When she saw the dragon, she wasn\'t scared at all! "Would you like a cookie?" she asked with a big smile.', backgroundEmoji: '🍰', characters: ['🐉', '👧'] },
        { pageNumber: 4, text: 'Blaze had never been offered anything before — everyone always ran away! He gently took the cookie. It was the most delicious thing he had ever tasted!', backgroundEmoji: '✨', characters: ['🐉', '🍪', '👧'] },
        { pageNumber: 5, text: '"Can I help you bake?" asked Blaze. "Your fire would be perfect for the oven!" laughed Mia. And so the dragon and the baker became the very best of friends. THE END 🍪', backgroundEmoji: '🍪', characters: ['🐉', '👧', '🍪'] }
      ]
    },

    // ── Story 3 ──────────────────────────────────────────
    {
      title:        "The Rainbow Fish's Secret",
      description:  'A colorful fish living in the deep ocean learns the true meaning of friendship.',
      ageGroup:     '3-5',
      readingLevel: 'beginner',
      genre:        'nature',
      coverEmoji:   '🐠',
      coverColor:   '#00B4D8',
      duration:     5,
      moral:        'Real treasure is not what you keep, but what you give. Generosity brings true happiness.',
      isFeatured:   false,
      tags:         ['sharing', 'friendship', 'ocean'],
      pages: [
        { pageNumber: 1, text: 'In the deep blue ocean lived a fish named Finley who had the most beautiful scales — every color of the rainbow! All the other fish would stare in amazement.', backgroundEmoji: '🌊', characters: ['🐠', '🐟'] },
        { pageNumber: 2, text: 'But Finley was lonely. "Why won\'t anyone play with me?" he wondered. An old wise octopus watched from behind the coral. "Share your colors," she said, "and you will never be lonely."', backgroundEmoji: '🐙', characters: ['🐠', '🐙'] },
        { pageNumber: 3, text: 'Finley gave one shimmering scale to a little blue fish. It felt so GOOD! He gave another, and another, until every fish in the ocean had one of his beautiful scales.', backgroundEmoji: '✨', characters: ['🐠', '🐟', '🐡'] },
        { pageNumber: 4, text: 'Now Finley had only one rainbow scale left — but he was surrounded by all his new friends! He had never felt so happy in his whole life.', backgroundEmoji: '🌈', characters: ['🐠', '🐟', '🐡', '🦑'] },
        { pageNumber: 5, text: 'The old octopus smiled. "You see? Real treasure is not what you keep, but what you give." Finley agreed — and swam off happily with all his wonderful friends. THE END 🌊', backgroundEmoji: '🌊', characters: ['🐠', '🐙', '🐟'] }
      ]
    },

    // ── Story 4 ──────────────────────────────────────────
    {
      title:        'The Magic Pencil',
      description:  'A young girl discovers a pencil that brings her drawings to life!',
      ageGroup:     '6-9',
      readingLevel: 'intermediate',
      genre:        'fantasy',
      coverEmoji:   '✏️',
      coverColor:   '#7B2FBE',
      duration:     8,
      moral:        'The best thing you can create is happiness for someone else. Creativity is a gift to share.',
      isFeatured:   true,
      tags:         ['creativity', 'kindness', 'magic'],
      pages: [
        { pageNumber: 1, text: 'Priya loved drawing more than anything. One rainy afternoon, she found a glowing golden pencil under her grandmother\'s old trunk. When she picked it up, it felt warm in her hand.', backgroundEmoji: '🎨', characters: ['👧', '✏️'] },
        { pageNumber: 2, text: 'Priya drew a butterfly. Suddenly — WHOOSH — the butterfly fluttered right off the page! Priya gasped. "It\'s a magic pencil!" she breathed.', backgroundEmoji: '🦋', characters: ['👧', '🦋', '✏️'] },
        { pageNumber: 3, text: 'She drew a garden, a rainbow, and a friendly elephant. Each one came to life, filling her little room with color and wonder and joy!', backgroundEmoji: '🌈', characters: ['👧', '🐘', '🌸'] },
        { pageNumber: 4, text: 'But then Priya thought, "My friend Arjun is sick in the hospital. What can I draw for him?" She thought very hard, then drew the biggest, brightest smile in the world.', backgroundEmoji: '😊', characters: ['👧', '✏️'] },
        { pageNumber: 5, text: 'The smile floated all the way to the hospital and landed on Arjun\'s face. His eyes sparkled. The magic pencil taught Priya that the best thing you can create is happiness for someone else. THE END ✏️', backgroundEmoji: '✨', characters: ['👧', '👦', '✏️'] }
      ]
    },

    // ── Story 5 ──────────────────────────────────────────
    {
      title:        'Captain Zara and the Moon Mission',
      description:  'Bold young Captain Zara leads a daring mission to save the moon from going dark.',
      ageGroup:     '7-10',
      readingLevel: 'intermediate',
      genre:        'adventure',
      coverEmoji:   '🚀',
      coverColor:   '#0F3460',
      duration:     10,
      moral:        'No mission is impossible when you have a good team. Working together makes the impossible possible.',
      isFeatured:   true,
      tags:         ['science', 'teamwork', 'space', 'girls-in-stem'],
      pages: [
        { pageNumber: 1, text: 'Captain Zara was only ten years old, but she was already the bravest pilot in the Solar Space Academy. One night, she got an emergency signal — the Moon was running out of light!', backgroundEmoji: '🌙', characters: ['👩‍🚀', '🚀'] },
        { pageNumber: 2, text: '"I\'ll go!" said Zara. She packed her toolkit, her lucky compass, and her robot co-pilot BEEP. They blasted off into the sparkling darkness of space.', backgroundEmoji: '🚀', characters: ['👩‍🚀', '🤖'] },
        { pageNumber: 3, text: 'On the moon, Zara discovered that a family of space-mice had chewed through the Moon\'s power cables! "Don\'t worry," she told them kindly. "We\'ll fix it together."', backgroundEmoji: '🌕', characters: ['👩‍🚀', '🐭', '🤖'] },
        { pageNumber: 4, text: 'BEEP handed Zara the tools. The space-mice held the wires steady. Together, they repaired every single cable. With a great BOOM, the moon blazed back to life!', backgroundEmoji: '✨', characters: ['👩‍🚀', '🤖', '🐭', '🌕'] },
        { pageNumber: 5, text: 'Children all over Earth looked up and cheered. Zara smiled at BEEP and the little space-mice. "No mission is impossible," she said, "when you have a good team." THE END 🚀', backgroundEmoji: '🌍', characters: ['👩‍🚀', '🌕', '🌍'] }
      ]
    },

    // ── Story 6 ──────────────────────────────────────────
    {
      title:        'The Sleepy Cloud',
      description:  'A fluffy cloud who hates raining learns why rain is the most important job of all.',
      ageGroup:     '3-5',
      readingLevel: 'beginner',
      genre:        'nature',
      coverEmoji:   '☁️',
      coverColor:   '#90E0EF',
      duration:     4,
      moral:        'Every job matters. When we do our part — even the hard parts — we help the whole world bloom.',
      isFeatured:   false,
      tags:         ['nature', 'responsibility', 'seasons'],
      pages: [
        { pageNumber: 1, text: 'High in the sky, there was a big fluffy cloud named Cumulus. Cumulus had one job — to make rain. But Cumulus HATED raining! "It tickles!" he complained.', backgroundEmoji: '☁️', characters: ['☁️', '☀️'] },
        { pageNumber: 2, text: 'One hot summer week, Cumulus refused to rain. The flowers drooped. The rivers went thin. The frogs croaked sadly. Even the rainbow had nothing to stand on!', backgroundEmoji: '🌸', characters: ['☁️', '🌺', '🐸'] },
        { pageNumber: 3, text: 'A little girl named Aisha looked up at the sky. "Please, Mr. Cloud," she said softly. "My garden is so thirsty. The plants will die without you."', backgroundEmoji: '🌻', characters: ['☁️', '👧'] },
        { pageNumber: 4, text: 'Cumulus looked down at the wilting flowers and the sad little girl. His heart felt full. He took a big, deep breath — and RAINED with everything he had!', backgroundEmoji: '🌧️', characters: ['☁️', '🌧️'] },
        { pageNumber: 5, text: 'The flowers sprang up. The rivers danced. A double rainbow appeared! Cumulus laughed — the tickling wasn\'t so bad after all, when he could see how much joy it brought. THE END ☁️', backgroundEmoji: '🌈', characters: ['☁️', '🌈', '👧', '🌺'] }
      ]
    }
  ];

  await Story.insertMany(stories);
  console.log(`✅  ${stories.length} sample stories seeded into the database!`);
}
