const { readFileSync } = require("fs");
const { activeGames } = require("./gameState");
const WordleGame = require("./WordleGame");

const crazyWordList = readFileSync("word_lists/words_alpha.txt", "utf-8");
const crazyWordGame = new WordleGame(crazyWordList, 0); // 0 means any word length

const startCrazyWord = async (interaction, maxGuesses, showHistory) => {
  await crazyWordGame.startGame(
    interaction,
    activeGames,
    maxGuesses,
    showHistory
  );
};

const handleCrazyWordGuess = async (interaction, guess) => {
  await crazyWordGame.handleGuess(interaction, activeGames, guess);
};

module.exports = { startCrazyWord, handleCrazyWordGuess };
