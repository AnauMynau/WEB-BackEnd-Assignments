const express = require('express');
const { ObjectId } = require('mongodb');
const { getDb } = require('../database/db-mongodb');

const router = express.Router();

// GET 
router.get('/', async (req, res) => {
    try {
        const db = getDb();
        // Filtering
        let filter = {};
        if (req.query.artist) filter.artist = req.query.artist;
        if (req.query.title) filter.title = req.query.title;

        // Sorting
        let sort = {};
        if (req.query.sortBy === 'title') sort.title = 1;
        else if (req.query.sortBy === 'date') sort.createdAt = -1;

        // Projection
        let projection = {};
        if (req.query.fields) {
            req.query.fields.split(',').forEach(f => projection[f] = 1);
        }

        const tracks = await db.collection('tracks')
            .find(filter)
            .sort(sort)
            .project(projection)
            .toArray();

        res.status(200).json(tracks);
    } catch (err) {
        res.status(500).json({ error: "Server error" });
    }
});

// GET 
router.get('/:id', async (req, res) => {
    try {
        if (!ObjectId.isValid(req.params.id)) return res.status(400).json({ error: "Invalid ID" });
        const track = await getDb().collection('tracks').findOne({ _id: new ObjectId(req.params.id) });
        if (!track) return res.status(404).json({ error: "Not found" });
        res.json(track);
    } catch (err) {
        res.status(500).json({ error: "Server error" });
    }
});

// POST 
router.post('/', async (req, res) => {
    try {
        const { title, artist, album, durationSeconds } = req.body;
        if (!title || !artist) return res.status(400).json({ error: "Required fields missing" });

        const newTrack = {
            title, artist,
            album: album || "",
            durationSeconds: durationSeconds || 0,
            createdAt: new Date()
        };
        const result = await getDb().collection('tracks').insertOne(newTrack);
        res.status(201).json({ _id: result.insertedId, ...newTrack });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

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
      <h2>Thank you, ${name}!</h2>
      <p>Your message has been saved successfully.</p>
      <a href="/">Back to home</a>
    `);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// PUT 
router.put('/:id', async (req, res) => {
    try {
        if (!ObjectId.isValid(req.params.id)) return res.status(400).json({ error: "Invalid ID" });
        const result = await getDb().collection('tracks').updateOne(
            { _id: new ObjectId(req.params.id) },
            { $set: req.body }
        );
        if (result.matchedCount === 0) return res.status(404).json({ error: "Not found" });
        res.json({ message: "Updated" });
    } catch (err) {
        res.status(500).json({ error: "Server error" });
    }
});

// DELETE 
router.delete('/:id', async (req, res) => {
    try {
        if (!ObjectId.isValid(req.params.id)) return res.status(400).json({ error: "Invalid ID" });
        const result = await getDb().collection('tracks').deleteOne({ _id: new ObjectId(req.params.id) });
        if (result.deletedCount === 0) return res.status(404).json({ error: "Not found" });
        res.json({ message: "Deleted" });
    } catch (err) {
        res.status(500).json({ error: "Server error" });
    }
});

module.exports = router;