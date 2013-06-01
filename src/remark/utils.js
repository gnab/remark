exports.addClass = function (element, className) {
  element.className = exports.getClasses(element)
    .concat([className])
    .join(' ');
};

exports.getClasses = function (element) {
  return element.className
    .split(' ')
    .filter(function (s) { return s !== ''; });
};

each([Array, window.NodeList], function (object) {
  var prototype = object && object.prototype;

  if (!prototype) {
    return;
  }

  prototype.each = prototype.each || function (f) {
    each(this, f);
  };

  prototype.filter = prototype.filter || function (f) {
    var result = [];

    this.each(function (element) {
      if (f(element, result.length)) {
        result.push(element);
      }
    });

    return result;
  };

  prototype.map = prototype.map || function (f) {
    var result = [];

    this.each(function (element) {
      result.push(f(element, result.length));
    });

    return result;
  };
});

function each (list, f) {
  var i;

  for (i = 0; i < list.length; ++i) {
    f(list[i], i);
  }
}
