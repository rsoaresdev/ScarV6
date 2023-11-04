const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('say')
		.setDescription('Make the bot say something.')
		.addStringOption((option) => option
			.setName('text')
			.setDescription('Enter a text. To make a paragraph, type <br>')
			.setRequired(true)
			.setMaxLength(1024))
		.setDMPermission(false),

	async execute(interaction, Discord, config, language) {
		const string = interaction.options.getString('text');
		const textoWithBR = string.replace(/<br>/g, '\n');

		// Max 15 rows
		if (textoWithBR.split(/\r\n|\r|\n/).length > 15) {
			const noMoreThan15Rows = new Discord.EmbedBuilder()
				.setColor(config.embedColor)
				.setDescription(`${config.emojis.error} ${language.noMoreThan15Rows}`);

			return interaction.reply({
				embeds: [noMoreThan15Rows],
				ephemeral: true,
			});
		}

		const embed = new Discord.EmbedBuilder()
			.setDescription(textoWithBR)
			.setFooter({
				text: `${language.executedBy} ${interaction.user.username}`,
				iconURL: interaction.user.displayAvatarURL(),
			})
			.setColor(config.embedColor);

		return interaction.reply({
			embeds: [embed],
		});
	},
};
