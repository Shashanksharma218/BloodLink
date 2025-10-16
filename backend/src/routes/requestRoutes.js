const express = require('express');
const router = express.Router();
const { 
    createBloodRequest, 
    getAllRequests, 
    cancelRequest,
    markRequestCompleted,
    getRequestsForDonor,
    updateRequestStatus,
} = require('../controllers/requestController');

// --- Hospital Routes ---

// @route   POST /api/requests
// @desc    Create new blood requests for selected donors
router.post('/', createBloodRequest);

// @route   GET /api/requests
// @desc    Get all blood requests
router.get('/', getAllRequests);

// @route   DELETE /api/requests/:id
// @desc    Cancel a pending request
router.delete('/:id', cancelRequest);

// @route   PUT /api/requests/:id/complete
// @desc    Mark an accepted request as completed
router.put('/:id/complete', markRequestCompleted);


// --- Donor Routes ---

// @route   GET /api/requests/donor/:donorId
// @desc    Get all requests for a single donor
router.get('/donor/:donorId', getRequestsForDonor);

// @route   PUT /api/requests/:id/status
// @desc    Update a request's status (Accept/Reject)
router.put('/:id/status', updateRequestStatus);


module.exports = router;

