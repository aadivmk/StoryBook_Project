# 📖 StoryLand — Interactive Children's Storybook

A full-stack web application that lets children explore animated, narrated storybooks with sound effects. Built as a college engineering project using **Node.js**, **Express**, and **MongoDB**.

---

## ✨ Features

| Feature | Description |
|---|---|
| 📚 Story Library | Browse stories with cover cards, genres, and age tags |
| 🔍 Filtering | Filter by age group, reading level, and genre |
| 📖 Story Reader | Animated page-by-page reader with emoji characters |
| 🔊 Sound Effects | Page-turn sounds and welcome chimes |
| 🌟 Moral of Story | Educational takeaway shown at the end |
| 👤 Auth | Register and login (email + password stored in MongoDB) |
| 🎨 Animations | CSS entrance animations, floating emojis, sparkle effects |

---

## 🗂️ Project Structure

```
StoryLand/
├── backend/                  ← Node.js + Express API
│   ├── models/
│   │   ├── User.js           ← User schema (email, password, child)
│   │   └── Story.js          ← Story schema (pages, genre, ageGroup...)
│   ├── routes/
│   │   ├── auth.js           ← POST /register, POST /login
│   │   └── stories.js        ← GET /stories, GET /stories/:id
│   ├── server.js             ← App entry point + MongoDB connection + seed data
│   ├── package.json
│   └── .env                  ← PORT and MONGODB_URI (create this yourself)
│
└── frontend/                 ← Plain HTML + CSS + JavaScript
    ├── pages/
    │   ├── index.html        ← Home / landing page
    │   ├── library.html      ← Story library with filters
    │   ├── reader.html       ← Animated story reader
    │   ├── login.html        ← Login form
    │   ├── register.html     ← Register form
    │   ├── dashboard.html    ← User dashboard (after login)
    │   ├── profile.html      ← Edit profile
    │   └── about.html        ← About page
    ├── css/
    │   ├── main.css          ← All component styles + theme variables
    │   └── animations.css    ← Keyframe animations
    └── js/
        ├── api.js            ← fetch() wrapper for all API calls
        ├── auth.js           ← localStorage session helpers + toast + sparkle
        └── sounds.js         ← Web Audio API sound engine
```

---

## 🚀 How to Run

### Prerequisites
- [Node.js](https://nodejs.org/) (v16 or higher)
- [MongoDB](https://www.mongodb.com/try/download/community) (running locally)

---

### Step 1 — Start MongoDB

Open a terminal and run:
```bash
mongod
```
MongoDB will start on port **27017** by default. Leave this terminal open.

---

### Step 2 — Install backend dependencies

Open a **new terminal** and navigate into the backend folder:
```bash
cd backend
npm install
```

---

### Step 3 — Create the .env file

Inside the `backend/` folder, create a file named `.env`:
```
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/storybook_db
```

---

### Step 4 — Start the backend server

```bash
node server.js
```

You should see:
```
✅  MongoDB connected successfully
✅  6 sample stories seeded into the database!
🚀  Server running  →  http://localhost:5000
📚  StoryLand API ready!
```

> The database is seeded automatically on first run — no setup needed.

---

### Step 5 — Open the frontend

Open this file in your browser:
```
frontend/pages/index.html
```

Or use the **VS Code Live Server** extension for a better experience.

---

## 🔌 API Endpoints

### Auth Routes (`/api/auth`)

| Method | Endpoint | Body | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | `{ name, email, password, child? }` | Create a new account |
| `POST` | `/api/auth/login` | `{ email, password }` | Login and get user object |
| `GET` | `/api/auth/profile/:id` | — | Get user by ID |
| `PUT` | `/api/auth/profile/:id` | `{ name, child }` | Update profile |

### Story Routes (`/api/stories`)

| Method | Endpoint | Query Params | Description |
|---|---|---|---|
| `GET` | `/api/stories` | `ageGroup, readingLevel, genre, search, featured` | Get filtered story list |
| `GET` | `/api/stories/:id` | — | Get single story (with all pages) |
| `POST` | `/api/stories/:id/like` | — | Like a story |

---

## 🏗️ Architecture

```
Browser (HTML/CSS/JS)
       │
       │  fetch() via api.js
       ▼
Express Server (Node.js) — port 5000
       │
       │  Mongoose ODM
       ▼
MongoDB — storybook_db
   ├── users      (email, password, name, child)
   └── stories    (title, pages[], ageGroup, genre, readingLevel, moral)
```

### How it works — step by step

1. **User opens** `index.html` → home page loads with animations
2. **Register / Login** → form sends POST to `/api/auth/register` or `/api/auth/login`
3. **Backend checks** MongoDB for the user, returns a user object
4. **Frontend stores** the user in `localStorage` (no tokens needed)
5. **Library page** calls `GET /api/stories` with filter query params
6. **Story card click** → opens `reader.html?id=<storyId>`
7. **Reader fetches** `GET /api/stories/:id` → gets all pages
8. **User reads** through pages with animations, sound effects, and emoji characters
9. **Final page** shows the "Moral of the Story" 🌟

---

## 🗄️ Database Schemas

### User
```js
{
  name:     String,   // "Jane Smith"
  email:    String,   // "jane@example.com" (unique)
  password: String,   // stored as plain text (simple auth for college project)
  child: {
    name:   String,   // "Arya"
    age:    Number,   // 6
    avatar: String    // "🧒"
  },
  createdAt: Date
}
```

### Story
```js
{
  title:        String,
  description:  String,
  ageGroup:     "3-5" | "4-7" | "6-9" | "7-10",
  readingLevel: "beginner" | "intermediate" | "advanced",
  genre:        "fantasy" | "adventure" | "nature" | "science" | ...,
  coverEmoji:   String,   // e.g. "⭐"
  coverColor:   String,   // e.g. "#FFD700"
  moral:        String,   // shown at the end of the story
  isFeatured:   Boolean,
  views:        Number,
  likes:        Number,
  pages: [{
    pageNumber:      Number,
    text:            String,
    backgroundEmoji: String,
    characters:      [String]
  }]
}
```

---

## 🔧 Removed from original project

To keep this project clean and explainable, the following were removed:

| Removed | Reason |
|---|---|
| JWT (jsonwebtoken) | Replaced with simple localStorage session |
| bcryptjs | Passwords stored as plain text for simplicity |
| Admin panel | Reduces complexity |
| Progress tracking system | Removed `/api/progress` and `Progress` model |
| Role-based access control | No admin/parent roles |
| express-session | Not needed without JWT |
| multer | No file uploads in scope |
| Complex middleware | Auth middleware removed entirely |

---

## 📦 Dependencies

```json
{
  "express":   "^4.18.2",   // web framework
  "mongoose":  "^7.3.1",    // MongoDB ODM
  "cors":      "^2.8.5",    // allow frontend to call API
  "dotenv":    "^16.0.3"    // load .env variables
}
```

Install with: `npm install`

---

## 🎨 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | HTML5, CSS3, Vanilla JavaScript |
| Backend | Node.js, Express.js |
| Database | MongoDB (via Mongoose) |
| Fonts | Google Fonts (Fredoka One, Nunito) |
| Audio | Web Audio API (no external library) |

---

## 🤝 Contributing

This is a college project. Feel free to fork and extend it!

Ideas for future features:
- Add more stories
- Text-to-speech (Web Speech API)
- Parent dashboard with reading stats
- Story completion badges

---

*Made with ❤️ and lots of ✨ for children everywhere*
