process.on('uncaughtException', (err) => {
	console.log(err);
});

process.on('unhandledRejection', (err) => {
	console.log(err);
});

require('dotenv').config();
const { GiveawaysManager } = require('discord-giveaways');
const fs = require('node:fs');

const Discord = require('discord.js');

const client = new Discord.Client({
	allowedMentions: {
		parse: ['users', 'roles'],
		repliedUser: false,
	},
	intents: [
		Discord.GatewayIntentBits.Guilds,
		Discord.GatewayIntentBits.GuildMessages,
		Discord.GatewayIntentBits.GuildMembers,
		Discord.GatewayIntentBits.GuildMessageReactions,
		Discord.GatewayIntentBits.GuildVoiceStates,
		Discord.GatewayIntentBits.MessageContent,
		Discord.GatewayIntentBits.GuildEmojisAndStickers,
		Discord.GatewayIntentBits.GuildIntegrations,
		Discord.GatewayIntentBits.GuildWebhooks,
	],
	partials: [
		Discord.Partials.Channel,
		Discord.Partials.Message,
		Discord.Partials.Reaction,
	],
});

// Setup MongoDB
const mongoose = require('mongoose');

mongoose.set('strictQuery', false);

mongoose
	.connect(process.env.MONGODB)
	.then(() => console.log('Connected to MongoDB'))
	.catch(console.log);

// Setup discord-xp
const Levels = require('discord-xp');

Levels.setURL(process.env.MONGODB)
	.then(() => console.log('Connected to discord-xp'))
	.catch(console.log);

// Setup discord-mongo-currency.better
const mongoCurrency = require('discord-mongo-currency.better');
const giveawayModel = require('./models/giveaways');
const config = require('./config.json');
const languageSchema = require('./models/language');

mongoCurrency
	.connect(process.env.MONGODB)
	.then(() => console.log('Connected to discord-mongo-currency.better'))
	.catch(console.log);

// Loading command files
client.commands = new Discord.Collection();
const commands = [];
// Get commands files
const commandFiles = fs.readdirSync('./commands').filter((file) => file.endsWith('.js'));
commandFiles.forEach((file) => {
	const command = require(`./commands/${file}`);
	commands.push(command.data.toJSON());

	if ('data' in command) {
		client.commands.set(command.data.name, command);
	}
	else {
		console.log(
			`The command at ${file} is missing a required "data" or "execute" property.`,
		);
	}
});

// Get events files
const eventFiles = fs.readdirSync('./events').filter((file) => file.endsWith('.js'));
eventFiles.forEach((file) => {
	const event = require(`./events/${file}`);
	client.on(event.name, (...args) => event.execute(...args));
});

// Construct and prepare an instance of the REST module
const rest = new Discord.REST({
	version: '10',
}).setToken(process.env.CLIENT_TOKEN);

(async () => {
	try {
		console.log(
			`Started refreshing ${commands.length} application (/) commands.`,
		);

		const data = await rest.put(
			Discord.Routes.applicationCommands(config.clientId),
			{
				body: commands,
			},
		);

		console.log(
			`Successfully reloaded ${data.length} application (/) commands.`,
		);
	}
	catch (error) {
		console.log(error);
	}
})();

// Giveaways handler
const GiveawayManagerWithOwnDatabase = class extends GiveawaysManager {
	async getAllGiveaways() {
		return giveawayModel.find().lean().exec();
	}

	async saveGiveaway(messageId, giveawayData) {
		await giveawayModel.create(giveawayData);
		return true;
	}

	async editGiveaway(messageId, giveawayData) {
		await giveawayModel
			.updateOne(
				{
					messageId,
				},
				giveawayData,
				{
					omitUndefined: true,
				},
			)
			.exec();
		return true;
	}

	async deleteGiveaway(messageId) {
		await giveawayModel
			.deleteOne({
				messageId,
			})
			.exec();
		return true;
	}

	async refreshStorage() {
		return client.shard.broadcastEval(() => this.giveawaysManager.getAllGiveaways());
	}
};

const manager = new GiveawayManagerWithOwnDatabase(client, {
	default: {
		botsCanWin: false,
		embedColor: 'ff468a',
		embedColorEnd: 'ff468a',
		reaction: '🎉',
	},
});
client.giveawaysManager = manager;

client.giveawaysManager.on(
	'giveawayReactionAdded',
	async (giveaway, member, reaction) => {
		try {
			const guildDB = await languageSchema.findOne({
				_id: giveaway.guildId,
			});

			const language = require(`./language/${
				guildDB?.language || 'english'
			}.json`);

			const [isNotAllowed, BonusEntries] = await Promise.all([
				giveaway.exemptMembers(member),
				giveaway.checkBonusEntries(member.user),
			]);

			const embed = new Discord.EmbedBuilder()
				.setColor(isNotAllowed ? 'c92a2a' : 'fcba03')
				.setThumbnail(
					member.guild.iconURL({
						dynamic: true,
					}),
				)
				.setAuthor({
					name: isNotAllowed ? language.givConf17 : language.givConf10,
					iconURL: isNotAllowed ? config.images.xGif : config.images.correctGif,
				})
				.setDescription(isNotAllowed ? `${language.givConf18} [${language.givConf2}](${giveaway.messageURL}), ${language.givConf19}\n\n${language.givConf7} <#${giveaway.channelId}>` : `${language.givConf1} [${language.givConf2}](${giveaway.messageURL}) ${language.givConf3}\n> **${language.givConf4}** \`${giveaway.prize}\`\n> **${language.givConf5}** \`${giveaway.winnerCount}\`\n> **${language.givConf6}** \`${BonusEntries || 0}\`\n\n${language.givConf7} <#${giveaway.channelId}>`);

			member.send({
				embeds: [embed],
			}).catch(() => {});

			if (isNotAllowed) {
				await reaction.users.remove(member.user);
			}
		}
		catch (err) {
			console.log(err);
		}
	},
);

client.giveawaysManager.on(
	'giveawayReactionRemoved',
	async (giveaway, member) => {
		try {
			const guildDB = await languageSchema.findOne({
				_id: giveaway.guildId,
			});

			const language = require(`./language/${
				guildDB?.language || 'english'
			}.json`);

			const embed = new Discord.EmbedBuilder()
				.setColor('c25b1f')
				.setThumbnail(
					member.guild.iconURL({
						dynamic: true,
					}),
				)
				.setAuthor({
					name: language.givConf9,
					iconURL: config.images.correctGif,
				})
				.setDescription(`${language.givConf8} [${language.givConf2}](${giveaway.messageURL}) ${language.givConf15}\n\n${language.givConf7} <#${giveaway.channelId}>`);

			member.send({
				embeds: [embed],
			}).catch(() => {});
		}
		catch (err) {
			console.log(err);
		}
	},
);

client.giveawaysManager.on('giveawayEnded', async (giveaway, winners) => {
	const guildDB = await languageSchema.findOne({
		_id: giveaway.guildId,
	});

	const language = require(`./language/${guildDB?.language || 'english'}.json`);

	winners.forEach(async (winner) => {
		try {
			const embed = new Discord.EmbedBuilder()
				.setColor('4cb03f')
				.setThumbnail(
					winner.guild.iconURL({
						dynamic: true,
					}),
				)
				.setAuthor({
					name: `${language.givConf13}`,
					iconURL: config.images.correctGif,
				})
				.setDescription(`${language.givConf14} [${language.givConf2}](${giveaway.messageURL}), ${language.givConf16}\n> **${language.givConf4}** \`${giveaway.prize}\`\n\n${language.givConf7} <#${giveaway.channelId}>`);

			winner.user.send({
				embeds: [embed],
			}).catch(() => {});
		}
		catch (err) {
			console.log(err);
		}
	});
});

client.giveawaysManager.on('giveawayRerolled', async (giveaway, winners) => {
	const guildDB = await languageSchema.findOne({
		_id: giveaway.guildId,
	});
	const language = require(`./language/${guildDB?.language || 'english'}.json`);

	winners.forEach(async (winner) => {
		try {
			const embed = new Discord.EmbedBuilder()
				.setColor('4cb03f')
				.setThumbnail(
					winner.guild.iconURL({
						dynamic: true,
					}),
				)
				.setAuthor({
					name: `${language.givConf13}`,
					iconURL: config.images.correctGif,
				})
				.setDescription(`${language.givConf14} [${language.givConf2}](${giveaway.messageURL}), ${language.givConf16}\n> **${language.givConf4}** \`${giveaway.prize}\`\n\n${language.givConf7} <#${giveaway.channelId}>`);

			winner.user.send({
				embeds: [embed],
			}).catch(() => {});
		}
		catch (err) {
			console.log(err);
		}
	});
});

client.login(process.env.CLIENT_TOKEN);
