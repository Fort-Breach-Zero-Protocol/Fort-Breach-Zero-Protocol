# Backend Explanation

This document explains the full backend implementation for the project. It covers architecture, environment variables, each source file, API endpoints, authentication flow, data models, and notes about edge cases and suggested improvements.

---

## Overview

- Stack: Node.js + Express + MongoDB (via Mongoose).
- Purpose: Provide user registration, login, profile retrieval and logout with JWT-based authentication and a token blacklist.
- Main entry points: `server.js` (starts HTTP server) and `app.js` (Express app and routing).

## Environment variables

- `DB_CONNECT` — MongoDB connection URI used in `db/db.js`.
- `JWT_SECRET` — Secret used to sign JWT tokens in `models/user.model.js`.
- `PORT` — Optional server port (defaults to `3000` in `server.js`).

Ensure these variables are provided (for example in a `.env` file) before running the server.

---

## Files and responsibilities

- [server.js](server.js):
  - Creates an HTTP server around the Express `app` exported by `app.js`.
  - Reads `process.env.PORT` or defaults to `3000`.

- [app.js](app.js):
  - Loads `dotenv`, connects to MongoDB, registers middleware and routes.
  - Middlewares used: `cors`, `express.json()`, `express.urlencoded()`, `cookie-parser`.
  - Registers base route `GET /` which returns `hello world` and mounts `userRoutes` at `/user`.

- [db/db.js](db/db.js):
  - Exports `connectToDb()` which uses `mongoose.connect(process.env.DB_CONNECT)`.
  - Logs success or errors to console.

- [routes/user.routes.js](routes/user.routes.js):
  - Defines the user-related routes and basic request validations via `express-validator`.
  - Endpoints:
    - `POST /user/register` — validation: `fullname.firstname` min 2, `password` min 6.
    - `POST /user/login` — validation: `username` min 3, `password` min 6.
    - `GET /user/profile` — protected by `auth.middleware.authUser`.
    - `GET /user/logout` — protected by `auth.middleware.authUser`.

- [controllers/user.controller.js](controllers/user.controller.js):
  - `registerUser(req, res, next)`: validates input, hashes password via `userModel.hashPassword`, calls `UserService.createUser` to create a user, generates a token with `user.generateAuthToken()` and responds with `{ token, user }` and HTTP 201.
  - `loginUser(req, res, next)`: validates input, finds user by `username` (including `password` with `.select('+password')`), compares password with `user.comparePassword`, generates token, sets cookie `token`, and responds with `{ token, user }`.
  - `getUserProfile(req, res, next)`: returns `req.user` (populated by the auth middleware).
  - `logoutUser(req, res, next)`: clears the cookie `token`, retrieves token and stores it in blacklist collection to prevent reuse.

- [services/user.service.js](services/user.service.js):
  - `createUser({firstname, lastname, username, birthdate, password})`: minimal service that validates required fields and calls `userModel.create()` to persist the user document.

- [models/user.model.js](models/user.model.js):
  - Defines the Mongoose schema for users with fields:
    - `fullname.firstname` (required, min length 2)
    - `fullname.lastname` (min length 2)
    - `username` (required, unique, min length 3)
    - `birthdate` (required)
    - `password` (required, select: false, min length 6)
  - Methods and statics:
    - `generateAuthToken()` — signs a JWT with `{ _id: this._id }`, expiry `24h` using `process.env.JWT_SECRET`.
    - `comparePassword(password)` — bcrypt compare against saved hash.
    - `hashPassword(password)` — bcrypt salt+hash helper used during registration.

- [models/blacklistToken.model.js](models/blacklistToken.model.js):
  - Schema has `token` (unique, required) and `createdAt` with TTL index `expires: 86400` seconds (24h). This stores invalidated tokens so they cannot be re-used after logout.

- [middlewares/auth.middleware.js](middlewares/auth.middleware.js):
  - `authUser(req, res, next)` reads a token from `req.cookies.token` or `Authorization` header (expects `Bearer <token>`).
  - Checks blacklist (intended to prevent use of invalidated tokens).
  - Verifies JWT via `jwt.verify(token, process.env.JWT_SECRET)` and loads the user with `userModel.findById(decoded._id)`.
  - If verification succeeds, attaches the user object to `req.user` and calls `next()`; otherwise responds with HTTP 401.

---

## API endpoints summary

- POST `/user/register` — Body example:

```json
{
  "fullname": { "firstname": "Alice", "lastname": "Smith" },
  "username": "alice",
  "birthdate": "2000-01-01",
  "password": "hunter2"
}
```

- POST `/user/login` — Body example:

```json
{
  "username": "alice",
  "password": "hunter2"
}
```

- GET `/user/profile` — Requires valid cookie `token` or Authorization header `Bearer <token>`.
- GET `/user/logout` — Invalidates current token (stores it in the blacklist) and clears cookie.

---

## Authentication and tokens

- Tokens are JWTs signed with `JWT_SECRET` and expire in 24 hours.
- Tokens are delivered as:
  - A cookie named `token` (server sets cookie in `loginUser`), and
  - A JSON response property `token` so the frontend can also store or use it in headers.
- On logout the token is stored in `BlackListToken` collection; the TTL on that collection removes the blacklist entry after 24 hours (matching the token expiry window).

## Important implementation details and issues (observations)

1. Blacklist check bug in `auth.middleware.js`:
   - The middleware calls `const isBlackListed = await userModel.findOne({token:token});` but the blacklist model is `blackListToken.model.js`. This is incorrect and will not detect blacklisted tokens. It should query the blacklist model, not `userModel`.

2. Token retrieval in `logoutUser`:
   - `logoutUser` clears the cookie first with `res.clearCookie('token');` and then does `const token = req.cookies.token || req.headers.authorization.split(' ')[1];`.
   - If the cookie is cleared before reading it from `req.cookies`, `req.cookies.token` will be undefined. Also `req.headers.authorization` may be undefined and calling `.split(' ')[1]` will throw an exception. Safer code should read the token first, then clear the cookie, and defensively check `req.headers.authorization` exists.

3. Blacklist TTL and token expiry alignment:
   - Blacklist items expire after 86400 seconds (24 hours) which matches the JWT expiry. This is reasonable if tokens are always 24h; if token expiry were changed the TTL would need to be adjusted.

4. Error handling and status codes:
   - Most controllers return 400 for validation errors and 401 for authentication errors. Some service-level errors (e.g. thrown in `createUser`) are not caught inside controllers — Express will send a 500 unless there is an error handler middleware.

5. Password storage and selection:
   - The `password` field is `select:false` by default; controllers that need the password use `.select('+password')` when querying.

6. Username uniqueness:
   - The schema marks `username` as `unique: true`. If a duplicate username is attempted at creation, MongoDB will produce an error; the service does not catch and translate that error to a friendly 409 response currently.

7. Minor validation message inconsistencies:
   - Some validation messages refer to username length in the password validation rule (`withMessage('Username must be at least 3 characters long')`), likely copy-paste mistakes in the validation messages.

---

## Suggested improvements

- Fix blacklist check in `auth.middleware.js` to use the blacklist model (import and query `BlackListToken`).
- In `logoutUser`, read the token safely from `req.cookies` or headers before clearing the cookie, and guard against missing `authorization` header.
- Add a centralized error-handling middleware to format and log errors (use Express error handler with 4 args).
- Add uniqueness error handling in `UserService.createUser` to return a 409 conflict when `username` already exists.
- Consider HTTP-only, secure cookie flags when setting the cookie (e.g., `res.cookie('token', token, { httpOnly: true, secure: true, sameSite: 'lax' })`).
- Add rate-limiting / brute-force protection on `POST /user/login`.
- Add logging and more robust input validation (e.g., stricter birthdate format checks).

---

## Where to look for related code

- Express app: [app.js](app.js)
- Server start: [server.js](server.js)
- Database connect: [db/db.js](db/db.js)
- Routes: [routes/user.routes.js](routes/user.routes.js)
- Controllers: [controllers/user.controller.js](controllers/user.controller.js)
- Services: [services/user.service.js](services/user.service.js)
- Models: [models/user.model.js](models/user.model.js), [models/blacklistToken.model.js](models/blacklistToken.model.js)
- Middleware: [middlewares/auth.middleware.js](middlewares/auth.middleware.js)

---

If you want, I can:

- Patch the reported bugs (fix blacklist check and make `logoutUser` safer) and add an error handler.
- Add tests for the auth flow.

Created: `explain.md` in the backend folder.