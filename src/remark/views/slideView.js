var converter = require('../converter')
  , dom = require('../dom')
  , highlighter = require('../highlighter')
  ;

exports.SlideView = SlideView;

function SlideView (slide, slideNo) {
  this.slide = slide;
  this.element = createSlideElement(slideNo, slide.properties);
  this.contentElement = createContentElement(slide.source, slide.properties);
  this.element.appendChild(this.contentElement);
}

SlideView.prototype.show = function () {
  this.element.style.display = 'table';
};

SlideView.prototype.hide = function () {
  this.element.style.display = 'none';
};

function createSlideElement (slideNo, properties) {
  var element = dom.createElement('div');

  element.className = 'slide';
  element.style.display = 'none';
  element.title = slideNo.toString();
  if (properties.name) {
      element.title = properties.name;
  }

  return element;
}

function createContentElement (source, properties) {
  var element = dom.createElement('div');

  if (properties.name) {
    element.id = "slide-" + properties.name;
  }

  element.innerHTML = source;

  setClassFromProperties(element, properties);

  converter.convertContentClasses(element);
  converter.convertMarkdown(element);
  converter.convertCodeClasses(element);
  converter.trimEmptySpace(element);

  highlighter.highlightCodeBlocks(element);

  return element;
}

function setClassFromProperties (element, properties) {
  var classes = (properties['class'] || '').split(/,| /)
        .filter(function (s) { return s !== ''; });

  element.className = ['content'].concat(classes).join(' ');
}
