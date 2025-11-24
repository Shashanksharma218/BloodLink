const express = require('express');
const router = express.Router();
const { generateCertificate } = require('../controllers/certificateController');

// @route   GET /api/certificates/:requestId
// @desc    Generate and download PDF certificate for completed donation
router.get('/:requestId', generateCertificate);

module.exports = router;
