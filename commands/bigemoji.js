const { SlashCommandBuilder } = require('discord.js');
const { parse } = require('twemoji-parser');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('bigemoji')
		.setDescription('Enlarge an emoji')
		.addStringOption((option) => option
			.setName('emoji')
			.setDescription('Emoji to enlarge')
			.setRequired(true))
		.setDMPermission(false),

	async execute(interaction, Discord, config, language) {
		const emoji = interaction.options.getString('emoji');

		const custom = Discord.parseEmoji(emoji);

		const embed = new Discord.EmbedBuilder()
			.setAuthor({ name: language.bigEmoji })
			.setColor(config.embedColor)
			.setFooter({ text: `${language.requestedBy} ${interaction.user.username}` });

		if (custom.id) {
			embed.setImage(`https://cdn.discordapp.com/emojis/${custom.id}.${custom.animated ? 'gif' : 'png'}`);
			return { embeds: [embed] };
		}
		const parsed = parse(emoji, { assetType: 'png' });
		if (!parsed[0]) return 'Not a valid emoji';

		if (!parsed[0]) {
			const embed1 = new Discord.EmbedBuilder()
				.setDescription(language.githubError)
				.setColor(config.embedColor);

			return interaction.reply({ embeds: [embed1], ephemeral: true });
		}

		embed.setImage(parsed[0].url);
		return interaction.reply({ embeds: [embed] });
	},
};
