const express = require("express");
const router = express.Router();

// @route  GET api/auth
// @desc   Test route for profile
// @access Public
router.get("/", (req, res) => res.send("profile route"));

module.exports = router;
