const mongoose = require('mongoose');

const Schema = new mongoose.Schema({
	discordId: String,
	isBlacklisted: Boolean,
	reason: String,
});

module.exports = mongoose.model('blacklist', Schema);
