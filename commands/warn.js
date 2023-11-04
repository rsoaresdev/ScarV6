const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('warn')
		.setDescription('Warn a member')
		.addUserOption((option) => option.setName('user').setDescription('Select a user').setRequired(true))
		.addStringOption((option) => option
			.setName('reason')
			.setDescription('Enter a reason')
			.setRequired(true)
			.setMaxLength(500))
		.setDMPermission(false)
		.setDefaultMemberPermissions(PermissionsBitField.Flags.ManageMessages),

	async execute(interaction, Discord, config, language) {
		const user = interaction.options.getUser('user');
		const motivo = interaction.options.getString('reason');
		const member = interaction.guild.members.cache.get(user.id)
      || (await interaction.guild.members.fetch(user.id));

		if (
			!interaction.guild.members.me.permissions.has(
				Discord.PermissionsBitField.Flags.ManageMessages,
			)
		) {
			const Embed2 = new Discord.EmbedBuilder()
				.setDescription(
					`${config.emojis.error} ${language.MEpermManageMessages}`,
				)
				.setColor(config.embedColor);

			return interaction.reply({
				embeds: [Embed2],
				ephemeral: true,
			});
		}

		const embedDM = new Discord.EmbedBuilder()
			.setTitle(`${config.emojis.robotCop} ${language.warn1}`)
			.addFields(
				{
					name: `${language.warn5} `,
					value: `> Name: \`${interaction.guild.name}\`\n> ID: \`${interaction.guild.id}\``,
				},
				{
					name: `${language.warn7}`,
					value: `\`${motivo}\``,
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

		const embed = new Discord.EmbedBuilder()
			.setDescription(
				`${config.emojis.robotCop} **${user}** ${language.warn} \`${motivo}\``,
			)
			.setColor(config.embedColor)
			.setTimestamp();

		interaction.reply({
			embeds: [embed],
		});
	},
};
