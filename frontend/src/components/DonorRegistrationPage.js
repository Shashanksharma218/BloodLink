import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import formImg from "url:../assets/form-illustration.svg";
import API_BASE_URL from '../config/api';

function DonorRegistrationPage() {
    const [formData, setFormData] = useState({
        fullName: '',
        contactNumber: '',
        email: '',
        bloodGroup: '',
        age: '',
        gender: '',
        location: '',
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [fieldErrors, setFieldErrors] = useState({});
    const [touchedFields, setTouchedFields] = useState({});
    const [otpSent, setOtpSent] = useState(false);
    const [otp, setOtp] = useState('');
    const [verifyingEmail, setVerifyingEmail] = useState(false);
    const [emailEditable, setEmailEditable] = useState(true);
    const [otpVerified, setOtpVerified] = useState(false);
    const navigate = useNavigate();
    const { login } = useAuth();

    // Validation functions
    const validateFullName = (name) => {
        if (!name.trim()) {
            return 'Full name is required';
        }
        if (name.trim().length < 2) {
            return 'Full name must be at least 2 characters';
        }
        if (!/^[a-zA-Z\s]+$/.test(name.trim())) {
            return 'Full name can only contain letters and spaces';
        }
        return '';
    };

    const validateContactNumber = (contact) => {
        if (!contact.trim()) {
            return 'Contact number is required';
        }
        const phoneRegex = /^[6-9]\d{9}$/; // Indian mobile number format (starts with 6-9, then 9 more digits)
        if (!phoneRegex.test(contact.trim())) {
            return 'Please enter a valid 10-digit Indian mobile number';
        }
        return '';
    };

    const validateEmail = (email) => {
        if (!email.trim()) {
            return 'Email address is required';
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email.trim())) {
            return 'Please enter a valid email address';
        }
        return '';
    };

    const validateAge = (age) => {
        if (!age.trim()) {
            return 'Age is required';
        }
        const ageNum = parseInt(age);
        if (isNaN(ageNum)) {
            return 'Age must be a valid number';
        }
        if (ageNum < 18) {
            return 'You must be at least 18 years old to donate blood';
        }
        if (ageNum > 65) {
            return 'Maximum age for blood donation is 65 years';
        }
        return '';
    };

    const validateBloodGroup = (bloodGroup) => {
        if (!bloodGroup) {
            return 'Blood group is required';
        }
        return '';
    };

    const validateLocation = (location) => {
        if (!location.trim()) {
            return 'Location is required';
        }
        if (location.trim().length < 2) {
            return 'Location must be at least 2 characters';
        }
        return '';
    };

    const validateField = (name, value) => {
        switch (name) {
            case 'fullName':
                return validateFullName(value);
            case 'contactNumber':
                return validateContactNumber(value);
            case 'email':
                return validateEmail(value);
            case 'age':
                return validateAge(value);
            case 'bloodGroup':
                return validateBloodGroup(value);
            case 'location':
                return validateLocation(value);
            default:
                return '';
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: value
        }));

        // Clear error for this field when user starts typing
        if (fieldErrors[name]) {
            setFieldErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }

        // Validate in real-time if field has been touched
        if (touchedFields[name]) {
            const error = validateField(name, value);
            if (error) {
                setFieldErrors(prev => ({ ...prev, [name]: error }));
            } else {
                setFieldErrors(prev => {
                    const newErrors = { ...prev };
                    delete newErrors[name];
                    return newErrors;
                });
            }
        }
    };

    const handleBlur = (e) => {
        const { name, value } = e.target;
        setTouchedFields(prev => ({ ...prev, [name]: true }));
        
        const error = validateField(name, value);
        if (error) {
            setFieldErrors(prev => ({ ...prev, [name]: error }));
        } else {
            setFieldErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }
    };

    const validateAllFields = () => {
        const errors = {};
        let isValid = true;

        Object.keys(formData).forEach(key => {
            const error = validateField(key, formData[key]);
            if (error) {
                errors[key] = error;
                isValid = false;
            }
        });

        setFieldErrors(errors);
        
        // Mark all fields as touched
        const allTouched = {};
        Object.keys(formData).forEach(key => {
            allTouched[key] = true;
        });
        setTouchedFields(allTouched);

        return isValid;
    };

    const handleVerifyEmail = async () => {
        // Validate email first
        const emailError = validateEmail(formData.email);
        if (emailError) {
            setFieldErrors(prev => ({ ...prev, email: emailError }));
            return;
        }

        setVerifyingEmail(true);
        setError('');

        try {
            // Send OTP for email verification (only requires email)
            const response = await fetch(`${API_BASE_URL}/api/donors/send-registration-otp`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: formData.email,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to send verification code. Please try again.');
            }

            setOtpSent(true);
            setEmailEditable(false);
            setError('');

        } catch (err) {
            console.error('An error occurred:', err);
            setError(err.message);
        } finally {
            setVerifyingEmail(false);
        }
    };

    const handleEditEmail = () => {
        setEmailEditable(true);
        setOtpSent(false);
        setOtp('');
        setOtpVerified(false);
        setFieldErrors(prev => {
            const newErrors = { ...prev };
            delete newErrors.email;
            return newErrors;
        });
    };

    const handleVerifyOTP = async () => {
        if (!otp || otp.length !== 6) {
            setError('Please enter a valid 6-digit OTP');
            return;
        }

        setVerifyingEmail(true);
        setError('');

        try {
            // Verify OTP with the backend
            const response = await fetch(`${API_BASE_URL}/api/donors/verify-registration-otp`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: formData.email,
                    otp: otp.trim()
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Invalid OTP. Please check and try again.');
            }

            setOtpVerified(true);
            setError('');

        } catch (err) {
            console.error('An error occurred:', err);
            setError(err.message);
        } finally {
            setVerifyingEmail(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // Validate all fields before submission
        if (!validateAllFields()) {
            setError('Please fix all errors before submitting');
            return;
        }

        // Check if email is verified and OTP is verified
        if (!otpSent || !otpVerified) {
            setError('Please verify your email and OTP first');
            return;
        }

        // Validate OTP
        if (!otp || otp.length !== 6) {
            setError('Please enter a valid 6-digit OTP');
            return;
        }

        setIsLoading(true);

        try {
            // Complete registration with all fields and OTP
            const response = await fetch(`${API_BASE_URL}/api/donors/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({
                    fullName: formData.fullName,
                    contactNumber: formData.contactNumber,
                    email: formData.email,
                    bloodGroup: formData.bloodGroup,
                    age: formData.age,
                    gender: formData.gender,
                    location: formData.location,
                    otp: otp.trim()
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Registration failed. Please try again.');
            }

            // Auto-login the user
            login({ type: 'donor', ...data.donor });
            
            // Redirect to donor dashboard
            navigate('/donor-dashboard');

        } catch (err) {
            console.error('An error occurred:', err);
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <main className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-50 py-6 md:py-8 lg:py-10">
            <div className="container mx-auto px-4 sm:px-6 md:px-8 lg:px-20">
                <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-start max-w-7xl mx-auto">
                    {/* Form Section */}
                    <div className="card-modern p-6 md:p-8 animate-fade-in-left">
                        <div className="text-center mb-6">
                            <div className="w-12 h-12 md:w-14 md:h-14 bg-gradient-to-r from-red-500 to-red-600 rounded-full flex items-center justify-center mx-auto mb-3">
                                <svg className="w-6 h-6 md:w-7 md:h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                            </div>
                            <h2 className="text-2xl md:text-3xl font-black text-gray-900 mb-2">Become a Lifesaver</h2>
                            <p className="text-sm md:text-base text-gray-600">Join our community of heroes. Fill out the form below to start saving lives.</p>
                        </div>
                        
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Full Name */}
                            <div className="space-y-1.5">
                                <label htmlFor="fullName" className="block text-sm font-semibold text-gray-700">
                                    Full Name <span className="text-red-500">*</span>
                                </label>
                                <input 
                                    type="text" 
                                    id="fullName" 
                                    name="fullName" 
                                    value={formData.fullName || ''} 
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    placeholder="e.g., Shashank Sharma" 
                                    required 
                                    className={`input-modern ${fieldErrors.fullName ? 'border-red-500 focus:ring-red-500' : ''}`}
                                />
                                {fieldErrors.fullName && (
                                    <p className="text-red-600 text-xs flex items-center gap-1">
                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                        </svg>
                                        {fieldErrors.fullName}
                                    </p>
                                )}
                            </div>

                            {/* Contact & Email */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label htmlFor="contactNumber" className="block text-sm font-semibold text-gray-700">
                                        Contact Number <span className="text-red-500">*</span>
                                    </label>
                                    <input 
                                        type="tel" 
                                        id="contactNumber" 
                                        name="contactNumber" 
                                        value={formData.contactNumber || ''} 
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        placeholder="10-digit mobile number" 
                                        maxLength="10"
                                        required 
                                        className={`input-modern ${fieldErrors.contactNumber ? 'border-red-500 focus:ring-red-500' : ''}`}
                                    />
                                    {fieldErrors.contactNumber && (
                                        <p className="text-red-600 text-xs flex items-center gap-1">
                                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                            </svg>
                                            {fieldErrors.contactNumber}
                                        </p>
                                    )}
                                </div>
                                <div className="space-y-1.5">
                                    <label htmlFor="email" className="block text-sm font-semibold text-gray-700">
                                        Email Address <span className="text-red-500">*</span>
                                    </label>
                                    <div className="flex gap-2">
                                        <div className="relative flex-1">
                                            <input 
                                                type="email" 
                                                id="email" 
                                                name="email" 
                                                value={formData.email || ''} 
                                                onChange={(e) => {
                                                    handleChange(e);
                                                    if (otpSent) {
                                                        setOtpSent(false);
                                                        setOtpVerified(false);
                                                        setOtp('');
                                                    }
                                                }}
                                                onBlur={handleBlur}
                                                placeholder="you@example.com" 
                                                required 
                                                disabled={!emailEditable}
                                                className={`input-modern w-full pr-10 ${fieldErrors.email ? 'border-red-500 focus:ring-red-500' : ''} ${!emailEditable ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                                            />
                                            {!emailEditable && (
                                                <button
                                                    type="button"
                                                    onClick={handleEditEmail}
                                                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded-lg transition-all"
                                                    title="Edit Email"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                    </svg>
                                                </button>
                                            )}
                                        </div>
                                        <button
                                            type="button"
                                            onClick={handleVerifyEmail}
                                            disabled={verifyingEmail || !emailEditable || !formData.email || fieldErrors.email}
                                            className="px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap text-sm"
                                        >
                                            {verifyingEmail ? (
                                                <div className="flex items-center gap-2">
                                                    <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                    </svg>
                                                    Sending...
                                                </div>
                                            ) : (
                                                'Verify'
                                            )}
                                        </button>
                                    </div>
                                    {fieldErrors.email && (
                                        <p className="text-red-600 text-xs flex items-center gap-1">
                                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                            </svg>
                                            {fieldErrors.email}
                                        </p>
                                    )}
                                    {otpSent && !otpVerified && (
                                        <p className="text-green-600 text-xs flex items-center gap-1">
                                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                            </svg>
                                            Verification code sent! Check your email.
                                        </p>
                                    )}
                                    {otpVerified && (
                                        <p className="text-green-600 text-xs flex items-center gap-1">
                                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                            </svg>
                                            Email verified successfully!
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* OTP Field - Show after email verification code is sent */}
                            {otpSent && (
                                <div className="space-y-1.5">
                                    <label htmlFor="otp" className="block text-sm font-semibold text-gray-700">
                                        Enter Verification Code <span className="text-red-500">*</span>
                                    </label>
                                    <div className="flex gap-2">
                                        <input 
                                            type="text" 
                                            id="otp" 
                                            name="otp" 
                                            value={otp}
                                            onChange={(e) => {
                                                const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                                                setOtp(value);
                                                if (error) setError('');
                                                if (otpVerified) setOtpVerified(false);
                                            }}
                                            placeholder="000000" 
                                            required 
                                            maxLength={6}
                                            disabled={otpVerified}
                                            className={`input-modern flex-1 text-center text-lg font-semibold tracking-[0.3em] placeholder:tracking-[0.3em] placeholder:text-gray-300 ${otpVerified ? 'bg-green-50 border-green-500' : ''}`}
                                            autoComplete="off"
                                        />
                                        <button
                                            type="button"
                                            onClick={handleVerifyOTP}
                                            disabled={verifyingEmail || otpVerified || otp.length !== 6}
                                            className="px-4 py-2.5 bg-gradient-to-r from-green-600 to-green-700 text-white font-semibold rounded-xl hover:from-green-700 hover:to-green-800 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap text-sm"
                                        >
                                            {verifyingEmail ? (
                                                <div className="flex items-center gap-2">
                                                    <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                    </svg>
                                                    Verifying...
                                                </div>
                                            ) : otpVerified ? (
                                                <div className="flex items-center gap-1">
                                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                    </svg>
                                                    Verified
                                                </div>
                                            ) : (
                                                'Verify'
                                            )}
                                        </button>
                                    </div>
                                    <p className="text-xs text-gray-500">Enter the 6-digit code sent to {formData.email}</p>
                                </div>
                            )}

                            {/* Age & Blood Group */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label htmlFor="age" className="block text-sm font-semibold text-gray-700">
                                        Age <span className="text-red-500">*</span>
                                    </label>
                                    <input 
                                        type="number" 
                                        id="age" 
                                        name="age" 
                                        value={formData.age || ''} 
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        min="18" 
                                        max="65"
                                        placeholder="e.g., 25" 
                                        required 
                                        className={`input-modern ${fieldErrors.age ? 'border-red-500 focus:ring-red-500' : ''}`}
                                    />
                                    {fieldErrors.age && (
                                        <p className="text-red-600 text-xs flex items-center gap-1">
                                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                            </svg>
                                            {fieldErrors.age}
                                        </p>
                                    )}
                                </div>
                                <div className="space-y-1.5">
                                    <label htmlFor="bloodGroup" className="block text-sm font-semibold text-gray-700">
                                        Blood Group <span className="text-red-500">*</span>
                                    </label>
                                    <select 
                                        id="bloodGroup" 
                                        name="bloodGroup" 
                                        value={formData.bloodGroup || ''} 
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        required 
                                        className={`input-modern ${fieldErrors.bloodGroup ? 'border-red-500 focus:ring-red-500' : ''}`}
                                    >
                                        <option value="">Select Blood Group</option>
                                        <option value="A+">A+</option>
                                        <option value="A-">A-</option>
                                        <option value="B+">B+</option>
                                        <option value="B-">B-</option>
                                        <option value="AB+">AB+</option>
                                        <option value="AB-">AB-</option>
                                        <option value="O+">O+</option>
                                        <option value="O-">O-</option>
                                    </select>
                                    {fieldErrors.bloodGroup && (
                                        <p className="text-red-600 text-xs flex items-center gap-1">
                                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                            </svg>
                                            {fieldErrors.bloodGroup}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Location & Gender */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label htmlFor="location" className="block text-sm font-semibold text-gray-700">
                                        Location <span className="text-red-500">*</span>
                                    </label>
                                    <input 
                                        type="text" 
                                        id="location" 
                                        name="location" 
                                        value={formData.location || ''} 
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        placeholder="e.g., Una, Himachal Pradesh" 
                                        required 
                                        className={`input-modern ${fieldErrors.location ? 'border-red-500 focus:ring-red-500' : ''}`}
                                    />
                                    {fieldErrors.location && (
                                        <p className="text-red-600 text-xs flex items-center gap-1">
                                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                            </svg>
                                            {fieldErrors.location}
                                        </p>
                                    )}
                                </div>
                                <div className="space-y-1.5">
                                    <label htmlFor="gender" className="block text-sm font-semibold text-gray-700">
                                        Gender
                                    </label>
                                    <select 
                                        id="gender" 
                                        name="gender" 
                                        value={formData.gender || ''} 
                                        onChange={handleChange}
                                        className="input-modern"
                                    >
                                        <option value="">Select Gender</option>
                                        <option value="Male">Male</option>
                                        <option value="Female">Female</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                            </div>
                            
                            {/* Error Message Display */}
                            {error && (
                                <div className="bg-gradient-to-r from-red-50 to-red-100 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded-lg animate-fade-in-up">
                                    <div className="flex items-center">
                                        <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                        </svg>
                                        <p className="font-semibold text-sm">{error}</p>
                                    </div>
                                </div>
                            )}

                            {/* Submit Button */}
                            <div className="pt-2">
                                <button 
                                    type="submit" 
                                    disabled={isLoading || Object.keys(fieldErrors).length > 0 || !otpVerified} 
                                    className="w-full btn-primary text-base md:text-lg py-3 md:py-3.5 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isLoading ? (
                                        <div className="flex items-center justify-center">
                                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Registering...
                                        </div>
                                    ) : (
                                        'Complete Registration'
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Illustration Section */}
                    <div className="hidden lg:flex flex-col items-center text-center animate-fade-in-right sticky top-8">
                        <div className="relative mb-6">
                            <img src={formImg} alt="Donor Registration Illustration" className="w-full max-w-md animate-float" />
                            <div className="absolute -top-4 -right-4 w-8 h-8 bg-red-500 rounded-full animate-pulse"></div>
                            <div className="absolute -bottom-4 -left-4 w-6 h-6 bg-red-400 rounded-full animate-pulse" style={{animationDelay: '1s'}}></div>
                        </div>
                        
                        <div className="space-y-4">
                            <h3 className="text-2xl font-bold text-gray-900">Thank You for Your Courage!</h3>
                            <p className="text-sm text-gray-600 max-w-md">
                                Your registration is the first step towards saving lives. We appreciate your commitment to making a difference in our community.
                            </p>
                            
                            {/* Benefits List */}
                            <div className="space-y-3 text-left max-w-xs mx-auto">
                                <div className="flex items-center space-x-3">
                                    <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                                        <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                    </div>
                                    <span className="text-sm text-gray-600">Free health checkup</span>
                                </div>
                                <div className="flex items-center space-x-3">
                                    <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                                        <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                    </div>
                                    <span className="text-sm text-gray-600">Emergency notifications</span>
                                </div>
                                <div className="flex items-center space-x-3">
                                    <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                                        <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                    </div>
                                    <span className="text-sm text-gray-600">Community recognition</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}

export default DonorRegistrationPage;