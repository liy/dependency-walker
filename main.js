'use strict';
var glob = require('glob');
var fs = require('fs');
var TopoSort = require('topo-sort');
var pt = require('path');

/**
 * options: {
 *   directories: null,
 *   pattern: '**\/*.js'
 *   main: null,
 *   basedir: '',
 *   statement: 'require',
 * }
 * @param {[type]} options [description]
 */
var DepWalker = function(options){
  this.options = options || Object.create(null);

  if(typeof this.options.directories === 'string'){
    this.options.directories = [this.options.directories];
  }
  else {
    this.options.directories = this.options.directories || [];
  }

  this.options.pattern = this.options.pattern || '**/*.js';
  this.options.statement = this.options.statement || 'require';

  // TODO: validate options
};
var p = DepWalker.prototype;
module.exports = DepWalker;

/**
 * Extract dependency info
 * @param  {[type]} sourcePath The source path of a file(including its corresponding source directory)
 * @param  {Boolean} dfs  If true, will be start from a start file(specified in option main), and recursively extracting dependency info.
 */
p.extract = function(sourcePath, dfs){
  var content = fs.readFileSync(sourcePath)+'';

  // keep track of the multi line comment state.
  var multiLineComment = false;

  var lines = content.split(/\r?\n/);
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
    var re = new RegExp('.*'+this.options.statement+'\\(\\s*(.+)\\s*\\)','g');
    var results = re.exec(lines[i]);
    if(results){
      var params = results[1].replace(/'|"|\s/g,'').split(',');
      var dependSourcePath = this.getSourcePath(params[0]);

      this.tsort.add(sourcePath, dependSourcePath);

      if(dfs){
        this.extract(dependSourcePath, dfs);
      }
    }
    else{
      this.tsort.add(sourcePath, []);
    }
  }
}

p.searchFiles = function(dir){
  var files = [];

  glob(this.options.pattern, {sync: true, cwd: dir}, function(error, matches){
    for(var i=0; i<matches.length; ++i){
      files.push(matches[i]);
    }
  }.bind(this));

  return files;
}

p.walk = function(){
  this.tsort = new TopoSort();

  // contains the source file's directory.
  this.dirMap = Object.create(null);
  // intialize directory map
  this.options.directories.forEach(function(dir){
    this.searchFiles(dir).forEach(function(file){
      this.dirMap[file] = dir;
    }.bind(this));
  }.bind(this));

  // If main entry point is specified, use it as the start file for recursive dependency extraction.
  if(this.options.main){
    this.extract(this.getSourcePath(this.options.main), true);
  }
  // Or, get all the files in the specified directories.
  else{
    for(var file in this.dirMap){
      this.extract(this.getSourcePath(file));
    }
  }

  return this.tsort.sort().reverse();
}

p.getSourcePath = function(file){
  return this.dirMap[file] + pt.sep + file;
}

var walker = new DepWalker({
  // main: 'main.js',
  directories: ['src', 'lib']
});
console.log(walker.walk());