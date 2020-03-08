const express = require("express");
const Category = require("../models/category");

// Add a category
exports.addCategory = async (req, res) => {
	const userExists = await Category.findOne({ name: req.body.name });
	if (userExists)
		return res.status(403).json({
			error: "category already exists"
		});
	const user = await new Category(req.body);
	await user.save();
	res.status(200).json(user);
};

exports.allCategory = (req, res) => {
	Category.find((err, users) => {
		if (err) {
			return res.status(400).json({
				error: err
			});
		}
		res.json(users);
	}).select("name");
};
