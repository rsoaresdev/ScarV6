const { SlashCommandBuilder } = require('discord.js');
const fetch = require('node-fetch');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('dog')
		.setDescription('Sends an image of a random dog')
		.setDMPermission(false),

	async execute(interaction, Discord, config, language) {
		try {
			const response = await fetch(config.api.dog)
				.then((res) => res.json())
				.catch(console.log);

			const row = new Discord.ActionRowBuilder().addComponents(
				new Discord.ButtonBuilder()
					.setLabel(`🔗 ${language.dogLink}`)
					.setURL(response.url)
					.setStyle(Discord.ButtonStyle.Link),
			);

			const lewdembed = new Discord.EmbedBuilder()
				.setImage(response.url)
				.setColor(config.embedColor);

			interaction.reply({
				embeds: [lewdembed],
				components: [row],
			});
		}
		catch (e) {
			const embed1 = new Discord.EmbedBuilder()
				.setDescription(`${language.dogError}`)
				.setColor(config.embedColor);

			return interaction.reply({
				embeds: [embed1],
				ephemeral: true,
			});
		}
	},
};
