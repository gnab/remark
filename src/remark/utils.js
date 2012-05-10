Array.prototype.each = Array.prototype.map || function (f) {
  var i;

  for (i = 0; i < this.length; ++i) {
    f(this[i]);
  }
};

Array.prototype.map = Array.prototype.map || function (f) {
  var i
    , result = []
    ;

  for (i = 0; i < this.length; ++i) {
    result.push(f(this[i]));
  }

  return result;
};
