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