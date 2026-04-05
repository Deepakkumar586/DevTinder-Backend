# DevTinder Backend

A Node.js backend for a developer connection platform built with Express and MongoDB. The API provides authentication, profile management, connection requests, email verification, password reset, and contact form support.

## 🚀 Project Overview

This backend powers a social connection platform where developers can:

- Sign up and log in with secure password hashing
- Verify their email using OTP
- Reset passwords using email-based reset tokens
- View and update their profile
- Discover other users in a feed
- Send and respond to connection requests
- Submit contact messages through a contact form

## 🧱 Technology Stack

- Node.js
- Express 5
- MongoDB with Mongoose
- JWT authentication via cookies
- Bcrypt password hashing
- Nodemailer for email delivery
- dotenv for configuration
- CORS enabled for frontend integration

## 📁 Project Structure

- `server.js` — main application entry point
- `src/config/db.js` — MongoDB connection setup
- `src/config/mail.js` — Nodemailer transport configuration
- `src/routes/` — Express routes for auth, profile, requests, and users
- `src/controllers/` — request handlers and business logic
- `src/middlewares/auth.js` — JWT cookie authentication middleware
- `src/models/` — Mongoose schemas for users, OTPs, connections, and contacts
- `src/utils/` — validation utilities and OTP generator

## ✅ Features

### Authentication

- `POST /api/auth/signup` — register a new user
- `POST /api/auth/login` — login and set a cookie token
- `POST /api/auth/logout` — clear login cookie

### Email Verification & OTP

- `POST /api/auth/sendOtp` — send OTP to a verified user email
- `POST /api/auth/verify-otp` — verify the OTP and mark email verified

### Password Recovery

- `POST /api/auth/forgot-password` — request a reset link by email
- `POST /api/auth/reset-password/:resetToken` — reset password with a valid token

### Profile Management

- `GET /api/profile` — fetch current user profile
- `PATCH /api/update/profile` — update profile fields

### Connection Requests and Social Feed

- `GET /api/user/requests/recieved` — list pending connection requests
- `GET /api/user/connections` — list accepted connections
- `GET /api/feed` — fetch users not yet connected or requested
- `POST /api/request/send/:status/:toUserId` — send connection request with status `interested` or `ignored`
- `POST /api/request/respond/:status/:requestId` — respond to a request with `accepted` or `rejected`

### Contact Form

- `POST /api/auth/contactus` — save contact submission and send confirmation emails

## 🔐 Authentication Details

- JWT is issued in the login controller and stored in a cookie named `token`
- Protected routes require `userAuth` middleware
- `userAuth` verifies the JWT and loads the user from MongoDB

## 💡 Validation Rules

- Signup requires `firstName`, `lastName`, `emailId`, and `password`
- `emailId` must be a valid email
- `password` must be strong according to validator rules
- Profile update accepts only `age`, `gender`, `about`, `location`, `photoUrl`, and `skills`
- Connection request statuses allowed for sending: `ignored`, `interested`
- Response statuses allowed for review: `accepted`, `rejected`

## 🛠️ Setup and Run

1. Install dependencies:

```bash
npm install
```

2. Create a `.env` file in the project root with:

```env
MONGO_URI=your_mongodb_connection_string
Secret_KEY=your_jwt_secret
MAIL_USER=your_email@gmail.com
MAIL_PASS=your_email_password_or_app_password
```

3. Start the server:

```bash
npm run dev
```

4. The API runs on:

```text
http://localhost:3000
```

> Note: CORS is configured for `http://localhost:5173` by default.

## 📌 Environmental Variables

- `MONGO_URI` — MongoDB connection string
- `Secret_KEY` — JWT signing secret
- `MAIL_USER` — sender email address for Nodemailer
- `MAIL_PASS` — sender email password or app-specific password

## 🧪 Recommended Frontend Flow

- Register user via `/api/auth/signup`
- Login via `/api/auth/login`
- Send OTP from `/api/auth/sendOtp`
- Verify email via `/api/auth/verify-otp`
- Manage profile through `/api/profile` and `/api/update/profile`
- Use `/api/feed` to find users and `/api/request/send/...` to connect
- Review incoming connections via `/api/user/requests/recieved`

## 🚧 Notes

- The email verification OTP expires in 5 minutes
- Password reset token expires in 5 minutes
- Feed pagination supports `page` and `limit` query parameters
- Users cannot send connection requests to themselves

## 📫 Contact

For support or feature suggestions, use the contact form endpoint:

- `POST /api/auth/contactus`

---

Built for developer networking and social matching with secure authentication, email flows, and real-time connection management.