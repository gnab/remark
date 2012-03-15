var api = require('./api')
  , slide = require('./slide')
  , dom = require('./dom')
  ;

var slideshow = module.exports = {}
  , scaleFactor = 227
  , heightFactor = 3
  , widthFactor = 4
  ;

slideshow.create = function (source, element) {
  var slides = createSlides(source, element)
    , positionElement = dom.createElement('div')
    ;

  positionElement.className = 'position';
  element.appendChild(positionElement);

  styleElement(element);

  for (var i = 0; i < slides.length; i++) {
    var slide = slides[i];
    element.appendChild(slide.element());
  }

  return {
    showSlide: function (slideIndex) {
      var slide = slides[slideIndex];
      api.emit('slidein', slide.element(), slideIndex);
      slide.element().style.display = 'table';
      positionElement.innerHTML = slideIndex + 1 + ' / ' + slides.length;
    }
  , hideSlide: function (slideIndex) {
      var slide = slides[slideIndex];
      api.emit('slideout', slide.element(), slideIndex);
      slide.element().style.display = 'none';
    }
  , getSlideCount: function () {
      return slides.length;
    }
  };
};

var createSlides = function (source, element) {
  var parts
    , slides = []
    , i
    ;

  parts = source.split(/\n\n---\n/);

  for (i = 0; i < parts.length; ++i) {
    slides.push(slide.create(parts[i]));
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
