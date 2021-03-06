const express = require("express");
const app = express();
const mongoose = require("mongoose");
const morgan = require("morgan");
const bodyParser = require("body-parser");
var cookieParser = require("cookie-parser");
const expressValidator = require("express-validator");
const fs = require("fs");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");
dotenv.config();

mongoose
	.connect(process.env.MONGO_URI, {
		useCreateIndex: true,
		useNewUrlParser: true,
		useUnifiedTopology: true,
		useFindAndModify: false,
	})
	.then(() => console.log("DB CONNECTED"));

mongoose.connection.on("error", (err) => {
	console.log(`DB connection error: ${err.message}`);
});

app.use(express.static(path.join(__dirname, "public")));

const corsOptions = {
	origin: "http://localhost:3000",
	//origin: "https://naukrilelo.herokuapp.com"
};
app.options("*", cors());
app.use(cors(corsOptions));

// bring in routes
const postRoutes = require("./routes/post");
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/user");
const categoryRoutes = require("./routes/category");
const newsRoutes = require("./routes/news");
const quizRoutes = require("./routes/quiz");
// apiDocs
app.get("/api", (req, res) => {
	fs.readFile("docs/apiDocs.json", (err, data) => {
		if (err) {
			res.status(400).json({
				error: err,
			});
		}
		const docs = JSON.parse(data);
		res.json(docs);
	});
});

// middleware -
app.use(morgan("dev"));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(expressValidator());
// app.use(cors());
// app.options("*", cors());
app.use("/api", postRoutes);
app.use("/api", authRoutes);
app.use("/api", userRoutes);
app.use("/api", categoryRoutes);
app.use("/api", newsRoutes);
app.use("/api", quizRoutes);
app.use(function (err, req, res, next) {
	if (err.name === "UnauthorizedError") {
		res.status(401).json({ error: "Unauthorized!" });
	}
});

const port = process.env.PORT || 8080;
app.listen(port, () => {
	console.log(`A Node Server API is listening on port: ${port}`);
});
