// index.js
const {
  Client,
  Events,
  GatewayIntentBits,
  REST,
  Routes,
} = require("discord.js");
const { token, clientId } = require("./config.json");
const wordle = require("./wordle.js");

// Create a new client instance
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

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

// When the client is ready, run this code (only once).
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
    }
  }
});

client.login(token);
