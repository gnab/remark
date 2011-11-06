!function () {

  var remark = context.remark = context.remark || {}
    , highlighter = remark.highlighter = {}
    ;

  var styles = {
    arta:           '/* bundle "vendor/highlight/styles/arta.css" */'
  , ascetic:        '/* bundle "vendor/highlight/styles/ascetic.css" */'
  , dark:           '/* bundle "vendor/highlight/styles/dark.css" */'
  , 'default':      '/* bundle "vendor/highlight/styles/default.css" */'
  , far:            '/* bundle "vendor/highlight/styles/far.css" */'
  , github:         '/* bundle "vendor/highlight/styles/github.css" */'
  , idea:           '/* bundle "vendor/highlight/styles/idea.css" */'
  , ir_black:       '/* bundle "vendor/highlight/styles/ir_black.css" */'
  , magula:         '/* bundle "vendor/highlight/styles/magula.css" */'
  , solarized_dark: '/* bundle "vendor/highlight/styles/solarized_dark.css" */'
  , solarized_light:'/* bundle "vendor/highlight/styles/solarized_light.css" */'
  , sunburst:       '/* bundle "vendor/highlight/styles/sunburst.css" */'
  , vs:             '/* bundle "vendor/highlight/styles/vs.css" */'
  , zenburn:        '/* bundle "vendor/highlight/styles/zenburn.css" */'
  };

  highlighter.cssForStyle = function () {
    var config = remark.config;

    if (config.highlightStyle === undefined) {
      config.highlightStyle = 'default';
    }

    if (config.highlightStyle === null) {
      return '';
    }

    return styles[config.highlightStyle];
  };

}(this);
