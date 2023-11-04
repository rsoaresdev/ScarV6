const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');
const Schema = require('../models/reaction-roles');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('rrpanel')
		.setDescription('View the server\'s Reaction Role panel')
		.setDMPermission(false)
		.setDefaultMemberPermissions(PermissionsBitField.Flags.Administrator),

	async execute(interaction, Discord, config, language) {
		try {
			const data = await Schema.findOne({
				Guild: interaction.guild.id,
			});

			if (!data) {
				const embed = new Discord.EmbedBuilder()
					.setColor(config.embedColor)
					.setTitle(`${language.rrNo}`)
					.setDescription(`${language.rr1}`);

				return interaction.reply({
					embeds: [embed],
				});
			}
			const mapped = Object.entries(data.Roles)
				.map(([, value]) => {
					const role = interaction.guild.roles.cache.get(value[0]);
					return `> ${value[1].raw} - ${role}`;
				})
				.join('\n');

			const embedfinal = new Discord.EmbedBuilder()
				.setTitle(`${language.rr2}`)
				.setColor(config.embedColor)
				.setDescription(`${language.rr3}\n\n${mapped}`);

			const message = await interaction.channel.send({
				embeds: [embedfinal],
			});

			data.Message = message.id;
			await data.save();

			const reactions = Object.values(data.Roles).map((val) => val[1].id || val[1].raw);
			reactions.map((emoji) => message.react(emoji));

			const embedRRFinal = new Discord.EmbedBuilder()
				.setColor(config.embedColor)
				.setDescription(`${language.doneRR}`);

			interaction.reply({
				embeds: [embedRRFinal],
				ephemeral: true,
			});
		}
		catch (err) {
			console.log(err);
		}
	},
};
