const { SlashCommandBuilder, ChannelType, PermissionsBitField } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('announcement')
		.setDescription('Broadcasts an announcement, on a specific channel')
		.addChannelOption((option) => option
			.setName('channel')
			.setDescription('Select a channel')
			.setRequired(true)
			.addChannelTypes(ChannelType.GuildText, ChannelType.GuildAnnouncement))
		.addStringOption((option) => option
			.setName('text')
			.setDescription(
				'What should I announce? To make a paragraph, type <br> (max: 15 lines)',
			)
			.setMaxLength(1024)
			.setRequired(true))
		.setDMPermission(false)
		.setDefaultMemberPermissions(PermissionsBitField.Flags.ManageMessages),

	async execute(interaction, Discord, config, language) {
		const texto = interaction.options.getString('text');
		const channel = interaction.options.getChannel('channel');

		const textoWithBR = texto.replace(/<br>/g, '\n');

		// Max 15 rows
		if (textoWithBR.split(/\r\n|\r|\n/).length > 15) {
			const noMoreThan15Rows = new Discord.EmbedBuilder()
				.setColor(config.embedColor)
				.setDescription(`${config.emojis.error} ${language.noMoreThan15Rows}`);

			return interaction.reply({
				embeds: [noMoreThan15Rows],
				ephemeral: true,
			});
		}
		const embed = new Discord.EmbedBuilder()
			.setDescription(texto.replace(/<br>/g, '\n'))
			.setColor(config.embedColor)
			.setFooter({
				text: `${language.announcementBy} ${interaction.member.displayName}`,
			})
			.setTimestamp();

		channel.send({
			embeds: [embed],
		});

		const embedFinal = new Discord.EmbedBuilder()
			.setColor(config.embedColor)
			.setDescription(
				`${config.emojis.correct} ${language.announcementSend}\n${config.emojis.tag} ${language.emojisWillNotBeShown}`,
			);

		return interaction.reply({
			embeds: [embedFinal],
			ephemeral: true,
		});
	},
};
