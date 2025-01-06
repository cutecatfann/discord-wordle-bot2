const { readFileSync } = require("fs");
const axios = require("axios");
const { activeGames } = require("./gameState");

const getRandomWord = () => {
  const words = readFileSync("words_alpha.txt", "utf-8")
    .split(/\r?\n/)
    .filter((word) => word.length > 0);
  return words[Math.floor(Math.random() * words.length)];
};

const evaluateGuess = (word, guess) => {
  let result = "";
  for (let i = 0; i < word.length; i++) {
    if (guess[i] === word[i]) {
      result += "🟩"; // Correct letter and position
    } else if (word.includes(guess[i])) {
      result += "🟨"; // Correct letter, wrong position
    } else {
      result += "⬜"; // Incorrect letter
    }
  }
  // Fill in ⬜ for unmatched characters in guesses longer than the word
  for (let i = word.length; i < guess.length; i++) {
    result += "⬜";
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

const startCrazyWord = async (interaction, maxGuesses, showHistory) => {
  const userId = interaction.user.id;

  if (activeGames.has(userId)) {
    await interaction.reply({
      content: "You already have an active CrazyWord game!",
      ephemeral: true,
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
    content: `CrazyWord game started! The word is ${
      word.length
    } characters long.\nUse \`/guess <word>\` to make your first guess.\nMax guesses: ${maxGuesses}\nGuess history: ${
      showHistory ? "Enabled" : "Disabled"
    }`,
    ephemeral: true,
  });
};

const handleCrazyWordGuess = async (interaction, guess) => {
  const userId = interaction.user.id;
  const game = activeGames.get(userId);

  if (!game) {
    await interaction.reply({
      content:
        "You don't have an active CrazyWord game. Start one with `/crazyword`.",
      flags: 64, // Ephemeral
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

module.exports = { startCrazyWord, handleCrazyWordGuess };
