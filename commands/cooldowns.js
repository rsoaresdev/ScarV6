const { SlashCommandBuilder } = require('discord.js');
const SchemaDaily = require('../models/daily');
const SchemaWork = require('../models/work');
const SchemaDig = require('../models/dig');
const SchemaCrime = require('../models/crime');
const SchemaRob = require('../models/rob');
const SchemaVote = require('../models/vote');
const SchemaInvest = require('../models/invest');

function getCooldownString(daily, data, language, emojis, cooldown) {
	if (!data) return `${emojis.idle} ${language.cooldown2}`;
	try {
		const time = Math.round((daily ? data.daily : data.time) / 1000 + cooldown);
		if (time < Date.now() / 1000) {
			return `${emojis.online} ${language.cooldown1}`;
		}
		return `${emojis.dnd} <t:${time}:R> (<t:${time}:t>)`;
	}
	catch (err) {
		return `${emojis.idle} ${language.cooldown2}`;
	}
}

module.exports = {
	data: new SlashCommandBuilder()
		.setName('cooldowns')
		.setDescription('Checks the recharging time for the economy commands')
		.setDMPermission(false),

	async execute(interaction, Discord, config, language) {
		await interaction.deferReply();

		// Get data from database
		const [
			dailyData,
			workData,
			digData,
			crimeData,
			robData,
			investData,
			voteData,
		] = await Promise.all([
			SchemaDaily.findOne({ id: interaction.user.id }),
			SchemaWork.findOne({ id: interaction.user.id }),
			SchemaDig.findOne({ id: interaction.user.id }),
			SchemaCrime.findOne({ id: interaction.user.id }),
			SchemaRob.findOne({ id: interaction.user.id }),
			SchemaInvest.findOne({ id: interaction.user.id }),
			SchemaVote.findOne({ id: interaction.user.id }),
		]);

		// actually do the calculations now that we know the results
		const timeRob = getCooldownString(
			false,
			robData,
			language,
			config.emojis,
			900,
		);
		const timeDaily = getCooldownString(
			true,
			dailyData,
			language,
			config.emojis,
			86400,
		);
		const timeWork = getCooldownString(
			false,
			workData,
			language,
			config.emojis,
			60,
		);
		const timeDig = getCooldownString(
			false,
			digData,
			language,
			config.emojis,
			900,
		);
		const timeInvest = getCooldownString(
			false,
			investData,
			language,
			config.emojis,
			3600,
		);
		const timeCrime = getCooldownString(
			false,
			crimeData,
			language,
			config.emojis,
			1800,
		);
		const timeVote = getCooldownString(
			false,
			voteData,
			language,
			config.emojis,
			86400,
		);

		const embed = new Discord.EmbedBuilder()
			.setColor(config.embedColor)
			.setAuthor({
				name: `${interaction.user.username} Cooldowns`,
				iconURL: interaction.user.displayAvatarURL(),
			})
			.addFields(
				{ name: 'Work:', value: `${timeWork}` },
				{ name: 'Daily:', value: `${timeDaily}` },
				{ name: 'Crime:', value: `${timeCrime}` },
				{ name: 'Dig:', value: `${timeDig}` },
				{ name: 'Rob:', value: `${timeRob}` },
				{ name: 'Invest:', value: `${timeInvest}` },
				{ name: 'Vote:', value: `${timeVote}` },
			);

		interaction.editReply({
			embeds: [embed],
		});
	},
};
