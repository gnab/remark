var converter = require('../converter')
  , highlighter = require('../highlighter')
  ;

exports.SlideView = SlideView;

function SlideView (slide, dimensions) {
  this.slide = slide;
  this.dimensions = dimensions;

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

SlideView.prototype.scaleBackgroundImage = function () {
  var self = this
    , styles = window.getComputedStyle(this.contentElement)
    , backgroundImage = styles.backgroundImage
    , match
    , image
    ;

  if ((match = /^url\(([^\)]+?)\)/.exec(backgroundImage)) !== null) {
    image = new Image();
    image.onload = function () {
      if (image.width > self.dimensions.width || 
          image.height > self.dimensions.height) {

        // Background image is larger than slide, so scale it to fit
        self.contentElement.style.backgroundSize = 'contain';
      }
    };
    image.src = match[1];
  }
};

function createSlideElement () {
  var element = document.createElement('div');

  element.className = 'slide';
  element.style.display = 'none';

  return element;
}

function createContentElement (source, properties) {
  var element = document.createElement('div');

  if (properties.name) {
    element.id = "slide-" + properties.name;
  }

  element.innerHTML = source;

  setClassFromProperties(element, properties);

  converter.convertContentClasses(element);
  converter.convertMarkdown(element);
  converter.convertCodeClasses(element);
  converter.trimEmptySpace(element);

  highlightCodeBlocks(element);

  return element;
}

function setClassFromProperties (element, properties) {
  var classes = (properties['class'] || '').split(/,| /)
        .filter(function (s) { return s !== ''; });

  element.className = ['content'].concat(classes).join(' ');
}

function highlightCodeBlocks (content) {
  var codeBlocks = content.getElementsByTagName('code')
    , block
    , i
    ;

  for (i = 0; i < codeBlocks.length; i++) {
    block = codeBlocks[i];

    highlighter.engine.highlightBlock(block, '  ');
  }
}
