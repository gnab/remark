var api = require('../api')
  , dispatcher = require('../dispatcher')
  , SlideView = require('./slideView').SlideView
  , config = require('../config')
  , dom = require('../dom')

  , referenceWidth = 908
  , referenceHeight = 681
  , referenceRatio = referenceWidth / referenceHeight
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
  return slides.map(function (slide) {
    return new SlideView(slide);
  });
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

function mapStyles (element) {
  var ratio = getRatio()
    , dimensions = getDimensions(ratio)
    ;

  element.style.width = dimensions.width + 'px';
  element.style.height = dimensions.height + 'px';

  dom.on('resize', resize);
  resize();

  function resize () {
    var containerHeight = dom.innerHeight
      , containerWidth = dom.innerWidth
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

    element.style['-webkit-transform'] = 'scale(' + scale + ')';
    element.style.MozTransform = 'scale(' + scale + ')';
    element.style.left = (containerWidth - scaledWidth) / 2 + 'px';
    element.style.top = (containerHeight - scaledHeight) / 2 + 'px';
  }
}

function getDimensions (ratio) {
  return {
    width: Math.floor(referenceWidth / referenceRatio * ratio.ratio)
  , height: referenceHeight
  };
}

function getRatio () {
  var ratioString = config.ratio || '4:3'
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
