const { SlashCommandBuilder } = require('discord.js');
const AfkModel = require('../models/afk');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('afk')
		.setDescription('Enables AFK mode')
		.addStringOption((option) => option
			.setName('reason')
			.setDescription('Inserts a reason')
			.setMaxLength(100))
		.setDMPermission(false),

	async execute(interaction, Discord, config, language) {
		if (
			!interaction.guild.members.me.permissions.has(
				Discord.PermissionsBitField.Flags.ManageNicknames,
			)
		) {
			const perm = new Discord.EmbedBuilder()
				.setDescription(
					`${config.emojis.error} ${language.MEpermManageNicknames}`,
				)
				.setColor(config.embedColor);

			return interaction.reply({
				embeds: [perm],
				ephemeral: true,
			});
		}

		const reason = interaction.options.getString('reason');

		const data = await AfkModel.findOne({
			userID: interaction.user.id,
		});

		if (!data) {
			const newafk = new AfkModel({
				userID: interaction.user.id,
				serverID: interaction.guild.id,
				reason,
				oldNickname: interaction.user.username,
				time: new Date(),
			});
			newafk.save().catch(console.log);

			const text = language.afkSucess.replace(
				/{emojiTag}/g,
				`${config.emojis.tag}`,
			);

			const embed = new Discord.EmbedBuilder()
				.setTitle(`💤 ${language.afkActivated}`)
				.setDescription(text)
				.setColor(config.embedColor);

			if (reason) {
				embed.setFields({
					name: language.banField5,
					value: reason,
					inline: false,
				});
			}

			await interaction.reply({
				embeds: [embed],
				fetchReply: true,
			});

			if (interaction.user.id === interaction.guild.ownerId) {
				const embedDono = new Discord.EmbedBuilder()
					.setTitle(`💤 ${language.impossibleChangeNickname}`)
					.setDescription(language.afkOwner)
					.setColor(config.embedColor);

				return interaction.followUp({
					embeds: [embedDono],
					ephemeral: true,
				});
			}

			if (!interaction.member.manageable) {
				const embedUpRole = new Discord.EmbedBuilder()
					.setTitle(`💤 ${language.impossibleChangeNickname}`)
					.setDescription(language.afkAboveRole)
					.setColor(config.embedColor);

				return interaction.followUp({
					embeds: [embedUpRole],
					ephemeral: true,
				});
			}

			interaction.member.setNickname(`[AFK] ${interaction.user.username}`);
		}
		else {
			const embed2 = new Discord.EmbedBuilder()
				.setDescription(`💤 ${language.afkAlreadyActivated}`)
				.setColor(config.embedColor);

			return interaction.reply({
				embeds: [embed2],
				ephemeral: true,
			});
		}
	},
};
