# 🍽️ FoodBuzz - Restaurant Order Management System (ROMS)

**Version:** 2.2.0  
**Date:** January 23, 2026  
**Status:** ✅ Production Ready

---

## 📋 Table of Contents

1. [Quick Start](#-quick-start)
2. [System Overview](#-system-overview)
3. [Features](#-features)
4. [Installation](#-installation)
5. [Configuration](#-configuration)
6. [API Documentation](#-api-documentation)
7. [User Accounts](#-user-accounts)
8. [Recent Features](#-recent-features)
9. [Troubleshooting](#-troubleshooting)
10. [Development](#-development)

---

## 🚀 Quick Start

### Prerequisites

- Node.js 16+
- MongoDB Atlas account
- Internet connection

### Start the Application

1. **Start Backend:**

   ```bash
   cd backend/backend_sara/roms-backend
   node server-working.js
   ```

2. **Start Frontend:**

   ```bash
   cd backend/backend_sara/project
   npm run dev
   ```

3. **Access Application:**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:5000
   - Login: http://localhost:5173/login

### Default Login Credentials

| Role     | Email                 | Password    | Access Level          |
| -------- | --------------------- | ----------- | --------------------- |
| Admin    | admin@foodbuzz.com    | admin123    | Full system access    |
| Staff    | staff@foodbuzz.com    | staff123    | Operations management |
| Customer | customer@foodbuzz.com | customer123 | Browse and order      |

---

## 🏗️ System Overview

### Architecture

- **Frontend:** React + Vite + Tailwind CSS
- **Backend:** Node.js + Express.js
- **Database:** MongoDB Atlas
- **Authentication:** JWT tokens
- **File Storage:** ImgBB API
- **Payments:** Stripe integration
- **Email:** SMTP (Gmail)

### Ports

- **Frontend:** 5173 (Vite dev server)
- **Backend:** 5000 (Express server)
- **Database:** MongoDB Atlas (cloud)

### Project Structure

```
backend_sara/
├── project/                 # React Frontend
│   ├── src/
│   │   ├── components/      # Reusable components
│   │   ├── pages/          # Page components
│   │   ├── context/        # React contexts
│   │   ├── utils/          # Utility functions
│   │   └── styles/         # CSS files
│   └── public/             # Static assets
├── roms-backend/           # Node.js Backend
│   ├── src/
│   │   ├── controllers/    # Route handlers
│   │   ├── models/         # Database schemas
│   │   ├── routes/         # API routes
│   │   ├── middleware/     # Custom middleware
│   │   └── utils/          # Backend utilities
│   └── server-working.js   # Main server file
└── README.md              # This file
```

---

## ✨ Features

### Core Features

- ✅ **User Authentication** - JWT-based login/register
- ✅ **Role-Based Access** - Admin, Staff, Customer roles
- ✅ **Recipe Management** - CRUD operations with categories
- ✅ **Menu Management** - Food items with pricing
- ✅ **Order System** - Cart, checkout, tracking
- ✅ **Payment Integration** - Stripe, COD, bKash, Nagad
- ✅ **Image Upload** - ImgBB integration
- ✅ **Search & Filter** - Advanced filtering options

### Advanced Features

- ✅ **Push Notifications** - Web Push API integration
- ✅ **Live Chat Support** - Tawk.to integration
- ✅ **Toast Notifications** - React Hot Toast
- ✅ **Favorites System** - Save recipes and menu items
- ✅ **Review System** - Rate and review items
- ✅ **Email Notifications** - Order confirmations, promotions
- ✅ **Allergen Information** - Dietary restrictions support
- ✅ **Dark Mode Support** - Theme switching
- ✅ **Mobile Responsive** - Works on all devices

### Admin Features

- ✅ **Dashboard Analytics** - Statistics and reports
- ✅ **User Management** - Create, edit, delete users
- ✅ **Staff Management** - Manage staff accounts
- ✅ **Order Management** - Track and update orders
- ✅ **Promotional Emails** - Send marketing campaigns
- ✅ **Activity Logs** - Track system activities
- ✅ **Bulk Operations** - Import/export data

### Security Features

- ✅ **Password Hashing** - bcrypt encryption
- ✅ **JWT Authentication** - Secure token-based auth
- ✅ **Rate Limiting** - Prevent API abuse
- ✅ **CORS Protection** - Cross-origin security
- ✅ **Input Validation** - Prevent injection attacks
- ✅ **Security Headers** - Helmet.js protection

---

## 📦 Installation

### Backend Setup

1. **Navigate to backend directory:**

   ```bash
   cd backend/backend_sara/roms-backend
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Create admin user:**

   ```bash
   node src/scripts/createDefaultAdmin.js
   ```

4. **Seed database (optional):**
   ```bash
   node seed-database.js
   ```

### Frontend Setup

1. **Navigate to frontend directory:**

   ```bash
   cd backend/backend_sara/project
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Install additional libraries:**
   ```bash
   npm install react-hot-toast
   ```

---

## ⚙️ Configuration

### Environment Variables (.env)

Create `.env` file in `roms-backend/` directory:

```env
# Server Configuration
PORT=5000
NODE_ENV=development



### Vite Configuration

The frontend uses Vite proxy to bypass CORS issues:

```javascript
// project/vite.config.js
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:5000",
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
```

### Tawk.to Live Chat

- **Property ID:** `697332db7d1f9f19791eeada`
- **Widget ID:** `1jfl0jb41`
- **Dashboard:** https://dashboard.tawk.to/

---

## 📡 API Documentation

### Authentication Endpoints

| Method | Endpoint                    | Description            | Access |
| ------ | --------------------------- | ---------------------- | ------ |
| POST   | `/api/auth/register`        | Register new user      | Public |
| POST   | `/api/auth/login`           | User login             | Public |
| POST   | `/api/auth/forgot-password` | Request password reset | Public |
| POST   | `/api/auth/reset-password`  | Reset password         | Public |

### Recipe Endpoints

| Method | Endpoint           | Description      | Access      |
| ------ | ------------------ | ---------------- | ----------- |
| GET    | `/api/recipes`     | Get all recipes  | Public      |
| GET    | `/api/recipes/:id` | Get recipe by ID | Public      |
| POST   | `/api/recipes`     | Create recipe    | Admin/Staff |
| PUT    | `/api/recipes/:id` | Update recipe    | Admin/Staff |
| DELETE | `/api/recipes/:id` | Delete recipe    | Admin       |

### Menu Item Endpoints

| Method | Endpoint              | Description         | Access      |
| ------ | --------------------- | ------------------- | ----------- |
| GET    | `/api/menu-items`     | Get all menu items  | Public      |
| GET    | `/api/menu-items/:id` | Get menu item by ID | Public      |
| POST   | `/api/menu-items`     | Create menu item    | Admin/Staff |
| PUT    | `/api/menu-items/:id` | Update menu item    | Admin/Staff |
| DELETE | `/api/menu-items/:id` | Delete menu item    | Admin       |

### Order Endpoints

| Method | Endpoint                 | Description         | Access           |
| ------ | ------------------------ | ------------------- | ---------------- |
| GET    | `/api/orders`            | Get user orders     | User             |
| GET    | `/api/orders/:id`        | Get order by ID     | User/Staff/Admin |
| POST   | `/api/orders`            | Create order        | User             |
| PUT    | `/api/orders/:id/status` | Update order status | Staff/Admin      |

### Payment Endpoints

| Method | Endpoint                        | Description            | Access |
| ------ | ------------------------------- | ---------------------- | ------ |
| POST   | `/api/payments/create-checkout` | Create Stripe checkout | User   |
| POST   | `/api/payments/verify`          | Verify payment         | User   |
| GET    | `/api/payments/history`         | Get payment history    | User   |
| POST   | `/api/payments/refund`          | Process refund         | Admin  |

### Favorites & Wishlist

| Method | Endpoint                         | Description          | Access |
| ------ | -------------------------------- | -------------------- | ------ |
| POST   | `/api/user/favorites/add`        | Add favorite recipe  | User   |
| DELETE | `/api/user/favorites/remove/:id` | Remove favorite      | User   |
| GET    | `/api/user/favorites`            | Get favorites        | User   |
| POST   | `/api/user/wishlist/add`         | Add wishlist item    | User   |
| DELETE | `/api/user/wishlist/remove/:id`  | Remove wishlist item | User   |
| GET    | `/api/user/wishlist`             | Get wishlist         | User   |

### Upload Endpoints

| Method | Endpoint            | Description           | Access      |
| ------ | ------------------- | --------------------- | ----------- |
| POST   | `/api/upload/image` | Upload image to ImgBB | Admin/Staff |

### Admin Endpoints

| Method | Endpoint                    | Description              | Access |
| ------ | --------------------------- | ------------------------ | ------ |
| GET    | `/api/admin/users`          | Get all users            | Admin  |
| PUT    | `/api/admin/users/:id/role` | Update user role         | Admin  |
| DELETE | `/api/admin/users/:id`      | Delete user              | Admin  |
| GET    | `/api/admin/staff`          | Get all staff            | Admin  |
| POST   | `/api/admin/promo/send`     | Send promotional email   | Admin  |
| GET    | `/api/admin/stats`          | Get dashboard statistics | Admin  |

---

## 👥 User Accounts

### Admin Account

- **Email:** admin@foodbuzz.com
- **Password:** admin123
- **Permissions:**
  - Full system access
  - User management
  - Staff management
  - System configuration
  - Analytics and reports
  - Promotional campaigns

### Staff Account

- **Email:** staff@foodbuzz.com
- **Password:** staff123
- **Permissions:**
  - Recipe management
  - Menu management
  - Order processing
  - Customer support
  - Limited analytics

### Customer Account

- **Email:** customer@foodbuzz.com
- **Password:** customer123
- **Permissions:**
  - Browse recipes and menu
  - Place orders
  - Track orders
  - Manage favorites
  - Write reviews

### Database Content

#### Recipes (6 items)

1. Grilled Chicken Breast (Chicken)
2. Beef Stir Fry (Beef)
3. Grilled Salmon (Fish)
4. Tomato Soup (Soup)
5. Chocolate Cake (Dessert)
6. Fresh Lemonade (Drink)

#### Menu Items (8 items)

1. Classic Burger - $12.99
2. Margherita Pizza - $14.99
3. Caesar Salad - $9.99
4. Chicken Wings - $11.99
5. Spaghetti Carbonara - $15.99
6. Grilled Steak - $24.99
7. Tiramisu - $7.99
8. Iced Coffee - $4.99

---

## 🆕 Recent Features

### 1. Push Notifications (Web Push API)

- **Status:** ✅ Complete
- **Files:** `public/sw.js`, `utils/pushNotifications.js`, `components/NotificationPermission.jsx`
- **Features:**
  - Service worker for background notifications
  - 6 pre-configured notification templates
  - Permission request banner
  - Integration with order placement
  - Dark mode support
  - Browser compatibility detection

### 2. Live Chat Support (Tawk.to)

- **Status:** ✅ Complete
- **Files:** `utils/tawkTo.js`, `index.html`
- **Features:**
  - Real-time customer support
  - Automatic user identification
  - Role-based tagging
  - Mobile responsive
  - Chat history tracking

### 3. Toast Notifications (React Hot Toast)

- **Status:** ✅ Complete
- **Files:** `utils/toast.js`, `App.jsx`
- **Features:**
  - 20+ pre-configured toast functions
  - Beautiful animations
  - Auto-dismiss functionality
  - Orange theme matching
  - Non-blocking notifications

### 4. Consistent Design System

- **Status:** ✅ Complete
- **Files:** Multiple page components
- **Features:**
  - White background theme (`bg-white`)
  - Orange color scheme (`orange-500`, `orange-600`)
  - Premium shadows (`shadow-2xl`)
  - Modern rounded corners (`rounded-3xl`)
  - Professional typography (`font-black`)

### 5. Receipt Page Fix

- **Status:** ✅ Complete
- **Files:** `pages/ReceiptPage.jsx`
- **Features:**
  - Proper receipt functionality
  - Order details display
  - Print functionality
  - Error handling
  - Consistent design

---

## 🔧 Troubleshooting

### Common Issues

#### Backend Not Starting

```bash
cd backend/backend_sara/roms-backend
npm install
node server-working.js
```

#### Frontend Not Starting

```bash
cd backend/backend_sara/project
npm install
npm run dev
```

#### Login Issues

1. Ensure admin user is created:
   ```bash
   cd roms-backend
   node src/scripts/createDefaultAdmin.js
   ```
2. Check credentials: admin@foodbuzz.com / admin123
3. Clear browser cache

#### Database Connection Issues

**MongoDB Atlas Connection Failed:**

If you see errors like:

- `querySrv ECONNREFUSED _mongodb._tcp.cluster0.g6xesjf.mongodb.net`
- `bad auth : authentication failed`

**Solutions:**

1. **Check MongoDB Atlas Dashboard:**
   - Visit: https://cloud.mongodb.com/
   - Ensure your cluster is running (not paused)
   - If paused, click "Resume"

2. **Update Database User:**
   - Go to "Database Access" → Find user "FoodBuzz"
   - Reset password to: `1234Foodbuzz`
   - Or create new user with these credentials

3. **Whitelist IP Address:**
   - Go to "Network Access" → Add current IP
   - For development: use `0.0.0.0/0` (all IPs)

4. **Verify Connection String:**
   - Check `.env` file has correct MONGO_URI
   - Format: `mongodb+srv://FoodBuzz:1234Foodbuzz@cluster0.g6xesjf.mongodb.net/FoodBuzzDB?retryWrites=true&w=majority`

**Mongoose Schema Warnings:**

If you see duplicate index warnings, they've been fixed in the latest version. Restart the server to clear them.

#### CORS Issues

- The project uses Vite proxy to bypass CORS
- Ensure frontend is running on port 5173
- Backend should be on port 5000

#### Image Upload Issues

1. Check ImgBB API key in `.env`
2. Verify file size < 5MB
3. Ensure file format is JPEG, PNG, GIF, or WebP

### Error Messages

| Error                              | Solution                                                   |
| ---------------------------------- | ---------------------------------------------------------- |
| "Cannot connect to MongoDB"        | Check internet, MongoDB Atlas status, and credentials      |
| "bad auth : authentication failed" | Reset MongoDB Atlas user password to `1234Foodbuzz`        |
| "querySrv ECONNREFUSED"            | Check internet connection and MongoDB Atlas cluster status |
| "Duplicate schema index"           | Fixed in latest version - restart server                   |
| "JWT token invalid"                | Clear browser storage and login again                      |
| "Permission denied"                | Check user role and route permissions                      |
| "File too large"                   | Reduce image size to < 5MB                                 |
| "CORS error"                       | Restart frontend dev server                                |

---

## 💻 Development

### Adding New Features

1. **Backend API:**
   - Create controller in `src/controllers/`
   - Define routes in `src/routes/`
   - Add middleware if needed
   - Update this README

2. **Frontend Component:**
   - Create component in `src/components/` or `src/pages/`
   - Add routing if needed
   - Update navigation
   - Test responsiveness

### Code Style

- **Backend:** Use Express.js patterns
- **Frontend:** Use React functional components with hooks
- **Styling:** Use Tailwind CSS classes
- **State:** Use React Context for global state

### Testing

#### Manual Testing Checklist

- [ ] User registration and login
- [ ] Recipe CRUD operations
- [ ] Menu item CRUD operations
- [ ] Order placement and tracking
- [ ] Payment processing
- [ ] Image upload
- [ ] Push notifications
- [ ] Live chat
- [ ] Toast notifications
- [ ] Mobile responsiveness

#### API Testing

Use the provided test files:

- `test-all-endpoints.js` - Test all API endpoints
- `test-connection.js` - Test database connection
- `test-api.html` - Frontend API testing

### Deployment

#### Production Checklist

- [ ] Update environment variables
- [ ] Configure production MongoDB cluster
- [ ] Set up production Stripe keys
- [ ] Configure CORS for production domain
- [ ] Enable rate limiting
- [ ] Set up SSL certificates
- [ ] Configure email service
- [ ] Set up monitoring

#### Environment Variables for Production

```env
NODE_ENV=production
FRONTEND_URL=https://yourdomain.com
MONGO_URI=mongodb+srv://production-cluster...
JWT_SECRET=your-super-secure-secret
STRIPE_SECRET_KEY=sk_live_...
```

---

## 📚 Resources

### Documentation

- [React Documentation](https://reactjs.org/docs)
- [Express.js Guide](https://expressjs.com/en/guide)
- [MongoDB Manual](https://docs.mongodb.com/manual)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Stripe API](https://stripe.com/docs/api)

### External Services

- **MongoDB Atlas:** https://cloud.mongodb.com/
- **ImgBB API:** https://api.imgbb.com/
- **Stripe Dashboard:** https://dashboard.stripe.com/
- **Tawk.to Dashboard:** https://dashboard.tawk.to/

### Support

- **GitHub Issues:** Create issues for bugs or feature requests
- **Email:** Contact development team
- **Live Chat:** Use Tawk.to widget on the application

---

## 📊 Project Statistics

- **Total Files:** 100+ files
- **Backend Routes:** 50+ API endpoints
- **Frontend Pages:** 25+ pages
- **Components:** 15+ reusable components
- **Database Models:** 7 main models
- **Features:** 30+ implemented features
- **Development Time:** 6+ months
- **Lines of Code:** 10,000+ lines

---

## 🎯 Future Enhancements

### Planned Features

- [ ] Mobile app (React Native)
- [ ] Advanced analytics dashboard
- [ ] Multi-language support
- [ ] Inventory management
- [ ] Loyalty program
- [ ] Social media integration
- [ ] Advanced reporting
- [ ] API rate limiting dashboard

### Performance Optimizations

- [ ] Image optimization and CDN
- [ ] Database query optimization
- [ ] Caching implementation
- [ ] Code splitting
- [ ] Lazy loading
- [ ] Service worker caching

---

## 📄 License

This project is proprietary software developed for FoodBuzz Restaurant.

---

## 👨‍💻 Development Team

- **Backend Development:** Node.js, Express.js, MongoDB
- **Frontend Development:** React, Vite, Tailwind CSS
- **Integration:** Payment gateways, Email services, File upload
- **Testing:** Manual testing, API testing
- **Documentation:** Comprehensive guides and API docs

---

**Last Updated:** February 9, 2026  
**Version:** 2.3.0  
**Status:** ✅ Production Ready

---

## 📖 Additional Documentation

For detailed guides and references, see:

- **PRODUCTION_ROADMAP_SUMMARY.md** - 🎯 Quick overview of production features needed
- **FEATURE_ROADMAP.md** - 🚀 Complete feature roadmap with specifications
- **PHASE_1_IMPLEMENTATION_GUIDE.md** - 📋 Week-by-week implementation plan
- **LATEST_UPDATES.md** - Recent changes and enhancements
- **SETUP_GUIDE.md** - Detailed installation instructions
- **TROUBLESHOOTING_GUIDE.md** - Common issues and solutions
- **PROJECT_STATUS.md** - Complete feature checklist
- **QUICK_REFERENCE.md** - Quick start commands
- **UI_ENHANCEMENT_GUIDE.md** - UI/UX improvement plans
- **NEW_FEATURES_ADDED.md** - Feature documentation
- **COMPLETE_PROJECT_SUMMARY.md** - Project overview

---

**Last Updated:** February 9, 2026  
**Version:** 2.3.0  
**Status:** ✅ Production Ready

---

## 🎉 Getting Started

Ready to use FoodBuzz ROMS? Follow these steps:

1. **Clone or download the project**
2. **Follow the [Installation](#-installation) guide**
3. **Start with the [Quick Start](#-quick-start) section**
4. **Login using the [default credentials](#-user-accounts)**
5. **Explore the features and customize as needed**

**Welcome to FoodBuzz - Your complete restaurant management solution!** 🍽️✨
