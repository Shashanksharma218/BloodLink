const express = require('express');
const router = express.Router();

const { 
    registerDonor, 
    sendOTP,
    loginDonor, 
    getAvailableDonors, 
    updateAvailability,
    getDonorById,
    getAllDonors,
} = require('../controllers/donorController');

// registering a new donor
router.post('/register', registerDonor);

// donor login

router.post('/send-otp', sendOTP);

router.post('/login', loginDonor);

router.get('/available', getAvailableDonors);

router.get('/', getDonorById);

router.put('/availability', updateAvailability);

router.get('/all', getAllDonors);

module.exports = router;