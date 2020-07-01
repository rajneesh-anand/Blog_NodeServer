const Mongoose = require("mongoose");
const slug = require("mongoose-slug-generator");
const { Schema } = Mongoose;

const options = {
	separator: "-",
	lang: "en",
	truncate: 120
};

Mongoose.plugin(slug, options);

const quizSchema = new Schema({
	title: {
		type: String,
		required: true
	},
	slug: { type: String, slug: "title", unique: true },
	bodyFirst: {
		type: String,
		required: true
	},
	bodySecond: {
		type: String,
		required: true
	},
	category: {
		type: Schema.Types.ObjectId,
		ref: "Category"
	},
	photoFirst: {
		data: Buffer,
		contenType: String
	},
	photoSecond: {
		data: Buffer,
		contenType: String
	},
	postedBy: {
		type: Schema.Types.ObjectId,
		ref: "User"
	},
	status: {
		type: String,
		required: true
	},
	created: {
		type: Date,
		default: Date.now
	},
	updated: Date,
	likesFirst: [{ type: Schema.Types.ObjectId, ref: "User" }],
	likesSecond: [{ type: Schema.Types.ObjectId, ref: "User" }],
	unlikesSecond: [{ type: Schema.Types.ObjectId, ref: "User" }],
	unlikesFirst: [{ type: Schema.Types.ObjectId, ref: "User" }],

	comments: [
		{
			text: String,
			created: { type: Date, default: Date.now },
			postedBy: { type: Schema.Types.ObjectId, ref: "User" }
		}
	]
});

module.exports = Mongoose.model("Quiz", quizSchema);
