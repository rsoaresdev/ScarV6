const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');
const Schema = require('../models/reaction-roles');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('rradd')
		.setDescription('Add a reaction role to the panel (/rrpanel)')
		.addRoleOption((option) => option.setName('role').setDescription('Select a role').setRequired(true))
		.addStringOption((option) => option
			.setName('emoji')
			.setDescription('Select one emoji')
			.setRequired(true))
		.setDMPermission(false)
		.setDefaultMemberPermissions(PermissionsBitField.Flags.Administrator),

	async execute(interaction, Discord, config, language) {
		const role = interaction.options.getRole('role');
		const string = interaction.options.getString('emoji');

		if (!string.match(/<?(a)?:?(\w{2,32}):(\d{17,19})>?/)) {
			const embed1 = new Discord.EmbedBuilder()
				.setDescription(`${language.emojiInvalid}`)
				.setColor(config.embedColor);

			return interaction.reply({
				embeds: [embed1],
				ephemeral: true,
			});
		}

		if (role.position > interaction.guild.members.me.roles.highest.position) {
			const embed2 = new Discord.EmbedBuilder()
				.setDescription(`${language.roleAbove}`)
				.setColor(config.embedColor);

			return interaction.reply({
				embeds: [embed2],
				ephemeral: true,
			});
		}

		const parsedEmoji = Discord.parseEmoji(string);

		try {
			const data = await Schema.findOne({
				Guild: interaction.guild.id,
			});

			if (data) {
				data.Roles[parsedEmoji.name] = [
					role.id,
					{
						id: parsedEmoji.id,
						raw: string,
					},
				];

				await Schema.findOneAndUpdate(
					{ Guild: interaction.guild.id },
					{ $set: { data } },
					{ new: true, upsert: true, useFindAndModify: false },
				);
			}
			else {
				new Schema({
					Guild: interaction.guild.id,
					Message: 0,
					Roles: {
						[parsedEmoji.name]: [
							role.id,
							{
								id: parsedEmoji.id,
								raw: string,
							},
						],
					},
				}).save();
			}

			const embed3 = new Discord.EmbedBuilder()
				.setColor(config.embedColor)
				.setTitle(`${language.rradd}`)
				.setDescription(`${language.rradd1}`);

			interaction.reply({
				embeds: [embed3],
			});
		}
		catch (err) {
			console.log(err);
		}
	},
};
