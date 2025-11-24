import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Sidebar from './HospitalDashboard/Sidebar';
import SuccessPopup from './HospitalDashboard/SuccessPopup';
import RemarksModal from './HospitalDashboard/RemarksModal';
import SendRequestPage from './HospitalDashboard/SendRequestPage';
import ViewRequestsPage from './HospitalDashboard/ViewRequestsPage';
import DonorListPage from './HospitalDashboard/DonorListPage';
import MessagesPage from './HospitalDashboard/MessagesPage';
import ProfilePage from './HospitalDashboard/ProfilePage';
import ChangePasswordPage from './HospitalDashboard/ChangePasswordPage';
import API_BASE_URL from '../config/api';

function HospitalDashboardPage() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  
  // UI State
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activePage, setActivePage] = useState('send-requests');
  const [showSuccessPopup, setShowSuccessPopup] = useState({ show: false, message: '' });
  
  // Remarks Modal State
  const [showRemarksModal, setShowRemarksModal] = useState(false);
  const [currentRequestToUpdate, setCurrentRequestToUpdate] = useState(null);
  const [currentUpdateStatus, setCurrentUpdateStatus] = useState('');
  const [currentRemarks, setCurrentRemarks] = useState('');
  const [updateError, setUpdateError] = useState('');

  // Data State
  const [allDonors, setAllDonors] = useState([]);
  const [donorsLoading, setDonorsLoading] = useState(true);
  const [donorsError, setDonorsError] = useState('');
  
  const [requests, setRequests] = useState([]);
  const [requestsLoading, setRequestsLoading] = useState(true);
  const [requestsError, setRequestsError] = useState('');
  
  const [donorsList, setDonorsList] = useState([]);
  const [donorsListError, setDonorsListError] = useState('');
  const [donorsListLoading, setDonorsListLoading] = useState(true);

  // Mock messages data
  const [messages] = useState([
    { id: 1, name: 'John Doe', email: 'john@example.com', message: 'I would like to donate blood urgently.', date: '2025-10-20', read: false },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', message: 'What are the requirements for blood donation?', date: '2025-10-19', read: true },
    { id: 3, name: 'Mike Johnson', email: 'mike@example.com', message: 'Can I schedule a donation appointment?', date: '2025-10-18', read: true },
  ]);

  // Hospital profile - loaded from backend
  const [hospitalProfile, setHospitalProfile] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    license: ''
  });

  // Password change state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Initialize sidebar state based on screen size
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Fetch hospital profile on mount
  useEffect(() => {
    const fetchHospitalProfile = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/hospitals/profile`, { credentials: 'include' });
        if (!response.ok) throw new Error('Failed to fetch hospital profile.');
        const data = await response.json();
        setHospitalProfile(data);
      } catch (error) {
        console.error('Failed to fetch hospital profile:', error);
      }
    };

    fetchHospitalProfile();
  }, []);

  // Fetch data on mount
  useEffect(() => {
    const fetchDonorsList = async () => {
      try {
        setDonorsListError('');
        const response = await fetch(`${API_BASE_URL}/api/donors/all`);
        if (!response.ok) throw new Error('Failed to fetch donors list.');
        const data = await response.json();
        setDonorsList(data);
      } catch (error) {
        setDonorsListError(error.message);
      } finally {
        setDonorsListLoading(false);
      }
    };
    fetchDonorsList();
  }, []);

  useEffect(() => {
    const fetchDonors = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/donors/available`);
        if (!response.ok) throw new Error('Failed to fetch available donors.');
        const data = await response.json();
        setAllDonors(data);
      } catch (err) {
        setDonorsError(err.message);
      } finally {
        setDonorsLoading(false);
      }
    };
    
    const fetchRequests = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/requests`);
        if (!response.ok) throw new Error('Failed to fetch blood requests.');
        const data = await response.json();
        setRequests(data);
      } catch (err) {
        setRequestsError(err.message);
      } finally {
        setRequestsLoading(false);
      }
    };
    
    fetchDonors();
    fetchRequests();
  }, []);

  const handleShowSuccessPopup = (message) => {
    setShowSuccessPopup({ show: true, message });
    setTimeout(() => setShowSuccessPopup({ show: false, message: '' }), 3000);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const menuItems = [
    { id: 'send-requests', label: 'Send Requests', icon: 'Send' },
    { id: 'view-requests', label: 'View Requests', icon: 'List' },
    { id: 'donor-list', label: 'Donor List', icon: 'Users' },
    { id: 'messages', label: 'Messages', icon: 'MessageSquare' },
    { id: 'profile', label: 'Update Profile', icon: 'User' },
    { id: 'change-password', label: 'Change Password', icon: 'Lock' },
  ];

  const renderActivePage = () => {
    switch (activePage) {
      case 'send-requests':
        return (
          <SendRequestPage
            allDonors={allDonors}
            donorsLoading={donorsLoading}
            donorsError={donorsError}
            setRequests={setRequests}
            handleShowSuccessPopup={handleShowSuccessPopup}
            setActivePage={setActivePage}
          />
        );
      case 'view-requests':
        return (
          <ViewRequestsPage
            requests={requests}
            requestsLoading={requestsLoading}
            requestsError={requestsError}
            setRequests={setRequests}
            handleShowSuccessPopup={handleShowSuccessPopup}
            setShowRemarksModal={setShowRemarksModal}
            setCurrentRequestToUpdate={setCurrentRequestToUpdate}
            setCurrentUpdateStatus={setCurrentUpdateStatus}
            setCurrentRemarks={setCurrentRemarks}
            setUpdateError={setUpdateError}
          />
        );
      case 'donor-list':
        return (
          <DonorListPage
            donorsList={donorsList}
            donorsListLoading={donorsListLoading}
            donorsListError={donorsListError}
          />
        );
      case 'messages':
        return <MessagesPage messages={messages} />;
      case 'profile':
        return (
          <ProfilePage
            hospitalProfile={hospitalProfile}
            setHospitalProfile={setHospitalProfile}
            handleShowSuccessPopup={handleShowSuccessPopup}
          />
        );
      case 'change-password':
        return (
          <ChangePasswordPage
            passwordData={passwordData}
            setPasswordData={setPasswordData}
            handleShowSuccessPopup={handleShowSuccessPopup}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-50">
      <SuccessPopup show={showSuccessPopup.show} message={showSuccessPopup.message} />
      
      <RemarksModal
        show={showRemarksModal}
        currentRequestToUpdate={currentRequestToUpdate}
        currentUpdateStatus={currentUpdateStatus}
        currentRemarks={currentRemarks}
        setCurrentRemarks={setCurrentRemarks}
        updateError={updateError}
        setUpdateError={setUpdateError}
        setShowRemarksModal={setShowRemarksModal}
        setRequests={setRequests}
        handleShowSuccessPopup={handleShowSuccessPopup}
      />

      <div className="flex flex-col md:flex-row overflow-x-hidden">
        <Sidebar
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          activePage={activePage}
          setActivePage={setActivePage}
          menuItems={menuItems}
          messages={messages}
          handleLogout={handleLogout}
        />

        <main className="flex-1 overflow-y-auto">
          <div className="p-4 sm:p-6 md:p-8 pt-20 md:pt-8">
            {renderActivePage()}
          </div>
        </main>
      </div>
    </div>
  );
}

export default HospitalDashboardPage;