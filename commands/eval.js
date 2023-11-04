const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('eval')
		.setDescription('Execute sudo commands')
		.addStringOption((option) => option
			.setName('code')
			.setDescription('Enter an expression')
			.setRequired(true))
		.setDMPermission(false),

	async execute(interaction, Discord, config, language) {
		if (interaction.user.id !== config.ownerId) {
			const embed1 = new Discord.EmbedBuilder()
				.setDescription(`${config.emojis.owner} ${language.commandOwnerBot}`)
				.setColor(config.embedColor);
			return interaction.reply({
				embeds: [embed1],
				ephemeral: true,
			});
		}

		const string = interaction.options.getString('code');

		if (
			string.includes('Object.values(interaction.client)')
      || string.includes('Object.values')
      || string.includes('process.env.CLIENT_TOKEN')
		) {
			const embed2 = new Discord.EmbedBuilder()
				.setDescription(`${config.emojis.error} ${language.evalToken}`)
				.setColor(config.embedColor);

			return interaction.reply({
				embeds: [embed2],
				ephemeral: true,
			});
		}

		try {
			const resultado = await eval(string);
			const tipo = typeof resultado;
			const embed3 = new Discord.EmbedBuilder()
				.addFields(
					{
						name: `${language.code}`,
						value: `\`\`\`js\n${string}\n\`\`\``,
						inline: false,
					},
					{
						name: `${language.result}`,
						value: `\`\`\`js\n${resultado}\n\`\`\``,
						inline: false,
					},
					{
						name: `${language.type}`,
						value: `\`\`\`js\n${tipo}\n\`\`\``,
						inline: false,
					},
				)
				.setColor(config.embedColor);
			interaction.reply({
				embeds: [embed3],
			});
		}
		catch (err) {
			const embed4 = new Discord.EmbedBuilder()
				.addFields(
					{
						name: `${language.code}`,
						value: `\`\`\`js\n${string}\n\`\`\``,
						inline: false,
					},
					{
						name: `${language.error}`,
						value: `\`\`\`js\n${err}\n\`\`\``,
						inline: false,
					},
				)
				.setColor(config.embedColor);

			interaction.reply({
				embeds: [embed4],
			});
		}
	},
};
