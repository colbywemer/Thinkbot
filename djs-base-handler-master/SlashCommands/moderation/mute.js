const {CommandInteraction, MessageEmbed } = require("discord.js");
const {SlashCommandBuilder} = require("@discordjs/builders");
const ms = require("ms");
const mongo = require('../../mongo')
const { Mongoose } = require("mongoose");
const userSchema = require('../../schemas/setup');
const caseSchema = require('../../schemas//case-schema');
module.exports = {
    ...new SlashCommandBuilder()
    .setName("mute")
    .setDescription("Mutes Member")
    .addUserOption((option)=>
        option
            .setName("target")
            .setDescription("Target To Mute")
            .setRequired(true)
    )
    .addStringOption((option)=>
        option
            .setName("reason")
            .setDescription("reason for the mute")
            .setRequired(false)
    )
    .addIntegerOption((option)=>
        option
            .setName("days")
            .setDescription("Days you want to mute user for")
            .setRequired(false)
    ).addIntegerOption((option)=>
    option
        .setName("hours")
        .setDescription("Hours you want to mute user for")
        .setRequired(false)
)
    .addIntegerOption((option)=>
        option
            .setName("minutes")
            .setDescription("Minutes you want to mute user for")
            .setRequired(false)
    ),
  
    run: async (client, interaction, args) => {
        const target = interaction.options.getMember("target");
        const reason = interaction.options.getString("reason") || "No reason provided";
        const days = interaction.options.getInteger("days");
        const hours = interaction.options.getInteger("hours");
        const minutes = interaction.options.getInteger("minutes");
        let time = "";
        if(days || hours || minutes){
        if(days){
            if(days > 1){
                time = days + " days ";
            }
            else{
                time = days + " day ";
            }
        }
        if(hours){
            if(hours > 1){
                time += hours + " hours ";
            }
            else{
                time += hours + " hour ";
            }
        }
        if(minutes){
            if(hours || days){
                if(minutes > 1){
                    time += "and " + minutes + " minutes";
                }
                else{
                    time += "and " + minutes + " minute";
                }
            }
            else{
            if(minutes > 1){
                time += minutes + " minutes";
            }
            else{
                time += minutes + " minute";
            }
        }
        }
    }
    else{
        time = "Forever"
    }
            if(target === null) return interaction.followUp("Please enter a valid user to be muted")
            if(!interaction.member.permissions.has("KICK_MEMBERS")) return interaction.followUp({
                content: "You do not have permission to use this command!"
            }).then((msg) => {
                setTimeout(() => msg.delete(), ms('5 seconds'))
            })
            if(interaction.member.id != interaction.guild.ownerId){
            if(interaction.member.roles.highest.position <= target.roles.highest.position) return interaction.followUp({
                content: "You are not able to mute someone with a higher role than you!"
            }).then((msg) => {
                setTimeout(() => msg.delete(), ms('5 seconds'))
            })
        }
        if(target.id === interaction.guild.ownerId){
            return interaction.followUp("You can not mute the server owner!").then((msg) => {
                setTimeout(() => msg.delete(), ms('5 seconds'))
            })
        }
            let muteRole = interaction.guild.roles.cache.find(role => role.name === "Muted")

            if(!muteRole){
                let role = await interaction.guild.roles.create({
                    name: 'Muted',
                    permissions: [],
                    color: 'GREY',
                });
                interaction.guild.channels.cache.filter(c => c.type === 'GUILD_TEXT').forEach(async (channel, id) =>{
                    await channel.permissionOverwrites.create(role, {
                        SEND_MESSAGES: false,
                        ADD_REACTIONS: false,
                    })
                });
                interaction.guild.channels.cache.filter(c => c.type === 'GUILD_VOICE').forEach(async (channel, id) =>{
                    await channel.permissionOverwrites.create(role, {
                        SPEAK: false
                    })
                });
                muteRole = interaction.guild.roles.cache.find(role => role.name === "Muted")
            }

            if(target.roles.cache.has(muteRole.id)) return interaction.followUp({
                content: "The user is already muted!"
            }).then((msg) => {
                setTimeout(() => msg.delete(), ms('5 seconds'))
            })
        await target.roles.add(muteRole.id.toString()).then(() => {
            interaction.followUp({
                content: `Muted ${target.user.tag} successfully!`
            }).then((msg)=>{
                setTimeout(() => msg.delete(), ms('5 seconds'))
            })
            .then(()=>{
                const exampleEmbed = new MessageEmbed()
                .setColor('#FF0000')
                .setTitle(`You have been muted in ${interaction.guild.name}`)
                .addFields(
                    {name: 'Reason', value: `${reason}`},
                    {name: `Moderator`, value: interaction.user.tag},
                    {name: 'Duration', value: time.trim()},
                ) 
                target.send({ embeds: [exampleEmbed] });
            })
        })
        let duration = 0;
        if(days){
            if(days < 1) return interaction.followUp("Days must be greater than 0 or don't input days!")
            duration = duration + (days * 24 * 60);
        }
        if(hours){
            if(hours < 0) return interaction.followUp("Hours must be greater than 0 or don't input hours!")
            duration = duration + (hours * 60);
        }
        if(minutes){
            if(minutes < 0)return interaction.followUp("Minutes must be greater than 0 or don't input minues!")
            duration = duration + minutes;
        }
        if(duration != 0){
        const expires = new Date()
        expires.setMinutes(expires.getMinutes() + duration)
       
        await mongo().then(async (mongoose) =>{
            let caseNumber = await caseSchema.find({guildId: interaction.guild.id})
            let count = caseNumber.length + 1;
            
            await new caseSchema({
                action: "Mute",
                user: target.user.tag,
                userId: target.id,
                guildId: interaction.guild.id,
                reason,
                expires,
                current: true,
                staffTag: interaction.user.tag,
                duration: time,
                case: count,
                auto: false,
                resolved: false,
            }).save()
            const result = await userSchema.findOne({_id: interaction.guild.id})
            if(result){
            let channelId = result.moderationId
            let channel = interaction.guild.channels.cache.get(channelId)
    
            const exampleEmbed1 = new MessageEmbed()
            .setColor('#FF0000')
            .setTitle(`Mute - Case #${count}`)
            .addFields(
                {name: 'User', value: `${target.user.tag}`},
                {name: 'User ID', value: `${target.id}`},
                {name: 'Reason', value: `${reason}`},
                {name: `Moderator`, value: interaction.user.tag},
                {name: 'Duration', value: time.trim()},
            ) 
    
            await channel.send({ embeds: [exampleEmbed1] })
            }
            mongoose.connection.close();
    })
    }
    if(duration === 0){
       
        await mongo().then(async (mongoose) =>{
            try{
            let caseNumber = await caseSchema.find({guildId: interaction.guild.id})
            let count = caseNumber.length + 1;
           
            
            await new caseSchema({
                action: "Mute",
                user: target.user.tag,
                userId: target.id,
                guildId: interaction.guild.id,
                reason,
                current: true,
                staffTag: interaction.user.tag,
                duration: time,
                case: count,
                auto: false,
                resolved: false,
            }).save()

        const result = await userSchema.findOne({_id: interaction.guild.id})
        if(result){
        let channelId = result.moderationId
        let channel = interaction.guild.channels.cache.get(channelId)

        const exampleEmbed1 = new MessageEmbed()
        .setColor('#FF0000')
        .setTitle(`Mute - Case #${count}`)
        .addFields(
            {name: 'User', value: `${target.user.tag}`},
            {name: 'User ID', value: `${target.id}`},
            {name: 'Reason', value: `${reason}`},
            {name: `Moderator`, value: interaction.user.tag},
            {name: 'Duration', value: time.trim()},
        ) 

        await channel.send({ embeds: [exampleEmbed1] })
        }
    }
    finally{mongoose.connection.close();}
    })
    
    }
    },
};
