const {CommandInteraction, MessageEmbed } = require("discord.js");
const {SlashCommandBuilder} = require("@discordjs/builders");
const ms = require("ms");
const mongo = require('../../mongo')
const { Mongoose } = require("mongoose");
const userSchema = require('../../schemas/setup');
const caseSchema = require('../../schemas/case-schema');
module.exports = {
    ...new SlashCommandBuilder()
    .setName("ban")
    .setDescription("Bans Member")
    .addUserOption((option)=>
        option
            .setName("target")
            .setDescription("target to ban")
            .setRequired(true)
    )
    .addStringOption((option)=>
        option
            .setName("reason")
            .setDescription("reason for the ban")
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
    /**
     *
     * @param {Client} client
     * @param {CommandInteraction} interaction
     * @param {String[]} args
     */
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
        if(target != null){
       
        if(!interaction.member.permissions.has("BAN_MEMBERS")) return interaction.followUp({
            content: "You do not have permission to use this command!"
        }).then((msg) => {
            setTimeout(() => msg.delete(), ms('5 seconds'))
        })
        if(interaction.member.id != interaction.guild.ownerId){
        if(interaction.member.roles.highest.position <= target.roles.highest.position) return interaction.followUp({
            content: "You are not able to ban someone with a higher role than you!"
        }).then((msg) => {
            setTimeout(() => msg.delete(), ms('5 seconds'))
        })
    }
    if(target.id === interaction.guild.ownerId){
        return interaction.followUp("You can not ban the server owner!").then((msg) => {
            setTimeout(() => msg.delete(), ms('5 seconds'))
        })
    }
        const exampleEmbed = new MessageEmbed()
        .setColor('#FF0000')
        .setTitle(`You have been banned from ${interaction.guild.name}`)
        .addFields(
            {name: 'Reason', value: `${reason}`},
            {name: `Moderator`, value: interaction.user.tag},
            {name: 'Duration', value: time},
        ) 
        await target.send({ embeds: [exampleEmbed] });
        target.ban({reason});
       interaction.followUp({content: `Banned ${target.user.tag} successfully!`}).then((msg) => {
        setTimeout(() => msg.delete(), ms('5 seconds'))
        
    })

    let duration = 0;
    if(days){
        duration = duration + (days * 24 * 60);
    }
    if(hours){
        duration = duration + (hours * 60);
    }
    if(minutes){
        duration = duration + minutes;
    }
    if(duration===0){

        await mongo().then(async (mongoose) =>{
            try{
            let caseNumber = await caseSchema.find({guildId: interaction.guild.id})
            let count = caseNumber.length + 1;
            await new caseSchema({
                action: "Ban",
                user: target.user.tag,
                userId: target.id,
                guildId: interaction.guild.id,
                reason,
                staffTag: interaction.user.tag,
                duration: time,
                case: count,
                auto: false,
                resolved: false,
            }).save()

        }
        finally{mongoose.connection.close()}
    })
    await mongo().then(async (mongoose) =>{
        let caseNumber = await caseSchema.find({guildId: interaction.guild.id})
        let count = caseNumber.length;
    
        const exampleEmbed1 = new MessageEmbed()
        .setColor('#FF0000')
        .setTitle(`Ban - Case #${count}`)
        .addFields(
            {name: 'User', value: `${target.user.tag}`},
            {name: 'User ID', value: `${target.id}`},
            {name: 'Reason', value: `${reason}`},
            {name: `Moderator`, value: interaction.user.tag},
            {name: 'Duration', value: time},
        ) 
    
        const result = await userSchema.findOne({_id: interaction.guild.id})
        if(result){
            let channelId = result.moderationId
            let channel = interaction.guild.channels.cache.get(channelId)
            await channel.send({ embeds: [exampleEmbed1] })
            }
            mongoose.connection.close();
    
    
    })
    }
    if(duration != 0){
    const expires = new Date()
    expires.setMinutes(expires.getMinutes() + duration)

    await mongo().then(async (mongoose) =>{
        try{
        let caseNumber = await caseSchema.find({guildId: interaction.guild.id})
        let count = caseNumber.length + 1;
      
        await new caseSchema({
            action: "Ban",
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
    }
    finally {mongoose.connection.close()}
    
})

await mongo().then(async (mongoose) =>{
    let caseNumber = await caseSchema.find({guildId: interaction.guild.id})
    let count = caseNumber.length;

    const exampleEmbed1 = new MessageEmbed()
    .setColor('#FF0000')
    .setTitle(`Ban - Case #${count}`)
    .addFields(
        {name: 'User', value: `${target.user.tag}`},
        {name: 'User ID', value: `${target.id}`},
        {name: 'Reason', value: `${reason}`},
        {name: `Moderator`, value: interaction.user.tag},
        {name: 'Duration', value: time},
    ) 

    const result = await userSchema.findOne({_id: interaction.guild.id})
    if(result){
        let channelId = result.moderationId
        let channel = interaction.guild.channels.cache.get(channelId)
        await channel.send({ embeds: [exampleEmbed1] })
        }
        mongoose.connection.close();


})
}
        }
    },
};
