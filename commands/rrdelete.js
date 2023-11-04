const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');
const Schema = require('../models/reaction-roles');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('rrdelete')
		.setDescription('Delete the panel of Reaction Roles')
		.setDMPermission(false)
		.setDefaultMemberPermissions(PermissionsBitField.Flags.Administrator),

	async execute(interaction, Discord, config, language) {
		const confirm = new Discord.ActionRowBuilder().addComponents(
			new Discord.ButtonBuilder()
				.setLabel(`${language.yes}`)
				.setCustomId('sim')
				.setStyle(Discord.ButtonStyle.Success),
			new Discord.ButtonBuilder()
				.setLabel(`${language.no}`)
				.setCustomId('nao')
				.setStyle(Discord.ButtonStyle.Danger),
		);

		const embedFinal = new Discord.EmbedBuilder()
			.setColor(config.embedColor)
			.setDescription(`⚠️ ${language.rrConfirm}`);

		interaction
			.reply({
				embeds: [embedFinal],
				ephemeral: true,
				components: [confirm],
				fetchReply: true,
			})
			.then((msg) => {
				const filter = (x) => x.isButton() && x.user.id === interaction.user.id;

				const coletor = msg.createMessageComponentCollector({
					filter,
					time: 60000,
				});

				coletor.on('collect', async (collected) => {
					const menu = collected.customId;
					collected.deferUpdate();

					if (menu === 'sim') {
						try {
							const data = await Schema.findOneAndDelete({
								Guild: interaction.guild.id,
							});

							console.log(data);
							if (data) {
								const embed1 = new Discord.EmbedBuilder()
									.setDescription(
										`${config.emojis.correct} ${language.rrDelete}`,
									)
									.setColor(config.embedColor);

								return interaction.followUp({
									embeds: [embed1],
									ephemeral: true,
								});
							}
							const embed2 = new Discord.EmbedBuilder()
								.setDescription(
									`${config.emojis.error} ${language.rrNotFound}`,
								)
								.setColor(config.embedColor);
							return interaction.followUp({
								embeds: [embed2],
								ephemeral: true,
							});
						}
						catch (err) {
							console.log(err);
						}
					}

					if (menu === 'nao') {
						const embedNo = new Discord.EmbedBuilder()
							.setColor(config.embedColor)
							.setDescription(`${config.emojis.correct} ${language.rrStop}`);

						interaction.followUp({
							embeds: [embedNo],
							ephemeral: true,
						});
					}
				});
			})
			.catch(console.log);
	},
};
