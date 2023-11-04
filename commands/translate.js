const { SlashCommandBuilder } = require('discord.js');
const { translate: gTranslate } = require('@vitalets/google-translate-api');
const ISO6391 = require('iso-639-1');

async function translate(content, outputCode) {
	try {
		const { text, raw } = await gTranslate(content, { to: outputCode });
		return {
			input: raw.src,
			output: text,
			inputCode: raw.src,
			outputCode,
			inputLang: ISO6391.getName(raw.src),
			outputLang: ISO6391.getName(outputCode),
		};
	}
	catch (ex) {
		console.log(ex);
	}
}

module.exports = {
	data: new SlashCommandBuilder()
		.setName('translate')
		.setDescription('Translate from one language to other')
		.addStringOption((option) => option
			.setName('language')
			.setDescription('Translation language')
			.setRequired(true)
			.addChoices(
				{ name: 'Arabic', value: 'ar' },
				{ name: 'Czech', value: 'cs' },
				{ name: 'German', value: 'de' },
				{ name: 'English', value: 'en' },
				{ name: 'Persian', value: 'fa' },
				{ name: 'French', value: 'fr' },
				{ name: 'Hindi', value: 'hi' },
				{ name: 'Croatian', value: 'hr' },
				{ name: 'Italian', value: 'it' },
				{ name: 'Japanese', value: 'ja' },
				{ name: 'Korean', value: 'ko' },
				{ name: 'Latin', value: 'la' },
				{ name: 'Dutch', value: 'nl' },
				{ name: 'Polish', value: 'pl' },
				{ name: 'Portuguese', value: 'pt' },
				{ name: 'Spanish', value: 'es' },
			))
		.addStringOption((option) => option
			.setName('text')
			.setDescription('The text that requires translation')
			.setRequired(true))
		.setDMPermission(false),

	async execute(interaction, Discord, config, language) {
		const outputCode = interaction.options.getString('language');
		const input = interaction.options.getString('text');

		const data = await translate(input, outputCode);

		if (!data) {
			const embed = new Discord.EmbedBuilder()
				.setColor(config.embedColor)
				.setDescription(language.failToTranslate);

			interaction.reply({ embeds: [embed], ephemeral: true });
		}

		const embed = new Discord.EmbedBuilder()
			.setAuthor({
				name: `${interaction.user.username} says`,
				iconURL: interaction.user.displayAvatarURL(),
			})
			.setColor(config.embedColor)
			.setDescription(data.output)
			.setFooter({ text: `${data.inputLang} (${data.inputCode}) ⟶ ${data.outputLang} (${data.outputCode})` });

		return interaction.reply({ embeds: [embed] });
	},
};
