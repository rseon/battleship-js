import readline from 'readline'
import colorize from './cli-colors.js'
import { SHOT_RESULTS } from './board.js'

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
                    colorize.block(`Bye, freshwater swab...`, "magenta")
                );
            }

            process.exit(0)
        })

        this.launch(colorize.block('Waiting for shot... (example : A1)', 'magenta', null, 15))
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

        if (this.debug) {
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
			
			// Woopwoop !!
            if (location.toLowerCase() === 'exit') {
                this.rl.close();
                return;
            }
			if (location.toLowerCase() === this.decrypt('73.87.68.71.70.71.79.89.81.74.85')) {
				this.toggleDebug();
                this.launch();
                return;
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
                if (result === SHOT_RESULTS.decimated.code) {
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
            case SHOT_RESULTS.missed.code:
                ++this.hits[0]
                answer = this.randomMessage(SHOT_RESULTS.missed.messages);
                color = 'cyan'
                break;
            case SHOT_RESULTS.played.code:
                answer = this.randomMessage(SHOT_RESULTS.played.messages);
                color = 'red'
                break;
            case SHOT_RESULTS.hit.code:
                ++this.hits[1]
                answer = this.randomMessage(SHOT_RESULTS.hit.messages);
                color = 'green'
                break;
            case SHOT_RESULTS.sunk.code:
                ++this.hits[1]
                answer = this.randomMessage(SHOT_RESULTS.sunk.messages, { ship: ship.name });
                color = 'yellow'
                break;
            case SHOT_RESULTS.decimated.code:
                ++this.hits[1]
                answer = this.randomMessage(SHOT_RESULTS.decimated.messages);
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

    randomMessage(messages, params = {}) {
        let message = messages[Math.floor(Math.random() * messages.length)];
        Object.keys(params).forEach(k => {
            message = message.replace(`:${k}`, params[k])
        })

        return message
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

	encrypt(text) {
		return text.split('').map(c => c.charCodeAt()-30).reverse().join('.')
	}
	decrypt(text) {
		return text.split('.').reverse().map(c => String.fromCharCode(parseInt(c, 10) + 30)).join('')
	}
}