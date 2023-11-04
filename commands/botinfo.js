const { SlashCommandBuilder } = require('discord.js');
const pkg = require('../package.json');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('botinfo')
		.setDescription('Bot information')
		.setDMPermission(false),

	async execute(interaction, Discord, config, language) {
		const row = new Discord.ActionRowBuilder().addComponents(
			new Discord.ButtonBuilder()
				.setLabel(`${language.inviteBot}`)
				.setURL(config.links.addBot)
				.setStyle(Discord.ButtonStyle.Link),
			new Discord.ButtonBuilder()
				.setLabel(`${language.blacklistField1}`)
				.setURL(config.links.status)
				.setStyle(Discord.ButtonStyle.Link),
			new Discord.ButtonBuilder()
				.setLabel(`${language.website}`)
				.setURL(config.links.website)
				.setStyle(Discord.ButtonStyle.Link),
		);

		const row1 = new Discord.ActionRowBuilder().addComponents(
			new Discord.ButtonBuilder()
				.setLabel(`${language.donate}`)
				.setEmoji(config.emojis.money)
				.setURL(config.links.donate)
				.setStyle(Discord.ButtonStyle.Link),
			new Discord.ButtonBuilder()
				.setLabel(`${language.upvote}`)
				.setEmoji(config.emojis.robotHeart)
				.setURL(config.links.vote)
				.setStyle(Discord.ButtonStyle.Link),
		);

		const embed = new Discord.EmbedBuilder()
			.setColor(config.embedColor)
			.setAuthor({
				name: `Scar ${language.info}`,
				iconURL: interaction.client.user.displayAvatarURL(),
			})
			.setFooter({
				text: `${language.hostLoveFooter}`,
			})
			.addFields(
				{
					name: language.info,
					value: `> ${language.owner}: <@${config.ownerId}>\n> ${
						language.scarVersion
					}: [\`v${pkg.version}\`](${config.links.changelog})\n> ${
						language.commandsCapital
					}: \`${config.commands}\`\n> ${language.shard}: \`#${
						interaction.guild.shardId
					}\`\n> ${language.ping}: \`${Math.round(
						interaction.client.ws.ping,
					)}ms\`\n> ${language.uptime}: <t:${Math.floor(
						interaction.client.readyTimestamp / 1000,
					)}:R>`,
					inline: false,
				},
				{
					name: language.stats,
					value: `> \`${interaction.client.guilds.cache.size}+\` ${
						language.servers
					}\n> \`${interaction.client.guilds.cache
						.filter((guild) => guild.available)
						.reduce((acc, guild) => acc + guild.memberCount, 0)}+\` ${
						language.users
					}\n> \`${interaction.client.channels.cache.size}+\` ${
						language.channels
					}`,
					inline: true,
				},
			);

		interaction.reply({
			embeds: [embed],
			components: [row, row1],
		});
	},
};
