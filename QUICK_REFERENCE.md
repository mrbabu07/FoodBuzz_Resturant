# 🚀 FoodBuzz Quick Reference Card

**One-page reference for running and using FoodBuzz**

---

## ⚡ Quick Start (3 Steps)

```bash
# 1. Seed Database
cd Server
node seed-all.js

# 2. Start Server (Terminal 1)
npm start

# 3. Start Client (Terminal 2)
cd ../Client
npm run dev
```

**Visit:** http://localhost:5173

---

## 🔑 Default Accounts

| Role     | Email              | Password | Create With                              |
| -------- | ------------------ | -------- | ---------------------------------------- |
| Admin    | admin@foodbuzz.com | admin123 | `node src/scripts/createDefaultAdmin.js` |
| Customer | Register on site   | -        | http://localhost:5173/register           |

---

## 📁 Project Structure

```
FoodBuzz/
├── Client/              # React Frontend (Port 5173)
│   ├── src/pages/      # All pages
│   ├── src/components/ # Reusable components
│   └── src/utils/      # Utilities
│
├── Server/             # Node.js Backend (Port 5000)
│   ├── src/models/    # Database schemas
│   ├── src/controllers/ # Route handlers
│   ├── src/routes/    # API routes
│   ├── seed-*.js      # Database seeders
│   └── server-working.js # Main server
│
├── SETUP_GUIDE.md     # Detailed setup
├── PROJECT_STATUS.md  # Feature checklist
└── README.md          # Full documentation
```

---

## 🗄️ Database Seeding

```bash
cd Server

# Seed everything (recommended)
node seed-all.js

# Or seed individually
node seed-menu-items.js    # 23 menu items
node seed-recipes.js       # 12 recipes
node seed-offers.js        # 6 offers (needs admin)
```

---

## 🌐 Key URLs

| Page            | URL                                      | Access |
| --------------- | ---------------------------------------- | ------ |
| Home            | http://localhost:5173/                   | Public |
| Menu/Order      | http://localhost:5173/order_1st          | Public |
| Recipes         | http://localhost:5173/recipes            | Public |
| Login           | http://localhost:5173/login              | Public |
| Register        | http://localhost:5173/register           | Public |
| Cart            | http://localhost:5173/cart               | Public |
| User Dashboard  | http://localhost:5173/profile            | User   |
| Order Tracking  | http://localhost:5173/order_tracking     | User   |
| Admin Dashboard | http://localhost:5173/admindashboard     | Admin  |
| Manage Menu     | http://localhost:5173/managemenuadmin    | Admin  |
| Manage Orders   | http://localhost:5173/manageordersadmin  | Admin  |
| Manage Recipes  | http://localhost:5173/managerecipesadmin | Admin  |
| Manage Staff    | http://localhost:5173/managestaff        | Admin  |
| Staff Dashboard | http://localhost:5173/staff/dashboard    | Staff  |

---

## 📡 API Endpoints (Quick Reference)

### Authentication

- `POST /api/auth/register` - Register
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user

### Menu Items

- `GET /api/menu-items` - Get all
- `POST /api/menu-items` - Create (Admin)
- `PUT /api/menu-items/:id` - Update (Admin)
- `DELETE /api/menu-items/:id` - Delete (Admin)

### Recipes

- `GET /api/recipes` - Get all
- `GET /api/recipes/trending` - Trending
- `GET /api/recipes/recent` - Recent
- `POST /api/recipes` - Create (Admin)

### Orders

- `GET /api/orders` - Get orders
- `POST /api/orders` - Create order
- `PUT /api/orders/:id/status` - Update status

### Offers

- `GET /api/offers` - Get offers
- `POST /api/offers` - Create (Admin)

---

## 🎨 Design System

### Colors

- **Primary:** Orange (#f97316, #fb923c)
- **Secondary:** Amber (#f59e0b, #fbbf24)
- **Success:** Green (#10b981)
- **Error:** Red (#ef4444)
- **Info:** Blue (#3b82f6)

### Spacing

- **Small:** 4px, 8px
- **Medium:** 12px, 16px, 24px
- **Large:** 32px, 48px, 64px

### Shadows

- **Small:** shadow-lg
- **Medium:** shadow-xl
- **Large:** shadow-2xl

### Borders

- **Radius:** rounded-2xl, rounded-3xl
- **Width:** border-2

---

## 🐛 Common Issues & Fixes

### MongoDB Connection Error

```bash
# Check if MongoDB is running
# Verify MONGO_URI in Server/.env
```

### Port Already in Use

```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Mac/Linux
lsof -ti:5000 | xargs kill -9
```

### Seed Script Fails

```bash
# Make sure MongoDB is connected
# Run individual seed scripts to identify issue
cd Server
node seed-menu-items.js
```

### Images Not Loading

- Check internet connection (uses Unsplash)
- Fallback images are configured
- Check browser console for errors

---

## 📦 Dependencies

### Server

```json
{
  "express": "Web framework",
  "mongoose": "MongoDB ODM",
  "bcryptjs": "Password hashing",
  "jsonwebtoken": "JWT auth",
  "nodemailer": "Email service",
  "web-push": "Push notifications",
  "stripe": "Payments"
}
```

### Client

```json
{
  "react": "UI library",
  "react-router-dom": "Routing",
  "react-hot-toast": "Notifications",
  "axios": "HTTP client",
  "tailwindcss": "Styling"
}
```

---

## 🔧 Environment Variables

### Server/.env (Required)

```env
MONGO_URI=mongodb://localhost:27017/foodbuzz
JWT_SECRET=your-secret-key
PORT=5000

# Optional but recommended
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
STRIPE_SECRET_KEY=your-stripe-key
IMGBB_API_KEY=your-imgbb-key
```

### Client/.env (Optional)

```env
VITE_API_URL=http://localhost:5000
```

---

## 📊 Database Collections

| Collection    | Count | Description         |
| ------------- | ----- | ------------------- |
| menuitems     | 23    | Food menu items     |
| recipes       | 12    | Cooking recipes     |
| offers        | 6     | Promotional offers  |
| users         | -     | User accounts       |
| orders        | -     | Customer orders     |
| notifications | -     | User notifications  |
| payments      | -     | Payment records     |
| reviews       | -     | Item reviews        |
| activitylogs  | -     | Admin activity logs |

---

## 🎯 Testing Checklist

### Basic Flow

1. ✅ Visit home page
2. ✅ Browse menu items
3. ✅ Add items to cart
4. ✅ Register account
5. ✅ Login
6. ✅ Place order
7. ✅ Track order
8. ✅ View recipes

### Admin Flow

1. ✅ Login as admin
2. ✅ View dashboard
3. ✅ Add menu item
4. ✅ Add recipe
5. ✅ Create offer
6. ✅ Manage orders
7. ✅ Create staff account

---

## 📞 Support Resources

- **Full Setup:** [SETUP_GUIDE.md](./SETUP_GUIDE.md)
- **Feature List:** [PROJECT_STATUS.md](./PROJECT_STATUS.md)
- **Complete Docs:** [README.md](./README.md)
- **Troubleshooting:** See SETUP_GUIDE.md

---

## 🚀 Deployment Quick Guide

### Backend (Heroku/Railway)

1. Push code to Git
2. Connect to platform
3. Add environment variables
4. Deploy

### Frontend (Vercel/Netlify)

1. Build: `npm run build`
2. Deploy `dist` folder
3. Set environment variables

---

## 💡 Pro Tips

1. **Always seed database first** before testing
2. **Use admin account** to access all features
3. **Check browser console** for errors
4. **Clear browser cache** if login issues
5. **Use toast notifications** for user feedback
6. **Test on mobile** - fully responsive
7. **Check MongoDB Atlas** if connection fails

---

## 🎉 You're Ready!

Everything you need is in this project:

- ✅ Complete frontend
- ✅ Complete backend
- ✅ Database with seed data
- ✅ Professional UI
- ✅ Real features
- ✅ Full documentation

**Just run the 3 commands at the top and you're good to go!** 🚀

---

**Quick Links:**

- [Detailed Setup](./SETUP_GUIDE.md)
- [Feature Status](./PROJECT_STATUS.md)
- [Full Documentation](./README.md)

**Need help?** Check the troubleshooting sections in the guides above.
