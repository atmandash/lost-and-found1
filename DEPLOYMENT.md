# Lost & Found - Production Deployment Guide

## Quick Start (Development)

### Option 1: Use the startup script (Recommended)
```bash
./start-app.sh
```

This will start both frontend and backend automatically.

### Option 2: Manual startup
```bash
# Terminal 1 - Backend
cd server
npm start

# Terminal 2 - Frontend  
cd client
npm run dev
```

## Production Deployment

### Environment Variables
Ensure these are set in your production environment:
- `PORT` - Server port (default: 5000)
- `MONGO_URI` - MongoDB connection string
- `JWT_SECRET` - Secret key for JWT tokens (use a strong random string)
- `NODE_ENV` - Set to `production`
- `EMAIL_USER` - Gmail address for sending emails
- `EMAIL_APP_PASSWORD` - Gmail app password

### Deployment Platforms

#### Render / Railway / Heroku
1. Connect your GitHub repository
2. Set environment variables in the dashboard
3. Build command: `cd server && npm install`
4. Start command: `cd server && npm start`

#### VPS (DigitalOcean, AWS, etc.)
1. Install Node.js and MongoDB
2. Clone the repository
3. Create `.env` file with production values
4. Install PM2: `npm install -g pm2`
5. Start with PM2: `pm2 start server/index.js --name lost-and-found`
6. Setup nginx as reverse proxy

### Frontend Deployment (Netlify / Vercel)
1. Build command: `cd client && npm run build`
2. Publish directory: `client/dist`
3. Add environment variable: `VITE_API_URL=https://your-backend-url.com`

## Troubleshooting

### Server won't start
- Check if port 5000 is already in use: `lsof -i:5000`
- Kill existing process: `lsof -ti:5000 | xargs kill -9`
- Verify `.env` file exists with all required variables

### Login fails
- Ensure backend server is running on port 5000
- Check browser console for connection errors
- Verify JWT_SECRET is set in `.env`

### Database connection fails
- Verify MONGO_URI is correct
- Check MongoDB Atlas network access (whitelist your IP)
- Ensure database user has proper permissions

## Monitoring & Logs

### View server logs
```bash
# If using PM2
pm2 logs lost-and-found

# If using startup script
tail -f server/server.log
```

### Health check
```bash
curl http://localhost:5000/api/stats/global
```

Should return JSON with statistics if server is healthy.
