const { SlashCommandBuilder } = require('discord.js');
const db = require('discord-mongo-currency.better');
const Levels = require('discord-xp');
const fetch = require('node-fetch');
const Schema = require('../models/vote');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('votereward')
		.setDescription('Receives the voting reward')
		.setDMPermission(false),

	async execute(interaction, Discord, config, language) {
		const timeout = 86400000;

		const flag = await fetch(
			`https://top.gg/api/bots/915532683847815198/check?userId=${interaction.user.id}`,
			{
				headers: {
					'Content-Type': 'application/json',
					Authorization: process.env.TOPGG,
				},
			},
		);
		const dataFetch = await flag.json();

		const row = new Discord.ActionRowBuilder().addComponents(
			new Discord.ButtonBuilder()
				.setLabel(`🔗 ${language.vote}`)
				.setURL(config.links.vote)
				.setStyle(Discord.ButtonStyle.Link),
		);

		try {
			const data = await Schema.findOne({
				id: interaction.user.id,
			});

			if (!data) {
				if (dataFetch.voted === 0) {
					const fail = new Discord.EmbedBuilder()
						.setColor('F7370E')
						.setTitle(`${language.vote1}`)
						.setDescription(
							`${language.vote2
								.replace(/{user}/g, `${interaction.user}`)
								.replace(/{vote}/g, `${config.links.vote}`)}`,
						);

					interaction.reply({
						embeds: [fail],
						ephemeral: true,
						components: [row],
					});
				}
				else if (dataFetch.voted === 1) {
					const sucess = new Discord.EmbedBuilder()
						.setColor('0EF755')
						.setTitle(`${language.vote1}`)
						.setDescription(
							`${language.vote3
								.replace(/{user}/g, `${interaction.user}`)
								.replace(/{coin}/g, `${config.emojis.scarcoin}`)
								.replace(/{heart}/g, `${config.emojis.robotHeart}`)}`,
						);

					interaction.reply({
						embeds: [sucess],
						components: [row],
					});

					const newD = new Schema({
						time: Date.now(),
						id: interaction.user.id,
					});
					await newD.save().catch(console.log);

					db.giveCoins(interaction.user.id, interaction.guild.id, 2000);
					Levels.appendXp(interaction.user.id, interaction.guild.id, 100);
				}
				else {
					const api = new Discord.EmbedBuilder()
						.setColor(config.embedColor)
						.setDescription(`${language.apiUnavailable}`);

					interaction.reply({
						embeds: [api],
						ephemeral: true,
					});
				}
			}
			else if (timeout - (Date.now() - data.time) > 0) {
				const timeoutEmbed = new Discord.EmbedBuilder()
					.setColor(config.embedColor)
					.setDescription(
						`${language.vote4} <t:${Math.round(
							data.time / 1000 + 86400,
						)}:R>`,
					);
				return interaction.reply({
					embeds: [timeoutEmbed],
					ephemeral: true,
				});
			}
			else if (dataFetch.voted === 0) {
				const fail = new Discord.EmbedBuilder()
					.setColor('F7370E')
					.setTitle(`${language.vote1}`)
					.setDescription(
						`${language.vote2
							.replace(/{user}/g, `${interaction.user}`)
							.replace(/{vote}/g, `${config.links.vote}`)}`,
					);

				interaction.reply({
					embeds: [fail],
					ephemeral: true,
					components: [row],
				});
			}
			else if (dataFetch.voted === 1) {
				const sucess = new Discord.EmbedBuilder()
					.setColor('0EF755')
					.setTitle(`${language.vote1}`)
					.setDescription(
						`${language.vote3
							.replace(/{user}/g, `${interaction.user}`)
							.replace(/{coin}/g, `${config.emojis.scarcoin}`)
							.replace(/{heart}/g, `${config.emojis.robotHeart}`)}`,
					);

				interaction.reply({
					embeds: [sucess],
					components: [row],
				});

				data.time = Date.now();
				data.save().catch(console.log);

				db.giveCoins(interaction.user.id, interaction.guild.id, 2000);
				Levels.appendXp(interaction.user.id, interaction.guild.id, 100);
			}
			else {
				const api = new Discord.EmbedBuilder()
					.setColor(config.embedColor)
					.setDescription(`${language.apiUnavailable}`);

				interaction.reply({
					embeds: [api],
					ephemeral: true,
				});
			}
		}
		catch (err) {
			console.log(err);
		}
	},
};
