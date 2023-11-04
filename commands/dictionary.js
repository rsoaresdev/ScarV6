const { SlashCommandBuilder } = require('discord.js');
const fetch = require('node-fetch');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('dictionary')
		.setDescription('What do you want to look for?')
		.addStringOption((option) => option.setName('query').setDescription('Enter a term').setRequired(true))
		.setDMPermission(false),

	async execute(interaction, Discord, config, language) {
		const query = interaction.options.getString('query');
		const encodedQuery = encodeURIComponent(query);

		try {
			const response = await fetch(`${config.api.dictionary}${encodedQuery}`);
			const data = await response.json();
			const numEntries = data[0]?.meanings?.length || 0;

			if (numEntries === 0) {
				const embed2 = new Discord.EmbedBuilder()
					.setDescription(`${config.emojis.error} ${language.urbandictionary1}`)
					.setColor(config.embedColor);

				return interaction.reply({
					embeds: [embed2],
					ephemeral: true,
				});
			}

			const firstEntry = data[0];
			const sourceUrl = data[0]?.sourceUrls?.[0] ?? null;

			// Pegando a palavra, pronúncia e definições da primeira entrada
			const wordText = firstEntry.word;
			const pronunciation = firstEntry.phonetics[0]?.text;
			const definitions = firstEntry.meanings.map((meaning) => {
				const { partOfSpeech } = meaning;
				const { definition } = meaning.definitions[0];
				return { partOfSpeech, definition };
			});

			// Criando a string do footer
			const footerText = `Dictionary API${
				sourceUrl ? ` ${language.urbandictionary6} ${sourceUrl}` : ''
			}`;

			// Montando as fields do embed
			const fields = [
				{
					name: `${language.urbandictionary5}`,
					value: wordText,
					inline: true,
				},
				{
					name: `${language.urbandictionary4}`,
					value: pronunciation || `${language.urbandictionary3}`,
					inline: true,
				},
			];
			definitions.forEach((definition) => {
				fields.push({
					name: definition.partOfSpeech,
					value: definition.definition,
					inline: false,
				});
			});

			// Enviando a resposta com um embed
			interaction.reply({
				embeds: [
					{
						title: `${language.urbandictionary2}`,
						fields,
						footer: {
							text: footerText,
						},
						color: 0x2b2d31,
					},
				],
			});
		}
		catch (err) {
			console.log(err);
		}
	},
};
