const Quiz = require("../models/quiz");

const formidable = require("formidable");
const fs = require("fs");
const _ = require("lodash");

// with pagination
exports.getQuiz = async (req, res) => {
	// get current page from req.query or use default value of 1
	const currentPage = req.query.page || 1;
	// return 3 posts per page
	const perPage = 25;
	let totalItems;

	const quiz = await Quiz.find()
		// countDocuments() gives you total count of posts
		.countDocuments()
		.then(count => {
			totalItems = count;
			return Quiz.find()
				.skip((currentPage - 1) * perPage)
				.populate("comments", "text created")
				.populate("comments.postedBy", "_id name")
				.populate("postedBy", "_id name")
				.populate("category", "_id name")
				.select("_id title body created likes")
				.limit(perPage)
				.sort({ created: -1 });
		})
		.then(quiz => {
			res.status(200).json(quiz);
		})
		.catch(err => console.log(err));
};

exports.quizByStatus = (req, res, next, status) => {
	Quiz.findOne({ status: status })
		.populate("postedBy", "_id name")
		.populate("comments.postedBy", "_id name")
		.populate("postedBy", "_id name role")
		.select(
			"_id title bodyFirst bodySecond photoFirst photoSecond likesFirst likesSecond unlikesFirst unlikesSecond comments"
		)
		.exec((err, quiz) => {
			if (err || !quiz) {
				return res.status(400).json({
					error: err
				});
			}
			req.quiz = quiz;
			next();
		});
};

exports.singleQuiz = (req, res) => {
	// console.log(req.quiz);
	return res.json(req.quiz);
};

exports.createQuiz = (req, res, next) => {
	let form = new formidable.IncomingForm();
	form.keepExtensions = true;
	form.parse(req, (err, fields, files) => {
		if (err) {
			return res.status(400).json({
				error: "Image could not be uploaded"
			});
		}
		// console.log(fields);
		// console.log(files);

		let post = new Quiz(fields);
		// req.profile.hashed_password = undefined;
		// req.profile.salt = undefined;

		post.postedBy = req.profile;

		// console.log(JSON.parse(fields.category));
		// post.category = JSON.parse(fields.category);

		if (files.photoFirst) {
			post.photoFirst.data = fs.readFileSync(files.photoFirst.path);
			post.photoFirst.contentType = files.photoFirst.type;
		}
		if (files.photoSecond) {
			post.photoSecond.data = fs.readFileSync(files.photoSecond.path);
			post.photoSecond.contentType = files.photoSecond.type;
		}
		post.save((err, result) => {
			if (err) {
				return res.status(400).json({
					error: err
				});
			}
			res.json(result);
		});
	});
};

exports.photoFirst = (req, res, next) => {
	res.set("Content-Type", req.quiz.photoFirst.contentType);
	return res.send(req.quiz.photoFirst.data);
};

exports.photoSecond = (req, res, next) => {
	res.set("Content-Type", req.quiz.photoSecond.contentType);
	return res.send(req.quiz.photoSecond.data);
};

exports.like = (req, res) => {
	// console.log(req.body);
	const likesId = req.body.likeId;

	switch (likesId) {
		case "likesFirst":
			Quiz.findByIdAndUpdate(
				req.body.quizId,
				{ $push: { likesFirst: req.body.userId } },
				{ new: true }
			).exec((err, result) => {
				if (err) {
					return res.status(400).json({
						error: err
					});
				} else {
					res.json(result);
				}
			});

			break;
		case "likesSecond":
			Quiz.findByIdAndUpdate(
				req.body.quizId,
				{ $push: { likesSecond: req.body.userId } },
				{ new: true }
			).exec((err, result) => {
				if (err) {
					return res.status(400).json({
						error: err
					});
				} else {
					res.json(result);
				}
			});
			break;
		case "unlikesFirst":
			Quiz.findByIdAndUpdate(
				req.body.quizId,
				{ $push: { unlikesFirst: req.body.userId } },
				{ new: true }
			).exec((err, result) => {
				if (err) {
					return res.status(400).json({
						error: err
					});
				} else {
					res.json(result);
				}
			});
			break;

		case "unlikesSecond":
			Quiz.findByIdAndUpdate(
				req.body.quizId,
				{ $push: { unlikesSecond: req.body.userId } },
				{ new: true }
			).exec((err, result) => {
				if (err) {
					return res.status(400).json({
						error: err
					});
				} else {
					res.json(result);
				}
			});
			break;

		default:
		// code block
	}
};

exports.unlike = (req, res) => {
	// console.log(req.body);
	const likesId = req.body.likeId;

	switch (likesId) {
		case "likesFirst":
			Quiz.findByIdAndUpdate(
				req.body.quizId,
				{ $pull: { likesFirst: req.body.userId } },
				{ new: true }
			).exec((err, result) => {
				if (err) {
					return res.status(400).json({
						error: err
					});
				} else {
					res.json(result);
				}
			});
			break;
		case "unlikesFirst":
			Quiz.findByIdAndUpdate(
				req.body.quizId,
				{ $pull: { unlikesFirst: req.body.userId } },
				{ new: true }
			).exec((err, result) => {
				if (err) {
					return res.status(400).json({
						error: err
					});
				} else {
					res.json(result);
				}
			});
			break;
		case "unlikesSecond":
			Quiz.findByIdAndUpdate(
				req.body.quizId,
				{ $pull: { unlikesSecond: req.body.userId } },
				{ new: true }
			).exec((err, result) => {
				if (err) {
					return res.status(400).json({
						error: err
					});
				} else {
					res.json(result);
				}
			});
			break;
		case "likesSecond":
			Quiz.findByIdAndUpdate(
				req.body.quizId,
				{ $pull: { likesSecond: req.body.userId } },
				{ new: true }
			).exec((err, result) => {
				if (err) {
					return res.status(400).json({
						error: err
					});
				} else {
					res.json(result);
				}
			});
			break;
		default:
		// code block
	}
};

exports.comment = (req, res) => {
	let comment = req.body.comment;

	comment.postedBy = req.body.userId;
	// console.log(comment, req.body.quizId);

	Quiz.findByIdAndUpdate(
		req.body.quizId,
		{ $push: { comments: comment } },
		{ new: true }
	)
		// .populate("comments.postedBy", "_id name")
		// .populate("postedBy", "_id name")
		.exec((err, result) => {
			if (err) {
				return res.status(400).json({
					error: err
				});
			} else {
				res.json(result);
			}
		});
};

exports.uncomment = (req, res) => {
	let comment = req.body.comment;

	Quiz.findByIdAndUpdate(
		req.body.quizId,
		{ $pull: { comments: { _id: comment._id } } },
		{ new: true }
	)
		// .populate("comments.postedBy", "_id name")
		// .populate("postedBy", "_id name")
		.exec((err, result) => {
			if (err) {
				return res.status(400).json({
					error: err
				});
			} else {
				res.json(result);
			}
		});
};
