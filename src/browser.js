import "./browser/styles.css";
import { Board } from "./common/board.js";
import Fleet from "./common/fleet.js";
import Ship from "./common/ship.js";
import BrowserGame from "./browser/game.js";

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
const game = new BrowserGame(board);
game.setContainer(document.getElementById("game"));
game.setHitChar("💥");
game.setMissedChar("💦");
game.start();
