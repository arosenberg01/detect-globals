'use strict';

const bluebird = require('bluebird');
const fs = bluebird.promisifyAll(require('fs'));
const path = require('path');
const EventEmitter = require('events').EventEmitter;
const _ = require('lodash');
const program = require('commander');
const colors = require('colors/safe');

const reporter = new EventEmitter();
const detectGlobals = require('./lib')(reporter).detectDirGlobals

let ignores = [];

try {
    const ignoresPath = path.resolve(__dirname, '.dgignores')

    if (fs.existsSync(ignoresPath)) {
        ignores = fs.readFileSync(ignoresPath, 'utf8').split('\n');
    }

} catch(err) {
    console.log(`Error parsing ignores file: ${err}`);
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

reporter.on('detected', result => {
    const outstanding = result.outstanding
    const namesOutput = outstanding.join('\n\t');

    console.log(`  ${result.path}`);
    console.log(colors.cyan(`    unique count: ${outstanding.length}`))
    console.log(`\t${colors.dim(namesOutput)}\n`)
});

console.log('\n')
return detectGlobals(dir, ignores)
.then(result => {
    const numOutstandingFiles = result.globalsFound.length;
    const numParseFailed = result.parseFailed.length;
    const parsedFailedFiles = _.map(result.parseFailed, 'path');

    if (verbose) {
        const failedOutput = `   ${parsedFailedFiles.join('\n\t')}`;
        console.log('  [Failed parsing]');
        console.log(colors.red(`    count: ${numParseFailed}`));
        console.log(colors.dim(`\t${failedOutput}`));
    }

    console.log(colors.green(`\n${result.totalCount} files found`));
    console.log(colors.green(`${numOutstandingFiles} files with globals`));
    console.log(colors.green(`${numParseFailed} files couldn't be scanned`));
});