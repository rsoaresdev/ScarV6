const { SlashCommandBuilder } = require('discord.js');
const fetch = require('node-fetch');

const additionalParams = {
	brighten: {
		params: [{ name: 'amount', value: '100' }],
	},
	darken: {
		params: [{ name: 'amount', value: '100' }],
	},
	distort: {
		params: [{ name: 'level', value: '10' }],
	},
	pixelate: {
		params: [{ name: 'pixels', value: '10' }],
	},
	sharpen: {
		params: [{ name: 'level', value: '5' }],
	},
	threshold: {
		params: [{ name: 'amount', value: '100' }],
	},
};

function getFilter(filter, image) {
	const endpoint = new URL(`https://strangeapi.fun/api/filters/${filter}`);
	endpoint.searchParams.append('image', image);

	// add additional params if any
	if (additionalParams[filter]) {
		additionalParams[filter].params.forEach((param) => {
			endpoint.searchParams.append(param.name, param.value);
		});
	}

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
		.setName('filter')
		.setDescription('Add filter to the provided image')
		.addStringOption((option) => option
			.setName('name')
			.setDescription('The type of overlay')
			.setRequired(true)
			.addChoices(
				{ name: 'blur', value: 'blur' },
				{ name: 'brighten', value: 'brighten' },
				{ name: 'burn', value: 'burn' },
				{ name: 'darken', value: 'darken' },
				{ name: 'distort', value: 'distort' },
				{ name: 'greyscale', value: 'greyscale' },
				{ name: 'invert', value: 'invert' },
				{ name: 'pixelate', value: 'pixelate' },
				{ name: 'sepia', value: 'sepia' },
				{ name: 'sharpen', value: 'sharpen' },
				{ name: 'threshold', value: 'threshold' },
			))
		.addUserOption((option) => option
			.setName('user')
			.setDescription('The user to whose avatar the filter needs to applied')
			.setRequired(false))
		.addStringOption((option) => option
			.setName('link')
			.setDescription('The image link to which the filter needs to applied')
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

		const url = getFilter(filter, image);
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
