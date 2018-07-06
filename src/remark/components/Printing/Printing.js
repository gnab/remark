import EventEmitter from 'events';
import Styler from '../Styler/Styler';

const LANDSCAPE = 'landscape';
const PORTRAIT = 'portrait';
const DIMENSIONS = [681, 908];

export default class Printing extends EventEmitter {
  constructor() {
    super();

    this.orientation = LANDSCAPE;
    this.pageHeight = DIMENSIONS[0];
    this.pageWidth = DIMENSIONS[1];

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
        isPortrait: this.orientation === PORTRAIT,
        pageHeight: this.pageHeight,
        pageWidth: this.pageWidth
      });
    }
  }

  setPageOrientation(orientation) {
    this.orientation = orientation;

    let dimensions = (orientation === PORTRAIT) ? DIMENSIONS.reverse() : DIMENSIONS;
    this.pageHeight = dimensions[0];
    this.pageWidth = dimensions[1];

    Styler.setPageSize(orientation);
  }
}
