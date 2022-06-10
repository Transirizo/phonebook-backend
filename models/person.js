const mongoose = require("mongoose");

const personSchema = new mongoose.Schema({
	name: { type: String, minlength: 3, required: true },
	number: {
		type: String,
		validate: {
			validator: function (v) {
				return /^(?:\+?86)?1(?:3\d{3}|5[^4\D]\d{2}|8\d{3}|7(?:[235-8]\d{2}|4(?:0\d|1[0-2]|9\d))|9[0-35-9]\d{2}|66\d{2})\d{6}$/.test(
					v
				);
			},
			message: (props) => `${props.value} is not a valid phone number!`,
		},
		required: true,
	},
});

personSchema.set("toJSON", {
	transform: (document, returnedObject) => {
		returnedObject.id = returnedObject._id.toString();
		delete returnedObject._id;
		delete returnedObject.__v;
	},
});

module.exports = mongoose.model("Person", personSchema);
