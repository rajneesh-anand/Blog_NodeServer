const express = require("express");

const router = express.Router();

const { requireSignin } = require("../controllers/auth");
const { createQuizValidator } = require("../validator");

const {
	getQuiz,
	singleQuiz,
	createQuiz,
	quizByStatus,
	photoFirst,
	photoSecond,
	like,
	unlike,
	comment,
	uncomment
} = require("../controllers/quiz");

router.get("/quiz", getQuiz);
router.get("/quiz/:status", singleQuiz);
router.get("/quiz/photo/1/:status", photoFirst);
router.get("/quiz/photo/2/:status", photoSecond);

router.post(
	"/quiz/new/:userId",
	requireSignin,
	createQuiz,
	createQuizValidator
);

router.put("/quiz/like", requireSignin, like);
router.put("/quiz/unlike", requireSignin, unlike);
router.put("/quiz/comment", requireSignin, comment);
router.put("/quiz/uncomment", requireSignin, uncomment);

router.param("status", quizByStatus);

module.exports = router;
