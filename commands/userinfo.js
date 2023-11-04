const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('userinfo')
		.setDescription('View information about a particular member')
		.addUserOption((option) => option
			.setName('user')
			.setDescription('Indicate the user to search')
			.setRequired(true))
		.setDMPermission(false),

	async execute(interaction, Discord, config, language) {
		try {
			const userGet = interaction.options.getUser('user');
			const member1 = await interaction.guild.members.fetch(userGet);

			const Response = new Discord.EmbedBuilder()
				.setTitle(`🔎 ${language.user1}`)
				.setThumbnail(
					userGet.displayAvatarURL({
						dynamic: true,
						extension: 'png',
						size: 4096,
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
			});
		}
		catch (err) {
			return interaction.reply({
				embeds: [
					new Discord.EmbedBuilder()
						.setColor(config.embedColor)
						.setDescription(`${language.user6}`),
				],
				ephemeral: true,
			});
		}
	},
};
