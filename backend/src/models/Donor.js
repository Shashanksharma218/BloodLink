const mongoose = require("mongoose");
const validator = require("validator");

const donorSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: [true, "Full name is required."],
        trim: true,
    },
    contactNumber: {
        type: String,
        required: [true, "Contact number is required."],
        unique: true,
        trim: true,
        validate: {
            validator: function(v) {
                // Validates that the number is exactly 10 digits
                return /^\d{10}$/.test(v);
            },
            message: props => `${props.value} is not a valid 10-digit phone number!`
        },
    },
    email: {
        type: String,
        required: [true, "Email is required."],
        unique: true,
        trim: true,
        lowercase: true,
        validate: [validator.isEmail, "Please provide a valid email address."],
    },
    bloodGroup: {
        type: String,
        required: [true, "Blood group is required."],
        enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
    },
    age: {
        type: Number,
        required: [true, "Age is required."],
        min: [18, "Donor must be at least 18 years old."],
    },
    gender: {
        type: String,
        enum: ['Male', 'Female', 'Other'], // Matches the frontend form
    },
    location: {
        type: String,
        required: [true, "Location is required."],
        trim: true,
    },
    isAvailable: {
        type: Boolean,
        default: true, // Donors are available by default upon registration
    },
    lastDonationDate: {
        type: Date,
    }
}, {
    timestamps: true // Automatically adds createdAt and updatedAt fields
});

// Mongoose will create a collection named 'donors' (plural and lowercase) based on this model.
const Donor = mongoose.model("Donor", donorSchema);

module.exports = Donor;
