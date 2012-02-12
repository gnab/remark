!function (remark) {

  /* bundle "vendor/marked.js" */

  var converter = remark.converter = {};

  converter.convertSlideClasses = function (content) {
    var classFinder = /(?:^|\n)(\\)?((?:\.[a-z_-][a-z-_0-9]*)+)\s*(?:$|\n)/ig
      , classes
      , replacement
      , contentClasses = ['content']
      , match
      ;

    while (match = classFinder.exec(content.innerHTML)) {
      if (match[1]) {
        // Simply remove escape slash
        replacement = match[0].replace(/\\/, '');
      }
      else {
        replacement = "";

        classes = match[2].substr(1).split('.');
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

  converter.convertContentClasses = function (content) {
    var classFinder = /(\\)?((?:\.[a-z_-][a-z-_0-9]*)+)\[/ig
      , match
      , classes
      , text
      , replacement
      , after
      ;

    while (match = classFinder.exec(content.innerHTML)) {
      text = getSquareBracketedText(content.innerHTML.substr(
            match.index + match[0].length));

      if (text === null) {
        continue;
      }
      
      if (match[1]) {
        // Simply remove escape slash
        replacement = match[2] + '[' + text + ']';
        classFinder.lastIndex = match.index + replacement.length;
      }
      else {
        classes = match[2].substr(1).split('.');

        replacement = "<span class=\"" + 
          classes.join(' ') + 
          "\">" + 
          text +
          "</span>";

        classFinder.lastIndex = match.index + 
          ("<span class=\"" + classes.join(' ') + "\">").length;
      }

      after = content.innerHTML.substr(
          match.index + match[0].length + text.length + 1);

      content.innerHTML = content.innerHTML.substr(0, match.index) +
        replacement + after;
    }
  };

  var getSquareBracketedText = function (text) {
    var count = 1
      , pos = 0
      , chr
      ;

    while (count > 0 && pos < text.length) {
      chr = text[pos++];
      count += (chr === '[' && 1) || (chr === ']' && -1) || 0;
    }

    return count === 0 && text.substr(0, pos - 1) || null;
  };

  converter.convertMarkdown = function (content) {
    content.innerHTML = marked(content.innerHTML.trim(' '));

    content.innerHTML = content.innerHTML.replace(/&[l|g]t;/g,
      function (match) {
        return match === '&lt;' ? '<' : '>';
      });

    content.innerHTML = content.innerHTML.replace(/&amp;/g, '&');
  };

  converter.convertCodeClasses = function (content) {
    var codeBlocks = content.getElementsByTagName('code')
      , i
      ;

    for (i = 0; i < codeBlocks.length; i++) {
      convertCodeClass(codeBlocks[i]);
    }
  };

  var convertCodeClass = function (block) {
    var defaultClass = remark.config.highlightLanguage
      , highlightInline = remark.config.highlightInline
      , isInlineCode = block.parentNode.nodeName.toUpperCase() !== 'PRE'
      ;

      if (setCodeClass(block)) {
        return;
      }

      if (isInlineCode && !highlightInline) {
        block.className = 'no-highlight';
      }
      else if (defaultClass) {
        block.className = defaultClass;
      }
  };

  var setCodeClass = function (block) {
    var classFinder = /^(\\)?\.([a-z_-][a-z-_0-9]*)(?:\n|\ )/i
      , match
      ;

    if (match = classFinder.exec(block.innerHTML)) {
      if (match[1]) {
        block.innerHTML = block.innerHTML.substr(match[1].length);
      }
      else {
        block.innerHTML = block.innerHTML.substr(match[0].length);
        block.className = match[2];
        return true;
      }
    }

    return false;
  };

}(remark);
