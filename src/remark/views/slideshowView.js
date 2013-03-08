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
  self.dimensions = {};

  self.updateDimensions();

  self.slideViews = createSlideViews(slideshow.slides, self.dimensions);
  self.appendSlideViews();

  slideshow.on('update', function () {
    self.removeSlideViews();
    self.slideViews = createSlideViews(slideshow.slides, self.dimensions);
    self.appendSlideViews();
  });

  self.positionElement = createPositionElement();
  element.appendChild(self.positionElement);

  self.overlayView = new OverlayView(element);

  mapEvents(self);
}

function createSlideViews (slides, dimensions) {
  return slides.map(function (slide) {
    return new SlideView(slide, dimensions);
  });
}

function createPositionElement () {
  var element = document.createElement('div');

  element.className = 'position';

  return element;
}

function mapEvents (slideshowView) {
  events.on('hideSlide', function (slideIndex) {
    slideshowView.hideSlide(slideIndex);
  });

  events.on('showSlide', function (slideIndex) {
    slideshowView.showSlide(slideIndex);
  });

  events.on('config', function (changes) {
    // We only care if the `ratio` configuration option
    // changes, so simply bail out if it hasn't changed
    if (!changes.hasOwnProperty('ratio')) {
      return;
    }

    slideshowView.updateDimensions();
  });

  window.addEventListener('resize', function () {
    slideshowView.updateSize();
  });
}

SlideshowView.prototype.appendSlideViews = function () {
  var self = this;

  self.slideViews.each(function (slideView) {
    self.element.appendChild(slideView.element);
    slideView.scaleBackgroundImage();
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

SlideshowView.prototype.updateDimensions = function () {
  var ratio = getRatio()
    , dimensions = getDimensions(ratio)
    ;

  this.ratio = ratio;
  this.dimensions.width = dimensions.width;
  this.dimensions.height = dimensions.height;

  this.element.style.width = this.dimensions.width + 'px';
  this.element.style.height = this.dimensions.height + 'px';

  this.updateSize();
};

SlideshowView.prototype.updateSize = function () {
  var containerHeight = window.innerHeight
    , containerWidth = window.innerWidth
    , scale
    , scaledWidth
    , scaledHeight
    , ratio = this.ratio
    , dimensions = this.dimensions
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

function getDimensions (ratio) {
  return {
    width: Math.floor(referenceWidth / referenceRatio * ratio.ratio)
  , height: referenceHeight
  };
}
