const { SlashCommandBuilder } = require('discord.js');
const db = require('discord-mongo-currency.better');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('withdraw')
		.setDescription('Withdraw money from the bank')
		.addSubcommand((subcommand) => subcommand
			.setName('specific')
			.setDescription('Choose the amount to withdraw')
			.addIntegerOption((option) => option
				.setName('amount')
				.setDescription('Select the amount')
				.setRequired(true)
				.setMinValue(1)))
		.addSubcommand((subcommand) => subcommand
			.setName('all')
			.setDescription('Get all the money out of the bank'))
		.setDMPermission(false),

	async execute(interaction, Discord, config, language) {
		const integer = interaction.options.getInteger('amount');
		const user1 = (await db.findUser(interaction.user.id, interaction.guild.id)) || 0;

		if (interaction.options.getSubcommand() === 'all') {
			if (!user1.coinsInBank || user1.coinsInBank === 0) {
				const Embed1 = new Discord.EmbedBuilder()
					.setColor(config.embedColor)
					.setDescription(`${config.emojis.error} ${language.with1}`);

				return interaction.reply({
					embeds: [Embed1],
					ephemeral: true,
				});
			}

			await db.withdraw(
				interaction.user.id,
				interaction.guild.id,
				user1.coinsInBank,
			);

			const embed4 = new Discord.EmbedBuilder()
				.setColor(config.embedColor)
				.setDescription(`${config.emojis.correct} ${language.with2}`);

			return interaction.reply({
				embeds: [embed4],
			});
		}

		if (interaction.options.getSubcommand() === 'specific') {
			if (!user1.coinsInBank || user1.coinsInBank === 0) {
				const embed1 = new Discord.EmbedBuilder()
					.setColor(config.embedColor)
					.setDescription(`${config.emojis.error} ${language.with3}`);

				return interaction.reply({
					embeds: [embed1],
					ephemeral: true,
				});
			}

			if (user1.coinsInBank < integer) {
				const embed3 = new Discord.EmbedBuilder()
					.setColor(config.embedColor)
					.setDescription(`${config.emojis.error} ${language.with5}`);

				return interaction.reply({
					embeds: [embed3],
					ephemeral: true,
				});
			}

			await db.withdraw(interaction.user.id, interaction.guild.id, integer);

			const embed5 = new Discord.EmbedBuilder()
				.setColor(config.embedColor)
				.setDescription(
					`${config.emojis.correct} ${language.with8} ${integer}${config.emojis.scarcoin} ${language.with9}`,
				);

			return interaction.reply({
				embeds: [embed5],
			});
		}
	},
};
