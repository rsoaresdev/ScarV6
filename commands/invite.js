const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('invite')
		.setDescription('Would you like to get this bot in your own server?')
		.setDMPermission(false),

	async execute(interaction, Discord, config, language) {
		const row1 = new Discord.ActionRowBuilder().addComponents(
			new Discord.ButtonBuilder()
				.setLabel(`${language.addToDiscord}`)
				.setEmoji(config.emojis.robotHeart)
				.setURL(config.links.addBot)
				.setStyle(Discord.ButtonStyle.Link),
		);

		const embed = new Discord.EmbedBuilder()
			.setColor(config.embedColor)
			.setThumbnail(interaction.client.user.displayAvatarURL())
			.setDescription(
				language.addbotMSG.replace(/{clientID}/g, `<@${interaction.client.application.id}>`),
			);
		return interaction.reply({
			embeds: [embed],
			components: [row1],
		});
	},
};
