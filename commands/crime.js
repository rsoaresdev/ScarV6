const { SlashCommandBuilder } = require('discord.js');
const db = require('discord-mongo-currency.better');
const Schema = require('../models/crime');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('crime')
		.setDescription('Commits a crime')
		.setDMPermission(false),

	async execute(interaction, Discord, config, language) {
		const timeout = 1800000;
		const user1 = await db.findUser(interaction.user.id, interaction.guild.id);
		const response = language.crimeLocales[Math.floor(
			Math.random() * language.crimeLocales.length,
		)];
		const rand = Math.floor(Math.random() * 3) + 1;
		const amount = Math.floor(Math.random() * (500 - 150) + 150);
		const randomPercent = Math.floor(Math.random() * (100 - 40) + 40);
		const coinsToDeduct = Math.floor(
			(randomPercent / 100) * user1.coinsInWallet,
		);

		const sucess = new Discord.EmbedBuilder()
			.setColor(config.embedColor)
			.setTitle(`${language.crimeSucess}`)
			.setDescription(
				`${config.emojis.correct} ${language.crime1} \`${response}\` ${language.crime2} \`${amount}\`${config.emojis.scarcoin}`,
			);

		const fail = new Discord.EmbedBuilder()
			.setColor(config.embedColor)
			.setTitle(`${language.crimeError}`)
			.setDescription(
				`${config.emojis.error} ${language.crime3} \`${response}\`, ${language.crime4} \`${coinsToDeduct}\`${config.emojis.scarcoin}`,
			);

		if (user1.coinsInWallet < 1000) {
			const row = new Discord.ActionRowBuilder().addComponents(
				new Discord.ButtonBuilder()
					.setLabel(`${language.levantar1000}`)
					.setCustomId('levantar')
					.setStyle(Discord.ButtonStyle.Primary),
			);

			const embed1 = new Discord.EmbedBuilder()
				.setDescription(
					`${language.crime5}${config.emojis.scarcoin} ${language.crime6}`,
				)
				.setColor(config.embedColor);

			const msg = await interaction.reply({
				embeds: [embed1],
				ephemeral: true,
				components: [row],
				fetchReply: true,
			});

			const filter = (i) => i.isButton() && i.user.id === interaction.user.id;

			const coletor = msg.createMessageComponentCollector({
				filter,
				time: 60000,
			});

			coletor.on('collect', async (collected) => {
				const menu = collected.customId;
				await collected.deferUpdate();

				if (menu === 'levantar') {
					if (user1.coinsInBank < 1000) {
						const semDinheiro1000 = new Discord.EmbedBuilder()
							.setDescription(
								`${language.crime7}${
									config.emojis.scarcoin
								} ${language.crime8.replace(/{vote}/g, `${config.links.vote}`)}`,
							)
							.setColor(config.embedColor);

						return interaction.followUp({
							embeds: [semDinheiro1000],
							ephemeral: true,
						});
					}

					db.withdraw(interaction.user.id, interaction.guild.id, 1000);

					const embedLevantar = new Discord.EmbedBuilder()
						.setColor(config.embedColor)
						.setDescription(
							`${config.emojis.correct} ${language.crime9}${config.emojis.scarcoin} ${language.crime10}`,
						);

					return interaction.followUp({
						embeds: [embedLevantar],
						ephemeral: true,
					});
				}
				return null;
			});
		}

		try {
			const data = await Schema.findOne({
				id: interaction.user.id,
			});

			if (!data) {
				const newD = new Schema({
					time: Date.now(),
					id: interaction.user.id,
				});
				await newD.save().catch(console.log);

				db.giveCoins(interaction.user.id, interaction.guild.id, amount);

				return interaction.reply({
					embeds: [sucess],
				});
			}
			if (timeout - (Date.now() - data.time) > 0) {
				const timeEmbed = new Discord.EmbedBuilder()
					.setColor(config.embedColor)
					.setDescription(
						`${config.emojis.error} ${language.crime11} <t:${Math.round(
							data.time / 1000 + 1800,
						)}:R>`,
					);

				return interaction.reply({
					embeds: [timeEmbed],
					ephemeral: true,
				});
			}
			if (rand === 3) {
				data.time = Date.now();
				await data.save().catch(console.log);

				db.deductCoins(
					interaction.user.id,
					interaction.guild.id,
					coinsToDeduct,
				);

				return interaction.reply({
					embeds: [fail],
				});
			}

			data.time = Date.now();
			await data.save();

			db.giveCoins(interaction.user.id, interaction.guild.id, amount);

			return interaction.reply({
				embeds: [sucess],
			});
		}
		catch (err) {
			console.log(err);
		}
	},
};
