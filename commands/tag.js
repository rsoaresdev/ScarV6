const { SlashCommandBuilder } = require('discord.js');
const SchemaTags = require('../models/tagssystem');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('tag')
		.setDescription('Tags module, create, edit, delete, and view.')
	// view
		.addSubcommand((subcommand) => subcommand
			.setName('view')
			.setDescription('View a tag')
			.addStringOption((option) => option
				.setName('name')
				.setDescription('The tag name to view')
				.setRequired(true)))
	// create
		.addSubcommand((subcommand) => subcommand.setName('create').setDescription('Create a tag'))
	// edit
		.addSubcommand((subcommand) => subcommand.setName('edit').setDescription('Edit a tag'))
	// delete
		.addSubcommand((subcommand) => subcommand
			.setName('delete')
			.setDescription('Delete a tag')
			.addStringOption((option) => option
				.setName('name')
				.setDescription('The tag name to delete')
				.setRequired(true)))
	// info
		.addSubcommand((subcommand) => subcommand
			.setName('info')
			.setDescription('View info about a tag')
			.addStringOption((option) => option
				.setName('name')
				.setDescription('The tag name to inspect')
				.setRequired(true)))
		.setDMPermission(false),

	async execute(interaction, Discord, config, language) {
		if (interaction.options.getSubcommand() === 'create') {
			if (
				!interaction.guild.members.me.permissions.has(
					Discord.PermissionsBitField.Flags.Administrator,
				)
			) {
				const embAdmin = new Discord.EmbedBuilder()
					.setDescription(`${config.emojis.error} ${language.YOUpermAdmin}`)
					.setColor(config.embedColor);

				return interaction.reply({
					embeds: [embAdmin],
					ephemeral: true,
				});
			}

			await interaction.showModal(
				new Discord.ModalBuilder()
					.setCustomId('modal_tag_create')
					.setTitle(language.tagCreateA)
					.addComponents(
						new Discord.ActionRowBuilder().addComponents(
							new Discord.TextInputBuilder()
								.setLabel(language.tagName)
								.setCustomId('modal_tag_create_name')
								.setPlaceholder(language.tagPlaceHolder1)
								.setStyle(Discord.TextInputStyle.Short)
								.setRequired(true)
								.setMaxLength(20)
								.setMinLength(3),
						),
						new Discord.ActionRowBuilder().addComponents(
							new Discord.TextInputBuilder()
								.setLabel(language.tagColor)
								.setCustomId('modal_tag_create_color')
								.setPlaceholder(language.tagPlaceholder)
								.setStyle(Discord.TextInputStyle.Short)
								.setRequired(false)
								.setMaxLength(7)
								.setMinLength(7),
						),
						new Discord.ActionRowBuilder().addComponents(
							new Discord.TextInputBuilder()
								.setLabel(language.tagDescription)
								.setCustomId('modal_tag_create_desc')
								.setPlaceholder(language.tagPlaceHolder2)
								.setStyle(Discord.TextInputStyle.Paragraph)
								.setRequired(true)
								.setMaxLength(2500),
						),
						new Discord.ActionRowBuilder().addComponents(
							new Discord.TextInputBuilder()
								.setLabel(language.tagContent)
								.setCustomId('modal_tag_create_content')
								.setPlaceholder(language.tagPlaceHolder3)
								.setStyle(Discord.TextInputStyle.Paragraph)
								.setRequired(true)
								.setMaxLength(4000)
								.setMinLength(10),
						),
					),
			);
		}

		if (interaction.options.getSubcommand() === 'edit') {
			if (
				!interaction.guild.members.me.permissions.has(
					Discord.PermissionsBitField.Flags.Administrator,
				)
			) {
				const embAdmin = new Discord.EmbedBuilder()
					.setDescription(`${config.emojis.error} ${language.YOUpermAdmin}`)
					.setColor(config.embedColor);

				return interaction.reply({
					embeds: [embAdmin],
					ephemeral: true,
				});
			}

			await interaction.showModal(
				new Discord.ModalBuilder()
					.setCustomId('modal_tag_edit')
					.setTitle(language.tagEdit)
					.addComponents(
						new Discord.ActionRowBuilder().addComponents(
							new Discord.TextInputBuilder()
								.setLabel(language.tagName)
								.setCustomId('modal_tag_edit_name')
								.setPlaceholder(language.tagNewName)
								.setStyle(Discord.TextInputStyle.Short)
								.setRequired(true)
								.setMaxLength(20)
								.setMinLength(3),
						),
						new Discord.ActionRowBuilder().addComponents(
							new Discord.TextInputBuilder()
								.setLabel(language.tagColor)
								.setCustomId('modal_tag_edit_color')
								.setPlaceholder(language.tagPlaceholder)
								.setStyle(Discord.TextInputStyle.Short)
								.setRequired(false)
								.setMaxLength(7)
								.setMinLength(7),
						),
						new Discord.ActionRowBuilder().addComponents(
							new Discord.TextInputBuilder()
								.setLabel(language.tagDescription)
								.setCustomId('modal_tag_edit_desc')
								.setPlaceholder(language.tagNewDescription)
								.setStyle(Discord.TextInputStyle.Paragraph)
								.setRequired(true)
								.setMaxLength(2500),
						),
						new Discord.ActionRowBuilder().addComponents(
							new Discord.TextInputBuilder()
								.setLabel(language.tagContent)
								.setCustomId('modal_tag_edit_content')
								.setPlaceholder(language.tagNewContent)
								.setStyle(Discord.TextInputStyle.Paragraph)
								.setRequired(true)
								.setMaxLength(4000)
								.setMinLength(10),
						),
					),
			);
		}

		if (interaction.options.getSubcommand() === 'delete') {
			if (
				!interaction.guild.members.me.permissions.has(
					Discord.PermissionsBitField.Flags.Administrator,
				)
			) {
				const embAdmin = new Discord.EmbedBuilder()
					.setDescription(`${config.emojis.error} ${language.YOUpermAdmin}`)
					.setColor(config.embedColor);

				return interaction.reply({
					embeds: [embAdmin],
					ephemeral: true,
				});
			}

			const subcommandOptionName = interaction.options.getString('name');

			try {
				const data = await SchemaTags.findOne({
					guild: interaction.guild.id,
					name: subcommandOptionName,
				});

				if (data) {
					await data.deleteOne();

					return interaction.reply({
						embeds: [
							new Discord.EmbedBuilder()
								.setDescription(language.tagHasBeenDeleted.replace(/{child}/g, subcommandOptionName))
								.setColor('#48e055'),
						],
						ephemeral: true,
					});
				}
				return interaction.reply({
					embeds: [
						new Discord.EmbedBuilder()
							.setColor('#ed4747')
							.setDescription(language.tagInvalid),
					],
					ephemeral: true,
				});
			}
			catch (err) {
				console.log(err);
			}
		}

		if (interaction.options.getSubcommand() === 'info') {
			const subcommandOptionName = interaction.options.getString('name');

			try {
				const data = await SchemaTags.findOne({
					guild: interaction.guild.id,
					name: subcommandOptionName,
				});

				if (data) {
					return interaction.reply({
						embeds: [
							new Discord.EmbedBuilder()
								.setTitle(`🔎 ${language.tagInfo} ${subcommandOptionName}`)
								.setColor(data.embedColor || config.embedColor)
								.addFields(
									{
										name: language.tagAuthor,
										value: `${
											interaction.guild.members.cache.get(data.author)
                      || language.tagUnknown
										} (${data.author})`,
										inline: true,
									},
									{
										name: language.tagCreatedAt,
										value: `<t:${
											new Date(data.createdAt).getTime() / 1000
										}> (<t:${new Date(data.createdAt).getTime() / 1000}:R>)`,
										inline: true,
									},
									{
										name: language.tagID,
										// eslint-disable-next-line no-underscore-dangle
										value: `${data._id}`,
										inline: false,
									},
								),
						],
					});
				}
				return interaction.reply({
					embeds: [
						new Discord.EmbedBuilder()
							.setColor('#ed4747')
							.setDescription(language.tagInvalid),
					],
					ephemeral: true,
				});
			}
			catch (err) {
				console.log(err);
			}
		}

		if (interaction.options.getSubcommand() === 'view') {
			const subcommandOptionName = interaction.options.getString('name');

			try {
				const data = await SchemaTags.findOne({
					guild: interaction.guild.id,
					name: subcommandOptionName,
				});

				if (data) {
					interaction.reply({
						embeds: [
							new Discord.EmbedBuilder()
								.setColor(data.embedColor || config.embedColor)
								.setDescription(`### ${data.desc}\n\n${data.content}`)
								.setFooter({ text: `${language.tagOnly} ${data.name}` }),
						],
					});
				}
				else {
					return interaction.reply({
						embeds: [
							new Discord.EmbedBuilder()
								.setColor('#ed4747')
								.setDescription(language.tagInvalid),
						],
						ephemeral: true,
					});
				}
			}
			catch (err) {
				console.log(err);
			}
		}
	},
};
