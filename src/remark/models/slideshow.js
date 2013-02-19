var EventEmitter = require('events').EventEmitter
  , Slide = require('./slide').Slide
  , events = require('../events')
  ;

exports.Slideshow = Slideshow;

Slideshow.prototype = new EventEmitter();

function Slideshow (source) {
  var self = this;

  self.loadFromString(source, true);

  events.on('loadFromString', function (source) {
    self.loadFromString(source);
  });
}

Slideshow.prototype.loadFromString = function (source, initial) {
  var slides = createSlides(source)
    , names = mapNamedSlides(slides)
    ;

  applyTemplates(slides, names);

  slides = stripLayoutSlides(slides);
  slides = indexSlides(slides);

  expandVariables(slides);

  this.slides = slides;
  this.slides.names = names;

  if (!initial) {
    this.emit('update');
  }
};

Slideshow.prototype.getSlideByName = function (name) {
  return this.slides.names[name];
};

Slideshow.prototype.getSlideCount = function () {
  return this.slides.length;
};

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
