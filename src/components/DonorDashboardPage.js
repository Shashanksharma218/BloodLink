import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// --- Mock Data ---
// In a real application, this would come from an API call
const mockDonor = {
  name: "Shashank Sharma",
  lastDonation: "2023-07-15"
};

const initialRequests = [
  { id: 1, bloodGroup: 'A+', urgency: 'Urgent', date: '2023-10-28', note: 'Patient in critical condition, requires immediate transfusion.', status: 'Pending' },
  { id: 2, bloodGroup: 'A+', urgency: 'High', date: '2023-10-25', note: 'Scheduled surgery for tomorrow morning.', status: 'Pending' },
];
// --- End Mock Data ---


function DonorDashboardPage() {
  const [isAvailable, setIsAvailable] = useState(true);
  const [requests, setRequests] = useState(initialRequests);
  const navigate = useNavigate();

  const handleLogout = () => {
    // Add any real logout logic here (e.g., clearing tokens)
    console.log("User logged out.");
    navigate('/'); // Redirect to homepage after logout
  };

  const handleRequestAction = (requestId, newStatus) => {
    // In a real app, this would be an API call to update the request status
    setRequests(prevRequests => 
      prevRequests.map(req => 
        req.id === requestId ? { ...req, status: newStatus } : req
      )
    );
    console.log(`Request ${requestId} has been ${newStatus}.`);
  };
  
  const pendingRequests = requests.filter(req => req.status === 'Pending');

  return (
    <main className="bg-gray-50 py-12 md:py-16">
      <div className="container mx-auto px-4 sm:px-6">

        {/* Dashboard Header */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800">
            Welcome, <span className="text-red-600">{mockDonor.name}</span>!
          </h1>
          <button 
            onClick={handleLogout}
            className="mt-4 sm:mt-0 bg-gray-200 text-gray-800 font-bold py-2 px-6 rounded-lg hover:bg-gray-300 transition duration-300"
          >
            Log Out
          </button>
        </div>

        {/* Status & Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {/* Availability Card */}
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
              className={`${isAvailable ? 'bg-green-500' : 'bg-gray-300'} mt-4 sm:mt-0 relative inline-flex items-center h-6 rounded-full w-11 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500`}
            >
              <span className={`${isAvailable ? 'translate-x-6' : 'translate-x-1'} inline-block w-4 h-4 transform bg-white rounded-full transition-transform`} />
            </button>
          </div>
          {/* Last Donation Card */}
          <div className="bg-white p-6 rounded-xl shadow-lg">
             <h3 className="text-xl font-semibold text-gray-800">Last Donation Date</h3>
             <p className="text-lg text-gray-600 font-medium">{mockDonor.lastDonation}</p>
          </div>
        </div>

        {/* My Donation Requests Section */}
        <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-6">My Donation Requests</h2>
          <div className="space-y-6">
            {pendingRequests.length > 0 ? (
              pendingRequests.map(request => (
                <div key={request.id} className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-red-500">
                  <div className="flex flex-col sm:flex-row justify-between items-start">
                    <div>
                      <div className="flex items-center space-x-4">
                        <span className="text-xl font-bold text-red-600 bg-red-50 rounded-full h-12 w-12 flex items-center justify-center">{request.bloodGroup}</span>
                        <div>
                          <p className="text-lg font-semibold text-gray-800">Urgency: <span className="font-bold text-red-500">{request.urgency}</span></p>
                          <p className="text-sm text-gray-500">Requested on: {request.date}</p>
                        </div>
                      </div>
                      <p className="text-gray-700 mt-4 pl-1"><strong>Note from hospital:</strong> {request.note}</p>
                    </div>
                    {/* Action Buttons */}
                    <div className="flex space-x-3 mt-4 sm:mt-0 self-stretch sm:self-center">
                      <button onClick={() => handleRequestAction(request.id, 'Accepted')} className="bg-green-500 text-white font-bold py-2 px-5 rounded-lg hover:bg-green-600 transition duration-300">Accept</button>
                      <button onClick={() => handleRequestAction(request.id, 'Rejected')} className="bg-gray-600 text-white font-bold py-2 px-5 rounded-lg hover:bg-gray-700 transition duration-300">Reject</button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center bg-white p-8 rounded-xl shadow-md">
                <p className="text-gray-600 text-lg">You have no pending donation requests. Thank you!</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </main>
  );
}

export default DonorDashboardPage;

