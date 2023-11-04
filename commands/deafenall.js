const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('deafenall')
		.setDescription(
			'Deafen/undeafen all members connected to your voice channel',
		)
		.addStringOption((option) => option
			.setName('option')
			.setDescription('Select an option')
			.setRequired(true)
			.addChoices(
				{ name: 'Deafean All', value: 'mute' },
				{ name: 'Undeafean All', value: 'unmute' },
			))
		.setDMPermission(false)
		.setDefaultMemberPermissions(PermissionsBitField.Flags.DeafenMembers),

	async execute(interaction, Discord, config, language) {
		if (
			!interaction.guild.members.me.permissions.has(
				Discord.PermissionsBitField.Flags.DeafenMembers,
			)
		) {
			const embed2 = new Discord.EmbedBuilder()
				.setDescription(
					`${config.emojis.error} ${language.MEpermDeafenMembers}`,
				)
				.setColor(config.embedColor);

			return interaction.reply({
				embeds: [embed2],
				ephemeral: true,
			});
		}

		const { channel } = interaction.member.voice;
		if (!channel) {
			const embedF = new Discord.EmbedBuilder()
				.setDescription(language.hasToBeConnected)
				.setColor(config.embedColor);

			return interaction.reply({
				embeds: [embedF],
				ephemeral: true,
			});
		}

		const type = interaction.options.getString('option');

		if (type === 'mute') {
			Array.from(channel.members).forEach(([, member]) => {
				member.voice.setDeaf(true);
			});

			const embed = new Discord.EmbedBuilder()
				.setDescription(
					`${language.int10} \`${channel.name}\` ${language.int12}`,
				)
				.setColor('c92a2a');

			return interaction.reply({
				embeds: [embed],
			});
		}

		if (type === 'unmute') {
			Array.from(channel.members).forEach(([, member]) => {
				member.voice.setDeaf(false);
			});

			const embed = new Discord.EmbedBuilder()
				.setDescription(
					`${language.int23} \`${channel.name}\` ${language.int24}`,
				)
				.setColor('4cb03f');

			return interaction.reply({
				embeds: [embed],
			});
		}
	},
};
