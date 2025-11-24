import React, { useState } from 'react';
import { Users, Search } from 'lucide-react';

function DonorListPage({ donorsList, donorsListLoading, donorsListError }) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredDonors = donorsList.filter(donor =>
    donor.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    donor.bloodGroup.toLowerCase().includes(searchQuery.toLowerCase()) ||
    donor.contactNumber.includes(searchQuery)
  );

  return (
    <div>
      <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
        <div className="p-2 sm:p-3 bg-gradient-to-br from-red-500 to-red-600 rounded-xl sm:rounded-2xl shadow-lg">
          <Users size={24} className="sm:w-7 sm:h-7 text-white" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">All Donors</h1>
      </div>

      <div className="bg-white/80 backdrop-blur-xl rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6">
        <div className="mb-4 sm:mb-6">
          <div className="relative">
            <Search className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search by name, blood group, or contact..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-2.5 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-600 transition-all"
            />
          </div>
        </div>

        {donorsListLoading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-red-600"></div>
            <p className="text-gray-600 mt-4 text-sm sm:text-base">Loading donors...</p>
          </div>
        ) : donorsListError ? (
          <div className="text-center py-12">
            <p className="text-red-600 text-sm sm:text-base">Error: {donorsListError}</p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl sm:rounded-2xl border border-red-100">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gradient-to-r from-red-50 to-red-100">
                <tr>
                  <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Blood Group
                  </th>
                  <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider hidden sm:table-cell">
                    Contact
                  </th>
                  <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider hidden md:table-cell">
                    Location
                  </th>
                  <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredDonors.length > 0 ? (
                  filteredDonors.map(donor => (
                    <tr key={donor._id} className="hover:bg-red-50/30 transition-colors">
                      <td className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-medium text-gray-900">
                        <div>
                          {donor.fullName}
                          <div className="sm:hidden text-xs text-gray-500 mt-1">
                            {donor.contactNumber}
                          </div>
                        </div>
                      </td>
                      <td className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm">
                        <span className="px-2 sm:px-3 py-1 bg-gradient-to-r from-red-100 to-red-200 text-red-800 rounded-full font-medium text-xs">
                          {donor.bloodGroup}
                        </span>
                      </td>
                      <td className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-gray-600 hidden sm:table-cell">
                        {donor.contactNumber}
                      </td>
                      <td className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-gray-600 hidden md:table-cell">
                        {donor.location || 'N/A'}
                      </td>
                      <td className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm">
                        <span
                          className={`px-2 sm:px-3 py-1 rounded-full font-medium text-xs ${
                            donor.isAvailable
                              ? 'bg-green-100 text-green-800 border border-green-200'
                              : 'bg-red-100 text-red-800 border border-red-200'
                          }`}
                        >
                          {donor.isAvailable ? 'Available' : 'Not Available'}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="px-3 sm:px-6 py-12 text-center text-gray-500 text-sm sm:text-base">
                      {searchQuery ? 'No donors match your search criteria.' : 'No donors available.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default DonorListPage;