const { SlashCommandBuilder } = require('discord.js');
const db = require('discord-mongo-currency.better');
const Levels = require('discord-xp');
const Schema = require('../models/work');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('work')
		.setDescription('Works and receives money')
		.setDMPermission(false),

	async execute(interaction, Discord, config, language) {
		const timeout = 60000;
		const response = language.work[Math.floor(Math.random() * language.work.length)];
		const amount = Math.floor(Math.random() * (100 - 10) + 10);

		try {
			const data = await Schema.findOne({
				id: interaction.user.id,
			});

			if (!data) {
				if (
					interaction.guild.id === '676031545798295553'
            || interaction.guild.id === '915533220488036363'
				) {
					const boost = amount * 1.5;

					const newD = new Schema({
						time: Date.now(),
						id: interaction.user.id,
					});
					await newD.save().catch(console.log);

					db.giveCoins(interaction.user.id, interaction.guild.id, boost);
					Levels.appendXp(interaction.user.id, interaction.guild.id, 20);

					const embedBoost = new Discord.EmbedBuilder()
						.setColor(config.embedColor)
						.setDescription(
							`${config.emojis.correct} ${language.work2} \`${response}\` ${language.work3} \`${boost}\`${config.emojis.scarcoin} + \`20XP\``,
						)
						.setFooter({
							text: `${language.work4} +${boost - amount}SC ${
								language.work5
							}`,
						});

					return interaction.reply({
						embeds: [embedBoost],
					});
				}
				const newD = new Schema({
					time: Date.now(),
					id: interaction.user.id,
				});
				newD.save();

				db.giveCoins(interaction.user.id, interaction.guild.id, amount);
				Levels.appendXp(interaction.user.id, interaction.guild.id, 10);

				const embed1 = new Discord.EmbedBuilder()
					.setColor(config.embedColor)
					.setDescription(
						`${config.emojis.correct} ${language.work2} \`${response}\` ${language.work3} \`${amount}\`${config.emojis.scarcoin} + \`10XP\``,
					);

				return interaction.reply({
					embeds: [embed1],
				});
			} if (timeout - (Date.now() - data.time) > 0) {
				const timeEmbed = new Discord.EmbedBuilder()
					.setColor(config.embedColor)
					.setDescription(
						`${config.emojis.error} ${language.work6} <t:${Math.round(
							data.time / 1000 + 60,
						)}:R>`,
					);
				return interaction.reply({
					embeds: [timeEmbed],
					ephemeral: true,
				});
			} if (interaction.guild.id === '676031545798295553' || interaction.guild.id === '915533220488036363') {
				const boost = amount * 1.5;

				data.time = Date.now();
				await data.save().catch(console.log);

				db.giveCoins(interaction.user.id, interaction.guild.id, boost);
				Levels.appendXp(interaction.user.id, interaction.guild.id, 20);

				const embedBoost = new Discord.EmbedBuilder()
					.setColor(config.embedColor)
					.setDescription(
						`${config.emojis.correct} ${language.work2} \`${response}\` ${language.work3} \`${boost}\`${config.emojis.scarcoin} + \`20XP\``,
					)
					.setFooter({
						text: `${language.work4} +${boost - amount}SC ${language.work5}`,
					});

				return interaction.reply({
					embeds: [embedBoost],
				});
			}

			db.giveCoins(interaction.user.id, interaction.guild.id, amount);
			Levels.appendXp(interaction.user.id, interaction.guild.id, 10);
			data.time = Date.now();
			await data.save().catch(console.log);

			const embed1 = new Discord.EmbedBuilder()
				.setColor(config.embedColor)
				.setDescription(
					`${config.emojis.correct} ${language.work2} \`${response}\` ${language.work3} \`${amount}\`${config.emojis.scarcoin} + \`10XP\``,
				);

			return interaction.reply({
				embeds: [embed1],
			});
		}
		catch (err) {
			console.log(err);
		}
	},
};
