import React from 'react';
import { useParams, Link } from 'react-router-dom';

// Mock data for a single request's details
// In a real app, you would fetch this based on the ID from the URL
const mockRequestDetails = {
    _id: '101',
    bloodGroup: 'A+',
    urgency: 'Urgent',
    date: '2023-10-28',
    note: 'Patient in critical condition, requires immediate transfusion.',
    recipients: [
        { _id: '1', name: 'Rohan Verma', status: 'Pending' },
        { _id: '4', name: 'Sunita Devi', status: 'Accepted' },
        { _id: '9', name: 'Neha Singh', status: 'Rejected' },
    ]
};

function RequestDetailsPage() {
    const { requestId } = useParams(); // Gets the ':requestId' from the URL

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
                <div className="mb-8">
                    <Link to="/hospital-dashboard" className="text-red-600 hover:text-red-800 font-medium">
                        &larr; Back to Dashboard
                    </Link>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-lg">
                    <div className="border-b pb-4 mb-6">
                        <h1 className="text-3xl font-bold text-gray-800">Request Details</h1>
                        <p className="text-gray-500">Request ID: {requestId}</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Blood Group</p>
                            <p className="text-lg font-bold text-red-600">{mockRequestDetails.bloodGroup}</p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500">Urgency</p>
                            <p className="text-lg font-semibold text-gray-800">{mockRequestDetails.urgency}</p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500">Date Sent</p>
                            <p className="text-lg font-semibold text-gray-800">{mockRequestDetails.date}</p>
                        </div>
                    </div>
                    {mockRequestDetails.note && (
                         <div>
                            <p className="text-sm font-medium text-gray-500">Note</p>
                            <p className="text-lg text-gray-700 bg-gray-50 p-3 rounded-md">{mockRequestDetails.note}</p>
                        </div>
                    )}

                    <div className="mt-10">
                        <h2 className="text-2xl font-bold text-gray-800 mb-4">Recipient Status</h2>
                        <div className="space-y-3">
                            {mockRequestDetails.recipients.map(donor => (
                                <div key={donor._id} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg border">
                                    <p className="font-medium text-gray-800">{donor.name}</p>
                                    <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(donor.status)}`}>
                                        {donor.status}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}

export default RequestDetailsPage;
