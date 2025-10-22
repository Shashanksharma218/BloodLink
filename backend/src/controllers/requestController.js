const BloodRequest = require('../models/BloodRequest');
const Donor = require('../models/Donor');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

// For Hospital: Create new blood requests for selected donors
const createBloodRequest = async (req, res) => {
    // NEW: Include deadline
    const { donorIds, bloodGroup, urgency, note, deadline } = req.body; 

    if (!donorIds || !Array.isArray(donorIds) || donorIds.length === 0 || !bloodGroup || !urgency || !deadline) {
        return res.status(400).json({ message: 'Missing required fields (donorIds, bloodGroup, urgency, deadline).' });
    }

    // Basic check for future date
    if (new Date(deadline) <= Date.now()) {
        return res.status(400).json({ message: 'The deadline must be a future date.' });
    }

    try {
        const requestPromises = donorIds.map(donorId => {
            const newRequest = new BloodRequest({ 
                donor: donorId, 
                bloodGroup, 
                urgency, 
                note,
                deadline: new Date(deadline) // Save deadline
            });
            return newRequest.save();
        });
        const createdRequests = await Promise.all(requestPromises);
        res.status(201).json({ 
            message: `${createdRequests.length} requests created successfully.`, 
            requests: createdRequests 
        });
    } catch (error) {
        // Mongoose validation errors (like future date check) will be caught here
        console.error('Error creating blood requests:', error);
        res.status(500).json({ message: 'Server error while creating requests.', error: error.message });
    }
};

// For Hospital: Get all blood requests and populate donor info
const getAllRequests = async (req, res) => {
    try {
        const requests = await BloodRequest.find({}).sort({ createdAt: -1 }).populate('donor', 'fullName contactNumber');
        res.status(200).json(requests);
    } catch (error) {
        console.error('Error fetching requests:', error);
        res.status(500).json({ message: 'Server error while fetching requests.' });
    }
};

// For Hospital: Cancel (delete) a blood request
const cancelRequest = async (req, res) => {
    try {
        const { id } = req.params;
        const request = await BloodRequest.findById(id);
        if (!request) {
            return res.status(404).json({ message: 'Request not found.' });
        }
        if (request.status !== 'Pending') {
            return res.status(400).json({ message: `This request is ${request.status} and cannot be cancelled.` });
        }
        await BloodRequest.findByIdAndDelete(id);
        res.status(200).json({ message: 'Request cancelled successfully.' });
    } catch (error) {
        console.error('Error cancelling request:', error);
        res.status(500).json({ message: 'Server error while cancelling request.' });
    }
};


// NEW: For Hospital: Update status for visit scheduled, rejection (unfit), or completion
const updateRequestStatusByHospital = async (req, res) => {
    const { status, remarks } = req.body;
    const { id } = req.params;

    const validStatuses = ["Visit Scheduled", "Donation Rejected", "Donation Completed"];
    
    if (!status || !validStatuses.includes(status)) {
        return res.status(400).json({ message: 'Invalid status provided. Must be Visit Scheduled, Donation Rejected, or Donation Completed.' });
    }

    // Remarks is mandatory for rejection and completion
    if (status !== "Visit Scheduled" && (!remarks || remarks.trim() === '')) {
        return res.status(400).json({ message: 'Remarks are required for Donation Rejected and Donation Completed statuses.' });
    }

    try {
        const request = await BloodRequest.findById(id);
        if (!request) {
            return res.status(404).json({ message: 'Request not found.' });
        }
        
        // Hospital can only act on requests the donor has accepted
        if (request.status !== 'Donor Accepted' && request.status !== 'Visit Scheduled') {
            return res.status(400).json({ message: `Cannot set status to ${status}. Current status is ${request.status}.` });
        }

        // Apply updates
        request.status = status;
        request.remarks = remarks || ''; // Update remarks
        const updatedRequest = await request.save();

        // Specific actions for final statuses
        if (status === 'Donation Completed') {
            // Update donor status to unavailable and set last donation date
            await Donor.findByIdAndUpdate(request.donor, {
                isAvailable: false,
                lastDonationDate: new Date(),
            });
        }
        
        res.status(200).json(updatedRequest);
    } catch (error) {
        console.error(`Error updating request to ${status}:`, error);
        res.status(500).json({ message: `Server error while updating request status to ${status}.` });
    }
};

// Removed old markRequestCompleted function

// For Donor: Get all requests for a specific donor
const getRequestsForDonor = async (req, res) => {
  try {
    const token = req.cookies?.token;
    if (!token) {
      return res.status(401).json({ message: 'Authentication token missing.' });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, "bloodlink.iiitu.2025");
    } catch (err) {
      return res.status(401).json({ message: 'Invalid or expired token.' });
    }

    const { _id: donorId } = decoded;
    const requests = await BloodRequest.find({ donor: donorId })
      .sort({ createdAt: -1 });

    return res.status(200).json(requests);

  } catch (error) {
    console.error('Error fetching donor requests:', error);
    return res.status(500).json({ message: 'Server error while fetching requests.', error: error.message });
  }
};

// For Donor: Update the status of a specific request (Accept/Reject)
const updateRequestStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        
        const validStatuses = ['Donor Accepted', 'Donor Rejected'];

        if (!status || !validStatuses.includes(status)) {
            return res.status(400).json({ message: 'Invalid status provided. Must be Donor Accepted or Donor Rejected.' });
        }

        const request = await BloodRequest.findById(id);
        if (!request) {
            return res.status(404).json({ message: 'Request not found.' });
        }

        if (request.status !== 'Pending') {
            return res.status(400).json({ message: 'This request has already been actioned.' });
        }

        request.status = status;
        
        // If rejected by donor, set the required remark
        if (status === 'Donor Rejected') {
            request.remarks = 'Rejected by donor.';
        }

        const updatedRequest = await request.save();
        res.status(200).json(updatedRequest);
    } catch (error) {
        console.error('Error updating request status:', error);
        res.status(500).json({ message: 'Server error while updating status.' });
    }
};


module.exports = {
    createBloodRequest,
    getAllRequests,
    cancelRequest,
    updateRequestStatusByHospital, // New function export
    getRequestsForDonor,
    updateRequestStatus,
};
