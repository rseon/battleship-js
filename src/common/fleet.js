module.exports = class Fleet {
    constructor() {
        this.ships = [];
        this.decimated = false;
    }

    /**
     * Add ship to the fleet
     *
     * @param Ship
     */
    addShip(ship) {
        this.ships.push(ship);
    }

    /**
     * Get ships
     *
     * @returns Array
     */
    getShips() {
        return this.ships;
    }

    /**
     * Get if fleet is decimated
     *
     * @returns Boolean
     */
    isDecimated() {
        return this.decimated === true;
    }

    /**
     * Set a ship hit
     *
     * @param Ship
     * @param Number
     */
    setShipHit(ship, index) {
        this.ships.some((s) => {
            if (s.name === ship.name) {
                s.setHit(index);
                return true;
            }
        });

        // All ships are sunk = the fleet is decimated
        if (this.ships.filter((s) => s.isSunk()).length === this.ships.length) {
            this.decimated = true;
        }
    }
};

