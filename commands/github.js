const { SlashCommandBuilder } = require('discord.js');
const fetch = require('node-fetch');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('github')
		.setDescription('Shows a GitHub profile of a particular user')
		.addStringOption((option) => option
			.setName('user')
			.setDescription('Enter a username')
			.setRequired(true))
		.setDMPermission(false),

	async execute(interaction, Discord, config, language) {
		const name = interaction.options.getString('user');

		const row = new Discord.ActionRowBuilder().addComponents(
			new Discord.ButtonBuilder()
				.setLabel(`🔗 ${language.githubLink}`)
				.setURL(`https://github.com/${name}`)
				.setStyle(Discord.ButtonStyle.Link),
		);

		try {
			const response = await fetch(config.api.github.replace(/{name}/g, name))
				.then((res) => res.json())
				.catch(console.log);

			const embed = new Discord.EmbedBuilder()
				.setColor(config.embedColor)
				.setTitle(`🔎 ${language.githubProfile} ${response.name}`)
				.setThumbnail(response.avatar_url)
				.setDescription(`> ${response.bio ?? `${language.github1}`}`)
				.addFields(
					{
						name: `${language.github2}`,
						value: response.public_repos.toLocaleString(),
						inline: true,
					},
					{
						name: `${language.github3}`,
						value: response.followers.toLocaleString(),
						inline: true,
					},
					{
						name: `${language.github4}`,
						value: response.following.toLocaleString(),
						inline: true,
					},
					{
						name: `${language.github5}`,
						value: response.email ?? `${language.github8}`,
						inline: true,
					},
					{
						name: `${language.github6}`,
						value: response.company ?? `${language.github9}`,
						inline: true,
					},
					{
						name: `${language.github7}`,
						value: response.location ?? `${language.github10}`,
						inline: true,
					},
				);

			interaction.reply({
				embeds: [embed],
				components: [row],
			});
		}
		catch (err) {
			const embed2 = new Discord.EmbedBuilder()
				.setDescription(`${config.emojis.error} ${language.githubUserNotFound}`)
				.setColor(config.embedColor);

			interaction.reply({
				embeds: [embed2],
				ephemeral: true,
			});
		}
	},
};
