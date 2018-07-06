import Api from './remark/Api';
import polyfills from './polyfills';
import './remark.scss';
//import Styler from './remark/components/Styler/Styler';

// Expose API as `remark`
window.remark = new Api();

// Apply polyfills as needed
polyfills.apply();

// Apply embedded styles to document
//Styler.styleDocument();
