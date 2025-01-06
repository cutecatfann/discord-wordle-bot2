const {
  Client,
  Events,
  GatewayIntentBits,
  REST,
  Routes,
} = require("discord.js");
const { token, clientId } = require("./config.json");
const wordle = require("./wordle.js");

const client = new Client({
  intents: [GatewayIntentBits.Guilds],
});

const commands = [
  {
    name: "wordle",
    description: "Play a Wordle game!",
  },
  {
    name: "guess",
    description: "Make a guess in Wordle",
    options: [
      {
        name: "word",
        type: 3, // String type
        description: "Your 5-letter guess",
        required: true,
      },
    ],
  },
  {
    name: "setguesses",
    description: "Set the number of guesses per game",
    options: [
      {
        name: "number",
        type: 4, // Integer type
        description: "Maximum number of guesses allowed",
        required: true,
      },
    ],
  },
  {
    name: "showhistory",
    description: "Toggle showing all previous guesses during the game",
    options: [
      {
        name: "enabled",
        type: 5, // Boolean type
        description: "Enable or disable guess history",
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
    await wordle.startWordle(interaction);
  } else if (commandName === "guess") {
    const guess = options.getString("word");
    await wordle.handleGuess(interaction, guess);
  } else if (commandName === "setguesses") {
    const maxGuesses = options.getInteger("number");
    await wordle.setMaxGuesses(interaction, maxGuesses);
  } else if (commandName === "showhistory") {
    const enabled = options.getBoolean("enabled");
    await wordle.toggleGuessHistory(interaction, enabled);
  }
});

client.login(token);
