'use strict';

Set.prototype.union = function(setB) {
    var union = new Set(this);
    for (var elem of setB) {
        union.add(elem);
    }
    return union;
}

module.exports = function() {
    const mochaGlobalsNames = [
        'after',
        'afterEach',
        'before',
        'beforeEach',
        'describe',
        'it'
    ];

    const additionalGlobals = [
        'module',
        'exports',
        'require',
        '__dirname',
        '__filename'
    ]
    let nativeGlobalNames = Object.getOwnPropertyNames(global);

    const defaultGlobalNames = nativeGlobalNames.concat(additionalGlobals);
    const defaultGlobals = new Set(defaultGlobalNames);
    const testGlobals = new Set(mochaGlobalsNames);
    const defaultPlusTestGlobals = defaultGlobals.union(testGlobals);

    return {
        default: defaultGlobals,
        defaultPlusTest: defaultPlusTestGlobals
    }
};
