const mongoose = require('mongoose');

const afkSchema = mongoose.Schema({
	userID: String,
	serverID: String,
	reason: String,
	oldNickname: String,
	time: {
		type: String,
		default: Date.now(),
	},
});

module.exports = mongoose.model('afk', afkSchema);
