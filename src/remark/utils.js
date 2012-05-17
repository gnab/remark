Array.prototype.each = Array.prototype.each || function (f) {
  var i;

  for (i = 0; i < this.length; ++i) {
    f(this[i], i);
  }
};

Array.prototype.filter = Array.prototype.filter || function (f) {
  var result = [];

  this.each(function (element) {
    if (f(element, result.length)) {
      result.push(element);
    }
  });

  return result;
};

Array.prototype.map = Array.prototype.map || function (f) {
  var result = [];

  this.each(function (element) {
    result.push(f(element, result.length));
  });

  return result;
};
