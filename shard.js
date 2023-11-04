require('dotenv').config();

const { ShardingManager } = require('discord.js');

const manager = new ShardingManager('./index.js', {
	token: process.env.CLIENT_TOKEN,
	shards: 'auto',
});

manager.spawn({
	timeout: 180000, // 3 minutes
});

manager.on('shardCreate', async (shard) => {
	const { id } = shard;
	console.log(`Shard #${id} launched`);
});
