const BloodRequest = require('../models/BloodRequest');
const Donor = require('../models/Donor');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const { sendDonationCompletionEmail } = require('../utils/emailService');
const { createCertificatePDF } = require('./certificateController');
const { createNotification } = require('./notificationController');

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
        
        // Create notifications for each new request
        for (const request of createdRequests) {
            await createNotification(request.donor, 'new_request', {
                requestId: request._id,
                bloodGroup: request.bloodGroup,
                urgency: request.urgency
            });
        }
        
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
        // Auto-expire: mark any pending requests past their deadline as Expired
        await BloodRequest.updateMany(
            { status: 'Pending', deadline: { $lt: new Date() } },
            { $set: { status: 'Expired', remarks: 'Request expired.' } }
        );

        const requests = await BloodRequest.find({})
            .sort({ createdAt: -1 })
            .populate('donor', 'fullName contactNumber');
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
        const request = await BloodRequest.findById(id).populate('donor');
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
        
        // Generate and store certificate ID when donation is completed
        if (status === 'Donation Completed' && !request.certificateId) {
            const certificateId = `BLU-${request._id.toString().slice(-8).toUpperCase()}-${new Date().getFullYear()}`;
            request.certificateId = certificateId;
        }
        
        const updatedRequest = await request.save();

        // Create notification for status change
        await createNotification(request.donor._id || request.donor, 'status_changed', {
            requestId: updatedRequest._id,
            status: status
        });

        // Specific actions for final statuses
        if (status === 'Donation Completed') {
            // Update donor status to unavailable and set last donation date
            await Donor.findByIdAndUpdate(request.donor, {
                isAvailable: false,
                lastDonationDate: new Date(),
            });

            // Create certificate issued notification
            await createNotification(request.donor._id || request.donor, 'certificate_issued', {
                requestId: updatedRequest._id,
                certificateId: updatedRequest.certificateId
            });

            // Send email with certificate
            try {
                // donor details already available in request.donor (populated)
                if (request.donor && request.donor.email) {
                    // Generate certificate as buffer - use certificateId from updated request
                    const certificateBuffer = await createCertificatePDF(updatedRequest, updatedRequest.certificateId);
                    
                    // Send email with certificate attached
                    await sendDonationCompletionEmail(
                        request.donor.email,
                        request.donor.fullName,
                        certificateBuffer
                    );
                    
                    console.log(`Email with certificate sent to donor: ${request.donor.email}`);
                }
            } catch (emailError) {
                console.error('Error sending email notification:', emailError);
                // Don't fail the main operation if email fails
                // Continue to return success response
            }
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

    // Auto-expire any pending requests for this donor that are past deadline
    await BloodRequest.updateMany(
      { donor: donorId, status: 'Pending', deadline: { $lt: new Date() } },
      { $set: { status: 'Expired', remarks: 'Request expired.' } }
    );

    // Filters and pagination
    const { status, urgency, from, to, page = 1, limit = 10, sort = 'newest' } = req.query;

    const query = { donor: donorId };
    if (status) query.status = status;
    if (urgency) query.urgency = urgency;
    if (from || to) {
      query.createdAt = {};
      if (from) query.createdAt.$gte = new Date(from);
      if (to) query.createdAt.$lte = new Date(to);
    }

    const sortMap = {
      newest: { createdAt: -1 },
      oldest: { createdAt: 1 },
      deadline: { deadline: 1, createdAt: -1 },
    };
    const sortOption = sortMap[sort] || sortMap.newest;

    const pageNum = Math.max(parseInt(page, 10) || 1, 1);
    const limitNum = Math.min(Math.max(parseInt(limit, 10) || 10, 1), 100);
    const skip = (pageNum - 1) * limitNum;

    const [requests, total] = await Promise.all([
      BloodRequest.find(query).sort(sortOption).skip(skip).limit(limitNum),
      BloodRequest.countDocuments(query)
    ]);

    const totalPages = Math.max(1, Math.ceil(total / limitNum));

    return res.status(200).json({ requests, page: pageNum, totalPages, total });

  } catch (error) {
    console.error('Error fetching donor requests:', error);
    return res.status(500).json({ message: 'Server error while fetching requests.', error: error.message });
  }
};

// For Donor: Update the status of a specific request (Accept/Reject)
const updateRequestStatus = async (req, res) => {
    try {
        // Authentication check
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

        const { id } = req.params;
        const { status, remarks } = req.body;
        
        const validStatuses = ['Donor Accepted', 'Donor Rejected'];

        if (!status || !validStatuses.includes(status)) {
            return res.status(400).json({ message: 'Invalid status provided. Must be Donor Accepted or Donor Rejected.' });
        }

        const request = await BloodRequest.findById(id).populate('donor');
        if (!request) {
            return res.status(404).json({ message: 'Request not found.' });
        }

        // Verify the request belongs to the authenticated donor
        const donorId = decoded._id.toString();
        if (request.donor._id.toString() !== donorId) {
            return res.status(403).json({ message: 'You do not have permission to update this request.' });
        }

        // Prevent actions on expired requests
        if (request.deadline && new Date(request.deadline) < new Date()) {
            return res.status(400).json({ message: 'This request has expired.' });
        }

        if (request.status !== 'Pending') {
            return res.status(400).json({ message: 'This request has already been actioned.' });
        }

        request.status = status;
        
        // Update remarks if provided (frontend sends remarks for rejections)
        if (remarks && remarks.trim() !== '') {
            request.remarks = remarks.trim();
        } else if (status === 'Donor Rejected') {
            // Default remark if none provided
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
