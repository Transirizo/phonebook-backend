const mongoose = require("mongoose");

const len = process.argv.length;
// console.log(len);
if (len !== 3 && len !== 5) {
	console.log("Please proivde password,name and number");
	process.exit(1);
}

const password = process.argv[2];
const name = process.argv[3];
const number = process.argv[4];

const url = `mongodb+srv://Transirizo:${password}@cluster.k59xu.mongodb.net/phonebook-app?retryWrites=true&w=majority`;

mongoose.connect(url);

const personSchema = new mongoose.Schema({
	name: String,
	number: String,
});

const Person = mongoose.model("Person", personSchema);

const person = new Person({
	name: name,
	number: number,
});

if (len === 5) {
	person.save().then((res) => {
		console.log("person saved!");
		mongoose.connection.close();
	});
}

if (len === 3) {
	Person.find({}).then((res) => {
		console.log("phonebook:");
		res.forEach((person) => {
			console.log(person.name, person.number);
		});
		mongoose.connection.close();
	});
}
