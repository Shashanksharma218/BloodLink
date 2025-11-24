const mongoose = require("mongoose");

const bloodRequestSchema = new mongoose.Schema({
    // Removed 'hospital' field as requested, assuming authentication handles user type.
    
    donor: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Donor' 
    },
    
    bloodGroup: {
        type: String,
        required: true,
        enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
    },
    
    urgency: {
        type: String,
        required: true,
        enum: ['Medium', 'High', 'Urgent']
    },
    
    // NEW: Deadline set by the hospital
    deadline: {
        type: Date,
        required: true,
        validate: {
            validator: function(v) {
                // Ensure the deadline is in the future
                return v > Date.now();
            },
            message: props => `${props.value} must be a future date.`
        }
    },
    
    note: {
        type: String,
        trim: true,
    },
    
    status: {
        type: String,
        required: true,
        // Renamed status options for better readability and clarity in the workflow:
        enum: [
            "Pending", 
            "Donor Accepted", // Replaces "Accepted" (Donor has accepted the request)
            "Donor Rejected", // Replaces "Rejected_Donor"
            "Visit Scheduled",// Replaces "Accepted_Visit" (Hospital is now expecting the donor)
            "Donation Rejected", // Replaces "Rejected_Unfit" (Hospital/Screening rejection)
            "Donation Completed",  // Replaces "Completed"
            "Expired" // Auto-marked when deadline passes while still Pending
        ],
        default: "Pending"
    },
    
    // Field for remarks to capture specific reasons for status changes
    remarks: {
        type: String,
        trim: true,
        default: ''
    },
    
    // Certificate ID for completed donations
    certificateId: {
        type: String,
        trim: true
    }
}, {
    timestamps: true 
});

const BloodRequest = mongoose.model("BloodRequest", bloodRequestSchema);

module.exports = BloodRequest;
