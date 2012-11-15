var jsp = require('uglify-js').parser
  , pro = require('uglify-js').uglify
  ;

exports.minify = function (content) {
  var ast = jsp.parse(content);

  ast = pro.ast_mangle(ast);
  ast = pro.ast_squeeze(ast);

  return pro.gen_code(ast);
};
