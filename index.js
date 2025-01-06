const {
  Client,
  Events,
  GatewayIntentBits,
  REST,
  Routes,
} = require("discord.js");
const { token, clientId } = require("./config.json");
const wordle = require("./wordle.js");
const crazyword = require("./crazyword.js");
const { activeGames } = require("./gameState");

const client = new Client({
  intents: [GatewayIntentBits.Guilds],
});

const commands = [
  {
    name: "wordle",
    description: "Start a Wordle game",
    options: [
      {
        name: "maxguesses",
        type: 4, // Integer type
        description: "Maximum number of guesses allowed",
        required: false,
      },
      {
        name: "showhistory",
        type: 5, // Boolean type
        description: "Enable or disable showing guess history",
        required: false,
      },
    ],
  },
  {
    name: "crazyword",
    description: "Start a CrazyWord game (words of any length)",
    options: [
      {
        name: "maxguesses",
        type: 4, // Integer type
        description: "Maximum number of guesses allowed",
        required: false,
      },
      {
        name: "showhistory",
        type: 5, // Boolean type
        description: "Enable or disable showing guess history",
        required: false,
      },
    ],
  },
  {
    name: "guess",
    description: "Make a guess in a Wordle or CrazyWord game",
    options: [
      {
        name: "word",
        type: 3, // String type
        description: "Your guess",
        required: true,
      },
    ],
  },
];

const rest = new REST({ version: "10" }).setToken(token);

(async () => {
  try {
    console.log("Started refreshing application (/) commands.");
    await rest.put(Routes.applicationCommands(clientId), { body: commands });
    console.log("Successfully reloaded application (/) commands.");
  } catch (error) {
    console.error(error);
  }
})();

client.once(Events.ClientReady, (readyClient) => {
  console.log(`Ready! Logged in as ${readyClient.user.tag}`);
});

client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isCommand()) return;

  const { commandName, options } = interaction;

  if (commandName === "wordle") {
    const maxGuesses = options.getInteger("maxguesses") || 6;
    const showHistory = options.getBoolean("showhistory") || false;
    await wordle.startWordle(interaction, maxGuesses, showHistory);
  } else if (commandName === "crazyword") {
    const maxGuesses = options.getInteger("maxguesses") || 6;
    const showHistory = options.getBoolean("showhistory") || false;
    await crazyword.startCrazyWord(interaction, maxGuesses, showHistory);
  } else if (commandName === "guess") {
    const guess = options.getString("word");
    if (activeGames.has(interaction.user.id)) {
      if (activeGames.get(interaction.user.id).word.length === 5) {
        await wordle.handleGuess(interaction, guess);
      } else {
        await crazyword.handleCrazyWordGuess(interaction, guess);
      }
    } else {
      await interaction.reply({
        content:
          "You don't have an active game. Start one with `/wordle` or `/crazyword`.",
        ephemeral: true,
      });
    }
  }
});

client.login(token);
