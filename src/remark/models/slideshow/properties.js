module.exports = Properties;

function Properties (events, defaults) {
  var self = this
    , properties = {};

  copyProperties(defaults || {}, properties);

  self.get = function (property) {
    return properties[property];
  };

  self.set = function (stringOrObject, value) {
    var changes = {};

    if (typeof stringOrObject === 'string') {
      changes[stringOrObject] = value;
    }
    else {
      changes = stringOrObject;
    }

    copyProperties(changes, properties);

    events.emit('propertiesChanged', changes);
  };

  function copyProperties (source, target) {
    var property;

    for (property in source) {
      if (source.hasOwnProperty(property)) {
        target[property] = source[property];
      }
    }
  }
}
