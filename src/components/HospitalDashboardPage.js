import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// --- Mock Data ---
const allDonors = [
    { id: 1, name: 'Rohan Verma', bloodGroup: 'A+', contact: '9876543210', location: 'Una', isAvailable: true },
    { id: 2, name: 'Priya Sharma', bloodGroup: 'O+', contact: '9123456780', location: 'Santoshgarh', isAvailable: true },
    { id: 3, name: 'Amit Kumar', bloodGroup: 'B+', contact: '9988776655', location: 'Mehatpur', isAvailable: false },
    { id: 4, name: 'Sunita Devi', bloodGroup: 'A+', contact: '9816012345', location: 'Una', isAvailable: true },
    { id: 5, name: 'Vikas Singh', bloodGroup: 'AB+', contact: '9418054321', location: 'Nangal', isAvailable: true },
    { id: 6, name: 'Geeta Thakur', bloodGroup: 'O-', contact: '9805511223', location: 'Una', isAvailable: true },
    { id: 7, name: 'Karan Mehra', bloodGroup: 'B+', contact: '9876554321', location: 'Una', isAvailable: true },
    { id: 8, name: 'Simranjeet Kaur', bloodGroup: 'O+', contact: '9123445678', location: 'Amb', isAvailable: true },
];

const initialRequests = [
    { id: 101, bloodGroup: 'A+', urgency: 'Urgent', date: '2023-10-28', status: 'Pending' },
    { id: 102, bloodGroup: 'B+', urgency: 'High', date: '2023-10-27', status: 'Accepted', donorName: 'Amit Kumar' },
    { id: 103, bloodGroup: 'O+', urgency: 'Medium', date: '2023-10-26', status: 'Completed', donorName: 'Priya Sharma' },
];
// --- End Mock Data ---


function HospitalDashboardPage() {
    const [activeTab, setActiveTab] = useState('send');
    const [requests, setRequests] = useState(initialRequests);
    const [filteredDonors, setFilteredDonors] = useState([]);
    const [selectedBloodGroup, setSelectedBloodGroup] = useState('');
    const [selectedDonors, setSelectedDonors] = useState(new Set());
    const [urgency, setUrgency] = useState('Medium');
    const [note, setNote] = useState('');
    const navigate = useNavigate();

    // Effect to filter donors when the selected blood group changes
    useEffect(() => {
        const availableDonors = allDonors.filter(d => d.isAvailable);
        if (selectedBloodGroup) {
            setFilteredDonors(availableDonors.filter(donor => donor.bloodGroup === selectedBloodGroup));
        } else {
            setFilteredDonors(availableDonors);
        }
        // Reset selection when filter changes
        setSelectedDonors(new Set());
    }, [selectedBloodGroup]);

    // Handle checkbox change for a single donor
    const handleSelectDonor = (donorId) => {
        setSelectedDonors(prev => {
            const newSelection = new Set(prev);
            if (newSelection.has(donorId)) {
                newSelection.delete(donorId);
            } else {
                newSelection.add(donorId);
            }
            return newSelection;
        });
    };

    // Handle "Select All" checkbox change
    const handleSelectAll = (e) => {
        if (e.target.checked) {
            const allDonorIds = new Set(filteredDonors.map(d => d.id));
            setSelectedDonors(allDonorIds);
        } else {
            setSelectedDonors(new Set());
        }
    };

    const sendRequests = (donorIds) => {
        if (donorIds.size === 0) {
            alert("Please select at least one donor.");
            return;
        }
        if (!selectedBloodGroup) {
            alert("Please select a specific blood group before sending a request.");
            return;
        }
        console.log(`Sending request for ${selectedBloodGroup} (${urgency}) to ${donorIds.size} donor(s). Note: "${note}"`);
        // Here you would add the logic to create new request documents in your DB
        navigate('/success');
    }

    // Helper to get status color
    const getStatusColor = (status) => {
        switch (status) {
            case 'Pending': return 'bg-yellow-100 text-yellow-800';
            case 'Accepted': return 'bg-blue-100 text-blue-800';
            case 'Completed': return 'bg-green-100 text-green-800';
            case 'Rejected': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <main className="bg-gray-50 py-12">
            <div className="container mx-auto px-4 sm:px-6">

                {/* Tabs */}
                <div className="border-b border-gray-200 mb-6">
                    <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                        <button onClick={() => setActiveTab('send')} className={`${activeTab === 'send' ? 'border-red-500 text-red-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-lg`}>
                            Send Requests
                        </button>
                        <button onClick={() => setActiveTab('view')} className={`${activeTab === 'view' ? 'border-red-500 text-red-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-lg`}>
                            View All Requests
                        </button>
                    </nav>
                </div>

                <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-8">
                    Hospital Dashboard
                </h1>

                {/* Conditional Content based on Tab */}
                {activeTab === 'send' && (
                    <div className="bg-white p-6 rounded-xl shadow-lg">
                        {/* Filter Row */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end mb-6 pb-6 border-b">
                            <div>
                                <label htmlFor="bloodGroupFilter" className="block text-sm font-medium text-gray-700">Blood Group</label>
                                <select id="bloodGroupFilter" value={selectedBloodGroup} onChange={(e) => setSelectedBloodGroup(e.target.value)} className="mt-1 block w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:ring-red-500 focus:border-red-500">
                                    <option value="">All Available</option>
                                    <option value="A+">A+</option><option value="A-">A-</option>
                                    <option value="B+">B+</option><option value="B-">B-</option>
                                    <option value="AB+">AB+</option><option value="AB-">AB-</option>
                                    <option value="O+">O+</option><option value="O-">O-</option>
                                </select>
                            </div>
                            <div>
                                <label htmlFor="urgency" className="block text-sm font-medium text-gray-700">Urgency</label>
                                <select id="urgency" value={urgency} onChange={(e) => setUrgency(e.target.value)} className="mt-1 block w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:ring-red-500 focus:border-red-500">
                                    <option>Medium</option><option>High</option><option>Urgent</option>
                                </select>
                            </div>
                            <div className="md:col-span-2 lg:col-span-1">
                                <label htmlFor="note" className="block text-sm font-medium text-gray-700">Note</label>
                                <input type="text" id="note" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Optional note for donors" className="mt-1 block w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:ring-red-500 focus:border-red-500" />
                            </div>
                            <div>
                                <button onClick={() => sendRequests(selectedDonors)} disabled={selectedDonors.size === 0 || !selectedBloodGroup} className="w-full bg-red-600 text-white font-bold py-2.5 px-6 rounded-lg hover:bg-red-700 disabled:bg-red-300 disabled:cursor-not-allowed">
                                    Send to Selected ({selectedDonors.size})
                                </button>
                            </div>
                        </div>

                        {/* Donor List Table */}
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        {/* Add align-middle here */}
                                        <th className="p-4 align-middle">
                                            <input type="checkbox" onChange={handleSelectAll} disabled={!selectedBloodGroup} className="h-4 w-4 text-red-600 border-gray-300 rounded focus:ring-red-500 disabled:bg-gray-200" />
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Blood Group</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                                        <th className="relative px-6 py-3"><span className="sr-only">Action</span></th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {filteredDonors.map(donor => (
                                        <tr key={donor.id}>
                                            {/* And also add align-middle here */}
                                            <td className="p-4 align-middle">
                                                <input type="checkbox" checked={selectedDonors.has(donor.id)} onChange={() => handleSelectDonor(donor.id)} disabled={!selectedBloodGroup} className="h-4 w-4 text-red-600 border-gray-300 rounded focus:ring-red-500 disabled:bg-gray-200" />
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{donor.name}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{donor.bloodGroup}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{donor.contact}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <button onClick={() => sendRequests(new Set([donor.id]))} disabled={!selectedBloodGroup} className="text-red-600 hover:text-red-800 disabled:text-gray-400 disabled:cursor-not-allowed">Send Request</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {filteredDonors.length === 0 && <p className="text-center text-gray-500 py-8">No available donors match the selected criteria.</p>}
                        </div>
                    </div>
                )}

                {activeTab === 'view' && (
                    <div className="bg-white p-6 rounded-xl shadow-lg">
                        <h2 className="text-2xl font-bold text-gray-800 mb-6">Track All Requests</h2>
                        <div className="space-y-4">
                            {requests.map(req => (
                                <div key={req.id} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                                    <div className="flex flex-col sm:flex-row justify-between items-start">
                                        <div>
                                            <div className="flex items-center gap-4">
                                                <span className="text-xl font-bold text-red-600">{req.bloodGroup}</span>
                                                <div>
                                                    <p className="font-semibold">Urgency: {req.urgency}</p>
                                                    <p className="text-sm text-gray-500">Date: {req.date}</p>
                                                </div>
                                            </div>
                                            {req.donorName && <p className="text-sm text-gray-600 mt-2">Handled by: <span className="font-medium">{req.donorName}</span></p>}
                                        </div>
                                        <div className="flex items-center gap-4 mt-4 sm:mt-0">
                                            <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(req.status)}`}>{req.status}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

            </div>
        </main>
    );
}

export default HospitalDashboardPage;

