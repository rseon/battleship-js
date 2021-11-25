# Battleship JS

> Just a playground to play with ES6 and Node


## Play in Browser

You need to clone this project and build it (see the next [Develop](#develop) section), then launch the **dist/index.html** file.



## Play in CLI mode

You need NodeJS to play this game. And that's all.

- Download last release and unzip it
- Open a command prompt (CLI) in full screen
- Type `npm run play`
- Enjoy !


### A note on command prompt

Please use a "modern" command prompt. An older (like the default Windows CLI) can't display Unicode characters.

This game has been tested on following CLI :

- **Windows 10**:
  - Terminal
  - Git Bash
- **Linux (Ubuntu, openSUSE, Arch Linux, etc)**:
  - gnome-terminal (Terminal GNOME)

If you have tested successfully on another CLI / OS, please add it to this list and send a pull request :)


## Develop

- Clone this project
- `npm install` to install dependencies
- `npm run dev` to develop the CLI version with hot reload
- `npm run serve` to develop the Browser version with hot reload
- `npm run build` to build the Browser version (in **dist** folder)



## Roadmap

- [x] CLI mode
- [x] Browser version
- [ ] Add (animated) screenshots in readme
- [ ] Better CLI graphics
- [ ] Improve ship placement (at least 1 case between 2 ships)
- [ ] Customize size

Any idea ? Send pull request !


## Credits

Created by Rémi Séon, inspired from [this original gist](https://gist.github.com/lizparody/528badd08958943a7d309195b824f25d)
