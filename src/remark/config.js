!function (remark) {

  var config = remark.config = remark.exports.config = function (properties) {
    var property;

    for (property in properties) {
      if (properties.hasOwnProperty(property)) {
        config[property] = properties[property];
      }
    }
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
    var json = {}
      , property;

    if (jsonStr === '') {
      return;
    }
    
    try {
      json = JSON.parse(jsonStr);
    }
    catch (err) {
      alert('Parsing of remark config failed! Be sure to use valid JSON.') 
    }

    config.highlightStyle = json.highlightStyle;
    config.highlightLanguage = json.highlightLanguage;
  };

  load();

}(remark);
