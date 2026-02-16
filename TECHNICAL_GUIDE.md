# 📘 Lost & Found: The Ultimate Technical Guide

**Access**: Personal Document for [User Name]
**Status**: Confidential / Do Not Push

This guide is your personal "brain dump" of the entire project. It explains every major component, why we built it that way, and how we solved the trickiest bugs. Use this to master the codebase or explain it to anyone who asks.

---

## 🏗️ 1. The High-Level Architecture

We built a **MERN Stack** application. Here's why and how the parts connect:

### **The Backend (`/server`)**
*   **Node.js & Express**: The brain of the operation. It handles API requests, talks to the database, and manages real-time chats.
*   **MongoDB (Atlas)**: Our cloud database. We chose NoSQL because data like "Lost Items" can have flexible fields (sometimes images, sometimes not).
*   **Socket.io**: The magic behind the real-time chat. It keeps a persistent connection open so messages fly instantly without refreshing the page.

### **The Frontend (`/client`)**
*   **React (Vite)**: We used Vite instead of Create-React-App because it's 10x faster.
*   **Tailwind CSS**: For styling. It allowed us to build the "Glassmorphism" UI and responsive layouts without writing thousands of lines of custom CSS files.
*   **Leaflet Maps**: Google Maps API costs money ($200/month credit runs out fast). Leaflet is free, open-source, and works perfectly for campus maps.

---

## 🔥 2. The Great Email Delivery Saga (And How We Fixed It)

**The Problem**:
You successfully tested the email OTPs on `localhost`. Then you deployed to Render, and suddenly—silence. No emails. No errors. Just spinning loaders.

**The Diagnosis**:
*   We were using **Nodemailer with Gmail SMTP** (port 465/587).
*   **Crucial Learning**: Cloud hosting providers (Render, AWS, DigitalOcean) **BLOCK** standard SMTP ports to prevent hackers from using their servers to send spam.
*   So, your requests were hitting a firewall and timing out.

**The Solution: Switching protocols**
We moved from **SMTP** (Email Protocol) to **HTTP** (Web Protocol).
1.  **Brevo (ex-Sendinblue)**: They offer an API that sends emails via a minimal HTTP Request.
2.  **Why it works**: To Render, sending an email via Brevo looks just like loading a webpage. It’s never blocked.

**The Code (`authController.js`)**:
We built a robust "Failover System" to handle this:
```javascript
// 1. Try Brevo HTTP API (Best for Render/Cloud)
let result = await sendViaBrevo(to, subject, htmlContent);
if (result.success) return result;

// 2. Fallback to Gmail SMTP (Best for Localhost)
// Only runs if Brevo fails or API key is missing
result = await sendViaGmail(to, subject, htmlContent);
```
*Result*: Reliable emails everywhere. Localhost uses SMTP, Render uses Brevo.

---

## � 3. Authentication & Security

We didn't just use "admin/admin". We built a secure, verify-first system.

### **Password Validation (Pre-OTP)**
*   **Issue**: Users were requesting OTPs, *then* finding out their password was too weak. Wasted OTPs.
*   **Fix**: We added Regex validation in `Register.jsx` *before* the API call:
    ```javascript
    if (!/[A-Z]/.test(password)) setError("Need uppercase letter");
    if (!/[0-9]/.test(password)) setError("Need a number");
    ```

### **OTP Security**
*   **Hashed Passwords**: We use `bcrypt` to hash passwords. Even if the DB is hacked, they only see gibberish (`$2b$10$Xy...`), not real passwords.
*   **VIT Email Only**: The regex `/@vitstudent\.ac\.in$/` ensures only campus students can sign up.

---

## 📡 4. Keeping the Server Alive (The "Sleep" Fix)

**The Problem**:
Free tier on Render "sleeps" after 15 minutes of inactivity. The first person to visit the site would have to wait 50+ seconds for it to wake up.

**The Solution (`server/cron/keepAlive.js`)**:
We wrote a script that "pokes" the server every 14 minutes.
```javascript
cron.schedule('*/14 * * * *', () => {
    https.get('https://lostandfound-2wn8.onrender.com'); // Self-ping
});
```
*Result*: The server stays awake 24/7, even on the free tier.

---

## 🗺️ 5. The Map Feature (`MapView.jsx`)

We needed a way to show *where* items were lost.
*   **Library**: `react-leaflet`
*   **Custom Icons**: We replaced the default blue pin with custom colored markers:
    *   🔴 Red = Lost Item
    *   🟢 Green = Found Item
*   **Coordinate system**: Defaults to VIT Chennai (`[12.84..., 80.15...]`) if no location is provided.

---

## �️ 6. Deployment Setup (Secrets)

### **Backend (Render)**
*   **Build Command**: `npm install`
*   **Start Command**: `node index.js`
*   **Environment vars**:
    *   `BREVO_API_KEY`: The secret key for emails.
    *   `MONGO_URI`: The connection string to Atlas.

### **Frontend (Vercel)**
*   **Build Command**: `vite build`
*   **Output Directory**: `dist`
*   **Environment vars**:
    *   `VITE_API_URL`: Points to your Render backend (`https://lostandfound-2wn8.onrender.com`).

---

## � 7. Code Walkthrough: Key Files

| File | What it does |
| :--- | :--- |
| **`server/index.js`** | The entry point. Connects DB, starts Socket.io, and runs the Keep-Alive cron. |
| **`authController.js`** | The "Security Guard". Handles Login, Register, OTP sending, and password resets. |
| **`items.js`** (Routes) | The "Trafficker". directing requests like `GET /items` or `POST /items` to the right controller. |
| **`itemController.js`**| The "Manager". Handles logic for creating items, image uploads (Cloudinary), and claiming items. |
| **`Footer.jsx`** | Updated to credit "Atman Dash & Shreyansh Jha". |

---

## � Pro Tips for You
*   **Resetting Data**: There's a script `scripts/reset_stats.js`. Run `node scripts/reset_stats.js` if you ever want to clear the "Total Items" count for a demo.
*   **Logs**: Use `pm2 logs` on the server to see real-time errors if something breaks.

This codebase is your portfolio piece. It handles real-world problems (email delivery, deployment sleep, map integration) that most student projects skip. Be proud of it! 🚀
