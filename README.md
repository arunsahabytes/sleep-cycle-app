# Sleep Cycle App

A full-stack web application for tracking and analyzing sleep patterns. Built with React (frontend) and Node.js/Express (backend) with MongoDB database.

## 🚨 **IMPORTANT: Before GitHub Upload**

**You MUST remove sensitive data from `.env` files before uploading:**

1. **Temporarily rename your `.env` files:**
   ```bash
   mv backend/.env backend/.env.backup
   mv frontend/.env frontend/.env.backup
   ```

2. **After uploading, restore them:**
   ```bash
   mv backend/.env.backup backend/.env
   mv frontend/.env.backup frontend/.env
   ```

## 🏗️ Project Structure

```
sleep-cycle-app/
├── frontend/                 # React application
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── context/         # React context
│   │   ├── services/        # API services
│   │   └── assets/          # Static assets
│   └── package.json
├── backend/                  # Node.js/Express server
│   ├── routes/              # API routes
│   ├── models/              # MongoDB models
│   ├── middleware/          # Custom middleware
│   ├── server.js            # Main server file
│   └── package.json
└── README.md
```

## 🛠️ Tech Stack

**Frontend:** React 18, Vite, Tailwind CSS, React Router, Framer Motion
**Backend:** Node.js, Express, MongoDB, Mongoose, JWT, bcryptjs

## 🚀 Quick Start

### Option 1: Auto Setup
```bash
# Windows
setup.bat

# Mac/Linux
chmod +x setup.sh
./setup.sh
```

### Option 2: Manual Setup

1. **Install dependencies:**
   ```bash
   cd backend && npm install
   cd ../frontend && npm install
   ```

2. **Create environment files:**

   **backend/.env:**
   ```env
   PORT=5000
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   ```

   **frontend/.env:**
   ```env
   VITE_API_URL=http://localhost:5000/api
   ```

3. **Start the servers:**
   ```bash
   # Terminal 1 - Backend
   cd backend && npm run dev

   # Terminal 2 - Frontend  
   cd frontend && npm run dev
   ```

4. **Open:** http://localhost:5173

## 📁 API Endpoints

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/sleep` - Get sleep records
- `POST /api/sleep` - Add sleep record
- `PUT /api/sleep/:id` - Update sleep record
- `DELETE /api/sleep/:id` - Delete sleep record

## 🔧 Scripts

**Backend:**
- `npm start` - Production server
- `npm run dev` - Development server

**Frontend:**
- `npm run dev` - Development server
- `npm run build` - Production build
- `npm run preview` - Preview build

## 🚀 Deployment

**Backend:** Deploy to Heroku/Railway with environment variables
**Frontend:** Deploy to Vercel/Netlify (update `VITE_API_URL` to production backend)

---

**Happy coding! 😴💤**
