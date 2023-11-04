const { SlashCommandBuilder } = require('discord.js');
const RepModel = require('../models/rep');

async function getUserPointsOnServer(serverId, userId) {
	try {
		const pointsOnServer = await RepModel.aggregate([
			{
				$match: {
					server_id: serverId,
					'receiver.user_id': userId,
				},
			},
			{
				$group: {
					_id: null,
					value: {
						$sum: '$value',
					},
				},
			},
			{
				$project: {
					_id: 0,
					value: 1,
				},
			},
		]);
		return pointsOnServer[0]?.value ?? 0;
	}
	catch (error) {
		console.error(error);
		return 0;
	}
}

async function getAllUserPoints(userId) {
	try {
		const allPoints = await RepModel.aggregate([
			{
				$match: {
					'receiver.user_id': userId,
				},
			},
			{
				$group: {
					_id: null,
					value: {
						$sum: '$value',
					},
				},
			},
			{
				$project: {
					_id: 0,
					value: 1,
				},
			},
		]);
		return allPoints[0]?.value ?? 0;
	}
	catch (error) {
		console.error(error);
		return 0;
	}
}

function generateRepHistoryHTML(
	username,
	userAvatar,
	userId,
	repData,
	allPoints,
	pointsOnServer,
	interaction,
) {
	const htmlEntities = {
		'&': '&amp;',
		'<': '&lt;',
		'>': '&gt;',
		'"': '&quot;',
		'\'': '&apos;',
	};
	const tableData = repData.map((item) => {
		const reason = item.reason.replace(/[&<>"']/g, (match) => htmlEntities[match]);
		const sender = `${item.sender.username.replace(/[&<>"']/g, (match) => htmlEntities[match])} (${item.sender.user_id})`;
		const createdAt = item.createdAt.toLocaleString('en-US');
		return `<tr><td>${reason}</td><td>${sender}</td><td>${createdAt}</td></tr>`;
	}).join('');

	return `<!DOCTYPE html><html lang="en"> <head><meta name="viewport" content="width=device-width, initial-scale=1.0"/><meta charset="utf-8"/><link rel="icon" type="image/x-icon" href="${userAvatar}"/><title>Reputation history of ${username}(${userId})</title><style>*, *:before, *:after{box-sizing: border-box;}::-webkit-scrollbar-track{background-color: rgb(125, 125, 125);}::-webkit-scrollbar{width: 7px;background-color: rgb(0, 0, 0);}::-webkit-scrollbar-thumb{background-color: rgb(100, 100, 100);}html, head{width: 100%;height: 100%;font-family: Verdana, sans-serif;color: #efefef;background: #292929;}.h{overflow: hidden;padding: 30px 5px;text-align: center;}h1{margin-left: 10px;}.h img{width: 100px;height: 100px;box-shadow: 1px 1px 6px 1px black;width: 100px;height: 100px;border-radius: 100%;}.g{background: green;font-weight: 700;font-size: 24px;}.r{background: red;font-weight: 700;font-size: 24px;}.h div{display: inline-block;vertical-align: middle;}table{font-family: Arial, Helvetica, sans-serif;border-collapse: collapse;width: 80%;}table td, table th{border: 1px solid #ddd;padding: 8px;}table tr:nth-child(even){background: #383838;}table tr:hover{background: #454444;color: white;}table th{padding-top: 12px;padding-bottom: 12px;text-align: left;background: #1e1e1e;color: white;}@media only screen and (max-width: 700px){table,thead,tbody,th,td,tr{display: block;}thead tr{position: absolute; top: -9999px; left: -9999px;}tr{border: 1px solid #ccc; margin-bottom: 20px;}td{border: none; border-bottom: 1px solid #eee; position: relative; padding-left: 50%;}td:before{position: absolute; top: 6px; left: 6px; width: 45%; padding-right: 10px; white-space: nowrap;}}</style> </head> <body><div class="h"> <div><img src="${userAvatar}" alt="userAvatar"/></div><div><h1>Reputation of ${username}</h1><h3>(${userId})</h3> </div></div><center> <h3>All points: ${allPoints}</h3> <h3>Points on ${interaction.guild.name}: ${pointsOnServer}</h3> <table><tr> <th>Message</th> <th>Sender</th> <th>Date</th></tr>${tableData}</table></center> </body></html>`;
}

module.exports = {
	data: new SlashCommandBuilder()
		.setName('rep')
		.setDescription('Give/check the reputation of any member!')
		.addSubcommand((subcommand) => subcommand
			.setName('give')
			.setDescription('Give reputation to any member')
			.addUserOption((option) => option
				.setName('user')
				.setDescription('Select a user')
				.setRequired(true))
			.addStringOption((option) => option
				.setName('message')
				.setDescription('Enter a reason')
				.setRequired(true)
				.setMaxLength(100)))
		.addSubcommand((subcommand) => subcommand
			.setName('check')
			.setDescription('Check the reputation of any member')
			.addUserOption((option) => option
				.setName('user')
				.setDescription('Select a user')
				.setRequired(true)))
		.setDMPermission(false),

	async execute(interaction, Discord, config, language) {
		if (interaction.options.getSubcommand() === 'give') {
			const user = interaction.options.getUser('user');
			const member = interaction.options.getMember('user');
			const reason = interaction.options.getString('message');

			if (user.bot) {
				const errorBot = new Discord.EmbedBuilder()
					.setColor(config.embedColor)
					.setDescription(`${config.emojis.error} ${language.rep12}`);

				return interaction.reply({
					embeds: [errorBot],
					ephemeral: true,
				});
			}

			if (member.id === interaction.user.id) {
				const errorHer = new Discord.EmbedBuilder()
					.setColor(config.embedColor)
					.setDescription(`${language.rep1}`);

				return interaction.reply({
					embeds: [errorHer],
					ephemeral: true,
				});
			}

			const newRep = new RepModel({
				server_id: interaction.guild.id,
				reason,
				value: 1,
				receiver: {
					user_id: member.id,
					member,
					tag: member.user.username,
				},
				sender: {
					user_id: interaction.user.id,
					username: interaction.user.username,
					tag: interaction.user.username,
				},
			});
			await newRep.save();

			const allPoints = await RepModel.aggregate([
				{
					$match: {
						'receiver.user_id': member.id,
					},
				},
				{
					$group: {
						_id: null,
						value: {
							$sum: '$value',
						},
					},
				},
				{
					$project: {
						_id: 0,
						value: 1,
					},
				},
			]);
			allPoints.length === 0 ? 0 : allPoints[0].value;

			const embed = new Discord.EmbedBuilder()
				.setColor(config.embedColor)
				.setAuthor({
					name: `${language.rep2}`,
					iconURL: member.user.displayAvatarURL(),
				})
				.addFields(
					{
						name: `${language.rep3}`,
						value: `${allPoints[0].value}`,
						inline: true,
					},
					{
						name: `${language.rep4}`,
						value: `${interaction.user}`,
						inline: true,
					},
					{
						name: `${language.rep5}`,
						value: `${member}`,
						inline: true,
					},
					{
						name: `${language.rep6}`,
						value: `\`\`\`${
							(await reason.length) > 50
								? `${reason.slice(0, 50).replace(/`/g, '\'')}...`
								: reason.replace(/`/g, '\'')
						}\`\`\``,
						inline: false,
					},
				);

			interaction.reply({
				embeds: [embed],
			});
		}

		if (interaction.options.getSubcommand() === 'check') {
			const user = interaction.options.getUser('user');

			if (user.bot) {
				const errorBot = new Discord.EmbedBuilder()
					.setColor(config.embedColor)
					.setDescription(`${config.emojis.error} ${language.rep12}`);

				return interaction.reply({
					embeds: [errorBot],
					ephemeral: true,
				});
			}

			const items = await RepModel.find({
				server_id: interaction.guild.id,
				'receiver.user_id': user.id,
			})
				.sort({
					field: 'asc',
					_id: -1,
				})
				.limit(10);

			const pointsOnServer = await getUserPointsOnServer(
				interaction.guild.id,
				user.id,
			);
			const allPoints = await getAllUserPoints(user.id);

			let description;
			if (items.length === 0) {
				description = `${config.emojis.error} ${language.rep10}`;
			}
			else {
				description = `**${language.rep9}**\n`;
				items.forEach((item) => {
					const reason = item.reason.length > 50
						? `${item.reason.slice(0, 50).replace(/`/g, '\'')}...`
						: item.reason.replace(/`/g, '\'');
					const senderId = item.sender.user_id;
					description += `> <@${senderId}> - \`${reason}\`\n`;
				});

				const att = new Discord.AttachmentBuilder(
					Buffer.from(
						generateRepHistoryHTML(
							user.username,
							user.displayAvatarURL({
								dynamic: false,
								extension: 'png',
								size: 1024,
							}),
							user.id,
							items,
							allPoints,
							pointsOnServer,
							interaction,
						),
						'UTF8',
					),
					{ name: 'repFullLog.html' },
				);
				const embedF1 = new Discord.EmbedBuilder()
					.setColor(config.embedColor)
					.setTitle(`${language.rep11}`)
					.setAuthor({
						name: `${user.username}`,
						iconURL: user.displayAvatarURL(),
					})
					.setDescription(description)
					.addFields(
						{
							name: `${language.rep7}`,
							value: `${allPoints}`,
							inline: true,
						},
						{
							name: `${language.rep8} ${interaction.guild.name}`,
							value: `${pointsOnServer}`,
							inline: true,
						},
					);
				return interaction.reply({
					files: [att],
					embeds: [embedF1],
				});
			}

			const embedF1 = new Discord.EmbedBuilder()
				.setColor(config.embedColor)
				.setTitle(`${language.rep11}`)
				.setAuthor({
					name: `${user.username}`,
					iconURL: user.displayAvatarURL(),
				})
				.setDescription(description);
			return interaction.reply({
				embeds: [embedF1],
			});
		}
	},
};
