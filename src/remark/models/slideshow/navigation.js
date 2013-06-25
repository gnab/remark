module.exports = Navigation;

function Navigation (events) {
  var self = this
    , currentSlideNo = 0
    ;

  self.getCurrentSlideNo = getCurrentSlideNo;
  self.gotoSlide = gotoSlide;
  self.gotoPreviousSlide = gotoPreviousSlide;
  self.gotoNextSlide = gotoNextSlide;
  self.gotoFirstSlide = gotoFirstSlide;
  self.gotoLastSlide = gotoLastSlide;

  events.on('gotoSlide', gotoSlide);
  events.on('gotoPreviousSlide', gotoPreviousSlide);
  events.on('gotoNextSlide', gotoNextSlide);
  events.on('gotoFirstSlide', gotoFirstSlide);
  events.on('gotoLastSlide', gotoLastSlide);

  events.on('slidesChanged', function () {
    if (currentSlideNo > self.getSlideCount()) {
      currentSlideNo = self.getSlideCount();
    }
  });

  events.on('createClone', function () {
    if (!self.clone || self.clone.closed) {
      self.clone = window.open(location.href, '_blank', 'location=no');
    }
    else {
      self.clone.focus();
    }
  });

  function getCurrentSlideNo () {
    return currentSlideNo;
  }

  function gotoSlide (slideNoOrName) {
    var slideNo = getSlideNo(slideNoOrName)
      , alreadyOnSlide = slideNo === currentSlideNo
      , slideOutOfRange = slideNo < 1 || slideNo > self.getSlideCount()
      ;

    if (alreadyOnSlide || slideOutOfRange) {
      return;
    }

    if (currentSlideNo !== 0) {
      events.emit('hideSlide', currentSlideNo - 1);
    }

    events.emit('showSlide', slideNo - 1);

    currentSlideNo = slideNo;

    events.emit('slideChanged', slideNoOrName || slideNo);

    if (self.clone && !self.clone.closed) {
      self.clone.postMessage('gotoSlide:' + currentSlideNo, '*');
    }
  }

  function gotoPreviousSlide() {
    self.gotoSlide(currentSlideNo - 1);
  }
  
  function gotoNextSlide() {
    self.gotoSlide(currentSlideNo + 1);
  }
  
  function gotoFirstSlide () {
    self.gotoSlide(1);
  }
  
  function gotoLastSlide () {
    self.gotoSlide(self.getSlideCount());
  }

  function getSlideNo (slideNoOrName) {
    var slideNo
      , slide
      ;

    if (typeof slideNoOrName === 'number') {
      return slideNoOrName;
    }

    slideNo = parseInt(slideNoOrName, 10);
    if (slideNo.toString() === slideNoOrName) {
      return slideNo;
    }

    slide = self.getSlideByName(slideNoOrName);
    if (slide) {
      return slide.getSlideNo();
    }

    return 1;
  }
}
