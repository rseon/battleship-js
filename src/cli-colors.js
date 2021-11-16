// https://stackoverflow.com/a/41407246
const references = {
	reset: 0,
	dim: 2,
	underscore: 4,
	reverse: 7,
	hidden: 8,

	black: 30,
	red: 31,
	green: 32,
	yellow: 33,
	blue: 34,
	magenta: 35,
	cyan: 36,
	white: 37,

	bgBlack: 40,
	bgRed: 41,
	bgGreen: 42,
	bgYellow: 43,
	bgBlue: 44,
	bgMagenta: 45,
	bgCyan: 46,
	bgWhite: 47,	
}

/**
 * Colorize the text
 * 
 * This method is global because coloring functions are generated dynamically (see below)
 * 
 * @param String
 * @param String
 * @return String
 */
global.colorize = (text, color) => {
	const code = (color) => '\x1b[' + references[color] + 'm'
	return code(color) + text + code('reset')
}

/**
 * Display an empty line for block
 * 
 * @param String
 * @param String
 * @return String
 */
const blockEmptyLine = (text, bg_color = null) => {
	text = ' '.repeat(text.length)
	if (bg_color) {
		text = colorize(text, bg_color)
	}
	return text
}

/**
 * Display a block of text
 * 
 * @param String
 * @param String
 * @param String
 * @param Number
 * @return String
 */
const block = (text, color = null, bg_color = null, spaces_before = 0) => {
	text = `   ${text}   `

	if (bg_color) {
		bg_color = 'bg' + bg_color.charAt(0).toUpperCase() + bg_color.slice(1)
	}

	const prefix = ' '.repeat(spaces_before)
	let final = prefix + blockEmptyLine(text, bg_color) + '\n'

	final += prefix

	if (color) {
		if (bg_color) {
			final += colorize(colorize(text, color), bg_color) + '\n'
		} else {
			final += colorize(text, color) + '\n'
		}
	} else {
		final += text + '\n'
	}
	final += prefix + blockEmptyLine(text, bg_color)

	return final
}

/**
 * Coloring functions are created dynamically by each reference name.
 * 
 * @example color.black('Text')
 * @example color.red('Text')
 * @example color.green('Text')
 * @example color.yellow('Text')
 * @example color.blue('Text')
 * @example color.magenta('Text')
 * @example color.cyan('Text')
 * @example color.white('Text')
 * 
 * @example color.bgBlack('Text')
 * @example color.bgRed('Text')
 * @example color.bgGreen('Text')
 * @example color.bgYellow('Text')
 * @example color.bgBlue('Text')
 * @example color.bgMagenta('Text')
 * @example color.bgCyan('Text')
 * @example color.bgWhite('Text')
 */
let functions = {
	block
}
Object.keys(references).forEach(color => {
	functions[color] = new Function('text', `return colorize(text, '${color}')`)
})

export default functions

