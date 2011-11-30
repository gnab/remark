!function (context) {

  var remark = context.remark = context.remark || {}
    , config
    ;

  config = remark.config = function (properties) {
    var property;

    for (property in properties) {
      if (properties.hasOwnProperty(property)) {
        config[property] = properties[property];
      }
    }
  };

  var load = function () {
    if (typeof RemarkConfig !== "undefined") {
      remark.config = RemarkConfig;
    }
    setDefaults();
  };

  var setDefaults = function() {
    if (!remark.config.hasOwnProperty('highlightInline')) {
      remark.config.highlightInline = false;
    }
  };

  load();

}(this);
