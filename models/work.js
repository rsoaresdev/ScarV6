const mongoose = require('mongoose');

const Schema = new mongoose.Schema({
	time: Number,
	id: String,
	guildID: String,
});

module.exports = mongoose.model('work', Schema);
