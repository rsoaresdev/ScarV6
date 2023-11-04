const mongoose = require('mongoose');

const tagssystem = new mongoose.Schema({
	guild: {
		type: String,
		required: true,
	},
	author: {
		type: String,
		required: true,
	},
	name: {
		type: String,
		required: true,
	},
	desc: {
		type: String,
		required: false,
	},
	content: {
		type: String,
		required: true,
	},
	createdAt: {
		type: String,
		required: true,
	},
	embedColor: {
		type: String,
		required: false,
	},
});

module.exports = mongoose.model('tagssystem', tagssystem);
