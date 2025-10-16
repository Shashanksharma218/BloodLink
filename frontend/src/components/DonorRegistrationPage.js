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
        <main className="bg-gray-50 py-12 md:py-20">
            <div className="container mx-auto px-6 md:px-20">
                <div className="grid md:grid-cols-2 gap-12 items-center">
                    <div className="bg-white p-8 md:p-12 rounded-xl shadow-lg">
                        <h2 className="text-3xl font-bold text-gray-800 mb-2">Become a Donor</h2>
                        <p className="text-gray-600 mb-8">Join our community of lifesavers. Fill out the form below.</p>
                        
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Full Name */}
                            <div>
                                <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">Full Name</label>
                                <input type="text" id="fullName" name="fullName" value={formData.fullName || ''} onChange={handleChange} placeholder="e.g., Shashank Sharma" required className="mt-1 block w-full px-4 py-2.5 border border-gray-300 rounded-lg"/>
                            </div>
                            {/* Contact & Email */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label htmlFor="contactNumber" className="block text-sm font-medium text-gray-700">Contact Number</label>
                                    {/* --- FIX 1: Changed name="contact" to name="contactNumber" --- */}
                                    <input type="tel" id="contactNumber" name="contactNumber" value={formData.contactNumber || ''} onChange={handleChange} placeholder="10-digit mobile number" required className="mt-1 block w-full px-4 py-2.5 border border-gray-300 rounded-lg"/>
                                </div>
                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email Address</label>
                                    <input type="email" id="email" name="email" value={formData.email || ''} onChange={handleChange} placeholder="you@example.com" required className="mt-1 block w-full px-4 py-2.5 border border-gray-300 rounded-lg"/>
                                </div>
                            </div>
                            {/* Age & Blood Group */}
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    {/* --- FIX 2: Added the missing Age input field --- */}
                                    <label htmlFor="age" className="block text-sm font-medium text-gray-700">Age</label>
                                    <input type="number" id="age" name="age" value={formData.age || ''} onChange={handleChange} min="18" placeholder="e.g., 25" required className="mt-1 block w-full px-4 py-2.5 border border-gray-300 rounded-lg"/>
                                </div>
                                <div>
                                    <label htmlFor="bloodGroup" className="block text-sm font-medium text-gray-700">Blood Group</label>
                                    <select id="bloodGroup" name="bloodGroup" value={formData.bloodGroup || ''} onChange={handleChange} required className="mt-1 block w-full px-4 py-2.5 border border-gray-300 rounded-lg">
                                        <option value="">Select Group</option>
                                        <option value="A+">A+</option><option value="A-">A-</option><option value="B+">B+</option><option value="B-">B-</option>
                                        <option value="AB+">AB+</option><option value="AB-">AB-</option><option value="O+">O+</option><option value="O-">O-</option>
                                    </select>
                                </div>
                            </div>
                             {/* Location & Gender */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label htmlFor="location" className="block text-sm font-medium text-gray-700">Location</label>
                                    <input type="text" id="location" name="location" value={formData.location || ''} onChange={handleChange} placeholder="e.g., Una, Himachal Pradesh" required className="mt-1 block w-full px-4 py-2.5 border border-gray-300 rounded-lg"/>
                                </div>
                                <div>
                                    <label htmlFor="gender" className="block text-sm font-medium text-gray-700">Gender</label>
                                    <select id="gender" name="gender" value={formData.gender || ''} onChange={handleChange} className="mt-1 block w-full px-4 py-2.5 border border-gray-300 rounded-lg">
                                        <option value="">Select Gender</option>
                                        <option value="Male">Male</option><option value="Female">Female</option><option value="Other">Other</option>
                                    </select>
                                </div>
                            </div>
                            
                            {/* Error Message Display */}
                            {error && (
                                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg text-center">
                                    <p>{error}</p>
                                </div>
                            )}

                            {/* Submit Button */}
                            <div className="pt-4">
                                <button type="submit" disabled={isLoading} className="w-full bg-red-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-red-700 transition duration-300 disabled:bg-red-400">
                                    {isLoading ? 'Registering...' : 'Register Now'}
                                </button>
                            </div>
                        </form>
                    </div>

                    <div className=" md:flex flex-col items-center text-center">
                        <img src={formImg} alt="Donor Registration Illustration" className="w-full max-w-md mb-8" />
                        <h3 className="text-2xl font-bold text-gray-800">Thank You for Your Willingness to Help!</h3>
                        <p className="text-gray-600 mt-2 max-w-sm">Your registration is the first step towards saving a life. We appreciate your commitment.</p>
                    </div>
                </div>
            </div>
        </main>
    );
}

export default DonorRegistrationPage;

