var converter = require('./converter')
  , highlighter = require('./highlighter')

  , slide = module.exports = {}
  ;

slide.create = function (source) {
  var _slide = {}
    , _source = source
    , _element
    ;

  _slide.source = function (value) {
    if (value === undefined) {
      return _source;
    }

    _source = value;

    if (_element !== undefined) {
      prepareSlide(_slide);
    }
  };


  _slide.element = function () {
    if (_element === undefined) {
      _element = document.createElement('div');
      _element.className = 'slide';
      _element.style.display = 'none';
      _element.appendChild(document.createElement('div'));

      prepareSlide(_slide);
    }

    return _element;
  };

  return _slide;
};

var prepareSlide = function (slide) {
  var content = slide.element().children[0];
  content.innerHTML = slide.source();
  formatContent(content);
};

var formatContent = function (content) {
  converter.convertContentClasses(content);
  converter.convertSlideClasses(content);
  converter.convertMarkdown(content);
  converter.convertCodeClasses(content);
  highlighter.highlightCodeBlocks(content);
};
