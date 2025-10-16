const express = require('express');
const router = express.Router();
const { registerDonor, loginDonor, getAvailableDonors } = require('../controllers/donorController'); // 1. Import the new login function

// Route for registering a new donor
router.post('/register', registerDonor);

// Route for donor login
router.post('/login', loginDonor);

// @route  GET /api/donors/available
// @desc   Get a list of all donors who are available to donate
router.get('/available', getAvailableDonors);


module.exports = router;
