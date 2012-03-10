var VALID_PROPERTIES = [
  'highlightInline'
, 'highlightLanguage'
, 'highlightStyle'
];

var config = module.exports = function (properties) {
  var property;

  setProperties(properties);
};

var load = function () {
  var remarkjs = /remark(-\d\.\d(\.\d)?)?(\.min)?\.js/i
    , scriptElements = document.getElementsByTagName('script')
    , element
    , i;

  for (i = 0; i < scriptElements.length; ++i) {
    element = scriptElements[i];

    if (remarkjs.exec(element.src)) {
      loadConfigJson(element.innerHTML.trim()); 
      break;
    }
  }
};

var loadConfigJson = function (jsonStr) {
  var properties = {};

  if (jsonStr === '') {
    return;
  }
  
  try {
    properties = JSON.parse(jsonStr);
  }
  catch (err) {
    alert('Parsing of remark config failed! Be sure to use valid JSON.') 
  }

  setProperties(properties);
};

var setProperties = function (properties) {
  var i
    , property
    ;

  for (i = 0; i < VALID_PROPERTIES.length; ++i) {
    property = VALID_PROPERTIES[i];
    if (properties.hasOwnProperty(property)) {
        config[property] = properties[property];
    }
  }
};

load();
