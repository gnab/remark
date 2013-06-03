var SlideView = require('./slideView')
  , OverlayView = require('./overlayView')
  , addClass = require('../utils').addClass

  , referenceWidth = 908
  , referenceHeight = 681
  , referenceRatio = referenceWidth / referenceHeight
  ;

module.exports = SlideshowView;

function SlideshowView (events, containerElement, slideshow) {
  var self = this;

  self.events = events;
  self.slideshow = slideshow;
  self.dimensions = {};

  self.configureContainerElement(containerElement);
  self.configureSlideshowElement();
  self.configurePositionElement();
  self.configureOverlayView();

  self.updateSlideViews();

  events.on('slidesChanged', function () {
    self.updateSlideViews();
  });

  events.on('hideSlide', function (slideIndex) {
    self.hideSlide(slideIndex);
  });

  events.on('showSlide', function (slideIndex) {
    self.showSlide(slideIndex);
  });
}

SlideshowView.prototype.isEmbedded = function () {
  return this.containerElement !== document.body;
};

SlideshowView.prototype.configureContainerElement = function (element) {
  var self = this;

  self.containerElement = element;

  addClass(element, 'remark-container');

  if (element === document.body) {
    addClass(document.getElementsByTagName('html')[0], 'remark-container');

    forwardEvents(self.events, window, [
      'hashchange', 'resize', 'keydown', 'keypress', 'mousewheel'
    ]);
    forwardEvents(self.events, document, [
      'touchstart', 'touchmove', 'touchend'
    ]);
  }
  else {
    element.style.position = 'absolute';
    element.tabIndex = -1;

    forwardEvents(self.events, element, [
      'keydown', 'keypress', 'mousewheel',
      'touchstart', 'touchmove', 'touchend'
    ]);
  }

  // Tap event is handled in slideshow view
  // rather than controller as knowledge of
  // container width is needed to determine
  // whether to move backwards or forwards
  self.events.on('tap', function (endX) {
    if (endX < self.getContainerWidth() / 2) {
      self.slideshow.gotoPreviousSlide();
    }
    else {
      self.slideshow.gotoNextSlide();
    }
  });
};

function forwardEvents (target, source, events) {
  events.each(function (eventName) {
    source.addEventListener(eventName, function () {
      var args = Array.prototype.slice.call(arguments);
      target.emit.apply(target, [eventName].concat(args));
    });
  });
}

SlideshowView.prototype.configureSlideshowElement = function () {
  var self = this;

  self.element = document.createElement('div');
  self.element.className = 'remark-slideshow';

  self.containerElement.appendChild(self.element);

  self.updateDimensions();

  self.events.on('propertiesChanged', function (changes) {
    if (changes.hasOwnProperty('ratio')) {
      self.updateDimensions();
    }
  });

  self.events.on('resize', onResize);

  function onResize () {
    self.scaleToFitContainer();
  }
};

SlideshowView.prototype.configurePositionElement = function () {
  var self = this;

  self.positionElement = document.createElement('div');
  self.positionElement.className = 'remark-position';
  self.element.appendChild(self.positionElement);
};

SlideshowView.prototype.configureOverlayView = function () {
  var self = this;

  self.overlayView = new OverlayView(self.events);
  self.element.appendChild(self.overlayView.element);
};

SlideshowView.prototype.updateSlideViews = function () {
  var self = this;

  if (self.slideViews) {
    self.slideViews.each(function (slideView) {
      self.element.removeChild(slideView.element);
    });
  }

  self.slideViews = self.slideshow.getSlides().map(function (slide) {
    return new SlideView(self.events, self.slideshow, slide);
  });

  self.slideViews.each(function (slideView) {
    self.element.appendChild(slideView.element);
  });

  self.scaleSlideBackgroundImages();

  if (self.slideshow.getCurrentSlideNo() > 0) {
    self.showSlide(self.slideshow.getCurrentSlideNo() - 1);
  }
};

SlideshowView.prototype.scaleSlideBackgroundImages = function () {
  var self = this;

  if (self.slideViews) {
    self.slideViews.each(function (slideView) {
      slideView.scaleBackgroundImage(self.dimensions);
    });
  }
};

SlideshowView.prototype.showSlide =  function (slideIndex) {
  var self = this
    , slideView = self.slideViews[slideIndex];

  self.slideshow.emit('slidein', slideView.element, slideIndex);
  slideView.show();
  self.positionElement.innerHTML =
    slideIndex + 1 + ' / ' + self.slideViews.length;
};

SlideshowView.prototype.hideSlide = function (slideIndex) {
  var self = this
    , slideView = self.slideViews[slideIndex];

  self.slideshow.emit('slideout', slideView.element, slideIndex);
  slideView.hide();
};

SlideshowView.prototype.updateDimensions = function () {
  var self = this
    , ratio = getRatio(self.slideshow)
    , dimensions = getDimensions(ratio)
    ;

  this.ratio = ratio;
  this.dimensions.width = dimensions.width;
  this.dimensions.height = dimensions.height;

  this.element.style.width = this.dimensions.width + 'px';
  this.element.style.height = this.dimensions.height + 'px';

  this.scaleSlideBackgroundImages();
  this.scaleToFitContainer();
};

SlideshowView.prototype.scaleToFitContainer = function () {
  var self = this
    , containerHeight = this.getContainerHeight()
    , containerWidth = this.getContainerWidth()
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

SlideshowView.prototype.getContainerHeight = function () {
  var self = this;

  if (self.containerElement === document.body) {
    return window.innerHeight;
  }
  else {
    return self.containerElement.clientHeight;
  }
};

SlideshowView.prototype.getContainerWidth = function () {
  var self = this;

  if (self.containerElement === document.body) {
    return window.innerWidth;
  }
  else {
    return self.containerElement.clientWidth;
  }
};

function getRatio (slideshow) {
  var ratioComponents = slideshow.getRatio().split(':')
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
