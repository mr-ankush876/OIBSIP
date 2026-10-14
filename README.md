# 🍕 SliceCraft Pizza — Full-Stack Pizza Delivery & Inventory Web Application
### OIBSIP Task 1 — Connected MERN Stack Application

A production-grade, full-stack Pizza Delivery and Inventory Management Web Application built for the **OIBSIP Internship Task 1**. Featuring a handcrafted custom pizza builder with exactly 5 bases and 5 sauces, Razorpay test-mode payment gateway with cryptographic HMAC-SHA256 signature verification, real-time order tracking via Socket.IO, automated node-cron low-stock email alerts, global multilingual support (with mandatory first-visit modal and RTL layout mirroring), and a floating, draggable WhatsApp support widget.

---

## 🌟 Key Features

### 👤 Customer Experience
- **Customer Registration & Email Verification**: Secure registration with bcrypt password hashing, cryptographically random SHA-256 tokens, Nodemailer email verification links, token expiration, and unverified user access blocking.
- **Session Authentication & Password Recovery**: JWT session handling stored in secure cookies and headers, rate-limiting on sensitive endpoints, forgot-password flow with one-time reset tokens.
- **Artisan Pizza Menu**: Live menu fetched from MongoDB with search, category filtering (Veg, Special, Bestseller), and instant add-to-cart.
- **Custom 4-Step Pizza Builder**:
  - **Step 1: Base** — Exactly 5 artisan bases (*Thin Crust*, *Cheese Burst*, *Hand Tossed*, *Pan Crust*, *Gluten Free*).
  - **Step 2: Sauce** — Exactly 5 gourmet sauces (*Classic Marinara*, *Spicy Peri-Peri*, *Creamy Garlic Alfredo*, *Tangy BBQ*, *Pesto Basil*).
  - **Step 3: Cheese** — *Mozzarella*, *Cheddar*, *Parmesan*, *Four Cheese Blend*, *Vegan Cheese*.
  - **Step 4: Vegetables** — Multi-selection of farm-fresh toppings (*Black Olives*, *Bell Peppers*, *Mushrooms*, *Red Onions*, *Jalapenos*, *Sweet Corn*, *Fresh Tomatoes*, *Baby Spinach*).
  - **Authoritative Server Pricing**: Real-time frontend price preview, with authoritative price recalculation strictly enforced by the backend against database prices.
- **Cart & Order Summary**: Persistent cart across navigation and language switching, GST 5% calculation, dynamic delivery fee (FREE for orders over ₹500), and delivery address collection.
- **Razorpay Test-Mode Payments**: Server-side order generation in paise, Razorpay modal checkout, and cryptographic HMAC-SHA256 signature verification (`orderId|paymentId`) on the backend.
- **Real-Time Order Tracking**: Visual 4-step progress timeline (*Order Received* ➔ *In Kitchen* ➔ *Sent to Delivery* ➔ *Delivered*) powered by authenticated Socket.IO rooms with automatic 5-second polling fallback.

### 🛡️ Store Administration & Inventory
- **Separate Admin Portal**: Isolated administrator login with server-side `ADMIN` role verification (no public registration).
- **Admin Inventory Dashboard**: Live tracking of stock levels for all bases, sauces, cheeses, and vegetables with threshold indicators (*In Stock*, *Low Stock*, *Out of Stock*).
- **Manual Stock Adjustments & Movement Audit**: Restock modal with reason tracking (*RESTOCK*, *MANUAL_ADJUSTMENT*, *ORDER_CANCELLATION*), quantity delta, and persistent `InventoryLog` audit trail.
- **Atomic Stock Management**: Safe inventory deduction upon verified payment; duplicate deduction prevention; automatic stock restoration on cancelled orders.
- **Scheduled Low-Stock Email Alerts**: `node-cron` scheduled monitoring task with persistent alert state, 24-hour notification deduplication to avoid email spam, and alert re-arming upon restock. Includes a protected manual test endpoint.
- **Admin Order Management**: Status filter, detailed custom pizza ingredient breakdown, customer contact info, and transition validation (enforces *Order Received* ➔ *In Kitchen* ➔ *Sent to Delivery* ➔ *Delivered*). Updates broadcast immediately to customer devices in real time.

### 🌐 Global Multilingual & RTL System
- **No Three-Language Limit**: Support across major world and Indian regional languages (English, Hindi, Punjabi, Urdu, Arabic, Spanish, French, German, Bengali, Tamil, Telugu, Marathi, Gujarati, Kannada, Malayalam, and more).
- **Mandatory First-Visit Language Selection**: Full-page barrier shown to first-time visitors before accessing the store, featuring a searchable language selector with native and English names, and a disabled Continue button until a selection is confirmed.
- **Bidirectional & RTL Support**: Dynamic text direction and layout mirroring (`dir="rtl"`) for Arabic, Urdu, Hebrew, and Persian.
- **Persistent State**: Language changes preserve cart items, active sessions, and checkout progress.

### 💬 Floating Draggable WhatsApp Customer Support
- **Draggable Anywhere**: Pointer and touch event handling allowing users to position the widget anywhere within viewport boundaries, with automatic clamping on window resize or device rotation.
- **Drag vs Click Differentiation**: Strict 5px movement threshold prevents accidental WhatsApp URL opening during a drag gesture.
- **Position Persistence & Reset**: Coordinates stored in `localStorage` with a quick "Reset Position" button.
- **Official Click-to-Chat**: Generates `https://wa.me/{phone}?text={encoded}` with localized prefilled messages in the user's active language.
- **Order-Specific Assistance**: Includes direct "Get help with this order" action from the tracking timeline with customer ownership verification.

---

## 🛠️ Mandatory Tech Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 18, Vite, React Router 6, CSS3 Design Tokens, Lucide Icons |
| **Backend** | Node.js, Express.js |
| **Database** | MongoDB with Mongoose ORM |
| **Authentication** | JWT (JSON Web Tokens), bcryptjs, HTTP-only Cookies |
| **Payments** | Razorpay Test Mode (HMAC-SHA256 signature verification) |
| **Real-time** | Socket.IO (Authenticated rooms & real-time events) |
| **Scheduling** | node-cron (Automated low-stock inventory scanner) |
| **Email Service** | Nodemailer (Verification, reset, low-stock alerts) |
| **i18n & RTL** | i18next, react-i18next, native language catalogue |
| **Testing** | Jest, Supertest, MongoMemoryServer, Vitest, Testing Library |

---

## 📁 Project Structure

```
d:/OIBSIP/
├── backend/
│   ├── src/
│   │   ├── config/          # Database, Razorpay, and Nodemailer configs
│   │   ├── controllers/     # Auth, Pizza, Order, Payment, Admin controllers
│   │   ├── middleware/      # JWT auth, Admin role guards, Rate limiters, Error handler
│   │   ├── models/          # User, Pizza, Ingredient, Order, InventoryLog, AuditLog
│   │   ├── routes/          # Express route definitions
│   │   ├── scripts/         # Repeatable seed script (seed.js)
│   │   ├── services/        # Inventory deduction, node-cron monitor, Socket.IO
│   │   ├── app.js           # Express app middleware assembly
│   │   └── server.js        # Server startup with HTTP, Socket.IO & Cron
│   ├── tests/               # Backend automated tests (13 test cases)
│   ├── package.json
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── api/             # Axios client with interceptors
│   │   ├── components/      # Common (Navbar, Footer, LanguageModal, DraggableWhatsApp), Builder, Tracking
│   │   ├── context/         # AuthContext, CartContext, LanguageContext, SocketContext
│   │   ├── i18n/            # Language catalogue, i18next configuration, locale dictionaries
│   │   ├── pages/           # Home, Menu, Builder, Cart, Checkout, Success, Tracking, Auth, Admin
│   │   ├── styles/          # Design system CSS tokens & responsive rules
│   │   ├── tests/           # Frontend Vitest test suite (7 test cases)
│   │   ├── App.jsx          # Route declarations & layout
│   │   └── main.jsx         # React DOM mounting
│   ├── vite.config.js
│   ├── index.html
│   └── package.json
├── package.json             # Root orchestrator (concurrently)
├── .env.example             # Root environment blueprint
├── .gitignore
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** (v18.0.0 or higher recommended, tested on Node v25.9.0)
- **npm** (v9.0.0 or higher)
- **MongoDB** (Local MongoDB instance or free MongoDB Atlas cloud URI)

---

### Step 1: Clone and Configure Environment

```bash
git clone https://github.com/your-username/OIBSIP.git
cd OIBSIP
```

Copy `.env.example` to `backend/.env`:

```bash
cp .env.example backend/.env
```

Ensure the configuration variables in `backend/.env` match your environment:

```env
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
MONGODB_URI=mongodb://localhost:27017/pizzadb

JWT_SECRET=super_secret_jwt_key_change_in_production_1234567890
JWT_EXPIRES_IN=7d

# Razorpay Test Mode Credentials (get from dashboard.razorpay.com)
RAZORPAY_KEY_ID=rzp_test_YourKeyHere
RAZORPAY_KEY_SECRET=YourSecretHere

# Nodemailer SMTP (or fallback development console logger)
SMTP_HOST=smtp.ethereal.email
SMTP_PORT=587
SMTP_USER=your_smtp_user@ethereal.email
SMTP_PASS=your_smtp_password
ADMIN_ALERT_EMAIL=admin@slicecraftpizza.com

# Initial Administrator Bootstrap
INITIAL_ADMIN_EMAIL=admin@pizzadelivery.com
INITIAL_ADMIN_PASSWORD=AdminSecure@12345

# WhatsApp Customer Support Phone (Country code without + or spaces)
WHATSAPP_SUPPORT_PHONE=919876543210
```

---

### Step 2: Install Dependencies

From root directory:
```bash
# Install backend dependencies
cd backend && npm install

# Install frontend dependencies
cd ../frontend && npm install

# Return to root
cd ..
```

---

### Step 3: Seed Database with Initial Catalogue & Admin

Populate the database with the initial 5 bases, 5 sauces, cheeses, vegetables, chef pizzas, and bootstrap administrator:

```bash
npm run seed
```

> **Default Seed Accounts:**
> - **Administrator**: `admin@pizzadelivery.com` / `AdminSecure@12345`
> - **Verified Customer**: `customer@slicecraftpizza.com` / `CustomerPass@123`

---

### Step 4: Run the Application

You can start both backend and frontend concurrently:

```bash
npm run dev
```

Or run them in separate terminals:

```bash
# Terminal 1: Backend API Server (Port 5000)
cd backend && npm run dev

# Terminal 2: Frontend Vite Server (Port 5173)
cd frontend && npm run dev
```

Open your browser at **`http://localhost:5173`**.

---

## 🧪 Running Automated Tests

All tests run in deterministic isolation using embedded in-memory MongoDB without requiring an external running daemon:

```bash
# Run both Backend & Frontend test suites
npm run test

# Run Backend tests only (Jest & Supertest - 13 tests)
npm run test:backend

# Run Frontend tests only (Vitest - 7 tests)
npm run test:frontend

# Build frontend for production
npm run build
```

---

## 📡 REST API Reference Overview

### Authentication (`/api/auth`)
- `POST /api/auth/register` — Register a customer account and dispatch verification email.
- `GET  /api/auth/verify-email?token=` — Activate account using cryptographic token.
- `POST /api/auth/resend-verification` — Resend activation email.
- `POST /api/auth/login` — Customer login (enforces verified email check).
- `POST /api/auth/admin-login` — Dedicated store administrator login.
- `POST /api/auth/logout` — Invalidate session cookies.
- `GET  /api/auth/me` — Return current authenticated profile.
- `PUT  /api/auth/language` — Persist preferred language on user account.
- `POST /api/auth/forgot-password` — Dispatch secure password reset link.
- `PUT  /api/auth/reset-password` — Set new password using reset token.

### Pizza & Custom Builder (`/api/pizzas`)
- `GET  /api/pizzas` — Retrieve pizzas with search, category (`Veg`, `Special`, etc.), and sorting.
- `GET  /api/pizzas/ingredients` — Retrieve categorized ingredient catalog (5 bases, 5 sauces, cheeses, veggies).
- `POST /api/pizzas/custom-price` — Authoritative price calculation and stock verification for selected ingredients.
- `GET  /api/pizzas/:id` — Retrieve specific pizza details with populated recipe ingredients.

### Orders (`/api/orders`)
- `POST /api/orders` — Create new order with server price validation and stock check.
- `GET  /api/orders/my-orders` — Retrieve authenticated customer's order history.
- `GET  /api/orders/:id` — Retrieve order details (customer ownership or admin guard).
- `POST /api/orders/:id/cancel` — Cancel order and restore ingredient inventory.

### Payments (`/api/payments`)
- `POST /api/payments/create-order` — Create Razorpay order in paise for pending order.
- `POST /api/payments/verify` — Verify HMAC-SHA256 signature, mark order paid, and atomically deduct inventory.

### Admin Operations (`/api/admin`)
- `GET  /api/admin/stats` — Revenue, orders breakdown, kitchen queue, and low-stock count.
- `GET  /api/admin/inventory` — View stock levels and thresholds for all ingredients.
- `PUT  /api/admin/inventory/:id` — Manually adjust stock with reason and movement logging.
- `GET  /api/admin/inventory/logs` — Paginated inventory audit trail.
- `POST /api/admin/inventory/test-alert` — Trigger on-demand low-stock scanner and test email dispatch.
- `GET  /api/admin/orders` — Manage all customer orders with filtering and search.
- `PUT  /api/admin/orders/:id/status` — Enforce valid status transition and emit real-time Socket.IO notification.

### Public Config (`/api/config`)
- `GET  /api/config` — Safe public configurations (WhatsApp phone, Razorpay public key, currency).

---

## 🔒 Security & Data Integrity Highlights

1. **Cryptographic Signatures**: Razorpay payments are strictly verified on the backend using `crypto.createHmac('sha256', secret)` before setting order status to `COMPLETED` and before deducting inventory.
2. **Authoritative Financial Calculations**: All item prices, subtotals, GST (5%), delivery fees, and total amounts are computed authoritatively on the server from database records. Client-provided prices are never trusted.
3. **Atomic Stock Management**: Ingredients are decremented using atomic queries `{ stockQuantity: { $gte: quantity } }` to eliminate overselling and concurrent race conditions.
4. **Role-Based Guards**: Admin endpoints are protected by `requireAdmin` middleware enforcing server-side `req.user.role === 'ADMIN'`. Customer orders enforce ownership checks (`order.customer === req.user._id`).
5. **Rate Limiting & Headers**: Sensitive authentication and password reset routes apply rate limiters; `helmet` secures HTTP response headers.

---

## 🌐 Internationalization & WhatsApp Support Details

- **Initial Selection**: First-time visitors without a saved language preference are presented with the full-page selection modal. The "Continue to Store" button is disabled until a language is chosen.
- **RTL Mirroring**: Selecting an RTL language (e.g. Arabic, Urdu) dynamically updates `<html dir="rtl">` and triggers CSS layout mirroring.
- **Draggable WhatsApp**: Users can drag the WhatsApp floating bubble anywhere in the viewport with touch or mouse. Bounds clamping prevents the bubble from moving off-screen, and a movement threshold prevents accidental clicks during dragging.

---

## 📜 Submission Details

- **Internship**: Oasis Infobyte SIP (OIBSIP)
- **Task Number**: Task 1 — Pizza Delivery Full-Stack Application
- **Repository Name**: `OIBSIP`
