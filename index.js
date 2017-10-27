'use strict';

const bluebird = require('bluebird');
const fs = bluebird.promisifyAll(require('fs'));
const path = require('path');
const EventEmitter = require('events').EventEmitter;
const _ = require('lodash');
const program = require('commander');
const colors = require('colors/safe');

const reporter = new EventEmitter();
const init = require('./init');
const detectGlobals = require('./lib')(reporter).detectDirGlobals

reporter.on('detected', result => {
    const outstanding = result.outstanding
    const namesOutput = outstanding.join('\n\t');

    console.log(`  ${result.path}`);
    console.log(colors.cyan(`    unique count: ${outstanding.length}`))
    console.log(`\t${colors.dim(namesOutput)}\n`)
});

console.log('\n')
return detectGlobals(init.dir, init.ignores, init.filters)
.then(result => {
    const numOutstandingFiles = result.globalsFound.length;
    const numParseFailed = result.parseFailed.length;
    const parsedFailedFiles = _.map(result.parseFailed, 'path');

    if (init.all) {
        let allGlobals = _.reduce(result.globalsFound, (accum, el) => {
            accum = accum.concat(el.outstanding);

            return accum;
        }, []);

        allGlobals = _.uniq(allGlobals).sort();

        const allGlobalsOutput = `    ${allGlobals.join('\n\t')}`;
        console.log('-- All globals')
        console.log(colors.yellow(`    count: ${allGlobals.length}`));
        console.log(`    ${colors.dim(allGlobalsOutput)}\n`);
    }

    if (init.verbose) {
        const failedOutput = `   ${parsedFailedFiles.join('\n\t')}`;
        console.log('-- Failed parsing');
        console.log(colors.red(`    count: ${numParseFailed}`));
        console.log(colors.dim(`\t${failedOutput}`));
    }

    console.log(colors.green(`\n${result.totalCount} file(s) found`));
    console.log(colors.green(`${numOutstandingFiles} file(s) with globals`));
    console.log(colors.green(`${numParseFailed} file(s) failed parsing`));
});