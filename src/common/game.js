const { randomMessage } = require("./helpers.js");
const { SHOT_RESULTS } = require("./board.js");

/**
 * Common base for all versions of the game
 */
module.exports = class Game {
    constructor(board) {
        this.board = board;
        this.shots = [0, 0];
        this.timer = new Date();
    }

    /**
     * Start the game
     */
    start() {
        throw new Error("You must implement this method");
    }

    /**
     * Set character when hit a ship
     *
     * @param String
     */
    setHitChar(char) {
        this.hit_char = char;
    }

    /**
     * Set character when miss a ship
     *
     * @param String
     */
    setMissedChar(char) {
        this.missed_char = char;
    }

    /**
     * Handle the shot
     *
     * @param Number
     * @param Ship
     * @returns Object
     */
    getTheShot(result, ship) {
        let answer, color, bg_color;
        switch (result) {

            // Missed
            case SHOT_RESULTS.missed.code:
                ++this.shots[0];
                answer = randomMessage(SHOT_RESULTS.missed.messages);
                color = "cyan";
                break;

            // Already played
            case SHOT_RESULTS.played.code:
                answer = randomMessage(SHOT_RESULTS.played.messages);
                color = "red";
                break;
            
            // Hit
            case SHOT_RESULTS.hit.code:
                ++this.shots[1];
                answer = randomMessage(SHOT_RESULTS.hit.messages);
                color = "green";
                break;
            
            // Sunk
            case SHOT_RESULTS.sunk.code:
                ++this.shots[1];
                answer = randomMessage(SHOT_RESULTS.sunk.messages, {
                    ship: ship.name,
                });
                color = "yellow";
                break;
            
            // Decimated
            case SHOT_RESULTS.decimated.code:
                ++this.shots[1];
                answer = randomMessage(SHOT_RESULTS.decimated.messages);
                color = "black";
                bg_color = "green";
                break;

            default:
                throw new Error(`Unexpected result : ${result}`);
        }

        if (answer) {
            return { answer, color, bg_color };
        }
    }
};
