const mongoose = require('mongoose');

const RescueSchema = new mongoose.Schema({
    animalType: {
        type: String,
        required: true,
        enum: ['Dog', 'Cat', 'Bird', 'Cow', 'Other']
    },
    urgency: {
        type: String,
        required: true,
        enum: ['Critical', 'Serious', 'Stable']
    },
    description: {
        type: String,
        required: true
    },
    contactInfo: {
        type: String,
        required: true
    },
    location: {
        lat: { type: Number, required: true },
        lng: { type: Number, required: true }
    },
    address: {
        type: String
    },
    status: {
        type: String,
        default: 'pending',
        enum: ['pending', 'accepted', 'on_way', 'in_progress', 'rescued', 'archived']
    },
    assignedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Volunteer',
        default: null
    },
    assignedName: {
        type: String,
        default: null
    },
    mediaUrl: {
        type: String,
        default: null
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Rescue', RescueSchema);
