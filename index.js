'use strict';

const _ = require('lodash');
const bluebird = require('bluebird');
const fs = bluebird.promisifyAll(require('fs'));
const recursive = require('recursive-readdir');
const detect = require('acorn-globals');
const config = require('config');
const getNativeGlobals = require('./native-globals');

const nativeGlobals = getNativeGlobals();

const isTestFile = (file) => {
    const testFileExts = ['.test.js', '.test.disabled.js', '.integration.disabled.js']
    const extMatch = _.find(testFileExts, ext => file.endsWith(ext));
    const inTestDir = file.includes('/test/')
    
    return extMatch !== undefined || inTestDir;
}

const report = () => {
    recursive(config.searchDir, config.ignoreFilePatterns, function (err, files) {
        let filesWithGlobalsCount = 0

        if (err) {
            console.log(`Error finding files: ${err}`);
        }

        _.forEach(files, file => {
            const src = fs.readFileSync(file, 'utf8');

            try {
                const scope = detect(src);
                const filteredScope = _.filter(scope, node => {
                    if (isTestFile(file)) {
                        return !nativeGlobals.defaultPlusTest.has(node.name);
                    } else {
                        return !nativeGlobals.default.has(node.name);
                    }
                }); 

                if (filteredScope.length > 0) {
                    const globalVars = _.map(filteredScope, 'name');
                    filesWithGlobalsCount++;
                    
                    console.log(file)
                    console.log(globalVars)
                    console.log('-------------')           
                }
            } catch(err) {
                console.log('*****')
                console.log('Detect failed:', err);
                console.log(file);
                console.log('*****')
            }
        });

        console.log(`Files searched: ${files.length}`);
        console.log(`Offending files found: ${filesWithGlobalsCount}`);
    });  
}

report();

