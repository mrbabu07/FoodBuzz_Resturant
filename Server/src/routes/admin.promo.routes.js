const router = require("express").Router();
const auth = require("../middleware/auth");
const allowRoles = require("../middleware/roles");

const { sendPromoToSubscribedUsers } = require("../controllers/admin.promo.controller");

// admin only
router.use(auth, allowRoles("admin"));

// POST /api/admin/promo/send
router.post("/promo/send", sendPromoToSubscribedUsers);

module.exports = router;
