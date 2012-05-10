var dispatcher = require('./dispatcher')
  , dom = require('./dom')
  ;

exports.Controller = Controller;

function Controller (slideshow) {
  var currentSlideIndex = -1;

  dom.on('hashchange', navigate);
  navigate();

  dispatcher.on('previousSlide', function() {
    gotoSlide(slideshow, currentSlideIndex - 1);
  });

  dispatcher.on('nextSlide', function() {
    gotoSlide(slideshow, currentSlideIndex + 1);
  });

  function navigate () {
    var slideNo = parseInt((location.hash || '').substr(1), 10) || 1;
    gotoSlide(slideshow, slideNo - 1);
  }

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
    location.hash = currentSlideIndex + 1;
  }
}
