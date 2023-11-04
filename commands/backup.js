const { SlashCommandBuilder } = require('discord.js');
const backup = require('discord-backup');
const SchemaBackup = require('../models/backup');
const SchemaBackupLoad = require('../models/backupload');

// Timeout 6 hours
const timeout = 21600000;

module.exports = {
	data: new SlashCommandBuilder()
		.setName('backup')
		.setDescription('Setup the backup module')
		.addSubcommand((subcommand) => subcommand.setName('create').setDescription('Create a backup'))
		.addSubcommand((subcommand) => subcommand
			.setName('info')
			.setDescription('Information from a backup')
			.addStringOption((option) => option
				.setName('id')
				.setDescription('Enter the backup ID')
				.setRequired(true)
				.setMaxLength(19)
				.setMinLength(18)))
		.addSubcommand((subcommand) => subcommand
			.setName('load')
			.setDescription('Load a backup')
			.addStringOption((option) => option
				.setName('id')
				.setDescription('Enter the backup ID')
				.setRequired(true)
				.setMaxLength(19)
				.setMinLength(18)))
		.setDMPermission(false),

	async execute(interaction, Discord, config, language) {
		if (interaction.options.getSubcommand() === 'create') {
			if (interaction.user.id !== interaction.guild.ownerId) {
				const embed1 = new Discord.EmbedBuilder()
					.setDescription(language.commandOwnerServer)
					.setColor(config.embedColor);

				return interaction.reply({
					embeds: [embed1],
					ephemeral: true,
				});
			}

			if (
				!interaction.guild.members.me.permissions.has(
					Discord.PermissionsBitField.Flags.Administrator,
				)
			) {
				const embAdmin = new Discord.EmbedBuilder()
					.setDescription(`${config.emojis.error} ${language.MEpermAdmin}`)
					.setColor(config.embedColor);

				return interaction.reply({
					embeds: [embAdmin],
					ephemeral: true,
				});
			}

			await interaction.deferReply();

			try {
				const data = await SchemaBackup.findOne({
					userId: interaction.user.id,
				});

				if (!data) {
					// Can create a backup, never use the command
					const newD = new SchemaBackup({
						time: Date.now(),
						userId: interaction.user.id,
					});
					newD.save();

					backup
						.create(interaction.guild, {
							maxMessagesPerChannel: 0,
						})
						.then(async (backupData) => {
							const embed2 = new Discord.EmbedBuilder()
								.setTitle(
									`${config.emojis.online} ${language.backupCreatedTitle}`,
								)
								.setDescription(language.dmBackupDescription)
								.addFields(
									{
										name: language.backupServidor,
										value: interaction.guild.name,
									},
									{
										name: language.backupId,
										value: `|| ${backupData.id} ||`,
									},
									{
										name: language.backupLoad,
										value: `|| \`/backup load id:${backupData.id}\` ||`,
									},
								)
								.setFooter({
									text: language.backupLoad2,
								})
								.setColor(config.embedColor);

							interaction.user.send({
								embeds: [embed2],
							}).catch(() => {});

							const embedFinal = new Discord.EmbedBuilder()
								.setDescription(language.backupCreated)
								.setColor(config.embedColor);

							interaction.followUp({
								embeds: [embedFinal],
							});
						})
						.catch(console.log);
				}
				else if (timeout - (Date.now() - data.time) > 0) {
					// In timeout
					const timeEmbed = new Discord.EmbedBuilder()
						.setColor(config.embedColor)
						.setDescription(
							`${config.emojis.error} ${
								language.backupTimeCreate
							} <t:${Math.round(data.time / 1000 + 21600)}:R>`,
						);

					return interaction.editReply({
						embeds: [timeEmbed],
					});
				}
				else {
					// Can create a backup, timeout expired
					data.time = Date.now();
					await data.save();

					const newD = new SchemaBackup({
						time: Date.now(),
						userId: interaction.user.id,
					});
					newD.save();

					backup
						.create(interaction.guild, {
							maxMessagesPerChannel: 0,
						})
						.then(async (backupData) => {
							const embed2 = new Discord.EmbedBuilder()
								.setTitle(
									`${config.emojis.online} ${language.backupCreatedTitle}`,
								)
								.setDescription(language.dmBackupDescription)
								.addFields(
									{
										name: language.backupServidor,
										value: interaction.guild.name,
									},
									{
										name: language.backupId,
										value: `|| ${backupData.id} ||`,
									},
									{
										name: language.backupLoad,
										value: `|| \`/backup load id:${backupData.id}\` ||`,
									},
								)
								.setFooter({
									text: language.backupLoad2,
								})
								.setColor(config.embedColor);

							interaction.user.send({
								embeds: [embed2],
							}).catch(() => {});

							const embedFinal = new Discord.EmbedBuilder()
								.setDescription(language.backupCreated)
								.setColor(config.embedColor);
							interaction.followUp({
								embeds: [embedFinal],
							});
						})
						.catch(console.log);
				}
			}
			catch (err) {
				console.log(err);
			}
		}

		if (interaction.options.getSubcommand() === 'info') {
			if (interaction.user.id !== interaction.guild.ownerId) {
				const embed1 = new Discord.EmbedBuilder()
					.setDescription(language.commandOwnerServer)
					.setColor(config.embedColor);
				return interaction.reply({
					embeds: [embed1],
					ephemeral: true,
				});
			}

			const backupID = interaction.options.getString('id');

			backup
				.fetch(backupID)
				.then((backupInfos) => {
					const embed = new Discord.EmbedBuilder()
						.setTitle(language.backupInfo)
						.addFields(
							{
								name: language.backupId,
								value: `|| \`${backupInfos.id}\` ||`,
								inline: false,
							},
							{
								name: language.backupServidor,
								value: `|| \`${backupInfos.data.name}\` || \n || \`${backupInfos.data.guildID}\` ||`,
								inline: false,
							},
							{
								name: language.backupSize,
								value: `${backupInfos.size} kb`,
								inline: false,
							},
						)
						.setColor(config.embedColor);

					interaction.reply({
						embeds: [embed],
						ephemeral: true,
					});
				})
				.catch(() => {
					const embedError = new Discord.EmbedBuilder()
						.setDescription(language.backupNotFound)
						.setColor(config.embedColor);
					return interaction.reply({
						embeds: [embedError],
						ephemeral: true,
					});
				});
		}

		if (interaction.options.getSubcommand() === 'load') {
			if (interaction.user.id !== interaction.guild.ownerId) {
				const embed1 = new Discord.EmbedBuilder()
					.setDescription(language.commandOwnerServer)
					.setColor(config.embedColor);

				return interaction.reply({
					embeds: [embed1],
					ephemeral: true,
				});
			}

			if (
				!interaction.guild.members.me.permissions.has(
					Discord.PermissionsBitField.Flags.Administrator,
				)
			) {
				const embAdmin = new Discord.EmbedBuilder()
					.setDescription(`${config.emojis.error} ${language.MEpermAdmin}`)
					.setColor(config.embedColor);

				return interaction.reply({
					embeds: [embAdmin],
					ephemeral: true,
				});
			}

			const backupID = interaction.options.getString('id');
			try {
				const data = await SchemaBackupLoad.findOne({
					userId: interaction.user.id,
				});

				const confirm = new Discord.ActionRowBuilder().addComponents(
					new Discord.ButtonBuilder()
						.setLabel(`${language.yes}`)
						.setCustomId('sim')
						.setStyle(Discord.ButtonStyle.Danger),
					new Discord.ButtonBuilder()
						.setLabel(`${language.no}`)
						.setCustomId('nao')
						.setStyle(Discord.ButtonStyle.Success),
				);

				if (!data) {
					const newD = new SchemaBackupLoad({
						time: Date.now(),
						userId: interaction.user.id,
					});
					newD.save();

					backup
						.fetch(backupID)
						.then(async () => {
							const embedFinal = new Discord.EmbedBuilder()
								.setColor(config.embedColor)
								.setDescription(language.backupLoadQuestion);

							interaction
								.reply({
									embeds: [embedFinal],
									ephemeral: true,
									components: [confirm],
									fetchfollowUp: true,
								})
								.then((msg) => {
									const filter = (x) => x.isButton() && x.user.id === interaction.user.id;

									const coletor = msg.createMessageComponentCollector({
										filter,
										time: 300000,
										max: 1,
									});

									coletor.on('collect', async (collected) => {
										const menu = collected.customId;
										collected.deferUpdate();

										if (menu === 'sim') {
											const embed2 = new Discord.EmbedBuilder()
												.setDescription(language.backupLoading)
												.setColor(config.embedColor);

											interaction.user.send({
												embeds: [embed2],
											}).catch(() => {});

											return backup.load(backupID, interaction.guild, {
												clearGuildBeforeRestore: true,
												maxMessagesPerChannel: 0,
											});
										}

										if (menu === 'nao') {
											const embedNo = new Discord.EmbedBuilder()
												.setColor(config.embedColor)
												.setDescription(
													`${config.emojis.error} ${language.backupCanceled}`,
												);

											return interaction.followUp({
												embeds: [embedNo],
												ephemeral: true,
											});
										}

										return null;
									});
								})
								.catch(console.log);
						})
						.catch((err) => {
							console.log(err);

							const embedError = new Discord.EmbedBuilder()
								.setDescription(language.backupNotFound)
								.setColor(config.embedColor);

							interaction.reply({
								embeds: [embedError],
							});
						});
				}
				else if (timeout - (Date.now() - data.time) > 0) {
					const timeEmbed = new Discord.EmbedBuilder()
						.setColor(config.embedColor)
						.setDescription(
							`${config.emojis.error} ${
								language.backupTimeCreate
							} <t:${Math.round(data.time / 1000 + 21600)}:R>`,
						);

					return interaction.reply({
						embeds: [timeEmbed],
						ephemeral: true,
					});
				}
				else {
					backup
						.fetch(backupID)
						.then(async () => {
							const embedFinal = new Discord.EmbedBuilder()
								.setColor(config.embedColor)
								.setDescription(language.backupLoadQuestion);

							interaction
								.reply({
									embeds: [embedFinal],
									ephemeral: true,
									components: [confirm],
									fetchfollowUp: true,
								})
								.then((msg) => {
									const filter = (x) => x.isButton() && x.user.id === interaction.user.id;

									const coletor = msg.createMessageComponentCollector({
										filter,
										time: 60000,
										max: 1,
									});

									coletor.on('collect', async (collected) => {
										const menu = collected.customId;
										collected.deferUpdate();

										if (menu === 'sim') {
											data.time = Date.now();
											await data.save();

											const embed2 = new Discord.EmbedBuilder()
												.setDescription(language.backupLoading)
												.setColor(config.embedColor);

											interaction.user.send({
												embeds: [embed2],
											}).catch(() => {});

											return backup.load(backupID, interaction.guild, {
												clearGuildBeforeRestore: true,
												maxMessagesPerChannel: 0,
											});
										}

										if (menu === 'nao') {
											const embedNo = new Discord.EmbedBuilder()
												.setColor(config.embedColor)
												.setDescription(
													`${config.emojis.correct} ${language.backupCanceled}`,
												);

											return interaction.followUp({
												embeds: [embedNo],
												ephemeral: true,
											});
										}

										return null;
									});
								})
								.catch(console.log);
						})
						.catch(() => {
							const embedError = new Discord.EmbedBuilder()
								.setDescription(language.backupNotFound)
								.setColor(config.embedColor);

							return interaction.reply({
								embeds: [embedError],
								ephemeral: true,
							});
						});
				}
			}
			catch (err) {
				console.log(err);
			}
		}
	},
};
