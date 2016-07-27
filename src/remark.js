var Api = require('./remark/api')
  , polyfills = require('./polyfills')
  , styler = require('./remark/components/styler/styler')
  ;

// Expose API as `remark`
window.remark = new Api();

// Apply polyfills as needed
polyfills.apply();

// Apply embedded styles to document
styler.styleDocument();
