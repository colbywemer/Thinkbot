const client = require("../index");
const customCommandModel = require('../schemas/customCommands')
const mongo = require('../mongo')
const { Mongoose } = require("mongoose");
const ms = require("ms");

client.on("interactionCreate", async (interaction) => {
    // Slash Command Handling

    if (interaction.isCommand()) {
        await interaction.deferReply({ ephemeral: false }).catch(() => {});

        const cmd = client.slashCommands.get(interaction.commandName);
        if(interaction.channelId == 925696972793462825 && interaction.user.id != 313346571175723010)
        {return interaction.followUp("Commands are dissabled in this channel!").then((msg) => {
            setTimeout(() => msg.delete(), ms('5 seconds'))
        })}
    if(cmd){

        const args = [];

        for (let option of interaction.options.data) {
            if (option.type === "SUB_COMMAND") {
                if (option.name) args.push(option.name);
                option.options?.forEach((x) => {
                    if (x.value) args.push(x.value);
                });
            } else if (option.value) args.push(option.value);
        }
        interaction.member = interaction.guild.members.cache.get(interaction.user.id);

        cmd.run(client, interaction, args);
    }
    else{

        await mongo().then(async(mongoose) => {
            const customCommand = await customCommandModel.findOne({commandName: interaction.commandName, guildId: interaction.guildId});
            if (customCommand.ownerOnly == true && interaction.user.id != interaction.guild.ownerId) {
                return interaction.followUp("You do not have permision to use this command!")
            }
            if(customCommand.permitedRoles.length != 0 && interaction.user.id != interaction.guild.ownerId){
                let hasRole = false
                for (let index = 0; index < customCommand.permitedRoles.length; index++) {
                    const element = customCommand.permitedRoles[index];
                    if(interaction.guild.members.cache.get(interaction.user.id).roles.cache.has(element)) {hasRole = true 
                        break;}
                }
                if(hasRole == false) return interaction.followUp("You do not have permision to use this command!")
            }
            let response = ""
            for (let index = 0; index < customCommand.response.length; index++) {
                const element = customCommand.response[index];
                 response += element + "\n"
            }
        return interaction.editReply({content: `${response}`})
        })
      
    }
    }

    // Context Menu Handling
    if (interaction.isContextMenu()) {
        await interaction.deferReply({ ephemeral: false });
        const command = client.slashCommands.get(interaction.commandName);
        if (command) command.run(client, interaction);
    }
});
