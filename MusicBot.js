const fs = require('fs');
const prefixes = JSON.parse(fs.readFileSync("./Logs.json/prefix.json", "utf8"));
const freainds = JSON.parse(fs.readFileSync("./Logs.json/freaind.json", "utf8"));
const { Client, Util } = require('discord.js');
const {TOKEN, PREFIX, owner, GOOGLE_API_KEY, CHID, LENGTH} = require('./config');
const YouTube = require('simple-youtube-api');
const ytdl = require('ytdl-core');
const fetchVideoInfo = require('youtube-info');
const getYoutubeID = require('get-youtube-id');
const client = new Client({ disableEveryone: true });
const Discord = require("discord.js");
const youtube = new YouTube(GOOGLE_API_KEY);
const queue = new Map();
const moment = require('moment-hijri');

client.on('ready', () => { console.log(`Online: ${client.user.tag}\nGuilds: ${client.guilds.size}`) });

client.on('disconnect', () => { console.log('I just disconnected, making sure you know, I will reconnect now...') });

client.on('reconnecting', () => { console.log('I am reconnecting now!') });

client.on("error", function(error) { return console.log(error) });

client.on("message", message => {
    if (message.author.bot) return;
    if (!message.guild) return;
    if (!prefixes[message.guild.id]) prefixes[message.guild.id] = { prefix: PREFIX, }
	var prefix = prefixes[message.guild.id].prefix;
    if (message.content.startsWith(prefix + 'setp')) {
		if (message.author.id !== owner) return;
		let ownerI = client.users.get(owner);
        let args = message.content.split(" ").slice(1)
		if (!args.join(" ")) return message.channel.send(`**Say The Prefix Please.**`);
		message.delete();
		message.channel.send(`Changed prefix From: \`${prefix}\` To: \`${args.join(" ")}\` Requested by **${ownerI.nickname || ownerI.username}**`);
		delete prefixes[message.guild.id].prefix;
		prefixes[message.guild.id] = { prefix: args.join(" ") };
    }
	 fs.writeFile("./Logs.json/prefix.json", JSON.stringify(prefixes), (err) => { if (err) console.error(err) });
});

client.on('message', async msg => {
if (!prefixes[msg.guild.id]) prefixes[msg.guild.id] = { prefix: PREFIX, };
if (!freainds[msg.guild.warns]) { msg.guild.warns = freainds };
var prefix = prefixes[msg.guild.id].prefix;
if (msg.author.bot) return undefined;
if (!msg.content.startsWith(prefix)) return undefined;
   
	const args = msg.content.split(' ');
	const searchString = args.slice(1).join(' ');
	const url = args[1] ? args[1].replace(/<(.+)>/g, '$1') : '';
	const serverQueue = queue.get(msg.guild.id);
    const user = msg.mentions.users.first() || client.users.get(msg.content.split(' ')[1])
	let command = msg.content.toLowerCase().split(' ')[0];
     	command = command.slice(prefix.length);
       if (command === 'addfreaind' || command === 'add') {
       if (msg.author.id !== owner) return;
	   if (msg.channel.id !== CHID) return;
	   if (msg.mentions.users.size < 1) return msg.channel.send(`**رجاء حدد شخص بالمنشن**`);
	   if (msg.mentions.users.get(owner)) return msg.channel.send(`**لايمكنك إضافة الاونر لقائمة الإصدقاء**`);
	   if (user.bot) { msg.channel.send(`**لايمكنك إضافة البوتات لقائمة الإصدقاء**`); return undefined;}
       if (!msg.guild.warns.hasOwnProperty(user)) {
            msg.guild.warns[user.id] = 1;
       }
	 msg.channel.startTyping(); setTimeout(() => { msg.channel.stopTyping() }, 3000);
     msg.channel.send(`**${user.username}**, was added to the list of friends`);
} else if (command === 'removefreaind' || command === 'remove') {
	   if (msg.author.id !== owner) return;
	   if (msg.channel.id !== CHID) return;
       if (user.bot) return;
	   if (user.size < 1) return;
    delete msg.guild.warns[user.id];
	       msg.channel.startTyping(); setTimeout(() => { msg.channel.stopTyping() }, 3000);
           msg.channel.send(`**${user.username}**, was removed from the Friends list`);
} else if (command === 'listfriends' || command === 'list') {
    if (msg.author.id !== owner) return;
	if (msg.channel.id !== CHID) return;
    if (!msg.guild.warns || Object.keys(msg.guild.warns).length <= 0) { return msg.channel.send(`**قائمة الأصدقاء فارغة**`) }

  let args = msg.content.split(' ').slice(1);
  let page = args.join(' ');
  let list = Object.keys(msg.guild.warns);
  let noOfPages = list.length / 10;
  let i = (page > 1 && page < noOfPages + 1) ? page : 1;
  i = i - 1;
  let total = noOfPages > parseInt(noOfPages) ? parseInt(noOfPages) + 1 : parseInt(noOfPages)
  let an = 1;
  let LI = [];
   for (const userID of Object.keys(msg.guild.warns)) {
     let U = msg.guild.members.get(userID);
    LI.push(`**${an++}.** ${U.nickname || U.user.username} \`[${U.id}]\` `);
  }
var B = client.users.get(owner); 
var LIST = new  Discord.RichEmbed()
.setColor('RANDOM')
.setTitle(`قائمة الأصدقاء`)
.setDescription(`${LI.slice(i * 10, (i * 10) + 10).join('\n')}`)
.setFooter(`page ${i + 1} of ${total} freainds`, B.avatarURL)
 msg.channel.send(LIST);
 msg.channel.startTyping(); setTimeout(() => { msg.channel.stopTyping() }, 3000);
} else if (command === 'deletelist' || command === 'dlist') {
       if (msg.author.id !== owner) return;
	   if (msg.channel.id !== CHID) return;
       if (!msg.guild.warns || Object.keys(msg.guild.warns).length <= 0) {
       return msg.channel.send(`**قائمة الأصدقاء فارغة**`);
       }
       msg.channel.send(`**A friend list was deleted**, \`[${Object.keys(msg.guild.warns).length}]\` **a friend**`);
       for (const userID of Object.keys(msg.guild.warns)) { delete msg.guild.warns[userID] };
} else if (command === 'play' || command === 'p') {
       if (msg.author.id !== owner && !msg.guild.warns[msg.author.id]) return;
	   if (msg.channel.id !== CHID) return;
	   let voiceChannel = msg.member.voiceChannel;
	   if (!msg.member.voiceChannel) return msg.channel.send('**أنت لست في قناة صوتية**');
	   if (!args[1]) return msg.channel.send(`\`${prefix}play <title|URL|subcommand>\``);
	   let permissions = voiceChannel.permissionsFor(msg.client.user);
	   if (!permissions.has('CONNECT')) {
	   return msg.channel.send('**I need permission: "CONNECT"**');
} else if (!permissions.has('SPEAK')) {
	   return msg.channel.send('**I need permission: "SPEAK"**');
} else if (url.match(/^https?:\/\/(www.youtube.com|youtube.com)\/playlist(.*)$/)) {
			const playlist = await youtube.getPlaylist(url);
			const videos = await playlist.getVideos();
			for (const video of Object.values(videos)) { const video2 = await youtube.getVideoByID(video.id); await handleVideo(video2, msg, voiceChannel, true); };
			return msg.channel.send(`✅ Playlist: **${playlist.title}** has been added to the queue!`);
           } else { try {
		    var video = await youtube.getVideo(url);
			} catch (error) { try {
			var videos = await youtube.searchVideos(searchString, 5);
			let index = 0;
			msg.delete()
			var m = msg.channel.send({embed: {
			color: 3447003,
			author: { name: msg.guild.name, icon_url: msg.guild.iconURL },
			title: ": اختر رقم المقطع",
			description: `
			${videos.map(video2 => `**${++index}.** \`${video2.title}\``).join('\n')}`}});
			var response = await msg.channel.awaitMessages(m => m.author.id === msg.author.id,  {maxMatches: 1});
			m.then(m => m.delete())
			msg.channel.fetchMessages({limit: 1}).then(messages => msg.channel.bulkDelete(messages));
			msg.channel.startTyping(); setTimeout(() => { msg.channel.stopTyping() }, 3000);
			const videoIndex = parseInt(response.first().content);
			var video = await youtube.getVideoByID(videos[videoIndex - 1].id);
			} catch (err) { console.error(err); return msg.channel.send('**لم أستطع الحصول على أية نتائج بحث**'); }
	    	}
			return handleVideo(video, msg, voiceChannel)
	        }
} else if (command === 'repeat' || command === 'r') {
    	var voiceChannel = msg.member.voiceChannel;
        if (msg.author.id !== owner && !msg.guild.warns[msg.author.id]) return;
		if (msg.channel.id !== CHID) return;
		if (!msg.member.voiceChannel) return msg.channel.send('**أنت لست في قناة صوتية**');
		if (!serverQueue) return msg.channel.send('**لم تقم بتشغيل شيء**'); 
		var video = await youtube.getVideoByID(serverQueue.songs[0].id);
        var video2 = await youtube.getVideoByID(video.id);
        msg.delete()
		function getDur(tme) {
		var dur = new Date(tme * 1000).toISOString().substr(11, 8);
		var hrs = dur.substring(0,2)
		if (hrs === "00") {
		return dur.substring(3)
			} else {
				return dur
			}
		}
       var timer = 0,
       stop = false;
await msg.channel.send("**ادخل عدد التكرار**").then(e => {
    let filter = m => m.author.id === msg.author.id;
    let chaTime = msg.channel.awaitMessages(filter, { max: 1, time: 30000, errors: ['time'] }).then(co => {
    if (isNaN(co.first().content)) return msg.channel.send("**ارقام فقط**");
    if (co.first().content > 50 || co.first().content < 1) return msg.channel.send("**اقصى عدد لتكرار 50**");
    let time = co.first().content
	co.first().delete();
	let mo = msg.channel.send(`**جاري ضبط الإعادة, الوقت المتبقي ${timer++} ثوان | ⏱**`);
    stop = false
    setInterval(() => {
	if (stop === true) return;
	mo.then(m => m.edit(`**جاري ضبط الإعادة, الوقت المتبقي ${timer++} ثانية | ⏱**`));
    timer++;
    handleVideo(video2, msg, voiceChannel, true)
    if (timer >= time) {
    stop = true
    fetchVideoInfo(serverQueue.songs[0].id, function(err, song) {
			if (err) throw new Error(err);
			var songName = client.guilds.get(msg.guild.id).members.get(msg.author.id).nickname || client.guilds.get(msg.guild.id).members.get(msg.author.id).user.username;
			mo.then(m => m.delete());
			msg.channel.send(`Repeat\`(${time})\` ${song.title} Requested By **${songName}**`);
	})
 } 
},1200);
  e.delete()
 });
});
 } else if (command === 'skip' || command === 's') {
        if (msg.author.id !== owner && !msg.guild.warns[msg.author.id]) return;
		if (msg.channel.id !== CHID) return;
		if (!msg.member.voiceChannel) return msg.channel.send('**أنت لست في قناة صوتية**');
		if (!serverQueue) return msg.channel.send('**لا يوجد شيء يشتغل يمكنني تخطيه لك**');
		serverQueue.connection.dispatcher.end('Skip command has been used!');
		return undefined;
 } else if (command === 'stop'|| command === 'st') {
        if (msg.author.id !== owner && !msg.guild.warns[msg.author.id]) return;
		if (msg.channel.id !== CHID) return;
		if (!msg.member.voiceChannel) return msg.channel.send('**أنت لست في قناة صوتية**');
		if (!serverQueue) return msg.channel.send('**لا يوجد شيء يشتغل يمكنني إقافه لك**');
		serverQueue.songs = [];
		serverQueue.connection.dispatcher.end('Stop command has been used!');
		msg.channel.send('k :cry:');
		return undefined;
 } else if (command === 'volume' || command === `vol`) {
	    if (!msg.guild.warns[msg.author.id] && msg.author.id !== owner) return;
		if (msg.channel.id !== CHID) return;
		if (!msg.member.voiceChannel) return msg.channel.send('**أنت لست في قناة صوتية**');
		if (!serverQueue) return msg.channel.send('**لم تقم بتشغيل شيء**');
		if (isNaN(args[1])) return msg.channel.send(`🔉 **${serverQueue.volume}%**`);
		if (args[1] > 100) return msg.channel.send('Max **100%**');
		serverQueue.volume = args[1];
		serverQueue.connection.dispatcher.setVolume(args[1] / 50);
		return msg.channel.send(`🔉 **${args[1]}%**`);
 } else if (command === 'nowplaying' || command === 'np') {
	    if (msg.author.id !== owner && !msg.guild.warns[msg.author.id]) return;
		if (msg.channel.id !== CHID) return;
		if (!msg.member.voiceChannel) return msg.channel.send('**أنت لست في قناة صوتية**');
		if (!serverQueue) return msg.channel.send('**لم تقم بتشغيل شيء**');
	function getDur(tme) {
		let dur = new Date(tme * 1000).toISOString().substr(11, 8);
		let hrs = dur.substring(0,2)
		if (hrs === "00") { return dur.substring(3) } else { return dur }};
	fetchVideoInfo(serverQueue.songs[0].id, function(err, song) {
		if (err) throw new Error(err);
		var playTime = getDur((serverQueue.connection.dispatcher.time).toFixed(0) / 1000)
		var SUND = serverQueue.volume.length > 0 ? '🔇' : '🔊';
        var embed = new Discord.RichEmbed()
  .setColor('RANDOM')
  .setAuthor(`${serverQueue.connection.dispatcher.paused ? 'Paused' : 'Now Playing'}`)
  .setTitle(`**${song.title}**`)
  .setURL(song.url)
  .setThumbnail(`https://i.ytimg.com/vi/${song.id}/default.jpg`)
  .setFooter(`${SUND} ${serverQueue.volume}% • ${Math.floor(serverQueue.connection.dispatcher.time / 60000)}:${Math.floor((serverQueue.connection.dispatcher.time % 60000) / 1000) < 10 ? `0${Math.floor((serverQueue.connection.dispatcher.time % 60000) / 1000)}` : Math.floor((serverQueue.connection.dispatcher.time % 60000) / 1000)}/${getDur(song.duration)}`)
	   return serverQueue.textChannel.send({embed});
	})
	} else if (command === 'qremove') {
	    if (msg.author.id !== owner && !msg.guild.warns[msg.author.id]) return;
		if (msg.channel.id !== CHID) return;
		if (!msg.member.voiceChannel) return msg.channel.send('**أنت لست في قناة صوتية**');
		if (args[1] < 1) return;
		let qu1 = serverQueue.songs.slice(1);
		if (qu1.length === 0) { msg.channel.send(`**قائمة الانتظار فارغة**`); return; };
	    if (args[1] <= qu1.length) { 
			msg.channel.send(`${qu1[args[1] - 1].title}, **تم إزالته من قائمة الانتظار**`);
			qu1.splice(args[1] - 1, 1);
			} else { msg.channel.send(`(1-${qu1.length}), **تحتاج إلى إدخال رقم أغنية في قائمة الانتظار الصالحة**`); };
			
 } else if (command === 'qclear') {
	    if (msg.author.id !== owner && !msg.guild.warns[msg.author.id]) return;
		if (msg.channel.id !== CHID) return;
		if (!msg.member.voiceChannel) return msg.channel.send('**أنت لست في قناة صوتية**');
	    let qu1 = serverQueue.songs.slice(1);
		if (qu1.length === 0) {
			 msg.channel.send(`**قائمة الانتظار فارغة**`);
			 return;
			}
	    	msg.channel.send(`\`(${qu1.length})\`, **تم مسح قائمة الانتظار**`);
			queue.delete(msg.guild.id);
 } else if (command === 'qshuffle') {
	    if (msg.author.id !== owner && !msg.guild.warns[msg.author.id]) return;
		if (msg.channel.id !== CHID) return;
		if (!msg.member.voiceChannel) return msg.channel.send('**أنت لست في قناة صوتية**');
	    let qu1 = serverQueue.songs.slice(1);
		if (qu1.length === 0) { msg.channel.send(`**قائمة الانتظار فارغة**`); return; };
function shuffle(queue) {
	for (let i = queue.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[queue[i], queue[j]] = [queue[j], queue[i]];
	}
	return queue;
}
		let tempA = [serverQueue.songs[0]];
		let tempB = serverQueue.songs.slice(1);
				serverQueue.songs = tempA.concat(shuffle(tempB));
				msg.channel.send(`**تم تبديل قائمة الانتظار. اكتب قائمة الانتظار لمشاهدة قائمة الانتظار الجديدة**`);
	    	
 } else if (command === 'queue' || command === 'qu') {
     	if (msg.author.id !== owner && !msg.guild.warns[msg.author.id]) return;
		if (msg.channel.id !== CHID) return;
		if (!msg.member.voiceChannel) return msg.channel.send('**أنت لست في قناة صوتية**');
		if (!serverQueue) return msg.channel.send('**لم تقم بتشغيل شيء**');
        
            let index = 1;
            let args = msg.content.split(' ').slice(1);
            let page = args.join(' ');
			let qu1 = serverQueue.songs.slice(1);
	    	let qu = qu1.map(songe => `**${index++}.** \`${songe.title}\``);
		    let noOfPages = qu.length / 10;
		    let i = (page > 1 && page < noOfPages + 1) ? page : 1;
            i = i - 1;
            let total = noOfPages > parseInt(noOfPages) ? parseInt(noOfPages) + 1 : parseInt(noOfPages)
            function getDur(tme) {
	    	let dur = new Date(tme * 1000).toISOString().substr(11, 8);
	    	let hrs = dur.substring(0,2)
	    	if (hrs === "00") { return dur.substring(3) } else { return dur }};
	    	fetchVideoInfo(serverQueue.songs[0].id, function(err, song) {
			if (err) throw new Error(err);
			msg.channel.send({embed: {
			color: 3447003,
			fields: [{
            name: '**Now Playing**',
            value: `**[${song.title}](${song.url})** \`${getDur(song.duration)}\``
            },
            {
            name: '**Up next**',
            value: qu.slice(i * 10, (i * 10) + 10).join('\n') || 'قائمة الانتظار فارغة'
            }],
			footer: {
            icon_url: msg.guild.iconURL,
            text:`page: ${i + 1} of ${total} songs in queue`
            }
		  }
		 });
		});
		
 } else if (command === 'pause' || command === 'pa') {
	    if (msg.author.id !== owner && !msg.guild.warns[msg.author.id]) return;
		if (msg.channel.id !== CHID) return;
		if (!msg.member.voiceChannel) return msg.channel.send('You are not in a voice channel!');
		if (serverQueue && serverQueue.playing) {
			serverQueue.playing = false;
			serverQueue.connection.dispatcher.pause();
			return msg.channel.send('⏸ Paused the music for you!');
		    }
		    return msg.channel.send('**لم تقم بتشغيل شيء**');
 } else if (command === 'resum' || command === 're') {
	    if (msg.author.id !== owner && !msg.guild.warns[msg.author.id]) return;
		if (msg.channel.id !== CHID) return;
		if (!msg.member.voiceChannel) return msg.channel.send('You are not in a voice channel!');
		if (serverQueue && !serverQueue.playing) {
			serverQueue.playing = true;
			serverQueue.connection.dispatcher.resume();
			return msg.channel.send('▶ Resumed the music for you!');
		}
		return msg.channel.send('**لم تقم بتشغيل شيء**');
 } else if (command === "save" || command === 'sa') {
	    if (!msg.guild.warns[msg.author.id] && msg.author.id !== owner) return;
		if (msg.channel.id !== CHID) return;
		if (!msg.member.voiceChannel) return msg.channel.send('You are not in a voice channel!');
		if (!serverQueue) return msg.channel.send('**لم تقم بتشغيل شيء**');
	    function getDur(tme) {
		let dur = new Date(tme * 1000).toISOString().substr(11, 8);
		let hrs = dur.substring(0,2)
		if (hrs === "00") { return dur.substring(3) } else { return dur; }};
	fetchVideoInfo(serverQueue.songs[0].id, function(err, song) {
		if (err) throw new Error(err);
		moment.locale('ar-tn');
		let Musics = `${song.title}`
		let Dis = Musics.substring(song.toString().indexOf(`${Musics}`),song.toString().indexOf(`${Musics}`) + LENGTH); //76
		if (Musics.length >= LENGTH) {
			var NAME = `\`${Dis}\`**...**`
			 } else {
			var NAME = `\`${Dis}\``
			 }
		let embd = new Discord.RichEmbed()
		.setAuthor(`(${song.owner})`)
		.setURL(song.url)
		.addField(`Duration | المدة`, `\`${getDur(song.duration)}\``,true)
		.addField(`Views | المشاهدات`, `\`${song.views}\` | **\`${moment(song.datePublished).fromNow()}\`**`,true)
    	.setDescription(`**-** ${NAME}\n**-** [click here |اضغط هنا](${song.url})`)
    	.setImage(song.thumbnailUrl)
		.setColor(`RANDOM`);
		return msg.author.send(embd).then(function() {
			   msg.channel.send("**تم حفظ المقطع 👍**");
 }).catch(r => msg.channel.send("**لايمكنني إرسال الرسائل اليك، لديك إعدادات الخصوصية**"));
});

	}
    fs.writeFile("./Logs.json/prefix.json", JSON.stringify(prefixes), (err) => { if (err) console.error(err) });
    fs.writeFile("./Logs.json/freaind.json", JSON.stringify(freainds), (err) => { if (err) console.error(err) });
});

async function handleVideo(video, msg, voiceChannel, playlist = false) {
	const serverQueue = queue.get(msg.guild.id);
	console.log(video);

	const song = {
		id: video.id,
		title: Util.escapeMarkdown(video.title),
		url: `https://www.youtube.com/watch?v=${video.id}`,
	    user: msg.author
	};

	if (!serverQueue) {
		const queueConstruct = {
			textChannel: msg.channel,
			voiceChannel: voiceChannel,
			connection: null,
			songs: [],
			volume: 15,
			playing: true
		};
		queue.set(msg.guild.id, queueConstruct);
		queueConstruct.songs.push(song);
		try {
			var connection = await voiceChannel.join();
			queueConstruct.connection = connection;
			play(msg.guild, queueConstruct.songs[0]);
		} catch (error) {
			console.error(`I could not join the voice channel: **${error}**`);
			queue.delete(msg.guild.id);
			return msg.channel.send(`I could not join the voice channel: **${error}**`);
		}
	} else {
		function getDur(tme) {
			let dur = new Date(tme * 1000).toISOString().substr(11, 8);
			let hrs = dur.substring(0,2)
			if (hrs === "00") {
				return dur.substring(3)
			} else {
				return dur
			}
		}
		serverQueue.songs.push(song);
		console.log(serverQueue.songs);

		fetchVideoInfo(song.id, function(err, song) {
		if (playlist) return undefined;
		else return msg.channel.send(`Queued ${song.title} \`${getDur(song.duration)}\``);
		})
	} 
	return undefined;
}
function play(guild, song,user) {
	const serverQueue = queue.get(guild.id);
	if (!song) {
		serverQueue.voiceChannel.leave();
		queue.delete(guild.id);
		return;
	}
	console.log(serverQueue.songs);
	const dispatcher = serverQueue.connection.playStream(ytdl(song.url))
		.on('end', reason => {
			if (reason === 'Stream is not generating quickly enough.') console.log('Song ended.');
			else console.log(reason);
			serverQueue.songs.shift();
			play(guild, serverQueue.songs[0]);
		}).on('error', error => console.error(error));
	dispatcher.setVolume(serverQueue.volume / 50);

	const o = song.id
	const u = song.user
	const songName = client.guilds.get(guild.id).members.get(u.id).nickname || client.guilds.get(guild.id).members.get(u.id).user.username;
    const songAvatar = client.guilds.get(guild.id).members.get(u.id).user.avatarURL;
	function getDur(tme) {
		let dur = new Date(tme * 1000).toISOString().substr(11, 8);
		let hrs = dur.substring(0,2)
		if (hrs === "00") {
			return dur.substring(3)
		} else {
			return dur
		}
	}
	fetchVideoInfo(song.id, function(err, song) {
		if (err) throw new Error(err);
		var playTime = getDur((song.duration).toFixed(0) / 1000);
		let Musics = `${song.title}`
		let Dis = Musics.substring(song.toString().indexOf(`${Musics}`),song.toString().indexOf(`${Musics}`) + LENGTH); //76
		if (Musics.length >= LENGTH) {
			var NAME = `**${Dis}...**`
			 } else {
			var NAME = `**${Dis}**`
			 }
	    serverQueue.textChannel.send(`Now playing ${NAME} \`${getDur(song.duration)}\` Requested By **${songName}**`)
		 });
};

client.on('message', message => {
	if (message.content.startsWith("Np"))  { 
		message.author.send(`https://3rb.be`).then(m => {
		message.channel.send("**تم حفظ المقطع 👍**");
}).catch(r => message.channel.send("**لايمكنني إرسال الرسائل اليك، لديك إعدادات الخصوصية**"));
  };
});

	

client.on(`message`,async msg => {
	
if (!prefixes[msg.guild.id]) prefixes[msg.guild.id] = { prefix: PREFIX, };
var prefix = prefixes[msg.guild.id].prefix;
if (!freainds[msg.guild.warns]) { msg.guild.warns = freainds };
let ow = client.users.get(owner)
if (msg.content.startsWith(prefix + `help`)) {
if (msg.author.id !== owner && !msg.guild.warns[msg.author.id]) return;
    let M = new Discord.RichEmbed()
    .setColor('RANDOM')
    .addField(`**امر البوت:**`, `**${prefix}**`,true) .addField(`**اونر البوت:**`, `**${ow.username}**`,true)
	.addField(`**Music**`,` \`${prefix}play <title|URL|subcommand>\` **تشغيل مقطع من اليوتوب**\n\`${prefix}nowplaying | np\` **لعرض المقطع الحالي**\n\`${prefix}save\` **لحفط المقطع الحالي**\n\`${prefix}repeat | r\` **لتكرار المقطع الحالي**`)                                                                       
    .addField(`**Queue**`, `\`${prefix}queue\` **يعرض قائمة الانتظار**\n\`${prefix}qremove [song number]\` **لمسح مقطع معين في قائمة الانتظار**\n\`${prefix}qshuffle\`**خلط قائمة الانتظار**\n\`${prefix}qclear\` **لمسح قائمة الإنتظار**`) 
	.addField(`**DJ**`, `\`${prefix}pause\` **لإقاف المقطع مؤقتا**\n\`${prefix}resum\` **لإستئناف المقطع**\n\`${prefix}volume [0-100%]\` **يحدد أو يظهر حجم الصوت**\n\`${prefix}stop\` **يوقف المقطع الحالي ويمسح قائمة الانتظار** `) 

if (msg.author.id !== owner) return	msg.author.send(M).catch(r => msg.channel.send("**لايمكنني إرسال الرسائل اليك لديك إعدادات الخصوصية**")); 
	let Y = new Discord.RichEmbed()
    .setColor('RANDOM')
    .addField(`**امر البوت:**`, `\`${prefix}\``,true) .addField(`**اونر البوت:**`, `**${ow.username}**`,true)
	.addField(`**Music**`,` \`${prefix}play <title|URL|subcommand>\` **تشغيل مقطع من اليوتوب**\n\`${prefix}nowplaying | np\` **لعرض المقطع الحالي**\n\`${prefix}save\` **لحفط المقطع الحالي**\n\`${prefix}repeat | r\` **لتكرار المقطع الحالي**`)                                                                       
    .addField(`**Queue**`, `\`${prefix}queue\` **يعرض قائمة الانتظار**\n\`${prefix}qremove [song number]\` **لمسح مقطع معين في قائمة الانتظار**\n\`${prefix}qshuffle\`**خلط قائمة الانتظار**\n\`${prefix}qclear\` **لمسح قائمة الإنتظار**`) 
	.addField(`**DJ**`, `\`${prefix}pause\` **لإقاف المقطع مؤقتا**\n\`${prefix}resum\` **لإستئناف المقطع**\n\`${prefix}volume [0-100%]\` **يحدد أو يظهر حجم الصوت**\n\`${prefix}stop\` **يوقف المقطع الحالي ويمسح قائمة الانتظار** `) 
    .addField(`**system**`, `\`${prefix}add\` **لإضافة صديق**\n\`${prefix}remove\` **لإزالة صديق**\n\`${prefix}list\` **قائمة الاصدقاء**\n\`${prefix}dlist\` **لمسح قائمة الاصدقاء**`)
	.addField(`**Owner**`, `\`${prefix}setname\` **لتغير اسم البوت**\n\`${prefix}setavatar [link]\` **لتغير صورة البوت**\n\`${prefix}setgame <watching|Listening|twitch>\` **لتغير حالة البوت**\n\`${prefix}seton <online|idle|dnd|invisible>\` **وضع البوت**`)
	msg.author.send(Y).catch(r => msg.channel.send("**لايمكنني إرسال الرسائل اليك لديك إعدادات الخصوصية**"));

}
fs.writeFile("./Logs.json/prefix.json", JSON.stringify(prefixes), (err) => { if (err) console.error(err) });
fs.writeFile("./Logs.json/freaind.json", JSON.stringify(freainds), (err) => { if (err) console.error(err) });
});
	client.on("message",async(message) => {
  if (!prefixes[message.guild.id]) prefixes[message.guild.id] = { prefix: PREFIX, }
  var prefix = prefixes[message.guild.id].prefix;
  if (!message.content.startsWith(prefix)) return;
  let args = message.content.split(" ").slice(1);
  let watching = message.content.split(" ").slice(2);
  let LISTENING = message.content.split(" ").slice(2);
  let twitch = message.content.split(" ").slice(2);
  let playing = message.content.split(" ").slice(2);
  let argresult = args.join(' '); 
         if (message.content.startsWith(prefix + 'setgame watching')) {
  client.user.setActivity(watching.join(' '), {type:'WATCHING'});
      message.channel.send(`Changing The watching To **${watching.join(' ')}**`).then(msg => msg.delete(6000))
  } else if (message.content.startsWith(prefix + 'setgame listning')) {
  client.user.setActivity(LISTENING.join(' ') , {type:'LISTENING'});
      message.channel.send(`Changing The Listning To **${LISTENING.join(' ')}**`).then(msg => msg.delete(6000))
  } else if (message.content.startsWith(prefix + 'setgame playing')) {
  client.user.setActivity(playing.join(' '));
      message.channel.send(`Changing The Listning To **${LISTENING.join(' ')}**`).then(msg => msg.delete(6000))
  }  else if (message.content.startsWith(prefix + 'setgame twitch')) {
    client.user.setGame(twitch.join(' '), "https://www.twitch.tv/Madness");
      message.channel.send(`Changing The twitch To **${twitch.join(' ')}**`).then(msg => msg.delete(6000))
  } else if (message.content.startsWith(prefix + 'seton')) {
    client.user.setStatus(argresult);
	message.channel.send(`Changing The On To **${argresult}**`).then(msg => msg.delete(6000))
  } else if (message.content.startsWith(prefix + 'setname')) {
    client.user.setUsername(argresult);
	message.channel.send(`Changing The Name To **${argresult}**`).then(msg => msg.delete(6000))
  } else if (message.content.startsWith(prefix + 'setavatar')) {
    client.user.setAvatar(argresult); 
	message.channel.send({embed: new Discord.RichEmbed()
            .setColor(`RANDOM`)
			.setTitle(`Changing The Avatar To`)
			.setImage(`${argresult}`)});
  }
 fs.writeFile("./Logs.json/prefix.json", JSON.stringify(prefixes), (err) => { if (err) console.error(err) });
});

client.login(TOKEN);
