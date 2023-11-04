const { SlashCommandBuilder } = require('discord.js');
const db = require('discord-mongo-currency.better');
const Schema = require('../models/rob');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('rob')
		.setDescription('Steals money from a member')
		.addUserOption((option) => option
			.setName('user')
			.setDescription('Select the member you want to rob')
			.setRequired(true))
		.setDMPermission(false),

	async execute(interaction, Discord, config, language) {
		const timeout = 900000;
		const mentionedMember = interaction.options.getUser('user');
		const user = await db.findUser(interaction.user.id, interaction.guild.id);
		const target = await db.findUser(mentionedMember.id, interaction.guild.id);
		const rand = Math.floor(Math.random() * 2) + 1;

		// Não posso roubar bots
		if (mentionedMember.bot) {
			const errorBot = new Discord.EmbedBuilder()
				.setColor(config.embedColor)
				.setDescription(`${config.emojis.error} ${language.robBots}`);

			return interaction.reply({
				embeds: [errorBot],
				ephemeral: true,
			});
		}

		// Roubar a mim mesmo
		if (mentionedMember.id === interaction.user.id) {
			const embed5 = new Discord.EmbedBuilder()
				.setDescription(`${language.rob6}`)
				.setColor(config.embedColor);

			return interaction.reply({
				embeds: [embed5],
				ephemeral: true,
			});
		}

		// Se eu não tiver dinheiro
		if (Number.isNaN(user.coinsInWallet)) {
			const embed1 = new Discord.EmbedBuilder()
				.setDescription(`${language.rob1}`)
				.setColor(config.embedColor);

			return interaction.reply({
				embeds: [embed1],
				ephemeral: true,
			});
		}

		// Se eu não tiver 500€
		if (user.coinsInWallet < 500) {
			const embed2 = new Discord.EmbedBuilder()
				.setDescription(
					`${language.rob2}${config.emojis.scarcoin} ${language.rob3}`,
				)
				.setColor(config.embedColor);

			const row = new Discord.ActionRowBuilder().addComponents(
				new Discord.ButtonBuilder()
					.setLabel(`${language.levatar500}`)
					.setCustomId('levantar')
					.setStyle(Discord.ButtonStyle.Success),
			);

			return interaction
				.reply({
					embeds: [embed2],
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
							if (user.coinsInBank < 500) {
								const semDinheiro500 = new Discord.EmbedBuilder()
									.setDescription(
										`${language.rob7}${
											config.emojis.scarcoin
										} ${language.rob8.replace(
											/{vote}/g,
											`${config.links.vote}`,
										)}`,
									)
									.setColor(config.embedColor);

								return interaction.followUp({
									embeds: [semDinheiro500],
									ephemeral: true,
								});
							}
							db.withdraw(interaction.user.id, interaction.guild.id, 500);

							const embedLevantar = new Discord.EmbedBuilder()
								.setColor(config.embedColor)
								.setDescription(
									`${config.emojis.correct} ${language.rob9}${config.emojis.scarcoin}${language.rob10}`,
								);

							interaction.followUp({
								embeds: [embedLevantar],
								ephemeral: true,
							});
						}
					});
				})
				.catch(console.log);
		}

		// Se a vítima não tiver dinheiro
		if (Number.isNaN(target.coinsInWallet)) {
			const embed3 = new Discord.EmbedBuilder()
				.setDescription(`${language.rob4}`)
				.setColor(config.embedColor);

			return interaction.reply({
				embeds: [embed3],
				ephemeral: true,
			});
		}

		// Se a vítima não tiver dinheiro
		if (!target.coinsInWallet || target.coinsInWallet === 0) {
			const embed4 = new Discord.EmbedBuilder()
				.setDescription(`${language.rob5}`)
				.setColor(config.embedColor);

			return interaction.reply({
				embeds: [embed4],
				ephemeral: true,
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
				await newD.save();

				const targetCoin1 = target.coinsInWallet;
				const randomPercent1 = Math.floor(Math.random() * (90 - 60) + 60);
				const coinsToDeduct1 = Math.floor((randomPercent1 / 120) * targetCoin1);

				db.deductCoins(mentionedMember.id, interaction.guild.id, coinsToDeduct1);
				db.giveCoins(interaction.user.id, interaction.guild.id, coinsToDeduct1);

				const embedSucess = new Discord.EmbedBuilder()
					.setTitle(`${language.rob11}`)
					.setColor(config.embedColor)
					.setDescription(
						`${config.emojis.correct} ${language.rob12} ${mentionedMember}!`,
					)
					.addFields({
						name: `${language.rob13}`,
						value: `\`${coinsToDeduct1}\`${config.emojis.scarcoin}`,
						inline: true,
					});

				return interaction.reply({
					embeds: [embedSucess],
				});
			}
			if (timeout - (Date.now() - data.time) > 0) {
				const embedFail = new Discord.EmbedBuilder()
					.setColor(config.embedColor)
					.setDescription(
						`${config.emojis.error} ${language.rob14} <t:${Math.round(
							data.time / 1000 + 900,
						)}:R>`,
					);

				return interaction.reply({
					embeds: [embedFail],
					ephemeral: true,
				});
			}
			if (rand === 1) {
				const targetCoin = user.coinsInWallet;
				const randomPercent = Math.floor(Math.random() * (80 - 50) + 50);
				const coinsToDeduct = Math.floor((randomPercent / 100) * targetCoin);

				db.deductCoins(interaction.user.id, interaction.guild.id, coinsToDeduct);
				data.time = Date.now();
				await data.save();

				const embedFail = new Discord.EmbedBuilder()
					.setTitle(`${language.rob15}`)
					.setColor(config.embedColor)
					.setDescription(
						`${config.emojis.error} ${language.rob16} ${mentionedMember}!`,
					)
					.addFields({
						name: `${language.rob17}`,
						value: `\`${coinsToDeduct}\`${config.emojis.scarcoin}`,
						inline: true,
					});

				return interaction.reply({
					embeds: [embedFail],
				});
			}

			const targetCoin2 = target.coinsInWallet;
			const randomPercent2 = Math.floor(Math.random() * (90 - 60) + 60);
			const coinsToDeduct2 = Math.floor((randomPercent2 / 100) * targetCoin2);

			db.deductCoins(mentionedMember.id, interaction.guild.id, coinsToDeduct2);
			db.giveCoins(interaction.user.id, interaction.guild.id, coinsToDeduct2);
			data.time = Date.now();
			await data.save();

			const embedSucess1 = new Discord.EmbedBuilder()
				.setTitle(`${language.rob11}`)
				.setColor(config.embedColor)
				.setDescription(
					`${config.emojis.correct} ${language.rob18} ${mentionedMember}!`,
				)
				.addFields({
					name: `${language.rob13}`,
					value: `\`${coinsToDeduct2}\`${config.emojis.scarcoin}`,
					inline: true,
				});

			return interaction.reply({
				embeds: [embedSucess1],
			});
		}
		catch (err) {
			console.log(err);
		}
	},
};
