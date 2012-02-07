var builder = require('./util/builder')
  , options = {}
  ;

process.argv.forEach(function (val, index) {
  if (val === '--debug' || val === '-d') {
    options.debug = true;
  }
});

builder.build('src/remark.js', 'remark.min.js', options, function () {

});
