const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('roleinfo')
		.setDescription('View information about a particular role')
		.addRoleOption((option) => option.setName('role').setDescription('Select a role').setRequired(true))
		.setDMPermission(false),

	async execute(interaction, Discord, config, language) {
		const role = interaction.options.getRole('role');

		const embed = new Discord.EmbedBuilder()
			.setColor(role.hexColor)
			.setTitle(`🔎 ${language.roleInfo1}`)
			.addFields(
				{
					name: `**${language.roleInfo2}**`,
					value: `\`${role.id}\``,
					inline: true,
				},
				{
					name: `**${language.roleInfo3}**`,
					value: `\`${role.name}\``,
					inline: true,
				},
				{
					name: `**${language.roleInfo4}**`,
					value: `\`${role.hexColor}\``,
					inline: true,
				},
				{
					name: `**${language.roleInfo5}**`,
					value: role.mentionable ? `${language.yes}` : `${language.no}`,
					inline: true,
				},
			);

		return interaction.reply({
			embeds: [embed],
		});
	},
};
