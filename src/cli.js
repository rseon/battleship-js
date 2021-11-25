const { Board } = require("./common/board.js");
const Fleet = require("./common/fleet.js");
const Ship = require("./common/ship.js");
const CliGame = require("./cli/game.js");

// Create our fleet
const fleet = new Fleet();
fleet.addShip(new Ship("CARRIER", 5));
fleet.addShip(new Ship("BATTLESHIP", 4));
fleet.addShip(new Ship("CRUSIDER", 3));
fleet.addShip(new Ship("SUBMARINE", 3));
fleet.addShip(new Ship("DESTROYER", 2));

// Create board
const board = new Board(10);
board.placeFleet(fleet); // Place fleet on board randomly

// Start game
const game = new CliGame(board);
game.setHitChar("⬛");
game.setMissedChar("⬜");
game.start();