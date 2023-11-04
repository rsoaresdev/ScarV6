const mongoose = require('mongoose');

const Schema = new mongoose.Schema({
	Guild: String,
	User: String,
	Inventory: Object,
	Pickaxe: Number,
});

module.exports = mongoose.model('shop', Schema);
