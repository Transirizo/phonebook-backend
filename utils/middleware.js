var morgan = require("morgan");

const requestLogger = (req, res, next) => {
	console.log("Method:", req.method);
	console.log("Path: ", req.path);
	console.log("Body: ", req.body);
	console.log("---");
	next();
};

const unknownEndpoint = (req, res) => {
	res.status(404).send({ error: "unknown endpoint" });
};

morgan.token("person", function (req, res) {
	return JSON.stringify(req.body);
});

const requestMorgan = morgan(function (tokens, req, res) {
	return [
		tokens.method(req, res),
		tokens.url(req, res),
		tokens.status(req, res),
		tokens.res(req, res, "content-length"),
		"-",
		tokens["response-time"](req, res),
		"ms",
		tokens.person(req, res),
	].join(" ");
});

const errorHandler = (error, req, res, next) => {
	console.error(error.message);
	if (error.name === "CastError") {
		return res.status(400).send({ error: "malformatted id" });
	} else if (error.name === "ValidationError") {
		return res.status(400).json({ error: error.message });
	}
	next(error);
};

module.exports = {
	requestLogger,
	requestMorgan,
	unknownEndpoint,
	errorHandler,
};
