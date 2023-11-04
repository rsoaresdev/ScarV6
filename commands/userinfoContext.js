const { ContextMenuCommandBuilder } = require('discord.js');

module.exports = {
	data: new ContextMenuCommandBuilder()
		.setName('Get userinfo')
		.setType(2)
		.setDMPermission(false),

	async execute(interaction, Discord, config, language) {
		const member1 = await interaction.guild.members.fetch(interaction.targetId);

		const Response = new Discord.EmbedBuilder()
			.setTitle(`🔎 ${language.user1}`)
			.setThumbnail(
				member1.user.displayAvatarURL({
					dynamic: true,
				}),
			)
			.setColor(config.embedColor)
			.addFields(
				{
					name: `👥 ${language.user3}`,
					value: `> - ${member1.user}\n> - ${member1.user.username}\n > - \`${member1.user.id}\``,
					inline: false,
				},
				{
					name: `📆 ${language.user4}`,
					value: `<t:${Math.round(
						member1.user.createdTimestamp / 1000,
					)}:f> (<t:${Math.round(member1.user.createdTimestamp / 1000)}:R>)`,
					inline: true,
				},
				{
					name: `📆 ${language.user5}`,
					value: `<t:${Math.round(
						member1.joinedTimestamp / 1000,
					)}:f> (<t:${Math.round(member1.joinedTimestamp / 1000)}:R>)`,
					inline: true,
				},
			);

		interaction.reply({
			embeds: [Response],
			ephemeral: true,
		});
	},
};
