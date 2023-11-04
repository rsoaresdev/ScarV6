const { SlashCommandBuilder } = require('discord.js');
const Blacklist = require('../models/blacklist');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('blacklist')
		.setDescription('Manages the blacklist security module')
		.addSubcommand((subcommand) => subcommand
			.setName('add')
			.setDescription('Add a member to the blacklist')
			.addUserOption((option) => option
				.setName('user')
				.setDescription('Select a user')
				.setRequired(true))
			.addStringOption((option) => option
				.setName('reason')
				.setDescription('Enter a reason')
				.setRequired(true)))
		.addSubcommand((subcommand) => subcommand
			.setName('remove')
			.setDescription('Removes a member to the blacklist')
			.addUserOption((option) => option
				.setName('user')
				.setDescription('Select a user')
				.setRequired(true)))

		.setDMPermission(false),

	async execute(interaction, Discord, config, language) {
		if (interaction.user.id !== config.ownerId) {
			const Embed1 = new Discord.EmbedBuilder()
				.setDescription(`${config.emojis.owner} ${language.commandOwnerBot}`)
				.setColor(config.embedColor);

			return interaction.reply({
				embeds: [Embed1],
				ephemeral: true,
			});
		}

		if (interaction.options.getSubcommand() === 'add') {
			const member = interaction.options.getUser('user');
			const reason = interaction.options.getString('reason');

			try {
				const filter = { discordId: member.id };
				const update = { isBlacklisted: true, reason };
				const options = { upsert: true, new: true };
				await Blacklist.findOneAndUpdate(filter, update, options);

				const embed = new Discord.EmbedBuilder()
					.setColor(config.embedColor)
					.setTitle(`${config.emojis.mod} ${language.blacklistTitle}`)
					.addFields(
						{
							name: `${language.blacklistField1}`,
							value: `> ${language.blacklistField2}`,
							inline: true,
						},
						{
							name: `${language.blacklistField3}`,
							value: `> ${member}\n> (${member.id})`,
							inline: false,
						},
						{
							name: `${language.blacklistField4}`,
							value: `> ${interaction.user}`,
							inline: false,
						},
						{
							name: `${language.blacklistField5}`,
							value: `> \`${reason}\``,
							inline: true,
						},
					);

				interaction.reply({
					embeds: [embed],
				});

				interaction.client.channels.cache
					.get(config.channels.logBlacklist)
					.send({
						embeds: [embed],
					});

				const text = language.blacklistMSG
					.replace(/{user}/g, `${member}`)
					.replace(/{termosUso}/g, `${config.links.terms}`)
					.replace(/{servidorSuporte}/g, `${config.links.supportServer}`)
					.replace(/{emojiMod}/g, `${config.emojis.mod}`)
					.replace(/{reason}/g, `${reason}`);

				const embed1 = new Discord.EmbedBuilder()
					.setColor('c92a2a')
					.setTitle(`${language.blacklistTitleDM}`)
					.setDescription(text);

				member.send({
					embeds: [embed1],
				}).catch(() => {});
			}
			catch (err) {
				console.log(err);
			}
		}

		if (interaction.options.getSubcommand() === 'remove') {
			const member = interaction.options.getUser('user');

			try {
				const data = await Blacklist.findOne({ discordId: member.id });
				if (data) {
					await data.deleteOne();

					const embed = new Discord.EmbedBuilder()
						.setColor(config.embedColor)
						.setTitle(`${config.emojis.mod} ${language.blacklistTitle}`)
						.addFields(
							{
								name: `${language.blacklistField1}`,
								value: `${language.blacklistField6}`,
								inline: false,
							},
							{
								name: `${language.blacklistField3}`,
								value: `> ${member}\n> (${member.id})`,
								inline: false,
							},
							{
								name: `${language.blacklistField4}`,
								value: `> ${interaction.user}`,
								inline: false,
							},
						);

					await interaction.reply({
						embeds: [embed],
					});

					const text = language.unblacklistMSG
						.replace(/{user}/g, `${member}`)
						.replace(/{termosUso}/g, `${config.links.terms}`);

					interaction.client.channels.cache
						.get(config.channels.logBlacklist)
						.send({
							embeds: [embed],
						});

					const embed1 = new Discord.EmbedBuilder()
						.setColor('4cb03f')
						.setTitle(`${language.unblacklist7}`)
						.setDescription(`${text}`);

					member.send({
						embeds: [embed1],
					}).catch(() => {});
				}
				else {
					const embedFail = new Discord.EmbedBuilder()
						.setColor(config.embedColor)
						.setDescription(`${language.blacklistField7}`);

					return interaction.reply({ embeds: [embedFail], ephemeral: true });
				}
			}
			catch (err) {
				console.log(err);
			}
		}
	},
};
