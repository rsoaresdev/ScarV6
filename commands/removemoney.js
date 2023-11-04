const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');
const db = require('discord-mongo-currency.better');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('removemoney')
		.setDescription('Removes money from a specific user')
		.setDefaultMemberPermissions(PermissionsBitField.Flags.Administrator)
		.addSubcommand((subcommand) => subcommand
			.setName('wallet')
			.setDescription('Removes money from the member\'s wallet')
			.addUserOption((option) => option
				.setName('user')
				.setDescription('Select a user')
				.setRequired(true))
			.addIntegerOption((option) => option
				.setName('amount')
				.setDescription('Enter an amount')
				.setRequired(true)
				.setMinValue(1)
				.setMaxValue(1000000)))
		.addSubcommand((subcommand) => subcommand
			.setName('bank')
			.setDescription('Removes money from the member\'s bank')
			.addUserOption((option) => option
				.setName('user')
				.setDescription('Select a user')
				.setRequired(true))
			.addIntegerOption((option) => option
				.setName('amount')
				.setDescription('Enter an amount')
				.setRequired(true)
				.setMinValue(1)
				.setMaxValue(1000000)))
		.setDMPermission(false),

	async execute(interaction, Discord, config, language) {
		const quantia = interaction.options.getInteger('amount');
		const user = interaction.options.getUser('user');

		if (user.bot) {
			const errorBot = new Discord.EmbedBuilder()
				.setColor(config.embedColor)
				.setDescription(
					`${config.emojis.error} ${language.botsNotAccountBank}`,
				);

			return interaction.reply({
				embeds: [errorBot],
				ephemeral: true,
			});
		}

		if (interaction.options.getSubcommand() === 'wallet') {
			if (user.coinsInWallet < quantia) {
				const embed1 = new Discord.EmbedBuilder()
					.setColor(config.embedColor)
					.setDescription(
						`${config.emojis.error} ${language.removeNotEnoughMoney}`,
					);

				return interaction.reply({
					embeds: [embed1],
					ephemeral: true,
				});
			}

			db.deductCoins(user.id, interaction.guild.id, quantia);

			const embed2 = new Discord.EmbedBuilder()
				.setTitle(`${config.emojis.money} ${language.moneyRemoved}`)
				.setColor(config.embedColor)
				.setDescription(
					`${language.removed} **${quantia}**${config.emojis.scarcoin} ${language.rm1} ${user} ${language.rm2}`,
				);

			interaction.reply({
				embeds: [embed2],
			});
		}

		if (interaction.options.getSubcommand() === 'bank') {
			if (user.coinsInBank < quantia) {
				const embed3 = new Discord.EmbedBuilder()
					.setColor(config.embedColor)
					.setDescription(
						`${config.emojis.error} ${language.removeNotEnoughMoney}`,
					);

				return interaction.reply({
					embeds: [embed3],
					ephemeral: true,
				});
			}

			await db.deductCoinsBank(user.id, interaction.guild.id, quantia);

			const embed4 = new Discord.EmbedBuilder()
				.setTitle(`${config.emojis.money} ${language.moneyRemoved}`)
				.setColor(config.embedColor)
				.setDescription(
					`${language.removed} **${quantia}**${config.emojis.scarcoin} ${language.rm1} ${user} ${language.rm3}`,
				);

			interaction.reply({
				embeds: [embed4],
			});
		}
	},
};
