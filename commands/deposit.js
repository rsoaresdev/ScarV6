const { SlashCommandBuilder } = require('discord.js');
const db = require('discord-mongo-currency.better');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('deposit')
		.setDescription('Deposit money in the bank')
		.addSubcommand((subcommand) => subcommand
			.setName('specific')
			.setDescription('Deposits a specific amount')
			.addIntegerOption((option) => option
				.setName('amount')
				.setDescription('Choose the amount to deposit')
				.setRequired(true)
				.setMinValue(1)))
		.addSubcommand((subcommand) => subcommand
			.setName('all')
			.setDescription('Deposit all the money in the bank'))
		.setDMPermission(false),

	async execute(interaction, Discord, config, language) {
		const integer = interaction.options.getInteger('amount');
		const user1 = await db.findUser(interaction.user.id, interaction.guild.id);

		if (!user1.coinsInWallet || user1.coinsInWallet === 0) {
			const embed1 = new Discord.EmbedBuilder()
				.setColor(config.embedColor)
				.setDescription(`${config.emojis.error} ${language.noMoney}`);

			return interaction.reply({
				embeds: [embed1],
				ephemeral: true,
			});
		}

		if (interaction.options.getSubcommand() === 'all') {
			db.deposit(
				interaction.user.id,
				interaction.guild.id,
				user1.coinsInWallet,
			);

			const embed4 = new Discord.EmbedBuilder()
				.setColor(config.embedColor)
				.setDescription(
					`${config.emojis.correct} ${language.deposit
						.replace(/{money}/g, user1.coinsInWallet)
						.replace(/{emoji}/g, config.emojis.scarcoin)}`,
				);

			return interaction.reply({
				embeds: [embed4],
			});
		}

		if (interaction.options.getSubcommand() === 'specific') {
			if (user1.coinsInWallet < integer) {
				const embed3 = new Discord.EmbedBuilder()
					.setColor(config.embedColor)
					.setDescription(`${config.emojis.error} ${language.notEnoughMoney}`);
				return interaction.reply({
					embeds: [embed3],
					ephemeral: true,
				});
			}

			db.deposit(interaction.user.id, interaction.guild.id, integer);

			const embed5 = new Discord.EmbedBuilder()
				.setColor(config.embedColor)
				.setDescription(
					`${config.emojis.correct} ${language.deposit
						.replace(/{money}/g, integer)
						.replace(/{emoji}/g, config.emojis.scarcoin)}`,
				);

			return interaction.reply({
				embeds: [embed5],
			});
		}
	},
};
