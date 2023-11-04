const { SlashCommandBuilder } = require('discord.js');
const db = require('discord-mongo-currency.better');
const Schema = require('../models/invest');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('invest')
		.setDescription('Invests a certain amount of money')
		.addSubcommand((subcommand) => subcommand
			.setName('start')
			.setDescription('Starts an investment')
			.addIntegerOption((option) => option
				.setName('amount')
				.setDescription('Choose the amount to invest')
				.setRequired(true)
				.setMinValue(500)))
		.addSubcommand((subcommand) => subcommand
			.setName('check')
			.setDescription('Checks the status of an investment'))
		.setDMPermission(false),

	async execute(interaction, Discord, config, language) {
		const row = new Discord.ActionRowBuilder().addComponents(
			new Discord.ButtonBuilder()
				.setLabel(`${language.levantarSC}`)
				.setCustomId('levantar')
				.setStyle(Discord.ButtonStyle.Success),
		);

		const timeout = 3600000;
		const user1 = await db.findUser(interaction.user.id, interaction.guild.id);
		const response = language.investLocales[
			Math.floor(Math.random() * language.investLocales.length)
		];
		const rand = Math.floor(Math.random() * 2) + 1;
		const randomPercent = Math.floor(Math.random() * (100 - 50) + 50);
		const amount = interaction.options.getInteger('amount');

		if (interaction.options.getSubcommand() === 'start') {
			if (!user1.coinsInWallet || user1.coinsInWallet < amount) {
				const embed1 = new Discord.EmbedBuilder()
					.setDescription(`${language.invest3}`)
					.setColor(config.embedColor);

				return interaction
					.reply({
						embeds: [embed1],
						ephemeral: true,
						components: [row],
						fetchReply: true,
					})
					.then((msg) => {
						const filter = (x) => x.isButton() && x.user.id === interaction.user.id;

						const coletor = msg.createMessageComponentCollector({
							filter,
							time: 60000,
						});

						coletor.on('collect', async (collected) => {
							const menu = collected.customId;
							collected.deferUpdate();

							if (menu === 'levantar') {
								if (!user1.coinsInBank || user1.coinsInBank < amount) {
									const semDinheiro = new Discord.EmbedBuilder()
										.setDescription(`${language.invest1}`)
										.setColor(config.embedColor);

									await interaction.followUp({
										embeds: [semDinheiro],
										ephemeral: true,
									});
								}
								db.withdraw(interaction.user.id, interaction.guild.id, amount);

								const embedLevantar = new Discord.EmbedBuilder()
									.setColor(config.embedColor)
									.setDescription(
										`${config.emojis.correct} ${language.investWithdraw
											.replace(/{amount}/g, `${amount}`)
											.replace(/{emoji}/g, `${config.emojis.scarcoin}`)}`,
									);

								await interaction.followUp({
									embeds: [embedLevantar],
									ephemeral: true,
								});
							}
						});
					})
					.catch(console.log);
			}

			try {
				const data = await Schema.findOne({
					id: interaction.user.id,
				});

				if (!data) {
					const sucess = new Discord.EmbedBuilder()
						.setColor(config.embedColor)
						.setDescription(
							`${config.emojis.correct} ${language.invest7
								.replace(/{amount}/g, `\`${amount}\`${config.emojis.scarcoin}`)
								.replace(/{stock}/g, `\`${response}\``)}`,
						);

					const newD = new Schema({
						time: Date.now(),
						id: interaction.user.id,
						amount,
					});
					await newD.save().catch(console.log);

					return interaction.reply({
						embeds: [sucess],
					});
				}
				if (timeout - (Date.now() - data.time) > 0) {
					const timeEmbed = new Discord.EmbedBuilder()
						.setColor(config.embedColor)
						.setDescription(
							`${config.emojis.error} ${language.invest2} <t:${Math.round(
								data.time / 1000 + 3600,
							)}:R>`,
						);
					return interaction.reply({
						embeds: [timeEmbed],
						ephemeral: true,
					});
				}

				const checkEmbed = new Discord.EmbedBuilder()
					.setColor(config.embedColor)
					.setDescription(`${config.emojis.idle} ${language.invest4}`);

				return interaction.reply({
					embeds: [checkEmbed],
					ephemeral: true,
				});
			}
			catch (err) {
				console.log(err);
			}
		}

		if (interaction.options.getSubcommand() === 'check') {
			try {
				const data = await Schema.findOne({
					id: interaction.user.id,
				});

				if (!data) {
					const tryFirstEmbed = new Discord.EmbedBuilder()
						.setColor(config.embedColor)
						.setDescription(`${config.emojis.error} ${language.invest6}`);

					return interaction.reply({
						embeds: [tryFirstEmbed],
						ephemeral: true,
					});
				}
				if (timeout - (Date.now() - data.time) > 0) {
					const timeEmbed = new Discord.EmbedBuilder()
						.setColor(config.embedColor)
						.setDescription(
							`${config.emojis.error} ${language.invest2} <t:${Math.round(
								data.time / 1000 + 3600,
							)}:R>`,
						);
					return interaction.reply({
						embeds: [timeEmbed],
						ephemeral: true,
					});
				}
				if (rand === 1) {
					const deduct = Math.floor((randomPercent / 100) * data.amount);
					const failEmbed = new Discord.EmbedBuilder()
						.setColor(config.embedColor)
						.setDescription(
							`${config.emojis.error} ${language.invest9.replace(
								/{lose}/g,
								`\`${deduct}\``,
							)} ${config.emojis.scarcoin}`,
						);

					if (user1.coinsInWallet >= deduct) {
						db.deductCoins(interaction.user.id, interaction.guild.id, deduct);
					}
					else {
						await db.deductCoinsBank(
							interaction.user.id,
							interaction.guild.id,
							deduct,
						);
					}

					await data.deleteOne();

					return interaction.reply({
						embeds: [failEmbed],
					});
				}

				const add = Math.floor((randomPercent / 100) * data.amount);
				const winEmbed = new Discord.EmbedBuilder()
					.setColor(config.embedColor)
					.setDescription(
						`${language.invest10.replace(/{win}/g, `\`${add}\``)} ${
							config.emojis.scarcoin
						}`,
					);

				db.giveCoins(interaction.user.id, interaction.guild.id, add);
				data.deleteOne();

				return interaction.reply({
					embeds: [winEmbed],
				});
			}
			catch (err) {
				console.log(err);
			}
		}
	},
};
