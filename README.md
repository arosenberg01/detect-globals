# Detect Globals

Recursively detect global variable usage from a file-by-file perspective. Attemps to filter Node.js globals and some testing globals.

Config with config/default.json
```json
{
    "searchDir": <starting directory>,
    "ignoreFilePatterns": <array of files patterns to ignore>,
    "ignoreDirs": <array of dirs to ignore>
}
```
Ex:

```json
{
    "searchDir": "/Users/arosenberg/Documents/projects/sampleProject",
    "ignoreFilePatterns": [
        "min.js",
        "**/node_modules/**",
        "**/public/**"
    ],
    "ignoreDirs": [
        "scripts",
        "coverage",
        "node_modules",
        "scripts"
    ]
}
```