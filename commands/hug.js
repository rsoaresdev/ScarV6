const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('hug')
		.setDescription('Hug a member')
		.addUserOption((option) => option
			.setName('user')
			.setDescription('Select a user to hug')
			.setRequired(true))
		.setDMPermission(false),

	async execute(interaction, Discord, config, language) {
		const user1 = interaction.options.getUser('user');

		const button = new Discord.ActionRowBuilder().addComponents(
			new Discord.ButtonBuilder()
				.setCustomId('return')
				.setLabel(`${language.hug2}`)
				.setStyle(Discord.ButtonStyle.Secondary),
		);
		const embed = new Discord.EmbedBuilder()
			.setColor(config.embedColor)
			.setDescription(
				`${config.emojis.robotHeart} ${interaction.user} ${language.hug1} ${user1}`,
			)
			.setImage(
				`${
					config.images.hug[
						Math.floor(Math.random() * config.images.hug.length)
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
				const embedReturn = new Discord.EmbedBuilder()
					.setColor(config.embedColor)
					.setDescription(
						`${config.emojis.robotHeart} ${user1} ${language.hug3} ${interaction.user}`,
					)
					.setImage(
						`${
							config.images.hug[
								Math.floor(Math.random() * config.images.hug.length)
							]
						}`,
					);

				await i.update({
					content: interaction.user.toString(),
					embeds: [embedReturn],
					components: [],
				});
			}
		});
	},
};
