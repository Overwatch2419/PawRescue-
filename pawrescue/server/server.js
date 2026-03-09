const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const Rescue = require('./models/Rescue');
const Volunteer = require('./models/Volunteer');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'pawrescue_secret_key_2024';

// Middleware
app.use(cors());
app.use(express.json());
// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Multer Setup for handling file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, 'uploads/'));
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/pawrescue';

mongoose.connect(MONGODB_URI)
    .then(() => console.log('✅ MongoDB connected'))
    .catch(err => console.error('❌ MongoDB connection error:', err));

// ─── Auth Middleware ───────────────────────────────────────────────────────────
const authenticateVolunteer = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Unauthorized: No token provided' });
    }
    try {
        const token = authHeader.split(' ')[1];
        req.volunteer = jwt.verify(token, JWT_SECRET);
        next();
    } catch (err) {
        return res.status(401).json({ message: 'Unauthorized: Invalid token' });
    }
};

// ─── Auth Routes ──────────────────────────────────────────────────────────────

// Register
app.post('/api/auth/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;
        if (!name || !email || !password)
            return res.status(400).json({ message: 'All fields are required' });

        const existing = await Volunteer.findOne({ email });
        if (existing)
            return res.status(409).json({ message: 'Email already registered' });

        const volunteer = new Volunteer({ name, email, password });
        await volunteer.save();

        const token = jwt.sign(
            { id: volunteer._id, name: volunteer.name, email: volunteer.email },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.status(201).json({ token, id: volunteer._id, name: volunteer.name, email: volunteer.email });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Login
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password)
            return res.status(400).json({ message: 'Email and password are required' });

        const volunteer = await Volunteer.findOne({ email });
        if (!volunteer)
            return res.status(401).json({ message: 'Invalid email or password' });

        const isMatch = await volunteer.comparePassword(password);
        if (!isMatch)
            return res.status(401).json({ message: 'Invalid email or password' });

        const token = jwt.sign(
            { id: volunteer._id, name: volunteer.name, email: volunteer.email },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.json({ token, id: volunteer._id, name: volunteer.name, email: volunteer.email });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// ─── Rescue Routes ────────────────────────────────────────────────────────────

// Get all rescues (public - for the map on Home page)
app.get('/api/rescues', async (req, res) => {
    try {
        const rescues = await Rescue.find().sort({ createdAt: -1 });
        res.json(rescues);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Create a new rescue report (public - anyone can report)
// Handled as multipart/form-data using multer to support media uploads
app.post('/api/rescues', upload.single('media'), async (req, res) => {
    try {
        // Parse the location since it comes as a JSON string in form data
        let location = req.body.location;
        if (typeof location === 'string') {
            location = JSON.parse(location);
        }

        const rescueData = {
            ...req.body,
            location
        };

        // If an image/video was uploaded, save its URL
        if (req.file) {
            rescueData.mediaUrl = `/uploads/${req.file.filename}`;
        }

        const rescue = new Rescue(rescueData);
        const newRescue = await rescue.save();
        res.status(201).json(newRescue);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Update rescue status (protected - volunteers only)
app.patch('/api/rescues/:id', authenticateVolunteer, async (req, res) => {
    try {
        const { status } = req.body;
        const rescue = await Rescue.findById(req.params.id);

        if (!rescue) {
            return res.status(404).json({ message: 'Rescue not found' });
        }

        // Ownership Validation: If it's already assigned, ONLY the assigned volunteer can update it
        if (rescue.assignedTo && rescue.assignedTo.toString() !== req.volunteer.id) {
            return res.status(403).json({ message: 'Forbidden: You cannot modify a rescue assigned to another volunteer' });
        }

        rescue.status = status;

        // When a volunteer accepts a rescue, assign it to them
        if (status === 'accepted') {
            rescue.assignedTo = req.volunteer.id;
            rescue.assignedName = req.volunteer.name;
        }

        // When a rescue is sent back to pending, unassign it
        if (status === 'pending') {
            rescue.assignedTo = null;
            rescue.assignedName = null;
        }

        const updatedRescue = await rescue.save();
        res.json(updatedRescue);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});


app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
