const fetch = require('node-fetch');
const Discord = require('discord.js');

module.exports = {
	name: Discord.Events.ClientReady,
	async execute(client) {
		console.log('DiscordClient connected');
		const guildsCount = client.guilds.cache.size;
		const usersCount = client.guilds.cache
			.filter((guild) => guild.available)
			.reduce((acc, guild) => acc + guild.memberCount, 0);

		// Função para definir a presença do bot
		function setBotPresence() {
			const numberOfGuilds = client.guilds.cache.size;
			const presenceText = `scarbot.com • +${numberOfGuilds.toString().slice(0, -1)}0 servers`;

			client.user.setPresence({
				activities: [{ name: presenceText, type: 3 }],
				status: 'online',
			});
		}

		// Defina o tempo em milissegundos (10 minutos = 10 * 60 * 1000 ms)
		const intervaloEmMilissegundos = 10 * 60 * 1000;

		// Chame a função inicialmente
		setBotPresence();

		// Use setInterval para chamar a função a cada 10 minutos
		setInterval(setBotPresence, intervaloEmMilissegundos);

		// Post top.gg status
		fetch(`https://top.gg/api/bots/${client.application.id}/stats`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: process.env.TOPGG,
			},
			body: JSON.stringify({
				server_count: guildsCount,
				shard_count: 1,
			}),
		})
			.then(console.log('[Post Botlists Status] Updated bot info on Top.GG'))
			.catch((error) => console.log(
				`[Post Botlists Status] Unable to post bot info on Top.GG ${error}`,
			));

		// Post blist.xyz status
		fetch(`https://blist.xyz/api/v2/bot/${client.application.id}/stats/`, {
			method: 'PATCH',
			headers: {
				'Content-Type': 'application/json; charset=UTF-8',
				Authorization: process.env.BLIST,
			},
			body: JSON.stringify({
				server_count: guildsCount,
				shard_count: 1,
			}),
		})
			.then(() => console.log('[Post Botlists Status] Updated bot info on blist.xyz'))
			.catch((error) => console.log(
				`[Post Botlists Status] Unable to post bot info on blist.xyz ${error.message}`,
			));

		// Post botlist.me status
		fetch(`https://api.botlist.me/api/v1/bots/${client.application.id}/stats`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: process.env.BOTLISTME,
			},
			body: JSON.stringify({
				server_count: guildsCount,
				shard_count: 1,
			}),
		})
			.then(
				console.log('[Post Botlists Status] Updated bot info on botlist.me'),
			)
			.catch((error) => console.log(
				`[Post Botlists Status] Unable to post bot info on botlist.me ${error}`,
			));

		// Post dlist status
		fetch(
			`https://api.discordlist.gg/v0/bots/${client.application.id}/guilds?count=${guildsCount}`,
			{
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${process.env.DLIST}`,
				},
			},
		)
			.then(console.log('[Post Botlists Status] Updated bot info on dlist'))
			.catch((error) => console.log(
				`[Post Botlists Status] Unable to post bot info on dlist ${error}`,
			));

		// Post infinityBotList status
		fetch('https://spider.infinitybots.gg/bots/stats', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: process.env.INFINITY,
			},
			body: JSON.stringify({
				servers: guildsCount,
				shards: 1,
				users: usersCount,
			}),
		})
			.then(
				console.log(
					'[Post Botlists Status] Updated bot info on infinityBotList',
				),
			)
			.catch((error) => console.log(
				`[Post Botlists Status] Unable to post bot info on infinityBotList ${error}`,
			));

		// Post discord.bots.gg status
		fetch(
			`https://discord.bots.gg/api/v1/bots/${client.application.id}/stats`,
			{
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authorization: process.env.DISCORDBOTSGG,
				},
				body: JSON.stringify({
					guildCount: guildsCount,
					shardCount: 1,
				}),
			},
		)
			.then(
				console.log(
					'[Post Botlists Status] Updated bot info on Discord.Bots.GG',
				),
			)
			.catch((error) => console.log(
				`[Post Botlists Status] Unable to post bot info on Discord.Bots.GG ${error}`,
			));

		// Post Discords.com status
		fetch(`https://discords.com/bots/api/bot/${client.application.id}`, {
			method: 'POST',
			headers: {
				Authorization: process.env.DISCORDS,
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				server_count: guildsCount,
			}),
		})
			.then((response) => response.text())
			.then(
				console.log('[Post Botlists Status] Updated bot info on Discords.com'),
			)
			.catch((error) => console.log(
				`[Post Botlists Status] Unable to post bot info on Discords.com ${error}`,
			));

		// Post Voidbots.com status
		fetch(`https://api.voidbots.net/bot/stats/${client.application.id}`, {
			method: 'POST',
			headers: {
				Authorization: process.env.VOID,
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				server_count: guildsCount,
				shard_count: 1,
			}),
		})
			.then((response) => response.text())
			.then(
				console.log('[Post Botlists Status] Updated bot info on Voidbots.com'),
			)
			.catch((error) => console.log(
				`[Post Botlists Status] Unable to post bot info on Voidbots.com ${error}`,
			));

		// Post DiscordBotList.com status
		fetch(
			`https://discordbotlist.com/api/v1/bots/${client.application.id}/stats`,
			{
				method: 'POST',
				headers: {
					Authorization: process.env.DISCORDBOTLIST,
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					guilds: guildsCount,
					users: usersCount,
				}),
			},
		)
			.then((response) => response.text())
			.then(
				console.log(
					'[Post Botlists Status] Updated bot info on DiscordBotList.com',
				),
			)
			.catch((error) => console.log(
				`[Post Botlists Status] Unable to post bot info on DiscordBotList.com ${error}`,
			));
	},
};
