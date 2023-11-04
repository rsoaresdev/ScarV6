const { SlashCommandBuilder } = require('discord.js');
const sourcebin = require('sourcebin');

async function postToBin(content, title) {
	try {
		const response = await sourcebin.create(
			{
				title,
				description: 'This source bin was created by the Scar bot (scarbot.com). Through the context menu.',
				files: [
					{
						content,
					},
				],
			},
		);
		return {
			url: response.url,
			short: response.short,
			raw: `https://cdn.sourceb.in/bins/${response.key}/0`,
		};
	}
	catch (ex) {
		console.log(ex);
	}
}

module.exports = {
	data: new SlashCommandBuilder()
		.setName('pastebin')
		.setDescription('Paste something in sourceb.in')
		.addStringOption((option) => option
			.setName('title')
			.setDescription('Title for your content')
			.setRequired(true)
			.setMaxLength(512))
		.addStringOption((option) => option
			.setName('content')
			.setDescription('Content to be posted to bin')
			.setRequired(true))
		.setDMPermission(false),

	async execute(interaction, Discord, config, language) {
		const title = interaction.options.getString('title');
		const content = interaction.options.getString('content');

		const response = await postToBin(content, title);

		if (!response) {
			const embed = new Discord.EmbedBuilder()
				.setColor(config.embedColor)
				.setDescription(language.error1);
			return interaction.reply({ embeds: [embed], ephemeral: true });
		}

		const embed = new Discord.EmbedBuilder()
			.setColor(config.embedColor)
			.setAuthor({ name: language.pasteLinks })
			.setDescription(`🔸 ${language.normal} ${response.url}\n🔹 ${language.raw} ${response.raw}`)
			.setFooter({ text: `${language.requestedBy} ${interaction.user.username}` });

		return interaction.reply({ embeds: [embed] });
	},
};
