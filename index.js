const express = require("express");
const app = express();
var morgan = require("morgan");
const cors = require("cors");

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

app.use(express.json());
app.use(cors());
app.use(requestLogger);
app.use(express.static("build"));
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
	res.json(persons);
});

app.get("/api/persons/:id", (req, res) => {
	const id = Number(req.params.id);
	const person = persons.find((person) => person.id === id);
	if (person) {
		res.json(person);
	} else {
		res.status(204).end();
	}
});

app.post("/api/persons", (req, res) => {
	const body = req.body;
	if (!body.name) {
		return res.status(400).json({
			error: "name missing",
		});
	} else if (!body.number) {
		return res.status(400).json({
			error: "number missing",
		});
	} else if (persons.find((person) => person.name === body.name)) {
		return res.status(400).json({
			error: "name must be unique",
		});
	}
	const person = {
		id: Math.ceil(Math.random() * 100),
		name: body.name,
		number: body.number,
	};
	persons = persons.concat(person);
	res.json(person);
});

app.delete("/api/persons/:id", (req, res) => {
	const id = Number(req.params.id);
	persons = persons.filter((person) => person.id !== id);
	res.status(204).end();
});

app.use(unknownEndpoint);
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
	console.log(`Server running on ${PORT}`);
});
