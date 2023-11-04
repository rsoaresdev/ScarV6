const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('ban')
		.setDescription('Ban a member')
		.addUserOption((option) => option
			.setName('user')
			.setDescription('Select the person you want to ban')
			.setRequired(true))
		.addStringOption((option) => option.setName('reason').setDescription('Specify the reason'))
		.setDMPermission(false)
		.setDefaultMemberPermissions(PermissionsBitField.Flags.BanMembers),

	async execute(interaction, Discord, config, language) {
		if (
			!interaction.guild.members.me.permissions.has(
				Discord.PermissionsBitField.Flags.BanMembers,
			)
		) {
			const embed1 = new Discord.EmbedBuilder()
				.setDescription(`${config.emojis.error} ${language.MEpermBanMembers}`)
				.setColor(config.embedColor);

			return interaction.reply({
				embeds: [embed1],
				ephemeral: true,
			});
		}

		const user = interaction.options.getUser('user');
		const reason = interaction.options.getString('reason');
		const member = interaction.guild.members.resolve(user.id);

		if (!member) {
			const embed2 = new Discord.EmbedBuilder()
				.setDescription(`${config.emojis.error} ${language.detailsMember}`)
				.setColor(config.embedColor);

			return interaction.reply({
				embeds: [embed2],
				ephemeral: true,
			});
		}

		if (!member.bannable || !member.manageable) {
			const embed3 = new Discord.EmbedBuilder()
				.setDescription(`${config.emojis.error} ${language.unableBanMember}`)
				.setColor(config.embedColor);
			return interaction.reply({
				embeds: [embed3],
				ephemeral: true,
			});
		}

		const embedDM = new Discord.EmbedBuilder()
			.setTitle(`${config.emojis.robotCop} ${language.banTitle}`)
			.setDescription(`${language.banDescription}`)
			.addFields(
				{
					name: `${language.banField3} `,
					value: `> Name: \`${interaction.guild.name}\`\n> ID: \`${interaction.guild.id}\``,
				},
				{
					name: `${language.action}`,
					value: `> ${language.action1} \`Ban\` ${
						reason ? `\n> ${language.banField5}: \`${reason}\`` : ''
					}`,
				},
			)
			.setColor(config.embedColor)
			.setTimestamp()
			.setFooter({
				text: language.messageContentResponsability,
			});

		member.send({
			embeds: [embedDM],
		}).catch(() => {});

		member.ban({ reason });

		const embed4 = new Discord.EmbedBuilder()
			.setColor(config.embedColor)
			.setDescription(
				`${config.emojis.robotCop} **${member.user.username}** ${
					reason
						? `${language.banSucessReason} \`${reason}\``
						: `${language.banSucessNoReason}`
				}`,
			)
			.setTimestamp();

		return interaction.reply({
			embeds: [embed4],
		});
	},
};
