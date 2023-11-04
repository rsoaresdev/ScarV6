const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');
const db = require('discord-mongo-currency.better');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('addmoney')
		.setDescription('Add money to a specific user')
		.setDefaultMemberPermissions(PermissionsBitField.Flags.Administrator)
		.addSubcommand((subcommand) => subcommand
			.setName('wallet')
			.setDescription('Deposits money in the member\'s wallet')
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
			.setDescription('Deposits money in the member\'s bank')
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
			db.giveCoins(user.id, interaction.guild.id, quantia);

			const textWallet = language.moneyMSGwallet
				.replace(/{scarcoin}/g, `${config.emojis.scarcoin}`)
				.replace(/{amount}/g, `${quantia}`)
				.replace(/{user}/g, `${user}`);

			const moneyEmbed = new Discord.EmbedBuilder()
				.setTitle(`${config.emojis.money} ${language.moneyAdded}`)
				.setColor(config.embedColor)
				.setDescription(textWallet);

			interaction.reply({
				embeds: [moneyEmbed],
			});
		}

		if (interaction.options.getSubcommand() === 'bank') {
			await db.giveCoinsBank(user.id, interaction.guild.id, quantia);

			const textBank = language.moneyMSGbank
				.replace(/{scarcoin}/g, `${config.emojis.scarcoin}`)
				.replace(/{amount}/g, `${quantia}`)
				.replace(/{user}/g, `${user}`);

			const moneyEmbed1 = new Discord.EmbedBuilder()
				.setTitle(`${config.emojis.money} ${language.moneyAdded}`)
				.setColor(config.embedColor)
				.setDescription(textBank);

			interaction.reply({
				embeds: [moneyEmbed1],
			});
		}
	},
};
