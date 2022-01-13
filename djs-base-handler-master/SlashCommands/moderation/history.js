const {CommandInteraction, MessageEmbed} = require("discord.js");
const {SlashCommandBuilder} = require("@discordjs/builders");
const ms = require("ms");
const caseSchema = require('../../schemas//case-schema');
const mongo = require('../../mongo')
const { Mongoose } = require("mongoose");
module.exports = {
   name: "history",
   description: "case history",
   options: [
       {
           name: "viewcase",
           description: "views a case by id",
           type: "SUB_COMMAND",
           options:[
               {
                   name: "caseid",
                   description: "case id of case you want to view",
                   type: "INTEGER",
                   required: true,
               },
           ],
       },
       {
        name: "viewuser",
        description:"views a users history",
        type: "SUB_COMMAND",
        options:[
            {
                name: "user",
                description: "user you want to view the history of",
                type: "USER",
                required: true,
            },
        ]

       },
       {
        name: "revoke",
        description:"removes a case by id",
        type: "SUB_COMMAND",
        options:[
            {
                name: "caseid",
                description: "case id of case you want to remove",
                type: "INTEGER",
                required: true,
            },
        ]

       },
       {
        name: "reset",
        description:"resets a users history",
        type: "SUB_COMMAND",
        options:[
            {
                name: "user",
                description: "user you want to reset history for",
                type: "USER",
                required: true,
            },
        ]

       },
   ],

    
    /**
     *
     * @param {Client} client
     * @param {CommandInteraction} interaction
     * @param {String[]} args
     */
    run: async (client, interaction, args) => {
        if(!interaction.member.permissions.has("MANAGE_MESSAGES")) return interaction.followUp({
            content: "You do not have permission to use this command!"
        }).then((msg) => {
            setTimeout(() => msg.delete(), ms('5 seconds'))
        })
       const subCommand = interaction.options.getSubcommand();
       if(subCommand === "viewcase"){
        const caseNumber = interaction.options.getInteger('caseid');
        await mongo().then(async (mongoose) =>{
            try{
            let cases = await caseSchema.findOne({guildId: interaction.guild.id, case: caseNumber, resolved: false})
            if(cases){

                if(cases.action === "Warn" || cases.action === "Kick" || cases.action === "Unban" || cases.action === "Unmute"){
                    const exampleEmbed1 = new MessageEmbed()
                    .setColor('#FF0000')
                    .setTitle(`${cases.action} - Case #${cases.case}`)
                    .addFields(
                        {name: 'User', value: `${cases.user}`},
                        {name: 'User ID', value: `${cases.userId}`},
                        {name: 'Reason', value: `${cases.reason}`},
                        {name: `Moderator`, value: `${cases.staffTag}`},
                    ) 
                    await interaction.followUp({ embeds: [exampleEmbed1] })
                }
                else{
            const exampleEmbed1 = new MessageEmbed()
            .setColor('#FF0000')
            .setTitle(`${cases.action} - Case #${cases.case}`)
            .addFields(
                {name: 'User', value: `${cases.user}`},
                {name: 'User ID', value: `${cases.userId}`},
                {name: 'Reason', value: `${cases.reason}`},
                {name: `Moderator`, value: `${cases.staffTag}`},
                {name: 'Duration', value: `${cases.duration}`}
            ) 
            await interaction.followUp({ embeds: [exampleEmbed1] })
            }
            
            
        }
        else{
            interaction.followUp("There is no case with that id")
        }
    }
    finally{
        mongoose.connection.close();
    }
        })
       }
       else if(subCommand === "viewuser"){
        const user = interaction.options.getMember('user');
        await mongo().then(async (mongoose) =>{
            try{
            let cases = await caseSchema.find({guildId: interaction.guild.id, userId: user.id, resolved: false})
                let test = ""
                let mutes = 0
                let autoModMutes = 0
                let bans = 0
                let autoModBans = 0
                let kicks = 0
                let autoModKicks = 0
                let warns = 0
                let autoModWarns = 0
            if(cases){
             for (let index = 0; index < cases.length; index++) {
                 if(cases[index].action === "Mute"){
                 test += "Case #" + cases[index].case + " | " + cases[index].action + "d by " + cases[index].staffTag + " | " + cases[index].reason +"\n"
                if(cases[index].autoMod == false) mutes++
                else autoModMutes++
                 
                }
                 if(cases[index].action === "Unmute")
                 test += "Case #" + cases[index].case + " | " + cases[index].action + "d by " + cases[index].staffTag + " | " + cases[index].reason +"\n" 
                 if(cases[index].action === "Ban"){
                 test += "Case #" + cases[index].case + " | " + cases[index].action + "ned by " + cases[index].staffTag + " | " + cases[index].reason +"\n"
                 if(cases[index].autoMod == false) bans++
                 else autoModBans++
                }
                 if(cases[index].action === "Unban")
                 test += "Case #" + cases[index].case + " | " + cases[index].action + "ned by " + cases[index].staffTag + " | " + cases[index].reason +"\n"
                 if(cases[index].action === "Kick"){
                 test += "Case #" + cases[index].case + " | " + cases[index].action + "ed by " + cases[index].staffTag + " | " + cases[index].reason +"\n"
                 if(cases[index].autoMod == false) kicks++
                else autoModKicks++
                }
                 if(cases[index].action === "Warn"){
                 test += "Case #" + cases[index].case + " | " + cases[index].action + "ed by " + cases[index].staffTag + " | " + cases[index].reason +"\n"
                 if(cases[index].autoMod == false) warns++
                else autoModWarns++
                }
                }
             const exampleEmbed1 = new MessageEmbed()
             .setAuthor(`${user.user.tag}'s History`, user.user.displayAvatarURL())
             .setColor('#FF0000')
             .setDescription(test.trim())
             .setFooter(`Moderator\nWarns: ${warns} Mutes: ${mutes} Kicks: ${kicks} Bans: ${bans}\nAutomod\nWarns: ${autoModWarns} Mutes: ${autoModMutes} Kicks: ${autoModKicks} Bans: ${autoModBans}`)
             await interaction.followUp({ embeds: [exampleEmbed1] })
               
            }
    }
    finally{
        mongoose.connection.close();
    }
        })
       }
       else if(subCommand === "revoke"){
        const caseNumber = interaction.options.getInteger('caseid');
        await mongo().then(async (mongoose) =>{
            try {
                let result = await caseSchema.findOne({
                    guildId: interaction.guild.id,
                    case: caseNumber,
                    resolved: false
                })
                if(result) interaction.followUp(`Revoked case #${caseNumber}`)
                else interaction.followUp(`There is no case with that id`)
                
               await caseSchema.findOneAndUpdate({
                    guildId: interaction.guild.id,
                    case: caseNumber,
                },{
                    resolved: true
                    },{
                        upsert: true
                    }
                )
            } finally {
                mongoose.connection.close()
            }
            
        })
      
    }
    else if(subCommand === "reset"){
        const user = interaction.options.getMember('user');
        await mongo().then(async (mongoose) =>{
            try {
                let count = (await caseSchema.find({ guildId: interaction.guild.id, userId: user.id,resolved: false})).length
               await caseSchema.updateMany({
                    guildId: interaction.guild.id,
                    userId: user.id,
                },{
                    resolved: true
                    }
                )
                interaction.followUp(`Revoked ${count} cases from ${user.user.tag}`)
            } 
            catch{interaction.followUp(`Revoked 0 cases from ${user.user.tag}`)}
            finally {
                mongoose.connection.close()
            }
            
        })
    }
       
    },
};
