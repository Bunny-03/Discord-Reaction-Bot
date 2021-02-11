const express = require("express");
const fetch = require ('node-fetch')
const app = express();


app.get("/", (req, res) => {
  res.send('Hello There , This is Reaction Bot and now its online Thanks (BunnySupport)')
});

function pong() { 

  
console.log('Bunny is God')
} 

setInterval(pong, 60000);

// listen for requests | Don't change this!
const listener = app.listen(process.env.PORT, () => {
  console.log("Listening on PORT " + listener.address().port);
});

const { Client, MessageEmbed } = require('discord.js');

const fs = require('fs');

require('dotenv').config();

const client = new Client();

client.login(process.env.BOT_TOKEN);

client.on('ready', async () => {

    console.log('Ready and start reacting!');
    client.user.setActivity('-help Coded by KG彡ζ͜͡𝐆𝐖➣INCASX丶Bunny#6229', { type: 'WATCHING' });

    let reactions = JSON.parse(fs.readFileSync('./config/reactions.json', 'utf8'));

    client.guilds.cache.forEach(g => {
        g.channels.cache.forEach(async c => {
            if (reactions[c.id]) {
                for (let messageID in reactions[c.id]) {
                    await c.messages.fetch(messageID).then(msgID => {
						for (let reaction in reactions[c.id][messageID]) {
							msgID.react(reaction);
						}
					}).catch(() => {
						delete reactions[c.id][messageID];
						fs.writeFileSync("./config/reactions.json", JSON.stringify(reactions, null, 4), err => {});
					})
                }
            }
        })
    })


});

client.on('message', async message => {

    let prefixes = JSON.parse(fs.readFileSync('./config/prefixes.json', 'utf8'));

    if (!prefixes[message.guild.id]) {
        prefixes[message.guild.id] = "-";//Your Prefix which will set to be defulat
        fs.writeFileSync('./config/prefixes.json', JSON.stringify(prefixes, null, 4), err => { });
    }

    if (message.author.bot) return;

    let prefix = prefixes[message.guild.id];

    if (message.content.startsWith(`<@!${client.user.id}>`) || message.content.startsWith(`<@${client.user.id}>`)) { return message.channel.send(`My prefix in this server is: \`${prefix}\``) }

    if (!message.content.startsWith(prefix)) return;

    const args = message.content.slice(prefix.length).trim().split(/ +/g);

    const cmd = args.shift();

    switch (cmd.toLowerCase()) {
		case 'purge':
            if (!args[0]) return message.channel.send(`Please provide an amount of messages`);
            if (isNaN(args[0])) return message.channel.send(`The amount of messages need to be numeric value.`);
            let amount = parseInt(args[0]);
            if (amount === 0) return message.channel.send(`The amount of messages cannot be 0`);
            if (amount > 100) amount = 100;
            await message.channel.messages.fetch({ limit: amount }).then(msgs => {
                message.channel.bulkDelete(amount).then(() => {
                    message.channel.send(`Deleted ${msgs.size} messages.`);
                }).catch(() => message.channel.send(`I cannot delete messages more than 2 weeks.`));
            });
            break;
        case 'prefix':
            message.channel.send(`The prefix in this server is: \`${prefixes[message.guild.id]}\``);
            break;
        case 'setprefix':
            if (!message.member.hasPermission('ADMINISTRATOR')) return message.channel.send(`You don't have permission to use this command.`);

            if (!args[0]) return message.channel.send(`Please provide a prefix. (Current prefix: ${prefixes[message.guild.id]})`);

            prefixes[message.guild.id] = args.join(' ');
            fs.writeFileSync('./config/prefixes.json', JSON.stringify(prefixes, null, 4), err => { });

            message.channel.send(`The current prefix in this server is now: \`${args.join(' ')}\``);
            break;
        case 'help':
            let embedHelp = new MessageEmbed()
                .setTitle('Help Menu')
                .setColor('Random')
                .setThumbnail(client.user.displayAvatarURL())
                .setDescription('Create a reaction role with this Bot!')
                .addField(
                    `Basic Commands`,
                    `**-r help - Help Menu**

                    **${prefix}prefix - get the current prefix of this server.**

                    **${prefix}setprefix - set the current prefix of this server.**

                    **${prefix}create [channel] [messageID] [emoji] [role] - create a reaction role.**

                    **${prefix}crembed [channel] [emoji] [role] [embed Title | embed Description] - create a embed reaction role.**`);

            message.channel.send(embedHelp);
            break;
        case 'create':
            if (!message.member.hasPermission('ADMINISTRATOR')) return message.channel.send(`You don't have permission to use this command.`);
            let reactions = JSON.parse(fs.readFileSync('./config/reactions.json', 'utf8'));
            if (!args[0]) return message.channel.send('Please provide a channel.');
            if (!message.guild.me.hasPermission('MANAGE_CHANNELS')) return message.channel.send(`I cannot manage the channel. I need Manage Channels permission`);
            let channel = message.mentions.channels.first() || message.guild.channels.cache.get(args[0]);
            if (!args[1]) return message.channel.send('Please provide a message ID.');
            if (isNaN(args[1])) return message.channel.send(`Please provide a valid message ID`);
            await channel.messages.fetch(args[1]).then(async msgID => {
                if (!args[2]) return message.channel.send('Please provide a emoji.');
                let emoji = args[2];
                if (!args[3]) return message.channel.send('Please provide a role.');
                if (!message.guild.me.hasPermission('MANAGE_ROLES')) return message.channel.send(`I cannot manage the role. I need Manage Roles permission`);
                let role = message.mentions.roles.first() || message.guild.roles.cache.get(args[3]) || message.guild.roles.cache.find(r => r.name === args.slice(args[0].length + 1 + args[1].length + 1 + args[2].length + 1).join(' '));
                if (!role) message.channel.send(`The role does not exist.`);
                if (!message.guild.me.hasPermission('ADD_REACTIONS')) return message.channel.send(`I cannot react the message. I need Add Reactions permission`);
                msgID.react(emoji);

                if (!reactions[channel.id]) {
                    reactions[channel.id] = {
                        [msgID.id]: {
                            [emoji]: role.name
                        }
                    };
                } else {
                    if (!reactions[channel.id][msgID.id]) {
                        reactions[channel.id][msgID.id] = {
                            [emoji]: role.name
                        }
                    } else {
                        reactions[channel.id][msgID.id][emoji] = role.name;
                    }
                }

                fs.writeFileSync('./config/reactions.json', JSON.stringify(reactions, null, 4), err => { });

                if (!message.guild.me.hasPermission('EMBED_LINKS')) {
                    return (await message.channel.send(`I cannot send embedded message. I will send in a normal message.`).then(() => {
                        message.channel.send(
                            `**Reaction Role Created**
                            **Channel**: ${channel}
                            **Message ID**: ${msgID.id}
                            **Emoji**: ${emoji}
                            **Role**: ${role.name}`
                        )
                    }));
                } else {
                    message.channel.send({
                        embed: {
                            title: "Reaction Role Created",
                            color: "#19ce0e",
                            fields: [
                                {
                                    name: "Channel",
                                    value: channel,
                                    inline: true
                                },
                                {
                                    name: "Message ID",
                                    value: msgID.id,
                                    inline: true
                                },
                                {
                                    name: "Emoji",
                                    value: emoji,
                                    inline: true
                                },
                                {
                                    name: "Role",
                                    value: role,
                                    inline: true
                                }
                            ]
                        }
                    });
                }
            }).catch(() => {
                message.channel.send(`The message does not exist in that channel`);
                return;
            });
            break;
        case 'crembed':
            if (!message.member.hasPermission('ADMINISTRATOR')) return message.channel.send(`You don't have permission to use this command.`);
            let reactionsEmbed = JSON.parse(fs.readFileSync('./config/reactions.json', 'utf8'));
            if (!args[0]) return message.channel.send('Please provide a channel.');
            if (!message.guild.me.hasPermission('MANAGE_CHANNELS')) return message.channel.send(`I cannot manage the channel. I need Manage Channels permission`);
            let channelEmbed = message.mentions.channels.first() || message.guild.channels.cache.get(args[0]);
            if (!args[1]) return message.channel.send('Please provide a emoji.');
            let emojiEmbed = args[1];
            if (!args[2]) return message.channel.send('Please provide a role.');
            if (!message.guild.me.hasPermission('MANAGE_ROLES')) return message.channel.send(`I cannot manage the role. I need Manage Roles permission`);
            let roleEmbed = message.mentions.roles.first() || message.guild.roles.cache.get(args[2]);
            if (!roleEmbed) message.channel.send(`The role does not exist.`);
            if (!message.guild.me.hasPermission('ADD_REACTIONS')) return message.channel.send(`I cannot react the message. I need Add Reactions permission`);
            // msgID.react(emoji);
            if (!args[3]) return message.channel.send('Please provide a embed title and a description.');
            let titleNdescription = args.join(' ').slice(args[0].length + 1 + args[1].length + 1 + args[2].length + 1).split(" | ");

            let msgID_Embed = await channelEmbed.send({ embed: { title: titleNdescription[0], description: titleNdescription[1], color: '#19ce0e' } });
            msgID_Embed.react(emojiEmbed);

            if (!reactionsEmbed[channelEmbed.id]) {
                reactionsEmbed[channelEmbed.id] = {
                    [msgID_Embed.id]: {
                        [emojiEmbed]: roleEmbed.name
                    }
                };
            } else {
                if (!reactionsEmbed[channelEmbed.id][msgID_Embed.id]) {
                    reactionsEmbed[channelEmbed.id][msgID_Embed.id] = {
                        [emojiEmbed]: roleEmbed.name
                    }
                } else {
                    reactionsEmbed[channelEmbed.id][msgID_Embed.id][emojiEmbed] = roleEmbed.name;
                }
            }

            fs.writeFileSync('./config/reactions.json', JSON.stringify(reactionsEmbed, null, 4), err => { });

            if (!message.guild.me.hasPermission('EMBED_LINKS')) {
                return message.channel.send(`I cannot send embedded message. I will send in a normal message.`).then(() => {
                    message.channel.send(
                        `**Reaction Role Created**
                        **Channel**: ${channelEmbed}
                        **Message ID**: ${msgID_Embed.id}
                        **Emoji**: ${emojiEmbed}
                        **Role**: ${roleEmbed.name}`
                    )
                });
            } else {
                message.channel.send({
                    embed: {
                        title: "Reaction Role Created",
                        color: "#19ce0e",
                        fields: [
                            {
                                name: "Channel",
                                value: channelEmbed,
                                inline: true
                            },
                            {
                                name: "Message ID",
                                value: msgID_Embed.id,
                                inline: true
                            },
                            {
                                name: "Emoji",
                                value: emojiEmbed,
                                inline: true
                            },
                            {
                                name: "Role",
                                value: roleEmbed,
                                inline: true
                            }
                        ]
                    }
                });
            }
            break;
    }

});

client.on('messageReactionAdd', async (reaction, user) => {
    if (user.bot) return;

    let reactions = JSON.parse(fs.readFileSync('./config/reactions.json', 'utf8'));

    if (reactions[reaction.message.channel.id]) {
        if (reactions[reaction.message.channel.id][reaction.message.id]) {
            if (reactions[reaction.message.channel.id][reaction.message.id][reaction.emoji]) {
                let role = reaction.message.guild.roles.cache.find(r => r.name === reactions[reaction.message.channel.id][reaction.message.id][reaction.emoji]);
                reaction.message.guild.members.cache.get(user.id).roles.add(role);
            }
        }
    }

})

client.on('messageReactionRemove', async (reaction, user) => {
    if (user.bot) return;

    let reactions = JSON.parse(fs.readFileSync('./config/reactions.json', 'utf8'));

    if (reactions[reaction.message.channel.id]) {
        if (reactions[reaction.message.channel.id][reaction.message.id]) {
            if (reactions[reaction.message.channel.id][reaction.message.id][reaction.emoji]) {
                let role = reaction.message.guild.roles.cache.find(r => r.name === reactions[reaction.message.channel.id][reaction.message.id][reaction.emoji]);
                reaction.message.guild.members.cache.get(user.id).roles.remove(role);
            }
        }
    }

})


