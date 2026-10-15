# 🚀 SliceCraft Pizza — Complete Local & Vercel Deployment Guide

Welcome! This guide explains step-by-step how to run both Backend and Frontend in **VS Code**, connect to **MongoDB Atlas**, and link/deploy to **Vercel** with full production readiness.

---

## 💻 1. How to Run in VS Code (Local Development)

You can run both Frontend and Backend with **a single command** or in **two separate terminals**.

### Option A: Single Command (Easiest & Recommended)
1. Open the project folder in VS Code (`d:\OIBSIP`).
2. Open the integrated terminal (`Ctrl + ~` or Terminal ➔ New Terminal).
3. Run:
   ```bash
   npm run dev
   ```
   - This starts both the Express backend on `http://localhost:5000` and the Vite React frontend on `http://localhost:5173` concurrently.
   - The database automatically connects to your local MongoDB or boots the embedded database with pre-seeded pizzas and inventory!

### Option B: Two Separate VS Code Terminals
If you want to view logs separately:
- **Terminal 1 (Backend):**
  ```bash
  npm run dev:backend
  ```
  Runs on: `http://localhost:5000` (Health check: `http://localhost:5000/api/health`)

- **Terminal 2 (Frontend):**
  ```bash
  npm run dev:frontend
  ```
  Runs on: `http://localhost:5173`

---

## 🗄️ 2. Real Database Setup (MongoDB Atlas for Production)

For local development, the system already has automatic embedded database fallback on `D:` drive.
For a permanent live database that never resets when deployed on Vercel:

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) (Free).
2. Create a free **M0 Sandbox Cluster**.
3. Under **Database Access**, create a user (e.g. `pizzadmin` with a password).
4. Under **Network Access**, click **Add IP Address** ➔ Select **Allow Access from Anywhere (`0.0.0.0/0`)** (required for cloud hosting like Vercel/Render).
5. Click **Connect** ➔ **Drivers** (Node.js) ➔ Copy the connection string:
   ```env
   mongodb+srv://pizzadmin:<password>@cluster0.abcde.mongodb.net/pizzadb?retryWrites=true&w=majority
   ```
6. Paste this URI into:
   - Your local `backend/.env` file (`MONGODB_URI=...`)
   - Your production backend environment variables.
7. Run the seed script once to populate menu items & inventory:
   ```bash
   npm run seed
   ```

---

## 🌐 3. How to Deploy to Vercel

### Step 1: Push your Code to GitHub
Open VS Code terminal:
```bash
git add .
git commit -m "feat: complete advance pizza delivery app with vercel readiness"
git push origin main
```

---

### Step 2: Deploy Frontend on Vercel
1. Log in to [vercel.com](https://vercel.com).
2. Click **Add New...** ➔ **Project**.
3. Import your GitHub repository (`OIBSIP`).
4. In **Project Configuration**:
   - **Framework Preset**: `Vite`
   - **Root Directory**: Click `Edit` and select `frontend` (or keep root, `vercel.json` will handle it).
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Under **Environment Variables**, add:
   | Key | Value Example | Description |
   | :--- | :--- | :--- |
   | `VITE_API_BASE_URL` | `https://your-backend-url.onrender.com/api` | Your live backend API URL |
   | `VITE_SOCKET_URL` | `https://your-backend-url.onrender.com` | Your live Socket.IO URL |
6. Click **Deploy**! 🚀
   - Thanks to `frontend/vercel.json`, all routes like `/menu`, `/builder`, `/admin/login`, `/track/:id` work cleanly on page reload without 404 errors.

---

### Step 3: Hosting the Backend (Render / Railway / VPS)
Because the app features real-time **Socket.IO order tracking** and **node-cron scheduled low-stock alerts**, deploying the backend on a persistent Node.js host (like [Render.com](https://render.com) Free Tier) is recommended:

1. Go to [Render.com](https://render.com) and create a **New Web Service**.
2. Connect your GitHub repository.
3. Settings:
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Start Command**: `node src/server.js`
4. Add Environment Variables:
   - `NODE_ENV=production`
   - `PORT=5000`
   - `FRONTEND_URL=https://your-frontend.vercel.app` (Your Vercel URL)
   - `MONGODB_URI=your_mongodb_atlas_connection_string`
   - `JWT_SECRET=your_strong_random_secret_string`
   - `RAZORPAY_KEY_ID=rzp_test_...`
   - `RAZORPAY_KEY_SECRET=...`
5. Click **Create Web Service**.
   - Copy your Render URL (e.g. `https://slicecraft-api.onrender.com`) and paste it into Vercel's `VITE_API_BASE_URL` as `https://slicecraft-api.onrender.com/api`!

---

## 🔒 4. Production Accounts (No Demo Login)

As requested, all dummy demo credential pills and auto-fill buttons have been **completely removed**.
You can create real accounts with your own phone numbers and worldwide country codes, or log in with your seeded administrator account:

### Admin Access:
- **URL**: `/admin/login`
- **Identifier**: `kankush1907@gmail.com` or Mobile: `+919876543210`
- **Password**: `Ankush143@`

### Customer Registration & Verification:
- Register on `/register` with your name, real phone number (selecting your country code like `+91`), email, and password.
- Verification link is sent to the registered email address.
- Click the email link or test in development via the terminal log link.

---

## 🧪 5. Automated Verification Status
- ✅ **Backend Tests**: 17/17 passed (`npm run test:backend`)
- ✅ **Frontend Tests**: 11/11 passed (`npm run test:frontend`)
- ✅ **Production Build**: Vite compiled successfully in 4.43s (`npm run build`)
