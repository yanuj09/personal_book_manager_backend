# Personal Book Manager Backend API Documentation

This document is for frontend integration.
It covers all available APIs, payloads, responses, and where each API is used in the UI flow.

## 1. Base Setup

Base URL:
- http://localhost:3567 (default)
- If PORT is set in env, use that value.

Content type:
- application/json

Authentication:
- Cookie-based JWT is supported (token cookie set on login/signup)
- Bearer token is also supported
- Protected routes accept either:
  - Cookie: token
  - Header: Authorization: Bearer <token>

CORS:
- Credentials are enabled
- Frontend should call with credentials when using cookie auth

## 2. Shared Enums and Rules

Book status values (must use exactly one):
- want_to_read
- reading
- completed

Tags input:
- Can be array: ["fiction", "sci-fi"]
- Or comma-separated string: "fiction, sci-fi"
- Backend stores tags in lowercase

No image upload:
- Backend does not accept or store book image files
- Frontend should use its own static image handling

## 3. API List

### Health

Endpoint:
- GET /health

Use in frontend:
- Optional app startup health check

Success response:
- 200
- { "status": "ok" }

---

### Auth - Sign Up

Endpoint:
- POST /auth/signup

Use in frontend:
- Login/Signup screen -> Create Account action

Request body:
- {
    "name": "Alex",
    "email": "alex@example.com",
    "password": "secret123"
  }

Validation:
- name required
- email must be valid
- password min length 6

Success response:
- 201
- {
    "message": "User registered successfully",
    "token": "<jwt>",
    "user": {
      "id": "<userId>",
      "name": "Alex",
      "email": "alex@example.com"
    }
  }

Common errors:
- 400 invalid payload
- 409 email already registered

---

### Auth - Login

Endpoint:
- POST /auth/login

Use in frontend:
- Login/Signup screen -> Login action

Request body:
- {
    "email": "alex@example.com",
    "password": "secret123"
  }

Success response:
- 200
- {
    "message": "Login successful",
    "token": "<jwt>",
    "user": {
      "id": "<userId>",
      "name": "Alex",
      "email": "alex@example.com"
    }
  }

Common errors:
- 400 invalid payload
- 401 invalid email or password

---

### Auth - Logout

Endpoint:
- POST /auth/logout

Use in frontend:
- Sidebar/Profile menu -> Logout action

Request body:
- none

Success response:
- 200
- {
    "message": "Logout successful"
  }

---

### Profile - Get Current User

Endpoint:
- GET /profile

Auth:
- Required

Use in frontend:
- Settings screen load
- User menu/profile display

Request body:
- none

Success response:
- 200
- {
    "user": {
      "id": "<userId>",
      "name": "Alex",
      "email": "alex@example.com",
      "createdAt": "2026-08-06T10:00:00.000Z"
    }
  }

Common errors:
- 401 unauthorized

---

### Profile - Update Basic Info

Endpoint:
- PATCH /profile

Auth:
- Required

Use in frontend:
- Settings screen -> Edit Name/Email

Request body (send one or both):
- {
    "name": "Alex R.",
    "email": "alexr@example.com"
  }

Validation:
- only name and email are allowed

Success response:
- 200
- {
    "message": "Profile updated successfully",
    "user": {
      "id": "<userId>",
      "name": "Alex R.",
      "email": "alexr@example.com"
    }
  }

Common errors:
- 400 invalid payload
- 409 email already in use
- 401 unauthorized

---

### Profile - Change Password

Endpoint:
- PATCH /profile/password

Auth:
- Required

Use in frontend:
- Settings screen -> Change Password action

Request body:
- {
    "currentPassword": "oldPass123",
    "newPassword": "newPass456"
  }

Validation:
- currentPassword required
- newPassword min length 6

Success response:
- 200
- {
    "message": "Password changed successfully"
  }

Common errors:
- 400 invalid payload
- 401 current password incorrect or unauthorized

---

### Books - Add Book

Endpoint:
- POST /books

Auth:
- Required

Use in frontend:
- Add New Book screen -> Save to Collection

Request body:
- {
    "title": "Project Hail Mary",
    "author": "Andy Weir",
    "description": "Optional description",
    "notes": "Optional notes",
    "tags": ["sci-fi", "fiction"],
    "status": "want_to_read"
  }

Notes:
- title and author are required
- status is optional in request, but if sent must be valid
- if status is not sent, backend model default is want_to_read
- statusHistory starts with the current status

Success response:
- 201
- {
    "message": "Book added successfully",
    "book": {
      "_id": "<bookId>",
      "userId": "<userId>",
      "title": "Project Hail Mary",
      "author": "Andy Weir",
      "description": "Optional description",
      "tags": ["sci-fi", "fiction"],
      "status": "want_to_read",
      "notes": "Optional notes",
      "statusHistory": [
        { "status": "want_to_read", "changedAt": "2026-08-06T10:00:00.000Z" }
      ],
      "createdAt": "...",
      "updatedAt": "..."
    }
  }

Common errors:
- 400 invalid payload
- 401 unauthorized

---

### Books - List / Filter / Search

Endpoint:
- GET /books

Auth:
- Required

Use in frontend:
- My Collection screen
- List section in Dashboard (if using list API instead of dashboard payload)

Query params (all optional):
- status=want_to_read|reading|completed
- tag=fiction
- search=hobbit
- page=1
- limit=20 (max 100)

Success response:
- 200
- {
    "books": [ ... ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 42,
      "totalPages": 3
    }
  }

Common errors:
- 400 invalid query params
- 401 unauthorized

---

### Books - Get Book Details

Endpoint:
- GET /books/:id

Auth:
- Required

Use in frontend:
- Book Details screen initial load

Path params:
- id: book id

Success response:
- 200
- { "book": { ...bookObject } }

Common errors:
- 400 invalid id format
- 404 book not found for this user
- 401 unauthorized

---

### Books - Update Book (Reusable API)

Endpoint:
- PATCH /books/:id

Auth:
- Required

Use in frontend:
- Book Details screen -> edit title/author/description/notes/tags
- Book Details screen -> status change
- My Collection/Dashboard quick status actions

This is the single reusable endpoint for both:
- detail edit
- status update

Request body (send only changed fields):
- {
    "title": "New Title",
    "author": "New Author",
    "description": "Updated description",
    "notes": "Updated notes",
    "tags": ["sci-fi", "favorites"],
    "status": "reading"
  }

Allowed fields:
- title
- author
- description
- notes
- tags
- status

Behavior:
- If status changes, backend appends an item in statusHistory
- If status stays same, statusHistory is unchanged

Success response:
- 200
- {
    "message": "Book updated successfully",
    "book": { ...updatedBookObject }
  }

Common errors:
- 400 invalid payload or id format
- 404 book not found for this user
- 401 unauthorized

---

### Books - Delete Book

Endpoint:
- DELETE /books/:id

Auth:
- Required

Use in frontend:
- Book Details screen -> Delete Book action

Success response:
- 200
- {
    "message": "Book deleted successfully"
  }

Common errors:
- 400 invalid id format
- 404 book not found for this user
- 401 unauthorized

---

### Books - Dashboard Summary

Endpoint:
- GET /books/dashboard

Auth:
- Required

Use in frontend:
- Dashboard screen cards and recent books strip

Success response:
- 200
- {
    "metrics": {
      "totalBooks": 124,
      "currentlyReading": 3,
      "completedBooks": 87
    },
    "books": [ ...up to 12 most recently updated books ... ]
  }

Common errors:
- 500 failed to load dashboard
- 401 unauthorized

## 4. UI Screen to API Mapping

1) Login / Signup
- Sign up: POST /auth/signup
- Login: POST /auth/login
- Logout: POST /auth/logout

2) Dashboard
- Main data: GET /books/dashboard
- Optional quick status changes: PATCH /books/:id

3) My Collection
- List/filter/search/pagination: GET /books
- Quick status update: PATCH /books/:id
- Open details: GET /books/:id

4) Add New Book
- Create book: POST /books

5) Book Details
- Load details: GET /books/:id
- Edit details: PATCH /books/:id
- Update status: PATCH /books/:id
- Delete: DELETE /books/:id

6) Settings
- Load profile: GET /profile
- Update name/email: PATCH /profile
- Change password: PATCH /profile/password
- Logout: POST /auth/logout

## 5. Recommended Frontend Calling Notes

- Prefer cookie auth for web app:
  - Always send requests with credentials enabled.
- If using bearer auth:
  - Store token safely and include Authorization header.
- For PATCH /books/:id:
  - Send only changed fields to minimize payload.
- For collection page:
  - Debounce search input before calling GET /books.
- Handle 401 globally:
  - Redirect user to login when token is missing/expired.
