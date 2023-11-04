const ms = require('ms');
const { SlashCommandBuilder, ChannelType, PermissionsBitField } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('giveaway')
		.setDescription('Setup the giveaway module')
		.setDefaultMemberPermissions(PermissionsBitField.Flags.Administrator)
		.addSubcommand((subcommand) => subcommand
			.setName('start')
			.setDescription('Start a giveaway')
			.addChannelOption((option) => option
				.setName('channel')
				.setDescription('Select a channel')
				.addChannelTypes(ChannelType.GuildText)
				.setRequired(true))
			.addStringOption((option) => option
				.setName('duration')
				.setDescription('Enter the duration (10s|1m|2h)')
				.setRequired(true))
			.addIntegerOption((option) => option
				.setName('winners')
				.setDescription('Enters the number of winners')
				.setRequired(true)
				.setMinValue(1)
				.setMaxValue(50))
			.addUserOption((option) => option
				.setName('host')
				.setDescription('Select the giveaway host')
				.setRequired(true))
			.addStringOption((option) => option
				.setName('prize')
				.setDescription('Enters what the prize will be')
				.setRequired(true)
				.setMaxLength(100))
			.addRoleOption((option) => option.setName('bonus_role').setDescription('Select a bonus role'))
			.addRoleOption((option) => option
				.setName('required_role')
				.setDescription('Select a required role')))
		.addSubcommand((subcommand) => subcommand
			.setName('reroll')
			.setDescription('Choose a new giveaway winner')
			.addStringOption((option) => option
				.setName('message_id')
				.setDescription('Enter the message ID.')
				.setRequired(true)))
		.addSubcommand((subcommand) => subcommand
			.setName('end')
			.setDescription('End a giveaway')
			.addStringOption((option) => option
				.setName('message_id')
				.setDescription('Enter the message ID')
				.setRequired(true)))
		.addSubcommand((subcommand) => subcommand
			.setName('drop')
			.setDescription('Drop a giveaway')
			.addChannelOption((option) => option
				.setName('channel')
				.setDescription('Select a channel')
				.addChannelTypes(ChannelType.GuildText)
				.setRequired(true))
			.addIntegerOption((option) => option
				.setName('winners')
				.setDescription('Enters the number of winners')
				.setRequired(true)
				.setMinValue(1)
				.setMaxValue(50))
			.addStringOption((option) => option
				.setName('prize')
				.setDescription('Enters what the prize will be')
				.setRequired(true)
				.setMaxLength(100)))
		.setDMPermission(false),

	async execute(interaction, Discord, config, language) {
		const messages = {
			giveaway: `🎉 ${language.giv}`,
			giveawayEnded: `🎉 ${language.givEnded}`,
			drawing: `${language.giv1}`,
			dropMessage: `${language.giv2}`,
			inviteToParticipate: `${language.giv3}`,
			winMessage: `${language.giv4}`,
			embedFooter: `${language.giv5}`,
			noWinner: `${language.giv6}`,
			hostedBy: `\n${language.giv7}`,
			winners: `${language.giv8}`,
			endedAt: `${language.giv9}`,
		};

		if (interaction.options.getSubcommand() === 'start') {
			const giveawayChannelStart = interaction.options.getChannel('channel');
			const duration = ms(interaction.options.getString('duration'));
			const winnerCount = interaction.options.getInteger('winners');
			const prize = interaction.options.getString('prize');
			const hostedBy = interaction.options.getUser('host');
			const bonusentriesdata = interaction.options.getRole('bonus_role');
			const requiredentriesdata = interaction.options.getRole('required_role');

			// Check duration
			if (duration > 2592000000) {
				const embed2 = new Discord.EmbedBuilder()
					.setDescription(`${config.emojis.error} ${language.giv30days}`)
					.setColor(config.embedColor);

				return interaction.reply({
					embeds: [embed2],
					ephemeral: true,
				});
			}

			if (duration <= 0) {
				const embed3 = new Discord.EmbedBuilder()
					.setDescription(`${config.emojis.error} ${language.giv1s}`)
					.setColor(config.embedColor);

				return interaction.reply({
					embeds: [embed3],
					ephemeral: true,
				});
			}

			// Set giveaway options
			const options = {
				duration,
				winnerCount,
				prize,
				hostedBy: hostedBy.username,
				messages,
				thumbnail: 'https://i.imgur.com/DJuTuxs.png',
				lastChance: {
					enabled: false,
					content: `${language.giv10}`,
					threshold: 15000,
					embedColor: '#FFFF00',
				},
			};

			if (bonusentriesdata) {
				if (
					bonusentriesdata.tags?.botId
          || bonusentriesdata.id === interaction.guild.id
				) {
					const embedRoleExclusive = new Discord.EmbedBuilder()
						.setColor(config.embedColor)
						.setDescription(`${config.emojis.error} ${language.roleExclusive}`);

					return interaction.reply({
						embeds: [embedRoleExclusive],
						ephemeral: true,
					});
				}

				options.bonusEntries = [
					{
						bonus: (member) => (member.roles.cache.some((r) => r.id === bonusentriesdata.id)
							? 2
							: null),
						cumulative: false,
					},
				];

				options.messages.hostedBy += `\n\n**${language.givBonus}**\n- ${bonusentriesdata} (2x entries)`;
			}

			if (requiredentriesdata) {
				if (
					requiredentriesdata.tags?.botId
          || requiredentriesdata.id === interaction.guild.id
				) {
					const embedRoleExclusive = new Discord.EmbedBuilder()
						.setColor(config.embedColor)
						.setDescription(`${config.emojis.error} ${language.roleExclusive}`);

					return interaction.reply({
						embeds: [embedRoleExclusive],
						ephemeral: true,
					});
				}
				options.messages.hostedBy += `\n\n**${language.givRequired}**\n- ${requiredentriesdata}\n`;
				options.exemptMembers = (member) => !member.roles.cache
					.some((r) => r.id === requiredentriesdata.id);
			}

			interaction.client.giveawaysManager
				.start(giveawayChannelStart, options)
				.then(() => {
					const embed9 = new Discord.EmbedBuilder()
						.setDescription(`${config.emojis.correct} ${language.givSucess}`)
						.setColor(config.embedColor);

					interaction.reply({
						embeds: [embed9],
						ephemeral: true,
					});
				})
				.catch(console.log);
		}

		if (interaction.options.getSubcommand() === 'reroll') {
			const messageId = interaction.options.getString('message_id');

			if (Number.isNaN(messageId)) {
				const error = new Discord.EmbedBuilder()
					.setColor(config.embedColor)
					.setDescription(`${config.emojis.error} ${language.givError}`);

				return interaction.reply({
					embeds: [error],
					ephemeral: true,
				});
			}

			const giveaway = interaction.client.giveawaysManager.giveaways.find(
				(g) => g.guildId === interaction.guildId
          && g.messageId === interaction.options.getString('message_id'),
			);

			if (giveaway) {
				interaction.client.giveawaysManager
					.reroll(messageId, {
						messages: {
							congrat: `${language.givMSG1}`,
							error: {
								content: null,
								embed: new Discord.EmbedBuilder()
									.setColor(config.embedColor)
									.setDescription(`${language.givMSG2}`),
							},
						},
					})
					.then(() => {
						const embed3 = new Discord.EmbedBuilder()
							.setDescription(
								`${config.emojis.correct} ${language.givNewWinner}`,
							)
							.setColor(config.embedColor);

						return interaction.reply({
							embeds: [embed3],
							ephemeral: true,
						});
					})
					.catch(console.log);
			}
			else {
				const embed4 = new Discord.EmbedBuilder()
					.setDescription(`${config.emojis.error} ${language.givNotFound}`)
					.setColor(config.embedColor);

				return interaction.reply({
					embeds: [embed4],
					ephemeral: true,
				});
			}
		}

		if (interaction.options.getSubcommand() === 'end') {
			const messageId = interaction.options.getString('message_id');

			if (Number.isNaN(messageId)) {
				const error = new Discord.EmbedBuilder()
					.setColor(config.embedColor)
					.setDescription(`${config.emojis.error} ${language.givError}`);

				return interaction.reply({
					embeds: [error],
					ephemeral: true,
				});
			}

			const giveaway = interaction.client.giveawaysManager.giveaways.find(
				(g) => g.guildId === interaction.guildId
          && g.messageId === interaction.options.getString('message_id'),
			);

			if (giveaway) {
				interaction.client.giveawaysManager
					.end(messageId)
					.then(() => {
						const embed3 = new Discord.EmbedBuilder()
							.setDescription(`${config.emojis.correct} ${language.givEnd}`)
							.setColor(config.embedColor);

						return interaction.reply({
							embeds: [embed3],
							ephemeral: true,
						});
					})
					.catch(console.log);
			}
			else {
				const embed4 = new Discord.EmbedBuilder()
					.setDescription(`${config.emojis.error} ${language.givNotFound}`)
					.setColor(config.embedColor);

				return interaction.reply({
					embeds: [embed4],
					ephemeral: true,
				});
			}
		}

		if (interaction.options.getSubcommand() === 'drop') {
			const giveawayChannel = interaction.options.getChannel('channel');
			const winnerCount = interaction.options.getInteger('winners');
			const prize = interaction.options.getString('prize');

			interaction.client.giveawaysManager
				.start(giveawayChannel, {
					winnerCount,
					prize,
					isDrop: true,
					messages,
				})
				.then(() => {
					const embed9 = new Discord.EmbedBuilder()
						.setDescription(`${config.emojis.correct} ${language.givSucess}`)
						.setColor(config.embedColor);

					interaction.reply({
						embeds: [embed9],
						ephemeral: true,
					});
				})
				.catch(console.log);
		}
	},
};
