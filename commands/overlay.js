const { SlashCommandBuilder } = require('discord.js');
const fetch = require('node-fetch');

function getOverlay(filter, image) {
	const endpoint = new URL(`https://strangeapi.fun/api/overlays/${filter}`);
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
		.setName('overlay')
		.setDescription('Add overlay over the provided image')
		.addStringOption((option) => option
			.setName('name')
			.setDescription('The type of overlay')
			.setRequired(true)
			.addChoices(
				{ name: 'approved', value: 'approved' },
				{ name: 'brazzers', value: 'brazzers' },
				{ name: 'gay', value: 'gay' },
				{ name: 'halloween', value: 'halloween' },
				{ name: 'rejected', value: 'rejected' },
				{ name: 'thuglife', value: 'thuglife' },
				{ name: 'to-be-continued', value: 'to-be-continued' },
				{ name: 'wasted', value: 'wasted' },
			))
		.addUserOption((option) => option
			.setName('user')
			.setDescription('The user to whose avatar the overlay needs to applied')
			.setRequired(false))
		.addStringOption((option) => option
			.setName('link')
			.setDescription('The image link to which the overlay needs to applied')
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

		const url = getOverlay(filter, image);
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
