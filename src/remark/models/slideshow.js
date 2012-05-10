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
    , i
    ;

  parts = source.split(/\n\n---\n/);

  for (i = 0; i < parts.length; ++i) {
    slides.push(new Slide(parts[i]));
  }

  return slides;
};
