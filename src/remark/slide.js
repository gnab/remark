var converter = require('./converter')
  , dom = require('./dom')
  , highlighter = require('./highlighter')
  ;

exports.Slide = Slide;

function Slide (source) {
  this.source = source;
  this.element = createSlideElement();

  prepareSlide(this);
}

function createSlideElement () {
  var element = dom.createElement('div');
  element.className = 'slide';
  element.style.display = 'none';
  element.appendChild(dom.createElement('div'));
  return element;
}

function prepareSlide (slide) {
  var content = slide.element.children[0];
  content.innerHTML = slide.source;

  converter.convertSlideProperties(slide, content);
  converter.convertContentClasses(content);
  converter.convertMarkdown(content);
  converter.convertCodeClasses(content);

  highlighter.highlightCodeBlocks(content);
}

Slide.prototype.show = function () {
  this.element.style.display = 'table';
};

Slide.prototype.hide = function () {
  this.element.style.display = 'none';
};
