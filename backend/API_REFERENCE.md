# API Reference

Dokumentasi lengkap untuk semua endpoint API di backend.

| Method | URL Path | Deskripsi | Request Parameters (Header/Body) | Contoh Response JSON |
| :--- | :--- | :--- | :--- | :--- |
| **AUTH** | | | | |
| POST | `/api/auth/register` | Mendaftarkan user baru | **Body (JSON):**<br>`username`: string<br>`email`: string<br>`password`: string<br>`role`: string<br>`division`: string (opt)<br>`region`: string (opt) | `{"id": "...", "username": "...", "email": "...", "account_status": "pending"}` |
| POST | `/api/auth/login` | Login user | **Body (JSON):**<br>`email`: string<br>`password`: string | `{"access_token": "...", "token_type": "bearer", "user": {...}}` |
| GET | `/api/auth/me` | Get current user info | **Header:** `Authorization: Bearer <token>` | `{"id": "...", "username": "...", "role": "..."}` |
| PUT | `/api/auth/profile` | Update user profile | **Header:** `Authorization: Bearer <token>`<br>**Body (JSON):**<br>`username`: string (opt)<br>`new_password`: string (opt) | `{"message": "Profile updated successfully"}` |
| POST | `/api/auth/profile/photo` | Upload profile photo | **Header:** `Authorization: Bearer <token>`<br>**Form-Data:**<br>`photo`: file | `{"message": "Profile photo updated successfully", "photo_data": "base64..."}` |
| POST | `/api/auth/fcm-token` | Register FCM token | **Header:** `Authorization: Bearer <token>`<br>**Body (JSON):**<br>`token`: string | `{"message": "FCM token registered successfully"}` |routes (atau folder API-mu)
| **ACCOUNTS** | | | | |
| GET | `/api/accounts/pending` | Get pending approvals | **Header:** `Authorization: Bearer <token>` | `[{"id": "...", "username": "...", "account_status": "pending"}]` |
| POST | `/api/accounts/review` | Approve/Reject account | **Header:** `Authorization: Bearer <token>`<br>**Body (JSON):**<br>`user_id`: string<br>`action`: "approve"/"reject" | `{"message": "Account approved"}` |
| **SITES** | | | | |
| GET | `/api/sites` | Get all sites | **Header:** `Authorization: Bearer <token>`<br>**Query:** `page`, `limit` | `{"items": [{"id": "...", "name": "..."}], "total": 10}` |
| POST | `/api/sites` | Create new site | **Header:** `Authorization: Bearer <token>`<br>**Body (JSON):**<br>`name`: string<br>`location`: string | `{"message": "Site created successfully", "id": "..."}` |
| GET | `/api/sites/{site_id}` | Get site details | **Header:** `Authorization: Bearer <token>` | `{"id": "...", "name": "...", "location": "..."}` |
| PUT | `/api/sites/{site_id}` | Update site | **Header:** `Authorization: Bearer <token>`<br>**Body (JSON):**<br>`name`: string (opt) | `{"message": "Site updated successfully"}` |
| DELETE | `/api/sites/{site_id}` | Delete site | **Header:** `Authorization: Bearer <token>` | `{"message": "Site deleted successfully"}` |
| **SCHEDULES** | | | | |
| POST | `/api/schedules` | Create schedule | **Header:** `Authorization: Bearer <token>`<br>**Body (JSON):**<br>`user_ids`: list<br>`title`: string<br>`start_date`: iso_date | `{"message": "...", "ids": [...]}` |
| POST | `/api/schedules/bulk-upload` | Bulk upload schedules | **Header:** `Authorization: Bearer <token>`<br>**Form-Data:**<br>`file`: csv/xlsx | `{"message": "Bulk upload completed...", "created_count": 5}` |
| GET | `/api/schedules` | Get schedules | **Header:** `Authorization: Bearer <token>`<br>**Query:** `region` | `[{"id": "...", "title": "...", "start_date": "..."}]` |
| PUT | `/api/schedules/{schedule_id}` | Update schedule | **Header:** `Authorization: Bearer <token>`<br>**Body (JSON):**<br>`title`: string (opt) | `{"message": "Schedule updated successfully"}` |
| DELETE | `/api/schedules/{schedule_id}` | Delete schedule | **Header:** `Authorization: Bearer <token>` | `{"message": "Schedule deleted successfully"}` |
| **ACTIVITIES** | | | | |
| GET | `/api/activities/today` | Get today's tasks | **Header:** `Authorization: Bearer <token>` | `[{"id": "...", "title": "...", "activity_status": "..."}]` |
| POST | `/api/activities` | Record activity action | **Header:** `Authorization: Bearer <token>`<br>**Body (JSON):**<br>`schedule_id`<br>`action_type` (start/finish/etc) | `{"message": "Activity recorded successfully", "status": "In Progress"}` |
| POST | `/api/activities/progress-update` | Add progress update | **Header:** `Authorization: Bearer <token>`<br>**Form-Data:**<br>`activity_id`<br>`update_text`<br>`file` (opt) | `{"message": "Progress update added successfully"}` |
| **REPORTS** | | | | |
| POST | `/api/reports` | Create report | **Header:** `Authorization: Bearer <token>`<br>**Form-Data:**<br>`title`<br>`file` (pdf)<br>`site_id` | `{"message": "Report submitted successfully", "id": "..."}` |
| GET | `/api/reports` | Get reports list | **Header:** `Authorization: Bearer <token>`<br>**Query:** `page`, `site_id`, `division` | `{"items": [{"id": "...", "title": "..."}], "total": ...}` |
| GET | `/api/reports/{report_id}` | Get report detail | **Header:** `Authorization: Bearer <token>` | `{"id": "...", "title": "...", "comments": [...]}` |
| POST | `/api/reports/approve` | Approve report | **Header:** `Authorization: Bearer <token>`<br>**Body (JSON):**<br>`report_id`<br>`action` (approve/revisi) | `{"message": "Report approved", "new_status": "Final"}` |
| **TICKETS** | | | | |
| POST | `/api/tickets` | Create ticket | **Header:** `Authorization: Bearer <token>`<br>**Body (JSON):**<br>`title`<br>`description`<br>`priority` | `{"message": "Ticket created successfully", "id": "..."}` |
| GET | `/api/tickets` | Get tickets | **Header:** `Authorization: Bearer <token>`<br>**Query:** `page`, `site_id` | `{"items": [{"id": "...", "title": "..."}], "total": ...}` |
| **NOTIFICATIONS** | | | | |
| GET | `/api/notifications` | Get notifications | **Header:** `Authorization: Bearer <token>` | `[{"id": "...", "message": "..."}]` |
| **DASHBOARD** | | | | |
| GET | `/api/dashboard` | Get dashboard stats | **Header:** `Authorization: Bearer <token>` | `{"schedules_today": [...], "pending_approvals": [...]}` |
| **STARLINKS** | | | | |
| GET | `/api/starlinks` | Get starlinks | **Header:** `Authorization: Bearer <token>` | `[{"id": "...", "name": "...", "expiration_date": "..."}]` |
| **MORNING BRIEFING** | | | | |
| POST | `/api/morning-briefing` | Upload briefing PDF | **Header:** `Authorization: Bearer <token>`<br>**Form-Data:**<br>`file`<br>`date` | `{"message": "...", "url": "..."}` |
| GET | `/api/morning-briefing/{date}` | Get briefing PDF | **Header:** `Authorization: Bearer <token>` | `{"url": "/uploads/..."}` |
