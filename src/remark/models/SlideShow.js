import Navigation from './slideshow/Navigation';
import Events from './slideshow/Events';
import Slide from './Slide';
import Parser from '../parser';
import macros from '../macros';

class SlideShow {
  constructor(events, dom, options, callback) {
    this.events = events;
    this.dom = dom;
    this.options = options || {};
    this.slides = [];
    this.links = {};
    this.slides.byName = {};

    this.init = this.init.bind(this);
    this.setOptions = this.setOptions.bind(this);
    this.getOptions = this.getOptions.bind(this);
    this.updateOptions = this.updateOptions.bind(this);

    this.createSlides = this.createSlides.bind(this);
    this.loadFromString = this.loadFromString.bind(this);
    this.loadFromUrl = this.loadFromUrl.bind(this);
    this.update = this.update.bind(this);
    this.getLinks = this.getLinks.bind(this);
    this.getSlides = this.getSlides.bind(this);
    this.getSlideCount = this.getSlideCount.bind(this);
    this.getSlideByName = this.getSlideByName.bind(this);
    this.getSlidesByNumber = this.getSlidesByNumber.bind(this);

    this.togglePresenterMode = this.togglePresenterMode.bind(this);
    this.toggleHelp = this.toggleHelp.bind(this);
    this.toggleBlackout = this.toggleBlackout.bind(this);
    this.toggleMirrored = this.toggleMirrored.bind(this);
    this.toggleFullScreen = this.toggleFullScreen.bind(this);
    this.createClone = this.createClone.bind(this);

    this.resetTimer = this.resetTimer.bind(this);

    this.setOptions(options);
    this.init(callback);
  }

  init(callback) {
    this.events.on('toggleBlackout', function (opts) {
      if (opts && opts.propagate === false) return;

      if (self.clone && !self.clone.closed) {
        self.clone.postMessage('toggleBlackout', '*');
      }

      if (window.opener) {
        window.opener.postMessage('toggleBlackout', '*');
      }
    });

    if (this.options.sourceUrl !== null) {
      this.loadFromUrl(options.sourceUrl, callback);
    } else {
      this.loadFromString(options.source);

      if (typeof callback === 'function') {
        callback(self);
      }
    }
  }

  setOptions(options) {
    const defaults = {
      sourceUrl: null,
      ratio: '4:3',
      highlightStyle: 'default',
      highlightLines: false,
      highlightSpans: false,
      highlightInlineCode: false,
      highlightLanguage: '',
      slideNumberFormat: '%current% / %total%',
      cloneTarget: '_blank',
      excludedClasses: [],
      countIncrementalSlides: true
    };

    this.options = {
      ...defaults,
      ...options
    };
  }

  getOptions() {
    return this.options;
  }

  updateOptions(options) {
    this.setOptions(options);
    this.events.emit('slidesChanged');
  }

  createSlides(slideShowSource) {
    const parser = new Parser();
    const parsedSlides = parser.parse(slideShowSource, macros, this.options);
    let slides = [];
    let byName = {};
    let layoutSlide;

    this.slides.byName = {};
    this.slides.byNumber = {};

    let slideNumber = 0;
    
    parsedSlides.slides.forEach(function (slide, i) {
      let template;

      if (slide.properties.continued === 'true' && i > 0) {
        template = slides[this.slides.length - 1];
      } else if (byName[slide.properties.template]) {
        template = byName[slide.properties.template];
      } else if (slide.properties.layout === 'false') {
        layoutSlide = undefined;
      } else if (layoutSlide && slide.properties.layout !== 'true') {
        template = layoutSlide;
      }

      if (slide.properties.continued === 'true' &&
        this.options.countIncrementalSlides === false &&
        slide.properties.count === undefined) {
        slide.properties.count = 'false';
      }

      let slideClasses = (slide.properties['class'] || '').split(/[, ]/);
      let excludedClasses = this.options.excludedClasses;
      let slideIsIncluded = slideClasses.filter((slideClass) => {
        return excludedClasses.indexOf(slideClass) !== -1;
      }).length === 0;

      if (slideIsIncluded && slide.properties.layout !== 'true' && slide.properties.count !== 'false') {
        slideNumber++;
        this.slides.byNumber[slideNumber] = [];
      }

      let slideViewModel = new Slide(this.slides.length, slideNumber, slide, template);

      if (slide.properties.name) {
        byName[slide.properties.name] = slideViewModel;
      }

      if (slide.properties.layout === 'true') {
        layoutSlide = slideViewModel;
      } else {
        if (slideIsIncluded) {
          this.slides.push(slideViewModel);
          this.slides.byNumber[slideNumber].push(slideViewModel);
        }

        if (slide.properties.name) {
          this.slides.byName[slide.properties.name] = slideViewModel;
        }
      }

    });

    return slides;
  }

  loadFromString(source) {
    source = source || '';

    this.slides = this.createSlides(source);
    this.slides.forEach((slide) => {
      slide.expandVariables();
    });

    this.links = {};
    this.slides.forEach(function (slide) {
      for (let id in slide.links) {
        if (slide.links.hasOwnProperty(id)) {
          links[id] = slide.links[id];
        }
      }
    });

    this.events.emit('slidesChanged');
  }

  loadFromUrl(url, callback) {
    let xhr = new this.dom.XMLHttpRequest();
    xhr.open('GET', this.options.sourceUrl, true);
    xhr.onload = () => {
      if (xhr.readyState === 4) {
        if (xhr.status === 200) {
          options.source = xhr.responseText.replace(/\r\n/g, '\n');
          this.loadFromString(options.source);

          if (typeof callback === 'function') {
            callback(self);
          }
        } else {
          throw Error(xhr.statusText);
        }
      }
    };
    xhr.onerror = () => {
      throw Error(xhr.statusText);
    };
    xhr.send(null);
    return xhr;
  }

  update() {
    this.events.emit('resize');
  }

  getLinks() {
    return this.links;
  }

  getSlides() {
    return this.slides.map((slide) => {
      return slide;
    });
  }

  getSlideCount() {
    return this.slides.length;
  }

  getSlideByName(name) {
    return this.slides.byName[name];
  }

  getSlidesByNumber(number) {
    return this.slides.byNumber[number];
  }

  togglePresenterMode() {
    this.events.emit('togglePresenterMode');
  }

  toggleHelp() {
    this.events.emit('toggleHelp');
  }

  toggleBlackout() {
    this.events.emit('toggleBlackout');
  }

  toggleMirrored() {
    this.events.emit('toggleMirrored');
  }

  toggleFullScreen() {
    this.events.emit('toggleFullscreen');
  }

  createClone() {
    this.events.emit('createClone');
  }

  resetTimer() {
    this.events.emit('resetTimer');
  }
}

export default Events(Navigation(SlideShow));