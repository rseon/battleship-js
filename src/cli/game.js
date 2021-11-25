const readline = require('readline')
const Game = require('../common/game.js')
const colorize = require('./colorize.js')
const { getElapsedTime, getScores, decrypt } = require("../common/helpers.js");

/**
 * CLI version of the game
 */
module.exports = class CLIGame extends Game {
    constructor(board) {
        super(board);
        this.fleet = this.board.getFleet();
        this.debug = false;
    }

    /**
     * Start a new game in CLI mode
     */
    start() {
        // Prompt user in node
        this.rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
        });

        // Listener on readline close
        this.rl.on("close", () => {
            console.log();
            this.end()
            process.exit(0);
        });

        // Launch the game
        this.launch(
            colorize.block(
                "Waiting for shot... (type A1)",
                "magenta",
                null,
                15
            )
        );
    }

    /**
     * End the game
     */
    end() {
        if (this.fleet.isDecimated()) {
            const { minutes, seconds } = getElapsedTime(this.timer);

            console.log(
                colorize.block(
                    `Terminated in ${minutes} minutes and ${seconds} seconds`,
                    "green"
                )
            );
        } else {
            console.log(colorize.block(`Bye, freshwater swab...`, "magenta"));
        }
    }

    /**
     * Launch the game on CLI
     *
     * If message provided, it will be displayed between board and prompt
     *
     * @param String
     */
    launch(message = null) {
        this.reloadScreen();

        if (message) {
            console.log(message);
        }

        this.promptUser();
    }

    /**
     * Reload the screen content to display board
     */
    reloadScreen() {
        console.clear();
        //console.log(colorize.block('RELOAD', 'black', 'yellow'));

        if (this.debug) {
            console.table(this.fleet);
            console.table(this.fleet.getShips());
            this.showBoardTableWithShips();
        }

        this.showBoardHeader();
        this.showBoardTable();
    }

    /**
     * Ask shot to user and handle it
     */
    promptUser() {
        console.log();

        // Prompt the user
        this.rl.question(
            colorize.blue("   " + colorize.underscore("Your shot") + " :  "),
            (location) => {
                // Woopwoop !!
                if (location.toLowerCase() === "exit") {
                    this.rl.close();
                    return;
                }
                if (
                    location.toLowerCase() ===
                    decrypt("73.87.68.71.70.71.79.89.81.74.85")
                ) {
                    this.toggleDebug();
                    this.launch();
                    return;
                }

                // Shoot on the board
                this.board
                    .shoot(location)
                    .then(({ result, ship }) => {
                        // Get shot result
                        const { answer, color, bg_color } = this.getTheShot(
                            result,
                            ship
                        );

                        // Reload screen
                        this.reloadScreen();

                        // Display result
                        if (answer) {
                            console.log(
                                colorize.block(answer, color, bg_color, 20)
                            );
                        }

                        if (!this.fleet.isDecimated()) {
                            // Prompt user while fleet is not decimated
                            this.promptUser();
                        } else {
                            // End the game when fleet is decimated
                            this.rl.close();
                        }
                    })
                    .catch((error) => {
                        this.launch(colorize.block(error, "black", "red", 13));
                    });
            }
        );
    }

    /**
     * Toggle debug mode
     */
    toggleDebug() {
        this.debug = !this.debug;
    }

    /**
     * Display board header (score btw)
     */
    showBoardHeader() {
        const { total, hits, missed, accuracy } = getScores(this.shots);

        let text = `${total} shoots / ${hits} hits, ${missed} missed`;
        if (total > 0) {
            text += ` (${accuracy}% accuracy)`;
        }

        console.log(colorize.block(text, "magenta", null));
    }

    /**
     * Show board table with position of ships (only for debug, you cheater !)
     */
    showBoardTableWithShips() {
        let board = {};
        this.board.rows.forEach((row) => {
            board[row] = {};
            this.board.cols.forEach((col) => {
                const box = this.board.board[row][col];
                if (box.ship && box.result === this.board.empty_result) {
                    board[row][col] = box.ship.name;
                } else {
                    board[row][col] = (box.result ? box.result : box.index);
                }
            });
        });
        console.table(board);
    }

    /**
     * Display board table as ASCII fuc*in' art
     */
    showBoardTable() {
        let table = "┌─────" + "┬─────".repeat(this.board.size) + "┐\n";
        table +=
            "│     " +
            this.board.cols.map((col) => `│  ${col}  `).join("") +
            "│\n";

        this.board.rows.forEach((row) => {
            table += "├─────" + "┼─────".repeat(this.board.size) + "┤\n";

            let firstRow = `│  ${row} `;
            if (row < 10) {
                firstRow += " ";
            }
            table += firstRow;

            this.board.cols.forEach((col) => {
                let display = this.board.board[row][col].result;
                switch (display) {
                    case this.board.empty_result:
                        display = "  ";
                        break;
                    case true:
                        display = this.hit_char;
                        break;
                    case false:
                        display = this.missed_char;
                        break;
                }

                table += `│ ${display}  `;
            });

            table += "│\n";
        });

        table += "└─────" + "┴─────".repeat(this.board.size) + "┘\n";

        console.log(table);
    }
};