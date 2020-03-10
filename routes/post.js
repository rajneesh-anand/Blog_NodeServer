const express = require("express");
const {
	getPosts,
	createPost,
	postsByUser,
	postById,
	getPostsByCategory,
	isPoster,
	updatePost,
	deletePost,
	photo,
	singlePost,
	like,
	unlike,
	comment,
	uncomment,
	updateComment
} = require("../controllers/post");
const { requireSignin } = require("../controllers/auth");
const { userById } = require("../controllers/user");
//const { categoryId } = require('../controllers/category');

const { createPostValidator } = require("../validator");

const router = express.Router();

router.get("/posts", getPosts);

// like unlike
router.put("/post/like", requireSignin, like);
router.put("/post/unlike", requireSignin, unlike);

// comments
router.put("/post/comment", requireSignin, comment);
router.put("/post/uncomment", requireSignin, uncomment);
router.put("/post/updatecomment", requireSignin, updateComment);

// post routes
router.post(
	"/post/new/:userId",
	requireSignin,
	createPost,
	createPostValidator
);
router.get("/posts/by/:userId", requireSignin, postsByUser);
router.get("/post/:postId", singlePost);
// router.get("/post/:postId/:slug", singlePost);
router.get("/posts/category/:slug", getPostsByCategory);
router.put("/post/:postId", requireSignin, isPoster, updatePost);
router.delete("/post/:postId", requireSignin, isPoster, deletePost);
// photo
router.get("/post/photo/:postId", photo);

// any route containing :userId, our app will first execute userById()
router.param("userId", userById);
// any route containing :postId, our app will first execute postById()
router.param("postId", postById);
//router.param("slug", postBySlug);

module.exports = router;
