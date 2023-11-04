const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('mchead')
		.setDescription('See the head of a particular Minecraft player')
		.addStringOption((option) => option.setName('nick').setDescription('Enter a nick').setRequired(true))
		.setDMPermission(false),

	async execute(interaction, Discord, config, language) {
		const string = interaction.options.getString('nick');

		try {
			const embed = new Discord.EmbedBuilder()
				.setTitle(`${config.emojis.minecraft} ${string}`)
				.setImage(config.api.mcHead.replace(/{string}/g, `${string}`))
				.setColor(config.embedColor);

			interaction.reply({
				embeds: [embed],
			});
		}
		catch (err) {
			const embed1 = new Discord.EmbedBuilder()
				.setDescription(`${config.emojis.error} ${language.apiUnavailable}`)
				.setColor(config.embedColor);

			interaction.reply({
				embeds: [embed1],
				ephemeral: true,
			});
		}
	},
};
