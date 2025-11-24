const mongoose = require("mongoose");
const validator = require("validator");

const hospitalSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Hospital name is required."],
        trim: true,
    },
    email: {
        type: String,
        required: [true, "Email is required."],
        unique: true,
        trim: true,
        lowercase: true,
        validate: [validator.isEmail, "Please provide a valid email address."],
    },
    password: {
        type: String,
        required: [true, "Password is required."],
        minlength: [8, "Password must be at least 8 characters long."],
    },
    phone: {
        type: String,
        required: [true, "Phone number is required."],
        trim: true,
        validate: {
            validator: function(v) {
                return /^\d{10}$/.test(v) || /^\+?\d{10,15}$/.test(v);
            },
            message: props => `${props.value} is not a valid phone number!`
        },
    },
    address: {
        type: String,
        required: [true, "Address is required."],
        trim: true,
    },
    license: {
        type: String,
        required: [true, "License number is required."],
        unique: true,
        trim: true,
    },
}, {
    timestamps: true 
});

const Hospital = mongoose.model("Hospital", hospitalSchema);

module.exports = Hospital;

