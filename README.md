TYNDA — Music Streaming Web Application

Assignment 3 — Part 2

About the Project

TYNDA is a full-stack music streaming web application developed as part of Assignment 3.

Part 1 focuses on building a RESTful backend API using Node.js, Express, and MongoDB

Part 2 extends the project with a production-ready web interface and deployment to a public hosting platform

The application demonstrates full CRUD functionality, database integration, and environment-based configuration.

Live Demo (Production)

Deployed URL:

https://<your-app-name>.onrender.com

Technologies Used

Node.js

Express.js

MongoDB (Native Driver)

HTML, CSS, JavaScript

Fetch API

MongoDB Atlas

Render (Deployment)

Project Structure
/
├── database/
│   └── db-mongodb.js        # MongoDB connection logic
├── routes/
│   └── tracks.js            # Tracks CRUD API
├── public/
│   ├── index.html           # Home page
│   ├── about.html           # About page
│   ├── contact.html         # Contact form
│   ├── tracks.html          # Tracks UI (CRUD)
│   ├── 404.html             # Not found page
│   └── style.css            # Styles
├── server.js                # Express server entry point
├── .gitignore
└── README.md

Environment Variables

The application uses environment variables for secure configuration.

Required Variables
PORT
MONGO_URI

Local Development (.env)
PORT=3009
MONGO_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/tynda_music


The .env file is not committed to GitHub

Production (Render)

Environment variables are configured directly in the Render dashboard.

Setup Instructions (Local)
1️ Install dependencies
npm install

2 Create .env file
PORT=3009
MONGO_URI=your_mongodb_connection_string

Run the server
node server.js


Server will start at:

http://localhost:3009

MongoDB Usage

Database name: tynda_music

Collections:

tracks — music tracks

contacts — contact form messages

MongoDB automatically creates databases and collections when the first document is inserted.

API Documentation
1️ Get All Tracks

GET /api/tracks

Query Parameters:

artist — filter by artist

title — filter by title

sortBy=title — sort A–Z

sortBy=date — newest first

fields=title,artist — projection

Example:

/api/tracks?artist=Drake&sortBy=title

2️ Get Single Track

GET /api/tracks/:id

3️ Create Track

POST /api/tracks

{
  "title": "Shape of You",
  "artist": "Ed Sheeran",
  "album": "Divide",
  "durationSeconds": 233
}

4 Update Track

PUT /api/tracks/:id

5️ Delete Track

DELETE /api/tracks/:id

Web Interface (Part 2)

The deployed application includes a production web interface accessible from the root URL /.

Features:

Display tracks in a list

Create new tracks using a form

Update existing tracks

Delete tracks

Contact form with MongoDB storage

Dynamic data loading from backend API

No Postman required for demonstration

Contact Form

URL: /contact

Method: POST

Stored in MongoDB collection: contacts

Each message includes:

Name

Email

Message

Timestamp

Deployment

The application is deployed on Render.

Build Command
npm install

Start Command
node server.js


The server uses:

process.env.PORT


as required for production hosting.        