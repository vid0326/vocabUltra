require('dotenv').config();
const express = require('express');
const connectDB = require('./config/db');
const cors = require('cors');
const BloomFilter = require('./utils/BloomFilter');
const User = require('./models/User');
const compression = require('compression');
const helmet = require('helmet');

const app = express();
const PORT = process.env.PORT || 5000;

// Initialize Bloom Filter (Global)
const bloomFilter = new BloomFilter(10000);
app.locals.bloomFilter = bloomFilter;

// Middleware
app.use(helmet()); // Security headers
app.use(compression()); // Gzip compression
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads', {
    maxAge: '1d',
    etag: true
})); // Serve uploaded files with caching

// Database Connection & Bloom Filter Init
// Database Connection & Bloom Filter Init
connectDB().then(() => {
    // Efficient Bloom Filter Init using Streams
    console.log('Initializing Bloom Filter...');
    const stream = User.find({}, 'email username').cursor();
    let count = 0;
    stream.on('data', (user) => {
        if (user.email) bloomFilter.add(user.email);
        if (user.username) bloomFilter.add(user.username);
        count++;
    });
    stream.on('end', () => {
        console.log(`Bloom Filter initialized with ${count} users.`);
    });
    stream.on('error', (err) => {
        console.error('Error initializing Bloom Filter:', err);
    });
});

// Basic Route
app.get('/', (req, res) => {
    res.send('Vocab App Backend is running');
});

// API Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api', require('./routes/api'));
app.use('/api/notes', require('./routes/notes'));

// Start Server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
