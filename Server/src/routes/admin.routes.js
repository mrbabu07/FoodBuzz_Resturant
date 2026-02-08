const router = require("express").Router();

const auth = require("../middleware/auth");
const allowRoles = require("../middleware/roles");

const {
  getStats,
  getSalesReport,
  getOrdersByStatus,
  getTopRecipes
} = require("../controllers/admin.controller");

router.use(auth, allowRoles("admin"));

router.get("/stats", getStats);
router.get("/reports/sales", getSalesReport);
router.get("/reports/orders-by-status", getOrdersByStatus);
router.get("/reports/top-recipes", getTopRecipes);

module.exports = router;
