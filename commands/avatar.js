const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('avatar')
		.setDescription('Show a user\'s avatar!')
		.addUserOption((option) => option.setName('user').setDescription('Select a user'))
		.setDMPermission(false),

	async execute(interaction, Discord, config, language) {
		const user = interaction.options.getUser('user') || interaction.user;

		const userAvatar = user.displayAvatarURL({
			dynamic: true,
			extension: 'png',
			size: 4096,
		});

		const row = new Discord.ActionRowBuilder().addComponents(
			new Discord.ButtonBuilder()
				.setLabel(`🖼️ ${language.emojiLink}`)
				.setURL(userAvatar)
				.setStyle(Discord.ButtonStyle.Link),
		);

		const embed = new Discord.EmbedBuilder()
			.setColor(config.embedColor)
			.setAuthor({
				name: `${user.displayName} Avatar`,
				iconURL: userAvatar,
			})
			.setImage(userAvatar);

		return interaction.reply({
			embeds: [embed],
			components: [row],
		});
	},
};
