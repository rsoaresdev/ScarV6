const mongoose = require('mongoose');

const Schema = new mongoose.Schema({
	time: Number,
	id: String,
	guildID: String,
	amount: Number,
});

module.exports = mongoose.model('invest', Schema);
