const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, Events } = require('discord.js');

const timeoutEmbed = new EmbedBuilder()
  .setColor("#0052cc")
  .setDescription(`Guessing game timed out`)

module.exports = {
  data: new SlashCommandBuilder()
    .setName("guess-game")
    .setDescription("Guess the sender of the randomly selected message"),
  async execute(interaction, toggleQuiz) {
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

    const channelButtons = getChannelChoices(channelChunks)
        
    await interaction.reply({ embeds: [startEmbed] })
    await interaction.channel.send({ components: channelButtons })

    let round = 1;
    let collector = interaction.channel.createMessageComponentCollector({time: 60000})

    collector.on("collect", async btnInteraction => {
      if(!btnInteraction.isButton()) return
      collector.stop()
      const channelId = btnInteraction.customId
      const channel = await guild.channels.fetch(channelId)

      const infoEmbed = new EmbedBuilder()
        .setColor("#0052cc")
        .setDescription(`Selected channel: ${channel.name}`)

      await btnInteraction.reply({ embeds: [infoEmbed] })

      playRound(interaction, channel, round, collector, toggleQuiz)
    })

    collector.on('end', async (collection, reason) => {
      if(reason === "time") {
        await interaction.channel.send({ embeds: [timeoutEmbed] })
        collector.stop()
        toggleQuiz()
      }
    })
  }
}

/**
 * Play a round of the guessing game
 * 
 * @param {*} interaction 
 * @param {*} channel 
 * @param {*} round 
 * @param {*} collector
 * @param {*} toggleQuiz
 */
async function playRound(interaction, channel, round, collector, toggleQuiz) {
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

  const rows = getAuthorChoices(authorChunks)

  const roundEmbed = new EmbedBuilder()
    .setColor("#c27546")
    .setTitle(`Round ${round}`)
    .setDescription("Select a user to guess who sent the following message:")

  const randomMsg = messagesArr[Math.floor(Math.random() * messagesArr.length)]

  await interaction.channel.send({ embeds: [roundEmbed] })
  await interaction.channel.send({ content: `${randomMsg.content}`, components: rows })

  collector = interaction.channel.createMessageComponentCollector({ time: 60000})

  collector.on("collect", async btnInteraction => {
    if(!btnInteraction.isButton()) return
    if(btnInteraction.customId === randomMsg.author) {
      collector.stop()
      announceWinner(btnInteraction.user.username, randomMsg.author, btnInteraction, interaction, channel, round, collector, toggleQuiz)
    } else {
      await btnInteraction.reply({ content: "Try again!", ephemeral: true })
    }
  })

  collector.on('end', async (collected, reason) => {
    if(reason === "time") {
      await interaction.channel.send({ embeds: [timeoutEmbed] })
      collector.stop()
      toggleQuiz()
    }
  })
}

/**
 * Announce the winner of the round and ask if user wants to end game or start next round
 * 
 * @param {*} winner 
 * @param {*} answer 
 * @param {*} btnInteraction 
 * @param {*} interaction 
 * @param {*} channel 
 * @param {*} round 
 * @param {*} collector
 * @param {*} toggleQuiz
 */
async function announceWinner(winner, answer, btnInteraction, interaction, channel, round, collector, toggleQuiz) {
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

  collector = interaction.channel.createMessageComponentCollector({time: 60000})

  collector.on("collect", async btnInteraction => {
    if(!btnInteraction.isButton()) return

    if(btnInteraction.customId === "end") {
      collector.stop()
      const gameOverEmbed = new EmbedBuilder()
        .setColor("#0052cc")
        .setDescription(`Game over`)

      await btnInteraction.reply({ embeds: [gameOverEmbed] })
      toggleQuiz()
    }
    
    if(btnInteraction.customId === "continue") {
      collector.stop()
      await btnInteraction.deferUpdate()
      round += 1
      playRound(interaction, channel, round, collector, toggleQuiz)
    }
  })

  collector.on('end', async (collected, reason) => {
    if(reason === "time") {
      await interaction.channel.send({ embeds: [timeoutEmbed] })
      collector.stop()
      toggleQuiz()
    }
  })
}

/**
 * Create action rows that are sent as quiz choices
 * 
 * @param {*} authorChunks authors divided into chunks of five authors 
 * because of limited amount of buttons that can be added to a message
 * @returns action row containing the buttons with message authors
 */
function getAuthorChoices(authorChunks) {
  return authorChunks.map(chunk => {
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
}

/**
 * Create action rows that are sent as choices when selecting text channel where message is selected from
 * 
 * @param {*} channelChunks authors divided into chunks of five authors 
 * because of limited amount of buttons that can be added to a message
 * @returns action row containing the buttons with channels
 */
function getChannelChoices(channelChunks) {
  return channelChunks.map(chunk => {
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
}