import { EventEmitter } from 'events';
import highlighter from './highlighter';
import Converter from './Converter';
import resources from './resources';
import Parser from './Parser';
import SlideShow from './models/SlideShow';
import SlideShowView from './views/SlideShowView';
import DefaultController from './controllers/DefaultController';
import Dom from './Dom';
import macros from './macros';

export default class Api {
  constructor(dom) {
    this.dom = dom || new Dom();
    this.highlighter = highlighter;
    this.macros = macros;
    this.version = resources.version;
    this.converter = new Converter();

    this.create = this.create.bind(this);
  }

  static convert(markdown) {
    let parser = new Parser();
    let content = parser.parse(markdown || '', macros)[0].content;
    
    return this.converter.convertMarkdown(content, {}, true);
  };

  static applyDefaults(dom, options) {
    options = options || {};
    
    const unescape = (source) => {
      return source.replace(/&[l|g]t;/g, (match) => (match === '&lt;' ? '<' : '>'))
        .replace(/&amp;/g, '&')
        .replace(/&quot;/g, '"');
    };

    if (!options.hasOwnProperty('source')) {
      let sourceElement = dom.getElementById('source');

      if (sourceElement) {
        options.source = unescape(sourceElement.innerHTML);
        sourceElement.style.display = 'none';
      }
    }

    if (!(options.container instanceof window.HTMLElement)) {
      options.container = dom.getBodyElement();
    }

    return options;
  }

  // Creates slide show initialized from options
  create(options, callback) {
    options = Api.applyDefaults(this.dom, options);

    let events = new EventEmitter();
    events.setMaxListeners(0);

    return new SlideShow(events, this.dom, options, (slideShow) => {
      let slideShowView = new SlideShowView(events, this.dom, options.container, slideShow);
      options.controller || new DefaultController(events, this.dom, slideShowView, options.navigation);

      if (typeof callback === 'function') {
        callback(slideShow);
      }
    });
  };
}