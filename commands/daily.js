const { SlashCommandBuilder } = require('discord.js');
const db = require('discord-mongo-currency.better');
const Schema = require('../models/daily');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('daily')
		.setDescription('Receive the daily wage')
		.setDMPermission(false),

	async execute(interaction, Discord, config, language) {
		const timeout = 86400000;

		try {
			const data = await Schema.findOne({
				id: interaction.user.id,
			});

			if (!data) {
				const newD = new Schema({
					id: interaction.user.id,
					daily: Date.now(),
				});
				await newD.save().catch(console.log);

				db.giveCoins(interaction.user.id, interaction.guild.id, 500);

				const moneyEmbed = new Discord.EmbedBuilder()
					.setColor(config.embedColor)
					.setDescription(
						`${config.emojis.correct} ${language.daily1} \`500\`${config.emojis.scarcoin}`,
					);

				return interaction.reply({
					embeds: [moneyEmbed],
				});
			}
			if (timeout - (Date.now() - data.daily) > 0) {
				const timeEmbed = new Discord.EmbedBuilder()
					.setColor(config.embedColor)
					.setDescription(
						`${config.emojis.error} ${language.daily2} <t:${Math.round(
							data.daily / 1000 + 86400,
						)}:R>`,
					);

				return interaction.reply({
					embeds: [timeEmbed],
					ephemeral: true,
				});
			}

			db.giveCoins(interaction.user.id, interaction.guild.id, 500);
			data.daily = Date.now();
			await data.save().catch(console.log);

			const moneyEmbed = new Discord.EmbedBuilder()
				.setColor(config.embedColor)
				.setDescription(
					`${config.emojis.correct} ${language.daily1} \`500\`${config.emojis.scarcoin}`,
				);

			return interaction.reply({
				embeds: [moneyEmbed],
			});
		}
		catch (err) {
			console.log(err);
		}
	},
};
