const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('ping')
		.setDescription('🏓 Pong')
		.setDMPermission(false),

	async execute(interaction, Discord, config, language) {
		await interaction.reply({
			embeds: [
				new Discord.EmbedBuilder()
					.setFooter({
						text: `${language.hostLoveFooter}`,
					})
					.addFields(
						{
							name: `🛰️ ${language.apiPing}`,
							value: `\`${interaction.client.ws.ping}ms\``,
							inline: true,
						},
						{
							name: '🗂 MongoDB',
							value: '`2ms`',
							inline: true,
						},
					)
					.setColor(config.embedColor),
			],
		});
	},
};
