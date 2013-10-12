var EventEmitter = require('events').EventEmitter
  , utils = require('../utils')
  , Slide = require('./slide')
  , Parser = require('../parser')
  ;

module.exports = Slideshow;

function Slideshow (events, options) {
  var self = this;

  /**
   * Configuration
   * =============
   */

  options = options || {};

  self.getRatio = getOrDefault('ratio', '4:3');
  self.getHighlightStyle = getOrDefault('highlightStyle', 'default');
  self.getHighlightLanguage = getOrDefault('highlightLanguage', '');

  function getOrDefault (key, defaultValue) {
    return function () {
      if (options[key] === undefined) {
        return defaultValue;
      }

      return options[key];
    };
  }

  /**
   * Slides
   * ======
   */

  var slides = [];

  /**
   * Loads slideshow from Markdown string.
   *
   * @param  {String} source Markdown string.
   */
  self.load = function (source) {
    source = source || '';

    slides = createSlides(source, events);
    expandVariables(slides);

    events.emit('slidesChanged');
  };

  /**
   * Returns list of slides.
   *
   * @return  {Slide[]} List of slides.
   */
  self.slides = function () {
    return slides.map(function (slide) { return slide; });
  };

  /**
   * Returns current slide, or slide by name or number.
   *
   * @param  {String|Number} nameOrNumber [optional]
   *
   * @return {Slide} Slide identified by `nameOrNumber`, or the current
   *         slide if not given.
   */
  self.slide = function (nameOrNumber) {
    if (nameOrNumber === undefined) {
      return slides[currentSlideNo - 1];
    }

    return slides.byName[nameOrNumber] || slides[parseInt(nameOrNumber, 11) - 1];
  };

  // Load slides from source
  self.load(options.source);

  /**
   * Control
   * =======
   */

  /**
   * Starts slideshow navigation.
   *
   * Navigation is initially disabled to allow customizations to take place
   * before navigation starts and the initial slide is shown.
   */
  self.start = function () {
    events.emit('resume');
    return self;
  };

  /**
   * Pauses slideshow navigation.
   *
   * Special customization may require
   */
  self.pause = function () {
    events.emit('pause');
    return self;
  };

  /**
   * Resumes slideshow navigation.
   */
  self.resume = function () {
    events.emit('resume');
    return self;
  };

  /**
   * Navigation
   * ==========
   */

  var currentSlideNo = 0;

  self.forward = function () {
    if (!self.slide().forward()) {
      self.gotoSlide(currentSlideNo + 1);
    }
  };

  self.backward = function () {
    if (!self.slide().backward()) {
      self.gotoSlide(currentSlideNo - 1);
    }
  };

  self.gotoSlide = function (slideNoOrName) {
    var slide = self.slide(slideNoOrName)
      , slideNo
      ;

    if (slide) {
      slideNo = slide.number();
    }
    else {
      if (currentSlideNo === 0 && self.slides().length) {
        slideNo = 1;
      }
      else {
        return;
      }
    }

    if (slideNo === currentSlideNo) {
      return;
    }

    if (currentSlideNo !== 0) {
      events.emit('hideSlide', currentSlideNo - 1);
    }

    events.emit('showSlide', slideNo - 1);

    currentSlideNo = slideNo;

    events.emit('slideChanged', slide && slideNoOrName || slideNo);

    if (self.clone && !self.clone.closed) {
      self.clone.postMessage('gotoSlide:' + currentSlideNo, '*');
    }

    if (window.opener) {
      window.opener.postMessage('gotoSlide:' + currentSlideNo, '*');
    }
  };

  events.on('gotoSlide', self.gotoSlide);
  events.on('backward', self.backward);
  events.on('forward', self.forward);
  events.on('gotoFirstSlide', function () {
    self.gotoSlide(1);
  });
  events.on('gotoLastSlide', function () {
    self.gotoSlide(self.slides().length);
  });

  events.on('slidesChanged', function () {
    if (currentSlideNo > self.slides().length) {
      currentSlideNo = self.slides().length;
    }
  });

  /**
   * Clone
   * =====
   */

  var clone;

  events.on('createClone', function () {
    if (!clone || clone.closed) {
      clone = window.open(location.href, '_blank', 'location=no');
    }
    else {
      clone.focus();
    }
  });

  /**
   * Eventing
   * ========
   */

  var externalEvents = new EventEmitter();

  externalEvents.setMaxListeners(0);

  self.on = function () {
    externalEvents.on.apply(externalEvents, arguments);
    return self;
  };

  ['showSlide', 'hideSlide', 'beforeShowSlide', 'afterShowSlide', 'beforeHideSlide', 'afterHideSlide'].map(function (eventName) {
    events.on(eventName, function (slideIndex) {
      var slide = self.slides()[slideIndex];
      externalEvents.emit(eventName, slide);
    });
  });
}

function createSlides (slideshowSource, events) {
  var parser = new Parser()
   ,  parsedSlides = parser.parse(slideshowSource)
    , slides = []
    , byName = {}
    , layoutSlide
    ;

  slides.byName = {};

  parsedSlides.forEach(function (slide, i) {
    var template, slideViewModel;

    if (slide.properties.continued === 'true' && i > 0) {
      template = slides[slides.length - 1];
    }
    else if (byName[slide.properties.template]) {
      template = byName[slide.properties.template];
    }
    else if (slide.properties.layout === 'false') {
      layoutSlide = undefined;
    }
    else if (layoutSlide && slide.properties.layout !== 'true') {
      template = layoutSlide;
    }

    slideViewModel = new Slide(slides.length + 1, slide, template);

    if (slide.properties.layout === 'true') {
      layoutSlide = slideViewModel;
    }

    if (slide.properties.name) {
      byName[slide.properties.name] = slideViewModel;
    }

    if (slide.properties.layout !== 'true') {
      slides.push(slideViewModel);
      if (slide.properties.name) {
        slides.byName[slide.properties.name] = slideViewModel;
      }
    }
  });

  return slides;
}

function expandVariables (slides) {
  slides.forEach(function (slide) {
    slide.expandVariables();
  });
}
