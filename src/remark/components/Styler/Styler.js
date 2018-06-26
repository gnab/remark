import resources from '../../resources';

export default class Styler {
  // Locates the embedded remark stylesheet
  static getRemarkStylesheet() {
    for (let i = 0; i < document.styleSheets.length; ++i) {
      if (document.styleSheets[i].title === 'remark') {
        return document.styleSheets[i];
      }
    }
  }

  // Applies bundled styles to document
  static styleDocument() {
    // Bail out if document has already been styled
    if (Styler.getRemarkStylesheet()) {
      return;
    }

    let headElement = document.getElementsByTagName('head')[0];
    let styleElement = document.createElement('style');
    styleElement.type = 'text/css';

    // Set title in order to enable lookup
    styleElement.title = 'remark';

    // Set document styles
    styleElement.innerHTML = resources.documentStyles;

    // Append highlighting styles
    for (let style in resources.hljsStyles) {
      if (resources.hljsStyles.hasOwnProperty(style)) {
        styleElement.innerHTML += resources.hljsStyles[style];
      }
    }

    // Put element first to prevent overriding user styles
    headElement.insertBefore(styleElement, headElement.firstChild);
  }

  // Locates the CSS @page rule
  static getPageRule(stylesheet) {
    for (let i = 0; i < stylesheet.cssRules.length; ++i) {
      if (stylesheet.cssRules[i] instanceof window.CSSPageRule) {
        return stylesheet.cssRules[i];
      }
    }

    return null;
  }

  static setPageSize(size) {
    let pageRule = Styler.getPageRule(Styler.getRemarkStylesheet());

    if (pageRule !== null) {
      pageRule.style.size = size;
    }
  }
}