var Slide = require('./slide').Slide;

exports.Slideshow = Slideshow;

function Slideshow (source) {
  var slides = createSlides(source)
    , names = mapNamedSlides(slides)
    ;

  applyTemplates(slides, names);

  slides = stripLayoutSlides(slides);
  slides = indexSlides(slides);

  expandVariables(slides);

  this.slides = slides;
  this.slides.names = names;
}

Slideshow.prototype.getSlideByName = function (name) {
  return this.slides.names[name];
};

Slideshow.prototype.getSlideCount = function () {
  return this.slides.length;
};

function createSlides (source) {
  return source.split(/\n---\n/).map(function (part, index) {
    return Slide.create(part);
  });
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
