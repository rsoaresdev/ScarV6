const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');
const ms = require('ms');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('slowmode')
		.setDescription('Sets the slowmode in a specific channel')
		.addStringOption((option) => option
			.setName('duration')
			.setDescription('Enter a duration')
			.setRequired(true))
		.setDMPermission(false)
		.setDefaultMemberPermissions(PermissionsBitField.Flags.Administrator),

	async execute(interaction, Discord, config, language) {
		if (
			!interaction.guild.members.me.permissions.has(
				Discord.PermissionsBitField.Flags.ManageChannels,
			)
		) {
			const embed2 = new Discord.EmbedBuilder()
				.setDescription(
					`${config.emojis.error} ${language.MEpermManageChannel}`,
				)
				.setColor(config.embedColor);

			return interaction.reply({
				embeds: [embed2],
				ephemeral: true,
			});
		}

		try {
			const string = interaction.options.getString('duration');

			// if NaN or <1s
			if (Number.isNaN(ms(string)) || ms(string) < 0) {
				const embed5 = new Discord.EmbedBuilder()
					.setDescription(`${config.emojis.error} ${language.slowmode3}`)
					.setColor(config.embedColor);

				return interaction.reply({
					embeds: [embed5],
					ephemeral: true,
				});
			}

			// if >6h
			if (ms(string) > 21600000) {
				const embed6 = new Discord.EmbedBuilder()
					.setDescription(`${config.emojis.error} ${language.slowmode4}`)
					.setColor(config.embedColor);

				return interaction.reply({
					embeds: [embed6],
					ephemeral: true,
				});
			}

			// if the slowmode is the same as the one already defined currently
			if (interaction.channel.rateLimitPerUser === ms(string) / 1000) {
				const embed7 = new Discord.EmbedBuilder()
					.setDescription(`${config.emojis.error} ${language.slowmode5}`)
					.setColor(config.embedColor);

				return interaction.reply({
					embeds: [embed7],
					ephemeral: true,
				});
			}

			const embed = new Discord.EmbedBuilder()
				.setTitle(`${language.slowmode7}`)
				.setDescription(`${language.slowmode8}: \`${ms(ms(string))}\``)
				.setColor(config.embedColor);

			interaction.channel.setRateLimitPerUser(ms(string) / 1000).then(
				interaction.reply({
					embeds: [embed],
				}),
			).catch(console.log);
		}
		catch {
			const embed5 = new Discord.EmbedBuilder()
				.setDescription(`${config.emojis.error} ${language.slowmode3}`)
				.setColor(config.embedColor);

			return interaction.reply({
				embeds: [embed5],
				ephemeral: true,
			});
		}
	},
};
