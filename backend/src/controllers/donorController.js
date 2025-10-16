const Donor = require('../models/Donor');

// @desc    Register a new donor
// @route   POST /api/donors/register
// @access  Public
const registerDonor = async (req, res) => {
    const { fullName, contactNumber, email, bloodGroup, age, gender, location } = req.body;

    if (!fullName || !contactNumber || !email || !bloodGroup || !age || !location) {
        return res.status(400).json({ message: 'Please fill in all required fields.' });
    }

    try {
        const donorExists = await Donor.findOne({ $or: [{ email }, { contactNumber }] });

        if (donorExists) {
            return res.status(409).json({ message: 'A donor with this email or contact number already exists.' });
        }

        const donor = new Donor({
            fullName, contactNumber, email, bloodGroup, age, gender, location,
        });

        const createdDonor = await donor.save();
        res.status(201).json(createdDonor);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error during donor registration.', error: error.message });
    }
};


// @desc    Authenticate a donor & get token (simplified for now)
// @route   POST /api/donors/login
// @access  Public
const loginDonor = async (req, res) => {
    const { contactNumber } = req.body;

    if (!contactNumber) {
        return res.status(400).json({ message: 'Contact number is required.' });
    }

    try {
        // Find the donor by their contact number
        const donor = await Donor.findOne({ contactNumber });

        if (!donor) {
            return res.status(404).json({ message: 'No donor found with this contact number. Please register first.' });
        }

        // **Placeholder for OTP Logic**
        // In a real app:
        // 1. I would generate and send an OTP to the donor's contact number here.
        // 2. I would have another endpoint to verify the OTP.
        // 3. Upon successful verification, I would send back the donor data.

        // For now, I'll assume the login is successful if the number exists.
        res.status(200).json({
            _id: donor._id,
            fullName: donor.fullName,
            email: donor.email,
            contactNumber: donor.contactNumber,
            // I can add a JWT token here later for more secure authentication
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error during login.' });
    }
};


// @desc    Get all available donors, optionally filtered by blood group
// @route   GET /api/donors/available
// @access  Private/Hospital
const getAvailableDonors = async (req, res) => {
    try {
        // This will find all documents in the donors collection
        // where the 'isAvailable' field is true.
        const availableDonors = await Donor.find({ isAvailable: true });

        res.status(200).json(availableDonors);
    } catch (error) {
        console.error('Error fetching available donors:', error);
        res.status(500).json({ message: 'Server error while fetching donors.' });
    }
};


module.exports = {
    registerDonor,
    loginDonor,
    getAvailableDonors,
};
