import { hasClass } from '../../utils';
import Dom from "../../Dom";

export default class Location {
  constructor(events, slideShowView) {
    this.events = events;
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
      let slideNoOrName = (Dom.getLocationHash() || '').substr(1);
      this.events.emit('gotoSlide', slideNoOrName);
    };

    const updateHash = (slideNoOrName) => {
      if (hasClass(this.slideShowView.containerElement, 'remark-presenter-mode')) {
        Dom.setLocationHash('#p' + slideNoOrName);
      } else{
        Dom.setLocationHash('#' + slideNoOrName);
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


