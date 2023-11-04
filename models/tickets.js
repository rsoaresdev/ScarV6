const mongoose = require('mongoose');

const ticketSchema = mongoose.Schema({
	category: String,
	serverId: String,
	counterId: String,
	counter: Number,
});

module.exports = mongoose.model('ticket', ticketSchema);
