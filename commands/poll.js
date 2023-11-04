const { SlashCommandBuilder, ChannelType, PermissionsBitField } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('poll')
		.setDescription('Starts a poll for members to vote')
		.addChannelOption((option) => option
			.setName('channel')
			.setDescription('Select a channel')
			.addChannelTypes(ChannelType.GuildText, ChannelType.GuildAnnouncement)
			.setRequired(true))
		.addStringOption((option) => option
			.setName('description')
			.setDescription('Enter the description. To make a paragraph, type <br>')
			.setRequired(true))
		.setDMPermission(false)
		.setDefaultMemberPermissions(PermissionsBitField.Flags.ManageMessages),

	async execute(interaction, Discord, config, language) {
		const description = interaction.options.getString('description');
		const channel = interaction.options.getChannel('channel');

		const textoWithBR = description.replace(/<br>/g, '\n');

		// Max 15 rows
		if (textoWithBR.split(/\r\n|\r|\n/).length > 15) {
			const noMoreThan15Rows = new Discord.EmbedBuilder()
				.setColor(config.embedColor)
				.setDescription(`${config.emojis.error} ${language.noMoreThan15Rows}`);

			return interaction.reply({
				embeds: [noMoreThan15Rows],
				ephemeral: true,
			});
		}

		const embed2 = new Discord.EmbedBuilder()
			.setDescription(`${config.emojis.correct} ${language.poll}`)
			.setColor(config.embedColor);

		interaction.reply({
			embeds: [embed2],
			ephemeral: true,
		});

		const embed = new Discord.EmbedBuilder()
			.setDescription(textoWithBR)
			.setFooter({
				text: `${language.poll3} ${interaction.member.displayName}`,
			})
			.setTimestamp()
			.setColor(config.embedColor);

		channel
			.send({
				embeds: [embed],
			})
			.then(async (msg) => {
				await msg.react(config.emojis.correct).catch(async () => {
					await msg.react('✅');
				});
				await msg.react(config.emojis.error).catch(async () => {
					await msg.react('❌');
				});
			})
			.catch(console.log);
	},
};
