'use strict';

const fs = require('fs');
const path = require('path');
const program = require('commander');

let ignores = [];
let filters = [];

try {
    const ignoresPath = path.resolve(__dirname, '.dgignores')

    if (fs.existsSync(ignoresPath)) {
        ignores = fs.readFileSync(ignoresPath, 'utf8').split('\n');
    }
} catch(err) {
    console.log(`Error parsing ignores file: ${err}`);
}

try {
    const filtersPath = path.resolve(__dirname, '.dgfilters.json');

    if (fs.existsSync(filtersPath)) {
        filters = require('./.dgfilters.json').filters;
    }
} catch(err) {
    console.log(`Error parsing filters file: ${err}`);
}

program
    .version('0.1.0')
    .option('-d, --directory <dir>', 'absolute path of search directory')
    .option('-v, --verbose', Boolean)
    .parse(process.argv);

const dir = program.directory;
const verbose = program.verbose;

if (!dir) {
    console.log('Directory required');
    process.exit(1);
}

try {
    const validDir = fs.lstatSync(dir);    
} catch (err) {
    console.log('Invalid directory');
    process.exit(1);
}

module.exports = {
    ignores,
    filters,
    dir,
    verbose,
};
