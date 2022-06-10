const express = require("express");
const cors = require("cors");
const personsRouter = require("./controller/persons");
const app = express();
const middleware = require("./utils/middleware");
const logger = require("./utils/logger");
const config = require("./utils/config");
const mongoose = require("mongoose");

logger.info("connecting to", config.MONGODB_URL);

mongoose
	.connect(config.MONGODB_URL)
	.then((res) => {
		logger.info("connected to MongoDB");
	})
	.catch((error) => {
		logger.error("error connecting to MongoDB", error.message);
	});

app.use(cors());
app.use(express.json());
app.use(express.static("build"));
app.use(middleware.requestLogger);
app.use(middleware.requestMorgan);
app.use("/api/persons", personsRouter);
app.use(middleware.unknownEndpoint);
app.use(middleware.errorHandler);

module.exports = app;
