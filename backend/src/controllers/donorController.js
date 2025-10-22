const nodemailer = require('nodemailer');
const Donor = require('../models/Donor');
const jwt = require('jsonwebtoken');

const registerDonor = async (req, res) => {
  const { fullName, contactNumber, email, bloodGroup, age, gender, location } = req.body;

  if (!fullName || !contactNumber || !email || !bloodGroup || !age || !location) {
    return res.status(400).json({ message: 'Please fill in all required fields.' });
  }

  try {
    const donorExists = await Donor.findOne({ $or: [{ email }, { contactNumber }] });

    if (donorExists) {
      return res.status(409).json({ message: 'A donor with this email or contact number already exists.' });
    }

    const donor = new Donor({
      fullName, contactNumber, email, bloodGroup, age, gender, location,
    });

    const createdDonor = await donor.save();
    res.status(201).json(createdDonor);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error during donor registration.', error: error.message });
  }
};

const sendOtpEmailService = async (email, otp) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'bloodlink.iiitu@gmail.com',
      pass: 'mdlroakccttmpfcn'
    }
  });

  const mailOptions = {
    from: 'bloodlink.iiitu@gmail.com',
    to: email,
    subject: 'Your OTP Code',
    text: `Your verification code is ${otp}`
  };

  await transporter.sendMail(mailOptions);

};

const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString(); 
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
    
    // Your cookie setup is correct for development.
    // httpOnly: true -> Client-side JS can't access it. Good for security.
    // secure: false -> Allows sending over HTTP. Required for localhost.
    // sameSite: 'lax' -> Good default.
    res.cookie("token", token, {
      httpOnly: true,
      secure: false,     
      sameSite: 'lax',   
      path: '/',
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


module.exports = {
  registerDonor,
  sendOTP,
  loginDonor,
  getAvailableDonors,
  updateAvailability,
  getDonorById,
  getAllDonors
};
