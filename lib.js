'use strict';

const _ = require('lodash');
const async = require('async');
const bluebird = require('bluebird');
const fs = bluebird.promisifyAll(require('fs'));
const readdir = bluebird.promisify(require('recursive-readdir'));
const detect = require('acorn-globals');
const commander = require('commander');

module.exports = reporter => {
    function _getNativeGlobals() {
        const nativeGlobalNames = Object.getOwnPropertyNames(global);
        const additionalGlobalNames = [
            'module',
            'exports',
            'require',
            '__dirname',
            '__filename'
        ];
        const globalNames = nativeGlobalNames.concat(additionalGlobalNames);
    
        return _.uniq(globalNames);
    };

    function _checkFilterValidity(path, filter) {
        const parentDirMatch = _.some(filter.parentDirs, dir => path.includes(dir));
        const extMatch = _.some(filter.fileExts, ext => path.endsWith(ext))
    
        return parentDirMatch || extMatch;
    };

    function _combineIgnoreGlobals(path, filters) {
        const nativeGlobals = _getNativeGlobals();
    
        let ignoreGlobals = _.reduce(filters, (ignoreGlobals, filter) => {
            const shouldApplyFilter = _checkFilterValidity(path, filter);
    
            if (shouldApplyFilter) {
                ignoreGlobals = ignoreGlobals.concat(filter.ignoreGlobals);
            }
    
            return ignoreGlobals;
        }, []);
    
        ignoreGlobals = ignoreGlobals.concat(nativeGlobals);
    
        return new Set(ignoreGlobals);
    };

    function _detectFileGlobals(path, filters) {
        return fs.readFileAsync(path, 'utf8')
        .then(contents => {
            const ignoreGlobals = _combineIgnoreGlobals(path, filters);
            const outstanding = _.chain(contents)
                .thru(detect)
                .map('name')
                .filter(global => !ignoreGlobals.has(global))
                .value();

            const result = { path, outstanding }

            if (outstanding.length > 0) {
                reporter.emit('parsed', result)
            }
    
            return { path, outstandingGlobals: outstanding }
        })
        .catch(error => ({ path, error }))
    };

    function detectDirGlobals(dir, ignores, filters) {
        let totalCount;
        ignores = ignores || [];
    
        return readdir(dir, ignores)
        .then(paths => {
            totalCount = paths.length
            const promsies = paths.map(path => _detectFileGlobals(path, filters));
    
            return bluebird.all(promsies);
        })
        .then(results => {
            const globalsFound = [];
            const parseFailed = [];

            results.forEach(result => {
                if (result) {
                    if (result.error) {
                        parseFailed.push(result);
                    } else if (result.outstandingGlobals.length > 0) {
                        globalsFound.push(result);
                    }
                }
            });
    
            return { globalsFound, parseFailed, totalCount }
        })

    };

    return {
        _getNativeGlobals,
        _checkFilterValidity,
        _combineIgnoreGlobals,
        _detectFileGlobals,
        detectDirGlobals
    };
}