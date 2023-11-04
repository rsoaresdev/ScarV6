const { ContextMenuCommandBuilder } = require('discord.js');
const sourcebin = require('sourcebin');

async function postToBin(content) {
	try {
		const response = await sourcebin.create(
			{
				title: 'Paste from DiscordMessage',
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
	data: new ContextMenuCommandBuilder()
		.setName('Post to sourceb.in')
		.setType(3)
		.setDMPermission(false),

	async execute(interaction, Discord, config, language) {
		const messageContent = await interaction.targetMessage.toString().replace(/```js/g, '').replace(/```py/g, '').replace(/```/g, '');

		const response = await postToBin(messageContent);

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
