const {CommandInteraction} = require("discord.js");
const {SlashCommandBuilder} = require("@discordjs/builders");
const ms = require("ms");
const customCommandModel = require('../../schemas/customCommands');
const mongo = require("../../mongo");
module.exports = {
   name: "custom",
   description: "custom command configurations",
   options: [
       {
           name: "create",
           description: "create a custom command",
           type: "SUB_COMMAND",
           options:[
               {
                   name: "command",
                   description: "name of custom command",
                   type: "STRING",
                   required: true,
               },
               {
                name: "description",
                description: "description for this custom command",
                type: "STRING",
                required: true,
                },
               {
                   name: "response",
                   description: "response for this custom command - use (/n) for newline",
                   type: "STRING",
                   required: true,
               },
               {
                name: "owner-only",
                description: "response for this custom command",
                type: "BOOLEAN",
                required: true,
            },
            {
                name: "permited-roles",
                description: "Example: @role1, @role2...",
                type: "STRING",
                required: false,
            },
           ],
       },
       {
        name: "delete",
        description:"deletes a custom command",
        type: "SUB_COMMAND",
        options:[
            {
                name: "command",
                description: "name of custom command",
                type: "STRING",
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
        if(interaction.member.id != interaction.guild.ownerId) return interaction.followUp("Only the owner of the server can use this command").then((msg) => {
            setTimeout(() => msg.delete(), ms('5 seconds'))
        })
       const subCommand = interaction.options.getSubcommand();
       const commandName = interaction.options.getString("command").toLowerCase();
       await mongo().then(async (mongoose) =>{

       const customCommand = await customCommandModel.findOne({commandName, guildId: interaction.guildId})
       if(subCommand === "create"){
        let response = interaction.options.getString("response");
        const description = interaction.options.getString("description");
        let ownerOnly = interaction.options.getBoolean("owner-only")
        const permitedRoles = interaction.options.getString("permited-roles")
        let rolesSplit = []
        const properties = {commandName, description, guildId: interaction.guildId, ownerOnly}
        if(permitedRoles){rolesSplit = permitedRoles.split(",")}
        let responseSplit = response.split("(/n)")

        if(!customCommand){
            await customCommandModel.create(properties)
            if(rolesSplit.length > 0){
             for (let index = 0; index < rolesSplit.length; index++) {
                let element = rolesSplit[index];
                element = element.replace(/[^a-zA-Z0-9]/g, '');
                await customCommandModel.findOneAndUpdate(properties,{$addToSet:{
                    permitedRoles: element
                } })
            }
        }
             for (let index = 0; index < responseSplit.length; index++) {
                const element = responseSplit[index];
                await customCommandModel.findOneAndUpdate(properties,{$addToSet:{
                    response: element
                } })
        }
        }
        else{
            await customCommandModel.findOneAndReplace({commandName, guildId: interaction.guildId}, properties)
            if(rolesSplit.length > 0){
                for (let index = 0; index < rolesSplit.length; index++) {
                   let element = rolesSplit[index];
                   element = element.replace(/[^a-zA-Z0-9]/g, '');
                   await customCommandModel.findOneAndUpdate(properties,{$addToSet:{
                       permitedRoles: element
                   } })
               }
           }
                for (let index = 0; index < responseSplit.length; index++) {
                    const element = responseSplit[index];
                    await customCommandModel.findOneAndUpdate(properties,{$addToSet:{
                        response: element
                    } })
               
           }
        }
        await interaction.guild.commands.create({name: commandName, description: description});
        return interaction.followUp("Custom command created").then((msg) => {
            setTimeout(() => msg.delete(), ms('5 seconds'))
        })
       }
       else if(subCommand === "delete"){
        if(!customCommand) return interaction.followUp("That custom command does not exist").then((msg) => {
            setTimeout(() => msg.delete(), ms('5 seconds'))
        })
        await customCommand.delete();
        const command = await interaction.guild.commands.cache.find((cmd) => cmd.name === commandName);
        
            await interaction.guild.commands.delete(command.id);
        
        return interaction.followUp("Custom command has been deleted").then((msg) => {
            setTimeout(() => msg.delete(), ms('5 seconds'))
        })
       }
    })
    },
};
