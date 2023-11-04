const Discord = require('discord.js');
const config = require('../config.json');

module.exports = {
	name: Discord.Events.GuildCreate,
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
			.setTitle(`${config.emojis.online} Guilds Log`)
			.setDescription(`<t:${Math.floor(Date.now() / 1000)}:D> (<t:${Math.floor(Date.now() / 1000)}:T>)\n\n> **Name:** \`${guild.name}\`\n> **ID:** \`${guild.id}\`\n> **Owner:** \`${guild.ownerId}\`\n> **Member Count:** \`${guild.memberCount}\``)
			.setFooter({
				text: `${guild.client.guilds.cache.size} servers`,
			})
			.setColor('339B61');

		// Get and send to 'logGuild' channel
		guild.client.channels.cache.get(config.channels.logGuild).send({
			embeds: [embedLog],
		});

		// Get and send new guild.members.message
		const welcomeChannel = guild.channels.cache
			.find((channel) => channel.type === Discord.ChannelType.GuildText
		&& channel.permissionsFor(guild.members.me)
		  .has([
		    Discord.PermissionsBitField.Flags.SendMessages,
		    Discord.PermissionsBitField.Flags.EmbedLinks,
		  ]));

		if (welcomeChannel) {
			// Create embed
			const row = new Discord.ActionRowBuilder().addComponents(
				new Discord.ButtonBuilder()
					.setLabel('Invite')
					.setURL(config.links.addBot)
					.setStyle(Discord.ButtonStyle.Link),
				new Discord.ButtonBuilder()
					.setLabel('Website')
					.setURL(config.links.website)
					.setStyle(Discord.ButtonStyle.Link),
			);

			const embedNewServer = new Discord.EmbedBuilder()
				.setColor(config.embedColor)
				.setDescription(`Hey! My name is **Scar**.\n\n Thanks for inviting me to your server, it means a lot to us!\nPlease, configure all the bot's systems and commands on the [\`dashboard\`](https://scarbot.com/dashboard/${guild.id}) & see the list of commands [\`here\`](${config.links.commands})\n\n> Server number: \`${guild.client.guilds.cache.size}\``)
				.setFooter({
					text: 'Use it, have fun, and repeat it!',
				});

			// Send message
			await welcomeChannel.send({
				embeds: [embedNewServer],
				components: [row],
			});
		}
	},
};
