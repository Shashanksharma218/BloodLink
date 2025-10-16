import React, { useState, useEffect, useRef } from 'react';

function HospitalDashboardPage() {
  const [activeTab, setActiveTab] = useState('view'); // Default to view tab
  
  const [allDonors, setAllDonors] = useState([]);
  const [filteredDonors, setFilteredDonors] = useState([]);
  const [donorsLoading, setDonorsLoading] = useState(true);
  const [donorsError, setDonorsError] = useState('');

  const [requests, setRequests] = useState([]); 
  const [requestsLoading, setRequestsLoading] = useState(true);
  const [requestsError, setRequestsError] = useState('');
  
  const [selectedBloodGroup, setSelectedBloodGroup] = useState('');
  const [selectedDonors, setSelectedDonors] = useState(new Set());
  const [urgency, setUrgency] = useState('Medium');
  const [note, setNote] = useState('');
  const [showSuccessPopup, setShowSuccessPopup] = useState({ show: false, message: '' });
  
  const selectAllCheckboxRef = useRef();

  useEffect(() => {
    // ... (data fetching logic remains the same) ...
    const fetchDonors = async () => {
        try {
            const response = await fetch('http://localhost:5555/api/donors/available');
            if (!response.ok) throw new Error('Failed to fetch available donors.');
            const data = await response.json(); setAllDonors(data);
        } catch (err) { setDonorsError(err.message); } 
        finally { setDonorsLoading(false); }
    };
    const fetchRequests = async () => {
        try {
            const response = await fetch('http://localhost:5555/api/requests');
            if (!response.ok) throw new Error('Failed to fetch blood requests.');
            const data = await response.json(); setRequests(data);
        } catch (err) { setRequestsError(err.message); } 
        finally { setRequestsLoading(false); }
    };
    fetchDonors(); fetchRequests();
  }, []);

  useEffect(() => {
    if (selectedBloodGroup) {
      setFilteredDonors(allDonors.filter(donor => donor.bloodGroup === selectedBloodGroup));
    } else { setFilteredDonors(allDonors); }
    setSelectedDonors(new Set());
  }, [selectedBloodGroup, allDonors]);

  useEffect(() => {
    if (selectAllCheckboxRef.current) {
      const isIndeterminate = selectedDonors.size > 0 && selectedDonors.size < filteredDonors.length;
      selectAllCheckboxRef.current.indeterminate = isIndeterminate;
    }
  }, [selectedDonors, filteredDonors]);
  
  const handleSelectDonor = (donorId) => {
    setSelectedDonors(prev => {
        const newSelection = new Set(prev);
        if (newSelection.has(donorId)) newSelection.delete(donorId);
        else newSelection.add(donorId);
        return newSelection;
    });
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
        const allDonorIds = new Set(filteredDonors.map(d => d._id));
        setSelectedDonors(allDonorIds);
    } else { setSelectedDonors(new Set()); }
  };

  const handleShowSuccessPopup = (message) => {
    setShowSuccessPopup({ show: true, message });
    setTimeout(() => setShowSuccessPopup({ show: false, message: '' }), 3000);
  }

  const sendRequests = async (donorIds) => {
    if (donorIds.size === 0 || !selectedBloodGroup) {
        alert("Please select a blood group and at least one donor."); return;
    }
    const requestBody = { donorIds: Array.from(donorIds), bloodGroup: selectedBloodGroup, urgency, note };
    try {
        const response = await fetch('http://localhost:5555/api/requests', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody),
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to send requests.');
        }
        const newRequests = await response.json();
        const populatedNewRequests = newRequests.requests.map(req => ({...req, donor: allDonors.find(d => d._id === req.donor)}));
        setRequests(prev => [...populatedNewRequests, ...prev]);
        handleShowSuccessPopup('Request Sent Successfully!');
        setSelectedBloodGroup(''); setUrgency('Medium'); setNote('');
        setActiveTab('view');
    } catch (err) { alert(err.message); }
  };

  const handleCancelRequest = async (requestId) => {
    if (!window.confirm("Are you sure you want to cancel this request?")) return;
    try {
        const response = await fetch(`http://localhost:5555/api/requests/${requestId}`, { method: 'DELETE' });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to cancel request.');
        }
        setRequests(prev => prev.filter(req => req._id !== requestId));
        handleShowSuccessPopup('Request Cancelled!');
    } catch (err) { alert(err.message); }
  };

  // --- NEW ---
  const handleMarkCompleted = async (requestId) => {
    try {
        const response = await fetch(`http://localhost:5555/api/requests/${requestId}/complete`, {
            method: 'PUT',
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to mark as completed.');
        }
        setRequests(prev => prev.map(req => req._id === requestId ? { ...req, status: 'Completed' } : req));
        handleShowSuccessPopup('Donation marked as completed!');
    } catch (err) {
        alert(err.message);
    }
  };

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
    <main className="bg-gray-50 py-12 relative">
      {showSuccessPopup.show && (
        <div className="fixed top-24 right-5 bg-green-500 text-white py-3 px-6 rounded-lg shadow-lg z-50 animate-pulse">
            <p className="font-semibold">{showSuccessPopup.message}</p>
        </div>
      )}

      <div className="container mx-auto px-4 sm:px-6">
        <div className="border-b border-gray-200 mb-6">
            <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                <button onClick={() => setActiveTab('send')} className={`${activeTab === 'send' ? 'border-red-500 text-red-600' : 'border-transparent text-gray-500'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-lg`}>Send Requests</button>
                <button onClick={() => setActiveTab('view')} className={`${activeTab === 'view' ? 'border-red-500 text-red-600' : 'border-transparent text-gray-500'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-lg`}>View All Requests</button>
            </nav>
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-8">Hospital Dashboard</h1>

        {activeTab === 'send' && ( /* Send Requests Tab is unchanged */
            <div className="bg-white p-6 rounded-xl shadow-lg">
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end mb-6 pb-6 border-b">
                <div><label htmlFor="bloodGroupFilter" className="block text-sm font-medium text-gray-700">Blood Group</label><select id="bloodGroupFilter" value={selectedBloodGroup} onChange={(e) => setSelectedBloodGroup(e.target.value)} className="mt-1 block w-full px-4 py-2.5 border border-gray-300 rounded-lg"><option value="">All Available</option><option value="A+">A+</option><option value="A-">A-</option><option value="B+">B+</option><option value="B-">B-</option><option value="AB+">AB+</option><option value="AB-">AB-</option><option value="O+">O+</option><option value="O-">O-</option></select></div>
                <div><label htmlFor="urgency" className="block text-sm font-medium text-gray-700">Urgency</label><select id="urgency" value={urgency} onChange={(e) => setUrgency(e.target.value)} className="mt-1 block w-full px-4 py-2.5 border border-gray-300 rounded-lg"><option>Medium</option><option>High</option><option>Urgent</option></select></div>
                <div className="md:col-span-2 lg:col-span-1"><label htmlFor="note" className="block text-sm font-medium text-gray-700">Note</label><input type="text" id="note" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Optional note for donors" className="mt-1 block w-full px-4 py-2.5 border border-gray-300 rounded-lg" /></div>
                <div><button onClick={() => sendRequests(selectedDonors)} disabled={selectedDonors.size === 0 || !selectedBloodGroup} className="w-full bg-red-600 text-white font-bold py-2.5 px-6 rounded-lg hover:bg-red-700 disabled:bg-red-300">Send to Selected ({selectedDonors.size})</button></div>
            </div>
            <div className="overflow-x-auto">
                {donorsLoading ? ( <p className="text-center py-8">Loading available donors...</p>
                ) : donorsError ? ( <p className="text-center text-red-500 py-8">Error: {donorsError}</p>
                ) : (
                    <><table className="min-w-full divide-y divide-gray-200"><thead className="bg-gray-50"><tr><th scope="col" className="px-6 py-4"><input type="checkbox" ref={selectAllCheckboxRef} checked={filteredDonors.length > 0 && selectedDonors.size === filteredDonors.length} onChange={handleSelectAll} disabled={!selectedBloodGroup || filteredDonors.length === 0} className="h-4 w-4 text-red-600 border-gray-300 rounded"/></th><th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Name</th><th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Blood Group</th><th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Contact</th><th scope="col" className="relative px-6 py-4"><span className="sr-only">Action</span></th></tr></thead><tbody className="bg-white divide-y divide-gray-200">{filteredDonors.map(donor => (<tr key={donor._id}><td className="px-6 py-4"><input type="checkbox" checked={selectedDonors.has(donor._id)} onChange={() => handleSelectDonor(donor._id)} disabled={!selectedBloodGroup} className="h-4 w-4 text-red-600 border-gray-300 rounded"/></td><td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{donor.fullName}</td><td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{donor.bloodGroup}</td><td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{donor.contactNumber}</td><td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium"><button onClick={() => sendRequests(new Set([donor._id]))} disabled={!selectedBloodGroup} className="text-red-600 hover:text-red-800 disabled:text-gray-400">Send Request</button></td></tr>))}</tbody></table>{filteredDonors.length === 0 && <p className="text-center text-gray-500 py-8">No available donors match the selected criteria.</p>}</>
                )}
            </div>
          </div>
        )}

        {activeTab === 'view' && (
           <div className="bg-white p-6 rounded-xl shadow-lg">
               <h2 className="text-2xl font-bold text-gray-800 mb-6">Track All Requests</h2>
               {requestsLoading ? ( <p className="text-center py-8">Loading requests...</p>
               ) : requestsError ? ( <p className="text-center text-red-500 py-8">Error: {requestsError}</p>
               ) : (
                    <div className="space-y-4">
                        {requests.length > 0 ? requests.map(req => (
                            <div key={req._id} className="p-4 border rounded-lg">
                                <div className="flex flex-col sm:flex-row justify-between items-start">
                                    <div>
                                        <div className="flex items-center gap-4">
                                            <span className="text-xl font-bold text-red-600">{req.bloodGroup}</span>
                                            <div>
                                                <p className="font-semibold">Urgency: {req.urgency}</p>
                                                <p className="text-sm text-gray-500">Date: {new Date(req.createdAt).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                        {req.donor && (
                                            <div className='mt-3 text-sm text-gray-600'>
                                                <p>Sent to: <span className="font-medium">{req.donor.fullName}</span></p>
                                                <p>Contact: <span className="font-medium">{req.donor.contactNumber}</span></p>
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-4 mt-4 sm:mt-0">
                                        <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(req.status)}`}>{req.status}</span>
                                        {/* --- NEW: Conditionally render action buttons based on status --- */}
                                        {req.status === 'Accepted' && (
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); handleMarkCompleted(req._id); }}
                                                className="text-sm bg-blue-500 text-white font-semibold py-1 px-3 rounded-lg hover:bg-blue-600"
                                            >
                                                Mark Completed
                                            </button>
                                        )}
                                        {req.status === 'Pending' && (
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); handleCancelRequest(req._id); }} 
                                                className="text-sm bg-red-500 text-white font-semibold py-1 px-3 rounded-lg hover:bg-red-600"
                                            >
                                                Cancel
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )) : (
                            <p className="text-center text-gray-500 py-8">No requests have been sent yet.</p>
                        )}
                    </div>
                )}
           </div>
        )}
      </div>
    </main>
  );
}

export default HospitalDashboardPage;

