var EventEmitter = require('events').EventEmitter
  , Properties = require('./slideshow/properties')
  , Navigation = require('./slideshow/navigation')
  , utils = require('../utils')
  , Slide = require('./slide')
  ;

module.exports = Slideshow;

Slideshow.prototype = new EventEmitter();

function Slideshow (events, options) {
  var self = this
    , internal = {
        slides: []
      }
    ;

  // Extend slideshow functionality
  Properties.call(self, events, options);
  Navigation.call(self, events, internal);

  self.getSlideCount = getSlideCount;
  self.getSlideNo = getSlideNo;
  self.getSlides = getSlides;

  loadFromString(self.get('source'));

  events.on('propertiesChanged', function (changes) {
    if (changes.hasOwnProperty('source')) {
      loadFromString(changes.source);
    }
  });

  function loadFromString (source) {
    var names;

    source = source || '';

    internal.slides = createSlides(source);
    names = mapNamedSlides(internal.slides);

    applyTemplates(internal.slides, names);

    internal.slides = stripLayoutSlides(internal.slides);
    internal.slides = indexSlides(internal.slides);

    expandVariables(internal.slides);

    internal.slides.names = names;

    events.emit('slidesChanged');
  }

  function getSlides () {
    return internal.slides;
  }

  function getSlideCount () {
    return internal.slides.length;
  }

  function getSlideNo (slideNoOrName) {
    var slideNo
      , slide
      ;

    if (typeof slideNoOrName === 'number') {
      return slideNoOrName;
    }

    slideNo = parseInt(slideNoOrName, 10);
    if (slideNo.toString() === slideNoOrName) {
      return slideNo;
    }

    slide = internal.slides[slideNoOrName];
    if (slide) {
      return slide.index + 1;
    }

    return 1;
  }
}

function createSlides (source) {
  var slides = []
    , separatorFinder = /\n---?\n/
    , continuedSlide = false
    , match
    ;

  while ((match = separatorFinder.exec(source)) !== null) {
    slides.push(Slide.create(source.substr(0, match.index), {
      continued: continuedSlide.toString()
    }));
    source = source.substr(match.index + match[0].length);
    continuedSlide = match[0] === '\n--\n';
  }

  if (source !== '') {
    slides.push(Slide.create(source, {
      continued: continuedSlide.toString()
    }));
  }

  return slides;
}

function mapNamedSlides (slides) {
  var nameMap = {};

  slides.each(function (slide) {
    if (slide.properties.name) {
      nameMap[slide.properties.name] = slide;
    }
  });

  return nameMap;
}

function applyTemplates (slides, names) {
  var layoutSlide;

  slides.each(function (slide, index) {
    if (slide.properties.continued === 'true' && index > 0) {
      slide.inherit(slides[index - 1]);
    }
    else if (names[slide.properties.template]) {
      slide.inherit(names[slide.properties.template]);
    }
    else if (slide.properties.layout === 'false') {
      layoutSlide = undefined;
    }
    else if (layoutSlide && slide.properties.layout !== 'true') {
      slide.inherit(layoutSlide);
    }

    if (slide.properties.layout === 'true') {
      layoutSlide = slide;
    }
  });
}

function stripLayoutSlides (slides) {
  return slides.filter(function (slide) {
    return slide.properties.layout !== 'true';
  });
}

function indexSlides (slides) {
  return slides.map(function (slide, index) {
    slide.index = index;

    return slide;
  });
}

function expandVariables (slides) {
  slides.each(function (slide) {
    slide.expandVariables();
  });
}
