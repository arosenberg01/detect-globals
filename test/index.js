'use strict';

const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const _ = require('lodash');
const globalNames = require('./data')
const detectGlobals = require('../lib')();
const expect = chai.expect;

chai.use(chaiAsPromised);

const filters = [
    {
        type: 'test',
        fileExts: ['.test.js', '.test.disabled.js', '.integration.disabled.js'],
        parentDirs: ['/test/'],
        ignoreGlobals: [
            'after',
            'afterEach',
            'before',
            'beforeEach',
            'context',
            'describe',
            'it',
            'run',
            'specify',
            'xcontext',
            'xdescribe',
            'xit',
            'xspecify'
        ]
    },
    {
        type: 'legacy',
        fileExts: [],
        parentDirs: ['/legacy/'],
        ignoreGlobals: [
            'async',
            'underscore'
        ]
    }
];

describe('_getNativeGlobals', () => {
    it('should return a unique array of native global names', () => {
        const nativeGlobals = detectGlobals._getNativeGlobals();   
        const diff = _.difference(globalNames.native, nativeGlobals).length;
        
        expect(diff).to.eq(0);
    });
});

describe('_checkFilterValidity', () => {
    const testFilter = filters[0];

    it('should return true for files in filter-specified directories', () => {
        const path = '/Users/user1/Documents/test/first.js';
        const shouldApplyFilter = detectGlobals._checkFilterValidity(path, testFilter);

        expect(shouldApplyFilter).to.eq(true);
    });

    it('should return true for files with filter-specified extensions', () => {
        const path = '/Users/user1/Documents/second.test.js';
        const shouldApplyFilter = detectGlobals._checkFilterValidity(path, testFilter);

        expect(shouldApplyFilter).to.eq(true);
    });

    it('should return false for filters that are not applicable to a specific file', () => {
        const path = '/Users/user1/Documents/third.js';
        const shouldApplyFilter = detectGlobals._checkFilterValidity(path, testFilter);

        expect(shouldApplyFilter).to.eq(false);        
    });
})

describe('_combineIgnoreGlobals', () => {
    it('should combine the ignore globals from all valid filters into a Set', () => {
        const path = '/Users/user1/Documents/test/first.js';
        const combinedIgnoreGlobals = detectGlobals._combineIgnoreGlobals(path, filters);
        const expected = new Set(globalNames.getAll());

        expect(combinedIgnoreGlobals).to.deep.eq(expected);
    });
});

describe('_detectFileGlobals', () => {
    it('should return the globals for a single file', () => {
        const path = 'test/test-app/app.js';
        const expected = ['async', 'bluebird'];
        const promise = detectGlobals._detectFileGlobals(path, filters);

        return expect(promise).to.be.fulfilled
        .then(result => {
            expect(path).to.eq(result.path);
            expect(result.outstanding.sort()).to.deep.eq(expected.sort());
        }); 
    });
});


describe('detectDirGlobals', () => {
    it('should work', () => {
        const dir = '/Users/anselrosenberg/Documents/temp/so-temp/detect-globals/test/test-app';
        const promise = detectGlobals.detectDirGlobals(dir, [], filters);

        return expect(promise).to.be.fulfilled
        .then(results => {
            expect(results.totalCount).to.eq(4);
            expect(results.parseFailed.length).to.eq(0);
            expect(results.globalsFound.length).to.eq(1);

        });
    });

    it('should work while ingored filtered file types', () => {
        const dir = '/Users/anselrosenberg/Documents/temp/so-temp/detect-globals/test/test-app';
        const promise = detectGlobals.detectDirGlobals(dir, ['*.jpg'], filters);

        return expect(promise).to.be.fulfilled
        .then(results => {
            expect(results.totalCount).to.eq(3);
            expect(results.parseFailed.length).to.eq(0);
            expect(results.globalsFound.length).to.eq(1);
        });
    });
});
