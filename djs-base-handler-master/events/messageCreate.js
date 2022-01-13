const {CommandInteraction, MessageEmbed } = require("discord.js");
const client = require("../index");
const Levels = require('discord-xp');
const mongo = require('../mongo');
const blacklistSchema = require("../schemas/blacklist-schema");
const rewardsSchema = require("../schemas/rewards-schema");
const caseSchema = require("../schemas/case-schema")

client.on("messageCreate", async (message) => {
    if (message.author.bot) return;


    if(message.channelId == 925696972793462825){
        const exampleEmbed = new MessageEmbed()
        .setTitle(`Suggestion by ${message.author.tag}`)
        .setDescription(`${message.toString()}`)
        .setColor('#FF0000')
            let messageToReact = await message.channel.send({ embeds: [exampleEmbed] })
            message.delete();
            await messageToReact.react("✅")
            messageToReact.react("❌")
    }


    await mongo().then(async (mongoose) =>{
        try {
           let listWords = await blacklistSchema.findOne({guildId: message.guildId})
            let whitelisted = false
            for (let index = 0; index < listWords.whitelistedChannels.length; index++) {
                if(message.channelId == listWords.whitelistedChannels[index]) whitelisted = true
            }
            let member = message.guild.members.cache.get(message.author.id);
            for (let index = 0; index < listWords.whitelistedRoles.length; index++) {
                if(member.roles.cache.has(listWords.whitelistedRoles[index])) whitelisted = true
            }
            if(whitelisted == false){
                for (let index = 0; index < listWords.word.length; index++) {
                    let word = listWords.word[index];
                    if(message.toString().toLowerCase().includes(word)){
                        message.delete();
                        let warning = "Please do not use blacklisted words ("
                        for (let index = 0; index < word.length; index++) {
                            warning += "#" 
                        }
                        warning += ")"
                        message.channel.send(warning)
    
                        let caseNumber = await caseSchema.find({guildId: message.guild.id})
                        let count = caseNumber.length + 1;
    
                        // await new caseSchema({
                        //     action: "Warn",
                        //     user: message.author.tag,
                        //     userId: message.author.id,
                        //     guildId: message.guild.id,
                        //     reason: "Use of blacklisted word",
                        //     //expires,
                        //     //current: true,
                        //     staffTag: client.user.tag,
                        //    // duration: time,
                        //     case: count,
                        //     auto: true,
                        //     resolved: false,
                        // }).save()
    
                    }
                }
            }


            const randomXp = Math.floor(Math.random() * (40 - 15 + 1) + 15);
            const hasLeveledUp = await Levels.appendXp(message.author.id, message.guild.id, randomXp)
            if(hasLeveledUp){
                const user = await Levels.fetch(message.author.id, message.guild.id);
                message.channel.send(`${message.author.tag} has leveled up to level ${user.level}.`)
                        try {
                            let rewards = await rewardsSchema.find({guildId: message.guildId})
                            for (let index = 0; index < rewards.length; index++) {
                                let level = parseInt(rewards[index].level);
                            if(level <= user.level){
                                let member = (await message.guild.members.fetch()).get(message.author.id)
                               let role = message.guild.roles.cache.find(r => r.id == rewards[index].role);
                               let bot = message.guild.members.cache.get(client.user.id);
                               if(!member.roles.cache.has(role.id)){
                                if(role.position < bot.roles.highest.position) user.roles.add(role)
                                else{
                                    let owner = interaction.guild.members.cache.get(member.guild.ownerId);
                                    owner.send(`I was unable to give ${member.user.tag} their rank reward of ${role.name} because I am a lower position than the rewarded role! Please go into the roles tab in the server settings and make sure that a role that I have is above all rank reward roles!`)
                                }
                               }
                             member.roles.add(role)
                            }
                        } 
                        } catch (error) {}
                     
               
                    }
        } finally {
        }    
    })

   
    if (
        message.author.bot ||
        !message.guild ||
        !message.content.toLowerCase().startsWith(client.config.prefix)
    )
        return;

    const [cmd, ...args] = message.content
        .slice(client.config.prefix.length)
        .trim()
        .split(" ");

    const command = client.commands.get(cmd.toLowerCase()) || client.commands.find(c => c.aliases?.includes(cmd.toLowerCase()));

    if (!command) return;
    await command.run(client, message, args);
});
