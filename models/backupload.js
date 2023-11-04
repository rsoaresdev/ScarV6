const mongoose = require('mongoose');

const Schema = new mongoose.Schema({
	time: Number,
	userId: String,
});

module.exports = mongoose.model('backupload', Schema);
