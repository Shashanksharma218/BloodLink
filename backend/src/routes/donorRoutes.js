const express = require('express');
const router = express.Router();

const { 
    registerDonor,
    sendRegistrationOTP,
    verifyRegistrationOTP,
    sendOTP,
    loginDonor, 
    getAvailableDonors, 
    updateAvailability,
    getDonorById,
    getAllDonors,
    getDonorStats,
    postHealthLog,
    getHealthLogs,
} = require('../controllers/donorController');

// Send OTP for email verification during registration (only requires email)
router.post('/send-registration-otp', sendRegistrationOTP);

// Verify OTP during registration (before completing registration)
router.post('/verify-registration-otp', verifyRegistrationOTP);

// Complete registration after OTP verification (requires all fields + OTP)
router.post('/register', registerDonor);

// donor login

router.post('/send-otp', sendOTP);

router.post('/login', loginDonor);

router.get('/available', getAvailableDonors);

router.get('/all', getAllDonors);

router.get('/:id/stats', getDonorStats);

router.post('/:id/health', postHealthLog);

router.get('/:id/health', getHealthLogs);

router.get('/', getDonorById);

router.put('/availability', updateAvailability);

module.exports = router;