const Discord = require('discord.js');
const ReactionRoleSchema = require('../models/reaction-roles');

module.exports = {
	name: Discord.Events.MessageReactionAdd,
	async execute(reaction, user) {
		try {
			// Check if the reaction belongs to a Reaction Role Panel
			const data = await ReactionRoleSchema.findOne({ Message: reaction.message.id });
			if (data) {
				if (user.bot) return; // The user is a bot?
				if (!Object.keys(data.Roles)
					.includes(reaction.emoji.name)) return; // The reaction is related to any role?
				if (reaction.message.partial) await reaction.message.fetch(); // The message is partial?
				if (reaction.partial) await reaction.fetch(); // The reaction is partial?

				// Check if the bot has permission to 'Manage Roles'
				if (reaction.message.guild.members.me.permissions
					.has(Discord.PermissionsBitField.Flags.ManageRoles)) {
					// Add role
					reaction.message.guild.members.cache
						.get(user.id).roles
						.add(...data.Roles[reaction.emoji.name]);
				}
			}
		}
		catch (err) {
			console.log(err);
		}
	},
};
