# Detect Globals

Recursively detect Javascript global variable usage from a file-by-file perspective. Completely ignoring file types by pattern and and ignoring certain globals for certain file types is configurable.

Installation
```
git clone https://github.com/arosenberg01/detect-globals.git
```

Getting started
```
node ./bin/detect-globals -d /Users/you/Documents/projects/project1
```

Help
```
node ./bin/detect-glbobals -h
```


Configure ignoring files completely with .dgignores
```
!*.js
node_modules
```


Configure ignoring specific globals certain file paths/extensions with .dgfilters.json
```json
{
    "filters": [
        {
            "type": "test",
            "fileExts": [".test.js", ".test.disabled.js", ".integration.disabled.js"],
            "parentDirs": ["/test/"],
            "ignoreGlobals": [
                "after",
                "afterEach",
                "before",
                "beforeEach",
                "context",
                "describe",
                "it",
                "run",
                "specify",
                "xcontext",
                "xdescribe",
                "xit",
                "xspecify"
            ]
        }
    ]
}
```