const Discord = require('discord.js');
const SchemaMsg = require('../models/msgdelete');
const languageSchema = require('../models/language');

module.exports = {
	name: Discord.Events.MessageDelete,
	async execute(message) {
		// Check if the message is in a DM
		if (message.channel.type === Discord.ChannelType.DM) return;

		const guildDB = await languageSchema.findOne({
			_id: message.guild.id,
		});

		const language = require(`../language/${
			guildDB?.language || 'english'
		}.json`);

		try {
			const data = await SchemaMsg.findOne({ guildId: message.guild.id });

			if (data) {
				try {
					if (message.partial) return; // Check that the message is partial
					if (message.author.bot) return; // Verify that the message author isn't a bot
					if (message.attachments.size > 0) return; // Check if the message has any attachments
					if (!message.content) return; // Check if the message has any content

					// Get and format data
					const channel = message.guild.channels.cache.get(data.channelId);
					const messageContent = message.content.replace(/`/g, '\'');

					if (channel) {
						const embed = new Discord.EmbedBuilder()
							.setColor('F21919')
							.setAuthor({
								name: message.author.tag,
								iconURL: message.author.displayAvatarURL({ dynamic: true }),
							})
							.setDescription(
								`${language.msgD2
									.replace(/{user}/g, `${message.author}`)
									.replace(/{channel}/g, `${message.channel}`)}`,
							)
							.addFields({
								name: `${language.msgD4}`,
								value: `\`\`\`${messageContent.length > 1024 ? `${messageContent.slice(0, 1000)}...` : messageContent}\`\`\``,
							})
							.setFooter({ text: `ID: ${message.author.id}` });

						// If the channel exists, sends the message
						channel.send({ embeds: [embed] });
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
