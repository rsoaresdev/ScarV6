const Discord = require('discord.js');
const SchemaWelcome = require('../models/welcome');
const SchemaAutoRole = require('../models/autorole');
const languageSchema = require('../models/language');

module.exports = {
	name: Discord.Events.GuildMemberAdd,
	async execute(member) {
		// Join Message Module
		try {
			const data = await SchemaWelcome.findOne({ guildId: member.guild.id });

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

				const formattedMsg = data.welcomeMsg.replace(/{userId}|{userMention}|{guildName}|{guildMemberCount}/g, (match) => placeholders[match]);

				// If the channel exists, send the message
				if (channel) {
					const joinEmbed = new Discord.EmbedBuilder()
						.setAuthor({ name: `${language.gmAdd}` })
						.setColor('339B61')
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
							content: `<@${member.user.id}>`,
							embeds: [joinEmbed],
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

		// Auto Role Module
		try {
			const autoRoleData = await SchemaAutoRole.findOne({ guild: member.guild.id });

			if (autoRoleData) {
				// Check if the bot has permission to 'Manage Roles'
				if (!member.guild.members.me.permissions
					.has(Discord.PermissionsBitField.Flags.ManageRoles)) return;

				const joinrole = member.guild.roles.cache.get(autoRoleData.role);

				// If the role exists, add the role to the member
				if (joinrole && !member.roles.cache.has(joinrole.id)) {
					member.roles.add(joinrole.id);
				}
				else {
					// If the role does not exist, delete the entry
					await autoRoleData.deleteOne();
				}
			}
		}
		catch (err) {
			console.log(err);
		}
	},
};
