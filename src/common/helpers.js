/**
 * Generate a random number
 *
 * @param Number
 * @returns Number
 */
const random = (length) => {
    return Math.floor(Math.random() * length);
};

/**
 * Get a random value from array
 *
 * @param Array
 * @returns Mixed
 */
const randomArray = (array, limit = 0) => {
    return array[random(array.length - limit)];
};

/**
 * Get character by its index
 * 
 * @param Number
 * @param String
 * @param Array
 * @returns String
 */
const getCharByIndex = (index, base_char = "A", acceptedChars = []) => {
    const char = String.fromCharCode(base_char.charCodeAt(0) + index);

    if (acceptedChars.length > 0 && !acceptedChars.includes(char)) {
        return false;
    }

    return char;
};

/**
 * Get a random message from array of messages
 *
 * @param Array
 * @param Object
 * @returns String
 */
const randomMessage = (messages, params = {}) => {
    let message = messages[random(messages.length)];
    Object.keys(params).forEach((k) => {
        message = message.replace(`:${k}`, params[k]);
    });

    return message;
};

/**
 * Get score from shots
 *
 * @param Array
 * @returns Object
 */
const getScores = (shots) => {
    const total_shots = shots.reduce((sum, x) => sum + x);
    const accuracy = Math.round((shots[1] / total_shots) * 100 * 100) / 100;

    return {
        total: total_shots,
        hits: shots[1],
        missed: shots[0],
        accuracy,
    };
};

/**
 * Get elapsed time as minutes and seconds
 *
 * @param Date start_time
 * @returns Object
 */
const getElapsedTime = (start_time) => {
    const time = new Date() - start_time;
    const minutes = ("0" + Math.floor(time / 60000)).slice(-2);
    const seconds = ("0" + ((time % 60000) / 1000).toFixed(0)).slice(-2);
    return { minutes, seconds };
};

const encrypt = (text) => text.split("").map((c) => c.charCodeAt() - 30).reverse().join(".");
const decrypt = (text) => text.split(".").reverse().map((c) => String.fromCharCode(parseInt(c, 10) + 30)).join("");

module.exports = {
    random,
    randomArray,
    randomMessage,
    getScores,
    decrypt,
    getElapsedTime,
    getCharByIndex,
};
