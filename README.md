# personal_book_manager_backend

Personal Book Manager backend built with Node.js, Express, MongoDB, and JWT auth.

## Setup

1. Install dependencies:

```bash
npm install
```

2. Add environment variables in `.env`:

```env
PORT=4000
DATA_BASE_STRING=mongodb://127.0.0.1:27017/personal_book_manager
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:3000
NODE_ENV=development
```

3. Run the server:

```bash
npm run dev
```

## API Summary

Base URL: `http://localhost:4000`

Authentication is supported with either:

- `HttpOnly` cookie named `token`
- `Authorization: Bearer <jwt>` header

### Auth

- `POST /auth/signup`
	- body: `{ "name": "Alex", "email": "alex@example.com", "password": "secret123" }`
- `POST /auth/login`
	- body: `{ "email": "alex@example.com", "password": "secret123" }`
- `POST /auth/logout`

### Profile

- `GET /profile`
- `PATCH /profile`
	- body (any): `{ "name": "Alex R.", "email": "alexr@example.com" }`
- `PATCH /profile/password`
	- body: `{ "currentPassword": "old", "newPassword": "new123456" }`

### Books

- `POST /books`
	- json fields:
		- `title` (required)
		- `author` (required)
		- `description` (optional)
		- `notes` (optional)
		- `tags` (array or comma-separated string)
		- `status`: `want_to_read | reading | completed`
- `GET /books`
	- query params (optional):
		- `status`
		- `tag`
		- `search`
		- `page`
		- `limit`
- `GET /books/:id`
- `PATCH /books/:id`
	- single reusable endpoint for both:
		- editing book details
		- updating book status
- `DELETE /books/:id`

### Dashboard

- `GET /books/dashboard`
	- returns:
		- `metrics.totalBooks`
		- `metrics.currentlyReading`
		- `metrics.completedBooks`
		- recent `books`

### Health

- `GET /health`
