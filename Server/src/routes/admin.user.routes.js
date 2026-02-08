// path: roms-backend/src/routes/admin.user.routes.js
const router = require("express").Router();

const auth = require("../middleware/auth");
const allowRoles = require("../middleware/roles");

const {
  listUsers,
  getUserById,
  updateUser,
  getUserOrders,
  deleteUser,
  getUserActivity, // ✅ NEW
} = require("../controllers/admin.user.controller");

// admin only
router.use(auth, allowRoles("admin"));

router.get("/users", listUsers);
router.get("/users/:id", getUserById);
router.patch("/users/:id", updateUser);
router.get("/users/:id/orders", getUserOrders);

// ✅ NEW
router.get("/users/:id/activity", getUserActivity);

router.delete("/users/:id", deleteUser);

module.exports = router;
