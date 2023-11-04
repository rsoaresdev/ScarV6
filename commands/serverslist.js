const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('serverslist')
		.setDescription('Displays the list with all servers the bot is on')
		.setDMPermission(false),

	async execute(interaction, Discord, config, language) {
		if (interaction.user.id !== config.ownerId) {
			const embed1 = new Discord.EmbedBuilder()
				.setDescription(`${config.emojis.owner} ${language.commandOwnerBot}`)
				.setColor(config.embedColor);
			return interaction.reply({
				embeds: [embed1],
				ephemeral: true,
			});
		}

		let i0 = 0;
		let i1 = 5;
		let page = 1;

		let description = interaction.client.guilds.cache
			.sort((a, b) => b.memberCount - a.memberCount)
			.map((r) => r)
			.map(
				(r) => `> **Nome:** ${r.name}\n> **Membros:** ${r.memberCount}\n> **ID:** \`${r.id}\`\n> **Dono:** \`${r.ownerId}\``,
			)
			.slice(i0, i1)
			.join('\n\n');

		const embed = new Discord.EmbedBuilder()
			.setAuthor({
				name: interaction.client.user.username,
				iconURL: interaction.client.user.displayAvatarURL(),
			})
			.setColor(config.embedColor)
			.setFooter({
				text: `Página: ${page} de ${Math.ceil(
					interaction.client.guilds.cache.size / 5,
				)} • Servidores totais: ${interaction.client.guilds.cache.size}`,
			})
			.setTitle('Lista de servidores')
			.setDescription(description);

		const row = new Discord.ActionRowBuilder().addComponents(
			new Discord.ButtonBuilder()
				.setCustomId('previous')
				.setEmoji('⬅️')
				.setStyle(Discord.ButtonStyle.Primary),
			new Discord.ButtonBuilder()
				.setCustomId('home')
				.setEmoji('🏠')
				.setStyle(Discord.ButtonStyle.Secondary),
			new Discord.ButtonBuilder()
				.setCustomId('next')
				.setEmoji('➡️')
				.setStyle(Discord.ButtonStyle.Primary),
		);

		const rowDisabled = new Discord.ActionRowBuilder().addComponents(
			new Discord.ButtonBuilder()
				.setCustomId('previous')
				.setEmoji('⬅️')
				.setStyle(Discord.ButtonStyle.Primary)
				.setDisabled(true),
			new Discord.ButtonBuilder()
				.setCustomId('home')
				.setEmoji('🏠')
				.setStyle(Discord.ButtonStyle.Secondary),
			new Discord.ButtonBuilder()
				.setCustomId('next')
				.setEmoji('➡️')
				.setStyle(Discord.ButtonStyle.Primary)
				.setDisabled(true),
		);

		await interaction
			.reply({
				embeds: [embed],
				components: [row],
				ephemeral: true,
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

					if (menu === 'previous') {
						// Updates variables
						i0 -= 5;
						i1 -= 5;
						page -= 1;

						// if there is no guild to display, delete the message
						if (i0 < 0) {
							return interaction.editReply({
								embeds: [
									new Discord.EmbedBuilder()
										.setColor(config.embedColor)
										.setDescription('Não há mais páginas!'),
								],
								ephemeral: true,
								components: [rowDisabled],
							});
						}
						if (i0 === undefined || i1 === undefined) {
							return interaction.editReply({
								embeds: [
									new Discord.EmbedBuilder()
										.setColor(config.embedColor)
										.setDescription('Não há mais páginas!'),
								],
								ephemeral: true,
								components: [rowDisabled],
							});
						}

						description = interaction.client.guilds.cache
							.sort((a, b) => b.memberCount - a.memberCount)
							.map((r) => r)
							.map(
								(r) => `> **Nome:** ${r.name}\n> **ID:** ${r.id}\n> **Membros:** ${r.memberCount}\n> **Dono:** ${r.ownerId}`,
							)
							.slice(i0, i1)
							.join('\n\n');

						// Update the embed with new informations
						embed
							.setFooter({
								text: `Página: ${page} de ${Math.ceil(
									interaction.client.guilds.cache.size / 5,
								)} • Servidores totais: ${
									interaction.client.guilds.cache.size
								}`,
							})
							.setDescription(description);

						// Edit the message
						interaction.editReply({
							embeds: [embed],
							ephemeral: true,
						});
					}

					if (menu === 'next') {
						// Updates variables
						i0 += 5;
						i1 += 5;
						page += 1;

						// if there is no guild to display, delete the message
						if (i1 > interaction.client.guilds.cache.size + 5) {
							return interaction.editReply({
								embeds: [
									new Discord.EmbedBuilder()
										.setColor(config.embedColor)
										.setDescription('Não há mais páginas!'),
								],
								ephemeral: true,
								components: [rowDisabled],
							});
						}
						if (i0 === undefined || i1 === undefined) {
							return interaction.editReply({
								embeds: [
									new Discord.EmbedBuilder()
										.setColor(config.embedColor)
										.setDescription('Não há mais páginas!'),
								],
								ephemeral: true,
								components: [rowDisabled],
							});
						}

						description = interaction.client.guilds.cache
							.sort((a, b) => b.memberCount - a.memberCount)
							.map((r) => r)
							.map(
								(r) => `> **Nome:** ${r.name}\n> **ID:** ${r.id}\n> **Membros:** ${r.memberCount}\n> **Dono:** ${r.ownerId}`,
							)
							.slice(i0, i1)
							.join('\n\n');

						// Update the embed with new informations
						embed
							.setFooter({
								text: `Página: ${page} de ${Math.ceil(
									interaction.client.guilds.cache.size / 5,
								)} • Servidores totais: ${
									interaction.client.guilds.cache.size
								}`,
							})
							.setDescription(description);

						// Edit the message
						interaction.editReply({
							embeds: [embed],
							ephemeral: true,
						});
					}

					if (menu === 'home') {
						// Updates variables
						i0 = 0;
						i1 = 5;
						page = 1;

						description = interaction.client.guilds.cache
							.sort((a, b) => b.memberCount - a.memberCount)
							.map((r) => r)
							.map(
								(r) => `> **Nome:** ${r.name}\n> **ID:** ${r.id}\n> **Membros:** ${r.memberCount}\n> **Dono:** ${r.ownerId}`,
							)
							.slice(i0, i1)
							.join('\n\n');

						// Update the embed with new informations
						embed
							.setFooter({
								text: `Página: ${page} de ${Math.ceil(
									interaction.client.guilds.cache.size / 5,
								)} • Servidores totais: ${
									interaction.client.guilds.cache.size
								}`,
							})
							.setDescription(description);

						// Edit the message
						interaction.editReply({
							embeds: [embed],
							ephemeral: true,
							components: [row],
						});
					}
				});
			})
			.catch(console.log);
	},
};
