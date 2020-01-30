const express = require('express');
const { newsDetails} = require('../controllers/news');

const router = express.Router();

router.get("/testnews", newsDetails);

module.exports = router;