const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('randomnumber')
		.setDescription('Generates a random number from 2 chosen numbers')
		.addIntegerOption((option) => option
			.setName('min')
			.setDescription('Enters the minimum value')
			.setRequired(true))
		.addIntegerOption((option) => option
			.setName('max')
			.setDescription('Enters the maximum value')
			.setRequired(true))
		.setDMPermission(false),

	async execute(interaction, Discord, config, language) {
		const min = interaction.options.getInteger('min');
		const max = interaction.options.getInteger('max');

		const rngEmbed = new Discord.EmbedBuilder()
			.setThumbnail(config.images.number)
			.addFields(
				{
					name: `${language.minVal}`,
					value: `\`${min}\``,
					inline: true,
				},
				{
					name: `${language.maxVal}`,
					value: `\`${max}\``,
					inline: true,
				},
				{
					name: `${language.valBot}`,
					value: `> \`${Math.floor(Math.random() * (max - min + 1)) + min}\``,
					inline: false,
				},
			)
			.setColor(config.embedColor);

		return interaction.reply({
			embeds: [rngEmbed],
		});
	},
};
