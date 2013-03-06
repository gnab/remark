var events = require('./events')
  , properties = {}
  , config = module.exports = {
      get: get
    , set: set
    }
  ;

loadConfigFromScriptTag();

function get (property) {
  return properties[property];
}

function set (property, value) {
  var changes = {};

  if (typeof property === 'string') {
    properties[property] = value;
    changes[property] = value;
    events.emit('config', changes);
  }
  else {
    setProperties(property);
    events.emit('config', property);
  }
}

function setProperties (source) {
  var property;

  for (property in source) {
    properties[property] = source[property];
  }
}

function loadConfigFromScriptTag () {
  var remarkjs = /remark(-\d\.\d(\.\d)?)?(\.min)?\.js/i
    , scriptElements = document.getElementsByTagName('script')
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
