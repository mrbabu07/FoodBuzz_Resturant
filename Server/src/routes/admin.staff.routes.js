//routes/admin.staff.routes.js
const router = require("express").Router();

const auth = require("../middleware/auth");
const allowRoles = require("../middleware/roles");

const {
  createStaff,
  listStaff,
  getStaffById,
  updateStaff,
  resetStaffPassword,
  deleteStaff
} = require("../controllers/admin.staff.controller");

// admin only
router.use(auth, allowRoles("admin"));

router.post("/staff", createStaff);
router.get("/staff", listStaff);
router.get("/staff/:id", getStaffById);
router.patch("/staff/:id", updateStaff);
router.patch("/staff/:id/password", resetStaffPassword);
router.delete("/staff/:id", deleteStaff);

module.exports = router;
