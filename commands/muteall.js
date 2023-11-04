const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('muteall')
		.setDescription(
			'Mute or unmute all members connected to your voice channel',
		)
		.addStringOption((option) => option
			.setName('option')
			.setDescription('Select an option')
			.setRequired(true)
			.addChoices(
				{ name: 'Mute All', value: 'mute' },
				{ name: 'Unmute All', value: 'unmute' },
			))
		.setDMPermission(false)
		.setDefaultMemberPermissions(PermissionsBitField.Flags.MuteMembers),

	async execute(interaction, Discord, config, language) {
		if (
			!interaction.guild.members.me.permissions.has(
				Discord.PermissionsBitField.Flags.MuteMembers,
			)
		) {
			const embed2 = new Discord.EmbedBuilder()
				.setDescription(`${config.emojis.error} ${language.MEpermMuteMembers}`)
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
				member.voice.setMute(true);
			});

			const embed = new Discord.EmbedBuilder()
				.setDescription(
					`${language.int10} \`${channel.name}\` ${language.int11}`,
				)
				.setColor('c92a2a');

			interaction.reply({
				embeds: [embed],
			});
		}

		if (type === 'unmute') {
			Array.from(channel.members).forEach(([, member]) => {
				member.voice.setMute(false);
			});

			const embed = new Discord.EmbedBuilder()
				.setDescription(
					`${language.int23} \`${channel.name}\` ${language.int24}`,
				)
				.setColor('4cb03f');

			interaction.reply({
				embeds: [embed],
			});
		}
	},
};
