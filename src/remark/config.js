!function (context) {

  var remark = context.remark = context.remark || {}
    , config = remark.config = {}
    ;

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
