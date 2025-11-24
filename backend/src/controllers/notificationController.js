const Notification = require('../models/Notification');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

// Helper function to get authenticated donor ID
const getDonorId = (req) => {
    const token = req.cookies?.token;
    if (!token) return null;
    try {
        const decoded = jwt.verify(token, "bloodlink.iiitu.2025");
        return decoded._id;
    } catch {
        return null;
    }
};

// GET /api/notifications?since=ISO_TIMESTAMP
const getNotifications = async (req, res) => {
    try {
        const donorId = getDonorId(req);
        if (!donorId) {
            return res.status(401).json({ message: 'Authentication required.' });
        }

        const since = req.query.since;
        const query = { donor: donorId };
        
        if (since) {
            query.createdAt = { $gt: new Date(since) };
        }

        const notifications = await Notification.find(query)
            .sort({ createdAt: -1 })
            .limit(50)
            .populate('requestId', 'bloodGroup urgency status');

        // Transform to include id field
        const formatted = notifications.map(n => ({
            id: n._id.toString(),
            type: n.type,
            requestId: n.requestId?._id?.toString(),
            title: n.title,
            message: n.message,
            createdAt: n.createdAt,
            read: n.read
        }));

        res.status(200).json({ notifications: formatted });
    } catch (error) {
        console.error('Error fetching notifications:', error);
        res.status(500).json({ message: 'Server error while fetching notifications.' });
    }
};

// POST /api/notifications/mark-read
const markAsRead = async (req, res) => {
    try {
        const donorId = getDonorId(req);
        if (!donorId) {
            return res.status(401).json({ message: 'Authentication required.' });
        }

        const { ids } = req.body;
        if (!ids || !Array.isArray(ids)) {
            return res.status(400).json({ message: 'Please provide an array of notification IDs.' });
        }

        await Notification.updateMany(
            { _id: { $in: ids }, donor: donorId },
            { $set: { read: true } }
        );

        res.status(200).json({ ok: true });
    } catch (error) {
        console.error('Error marking notifications as read:', error);
        res.status(500).json({ message: 'Server error while updating notifications.' });
    }
};

// SSE endpoint: GET /api/notifications/stream
const streamNotifications = (req, res) => {
    const donorId = getDonorId(req);
    if (!donorId) {
        res.status(401).json({ message: 'Authentication required.' });
        return;
    }

    // Set SSE headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');

    // Send initial connection message
    res.write(`data: ${JSON.stringify({ type: 'connected' })}\n\n`);

    let lastCheck = new Date();

    // Poll every 3 seconds for new notifications
    const pollInterval = setInterval(async () => {
        try {
            const newNotifs = await Notification.find({
                donor: donorId,
                read: false,
                createdAt: { $gt: lastCheck }
            }).limit(10).sort({ createdAt: 1 });

            if (newNotifs.length > 0) {
                newNotifs.forEach(notif => {
                    res.write(`event: notification\ndata: ${JSON.stringify({
                        id: notif._id.toString(),
                        type: notif.type,
                        requestId: notif.requestId?.toString(),
                        title: notif.title,
                        message: notif.message,
                        createdAt: notif.createdAt,
                        read: notif.read
                    })}\n\n`);
                });
                lastCheck = newNotifs[newNotifs.length - 1].createdAt;
            }
        } catch (err) {
            console.error('Error in notification polling:', err);
        }
    }, 3000);

    // Send heartbeat every 30 seconds
    const heartbeat = setInterval(() => {
        res.write(`: heartbeat\n\n`);
    }, 30000);

    // Cleanup on client disconnect
    req.on('close', () => {
        clearInterval(pollInterval);
        clearInterval(heartbeat);
        res.end();
    });
};

// Helper function to create notifications (called from other controllers)
const createNotification = async (donorId, type, data) => {
    try {
        let title, message;

        switch (type) {
            case 'new_request':
                title = 'New Blood Request';
                message = `You have a new request for ${data.bloodGroup} blood. ${data.urgency} urgency.`;
                break;
            case 'status_changed':
                const statusMessages = {
                    'Visit Scheduled': 'Your blood request status has been updated to Visit Scheduled. The hospital is expecting your visit!',
                    'Donation Completed': 'Your donation has been completed! Your certificate is now available.',
                    'Donation Rejected': 'Your donation request has been rejected by the hospital.'
                };
                title = 'Request Status Updated';
                message = statusMessages[data.status] || `Your request status has been updated to ${data.status}.`;
                break;
            case 'certificate_issued':
                title = 'Certificate Available';
                message = `Your donation certificate is now available for download. Certificate ID: ${data.certificateId}`;
                break;
            case 'deadline_reminder':
                title = 'Deadline Reminder';
                message = `Your blood request deadline is approaching. Please respond soon.`;
                break;
            default:
                return;
        }

        const notification = new Notification({
            donor: donorId,
            type,
            requestId: data.requestId,
            title,
            message,
            read: false
        });

        await notification.save();
        return notification;
    } catch (error) {
        console.error('Error creating notification:', error);
        return null;
    }
};

module.exports = {
    getNotifications,
    markAsRead,
    streamNotifications,
    createNotification
};

