module.exports = class Ship {
    constructor(name, length) {
        this.name = name;
        this.length = length;
        this.sunk = false;

        this.locations = Array.from({ length: this.length }, () => null);
        this.hits = Array.from({ length: this.length }, () => false);
    }

    /**
     * Set location of the ship
     *
     * @param Array
     */
    setLocations(locations) {
        this.locations = locations;
    }

    /**
     * Set ship has been hit
     *
     * @param Number
     */
    setHit(index) {
        // Set hit at index
        const idx = this.locations.findIndex((l) => l === index);
        if (idx > -1) {
            this.hits[idx] = true;
        }

        // IF all hits
        this.sunk = this.hits.filter((hit) => hit === false).length === 0;
    }

    /**
     * Get if the ship is sunk
     */
    isSunk() {
        return this.sunk === true;
    }
};

