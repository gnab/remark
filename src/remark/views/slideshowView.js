var SlideView = require('./slideView')
  , OverlayView = require('./overlayView')
  , addClass = require('../utils').addClass
  , toggleClass = require('../utils').toggleClass

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
  self.configureNotesElement();
  self.configureSlideshowElement();
  self.configurePreviewElement();
  self.configurePositionElement();
  self.configureOverlayView();

  self.updateDimensions();
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

  events.on('togglePresenterMode', function () {
    toggleClass(self.containerElement, 'remark-presenter-mode');

    self.presenterMode = !!!self.presenterMode;
    self.updateDimensions();
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
      'hashchange', 'resize', 'keydown', 'keypress', 'mousewheel', 'message'
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
  events.forEach(function (eventName) {
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

  self.elementArea = document.createElement('div');
  self.elementArea.className = 'remark-slideshow-area';

  self.elementArea.appendChild(self.element);
  self.containerElement.appendChild(self.elementArea);

  self.events.on('propertiesChanged', function (changes) {
    if (changes.hasOwnProperty('ratio')) {
      self.updateDimensions();
    }
  });

  self.events.on('resize', onResize);

  function onResize () {
    self.scaleToFit(self.element, self.elementArea);
    self.scaleToFit(self.previewElement, self.previewArea);
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

SlideshowView.prototype.configureNotesElement = function () {
  var self = this;

  self.notesElement = document.createElement('div');
  self.notesElement.className = 'remark-notes';
  self.containerElement.appendChild(self.notesElement);
};

SlideshowView.prototype.configurePreviewElement = function () {
  var self = this;

  self.previewElement = document.createElement('div');
  self.previewElement.className = 'remark-slideshow remark-slideshow-preview';

  self.previewArea = document.createElement('div');
  self.previewArea.className = 'remark-preview-area';

  self.previewArea.appendChild(self.previewElement);
  self.containerElement.appendChild(self.previewArea);
};

SlideshowView.prototype.updateSlideViews = function () {
  var self = this;

  if (self.slideViews) {
    self.slideViews.forEach(function (slideView) {
      self.element.removeChild(slideView.element);
    });
  }

  self.slideViews = self.slideshow.getSlides().map(function (slide) {
    return new SlideView(self.events, self.slideshow, slide);
  });

  self.slideViews.forEach(function (slideView) {
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
    self.slideViews.forEach(function (slideView) {
      slideView.scaleBackgroundImage(self.dimensions);
    });
  }
};

SlideshowView.prototype.showSlide =  function (slideIndex) {
  var self = this
    , slideView = self.slideViews[slideIndex]
    , nextSlideView = self.slideViews[slideIndex + 1];

  self.slideshow.emit('slidein', slideView.element, slideIndex);
  slideView.show();
  self.positionElement.innerHTML =
    slideIndex + 1 + ' / ' + self.slideViews.length;
  self.notesElement.innerHTML = slideView.notesMarkup;

  if (nextSlideView) {
    self.previewElement.innerHTML = nextSlideView.element.outerHTML;
    self.previewElement.childNodes[0].style.display = 'block';
  }
  else {
    self.previewElement.innerHTML = '';
  }
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

  this.previewElement.style.width = this.dimensions.width + 'px';
  this.previewElement.style.height = this.dimensions.height + 'px';

  this.scaleSlideBackgroundImages();
  this.scaleToFit(this.element, this.elementArea);
  this.scaleToFit(this.previewElement, this.previewArea);
};

SlideshowView.prototype.scaleToFit = function (element, container) {
  var self = this
    , containerHeight = container.clientHeight
    , containerWidth = container.clientWidth
    , scale
    , scaledWidth
    , scaledHeight
    , ratio = this.ratio
    , dimensions = this.dimensions
    , direction
    , left
    , top
    ;

  if (containerWidth / ratio.width > containerHeight / ratio.height) {
    scale = containerHeight / dimensions.height;
  }
  else {
    scale = containerWidth / dimensions.width;
  }

  scaledWidth = dimensions.width * scale;
  scaledHeight = dimensions.height * scale;

  left = (containerWidth - scaledWidth) / 2;
  top = (containerHeight - scaledHeight) / 2;

  element.style['-webkit-transform'] = 'scale(' + scale + ')';
  element.style.MozTransform = 'scale(' + scale + ')';
  element.style.left = left + 'px';
  element.style.top = top + 'px';
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
