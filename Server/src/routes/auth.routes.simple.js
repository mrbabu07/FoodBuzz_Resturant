//path: backend_sara/roms-backend/src/routes/auth.routes.simple.js
// Auth routes WITHOUT rate limiting and activity logging
const router = require("express").Router();
const { register, login } = require("../controllers/auth.controller.simple");

router.post("/register", register);
router.post("/login", login);

module.exports = router;
