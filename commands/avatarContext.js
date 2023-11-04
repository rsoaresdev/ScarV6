const { ContextMenuCommandBuilder } = require('discord.js');

module.exports = {
	data: new ContextMenuCommandBuilder()
		.setName('View member avatar')
		.setType(2)
		.setDMPermission(false),

	async execute(interaction, Discord, config, language) {
		const member1 = await interaction.guild.members.fetch(interaction.targetId);

		const userAvatar = member1.displayAvatarURL({
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
				name: `${member1.displayName} Avatar`,
				iconURL: userAvatar,
			})
			.setImage(userAvatar);

		return interaction.reply({
			embeds: [embed],
			components: [row],
			ephemeral: true,
		});
	},
};
