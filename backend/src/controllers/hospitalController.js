const Hospital = require('../models/Hospital');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Hospital Login
const loginHospital = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required.' });
  }

  try {
    const hospital = await Hospital.findOne({ email });

    if (!hospital) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const isPasswordValid = await bcrypt.compare(password, hospital.password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { _id: hospital._id, email: hospital.email, type: 'hospital' },
      "bloodlink.iiitu.2025",
      { expiresIn: "7d" }
    );

    // Set token in HTTP-only cookie
    // For production (HTTPS): secure: true, sameSite: 'none' (required for cross-origin)
    // For development (HTTP): secure: false, sameSite: 'lax'
    // Check if production: NODE_ENV or if request is secure (HTTPS)
    const isProduction = process.env.NODE_ENV === 'production' || req.secure || req.headers['x-forwarded-proto'] === 'https';
    res.cookie('token', token, {
      httpOnly: true,
      secure: isProduction, // true for HTTPS (production), false for HTTP (development)
      sameSite: isProduction ? 'none' : 'lax', // 'none' required for cross-origin in production
      path: '/',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    // Return hospital data (without password)
    const hospitalData = {
      _id: hospital._id,
      name: hospital.name,
      email: hospital.email,
      phone: hospital.phone,
      address: hospital.address,
      license: hospital.license,
      type: 'hospital'
    };

    res.status(200).json(hospitalData);

  } catch (error) {
    console.error('Hospital login error:', error);
    res.status(500).json({ message: 'Server error during hospital login.' });
  }
};

// Get Hospital Profile
const getHospitalProfile = async (req, res) => {
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

    const hospital = await Hospital.findById(decoded._id).select('-password');
    
    if (!hospital) {
      return res.status(404).json({ message: 'Hospital not found.' });
    }

    res.status(200).json(hospital);

  } catch (error) {
    console.error('Error fetching hospital profile:', error);
    res.status(500).json({ message: 'Server error while fetching hospital profile.' });
  }
};

// Update Hospital Profile
const updateHospitalProfile = async (req, res) => {
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

    const { name, phone, address, license } = req.body;

    const hospital = await Hospital.findById(decoded._id);
    
    if (!hospital) {
      return res.status(404).json({ message: 'Hospital not found.' });
    }

    // Update fields
    if (name) hospital.name = name;
    if (phone) hospital.phone = phone;
    if (address) hospital.address = address;
    if (license) hospital.license = license;

    await hospital.save();

    // Return updated hospital data (without password)
    const hospitalData = {
      _id: hospital._id,
      name: hospital.name,
      email: hospital.email,
      phone: hospital.phone,
      address: hospital.address,
      license: hospital.license,
      type: 'hospital'
    };

    res.status(200).json(hospitalData);

  } catch (error) {
    console.error('Error updating hospital profile:', error);
    res.status(500).json({ message: 'Server error while updating hospital profile.' });
  }
};

// Change Hospital Password
const changeHospitalPassword = async (req, res) => {
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

    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Current password and new password are required.' });
    }

    const hospital = await Hospital.findById(decoded._id);
    
    if (!hospital) {
      return res.status(404).json({ message: 'Hospital not found.' });
    }

    // Verify current password
    const isPasswordValid = await bcrypt.compare(currentPassword, hospital.password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Current password is incorrect.' });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    hospital.password = hashedPassword;
    
    await hospital.save();

    res.status(200).json({ message: 'Password changed successfully.' });

  } catch (error) {
    console.error('Error changing hospital password:', error);
    res.status(500).json({ message: 'Server error while changing password.' });
  }
};

module.exports = {
  loginHospital,
  getHospitalProfile,
  updateHospitalProfile,
  changeHospitalPassword
};

