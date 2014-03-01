exports.apply = function () {
  forEach([Array, window.NodeList, window.HTMLCollection], extend);
};

function forEach (list, f) {
  var i;

  for (i = 0; i < list.length; ++i) {
    f(list[i], i);
  }
}

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