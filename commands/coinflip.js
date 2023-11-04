const { SlashCommandBuilder } = require('discord.js');
const db = require('discord-mongo-currency.better');

async function delay(ms) {
	return new Promise((resolve) => {
		setTimeout(resolve, ms);
	});
}

module.exports = {
	data: new SlashCommandBuilder()
		.setName('coinflip')
		.setDescription('Coinflip and you can win money!')
		.addStringOption((option) => option
			.setName('option')
			.setDescription('Select a coin side')
			.setRequired(true)
			.addChoices(
				{ name: 'Head', value: 'Head' },
				{ name: 'Tail', value: 'Tail' },
			))
		.addIntegerOption((option) => option
			.setName('amount')
			.setDescription('Choose the amount to bet')
			.setRequired(true)
			.setMinValue(20))
		.setDMPermission(false),

	async execute(interaction, Discord, config, language) {
		await interaction.deferReply();
		const amount = interaction.options.getInteger('amount');
		const user1 = await db.findUser(interaction.user.id, interaction.guild.id);
		const rand = Math.floor(Math.random() * 2);
		const randomPercent = Math.floor(Math.random() * (100 - 40) + 40);
		const coinsAdd = Math.floor(amount * (randomPercent / 100));

		if (!user1.coinsInWallet || user1.coinsInWallet < amount) {
			const embed1 = new Discord.EmbedBuilder()
				.setDescription(language.noMoneytoPay)
				.setColor(config.embedColor);

			return interaction.reply({ embeds: [embed1], ephemeral: true });
		}

		const option = interaction.options.getString('option');

		let win;
		if (rand === 0) {
			win = option;
		}
		else if (option === 'Heads') {
			win = 'Tails';
		}
		else {
			win = 'Heads';
		}

		const coinsChange = rand === 0 ? coinsAdd : -amount;

		const firstEmbed = new Discord.EmbedBuilder()
			.setColor(config.embedColor)
			.setDescription(`${interaction.user.username}, ${language.startedCoinToss}`);

		const secondEmbed = new Discord.EmbedBuilder()
			.setColor(config.embedColor)
			.setDescription(language.coinInTheAir);

		const resultEmbed = new Discord.EmbedBuilder()
			.setTitle(`**${win}**`)
			.setColor(config.embedColor)
			.setDescription(
				`> ${rand === 0 ? language.win : language.lose} \`${coinsChange}\`${
					config.emojis.scarcoin
				}`,
			)
			.setImage(
				win === 'Heads'
					? 'https://i.imgur.com/HavOS7J.png'
					: 'https://i.imgur.com/u1pmQMV.png',
			);

		await interaction.followUp({ embeds: [firstEmbed] });
		await delay(2000);
		interaction.editReply({ embeds: [secondEmbed] }).catch(() => {});
		await delay(2000);
		interaction.editReply({ embeds: [resultEmbed] }).catch(() => {});

		if (rand === 0) {
			db.giveCoins(interaction.user.id, interaction.guild.id, coinsAdd);
		}
		else {
			db.deductCoins(interaction.user.id, interaction.guild.id, amount);
		}
	},
};
