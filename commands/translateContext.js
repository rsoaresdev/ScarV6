const { ContextMenuCommandBuilder } = require('discord.js');
const { translate: gTranslate } = require('@vitalets/google-translate-api');
const ISO6391 = require('iso-639-1');

async function translate(content) {
	try {
		const { text, raw } = await gTranslate(content, { to: 'en' });
		return {
			input: raw.src,
			output: text,
			inputCode: raw.src,
			outputCode: 'en',
			inputLang: ISO6391.getName(raw.src),
			outputLang: ISO6391.getName('en'),
		};
	}
	catch (ex) {
		console.log(ex);
	}
}

module.exports = {
	data: new ContextMenuCommandBuilder()
		.setName('Translate to English')
		.setType(3)
		.setDMPermission(false),

	async execute(interaction, Discord, config, language) {
		const input = await interaction.targetMessage.toString();
		const data = await translate(input);

		if (!data) {
			const embed = new Discord.EmbedBuilder()
				.setColor(config.embedColor)
				.setDescription(language.failToTranslate);

			interaction.reply({ embeds: [embed], ephemeral: true });
		}

		const embed = new Discord.EmbedBuilder()
			.setAuthor({
				name: `${interaction.user.username} ${language.says}`,
				iconURL: interaction.user.displayAvatarURL(),
			})
			.setColor(config.embedColor)
			.setDescription(data.output)
			.setFooter({ text: `${data.inputLang} (${data.inputCode}) ⟶ ${data.outputLang} (${data.outputCode})` });

		return interaction.reply({ embeds: [embed] });
	},
};
