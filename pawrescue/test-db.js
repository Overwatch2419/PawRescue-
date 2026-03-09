const mongoose = require('mongoose');
const Rescue = require('./server/models/Rescue');
const Volunteer = require('./server/models/Volunteer');
require('dotenv').config({ path: './server/.env' });

async function check() {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/pawrescue');
    
    const rescues = await Rescue.find().sort({ createdAt: -1 }).lean();
    console.log("RESCUES:");
    rescues.forEach(r => {
        console.log(`- ID: ${r._id}, Status: ${r.status}, assignedTo: ${r.assignedTo} (Type: ${typeof r.assignedTo})`);
    });

    const volunteers = await Volunteer.find().lean();
    console.log("\nVOLUNTEERS:");
    volunteers.forEach(v => {
        console.log(`- ID: ${v._id} (Type: ${typeof v._id}), Name: ${v.name}`);
    });
    
    process.exit(0);
}

check();
