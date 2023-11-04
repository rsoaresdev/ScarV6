const { SlashCommandBuilder } = require('discord.js');
const fetch = require('node-fetch');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('meme')
		.setDescription('The hottest memes on reddit!')
		.setDMPermission(false),

	async execute(interaction, Discord, config, language) {
		try {
			const url = await fetch(config.api.redditMemes);
			const random = await url.json();

			const row = new Discord.ActionRowBuilder().addComponents(
				new Discord.ButtonBuilder()
					.setCustomId('meme')
					.setLabel(`${language.memeAgain}`)
					.setStyle(Discord.ButtonStyle.Success),
				new Discord.ButtonBuilder()
					.setLabel(`🔗 ${language.memeLink}`)
					.setURL(
						`https://reddit.com${random[0].data.children[0].data.permalink}`,
					)
					.setStyle(Discord.ButtonStyle.Link),
			);

			const embed = new Discord.EmbedBuilder()
				.setColor(config.embedColor)
				.setImage(random[0].data.children[0].data.url_overridden_by_dest)
				.setFooter({
					text: `👍 ${random[0].data.children[0].data.ups} 💬 ${random[0].data.children[0].data.num_comments}`,
				});

			interaction
				.reply({
					embeds: [embed],
					components: [row],
					fetchReply: true,
				})
				.then((msg) => {
					const filter = (x) => x.isButton() && x.user.id === interaction.user.id;

					const coletor = msg.createMessageComponentCollector({
						filter,
						time: 600000,
					});

					coletor.on('collect', async (collected) => {
						const menu = collected.customId;
						collected.deferUpdate();

						if (menu === 'meme') {
							const urlNew = await fetch(config.api.redditMemes);
							const randomNew = await urlNew.json();

							const rowNew = new Discord.ActionRowBuilder().addComponents(
								new Discord.ButtonBuilder()
									.setCustomId('meme')
									.setLabel(`${language.memeAgain}`)
									.setStyle(Discord.ButtonStyle.Success),
								new Discord.ButtonBuilder()
									.setLabel(`🔗 ${language.memeLink}`)
									.setURL(
										`https://reddit.com${randomNew[0].data.children[0].data.permalink}`,
									)
									.setStyle(Discord.ButtonStyle.Link),
							);

							const embedNew = new Discord.EmbedBuilder()
								.setColor(config.embedColor)
								.setImage(
									randomNew[0].data.children[0].data.url_overridden_by_dest,
								)
								.setFooter({
									text: `👍 ${randomNew[0].data.children[0].data.ups} 💬 ${randomNew[0].data.children[0].data.num_comments}`,
								});

							interaction.editReply({
								embeds: [embedNew],
								components: [rowNew],
							});
						}
					});
				})
				.catch(console.log);
		}
		catch (err) {
			const apiNotAvailable = new Discord.EmbedBuilder()
				.setColor(config.embedColor)
				.setDescription(`${language.apiUnavailable}`);

			return interaction.reply({
				embeds: [apiNotAvailable],
				ephemeral: true,
			});
		}
	},
};
