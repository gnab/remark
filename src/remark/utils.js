exports.addClass = function (element, className) {
  element.className = exports.getClasses(element)
    .concat([className])
    .join(' ');
};

exports.toggleClass = function (element, className) {
  var classes = exports.getClasses(element),
      index = classes.indexOf(className);

  if (index !== -1) {
    classes.splice(index, 1);
  }
  else {
    classes.push(className);
  }

  element.className = classes.join(' ');
};

exports.getClasses = function (element) {
  return element.className
    .split(' ')
    .filter(function (s) { return s !== ''; });
};

forEach([Array, window.NodeList, window.HTMLCollection], extend);

function extend (object) {
  var prototype = object && object.prototype;

  if (!prototype) {
    return;
  }

  prototype.forEach = prototype.forEach || function (f) {
    forEach(this, f);
  };

  prototype.filter = prototype.filter || function (f) {
    var result = [];

    this.forEach(function (element) {
      if (f(element, result.length)) {
        result.push(element);
      }
    });

    return result;
  };

  prototype.map = prototype.map || function (f) {
    var result = [];

    this.forEach(function (element) {
      result.push(f(element, result.length));
    });

    return result;
  };
}

function forEach (list, f) {
  var i;

  for (i = 0; i < list.length; ++i) {
    f(list[i], i);
  }
}
