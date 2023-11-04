const { SlashCommandBuilder } = require('discord.js');
const fetch = require('node-fetch');

function generateEmbed(type, language, config, data, Discord) {
	const returnEmbed = new Discord.EmbedBuilder()
		.setTitle(
			type === 'world'
				? `${language.covidWorld}`
				: `${language.covidCountry} ${data.country}`,
		)
		.setColor(config.embedColor)
		.setThumbnail(
			type === 'world' ? config.images.world : data.countryInfo.flag,
		)
		.addFields(
			{
				name: `${language.totalCasos}`,
				value: data.cases.toLocaleString(),
				inline: true,
			},
			{
				name: `${language.casosHoje}`,
				value: data.todayCases.toLocaleString(),
				inline: true,
			},
			{
				name: `${language.mortesHoje}`,
				value: data.todayDeaths.toLocaleString(),
				inline: true,
			},
			{
				name: `${language.casosAtivos}`,
				value: `${data.active.toLocaleString()} (${(
					(data.active / data.cases)
          * 100
				).toFixed(2)}%)`,
				inline: true,
			},
			{
				name: `${language.recuperados}`,
				value: `${data.recovered.toLocaleString()} (${(
					(data.recovered / data.cases)
          * 100
				).toFixed(2)}%)`,
				inline: true,
			},
			{
				name: `${language.mortesTotal}`,
				value: `${data.deaths.toLocaleString()} (${(
					(data.deaths / data.cases)
          * 100
				).toFixed(2)}%)`,
				inline: true,
			},
			{
				name: `${language.testes}`,
				value: `${data.tests.toLocaleString()}`,
				inline: true,
			},
			{
				name: `${language.casos1000hab}`,
				value: `${data.casesPerOneMillion.toLocaleString()}`,
				inline: true,
			},
			{
				name: `${language.mortes1000hab}`,
				value: `${data.deathsPerOneMillion.toLocaleString()}`,
				inline: true,
			},
		)
		.setFooter({
			text: `${language.lastUpdate}`,
		})
		.setTimestamp(data.updated);
	return returnEmbed;
}

module.exports = {
	data: new SlashCommandBuilder()
		.setName('covid')
		.setDescription(
			'Shows the status of COVID-19 in a given country or in the world',
		)
		.addSubcommand((subcommand) => subcommand
			.setName('world')
			.setDescription('Shows the status of COVID-19 worldwide'))
		.addSubcommand((subcommand) => subcommand
			.setName('country')
			.setDescription('Shows the status of COVID-19 in a specific country')
			.addStringOption((option) => option
				.setName('name')
				.setDescription('Indicates the name of the country to search')
				.setRequired(true)))
		.setDMPermission(false),

	async execute(interaction, Discord, config, language) {
		async function getWorldStats() {
			try {
				const body = await fetch(config.api.covidAll);
				const data = await body.json();
				return data;
			}
			catch (error) {
				console.log(error);
				return null;
			}
		}

		async function getCountryStats(country) {
			try {
				const body = await fetch(
					config.api.covidCountry.replace(/{country}/g, country),
				);
				const data = await body.json();
				return data;
			}
			catch (error) {
				console.log(error);
				return null;
			}
		}

		if (interaction.options.getSubcommand() === 'world') {
			try {
				const data = await getWorldStats();
				const embed = generateEmbed('world', language, config, data, Discord);
				return interaction.reply({ embeds: [embed] });
			}
			catch (err) {
				console.log(err);
				const embed = new Discord.EmbedBuilder()
					.setDescription(`${config.emojis.error} ${language.contryNotFound}`)
					.setColor(config.embedColor);
				return interaction.reply({ embeds: [embed], ephemeral: true });
			}
		}

		if (interaction.options.getSubcommand() === 'country') {
			const country = interaction.options.getString('name');

			try {
				const data = await getCountryStats(country);
				const embed = generateEmbed('country', language, config, data, Discord);
				return interaction.reply({ embeds: [embed] });
			}
			catch (err) {
				console.log(err);
				const embed = new Discord.EmbedBuilder()
					.setDescription(`${config.emojis.error} ${language.contryNotFound}`)
					.setColor(config.embedColor);
				return interaction.reply({ embeds: [embed], ephemeral: true });
			}
		}
	},
};
