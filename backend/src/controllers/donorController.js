require('dotenv').config();
const { Resend } = require('resend');
const Donor = require('../models/Donor');
const jwt = require('jsonwebtoken');

// Initialize Resend client
if (!process.env.RESEND_API_KEY) {
  console.error('❌ RESEND_API_KEY missing in .env');
  process.exit(1);
}

const resend = new Resend(process.env.RESEND_API_KEY);

// Complete registration after OTP verification
const registerDonor = async (req, res) => {
  const { fullName, contactNumber, email, bloodGroup, age, gender, location, otp } = req.body;

  if (!fullName || !contactNumber || !email || !bloodGroup || !age || !location || !otp) {
    return res.status(400).json({ message: 'Please fill in all required fields including OTP.' });
  }

  try {
    const donor = await Donor.findOne({ email });

    if (!donor) {
      return res.status(404).json({ message: 'Email not verified. Please verify your email first.' });
    }

    // Verify OTP first
    if (donor.otp !== otp) {
      return res.status(400).json({ message: 'Invalid OTP. Please enter the correct verification code.' });
    }

    if (donor.otpExpires < Date.now()) {
      return res.status(400).json({ message: 'OTP has expired. Please verify your email again.' });
    }

    // Check if contact number is already used by another donor
    const contactExists = await Donor.findOne({ contactNumber });
    if (contactExists && contactExists.email !== email && !contactExists.otp) {
      return res.status(409).json({ message: 'This contact number is already registered with another account.' });
    }

    // Update donor with complete information
    donor.fullName = fullName;
    donor.contactNumber = contactNumber;
    donor.bloodGroup = bloodGroup;
    donor.age = age;
    donor.gender = gender;
    donor.location = location;
    donor.otp = undefined;
    donor.otpExpires = undefined;

    await donor.save();

    // Auto-login: Generate token and set cookie
    const token = jwt.sign({ _id: donor._id }, "bloodlink.iiitu.2025");
    
    // For production (HTTPS): secure: true, sameSite: 'none' (required for cross-origin)
    // For development (HTTP): secure: false, sameSite: 'lax'
    // Check if production: NODE_ENV or if request is secure (HTTPS)
    const isProduction = process.env.NODE_ENV === 'production' || req.secure || req.headers['x-forwarded-proto'] === 'https';
    res.cookie("token", token, {
      httpOnly: true,
      secure: isProduction, // true for HTTPS (production), false for HTTP (development)
      sameSite: isProduction ? 'none' : 'lax', // 'none' required for cross-origin in production
      path: '/',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    // Return donor data for frontend
    res.status(200).json({
      message: 'Registration successful!',
      donor: donor
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error during donor registration.', error: error.message });
  }
};


const sendOtpEmailService = async (email, otp) => {
  try {
    await resend.emails.send({
      from: 'BloodLink <onboarding@resend.dev>', // Update this with your verified domain
      to: email,
      subject: 'Your OTP Code',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #6B1F1F;">BloodLink Verification Code</h2>
          <p>Your verification code is:</p>
          <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; text-align: center; margin: 20px 0;">
            <h1 style="color: #6B1F1F; margin: 0; font-size: 32px; letter-spacing: 5px;">${otp}</h1>
          </div>
          <p style="color: #666; font-size: 14px;">This code will expire in 10 minutes.</p>
          <p style="color: #666; font-size: 12px; margin-top: 20px;">If you didn't request this code, please ignore this email.</p>
        </div>
      `
    });
    console.log(`✅ OTP email sent to ${email}`);
  } catch (error) {
    console.error('❌ Error sending OTP email:', error);
    throw error;
  }
};

const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString(); 
};

// New endpoint: Send OTP for email verification during registration (only requires email)
const sendRegistrationOTP = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: 'Email is required.' });
  }

  try {
    // Check if email is already registered and verified
    const existingDonor = await Donor.findOne({ email });
    if (existingDonor && !existingDonor.otp) {
      return res.status(409).json({ message: 'This email is already registered.' });
    }

    // Generate OTP
    const otp = generateOTP();
    const otpExpires = Date.now() + 600000; // 10 minutes

    if (existingDonor) {
      // Update existing unverified registration with new OTP
      existingDonor.otp = otp;
      existingDonor.otpExpires = otpExpires;
      await existingDonor.save();
    } else {
      // Create temporary donor record with placeholder values (will be updated during final registration)
      // Generate unique temporary contact number to avoid conflicts
      const tempContactNumber = `000000${Date.now().toString().slice(-4)}`; // Last 4 digits of timestamp
      
      const tempDonor = new Donor({
        email,
        otp,
        otpExpires,
        fullName: 'Temporary', // Will be updated during final registration
        contactNumber: tempContactNumber, // Unique temporary value
        bloodGroup: 'O+', // Will be updated during final registration
        age: 18, // Will be updated during final registration
        location: 'Temporary' // Will be updated during final registration
      });
      await tempDonor.save();
    }

    // Send OTP to email
    await sendOtpEmailService(email, otp);

    res.status(200).json({ 
      message: 'Verification code sent successfully to your email.',
      email: email 
    });

  } catch (error) {
    console.error('Error in sendRegistrationOTP:', error);
    res.status(500).json({ message: 'Server error while sending verification code.' });
  }
};

// Verify OTP during registration (before completing registration)
const verifyRegistrationOTP = async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({ message: 'Email and OTP are required.' });
  }

  try {
    const donor = await Donor.findOne({ email });

    if (!donor) {
      return res.status(404).json({ message: 'Email not found. Please verify your email first.' });
    }

    if (donor.otp !== otp) {
      return res.status(400).json({ message: 'Invalid OTP. Please check and try again.' });
    }

    if (donor.otpExpires < Date.now()) {
      return res.status(400).json({ message: 'OTP has expired. Please request a new verification code.' });
    }

    // OTP is valid - return success (OTP will be verified again during final registration)
    res.status(200).json({ 
      message: 'Email verified successfully!',
      verified: true 
    });

  } catch (error) {
    console.error('Error in verifyRegistrationOTP:', error);
    res.status(500).json({ message: 'Server error during OTP verification.' });
  }
};

const sendOTP = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: 'Email id is required.' });
  }

  try {
    const donor = await Donor.findOne({ email });

    if (!donor) {
      return res.status(404).json({ message: 'This email is not registered.' });
    }

    const otp = generateOTP();
    donor.otp = otp;
    donor.otpExpires = Date.now() + 600000;

    await donor.save();

    await sendOtpEmailService(email, otp);

    res.status(200).json({ message: 'OTP sent successfully to your email.' });

  } catch (error) {
    console.error('Error in sendOTP:', error);
    res.status(500).json({ message: 'Server error while sending OTP.' });
  }
};

const loginDonor = async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({ message: 'Email and OTP are required.' });
  }

  try {
    const donor = await Donor.findOne({ email });

    if (!donor) {
      return res.status(404).json({ message: 'No donor found with this email id.' });
    }

    if (donor.otp !== otp) {
      return res.status(400).json({ message: 'Invalid OTP. Please try again.' });
    }

    if (donor.otpExpires < Date.now()) {
      return res.status(400).json({ message: 'OTP has expired. Please request a new one.' });
    }

    donor.otp = undefined;
    donor.otpExpires = undefined;
    await donor.save();

    const token = jwt.sign({ _id: donor._id }, "bloodlink.iiitu.2025");
    
    // For production (HTTPS): secure: true, sameSite: 'none' (required for cross-origin)
    // For development (HTTP): secure: false, sameSite: 'lax'
    // Check if production: NODE_ENV or if request is secure (HTTPS)
    const isProduction = process.env.NODE_ENV === 'production' || req.secure || req.headers['x-forwarded-proto'] === 'https';
    res.cookie("token", token, {
      httpOnly: true,
      secure: isProduction, // true for HTTPS (production), false for HTTP (development)
      sameSite: isProduction ? 'none' : 'lax', // 'none' required for cross-origin in production
      path: '/',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    // Return the full donor object on successful login.
    res.status(200).json(donor);

  } catch (error) {
    console.error('Error in loginDonor:', error);
    res.status(500).json({ message: 'Server error during login.' });
  }
};

const getAllDonors = async (req, res) => {
  try{
    const allDonors = await Donor.find({});
    res.status(200).json(allDonors);
  } catch (error) {
    console.error('Error fetching all donors:', error);
    res.status(500).json({ message: 'Server error while fetching donors.' });
  }
}


const getAvailableDonors = async (req, res) => {
  try {
    const availableDonors = await Donor.find({ isAvailable: true });
    res.status(200).json(availableDonors);
  } catch (error) {
    console.error('Error fetching available donors:', error);
    res.status(500).json({ message: 'Server error while fetching donors.' });
  }
};

const updateAvailability = async (req, res) => {
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
    
    // --- FIX ---
    // The decoded token from jwt.sign contains { _id: donor._id }.
    // So you should use decoded._id, not decoded.id
    const donorId = decoded._id;
    const { isAvailable } = req.body;

    if (typeof isAvailable !== 'boolean') {
      return res.status(400).json({ message: 'Invalid value for isAvailable. Expected boolean.' });
    }

    const updatedDonor = await Donor.findByIdAndUpdate(
      donorId,
      { isAvailable },
      { new: true }
    );

    if (!updatedDonor) {
      return res.status(404).json({ message: 'Donor not found.' });
    }

    return res.status(200).json(updatedDonor);

  } catch (error) {
    console.error('Error in updateAvailability:', error);
    return res.status(500).json({ message: 'Server error while updating availability.', error: error.message });
  }
};


const getDonorById = async (req, res) => {
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

    // --- FIX ---
    // Same fix as above, use decoded._id
    const donorId = decoded._id;
    if (!donorId) {
      return res.status(400).json({ message: 'Invalid token payload.' });
    }

    const donor = await Donor.findById(donorId);
    if (!donor) {
      return res.status(404).json({ message: 'Donor not found.' });
    }
    
    // --- CHANGE ---
    // Previously, you returned { message: '...', donor }.
    // The frontend's refresh function expects the donor object directly.
    return res.status(200).json(donor);

  } catch (error) {
    console.error('Error fetching donor by ID:', error);
    return res.status(500).json({ message: 'Server error while fetching donor data.', error: error.message });
  }
};

// Get donor statistics
const getDonorStats = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Verify authentication
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

    // Verify the donor is requesting their own stats
    if (decoded._id.toString() !== id) {
      return res.status(403).json({ message: 'Unauthorized access.' });
    }

    const BloodRequest = require('../models/BloodRequest');
    
    // Count completed donations
    const totalDonations = await BloodRequest.countDocuments({
      donor: id,
      status: 'Donation Completed'
    });

    // Count certificates (requests with certificateId)
    const certificatesCount = await BloodRequest.countDocuments({
      donor: id,
      certificateId: { $exists: true, $ne: null }
    });

    // Get last donation date
    const lastDonation = await BloodRequest.findOne({
      donor: id,
      status: 'Donation Completed'
    }).sort({ updatedAt: -1 }).select('updatedAt');

    const lastDonationDate = lastDonation?.updatedAt || null;

    // Calculate next eligible date (90 days after last donation in India)
    let nextEligibleDate = null;
    if (lastDonationDate) {
      const nextDate = new Date(lastDonationDate);
      nextDate.setDate(nextDate.getDate() + 90);
      nextEligibleDate = nextDate;
    }

    // Compute badges based on donation count
    const badges = [];
    if (totalDonations >= 1) {
      badges.push({
        id: 'bronze',
        title: 'Bronze Donor',
        awardedAt: lastDonationDate || new Date()
      });
    }
    if (totalDonations >= 5) {
      badges.push({
        id: 'silver',
        title: 'Silver Donor',
        awardedAt: lastDonationDate || new Date()
      });
    }
    if (totalDonations >= 10) {
      badges.push({
        id: 'gold',
        title: 'Gold Donor',
        awardedAt: lastDonationDate || new Date()
      });
    }

    res.status(200).json({
      totalDonations,
      certificatesCount,
      lastDonationDate,
      nextEligibleDate,
      badges
    });

  } catch (error) {
    console.error('Error fetching donor stats:', error);
    res.status(500).json({ message: 'Server error while fetching donor statistics.', error: error.message });
  }
};

// POST /api/donors/:id/health
const postHealthLog = async (req, res) => {
  try {
    const { id } = req.params;
    const { date, hemoglobin, weight, notes } = req.body;

    // Auth check
    const token = req.cookies?.token;
    if (!token) return res.status(401).json({ message: 'Authentication token missing.' });
    let decoded;
    try {
      decoded = jwt.verify(token, "bloodlink.iiitu.2025");
    } catch (err) {
      return res.status(401).json({ message: 'Invalid or expired token.' });
    }
    if (decoded._id.toString() !== id) {
      return res.status(403).json({ message: 'Unauthorized access.' });
    }

    // Validate inputs
    const hb = Number(hemoglobin);
    const wt = Number(weight);
    if (Number.isNaN(hb) || hb < 0 || hb > 25) {
      return res.status(400).json({ message: 'Hemoglobin must be between 0 and 25 g/dL.' });
    }
    if (Number.isNaN(wt) || wt < 0 || wt > 300) {
      return res.status(400).json({ message: 'Weight must be between 0 and 300 kg.' });
    }

    const HealthLog = require('../models/HealthLog');
    const payload = {
      donor: id,
      date: date ? new Date(date) : new Date(),
      hemoglobin: hb,
      weight: wt,
      notes: (notes || '').trim()
    };

    const saved = await new HealthLog(payload).save();
    res.status(201).json(saved);
  } catch (error) {
    console.error('Error saving health log:', error);
    res.status(500).json({ message: 'Server error while saving health log.', error: error.message });
  }
};

// GET /api/donors/:id/health?limit=1
const getHealthLogs = async (req, res) => {
  try {
    const { id } = req.params;
    const limit = Math.max(1, Math.min(parseInt(req.query.limit || '1', 10), 50));

    // Auth check
    const token = req.cookies?.token;
    if (!token) return res.status(401).json({ message: 'Authentication token missing.' });
    let decoded;
    try {
      decoded = jwt.verify(token, "bloodlink.iiitu.2025");
    } catch (err) {
      return res.status(401).json({ message: 'Invalid or expired token.' });
    }
    if (decoded._id.toString() !== id) {
      return res.status(403).json({ message: 'Unauthorized access.' });
    }

    const HealthLog = require('../models/HealthLog');
    const logs = await HealthLog.find({ donor: id })
      .sort({ date: -1, createdAt: -1 })
      .limit(limit);

    res.status(200).json({ logs });
  } catch (error) {
    console.error('Error fetching health logs:', error);
    res.status(500).json({ message: 'Server error while fetching health logs.', error: error.message });
  }
};


module.exports = {
  registerDonor,
  sendRegistrationOTP,
  verifyRegistrationOTP,
  sendOTP,
  loginDonor,
  getAvailableDonors,
  updateAvailability,
  getDonorById,
  getAllDonors,
  getDonorStats,
  postHealthLog,
  getHealthLogs
};
