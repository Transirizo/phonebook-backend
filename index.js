require("dotenv").config();
const express = require("express");
const app = express();
var morgan = require("morgan");
const cors = require("cors");
const Person = require("./models/phonebook");

let persons = [
	{
		id: 1,
		name: "Arto Hellas",
		number: "040-123456",
	},
	{
		id: 2,
		name: "Ada Lovelace",
		number: "39-44-5323523",
	},
	{
		id: 3,
		name: "Dan Abramov",
		number: "12-43-234345",
	},
	{
		id: 4,
		name: "Mary Poppendieck",
		number: "39-23-6423122",
	},
];

const length = persons.length;
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
app.use(express.static("build"));
app.use(express.json());
app.use(cors());
app.use(requestLogger);
app.use(
	morgan(function (tokens, req, res) {
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
	})
);
app.get("/", (req, res) => {
	res.send("PhoneBook");
});

app.get("/info", (req, res) => {
	res.send(`Phonebook has info for ${length} people <br />${new Date()}`);
});

app.get("/api/persons", (req, res) => {
	Person.find({}).then((persons) => {
		res.json(persons);
	});
});

app.get("/api/persons/:id", (req, res, next) => {
	Person.findById(req.params.id)
		.then((person) => {
			if (person) {
				res.json(person);
			} else {
				res.status(404).end();
			}
		})
		.catch((error) => next(error));
});

app.post("/api/persons", (req, res, next) => {
	const body = req.body;
	if (body.name === undefined) {
		return res.status(400).json({
			error: "name missing",
		});
	} else if (body.number === undefined) {
		return res.status(400).json({
			error: "number missing",
		});
	} else if (persons.find((person) => person.name === body.name)) {
		return res.status(400).json({
			error: "name must be unique",
		});
	}
	const person = new Person({
		name: body.name,
		number: body.number,
	});
	person
		.save()
		.then((savedPerson) => {
			res.json(savedPerson);
		})
		.catch((error) => next(error));
	console.log("have saved");
});

app.delete("/api/persons/:id", (req, res, next) => {
	Person.findByIdAndRemove(req.params.id)
		.then((result) => {
			res.status(204).end();
		})
		.catch((error) => next(error));
});

app.put("/api/persons/:id", (req, res, next) => {
	const { name, number } = req.body;

	Person.findByIdAndUpdate(
		req.params.id,
		{ name, number },
		{ new: true, runValidators: true, context: "query" }
	)
		.then((updatePerson) => {
			res.json(updatePerson);
		})
		.catch((error) => next(error));
});
app.use(unknownEndpoint);

const errorHandler = (error, req, res, next) => {
	console.error(error.message);
	if (error.name === "CastError") {
		return res.status(400).send({ error: "malformatted id" });
	} else if (error.name === "ValidationError") {
		return res.status(400).json({ error: error.message });
	}
	next(error);
};

app.use(errorHandler);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
	console.log(`Server running on ${PORT}`);
});
