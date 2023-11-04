const { SlashCommandBuilder } = require('discord.js');
const fetch = require('node-fetch');

function getGenerator(filter, image) {
	const endpoint = new URL(`https://strangeapi.fun/api/generators/${filter}`);
	endpoint.searchParams.append('image', image);
	return endpoint.href;
}

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
		.setName('generate')
		.setDescription('Generates a meme for the provided image')
		.addStringOption((option) => option
			.setName('name')
			.setDescription('The type of overlay')
			.setRequired(true)
			.addChoices(
				{ name: 'ad', value: 'ad' },
				{ name: 'affect', value: 'affect' },
				{ name: 'beautiful', value: 'beautiful' },
				{ name: 'bobross', value: 'bobross' },
				{ name: 'challenger', value: 'challenger' },
				{ name: 'confusedstonk', value: 'confusedstonk' },
				{ name: 'delete', value: 'delete' },
				{ name: 'dexter', value: 'dexter' },
				{ name: 'facepalm', value: 'facepalm' },
				{ name: 'jail', value: 'jail' },
				{ name: 'jokeoverhead', value: 'jokeoverhead' },
				{ name: 'karaba', value: 'karaba' },
				{ name: 'kyon-gun', value: 'kyon-gun' },
				{ name: 'mms', value: 'mms' },
				{ name: 'notstonk', value: 'notstonk' },
				{ name: 'rip', value: 'rip' },
				{ name: 'stonk', value: 'stonk' },
				{ name: 'tattoo', value: 'tattoo' },
				{ name: 'thomas', value: 'thomas' },
				{ name: 'trash', value: 'trash' },
				{ name: 'wanted', value: 'wanted' },
				{ name: 'worthless', value: 'worthless' },
			))
		.addUserOption((option) => option
			.setName('user')
			.setDescription('The user to whose avatar the generator needs to applied')
			.setRequired(false))
		.addStringOption((option) => option
			.setName('link')
			.setDescription('The image link to which the generator needs to applied')
			.setRequired(false))
		.setDMPermission(false),

	async execute(interaction, Discord, config, language) {
		const author = interaction.user;
		const user = interaction.options.getUser('user');
		const imageLink = interaction.options.getString('link');
		const filter = interaction.options.getString('name');

		let image;
		if (user) image = user.displayAvatarURL({ size: 256, extension: 'png' });
		if (!image && imageLink) image = imageLink;
		if (!image) {
			image = author.displayAvatarURL({ size: 256, extension: 'png' });
		}

		const url = getGenerator(filter, image);
		const response = await getBuffer(url, {
			headers: {
				Authorization: `Bearer ${process.env.STRANGE_API_KEY}`,
			},
		});

		if (!response.success) {
			const embed = new Discord.EmbedBuilder()
				.setColor(config.embedColor)
				.setDescription(language.catError);

			return interaction.reply({ embeds: [embed], ephemeral: true });
		}

		const attachment = new Discord.AttachmentBuilder(response.buffer, {
			name: 'attachment.png',
		});
		const embed = new Discord.EmbedBuilder()
			.setColor(config.embedColor)
			.setImage('attachment://attachment.png')
			.setFooter({ text: `${language.requestedBy} ${author.username}` });

		await interaction.reply({ embeds: [embed], files: [attachment] });
	},
};
