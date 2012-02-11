!function (exports) {

  exports.search = function search(data, pattern, selector, replace, done) {
    var match;

    if (match = pattern.exec(data)) {
      replace(selector(match), function (replacement) {
        data = data.substr(0, match.index) + replacement + 
          data.substr(match.index + match[0].length);
        
        pattern.lastIndex = match.index + replacement.length;

        search(data, pattern, selector, replace, done);
      });
    }
    else {
      done(data);
    }
  };

}(exports || (remark.util = {}))
