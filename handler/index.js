const { glob } = require("glob");
const { promisify } = require("util");
const { Client, Guild, Role } = require("discord.js");
const mongoose = require("mongoose");
const globPromise = promisify(glob);
const customCommandModel = require('../schemas/customCommands')

/**
 * @param {Client} client
 */
module.exports = async (client) => {
    // Commands
    const commandFiles = await globPromise(`${process.cwd()}/commands/**/*.js`);
    commandFiles.map((value) => {
        const file = require(value);
        const splitted = value.split("/");
        const directory = splitted[splitted.length - 2];

        if (file.name) {
            const properties = { directory, ...file };
            client.commands.set(file.name, properties);
        }
    });

    // Events
    const eventFiles = await globPromise(`${process.cwd()}/events/*.js`);
    eventFiles.map((value) => require(value));

    // Slash Commands
    const slashCommands = await globPromise(
        `${process.cwd()}/SlashCommands/*/*.js`
    );

    const arrayOfSlashCommands = [];
    slashCommands.map((value) => {
        const file = require(value);
        if (!file?.name) return;
        client.slashCommands.set(file.name, file);

        if (["MESSAGE", "USER"].includes(file.type)) delete file.description;
        arrayOfSlashCommands.push(file);
    });
    
    client.on("ready", async () => {
        // Register for a single guild
        await client.guilds.cache
           .get("514497644316590080")
          .commands.set(arrayOfSlashCommands);

        // Register for all the guilds the bot is in
         await client.application.commands.set(arrayOfSlashCommands);
        customCommandModel.find().then(data =>{
          data.forEach((cmd) => {
            const guild = client.guilds.cache.get(cmd.guildId)
            guild?.commands.create({
              name: cmd.commandName,
              description: cmd.description,
            });
          });
        });
    });
    client.on('guildCreate', async guild => {
        const sleep = (milliseconds) => {
            return new Promise(resolve => setTimeout(resolve, milliseconds))
          }

          
          const channel = guild.systemChannel || guild.channels.cache.find(channel => channel.name === 'general')
          try {
            channel.send("Thanks for invite me")
          } catch (error) {
              console.log("There was an error")
          }  
            if(guild.channels.cache.find(channel => channel.name === '📊Server Stats📊'))
            {
                let statsChannel = guild.channels.cache.find(channel => channel.name === '📊Server Stats📊').id
                let stats = guild.channels.cache.find(channel => channel.name === '📊Server Stats📊').children.map(g => g.name)
                let usersChannel = null;
                let membersChannel = null;
                let botsChannel = null;
                for (let index = 0; index < stats.length; index++) {
                    if(stats[index].includes("Users")){usersChannel = stats[index].toString()}
                    if(stats[index].includes("Members")){membersChannel = stats[index].toString()}
                    if(stats[index].includes("Bots")){botsChannel = stats[index].toString()}  
                }
                
                await sleep(1000)
                if(usersChannel == null){
                    guild.channels.create(`Total Users: ${guild.memberCount}`, { parent: statsChannel, type: 'GUILD_VOICE', position: 0, permissionOverwrites: [
                        {
                          id: guild.roles.everyone, 
                          deny: ['CONNECT']
                        }
                     ],
                     })
                }
                else{
                   usersChannel1 = guild.channels.cache.find(channel => channel.name === usersChannel).id
                   guild.channels.cache.get(usersChannel1).setName(`Total Users: ${guild.memberCount}`)
                }
                if(membersChannel == null){
                    guild.channels.create(`Members: ${guild.members.cache.filter(m=> !m.user.bot).size}`, { parent: statsChannel, type: 'GUILD_VOICE', position: 1, permissionOverwrites: [
                        {
                          id: guild.roles.everyone, 
                          deny: ['CONNECT']
                        }
                     ],
                     })
                }
                else{
                   membersChannel1 = guild.channels.cache.find(channel => channel.name === membersChannel).id
                   guild.channels.cache.get(membersChannel1).setName(`Members: ${guild.members.cache.filter(m=> !m.user.bot).size}`)
                }
                if(botsChannel == null){
                    guild.channels.create(`Bots: ${guild.members.cache.filter(m=> m.user.bot).size}`, { parent: statsChannel, type: 'GUILD_VOICE', position: 2, permissionOverwrites: [
                        {
                          id: guild.roles.everyone, 
                          deny: ['CONNECT']
                        }
                     ],
                     })
                }
                else{
                   botsChannel1 = guild.channels.cache.find(channel => channel.name === botsChannel).id
                   guild.channels.cache.get(botsChannel1).setName(`Bots: ${guild.members.cache.filter(m=> m.user.bot).size}`)
                }
            }
            else{
                guild.channels.create(`📊Server Stats📊`, { type: 'GUILD_CATEGORY',position: 0, permissionOverwrites: [
                    {
                      id: guild.roles.everyone, 
                      deny: ['CONNECT']
                    }
                 ],
                 })
                
                  await sleep(1000)

                let statsChannel = guild.channels.cache.find(channel => channel.name === '📊Server Stats📊').id
                guild.channels.create(`Total Users: ${guild.memberCount}`, { parent: statsChannel, type: 'GUILD_VOICE'})
                guild.channels.create(`Members: ${guild.members.cache.filter(m=> !m.user.bot).size}`, { parent: statsChannel, type: 'GUILD_VOICE' })
                guild.channels.create(`Bots: ${guild.members.cache.filter(m=> m.user.bot).size}`, { parent: statsChannel, type: 'GUILD_VOICE' })
            }       
      });

    // mongoose
    const { mongooseConnectionString } = process.env.mongoose
    if (!mongooseConnectionString) return;
      
    mongoose.connect(mongooseConnectionString).then(() => console.log('Connected to mongodb'));
    mongoose.Promise = global.Promise;
    const Levels = require("discord-xp");
    Levels.setURL(mongooseConnectionString);
};
