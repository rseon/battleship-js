const Game = require("../common/game.js");
const { SHOT_RESULTS } = require("../common/board.js");
const { getScores, getElapsedTime, decrypt } = require("../common/helpers.js");

/**
 * Generate a div Element
 * 
 * @param String
 * @param String
 * @returns HTMLElement
 */
const generateDiv = (id) => {
    const $div = document.createElement('div');
    $div.id = id;
    return $div;
}

/**
 * Browser version of the game
 */
export default class BrowserGame extends Game {
    constructor(board) {
        super(board);
        this.$td = [];
        this.onClick = this.onClick.bind(this);
        this.cheat = this.cheat.bind(this);
        this.debug = false

        window.cheat = this.cheat;
    }

    /**
     * Set container where board will be displayed
     *
     * @param HTMLElement
     */
    setContainer($container) {
        this.$container = $container;
    }

    /**
     * Start the game
     */
    start() {
        // Generate header (scores + timer)
        const $header = generateDiv("header");
        $header.appendChild(generateDiv("scores"));
        $header.appendChild(generateDiv("timer"));

        // Add header to container
        this.$container.appendChild($header);

        // Add board to container
        this.$container.appendChild(this.generateBoard());

        // Add message to container
        this.$container.appendChild(generateDiv("message"));

        // Some initializations
        this.$timer = document.getElementById("timer");
        this.displayMessage("Waiting for first shot... (click on box)");
        this.startTimer();
        this.updateScore();
    }

    /**
     * Reload screen keeping results
     */
    reloadScreen() {
        this.end()
        this.$container.innerHTML = "";
        this.start()
    }

    /**
     * End the game
     */
    end() {
        // Remove listeners and locations on table cases
        this.$td.forEach(($td) => {
            $td.removeEventListener("click", this.onClick);
            delete $td.dataset.location;
        });

        // Stop the timer
        this.stopTimer();

        // Reload button
        const $reload = generateDiv('reload');
        $reload.innerHTML = '<a href="">Play again</a>'
        this.$container.appendChild($reload)
    }

    /**
     * Generate the board
     *
     * @returns HTMLElement
     */
    generateBoard() {
        // Add table to board
        const $board = generateDiv("board");
        $board.appendChild(this.generateTable());

        // Add board to container
        const $container = generateDiv("container");
        $container.appendChild($board);

        return $container;
    }

    /**
     * Generate the table
     *
     * @returns HTMLElement
     */
    generateTable() {
        const $table = document.createElement("table");

        // Add table head and body
        this.generateTableHead($table);
        this.generateTableBody($table);

        return $table;
    }

    /**
     * Generate table header
     * 
     * @param HTMLElement
     */
    generateTableHead($table) {
        // Add first col
        let $thead = $table.createTHead();
        let $tr = $thead.insertRow();
        let $th = document.createElement("th");
        $th.classList.add("empty");
        $tr.appendChild($th);

        // Add cols from board
        this.board.cols.forEach((col) => {
            $th = document.createElement("th");
            let text = document.createTextNode(col);
            $th.appendChild(text);
            $tr.appendChild($th);
        });
    }

    /**
     * Generate table body
     * 
     * @param HTMLElement
     */
    generateTableBody($table) {
        let $tbody = $table.createTBody();
        this.board.rows.forEach((row) => {
            // Add first col for current row
            let $tr = $tbody.insertRow();
            let $td = $tr.insertCell();
            $td.classList.add("strong");
            let text = document.createTextNode(row);
            $td.appendChild(text);
            $tr.appendChild($td);

            // Add cols from board for current row
            this.board.cols.forEach((col) => {
                const box = this.board.board[row][col];
                let content = ''

                if (this.debug) {
                    if (box.ship && box.result === this.board.empty_result) {
                        content = box.ship.name.charAt(0);
                    } else {
                        content = box.result !== null
                            ? (box.result ? this.hit_char : this.missed_char)
                            : '';
                    }
                }

                $td = $tr.insertCell();
                let text = document.createTextNode(content);
                $td.appendChild(text);

                // Add location and click event on the td
                $td.dataset.location = `${col}${row}`;
                $td.addEventListener("click", this.onClick);
                this.$td.push($td);

                $tr.appendChild($td);
            });
        });
    }

    /**
     * Click event on td
     * 
     * @param Event
     */
    onClick(event) {
        const location = event.target.dataset.location;

        // Shoot on board
        this.board.shoot(location).then(({ result, ship }) => {
            const { answer, color, bg_color } = this.getTheShot(result, ship);

            // Display result
            switch (result) {
                case SHOT_RESULTS.missed.code:
                    event.target.innerText = this.missed_char;
                    break;
                case SHOT_RESULTS.hit.code:
                case SHOT_RESULTS.sunk.code:
                case SHOT_RESULTS.decimated.code:
                    event.target.innerText = this.hit_char;
                    break;
            }

            // Update the score
            this.updateScore();

            // Display message
            if (answer) {
                this.displayMessage(answer, color, bg_color);
            }

            // End game if fleet is decimated
            if (result === SHOT_RESULTS.decimated.code) {
                this.end();
            }
        });
    }

    /**
     * Display message below board
     * 
     * @param String
     * @param String
     * @param String
     */
    displayMessage(message, color = null, bg_color = null) {
        const $message = document.getElementById("message");
        $message.innerText = "";
        $message.style.color = color;
        $message.style.backgroundColor = bg_color;

        let text = document.createTextNode(message);
        $message.appendChild(text);
    }

    /**
     * Start the timer
     */
    startTimer() {
        this.timerInterval = setInterval(() => {
            const { minutes, seconds } = getElapsedTime(this.timer);
            this.$timer.innerText = `${minutes}:${seconds}`;
        }, 1000);
    }

    /**
     * Stop the timer
     */
    stopTimer() {
        clearInterval(this.timerInterval);
    }

    /**
     * Update the score
     */
    updateScore() {
        const { total, hits, missed, accuracy } = getScores(this.shots);

        let text = `<strong>${total} shoots</strong> / <span class="green">${hits} hits</span>, <span class="red">${missed} missed</span>`;
        if (total > 0) {
            text += ` (${accuracy}% accuracy)`;
        }

        document.getElementById("scores").innerHTML = text;
    }

    cheat(text) {
        if (text.toLowerCase() === decrypt("73.87.68.71.70.71.79.89.81.74.85")) {
            this.debug = true;
            this.reloadScreen();
        }
    }
}
