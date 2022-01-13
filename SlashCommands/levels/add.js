const {CommandInteraction, User, Client, interactionEmbed} = require("discord.js");
const {SlashCommandBuilder} = require("@discordjs/builders")
const ms = require("ms");
const Levels = require('discord-xp')
const mongo = require('../../mongo');
const rewardsSchema = require("../../schemas/rewards-schema");
module.exports = {
    ...new SlashCommandBuilder()
    .setName("add")
    .setDescription("add command for leveling system")
    .addUserOption((option) =>
        option
        .setName("user")
        .setDescription("user")
        .setRequired(true)
    )
    .addStringOption((option) =>
        option
        .setName("type")
        .setDescription("choose whether you want to set xp or level")
        .setRequired(true)
        .addChoice('Xp', 'xp')
        .addChoice('Level', 'level')
    )
    .addIntegerOption((option) =>
        option
        .setName("amount")
        .setDescription("amount you want to add to it")
        .setRequired(true)
    ),
    run: async (client, interaction, args) => {
        const user = interaction.options.getmember("user")
        const type = interaction.options.getString("type")
        const value = interaction.options.getInteger("amount");
        const levelUser = await Levels.fetch(user.id, interaction.guild.id)
        if(!levelUser) return interaction.followUp(`${user.tag} is not in the database!`)
        if(value < 1) return interaction.followUp("You need to insert a value greater than 0!")
        if(type == 'xp'){
            await Levels.appendXp(user.id, interaction.guild.id, value)
            await mongo().then(async (mongoose) =>{
                try {
                    let rewards = await rewardsSchema.find({guildId: interaction.guildId})
                    for (let index = 0; index < rewards.length; index++) {
                        let level = parseInt(rewards[index].level);
                    if(level <= levelUser.level){
                       let role = interaction.guild.roles.cache.find(r => r.id == rewards[index].role);
                       let bot = interaction.guild.members.cache.get(client.user.id);
                       if(!user.roles.cache.has(role.id)){
                        if(role.position < bot.roles.highest.position) user.roles.add(role)
                        else{
                            let owner = interaction.guild.members.cache.get(interaction.guild.ownerId);
                            owner.send(`I was unable to give ${user.user.tag} their rank reward of ${role.name} because I am a lower position than the rewarded role! Please go into the roles tab in the server settings and make sure that a role that I have is above all rank reward roles!`)
                        }
                       }
                    }
                } 
                } catch (error) {}
                finally{
                    mongoose.connection.close()
                }
            })

            interaction.followUp(`Added ${value} xp to ${user.user.tag}`)
        }
        if(type == 'level'){
            await Levels.appendLevel(user.id, interaction.guild.id, value)
            interaction.followUp(`Added ${value} level(s) to ${user.user.tag}`)
            await mongo().then(async (mongoose) =>{
            try {
                let rewards = await rewardsSchema.find({guildId: interaction.guildId})
                for (let index = 0; index < rewards.length; index++) {
                    let level = parseInt(rewards[index].level);
                if(level <= levelUser.level){
                   let role = interaction.guild.roles.cache.find(r => r.id == rewards[index].role);
                   let bot = interaction.guild.members.cache.get(client.user.id);
                   if(!user.roles.cache.has(role.id)){
                    if(role.position < bot.roles.highest.position) user.roles.add(role)
                    else{
                        let owner = interaction.guild.members.cache.get(interaction.guild.ownerId);
                        owner.send(`I was unable to give ${user.user.tag} their rank reward of ${role.name} because I am a lower position than the rewarded role! Please go into the roles tab in the server settings and make sure that a role that I have is above all rank reward roles!`)
                    }
                   }
                }
            } 
            } catch (error) {}
            finally{
                mongoose.connection.close()
            }
        })
        }

    }
}