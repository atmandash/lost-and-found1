# 🔍 Lost & Found - VIT Chennai Campus

A dedicated platform for VIT Chennai students to report, track, and recover lost items on campus. Built to replace chaotic WhatsApp groups with a structured, verified, and efficient system.

![Lost & Found Banner](https://via.placeholder.com/1200x600?text=Lost+%26+Found+-+VIT+Chennai)

## 🚀 Features

### Core Functionality
- **Verified Access**: Registration is restricted to `@vitstudent.ac.in` email addresses only.
- **Report Lost/Found Items**: Easy-to-use forms to report items with images, descriptions, and locations.
- **Interactive Map**: View lost and found items pinned on a campus map for easy location tracking.
- **Smart Matching**: Automatic suggestions when a reported "found" item matches a "lost" item description.
- **Secure Communication**: Built-in chat system to coordinate item recovery without sharing personal phone numbers.
- **Anonymous Reporting**: Option to report items anonymously (your contact details are hidden unless you choose to share them).

### User Experience
- **Gamification**: Earn points and badges (e.g., "Good Samaritan") for helping others find their items. Leaderboard tracks top contributors.
- **Real-time Notifications**: Get email alerts and in-app notifications for item matches and chat messages.
- **Mobile Responsive**: Fully optimized for verified mobile browsers.

### Security
- **OTP Verification**: Secure login and registration with email OTP verification.
- **Rate Limiting**: Protection against spam and abuse.
- **Data Privacy**: Contact details are private by default.

## 🛠️ Tech Stack

- **Frontend**: React (Vite), Tailwind CSS, Framer Motion, Leaflet (Maps)
- **Backend**: Node.js, Express.js
- **Database**: MongoDB (Atlas)
- **Authentication**: JWT, Brevo (Email OTP)
- **Image Storage**: Cloudinary
- **Deployment**: Render (Backend), Vercel (Frontend)

## 📂 Project Structure

```
lost-and-found/
├── client/                 # React Frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Application pages (Home, Login, Map, etc.)
│   │   ├── context/        # React Context (Auth, Theme)
│   │   └── utils/          # Helper functions
│   └── public/             # Static assets
├── server/                 # Node.js Backend
│   ├── controllers/        # Business logic
│   ├── models/             # Mongoose schemas (User, Item, Chat, etc.)
│   ├── routes/             # API routes
│   └── middleware/         # Auth & upload middleware
└── README.md               # Project documentation
```

## 🔧 Installation & Setup

### Prerequisites
- Node.js (v18+)
- MongoDB Atlas Account
- Cloudinary Account
- Brevo Account (for emails)

### 1. Clone the Repository
```bash
git clone https://github.com/atmandash/lost-and-found1.git
cd lost-and-found1
```

### 2. Backend Setup
```bash
cd server
npm install
```
Create a `.env` file in the `server` directory:
```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
EMAIL_USER=your_email@gmail.com
EMAIL_APP_PASSWORD=your_app_password
BREVO_API_KEY=your_brevo_api_key
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
CLIENT_URL=http://localhost:5173
```
Start the server:
```bash
npm start
```

### 3. Frontend Setup
```bash
cd ../client
npm install
```
Create a `.env` file in the `client` directory:
```env
VITE_API_URL=http://localhost:5000
```
Start the frontend:
```bash
npm run dev
```

## 🤝 Contributing

This project is open for contributions! Feel free to open issues or submit pull requests.

## 📄 License

This project is licensed under the ISC License.

## 👥 Credits

Made with ❤️ by **Atman Dash** & **Shreyansh Jha** for VIT Chennai.
