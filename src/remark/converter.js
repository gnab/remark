!function (context) {

  /* bundle "vendor/highlight.min.js" */
  /* bundle "vendor/showdown.js" */

  var remark = context.remark = context.remark || {}
    , converter = remark.converter = {}
    ;

  converter.convertSlideClasses = function (content) {
    var classFinder = /(^|\n)(\\)?((\.([a-z_-]+))+\s*($|\n))/ig
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

  converter.convertContentClasses = function (content) {
    var classFinder = /(\\)?(((\.([a-z_-]+))+)\[(.+)\])/ig
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

  converter.convertMarkdown = function (content) {
    var converter = new Showdown.converter();

    content.innerHTML = converter.makeHtml(content.innerHTML.trim(' '));
    content.innerHTML = content.innerHTML.replace(/&amp;/g, '&');
  };

  converter.convertCodeBlocks = function (content) {
    var codeBlocks = content.getElementsByTagName('code')
      , block
      , i
      , foundClass
      , isInlineCode
      ;

    for (i = 0; i < codeBlocks.length; i++) {
      block = codeBlocks[i];

      foundClass = convertCodeClass(block);
      isInlineCode = block.parentNode.nodeName.toUpperCase() !== 'PRE';

      if (!foundClass && isInlineCode) {
        block.className = 'no-highlight';
      }
    }
  };

  var convertCodeClass = function (block) {
    var classFinder = /^(\\)?\.([a-z_-]+)(\n|\ )/i
      , match
      ;

    if (match = classFinder.exec(block.innerHTML)) {
      if (!match[1]) {
        block.innerHTML = block.innerHTML.substr(match[0].length);
        block.className = match[2];
        return true;
      }
    }

    return false;
  };

  converter.highlightCodeBlocks = function (content) {
    var codeBlocks = content.getElementsByTagName('code')
      , block
      , i
      ;

    for (i = 0; i < codeBlocks.length; i++) {
      block = codeBlocks[i];

      hljs.highlightBlock(block, '  ');
    }
  };

}(this);
