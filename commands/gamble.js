const { SlashCommandBuilder } = require('discord.js');
const db = require('discord-mongo-currency.better');

function getEmoji() {
	const ran = Math.floor(Math.random() * 9);
	switch (ran) {
	case 1:
		return '\uD83C\uDF52';
	case 2:
		return '\uD83C\uDF4C';
	case 3:
		return '\uD83C\uDF51';
	case 4:
		return '\uD83C\uDF45';
	case 5:
		return '\uD83C\uDF49';
	case 6:
		return '\uD83C\uDF47';
	case 7:
		return '\uD83C\uDF53';
	case 8:
		return '\uD83C\uDF50';
	case 9:
		return '\uD83C\uDF4D';
	default:
		return '\uD83C\uDF52';
	}
}

function calculateReward(amount, var1, var2, var3) {
	if (var1 === var2 && var2 === var3) return 3 * amount;
	if (var1 === var2 || var2 === var3 || var1 === var3) return 2 * amount;
	return 0;
}

module.exports = {
	data: new SlashCommandBuilder()
		.setName('gamble')
		.setDescription('Try your luck by gambling!')
		.addIntegerOption((option) => option
			.setName('amount')
			.setDescription('Choose the amount to bet')
			.setRequired(true)
			.setMinValue(20))
		.setDMPermission(false),

	async execute(interaction, Discord, config, language) {
		const betAmount = interaction.options.getInteger('amount');

		const user1 = await db.findUser(interaction.user.id, interaction.guild.id);
		if (!user1.coinsInWallet || user1.coinsInWallet < betAmount) {
			const embed1 = new Discord.EmbedBuilder()
				.setDescription(language.noMoneytoPay)
				.setColor(config.embedColor);

			return interaction.reply({ embeds: [embed1], ephemeral: true });
		}

		const slot1 = getEmoji();
		const slot2 = getEmoji();
		const slot3 = getEmoji();

		const str = `
    **${language.gambleAmount}:** ${betAmount}${config.emojis.scarcoin}
    **${language.multiplier}:** 2x
    ╔══════════╗
    ║ ${getEmoji()} ║ ${getEmoji()} ║ ${getEmoji()}⠀║
    ╠══════════╣
    ║ ${slot1} ║ ${slot2} ║ ${slot3} ⟸
    ╠══════════╣
    ║ ${getEmoji()} ║ ${getEmoji()} ║ ${getEmoji()}⠀║
    ╚══════════╝
    `;

		const reward = calculateReward(betAmount, slot1, slot2, slot3);
		const result = `${reward > 0 ? `${language.work4}: ${reward}` : `${language.rob17}: ${betAmount}`} scarcoins`;

		if (reward > 0) {
			db.giveCoins(interaction.user.id, interaction.guild.id, reward);
		}
		else {
			db.deductCoins(interaction.user.id, interaction.guild.id, betAmount);
		}

		const embed = new Discord.EmbedBuilder()
			.setAuthor({ name: interaction.user.username, iconURL: interaction.user.displayAvatarURL() })
			.setColor(config.embedColor)
			.setThumbnail('https://i.pinimg.com/originals/9a/f1/4e/9af14e0ae92487516894faa9ea2c35dd.gif')
			.setDescription(str)
			.setFooter({ text: `${result}` });

		await interaction.reply({ embeds: [embed] });
	},
};
