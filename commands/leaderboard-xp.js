const { SlashCommandBuilder } = require('discord.js');
const Levels = require('discord-xp');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('leaderboard-xp')
		.setDescription('Server XP raking table')
		.setDMPermission(false),
	async execute(interaction, Discord, config, language) {
		const rawLeaderboard = await Levels.fetchLeaderboard(
			interaction.guild.id,
			10,
		);

		if (rawLeaderboard.length < 1) {
			const embed1 = new Discord.EmbedBuilder()
				.setDescription(`${language.leaderboardEmpty}`)
				.setColor(config.embedColor);

			return interaction.reply({
				embeds: [embed1],
			});
		}

		const leaderboard = await Levels.computeLeaderboard(
			interaction.client,
			rawLeaderboard,
		);

		const lb = leaderboard.map(
			(e) => `<@${e.userID}> • **${language.level}** ${e.level} **${
				language.points
			}** ${e.xp.toLocaleString()}`,
		);

		const embed = new Discord.EmbedBuilder()
			.setThumbnail(config.images.ranking)
			.setTitle(
				`${config.emojis.chat} ${language.ranking} ${interaction.guild.name}`,
			)
			.setDescription(`${lb.join('\n')}`)
			.setColor(config.embedColor);

		interaction.reply({
			embeds: [embed],
		});
	},
};
