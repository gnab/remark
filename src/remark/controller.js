var dispatcher = require('./dispatcher')
  ;

exports.Controller = Controller;

function Controller (slideshow) {
  var currentSlideNo = 0;

  dispatcher.on('gotoSlide', function (slideNoOrName) {
    gotoSlide(slideshow, slideNoOrName);
  });

  dispatcher.on('gotoPreviousSlide', function() {
    gotoSlide(slideshow, currentSlideNo - 1);
  });

  dispatcher.on('gotoNextSlide', function() {
    gotoSlide(slideshow, currentSlideNo + 1);
  });

  function gotoSlide (slideshow, slideNoOrName) {
    var slideNo = getSlideNo(slideNoOrName)
      , alreadyOnSlide = slideNo === currentSlideNo
      , slideOutOfRange = slideNo < 1 || slideNo > slideshow.getSlideCount()
      ;

    if (alreadyOnSlide || slideOutOfRange) {
      return;
    }

    if (currentSlideNo !== 0) {
      dispatcher.emit('hideSlide', currentSlideNo - 1);
    }

    dispatcher.emit('showSlide', slideNo - 1);

    currentSlideNo = slideNo;

    window.location.hash = slideNoOrName;
  }

  function getSlideNo (slideNoOrName) {
    var slideNo
      , slide
      ;

    if (typeof slideNoOrName === 'number') {
      return slideNoOrName;
    }

    if ((slideNo = parseInt(slideNoOrName, 10)).toString() === slideNoOrName) {
      return slideNo;
    }

    if ((slide = slideshow.getSlideByName(slideNoOrName))) {
      return slide.index + 1;
    }

    return 1;
  }
}
