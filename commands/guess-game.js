const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, Events } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName("guess-game")
    .setDescription("Guess the sender of the randomly selected message"),
  async execute(interaction) {
    const channel = interaction.channel

    const messages = await channel.messages.fetch({ limit: 100})
    const authors = []

    const messagesArr = []
    messages.forEach(element => {
      if(!authors.includes(element.author.username))
        authors.push(element.author.username)
      messagesArr.push(
        { 
          content: element.content, 
          author: element.author.username
        }
      )
    })

    if(authors.length > 25) {
      await interaction.reply({ content: "Too many message authors (>25)"})
      return
    }

    const authorChunks = []
    while(authors.length > 0) {
      authorChunks.push(authors.splice(0, 5))
    }
    console.log("chunks", authorChunks)

    // Create action rows that are sent as quiz choices
    const rows = authorChunks.map(chunk => {
      if(chunk.length === 1)
        return new ActionRowBuilder()
          .addComponents(
            new ButtonBuilder()
              .setCustomId(chunk[0])
              .setLabel(chunk[0])
              .setStyle(ButtonStyle.Primary),
          )
      if(chunk.length === 2)
        return new ActionRowBuilder()
          .addComponents(
            new ButtonBuilder()
              .setCustomId(chunk[0])
              .setLabel(chunk[0])
              .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
              .setCustomId(chunk[1])
              .setLabel(chunk[1])
              .setStyle(ButtonStyle.Primary),
          )
      if(chunk.length === 3)
        return new ActionRowBuilder()
          .addComponents(
            new ButtonBuilder()
              .setCustomId(chunk[0])
              .setLabel(chunk[0])
              .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
              .setCustomId(chunk[1])
              .setLabel(chunk[1])
              .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
              .setCustomId(chunk[2])
              .setLabel(chunk[2])
              .setStyle(ButtonStyle.Primary),
          )
      if(chunk.length === 4)
        return new ActionRowBuilder()
          .addComponents(
            new ButtonBuilder()
              .setCustomId(chunk[0])
              .setLabel(chunk[0])
              .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
              .setCustomId(chunk[1])
              .setLabel(chunk[1])
              .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
              .setCustomId(chunk[2])
              .setLabel(chunk[2])
              .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
              .setCustomId(chunk[3])
              .setLabel(chunk[3])
              .setStyle(ButtonStyle.Primary),
          )
      if(chunk.length === 5)
        return new ActionRowBuilder()
          .addComponents(
            new ButtonBuilder()
              .setCustomId(chunk[0])
              .setLabel(chunk[0])
              .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
              .setCustomId(chunk[1])
              .setLabel(chunk[1])
              .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
              .setCustomId(chunk[2])
              .setLabel(chunk[2])
              .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
              .setCustomId(chunk[3])
              .setLabel(chunk[3])
              .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
              .setCustomId(chunk[4])
              .setLabel(chunk[4])
              .setStyle(ButtonStyle.Primary),
          )
    })

    console.log("rows", rows)

    const randomMsg = messagesArr[Math.floor(Math.random() * messagesArr.length)]

    await interaction.reply({ content: "```yaml\nGuessing game started!\n\n"+
      "Select a user to guess who sent the following message:\n```" })
    await channel.send({ content: `${randomMsg.content}`, components: rows })

    const collector = channel.createMessageComponentCollector()

    collector.on("collect", async interaction => {
      if(!interaction.isButton()) return
      if(interaction.customId === randomMsg.author) {
        interaction.reply(
          { 
            content: `Winner is ${interaction.user.username}! 🥇`+
              `\n\nThe correct answer was ${randomMsg.author}`
          }
        )
        collector.stop()
      } else {
        interaction.reply({ content: "Try again!", ephemeral: true })
      }
    })
  }
}