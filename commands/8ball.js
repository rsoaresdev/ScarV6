const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('8ball')
		.setDescription('Ask the magic 8ball a question')
		.addStringOption((option) => option
			.setName('question')
			.setDescription('What should I ask?')
			.setRequired(true)
			.setMaxLength(255))
		.setDMPermission(false),

	async execute(interaction, Discord, config, language) {
		const question = interaction.options.getString('question');

		const answer = language.ballResponses[Math.floor(
			Math.random() * language.ballResponses.length,
		)];

		const answerEmbed = new Discord.EmbedBuilder()
			.setThumbnail(config.images['8ball'])
			.addFields(
				{
					name: language.question,
					value: `${question}`,
				},
				{
					name: language.response,
					value: `${answer}`,
				},
			)
			.setColor(config.embedColor);

		return interaction.reply({
			embeds: [answerEmbed],
		});
	},
};
