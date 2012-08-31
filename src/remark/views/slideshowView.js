var api = require('../api')
  , dispatcher = require('../dispatcher')
  , SlideView = require('./slideView').SlideView
  , dom = require('../dom')

  , scaleFactor = 227
  , heightFactor = 3
  , widthFactor = 4
  ;

exports.SlideshowView = SlideshowView;

function SlideshowView (slideshow, element) {
  this.slideViews = createSlideViews(slideshow.slides);

  this.slideViews.each(function (slideView) {
    element.appendChild(slideView.element);
  });

  this.positionElement = createPositionElement();
  element.appendChild(this.positionElement);

  mapStyles(element);
  mapEvents(this);
}

function createSlideViews (slides) {
  var views = [];
  for(var i = 0; i<slides.length; i++) {
      views[i] = new SlideView(slides[i], i);
  }
  return views;
}

function createPositionElement () {
  var element = dom.createElement('div');

  element.className = 'position';

  return element;
}

function mapEvents (slideshowView) {
  dispatcher.on('hideSlide', function (slideIndex) {
    slideshowView.hideSlide(slideIndex);
  });

  dispatcher.on('showSlide', function (slideIndex) {
    slideshowView.showSlide(slideIndex);
  });
}

SlideshowView.prototype.showSlide =  function (slideIndex) {
  var slideView = this.slideViews[slideIndex];
  slideView.show();
  this.positionElement.innerHTML = slideIndex + 1 + ' / ' + this.slideViews.length;
  api.emit('slidein', slideView.element, slideIndex);
};

SlideshowView.prototype.hideSlide = function (slideIndex) {
  var slideView = this.slideViews[slideIndex];
  slideView.hide();
  api.emit('slideout', slideView.element, slideIndex);
};

function mapStyles (element) {
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
}
