# 📘 Lost & Found: Technical Guide & Development Log

This document is a detailed explanation of the codebase, designed to help you understand exactly how the project works, why specific decisions were made, and how we solved the major challenges encountered during development.

---

## 🏗️ 1. Project Architecture

The project is a **MERN Stack** application (MongoDB, Express, React, Node.js) split into two distinct parts:

### **Client (`/client`)**
- **Framework**: React (using Vite for fast builds)
- **Styling**: Tailwind CSS (utility-first styling for rapid UI development)
- **Maps**: Leaflet & React-Leaflet (OpenStreetMap integration)
- **State Management**: React Context API (`AuthContext`, `ThemeContext`)

### **Server (`/server`)**
- **Runtime**: Node.js & Express.js
- **Database**: MongoDB (managed via Mongoose)
- **Real-time**: Socket.io (for chat functionality)
- **Email**: Nodemailer + Brevo API (critical for OTPs)
- **File Uploads**: Multer + Cloudinary (for storing item images)

---

## 🔑 2. Authentication & OTP System (The Biggest Challenge)

Authentication is the most complex part of this application because we need to verify that users are actual VIT students.

### **The Flow:**
1.  **Registration**: User enters details + `@vitstudent.ac.in` email.
2.  **Validation**: We check password strength (8+ chars, uppercase, lowercase, number) *before* sending OTP to save resources.
3.  **OTP Generation**: A 6-digit code is generated and stored in MongoDB (expires in 5 mins).
4.  **Email Delivery**: The system sends the code to the user's email.
5.  **Verification**: User enters code -> Server verifies -> Account created.

### **🔥 The Email Delivery Saga (Problem Solving Log)**

We faced a significant issue with sending emails on the **Render** deployment. Here's exactly what happened and how we fixed it:

*   **The Problem**: Code worked perfectly on `localhost`, but failed silently on Render.
*   **The Diagnosis**:
    *   We were initially using standard **Gmail SMTP** (port 465/587).
    *   **Cloud platforms (like Render, AWS, DigitalOcean) are blocked by Google** from using SMTP to prevent spam.
    *   This is why it worked on your local machine (home IP) but failed on the server.
*   **The Fix**:
    1.  We switched to **Brevo (formerly Sendinblue)**, which provides an **HTTP API**.
    2.  Unlike SMTP, HTTP requests look like normal web traffic and are **never blocked** by cloud providers.
    3.  We implemented a **Failover Strategy** in `authController.js`:
        *   **Primary**: Try sending via Brevo API (Reliable on Cloud).
        *   **Fallback**: If that fails (or no API key), try Gmail SMTP (Reliable on Localhost).
*   **Outcome**: Emails now work reliable on both your laptop and the deployed site.

---

## 🗺️ 3. Map Implementation

We used **Leaflet** (free, open-source) instead of Google Maps API (expensive).

*   **`MapView.jsx`**: Renders the map using `react-leaflet`.
*   **Custom Markers**: We use custom icons to differentiate "Lost" (Red) vs "Found" (Green) items.
*   **Location Picking**: When reporting an item, users can drag a marker to pinpoint exact locations. The coordinates (`lat`, `lng`) are then saved to MongoDB.

---

## 💬 4. Real-time Chat

We implemented a chat system so students can coordinate returning items without sharing phone numbers (privacy).

*   **Socket.io**: Enables real-time, bi-directional communication.
*   **Flow**:
    1.  User A finds User B's item.
    2.  User A clicks "Chat" on the item page.
    3.  A socket room is created (`roomId = item_id + user_ids`).
    4.  Messages are saved to MongoDB (`Chat` model) for history.
    5.  When a message is sent, it's pushed instantly to the other user via Socket.io.

---

## 🏆 5. Gamification System

To encourage people to report found items, we added a points system:
*   **Reporting an Item**: +10 points
*   **Returning an Item**: +50 points (verified by the owner)
*   **Badges**: Users earn titles like "Scout", "Detective", and "Sherlock" based on points.

**Code Location**: `gamificationController.js` handles point calculation and badge assignment.

---

## 🚀 6. Deployment Strategy

We split the deployment to optimize performance and costs:

*   **Backend (Render)**:
    *   Hosted as a Web Service.
    *   Running `node index.js`.
    *   Environment variables (`MONGO_URI`, `BREVO_API_KEY`) secure sensitive keys.
*   **Frontend (Vercel)**:
    *   Hosted as a Static Site.
    *   Connects to the backend via `VITE_API_URL`.

---

## 🛠️ Key Files to Know

*   **`server/controllers/authController.js`**:
    *   Contains the `requestOTP`, `register`, `login`, and email sending logic.
    *   Look here if you need to change OTP expiry or email templates.
*   **`client/src/pages/Auth/Register.jsx`**:
    *   Frontend registration form.
    *   Contains the password validation logic we added (`/[A-Z]/`, `/[0-9]/`, etc.).
*   **`server/models/Item.js`**:
    *   Database schema for lost/found items.
    *   Defines fields like `title`, `description`, `location`, `images`.

---

## 🔮 Future Improvements (If you continue working)

1.  **Push Notifications**: Using standard Web Push API for browser notifications.
2.  **AI Image Recognition**: Auto-tagging uploaded images (e.g., "black wallet").
3.  **PWA Support**: Making the site installable as a mobile app.

This project is built on solid foundations. Keep this guide handy when explaining the project to evaluators or future teammates! 🚀
