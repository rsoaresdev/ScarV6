const { SlashCommandBuilder, ChannelType, PermissionsBitField } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('unlock')
		.setDescription('Unlocks a channel')
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

		await canal.permissionOverwrites.edit(interaction.guild.id, {
			SendMessages: true,
		});

		const embed = new Discord.EmbedBuilder()
			.setDescription(`🔓 ${canal} ${language.unlock4}`)
			.setColor(config.embedColor);
		interaction.reply({
			embeds: [embed],
		});
	},
};
