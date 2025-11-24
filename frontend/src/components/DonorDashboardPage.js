// frontend/src/components/DonorDashboardPage.js

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { Phone, Calendar, AlertCircle, CheckCircle, XCircle, Download, Clock, Filter, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import API_BASE_URL from '../config/api';
import { fetchRequests as apiFetchRequests, updateRequestStatus as apiUpdateRequestStatus, fetchHospitalById as apiFetchHospitalById, fetchDonorStats as apiFetchDonorStats, postHealthLog as apiPostHealthLog, fetchHealthLogs as apiFetchHealthLogs } from '../api';
import { useNotifications } from '../hooks/useNotifications';
import { FEATURES } from '../config/features';
import NotificationBell from './NotificationBell';
import NotificationCenter from './NotificationCenter';
import RejectionModal from './RejectionModal';
import HealthLogModal from './HealthLogModal';
import RequestCard from './RequestCard';

function DonorDashboardPage() {
  const { currentUser, refreshCurrentUser } = useAuth();
  
  const [isAvailable, setIsAvailable] = useState(false);
  const [requests, setRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeRequestTab, setActiveRequestTab] = useState('upcoming');
  const [showFilters, setShowFilters] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Filters / sorting / pagination
  const [statusFilter, setStatusFilter] = useState('');
  const [urgencyFilter, setUrgencyFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [sort, setSort] = useState('newest');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  // Simple caches
  const [hospitalCache, setHospitalCache] = useState(new Map());
  const [requestsCache] = useState(() => new Map());

  // Notifications / modals
  const { notifications, unread, markRead } = useNotifications({ enabled: FEATURES.NOTIFICATIONS });
  const [notifOpen, setNotifOpen] = useState(false);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectTargetId, setRejectTargetId] = useState(null);
  const [healthModalOpen, setHealthModalOpen] = useState(false);

  // Donor stats
  const [donorStats, setDonorStats] = useState(null);
  const [statsError, setStatsError] = useState('');
  const [statsLoading, setStatsLoading] = useState(false);
  const [latestHealth, setLatestHealth] = useState(null);
  const [healthLoading, setHealthLoading] = useState(false);

  const computedBadges = useMemo(() => {
    const count = donorStats?.totalDonations || 0;
    const tiers = [
      { id: 'bronze', title: 'Bronze Donor', min: 1 },
      { id: 'silver', title: 'Silver Donor', min: 5 },
      { id: 'gold', title: 'Gold Donor', min: 10 },
    ];
    const achieved = tiers.filter(t => count >= t.min);
    const nextTier = tiers.find(t => count < t.min);
    const toNext = nextTier ? Math.max(0, nextTier.min - count) : 0;
    return { achieved, nextTier, toNext };
  }, [donorStats]);

  useEffect(() => {
    if (currentUser) {
      setIsAvailable(currentUser.isAvailable);
    }
  }, [currentUser]);

  useEffect(() => {
    if (!currentUser?._id) return;
    setStatsLoading(true);
    setStatsError('');
    const ctrl = new AbortController();
    (async () => {
      try {
        const data = await apiFetchDonorStats(currentUser._id, ctrl.signal);
        setDonorStats(data);
      } catch (e) {
        if (e.name !== 'AbortError') {
          if (e.status === 404) {
            setDonorStats({ totalDonations: 0, certificatesCount: 0 });
          } else {
            setStatsError(e.message);
          }
        }
      } finally {
        setStatsLoading(false);
      }
    })();
    return () => ctrl.abort();
  }, [currentUser]);

  // Fetch latest health log
  useEffect(() => {
    if (!currentUser?._id) return;
    const ctrl = new AbortController();
    setHealthLoading(true);
    (async () => {
      try {
        const data = await apiFetchHealthLogs(currentUser._id, { limit: 1 }, ctrl.signal);
        setLatestHealth((data.logs || [])[0] || null);
      } catch (_) {}
      finally { setHealthLoading(false); }
    })();
    return () => ctrl.abort();
  }, [currentUser]);

  const getHospitalContact = useCallback(async (hospitalId) => {
    if (!hospitalId) {
      return null;
    }
    if (hospitalCache.has(hospitalId)) return hospitalCache.get(hospitalId);
    try {
      const data = await apiFetchHospitalById(hospitalId);
      const primary = (data.contacts || [])[0]?.value || null;
      setHospitalCache(prev => new Map(prev).set(hospitalId, primary));
      return primary;
    } catch (e) {
      if (e.status !== 404) {
        console.warn('Failed to fetch hospital details', e);
      }
      setHospitalCache(prev => new Map(prev).set(hospitalId, null));
      return null;
    }
  }, [hospitalCache]);

  const fetchRequests = useCallback(async () => {
    if (!currentUser?._id) return;
    setIsLoading(true);
    setError('');
    const key = JSON.stringify({ statusFilter, urgencyFilter, dateFrom, dateTo, sort, page, limit });
    const ctrl = new AbortController();
    try {
      if (requestsCache.has(key)) {
        const cached = requestsCache.get(key);
        setRequests(cached.requests);
        setTotalPages(cached.totalPages || 1);
        setIsLoading(false);
      }
      const data = await apiFetchRequests({
        status: statusFilter,
        urgency: urgencyFilter,
        sort,
        page,
        limit,
        from: dateFrom,
        to: dateTo,
      }, ctrl.signal);
      
      // Deduplicate requests by _id
      const requestsArray = data.requests || data || [];
      const uniqueRequests = Array.from(
        new Map(requestsArray.map(req => [req._id, req])).values()
      );
      
      setRequests(uniqueRequests);
      setTotalPages(data.totalPages || 1);
      requestsCache.set(key, { requests: uniqueRequests, totalPages: data.totalPages || 1 });
    } catch (err) {
      if (err.name !== 'AbortError') setError(err.message);
    } finally {
      setIsLoading(false);
    }
    return () => ctrl.abort();
  }, [currentUser, statusFilter, urgencyFilter, dateFrom, dateTo, sort, page, limit, requestsCache]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  // Lightweight realtime refresh: on window focus and periodic polling
  useEffect(() => {
    const refreshAll = () => {
      // refresh profile and requests without disrupting UI
      if (typeof refreshCurrentUser === 'function') {
        try { refreshCurrentUser(); } catch (_) {}
      }
      fetchRequests();
    };

    // Refresh when tab gains focus or becomes visible
    const onFocus = () => refreshAll();
    const onVisibility = () => { if (document.visibilityState === 'visible') refreshAll(); };
    window.addEventListener('focus', onFocus);
    document.addEventListener('visibilitychange', onVisibility);

    // Poll every 30 seconds (similar to notifications fallback cadence)
    const intervalId = setInterval(refreshAll, 30000);

    return () => {
      window.removeEventListener('focus', onFocus);
      document.removeEventListener('visibilitychange', onVisibility);
      clearInterval(intervalId);
    };
  }, [fetchRequests, refreshCurrentUser]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchRequests();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  const handleRequestAction = async (requestId, action) => {
    let newStatus;
    let remarks = '';
    
    if (action === 'accept') {
      newStatus = 'Donor Accepted';
    } else if (action === 'reject') {
      newStatus = 'Donor Rejected';
      setRejectTargetId(requestId);
      setRejectModalOpen(true);
      return;
    } else {
      return;
    }

    try {
      // Guard: prevent accepting expired requests on the client side too
      if (newStatus === 'Donor Accepted') {
        const targetRequest = requests.find(r => r._id === requestId);
        if (targetRequest && targetRequest.deadline && new Date(targetRequest.deadline) < new Date()) {
          alert('This request has expired.');
          return;
        }
      }

      // Optimistic update
      const prev = requests;
      setRequests(prev.map(req => req._id === requestId ? { ...req, status: newStatus, remarks } : req));

      const updatedRequest = await apiUpdateRequestStatus(requestId, { status: newStatus, remarks });
      setRequests(curr => curr.map(req => req._id === requestId ? { ...req, status: updatedRequest.status, remarks: updatedRequest.remarks, certificateId: updatedRequest.certificateId } : req));
    } catch (err) {
      // rollback
      setRequests(prev => prev); // no-op if using state snapshot; keeping UX simple
      setError(err.message);
    }
  };
  
  const handleAvailabilityToggle = async () => {
    const newAvailability = !isAvailable;
    setIsAvailable(newAvailability); 

    try {
      const response = await fetch(`${API_BASE_URL}/api/donors/availability`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isAvailable: newAvailability }),
        credentials: 'include'
      });

      if (!response.ok) {
        setIsAvailable(!newAvailability); 
        throw new Error('Failed to update your availability status. Please try again.');
      }
      
      await refreshCurrentUser();
      
    } catch (err) {
      setIsAvailable(!newAvailability);
      alert(err.message);
    }
  };

  const handleDownloadCertificate = async (requestId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/certificates/${requestId}`, {
        method: 'GET',
        credentials: 'include'
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to download certificate.');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `BloodDonationCertificate_${requestId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      alert(err.message);
    }
  };
  
  // Deduplicate requests and filter
  const uniqueRequests = useMemo(() => {
    return Array.from(
      new Map(requests.map(req => [req._id, req])).values()
    );
  }, [requests]);

  const pendingRequests = useMemo(() => 
    uniqueRequests.filter(req => req.status === 'Pending'),
    [uniqueRequests]
  );
  
  const upcomingDonations = useMemo(() => 
    uniqueRequests.filter(req => req.status === 'Donor Accepted' || req.status === 'Visit Scheduled'),
    [uniqueRequests]
  );
  
  const historyRequests = useMemo(() => 
    uniqueRequests.filter(req => 
      req.status === 'Donation Completed' || 
      req.status === 'Donor Rejected' || 
      req.status === 'Donation Rejected'
    ),
    [uniqueRequests]
  );

  // Certificates count should reflect completed donations, even if certificateId is missing
  const certificatesCount = useMemo(() => {
    return uniqueRequests.filter(r => r.status === 'Donation Completed').length;
  }, [uniqueRequests]);
  
  const getStatusConfig = (status) => {
    switch (status) {
      case 'Pending': return { color: 'bg-amber-50 text-amber-700 border-amber-200', icon: Clock };
      case 'Donor Accepted': return { color: 'bg-blue-50 text-blue-700 border-blue-200', icon: CheckCircle };
      case 'Visit Scheduled': return { color: 'bg-purple-50 text-purple-700 border-purple-200', icon: Calendar };
      case 'Donation Completed': return { color: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: CheckCircle };
      case 'Donor Rejected':
      case 'Donation Rejected': return { color: 'bg-red-50 text-red-700 border-red-200', icon: XCircle };
      default: return { color: 'bg-gray-50 text-gray-700 border-gray-200', icon: AlertCircle };
    }
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 via-white to-rose-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-red-200 border-t-red-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-red-50/30 via-white to-rose-50/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl py-8">
        {/* Enhanced Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Welcome back, <span className="bg-gradient-to-r from-red-600 to-rose-600 bg-clip-text text-transparent">{currentUser.fullName}</span>
              </h1>
              <p className="text-gray-600 flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                Ready to make a difference
              </p>
            </div>
            <div className="flex items-center gap-2">
              {FEATURES.NOTIFICATIONS && (
                <NotificationBell count={unread} onClick={() => setNotifOpen(true)} />
              )}
              {/* New Log button moved into Health Stats card below */}
            </div>
          </div>
        </div>

        {/* Enhanced Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Availability Card */}
          <div className="group relative bg-white rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden">
            <div className={`absolute inset-0 bg-gradient-to-br ${isAvailable ? 'from-green-500/5 to-emerald-500/5' : 'from-gray-400/5 to-gray-500/5'} opacity-0 group-hover:opacity-100 transition-opacity`}></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-md ${isAvailable ? 'bg-gradient-to-br from-green-500 to-emerald-600' : 'bg-gradient-to-br from-gray-400 to-gray-500'}`}>
                    <CheckCircle className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Availability Status</h3>
                    <p className={`text-lg font-bold ${isAvailable ? 'text-green-600' : 'text-gray-500'}`}>
                      {isAvailable ? 'Available' : 'Unavailable'}
                    </p>
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={handleAvailabilityToggle}
                className={`${isAvailable ? 'bg-green-500' : 'bg-gray-300'} relative inline-flex items-center h-7 rounded-full w-14 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 shadow-inner`}
              >
                <span className={`${isAvailable ? 'translate-x-8' : 'translate-x-1'} inline-block w-5 h-5 transform bg-white rounded-full transition-transform duration-300 shadow-md`} />
              </button>
            </div>
          </div>

          {/* Last Donation Card */}
          <div className="group relative bg-white rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative">
              <div className="flex items-center space-x-3 mb-2">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-md">
                  <Calendar className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Last Donation</h3>
                  <p className="text-lg font-bold text-gray-900">
                    {donorStats?.lastDonationDate ? new Date(donorStats.lastDonationDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Not Yet'}
                  </p>
                </div>
              </div>
              {donorStats?.nextEligibleDate && (
                <p className="text-xs text-gray-500">Next eligible: {new Date(donorStats.nextEligibleDate).toLocaleDateString()}</p>
              )}
            </div>
          </div>

          {/* Blood Group Card */}
          <div className="group relative bg-white rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-rose-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative">
              <div className="flex items-center space-x-3 mb-2">
                <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-rose-600 rounded-xl flex items-center justify-center shadow-md">
                  <span className="text-xl font-bold text-white">{currentUser.bloodGroup}</span>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Blood Group</h3>
                  <p className="text-lg font-bold text-gray-900">{currentUser.bloodGroup}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats & Badges */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Donations</h3>
            <p className="text-3xl font-extrabold text-gray-900">{donorStats?.totalDonations ?? 0}</p>
            <p className="text-xs text-gray-500 mt-1">Certificates: {certificatesCount}</p>
          </div>
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Badges</h3>
            <div className="flex flex-wrap gap-2">
              {computedBadges.achieved.map(b => (
                <span key={b.id} className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">{b.title}</span>
              ))}
              {computedBadges.nextTier && (
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-700 border">{computedBadges.nextTier.title} in {computedBadges.toNext}</span>
              )}
            </div>
          </div>
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-500">Health Stats</h3>
              {FEATURES.HEALTH_LOG && (
                <button onClick={()=>setHealthModalOpen(true)} className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-emerald-500 to-green-600 text-white text-xs shadow-sm hover:shadow-md">New Log</button>
              )}
            </div>
            {healthLoading ? (
              <p className="text-sm text-gray-500">Loading latest health data...</p>
            ) : latestHealth ? (
              <div className="text-sm text-gray-700 space-y-1">
                <p><span className="font-semibold">Date:</span> {new Date(latestHealth.date).toLocaleDateString()}</p>
                <p><span className="font-semibold">Hemoglobin:</span> {latestHealth.hemoglobin} g/dL</p>
                <p><span className="font-semibold">Weight:</span> {latestHealth.weight} kg</p>
                {latestHealth.notes && <p className="text-xs text-gray-500">{latestHealth.notes}</p>}
              </div>
            ) : (
              <p className="text-sm text-gray-500">No health logs yet. Click New Log to add one.</p>
            )}
            {statsError && <p className="text-xs text-red-600 mt-2">{statsError}</p>}
          </div>
        </div>
        
        {/* Enhanced Requests Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-bold text-gray-900">Donation Requests</h2>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="lg:hidden flex items-center gap-2 px-3 py-1.5 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                <Filter className="w-4 h-4" />
                Filters
              </button>
            </div>
          </div>

          {/* Sticky Filter Bar */}
          <div className={`sticky top-0 z-10 bg-white border-b border-gray-200 ${showFilters ? 'block' : 'hidden lg:block'}`}>
            <div className="px-6 py-3">
              <div className="flex items-center justify-between mb-2 lg:hidden">
                <span className="text-sm font-medium text-gray-700">Filters</span>
                <button onClick={() => setShowFilters(false)} className="p-1 hover:bg-gray-100 rounded"><X className="w-4 h-4" /></button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2">
                <select value={statusFilter} onChange={(e)=>{ setStatusFilter(e.target.value); setPage(1); }} className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500">
                  <option value="">All Status</option>
                  <option>Pending</option>
                  <option>Donor Accepted</option>
                  <option>Visit Scheduled</option>
                  <option>Donation Completed</option>
                  <option>Donor Rejected</option>
                  <option>Donation Rejected</option>
                  <option>Expired</option>
                </select>
                <select value={urgencyFilter} onChange={(e)=>{ setUrgencyFilter(e.target.value); setPage(1); }} className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500">
                  <option value="">All Urgency</option>
                  <option>Medium</option>
                  <option>High</option>
                  <option>Urgent</option>
                </select>
                <input type="date" value={dateFrom} onChange={(e)=>{ setDateFrom(e.target.value); setPage(1); }} className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500" aria-label="From date" title="From date" />
                <input type="date" value={dateTo} onChange={(e)=>{ setDateTo(e.target.value); setPage(1); }} className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500" aria-label="To date" title="To date" />
                <select value={sort} onChange={(e)=>{ setSort(e.target.value); setPage(1); }} className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500">
                  <option value="newest">Newest</option>
                  <option value="oldest">Oldest</option>
                  <option value="deadline">Deadline</option>
                </select>
              </div>
            </div>
          </div>

          {/* Enhanced Tabs */}
          <nav className="flex border-b border-gray-100 px-6 overflow-x-auto bg-gray-50/50">
            <button 
              onClick={() => setActiveRequestTab('upcoming')} 
              className={`relative py-4 px-4 font-semibold transition-all duration-300 whitespace-nowrap text-sm ${
                activeRequestTab === 'upcoming' 
                  ? 'text-red-600' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <span className="flex items-center gap-2">
                Upcoming
                <span className={`${activeRequestTab === 'upcoming' ? 'bg-red-100 text-red-700' : 'bg-gray-200 text-gray-600'} text-xs px-2.5 py-1 rounded-full font-bold transition-colors`}>
                  {upcomingDonations.length}
                </span>
              </span>
              {activeRequestTab === 'upcoming' && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-red-500 to-rose-500"></span>
              )}
            </button>
            <button 
              onClick={() => setActiveRequestTab('available')} 
              className={`relative ml-6 py-4 px-4 font-semibold transition-all duration-300 whitespace-nowrap text-sm ${
                activeRequestTab === 'available' 
                  ? 'text-red-600' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <span className="flex items-center gap-2">
                Available
                <span className={`${activeRequestTab === 'available' ? 'bg-red-100 text-red-700' : 'bg-gray-200 text-gray-600'} text-xs px-2.5 py-1 rounded-full font-bold transition-colors`}>
                  {pendingRequests.length}
                </span>
              </span>
              {activeRequestTab === 'available' && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-red-500 to-rose-500"></span>
              )}
            </button>
            <button 
              onClick={() => setActiveRequestTab('history')} 
              className={`relative ml-6 py-4 px-4 font-semibold transition-all duration-300 whitespace-nowrap text-sm ${
                activeRequestTab === 'history' 
                  ? 'text-red-600' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <span className="flex items-center gap-2">
                History
                <span className={`${activeRequestTab === 'history' ? 'bg-red-100 text-red-700' : 'bg-gray-200 text-gray-600'} text-xs px-2.5 py-1 rounded-full font-bold transition-colors`}>
                  {historyRequests.length}
                </span>
              </span>
              {activeRequestTab === 'history' && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-red-500 to-rose-500"></span>
              )}
            </button>
          </nav>

          {/* Content Area with Animation */}
          <div className="p-6">
            {isLoading ? (
              <div className="text-center py-16">
                <div className="w-16 h-16 border-4 border-red-200 border-t-red-600 rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-600 font-medium">Loading your requests...</p>
              </div>
            ) : error ? (
              <div className="text-center py-16">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertCircle className="w-8 h-8 text-red-600" />
                </div>
                <p className="text-red-600 font-semibold">{error}</p>
              </div>
            ) : (
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeRequestTab}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-4"
                >
                {/* Available Requests */}
                {activeRequestTab === 'available' && (
                  pendingRequests.length > 0 ? (
                    pendingRequests.map(request => (
                      <RequestCard
                        key={request._id}
                        request={request}
                        getHospitalContact={getHospitalContact}
                        getStatusConfig={getStatusConfig}
                        onAccept={(id) => handleRequestAction(id, 'accept')}
                        onReject={(id) => handleRequestAction(id, 'reject')}
                      />
                    ))
                  ) : (
                    <div className="text-center py-16">
                      <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <AlertCircle className="w-10 h-10 text-gray-400" />
                      </div>
                      <p className="text-gray-500 font-medium">No new donation requests available</p>
                      <p className="text-sm text-gray-400 mt-2">Check back later for opportunities to help</p>
                    </div>
                  )
                )}

                {/* Upcoming Donations */}
                {activeRequestTab === 'upcoming' && (
                  upcomingDonations.length > 0 ? (
                    upcomingDonations.map(request => (
                      <RequestCard
                        key={request._id}
                        request={request}
                        getHospitalContact={getHospitalContact}
                        getStatusConfig={getStatusConfig}
                      />
                    ))
                  ) : (
                    <div className="text-center py-16">
                      <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Calendar className="w-10 h-10 text-gray-400" />
                      </div>
                      <p className="text-gray-500 font-medium">No upcoming donations scheduled</p>
                      <p className="text-sm text-gray-400 mt-2">Accept available requests to schedule donations</p>
                    </div>
                  )
                )}

                {/* History */}
                {activeRequestTab === 'history' && (
                  historyRequests.length > 0 ? (
                    historyRequests.map(request => (
                      <RequestCard
                        key={request._id}
                        request={request}
                        getHospitalContact={getHospitalContact}
                        getStatusConfig={getStatusConfig}
                        onDownloadCertificate={handleDownloadCertificate}
                      />
                    ))
                  ) : (
                    <div className="text-center py-16">
                      <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Clock className="w-10 h-10 text-gray-400" />
                      </div>
                      <p className="text-gray-500 font-medium">Your donation history is empty</p>
                      <p className="text-sm text-gray-400 mt-2">Completed donations will appear here</p>
                    </div>
                  )
                )}

                {/* Pagination */}
                <div className="mt-6 flex items-center justify-between">
                  <div className="text-sm text-gray-600">Page {page} of {totalPages}</div>
                  <div className="flex gap-2">
                    <button disabled={page<=1} onClick={()=>setPage((p)=>Math.max(1,p-1))} className="px-3 py-1 border rounded-lg disabled:opacity-50">Prev</button>
                    <button disabled={page>=totalPages} onClick={()=>setPage((p)=>Math.min(totalPages,p+1))} className="px-3 py-1 border rounded-lg disabled:opacity-50">Next</button>
                  </div>
                </div>
                </motion.div>
              </AnimatePresence>
            )}
          </div>
        </div>

        {/* Modals and Notification Center */}
        <RejectionModal
          open={rejectModalOpen}
          onClose={()=>{ setRejectModalOpen(false); setRejectTargetId(null); }}
          onSubmit={async (remarks) => {
            const targetId = rejectTargetId;
            setRejectModalOpen(false);
            setRejectTargetId(null);
            if (!targetId) return;
            // optimistic reject
            setRequests(prev => prev.map(r => r._id===targetId? { ...r, status:'Donor Rejected', remarks } : r));
            try {
              await apiUpdateRequestStatus(targetId, { status:'Donor Rejected', remarks });
            } catch (e) {
              setError(e.message);
            }
          }}
        />
        <HealthLogModal
          open={healthModalOpen}
          onClose={()=>setHealthModalOpen(false)}
          onSubmit={async (healthData) => {
            try {
              await apiPostHealthLog(currentUser._id, healthData);
              setHealthModalOpen(false);
              // Refresh latest health
              try {
                const data = await apiFetchHealthLogs(currentUser._id, { limit: 1 });
                setLatestHealth((data.logs || [])[0] || null);
              } catch (_) {}
            } catch (e) {
              setError(e.message);
            }
          }}
        />
        {FEATURES.NOTIFICATIONS && (
          <NotificationCenter
            open={notifOpen}
            notifications={notifications}
            onClose={()=>setNotifOpen(false)}
            onMarkRead={(ids)=>markRead(ids)}
          />
        )}
      </div>
    </main>
  );
}

export default DonorDashboardPage;