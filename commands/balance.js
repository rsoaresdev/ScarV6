const { SlashCommandBuilder } = require('discord.js');
const db = require('discord-mongo-currency.better');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('balance')
		.setDescription('Checks out the money of a particular member')
		.addUserOption((option) => option.setName('user').setDescription('Select a user'))
		.setDMPermission(false),

	async execute(interaction, Discord, config, language) {
		const user2 = interaction.options.getUser('user') || interaction.user;
		const user1 = (await db.findUser(user2.id, interaction.guild.id)) || 0;

		if (user2.bot) {
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

		const moneyEmbed = new Discord.EmbedBuilder()
			.setColor(config.embedColor)
			.setAuthor({
				name: `${user2.username} ${language.money}`,
				iconURL: user2.displayAvatarURL(),
			})
			.addFields(
				{
					name: language.moneyTotal,
					value: `${config.emojis.scarcoin} ${
						user1.coinsInBank + user1.coinsInWallet || 0
					}`,
					inline: false,
				},
				{
					name: language.moneyWallet,
					value: `${config.emojis.scarcoin} ${user1.coinsInWallet || 0}`,
					inline: true,
				},
				{
					name: language.moneyBank,
					value: `${config.emojis.scarcoin} ${user1.coinsInBank || 0}`,
					inline: true,
				},
			);

		return interaction.reply({
			embeds: [moneyEmbed],
		});
	},
};
