# TourneyMan

TourneyMan is a tournament management system for tabletop game publishers, 
retailers, and gamers to use alike to run tournements for tabletop board games.

It is built in partnership with Catan Studios (publishers of the wildly popular
Catan board game).

**This project is in active development, and is NOT ready for production usage.**

## Status

[![Build Status](https://travis-ci.org/kitanata/TourneyMan.svg?branch=master)](https://travis-ci.org/kitanata/TourneyMan)

## To Use

To clone and run this repository you'll need [Git](https://git-scm.com) and 
[Node.js](https://nodejs.org/en/download/) (which comes with [npm](http://npmjs.com)) 
installed on your computer. From your command line:

```bash
# Clone this repository
git clone https://github.com/kitanata/TourneyMan

# Go into the repository
cd TourneyMan

# Install dependencies
npm install

# Run the App
npm start
```

### Gulp Tasks

- `gulp clean` Will clean the build.
- `gulp test_once` Will run the tests once (for CI).
- `gulp test` Will run tests in watch mode for development.
- `gulp build` Will build the project and package it into a generated dist directory.
- `gulp` Will clean, build, and watch the project for development.

#### License

Copyright © 2016 Raymond Chandler III

This project is wholly owned and maintained by Raymond Chandler III however it
is free and open source software licensed under the GNU General Public License v3.0.

Non open-source licenses are available for tabletop game publishers wishing to 
customize Tourneyman. If you are interested in obtaining a commercial license, 
please file an issue in the github issue tracker for this project.

