var Api = require('./remark/api')
  , highlighter = require('./remark/highlighter')
  , polyfills = require('./polyfills')
  , resources = require('./remark/resources')
  ;

// Expose API as `remark`
window.remark = new Api();

// Apply polyfills as needed
polyfills.apply();

// Apply embedded styles to document
styleDocument();

function styleDocument () {
  var styleElement = document.createElement('style')
    , headElement = document.getElementsByTagName('head')[0]
    , style
    ;

  styleElement.type = 'text/css';
  headElement.insertBefore(styleElement, headElement.firstChild);

  styleElement.innerHTML = resources.documentStyles;

  for (style in highlighter.styles) {
    if (highlighter.styles.hasOwnProperty(style)) {
      styleElement.innerHTML = styleElement.innerHTML +
        highlighter.styles[style];
    }
  }
}
