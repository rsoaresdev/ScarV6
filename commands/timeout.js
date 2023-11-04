const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');
const ms = require('ms');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('timeout')
		.setDescription('Timeout a member')
		.addUserOption((option) => option.setName('user').setDescription('Select a user').setRequired(true))
		.addStringOption((option) => option
			.setName('duration')
			.setDescription('Select a duration')
			.setRequired(true))
		.addStringOption((option) => option.setName('reason').setDescription('Enter a reason'))
		.setDMPermission(false)
		.setDefaultMemberPermissions(PermissionsBitField.Flags.ModerateMembers),

	async execute(interaction, Discord, config, language) {
		const tempo = interaction.options.getString('duration');
		const user = interaction.options.getUser('user');
		const motivo = interaction.options.getString('reason');
		const member = interaction.guild.members.cache.get(user.id);

		if (
			!interaction.guild.members.me.permissions.has(
				Discord.PermissionsBitField.Flags.ModerateMembers,
			)
		) {
			const embed1 = new Discord.EmbedBuilder()
				.setDescription(
					`${config.emojis.error} ${language.MEpermModerateMembers}`,
				)
				.setColor(config.embedColor);

			return interaction.reply({
				embeds: [embed1],
				ephemeral: true,
			});
		}

		if (!member.moderatable) {
			const embed5 = new Discord.EmbedBuilder()
				.setDescription(`${config.emojis.error} ${language.timeout5}`)
				.setColor(config.embedColor);

			return interaction.reply({
				embeds: [embed5],
				ephemeral: true,
			});
		}

		const timeInMs = ms(tempo);

		const error = new Discord.EmbedBuilder()
			.setDescription(`${config.emojis.error} ${language.timeout6}`)
			.setColor(config.embedColor);

		const errorTime = new Discord.EmbedBuilder()
			.setDescription(`${config.emojis.error} ${language.timeout7}`)
			.setColor(config.embedColor);

		if (!timeInMs) {
			return interaction.reply({
				embeds: [error],
				ephemeral: true,
			});
		}

		if (timeInMs > 2419200000) {
			return interaction.reply({
				embeds: [errorTime],
				ephemeral: true,
			});
		}

		if (!member) {
			const embed3 = new Discord.EmbedBuilder()
				.setDescription(`${config.emojis.error} ${language.timeout2}`)
				.setColor(config.embedColor);

			return interaction.reply({
				embeds: [embed3],
				ephemeral: true,
			});
		}

		if (member.isCommunicationDisabled()) {
			const eMbed1 = new Discord.EmbedBuilder()
				.setDescription(`${config.emojis.error} ${language.timeout3}`)
				.setColor(config.embedColor);

			return interaction.reply({
				embeds: [eMbed1],
				ephemeral: true,
			});
		}

		if (
			interaction.member.roles.highest.position < member.roles.highest.position
		) {
			const embed4 = new Discord.EmbedBuilder()
				.setDescription(`${config.emojis.error} ${language.timeout4}`)
				.setColor(config.embedColor);

			return interaction.reply({
				embeds: [embed4],
				ephemeral: true,
			});
		}

		const embed = new Discord.EmbedBuilder()
			.setColor(config.embedColor)
			.setDescription(
				`${config.emojis.robotCop} **${user}** ${
					motivo
						? `${language.timeout8} \`${motivo}\``
						: `${language.timeout8NoReason}`
				}\n${language.timeout9} <t:${Math.round(
					(Date.now() + timeInMs) / 1000,
				)}:R>`,
			)
			.setTimestamp();

		const embedDM = new Discord.EmbedBuilder()
			.setTitle(`${config.emojis.robotCop} ${language.timeout10}`)
			.setDescription(`> ${language.timeout11}`)
			.setColor(config.embedColor)
			.setTimestamp()
			.addFields(
				{
					name: `${language.timeout14} `,
					value: `> Name: \`${interaction.guild.name}\`\n> ID: \`${interaction.guild.id}\``,
				},
				{
					name: `${language.action}`,
					value: `> ${language.action1} \`Timeout\` ${
						motivo ? `\n> ${language.banField5}: \`${motivo}\`` : ''
					}\n> ${language.timeout16} <t:${Math.round(
						(Date.now() + timeInMs) / 1000,
					)}:R>`,
				},
			)
			.setFooter({
				text: `${language.messageContentResponsability}`,
			});

		member.timeout(timeInMs, motivo ?? null);

		member.send({
			embeds: [embedDM],
		}).catch(() => {});

		interaction.reply({
			embeds: [embed],
		});
	},
};
