/* eslint-disable consistent-return */
/* eslint-disable no-shadow */
const { SlashCommandBuilder } = require('discord.js');
const db = require('discord-mongo-currency.better');
const Inventory = require('../models/shop');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('shop')
		.setDescription('Buy an item in my store!')
		.setDMPermission(false),

	async execute(interaction, Discord, config, language) {
		const userBalance = (await db.findUser(interaction.user.id, interaction.guild.id)) || 0;

		const row = new Discord.ActionRowBuilder().addComponents(
			new Discord.ButtonBuilder()
				.setEmoji('⛏️')
				.setCustomId('tools')
				.setStyle(Discord.ButtonStyle.Secondary),
			new Discord.ButtonBuilder()
				.setEmoji('🦚')
				.setCustomId('rankcard')
				.setStyle(Discord.ButtonStyle.Secondary),
		);

		const embedPrincipal = new Discord.EmbedBuilder()
			.setTitle(`💳 ${language.shop1}`)
			.setColor(config.embedColor)
			.setDescription(`${language.shopCat}`)
			.addFields(
				{
					name: `⛏️ ${language.shop3}`,
					value: `> ${language.shop5}`,
					inline: false,
				},
				{
					name: `🦚 ${language.shop4}`,
					value: `> ${language.shop6}`,
					inline: false,
				},
			);

		interaction
			.reply({
				embeds: [embedPrincipal],
				components: [row],
				fetchReply: true,
			})
			.then((msg) => {
				const filter = (interaction) => interaction.isButton();

				const coletor = msg.createMessageComponentCollector({
					filter,
					time: 600000,
				});

				coletor.on('collect', async (collected) => {
					const menu = collected.customId;
					collected.deferUpdate();

					if (menu === 'tools') {
						const row1 = new Discord.ActionRowBuilder().addComponents(
							new Discord.ButtonBuilder()
								.setEmoji('⛏️')
								.setCustomId('pickaxe')
								.setStyle(Discord.ButtonStyle.Secondary),
						);

						const tools = new Discord.EmbedBuilder()
							.setTitle(`${language.shop3}`)
							.setColor(config.embedColor)
							.setDescription(`${language.shop2}`)
							.addFields({
								name: `⛏️ ${language.shop7}`,
								value: `> ${language.shop8}\n> \`3000\`${config.emojis.scarcoin}`,
								inline: true,
							});

						interaction
							.followUp({
								embeds: [tools],
								components: [row1],
								ephemeral: false,
							})
							.then((msg) => {
								const filter = (interaction) => interaction.isButton();

								const coletor = msg.createMessageComponentCollector({
									filter,
									time: 600000,
								});

								coletor.on('collect', async (collected) => {
									const confirmation = collected.customId;
									collected.deferUpdate();

									if (confirmation === 'pickaxe') {
										const confirm = new Discord.EmbedBuilder()
											.setColor(config.embedColor)
											.setDescription(`${language.shop13}`);

										const rowConf = new Discord.ActionRowBuilder().addComponents(
											new Discord.ButtonBuilder()
												.setEmoji('✅')
												.setCustomId('yes')
												.setStyle(Discord.ButtonStyle.Secondary),
											new Discord.ButtonBuilder()
												.setEmoji('❌')
												.setCustomId('no')
												.setStyle(Discord.ButtonStyle.Secondary),
										);

										interaction
											.followUp({
												embeds: [confirm],
												components: [rowConf],
												ephemeral: true,
											})
											.then((msg) => {
												const filter = (interaction) => interaction.isButton();

												const coletor = msg.createMessageComponentCollector({
													filter,
													time: 600000,
												});

												coletor.on('collect', async (collected) => {
													const confirmation = collected.customId;
													collected.deferUpdate();

													if (confirmation === 'yes') {
														if (userBalance.coinsInWallet < 3000) {
															const semDinheiro = new Discord.EmbedBuilder()
																.setColor(config.embedColor)
																.setDescription(`${language.shop15}`);

															return interaction.followUp({
																embeds: [semDinheiro],
																ephemeral: true,
															});
														}

														const params = {
															Guild: interaction.guild.id,
															User: interaction.user.id,
														};
														const data = await Inventory.findOne(params);

														if (data) {
															const hasItem = data.Pickaxe;
															if (!hasItem) {
																data.Pickaxe = 1;
																await data.save();
															}
															else {
																// user already have the item
																const alreadyHaveItem = new Discord.EmbedBuilder()
																	.setColor(config.embedColor)
																	.setDescription(`${language.shopAlreadyHaveItem}`);

																return interaction.followUp({
																	embeds: [alreadyHaveItem],
																	ephemeral: true,
																});
															}
															await Inventory.findOneAndUpdate(params, data);
														}
														else {
															new Inventory({
																Guild: interaction.guild.id,
																User: interaction.user.id,
																Inventory: { RankCard: 0 },
																Pickaxe: 1,
															}).save();
														}

														const embedFinal = new Discord.EmbedBuilder()
															.setColor(config.embedColor)
															.setDescription(
																`${config.emojis.correct} ${language.shop16} \`${language.shop7}\``,
															);

														db.deductCoins(
															interaction.user.id,
															interaction.guild.id,
															3000,
														);
														interaction.followUp({
															embeds: [embedFinal],
														});
													}

													if (confirmation === 'no') {
														const embedFinal = new Discord.EmbedBuilder()
															.setColor(config.embedColor)
															.setDescription(
																`${config.emojis.error} ${language.shop17}`,
															);

														interaction.followUp({
															embeds: [embedFinal],
															ephemeral: true,
														});
													}
												});
											}).catch(console.log);
									}
								});
							}).catch(console.log);
					}

					if (menu === 'rankcard') {
						const row1 = new Discord.ActionRowBuilder().addComponents(
							new Discord.ButtonBuilder()
								.setEmoji('🏚️')
								.setCustomId('cabin')
								.setStyle(Discord.ButtonStyle.Secondary),
							new Discord.ButtonBuilder()
								.setEmoji('☁️')
								.setCustomId('cloud')
								.setStyle(Discord.ButtonStyle.Secondary),
							new Discord.ButtonBuilder()
								.setEmoji('☕')
								.setCustomId('coffee')
								.setStyle(Discord.ButtonStyle.Secondary),
							new Discord.ButtonBuilder()
								.setEmoji('🌆')
								.setCustomId('city')
								.setStyle(Discord.ButtonStyle.Secondary),
							new Discord.ButtonBuilder()
								.setEmoji('⛰️')
								.setCustomId('mountain')
								.setStyle(Discord.ButtonStyle.Secondary),
						);

						const tools = new Discord.EmbedBuilder()
							.setTitle(`🦚 ${language.shop4}`)
							.setColor(config.embedColor)
							.setDescription(`${language.shop2}\n${language.shopPreview}`)
							.addFields(
								{
									name: `🏚️ ${language.cabin}`,
									value: `> ${language.shopCabin}\n> \`10.000\`${config.emojis.scarcoin}`,
									inline: true,
								},
								{
									name: `☁️ ${language.clouds}`,
									value: `> ${language.shopClouds}\n> \`10.000\`${config.emojis.scarcoin}`,
									inline: true,
								},
								{
									name: `☕ ${language.coffee}`,
									value: `> ${language.shopCoffee}\n> \`10.000\`${config.emojis.scarcoin}`,
									inline: true,
								},
								{
									name: `🌆 ${language.city}`,
									value: `> ${language.shopCity}\n> \`10.000\`${config.emojis.scarcoin}`,
									inline: true,
								},
								{
									name: `⛰️ ${language.mountainWaterfall}`,
									value: `> ${language.shopMountainWaterfall}\n> \`10.000\`${config.emojis.scarcoin}`,
									inline: true,
								},
							)
							.setFooter({
								text: `${language.shopBuyWarning}`,
							});

						interaction
							.followUp({
								embeds: [tools],
								components: [row1],
								ephemeral: false,
							})
							.then((msg) => {
								const filter = (x) => x.isButton() && x.user.id === interaction.user.id;

								const coletor = msg.createMessageComponentCollector({
									filter,
									time: 600000,
								});

								coletor.on('collect', async (collected) => {
									if (collected.user.id !== interaction.user.id) {
										return;
									}

									const confirmation = collected.customId;
									collected.deferUpdate();

									if (confirmation === 'cabin') {
										const confirm = new Discord.EmbedBuilder()
											.setColor(config.embedColor)
											.setDescription(`${language.shop13}`)
											.setImage(config.images.ranks['1']);

										const rowConf = new Discord.ActionRowBuilder().addComponents(
											new Discord.ButtonBuilder()
												.setEmoji('✅')
												.setCustomId('yes')
												.setStyle(Discord.ButtonStyle.Secondary),
											new Discord.ButtonBuilder()
												.setEmoji('❌')
												.setCustomId('no')
												.setStyle(Discord.ButtonStyle.Secondary),
										);

										interaction
											.followUp({
												embeds: [confirm],
												components: [rowConf],
												ephemeral: true,
											})
											.then((msg) => {
												const filter = (x) => x.isButton() && x.user.id === interaction.user.id;

												const coletor = msg.createMessageComponentCollector({
													filter,
													time: 600000,
												});

												coletor.on('collect', async (collected) => {
													const confirmation = collected.customId;
													collected.deferUpdate();

													if (confirmation === 'yes') {
														if (userBalance.coinsInWallet < 10000) {
															const semDinheiro = new Discord.EmbedBuilder()
																.setColor(config.embedColor)
																.setDescription(`${language.shop15}`);

															return interaction.followUp({
																embeds: [semDinheiro],
																ephemeral: true,
															});
														}

														const params = {
															Guild: interaction.guild.id,
															User: interaction.user.id,
														};
														const data = await Inventory.findOne(params);
														if (data) {
															data.Inventory.RankCard = 1;
															await Inventory.findOneAndUpdate(params, data);
														}
														else {
															new Inventory({
																Guild: interaction.guild.id,
																User: interaction.user.id,
																Inventory: {
																	RankCard: 1,
																},
																Pickaxe: 0,
															}).save();
														}

														const embedFinal = new Discord.EmbedBuilder()
															.setColor(config.embedColor)
															.setDescription(
																`${config.emojis.correct} ${language.shop16} \`${language.shopFun} ${language.cabin}\``,
															);

														db.deductCoins(
															interaction.user.id,
															interaction.guild.id,
															10000,
														);
														interaction.followUp({
															embeds: [embedFinal],
														});
													}

													if (confirmation === 'no') {
														const embedFinal = new Discord.EmbedBuilder()
															.setColor(config.embedColor)
															.setDescription(
																`${config.emojis.error} ${language.shop17}`,
															);

														interaction.followUp({
															embeds: [embedFinal],
															ephemeral: true,
														});
													}
												});
											}).catch(console.log);
									}
									else if (confirmation === 'cloud') {
										const confirm = new Discord.EmbedBuilder()
											.setColor(config.embedColor)
											.setDescription(`${language.shop13}`)
											.setImage(config.images.ranks['2']);

										const rowConf = new Discord.ActionRowBuilder().addComponents(
											new Discord.ButtonBuilder()
												.setEmoji('✅')
												.setCustomId('yes')
												.setStyle(Discord.ButtonStyle.Secondary),
											new Discord.ButtonBuilder()
												.setEmoji('❌')
												.setCustomId('no')
												.setStyle(Discord.ButtonStyle.Secondary),
										);

										interaction
											.followUp({
												embeds: [confirm],
												components: [rowConf],
												ephemeral: true,
											})
											.then((msg) => {
												const filter = (x) => x.isButton() && x.user.id === interaction.user.id;

												const coletor = msg.createMessageComponentCollector({
													filter,
													time: 600000,
												});

												coletor.on('collect', async (collected) => {
													const confirmation = collected.customId;
													collected.deferUpdate();

													if (confirmation === 'yes') {
														if (userBalance.coinsInWallet < 10000) {
															const semDinheiro = new Discord.EmbedBuilder()
																.setColor(config.embedColor)
																.setDescription(`${language.shop15}`);

															return interaction.followUp({
																embeds: [semDinheiro],
																ephemeral: true,
															});
														}

														const params = {
															Guild: interaction.guild.id,
															User: interaction.user.id,
														};
														const data = await Inventory.findOne(params);
														if (data) {
															data.Inventory.RankCard = 2;
															await Inventory.findOneAndUpdate(params, data);
														}
														else {
															new Inventory({
																Guild: interaction.guild.id,
																User: interaction.user.id,
																Inventory: {
																	RankCard: 2,
																},
																Pickaxe: 0,
															}).save();
														}

														const embedFinal = new Discord.EmbedBuilder()
															.setColor(config.embedColor)
															.setDescription(
																`${config.emojis.correct} ${language.shop16} \`${language.shopFun} ${language.clouds}\``,
															);

														db.deductCoins(
															interaction.user.id,
															interaction.guild.id,
															10000,
														);
														interaction.followUp({
															embeds: [embedFinal],
														});
													}

													if (confirmation === 'no') {
														const embedFinal = new Discord.EmbedBuilder()
															.setColor(config.embedColor)
															.setDescription(
																`${config.emojis.error} ${language.shop17}`,
															);

														interaction.followUp({
															embeds: [embedFinal],
															ephemeral: true,
														});
													}
												});
											}).catch(console.log);
									}
									else if (confirmation === 'coffee') {
										const confirm = new Discord.EmbedBuilder()
											.setColor(config.embedColor)
											.setDescription(`${language.shop13}`)
											.setImage(config.images.ranks['3']);

										const rowConf = new Discord.ActionRowBuilder().addComponents(
											new Discord.ButtonBuilder()
												.setEmoji('✅')
												.setCustomId('yes')
												.setStyle(Discord.ButtonStyle.Secondary),
											new Discord.ButtonBuilder()
												.setEmoji('❌')
												.setCustomId('no')
												.setStyle(Discord.ButtonStyle.Secondary),
										);

										interaction
											.followUp({
												embeds: [confirm],
												components: [rowConf],
												ephemeral: true,
											})
											.then((msg) => {
												const filter = (x) => x.isButton() && x.user.id === interaction.user.id;

												const coletor = msg.createMessageComponentCollector({
													filter,
													time: 600000,
												});

												coletor.on('collect', async (collected) => {
													const confirmation = collected.customId;
													collected.deferUpdate();

													if (confirmation === 'yes') {
														if (userBalance.coinsInWallet < 10000) {
															const semDinheiro = new Discord.EmbedBuilder()
																.setColor(config.embedColor)
																.setDescription(`${language.shop15}`);

															return interaction.followUp({
																embeds: [semDinheiro],
																ephemeral: true,
															});
														}

														const params = {
															Guild: interaction.guild.id,
															User: interaction.user.id,
														};
														const data = await Inventory.findOne(params);
														if (data) {
															data.Inventory.RankCard = 3;
															await Inventory.findOneAndUpdate(params, data);
														}
														else {
															new Inventory({
																Guild: interaction.guild.id,
																User: interaction.user.id,
																Inventory: {
																	RankCard: 3,
																},
																Pickaxe: 0,
															}).save();
														}

														const embedFinal = new Discord.EmbedBuilder()
															.setColor(config.embedColor)
															.setDescription(
																`${config.emojis.correct} ${language.shop16} \`${language.shopFun} ${language.coffee}\``,
															);

														db.deductCoins(
															interaction.user.id,
															interaction.guild.id,
															10000,
														);
														interaction.followUp({
															embeds: [embedFinal],
														});
													}

													if (confirmation === 'no') {
														const embedFinal = new Discord.EmbedBuilder()
															.setColor(config.embedColor)
															.setDescription(
																`${config.emojis.error} ${language.shop17}`,
															);

														interaction.followUp({
															embeds: [embedFinal],
															ephemeral: true,
														});
													}
												});
											}).catch(console.log);
									}
									else if (confirmation === 'city') {
										const confirm = new Discord.EmbedBuilder()
											.setColor(config.embedColor)
											.setDescription(`${language.shop13}`)
											.setImage(config.images.ranks['4']);

										const rowConf = new Discord.ActionRowBuilder().addComponents(
											new Discord.ButtonBuilder()
												.setEmoji('✅')
												.setCustomId('yes')
												.setStyle(Discord.ButtonStyle.Secondary),
											new Discord.ButtonBuilder()
												.setEmoji('❌')
												.setCustomId('no')
												.setStyle(Discord.ButtonStyle.Secondary),
										);

										interaction
											.followUp({
												embeds: [confirm],
												components: [rowConf],
												ephemeral: true,
											})
											.then((msg) => {
												const filter = (x) => x.isButton() && x.user.id === interaction.user.id;

												const coletor = msg.createMessageComponentCollector({
													filter,
													time: 600000,
												});

												coletor.on('collect', async (collected) => {
													const confirmation = collected.customId;
													collected.deferUpdate();

													if (confirmation === 'yes') {
														if (userBalance.coinsInWallet < 10000) {
															const semDinheiro = new Discord.EmbedBuilder()
																.setColor(config.embedColor)
																.setDescription(`${language.shop15}`);

															return interaction.followUp({
																embeds: [semDinheiro],
																ephemeral: true,
															});
														}

														const params = {
															Guild: interaction.guild.id,
															User: interaction.user.id,
														};
														const data = await Inventory.findOne(params);

														if (data) {
															data.Inventory.RankCard = 4;
															await Inventory.findOneAndUpdate(params, data);
														}
														else {
															new Inventory({
																Guild: interaction.guild.id,
																User: interaction.user.id,
																Inventory: {
																	RankCard: 4,
																},
																Pickaxe: 0,
															}).save();
														}

														const embedFinal = new Discord.EmbedBuilder()
															.setColor(config.embedColor)
															.setDescription(
																`${config.emojis.correct} ${language.shop16} \`${language.shopFun} ${language.city}\``,
															);

														db.deductCoins(
															interaction.user.id,
															interaction.guild.id,
															10000,
														);
														interaction.followUp({
															embeds: [embedFinal],
														});
													}

													if (confirmation === 'no') {
														const embedFinal = new Discord.EmbedBuilder()
															.setColor(config.embedColor)
															.setDescription(
																`${config.emojis.error} ${language.shop17}`,
															);

														interaction.followUp({
															embeds: [embedFinal],
															ephemeral: true,
														});
													}
												});
											}).catch(console.log);
									}
									else if (confirmation === 'mountain') {
										const confirm = new Discord.EmbedBuilder()
											.setColor(config.embedColor)
											.setDescription(`${language.shop13}`)
											.setImage(config.images.ranks['5']);

										const rowConf = new Discord.ActionRowBuilder().addComponents(
											new Discord.ButtonBuilder()
												.setEmoji('✅')
												.setCustomId('yes')
												.setStyle(Discord.ButtonStyle.Secondary),
											new Discord.ButtonBuilder()
												.setEmoji('❌')
												.setCustomId('no')
												.setStyle(Discord.ButtonStyle.Secondary),
										);

										interaction
											.followUp({
												embeds: [confirm],
												components: [rowConf],
												ephemeral: true,
											})
											.then((msg) => {
												const filter = (x) => x.isButton() && x.user.id === interaction.user.id;

												const coletor = msg.createMessageComponentCollector({
													filter,
													time: 600000,
												});

												coletor.on('collect', async (collected) => {
													const confirmation = collected.customId;
													collected.deferUpdate();

													if (confirmation === 'yes') {
														if (userBalance.coinsInWallet < 10000) {
															const semDinheiro = new Discord.EmbedBuilder()
																.setColor(config.embedColor)
																.setDescription(`${language.shop15}`);

															return interaction.followUp({
																embeds: [semDinheiro],
																ephemeral: true,
															});
														}

														const params = {
															Guild: interaction.guild.id,
															User: interaction.user.id,
														};
														const data = await Inventory.findOne(params);

														if (data) {
															data.Inventory.RankCard = 5;
															await Inventory.findOneAndUpdate(params, data);
														}
														else {
															new Inventory({
																Guild: interaction.guild.id,
																User: interaction.user.id,
																Inventory: {
																	RankCard: 5,
																},
																Pickaxe: 0,
															}).save();
														}

														const embedFinal = new Discord.EmbedBuilder()
															.setColor(config.embedColor)
															.setDescription(
																`${config.emojis.correct} ${language.shop16} \`${language.shopFun} ${language.mountainWaterfall}\``,
															);

														db.deductCoins(
															interaction.user.id,
															interaction.guild.id,
															10000,
														);
														interaction.followUp({
															embeds: [embedFinal],
														});
													}

													if (confirmation === 'no') {
														const embedFinal = new Discord.EmbedBuilder()
															.setColor(config.embedColor)
															.setDescription(
																`${config.emojis.error} ${language.shop17}`,
															);

														interaction.followUp({
															embeds: [embedFinal],
															ephemeral: true,
														});
													}
												});
											}).catch(console.log);
									}
								});
							}).catch(console.log);
					}
				});
			}).catch(console.log);
	},
};
