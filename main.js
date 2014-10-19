'use strict';
var glob = require('glob');
var fs = require('fs');
var TopoSort = require('topo-sort');

var DepWalker = function(dependencyStatement){
  this.statement = dependencyStatement || 'require';
};
var p = DepWalker.prototype;
module.exports = DepWalker;

p.getPaths = function(cwd){
  cwd = cwd || '.';
  var paths = [];

  glob('**/*.js', {sync: true, cwd: cwd}, function(error, matches){
    matches.forEach(function(path){
      paths.push(cwd + '/' + path);
    });
  });

  return paths;
}

p.walk = function(cwd){
  cwd = cwd || '.';
  var paths = this.getPaths(cwd);

  var tsort = new TopoSort();

  // extract import statement logic.
  paths.forEach(function(path){
    var sourceContent = fs.readFileSync(path)+'';
    var lines = sourceContent.split(/\r?\n/);

    // keep track of the multi line comment state.
    var multiLineComment = false;

    var len = lines.length;
    for(var i=0; i<len; ++i){
      // ignore comment line
      // single line comment: //, /* ... */
      if(/\/\/|\/\*.+\*\//.test(lines[i])){
        continue;
      }
      // multi lines comment
      // First check whether there is a comment start, only if currently is not comment mode: /*
      // Once found start, only need to check comment end: */. Do not check comment start.
      if(!multiLineComment){
        multiLineComment = /\/\*/.test(lines[i]);
      }
      if(multiLineComment){
        multiLineComment = !/\*\//.test(lines[i]);
        continue;
      }

      // get the dependency statement defined
      var re = new RegExp('.*'+this.statement+'\\(\\s*(.+)\\s*\\)','g');
      var results = re.exec(lines[i]);
      if(results){
        var params = results[1].replace(/'|"|\s/g,'').split(',');

        var filePath = params[0];
        var funcName = params[1];

        tsort.add(path, cwd+'/'+filePath);
      }
    }
  }.bind(this));

  return tsort.sort().reverse();
}