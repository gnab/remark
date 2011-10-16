!function (context) {

  var remark = context.remark = context.remark || {}
    , converter = remark.converter = {};

  converter.convertSlideClasses = function (content) {
    var classFinder = /(^|\n)(\\)?((\.([a-z_-]+))+)/ig
      , classes
      , replacement
      , contentClasses = [content.className]
      , match
      ;

    while (match = classFinder.exec(content.innerHTML)) {
      classes = match[3].substr(1).split('.');

      if (match[2]) {
        // Simply remove escape slash
        replacement = match[1] + match[3];
      }
      else {
        replacement = "";
        contentClasses = contentClasses.concat(classes);
      }

      content.innerHTML = content.innerHTML.substr(0, match.index) +
        replacement + content.innerHTML.substr(match.index + match[0].length);

      classFinder.lastIndex = match.index + replacement.length;
    }

    if (contentClasses.length) {
      content.className = contentClasses.join(' ');
    }
  };

  converter.convertInlineClasses = function (content) {
    var classFinder = /(\\)?(((\.([a-z_-]+))+)\[(.+?)\])/ig
      , match
      , classes
      , replacement
      ;

    while (match = classFinder.exec(content.innerHTML)) {
      classes = match[3].substr(1).split('.');
      
      if (match[1]) {
      // Simply remove escape slash
        replacement = match[2];
        classFinder.lastIndex = match.index + replacement.length;
      }
      else {
        replacement = "<span class=\"" + 
          classes.join(' ') + 
          "\">" + 
          match[6] +
          "</span>";

        classFinder.lastIndex = match.index + 
          ("<span class=\"" + classes.join(' ') + "\">").length;
      }

      content.innerHTML = content.innerHTML.substr(0, match.index) +
        replacement + content.innerHTML.substr(match.index + match[0].length);
    }
  };

}(this);
