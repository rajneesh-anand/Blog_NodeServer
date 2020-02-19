const nodeMailer = require("nodemailer");
require("dotenv").config();

const defaultEmailData = { from: "noreply@node-react.com" };

exports.sendEmail = emailData => {
	const transporter = nodeMailer.createTransport({
		host: "smtp.gmail.com",
		port: 587,
		secure: false,
		requireTLS: true,
		auth: {
			user: process.env.SENDER_MAIL,
			pass: process.env.SENDER_ID
		}
	});
	return transporter
		.sendMail(emailData)
		.then(info => console.log(`Message sent: ${info.response}`))
		.catch(err => console.log(`Problem sending email: ${err}`));
};
