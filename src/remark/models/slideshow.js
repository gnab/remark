var Slide = require('./slide').Slide;

exports.Slideshow = Slideshow;

function Slideshow (source) {
  this.slides = createSlides(source);
}

Slideshow.prototype.getSlideCount = function () {
  return this.slides.length;
};

var createSlides = function (source) {
  var parts
    , slides = []
    , slide
    , previousSlide
    ;

  source.split(/\n---\n/).each(function (part) {
    slide = new Slide(part, previousSlide);
    slides.push(slide);
    previousSlide = slide;
  });

  return slides;
};
