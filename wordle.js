const { readFileSync } = require("fs");
const { activeGames } = require("./gameState");
const WordleGame = require("./WordleGame");

const wordleWordList = readFileSync("word_lists/5letterwords.txt", "utf-8");
const wordleGame = new WordleGame(wordleWordList, 5);

const startWordle = async (interaction, maxGuesses, showHistory) => {
  await wordleGame.startGame(interaction, activeGames, maxGuesses, showHistory);
};

const handleGuess = async (interaction, guess) => {
  await wordleGame.handleGuess(interaction, activeGames, guess);
};

module.exports = { startWordle, handleGuess };
