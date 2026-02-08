# 🍕 FoodBuzz - Complete Setup Guide

A professional food delivery platform with menu ordering, recipe browsing, real-time notifications, and admin dashboard.

---

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Installation](#installation)
3. [Database Setup](#database-setup)
4. [Environment Configuration](#environment-configuration)
5. [Running the Application](#running-the-application)
6. [Features Overview](#features-overview)
7. [User Roles](#user-roles)
8. [API Endpoints](#api-endpoints)
9. [Troubleshooting](#troubleshooting)

---

## 🔧 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v16 or higher) - [Download](https://nodejs.org/)
- **MongoDB** (v5 or higher) - [Download](https://www.mongodb.com/try/download/community)
- **npm** or **yarn** package manager
- **Git** (optional, for version control)

---

## 📦 Installation

### 1. Clone or Download the Project

```bash
# If using Git
git clone <your-repo-url>
cd FoodBuzz

# Or download and extract the ZIP file
```

### 2. Install Server Dependencies

```bash
cd Server
npm install
```

### 3. Install Client Dependencies

```bash
cd ../Client
npm install
```

---

## 🗄️ Database Setup

### 1. Start MongoDB

Make sure MongoDB is running on your system:

```bash
# Windows (if installed as service)
# MongoDB should start automatically

# macOS/Linux
mongod

# Or if using MongoDB Atlas (cloud), skip this step
```

### 2. Configure MongoDB Connection

Edit `Server/.env` file and set your MongoDB URI:

```env
MONGO_URI=mongodb://localhost:27017/foodbuzz
# Or for MongoDB Atlas:
# MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/foodbuzz
```

### 3. Seed the Database

Run the master seed script to populate all data:

```bash
cd Server
node seed-all.js
```

This will seed:

- ✅ **23 Menu Items** (Beef, Chicken, Fish, Soup, Dessert, Drink)
- ✅ **12 Recipes** (2 per category with full instructions)
- ✅ **6 Promotional Offers** (requires admin user)

**Individual Seeding (Optional):**

```bash
# Seed only menu items
node seed-menu-items.js

# Seed only recipes
node seed-recipes.js

# Seed only offers (requires admin user first)
node seed-offers.js
```

---

## ⚙️ Environment Configuration

### Server Environment Variables

Create/Edit `Server/.env`:

```env
# Database
MONGO_URI=mongodb://localhost:27017/foodbuzz

# Server
PORT=5000
NODE_ENV=development

# JWT Secret (change this!)
JWT_SECRET=your-super-secret-jwt-key-change-this

# Email Configuration (Gmail SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=FoodBuzz <your-email@gmail.com>

# Image Upload (ImgBB)
IMGBB_API_KEY=your-imgbb-api-key

# Payment (Stripe)
STRIPE_SECRET_KEY=your-stripe-secret-key
STRIPE_PUBLISHABLE_KEY=your-stripe-publishable-key

# Push Notifications (Optional)
VAPID_PUBLIC_KEY=your-vapid-public-key
VAPID_PRIVATE_KEY=your-vapid-private-key
VAPID_SUBJECT=mailto:your-email@gmail.com

# Frontend URL
CLIENT_URL=http://localhost:5173
```

### Client Environment Variables

Create `Client/.env`:

```env
VITE_API_URL=http://localhost:5000
VITE_STRIPE_PUBLISHABLE_KEY=your-stripe-publishable-key
```

---

## 🚀 Running the Application

### Development Mode

**Terminal 1 - Start Server:**

```bash
cd Server
npm start
# Server runs on http://localhost:5000
```

**Terminal 2 - Start Client:**

```bash
cd Client
npm run dev
# Client runs on http://localhost:5173
```

### Production Mode

```bash
# Build client
cd Client
npm run build

# Serve with server
cd ../Server
npm run prod
```

---

## ✨ Features Overview

### 🏠 **Home Page**

- Dynamic greeting based on time of day
- Today's Special (random featured item)
- Featured menu items (6 random items)
- Popular recipes (4 recent recipes)
- Real-time stats (orders, menu items, ratings)
- Responsive design with animations

### 🍽️ **Menu & Ordering**

- Browse 23+ menu items across 6 categories
- Search and filter by category
- View item details (price, calories, dietary info)
- Add to cart with quantity selector
- Apply discount coupons
- Secure checkout with Stripe
- Order tracking with real-time status updates

### 📚 **Recipes**

- 12+ professional recipes with images
- Step-by-step cooking instructions
- Prep time, cook time, servings info
- Ingredient lists
- Difficulty levels
- Category filtering
- Trending and recent recipes

### 🔔 **Notifications**

- Real-time push notifications
- Email notifications
- Order status updates
- Promotional offers
- New recipe alerts
- Notification preferences
- Quiet hours support
- Analytics dashboard

### 👤 **User Features**

- User registration and login
- Profile management
- Order history
- Favorites system
- Notification preferences
- Address management

### 👨‍💼 **Admin Dashboard**

- Modern gradient UI
- Revenue analytics with charts
- Manage menu items (CRUD)
- Manage orders (status updates)
- Manage recipes (CRUD)
- Manage offers/promotions
- Manage staff accounts
- Manage users
- Activity logs
- Reports and analytics

### 👔 **Staff Dashboard**

- View and manage orders
- Update order status
- Customer information
- Order details modal
- Search and filter orders

---

## 👥 User Roles

### 1. **Customer (Default)**

- Browse menu and recipes
- Place orders
- Track orders
- Manage profile
- View favorites
- Receive notifications

### 2. **Staff**

- All customer features
- View all orders
- Update order status
- Access staff dashboard

### 3. **Admin**

- All staff features
- Full CRUD on menu items
- Full CRUD on recipes
- Manage offers/promotions
- Manage staff accounts
- Manage users
- View analytics and reports
- Access admin dashboard

---

## 🔐 Creating Admin Account

### Method 1: Using Script

```bash
cd Server
node src/scripts/createDefaultAdmin.js
```

Default admin credentials:

- **Email:** admin@foodbuzz.com
- **Password:** admin123

### Method 2: Manual Creation

1. Register a normal account
2. Connect to MongoDB:
   ```bash
   mongosh
   use foodbuzz
   db.users.updateOne(
     { email: "your-email@example.com" },
     { $set: { role: "admin" } }
   )
   ```

---

## 📡 API Endpoints

### Authentication

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Menu Items

- `GET /api/menu-items` - Get all menu items
- `GET /api/menu-items/:id` - Get single menu item
- `POST /api/menu-items` - Create menu item (Admin)
- `PUT /api/menu-items/:id` - Update menu item (Admin)
- `DELETE /api/menu-items/:id` - Delete menu item (Admin)

### Recipes

- `GET /api/recipes` - Get all recipes
- `GET /api/recipes/trending` - Get trending recipes
- `GET /api/recipes/recent` - Get recent recipes
- `GET /api/recipes/:id` - Get single recipe
- `POST /api/recipes` - Create recipe (Admin)
- `PUT /api/recipes/:id` - Update recipe (Admin)
- `DELETE /api/recipes/:id` - Delete recipe (Admin)

### Orders

- `GET /api/orders` - Get all orders (Admin/Staff)
- `GET /api/orders/user/:userId` - Get user orders
- `POST /api/orders` - Create order
- `PUT /api/orders/:id/status` - Update order status
- `DELETE /api/orders/:id` - Cancel order

### Offers

- `GET /api/offers` - Get all active offers
- `POST /api/offers` - Create offer (Admin)
- `PUT /api/offers/:id` - Update offer (Admin)
- `DELETE /api/offers/:id` - Delete offer (Admin)

### Notifications

- `GET /api/notifications` - Get user notifications
- `PUT /api/notifications/:id/read` - Mark as read
- `DELETE /api/notifications/:id` - Delete notification

### Users

- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update profile
- `GET /api/users/preferences` - Get notification preferences
- `PUT /api/users/preferences` - Update preferences

---

## 🎨 Tech Stack

### Frontend

- **React 18** - UI library
- **React Router v6** - Routing
- **Tailwind CSS** - Styling
- **Vite** - Build tool
- **React Hot Toast** - Notifications
- **Axios** - HTTP client

### Backend

- **Node.js** - Runtime
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication
- **Bcrypt** - Password hashing
- **Nodemailer** - Email service
- **Web Push** - Push notifications
- **Stripe** - Payment processing

---

## 🐛 Troubleshooting

### MongoDB Connection Error

**Problem:** `MongooseServerSelectionError: connect ECONNREFUSED`

**Solution:**

1. Make sure MongoDB is running
2. Check MONGO_URI in `.env`
3. For Atlas, check network access and credentials

### Port Already in Use

**Problem:** `Error: listen EADDRINUSE: address already in use :::5000`

**Solution:**

```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# macOS/Linux
lsof -ti:5000 | xargs kill -9
```

### CORS Errors

**Problem:** `Access to fetch blocked by CORS policy`

**Solution:**

- Server already has CORS enabled
- Check CLIENT_URL in server `.env`
- Make sure client is running on correct port

### Email Not Sending

**Problem:** Emails not being delivered

**Solution:**

1. Use Gmail App Password (not regular password)
2. Enable "Less secure app access" in Gmail
3. Check SMTP credentials in `.env`
4. Check spam folder

### Images Not Loading

**Problem:** Menu/recipe images not displaying

**Solution:**

- Images use Unsplash URLs (requires internet)
- Check browser console for errors
- Fallback images are configured

### Seed Script Fails

**Problem:** `Error seeding database`

**Solution:**

1. Make sure MongoDB is running
2. Check MONGO_URI connection
3. Run individual seed scripts to identify issue
4. For offers, create admin user first

---

## 📝 Development Notes

### Adding New Menu Items

```javascript
// Use the admin dashboard UI or API
POST /api/menu-items
{
  "name": "Item Name",
  "category": "Chicken",
  "price": 450,
  "details": "Description",
  "imageUrl": "https://...",
  "calories": 500,
  "isAvailable": true
}
```

### Adding New Recipes

```javascript
// Use the admin dashboard UI or API
POST /api/recipes
{
  "name": "Recipe Name",
  "category": "Chicken",
  "ingredients": ["item1", "item2"],
  "instructions": ["step1", "step2"],
  "prepTime": 15,
  "cookTime": 30,
  "servings": 4,
  "imageUrl": "https://..."
}
```

### Creating Promotional Offers

```javascript
// Use the admin dashboard UI or API
POST /api/offers
{
  "title": "Offer Title",
  "description": "Offer description",
  "discountType": "percentage", // or "fixed", "free_delivery"
  "discountValue": 20,
  "minimumOrderAmount": 500,
  "validFrom": "2024-01-01",
  "validUntil": "2024-12-31",
  "isActive": true
}
```

---

## 🚀 Deployment

### Deploy to Heroku (Backend)

```bash
cd Server
heroku create foodbuzz-api
heroku config:set MONGO_URI=your-mongodb-uri
heroku config:set JWT_SECRET=your-secret
git push heroku main
```

### Deploy to Vercel (Frontend)

```bash
cd Client
npm run build
vercel --prod
```

### Deploy to Railway

1. Connect GitHub repository
2. Add environment variables
3. Deploy automatically on push

---

## 📞 Support

For issues or questions:

- Check the troubleshooting section
- Review error logs in console
- Check MongoDB connection
- Verify environment variables

---

## 📄 License

This project is for educational and portfolio purposes.

---

## 🎉 You're All Set!

Your FoodBuzz application is now ready to use. Visit:

- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:5000
- **Admin Dashboard:** http://localhost:5173/admindashboard

**Default Admin Login:**

- Email: admin@foodbuzz.com
- Password: admin123

Enjoy building with FoodBuzz! 🍕🚀
