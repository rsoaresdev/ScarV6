const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('kick')
		.setDescription('Kicks a member')
		.addUserOption((option) => option.setName('user').setDescription('Enter a user').setRequired(true))
		.addStringOption((option) => option.setName('reason').setDescription('Enter the reason'))
		.setDMPermission(false)
		.setDefaultMemberPermissions(PermissionsBitField.Flags.KickMembers),

	async execute(interaction, Discord, config, language) {
		if (
			!interaction.guild.members.me.permissions.has(
				Discord.PermissionsBitField.Flags.KickMembers,
			)
		) {
			const embed2 = new Discord.EmbedBuilder()
				.setDescription(`${config.emojis.error} ${language.MEpermKickMembers}`)
				.setColor(config.embedColor);

			return interaction.reply({
				embeds: [embed2],
				ephemeral: true,
			});
		}

		const user = interaction.options.getUser('user');
		const reason = interaction.options.getString('reason');
		const member = interaction.guild.members.resolve(user.id);

		if (!member) {
			const embed4 = new Discord.EmbedBuilder()
				.setDescription(`${config.emojis.error} ${language.kickDetailsMember}`)
				.setColor(config.embedColor);

			return interaction.reply({
				embeds: [embed4],
				ephemeral: true,
			});
		}

		if (!member.kickable || !member.manageable) {
			const embed5 = new Discord.EmbedBuilder()
				.setDescription(`${config.emojis.error} ${language.unableKickMember}`)
				.setColor(config.embedColor);
			return interaction.reply({
				embeds: [embed5],
				ephemeral: true,
			});
		}

		const embedDM = new Discord.EmbedBuilder()
			.setTitle(`${config.emojis.robotCop} ${language.kickTitle}`)
			.setDescription(`> ${language.kickDescription}`)
			.addFields(
				{
					name: `${language.kickField3} `,
					value: `> Name: \`${interaction.guild.name}\`\n> ID: \`${interaction.guild.id}\``,
				},
				{
					name: `${language.action}`,
					value: `> ${language.action1} \`Kick\` ${
						reason ? `\n> ${language.banField5}: \`${reason}\`` : ''
					}`,
				},
			)
			.setColor(config.embedColor)
			.setTimestamp()
			.setFooter({
				text: `${language.messageContentResponsability}`,
			});

		member.send({
			embeds: [embedDM],
		}).catch(() => {});

		member.kick({ reason });

		const embed = new Discord.EmbedBuilder()
			.setColor(config.embedColor)
			.setDescription(
				`${config.emojis.robotCop} **${member.user.username}** ${
					reason
						? `${language.kickSucess} \`${reason}\``
						: `${language.kickSucessNoReason}`
				}`,
			)
			.setTimestamp();

		return interaction.reply({
			embeds: [embed],
		});
	},
};
