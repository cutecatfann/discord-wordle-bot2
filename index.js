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
    const maxGuesses = options.getInteger("maxguesses") || 6; // Default to 6 guesses
    const showHistory = options.getBoolean("showhistory") || false; // Default to false
    await wordle.startWordle(interaction, maxGuesses, showHistory);
  } else if (commandName === "guess") {
    const guess = options.getString("word");
    await wordle.handleGuess(interaction, guess);
  }
});

client.login(token);
