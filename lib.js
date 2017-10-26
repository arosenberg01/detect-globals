'use strict';

const _ = require('lodash');
const async = require('async');
const bluebird = require('bluebird');
const fs = bluebird.promisifyAll(require('fs'));
const readdir = bluebird.promisify(require('recursive-readdir'));
const detect = require('acorn-globals');
const commander = require('commander');

exports._getNativeGlobals = () => {
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

exports._checkFilterValidity = (path, filter) => {
    const parentDirMatch = _.some(filter.parentDirs, dir => path.includes(dir));
    const extMatch = _.some(filter.fileExts, ext => path.endsWith(ext))

    return parentDirMatch || extMatch;
};

exports._combineIgnoreGlobals = (path, filters) => {
    const nativeGlobals = exports._getNativeGlobals();

    let ignoreGlobals = _.reduce(filters, (ignoreGlobals, filter) => {
        const shouldApplyFilter = exports._checkFilterValidity(path, filter);

        if (shouldApplyFilter) {
            ignoreGlobals = ignoreGlobals.concat(filter.ignoreGlobals);
        }

        return ignoreGlobals;
    }, []);

    ignoreGlobals = ignoreGlobals.concat(nativeGlobals);

    return new Set(ignoreGlobals);
};

exports._detectOutstandingGlobalsAsync = (path, filters) => {
    return fs.readFileAsync(path, 'utf8')
    .then(contents => {
        const ignoreGlobals = exports._combineIgnoreGlobals(path, filters);
        const outstandingGlobals = _.chain(contents)
            .thru(detect)
            .map('name')
            .filter(global => !ignoreGlobals.has(global))
            .value();
        
        return { path, outstandingGlobals }
    }).catch(error => { path, error });
};

exports.detectGlobalsAsyncExport = (dir, ignores, filters) => {
    return readdir(dir, ignores)
    .then(paths => {
        paths = paths.map(path => exports._detectOutstandingGlobalsAsync(path, filters));

        return bluebird.all(paths);
    });
};
