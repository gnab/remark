var config = module.exports = configure
  , api = require('./api')
  , dom = require('./dom')
  ;

var VALID_PROPERTIES = [
  'highlightInline'
, 'highlightLanguage'
, 'highlightStyle'
];

api.config = config;

loadConfigFromScriptTag();

function configure (properties) {
  setProperties(properties);
}

function loadConfigFromScriptTag () {
  var remarkjs = /remark(-\d\.\d(\.\d)?)?(\.min)?\.js/i
    , scriptElements = dom.getElementsByTagName('script')
    , element
    , i;

  for (i = 0; i < scriptElements.length; ++i) {
    element = scriptElements[i];

    if (remarkjs.exec(element.src)) {
      loadConfigFromJSON(element.innerHTML.trim()); 
      break;
    }
  }
}

function loadConfigFromJSON (jsonStr) {
  var properties = {};

  if (jsonStr === '') {
    return;
  }
  
  try {
    properties = JSON.parse(jsonStr);
  }
  catch (err) {
    alert('Parsing remark config failed! Be sure to use valid JSON.');
  }

  setProperties(properties);
}

function setProperties (properties) {
  var i
    , property
    ;

  for (i = 0; i < VALID_PROPERTIES.length; ++i) {
    property = VALID_PROPERTIES[i];
    if (properties.hasOwnProperty(property)) {
        config[property] = properties[property];
    }
  }
}
