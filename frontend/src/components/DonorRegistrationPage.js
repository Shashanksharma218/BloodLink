import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import formImg from "url:../assets/form-illustration.svg";

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
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const response = await fetch('http://localhost:5555/api/donors/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Registration failed. Please try again.');
            }

            console.log('Donor registered successfully:', data);
            navigate('/registration-success');

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
                                    placeholder="e.g., Shashank Sharma" 
                                    required 
                                    className="input-modern"
                                />
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
                                        placeholder="10-digit mobile number" 
                                        required 
                                        className="input-modern"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label htmlFor="email" className="block text-sm font-semibold text-gray-700">
                                        Email Address <span className="text-red-500">*</span>
                                    </label>
                                    <input 
                                        type="email" 
                                        id="email" 
                                        name="email" 
                                        value={formData.email || ''} 
                                        onChange={handleChange} 
                                        placeholder="you@example.com" 
                                        required 
                                        className="input-modern"
                                    />
                                </div>
                            </div>

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
                                        min="18" 
                                        max="65"
                                        placeholder="e.g., 25" 
                                        required 
                                        className="input-modern"
                                    />
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
                                        required 
                                        className="input-modern"
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
                                        placeholder="e.g., Una, Himachal Pradesh" 
                                        required 
                                        className="input-modern"
                                    />
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
                                    disabled={isLoading} 
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
                                        'Join as a Lifesaver'
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