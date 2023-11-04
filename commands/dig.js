const { SlashCommandBuilder } = require('discord.js');
const db = require('discord-mongo-currency.better');
const Schema = require('../models/dig');
const SchemaShop = require('../models/shop');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('dig')
		.setDescription('Mine and make money!')
		.setDMPermission(false),

	async execute(interaction, Discord, config, language) {
		async function boostFunction(amount) {
			const boost = amount * 1.5;
			const newD = new Schema({ time: Date.now(), id: interaction.user.id });
			await newD.save().catch(console.log);

			db.giveCoins(interaction.user.id, interaction.guild.id, boost);

			const text = language.digBoost.replace(/{boost}/g, `${boost - amount}`);

			const embedBoost = new Discord.EmbedBuilder()
				.setColor(config.embedColor)
				.setDescription(
					`${config.emojis.correct} ${language.digWork} \`${boost}\`${config.emojis.scarcoin}`,
				)
				.setFooter({ text });

			interaction.reply({ embeds: [embedBoost] });
		}

		async function newSucessFuncion(amount) {
			const newD = new Schema({ time: Date.now(), id: interaction.user.id });
			await newD.save().catch(console.log);

			db.giveCoins(interaction.user.id, interaction.guild.id, amount);

			const embed7 = new Discord.EmbedBuilder()
				.setColor(config.embedColor)
				.setDescription(
					`${config.emojis.correct} ${language.digWork} \`${amount}\`${config.emojis.scarcoin}`,
				);

			interaction.reply({ embeds: [embed7] });
		}

		function timeoutFunction(data) {
			const embedFail = new Discord.EmbedBuilder()
				.setColor(config.embedColor)
				.setDescription(
					`${config.emojis.error} ${language.digRecent} <t:${Math.round(
						data.time / 1000 + 900,
					)}:R>`,
				);

			interaction.reply({
				embeds: [embedFail],
				ephemeral: true,
			});
		}

		async function sucessFunction(amount, data) {
			data.time = Date.now();
			await data.save();

			db.giveCoins(interaction.user.id, interaction.guild.id, amount);

			const embed9 = new Discord.EmbedBuilder()
				.setColor(config.embedColor)
				.setDescription(
					`${config.emojis.correct} ${language.digWork} \`${amount}\`${config.emojis.scarcoin}`,
				);

			interaction.reply({
				embeds: [embed9],
			});
		}

		async function sucessBoostFunction(data, amount) {
			data.time = Date.now();
			await data.save();

			const boost = amount * 1.5;

			db.giveCoins(interaction.user.id, interaction.guild.id, boost);

			const text = language.digBoost.replace(/{boost}/g, `${boost - amount}`);

			const embed10 = new Discord.EmbedBuilder()
				.setColor(config.embedColor)
				.setDescription(
					`${config.emojis.correct} ${language.digWork} \`${boost}\`${config.emojis.scarcoin}`,
				)
				.setFooter({
					text: `${text}`,
				});

			interaction.reply({
				embeds: [embed10],
			});
		}

		async function failFunction(data) {
			data.time = Date.now();
			await data.save();

			try {
				const dataShop = await SchemaShop.findOne({
					Guild: interaction.guild.id,
					User: interaction.user.id,
				});
				dataShop.Pickaxe = 0;
				await dataShop.save();
				const embedFail = new Discord.EmbedBuilder()
					.setTitle(`${language.digFail}`)
					.setColor(config.embedColor)
					.setDescription(`${config.emojis.error} ${language.digResponse}`);
				return interaction.reply({
					embeds: [embedFail],
				});
			}
			catch (err) {
				console.log(err);
				const embedError = new Discord.EmbedBuilder()
					.setTitle(`Error: ${err.message}`)
					.setColor(config.embedColor);
				return interaction.reply({
					embeds: [embedError],
				});
			}
		}

		const timeout = 900000;
		const amount = Math.floor(Math.random() * (150 - 75) + 75);
		const rand = Math.floor(Math.random() * 2) + 1;

		const invData = await SchemaShop.findOne({
			Guild: interaction.guild.id,
			User: interaction.user.id,
		});

		if (invData?.Pickaxe === 1) {
			const data = await Schema.findOne({ id: interaction.user.id }).exec();
			const isBoostedGuild = [
				'676031545798295553',
				'915533220488036363',
			].includes(interaction.guild.id);

			if (!data) {
				isBoostedGuild ? boostFunction(amount) : newSucessFuncion(amount);
			}
			else if (timeout - (Date.now() - data.time) > 0) {
				timeoutFunction(data);
			}
			else if (rand === 1) {
				failFunction(data);
			}
			else if (isBoostedGuild) {
				sucessBoostFunction(data, amount * 1.5);
			}
			else {
				sucessFunction(amount, data);
			}
		}
		else {
			const noPickake = new Discord.EmbedBuilder()
				.setColor(config.embedColor)
				.setDescription(`${language.noPickake}`);

			return interaction.reply({ embeds: [noPickake], ephemeral: true });
		}
	},
};
