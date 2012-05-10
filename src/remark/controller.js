var dispatcher = require('./dispatcher')
  , dom = require('./dom')
  ;

exports.Controller = Controller;

function Controller (slideshow) {
  var currentSlideIndex = -1;

  dispatcher.on('gotoSlide', function (slideIndex) {
    gotoSlide(slideshow, slideIndex);
  });

  dispatcher.on('gotoPreviousSlide', function() {
    gotoSlide(slideshow, currentSlideIndex - 1);
  });

  dispatcher.on('gotoNextSlide', function() {
    gotoSlide(slideshow, currentSlideIndex + 1);
  });

  function gotoSlide (slideshow, slideIndex) {
    var alreadyOnSlide = slideIndex === currentSlideIndex
      , lastSlideIndex = slideshow.getSlideCount() - 1
      , slideOutOfRange = slideIndex < 0 || slideIndex > lastSlideIndex
      ;

    if (alreadyOnSlide || slideOutOfRange) {
      return;
    }

    if (currentSlideIndex !== -1) {
      dispatcher.emit('hideSlide', currentSlideIndex);
    }

    dispatcher.emit('showSlide', slideIndex);

    currentSlideIndex = slideIndex;
    dom.window.location.hash = currentSlideIndex + 1;
  }
}
