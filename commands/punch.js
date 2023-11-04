const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('punch')
		.setDescription('Punch a member')
		.addUserOption((option) => option.setName('user').setDescription('Select a user').setRequired(true))
		.setDMPermission(false),

	async execute(interaction, Discord, config, language) {
		const user1 = interaction.options.getUser('user');

		const button = new Discord.ActionRowBuilder().addComponents(
			new Discord.ButtonBuilder()
				.setCustomId('return')
				.setLabel(`${language.soco3}`)
				.setStyle(Discord.ButtonStyle.Secondary),
		);
		const embed = new Discord.EmbedBuilder()
			.setColor(config.embedColor)
			.setDescription(
				`${config.emojis.robotHeart} ${interaction.user} ${language.soco2} ${user1}`,
			)
			.setImage(
				`${
					config.images.punch[
						Math.floor(Math.random() * config.images.punch.length)
					]
				}`,
			);

		await interaction.reply({
			content: user1.toString(),
			embeds: [embed],
			components: [button],
		});

		const filter = (i) => i.user.id === user1.id;

		const collector = interaction.channel.createMessageComponentCollector({
			filter,
			max: 1,
			time: 300000,
		});

		collector.on('collect', async (i) => {
			if (i.customId === 'return') {
				const embed1 = new Discord.EmbedBuilder()
					.setColor(config.embedColor)
					.setDescription(`${user1} ${language.soco4} ${interaction.user}`)
					.setImage(
						`${
							config.images.punch[
								Math.floor(Math.random() * config.images.punch.length)
							]
						}`,
					);

				await i.reply({
					content: `${interaction.user}`,
					embeds: [embed1],
				});
			}
		});
	},
};
