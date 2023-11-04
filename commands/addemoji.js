const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('addemoji')
		.setDescription('Add an emoji to the server')
		.addStringOption((option) => option
			.setName('emoji')
			.setDescription('Insert an emoji')
			.setRequired(true))
		.setDMPermission(false)
		.setDefaultMemberPermissions(
			PermissionsBitField.Flags.ManageGuildExpressions,
		),

	async execute(interaction, Discord, config, language) {
		if (
			!interaction.guild.members.me.permissions.has(
				Discord.PermissionsBitField.Flags.ManageGuildExpressions,
			)
		) {
			const embed1 = new Discord.EmbedBuilder()
				.setDescription(`${config.emojis.error} ${language.MEpermManageEmojis}`)
				.setColor(config.embedColor);

			return interaction.reply({
				embeds: [embed1],
				ephemeral: true,
			});
		}

		const string = interaction.options.getString('emoji');

		const emote = string.match(/<?(a)?:?(\w{2,32}):(\d{17,19})>?/gi);

		if (emote.length > 15) {
			const embed15Emoji = new Discord.EmbedBuilder()
				.setDescription(`${config.emojis.error} ${language.emojisSameTime}`)
				.setColor(config.embedColor);

			return interaction.reply({
				embeds: [embed15Emoji],
				ephemeral: true,
			});
		}

		const embedWait = new Discord.EmbedBuilder()
			.setDescription(`${config.emojis.loading} ${language.emojiWait}`)
			.setColor(config.embedColor);

		interaction.reply({
			embeds: [embedWait],
			ephemeral: true,
		});

		emote.forEach((m) => {
			try {
				const parsed = Discord.parseEmoji(m);

				const link = `https://cdn.discordapp.com/emojis/${parsed.id}${
					parsed.animated ? '.gif' : '.png'
				}`;

				const row = new Discord.ActionRowBuilder().addComponents(
					new Discord.ButtonBuilder()
						.setLabel(`🖼️ ${language.emojiLink}`)
						.setURL(link)
						.setStyle(Discord.ButtonStyle.Link),
				);

				interaction.guild.emojis
					.create({ attachment: link, name: `${parsed.name}` })
					.then((em) => {
						const text = language.emojiMSG
							.replace(/{stringEmoji}/g, `${em}`)
							.replace(/{emojiName}/g, `${parsed.name}`)
							.replace(/{emojiId}/g, `${parsed.id}`);

						const embed = new Discord.EmbedBuilder()
							.setThumbnail(link)
							.setDescription(text)
							.setColor(config.embedColor);

						interaction.channel.send({
							embeds: [embed],
							components: [row],
						});
					})
					.catch((err) => {
						const embedError1 = new Discord.EmbedBuilder()
							.setDescription(`${config.emojis.error} ${language.unableAddEmoji}`)
							.setColor(config.embedColor);

						interaction.reply({
							embeds: [embedError1],
							ephemeral: true,
						});
						console.log(err);
					});
			}
			catch (err) {
				const embedError1 = new Discord.EmbedBuilder()
					.setDescription(`${config.emojis.error} ${language.unableAddEmoji}`)
					.setColor(config.embedColor);

				interaction.reply({
					embeds: [embedError1],
					ephemeral: true,
				});
				console.log(err);
			}
		});
	},
};
