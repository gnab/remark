import EventEmitter from 'events';
//import Styler from '../Styler/Styler';

const LANDSCAPE = 'landscape';
const PORTRAIT = 'portrait';

export default class Printing extends EventEmitter {
  constructor() {
    super();

    this.orientation = LANDSCAPE;

    this.onPrint = this.onPrint.bind(this);
    this.setPageOrientation = this.setPageOrientation.bind(this);

    if (window.matchMedia) {
      window.matchMedia('print').addListener((e) => {
        this.onPrint(e);
      });
    }
  }

  onPrint(e) {
    if (e.matches) {
      this.emit('print', {
        isPortrait: this.orientation === PORTRAIT
      });
    }
  }

  setPageOrientation(orientation) {
    this.orientation = orientation;
    //Styler.setPageSize(orientation);
  }
}
