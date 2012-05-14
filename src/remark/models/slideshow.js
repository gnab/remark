var Slide = require('./slide').Slide;

exports.Slideshow = Slideshow;

function Slideshow (source) {
  this.slides = createSlides(source);
}

Slideshow.prototype.getSlideByName = function (name) {
  return this.slides.names[name];
};

Slideshow.prototype.getSlideCount = function () {
  return this.slides.length;
};

var createSlides = function (source) {
  var parts
    , slides = []
    , slide
    , previousSlide
    ;

  slides.names = {};

  source.split(/\n---\n/).each(function (part) {
    slide = new Slide(part, previousSlide);
    slide.index = slides.length;
    slides.push(slide);
    previousSlide = slide;

    if (slide.properties.name) {
      slides.names[slide.properties.name] = slide;
    }
  });

  return slides;
};
