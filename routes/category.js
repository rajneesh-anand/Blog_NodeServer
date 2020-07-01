const express = require('express');
const { addCategory,allCategory} = require('../controllers/category');
const { requireSignin } = require('../controllers/auth');
const { userById } = require('../controllers/user');

const router = express.Router();

router.post('/category', requireSignin,addCategory);
router.get("/categories", allCategory);

router.param('userId', userById);


module.exports = router;
