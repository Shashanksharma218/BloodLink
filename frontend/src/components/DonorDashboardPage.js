import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';

function DonorDashboardPage() {
  const { currentUser, logout } = useAuth();
  
  const [isAvailable, setIsAvailable] = useState(currentUser?.isAvailable || true);
  const [requests, setRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeRequestTab, setActiveRequestTab] = useState('upcoming'); // 'upcoming' or 'available'

  // Memoized fetch function to be reusable
  const fetchRequests = useCallback(async () => {
    if (currentUser?._id) {
        setIsLoading(true);
        setError('');
        try {
            const response = await fetch(`http://localhost:5555/api/requests/donor/${currentUser._id}`);
            if (!response.ok) {
                throw new Error('Failed to fetch your donation requests.');
            }
            const data = await response.json();
            setRequests(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    }
  }, [currentUser]);

  // Initial fetch on component mount
  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);


  const handleRequestAction = async (requestId, newStatus) => {
    try {
        const response = await fetch(`http://localhost:5555/api/requests/${requestId}/status`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: newStatus }),
        });
        if (!response.ok) {
            throw new Error('Failed to update request status.');
        }
        setRequests(prevRequests => 
          prevRequests.map(req => 
            req._id === requestId ? { ...req, status: newStatus } : req
          )
        );
    } catch (err) {
        alert(err.message);
    }
  };
  
  // Filter requests into separate lists
  const pendingRequests = requests.filter(req => req.status === 'Pending');
  const upcomingDonations = requests.filter(req => req.status === 'Accepted');

  if (!currentUser) {
    return <p className="text-center text-gray-500 py-20">Loading your dashboard...</p>
  }

  return (
    <main className="bg-gray-50 py-12 md:py-16">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800">
            Welcome, <span className="text-red-600">{currentUser.fullName}</span>!
          </h1>
          {/* <button 
            onClick={logout}
            className="mt-4 sm:mt-0 bg-gray-200 text-gray-800 font-bold py-2 px-6 rounded-lg hover:bg-gray-300 transition"
          >
            Log Out
          </button> */}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <div className="bg-white p-6 rounded-xl shadow-lg flex flex-col sm:flex-row justify-between items-center">
            <div>
              <h3 className="text-xl font-semibold text-gray-800">Your Availability</h3>
              <p className={`text-lg font-bold ${isAvailable ? 'text-green-600' : 'text-gray-500'}`}>
                {isAvailable ? 'Available to Donate' : 'Not Available'}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsAvailable(!isAvailable)}
              className={`${isAvailable ? 'bg-green-500' : 'bg-gray-300'} mt-4 sm:mt-0 relative inline-flex items-center h-6 rounded-full w-11 transition-colors`}
            >
              <span className={`${isAvailable ? 'translate-x-6' : 'translate-x-1'} inline-block w-4 h-4 transform bg-white rounded-full transition-transform`} />
            </button>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-lg">
             <h3 className="text-xl font-semibold text-gray-800">Last Donation Date</h3>
             <p className="text-lg text-gray-600 font-medium">
                {currentUser.lastDonationDate ? new Date(currentUser.lastDonationDate).toLocaleDateString() : 'Not Recorded'}
             </p>
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">My Donation Requests</h2>
            <button onClick={fetchRequests} className="flex items-center space-x-2 bg-white border border-gray-300 text-gray-700 font-semibold py-2 px-4 rounded-lg hover:bg-gray-50 transition">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" /></svg>
              <span>Refresh</span>
            </button>
          </div>

          <div className="border-b border-gray-200 mb-6">
            <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                <button onClick={() => setActiveRequestTab('upcoming')} className={`${activeRequestTab === 'upcoming' ? 'border-red-500 text-red-600' : 'border-transparent text-gray-500 hover:text-gray-700'} whitespace-nowrap py-3 px-1 border-b-2 font-medium text-lg`}>
                    Upcoming Donations <span className="bg-blue-100 text-blue-800 ml-2 px-2.5 py-1 rounded-full text-sm font-semibold">{upcomingDonations.length}</span>
                </button>
                <button onClick={() => setActiveRequestTab('available')} className={`${activeRequestTab === 'available' ? 'border-red-500 text-red-600' : 'border-transparent text-gray-500 hover:text-gray-700'} whitespace-nowrap py-3 px-1 border-b-2 font-medium text-lg`}>
                    Available Requests <span className="bg-yellow-100 text-yellow-800 ml-2 px-2.5 py-1 rounded-full text-sm font-semibold">{pendingRequests.length}</span>
                </button>
            </nav>
          </div>

            {isLoading ? ( <p className="text-center text-gray-500 py-10">Loading your requests...</p>
            ) : error ? ( <p className="text-center text-red-500 py-10">{error}</p>
            ) : (
                <div className="space-y-6">
                    {activeRequestTab === 'available' && (
                        pendingRequests.length > 0 ? (
                        pendingRequests.map(request => (
                            <div key={request._id} className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-red-500">
                                <div className="flex flex-col sm:flex-row justify-between items-start">
                                    <div>
                                    <div className="flex items-center space-x-4">
                                        <span className="text-xl font-bold text-red-600 bg-red-50 rounded-full h-12 w-12 flex items-center justify-center">{request.bloodGroup}</span>
                                        <div>
                                        <p className="text-lg font-semibold text-gray-800">Urgency: <span className="font-bold text-red-500">{request.urgency}</span></p>
                                        <p className="text-sm text-gray-500">Requested on: {new Date(request.createdAt).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                    {request.note && <p className="text-gray-700 mt-4 pl-1"><strong>Note from hospital:</strong> {request.note}</p>}
                                    </div>
                                    <div className="flex space-x-3 mt-4 sm:mt-0 self-stretch sm:self-center">
                                    <button onClick={() => handleRequestAction(request._id, 'Accepted')} className="bg-green-500 text-white font-bold py-2 px-5 rounded-lg hover:bg-green-600 transition">Accept</button>
                                    <button onClick={() => handleRequestAction(request._id, 'Rejected')} className="bg-gray-600 text-white font-bold py-2 px-5 rounded-lg hover:bg-gray-700 transition">Reject</button>
                                    </div>
                                </div>
                            </div>
                        ))
                        ) : ( <div className="text-center bg-white p-8 rounded-xl shadow-md"><p className="text-gray-600 text-lg">You have no new donation requests. Thank you!</p></div> )
                    )}

                    {activeRequestTab === 'upcoming' && (
                        upcomingDonations.length > 0 ? (
                        upcomingDonations.map(request => (
                             <div key={request._id} className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-blue-500">
                                <div className="flex flex-col sm:flex-row justify-between items-start">
                                    <div>
                                        <div className="flex items-center space-x-4">
                                            <span className="text-xl font-bold text-blue-600 bg-blue-50 rounded-full h-12 w-12 flex items-center justify-center">{request.bloodGroup}</span>
                                            <div>
                                            <p className="text-lg font-semibold text-gray-800">Urgency: <span className="font-bold text-blue-500">{request.urgency}</span></p>
                                            <p className="text-sm text-gray-500">Accepted on: {new Date(request.updatedAt).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                        {request.note && <p className="text-gray-700 mt-4 pl-1"><strong>Note from hospital:</strong> {request.note}</p>}
                                    </div>
                                    <div className="flex items-center mt-4 sm:mt-0">
                                        <span className="bg-blue-100 text-blue-800 px-3 py-1 text-sm font-medium rounded-full">Accepted</span>
                                    </div>
                                </div>
                            </div>
                        ))
                        ) : ( <div className="text-center bg-white p-8 rounded-xl shadow-md"><p className="text-gray-600 text-lg">You have no upcoming donations scheduled.</p></div> )
                    )}
                </div>
            )}
        </div>
      </div>
    </main>
  );
}

export default DonorDashboardPage;

