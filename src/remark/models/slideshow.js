var EventEmitter = require('events').EventEmitter
  , Navigation = require('./slideshow/navigation')
  , utils = require('../utils')
  , Slide = require('./slide')
  ;

module.exports = Slideshow;

Slideshow.prototype = new EventEmitter();
Slideshow.prototype.setMaxListeners(0);

function Slideshow (events, options) {
  var self = this
    , slides = []
    ;

  options = options || {};

  // Extend slideshow functionality
  Navigation.call(self, events);

  self.loadFromString = loadFromString;
  self.getSlides = getSlides;
  self.getSlideCount = getSlideCount;
  self.getSlideByName = getSlideByName;

  self.getRatio = getOrDefault('ratio', '4:3');
  self.getHighlightStyle = getOrDefault('highlightStyle', 'default');
  self.getHighlightLanguage = getOrDefault('highlightLanguage', '');

  loadFromString(options.source);

  function loadFromString (source) {
    source = source || '';

    slides = createSlides(source);
    expandVariables(slides);

    events.emit('slidesChanged');
  }

  function getSlides () {
    return slides.map(function (slide) { return slide; });
  }

  function getSlideCount () {
    return slides.length;
  }

  function getSlideByName (name) {
    return slides.byName[name];
  }

  function getOrDefault (key, defaultValue) {
    return function () {
      if (options[key] === undefined) {
        return defaultValue;
      }

      return options[key];
    };
  }
}

function createSlides (slideshowSource) {
  var slides = []
    , byName = {}
    , layoutSlide
    ;

  slides.byName = {};

  splitForEach(slideshowSource, function (source, properties) {
    var slide
      , template
      ;

    if (properties.continued === 'true' && slides.length > 0) {
      template = slides[slides.length - 1];
    }
    else if (byName[properties.template]) {
      template = byName[properties.template];
    }
    else if (properties.layout === 'false') {
      layoutSlide = undefined;
    }
    else if (layoutSlide && properties.layout !== 'true') {
      template = layoutSlide;
    }

    slide = new Slide(slides.length + 1, source, properties, template);

    if (properties.layout === 'true') {
      layoutSlide = slide;
    }

    if (properties.name) {
      byName[properties.name] = slide;
    }

    if (slide.properties.layout !== 'true') {
      slides.push(slide);
      if (properties.name) {
        slides.byName[properties.name] = slide;
      }
    }
  });

  return slides;
}

function splitForEach (source, callback) {
  var separatorFinder = /\n---?\n/
    , match
    , isContinuedSlide = false
    ;

  while ((match = separatorFinder.exec(source)) !== null) {
    mapSlide(source.substr(0, match.index));

    source = source.substr(match.index + match[0].length); 
    isContinuedSlide = match[0] === '\n--\n';
  }

  if (source !== '') {
    mapSlide(source);
  }

  function mapSlide(source) {
    var properties = {
      continued: isContinuedSlide.toString()
    };
    source = extractProperties(source, properties);
    callback(source, properties);
  }
}

function extractProperties (source, properties) {
  var propertyFinder = /^\n*([-\w]+):([^$\n]*)/i
    , match
    ;

  while ((match = propertyFinder.exec(source)) !== null) {
    source = source.substr(0, match.index) +
      source.substr(match.index + match[0].length);

    properties[match[1].trim()] = match[2].trim();

    propertyFinder.lastIndex = match.index;
  }

  return source;
}

function expandVariables (slides) {
  slides.each(function (slide) {
    slide.expandVariables();
  });
}
