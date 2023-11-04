const mongoose = require('mongoose');

const Schema = new mongoose.Schema({
	daily: Number,
	id: String,
	guildID: String,
});

module.exports = mongoose.model('daily', Schema);
