var api = require('./api')
  , Slide = require('./slide').Slide
  , dom = require('./dom')

  , scaleFactor = 227
  , heightFactor = 3
  , widthFactor = 4
  ;

exports.Slideshow = Slideshow;

function Slideshow (source, element) {
  this.slides = createSlides(source, element);
  this.positionElement = dom.createElement('div');

  this.positionElement.className = 'position';
  element.appendChild(this.positionElement);

  styleElement(element);

  for (var i = 0; i < this.slides.length; i++) {
    var slide = this.slides[i];
    element.appendChild(slide.element);
  }
}

Slideshow.prototype.showSlide =  function (slideIndex) {
  var slide = this.slides[slideIndex];
  api.emit('slidein', slide.element, slideIndex);
  slide.show();
  this.positionElement.innerHTML = slideIndex + 1 + ' / ' + this.slides.length;
};

Slideshow.prototype.hideSlide = function (slideIndex) {
  var slide = this.slides[slideIndex];
  api.emit('slideout', slide.element, slideIndex);
  slide.hide();
};

Slideshow.prototype.getSlideCount = function () {
  return this.slides.length;
};

var createSlides = function (source, element) {
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

var styleElement = function (element) {
  var elementWidth = scaleFactor * widthFactor
    , elementHeight = scaleFactor * heightFactor
    ;

  var resize = function () {
    var containerHeight = dom.innerHeight
      , containerWidth = dom.innerWidth
      , scale
      ;

    if (containerWidth / widthFactor > containerHeight / heightFactor) {
      scale = containerHeight / (scaleFactor * heightFactor);
    }
    else {
      scale = containerWidth / (scaleFactor * widthFactor);
    }

    element.style['-webkit-transform'] = 'scale(' + scale + ')';
    element.style.MozTransform = 'scale(' + scale + ')';
    element.style.left = (containerWidth - elementWidth * scale) / 2 + 'px';
    element.style.top = (containerHeight - elementHeight * scale) / 2 + 'px';
  };

  element.style.width = scaleFactor * widthFactor + 'px';
  element.style.height = scaleFactor * heightFactor + 'px';

  dom.on('resize', resize);
  resize();
};
