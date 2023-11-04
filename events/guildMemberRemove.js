const Discord = require('discord.js');
const SchemaGoodBye = require('../models/goodbye');
const languageSchema = require('../models/language');

module.exports = {
	name: Discord.Events.GuildMemberRemove,
	async execute(member) {
		// Leave Message Module
		try {
			const data = await SchemaGoodBye.findOne({ guildId: member.guild.id });

			if (data) {
				const guildDB = await languageSchema.findOne({
					_id: member.guild.id,
				});

				const language = require(`../language/${
					guildDB?.language || 'english'
				}.json`);

				// Get data
				const channel = member.guild.channels.cache.get(data.channelId);

				const placeholders = {
					'{userId}': member.user.id,
					'{userMention}': `<@${member.user.id}>`,
					'{guildName}': member.guild.name,
					'{guildMemberCount}': member.guild.memberCount,
				};

				const formattedMsg = data.goodbyeMsg.replace(/{userId}|{userMention}|{guildName}|{guildMemberCount}/g, (match) => placeholders[match]);

				// If the channel exists, send the message
				if (channel) {
					// Create embed
					const leaveEmbed = new Discord.EmbedBuilder()
						.setAuthor({ name: `${language.gmRem}` })
						.setColor('D63535')
						.setAuthor({
							name: member.user.tag,
							iconURL: member.user.displayAvatarURL({ dynamic: true }),
						})
						.setDescription(formattedMsg)
						.addFields({
							name: language.ageAccount,
							value: `<t:${Math.round(member.user.createdTimestamp / 1000)}:f> | <t:${Math.round(member.user.createdTimestamp / 1000)}:R>`,
						});

					channel
						.send({
							embeds: [leaveEmbed],
						})
						.catch(console.log);
				}
				else {
					// If the channel does not exist, delete the entry
					await data.deleteOne();
				}
			}
		}
		catch (err) {
			console.log(err);
		}
	},
};
