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

### Current
- ✅ User authentication (Firebase)
- ✅ Product browsing and search
- ✅ Shopping cart management
- ✅ Order history and profile
- ✅ Admin product management
- ✅ Dark/light theme toggle
- ✅ Responsive design with TailwindCSS

### In Development
- 🔄 Multi-seller support
- 🔄 Seller portal and dashboard
- 🔄 Admin moderation panel
- 🔄 Enhanced UI/UX
- 🔄 Backend API modernization

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

### Environment Variables

Backend configuration in `server/.env`:
```
PORT=5000
FRONTEND_URL=http://localhost:5173
NODE_ENV=development
MONGODB_URI=your_connection_string
JWT_SECRET=your_secret_key
```

### Frontend API Communication

Frontend automatically proxies API requests to the backend via Vite's proxy configuration.

```javascript
// Frontend
const response = await fetch('/api/products');

// Gets forwarded to
// http://localhost:5000/api/products
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

Made with ❤️ for the GitHub Finish-Up-A-Thon Challenge 🚀