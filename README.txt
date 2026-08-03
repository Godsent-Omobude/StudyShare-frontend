# StudyShare Admin Frontend Update

## What changed
Only the admin dashboard file is changed. Your existing pages, styling system, authentication UI and other frontend files are not replaced.

Replace:
`src/pages/AdminDashboard.js`

with the supplied `AdminDashboard.js`.

### Improvements
- Keeps the existing admin layout and functionality.
- Normalises `REACT_APP_API_URL` so both of these work:
  - `http://localhost:5000`
  - `http://localhost:5000/api`
- Keeps JWT authentication through `localStorage.token`.
- Uses the existing admin endpoints only.
- Adds loading/disabled states to role-change and delete buttons so accidental double-clicks do not send duplicate requests.
- Prevents the current administrator from being demoted or deleted.
- Keeps the existing search, refresh, overview, user management, file management and developer controls.

## Required route
Your existing React router should have:

`<Route path="/admin" element={<AdminDashboard />} />`

## Required backend endpoints
The dashboard expects:

GET    /api/admin/check
GET    /api/admin/stats
GET    /api/admin/users
PATCH  /api/admin/users/:id/role
DELETE /api/admin/users/:id
GET    /api/admin/files
DELETE /api/admin/files/:id

## Environment
If using CRA, `.env` can contain:

`REACT_APP_API_URL=http://localhost:5000`

The dashboard automatically adds `/api`.

For production, set `REACT_APP_API_URL` to your backend base URL and rebuild/redeploy the frontend.

No new npm package is required.
