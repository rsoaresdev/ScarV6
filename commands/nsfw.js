const { SlashCommandBuilder, ChannelType, PermissionsBitField } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('nsfw')
		.setDescription('Enable/disable NSFW mode on a specific channel')
		.addChannelOption((option) => option
			.setName('channel')
			.setDescription('Enter a channel')
			.addChannelTypes(ChannelType.GuildText)
			.setRequired(true))
		.setDMPermission(false)
		.setDefaultMemberPermissions(PermissionsBitField.Flags.ManageChannels),

	async execute(interaction, Discord, config, language) {
		const canal = interaction.options.getChannel('channel');

		if (
			!interaction.guild.members.me.permissions.has(
				Discord.PermissionsBitField.Flags.ManageChannels,
			)
		) {
			const embed2 = new Discord.EmbedBuilder()
				.setDescription(
					`${config.emojis.error} ${language.MEpermManageChannel}`,
				)
				.setColor(config.embedColor);

			return interaction.reply({
				embeds: [embed2],
				ephemeral: true,
			});
		}

		if (canal.nsfw === false) {
			canal
				.setNSFW(true)
				.then(() => {
					const embed = new Discord.EmbedBuilder()
						.setDescription(`🔒 ${language.nsfw1} ${canal} ${language.nsfw2}`)
						.setColor(config.embedColor);
					interaction.reply({
						embeds: [embed],
					});
				})

				.catch(() => {
					const embed3 = new Discord.EmbedBuilder()
						.setDescription(`${language.nsfwErr}`)
						.setColor(config.embedColor);

					interaction.reply({
						embeds: [embed3],
						ephemeral: true,
					});
				});
		}

		if (canal.nsfw === true) {
			canal
				.setNSFW(false)
				.then(() => {
					const embed7 = new Discord.EmbedBuilder()
						.setDescription(`🔓 ${language.nsfw1} ${canal} ${language.nsfw3}`)
						.setColor(config.embedColor);

					interaction.reply({
						embeds: [embed7],
					});
				})
				.catch(() => {
					const embed3 = new Discord.EmbedBuilder()
						.setDescription(`${language.nsfwErr}`)
						.setColor(config.embedColor);

					interaction.reply({
						embeds: [embed3],
						ephemeral: true,
					});
				});
		}
	},
};
