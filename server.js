require('dotenv').config();

const express = require('express');
const path = require('path');
const session = require('express-session');
const MongoStore = require('connect-mongo').default;
const { connectToDb, getDb } = require('./database/db-mongodb');
const tracksRouter = require('./routes/tracks');
const authRouter = require('./routes/auth');
const playlistsRouter = require('./routes/playlists');

const app = express();
const PORT = process.env.PORT || 3009;

// Trust proxy (required for Render, Heroku, etc. - enables secure cookies behind reverse proxy)
app.set('trust proxy', 1);

// Middleware
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Start server function
async function startServer() {
  try {
    // Connect to database first
    await connectToDb();

    // Session configuration with security flags (after DB connection)
    app.use(session({
      secret: process.env.SESSION_SECRET || 'tynda-secret-key-2024',
      resave: false,
      saveUninitialized: false,
      store: MongoStore.create({
        mongoUrl: process.env.MONGO_URI,
        dbName: 'tynda_music',
        ttl: 24 * 60 * 60, // 1 day
        autoRemove: 'native'
      }),
      cookie: {
        httpOnly: true,        // REQUIRED: Prevents client-side JS access
        secure: process.env.NODE_ENV === 'production', // HTTPS only in production
        sameSite: 'lax',       // CSRF protection
        maxAge: 24 * 60 * 60 * 1000 // 1 day
      }
    }));

    // Logging middleware
    app.use((req, res, next) => {
      console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
      next();
    });

    // API Routes
    app.use('/api/auth', authRouter);
    app.use('/api/tracks', tracksRouter);
    app.use('/api/playlists', playlistsRouter);

    // HTML Routes
    app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));
    app.get('/about', (req, res) => res.sendFile(path.join(__dirname, 'public', 'about.html')));
    app.get('/contact', (req, res) => res.sendFile(path.join(__dirname, 'public', 'contact.html')));
    app.get('/tracks', (req, res) => res.sendFile(path.join(__dirname, 'public', 'tracks.html')));
    app.get('/login', (req, res) => res.sendFile(path.join(__dirname, 'public', 'login.html')));
    app.get('/register', (req, res) => res.sendFile(path.join(__dirname, 'public', 'register.html')));
    app.get('/playlists', (req, res) => res.sendFile(path.join(__dirname, 'public', 'playlists.html')));

    // Contact form POST
    app.post('/contact', async (req, res) => {
      try {
        const { name, email, message } = req.body;

        if (!name || !email || !message) {
          return res.status(400).send('All fields are required');
        }

        const contactMessage = {
          name,
          email,
          message,
          createdAt: new Date()
        };

        await getDb().collection('contacts').insertOne(contactMessage);

        res.send(`
                    <!DOCTYPE html>
                    <html lang="en">
                    <head>
                        <meta charset="UTF-8">
                        <meta name="viewport" content="width=device-width, initial-scale=1.0">
                        <title>Message Sent — TYNDA</title>
                        <link rel="stylesheet" href="/style.css">
                    </head>
                    <body>
                        <div class="container" style="min-height: 100vh; display: flex; align-items: center; justify-content: center;">
                            <div class="card center success">
                                <div class="success-icon">✓</div>
                                <h1>Thank you, ${name}!</h1>
                                <p class="muted">Your message has been sent successfully.</p>
                                <div class="actions" style="justify-content: center; margin-top: 20px;">
                                    <a class="btn" href="/">Back to Home</a>
                                </div>
                            </div>
                        </div>
                    </body>
                    </html>
                `);
      } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
      }
    });

    // Error handler
    app.use((err, req, res, next) => {
      console.error('Server error:', err);
      res.status(500).json({ error: 'Internal server error' });
    });

    // 404 Handler
    app.use((req, res) => res.status(404).sendFile(path.join(__dirname, 'public', '404.html')));

    // Start listening
    app.listen(PORT, () => {
      console.log(`TYNDA Server running on http://localhost:${PORT}`);
      console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
    });

  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

startServer();