const {MessageEmbed } = require("discord.js");
const client = require("../index");
const Levels = require('discord-xp');
const mongo = require('../mongo')
const userSchema = require('../schemas/setup');
const { Mongoose } = require("mongoose");
const caseSchema = require('../schemas/case-schema');
const reactionSchema = require("../schemas/reaction-schema");
const supportSchema = require("../schemas/support-schema");
const ticketSchema = require('../schemas/ticket-schema')

const checkBansAndMutes = async () =>{
    console.log("Checking Bans And Mutes")    
    let now = new Date();
        let conditionalBan = {
            expires: {
                $lt: now
            },
            current: true,
            action: "Ban"
        }
        let conditionalMute = {
            expires: {
                $lt: now
            },
            current: true,
            action: "Mute"
        }
        await mongo().then(async (mongoose) =>{
            try {
    let results = await caseSchema.find(conditionalBan)
    if(results && results.length){
        for(let result of results){
            let {guildId, userId} = result
            let guild = client.guilds.cache.get(guildId)

            try {
                guild.members.unban(userId) 
                try {
                    let caseNumber = await caseSchema.find({guildId: guild.id})
                    let count = caseNumber.length + 1;
                   await new caseSchema({
                       action: "Unban",
                       user: result.user,
                       userId: userId,
                       guildId: guild.id,
                       reason: "Time Expired",
                       staffTag: client.user.tag,
                       case: count,
                       auto: true,
                       resolved: false,
                   }).save()
                   
                    const banmod = await userSchema.findOne({_id: guild.id})
                    if(banmod){
                    let channelId = banmod.moderationId
                    let channel = guild.channels.cache.get(channelId)    
                    const exampleEmbed1 = new MessageEmbed()
                .setColor('#FF0000')
                .setTitle(`Unban - Case #${count}`)
                .addFields(
                {name: 'User', value: `${result.user}`},
                {name: 'User ID', value: `${userId}`},
                {name: 'Reason', value: `Time Expired`},
                {name: `Moderator`, value: `${client.user.tag}`},
            ) 
                    await channel.send({ embeds: [exampleEmbed1] })
                    }
                } catch (error) {
                    console.log("Error sending message to channel")
                    console.log(error)
                }
            } catch (error) {
                console.log("There was an error unbaning the user")
            }        
        }
        await caseSchema.updateMany(conditionalBan, {
            current: false
        })
    }
    let results2 = await caseSchema.find(conditionalMute,)
    if(results2 && results2.length){
        for(let result2 of results2){
            let {guildId, userId} = result2
            let guild = client.guilds.cache.get(guildId)
            let member = (await guild.members.fetch()).get(userId)
            let muteRole = guild.roles.cache.find(role => {
                return role.name === 'Muted'
            })
            try {
                member.roles.remove(muteRole)
                try {
                    let caseNumber = await caseSchema.find({guildId: guild.id})
                    let count = caseNumber.length + 1;
                   await new caseSchema({
                       action: "Unmute",
                       user: member.user.tag,
                       userId: member.id,
                       guildId: guild.id,
                       reason: "Time Expired",
                       staffTag: client.user.tag,
                       case: count,
                       auto: true,
                       resolved: false,
                   }).save()

                    const mutemod = await userSchema.findOne({_id: guild.id})
                    if(mutemod){
                    let channelId = mutemod.moderationId
                    let channel = guild.channels.cache.get(channelId)    
                    const exampleEmbed1 = new MessageEmbed()
                .setColor('#FF0000')
                .setTitle(`Unmute - Case #${count}`)
                .addFields(
                {name: 'User', value: `${member.user.tag}`},
                {name: 'User ID', value: `${member.id}`},
                {name: 'Reason', value: `Time Expired`},
                {name: `Moderator`, value: `${client.user.tag}`},
            ) 
                    await channel.send({ embeds: [exampleEmbed1] })
                    }
                } catch (error) {
                    console.log("Error sending message to channel")
                    console.log(error)
                }
            } catch (error) {
                console.log("There was an error unmuting the user")
            }      
        }
        await caseSchema.updateMany(conditionalMute,{
            current: false
        })
    }
} catch (error) {
        } finally {
            mongoose.connection.close();
        }
    })
    setTimeout(checkBansAndMutes, 1000 * 60)
}
checkBansAndMutes()

client.on("ready", () =>
    console.log(`${client.user.tag} is up and ready to go!`),
);

client.on("messageReactionAdd", async(reaction, user, message)=>{
    if (user.id === client.user.id) return
    await mongo().then(async (mongoose) =>{
        try {
            let support = await supportSchema.findOne({guildId: reaction.message.guildId, reactionMessage: reaction.message.id})
            if(support){
                reaction.users.remove(user.id)
                if(reaction.emoji.name != "✅") return
                let category = reaction.message.guild.channels.cache.find(channel => channel.id === support.category)
               if(!reaction.message.guild.channels.cache.find(channel => channel.name === `ticket-${user.username.toLowerCase()}${user.discriminator}`)){
                const ticketChannel = await reaction.message.guild.channels.create(`ticket-${user.username}${user.discriminator}`, { parent: category, type: "GUILD_TEXT",})
                let newChannel;
                if(support.welcomeMessage == null){newChannel = await ticketChannel.send(`React with the X on this message to close the ticket!`)} 
                else {
                    let messageText = "";
                    let message = support.welcomeMessage
                    message = message.split("(/n)")
                    for (let index = 0; index < message.length; index++) {
                         messageText += message[index] + "\n"
                    }
                    messageText = messageText.trim();
                    newChannel = await ticketChannel.send(`${messageText}\nReact with the X on this message to close the ticket!`)}
                newChannel.react("❌")
                ticketChannel.lockPermissions();
                ticketChannel.permissionOverwrites.edit(user.id, { VIEW_CHANNEL: true, SEND_MESSAGES: true });

                await ticketSchema.create({
                    guildId: reaction.message.guildId,
                    channel: ticketChannel.id,  
                    message: newChannel.id,
                })
            
                
            }
        }

        const found = await ticketSchema.findOne({guildId: reaction.message.guildId, channel: reaction.message.channelId, message: reaction.message.id})
        if(found && reaction.emoji.name != "❌"){
            reaction.users.remove(user.id)
        }
        if(reaction.emoji.name == "❌" && user.id != client.user.id && found){
            let channel = reaction.message.guild.channels.cache.find(channel => channel.id === found.channel)
            channel.delete()
            await ticketSchema.findOneAndDelete({guildId: reaction.message.guildId, channel: reaction.message.channelId, message: reaction.message.id})
        }



            let test = await reactionSchema.findOne({guildId: reaction.message.guildId, messageId: reaction.message.id, emoji: reaction.emoji.toString()})
            if(test){
                let role = reaction.message.guild.roles.cache.find(role => {
                    return role.id === test.role
                })
                await reaction.message.guild.members.cache.get(user.id).roles.add(role.id)
            }
        } finally {
        }
        
    })
})
client.on("messageReactionRemove", async(reaction, user)=>{
    if (user.bot) return
    await mongo().then(async (mongoose) =>{
        try {
            let test = await reactionSchema.findOne({guildId: reaction.message.guildId, messageId: reaction.message.id, emoji: reaction.emoji.toString()})
            if(test){
                let role = reaction.message.guild.roles.cache.find(role => {
                    return role.id === test.role
                })
                await reaction.message.guild.members.cache.get(user.id).roles.remove(role.id)
            }
        } finally {
        }
        
    })
})




client.on('guildMemberAdd',async(member) =>{   
    try {
        Levels.createUser(member.id, member.guild.id);
    } catch (error) {
        console.log("The user already exsists")
    }
        await mongo().then(async (mongoose) =>{
            try {
                const result = await userSchema.findOne({_id: member.guild.id})
                if(result){
                let channelId = result.memberId
                let channel = member.guild.channels.cache.get(channelId)
                const message = '**' + member.user.username + ' has joined the server**' +'\n There is now ' + member.guild.memberCount + ' members in the server.'
                channel.send(message)
                }

                const currentMute = await caseSchema.findOne({
                    userId: member.id,
                    guildId: member.guild.id,
                    current: true,
                    action: "Mute",
                })
                if(currentMute){
                    const role = member.guild.roles.cache.find(role => {
                        return role.name === 'Muted'
                    })
                    if(role){
                        member.roles.add(role)
                    }
                    
                }


            }
            finally {
                mongoose.connection.close();
            }
        })

})
client.on('guildMemberRemove', async (member) =>{
        await mongo().then(async (mongoose) =>{
            try {
                const result = await userSchema.findOne({_id: member.guild.id})
                if(result){
                let channelId = result.memberId
                let channel = member.guild.channels.cache.get(channelId)
                const message = '**' + member.user.username + ' has left the server**' +'\n There is now ' + member.guild.memberCount + ' members in the server.'
                channel.send(message)
                }
            } finally {
                mongoose.connection.close();
            }
        })
})
client.on('guildMemberAdd',member =>{
    
try {
    if(member.guild.channels.cache.find(channel => channel.name === '📊Server Stats📊'))
    {
        let stats = member.guild.channels.cache.find(channel => channel.name === '📊Server Stats📊').children.map(g => g.name)
        let usersChannel = null;
        let membersChannel = null;
        let botsChannel = null;
        for (let index = 0; index < stats.length; index++) {
            if(stats[index].includes("Users")){usersChannel = stats[index].toString()}
            if(stats[index].includes("Members")){membersChannel = stats[index].toString()}
            if(stats[index].includes("Bots")){botsChannel = stats[index].toString()}  
        }
        if(usersChannel != null){
        usersChannel1 = member.guild.channels.cache.find(channel => channel.name === usersChannel).id
        member.guild.channels.cache.get(usersChannel1).setName(`Total Users: ${member.guild.memberCount}`)  
    }
        if (membersChannel != null) {
            membersChannel1 = member.guild.channels.cache.find(channel => channel.name === membersChannel).id
            member.guild.channels.cache.get(membersChannel1).setName(`Members: ${member.guild.members.cache.filter(m=> !m.user.bot).size}`)
        }
        if (botsChannel != null) {
            botsChannel1 = member.guild.channels.cache.find(channel => channel.name === botsChannel).id
            member.guild.channels.cache.get(botsChannel1).setName(`Bots: ${member.guild.members.cache.filter(m=> m.user.bot).size}`)
        }
    
    }
} catch (error) {
    
}
})
client.on('guildMemberRemove', member =>{
try {
    if(member.guild.channels.cache.find(channel => channel.name === '📊Server Stats📊'))
    {
        let stats = member.guild.channels.cache.find(channel => channel.name === '📊Server Stats📊').children.map(g => g.name)
        let usersChannel = null;
        let membersChannel = null;
        let botsChannel = null;
        for (let index = 0; index < stats.length; index++) {
            if(stats[index].includes("Users")){usersChannel = stats[index].toString()}
            if(stats[index].includes("Members")){membersChannel = stats[index].toString()}
            if(stats[index].includes("Bots")){botsChannel = stats[index].toString()}  
        }
        if(usersChannel != null){
        usersChannel1 = member.guild.channels.cache.find(channel => channel.name === usersChannel).id
        member.guild.channels.cache.get(usersChannel1).setName(`Total Users: ${member.guild.memberCount}`) 
    }
        if (membersChannel != null) {
            membersChannel1 = member.guild.channels.cache.find(channel => channel.name === membersChannel).id
            member.guild.channels.cache.get(membersChannel1).setName(`Members: ${member.guild.members.cache.filter(m=> !m.user.bot).size}`)
        }
        if (botsChannel != null) {
            botsChannel1 = member.guild.channels.cache.find(channel => channel.name === botsChannel).id
            member.guild.channels.cache.get(botsChannel1).setName(`Bots: ${member.guild.members.cache.filter(m=> m.user.bot).size}`)
        }
    
    }
} catch (error) {
    
}
    })
