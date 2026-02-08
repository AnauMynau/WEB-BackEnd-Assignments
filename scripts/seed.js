require('dotenv').config();
const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');

const MONGO_URI = process.env.MONGO_URI;
const DB_NAME = 'tynda_music';

// Sample tracks data (25 realistic tracks)
const sampleTracks = [
    { title: 'Blinding Lights', artist: 'The Weeknd', album: 'After Hours', genre: 'Pop', durationSeconds: 200, releaseYear: 2020 },
    { title: 'Shape of You', artist: 'Ed Sheeran', album: '÷ (Divide)', genre: 'Pop', durationSeconds: 234, releaseYear: 2017 },
    { title: 'Bohemian Rhapsody', artist: 'Queen', album: 'A Night at the Opera', genre: 'Rock', durationSeconds: 354, releaseYear: 1975 },
    { title: 'Hotel California', artist: 'Eagles', album: 'Hotel California', genre: 'Rock', durationSeconds: 391, releaseYear: 1977 },
    { title: 'Billie Jean', artist: 'Michael Jackson', album: 'Thriller', genre: 'Pop', durationSeconds: 294, releaseYear: 1982 },
    { title: 'Smells Like Teen Spirit', artist: 'Nirvana', album: 'Nevermind', genre: 'Rock', durationSeconds: 301, releaseYear: 1991 },
    { title: 'Uptown Funk', artist: 'Bruno Mars ft. Mark Ronson', album: 'Uptown Special', genre: 'Pop', durationSeconds: 270, releaseYear: 2014 },
    { title: 'Lose Yourself', artist: 'Eminem', album: '8 Mile OST', genre: 'Hip-Hop', durationSeconds: 326, releaseYear: 2002 },
    { title: 'Take On Me', artist: 'a-ha', album: 'Hunting High and Low', genre: 'Pop', durationSeconds: 225, releaseYear: 1985 },
    { title: 'Sweet Child O Mine', artist: 'Guns N Roses', album: 'Appetite for Destruction', genre: 'Rock', durationSeconds: 356, releaseYear: 1987 },
    { title: 'Starboy', artist: 'The Weeknd ft. Daft Punk', album: 'Starboy', genre: 'R&B', durationSeconds: 230, releaseYear: 2016 },
    { title: 'Rolling in the Deep', artist: 'Adele', album: '21', genre: 'Pop', durationSeconds: 228, releaseYear: 2010 },
    { title: 'Wonderwall', artist: 'Oasis', album: '(What\'s the Story) Morning Glory?', genre: 'Rock', durationSeconds: 258, releaseYear: 1995 },
    { title: 'Thriller', artist: 'Michael Jackson', album: 'Thriller', genre: 'Pop', durationSeconds: 358, releaseYear: 1982 },
    { title: 'Get Lucky', artist: 'Daft Punk ft. Pharrell', album: 'Random Access Memories', genre: 'Electronic', durationSeconds: 369, releaseYear: 2013 },
    { title: 'Somebody That I Used to Know', artist: 'Gotye ft. Kimbra', album: 'Making Mirrors', genre: 'Pop', durationSeconds: 244, releaseYear: 2011 },
    { title: 'Despacito', artist: 'Luis Fonsi ft. Daddy Yankee', album: 'Vida', genre: 'Pop', durationSeconds: 229, releaseYear: 2017 },
    { title: 'Stairway to Heaven', artist: 'Led Zeppelin', album: 'Led Zeppelin IV', genre: 'Rock', durationSeconds: 482, releaseYear: 1971 },
    { title: 'Purple Rain', artist: 'Prince', album: 'Purple Rain', genre: 'R&B', durationSeconds: 520, releaseYear: 1984 },
    { title: 'Shake It Off', artist: 'Taylor Swift', album: '1989', genre: 'Pop', durationSeconds: 219, releaseYear: 2014 },
    { title: 'Radioactive', artist: 'Imagine Dragons', album: 'Night Visions', genre: 'Rock', durationSeconds: 187, releaseYear: 2012 },
    { title: 'Thinking Out Loud', artist: 'Ed Sheeran', album: 'x (Multiply)', genre: 'Pop', durationSeconds: 281, releaseYear: 2014 },
    { title: 'Old Town Road', artist: 'Lil Nas X', album: '7', genre: 'Hip-Hop', durationSeconds: 157, releaseYear: 2019 },
    { title: 'Havana', artist: 'Camila Cabello', album: 'Camila', genre: 'Pop', durationSeconds: 217, releaseYear: 2018 },
    { title: 'Believer', artist: 'Imagine Dragons', album: 'Evolve', genre: 'Rock', durationSeconds: 204, releaseYear: 2017 }
];

// Test users with roles
const sampleUsers = [
    { username: 'admin', email: 'admin@tynda.kz', password: 'admin123', role: 'admin' },
    { username: 'testuser', email: 'test@tynda.kz', password: 'test123', role: 'user' }
];

async function seed() {
    console.log('Starting database seed...\n');

    const client = new MongoClient(MONGO_URI);

    try {
        await client.connect();
        console.log('Connected to MongoDB\n');

        const db = client.db(DB_NAME);

        // Clear existing data (optional - comment out if you want to keep existing data)
        console.log('Clearing existing data...');
        await db.collection('tracks').deleteMany({});
        await db.collection('users').deleteMany({});
        console.log('Cleared existing tracks and users\n');

        // Insert users first to get their IDs
        console.log('Creating users...');
        const userIds = {};
        for (const user of sampleUsers) {
            const hashedPassword = await bcrypt.hash(user.password, 10);
            const result = await db.collection('users').insertOne({
                username: user.username,
                email: user.email,
                password: hashedPassword,
                role: user.role,
                createdAt: new Date()
            });
            userIds[user.username] = result.insertedId;
            console.log(`  ✓ Created ${user.role}: ${user.username} (${user.email})`);
        }

        // Insert tracks with createdBy (distribute between users for testing)
        console.log('\nInserting tracks...');
        const tracksWithOwnership = sampleTracks.map((track, index) => ({
            ...track,
            createdAt: new Date(),
            coverUrl: '',
            // First half owned by admin, second half by testuser
            createdBy: index < Math.ceil(sampleTracks.length / 2)
                ? userIds['admin']
                : userIds['testuser']
        }));

        const tracksResult = await db.collection('tracks').insertMany(tracksWithOwnership);
        console.log(`Inserted ${tracksResult.insertedCount} tracks`);
        console.log(`  - ${Math.ceil(sampleTracks.length / 2)} tracks owned by admin`);
        console.log(`  - ${Math.floor(sampleTracks.length / 2)} tracks owned by testuser`);

        console.log('\n========================================');
        console.log('Database seeded successfully!');
        console.log('========================================\n');
        console.log('Test accounts:');
        console.log('  Email: admin@tynda.kz | Password: admin123 (ADMIN)');
        console.log('  Email: test@tynda.kz  | Password: test123 (USER)');
        console.log('\nTotal tracks:', tracksWithOwnership.length);
        console.log('========================================\n');

    } catch (err) {
        console.error('Seed failed:', err);
        process.exit(1);
    } finally {
        await client.close();
        console.log('Database connection closed.');
    }
}

seed();
