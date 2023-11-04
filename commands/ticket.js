const { SlashCommandBuilder, PermissionsBitField, ChannelType } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('ticket')
		.setDescription('Selects a channel for the ticket HUD')
		.addChannelOption((option) => option
			.setName('channel')
			.setDescription('Select a channel')
			.addChannelTypes(ChannelType.GuildText, ChannelType.GuildAnnouncement)
			.setRequired(true))
		.addStringOption((option) => option
			.setName('title')
			.setDescription('Enter a title to be displayed in the ticket message')
			.setRequired(true)
			.setMaxLength(50))
		.addStringOption((option) => option
			.setName('description')
			.setDescription(
				'Enter a description to be displayed in the ticket message',
			)
			.setRequired(true)
			.setMaxLength(2000))
		.addStringOption((option) => option
			.setName('buttonname')
			.setDescription('Enter a name to be displayed in the button')
			.setRequired(true)
			.setMaxLength(80))
		.setDMPermission(false)
		.setDefaultMemberPermissions(PermissionsBitField.Flags.Administrator),

	async execute(interaction, Discord, config, language) {
		const channel = interaction.options.getChannel('channel');
		const string = interaction.options.getString('description');
		const title = interaction.options.getString('title');
		const buttonname = interaction.options.getString('buttonname');

		const embed3 = new Discord.EmbedBuilder()
			.setDescription(`${language.ticket4}`)
			.setColor(config.embedColor);

		interaction.reply({
			embeds: [embed3],
			ephemeral: true,
		});

		const row = new Discord.ActionRowBuilder().addComponents(
			new Discord.ButtonBuilder()
				.setCustomId('c')
				.setLabel(buttonname)
				.setStyle(Discord.ButtonStyle.Primary),
		);

		const embed = new Discord.EmbedBuilder()
			.setTitle(title)
			.setDescription(string)
			.setColor(config.embedColor);

		channel.send({
			embeds: [embed],
			components: [row],
		});
	},
};
