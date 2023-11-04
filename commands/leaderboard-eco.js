const { SlashCommandBuilder } = require('discord.js');
const db = require('discord-mongo-currency.better');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('leaderboard-eco')
		.setDescription('Server earnings raking table')
		.addStringOption((option) => option
			.setName('option')
			.setDescription('Select a leaderboard type')
			.setRequired(true)
			.addChoices(
				{ name: 'Wallet', value: 'wallet' },
				{ name: 'Bank', value: 'bank' },
			))
		.setDMPermission(false),

	async execute(interaction, Discord, config, language) {
		const option = interaction.options.getString('option');
		await interaction.deferReply();

		if (option === 'wallet') {
			const leaderboard = await db.generateLeaderboardWallet(
				interaction.guild.id,
				10,
			);

			if (leaderboard.length < 1) {
				const embed1 = new Discord.EmbedBuilder()
					.setDescription(`${language.leaderboardEmpty}`)
					.setColor(config.embedColor);

				return interaction.editReply({
					embeds: [embed1],
				});
			}

			const mappedLeaderboard = leaderboard.map(
				(i) => `${
					`<@${i.userId}> • ${i.coinsInWallet} ${config.emojis.scarcoin}`
            ?? `${language.leaderboardEmpty1}`
				}`,
			);

			const embed = new Discord.EmbedBuilder()
				.setThumbnail(config.images.ranking)
				.setTitle(
					`${config.emojis.robotMoney} ${language.ranking} ${interaction.guild.name}`,
				)
				.setDescription(`${mappedLeaderboard.join('\n')}`)
				.setColor(config.embedColor)
				.setFooter({ text: language.onlyWalletCoins });

			interaction.editReply({
				embeds: [embed],
			});
		}

		if (option === 'bank') {
			const leaderboard = await db.generateLeaderboardBank(
				interaction.guild.id,
				10,
			);

			if (leaderboard.length < 1) {
				const embed1 = new Discord.EmbedBuilder()
					.setDescription(`${language.leaderboardEmpty}`)
					.setColor(config.embedColor);

				return interaction.editReply({
					embeds: [embed1],
				});
			}

			const mappedLeaderboard = leaderboard.map(
				(i) => `${
					`<@${i.userId}> • ${i.coinsInBank} ${config.emojis.scarcoin}`
            ?? `${language.leaderboardEmpty1}`
				}`,
			);

			const embed = new Discord.EmbedBuilder()
				.setThumbnail(config.images.ranking)
				.setTitle(
					`${config.emojis.robotMoney} ${language.ranking} ${interaction.guild.name}`,
				)
				.setDescription(`${mappedLeaderboard.join('\n')}`)
				.setColor(config.embedColor)
				.setFooter({ text: language.onlyBankCoins });

			interaction.editReply({
				embeds: [embed],
			});
		}
	},
};
