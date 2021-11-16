import Board from './src/board.js'
import Fleet from './src/fleet.js'
import Ship from './src/ship.js'
import CliGame from './src/cli-game.js'

// Create board
const board = new Board()

// Create our fleet
const fleet = new Fleet()
fleet.addShip(new Ship('CARRIER', 5))
fleet.addShip(new Ship('BATTLESHIP', 4))
fleet.addShip(new Ship('CRUSIDER', 3))
fleet.addShip(new Ship('SUBMARINE', 3))
fleet.addShip(new Ship('DESTROYER', 2))

// Place fleet on board randomly
board.placeFleet(fleet)

// Start game
const game = new CliGame(board)
game.start()
