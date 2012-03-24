var dispatcher = require('./dispatcher')
  , dom = require('./dom')
  , controller = module.exports = {}
  , currentSlideIndex = -1
  ;

controller.initialize = function (slideshow) {
  var navigate = function () {
    var slideNo = parseInt((location.hash || '').substr(1), 10) || 1;
    gotoSlide(slideshow, slideNo - 1);
  };

  dom.on('hashchange', navigate);
  navigate();

  dispatcher.on('previousSlide', function() {
    gotoSlide(slideshow, currentSlideIndex - 1);
  });

  dispatcher.on('nextSlide', function() {
    gotoSlide(slideshow, currentSlideIndex + 1);
  });
};

var gotoSlide = function (slideshow, slideIndex) {
  var alreadyOnSlide = slideIndex === currentSlideIndex
    , lastSlideIndex = slideshow.getSlideCount() - 1
    , slideOutOfRange = slideIndex < 0 || slideIndex > lastSlideIndex
    ;

  if (alreadyOnSlide || slideOutOfRange) {
    return;
  }

  if (currentSlideIndex !== -1) {
    slideshow.hideSlide(currentSlideIndex);
  }

  slideshow.showSlide(slideIndex);

  currentSlideIndex = slideIndex;
  location.hash = currentSlideIndex + 1;
};
