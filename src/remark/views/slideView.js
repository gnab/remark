var converter = require('../converter')
  , dom = require('../dom')
  , highlighter = require('../highlighter')
  ;

exports.SlideView = SlideView;

function SlideView (slide) {
  this.slide = slide;
  this.element = createSlideElement();
  this.contentElement = createContentElement(slide.source, slide.properties);

  this.element.appendChild(this.contentElement);
}

SlideView.prototype.show = function () {
  this.element.style.display = 'table';
};

SlideView.prototype.hide = function () {
  this.element.style.display = 'none';
};

function createSlideElement () {
  var element = dom.createElement('div');

  element.className = 'slide';
  element.style.display = 'none';

  return element;
}

function createContentElement (source, properties) {
  var element = dom.createElement('div');

  element.innerHTML = source;

  setClassFromProperties(element, properties);

  converter.convertContentClasses(element);
  converter.convertMarkdown(element);
  converter.convertCodeClasses(element);

  highlighter.highlightCodeBlocks(element);

  return element;
}

function setClassFromProperties (element, properties) {
  var classes = (properties['class'] || '').split(/,| /)
        .filter(function (s) { return s !== ''; });

  element.className = ['content'].concat(classes).join(' ');
}
