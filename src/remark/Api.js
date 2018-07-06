import EventEmitter from 'events';
import Converter from './Converter';
import Parser from './Parser';
import SlideShow from './models/SlideShow';
import SlideShowView from './views/SlideShowView';
import DefaultController from './controllers/DefaultController';
import Dom from './Dom';
import Styler from "./components/Styler/Styler";

export default class Api {
  constructor() {
    this.converter = new Converter();
    this.controller = null;

    this.convert = this.convert.bind(this);
    this.create = this.create.bind(this);
    this.destroy = this.destroy.bind(this);
  }

  convert(markdown, options) {
    let parser = Parser;
    let content = parser.parse(markdown || '', options || {})[0].content;
    
    return this.converter.convertMarkdown(content, {}, true);
  }

  static applyDefaults(options) {
    options = options || {};
    
    const unescape = (source) => {
      return source.replace(/&[l|g]t;/g, (match) => (match === '&lt;' ? '<' : '>'))
        .replace(/&amp;/g, '&')
        .replace(/&quot;/g, '"');
    };

    if (!options.hasOwnProperty('source')) {
      let sourceElement = Dom.getElementById('source');

      if (sourceElement) {
        options.source = unescape(sourceElement.innerHTML);
        sourceElement.style.display = 'none';
      }
    }

    if (!(options.container instanceof window.HTMLElement)) {
      options.container = Dom.getBodyElement();
    }

    return options;
  }

  // Creates slide show initialized from options
  create(options, callback) {
    options = this.constructor.applyDefaults(options);

    if (options.hasOwnProperty('styles')) {
      options.styles.forEach((style, key) => {
        Styler.addStyle(key, style);
      });
    }

    let events = new EventEmitter();
    events.setMaxListeners(0);

    return new SlideShow(events, options, (slideShow) => {
      let slideShowView = new SlideShowView(events, options.container, slideShow);
      this.controller = options.controller || new DefaultController(
        events,
        slideShowView,
        options.navigation
      );

      if (typeof callback === 'function') {
        callback(slideShow);
      }
    });
  }

  destroy() {
    this.controller = null;
    Styler.cleanup();
  }
}