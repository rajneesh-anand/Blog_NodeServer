const Post = require("../models/post");
const Category = require("../models/category");
const formidable = require("formidable");
const fs = require("fs");
const _ = require("lodash");

exports.postById = (req, res, next, id) => {
	Post.findById(id)
		.populate("postedBy", "_id name")
		.populate("comments.postedBy", "_id name")
		.populate("postedBy", "_id name role")
		.populate("category", "_id name ")
		.select("_id title body created likes comments photo")
		.exec((err, post) => {
			if (err || !post) {
				return res.status(400).json({
					error: err,
				});
			}
			req.post = post;
			next();
		});
};

exports.postBySlug = (req, res, next, id) => {
	Post.findById(id)
		.populate("postedBy", "_id name")
		.populate("comments.postedBy", "_id name")
		.populate("postedBy", "_id name role")
		.populate("category", "_id name ")
		.select("_id title body created likes comments photo")
		.exec((err, post) => {
			if (err || !post) {
				return res.status(400).json({
					error: err,
				});
			}
			req.post = post;
			next();
		});
};

exports.postByCategory = (req, res) => {
	Post.find({ category: req.query.category })

		.select("_id title category body created likes comments photo")
		.exec((err, post) => {
			if (err || !post) {
				return res.status(400).json({
					error: err,
				});
			}
			req.post = post;
			next();
		});
};
/*
exports.getPosts = (req, res) => {
    const posts = Post.find()
        .populate("postedBy", "_id name")
        .populate("comments", "text created")
        .populate("comments.postedBy", "_id name")
        .select("_id title body created likes")
        .sort({ created: -1 })
        .then(posts => {
            res.json(posts);
        })
        .catch(err => console.log(err));
};
*/

// with pagination
exports.getPosts = async (req, res) => {
	// get current page from req.query or use default value of 1
	const currentPage = req.query.page || 1;
	// return 3 posts per page
	const perPage = 25;
	let totalItems;

	const posts = await Post.find()
		// countDocuments() gives you total count of posts
		.countDocuments()
		.then((count) => {
			totalItems = count;
			return Post.find()
				.skip((currentPage - 1) * perPage)
				.populate("comments", "text created")
				.populate("comments.postedBy", "_id name")
				.populate("postedBy", "_id name")
				.populate("category", "_id name")
				.select("_id title body created likes")
				.limit(perPage)
				.sort({ created: -1 });
		})
		.then((posts) => {
			res.status(200).json(posts);
		})
		.catch((err) => console.log(err));
};

exports.createPost = (req, res, next) => {
	let form = new formidable.IncomingForm();
	form.keepExtensions = true;
	form.parse(req, (err, fields, files) => {
		if (err) {
			return res.status(400).json({
				error: "Image could not be uploaded",
			});
		}
		console.log(fields);
		console.log(files);
		let post = new Post(fields);
		req.profile.hashed_password = undefined;
		req.profile.salt = undefined;

		post.postedBy = req.profile;

		// console.log(JSON.parse(fields.category));
		// post.category = JSON.parse(fields.category);

		if (files.photo) {
			post.photo.data = fs.readFileSync(files.photo.path);
			post.photo.contentType = files.photo.type;
		}
		post.save((err, result) => {
			if (err) {
				return res.status(400).json({
					error: err,
					message: err + " FAILED",
				});
			}
			res.status(200).json({ data: result, message: "success" });
		});
	});
};

exports.postsByUser = (req, res) => {
	Post.find({ postedBy: req.profile._id })
		.populate("postedBy", "_id name")
		.select("_id title body created likes")
		.sort("_created")
		.exec((err, posts) => {
			if (err) {
				return res.status(400).json({
					error: err,
				});
			}
			res.json(posts);
		});
};

exports.isPoster = (req, res, next) => {
	let sameUser = req.post && req.auth && req.post.postedBy._id == req.auth._id;
	let adminUser = req.post && req.auth && req.auth.role === "admin";

	// console.log("req.post ", req.post, " req.auth ", req.auth);
	// console.log("SAMEUSER: ", sameUser, " ADMINUSER: ", adminUser);

	let isPoster = sameUser || adminUser;

	if (!isPoster) {
		return res.status(403).json({
			error: "User is not authorized",
		});
	}
	next();
};

exports.getPostsByCategory = async (req, res) => {
	console.log(req.params.slug);
	const slug = req.params.slug;
	const currentPage = req.query.page || 1;
	const perPage = 25;
	let totalItems;

	await Category.find({ slug: slug }, (err, category) => {
		if (err) {
			return res.status(422).json({
				error: "Your request could not be processed. Please try again",
			});
		}
		console.log(category[0]._id);
		Post.find({ category: category[0]._id })
			.countDocuments()
			.then((count) => {
				totalItems = count;
				return Post.find({ category: category[0]._id })
					.skip((currentPage - 1) * perPage)
					.populate("category", " _id name")
					.populate("postedBy", "_id name")
					.select("_id title body created likes")
					.limit(perPage)
					.sort({ created: -1 });
			})
			.then((posts) => {
				res.status(200).json(posts);
			})
			.catch((err) => console.log(err));
	});
};
// exports.updatePost = (req, res, next) => {
//     let post = req.post;
//     post = _.extend(post, req.body);
//     post.updated = Date.now();
//     post.save(err => {
//         if (err) {
//             return res.status(400).json({
//                 error: err
//             });
//         }
//         res.json(post);
//     });
// };

exports.updatePost = (req, res, next) => {
	let form = new formidable.IncomingForm();
	form.keepExtensions = true;
	form.parse(req, (err, fields, files) => {
		if (err) {
			return res.status(400).json({
				error: "Photo could not be uploaded",
			});
		}
		// save post
		let post = req.post;
		post = _.extend(post, fields);
		post.updated = Date.now();

		if (files.photo) {
			post.photo.data = fs.readFileSync(files.photo.path);
			post.photo.contentType = files.photo.type;
		}

		post.save((err, result) => {
			if (err) {
				return res.status(400).json({
					error: err,
				});
			}
			res.json(post);
		});
	});
};

exports.deletePost = (req, res) => {
	let post = req.post;
	post.remove((err, post) => {
		if (err) {
			return res.status(400).json({
				error: err,
			});
		}
		res.json({
			message: "Post deleted successfully",
		});
	});
};

exports.photo = (req, res, next) => {
	if (req.post.photo.data) {
		res.set("Content-Type", req.post.photo.contentType);
		return res.send(req.post.photo.data);
	} else {
		return res.send("No Photo Found");
	}
};

exports.singlePost = (req, res) => {
	console.log(req.post);
	return res.json(req.post);
};

exports.like = (req, res) => {
	Post.findByIdAndUpdate(
		req.body.postId,
		{ $push: { likes: req.body.userId } },
		{ new: true }
	).exec((err, result) => {
		if (err) {
			return res.status(400).json({
				error: err,
			});
		} else {
			res.json(result);
		}
	});
};

exports.unlike = (req, res) => {
	Post.findByIdAndUpdate(
		req.body.postId,
		{ $pull: { likes: req.body.userId } },
		{ new: true }
	).exec((err, result) => {
		if (err) {
			return res.status(400).json({
				error: err,
			});
		} else {
			res.json(result);
		}
	});
};

exports.comment = (req, res) => {
	let comment = req.body.comment;
	comment.postedBy = req.body.userId;

	Post.findByIdAndUpdate(
		req.body.postId,
		{ $push: { comments: comment } },
		{ new: true }
	)
		.populate("comments.postedBy", "_id name")
		.populate("postedBy", "_id name")
		.exec((err, result) => {
			if (err) {
				return res.status(400).json({
					error: err,
				});
			} else {
				res.json(result);
			}
		});
};

exports.uncomment = (req, res) => {
	let comment = req.body.comment;

	Post.findByIdAndUpdate(
		req.body.postId,
		{ $pull: { comments: { _id: comment._id } } },
		{ new: true }
	)
		.populate("comments.postedBy", "_id name")
		.populate("postedBy", "_id name")
		.exec((err, result) => {
			if (err) {
				return res.status(400).json({
					error: err,
				});
			} else {
				res.json(result);
			}
		});
};

// exports.updateComment = async (req, res) => {
//     const comment = req.body.comment;
//     // const id = req.body.id;
//     const postId = req.body.postId;
//     const userId = req.body.userId;
//     // comment.postedBy = req.body.userId;

//     const result = await Post.findByIdAndUpdate(
//         postId,
//         {
//             $set: {
//                 comments: {
//                     _id: comment._id,
//                     text: comment.text,
//                     postedBy: userId
//                 }
//             }
//         },
//         { new: true, overwrite: false }
//     )
//         .populate('comments.postedBy', '_id name')
//         .populate('postedBy', '_id name');
//     res.json(result);
// };

exports.updateComment = (req, res) => {
	let comment = req.body.comment;

	Post.findByIdAndUpdate(req.body.postId, {
		$pull: { comments: { _id: comment._id } },
	}).exec((err, result) => {
		if (err) {
			return res.status(400).json({
				error: err,
			});
		} else {
			Post.findByIdAndUpdate(
				req.body.postId,
				{ $push: { comments: comment, updated: new Date() } },
				{ new: true }
			)
				.populate("comments.postedBy", "_id name")
				.populate("postedBy", "_id name")
				.exec((err, result) => {
					if (err) {
						return res.status(400).json({
							error: err,
						});
					} else {
						res.json(result);
					}
				});
		}
	});
};

/*

// update commennt by Alaki
exports.updateComment = async (req, res) => {
  const commentId = req.body.id;
  const comment = req.body.comment;
 
  const updatedComment = await Post.updateOne(
    { comments: { $elemMatch: { _id: commentId } } },
    { $set: { "comments.$.text": comment } }
  );
  if (!updatedComment)
    res.status(404).json({ message: Language.fa.NoPostFound });
 
  res.json(updatedComment);
};

// update commennt with auth
exports.updateComment = async (req, res) => {
  const commentId = req.body.id;
  const comment = req.body.comment;
  const postId = req.params.id;
 
  const post = await Post.findById(postId);
  const com = post.comments.map(comment => comment.id).indexOf(commentId);
  const singleComment = post.comments.splice(com, 1);
  let authorized = singleComment[0].commentedBy;
  console.log("Security Check Passed ?", req.auth._id == authorized);
 
  if (authorized != req.auth._id)
    res.status(401).json({ mesage: Language.fa.UnAuthorized });
 
  const updatedComment = await Post.updateOne(
    { comments: { $elemMatch: { _id: commentId } } },
    { $set: { "comments.$.text": comment } }
  );
  if (!updatedComment)
    res.status(404).json({ message: Language.fr.NoPostFound });
 
  res.json({ message: Language.fr.CommentUpdated });
};
 */
