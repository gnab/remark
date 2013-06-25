var EventEmitter = require('events').EventEmitter
  , Navigation = require('./slideshow/navigation')
  , utils = require('../utils')
  , Slide = require('./slide')
  , Parser = require('../parser')
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
  var parser = new Parser()
   ,  parsedSlides = parser.parse(slideshowSource)
    , slides = []
    , byName = {}
    , layoutSlide
    ;

  slides.byName = {};

  parsedSlides.forEach(function (slide, i) {
    var template, slideViewModel;
    
    if (slide.properties.continued === 'true' && i > 0) {
      template = slides[slides.length - 1];
    }
    else if (byName[slide.properties.template]) {
      template = byName[slide.properties.template];
    }
    else if (slide.properties.layout === 'false') {
      layoutSlide = undefined;
    }
    else if (layoutSlide && slide.properties.layout !== 'true') {
      template = layoutSlide;
    }

    slideViewModel = new Slide(i + 1, slide, template);

    if (slide.properties.layout === 'true') {
      layoutSlide = slideViewModel;
    }

    if (slide.properties.name) {
      byName[slide.properties.name] = slideViewModel;
    }

    if (slide.properties.layout !== 'true') {
      slides.push(slideViewModel);
      if (slide.properties.name) {
        slides.byName[slide.properties.name] = slideViewModel;
      }
    }
  });

  return slides;
}

function expandVariables (slides) {
  slides.forEach(function (slide) {
    slide.expandVariables();
  });
}
