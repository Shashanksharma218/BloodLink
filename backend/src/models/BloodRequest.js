const mongoose = require("mongoose");

const bloodRequestSchema = new mongoose.Schema({
    // This field links the request to the specific donor it was sent to.
    donor: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Donor' // This creates a reference to your Donor model
    },
    bloodGroup: {
        type: String,
        required: true,
        enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
    },
    urgency: {
        type: String,
        required: true,
        enum: ['Medium', 'High', 'Urgent']
    },
    note: {
        type: String,
        trim: true,
    },
    status: {
        type: String,
        required: true,
        enum: ["Pending", "Accepted", "Rejected", "Completed"],
        default: "Pending" // New requests will always start as "Pending"
    }
}, {
    timestamps: true // Adds createdAt and updatedAt automatically
});

// Use the correct schema (bloodRequestSchema) for the model
const BloodRequest = mongoose.model("BloodRequest", bloodRequestSchema);

module.exports = BloodRequest;

