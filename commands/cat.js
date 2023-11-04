const { SlashCommandBuilder } = require('discord.js');
const fetch = require('node-fetch');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('cat')
		.setDescription('Sends a image of a random cat')
		.setDMPermission(false),

	async execute(interaction, Discord, config, language) {
		try {
			const response = await fetch(config.api.cat)
				.then((res) => res.json())
				.catch(console.log);

			const row = new Discord.ActionRowBuilder().addComponents(
				new Discord.ButtonBuilder()
					.setLabel(`🔗 ${language.catLink}`)
					.setURL(response.url)
					.setStyle(Discord.ButtonStyle.Link),
			);

			const Response = new Discord.EmbedBuilder()
				.setImage(response.url)
				.setColor(config.embedColor);

			interaction.reply({
				embeds: [Response],
				components: [row],
			});
		}
		catch (err) {
			const embed1 = new Discord.EmbedBuilder()
				.setDescription(`${language.catError}`)
				.setColor(config.embedColor);

			return interaction.reply({
				embeds: [embed1],
				ephemeral: true,
			});
		}
	},
};
