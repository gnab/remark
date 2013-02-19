var events = require('./events')
  ;

exports.Controller = Controller;

function Controller (slideshow) {
  var currentSlideNo = 0;

  gotoSlide(slideshow, 1);

  slideshow.on('update', function () {
    var slideNo = currentSlideNo
      , slideCount = slideshow.getSlideCount()
      ;

    currentSlideNo = 0;

    if (slideNo > slideCount) {
      gotoSlide(slideshow, slideCount);
    }
    else {
      gotoSlide(slideshow, slideNo);
    }
  });

  events.on('gotoSlide', function (slideNoOrName) {
    gotoSlide(slideshow, slideNoOrName);
  });

  events.on('gotoPreviousSlide', function() {
    gotoSlide(slideshow, currentSlideNo - 1);
  });

  events.on('gotoNextSlide', function() {
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
      events.emit('hideSlide', currentSlideNo - 1);
    }

    events.emit('showSlide', slideNo - 1);

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
