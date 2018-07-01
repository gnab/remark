import { hasClass } from '../../utils';

export default class Location {
  constructor(events, dom, slideShowView) {
    this.events = events;
    this.dom = dom;
    this.slideShowView = slideShowView;

    this.activate = this.activate.bind(this);
    this.deactivate = this.deactivate.bind(this);
    this.addLocationEventListeners = this.addLocationEventListeners.bind(this);
  }

  activate() {
    this.addLocationEventListeners();
  }

  deactivate() {
    // Do nothing
  }

  addLocationEventListeners () {
    const navigateByHash = () => {
      let slideNoOrName = (this.dom.constructor.getLocationHash() || '').substr(1);
      this.events.emit('gotoSlide', slideNoOrName);
    };

    const updateHash = (slideNoOrName) => {
      if (hasClass(this.slideShowView.containerElement, 'remark-presenter-mode')) {
        this.dom.constructor.setLocationHash('#p' + slideNoOrName);
      } else{
        this.dom.constructor.setLocationHash('#' + slideNoOrName);
      }
    };

    // If slide show is embedded into custom DOM element, we don't
    // hook up to location hash changes, so just go to first slide.
    if (this.slideShowView.isEmbedded()) {
      this.events.emit('gotoSlide', 1);
    } else {
      // When slide show is not embedded into custom DOM element, but
      // rather hosted directly inside document.body, we hook up to
      // location hash changes, and trigger initial navigation.
      this.events.on('hashchange', navigateByHash);
      this.events.on('slideChanged', updateHash);
      this.events.on('toggledPresenter', updateHash);

      navigateByHash();
    }
  }
}


