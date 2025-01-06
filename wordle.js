const { readFileSync } = require("fs");
const axios = require("axios");
const { activeGames } = require("./gameState");

const getRandomWord = () => {
  const words = readFileSync("5letterwords.txt", "utf-8")
    .split(/\r?\n/)
    .filter((word) => word.length === 5);
  return words[Math.floor(Math.random() * words.length)];
};

const evaluateGuess = (word, guess) => {
  let result = "";
  for (let i = 0; i < word.length; i++) {
    if (guess[i] === word[i]) {
      result += "🟩";
    } else if (word.includes(guess[i])) {
      result += "🟨";
    } else {
      result += "⬜";
    }
  }
  return result;
};

const fetchWordDefinition = async (word) => {
  try {
    const response = await axios.get(
      `https://api.dictionaryapi.dev/api/v2/entries/en/${word}`
    );
    const meanings = response.data[0]?.meanings;
    if (!meanings || meanings.length === 0) {
      return "No definition found.";
    }
    return meanings[0]?.definitions[0]?.definition || "No definition found.";
  } catch (error) {
    console.error("Error fetching definition:", error);
    return "Unable to fetch definition at this time.";
  }
};

const startWordle = async (interaction, maxGuesses, showHistory) => {
  const userId = interaction.user.id;

  if (activeGames.has(userId)) {
    await interaction.reply({
      content: "You already have an active Wordle game!",
      flags: 64, // Ephemeral
    });
    return;
  }

  const word = getRandomWord();
  activeGames.set(userId, {
    word,
    guesses: [],
    maxAttempts: maxGuesses,
    showHistory,
  });

  await interaction.reply({
    content: `Wordle game started! Use \`/guess <word>\` to make your first guess.\nMax guesses: ${maxGuesses}\nGuess history: ${
      showHistory ? "Enabled" : "Disabled"
    }`,
    ephemeral: true,
  });
};

const handleGuess = async (interaction, guess) => {
  const userId = interaction.user.id;
  const game = activeGames.get(userId);

  if (!game) {
    await interaction.reply({
      content:
        "You don't have an active Wordle game. Start one with `/wordle`.",
      ephemeral: true,
    });
    return;
  }

  if (guess.length !== 5) {
    await interaction.reply({
      content: "Please provide a valid 5-letter word.",
      ephemeral: true,
    });
    return;
  }

  game.guesses.push(guess);
  const feedback = evaluateGuess(game.word, guess);
  const history = game.showHistory
    ? `Previous guesses:\n${game.guesses.join("\n")}`
    : "";

  if (guess === game.word) {
    const definition = await fetchWordDefinition(game.word);
    await interaction.reply({
      content: `Congratulations! You guessed the word: ${game.word}\nDefinition: ${definition}`,
      ephemeral: true,
    });
    activeGames.delete(userId);
  } else if (game.guesses.length >= game.maxAttempts) {
    const definition = await fetchWordDefinition(game.word);
    await interaction.reply({
      content: `Game over! The correct word was: ${game.word}\nDefinition: ${definition}`,
      ephemeral: true,
    });
    activeGames.delete(userId);
  } else {
    await interaction.reply({
      content: `Guess result for "${guess}": ${feedback}\n${history}\nAttempts left: ${
        game.maxAttempts - game.guesses.length
      }`,
      ephemeral: true,
    });
  }
};

module.exports = { startWordle, handleGuess };
