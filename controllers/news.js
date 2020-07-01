const NewsAPI = require("newsapi");
const newsapi = new NewsAPI("cdc9b60036d546708598e3139a098947");

exports.newsDetails = (req, res) => {
	newsapi.v2
		.sources({
			category: "sports",
			language: "en",
			country: "us"
		})
		.then(response => {
			console.log(response);
			res.status(200).json(response);
		});
};
