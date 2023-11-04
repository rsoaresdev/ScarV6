const { SlashCommandBuilder, ChannelType, PermissionsBitField } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('lock')
		.setDescription('Locks a channel')
		.addChannelOption((option) => option
			.setName('channel')
			.setDescription('Enter a channel')
			.addChannelTypes(ChannelType.GuildText)
			.setRequired(true))
		.setDMPermission(false)
		.setDefaultMemberPermissions(PermissionsBitField.Flags.ManageRoles),

	async execute(interaction, Discord, config, language) {
		const canal = interaction.options.getChannel('channel');

		if (
			!interaction.guild.members.me.permissions.has(
				Discord.PermissionsBitField.Flags.ManageRoles,
			)
		) {
			const embed2 = new Discord.EmbedBuilder()
				.setDescription(`${config.emojis.error} ${language.MEpermManageRoles}`)
				.setColor(config.embedColor);

			return interaction.reply({
				embeds: [embed2],
				ephemeral: true,
			});
		}

		await canal.permissionOverwrites.edit(interaction.guild.id, {
			SendMessages: false,
		});

		const embed = new Discord.EmbedBuilder()
			.setDescription(`🔒  ${canal} ${language.locked}`)
			.setColor(config.embedColor);

		interaction.reply({
			embeds: [embed],
		});
	},
};
