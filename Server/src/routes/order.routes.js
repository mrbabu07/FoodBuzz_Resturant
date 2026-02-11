//path: backend_sara/roms-backend/src/routes/order.routes.js
const router = require("express").Router();

const auth = require("../middleware/auth");
const allowRoles = require("../middleware/roles");

const {
  placeOrder,
  myOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
  getReceipt,
  cancelOrder,
  modifyOrder,
  canModifyOrder,
  reorderOrder,
} = require("../controllers/order.controller");

const { downloadReceiptPdf } = require("../controllers/receipt.pdf.controller");

router.post("/", auth, allowRoles("user", "admin", "staff"), placeOrder);
router.get("/my", auth, allowRoles("user", "admin", "staff"), myOrders);
router.get("/all", auth, allowRoles("admin", "staff"), getAllOrders);

router.patch(
  "/:id/status",
  auth,
  allowRoles("admin", "staff"),
  updateOrderStatus,
);

router.get(
  "/:id/receipt",
  auth,
  allowRoles("user", "admin", "staff"),
  getReceipt,
);
router.get(
  "/:id/receipt/pdf",
  auth,
  allowRoles("user", "admin", "staff"),
  downloadReceiptPdf,
);

router.get("/:id", auth, allowRoles("user", "admin", "staff"), getOrderById);
router.delete("/:id", auth, allowRoles("user", "admin", "staff"), cancelOrder);

// Order modification routes
router.get(
  "/:id/can-modify",
  auth,
  allowRoles("user", "admin", "staff"),
  canModifyOrder,
);
router.put(
  "/:id/modify",
  auth,
  allowRoles("user", "admin", "staff"),
  modifyOrder,
);

// Reorder route
router.post(
  "/:id/reorder",
  auth,
  allowRoles("user", "admin", "staff"),
  reorderOrder,
);

module.exports = router;
