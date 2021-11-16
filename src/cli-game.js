import readline from 'readline'
import colorize from './cli-colors.js'
import { RESULT_CODES } from './board.js'

export default class Game {
	constructor(board) {
		this.board = board
		this.fleet = this.board.getFleet()
		this.timer = new Date()
		this.hits = [0, 0] // missed, found
		this.debug = false
	}

	/**
	 * Start a new game in CLI mode
	 */
	start() {
		// A way to prompt user in node
		this.rl = readline.createInterface({
		    input: process.stdin,
		    output: process.stdout
		})
		this.rl.on('close', () => {
			console.log()
			if (this.fleet.isDecimated()) {
				let time = new Date() - this.timer;
                const minutes = Math.floor(time / 60000);
                const seconds = ((time % 60000) / 1000).toFixed(0);

                console.log(
                    colorize.block(
                        `Terminated in ${minutes} minutes and ${seconds} seconds`,
                        'green'
                    )
                );
			} else {
				console.log(
                    colorize.block(
                        `Bye, freshwater sailor...`,
                        'magenta'
                    )
                );
			}

			process.exit(0)
		})

		this.launch(colorize.block('Waiting for shot...', 'magenta', null, 20))
	}

	/**
	 * Launch the game on CLI
	 * 
	 * If message provided, it will be displayed between board and prompt
	 * 
	 * @param String
	 */
	launch(message = null) {
		this.reloadScreen()

		if (message) {
			console.log(message)	
		}

		this.promptUser()
	}

	/**
	 * Reload the screen content to display board
	 */
	reloadScreen() {
		console.clear()

		if (this.debug) { // Woopwoop cheater !!
			console.table(this.fleet)
			console.table(this.fleet.getShips())
			this.board.showBoardTableWithShips()
		}
		
		this.showHeaderBoard()
		this.board.showBoardTable()
	}

	/**
	 * Ask shot to user and handle it
	 */
	promptUser() {
		console.log('')

		// Prompt the user
		this.rl.question(colorize.blue('   ' + colorize.underscore('Your shot') + ' :  '), (location) => {
			
			if (location.toLowerCase() === 'debug') { // Woopwoop cheater !!
				this.toggleDebug()
				this.launch()
				return
			}

			// Shoot on the board
			this.board.shoot(location).then(({ result, ship }) => {

				// Get shot result
				const { answer, color, bg_color } = this.getTheShot(result, ship)

				// Reload screen
				this.reloadScreen()
				
				// Display result
				if (answer) {
					console.log(colorize.block(answer, color, bg_color, 20))
				}

				// Prompt user while fleet is not decimated
				if (!this.fleet.isDecimated()) {
					this.promptUser()
				}

				// End the game when fleet is decimated
				if (result === RESULT_CODES.decimated) {
					this.rl.close()
				}
			}).catch(error => {
				this.launch(colorize.block(error, 'black', 'red', 13))
			})
		})
	}

	/**
	 * Handle the shot
	 * 
	 * @param Number
	 * @param Ship
	 * @return Object
	 */
	getTheShot(result, ship) {
		let answer, color, bg_color
		switch (result) {
			case RESULT_CODES.missed:
				++this.hits[0]
				answer = 'Missed, looser !!'
				color = 'cyan'
				break;
			case RESULT_CODES.played:
				answer = 'Already played, bro'
				color = 'red'
				break;
			case RESULT_CODES.hit:
				++this.hits[1]
				answer = 'BOOOOM in my face !!'
				color = 'green'
				break;
			case RESULT_CODES.sunk:
				++this.hits[1]
				answer = `Ow SH*T, my ${ship.name} is sunk !`
				color = 'yellow'
				break;
			case RESULT_CODES.decimated:
				++this.hits[1]
				answer = 'Yay, fleet is decimated, bravo !!'
				color = 'black'
				bg_color = 'green'
				break;

			default:
				throw new Error(`Unexpected result : ${result}`)
				break;
		}

		if (answer) {
			return { answer, color, bg_color }
		}
	}

	/**
	 * Toggle debug mode
	 */
	toggleDebug() {
		this.debug = !this.debug
	}

	/**
	 * Display board header (score btw)
	 */
	showHeaderBoard() {
		const total_hits = this.hits.reduce((sum, x) => sum + x)
  		const accuracy = Math.round(this.hits[1] / total_hits * 100 * 100) / 100

		let text = `${total_hits} shoots / ${this.hits[1]} hits, ${this.hits[0]} missed`
		if (total_hits > 0) {
			text += ` (${accuracy}% accuracy)`
		}

		console.log(colorize.block(text, 'magenta', null))
	}
}