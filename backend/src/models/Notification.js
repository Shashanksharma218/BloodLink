const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
    donor: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Donor',
        index: true
    },
    type: {
        type: String,
        required: true,
        enum: ['new_request', 'status_changed', 'certificate_issued', 'deadline_reminder']
    },
    requestId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'BloodRequest',
        required: function() {
            return this.type !== 'deadline_reminder';
        }
    },
    title: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    read: {
        type: Boolean,
        default: false,
        index: true
    }
}, {
    timestamps: true
});

// Compound index for efficient queries
notificationSchema.index({ donor: 1, read: 1, createdAt: -1 });

const Notification = mongoose.model("Notification", notificationSchema);

module.exports = Notification;

