# Usage

3 JavaScript files with dependencies:

#### src/main.js
```javascript
depends('A.js');
```

#### lib/A.js
```javascript
depends('B.js');
```

#### lib/B.js
```javascript
console.log('this is B.js');
```

#### lib/C.js
```javascript
console.log('this is isolated C.js');
```

The code to resolve the dependencies:
```javascript
var DepWalker = require('dependency-walker');

// use main.js as entry point,
// 2 source directories,
// and 'depends' as the dependency statement.
var walker = new DepWalker({
  main: 'main.js',
  directories: ['src', 'lib'],
  statement: 'depends'
});

// return the sorted dependencies of main.js:
// lib/B.js, lib/A.js, src/main.js
console.log(walker.walk());
```

#### Dependency with an entry point
Note that `lib/C.js` is not in the list. It is because from the entry point `main.js`, the dependency graph of `main.js`, `A.js` and `B.js`, does not contains `C.js`.

This is useful when you building a final application, non-related files are removed to save space.

#### Dependency without an entry point

If **NO** entry point is supplied, `lib/C.js` will be included in the sorted list. Since it will retrieve and sort all the files in `src` and `lib`. The isolated files will be also included.

This is typically useful when building a library. So every files in the library could be used by other application.

# Options
##### directory
The directories to be searched for.
##### pattern
A pattern matching string, using glob. Default to: `**/*.js`, all JavaScript files.
##### main
The entry point for calculating dependency graph. Differences between with and without supplying entry point is listed above.
##### statement
The dependency statement. By default is `require`. Dependency walker will extract this statement and its parameters in order to find out the file's dependencies.
