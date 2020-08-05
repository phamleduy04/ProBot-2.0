const { Client } = require('discord.js');
const { config } = require('dotenv');
const db = require('quick.db');
config({
    path: __dirname + "/.env"
})

const { ownerID, setupchannelID } = require('./config.json');

const client = new Client({
    disableMentions: 'everyone'
});

client.on('ready', () => {
    console.log('Bot đã sẵn sàng để hoạt động!');
    client.user.setPresence({
        status: 'online',
        activity: {
            name: 'Sử dụng ở room #response-bot',
            type: 'PLAYING'
        }
    })
})

client.on('message', async message => {
    if (message.author.bot) return;
    if (db.has(message.content.trim().toLowerCase())) {
        let res_arr = db.get(message.content.trim().toLowerCase());
        message.channel.send(res_arr[Math.floor(Math.random() * res_arr.length)])
    }
    else if (message.channel.type == 'dm' && message.author.id == ownerID) {
        const args = message.content.trim().split(/ +/g).shift();
        if (message.content.toLowerCase().startsWith('eval')) {
            const { inspect } = require('util');
            const { stripIndents } = require('common-tags')
            const { VultrexHaste } = require('vultrex.haste')
            const haste = new VultrexHaste({ url: "https://hasteb.in" })
            if (!args[0]) return message.reply('Nhập lệnh để chạy code...')
            try {
                const start = process.hrtime();
                let output = eval(args.join(' '));
                const difference = process.hrtime(start);
                if (typeof output !== 'string') output = inspect(output, { depth: 2 });

                return message.channel.send(stripIndents`
                    *Lệnh đã chạy xong trong ${difference[0] > 0 ? `${difference[0]}s `: ''}${difference[1]/ 1e6}ms*
                    \`\`\`js
                    ${output.length > 1950 ? await haste.post(output) : output}
                    \`\`\`
                `)
            }
            catch(err) {
                return message.channel.send(stripIndents`
                    Error:
                    \`${err}\`
                `)
            }
        }
    }
    else if (message.channel.id == setupchannelID) {
        if (message.content.includes(':')) {
            let args = message.content.split(':');
            if (args.length !== 2) {
                message.channel.send('Nhập theo cú pháp: `trigger:response` để setup');
                return await message.react('❌');
            }
            let trigger = args[0].toLowerCase().trim();
            let response = args[1].trim();
            if (db.has(trigger)) {
                db.push(trigger, response);
            } else {
                db.set(trigger, [response]);
            }
            await message.react('✅');
        } else {
            message.channel.send('Nhập theo cú pháp: `trigger:response` để setup');
            await message.react('❌');
        }
    }
})

client.login(process.env.TOKEN);