const { SlashCommandBuilder } = require('discord.js');
const languageSchema = require('../models/language');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('serverinfo')
		.setDescription('View information about the current server')
		.setDMPermission(false),

	async execute(interaction, Discord, config, language) {
		const guildDB = await languageSchema.findOne({
			_id: interaction.guild.id,
		});

		const textChans = await interaction.guild.channels.cache.filter(
			(x) => x.type === Discord.ChannelType.GuildText,
		).size;
		const voiceChans = await interaction.guild.channels.cache.filter(
			(x) => x.type === Discord.ChannelType.GuildVoice,
		).size;
		const catCount = await interaction.guild.channels.cache.filter(
			(x) => x.type === Discord.ChannelType.GuildCategory,
		).size;
		const roleCount = await interaction.guild.roles.cache.size;
		const members = await interaction.guild.members.fetch();

		const embed = new Discord.EmbedBuilder()
			.setTitle(`${interaction.guild.name}`)
			.setThumbnail(
				interaction.guild.iconURL({
					animated: true,
					size: 4096,
				}),
			)
			.setImage(
				interaction.guild.bannerURL({
					size: 1024,
				}),
			)
			.setColor(config.embedColor)
			.setDescription(
				`**ID:** \`${interaction.guild.id}\`\n**${language.serverInfo21}:** ${
					guildDB
						? guildDB.language
							.replace(/english/g, '`(EN) English`')
							.replace(/portuguese/g, '`(PT) Português`')
							.replace(/spanish/g, '`(ES) Español`')
							.replace(/french/g, '`(FR) Français`')
						: '`(EN) English`'
				}\n**${language.serverInfo10}:** <@${interaction.guild.ownerId}>\n**${
					language.serverInfo11
				}:** <t:${Math.round(
					interaction.guild.createdAt / 1000,
				)}:f> (<t:${Math.round(interaction.guild.createdAt / 1000)}:R>)`,
			)
			.addFields(
				{
					name: `**${language.serverInfo5}**`,
					value: `> ${language.serverInfo6} ${
						interaction.guild.memberCount
					}\n> ${language.serverInfo8} ${
						members.filter((m) => !m.user.bot).size
					}\n> ${language.serverInfo9} ${
						members.filter((m) => m.user.bot).size
					} (${Math.round(
						(members.filter((m) => m.user.bot).size
              / interaction.guild.memberCount)
              * 100,
					).toFixed(1)}%)`,
					inline: true,
				},
				{
					name: `**${language.serverInfo12}**`,
					value: `> ${language.serverInfo16} ${catCount}\n> ${language.serverInfo14} ${textChans}\n> ${language.serverInfo15} ${voiceChans}`,
					inline: true,
				},
				{
					name: `**${language.serverInfo17}**`,
					value: `> ${roleCount}`,
					inline: true,
				},
				{
					name: `**${language.serverInfo19}**`,
					value: `> ${language.serverInfo20} ${
						interaction.guild.premiumSubscriptionCount || 0
					}`,
					inline: true,
				},
			);

		interaction.reply({
			embeds: [embed],
		});
	},
};
