const axios = require("axios");

class WordleGame {
  constructor(wordList, wordLength = 5) {
    this.wordList = wordList;
    this.wordLength = wordLength;
  }

  // Fetch a random word based on the configured word list and word length
  getRandomWord() {
    const words = this.wordList
      .split(/\r?\n/)
      .filter(
        (word) => this.wordLength === 0 || word.length === this.wordLength
      );
    return words[Math.floor(Math.random() * words.length)];
  }

  // Evaluate the user's guess and return feedback
  evaluateGuess(targetWord, guess) {
    let result = "";
    for (let i = 0; i < targetWord.length; i++) {
      if (guess[i] === targetWord[i]) {
        result += "🟩"; // Correct letter and position
      } else if (targetWord.includes(guess[i])) {
        result += "🟨"; // Correct letter, wrong position
      } else {
        result += "⬜"; // Incorrect letter
      }
    }
    // Handle guesses longer than the target word
    for (let i = targetWord.length; i < guess.length; i++) {
      result += "⬜";
    }
    return result;
  }

  // Fetch a definition for a word using an API
  async fetchWordDefinition(word) {
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
  }

  // Start a game instance for a user
  async startGame(interaction, activeGames, maxAttempts, showHistory) {
    const userId = interaction.user.id;

    if (activeGames.has(userId)) {
      await interaction.reply({
        content: "You already have an active game!",
        flags: 64, // Ephemeral
      });
      return;
    }

    const word = this.getRandomWord();
    activeGames.set(userId, {
      word,
      guesses: [],
      maxAttempts,
      showHistory,
    });

    await interaction.reply({
      content: `Game started! The word is ${
        this.wordLength || word.length
      } characters long.\nUse \`/guess <word>\` to make your first guess.\nMax guesses: ${maxAttempts}\nGuess history: ${
        showHistory ? "Enabled" : "Disabled"
      }`,
      flags: 64, // Ephemeral
    });
  }

  // Handle a guess in the game
  async handleGuess(interaction, activeGames, guess) {
    const userId = interaction.user.id;
    const game = activeGames.get(userId);

    if (!game) {
      await interaction.reply({
        content: "You don't have an active game. Start one with `/wordle`.",
        flags: 64, // Ephemeral
      });
      return;
    }

    if (this.wordLength && guess.length !== this.wordLength) {
      await interaction.reply({
        content: `Please provide a valid ${this.wordLength}-letter word.`,
        flags: 64, // Ephemeral
      });
      return;
    }

    game.guesses.push(guess);
    const feedback = this.evaluateGuess(game.word, guess);
    const history = game.showHistory
      ? `Previous guesses:\n${game.guesses.join("\n")}`
      : "";

    if (guess === game.word) {
      const definition = await this.fetchWordDefinition(game.word);
      await interaction.reply({
        content: `Congratulations! You guessed the word: ${game.word}\nDefinition: ${definition}`,
        flags: 64, // Ephemeral
      });
      activeGames.delete(userId);
    } else if (game.guesses.length >= game.maxAttempts) {
      const definition = await this.fetchWordDefinition(game.word);
      await interaction.reply({
        content: `Game over! The correct word was: ${game.word}\nDefinition: ${definition}`,
        flags: 64, // Ephemeral
      });
      activeGames.delete(userId);
    } else {
      await interaction.reply({
        content: `Guess result for "${guess}": ${feedback}\n${history}\nAttempts left: ${
          game.maxAttempts - game.guesses.length
        }`,
        flags: 64, // Ephemeral
      });
    }
  }
}

module.exports = WordleGame;
