## What you get

- **JWT auth**: register/login/me
- **Posts CRUD** with **ownership + Admin override**
- **Vanilla multi-page frontend** served by Express (no CORS setup needed)

## Requirements

- Node.js (LTS recommended)
- Local MongoDB running on your machine

## Setup

1) Create `backend/.env` (copy from `backend/.env.example`)

2) Install deps

```bash
cd backend
npm install
```

3) Run the backend (it also serves the frontend)

```bash
cd backend
npm run dev
```

Then open `http://localhost:4000` in your browser.

## RBAC

- Roles: `User`, `Admin`
- Default: every new account is `User`
- To test Admin behavior, manually change a user document in MongoDB:
  - `role: "Admin"`
- **Delete rule**: deleting posts is **Admin-only** (even owners can’t delete).

## API

- `POST /api/auth/register` → `{ token, user }`
- `POST /api/auth/login` → `{ token, user }`
- `GET /api/auth/me` (auth)
- `GET /api/posts` (auth)
- `POST /api/posts` (auth)
- `GET /api/posts/mine` (auth)
- `GET /api/posts/:id` (auth)
- `PUT /api/posts/:id` (auth, owner or admin)
- `DELETE /api/posts/:id` (auth, **admin only**)
