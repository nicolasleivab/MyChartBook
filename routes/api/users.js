const express = require("express");
const router = express.Router();

// @route  GET api/users
// @desc   Test route for users
// @access Public
router.get("/", (req, res) => res.send("users route"));

module.exports = router;
