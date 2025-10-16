const BloodRequest = require('../models/BloodRequest');
const Donor = require('../models/Donor');
const mongoose = require('mongoose');

// For Hospital: Create new blood requests for selected donors
const createBloodRequest = async (req, res) => {
    const { donorIds, bloodGroup, urgency, note } = req.body;
    if (!donorIds || !Array.isArray(donorIds) || donorIds.length === 0 || !bloodGroup || !urgency) {
        return res.status(400).json({ message: 'Missing required fields to create request.' });
    }
    try {
        const requestPromises = donorIds.map(donorId => {
            const newRequest = new BloodRequest({ donor: donorId, bloodGroup, urgency, note });
            return newRequest.save();
        });
        const createdRequests = await Promise.all(requestPromises);
        res.status(201).json({ 
            message: `${createdRequests.length} requests created successfully.`, 
            requests: createdRequests 
        });
    } catch (error) {
        console.error('Error creating blood requests:', error);
        res.status(500).json({ message: 'Server error while creating requests.' });
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
            return res.status(400).json({ message: 'This request has been actioned and cannot be cancelled.' });
        }
        await BloodRequest.findByIdAndDelete(id);
        res.status(200).json({ message: 'Request cancelled successfully.' });
    } catch (error) {
        console.error('Error cancelling request:', error);
        res.status(500).json({ message: 'Server error while cancelling request.' });
    }
};

// For Hospital: Mark a request as completed
const markRequestCompleted = async (req, res) => {
    try {
        const { id } = req.params;
        const request = await BloodRequest.findById(id);
        if (!request) {
            return res.status(404).json({ message: 'Request not found.' });
        }
        if (request.status !== 'Accepted') {
            return res.status(400).json({ message: 'Only accepted requests can be marked as completed.' });
        }
        request.status = 'Completed';
        const updatedRequest = await request.save();
        await Donor.findByIdAndUpdate(request.donor, {
            isAvailable: false,
            lastDonationDate: new Date(),
        });
        res.status(200).json(updatedRequest);
    } catch (error) {
        console.error('Error marking request as completed:', error);
        res.status(500).json({ message: 'Server error while marking request as completed.' });
    }
};

// For Donor: Get all requests for a specific donor
const getRequestsForDonor = async (req, res) => {
    try {
        const { donorId } = req.params;
        const requests = await BloodRequest.find({ donor: donorId }).sort({ createdAt: -1 });
        res.status(200).json(requests);
    } catch (error) {
        console.error('Error fetching donor requests:', error);
        res.status(500).json({ message: 'Server error while fetching requests.' });
    }
};

// For Donor: Update the status of a specific request (Accept/Reject)
const updateRequestStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        if (!status || !['Accepted', 'Rejected'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status provided.' });
        }
        const request = await BloodRequest.findById(id);
        if (!request) {
            return res.status(404).json({ message: 'Request not found.' });
        }
        request.status = status;
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
    markRequestCompleted,
    getRequestsForDonor,
    updateRequestStatus,
};

