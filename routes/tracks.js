const express = require('express');
const { ObjectId } = require('mongodb');
const { getDb } = require('../database/db-mongodb');
const { isAuthenticated } = require('../middleware/auth');

const router = express.Router();

// GET all tracks (PUBLIC - no auth required)
router.get('/', async (req, res) => {
    try {
        const db = getDb();
        // Filtering
        let filter = {};
        if (req.query.artist) filter.artist = { $regex: req.query.artist, $options: 'i' };
        if (req.query.title) filter.title = { $regex: req.query.title, $options: 'i' };
        if (req.query.genre) filter.genre = req.query.genre;

        // Sorting
        let sort = {};
        if (req.query.sortBy === 'title') sort.title = 1;
        else if (req.query.sortBy === 'date') sort.createdAt = -1;
        else if (req.query.sortBy === 'artist') sort.artist = 1;

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
        console.error('Error fetching tracks:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// GET single track by ID (PUBLIC)
router.get('/:id', async (req, res) => {
    try {
        if (!ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ error: 'Invalid ID format' });
        }
        const track = await getDb().collection('tracks').findOne({
            _id: new ObjectId(req.params.id)
        });
        if (!track) {
            return res.status(404).json({ error: 'Track not found' });
        }
        res.json(track);
    } catch (err) {
        console.error('Error fetching track:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// POST create new track (PROTECTED - auth required)
router.post('/', isAuthenticated, async (req, res) => {
    try {
        const { title, artist, album, genre, durationSeconds, releaseYear, coverUrl } = req.body;

        // Validation
        if (!title || !artist) {
            return res.status(400).json({ error: 'Title and artist are required' });
        }

        if (title.length < 1 || title.length > 200) {
            return res.status(400).json({ error: 'Title must be between 1 and 200 characters' });
        }

        if (artist.length < 1 || artist.length > 100) {
            return res.status(400).json({ error: 'Artist must be between 1 and 100 characters' });
        }

        const newTrack = {
            title: title.trim(),
            artist: artist.trim(),
            album: album?.trim() || '',
            genre: genre?.trim() || 'Other',
            durationSeconds: parseInt(durationSeconds) || 0,
            releaseYear: parseInt(releaseYear) || new Date().getFullYear(),
            coverUrl: coverUrl?.trim() || '',
            createdAt: new Date(),
            createdBy: req.session.userId
        };

        const result = await getDb().collection('tracks').insertOne(newTrack);
        res.status(201).json({ _id: result.insertedId, ...newTrack });
    } catch (err) {
        console.error('Error creating track:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// PUT update track (PROTECTED - auth required)
router.put('/:id', isAuthenticated, async (req, res) => {
    try {
        if (!ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ error: 'Invalid ID format' });
        }

        const { title, artist, album, genre, durationSeconds, releaseYear, coverUrl } = req.body;

        // Build update object with only provided fields
        const updateData = {};
        if (title !== undefined) updateData.title = title.trim();
        if (artist !== undefined) updateData.artist = artist.trim();
        if (album !== undefined) updateData.album = album.trim();
        if (genre !== undefined) updateData.genre = genre.trim();
        if (durationSeconds !== undefined) updateData.durationSeconds = parseInt(durationSeconds);
        if (releaseYear !== undefined) updateData.releaseYear = parseInt(releaseYear);
        if (coverUrl !== undefined) updateData.coverUrl = coverUrl.trim();
        updateData.updatedAt = new Date();

        const result = await getDb().collection('tracks').updateOne(
            { _id: new ObjectId(req.params.id) },
            { $set: updateData }
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({ error: 'Track not found' });
        }

        res.json({ message: 'Track updated successfully' });
    } catch (err) {
        console.error('Error updating track:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// DELETE track (PROTECTED - auth required)
router.delete('/:id', isAuthenticated, async (req, res) => {
    try {
        if (!ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ error: 'Invalid ID format' });
        }

        const result = await getDb().collection('tracks').deleteOne({
            _id: new ObjectId(req.params.id)
        });

        if (result.deletedCount === 0) {
            return res.status(404).json({ error: 'Track not found' });
        }

        res.json({ message: 'Track deleted successfully' });
    } catch (err) {
        console.error('Error deleting track:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;