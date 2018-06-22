import SlideView from './SlideView';
import Timer from '../components/Timer/Timer';
import NotesView from './NotesView';
import Scaler from '../Scaler';
import resources from '../resources';
import utils from '../utils';
import Printing from '../components/Printing/Printing';

export default class SlideShowView {
  constructor(events, dom, containerElement, slideShow) {
    this.events = events;
    this.dom = dom;
    this.slideShow = slideShow;
    this.scaler = new Scaler(events, slideShow);
    this.printing = new Printing();
    this.slideViews = [];
    this.timer = new Timer(events, self.timerElement);

    // Bind functions
    this.configureContainerElement = this.configureContainerElement.bind(this);
    this.configureChildElements = this.configureChildElements.bind(this);
    this.scaleElements = this.scaleElements.bind(this);
    this.updateSlideViews = this.updateSlideViews.bind(this);
    this.scaleSlideBackgroundImages = this.scaleSlideBackgroundImages.bind(this);
    this.showSlide = this.showSlide.bind(this);
    this.hideSlide = this.hideSlide.bind(this);
    this.updateDimensions = this.updateDimensions.bind(this);
    this.registerEvents = this.registerEvents.bind(this);
    this.isEmbedded = this.isEmbedded.bind(this);

    // Configure elements
    this.configureContainerElement(containerElement);
    this.configureChildElements();

    this.updateDimensions();
    this.scaleElements();
    this.updateSlideViews();
    this.registerEvents();

    SlideShowView.handleFullScreen(this);
  }

  registerEvents() {
    this.events.on('slidesChanged', () => {
      this.updateSlideViews();
    });

    this.events.on('hideSlide', (slideIndex) => {
      // To make sure that there is only one element fading at a time,
      // remove the fading class from all slides before hiding
      // the new slide.
      this.elementArea.getElementsByClassName('remark-fading').forEach(function (slide) {
        utils.removeClass(slide, 'remark-fading');
      });
      this.hideSlide(slideIndex);
    });

    this.events.on('showSlide', (slideIndex) => {
      this.showSlide(slideIndex);
    });

    this.events.on('forcePresenterMode', () => {
      if (!utils.hasClass(self.containerElement, 'remark-presenter-mode')) {
        utils.toggleClass(self.containerElement, 'remark-presenter-mode');
        self.scaleElements();
        this.printing.setPageOrientation('landscape');
      }
    });

    this.events.on('togglePresenterMode', () => {
      utils.toggleClass(self.containerElement, 'remark-presenter-mode');
      self.scaleElements();
      this.events.emit('toggledPresenter', self.slideShow.getCurrentSlideIndex() + 1);

      if (utils.hasClass(self.containerElement, 'remark-presenter-mode')) {
        this.printing.setPageOrientation('portrait');
      }
      else {
        this.printing.setPageOrientation('landscape');
      }
    });

    this.events.on('toggleHelp', () => {
      utils.toggleClass(this.containerElement, 'remark-help-mode');
    });

    this.events.on('toggleBlackout', () => {
      utils.toggleClass(this.containerElement, 'remark-blackout-mode');
    });

    this.events.on('toggleMirrored', () => {
      utils.toggleClass(this.containerElement, 'remark-mirrored-mode');
    });

    this.events.on('hideOverlay', () => {
      utils.removeClass(this.containerElement, 'remark-blackout-mode');
      utils.removeClass(this.containerElement, 'remark-help-mode');
    });

    this.events.on('pause', () => {
      utils.toggleClass(this.containerElement, 'remark-pause-mode');
    });

    this.events.on('resume', () => {
      utils.toggleClass(this.containerElement, 'remark-pause-mode');
    });
  }

  configureContainerElement(element) {
    this.containerElement = element;

    utils.addClass(element, 'remark-container');

    if (element === this.dom.getBodyElement()) {
      utils.addClass(this.dom.getHTMLElement(), 'remark-container');

      SlideShowView.forwardEvents(this.events, window, [
        'hashchange', 'resize', 'keydown', 'keypress', 'mousewheel',
        'message', 'DOMMouseScroll'
      ]);
      SlideShowView.forwardEvents(this.events, this.containerElement, [
        'touchstart', 'touchmove', 'touchend', 'click', 'contextmenu'
      ]);
    } else {
      element.style.position = 'absolute';
      element.tabIndex = -1;

      SlideShowView.forwardEvents(this.events, window, ['resize']);
      SlideShowView.forwardEvents(this.events, element, [
        'keydown', 'keypress', 'mousewheel',
        'touchstart', 'touchmove', 'touchend'
      ]);
    }

    // Tap event is handled in slideShow view
    // rather than controller as knowledge of
    // container width is needed to determine
    // whether to move backwards or forwards
    this.events.on('tap', function (endX) {
      if (endX < this.containerElement.clientWidth / 2) {
        this.slideShow.gotoPreviousSlide();
      }
      else {
        this.slideShow.gotoNextSlide();
      }
    });
  }

  scaleElements() {
    this.slideViews.forEach((slideView) => {
      slideView.scale(this.elementArea);
    });

    if (this.previewArea.children.length) {
      this.scaler.scaleToFit(this.previewArea.children[0].children[0], this.previewArea);
    }

    this.scaler.scaleToFit(this.helpElement, this.containerElement);
    this.scaler.scaleToFit(this.pauseElement, this.containerElement);
  }

  configureChildElements() {
    this.containerElement.innerHTML += resources.containerLayout;

    this.elementArea = this.containerElement.getElementsByClassName('remark-slides-area')[0];
    this.previewArea = this.containerElement.getElementsByClassName('remark-preview-area')[0];
    this.notesArea = this.containerElement.getElementsByClassName('remark-notes-area')[0];

    this.notesView = new NotesView (this.events, this.notesArea, function () {
      return this.slideViews;
    });

    this.backdropElement = this.containerElement.getElementsByClassName('remark-backdrop')[0];
    this.helpElement = this.containerElement.getElementsByClassName('remark-help')[0];

    this.timerElement = this.notesArea.getElementsByClassName('remark-toolbar-timer')[0];
    this.pauseElement = this.containerElement.getElementsByClassName('remark-pause')[0];

    this.events.on('propertiesChanged', (changes) => {
      if (changes.hasOwnProperty('ratio')) {
        this.updateDimensions();
      }
    });

    this.events.on('resize', () => {
      this.scaleElements();
    });

    this.printing.on('print', (e) => {
      let slideHeight = (e.isPortrait) ? e.pageHeight * 0.4 : e.pageHeight;

      this.slideViews.forEach(function (slideView) {
        slideView.scale({
          clientWidth: e.pageWidth,
          clientHeight: slideHeight
        });

        if (e.isPortrait) {
          slideView.scalingElement.style.top = '20px';
          slideView.notesElement.style.top = slideHeight + 40 + 'px';
        }
      });
    });
  }

  updateSlideViews() {
    this.slideViews.forEach(function (slideView) {
      this.elementArea.removeChild(slideView.containerElement);
    });

    this.slideViews = this.slideShow.getSlides().map(function (slide) {
      return new SlideView(this.events, this.slideShow, this.scaler, slide);
    });

    this.slideViews.forEach(function (slideView) {
      this.elementArea.appendChild(slideView.containerElement);
    });

    this.updateDimensions();

    if (this.slideShow.getCurrentSlideIndex() > -1) {
      this.showSlide(this.slideShow.getCurrentSlideIndex());
    }
  }

  scaleSlideBackgroundImages(dimensions) {
    this.slideViews.forEach(function (slideView) {
      slideView.scaleBackgroundImage(dimensions);
    });
  };

  showSlide(slideIndex) {
    this.events.emit("beforeShowSlide", slideIndex);
    this.slideViews[slideIndex].show();

    let nextSlideView = this.slideViews[slideIndex + 1];
    this.previewArea.innerHTML = (nextSlideView) ? nextSlideView.containerElement.outerHTML : '';
    this.events.emit("afterShowSlide", slideIndex);
  }

  hideSlide(slideIndex) {
    this.events.emit("beforeHideSlide", slideIndex);
    this.slideViews[slideIndex].hide();
    this.events.emit("afterHideSlide", slideIndex);
  }

  updateDimensions() {
    let dimensions = this.scaler.dimensions;
    this.helpElement.style.width = dimensions.width + 'px';
    this.helpElement.style.height = dimensions.height + 'px';
    this.scaleSlideBackgroundImages(dimensions);
    this.scaleElements();
  }

  isEmbedded() {
    return this.containerElement !== this.dom.getBodyElement();
  }

  static handleFullScreen(self) {
    const requestFullScreen = utils.getPrefixedProperty(self.containerElement, 'requestFullScreen');
    const cancelFullScreen = utils.getPrefixedProperty(document, 'cancelFullScreen');

    self.events.on('toggleFullScreen', function () {
      let fullScreenElement = utils.getPrefixedProperty(document, 'fullScreenElement')
        || utils.getPrefixedProperty(document, 'fullScreenElement');

      if (!fullScreenElement && requestFullScreen) {
        requestFullScreen.call(self.containerElement, Element.ALLOW_KEYBOARD_INPUT);
      } else if (cancelFullScreen) {
        cancelFullScreen.call(document);
      }

      self.scaleElements();
    });
  }

  static forwardEvents(target, source, events) {
    events.forEach(function (eventName) {
      source.addEventListener(eventName, function () {
        let args = Array.prototype.slice.call(arguments);
        target.emit.apply(target, [eventName].concat(args));
      });
    });
  }
}
