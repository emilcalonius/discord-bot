const voiceDiscord = require("@discordjs/voice")
const { SlashCommandBuilder } = require('discord.js');
const ytdl = require("ytdl-core")


module.exports = {
  data: new SlashCommandBuilder()
    .setName("sound")
    .setDescription("Soundboard")
    .addStringOption(option =>
			option
				.setName("sound")
				.setDescription("Choose an audio")
        .setRequired(true)
        .addChoices(
          { name: "bruh", value: "https://www.youtube.com/watch?v=D2_r4q2imnQ" },
          { name: "evil-laugh", value: "https://www.youtube.com/watch?v=9xIlNsSd5gk" },
          { name: "bing-chilling", value: "https://www.youtube.com/watch?v=KH_XIt-hm2Y" },
          { name: "AUGHHHH", value: "https://www.youtube.com/watch?v=sVxo39hXIFs" },
          { name: "skype", value: "https://www.youtube.com/watch?v=5M-qbf1lZzk" },
          { name: "1hr", value: "https://www.youtube.com/watch?v=u4DXqKV0Wtk" },
          { name: "yilongma", value: "https://www.youtube.com/watch?v=EPOPaQ3YprI" },
          { name: "fart", value: "https://www.youtube.com/watch?v=9FLRHejWAo8" },
          { name: "nerf-this", value: "https://www.youtube.com/watch?v=XcKS1R0o-20" },
          { name: "amongus", value: "https://www.youtube.com/watch?v=ekL881PJMjI"},
          { name: "amongus-likovi-stigli", value: "https://www.youtube.com/watch?v=h20yCydlUyg" },
          { name: "goofy", value: "https://www.youtube.com/watch?v=H64wI6-tDwk"}
      ))
    .addStringOption(option =>
			option
				.setName("voice-channel")
				.setDescription("Id of voice channel where audio is to be played")),
  async execute(interaction) {
    await interaction.reply({ content: "📢", ephemeral: true })

    const url = interaction.options.getString("sound")
    const stream = ytdl(url, { filter: "audioonly" })

    const player = voiceDiscord.createAudioPlayer()
    const resource = voiceDiscord.createAudioResource(stream)

    const voiceChannelId = interaction.options.getString("voice-channel") ?? interaction.member.voice.channel.id
    const guild = interaction.guild

    const connection = voiceDiscord.joinVoiceChannel({
      channelId: voiceChannelId,
      guildId: guild.id,
      adapterCreator: guild.voiceAdapterCreator
    })

    player.play(resource)
    connection.subscribe(player)

    player.on(voiceDiscord.AudioPlayerStatus.Idle, () => {
      connection.destroy()
    })

    connection.on('error', error => {
      console.error('Error:', error.message);
      player.stop()
    })

    player.on('error', error => {
      console.error('Error:', error.message);
      player.stop()
    })
  }
}