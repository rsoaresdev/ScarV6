const Discord = require('discord.js');
const SchemaMsg = require('../models/msgedit');
const languageSchema = require('../models/language');

module.exports = {
	name: Discord.Events.MessageUpdate,
	async execute(oldMessage, newMessage) {
		if (oldMessage.channel.type === Discord.ChannelType.DM) return; // The message it's a DM?

		const guildDB = await languageSchema.findOne({
			_id: oldMessage.guild.id,
		});

		const language = require(`../language/${
			guildDB?.language || 'english'
		}.json`);

		try {
			const data = await SchemaMsg.findOne({ guildId: oldMessage.guild.id });

			if (data) {
				try {
					if (!oldMessage.author) return; // Check if the message has a author
					if (oldMessage.author.bot) return; // Verify that the message author isn't a bot
					if (oldMessage.attachments.size > 0) return; // Check if the message has any attachments
					if (oldMessage.content === newMessage.content) return; // OldContent = NewContent?

					const channel = oldMessage.guild.channels.cache.get(data.channelId);

					if (channel) {
						const oldMsg = oldMessage.content.toString().replace(/`/g, '\'');
						const newMsg = newMessage.content.toString().replace(/`/g, '\'');

						const row = new Discord.ActionRowBuilder().addComponents(
							new Discord.ButtonBuilder()
								.setLabel(`🔗 ${language.msgU1}`)
								.setURL(oldMessage.url)
								.setStyle(Discord.ButtonStyle.Link),
						);

						// Create embed
						const embed = new Discord.EmbedBuilder()
							.setColor('F2BA19')
							.setAuthor({
								name: oldMessage.author.tag,
								iconURL: oldMessage.author.displayAvatarURL({ dynamic: true }),
							})
							.setDescription(`${language.msgU3.replace(/{user}/g, `${oldMessage.author}`).replace(/{channel}/g, `${oldMessage.channel}`)}`)
							.addFields(
								{
									name: `${language.msgU5}`,
									value: `\`\`\`${oldMsg.length > 1024 ? `${oldMsg.slice(0, 1000)}...` : oldMsg}\`\`\``,
								},
								{
									name: `${language.msgU6}`,
									value: `\`\`\`${newMsg.length > 1024 ? `${newMsg.slice(0, 1000)}...` : newMsg}\`\`\``,
								},
							)
							.setFooter({ text: `ID: ${oldMessage.author.id}` });

						// If the channel exists, sends the message
						channel.send({
							embeds: [embed],
							components: [row],
						});
					}
					else {
						// If the channel does not exist, delete entry from the database
						await data.deleteOne();
					}
				}
				catch (err) {
					console.log(err);
				}
			}
		}
		catch (err) {
			console.log(err);
		}
	},
};
