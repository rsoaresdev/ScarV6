const Discord = require('discord.js');
const Levels = require('discord-xp');
const config = require('../config.json');

const InviteShema = require('../models/invite');
const afkShema = require('../models/afk');
const languageSchema = require('../models/language');
const LevelShema = require('../models/levelup');

async function delay(ms) {
	return new Promise((resolve) => {
		setTimeout(resolve, ms);
	});
}

module.exports = {
	name: Discord.Events.MessageCreate,
	async execute(message) {
		if (message.channel.type === Discord.ChannelType.DM) return; // Check if the message is in a DM
		if (message.author.bot) return; // Check if the message author isn't a bot

		// Afk Module
		try {
			const data = await afkShema.findOne({
				userID: message.author.id,
				serverID: message.guild.id,
			});

			if (data) {
				const guildDB = await languageSchema.findOne({
					_id: message.guild.id,
				});

				const language = require(`../language/${
					guildDB?.language || 'english'
				}.json`);

				if (
					message.guild.members.me.permissions.has(
						Discord.PermissionsBitField.Flags.ManageNicknames,
					)
          && message.author.id !== message.guild.ownerId
				) {
					message.member.setNickname(data.oldNickname);
				}

				const embed2 = new Discord.EmbedBuilder()
					.setColor(config.embedColor)
					.setTitle(`💤 ${language.msc1}`)
					.setDescription(`${language.msc2}`);

				// Send the message
				message.channel
					.send({
						embeds: [embed2],
					})
					.then(async (msg) => {
						await delay(5000);
						msg.delete();
					})
					.catch(console.log);

				// Remove the member's AFK
				await data.deleteOne();
			}
		}
		catch (err) {
			console.log(err);
		}

		// Check if the mentioned member has AFK enabled
		if (message.mentions.members.first()) {
			if (message.mentions.members.first().id === message.author.id) return;

			try {
				const data = await afkShema.findOne({
					userID: message.mentions.members.first().id,
					serverID: message.guild.id,
				});

				if (data) {
					const guildDB = await languageSchema.findOne({
						_id: message.guild.id,
					});

					const language = require(`../language/${
						guildDB?.language || 'english'
					}.json`);

					// Search for the member on the server
					await message.guild.members
						.fetch(data.userID)
						.then((member) => {
							const embed1 = new Discord.EmbedBuilder()
								.setColor(config.embedColor)
								.setDescription(`<@${member.user.id}> ${language.msc3}`);

							if (data.reason) {
								embed1.addFields({
									name: language.banField5,
									value: data.reason,
									inline: false,
								});
							}
							// Send the message
							return message.channel
								.send({
									embeds: [embed1],
								})
								.then(async (msg) => {
									await delay(5000);
									msg.delete();
								});
						})
						.catch(console.log);
				}
			}
			catch (err) {
				console.log(err);
			}
		}

		if (message.content === `<@${message.guild.members.me.id}>`) {
			const guildDB = await languageSchema.findOne({
				_id: message.guild.id,
			});

			const language = require(`../language/${
				guildDB?.language || 'english'
			}.json`);

			const row = new Discord.ActionRowBuilder().addComponents(
				new Discord.ButtonBuilder()
					.setLabel(`${language.msc7}`)
					.setURL(config.links.addBot)
					.setStyle(Discord.ButtonStyle.Link),
				new Discord.ButtonBuilder()
					.setLabel(`${language.msc9}`)
					.setURL(config.links.website)
					.setStyle(Discord.ButtonStyle.Link),
			);

			// Create embed
			const mentionEmbed = new Discord.EmbedBuilder()
				.setColor(config.embedColor)
				.setDescription(`${language.msc10}`);

			message.channel.send({
				embeds: [mentionEmbed],
				components: [row],
			});
		}

		// Verify if the server has the anti-invite system activated
		try {
			const data = await InviteShema.findOne({ guildId: message.guild.id });
			if (data) {
				const guildDB = await languageSchema.findOne({
					_id: message.guild.id,
				});

				const language = require(`../language/${
					guildDB?.language || 'english'
				}.json`);

				if (
					message.member.permissions.has(
						Discord.PermissionsBitField.Flags.Administrator,
					)
				) {
					return;
				}

				// Check if the message content includes any links in the regex
				if (
					message.content.match(
						/(https?:\/\/)?(www\.)?(discord\.(gg|io|me|li)|discordapp\.com\/invite)\/.+[a-z]/g,
					)
				) {
					// Delete message
					message.delete();

					// Create embed
					const embedDeny = new Discord.EmbedBuilder()
						.setTitle(`${language.msc5}`)
						.setDescription(`${language.msc6}\n> || \`${message.content}\` ||`)
						.setColor(config.embedColor);

					// Send DM to user
					message.author.send({ embeds: [embedDeny] }).catch(() => {});
				}
			}
		}
		catch (err) {
			console.log(err);
		}

		// Assign XP to the user
		const hasLeveledUp = await Levels.appendXp(
			message.author.id,
			message.guild.id,
			Number.parseInt(2, 10),
		);
		// Check if the member has leveled up
		if (hasLeveledUp) {
			try {
				const data = await LevelShema.findOne({ guildId: message.guild.id });

				if (data) {
					const guildDB = await languageSchema.findOne({
						_id: message.guild.id,
					});

					const language = require(`../language/${
						guildDB?.language || 'english'
					}.json`);

					// Get data
					const user = await Levels.fetch(message.author.id, message.guild.id);

					const channel = message.guild.channels.cache.get(data.channelId);
					if (channel) {
						// Create embed
						const embed = new Discord.EmbedBuilder()
							.setColor(config.embedColor)
							.setDescription(
								language.levelup
									.replace(/{user}/g, `${message.author}`)
									.replace(/{level}/g, `${user.level}`),
							);
						// Send message
						channel.send({
							content: `<@${message.author.id}>`,
							embeds: [embed],
						});
					}
					else {
						// If the channel does not exist, delete entry from the database
						await data.deleteOne();
					}
				}
			}
			catch (err) {
				console.log(err);
			}
		}
	},
};
