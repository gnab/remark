module.exports = Navigation;

function Navigation (events) {
  var self = this
    , currentSlideNo = 0
    , started = null
    ;

  self.getCurrentSlideNo = getCurrentSlideNo;
  self.gotoSlide = gotoSlide;
  self.gotoPreviousSlide = gotoPreviousSlide;
  self.gotoNextSlide = gotoNextSlide;
  self.gotoFirstSlide = gotoFirstSlide;
  self.gotoLastSlide = gotoLastSlide;
  self.pause = pause;
  self.resume = resume;

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

  events.on('resetTimer', function() {
    started = false;
  });

  function pause () {
    events.emit('pause');
  }

  function resume () {
    events.emit('resume');
  }

  function getCurrentSlideNo () {
    return currentSlideNo;
  }

  function gotoSlide (slideNoOrName, noMessage) {
    var slideNo = getSlideNo(slideNoOrName)
      , alreadyOnSlide = slideNo === currentSlideNo
      , slideOutOfRange = slideNo < 1 || slideNo > self.getSlideCount()
      ;
    if (noMessage === undefined) noMessage = false;

    if (alreadyOnSlide || slideOutOfRange) {
      return;
    }

    if (currentSlideNo !== 0) {
      events.emit('hideSlide', currentSlideNo - 1, false);
    }

    // Use some tri-state logic here.
    // null = We haven't shown the first slide yet.
    // false = We've shown the initial slide, but we haven't progressed beyond that.
    // true = We've issued the first slide change command.
    if (started === null) {
      started = false;
    } else if (started === false) {
      // We've shown the initial slide previously - that means this is a
      // genuine move to a new slide.
      events.emit('start');
      started = true;
    }

    events.emit('showSlide', slideNo - 1);

    currentSlideNo = slideNo;

    events.emit('slideChanged', slideNoOrName || slideNo);

    if (!noMessage) {
      if (self.clone && !self.clone.closed) {
        self.clone.postMessage('gotoSlide:' + currentSlideNo, '*');
      }

      if (window.opener) {
        window.opener.postMessage('gotoSlide:' + currentSlideNo, '*');
      }
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
