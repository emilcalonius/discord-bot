const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName("guess-game")
    .setDescription("Guess the sender of the randomly selected message"),
  async execute(interaction) {
    const startEmbed = new EmbedBuilder()
      .setColor("#c27546")
      .setTitle("Random message guessing game")
      .setDescription("Guessing game started!\n\nSelect text channel:")

    const guild = interaction.guild

    let channels = await guild.channels.fetch()
    const channelsArr = []
    channels.forEach(element => {
      if(element.type === 0) {
        channelsArr.push(
          { 
            id: element.id, 
            name: element.name
          }
        )
      }
    })

    const channelChunks = []
    let i = 0
    while(channelsArr.length > 0 && i < 5) {
      channelChunks.push(channelsArr.splice(0, 5))
      i++
    }

    // Create action rows that are sent for selecting text channel
    const channelButtons = channelChunks.map(chunk => {
      if(chunk.length === 1)
        return new ActionRowBuilder()
          .addComponents(
            new ButtonBuilder()
              .setCustomId(chunk[0].id)
              .setLabel(chunk[0].name)
              .setStyle(ButtonStyle.Primary),
          )
      if(chunk.length === 2)
        return new ActionRowBuilder()
          .addComponents(
            new ButtonBuilder()
              .setCustomId(chunk[0].id)
              .setLabel(chunk[0].name)
              .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
              .setCustomId(chunk[1].id)
              .setLabel(chunk[1].name)
              .setStyle(ButtonStyle.Primary),
          )
      if(chunk.length === 3)
        return new ActionRowBuilder()
          .addComponents(
            new ButtonBuilder()
              .setCustomId(chunk[0].id)
              .setLabel(chunk[0].name)
              .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
              .setCustomId(chunk[1].id)
              .setLabel(chunk[1].name)
              .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
              .setCustomId(chunk[2].id)
              .setLabel(chunk[2].name)
              .setStyle(ButtonStyle.Primary),
          )
      if(chunk.length === 4)
        return new ActionRowBuilder()
          .addComponents(
            new ButtonBuilder()
              .setCustomId(chunk[0].id)
              .setLabel(chunk[0].name)
              .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
              .setCustomId(chunk[1].id)
              .setLabel(chunk[1].name)
              .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
              .setCustomId(chunk[2].id)
              .setLabel(chunk[2].name)
              .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
              .setCustomId(chunk[3].id)
              .setLabel(chunk[3].name)
              .setStyle(ButtonStyle.Primary),
          )
      if(chunk.length === 5)
        return new ActionRowBuilder()
          .addComponents(
            new ButtonBuilder()
              .setCustomId(chunk[0].id)
              .setLabel(chunk[0].name)
              .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
              .setCustomId(chunk[1].id)
              .setLabel(chunk[1].name)
              .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
              .setCustomId(chunk[2].id)
              .setLabel(chunk[2].name)
              .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
              .setCustomId(chunk[3].id)
              .setLabel(chunk[3].name)
              .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
              .setCustomId(chunk[4].id)
              .setLabel(chunk[4].name)
              .setStyle(ButtonStyle.Primary),
          )
    })
        
    await interaction.reply({ embeds: [startEmbed] })
    await interaction.channel.send({ components: channelButtons })

    const channelCollector = interaction.channel.createMessageComponentCollector()

    let round = 1;

    channelCollector.on("collect", async btnInteraction => {
      if(!btnInteraction.isButton()) return
      channelCollector.stop()
      const channelId = btnInteraction.customId
      const channel = await guild.channels.fetch(channelId)

      const infoEmbed = new EmbedBuilder()
        .setColor("#0052cc")
        .setDescription(`Selected channel: ${channel.name}`)

      await btnInteraction.reply({ embeds: [infoEmbed] })

      playRound(interaction, channel, round)
    })
  }
}

async function playRound(interaction, channel, round) {
  const messages = await channel.messages.fetch({ limit: 100 })
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

  const warningEmbed = new EmbedBuilder()
    .setColor("#ff0000")
    .setTitle("Warning")
    .setDescription("Too many message authors (>25)")

  if(authors.length > 25) {
    await interaction.reply({ embeds: [warningEmbed] })
    return
  }

  const authorChunks = []
  while(authors.length > 0) {
    authorChunks.push(authors.splice(0, 5))
  }

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

  const roundEmbed = new EmbedBuilder()
    .setColor("#c27546")
    .setTitle(`Round ${round}`)
    .setDescription("Select a user to guess who sent the following message:")

  const randomMsg = messagesArr[Math.floor(Math.random() * messagesArr.length)]

  await interaction.channel.send({ embeds: [roundEmbed] })
  await interaction.channel.send({ content: `${randomMsg.content}`, components: rows })

  const answerCollector = interaction.channel.createMessageComponentCollector()

  answerCollector.on("collect", async btnInteraction => {
    if(!btnInteraction.isButton()) return
    if(btnInteraction.customId === randomMsg.author) {
      answerCollector.stop()
      announceWinner(btnInteraction.user.username, randomMsg.author, btnInteraction, interaction, channel, round)
    } else {
      await btnInteraction.reply({ content: "Try again!", ephemeral: true })
    }
  })
}

async function announceWinner(winner, answer, btnInteraction, interaction, channel, round) {
  const endEmbed = new EmbedBuilder()
    .setColor("#7f9c77")
    .setDescription(`Winner is ${winner}! 🥇`+
    `\n\nThe correct answer was ${answer}` )

  await btnInteraction.reply({ embeds: [endEmbed] })

  const endButtons = new ActionRowBuilder()
    .addComponents(
      new ButtonBuilder()
        .setCustomId("end")
        .setLabel("End game")
        .setStyle(ButtonStyle.Danger),
      new ButtonBuilder()
          .setCustomId("continue")
          .setLabel("Next round")
          .setStyle(ButtonStyle.Success),
    )

  await interaction.channel.send({ components: [endButtons] })

  const endCollector = interaction.channel.createMessageComponentCollector()

  endCollector.on("collect", async btnInteraction => {
    if(!btnInteraction.isButton()) return

    if(btnInteraction.customId === "end") {
      endCollector.stop()
      const gameOverEmbed = new EmbedBuilder()
        .setColor("#0052cc")
        .setDescription(`Game over`)

      await btnInteraction.reply({ embeds: [gameOverEmbed] })
    }
    
    if(btnInteraction.customId === "continue") {
      endCollector.stop()
      const newRoundEmbed = new EmbedBuilder()
        .setColor("#0052cc")
        .setDescription(`Starting new round`)
      await btnInteraction.reply({ embeds: [newRoundEmbed] })
      round += 1
      playRound(interaction, channel, round)
    }
  })
}