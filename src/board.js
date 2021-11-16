/**
 * Codes for hit results
 */
export const RESULT_CODES = {
	missed: 0, 
	played: 1,
	hit: 2,
	sunk: 3,
	decimated: 4
}

export default class Board {
	constructor() {
		this.size = 10
		this.empty_result = '  '

		// Generate board columns (A, B, C...)
		this.cols = Array.from({ length: this.size }, (_, i) => String.fromCharCode('A'.charCodeAt(0) + i))

		// Generate board rows (1, 2, 3...)
		this.rows = Array.from({ length: this.size }, (_, i) => i+1)
		
		this.initBoard()
	}

	/**
	 * Init the board with columns and rows
	 * 
	 * Each case of the board is an object with its index, ship and if was hit
	 */
	initBoard() {
		this.board = {}
		let index = 0
		this.rows.forEach(row => {
			this.board[row] = {}
			this.cols.forEach(col => {
				this.board[row][col] = {
					index,
					ship: null,
					hit: false
				}
				++index
			})
		})
	}

	/**
	 * Get the board
	 * 
	 * @return Object
	 */
	getBoard() {
		return this.board
	}

	/**
	 * Place the fleet randomly on the board
	 * 
	 * @param Fleet
	 */
	placeFleet(fleet) {
		this.fleet = fleet
		this.ships = this.fleet.getShips()

		let locations = []
		this.ships.forEach(ship => {
			if (ship.length > this.size) {
				throw new Error(`Ship "${ship.name}" can not be longer than board size (${this.size})`)
			}

			// Generate new locations without collision with other ships
			do {
				locations = this.generateLocation(ship)
			} while (this.collision(locations))

			// Set location to the ship
			ship.setLocations(locations)

			// Place the ship on the board
			this.placeShipOnBoard(ship)
		})
	}

	/**
	 * Get the fleet
	 * 
	 * @return Fleet
	 */
	getFleet() {
		return this.fleet
	}

	/**
	 * Generate ship location randomly
	 * 
	 * @param Ship
	 * @return Array
	 */
	generateLocation(ship) {
		const direction = this.random(2)
		let row, col

		// Horizontal
		if (direction === 1) {
			row = this.random(this.size)
			col = this.random(this.size - ship.length + 1)
		} else {
			row = this.random(this.size - ship.length + 1)
			col = this.random(this.size)
		}

		let newShipLocations = []
		for (let i = 0; i < ship.length; i++) {
			let value
			if (direction === 1) {
				value = parseInt(row + "" + (col + i), 10)
				
			} else {
				value = parseInt((row + i) + "" + col, 10)
			}
			newShipLocations.push(value);
		}

		return newShipLocations
	}

	/**
	 * Generate a random number
	 * 
	 * @return Number
	 */
	random(length) {
		return Math.floor(Math.random() * length)
	}

	/**
	 * Get if there is already a ship on this location
	 * 
	 * @param Array
	 * @return Boolean
	 */
	collision(locations) {
		for (let i = 0; i < this.ships.length; i++) {
			const ship = this.ships[i];
			for (let j = 0; j < locations.length; j++) {
				if (ship.locations.includes(locations[j])) {
					return true;
				}
			}
		}
		return false;
	}

	/**
	 * Place the ship on the board
	 * 
	 * @param Ship
	 */
	placeShipOnBoard(ship) {
		let found = false

		ship.locations.forEach(location => {
			this.rows.forEach(row => {
				this.cols.forEach(col => {
					if (location == this.board[row][col].index) {
						this.board[row][col].ship = ship
						found = true
					}

					this.board[row][col].result = this.empty_result
				})

				if (found) {
					return
				}
			})
		})
	}

	/**
	 * Show board table with position of ships (only for debug, you cheater !)
	 */
	showBoardTableWithShips() {
		let board = {}
		this.rows.forEach(row => {
			board[row] = {}
			this.cols.forEach(col => {
				if (this.board[row][col].ship && this.board[row][col].result === this.empty_result) {
					board[row][col] = this.board[row][col].ship.name
				} else {
					board[row][col] = this.board[row][col].result
				}
			})
		})
		console.table(board)
	}

	/**
	 * Display board table as ASCII fuc*in' art
	 */
	showBoardTable() {
		let table  = '┌─────' + '┬──────'.repeat(this.size) + '┐\n'
			table += '│     ' + this.cols.map(col => `│  ${col}   `).join('') + '│\n'

		this.rows.forEach(row => {
			table += '├─────' + '┼──────'.repeat(this.size) + '┤\n'

			let firstRow = `│  ${row} `
			if (row < 10) {
				firstRow += ' '
			}
			table += firstRow

			this.cols.forEach(col => {
				let display = this.board[row][col].result

				table += `│  ${display}  `
			})

			table += '│\n'
		})

		table += '└─────' + '┴──────'.repeat(this.size) + '┘\n'

		console.log(table)
	}

	/**
	 * Shoot on location and returns the result
	 * 
	 * @return Promise
	 */
	shoot(location) {
		return new Promise((resolve, reject) => {
			let [col, row] = this.locationToCoords(location)
			if (!(row in this.board) || !(col in this.board[row])) {
				reject('Out of board !')
			}

			const choice = this.board[row][col]
			let result
			let ship

			// Already played
			if (choice.hit) {
				result = RESULT_CODES.played
			}
			else if (choice.ship) {
				ship = choice.ship

				// Hit
				this.fleet.setShipHit(choice.ship, choice.index)
				choice.result = '⬛'

				if (this.board[row][col].ship.isSunk()) {
					if (this.fleet.isDecimated()) {
						result = RESULT_CODES.decimated
					}
					else {
						result = RESULT_CODES.sunk
					}
				}
				else {
					result = RESULT_CODES.hit
				}
			}
			else {
				// Missed
				result = RESULT_CODES.missed
				choice.result = '⬜'	
			}

			choice.hit = true
			this.board[row][col] = choice

			resolve({ result, ship })
		})
	}

	/**
	 * Convert location ('A1') to coordinates (['A', 1])
	 * 
	 * @return Array
	 */
	locationToCoords(location) {
		let tmp = location.toUpperCase().split('')
		const col = tmp.shift()
		return [col, tmp.join('')]
	}
}

