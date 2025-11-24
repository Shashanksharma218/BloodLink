const express = require('express');
const router = express.Router();
const { 
  loginHospital, 
  getHospitalProfile, 
  updateHospitalProfile, 
  changeHospitalPassword 
} = require('../controllers/hospitalController');

// @route   POST /api/hospitals/login
// @desc    Login hospital
router.post('/login', loginHospital);

// @route   GET /api/hospitals/profile
// @desc    Get hospital profile
router.get('/profile', getHospitalProfile);

// @route   PUT /api/hospitals/profile
// @desc    Update hospital profile
router.put('/profile', updateHospitalProfile);

// @route   PUT /api/hospitals/password
// @desc    Change hospital password
router.put('/password', changeHospitalPassword);

module.exports = router;

