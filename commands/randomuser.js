const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('randomuser')
		.setDescription('Choose a random user')
		.setDMPermission(false)
		.setDefaultMemberPermissions(PermissionsBitField.Flags.ManageMessages),

	async execute(interaction, Discord, config, language) {
		const randomPer = interaction.guild.members.cache.random().user;

		const random = new Discord.EmbedBuilder()
			.setTitle(`${language.randomMember}`)
			.setDescription(
				`> ${config.emojis.members} ${language.randomMember1}\n> ${randomPer}`,
			)
			.setColor(config.embedColor);
		interaction.reply({
			embeds: [random],
		});
	},
};
