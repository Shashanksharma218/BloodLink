const express = require('express');
const router = express.Router();

const { 
    createBloodRequest, 
    getAllRequests, 
    cancelRequest,
    updateRequestStatusByHospital, // Updated function import
    getRequestsForDonor,
    updateRequestStatus,
} = require('../controllers/requestController');

// --- Hospital Routes ---

// @route   POST /api/requests
// @desc    Create new blood requests for selected donors (now includes deadline)
router.post('/', createBloodRequest);

// @route   GET /api/requests
// @desc    Get all blood requests
router.get('/', getAllRequests);

// @route   DELETE /api/requests/:id
// @desc    Cancel a pending request
router.delete('/:id', cancelRequest);


// @route   PUT /api/requests/:id/status/hospital
// @desc    Hospital update request status (Visit Scheduled, Donation Rejected, Donation Completed)
router.put('/:id/status/hospital', updateRequestStatusByHospital);


// --- Donor Routes ---

// @route   GET /api/requests/donor
// @desc    Get all requests for the currently authenticated donor
router.get('/donor', getRequestsForDonor);

// @route   PUT /api/requests/:id/status/donor
// @desc    Update a request's status (Donor Accepted/Donor Rejected)
router.put('/:id/status/donor', updateRequestStatus);


module.exports = router;
