const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('clear')
		.setDescription('Deletes a certain number of messages')
		.addNumberOption((option) => option
			.setName('amount')
			.setDescription('Enter the number of messages to be deleted')
			.setRequired(true)
			.setMinValue(1)
			.setMaxValue(100))
		.setDMPermission(false)
		.setDefaultMemberPermissions(PermissionsBitField.Flags.ManageMessages),

	async execute(interaction, Discord, config, language) {
		if (
			!interaction.guild.members.me.permissions.has(
				Discord.PermissionsBitField.Flags.ManageMessages,
			)
		) {
			const embed1 = new Discord.EmbedBuilder()
				.setDescription(
					`${config.emojis.error} ${language.MEpermManageMessages}`,
				)
				.setColor(config.embedColor);

			return interaction.reply({
				embeds: [embed1],
				ephemeral: true,
			});
		}

		const quantidade = interaction.options.getNumber('amount');

		try {
			const Response = new Discord.EmbedBuilder().setColor(config.embedColor);

			await interaction.channel
				.bulkDelete(quantidade, true)
				.then((messages) => {
					Response.setDescription(
						`${config.emojis.robotTrash} ${language.delete1} ${messages.size} ${language.delete2}`,
					);

					interaction.reply({
						embeds: [Response],
						ephemeral: true,
					});
				})
				.catch((err) => {
					console.log(err);
				});
		}
		catch (err) {
			const embedError = new Discord.EmbedBuilder()
				.setColor(config.embedColor)
				.setDescription(
					`${config.emojis.error} ${language.unableDeleteMessages}`,
				);

			interaction.reply({
				embeds: [embedError],
			});
		}
	},
};
