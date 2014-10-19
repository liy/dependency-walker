# Usage
```javascript
var DepWalker = require('dependency-walker');

// use 'depends' as the dependency statement.
var walker = new DepWalker('depends');
// get all files in 'src' directory and return sorted file dependencies.
console.log(walker.walk('src'));
```