!function (context) {

  /* bundle "vendor/highlight.min.js" */
  /* bundle "vendor/showdown.js" */

  var slideshow
    , slides
    , converter
    , currentSlideIndex = -1
    , heightFactor = 3
    , widthFactor = 4
    ;

  window.onload = function () {
    hideSource();
    createSlideshow();
    mapKeys();
    navigate();

    window.onhashchange = navigate;
  };

  var hideSource = function () {
    var sourceElement = document.getElementById('source');

    sourceElement.style.display = 'none';
  };

  var createSlideshow = function () {
    slideshow = document.getElementById('slideshow');
    converter = new Showdown.converter();

    styleDocument();
    createSlides();
    styleSlideshow();
  };

  var styleDocument = function () {
    var style = document.createElement('style');
    style.type = 'text/css';
    style.innerHTML = '/* bundle "src/remark.css" */';

    document.getElementsByTagName('head')[0].appendChild(style);
  };

  var createSlides = function () {
    var source = document.getElementById('source').innerHTML
      , slide
      , content
      , i
      ;

    slides = source.split(/\n\n---\n/)

    for (i = 0; i < slides.length; ++i) {
      slide = document.createElement('div');
      slide.className = 'slide';
      content = document.createElement('div');
      content.className = 'content';
      slide.appendChild(content);
      slideshow.appendChild(slide);
    }
  };

  var styleSlideshow = function () {
    var sizeFactor = 227
      , slideshowWidth = sizeFactor * widthFactor
      , slideshowHeight = sizeFactor * heightFactor
      ;

    var resize = function () {
      var height = window.innerHeight
        , width = window.innerWidth
        , scale
        ;

      if (width / widthFactor > height / heightFactor) {
        scale = height / (sizeFactor * heightFactor);
      }
      else {
        scale = width / (sizeFactor * widthFactor);
      }
    
      slideshow.style['-webkit-transform'] = 'scale(' + scale + ')';
      slideshow.style.MozTransform = 'scale(' + scale + ')';
      slideshow.style.left = (width - slideshowWidth * scale) / 2 + 'px';
      slideshow.style.top = (height - slideshowHeight * scale) / 2 + 'px';
    };

    slideshow.style.width = sizeFactor * widthFactor + 'px';
    slideshow.style.height = sizeFactor * heightFactor + 'px';

    window.onresize = resize;
    window.onresize();
  }

  var navigate = function () {
    slideNo = parseInt((location.hash || '').substr(1), 10) || 1;
    gotoSlide(slideNo - 1);
  };

  var mapKeys = function () {
    window.onkeydown = function (event) {
      switch (event.keyCode) {
        case 37:
        case 38:
        case 75:
          gotoSlide(currentSlideIndex - 1);
          break;
        case 39:
        case 40:
        case 74:
          gotoSlide(currentSlideIndex + 1);
          break;
      }
    };
  };

  var gotoSlide = function (slideIndex) {
    var alreadyOnSlide = slideIndex === currentSlideIndex
      , lastSlideIndex = slideshow.children.length - 1
      , slideOutOfRange = slideIndex < 0 || slideIndex > lastSlideIndex
      ;

    if (alreadyOnSlide || slideOutOfRange) {
      return;
    }

    hideCurrentSlide();
    prepareSlideIfNeeded(slideIndex);
    showSlide(slideIndex);

    currentSlideIndex = slideIndex;
    location.hash = currentSlideIndex + 1;
  };

  var hideCurrentSlide = function () {
    if (currentSlideIndex !== -1) {
      slideshow.children[currentSlideIndex].style.display = 'none';
    }
  };

  var prepareSlideIfNeeded = function (slideIndex) {
    var content = slideshow.children[slideIndex].children[0];

    if (content.innerHTML === '') {
      content.innerHTML = slides[slideIndex];
      formatContent(content);
    }
  };

  var showSlide = function (slideIndex) {
    var slide
      , content
      ;

    slide = slideshow.children[slideIndex];
    content = slide.children[0];

    slide.style.display = 'table';
    content.style.display = 'table-cell';
  };

  var formatContent = function (content) {
    expandInlineClasses(content);
    expandSlideClasses(content);

    content.innerHTML = converter.makeHtml(content.innerHTML.trim(' '));
    content.innerHTML = content.innerHTML.replace(/&amp;/g, '&');

    highlightContent(content);
  };

  var expandSlideClasses = function (content) {
    var classFinder = /(^|\n)(\\)?((\.([a-z_-]+))+)/ig
      , classes
      , replacement
      , contentClasses = [content.className]
      , match
      ;

    while (match = classFinder.exec(content.innerHTML)) {
      classes = match[3].substr(1).split('.');

      if (match[2]) {
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

  var expandInlineClasses = function (content) {
    var classFinder = /(\\)?(((\.([a-z_-]+))+)\[(.+?)\])/ig
      , match
      , classes
      , replacement
      ;

    while (match = classFinder.exec(content.innerHTML)) {
      classes = match[3].substr(1).split('.');

      if (match[1]) {
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

  var highlightContent = function (content) {
    var codeBlocks = content.getElementsByTagName('code')
      , block
      , i
      ;

    for (i = 0; i < codeBlocks.length; i++) {
      highlightBlock(codeBlocks[i]);
    }
  };

  var highlightBlock = function (block) {
    expandCodeClass(block);

    hljs.highlightBlock(block, '  ');
  };

  var expandCodeClass = function (block) {
    var classFinder = /^(\\)?\.([a-z_-]+)\n?/i
      , match
      ;

    if (match = classFinder.exec(block.innerHTML)) {
      if (!match[1]) {
        block.innerHTML = block.innerHTML.substr(match[0].length);
        block.className = match[2];
      }
    }
  };

}(this);
