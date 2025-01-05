const {
  Client,
  Events,
  IntentsBitField,
  REST,
  Routes,
  GatewayIntentBits,
} = require("discord.js");
const { token, clientId } = require("./config.json");
const wordle = require("./wordle.js");

// // Use the integer bitfield to configure intents
// const intents = new IntentsBitField(1689934340028512);

// Configure minimal intents
const client = new Client({
  intents: [GatewayIntentBits.Guilds], // Only guild-related events required for slash commands
});

// // Create a new client instance
// const client = new Client({ intents });

// Register slash commands
const commands = [
  {
    name: "funbot",
    description: "Play games with the bot!",
    options: [
      {
        name: "wordle",
        type: 1, // Subcommand
        description: "Start a Wordle game",
      },
      {
        name: "guess",
        type: 1, // Subcommand
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

// When the client is ready, run this code (only once)
client.once(Events.ClientReady, (readyClient) => {
  console.log(`Ready! Logged in as ${readyClient.user.tag}`);
});

// Handle interactions
client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isCommand()) return;

  const { commandName, options } = interaction;

  if (commandName === "funbot") {
    const subcommand = options.getSubcommand();

    if (subcommand === "wordle") {
      await wordle.startWordle(interaction);
    } else if (subcommand === "guess") {
      const guess = options.getString("word");
      await wordle.handleGuess(interaction, guess);
    }
  }
});

client.login(token);
