const { QueryType } = require("discord-player");
const player = require("../../client/player");
const setup = require('../../schemas/setup')
const mongo = require('../../mongo')

module.exports = {
    name: "play",
    description: "play a song",
    options: [
        {
            name: "songtitle",
            description: "title of the song",
            type: "STRING",
            required: true,
        },
    ],
    run: async (client, interaction) => {
        const songTitle = interaction.options.getString("songtitle");
        try {
            if (!interaction.member.voice.channel)
            return interaction.followUp({
                content: "Please join a voice channel first!",
            });
            await mongo().then(async (mongoose) =>{
            let settings = await setup.findOne({_id: interaction.guildId})
   

            if(settings.musicId.length > 0 && interaction.member.id != interaction.guild.ownerId){
                let musicChannel = false
                for (let index = 0; index < settings.musicId.length; index++) {
                    const element = settings.musicId[index];
                    if(element == interaction.member.voice.channel.id) {musicChannel = true;}
                }
                if(!musicChannel){
                    return interaction.followUp({
                        content: "I am not allowed to play music in this voice channel!",
                    })
                } 
            }
        const searchResult = await player.search(songTitle, {
            requestedBy: interaction.user,
            searchEngine: QueryType.AUTO,
        });

        const queue = await player.createQueue(interaction.guild, {
            metadata: interaction.channel,
        });

        if (!queue.connection)
            await queue.connect(interaction.member.voice.channel);

        searchResult.playlist
            ? queue.addTracks(searchResult.tracks)
            : queue.addTrack(searchResult.tracks[0]);

        if (!queue.playing) await queue.play();
        interaction.followUp({ content: `Playing ${songTitle}` });
    })
        } catch (error) {
            interaction.followUp("An error occured")
            console.log(error)
        }
       
    },
};
