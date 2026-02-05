require('dotenv').config();
const express = require('express');
const connectDB = require('./config/db');
const cors = require('cors');
const BloomFilter = require('./utils/BloomFilter');
const User = require('./models/User');

const app = express();
const PORT = process.env.PORT || 5000;

// Initialize Bloom Filter (Global)
const bloomFilter = new BloomFilter(10000);
app.locals.bloomFilter = bloomFilter;

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads')); // Serve uploaded files

// Database Connection & Bloom Filter Init
connectDB().then(async () => {
    // Populate Bloom Filter after DB connects
    try {
        console.log('Initializing Bloom Filter...');
        const users = await User.find({}, 'email username');
        users.forEach(user => {
            if (user.email) bloomFilter.add(user.email);
            if (user.username) bloomFilter.add(user.username);
        });
        console.log(`Bloom Filter initialized with ${users.length} users.`);
    } catch (err) {
        console.error('Error initializing Bloom Filter:', err);
    }
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
