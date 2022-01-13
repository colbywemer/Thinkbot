const {CommandInteraction } = require("discord.js");
const {SlashCommandBuilder} = require("@discordjs/builders")
const mongo = require('../../mongo')
const moment = require("moment");
const playlistSchema = require("../../schemas/playlist-schema")
const { QueryType } = require("discord-player");
const player = require("../../client/player");
const setup = require('../../schemas/setup')
module.exports = {
    name: "playlist",
    description: "playlist",
    options: [
        {
            name: "add",
            description: "adds songs to playlist",
            type: "SUB_COMMAND",
            options:[
                {
                    name: "playlist",
                    description: "Playlist name",
                    type: "STRING",
                    required: true,
                },
                {
                    name: "songs",
                    description: "Example: song1, song2, ...",
                    type: "STRING",
                    required: true,
                },
            ]
        },
        {
            name: "play",
            description: "playlist you want to play",
            type: "SUB_COMMAND",
            options:[
                {
                    name: "playlist",
                    description: "Playlist name",
                    type: "STRING",
                    required: true,
                },
            ],
        },
        {
         name: "remove",
         description:"removes songs from playlist",
         type: "SUB_COMMAND",
         options:[
            {
                name: "playlist",
                description: "Playlist name",
                type: "STRING",
                required: true,
            },
             {
                 name: "songs",
                 description: "Example: song1, song2, ...",
                 type: "STRING",
                 required: true,
             },
         ]
 
        },
        {
            name: "destroy",
            description:"removes the entire playlist",
            type: "SUB_COMMAND",
            options:[
                {
                    name: "playlist",
                    description: "Playlist name",
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
        const subCommand = interaction.options.getSubcommand("playlist")
        const songs = interaction.options.getString("songs")
        const playlist = interaction.options.getString("playlist")


        await mongo().then(async (mongoose) =>{
            const perms = await setup.findOne({_id: interaction.guildId})
            let dj = false
            let hasperms = false
            if(perms.musicManagment.length > 0){
            for (let index = 0; index < perms.musicManagment.length; index++) {
                const managmentRole = perms.musicManagment[index];
                let hasRole = interaction.guild.roles.cache.get(managmentRole).members.map(m=>m.user.id);
                for (let index = 0; index < hasRole.length; index++) {
                    const user = hasRole[index];
                    if(user == interaction.user.id) hasperms = true
                    
                }
                
            }
        }
        if(perms.dj.length > 0){
            for (let index = 0; index < perms.dj.length; index++) {
                const djRole = perms.dj[index];
                let hasRole = interaction.guild.roles.cache.get(djRole).members.map(m=>m.user.id);
                for (let index = 0; index < hasRole.length; index++) {
                    const user = hasRole[index];
                    if(user == interaction.user.id) dj = true
                }
                
            }
        }
                const exists = await playlistSchema.findOne({guildId: interaction.guildId, name: playlist})
            if(subCommand === "add"){
                if(perms.musicManagment.length > 0 && interaction.user.id != interaction.guild.ownerId && !hasperms) return interaction.followUp("You don't have permision to use this command")
                if(perms.musicManagment.length == 0 && interaction.user.id != interaction.guild.ownerId) return interaction.followUp("You don't have permision to use this command")
                let songSplit = songs.split(",");
                if(!exists){
                    await playlistSchema.create({guildId: interaction.guildId, name: playlist})  
                }

                for (let index = 0; index < songSplit.length; index++) {
                    const element = songSplit[index];
                    let song = element.trim();

                    await playlistSchema.findOneAndUpdate({guildId: interaction.guildId, name: playlist},{
                        $addToSet:{
                            songs: song
                        } 
                    })
                }
                if(songSplit > 1) interaction.followUp("Songs added to playlist")
                else interaction.followUp("Song added to playlist")
            }
            else if(subCommand === "play"){
                if(!exists) return interaction.followUp("Playlist doesn't exist")
                if(perms.dj.length > 0){
                    if(!dj && interaction.user.id != interaction.guild.ownerId) return interaction.followUp("You do not have permision to use this command")
                }
                if (!interaction.member.voice.channel)
                return interaction.followUp({
                    content: "Please join a voice channel first!",
                });
                let musicChannel = false
               for (let index = 0; index < perms.musicId.length; index++) {
                   const channel = perms.musicId[index];
                   if(channel == interaction.member.voice.channel.id) musicChannel = true
               }
               if(!musicChannel && interaction.user.id != interaction.guild.ownerId) return interaction.followUp("I am not allowed to play music in this voice channel")


                const sleep = (milliseconds) => {
                    return new Promise(resolve => setTimeout(resolve, milliseconds))
                  }

                try {
                    for (let index = 0; index < exists.songs.length; index++) {
                        const song = exists.songs[index];
                        const searchResult = await player.search(song, {
                            requestedBy: interaction.user,
                            searchEngine: QueryType.AUTO,
                        });
                
                        const queue = await player.createQueue(interaction.guild, {
                            metadata: interaction.channel,
                        });
                
                        if (!queue.connection)
                            await queue.connect(interaction.member.voice.channel);
                
                
                        searchResult.playlist
                            ? await queue.addTracks(searchResult.tracks)
                            : await queue.addTrack(searchResult.tracks[0]);
                
                        if (!queue.playing){ await queue.play();
                        await sleep(5000)
                        }
                    }
                    interaction.followUp(`Playing ${playlist} playlist`)
                } catch (error) {
                    interaction.followUp("An error occured while trying to play the playlist")
                }

                
            }
            else if(subCommand === "remove"){
                if(perms.musicManagment.length > 0 && interaction.user.id != interaction.guild.ownerId && !hasperms) return interaction.followUp("You don't have permision to use this command")
                if(perms.musicManagment.length == 0 && interaction.user.id != interaction.guild.ownerId) return interaction.followUp("You don't have permision to use this command")
                if(!exists) return interaction.followUp("Playlist doesn't exist")
                let songSplit = songs.split(",");
                for (let index = 0; index < songSplit.length; index++) {
                    const element = songSplit[index];
                    let song = element.trim();

                    await playlistSchema.findOneAndUpdate({guildId: interaction.guildId, name: playlist},{
                        $pull:{
                            songs: song
                        } 
                    })
                }
                if(songSplit > 1) interaction.followUp("Removed songs from playlist")
                else interaction.followUp("Removed song from playlist")
            }
            else{
                if(perms.musicManagment.length > 0 && interaction.user.id != interaction.guild.ownerId && !hasperms) return interaction.followUp("You don't have permision to use this command")
                if(perms.musicManagment.length == 0 && interaction.user.id != interaction.guild.ownerId) return interaction.followUp("You don't have permision to use this command")
                if(!exists) return interaction.followUp("Playlist doesn't exist")
                await playlistSchema.findOneAndDelete({guildId: interaction.guildId, name: playlist})
                interaction.followUp("Playlist deleted")
            }
           
            
        })
            
    },
};
