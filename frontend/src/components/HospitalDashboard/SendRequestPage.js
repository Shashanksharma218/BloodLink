import React, { useState, useEffect, useRef } from 'react';
import { Send } from 'lucide-react';
import API_BASE_URL from '../../config/api';

function SendRequestPage({ allDonors, donorsLoading, donorsError, setRequests, handleShowSuccessPopup, setActivePage }) {
  const [filteredDonors, setFilteredDonors] = useState([]);
  const [selectedBloodGroup, setSelectedBloodGroup] = useState('');
  const [selectedDonors, setSelectedDonors] = useState(new Set());
  const [urgency, setUrgency] = useState('Medium');
  const [note, setNote] = useState('');
  const [deadline, setDeadline] = useState('');
  const selectAllCheckboxRef = useRef();

  const getMinDate = () => {
    const today = new Date();
    today.setDate(today.getDate() + 1);
    return today.toISOString().split('T')[0];
  };

  useEffect(() => {
    if (selectedBloodGroup) {
      setFilteredDonors(allDonors.filter(donor => donor.bloodGroup === selectedBloodGroup));
    } else {
      setFilteredDonors(allDonors);
    }
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
    } else {
      setSelectedDonors(new Set());
    }
  };

  const sendRequests = async (donorIds) => {
    if (donorIds.size === 0 || !selectedBloodGroup || !deadline) {
      alert("Please select a blood group, at least one donor, and a deadline.");
      return;
    }

    const requestBody = {
      donorIds: Array.from(donorIds),
      bloodGroup: selectedBloodGroup,
      urgency,
      note,
      deadline
    };

    try {
      const response = await fetch(`${API_BASE_URL}/api/requests`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to send requests.');
      }
      const newRequests = await response.json();
      const populatedNewRequests = newRequests.requests.map(req => ({
        ...req,
        donor: allDonors.find(d => d._id === req.donor)
      }));
      setRequests(prev => [...populatedNewRequests, ...prev]);
      handleShowSuccessPopup('Request Sent Successfully!');
      setSelectedBloodGroup('');
      setUrgency('Medium');
      setNote('');
      setDeadline('');
      setSelectedDonors(new Set());
      setActivePage('view-requests');
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div>
      <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
        <div className="p-2 sm:p-3 bg-gradient-to-br from-red-500 to-red-600 rounded-xl sm:rounded-2xl shadow-lg">
          <Send size={24} className="sm:w-7 sm:h-7 text-white" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Send Donation Requests</h1>
      </div>

      <div className="bg-white/80 backdrop-blur-xl rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
          <div>
            <label htmlFor="bloodGroupFilter" className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
              Blood Group
            </label>
            <select
              id="bloodGroupFilter"
              value={selectedBloodGroup}
              onChange={(e) => setSelectedBloodGroup(e.target.value)}
              className="block w-full px-3 sm:px-4 py-2.5 text-sm sm:text-base border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent transition-all"
            >
              <option value="">All Available</option>
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

          <div>
            <label htmlFor="urgency" className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
              Urgency
            </label>
            <select
              id="urgency"
              value={urgency}
              onChange={(e) => setUrgency(e.target.value)}
              className="block w-full px-3 sm:px-4 py-2.5 text-sm sm:text-base border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent transition-all"
            >
              <option>Medium</option>
              <option>High</option>
              <option>Urgent</option>
            </select>
          </div>

          <div>
            <label htmlFor="deadline" className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
              Deadline (Date)
            </label>
            <input
              type="date"
              id="deadline"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              min={getMinDate()}
              required
              className="block w-full px-3 sm:px-4 py-2.5 text-sm sm:text-base border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent transition-all"
            />
          </div>

          <div>
            <label htmlFor="note" className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
              Note (Optional)
            </label>
            <input
              type="text"
              id="note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Optional details"
              className="block w-full px-3 sm:px-4 py-2.5 text-sm sm:text-base border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent transition-all"
            />
          </div>
        </div>

        <div className="flex justify-end mb-4 sm:mb-6">
          <button
            onClick={() => sendRequests(selectedDonors)}
            disabled={selectedDonors.size === 0 || !selectedBloodGroup || !deadline}
            className="w-full sm:w-auto bg-gradient-to-r from-red-600 to-red-700 text-white font-medium py-3 px-6 sm:px-8 rounded-xl shadow-lg hover:shadow-xl hover:from-red-700 hover:to-red-800 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all duration-300 text-sm sm:text-base"
          >
            Send Request to Selected ({selectedDonors.size})
          </button>
        </div>

        <div className="border border-red-100 rounded-xl sm:rounded-2xl overflow-hidden bg-white">
          {donorsLoading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-red-600"></div>
              <p className="text-gray-600 mt-4 text-sm sm:text-base">Loading available donors...</p>
            </div>
          ) : donorsError ? (
            <div className="text-center py-12">
              <p className="text-red-600 text-sm sm:text-base">Error: {donorsError}</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gradient-to-r from-red-50 to-red-100">
                    <tr>
                      <th className="px-3 sm:px-6 py-3 sm:py-4 w-12">
                        <input
                          type="checkbox"
                          ref={selectAllCheckboxRef}
                          checked={filteredDonors.length > 0 && selectedDonors.size === filteredDonors.length}
                          onChange={handleSelectAll}
                          disabled={!selectedBloodGroup || filteredDonors.length === 0}
                          className="h-4 w-4 text-red-600 border-gray-300 rounded focus:ring-red-600"
                        />
                      </th>
                      <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Blood Group
                      </th>
                      <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider hidden sm:table-cell">
                        Contact
                      </th>
                      <th className="px-3 sm:px-6 py-3 sm:py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredDonors.map(donor => (
                      <tr key={donor._id} className="hover:bg-red-50/30 transition-colors">
                        <td className="px-3 sm:px-6 py-3 sm:py-4">
                          <input
                            type="checkbox"
                            checked={selectedDonors.has(donor._id)}
                            onChange={() => handleSelectDonor(donor._id)}
                            disabled={!selectedBloodGroup}
                            className="h-4 w-4 text-red-600 border-gray-300 rounded focus:ring-red-600"
                          />
                        </td>
                        <td className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-medium text-gray-900">
                          {donor.fullName}
                        </td>
                        <td className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-gray-600">
                          <span className="px-2 sm:px-3 py-1 bg-gradient-to-r from-red-100 to-red-200 text-red-800 rounded-full font-medium text-xs">
                            {donor.bloodGroup}
                          </span>
                        </td>
                        <td className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-gray-600 hidden sm:table-cell">
                          {donor.contactNumber}
                        </td>
                        <td className="px-3 sm:px-6 py-3 sm:py-4 text-right">
                          <button
                            onClick={() => sendRequests(new Set([donor._id]))}
                            disabled={!selectedBloodGroup || !deadline}
                            className="text-xs sm:text-sm text-red-600 hover:text-red-700 font-medium transition-colors disabled:text-gray-400"
                          >
                            Send
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {filteredDonors.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-gray-500 text-sm sm:text-base">No available donors match the selected criteria.</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default SendRequestPage;