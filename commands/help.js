const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('help')
		.setDescription('Feeling lost?')
		.setDMPermission(false),

	async execute(interaction, Discord, config, language) {
		const row = new Discord.ActionRowBuilder().addComponents(
			new Discord.ButtonBuilder()
				.setLabel(`${language.website}`)
				.setEmoji(config.emojis.tag)
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

		const embed0 = new Discord.EmbedBuilder()
			.setColor(config.embedColor)
			.setTitle(`${language.help1}`)
			.setFooter({
				text: `${language.hostLoveFooter}`,
			})
			.setDescription(
				`${language.helpMsg.replace(/{user}/g, `${interaction.user}`)}`,
			);
		interaction.reply({
			embeds: [embed0],
			ephemeral: true,
			components: [row, row1],
		});
	},
};
