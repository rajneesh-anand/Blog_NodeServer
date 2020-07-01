const express = require("express");
const router = express.Router();

const { fetchEducationPosts } = require("../controllers/education");

router.get("/posts/education", fetchEducationPosts);
module.exports = router;
