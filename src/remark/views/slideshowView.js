var api = require('../api')
  , events = require('../events')
  , SlideView = require('./slideView').SlideView
  , OverlayView = require('./overlayView')
  , config = require('../config')

  , referenceWidth = 908
  , referenceHeight = 681
  , referenceRatio = referenceWidth / referenceHeight
  ;

exports.SlideshowView = SlideshowView;

function SlideshowView (slideshow, element) {
  var self = this;

  self.element = element;
  self.slideViews = createSlideViews(slideshow.slides);
  self.appendSlideViews();

  slideshow.on('update', function () {
    self.removeSlideViews();
    self.slideViews = createSlideViews(slideshow.slides);
    self.appendSlideViews();
  });

  self.positionElement = createPositionElement();
  element.appendChild(self.positionElement);

  self.overlayView = new OverlayView(element);

  mapEvents(self);
}

function createSlideViews (slides) {
  return slides.map(function (slide) {
    return new SlideView(slide);
  });
}

function createPositionElement () {
  var element = document.createElement('div');

  element.className = 'position';

  return element;
}

function mapEvents (slideshowView) {
  var ratio
    , dimensions
    ;

  events.on('hideSlide', function (slideIndex) {
    slideshowView.hideSlide(slideIndex);
  });

  events.on('showSlide', function (slideIndex) {
    slideshowView.showSlide(slideIndex);
  });

  events.on('config', onConfig);
  window.addEventListener('resize', onResize);

  // Pass dummy ratio value to signalize that the
  // `ratio` configuration option has been changed
  onConfig({ratio: null});

  function onConfig (changes) {
    // We only care if the `ratio` configuration option
    // changes, so simply bail out if it hasn't
    if (!changes.hasOwnProperty('ratio')) {
      return;
    }

    ratio = getRatio();
    dimensions = getDimensions(ratio);

    slideshowView.element.style.width = dimensions.width + 'px';
    slideshowView.element.style.height = dimensions.height + 'px';

    onResize();
  }

  function onResize () {
    slideshowView.resize(ratio, dimensions);
  }
}

SlideshowView.prototype.appendSlideViews = function () {
  var self = this;

  self.slideViews.each(function (slideView) {
    self.element.appendChild(slideView.element);
  });
};

SlideshowView.prototype.removeSlideViews = function () {
  var self = this;

  self.slideViews.each(function (slideView) {
    self.element.removeChild(slideView.element);
  });
};

SlideshowView.prototype.showSlide =  function (slideIndex) {
  var slideView = this.slideViews[slideIndex];
  api.emit('slidein', slideView.element, slideIndex);
  slideView.show();
  this.positionElement.innerHTML =
    slideIndex + 1 + ' / ' + this.slideViews.length;
};

SlideshowView.prototype.hideSlide = function (slideIndex) {
  var slideView = this.slideViews[slideIndex];
  api.emit('slideout', slideView.element, slideIndex);
  slideView.hide();
};

SlideshowView.prototype.resize = function (ratio, dimensions) {
  var containerHeight = window.innerHeight
    , containerWidth = window.innerWidth
    , scale
    , scaledWidth
    , scaledHeight
    ;

  if (containerWidth / ratio.width > containerHeight / ratio.height) {
    scale = containerHeight / dimensions.height;
  }
  else {
    scale = containerWidth / dimensions.width;
  }

  scaledWidth = dimensions.width * scale;
  scaledHeight = dimensions.height * scale;

  this.element.style['-webkit-transform'] = 'scale(' + scale + ')';
  this.element.style.MozTransform = 'scale(' + scale + ')';
  this.element.style.left = (containerWidth - scaledWidth) / 2 + 'px';
  this.element.style.top = (containerHeight - scaledHeight) / 2 + 'px';
};

function getDimensions (ratio) {
  return {
    width: Math.floor(referenceWidth / referenceRatio * ratio.ratio)
  , height: referenceHeight
  };
}

function getRatio () {
  var ratioString = config.get('ratio') || '4:3'
    , ratioComponents = ratioString.split(':')
    , ratio
    ;

  ratio = {
    width: parseInt(ratioComponents[0], 10)
  , height: parseInt(ratioComponents[1], 10)
  };

  ratio.ratio = ratio.width / ratio.height;

  return ratio;
}
