'use strict';

const bluebird = require('bluebird');
const fs = bluebird.promisifyAll(require('fs'));
const program = require('commander');
const colors = require('colors/safe');
const detectGlobals = require('./lib').detectDirGlobals

program
    .version('0.1.0')
    .option('-d, --directory <dir>', 'absolute path of search directory')
    .option('-r --reporter <reporter>', 'reporter type')
    .parse(process.argv);

const dir = program.directory;
const reporter = program.reporter;


const reporters = {
    default: {
        report: data => {

        }
    },
    file: {
        report: data => {

        }
    }
}

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

if (!reporter) {
    // reporter = 'default';
} else {

}


return detectGlobals(dir, [])
.then(result => {

    result.globalsFound.forEach(global => {
        const outstanding = global.outstandingGlobals
        const namesOutput = outstanding.join('\n\t');

        console.log(`  ${global.path}`);
        console.log(colors.cyan(`    unique count: ${outstanding.length}`))
        console.log(`\t${colors.dim(namesOutput)}\n`)
    })
});