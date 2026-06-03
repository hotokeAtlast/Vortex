# Vortex - Modern E-Commerce Platform

A full-stack e-commerce platform featuring a React frontend and Express backend, with support for multiple sellers, admin moderation, and advanced product management.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Install all dependencies (frontend + backend)
npm run setup

# Start both frontend and backend
npm run dev
```

The frontend will be available at `http://localhost:5173` and the backend API at `http://localhost:5000`.

For detailed setup instructions, see [MONOREPO_SETUP.md](MONOREPO_SETUP.md).

## 📁 Project Structure

```
vortex/
├── src/                    # React frontend
│   ├── components/        # Reusable UI components
│   ├── pages/            # Page components
│   ├── context/          # React context (Auth, Cart)
│   ├── config/           # Configuration (Firebase)
│   └── assets/           # Images and other assets
├── server/               # Express backend
│   ├── server.js         # Main server
│   ├── routes/           # API routes
│   ├── middleware/       # Express middleware
│   └── package.json      # Backend dependencies
├── public/               # Static files
├── vite.config.js        # Vite configuration
├── package.json          # Root monorepo config
└── REPORT.md             # Challenge submission report
```

## 📚 Documentation

- **[REPORT.md](REPORT.md)** - GitHub Finish-Up-A-Thon challenge submission with before/after details
- **[MONOREPO_SETUP.md](MONOREPO_SETUP.md)** - Complete setup and integration guide

## 🎯 Features

### ✅ Fully Implemented
- ✅ **Multi-Seller Marketplace** - Independent sellers can register and post products
- ✅ **Seller Portal** - Complete product management (Create, Read, Update, Delete)
- ✅ **Admin Moderation Panel** - Approve/reject sellers and products with dashboard stats
- ✅ **Role-Based Access Control** - Buyer, Seller, Admin roles with proper gating
- ✅ **User Authentication** - Firebase Auth with role-based profiles
- ✅ **Product Browsing** - Search, filter, and detailed product pages
- ✅ **Shopping Cart** - Add/remove items with quantity management
- ✅ **Razorpay Payments** - Secure payment processing with verification
- ✅ **Order Tracking** - History with stats (total orders, total spent, last order date)
- ✅ **User Profiles** - Account management with seller onboarding
- ✅ **Firestore Security Rules** - Production-ready access control
- ✅ **Responsive Design** - Mobile, tablet, and desktop optimized
- ✅ **Dark/Light Theme** - Full theme toggle support
- ✅ **Currency Formatting** - Indian Rupee (₹) with proper locale formatting

## 🛠️ Tech Stack

### Frontend
- **React 19** - UI library
- **Vite 8** - Build tool
- **TailwindCSS 4** - Styling
- **React Router v7** - Routing
- **Firebase** - Authentication & Database
- **FontAwesome** - Icons

### Backend
- **Node.js** - Runtime
- **Express.js** - Web framework
- **MongoDB** - Database (optional)
- **JWT** - Authentication
- **CORS** - Cross-origin requests

## 📝 Available Scripts

```bash
npm run dev              # Start both frontend and backend
npm run dev:frontend    # Frontend only
npm run dev:server      # Backend only
npm run build           # Build frontend for production
npm run build:server    # Build backend (if needed)
npm run lint            # Lint frontend code
npm run preview         # Preview production build
npm run setup           # Fresh install all dependencies
```

## 🔧 Configuration

### Firebase Setup

1. Create a Firebase project at [https://console.firebase.google.com](https://console.firebase.google.com)
2. Create a Firestore database (development mode for testing)
3. Copy your Firebase config to environment variables

### Environment Variables

**Frontend** - Create `.env.local`:
```
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_id
VITE_FIREBASE_APP_ID=your_app_id
```

**Backend** - Create `server/.env`:
```
PORT=5000
FRONTEND_URL=http://localhost:5173
NODE_ENV=development

# Payment Gateway
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
```

See `server/.env.example` for all available options.

### Firestore Security Rules

Deploy the Firestore rules from `firestore.rules` to your Firebase project:

1. Go to Firebase Console → Firestore Database → Rules
2. Copy contents of `firestore.rules` into the editor
3. Click "Publish"

These rules implement:
- Role-based access control (RBAC)
- Seller-owned product enforcement
- Admin moderation authority
- Public marketplace read access
- User privacy protection

### Razorpay Setup

1. Sign up at [https://razorpay.com](https://razorpay.com)
2. Get your Key ID and Key Secret from dashboard
3. Add them to `server/.env`
4. Update frontend with your Razorpay key in `src/pages/Checkout.jsx`

### Frontend API Communication

Frontend automatically proxies API requests to the backend via Vite's proxy configuration.

```javascript
// Frontend
const response = await fetch('/api/create-order');

// Gets forwarded to
// http://localhost:5000/api/create-order
```

## 🚢 Deployment

### Frontend
Currently deployed on Vercel. See `vercel.json` for configuration.

### Backend
Deploy your backend to:
- Heroku
- Railway
- Render
- AWS/Azure
- DigitalOcean

## 🤝 Contributing

Feel free to submit issues and pull requests.

## 📄 License

This project is licensed under the MIT License - see LICENSE file for details.

---