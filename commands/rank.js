const { SlashCommandBuilder } = require('discord.js');
const Levels = require('discord-xp');
const fetch = require('node-fetch');
const inventory = require('../models/shop');

async function getBuffer(url, options) {
	try {
		const response = options ? await fetch(url, options) : await fetch(url);
		const buffer = await response.buffer();
		return {
			success: response.status === 200,
			status: response.status,
			buffer,
		};
	}
	catch (ex) {
		console.log(ex);
		return {
			success: false,
		};
	}
}

module.exports = {
	data: new SlashCommandBuilder()
		.setName('rank')
		.setDescription('View a member\'s rank')
		.addUserOption((option) => option.setName('user').setDescription('Select a user'))
		.setDMPermission(false),

	async execute(interaction, Discord, config, language) {
		const userDefine = interaction.options.getUser('user') || interaction.user;
		const user = await Levels.fetch(userDefine.id, interaction.guild.id, true);
		const userClaimed = interaction.options.getUser('user') || interaction.user;

		const invData = await inventory.findOne({ Guild: interaction.guild.id, User: userClaimed.id });

		const linkResult = invData
			? config.images.ranks[invData.Inventory.RankCard] || config.images.ranks.null
			: config.images.ranks.null;

		if (user.bot) {
			const errorBot = new Discord.EmbedBuilder().setColor(config.embedColor).setDescription(`${config.emojis.error} ${language.botsXP}`);
			return interaction.reply({ embeds: [errorBot], ephemeral: true });
		}

		const neededXp = Levels.xpFor(parseInt(user.level, 10) + 1);

		const url = new URL('https://strangeapi.fun/api/utils/rank-card');
		url.searchParams.append('avatar', userClaimed.displayAvatarURL({ dynamic: false, extension: 'png' }));
		url.searchParams.append('currentxp', user.xp);
		url.searchParams.append('level', user.level);
		url.searchParams.append('rank', user.position);
		url.searchParams.append('reqxp', neededXp);
		url.searchParams.append('status', 'online');
		url.searchParams.append('barcolor', '#A6B5FC');
		url.searchParams.append('name', userClaimed.username);
		url.searchParams.append('bgImage', linkResult);

		try {
			const response = await getBuffer(url.href, {
				headers: {
					Authorization: `Bearer ${process.env.STRANGE_API_KEY}`,
				},
			});
			if (!response.success) return 'Failed to generate rank-card';

			const attachment = new Discord.AttachmentBuilder(response.buffer, { name: 'rank.png' });
			return interaction.reply({ files: [attachment] });
		}
		catch (err) {
			const embed1 = new Discord.EmbedBuilder().setDescription(`${language.xpKeepGoing}`).setColor(config.embedColor);
			return interaction.reply({ embeds: [embed1], ephemeral: true });
		}
	},
};
