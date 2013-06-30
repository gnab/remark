var converter = require('../converter')
  , highlighter = require('../highlighter')
  , utils = require('../utils')
  ;

module.exports = SlideView;

function SlideView (events, slideshow, slide) {
  this.events = events;
  this.slideshow = slideshow;
  this.slide = slide;

  this.element = createSlideElement();
  this.contentElement = createContentElement(events, slideshow, slide.source, slide.properties);
  this.notesMarkup = createNotesMarkup(slideshow, slide.notes);

  this.element.appendChild(this.contentElement);
}

SlideView.prototype.show = function () {
  this.element.style.display = 'table';
};

SlideView.prototype.hide = function () {
  this.element.style.display = 'none';
};

SlideView.prototype.scaleBackgroundImage = function (dimensions) {
  var self = this
    , styles = window.getComputedStyle(this.contentElement)
    , backgroundImage = styles.backgroundImage
    , match
    , image
    ;

  if ((match = /^url\(([^\)]+?)\)/.exec(backgroundImage)) !== null) {
    image = new Image();
    image.onload = function () {
      if (image.width > dimensions.width || 
          image.height > dimensions.height) {
        // Background image is larger than slide
        if (!self.originalBackgroundSize) {
          // No custom background size has been set
          self.originalBackgroundSize = self.contentElement.style.backgroundSize;
          self.backgroundSizeSet = true;
          self.contentElement.style.backgroundSize = 'contain';
        }
      }
      else {
        // Revert to previous background size setting
        if (self.backgroundSizeSet) {
          self.contentElement.style.backgroundSize = self.originalBackgroundSize;
          self.backgroundSizeSet = false;
        }
      }
    };
    image.src = match[1];
  }
};

function createSlideElement () {
  var element = document.createElement('div');

  element.className = 'remark-slide';
  element.style.display = 'none';

  return element;
}

function createContentElement (events, slideshow, source, properties) {
  var element = document.createElement('div');

  if (properties.name) {
    element.id = 'slide-' + properties.name;
  }

  styleContentElement(slideshow, element, properties);

  element.innerHTML = converter.convertMarkdown(source);
  element.innerHTML = element.innerHTML.replace(/<p>\s*<\/p>/g, '');

  highlightCodeBlocks(element, slideshow);

  return element;
}

function styleContentElement (slideshow, element, properties) {
  element.className = '';

  setClassFromProperties(element, properties);
  setHighlightStyleFromProperties(element, properties, slideshow);
  setBackgroundFromProperties(element, properties);
}

function createNotesMarkup (slideshow, notes) {
  var element = document.createElement('div');

  element.innerHTML = converter.convertMarkdown(notes);
  element.innerHTML = element.innerHTML.replace(/<p>\s*<\/p>/g, '');

  highlightCodeBlocks(element, slideshow);

  return element.innerHTML;
}

function setBackgroundFromProperties (element, properties) {
  var backgroundImage = properties['background-image'];

  if (backgroundImage) {
    element.style.backgroundImage = backgroundImage;
  }
}

function setHighlightStyleFromProperties (element, properties, slideshow) {
  var highlightStyle = properties['highlight-style'] || 
      slideshow.getHighlightStyle();

  if (highlightStyle) {
    utils.addClass(element, 'hljs-' + highlightStyle);
  }
}

function setClassFromProperties (element, properties) {
  utils.addClass(element, 'remark-slide-content');

  (properties['class'] || '').split(/,| /)
    .filter(function (s) { return s !== ''; })
    .forEach(function (c) { utils.addClass(element, c); });
}

function highlightCodeBlocks (content, slideshow) {
  var codeBlocks = content.getElementsByTagName('code')
    ;

  codeBlocks.forEach(function (block) {
    if (block.className === '') {
      block.className = slideshow.getHighlightLanguage();
    }

    if (block.className !== '') {
      highlighter.engine.highlightBlock(block, '  ');
    }

    utils.addClass(block, 'remark-code');
  });
}
