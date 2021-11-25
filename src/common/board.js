const { random, randomArray, getCharByIndex } = require("./helpers.js");

/**
 * Shot results
 */
const SHOT_RESULTS = {
    missed: {
        code: 0,
        messages: [
            "Missed, looser !!",
            "HAHAAA, are you blind ?",
            "You killed Nemo, you silly !",
            "Nope, you need glasses.",
        ],
    },
    played: {
        code: 1,
        messages: ["Already played, bro"],
    },
    hit: {
        code: 2,
        messages: [
            "BOOOOM in my face !!",
            "OUCH ! What did i just take !",
            "Not even hurt... Ehm, I lied :(",
        ],
    },
    sunk: {
        code: 3,
        messages: [
            "Ow SH*T, my :ship is sunk !",
            "WHAT THE HELL ??! You just sunk my :ship !",
        ],
    },
    decimated: {
        code: 4,
        messages: ["Yay, my fleet is decimated, bravo !!"],
    },
};

/**
 * Convert location ('A1') to column and row (['A', 1])
 *
 * @returns Array
 */
const locationToColRow = (location) => {
    let tmp = location.toUpperCase().split("");
    const col = tmp.shift();
    return [col, tmp.join("")];
}

class Board {
    constructor(size) {
        if (size < 10 || size > 20) {
            throw new Error("Please set a board size between 10 and 20");
        }

        this.size = size;
        this.empty_result = null;

        // Generate board columns (A, B, C...)
        this.cols = Array.from({ length: this.size }, (_, i) =>
            getCharByIndex(i)
        );

        // Generate board rows (1, 2, 3...)
        this.rows = Array.from({ length: this.size }, (_, i) => i + 1);

        this.initBoard();
    }

    /**
     * Init the board with columns and rows
     *
     * Each case of the board is an object with its index, ship and if was hit
     */
    initBoard() {
        this.board = {};
        this.rows.forEach((row) => {
            this.board[row] = {};
            this.cols.forEach((col) => {
                this.board[row][col] = {
                    index: col + row,
                    ship: null,
                    hit: false,
                };
            });
        });
    }

    /**
     * Get the board
     *
     * @returns Object
     */
    getBoard() {
        return this.board;
    }

    /**
     * Place the fleet randomly on the board
     *
     * @param Fleet
     */
    placeFleet(fleet) {
        this.fleet = fleet;
        this.ships = this.fleet.getShips();

        let locations = [];
        this.ships.forEach((ship) => {
            if (ship.length > this.size) {
                throw new Error(
                    `Ship "${ship.name}" can not be longer than board size (${this.size})`
                );
            }

            // Generate new locations without collision with other ships
            do {
                locations = this.generateLocation(ship);
            } while (this.collision(locations));

            // Set location to the ship
            ship.setLocations(locations);

            // Place the ship on the board
            this.placeShipOnBoard(ship);
        });
    }

    /**
     * Generate ship location randomly
     *
     * @param Ship
     * @returns Array
     */
    generateLocation(ship) {
        const direction = random(2);
        let row, col;

        // Horizontal
        if (direction === 1) {
            row = randomArray(this.rows);
            col = randomArray(this.cols, ship.length + 1);
        } else {
            row = randomArray(this.rows, ship.length + 1);
            col = randomArray(this.cols);
        }

        let newShipLocations = [];
        for (let i = 0; i < ship.length; i++) {
            let value;
            if (direction === 1) {
                value = getCharByIndex(i, col) + row;
            } else {
                value = col + (row + i);
            }
            newShipLocations.push(value);
        }

        return newShipLocations;
    }

    /**
     * Get if there is already a ship on this location
     * 
     * Leave 1 empty box around the ship
     *
     * @param Array
     * @returns Boolean
     */
    collision(locations) {
        for (let i = 0; i < this.ships.length; i++) {
            for (let j = 0; j < locations.length; j++) {
                const square_boxes = this.searchSquareBox(
                    this.ships[i].locations
                );
                if (square_boxes.includes(locations[j])) {
                    return true;
                }
            }
        }
        return false;
    }

    /**
     * Search the square that includes locations
     *
     * Returns the square outside this location :
     * top left, top, top right, left, right, bottom left, bottom and bottom right
     *
     * Example for B2 => [A1, A2, A3, B1, B2, B3, C1, C2, C3]
     * Example for A1 => [A1, A2, B1, B2]
     * Example for J10 => [I9, I10, J9, J10] (for a board size of 10)
     *
     * @param Array
     * @returns Array
     */
    searchSquareBox(locations) {
        let boxes = [];
        locations.forEach((l) => {
            if (l !== null) {
                let [col, row] = locationToColRow(l);
                row = parseInt(row, 10);

                [-1, 0, 1].forEach((x) => {
                    [-1, 0, 1].forEach((y) => {
                        const [newCol, newRow] = this.getCoordsByDeltas(
                            col,
                            row,
                            x,
                            y
                        );
                        if (
                            newCol !== false &&
                            newRow > 0 &&
                            newRow < this.size
                        ) {
                            const coords = newCol + newRow;
                            if (!boxes.includes(coords)) {
                                boxes.push(coords);
                            }
                        }
                    });
                });
            }
        });

        return boxes;
    }

    /**
     * Returns coords [col, row] with delta
     * 
     * @param String
     * @param Number
     * @param Number
     * @param Number
     * @returns Array
     */
    getCoordsByDeltas(col, row, x, y) {
        return [getCharByIndex(x, col, this.cols), row + y];
    }

    /**
     * Get the fleet
     *
     * @returns Fleet
     */
    getFleet() {
        return this.fleet;
    }

    /**
     * Place the ship on the board
     *
     * @param Ship
     */
    placeShipOnBoard(ship) {
        let found = false;

        ship.locations.forEach((location) => {
            this.rows.forEach((row) => {
                this.cols.forEach((col) => {
                    if (location == this.board[row][col].index) {
                        this.board[row][col].ship = ship;
                        found = true;
                    }

                    this.board[row][col].result = this.empty_result;
                });

                if (found) {
                    return;
                }
            });
        });
    }

    /**
     * Shoot on location and returns the result
     *
     * @returns Promise
     */
    shoot(location) {
        return new Promise((resolve, reject) => {
            if (!location.length) {
                reject("Please type location");
            }

            let [col, row] = locationToColRow(location);
            if (!(row in this.board) || !(col in this.board[row])) {
                reject("Out of board !");
            }

            const choice = this.board[row][col];
            let result;
            let ship;

            // Already played
            if (choice.hit) {
                result = SHOT_RESULTS.played.code;
            } else if (choice.ship) {
                ship = choice.ship;

                // Hit
                this.fleet.setShipHit(choice.ship, choice.index);
                choice.result = true;

                if (this.board[row][col].ship.isSunk()) {
                    if (this.fleet.isDecimated()) {
                        result = SHOT_RESULTS.decimated.code;
                    } else {
                        result = SHOT_RESULTS.sunk.code;
                    }
                } else {
                    result = SHOT_RESULTS.hit.code;
                }
            } else {
                // Missed
                result = SHOT_RESULTS.missed.code;
                choice.result = false;
            }

            choice.hit = true;
            this.board[row][col] = choice;

            resolve({ result, ship });
        });
    }
}

exports.SHOT_RESULTS = SHOT_RESULTS
exports.Board = Board