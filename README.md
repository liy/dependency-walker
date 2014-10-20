# Usage
```javascript
var DepWalker = require('dependency-walker');

// use main.js as entry point, and 2 source directories
var walker = new DepWalker({
  main: 'main.js',
  directories: ['src', 'lib']
});
// return the sorted dependencies of main.js
console.log(walker.walk());
```