# 🔧 Troubleshooting Guide - FoodBuzz

## 🚨 Current Issue: 404 Error on `/api/orders`

### Problem

When trying to place an order, you're getting:

```
Failed to load resource: the server responded with a status of 404 (Not Found)
/api/orders
```

### Root Cause

The **backend server is not running** or not accessible at `http://localhost:5000`

---

## ✅ Solution: Start the Backend Server

### Step 1: Open Terminal in Server Folder

```bash
cd Server
```

### Step 2: Start the Server

```bash
npm start
```

Or if you want to use nodemon for auto-restart:

```bash
npm run dev
```

### Step 3: Verify Server is Running

You should see:

```
🚀 FoodBuzz API on http://localhost:5000
MongoDB connected successfully
```

### Step 4: Test the API

Open your browser and go to:

```
http://localhost:5000/
```

You should see:

```json
{
  "status": "success",
  "message": "FoodBuzz API"
}
```

---

## 🔍 Verification Checklist

### Backend Server

- [ ] Server is running on port 5000
- [ ] MongoDB is connected
- [ ] No errors in server console
- [ ] API responds at `http://localhost:5000/`

### Frontend Client

- [ ] Client is running on port 5173
- [ ] Vite proxy is configured correctly
- [ ] No CORS errors in browser console
- [ ] API calls use relative URLs (e.g., `/api/orders`)

### Database

- [ ] MongoDB is running
- [ ] Connection string in `.env` is correct
- [ ] Database has menu items and recipes
- [ ] Collections are properly seeded

---

## 🎯 Quick Test

### Test Order Placement

1. **Start Backend:**

   ```bash
   cd Server
   npm start
   ```

2. **Start Frontend:**

   ```bash
   cd Client
   npm run dev
   ```

3. **Test Flow:**
   - Go to http://localhost:5173
   - Login/Register
   - Go to Menu (`/order_1st`)
   - Add items to cart
   - Go to Cart
   - Proceed to Checkout
   - Fill billing info
   - Place Order
   - ✅ Should work now!

---

## 🐛 Common Issues & Fixes

### Issue 1: Port 5000 Already in Use

**Error:**

```
Error: listen EADDRINUSE: address already in use :::5000
```

**Fix:**

```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Or change port in server-working.js
const PORT = 5001; // Change to different port
```

### Issue 2: MongoDB Connection Failed

**Error:**

```
MongooseError: connect ECONNREFUSED
```

**Fix:**

1. Check if MongoDB is running
2. Verify connection string in `Server/.env`
3. Make sure MongoDB service is started

### Issue 3: CORS Error

**Error:**

```
Access to fetch at 'http://localhost:5000/api/orders' from origin 'http://localhost:5173' has been blocked by CORS
```

**Fix:**
Already fixed in `server-working.js`:

```javascript
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "*");
  res.header("Access-Control-Allow-Headers", "*");
  if (req.method === "OPTIONS") return res.sendStatus(200);
  next();
});
```

### Issue 4: Invalid menuItemId

**Error:**

```
Order creation error: Error: Invalid menuItemId in items
```

**Fix:**
Already fixed in `PlaceOrderPage.jsx` and order pages. Cart items now include `menuItemId` field.

### Issue 5: Authentication Error

**Error:**

```
401 Unauthorized
```

**Fix:**

1. Make sure you're logged in
2. Check if token is stored in localStorage
3. Token should be sent in Authorization header

---

## 📊 Server Logs to Check

### Good Server Logs

```
🚀 FoodBuzz API on http://localhost:5000
MongoDB connected successfully
[MENU ITEMS] Getting all items
[MENU ITEMS] Found 23 items
```

### Bad Server Logs

```
❌ MongoDB connection error
❌ Route not found
❌ Authentication failed
❌ Invalid token
```

---

## 🔧 Environment Variables

### Required in `Server/.env`

```env
# MongoDB
MONGO_URI=mongodb://localhost:27017/foodbuzz

# JWT
JWT_SECRET=your_secret_key_here

# Email (Gmail SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password

# Frontend URL
FRONTEND_URL=http://localhost:5173

# ImgBB (for image uploads)
IMGBB_API_KEY=your_imgbb_key

# Stripe (for payments)
STRIPE_SECRET_KEY=your_stripe_key

# Push Notifications
VAPID_PUBLIC_KEY=your_vapid_public_key
VAPID_PRIVATE_KEY=your_vapid_private_key
VAPID_SUBJECT=mailto:your_email@example.com
```

---

## 🚀 Complete Setup from Scratch

### 1. Install Dependencies

```bash
# Backend
cd Server
npm install

# Frontend
cd ../Client
npm install
```

### 2. Setup Environment

```bash
# Copy example env file
cd Server
copy .env.example .env

# Edit .env with your values
notepad .env
```

### 3. Seed Database

```bash
cd Server
npm run seed:all
```

This will seed:

- ✅ Menu items (23 items)
- ✅ Recipes (52+ recipes)
- ✅ Offers (sample offers)
- ✅ Admin user (if not exists)

### 4. Start Servers

```bash
# Terminal 1 - Backend
cd Server
npm start

# Terminal 2 - Frontend
cd Client
npm run dev
```

### 5. Access Application

- Frontend: http://localhost:5173
- Backend API: http://localhost:5000
- API Health: http://localhost:5000/

---

## 📝 API Endpoints Reference

### Orders

- `POST /api/orders` - Place new order
- `GET /api/orders/my` - Get my orders
- `GET /api/orders/:id` - Get order by ID
- `GET /api/orders/:id/receipt` - Get order receipt
- `PATCH /api/orders/:id/status` - Update order status (admin/staff)
- `DELETE /api/orders/:id` - Cancel order

### Menu Items

- `GET /api/menu-items` - Get all menu items
- `GET /api/menu-items/:id` - Get menu item by ID
- `POST /api/menu-items` - Create menu item (admin/staff)
- `PUT /api/menu-items/:id` - Update menu item (admin/staff)
- `DELETE /api/menu-items/:id` - Delete menu item (admin)

### Recipes

- `GET /api/recipes` - Get all recipes
- `GET /api/recipes/trending` - Get trending recipes
- `GET /api/recipes/recent` - Get recent recipes
- `GET /api/recipes/:id` - Get recipe by ID

### Authentication

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

---

## ✅ Success Indicators

### Backend Running Successfully

```
✅ Server listening on port 5000
✅ MongoDB connected
✅ Routes registered
✅ No errors in console
```

### Frontend Running Successfully

```
✅ Vite dev server running
✅ No compilation errors
✅ Can access http://localhost:5173
✅ API calls working
```

### Order Placement Working

```
✅ Can add items to cart
✅ Cart shows correct items
✅ Can proceed to checkout
✅ Order is created successfully
✅ Redirected to receipt page
✅ Notification sent
```

---

## 🎉 Expected Behavior After Fix

1. **Add to Cart** → Item added with toast notification
2. **View Cart** → Beautiful enhanced cart page with animations
3. **Apply Coupon** → Discount applied with success message
4. **Proceed to Checkout** → Navigate to billing page
5. **Place Order** → Order created, receipt shown, notification sent
6. **Track Order** → Can view order status and timeline

---

## 📞 Need More Help?

### Check These Files

1. `Server/server-working.js` - Main server file
2. `Server/src/routes/order.routes.js` - Order routes
3. `Server/src/controllers/order.controller.js` - Order logic
4. `Client/vite.config.js` - Proxy configuration
5. `Client/src/utils/api.js` - API utility

### Debug Mode

Add this to see detailed logs:

```javascript
// In server-working.js
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});
```

---

**Remember: The most common issue is simply forgetting to start the backend server!** 🚀
