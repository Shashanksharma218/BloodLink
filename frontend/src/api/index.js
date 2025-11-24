import API_BASE_URL from '../config/api';

function toQuery(params = {}) {
  const cleaned = Object.fromEntries(
    Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== '')
  );
  const qs = new URLSearchParams(cleaned).toString();
  return qs ? `?${qs}` : '';
}

async function handleResponse(res) {
  const contentType = res.headers.get('content-type') || '';
  const isJson = contentType.includes('application/json');
  const data = isJson ? await res.json().catch(() => ({})) : null;
  if (!res.ok) {
    const message = (data && (data.message || data.error)) || `Request failed (${res.status})`;
    const err = new Error(message);
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}

export function fetchRequests({ status, urgency, page = 1, limit = 10, sort = 'newest', from, to } = {}, signal) {
  const qs = toQuery({ status, urgency, page, limit, sort, from, to });
  return fetch(`${API_BASE_URL}/api/requests/donor${qs}`, { credentials: 'include', signal })
    .then(handleResponse);
}

export function updateRequestStatus(requestId, { status, remarks }, signal) {
  return fetch(`${API_BASE_URL}/api/requests/${requestId}/status/donor`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ status, remarks }),
    signal,
  }).then(handleResponse);
}

export function fetchDonorStats(donorId, signal) {
  return fetch(`${API_BASE_URL}/api/donors/${donorId}/stats`, {
    credentials: 'include',
    signal,
  }).then(handleResponse);
}

export function fetchHospitalById(hospitalId, signal) {
  return fetch(`${API_BASE_URL}/api/hospitals/${hospitalId}`, { credentials: 'include', signal })
    .then(handleResponse);
}

export function fetchNotifications({ since } = {}, signal) {
  const qs = toQuery({ since });
  return fetch(`${API_BASE_URL}/api/notifications${qs}`, { credentials: 'include', signal })
    .then(handleResponse);
}

export function postHealthLog(donorId, healthData, signal) {
  return fetch(`${API_BASE_URL}/api/donors/${donorId}/health`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(healthData),
    signal,
  }).then(handleResponse);
}

export function fetchHealthLogs(donorId, { limit = 1 } = {}, signal) {
  const qs = toQuery({ limit });
  return fetch(`${API_BASE_URL}/api/donors/${donorId}/health${qs}`, {
    credentials: 'include',
    signal,
  }).then(handleResponse);
}

export function downloadCertificate(requestId, signal) {
  return fetch(`${API_BASE_URL}/api/certificates/${requestId}`, { credentials: 'include', signal })
    .then(async (res) => {
      if (!res.ok) throw new Error('Failed to download certificate');
      const blob = await res.blob();
      return blob;
    });
}


