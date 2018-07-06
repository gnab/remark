import Api from './remark/Api';
import polyfills from './polyfills';
import './remark.scss';
import './hljs.scss';

// Apply polyfills as needed
polyfills.apply();

// Expose API as `remark`
window.remark = new Api();