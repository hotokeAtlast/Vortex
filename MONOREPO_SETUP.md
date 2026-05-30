# Vortex Monorepo Setup Guide

## Project Structure

```
vortex/
├── src/                          # React frontend source
├── server/                       # Express backend server
│   ├── server.js                # Main server entry point
│   ├── package.json             # Backend dependencies
│   ├── .env.example             # Environment variables template
│   └── routes/                  # API route handlers (create as needed)
├── public/                       # Static assets
├── vite.config.js               # Vite frontend configuration
├── package.json                 # Root monorepo configuration
└── README.md
```

## Setup Instructions

### 1. **Initial Setup**

First time setup - installs both frontend and backend dependencies:

```bash
npm run setup
```

This is equivalent to:
```bash
npm install
cd server && npm install
```

### 2. **Running Development Mode**

To start both frontend and backend simultaneously:

```bash
npm run dev
```

This will:
- Start the React frontend on `http://localhost:5173` (Vite default)
- Start the Express server on `http://localhost:5000`
- Frontend automatically proxies API calls to the backend (configured in `vite.config.js`)

### 3. **Running Individually (Optional)**

**Frontend only:**
```bash
npm run dev:frontend
```

**Backend only:**
```bash
npm run dev:server
```

### 4. **Building for Production**

```bash
npm run build                # Build frontend
npm run build:server         # Build backend (if needed)
```

---

## Integrating Your Existing Backend

If you have an existing backend repository, here's how to integrate it:

### Step 1: Copy Your Backend Code
1. Go to your backend repository
2. Copy all backend files (except `.git` and `node_modules`)
3. Paste them into the `server/` folder
4. Replace `server/server.js` with your main entry point (if different)

### Step 2: Update `server/package.json`
Make sure your backend's `package.json` has:
- A `"dev"` script (for development)
- A `"start"` script (for production)
- All necessary dependencies listed

Example:
```json
{
  "scripts": {
    "dev": "node --watch server.js",
    "start": "node server.js"
  }
}
```

### Step 3: Create `.env` File in `server/`
Copy `.env.example` to `.env` and configure your backend:

```bash
cp server/.env.example server/.env
```

Then edit `server/.env` with your actual values:
```
PORT=5000
FRONTEND_URL=http://localhost:5173
NODE_ENV=development
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
```

### Step 4: Update `vite.config.js` (if needed)
The current proxy is already configured to forward all `/api` requests to the backend:

```javascript
server: {
  proxy: {
    '/api': {
      target: 'http://localhost:5000',
      changeOrigin: true,
    }
  }
}
```

This means frontend API calls like `fetch('/api/products')` will be proxied to `http://localhost:5000/api/products`.

---

## API Communication

### Frontend → Backend Calls

In your React components, make API calls like this:

```javascript
// This automatically proxies to http://localhost:5000/api/products
const response = await fetch('/api/products');
const data = await response.json();
```

### CORS Configuration

The backend is already configured with CORS to accept requests from the frontend:

```javascript
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));
```

---

## Common Commands

| Command | Purpose |
|---------|---------|
| `npm run dev` | Start both frontend and backend |
| `npm run dev:frontend` | Frontend only (port 5173) |
| `npm run dev:server` | Backend only (port 5000) |
| `npm run build` | Build frontend for production |
| `npm run setup` | Fresh install of all dependencies |
| `npm run lint` | Lint frontend code |

---

## File Structure for Backend Routes

Recommended structure for organizing your backend:

```
server/
├── server.js              # Main entry point
├── package.json
├── .env
├── .env.example
├── routes/
│   ├── auth.js           # Authentication endpoints
│   ├── products.js       # Product endpoints
│   ├── sellers.js        # Seller endpoints
│   ├── orders.js         # Order endpoints
│   └── admin.js          # Admin moderation endpoints
├── middleware/
│   ├── auth.js           # JWT verification
│   ├── errorHandler.js   # Error handling
│   └── logger.js         # Logging
├── models/
│   ├── User.js
│   ├── Product.js
│   ├── Order.js
│   └── Seller.js
├── controllers/
│   ├── authController.js
│   ├── productController.js
│   └── orderController.js
└── config/
    └── database.js
```

---

## Troubleshooting

### Backend not connecting to frontend
- Ensure backend is running on port 5000
- Check vite.config.js proxy settings
- Verify CORS is enabled on backend

### Dependencies not installing
```bash
rm -rf node_modules package-lock.json
npm install
cd server && npm install
```

### Port 5000 already in use
```bash
# Windows
netstat -ano | findstr :5000

# macOS/Linux
lsof -i :5000
```

Then either:
- Kill the process using that port
- Change `PORT` in `server/.env`

---

## Next Steps

1. Copy your existing backend code into the `server/` folder
2. Update `server/package.json` with all your dependencies
3. Create `server/.env` from `.env.example`
4. Run `npm run setup` to install dependencies
5. Run `npm run dev` to start both servers
6. Update your React components to call your backend APIs

Happy coding! 🚀
