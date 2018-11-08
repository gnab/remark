import EventEmitter from 'events';
import Converter from './Converter';
import Parser from './Parser';
import SlideShow from './models/SlideShow';
import SlideShowView from './views/SlideShowView';
import DefaultController from './controllers/DefaultController';
import Dom from './Dom';
import Styler from "./components/Styler/Styler";
import i18next from 'i18next';

export default class Api {
  constructor() {
    this.converter = new Converter();
    this.controller = null;
    this.originalContent = null;
    this.container = null;

    this.convert = this.convert.bind(this);
    this.applyDefaults = this.applyDefaults.bind(this);
    this.create = this.create.bind(this);
    this.destroy = this.destroy.bind(this);
  }

  convert(markdown, options) {
    let parser = Parser;
    let content = parser.parse(markdown || '', options || {})[0].content;
    
    return this.converter.convertMarkdown(content, {}, true);
  }

  applyDefaults(options) {
    options = options || {};
    
    const unescape = (source) => {
      return source.replace(/&[l|g]t;/g, (match) => (match === '&lt;' ? '<' : '>'))
        .replace(/&amp;/g, '&')
        .replace(/&quot;/g, '"');
    };

    if (!(options.container instanceof window.HTMLElement)) {
      options.container = Dom.getBodyElement();
    }

    this.container = options.container;
    this.originalContent = this.container.innerHTML;

    if (!options.hasOwnProperty('source')) {
      let sourceElement = Dom.getElementById('source');

      if (sourceElement) {
        options.source = unescape(sourceElement.innerHTML);
        sourceElement.style.display = 'none';
      }
    }

    return options;
  }

  // Creates slide show initialized from options
  create(options, callback) {
    let translations = options.translations || {};

    i18next.init({
      lng: 'en',
      getAsync: false,
      resources: {
        en: {
          translation: {
            timer: {
              paused: 'Paused'
            },
            notesView: {
              slides: {
                notesForCurrent: 'Notes for current slide',
                notesForNext: 'Notes for next slide'
              }
            },
            helpView: {
              head: 'Help',
              subHead: 'Keyboard shortcuts',
              keyMaps: {
                goToPreviousSlide: 'Go to previous slide',
                goToNextSlide: 'Go to next slide',
                goToFirstSlide: 'Go to first slide',
                goToLastSlide: 'Go to last slide',
                goToSpecificSlide: {
                  description: 'Go to specific slide',
                  number: 'Number',
                  enter: 'Return'
                },
                toggleBlackout: 'Toggle blackout',
                toggleMirrored: 'Toggle mirrored',
                toggleFullScreen: 'Toggle full screen',
                togglePresenterMode: 'Toggle presenter mode',
                restartPresentationTimer: 'Restart the presentation timer',
                cloneSlideShow: 'Clone slide show',
                toggleHelp: 'Toggle this help',
                backToSlideShow: 'Back to slide show'
              }
            }
          }
        },
        ...translations
      }
    });
    options = this.applyDefaults(options);

    if (options.hasOwnProperty('styles')) {
      for (let style in options.styles) {
        if (options.styles.hasOwnProperty(style)) {
          Styler.addStyle(style, options.styles[style]);
        }
      }
    }

    let events = new EventEmitter();
    events.setMaxListeners(0);

    return new SlideShow(events, options, (slideShow) => {
      let slideShowView = new SlideShowView(events, options.container, slideShow);
      this.controller = options.controller || new DefaultController(
        events,
        slideShowView,
        slideShow.getOptions()
      );

      if (typeof callback === 'function') {
        callback(slideShow);
      }
    });
  }

  destroy() {
    this.controller = null;
    this.container.innerHTML = this.originalContent;
    Styler.cleanup();
  }
}