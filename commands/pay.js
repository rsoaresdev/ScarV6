const { SlashCommandBuilder } = require('discord.js');
const db = require('discord-mongo-currency.better');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('pay')
		.setDescription('Pays a certain amount to a member')
		.addUserOption((option) => option.setName('user').setDescription('Select a member').setRequired(true))
		.addIntegerOption((option) => option
			.setName('amount')
			.setDescription('Select an amount')
			.setRequired(true)
			.setMinValue(50))
		.setDMPermission(false),

	async execute(interaction, Discord, config, language) {
		const utilizador = interaction.options.getUser('user');
		const quantia = interaction.options.getInteger('amount');
		const user2 = await db.findUser(interaction.user.id, interaction.guild.id);

		if (utilizador.bot) {
			const errorBot = new Discord.EmbedBuilder()
				.setColor(config.embedColor)
				.setDescription(`${config.emojis.error} ${language.botsMoney}`);

			return interaction.reply({
				embeds: [errorBot],
				ephemeral: true,
			});
		}

		if (utilizador === interaction.user) {
			const embed4 = new Discord.EmbedBuilder()
				.setColor(config.embedColor)
				.setDescription(`${config.emojis.error} ${language.selfPay}`);

			return interaction.reply({
				embeds: [embed4],
				ephemeral: true,
			});
		}

		if (!user2.coinsInWallet || user2.coinsInWallet === 0) {
			const embed1 = new Discord.EmbedBuilder()
				.setColor(config.embedColor)
				.setDescription(`${config.emojis.error} ${language.payNoMoney}`);

			return interaction.reply({
				embeds: [embed1],
				ephemeral: true,
			});
		}

		if (user2.coinsInWallet < quantia) {
			const embed3 = new Discord.EmbedBuilder()
				.setColor(config.embedColor)
				.setDescription(`${config.emojis.error} ${language.noMoneytoPay}`);

			return interaction.reply({
				embeds: [embed3],
				ephemeral: true,
			});
		}

		await db.giveCoins(utilizador.id, interaction.guild.id, quantia);
		await db.deductCoins(interaction.user.id, interaction.guild.id, quantia);

		const embed5 = new Discord.EmbedBuilder()
			.setColor(config.embedColor)
			.setDescription(
				`${config.emojis.correct} ${language.pay1} ${quantia}${config.emojis.scarcoin} ${language.pay2} ${utilizador}`,
			);

		interaction.reply({
			embeds: [embed5],
		});
	},
};
