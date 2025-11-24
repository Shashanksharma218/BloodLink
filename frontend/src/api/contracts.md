# API Contract Summary

All endpoints are relative to API_BASE_URL (e.g., http://localhost:5555).
All requests include credentials (cookies) where authentication is required.

## Request Object Shape
```
{
  "_id": "req_abc123",
  "status": "Pending" | "Donor Accepted" | "Donor Rejected" | "Visit Scheduled" | "Donation Rejected" | "Donation Completed" | "Expired",
  "bloodGroup": "AB+",
  "urgency": "Medium" | "High" | "Urgent",
  "createdAt": "2025-10-21T10:00:00Z",
  "updatedAt": "2025-10-22T12:00:00Z",
  "deadline": "2025-10-30T00:00:00Z",
  "hospitalId": "hosp_001",
  "note": "Patient needs AB+ urgently",
  "remarks": null,
  "certificateId": null
}
```

---

## GET /api/requests/donor
Query params: `status`, `page`, `limit`, `sort`, `from`, `to`

Example:
```
GET /api/requests/donor?status=Pending&page=1&limit=10&sort=newest&from=2025-10-01&to=2025-10-31
```

Response:
```
{
  "requests": [Request, ...],
  "page": 1,
  "totalPages": 4,
  "total": 32
}
```

Notes:
- Server should auto-expire Pending requests whose deadline has passed before returning.

---

## PUT /api/requests/:id/status/donor
Payload:
```
{ "status": "Donor Accepted" | "Donor Rejected", "remarks": "optional string" }
```

Response:
```
Request (updated)
```

Server validation:
- Reject if expired.
- Reject if already actioned.

---

## GET /api/donors/:id/stats
Response:
```
{
  "totalDonations": 4,
  "certificatesCount": 4,
  "lastDonationDate": "2025-10-25T00:00:00Z",
  "nextEligibleDate": "2026-02-25T00:00:00Z",
  "badges": [{"id":"b1","title":"Bronze Donor","awardedAt":"2025-10-25T00:00:00Z"}]
}
```

---

## GET /api/hospitals/:id
Response:
```
{ "_id": "hosp_001", "name": "Govt Hospital", "contacts": [{"type":"phone","value":"9876543210"}], "address": "123 Street" }
```

---

## Notifications

### GET /api/notifications?since=ISO_TIMESTAMP
Response:
```
{ "notifications": [
  {"id":"n1","type":"new_request","requestId":"req1","createdAt":"...","read":false,"title":"New request","message":"..."}
]}
```

### POST /api/notifications/mark-read
Payload:
```
{ "ids": ["n1","n2"] }
```
Response: `{ "ok": true }`

### SSE (preferred): /api/notifications/stream
Event: `notification`, data: notification JSON

---

## POST /api/donors/:id/health
Payload:
```
{ "date":"2025-10-21", "hemoglobin": 13.2, "weight": 72, "notes": "optional" }
```
Response: saved object

---

## GET /api/certificates/:requestId
Response: PDF stream; client downloads as blob.


