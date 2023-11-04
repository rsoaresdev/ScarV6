const Discord = require('discord.js');
const config = require('../config.json');

const Blacklist = require('../models/blacklist');
const ticketSchema = require('../models/tickets');
const ticketOpenSchema = require('../models/ticketsopen');
const languageSchema = require('../models/language');
const languageTicketMsg = require('../models/msgTicket');
const SchemaTags = require('../models/tagssystem');

async function delay(ms) {
	return new Promise((resolve) => {
		setTimeout(resolve, ms);
	});
}

module.exports = {
	name: Discord.Events.InteractionCreate,
	async execute(interaction) {
		// Get guild language
		const guildDB = await languageSchema.findOne({
			_id: interaction.guild.id,
		});
		const language = require(`../language/${
			guildDB?.language || 'english'
		}.json`);

		// If the interaction is a modal
		if (interaction.isModalSubmit()) {
			if (interaction.customId === 'modal_tag_create') {
				try {
					const data = await SchemaTags.findOne({
						guild: interaction.guild.id,
						name: interaction.fields.getTextInputValue('modal_tag_create_name'),
					});

					if (data) {
						return interaction.reply({
							embeds: [
								new Discord.EmbedBuilder()
									.setColor('#ed4747')
									.setDescription(language.tagTaken),
							],
							ephemeral: true,
						});
					}

					const newD = new SchemaTags({
						guild: interaction.guild.id,
						author: interaction.user.id,
						name: interaction.fields.getTextInputValue('modal_tag_create_name'),
						desc: interaction.fields.getTextInputValue('modal_tag_create_desc') || null,
						content: interaction.fields.getTextInputValue('modal_tag_create_content'),
						embedColor: interaction.fields.getTextInputValue('modal_tag_create_color') ? (/^#[0-9A-F]{6}$/i.test(interaction.fields.getTextInputValue('modal_tag_create_color')) ? interaction.fields.getTextInputValue('modal_tag_create_color') : '#2b2d31') : '#2b2d31',
						createdAt: new Date(),
					});

					await newD.save().catch(console.log);

					return interaction.reply({
						embeds: [
							new Discord.EmbedBuilder()
								.setDescription(language.tagCreated.replace(/{child}/g, interaction.fields.getTextInputValue('modal_tag_create_name')))
								.setColor('#48e055'),
						],
					});
				}
				catch (err) {
					console.log(err);
				}
			}

			if (interaction.customId === 'modal_tag_edit') {
				try {
					const data = await SchemaTags.findOne({
						guild: interaction.guild.id,
						name: interaction.fields.getTextInputValue('modal_tag_edit_name'),
					});

					if (!data) {
						return interaction.reply({
							embeds: [
								new Discord.EmbedBuilder()
									.setColor('#ed4747')
									.setDescription(language.tagInvalid),
							],
							ephemeral: true,
						});
					}

					await SchemaTags.updateOne(
						{
							guild: interaction.guild.id,
							name: interaction.fields.getTextInputValue('modal_tag_edit_name'),
						},
						{
							$set: {
								desc: interaction.fields.getTextInputValue('modal_tag_edit_desc') || data.desc,
								content: interaction.fields.getTextInputValue('modal_tag_edit_content'),
								embedColor: interaction.fields.getTextInputValue('modal_tag_edit_color') ? (/^#[0-9A-F]{6}$/i.test(interaction.fields.getTextInputValue('modal_tag_edit_color')) ? interaction.fields.getTextInputValue('modal_tag_edit_color') : '#2b2d31') : '#2b2d31',
							},
						},
					);

					interaction.reply({
						embeds: [
							new Discord.EmbedBuilder()
								.setDescription(language.tagUpdated.replace(/{child}/g, interaction.fields.getTextInputValue('modal_tag_edit_name')))
								.setColor('#48e055'),
						],
					});
				}
				catch (err) {
					console.log(err);
				}
			}
		}

		// If the interaction is a button
		if (interaction.isButton()) {
			// Button ID 'c'
			if (interaction.customId === 'c') {
				// Search for any open tickets of the member
				try {
					const ticketFinded = interaction.guild.channels.cache.find(
						(channel) => channel.name === `ticket-${interaction.user.id}`,
					);

					// If it finds a ticket that is already open, it returns an error
					if (ticketFinded) {
						const embed1 = new Discord.EmbedBuilder()
							.setDescription(`${language.int3} ${ticketFinded}`)
							.setColor(config.embedColor);

						return interaction.reply({
							embeds: [embed1],
							ephemeral: true,
						});
					}

					// No open tickets found. Continue...
					// Check if the bot has permission to 'Manage Channels'
					if (!interaction.guild.members.me.permissions
						.has(Discord.PermissionsBitField.Flags.ManageChannels)) {
						const embed2 = new Discord.EmbedBuilder()
							.setDescription(`${config.emojis.error} ${language.MEpermManageChannel}`)
							.setColor(config.embedColor);

						return interaction.reply({
							embeds: [embed2],
							ephemeral: true,
						});
					}

					// Create a ticket channel
					const data = await ticketOpenSchema.findOne({ serverId: interaction.guild.id });
					const dataMsg = await languageTicketMsg.findOne({ guildId: interaction.guild.id });
					const category = data ? data.category : null;
					const message = dataMsg ? dataMsg.message : null;

					const channel = await interaction.guild.channels.create({
						name: `ticket-${interaction.user.id}`,
						type: Discord.ChannelType.GuildText,
						parent: category,
						permissionOverwrites: [
							...interaction.guild.roles.cache
								.filter((r) => r.permissions.has(
									Discord.PermissionsBitField.Flags.ManageMessages,
								))
								.map((r) => ({
									id: r.id,
									allow: [
										Discord.PermissionsBitField.Flags.ViewChannel,
										Discord.PermissionsBitField.Flags.SendMessages,
									],
								})),
							{
								id: interaction.guild.id,
								deny: [Discord.PermissionsBitField.Flags.ViewChannel],
							},
							{
								id: interaction.user.id,
								allow: [
									Discord.PermissionsBitField.Flags.ViewChannel,
									Discord.PermissionsBitField.Flags.SendMessages,
								],
							},
							{
								id: interaction.client.user.id,
								allow: [
									Discord.PermissionsBitField.Flags.ViewChannel,
									Discord.PermissionsBitField.Flags.SendMessages,
								],
							},
						],
					});

					const embed3 = new Discord.EmbedBuilder()
						.setDescription(`${language.int5} ${channel}`)
						.setColor(config.embedColor);

					// Send opening message in the ticket HUD channel
					interaction.reply({
						embeds: [embed3],
						ephemeral: true,
					});

					// Create button to close the ticket
					const row = new Discord.ActionRowBuilder().addComponents(
						new Discord.ButtonBuilder()
							.setCustomId('f')
							.setLabel(`${language.int2}`)
							.setStyle(Discord.ButtonStyle.Danger),
					);

					const placeholders = {
						'{userId}': interaction.user.id,
						'{userMention}': `<@${interaction.user.id}>`,
						'{guildName}': interaction.guild.name,
						'{guildMemberCount}': interaction.guild.memberCount,
					};

					const embed = new Discord.EmbedBuilder()
						.setDescription(`${message ? message.replace(/{userId}|{userMention}|{guildName}|{guildMemberCount}/g, (match) => placeholders[match]) : language.int6}`)
						.setColor(config.embedColor);

					// Send opening message in the ticket channel
					channel
						.send({
							content: `${interaction.user}`,
							embeds: [embed],
							components: [row],
						})
						.then((msg) => {
							msg.pin(); // Pin message
						})
						.catch(console.log);
				}
				catch (err) {
					console.log(err);
				}
			}

			// Button ID 'f'
			if (interaction.customId === 'f') {
				try {
					const data = await ticketSchema.findOne({ serverId: interaction.guild.id });

					// Check if the server has any ticket closure category defined
					if (!data) {
						// Create embeds
						const Embed3 = new Discord.EmbedBuilder()
							.setDescription(`${config.emojis.loading} ${language.int27}`)
							.setColor(config.embedColor);

						// Sends a message informing that the channel will be deleted in a moment
						await interaction.reply({
							embeds: [Embed3],
						});

						await delay(5000);
						if (interaction.channel) {
							await interaction.channel.delete();
						}
					}
					else {
						// Check if the ticket is already closed
						if (interaction.channel.parentId === data.category) {
							const channelInParent = new Discord.EmbedBuilder()
								.setDescription(`${config.emojis.error} ${language.int28}`)
								.setColor(config.embedColor);

							return interaction.reply({
								embeds: [channelInParent],
								ephemeral: true,
							});
						}

						const Embed4 = new Discord.EmbedBuilder()
							.setDescription(`${config.emojis.loading} ${language.int27}`)
							.setColor(config.embedColor);

						// Sends a message saying that the ticket will be archived in a few seconds
						interaction.reply({
							embeds: [Embed4],
						});

						// Change ticket channel category
						await interaction.channel.setParent(data.category);

						const permissions = [
							...interaction.guild.roles.cache
								.filter((r) => r.permissions.has(
									Discord.PermissionsBitField.Flags.ManageMessages,
								))
								.map((r) => ({
									id: r.id,
									allow: [Discord.PermissionsBitField.Flags.ViewChannel],
									deny: [
										Discord.PermissionsBitField.Flags.ManageMessages,
									],
								})),
							{
								id: interaction.guild.id,
								deny: [
									Discord.PermissionsBitField.Flags.ViewChannel,
									Discord.PermissionsBitField.Flags.ManageMessages,
								],
							},
							{
								id: interaction.client.user.id,
								allow: [
									Discord.PermissionsBitField.Flags.ViewChannel,
									Discord.PermissionsBitField.Flags.SendMessages,
								],
							},
						];

						await interaction.channel.permissionOverwrites.set(permissions);

						// Get old channel name and change it to "closed-..."
						const nameOld = interaction.channel.name;
						const nameNew = nameOld.replace(/ticket/g, 'closed');
						await interaction.channel.setName(nameNew);

						// Send a message with a permanently delete ticket button
						const EmbedFin = new Discord.EmbedBuilder()
							.setDescription(
								`${config.emojis.correct} ${language.int30}`,
							)
							.setColor(config.embedColor);

						const row0 = new Discord.ActionRowBuilder().addComponents(
							new Discord.ButtonBuilder()
								.setCustomId('fd')
								.setLabel(`${language.int26}`)
								.setStyle(Discord.ButtonStyle.Danger),
						);

						await interaction.followUp({
							embeds: [EmbedFin],
							components: [row0],
						});
					}
				}
				catch (err) {
					console.log(err);
				}
			}

			// Button ID 'fd'
			if (interaction.customId === 'fd') {
				try {
					// Check if bot has permission to manage channels
					if (!interaction.guild.members.me.permissions
						.has(Discord.PermissionsBitField.Flags.ManageChannels)) {
						const noPermissionEmbed = new Discord.EmbedBuilder()
							.setDescription(`${language.MEpermManageChannel}`)
							.setColor(config.embedColor);
						await interaction.reply({ embeds: [noPermissionEmbed], ephemeral: true });
					}

					// Delete channel
					if (interaction.channel) {
						await interaction.channel.delete();
					}
				}
				catch (err) {
					console.log(err);
				}
			}
		}

		// Blacklist
		try {
			const blacklisted = await Blacklist.findOne({ discordId: interaction.user.id });

			if (blacklisted) {
				const text = language.blacklistMSG
					.replace(/{user}/g, `${interaction.user}`)
					.replace(/{termosUso}/g, `${config.links.terms}`)
					.replace(/{contactForm}/g, `${config.links.contactForm}`)
					.replace(/{emojiMod}/g, `${config.emojis.mod}`)
					.replace(/{reason}/g, `${blacklisted.reason}`);

				const embed1 = new Discord.EmbedBuilder()
					.setColor(config.embedColor)
					.setTitle(`${language.blacklistTitleDM}`)
					.setDescription(`${text}`);

				return interaction.reply({
					embeds: [embed1],
					ephemeral: true,
				});
			}
		}
		catch (err) {
			console.log(err);
		}

		// Get command
		const command = interaction.client.commands.get(interaction.commandName);
		// If the command does not exist/outdated, return
		if (!command) return null;

		// Finally, run the interaction
		try {
			await command.execute(interaction, Discord, config, language);

			// Logs it in the command log
			interaction.client.channels.cache.get(config.channels.logExecutedCommands).send({
				embeds: [
					new Discord.EmbedBuilder()
						.setDescription(`<t:${Math.floor(Date.now() / 1000)}:D> (<t:${Math.floor(Date.now() / 1000)}:T>)`)
						.addFields(
							{
								name: 'Server',
								value: `> Name: \`${interaction.guild.name}\`\n> ID: \`${interaction.guild.id}\``,
								inline: false,
							},
							{
								name: 'Executor',
								value: `> User: \`${interaction.user.tag}\`\n> ID: \`${interaction.user.id}\``,
								inline: false,
							},
							{
								name: 'Command',
								value: `\`\`\`${interaction}\`\`\``,
								inline: true,
							},
						)
						.setColor(config.embedColor),
				],
			});
		}
		catch (error) {
			console.log(error);

			const embedError = new Discord.EmbedBuilder()
				.setTitle(`${config.emojis.catCry} ${language.error3}`)
				.setDescription(`${language.error1}`)
				.addFields({
					name: `${language.error2}`,
					value: `\`\`\`${error.message}\`\`\``,
				})
				.setFooter({
					text: `${language.error4}`,
				})
				.setTimestamp()
				.setColor(config.embedColor);

			const embedErrorLog = new Discord.EmbedBuilder()
				.setDescription(`<t:${Math.floor(Date.now() / 1000)}:D> (<t:${Math.floor(Date.now() / 1000)}:T>)\n\n\`\`\`js\n${error.stack}\`\`\``)
				.setColor(config.embedColor);

			// Reply the interaction
			interaction.reply({ embeds: [embedError], ephemeral: true });

			// Sent to log channel
			interaction.client.channels.cache.get(config.channels.logErrors)
				.send({ embeds: [embedErrorLog] });
		}
	},
};
