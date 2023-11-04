const Discord = require('discord.js');
const config = require('../config.json');

module.exports = {
	name: Discord.Events.GuildDelete,
	async execute(guild) {
		if (!guild.available) return;

		// Create embed
		const embedLog = new Discord.EmbedBuilder()
			.setThumbnail(
				guild.iconURL({
					animated: true,
					size: 4096,
				}),
			)
			.setTitle(`${config.emojis.dnd} Guilds Log`)
			.setDescription(`<t:${Math.floor(Date.now() / 1000)}:D> (<t:${Math.floor(Date.now() / 1000)}:T>)\n\n> **Name:** \`${guild.name}\`\n> **ID:**\`${guild.id
			}\`\n> **Owner:** \`${guild.ownerId}\`\n> **Member Count:** \`${guild.memberCount}\``)
			.setFooter({
				text: `${guild.client.guilds.cache.size} servers`,
			})
			.setColor('D63535');

		// Get and send to 'logGuilds' channel
		guild.client.channels.cache.get(config.channels.logGuild).send({
			embeds: [embedLog],
		});
	},
};
