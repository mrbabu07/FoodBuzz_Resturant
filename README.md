# 🍽️ FoodBuzz - Restaurant Management System

**Version:** 3.0.0  
**Status:** ✅ Production Ready with Inventory Management

---

## 📋 Table of Contents

1. [Quick Start](#-quick-start)
2. [Features](#-features)
3. [Installation](#-installation)
4. [Configuration](#-configuration)
5. [API Documentation](#-api-documentation)
6. [Technology Stack](#-technology-stack)
7. [Project Structure](#-project-structure)
8. [Troubleshooting](#-troubleshooting)

---

## 🚀 Quick Start

### Prerequisites

- Node.js 16+
- MongoDB (local or Atlas)
- npm or yarn

### Start Application

```bash
# 1. Start Backend
cd Server
npm install
npm start

# 2. Start Frontend (new terminal)
cd Client
npm install
npm run dev

# 3. Access Application
Frontend: http://localhost:5173
Backend: http://localhost:5000
```

### Default Login

| Role     | Email                 | Password    |
| -------- | --------------------- | ----------- |
| Admin    | admin@foodbuzz.com    | admin123    |
| Staff    | staff@foodbuzz.com    | staff123    |
| Customer | customer@foodbuzz.com | customer123 |

---

## ✨ Features

### Core Features ✅

- User Authentication (JWT)
- Role-Based Access (Admin/Staff/Customer)
- Menu Management
- Recipe Management
- Order System (Cart, Checkout, Tracking)
- Payment Integration (Stripe, COD, bKash, Nagad)
- Reviews & Ratings
- Favorites System
- Notifications (Email, Push, Toast)
- Live Chat Support (Tawk.to)
- Image Upload (ImgBB)

### NEW: Inventory Management System ✅

- **Ingredient Tracking** - Track all ingredients with stock levels
- **Supplier Management** - Manage supplier information
- **Purchase Orders** - Create purchases with approval workflow
- **Stock Adjustments** - Track wastage, spoilage, theft
- **Recipe Mapping** - Link ingredients to menu items
- **Auto Stock Deduction** - Automatically deduct stock on orders
- **Low Stock Alerts** - Get alerts when stock is low
- **Food Cost Calculation** - Calculate cost per menu item
- **Inventory Dashboard** - Overview of inventory status

### NEW: Enhanced User Experience ✅

#### Profile Page Enhancements

- **Profile Picture Upload** - Upload and preview profile photos (max 5MB)
- **Account Activity** - View member since, total orders, reviews written
- **Quick Actions** - Fast access to Favorites, Orders, and Reviews
- **Modern UI** - Purple/Pink gradient theme with glassmorphism effects

#### Recipe Page Enhancements

- **Favorite Recipes** - Add/remove recipes to favorites with heart icon
- **Difficulty Badges** - Visual indicators for Easy/Medium/Hard recipes
- **Share Recipes** - Share via Web Share API or copy link to clipboard
- **Print Recipes** - One-click printing for recipe cards
- **Enhanced Cards** - Fully clickable with hover animations and quick actions

### Planned Features 🔄

- POS System (Split bills, discounts, void/refund)
- Table Management (Floor map, table status)
- Kitchen Display System
- Delivery Management
- Staff Management
- Advanced Reports & Analytics

---

## 📦 Installation

### Backend Setup

```bash
cd Server
npm install
```

**Create `.env` file:**

```env
# Server
PORT=5000
NODE_ENV=development

# Database
MONGO_URI=your_mongodb_connection_string

# JWT
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRE=7d

# Frontend
FRONTEND_URL=http://localhost:5173

# Email (Gmail SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password

# Image Upload (ImgBB)
IMGBB_API_KEY=your_imgbb_api_key

# Payment (Stripe)
STRIPE_SECRET_KEY=your_stripe_secret_key

# Push Notifications (Optional)
VAPID_PUBLIC_KEY=your_vapid_public_key
VAPID_PRIVATE_KEY=your_vapid_private_key
VAPID_SUBJECT=mailto:your_email@example.com
```

**Seed Database:**

```bash
npm run seed:all
```

### Frontend Setup

```bash
cd Client
npm install
npm run dev
```

---

## ⚙️ Configuration

### Environment Variables

**Required:**

- `MONGO_URI` - MongoDB connection string
- `JWT_SECRET` - Secret key for JWT tokens
- `FRONTEND_URL` - Frontend URL for CORS

**Optional:**

- `SMTP_*` - Email configuration
- `IMGBB_API_KEY` - Image upload
- `STRIPE_SECRET_KEY` - Payment processing
- `VAPID_*` - Push notifications

### Vite Proxy (Already Configured)

Frontend uses Vite proxy to connect to backend:

```javascript
// Client/vite.config.js
server: {
  proxy: {
    '/api': {
      target: 'http://localhost:5000',
      changeOrigin: true
    }
  }
}
```

---

## 📡 API Documentation

### Authentication

```
POST   /api/auth/register    - Register new user
POST   /api/auth/login       - User login
```

### Menu Items

```
GET    /api/menu-items       - Get all menu items
GET    /api/menu-items/:id   - Get menu item by ID
POST   /api/menu-items       - Create menu item (Admin/Staff)
PUT    /api/menu-items/:id   - Update menu item (Admin/Staff)
DELETE /api/menu-items/:id   - Delete menu item (Admin)
```

### Recipes

```
GET    /api/recipes          - Get all recipes
GET    /api/recipes/:id      - Get recipe by ID
POST   /api/recipes          - Create recipe (Admin/Staff)
PUT    /api/recipes/:id      - Update recipe (Admin/Staff)
DELETE /api/recipes/:id      - Delete recipe (Admin)
```

### Orders

```
POST   /api/orders           - Place order
GET    /api/orders/my        - Get my orders
GET    /api/orders/:id       - Get order by ID
GET    /api/orders/:id/receipt - Get order receipt
PATCH  /api/orders/:id/status - Update order status (Admin/Staff)
DELETE /api/orders/:id        - Cancel order
```

### Inventory (NEW)

**Ingredients:**

```
GET    /api/inventory/ingredients              - Get all ingredients
GET    /api/inventory/ingredients/low-stock    - Get low stock items
GET    /api/inventory/ingredients/:id          - Get ingredient by ID
POST   /api/inventory/ingredients              - Create ingredient
PUT    /api/inventory/ingredients/:id          - Update ingredient
DELETE /api/inventory/ingredients/:id          - Delete ingredient
```

**Suppliers:**

```
GET    /api/inventory/suppliers       - Get all suppliers
POST   /api/inventory/suppliers       - Create supplier
PUT    /api/inventory/suppliers/:id   - Update supplier
DELETE /api/inventory/suppliers/:id   - Delete supplier
```

**Purchases:**

```
GET    /api/inventory/purchases           - Get all purchases
GET    /api/inventory/purchases/:id       - Get purchase by ID
POST   /api/inventory/purchases           - Create purchase
PATCH  /api/inventory/purchases/:id/status - Update purchase status
```

**Stock Adjustments:**

```
GET    /api/inventory/adjustments              - Get all adjustments
POST   /api/inventory/adjustments              - Create adjustment
PATCH  /api/inventory/adjustments/:id/approve  - Approve adjustment
```

**Recipe Ingredients:**

```
GET    /api/inventory/recipes/:menuItemId           - Get recipe ingredients
POST   /api/inventory/recipes                       - Save recipe ingredients
GET    /api/inventory/recipes/:menuItemId/food-cost - Calculate food cost
```

**Dashboard:**

```
GET    /api/inventory/stats   - Get inventory statistics
```

### Reviews

```
GET    /api/reviews/my        - Get my reviews
POST   /api/reviews           - Create review
DELETE /api/reviews/:id       - Delete review
```

### Favorites

```
GET    /api/favorites         - Get favorites
POST   /api/favorites         - Add favorite
DELETE /api/favorites/:id     - Remove favorite
```

---

## 🛠️ Technology Stack

### Backend

- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB with Mongoose
- **Authentication:** JWT (JSON Web Tokens)
- **File Upload:** ImgBB API
- **Email:** Nodemailer (SMTP)
- **Payments:** Stripe

### Frontend

- **Framework:** React 18
- **Build Tool:** Vite
- **Styling:** Tailwind CSS
- **Routing:** React Router v6
- **State Management:** Context API
- **HTTP Client:** Fetch API
- **Notifications:** React Hot Toast
- **Live Chat:** Tawk.to

### DevOps

- **Version Control:** Git
- **Package Manager:** npm
- **Environment:** dotenv

---

## 📁 Project Structure

```
FoodBuzz/
├── Client/                    # Frontend (React + Vite)
│   ├── public/               # Static assets
│   ├── src/
│   │   ├── components/       # Reusable components
│   │   ├── pages/           # Page components
│   │   ├── context/         # React contexts
│   │   ├── utils/           # Utility functions
│   │   └── styles/          # CSS files
│   ├── package.json
│   └── vite.config.js
│
├── Server/                   # Backend (Node.js + Express)
│   ├── src/
│   │   ├── controllers/     # Route handlers
│   │   ├── models/          # Database schemas
│   │   ├── routes/          # API routes
│   │   ├── middleware/      # Custom middleware
│   │   └── utils/           # Backend utilities
│   ├── seed-*.js            # Database seed scripts
│   ├── server-working.js    # Main server file
│   ├── package.json
│   └── .env                 # Environment variables
│
└── README.md                # This file
```

---

## 🔧 Troubleshooting

### Backend Not Starting

**Issue:** Server won't start

**Solution:**

```bash
cd Server
npm install
# Check if MongoDB is running
# Verify .env file exists
npm start
```

### Frontend Not Starting

**Issue:** Frontend won't start

**Solution:**

```bash
cd Client
npm install
npm run dev
```

### Database Connection Failed

**Issue:** Cannot connect to MongoDB

**Solutions:**

1. Check MongoDB is running (local) or accessible (Atlas)
2. Verify `MONGO_URI` in `.env` file
3. Check network/firewall settings
4. For MongoDB Atlas: Whitelist your IP address

### CORS Errors

**Issue:** CORS policy blocking requests

**Solution:**

- Ensure backend is running on port 5000
- Ensure frontend is running on port 5173
- Vite proxy should handle CORS automatically
- Restart both servers

### Login Issues

**Issue:** Cannot login with default credentials

**Solution:**

```bash
cd Server
node src/scripts/createDefaultAdmin.js
```

### Image Upload Not Working

**Issue:** Images not uploading

**Solution:**

1. Check `IMGBB_API_KEY` in `.env`
2. Verify file size < 5MB
3. Check file format (JPEG, PNG, GIF, WebP)

### Port Already in Use

**Issue:** Port 5000 or 5173 already in use

**Solution:**

**Windows:**

```bash
# Find process using port
netstat -ano | findstr :5000
# Kill process
taskkill /PID <PID> /F
```

**Linux/Mac:**

```bash
# Find and kill process
lsof -ti:5000 | xargs kill -9
```

---

## 🎯 Usage Guide

### For Customers

1. **Browse Menu** - View available food items
2. **Add to Cart** - Select items and quantities
3. **Checkout** - Enter delivery details
4. **Place Order** - Choose payment method
5. **Track Order** - Monitor order status
6. **Write Reviews** - Rate and review items

### For Staff

1. **Manage Orders** - View and update order status
2. **Manage Menu** - Add/edit menu items
3. **Manage Recipes** - Add/edit recipes
4. **Manage Inventory** - Track ingredients and stock
5. **Process Purchases** - Enter purchase orders
6. **View Reports** - Check sales and inventory

### For Admin

1. **Full Access** - All staff features
2. **User Management** - Manage users and staff
3. **System Settings** - Configure system
4. **Analytics** - View detailed reports
5. **Approvals** - Approve purchases and adjustments

---

## 📊 Inventory Management Guide

### Managing Ingredients

**Add Ingredient:**

1. Go to Inventory → Ingredients
2. Click "Add Ingredient"
3. Fill in details (name, category, unit, stock, price)
4. Set min/max stock levels
5. Save

**Low Stock Alerts:**

- System automatically detects when stock ≤ minimum
- View low stock items in dashboard
- Get notifications (if configured)

### Managing Suppliers

**Add Supplier:**

1. Go to Inventory → Suppliers
2. Click "Add Supplier"
3. Enter contact information
4. Specify items supplied
5. Set payment terms
6. Save

### Creating Purchase Orders

**Create Purchase:**

1. Go to Inventory → Purchases
2. Click "Create Purchase"
3. Select supplier
4. Add items with quantities and prices
5. Review total
6. Submit for approval
7. When received, stock auto-updates

### Stock Adjustments

**Adjust Stock:**

1. Go to Inventory → Adjustments
2. Click "Create Adjustment"
3. Select ingredient
4. Choose type (wastage, spoilage, etc.)
5. Enter quantity and reason
6. Submit for approval
7. Stock updates after approval

### Recipe Mapping

**Map Recipe:**

1. Go to Inventory → Recipe Mapping
2. Select menu item
3. Add ingredients with quantities
4. System calculates food cost
5. View food cost percentage
6. Save recipe

**Auto Stock Deduction:**

- When order is placed
- System finds recipe for each item
- Calculates ingredient quantities
- Automatically deducts from stock

---

## 🔐 Security Best Practices

### For Production

1. **Environment Variables**
   - Never commit `.env` file
   - Use strong JWT secret
   - Rotate secrets regularly

2. **Database**
   - Use strong passwords
   - Enable authentication
   - Whitelist IP addresses
   - Regular backups

3. **API**
   - Enable rate limiting
   - Validate all inputs
   - Use HTTPS
   - Implement CORS properly

4. **Passwords**
   - Enforce strong passwords
   - Hash with bcrypt
   - Implement password reset
   - Use 2FA (optional)

---

## 📈 Performance Tips

### Backend

- Use database indexes
- Implement caching (Redis)
- Optimize queries
- Use pagination
- Enable compression

### Frontend

- Lazy load components
- Optimize images
- Use code splitting
- Minimize bundle size
- Enable service worker

---

## 🚀 Deployment

### Backend Deployment

**Recommended Platforms:**

- Heroku
- Railway
- Render
- DigitalOcean
- AWS

**Steps:**

1. Set environment variables
2. Configure MongoDB Atlas
3. Deploy code
4. Run migrations/seeds
5. Test endpoints

### Frontend Deployment

**Recommended Platforms:**

- Vercel
- Netlify
- GitHub Pages
- Cloudflare Pages

**Steps:**

1. Build production bundle: `npm run build`
2. Deploy `dist` folder
3. Configure environment variables
4. Set up custom domain (optional)

---

## 📞 Support

### Common Issues

**Issue:** Order placement fails  
**Solution:** Ensure backend is running and cart has valid items

**Issue:** Receipt not loading  
**Solution:** Check order status (must be Placed or later)

**Issue:** Stock not deducting  
**Solution:** Ensure recipe mapping exists for menu items

**Issue:** Low stock alerts not showing  
**Solution:** Check min stock levels are set for ingredients

### Getting Help

1. Check this README
2. Review error messages in console
3. Check server logs
4. Verify environment variables
5. Test API endpoints directly

---

## 🎉 Features Roadmap

### Phase 1 (Current) ✅

- ✅ Basic ordering system
- ✅ User authentication
- ✅ Menu & recipe management
- ✅ Inventory management
- ✅ Payment integration
- ✅ Notifications

### Phase 2 (Next) 🔄

- POS System
- Table Management
- Kitchen Display System
- Advanced reporting

### Phase 3 (Future) 📅

- Delivery management
- Staff management
- Mobile app
- Multi-location support

---

## 📄 License

This project is proprietary software developed for FoodBuzz Restaurant.

---

## 👨‍💻 Development Team

**Backend:** Node.js, Express.js, MongoDB  
**Frontend:** React, Vite, Tailwind CSS  
**Integration:** Payment gateways, Email, File upload  
**Testing:** Manual testing, API testing

---

## 🎯 Quick Commands

```bash
# Backend
cd Server
npm install          # Install dependencies
npm start           # Start server
npm run seed:all    # Seed database

# Frontend
cd Client
npm install         # Install dependencies
npm run dev         # Start dev server
npm run build       # Build for production

# Database
# Create admin user
node Server/src/scripts/createDefaultAdmin.js

# Seed menu items
node Server/seed-menu-items.js

# Seed recipes
node Server/seed-recipes.js
```

---

**Last Updated:** February 9, 2026  
**Version:** 3.0.0  
**Status:** ✅ Production Ready

---

**Welcome to FoodBuzz - Your Complete Restaurant Management Solution! 🍽️✨**
