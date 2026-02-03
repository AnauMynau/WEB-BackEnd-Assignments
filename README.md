# TYNDA Music Streaming Platform

A web application for music track management with secure session-based authentication.

**Course:** Web Technologies (Backend)  
**Assignment:** 4 - Sessions & Cookies Security  
**Team:** Kassenov Abdulkarim, Noyan Inayatulla, Atalykov Sultan

---

## Features

- Session-based authentication with express-session
- Password hashing using bcrypt (10 salt rounds)
- HttpOnly cookies for XSS protection
- Protected routes for write operations
- Full CRUD operations for tracks
- Search, filter, and sort functionality
- Responsive modern UI design

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Backend | Node.js, Express.js |
| Database | MongoDB Atlas |
| Sessions | express-session, connect-mongo |
| Security | bcryptjs |
| Frontend | HTML5, CSS3, JavaScript |

---

## Project Structure

```
assignment3_part2/
├── server.js              # Main server file
├── package.json           # Dependencies
├── .env                   # Environment variables
├── database/
│   └── db-mongodb.js      # MongoDB connection
├── middleware/
│   └── auth.js            # Authentication middleware
├── routes/
│   ├── auth.js            # Auth routes (login, register, logout)
│   └── tracks.js          # Tracks CRUD routes
├── scripts/
│   └── seed.js            # Database seeding script
└── public/
    ├── index.html         # Home page
    ├── tracks.html        # Tracks management
    ├── login.html         # Login page
    ├── register.html      # Registration page
    ├── about.html         # About page
    ├── contact.html       # Contact page
    ├── 404.html           # Error page
    └── style.css          # Styles
```

---

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Create `.env` file:

```env
PORT=3009
MONGO_URI=your_mongodb_connection_string
SESSION_SECRET=your_secret_key
NODE_ENV=development
```

### 3. Seed Database (Optional)

```bash
npm run seed
```

This creates 25 sample tracks and 2 test users:
- `admin@tynda.kz` / `admin123`
- `test@tynda.kz` / `test123`

### 4. Run Server

```bash
# Development (with auto-restart)
npm run dev

# Production
npm start
```

### 5. Open Browser

Navigate to `http://localhost:3009`

---

## API Endpoints

### Authentication

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/auth/register` | Create new account | No |
| POST | `/api/auth/login` | Login to account | No |
| POST | `/api/auth/logout` | Logout current user | Yes |
| GET | `/api/auth/me` | Get current user info | No |

### Tracks

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/tracks` | Get all tracks | No |
| GET | `/api/tracks/:id` | Get single track | No |
| POST | `/api/tracks` | Create new track | Yes |
| PUT | `/api/tracks/:id` | Update track | Yes |
| DELETE | `/api/tracks/:id` | Delete track | Yes |

### Query Parameters (GET /api/tracks)

| Parameter | Description | Example |
|-----------|-------------|---------|
| `artist` | Filter by artist name | `?artist=Queen` |
| `title` | Filter by title | `?title=Bohemian` |
| `genre` | Filter by genre | `?genre=Rock` |
| `sortBy` | Sort results | `?sortBy=title` |
| `fields` | Select fields | `?fields=title,artist` |

---

## Security Implementation

### Password Hashing

```javascript
const hashedPassword = await bcrypt.hash(password, 10);
```

### Session Configuration

```javascript
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: process.env.MONGO_URI }),
    cookie: {
        httpOnly: true,         // Prevents JS access
        secure: false,          // true in production (HTTPS)
        sameSite: 'lax',        // CSRF protection
        maxAge: 86400000        // 1 day
    }
}));
```

### Protected Route Middleware

```javascript
function isAuthenticated(req, res, next) {
    if (req.session && req.session.userId) {
        return next();
    }
    return res.status(401).json({ error: 'Unauthorized' });
}
```

---

## Scripts

| Command | Description |
|---------|-------------|
| `npm start` | Start server |
| `npm run dev` | Start with nodemon |
| `npm run seed` | Seed database |

---

## License

This project was created for educational purposes as part of the Web Technologies course at Astana IT University.