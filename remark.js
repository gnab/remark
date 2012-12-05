(function(){var require = function (file, cwd) {
    var resolved = require.resolve(file, cwd || '/');
    var mod = require.modules[resolved];
    if (!mod) throw new Error(
        'Failed to resolve module ' + file + ', tried ' + resolved
    );
    var cached = require.cache[resolved];
    var res = cached? cached.exports : mod();
    return res;
};

require.paths = [];
require.modules = {};
require.cache = {};
require.extensions = [".js",".coffee",".json"];

require._core = {
    'assert': true,
    'events': true,
    'fs': true,
    'path': true,
    'vm': true
};

require.resolve = (function () {
    return function (x, cwd) {
        if (!cwd) cwd = '/';
        
        if (require._core[x]) return x;
        var path = require.modules.path();
        cwd = path.resolve('/', cwd);
        var y = cwd || '/';
        
        if (x.match(/^(?:\.\.?\/|\/)/)) {
            var m = loadAsFileSync(path.resolve(y, x))
                || loadAsDirectorySync(path.resolve(y, x));
            if (m) return m;
        }
        
        var n = loadNodeModulesSync(x, y);
        if (n) return n;
        
        throw new Error("Cannot find module '" + x + "'");
        
        function loadAsFileSync (x) {
            x = path.normalize(x);
            if (require.modules[x]) {
                return x;
            }
            
            for (var i = 0; i < require.extensions.length; i++) {
                var ext = require.extensions[i];
                if (require.modules[x + ext]) return x + ext;
            }
        }
        
        function loadAsDirectorySync (x) {
            x = x.replace(/\/+$/, '');
            var pkgfile = path.normalize(x + '/package.json');
            if (require.modules[pkgfile]) {
                var pkg = require.modules[pkgfile]();
                var b = pkg.browserify;
                if (typeof b === 'object' && b.main) {
                    var m = loadAsFileSync(path.resolve(x, b.main));
                    if (m) return m;
                }
                else if (typeof b === 'string') {
                    var m = loadAsFileSync(path.resolve(x, b));
                    if (m) return m;
                }
                else if (pkg.main) {
                    var m = loadAsFileSync(path.resolve(x, pkg.main));
                    if (m) return m;
                }
            }
            
            return loadAsFileSync(x + '/index');
        }
        
        function loadNodeModulesSync (x, start) {
            var dirs = nodeModulesPathsSync(start);
            for (var i = 0; i < dirs.length; i++) {
                var dir = dirs[i];
                var m = loadAsFileSync(dir + '/' + x);
                if (m) return m;
                var n = loadAsDirectorySync(dir + '/' + x);
                if (n) return n;
            }
            
            var m = loadAsFileSync(x);
            if (m) return m;
        }
        
        function nodeModulesPathsSync (start) {
            var parts;
            if (start === '/') parts = [ '' ];
            else parts = path.normalize(start).split('/');
            
            var dirs = [];
            for (var i = parts.length - 1; i >= 0; i--) {
                if (parts[i] === 'node_modules') continue;
                var dir = parts.slice(0, i + 1).join('/') + '/node_modules';
                dirs.push(dir);
            }
            
            return dirs;
        }
    };
})();

require.alias = function (from, to) {
    var path = require.modules.path();
    var res = null;
    try {
        res = require.resolve(from + '/package.json', '/');
    }
    catch (err) {
        res = require.resolve(from, '/');
    }
    var basedir = path.dirname(res);
    
    var keys = (Object.keys || function (obj) {
        var res = [];
        for (var key in obj) res.push(key);
        return res;
    })(require.modules);
    
    for (var i = 0; i < keys.length; i++) {
        var key = keys[i];
        if (key.slice(0, basedir.length + 1) === basedir + '/') {
            var f = key.slice(basedir.length);
            require.modules[to + f] = require.modules[basedir + f];
        }
        else if (key === basedir) {
            require.modules[to] = require.modules[basedir];
        }
    }
};

(function () {
    var process = {};
    var global = typeof window !== 'undefined' ? window : {};
    var definedProcess = false;
    
    require.define = function (filename, fn) {
        if (!definedProcess && require.modules.__browserify_process) {
            process = require.modules.__browserify_process();
            definedProcess = true;
        }
        
        var dirname = require._core[filename]
            ? ''
            : require.modules.path().dirname(filename)
        ;
        
        var require_ = function (file) {
            var requiredModule = require(file, dirname);
            var cached = require.cache[require.resolve(file, dirname)];

            if (cached && cached.parent === null) {
                cached.parent = module_;
            }

            return requiredModule;
        };
        require_.resolve = function (name) {
            return require.resolve(name, dirname);
        };
        require_.modules = require.modules;
        require_.define = require.define;
        require_.cache = require.cache;
        var module_ = {
            id : filename,
            filename: filename,
            exports : {},
            loaded : false,
            parent: null
        };
        
        require.modules[filename] = function () {
            require.cache[filename] = module_;
            fn.call(
                module_.exports,
                require_,
                module_,
                module_.exports,
                dirname,
                filename,
                process,
                global
            );
            module_.loaded = true;
            return module_.exports;
        };
    };
})();


require.define("path",function(require,module,exports,__dirname,__filename,process,global){function filter (xs, fn) {
    var res = [];
    for (var i = 0; i < xs.length; i++) {
        if (fn(xs[i], i, xs)) res.push(xs[i]);
    }
    return res;
}

// resolves . and .. elements in a path array with directory names there
// must be no slashes, empty elements, or device names (c:\) in the array
// (so also no leading and trailing slashes - it does not distinguish
// relative and absolute paths)
function normalizeArray(parts, allowAboveRoot) {
  // if the path tries to go above the root, `up` ends up > 0
  var up = 0;
  for (var i = parts.length; i >= 0; i--) {
    var last = parts[i];
    if (last == '.') {
      parts.splice(i, 1);
    } else if (last === '..') {
      parts.splice(i, 1);
      up++;
    } else if (up) {
      parts.splice(i, 1);
      up--;
    }
  }

  // if the path is allowed to go above the root, restore leading ..s
  if (allowAboveRoot) {
    for (; up--; up) {
      parts.unshift('..');
    }
  }

  return parts;
}

// Regex to split a filename into [*, dir, basename, ext]
// posix version
var splitPathRe = /^(.+\/(?!$)|\/)?((?:.+?)?(\.[^.]*)?)$/;

// path.resolve([from ...], to)
// posix version
exports.resolve = function() {
var resolvedPath = '',
    resolvedAbsolute = false;

for (var i = arguments.length; i >= -1 && !resolvedAbsolute; i--) {
  var path = (i >= 0)
      ? arguments[i]
      : process.cwd();

  // Skip empty and invalid entries
  if (typeof path !== 'string' || !path) {
    continue;
  }

  resolvedPath = path + '/' + resolvedPath;
  resolvedAbsolute = path.charAt(0) === '/';
}

// At this point the path should be resolved to a full absolute path, but
// handle relative paths to be safe (might happen when process.cwd() fails)

// Normalize the path
resolvedPath = normalizeArray(filter(resolvedPath.split('/'), function(p) {
    return !!p;
  }), !resolvedAbsolute).join('/');

  return ((resolvedAbsolute ? '/' : '') + resolvedPath) || '.';
};

// path.normalize(path)
// posix version
exports.normalize = function(path) {
var isAbsolute = path.charAt(0) === '/',
    trailingSlash = path.slice(-1) === '/';

// Normalize the path
path = normalizeArray(filter(path.split('/'), function(p) {
    return !!p;
  }), !isAbsolute).join('/');

  if (!path && !isAbsolute) {
    path = '.';
  }
  if (path && trailingSlash) {
    path += '/';
  }
  
  return (isAbsolute ? '/' : '') + path;
};


// posix version
exports.join = function() {
  var paths = Array.prototype.slice.call(arguments, 0);
  return exports.normalize(filter(paths, function(p, index) {
    return p && typeof p === 'string';
  }).join('/'));
};


exports.dirname = function(path) {
  var dir = splitPathRe.exec(path)[1] || '';
  var isWindows = false;
  if (!dir) {
    // No dirname
    return '.';
  } else if (dir.length === 1 ||
      (isWindows && dir.length <= 3 && dir.charAt(1) === ':')) {
    // It is just a slash or a drive letter with a slash
    return dir;
  } else {
    // It is a full dirname, strip trailing slash
    return dir.substring(0, dir.length - 1);
  }
};


exports.basename = function(path, ext) {
  var f = splitPathRe.exec(path)[2] || '';
  // TODO: make this comparison case-insensitive on windows?
  if (ext && f.substr(-1 * ext.length) === ext) {
    f = f.substr(0, f.length - ext.length);
  }
  return f;
};


exports.extname = function(path) {
  return splitPathRe.exec(path)[3] || '';
};

});

require.define("__browserify_process",function(require,module,exports,__dirname,__filename,process,global){var process = module.exports = {};

process.nextTick = (function () {
    var canSetImmediate = typeof window !== 'undefined'
        && window.setImmediate;
    var canPost = typeof window !== 'undefined'
        && window.postMessage && window.addEventListener
    ;

    if (canSetImmediate) {
        return window.setImmediate;
    }

    if (canPost) {
        var queue = [];
        window.addEventListener('message', function (ev) {
            if (ev.source === window && ev.data === 'browserify-tick') {
                ev.stopPropagation();
                if (queue.length > 0) {
                    var fn = queue.shift();
                    fn();
                }
            }
        }, true);

        return function nextTick(fn) {
            queue.push(fn);
            window.postMessage('browserify-tick', '*');
        };
    }

    return function nextTick(fn) {
        setTimeout(fn, 0);
    };
})();

process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];

process.binding = function (name) {
    if (name === 'evals') return (require)('vm')
    else throw new Error('No such module. (Possibly not yet loaded)')
};

(function () {
    var cwd = '/';
    var path;
    process.cwd = function () { return cwd };
    process.chdir = function (dir) {
        if (!path) path = require('path');
        cwd = path.resolve(dir, cwd);
    };
})();

});

require.define("/src/remark.js",function(require,module,exports,__dirname,__filename,process,global){var utils = require('./remark/utils')
  , api = require('./remark/api')
  , dom = require('./remark/dom')
  , Controller = require('./remark/controller').Controller
  , dispatcher = require('./remark/dispatcher')
  , highlighter = require('./remark/highlighter')
  , Slideshow = require('./remark/models/slideshow').Slideshow
  , SlideshowView = require('./remark/views/slideshowView').SlideshowView
  , resources = require('./remark/resources')
  ;

dom.exports.remark = api;

dom.on('load', function () {
  var sourceElement = dom.getElementById('source')
    , slideshowElement = dom.getElementById('slideshow')
    ;

  if (!assureElementsExist(sourceElement, slideshowElement)) {
    return;
  }

  sourceElement.style.display = 'none';

  styleDocument();
  setupSlideshow(sourceElement, slideshowElement);

  api.emit('ready');
});

function assureElementsExist (sourceElement, slideshowElement) {
  if (!sourceElement) {
    dom.alert('remark error: source element not present.');
    return false;
  }

  if (!slideshowElement) {
    dom.alert('remark error: slideshow element not present.');
    return false;
  }

  return true;
}

function styleDocument () {
  var styleElement = dom.createElement('style')
    , headElement = dom.getElementsByTagName('head')[0]
    ;

  styleElement.type = 'text/css';
  styleElement.innerHTML = resources.documentStyles;
  styleElement.innerHTML += highlighter.cssForStyle();

  headElement.insertBefore(styleElement, headElement.firstChild);
}

function setupSlideshow (sourceElement, slideshowElement) {
  var source = sourceElement.innerHTML
    , slideshow
    , slideshowView
    , controller
    ;

  slideshow = new Slideshow(source);
  slideshowView = new SlideshowView(slideshow, slideshowElement);
  controller = new Controller(slideshow);

  dispatcher.initialize();
}

});

require.define("/src/remark/utils.js",function(require,module,exports,__dirname,__filename,process,global){Array.prototype.each = Array.prototype.each || function (f) {
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

});

require.define("/src/remark/api.js",function(require,module,exports,__dirname,__filename,process,global){var EventEmitter = require('events').EventEmitter
  , api = module.exports = new EventEmitter()
  ;

});

require.define("events",function(require,module,exports,__dirname,__filename,process,global){if (!process.EventEmitter) process.EventEmitter = function () {};

var EventEmitter = exports.EventEmitter = process.EventEmitter;
var isArray = typeof Array.isArray === 'function'
    ? Array.isArray
    : function (xs) {
        return Object.prototype.toString.call(xs) === '[object Array]'
    }
;

// By default EventEmitters will print a warning if more than
// 10 listeners are added to it. This is a useful default which
// helps finding memory leaks.
//
// Obviously not all Emitters should be limited to 10. This function allows
// that to be increased. Set to zero for unlimited.
var defaultMaxListeners = 10;
EventEmitter.prototype.setMaxListeners = function(n) {
  if (!this._events) this._events = {};
  this._events.maxListeners = n;
};


EventEmitter.prototype.emit = function(type) {
  // If there is no 'error' event listener then throw.
  if (type === 'error') {
    if (!this._events || !this._events.error ||
        (isArray(this._events.error) && !this._events.error.length))
    {
      if (arguments[1] instanceof Error) {
        throw arguments[1]; // Unhandled 'error' event
      } else {
        throw new Error("Uncaught, unspecified 'error' event.");
      }
      return false;
    }
  }

  if (!this._events) return false;
  var handler = this._events[type];
  if (!handler) return false;

  if (typeof handler == 'function') {
    switch (arguments.length) {
      // fast cases
      case 1:
        handler.call(this);
        break;
      case 2:
        handler.call(this, arguments[1]);
        break;
      case 3:
        handler.call(this, arguments[1], arguments[2]);
        break;
      // slower
      default:
        var args = Array.prototype.slice.call(arguments, 1);
        handler.apply(this, args);
    }
    return true;

  } else if (isArray(handler)) {
    var args = Array.prototype.slice.call(arguments, 1);

    var listeners = handler.slice();
    for (var i = 0, l = listeners.length; i < l; i++) {
      listeners[i].apply(this, args);
    }
    return true;

  } else {
    return false;
  }
};

// EventEmitter is defined in src/node_events.cc
// EventEmitter.prototype.emit() is also defined there.
EventEmitter.prototype.addListener = function(type, listener) {
  if ('function' !== typeof listener) {
    throw new Error('addListener only takes instances of Function');
  }

  if (!this._events) this._events = {};

  // To avoid recursion in the case that type == "newListeners"! Before
  // adding it to the listeners, first emit "newListeners".
  this.emit('newListener', type, listener);

  if (!this._events[type]) {
    // Optimize the case of one listener. Don't need the extra array object.
    this._events[type] = listener;
  } else if (isArray(this._events[type])) {

    // Check for listener leak
    if (!this._events[type].warned) {
      var m;
      if (this._events.maxListeners !== undefined) {
        m = this._events.maxListeners;
      } else {
        m = defaultMaxListeners;
      }

      if (m && m > 0 && this._events[type].length > m) {
        this._events[type].warned = true;
        console.error('(node) warning: possible EventEmitter memory ' +
                      'leak detected. %d listeners added. ' +
                      'Use emitter.setMaxListeners() to increase limit.',
                      this._events[type].length);
        console.trace();
      }
    }

    // If we've already got an array, just append.
    this._events[type].push(listener);
  } else {
    // Adding the second element, need to change to array.
    this._events[type] = [this._events[type], listener];
  }

  return this;
};

EventEmitter.prototype.on = EventEmitter.prototype.addListener;

EventEmitter.prototype.once = function(type, listener) {
  var self = this;
  self.on(type, function g() {
    self.removeListener(type, g);
    listener.apply(this, arguments);
  });

  return this;
};

EventEmitter.prototype.removeListener = function(type, listener) {
  if ('function' !== typeof listener) {
    throw new Error('removeListener only takes instances of Function');
  }

  // does not use listeners(), so no side effect of creating _events[type]
  if (!this._events || !this._events[type]) return this;

  var list = this._events[type];

  if (isArray(list)) {
    var i = list.indexOf(listener);
    if (i < 0) return this;
    list.splice(i, 1);
    if (list.length == 0)
      delete this._events[type];
  } else if (this._events[type] === listener) {
    delete this._events[type];
  }

  return this;
};

EventEmitter.prototype.removeAllListeners = function(type) {
  // does not use listeners(), so no side effect of creating _events[type]
  if (type && this._events && this._events[type]) this._events[type] = null;
  return this;
};

EventEmitter.prototype.listeners = function(type) {
  if (!this._events) this._events = {};
  if (!this._events[type]) this._events[type] = [];
  if (!isArray(this._events[type])) {
    this._events[type] = [this._events[type]];
  }
  return this._events[type];
};

});

require.define("/src/remark/dom.js",function(require,module,exports,__dirname,__filename,process,global){var EventEmitter = require('events').EventEmitter
  , dom = module.exports = new EventEmitter()
  ;

dom.window = proxyObject('window');
dom.document = proxyObject('document');

dom.exports = dom.window;

proxyFunction(dom.window, 'alert');
proxyFunction(dom.document, 'createElement');
proxyFunction(dom.document, 'getElementById');
proxyFunction(dom.document, 'getElementsByTagName');

proxyEvent(dom.window, 'load');
proxyEvent(dom.window, 'resize');
proxyEvent(dom.window, 'keydown');
proxyEvent(dom.window, 'hashchange');
proxyEvent(dom.document, 'touchstart');
proxyEvent(dom.document, 'touchend');
proxyEvent(dom.document, 'touchmove');
proxyEvent(dom.document, 'mousewheel');

dom.on('load', updateDimensions);
dom.on('resize', updateDimensions);

function proxyObject (objectName) {
  var object;

  if (typeof this[objectName] !== 'undefined') {
    object = this[objectName];
  }
  else {
    object = new EventEmitter();
    object.addEventListener = object.on;

    if (objectName === 'window') {
      object.location = {};
    }
  }

  return object;
}

function proxyFunction (element, func) {
  if (typeof element[func] === 'function') {
    dom[func] = function () { return element[func].apply(element, arguments); };
  }
  else {
    if (['createElement', 'getElementById'].indexOf(func) !== -1) {
      dom[func] = function () {
        return {
          style: {}
        , appendChild: function () { }
        , getElementsByTagName: function () {
            return [{
              parentNode: {
                nodeName: ''
              }
            , childNodes: []
            , className: ''
            }];
          }
        , innerHTML: ''
        , childNodes: [{nodeValue: ''}]
        };
      };
    }
    else if (func === 'getElementsByTagName') {
      dom[func] = function () {
        return [{
          insertBefore: function () {}
        }];
      };
    }
    else {
      dom[func] = function () { return {}; };
    }
  }
}

function proxyEvent (element, eventName) {
  element.addEventListener(eventName, function (event) {
    dom.emit(eventName, event);
  });
}

function updateDimensions () {
  dom.innerHeight = dom.window.innerHeight;
  dom.innerWidth = dom.window.innerWidth;
}

});

require.define("/src/remark/controller.js",function(require,module,exports,__dirname,__filename,process,global){var dispatcher = require('./dispatcher')
  , dom = require('./dom')
  ;

exports.Controller = Controller;

function Controller (slideshow) {
  var currentSlideNo = 0;

  dispatcher.on('gotoSlide', function (slideNoOrName) {
    gotoSlide(slideshow, slideNoOrName);
  });

  dispatcher.on('gotoPreviousSlide', function() {
    gotoSlide(slideshow, currentSlideNo - 1);
  });

  dispatcher.on('gotoNextSlide', function() {
    gotoSlide(slideshow, currentSlideNo + 1);
  });

  function gotoSlide (slideshow, slideNoOrName) {
    var slideNo = getSlideNo(slideNoOrName)
      , alreadyOnSlide = slideNo === currentSlideNo
      , slideOutOfRange = slideNo < 1 || slideNo > slideshow.getSlideCount()
      ;

    if (alreadyOnSlide || slideOutOfRange) {
      return;
    }

    if (currentSlideNo !== 0) {
      dispatcher.emit('hideSlide', currentSlideNo - 1);
    }

    dispatcher.emit('showSlide', slideNo - 1);

    currentSlideNo = slideNo;

    dom.window.location.hash = slideNoOrName;
  }

  function getSlideNo (slideNoOrName) {
    var slideNo
      , slide
      ;

    if (typeof slideNoOrName === 'number') {
      return slideNoOrName;
    }

    if ((slideNo = parseInt(slideNoOrName, 10)).toString() === slideNoOrName) {
      return slideNo;
    }

    if ((slide = slideshow.getSlideByName(slideNoOrName))) {
      return slide.index + 1;
    }

    return 1;
  }
}

});

require.define("/src/remark/dispatcher.js",function(require,module,exports,__dirname,__filename,process,global){var EventEmitter = require('events').EventEmitter
  , dispatcher = module.exports = new EventEmitter()
  , dom = require('./dom')
  ;

dispatcher.initialize = function () {
  mapHash();
  mapKeys();
  mapTouches();
  mapWheel();
};

function mapHash () {
  dom.on('hashchange', navigate);
  navigate();

  function navigate () {
    var slideNoOrName = (dom.window.location.hash || '').substr(1);

    gotoSlide(slideNoOrName);
  }
}

function mapKeys () {
  dom.on('keydown', function (event) {
    switch (event.keyCode) {
      case 33: // Page up
      case 37: // Left
      case 38: // Up
      case 75: // k
        gotoPreviousSlide();
        break;
      case 32: // Space
      case 34: // Page down
      case 39: // Right
      case 40: // Down
      case 74: // j
        gotoNextSlide();
        break;
    }
  });
}

function mapTouches () {
  var touch
    , startX
    , endX
    ;

  var isTap = function () {
    return Math.abs(startX - endX) < 10;
  };

  var handleTap = function () {
    if (endX < dom.innerWidth / 2) {
      gotoPreviousSlide();
    }
    else {
      gotoNextSlide();
    }
  };

  var handleSwipe = function () {
    if (startX > endX) {
      gotoNextSlide();
    }
    else {
      gotoPreviousSlide();
    }
  };

  dom.on('touchstart', function (event) {
    touch = event.touches[0];
    startX = touch.clientX;
  });

  dom.on('touchend', function (event) {
    if (event.target.nodeName.toUpperCase() === 'A') {
      return;
    }

    touch = event.changedTouches[0];
    endX = touch.clientX;

    if (isTap()) {
      handleTap();
    }
    else {
      handleSwipe();
    }
  });

  dom.on('touchmove', function (event) {
    event.preventDefault();
  });
}

function mapWheel () {
  dom.on('mousewheel', function (event) {
    if (event.wheelDeltaY > 0) {
      gotoPreviousSlide();
    }
    else if (event.wheelDeltaY < 0) {
      gotoNextSlide();
    }
  });
}

function gotoSlide (slideNoOrName) {
  dispatcher.emit('gotoSlide', slideNoOrName);
}

function gotoNextSlide () {
  dispatcher.emit('gotoNextSlide');
}

function gotoPreviousSlide () {
  dispatcher.emit('gotoPreviousSlide');
}

});

require.define("/src/remark/highlighter.js",function(require,module,exports,__dirname,__filename,process,global){var api = require('./api')
  , config = require('./config')
  , resources = require('./resources')

  , highlighter = module.exports = {}
  ;

api.highlighter = {
  engine: function() {
    return resources.highlighter.engine;
  }
};

highlighter.cssForStyle = function () {
  if (config.highlightStyle === undefined) {
    config.highlightStyle = 'default';
  }

  if (config.highlightStyle === null) {
    return '';
  }

  return resources.highlighter.styles[config.highlightStyle];
};

highlighter.highlightCodeBlocks = function (content) {
  var codeBlocks = content.getElementsByTagName('code')
    , block
    , i
    ;

  for (i = 0; i < codeBlocks.length; i++) {
    block = codeBlocks[i];

    resources.highlighter.engine.highlightBlock(block, '  ');
  }
};

});

require.define("/src/remark/config.js",function(require,module,exports,__dirname,__filename,process,global){var config = module.exports = configure
  , api = require('./api')
  , dom = require('./dom')
  ;

var VALID_PROPERTIES = [
  'highlightInline'
, 'highlightLanguage'
, 'highlightStyle'
];

api.config = config;

loadConfigFromScriptTag();

function configure (properties) {
  setProperties(properties);
}

function loadConfigFromScriptTag () {
  var remarkjs = /remark(-\d\.\d(\.\d)?)?(\.min)?\.js/i
    , scriptElements = dom.getElementsByTagName('script')
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
    dom.alert('Parsing remark config failed! Be sure to use valid JSON.');
  }

  setProperties(properties);
}

function setProperties (properties) {
  var i
    , property
    ;

  for (i = 0; i < VALID_PROPERTIES.length; ++i) {
    property = VALID_PROPERTIES[i];
    if (properties.hasOwnProperty(property)) {
        config[property] = properties[property];
    }
  }
}

});

require.define("/src/remark/resources.js",function(require,module,exports,__dirname,__filename,process,global){/* Automatically generated */

module.exports = {"documentStyles":"html,body{background:#d7d7d7;font-family:Georgia;font-size:20px;overflow:hidden;}#slideshow{background:#fff;overflow:hidden;position:absolute;-webkit-transform-origin:top left;-moz-transform-origin:top left;transform-origin:top-left;-moz-box-shadow:0 0 30px #888;-webkit-box-shadow:0 0 30px #888;box-shadow:0 0 30px #888;}#slideshow .slide{height:100%;width:100%;}#slideshow .slide>.left{text-align:left;}#slideshow .slide>.center{text-align:center;}#slideshow .slide>.right{text-align:right;}#slideshow .slide>.top{vertical-align:top;}#slideshow .slide>.middle{vertical-align:middle;}#slideshow .slide>.bottom{vertical-align:bottom;}#slideshow .slide .content{display:table-cell;padding:1em 4em 1em 4em;}#slideshow .slide .content .left{display:block;text-align:left;}#slideshow .slide .content .center{display:block;text-align:center;}#slideshow .slide .content .right{display:block;text-align:right;}#slideshow .slide .content pre,#slideshow .slide .content code{font-family:Monaco, monospace;font-size:16px;}#slideshow .slide .content h1 code{font-size:0.8em;}#slideshow .position{bottom:12px;opacity:0.5;position:absolute;right:20px;}li>code,p>code{padding:1px 4px;}","highlighter":{"styles":{"far":"pre code{display:block;padding:0.5em;background:#000080;}pre code,pre .subst{color:#0FF;}pre .string,pre .ruby .string,pre .haskell .type,pre .tag .value,pre .css .rules .value,pre .css .rules .value .number,pre .preprocessor,pre .ruby .symbol,pre .ruby .symbol .string,pre .built_in,pre .sql .aggregate,pre .django .template_tag,pre .django .variable,pre .smalltalk .class,pre .addition,pre .apache .tag,pre .apache .cbracket,pre .tex .command,pre .clojure .title{color:#FF0;}pre .keyword,pre .css .id,pre .title,pre .haskell .type,pre .vbscript .built_in,pre .sql .aggregate,pre .rsl .built_in,pre .smalltalk .class,pre .xml .tag .title,pre .winutils,pre .flow,pre .change,pre .envvar,pre .bash .variable,pre .tex .special,pre .clojure .built_in{color:#FFF;}pre .comment,pre .phpdoc,pre .javadoc,pre .java .annotation,pre .template_comment,pre .deletion,pre .apache .sqbracket,pre .tex .formula{color:#888;}pre .number,pre .date,pre .regexp,pre .literal,pre .smalltalk .symbol,pre .smalltalk .char,pre .clojure .attribute{color:#0F0;}pre .python .decorator,pre .django .filter .argument,pre .smalltalk .localvars,pre .smalltalk .array,pre .attr_selector,pre .pseudo,pre .xml .pi,pre .diff .header,pre .chunk,pre .shebang,pre .nginx .built_in,pre .input_number{color:#008080;}pre .keyword,pre .css .id,pre .title,pre .haskell .type,pre .vbscript .built_in,pre .sql .aggregate,pre .rsl .built_in,pre .smalltalk .class,pre .winutils,pre .flow,pre .apache .tag,pre .nginx .built_in,pre .tex .command,pre .tex .special,pre .request,pre .status{font-weight:bold;}","dark":"pre code{display:block;padding:0.5em;background:#444;}pre .keyword,pre .literal,pre .change,pre .winutils,pre .flow,pre .lisp .title,pre .clojure .built_in,pre .nginx .title,pre .tex .special{color:white;}pre code,pre .subst{color:#DDD;}pre .string,pre .title,pre .haskell .type,pre .ini .title,pre .tag .value,pre .css .rules .value,pre .preprocessor,pre .ruby .symbol,pre .ruby .symbol .string,pre .ruby .class .parent,pre .built_in,pre .sql .aggregate,pre .django .template_tag,pre .django .variable,pre .smalltalk .class,pre .javadoc,pre .ruby .string,pre .django .filter .argument,pre .smalltalk .localvars,pre .smalltalk .array,pre .attr_selector,pre .pseudo,pre .addition,pre .stream,pre .envvar,pre .apache .tag,pre .apache .cbracket,pre .tex .command,pre .input_number{color:#D88;}pre .comment,pre .java .annotation,pre .python .decorator,pre .template_comment,pre .pi,pre .doctype,pre .deletion,pre .shebang,pre .apache .sqbracket,pre .tex .formula{color:#777;}pre .keyword,pre .literal,pre .title,pre .css .id,pre .phpdoc,pre .haskell .type,pre .vbscript .built_in,pre .sql .aggregate,pre .rsl .built_in,pre .smalltalk .class,pre .diff .header,pre .chunk,pre .winutils,pre .bash .variable,pre .apache .tag,pre .tex .special,pre .request,pre .status{font-weight:bold;}pre .coffeescript .javascript,pre .javascript .xml,pre .tex .formula,pre .xml .javascript,pre .xml .vbscript,pre .xml .css,pre .xml .cdata{opacity:0.5;}","ascetic":"pre code{display:block;padding:0.5em;background:white;color:black;}pre .string,pre .tag .value,pre .filter .argument,pre .addition,pre .change,pre .apache .tag,pre .apache .cbracket,pre .nginx .built_in,pre .tex .formula{color:#888;}pre .comment,pre .template_comment,pre .shebang,pre .doctype,pre .pi,pre .javadoc,pre .deletion,pre .apache .sqbracket{color:#CCC;}pre .keyword,pre .tag .title,pre .ini .title,pre .lisp .title,pre .clojure .title,pre .http .title,pre .nginx .title,pre .css .tag,pre .winutils,pre .flow,pre .apache .tag,pre .tex .command,pre .request,pre .status{font-weight:bold;}","googlecode":"pre code{display:block;padding:0.5em;background:white;color:black;}pre .comment,pre .template_comment,pre .javadoc,pre .comment *{color:#800;}pre .keyword,pre .method,pre .list .title,pre .clojure .built_in,pre .nginx .title,pre .tag .title,pre .setting .value,pre .winutils,pre .tex .command,pre .http .title,pre .request,pre .status{color:#008;}pre .envvar,pre .tex .special{color:#660;}pre .string,pre .tag .value,pre .cdata,pre .filter .argument,pre .attr_selector,pre .apache .cbracket,pre .date,pre .regexp{color:#080;}pre .sub .identifier,pre .pi,pre .tag,pre .tag .keyword,pre .decorator,pre .ini .title,pre .shebang,pre .input_number,pre .hexcolor,pre .rules .value,pre .css .value .number,pre .literal,pre .symbol,pre .ruby .symbol .string,pre .number,pre .css .function,pre .clojure .attribute{color:#066;}pre .class .title,pre .haskell .type,pre .smalltalk .class,pre .javadoctag,pre .yardoctag,pre .phpdoc,pre .typename,pre .tag .attribute,pre .doctype,pre .class .id,pre .built_in,pre .setting,pre .params,pre .variable,pre .clojure .title{color:#606;}pre .css .tag,pre .rules .property,pre .pseudo,pre .subst{color:#000;}pre .css .class,pre .css .id{color:#9B703F;}pre .value .important{color:#ff7700;font-weight:bold;}pre .rules .keyword{color:#C5AF75;}pre .annotation,pre .apache .sqbracket,pre .nginx .built_in{color:#9B859D;}pre .preprocessor,pre .preprocessor *{color:#444;}pre .tex .formula{background-color:#EEE;font-style:italic;}pre .diff .header,pre .chunk{color:#808080;font-weight:bold;}pre .diff .change{background-color:#BCCFF9;}pre .addition{background-color:#BAEEBA;}pre .deletion{background-color:#FFC8BD;}pre .comment .yardoctag{font-weight:bold;}","solarized_light":"pre code{display:block;padding:0.5em;background:#fdf6e3;color:#657b83;}pre .comment,pre .template_comment,pre .diff .header,pre .doctype,pre .pi,pre .lisp .string,pre .javadoc{color:#93a1a1;font-style:italic;}pre .keyword,pre .winutils,pre .method,pre .addition,pre .css .tag,pre .request,pre .status,pre .nginx .title{color:#859900;}pre .number,pre .command,pre .string,pre .tag .value,pre .phpdoc,pre .tex .formula,pre .regexp,pre .hexcolor{color:#2aa198;}pre .title,pre .localvars,pre .chunk,pre .decorator,pre .built_in,pre .identifier,pre .vhdl .literal,pre .id{color:#268bd2;}pre .attribute,pre .variable,pre .lisp .body,pre .smalltalk .number,pre .constant,pre .class .title,pre .parent,pre .haskell .type{color:#b58900;}pre .preprocessor,pre .preprocessor .keyword,pre .shebang,pre .symbol,pre .symbol .string,pre .diff .change,pre .special,pre .attr_selector,pre .important,pre .subst,pre .cdata,pre .clojure .title{color:#cb4b16;}pre .deletion{color:#dc322f;}pre .tex .formula{background:#eee8d5;}","github":"pre code{display:block;padding:0.5em;color:#333;background:#f8f8ff;}pre .comment,pre .template_comment,pre .diff .header,pre .javadoc{color:#998;font-style:italic;}pre .keyword,pre .css .rule .keyword,pre .winutils,pre .javascript .title,pre .nginx .title,pre .subst,pre .request,pre .status{color:#333;font-weight:bold;}pre .number,pre .hexcolor,pre .ruby .constant{color:#099;}pre .string,pre .tag .value,pre .phpdoc,pre .tex .formula{color:#dd1144;}pre .title,pre .id{color:#900;font-weight:bold;}pre .javascript .title,pre .lisp .title,pre .clojure .title,pre .subst{font-weight:normal;}pre .class .title,pre .haskell .type,pre .vhdl .literal,pre .tex .command{color:#458;font-weight:bold;}pre .tag,pre .tag .title,pre .rules .property,pre .django .tag .keyword{color:#000080;font-weight:normal;}pre .attribute,pre .variable,pre .lisp .body{color:#008080;}pre .regexp{color:#009926;}pre .class{color:#458;font-weight:bold;}pre .symbol,pre .ruby .symbol .string,pre .lisp .keyword,pre .tex .special,pre .input_number{color:#990073;}pre .built_in,pre .lisp .title,pre .clojure .built_in{color:#0086b3;}pre .preprocessor,pre .pi,pre .doctype,pre .shebang,pre .cdata{color:#999;font-weight:bold;}pre .deletion{background:#ffdddd;}pre .addition{background:#ddffdd;}pre .diff .change{background:#0086b3;}pre .chunk{color:#aaaaaa;}","tomorrow-night":".tomorrow-comment,pre .comment,pre .title{color:#969896;}.tomorrow-red,pre .variable,pre .attribute,pre .tag,pre .regexp,pre .ruby .constant,pre .xml .tag .title,pre .xml .pi,pre .xml .doctype,pre .html .doctype,pre .css .id,pre .css .class,pre .css .pseudo{color:#cc6666;}.tomorrow-orange,pre .number,pre .preprocessor,pre .built_in,pre .literal,pre .params,pre .constant{color:#de935f;}.tomorrow-yellow,pre .class,pre .ruby .class .title,pre .css .rules .attribute{color:#f0c674;}.tomorrow-green,pre .string,pre .value,pre .inheritance,pre .header,pre .ruby .symbol,pre .xml .cdata{color:#b5bd68;}.tomorrow-aqua,pre .css .hexcolor{color:#8abeb7;}.tomorrow-blue,pre .function,pre .python .decorator,pre .python .title,pre .ruby .function .title,pre .ruby .title .keyword,pre .perl .sub,pre .javascript .title,pre .coffeescript .title{color:#81a2be;}.tomorrow-purple,pre .keyword,pre .javascript .function{color:#b294bb;}pre code{display:block;background:#1d1f21;color:#c5c8c6;padding:0.5em;}pre .coffeescript .javascript,pre .javascript .xml,pre .tex .formula,pre .xml .javascript,pre .xml .vbscript,pre .xml .css,pre .xml .cdata{opacity:0.5;}","solarized_dark":"pre code{display:block;padding:0.5em;background:#002b36;color:#839496;}pre .comment,pre .template_comment,pre .diff .header,pre .doctype,pre .pi,pre .lisp .string,pre .javadoc{color:#586e75;font-style:italic;}pre .keyword,pre .winutils,pre .method,pre .addition,pre .css .tag,pre .request,pre .status,pre .nginx .title{color:#859900;}pre .number,pre .command,pre .string,pre .tag .value,pre .phpdoc,pre .tex .formula,pre .regexp,pre .hexcolor{color:#2aa198;}pre .title,pre .localvars,pre .chunk,pre .decorator,pre .built_in,pre .identifier,pre .vhdl .literal,pre .id{color:#268bd2;}pre .attribute,pre .variable,pre .lisp .body,pre .smalltalk .number,pre .constant,pre .class .title,pre .parent,pre .haskell .type{color:#b58900;}pre .preprocessor,pre .preprocessor .keyword,pre .shebang,pre .symbol,pre .symbol .string,pre .diff .change,pre .special,pre .attr_selector,pre .important,pre .subst,pre .cdata,pre .clojure .title{color:#cb4b16;}pre .deletion{color:#dc322f;}pre .tex .formula{background:#073642;}","vs":"pre code{display:block;padding:0.5em;}pre .comment,pre .annotation,pre .template_comment,pre .diff .header,pre .chunk,pre .apache .cbracket{color:#008000;}pre .keyword,pre .id,pre .built_in,pre .smalltalk .class,pre .winutils,pre .bash .variable,pre .tex .command,pre .request,pre .status,pre .nginx .title,pre .xml .tag,pre .xml .tag .value{color:#0000ff;}pre .string,pre .title,pre .parent,pre .tag .value,pre .rules .value,pre .rules .value .number,pre .ruby .symbol,pre .ruby .symbol .string,pre .aggregate,pre .template_tag,pre .django .variable,pre .addition,pre .flow,pre .stream,pre .apache .tag,pre .date,pre .tex .formula{color:#a31515;}pre .ruby .string,pre .decorator,pre .filter .argument,pre .localvars,pre .array,pre .attr_selector,pre .pseudo,pre .pi,pre .doctype,pre .deletion,pre .envvar,pre .shebang,pre .preprocessor,pre .userType,pre .apache .sqbracket,pre .nginx .built_in,pre .tex .special,pre .input_number{color:#2b91af;}pre .phpdoc,pre .javadoc,pre .xmlDocTag{color:#808080;}pre .vhdl .typename{font-weight:bold;}pre .vhdl .string{color:#666666;}pre .vhdl .literal{color:#a31515;}pre .vhdl .attribute{color:#00B0E8;}pre .xml .attribute{color:#ff0000;}","sunburst":"pre code{display:block;padding:0.5em;background:#000;color:#f8f8f8;}pre .comment,pre .template_comment,pre .javadoc{color:#aeaeae;font-style:italic;}pre .keyword,pre .ruby .function .keyword,pre .request,pre .status,pre .nginx .title{color:#E28964;}pre .function .keyword,pre .sub .keyword,pre .method,pre .list .title{color:#99CF50;}pre .string,pre .tag .value,pre .cdata,pre .filter .argument,pre .attr_selector,pre .apache .cbracket,pre .date,pre .tex .command{color:#65B042;}pre .subst{color:#DAEFA3;}pre .regexp{color:#E9C062;}pre .title,pre .sub .identifier,pre .pi,pre .tag,pre .tag .keyword,pre .decorator,pre .shebang,pre .input_number{color:#89BDFF;}pre .class .title,pre .haskell .type,pre .smalltalk .class,pre .javadoctag,pre .yardoctag,pre .phpdoc{text-decoration:underline;}pre .symbol,pre .ruby .symbol .string,pre .number{color:#3387CC;}pre .params,pre .variable,pre .clojure .attribute{color:#3E87E3;}pre .css .tag,pre .rules .property,pre .pseudo,pre .tex .special{color:#CDA869;}pre .css .class{color:#9B703F;}pre .rules .keyword{color:#C5AF75;}pre .rules .value{color:#CF6A4C;}pre .css .id{color:#8B98AB;}pre .annotation,pre .apache .sqbracket,pre .nginx .built_in{color:#9B859D;}pre .preprocessor{color:#8996A8;}pre .hexcolor,pre .css .value .number{color:#DD7B3B;}pre .css .function{color:#DAD085;}pre .diff .header,pre .chunk,pre .tex .formula{background-color:#0E2231;color:#F8F8F8;font-style:italic;}pre .diff .change{background-color:#4A410D;color:#F8F8F8;}pre .addition{background-color:#253B22;color:#F8F8F8;}pre .deletion{background-color:#420E09;color:#F8F8F8;}pre .coffeescript .javascript,pre .javascript .xml,pre .tex .formula,pre .xml .javascript,pre .xml .vbscript,pre .xml .css,pre .xml .cdata{opacity:0.5;}","arta":"pre code{display:block;padding:0.5em;background:#222;}pre .profile .header *,pre .ini .title,pre .nginx .title{color:#fff;}pre .comment,pre .javadoc,pre .preprocessor,pre .preprocessor .title,pre .shebang,pre .profile .summary,pre .diff,pre .pi,pre .doctype,pre .tag,pre .template_comment,pre .css .rules,pre .tex .special{color:#444;}pre .string,pre .symbol,pre .diff .change,pre .regexp,pre .xml .attribute,pre .smalltalk .char,pre .xml .value,pre .ini .value,pre .clojure .attribute{color:#ffcc33;}pre .number,pre .addition{color:#00cc66;}pre .built_in,pre .literal,pre .vhdl .typename,pre .go .constant,pre .go .typename,pre .ini .keyword,pre .lua .title,pre .perl .variable,pre .php .variable,pre .mel .variable,pre .django .variable,pre .css .funtion,pre .smalltalk .method,pre .hexcolor,pre .important,pre .flow,pre .inheritance,pre .parser3 .variable{color:#32AAEE;}pre .keyword,pre .tag .title,pre .css .tag,pre .css .class,pre .css .id,pre .css .pseudo,pre .css .attr_selector,pre .lisp .title,pre .clojure .built_in,pre .winutils,pre .tex .command,pre .request,pre .status{color:#6644aa;}pre .title,pre .ruby .constant,pre .vala .constant,pre .parent,pre .deletion,pre .template_tag,pre .css .keyword,pre .objectivec .class .id,pre .smalltalk .class,pre .lisp .keyword,pre .apache .tag,pre .nginx .variable,pre .envvar,pre .bash .variable,pre .go .built_in,pre .vbscript .built_in,pre .lua .built_in,pre .rsl .built_in,pre .tail,pre .avrasm .label,pre .tex .formula,pre .tex .formula *{color:#bb1166;}pre .yardoctag,pre .phpdoc,pre .profile .header,pre .ini .title,pre .apache .tag,pre .parser3 .title{font-weight:bold;}pre .coffeescript .javascript,pre .javascript .xml,pre .tex .formula,pre .xml .javascript,pre .xml .vbscript,pre .xml .css,pre .xml .cdata{opacity:0.6;}pre code,pre .javascript,pre .css,pre .xml,pre .subst,pre .diff .chunk,pre .css .value,pre .css .attribute,pre .lisp .string,pre .lisp .number,pre .tail .params,pre .container,pre .haskell *,pre .erlang *,pre .erlang_repl *{color:#aaa;}","tomorrow-night-eighties":".tomorrow-comment,pre .comment,pre .title{color:#999999;}.tomorrow-red,pre .variable,pre .attribute,pre .tag,pre .regexp,pre .ruby .constant,pre .xml .tag .title,pre .xml .pi,pre .xml .doctype,pre .html .doctype,pre .css .id,pre .css .class,pre .css .pseudo{color:#f2777a;}.tomorrow-orange,pre .number,pre .preprocessor,pre .built_in,pre .literal,pre .params,pre .constant{color:#f99157;}.tomorrow-yellow,pre .class,pre .ruby .class .title,pre .css .rules .attribute{color:#ffcc66;}.tomorrow-green,pre .string,pre .value,pre .inheritance,pre .header,pre .ruby .symbol,pre .xml .cdata{color:#99cc99;}.tomorrow-aqua,pre .css .hexcolor{color:#66cccc;}.tomorrow-blue,pre .function,pre .python .decorator,pre .python .title,pre .ruby .function .title,pre .ruby .title .keyword,pre .perl .sub,pre .javascript .title,pre .coffeescript .title{color:#6699cc;}.tomorrow-purple,pre .keyword,pre .javascript .function{color:#cc99cc;}pre code{display:block;background:#2d2d2d;color:#cccccc;padding:0.5em;}pre .coffeescript .javascript,pre .javascript .xml,pre .tex .formula,pre .xml .javascript,pre .xml .vbscript,pre .xml .css,pre .xml .cdata{opacity:0.5;}","default":"pre code{display:block;padding:0.5em;background:#F0F0F0;}pre code,pre .subst,pre .tag .title,pre .lisp .title,pre .clojure .built_in,pre .nginx .title{color:black;}pre .string,pre .title,pre .constant,pre .parent,pre .tag .value,pre .rules .value,pre .rules .value .number,pre .preprocessor,pre .ruby .symbol,pre .ruby .symbol .string,pre .aggregate,pre .template_tag,pre .django .variable,pre .smalltalk .class,pre .addition,pre .flow,pre .stream,pre .bash .variable,pre .apache .tag,pre .apache .cbracket,pre .tex .command,pre .tex .special,pre .erlang_repl .function_or_atom,pre .markdown .header{color:#800;}pre .comment,pre .annotation,pre .template_comment,pre .diff .header,pre .chunk,pre .markdown .blockquote{color:#888;}pre .number,pre .date,pre .regexp,pre .literal,pre .smalltalk .symbol,pre .smalltalk .char,pre .go .constant,pre .change,pre .markdown .bullet,pre .markdown .link_url{color:#080;}pre .label,pre .javadoc,pre .ruby .string,pre .decorator,pre .filter .argument,pre .localvars,pre .array,pre .attr_selector,pre .important,pre .pseudo,pre .pi,pre .doctype,pre .deletion,pre .envvar,pre .shebang,pre .apache .sqbracket,pre .nginx .built_in,pre .tex .formula,pre .erlang_repl .reserved,pre .input_number,pre .markdown .link_label,pre .vhdl .attribute,pre .clojure .attribute,pre .coffeescript .property{color:#8888ff;}pre .keyword,pre .id,pre .phpdoc,pre .title,pre .built_in,pre .aggregate,pre .css .tag,pre .javadoctag,pre .phpdoc,pre .yardoctag,pre .smalltalk .class,pre .winutils,pre .bash .variable,pre .apache .tag,pre .go .typename,pre .tex .command,pre .markdown .strong,pre .request,pre .status{font-weight:bold;}pre .markdown .emphasis{font-style:italic;}pre .nginx .built_in{font-weight:normal;}pre .coffeescript .javascript,pre .javascript .xml,pre .tex .formula,pre .xml .javascript,pre .xml .vbscript,pre .xml .css,pre .xml .cdata{opacity:0.5;}","magula":"pre code{display:block;padding:0.5em;background-color:#f4f4f4;}pre code,pre .subst,pre .lisp .title,pre .clojure .built_in{color:black;}pre .string,pre .title,pre .parent,pre .tag .value,pre .rules .value,pre .rules .value .number,pre .preprocessor,pre .ruby .symbol,pre .ruby .symbol .string,pre .aggregate,pre .template_tag,pre .django .variable,pre .smalltalk .class,pre .addition,pre .flow,pre .stream,pre .bash .variable,pre .apache .cbracket{color:#050;}pre .comment,pre .annotation,pre .template_comment,pre .diff .header,pre .chunk{color:#777;}pre .number,pre .date,pre .regexp,pre .literal,pre .smalltalk .symbol,pre .smalltalk .char,pre .change,pre .tex .special{color:#800;}pre .label,pre .javadoc,pre .ruby .string,pre .decorator,pre .filter .argument,pre .localvars,pre .array,pre .attr_selector,pre .pseudo,pre .pi,pre .doctype,pre .deletion,pre .envvar,pre .shebang,pre .apache .sqbracket,pre .nginx .built_in,pre .tex .formula,pre .input_number,pre .clojure .attribute{color:#00e;}pre .keyword,pre .id,pre .phpdoc,pre .title,pre .built_in,pre .aggregate,pre .smalltalk .class,pre .winutils,pre .bash .variable,pre .apache .tag,pre .xml .tag,pre .tex .command,pre .request,pre .status{font-weight:bold;color:navy;}pre .nginx .built_in{font-weight:normal;}pre .coffeescript .javascript,pre .javascript .xml,pre .tex .formula,pre .xml .javascript,pre .xml .vbscript,pre .xml .css,pre .xml .cdata{opacity:0.5;}pre .apache .tag{font-weight:bold;color:blue;}","tomorrow":".tomorrow-comment,pre .comment,pre .title{color:#8e908c;}.tomorrow-red,pre .variable,pre .attribute,pre .tag,pre .regexp,pre .ruby .constant,pre .xml .tag .title,pre .xml .pi,pre .xml .doctype,pre .html .doctype,pre .css .id,pre .css .class,pre .css .pseudo{color:#c82829;}.tomorrow-orange,pre .number,pre .preprocessor,pre .built_in,pre .literal,pre .params,pre .constant{color:#f5871f;}.tomorrow-yellow,pre .class,pre .ruby .class .title,pre .css .rules .attribute{color:#eab700;}.tomorrow-green,pre .string,pre .value,pre .inheritance,pre .header,pre .ruby .symbol,pre .xml .cdata{color:#718c00;}.tomorrow-aqua,pre .css .hexcolor{color:#3e999f;}.tomorrow-blue,pre .function,pre .python .decorator,pre .python .title,pre .ruby .function .title,pre .ruby .title .keyword,pre .perl .sub,pre .javascript .title,pre .coffeescript .title{color:#4271ae;}.tomorrow-purple,pre .keyword,pre .javascript .function{color:#8959a8;}pre code{display:block;background:white;color:#4d4d4c;padding:0.5em;}pre .coffeescript .javascript,pre .javascript .xml,pre .tex .formula,pre .xml .javascript,pre .xml .vbscript,pre .xml .css,pre .xml .cdata{opacity:0.5;}","xcode":"pre code{display:block;padding:0.5em;background:#fff;color:black;}pre .comment,pre .template_comment,pre .javadoc,pre .comment *{color:#006a00;}pre .keyword,pre .literal,pre .nginx .title{color:#aa0d91;}pre .method,pre .list .title,pre .tag .title,pre .setting .value,pre .winutils,pre .tex .command,pre .http .title,pre .request,pre .status{color:#008;}pre .envvar,pre .tex .special{color:#660;}pre .string{color:#c41a16;}pre .tag .value,pre .cdata,pre .filter .argument,pre .attr_selector,pre .apache .cbracket,pre .date,pre .regexp{color:#080;}pre .sub .identifier,pre .pi,pre .tag,pre .tag .keyword,pre .decorator,pre .ini .title,pre .shebang,pre .input_number,pre .hexcolor,pre .rules .value,pre .css .value .number,pre .symbol,pre .symbol .string,pre .number,pre .css .function,pre .clojure .title,pre .clojure .built_in{color:#1c00cf;}pre .class .title,pre .haskell .type,pre .smalltalk .class,pre .javadoctag,pre .yardoctag,pre .phpdoc,pre .typename,pre .tag .attribute,pre .doctype,pre .class .id,pre .built_in,pre .setting,pre .params,pre .clojure .attribute{color:#5c2699;}pre .variable{color:#3f6e74;}pre .css .tag,pre .rules .property,pre .pseudo,pre .subst{color:#000;}pre .css .class,pre .css .id{color:#9B703F;}pre .value .important{color:#ff7700;font-weight:bold;}pre .rules .keyword{color:#C5AF75;}pre .annotation,pre .apache .sqbracket,pre .nginx .built_in{color:#9B859D;}pre .preprocessor,pre .preprocessor *{color:#643820;}pre .tex .formula{background-color:#EEE;font-style:italic;}pre .diff .header,pre .chunk{color:#808080;font-weight:bold;}pre .diff .change{background-color:#BCCFF9;}pre .addition{background-color:#BAEEBA;}pre .deletion{background-color:#FFC8BD;}pre .comment .yardoctag{font-weight:bold;}pre .method .id{color:#000;}","rainbow":"pre::-moz-selection{background:#FF5E99;color:#fff;text-shadow:none;}pre::selection{background:#FF5E99;color:#fff;text-shadow:none;}pre code{display:block;padding:0.5em;background:#474949;color:#D1D9E1;}pre .body,pre .collection{color:#D1D9E1;}pre .comment,pre .template_comment,pre .diff .header,pre .doctype,pre .lisp .string,pre .javadoc{color:#969896;font-style:italic;}pre .keyword,pre .clojure .attribute,pre .winutils,pre .javascript .title,pre .addition,pre .css .tag{color:#cc99cc;}pre .number{color:#f99157;}pre .command,pre .string,pre .tag .value,pre .phpdoc,pre .tex .formula,pre .regexp,pre .hexcolor{color:#8abeb7;}pre .title,pre .localvars,pre .function .title,pre .chunk,pre .decorator,pre .built_in,pre .lisp .title,pre .identifier{color:#b5bd68;}pre .class .keyword{color:#f2777a;}pre .variable,pre .lisp .body,pre .smalltalk .number,pre .constant,pre .class .title,pre .parent,pre .haskell .label,pre .id,pre .lisp .title,pre .clojure .title .built_in{color:#ffcc66;}pre .tag .title,pre .rules .property,pre .django .tag .keyword,pre .clojure .title .built_in{font-weight:bold;}pre .attribute,pre .clojure .title{color:#81a2be;}pre .preprocessor,pre .pi,pre .shebang,pre .symbol,pre .symbol .string,pre .diff .change,pre .special,pre .attr_selector,pre .important,pre .subst,pre .cdata{color:#f99157;}pre .deletion{color:#dc322f;}pre .tex .formula{background:#eee8d5;}","tomorrow-night-bright":".tomorrow-comment,pre .comment,pre .title{color:#969896;}.tomorrow-red,pre .variable,pre .attribute,pre .tag,pre .regexp,pre .ruby .constant,pre .xml .tag .title,pre .xml .pi,pre .xml .doctype,pre .html .doctype,pre .css .id,pre .css .class,pre .css .pseudo{color:#d54e53;}.tomorrow-orange,pre .number,pre .preprocessor,pre .built_in,pre .literal,pre .params,pre .constant{color:#e78c45;}.tomorrow-yellow,pre .class,pre .ruby .class .title,pre .css .rules .attribute{color:#e7c547;}.tomorrow-green,pre .string,pre .value,pre .inheritance,pre .header,pre .ruby .symbol,pre .xml .cdata{color:#b9ca4a;}.tomorrow-aqua,pre .css .hexcolor{color:#70c0b1;}.tomorrow-blue,pre .function,pre .python .decorator,pre .python .title,pre .ruby .function .title,pre .ruby .title .keyword,pre .perl .sub,pre .javascript .title,pre .coffeescript .title{color:#7aa6da;}.tomorrow-purple,pre .keyword,pre .javascript .function{color:#c397d8;}pre code{display:block;background:black;color:#eaeaea;padding:0.5em;}pre .coffeescript .javascript,pre .javascript .xml,pre .tex .formula,pre .xml .javascript,pre .xml .vbscript,pre .xml .css,pre .xml .cdata{opacity:0.5;}","ir_black":"pre code{display:block;padding:0.5em;background:#000;color:#f8f8f8;}pre .shebang,pre .comment,pre .template_comment,pre .javadoc{color:#7c7c7c;}pre .keyword,pre .tag,pre .tex .command,pre .request,pre .status,pre .clojure .attribute{color:#96CBFE;}pre .sub .keyword,pre .method,pre .list .title,pre .nginx .title{color:#FFFFB6;}pre .string,pre .tag .value,pre .cdata,pre .filter .argument,pre .attr_selector,pre .apache .cbracket,pre .date{color:#A8FF60;}pre .subst{color:#DAEFA3;}pre .regexp{color:#E9C062;}pre .title,pre .sub .identifier,pre .pi,pre .decorator,pre .tex .special,pre .haskell .type,pre .constant,pre .smalltalk .class,pre .javadoctag,pre .yardoctag,pre .phpdoc,pre .nginx .built_in{color:#FFFFB6;}pre .symbol,pre .ruby .symbol .string,pre .number,pre .variable,pre .vbscript,pre .literal{color:#C6C5FE;}pre .css .tag{color:#96CBFE;}pre .css .rules .property,pre .css .id{color:#FFFFB6;}pre .css .class{color:#FFF;}pre .hexcolor{color:#C6C5FE;}pre .number{color:#FF73FD;}pre .coffeescript .javascript,pre .javascript .xml,pre .tex .formula,pre .xml .javascript,pre .xml .vbscript,pre .xml .css,pre .xml .cdata{opacity:0.7;}","tomorrow-night-blue":".tomorrow-comment,pre .comment,pre .title{color:#7285b7;}.tomorrow-red,pre .variable,pre .attribute,pre .tag,pre .regexp,pre .ruby .constant,pre .xml .tag .title,pre .xml .pi,pre .xml .doctype,pre .html .doctype,pre .css .id,pre .css .class,pre .css .pseudo{color:#ff9da4;}.tomorrow-orange,pre .number,pre .preprocessor,pre .built_in,pre .literal,pre .params,pre .constant{color:#ffc58f;}.tomorrow-yellow,pre .class,pre .ruby .class .title,pre .css .rules .attribute{color:#ffeead;}.tomorrow-green,pre .string,pre .value,pre .inheritance,pre .header,pre .ruby .symbol,pre .xml .cdata{color:#d1f1a9;}.tomorrow-aqua,pre .css .hexcolor{color:#99ffff;}.tomorrow-blue,pre .function,pre .python .decorator,pre .python .title,pre .ruby .function .title,pre .ruby .title .keyword,pre .perl .sub,pre .javascript .title,pre .coffeescript .title{color:#bbdaff;}.tomorrow-purple,pre .keyword,pre .javascript .function{color:#ebbbff;}pre code{display:block;background:#002451;color:white;padding:0.5em;}pre .coffeescript .javascript,pre .javascript .xml,pre .tex .formula,pre .xml .javascript,pre .xml .vbscript,pre .xml .css,pre .xml .cdata{opacity:0.5;}","idea":"pre code{display:block;padding:0.5em;color:#000;background:#fff;}pre .subst,pre .title{font-weight:normal;color:#000;}pre .comment,pre .template_comment,pre .javadoc,pre .diff .header{color:#808080;font-style:italic;}pre .annotation,pre .decorator,pre .preprocessor,pre .doctype,pre .pi,pre .chunk,pre .shebang,pre .apache .cbracket,pre .input_number,pre .http .title{color:#808000;}pre .tag,pre .pi{background:#efefef;}pre .tag .title,pre .id,pre .attr_selector,pre .pseudo,pre .literal,pre .keyword,pre .hexcolor,pre .css .function,pre .ini .title,pre .css .class,pre .list .title,pre .clojure .title,pre .nginx .title,pre .tex .command,pre .request,pre .status{font-weight:bold;color:#000080;}pre .attribute,pre .rules .keyword,pre .number,pre .date,pre .regexp,pre .tex .special{font-weight:bold;color:#0000ff;}pre .number,pre .regexp{font-weight:normal;}pre .string,pre .value,pre .filter .argument,pre .css .function .params,pre .apache .tag{color:#008000;font-weight:bold;}pre .symbol,pre .ruby .symbol .string,pre .char,pre .tex .formula{color:#000;background:#d0eded;font-style:italic;}pre .phpdoc,pre .yardoctag,pre .javadoctag{text-decoration:underline;}pre .variable,pre .envvar,pre .apache .sqbracket,pre .nginx .built_in{color:#660e7a;}pre .addition{background:#baeeba;}pre .deletion{background:#ffc8bd;}pre .diff .change{background:#bccff9;}","zenburn":"pre code{display:block;padding:0.5em;background:#3F3F3F;color:#DCDCDC;}pre .keyword,pre .tag,pre .css .class,pre .css .id,pre .lisp .title,pre .nginx .title,pre .request,pre .status,pre .clojure .attribute{color:#E3CEAB;}pre .django .template_tag,pre .django .variable,pre .django .filter .argument{color:#DCDCDC;}pre .number,pre .date{color:#8CD0D3;}pre .dos .envvar,pre .dos .stream,pre .variable,pre .apache .sqbracket{color:#EFDCBC;}pre .dos .flow,pre .diff .change,pre .python .exception,pre .python .built_in,pre .literal,pre .tex .special{color:#EFEFAF;}pre .diff .chunk,pre .subst{color:#8F8F8F;}pre .dos .keyword,pre .python .decorator,pre .title,pre .haskell .type,pre .diff .header,pre .ruby .class .parent,pre .apache .tag,pre .nginx .built_in,pre .tex .command,pre .input_number{color:#efef8f;}pre .dos .winutils,pre .ruby .symbol,pre .ruby .symbol .string,pre .ruby .string{color:#DCA3A3;}pre .diff .deletion,pre .string,pre .tag .value,pre .preprocessor,pre .built_in,pre .sql .aggregate,pre .javadoc,pre .smalltalk .class,pre .smalltalk .localvars,pre .smalltalk .array,pre .css .rules .value,pre .attr_selector,pre .pseudo,pre .apache .cbracket,pre .tex .formula{color:#CC9393;}pre .shebang,pre .diff .addition,pre .comment,pre .java .annotation,pre .template_comment,pre .pi,pre .doctype{color:#7F9F7F;}pre .coffeescript .javascript,pre .javascript .xml,pre .tex .formula,pre .xml .javascript,pre .xml .vbscript,pre .xml .css,pre .xml .cdata{opacity:0.5;}","monokai":"pre code{display:block;padding:0.5em;background:#272822;}pre .tag,pre .tag .title,pre .keyword,pre .literal,pre .change,pre .winutils,pre .flow,pre .lisp .title,pre .clojure .built_in,pre .nginx .title,pre .tex .special{color:#F92672;}pre code{color:#DDD;}pre code .constant{color:#66D9EF;}pre .class .title{color:white;}pre .attribute,pre .symbol,pre .symbol .string,pre .value,pre .regexp{color:#BF79DB;}pre .tag .value,pre .string,pre .subst,pre .title,pre .haskell .type,pre .preprocessor,pre .ruby .class .parent,pre .built_in,pre .sql .aggregate,pre .django .template_tag,pre .django .variable,pre .smalltalk .class,pre .javadoc,pre .django .filter .argument,pre .smalltalk .localvars,pre .smalltalk .array,pre .attr_selector,pre .pseudo,pre .addition,pre .stream,pre .envvar,pre .apache .tag,pre .apache .cbracket,pre .tex .command,pre .input_number{color:#A6E22E;}pre .comment,pre .java .annotation,pre .python .decorator,pre .template_comment,pre .pi,pre .doctype,pre .deletion,pre .shebang,pre .apache .sqbracket,pre .tex .formula{color:#75715E;}pre .keyword,pre .literal,pre .css .id,pre .phpdoc,pre .title,pre .haskell .type,pre .vbscript .built_in,pre .sql .aggregate,pre .rsl .built_in,pre .smalltalk .class,pre .diff .header,pre .chunk,pre .winutils,pre .bash .variable,pre .apache .tag,pre .tex .special,pre .request,pre .status{font-weight:bold;}pre .coffeescript .javascript,pre .javascript .xml,pre .tex .formula,pre .xml .javascript,pre .xml .vbscript,pre .xml .css,pre .xml .cdata{opacity:0.5;}"}}};
module.exports.highlighter.engine = (function () {
var hljs = new /*
Syntax highlighting with language autodetection.
http://softwaremaniacs.org/soft/highlight/
*/

function() {

  /* Utility functions */

  function escape(value) {
    return value.replace(/&/gm, '&amp;').replace(/</gm, '&lt;');
  }

  function findCode(pre) {
    for (var node = pre.firstChild; node; node = node.nextSibling) {
      if (node.nodeName == 'CODE')
        return node;
      if (!(node.nodeType == 3 && node.nodeValue.match(/\s+/)))
        break;
    }
  }

  function blockText(block, ignoreNewLines) {
    return Array.prototype.map.call(block.childNodes, function(node) {
      if (node.nodeType == 3) {
        return ignoreNewLines ? node.nodeValue.replace(/\n/g, '') : node.nodeValue;
      }
      if (node.nodeName == 'BR') {
        return '\n';
      }
      return blockText(node, ignoreNewLines);
    }).join('');
  }

  function blockLanguage(block) {
    var classes = (block.className + ' ' + block.parentNode.className).split(/\s+/);
    classes = classes.map(function(c) {return c.replace(/^language-/, '')});
    for (var i = 0; i < classes.length; i++) {
      if (languages[classes[i]] || classes[i] == 'no-highlight') {
        return classes[i];
      }
    }
  }

  /* Stream merging */

  function nodeStream(node) {
    var result = [];
    (function _nodeStream(node, offset) {
      for (var child = node.firstChild; child; child = child.nextSibling) {
        if (child.nodeType == 3)
          offset += child.nodeValue.length;
        else if (child.nodeName == 'BR')
          offset += 1;
        else if (child.nodeType == 1) {
          result.push({
            event: 'start',
            offset: offset,
            node: child
          });
          offset = _nodeStream(child, offset);
          result.push({
            event: 'stop',
            offset: offset,
            node: child
          });
        }
      }
      return offset;
    })(node, 0);
    return result;
  }

  function mergeStreams(stream1, stream2, value) {
    var processed = 0;
    var result = '';
    var nodeStack = [];

    function selectStream() {
      if (stream1.length && stream2.length) {
        if (stream1[0].offset != stream2[0].offset)
          return (stream1[0].offset < stream2[0].offset) ? stream1 : stream2;
        else {
          /*
          To avoid starting the stream just before it should stop the order is
          ensured that stream1 always starts first and closes last:

          if (event1 == 'start' && event2 == 'start')
            return stream1;
          if (event1 == 'start' && event2 == 'stop')
            return stream2;
          if (event1 == 'stop' && event2 == 'start')
            return stream1;
          if (event1 == 'stop' && event2 == 'stop')
            return stream2;

          ... which is collapsed to:
          */
          return stream2[0].event == 'start' ? stream1 : stream2;
        }
      } else {
        return stream1.length ? stream1 : stream2;
      }
    }

    function open(node) {
      function attr_str(a) {return ' ' + a.nodeName + '="' + escape(a.value) + '"'};
      return '<' + node.nodeName + Array.prototype.map.call(node.attributes, attr_str).join('') + '>';
    }

    while (stream1.length || stream2.length) {
      var current = selectStream().splice(0, 1)[0];
      result += escape(value.substr(processed, current.offset - processed));
      processed = current.offset;
      if ( current.event == 'start') {
        result += open(current.node);
        nodeStack.push(current.node);
      } else if (current.event == 'stop') {
        var node, i = nodeStack.length;
        do {
          i--;
          node = nodeStack[i];
          result += ('</' + node.nodeName.toLowerCase() + '>');
        } while (node != current.node);
        nodeStack.splice(i, 1);
        while (i < nodeStack.length) {
          result += open(nodeStack[i]);
          i++;
        }
      }
    }
    return result + escape(value.substr(processed));
  }

  /* Initialization */

  function compileLanguage(language) {

    function langRe(value, global) {
      return RegExp(
        value,
        'm' + (language.case_insensitive ? 'i' : '') + (global ? 'g' : '')
      );
    }

    function compileMode(mode, parent) {
      if (mode.compiled)
        return;
      mode.compiled = true;

      var keywords = []; // used later with beginWithKeyword but filled as a side-effect of keywords compilation
      if (mode.keywords) {
        var compiled_keywords = {};

        function flatten(className, str) {
          str.split(' ').forEach(function(kw) {
            var pair = kw.split('|');
            compiled_keywords[pair[0]] = [className, pair[1] ? Number(pair[1]) : 1];
            keywords.push(pair[0]);
          });
        }

        mode.lexemsRe = langRe(mode.lexems || hljs.IDENT_RE, true);
        if (typeof mode.keywords == 'string') { // string
          flatten('keyword', mode.keywords)
        } else {
          for (var className in mode.keywords) {
            if (!mode.keywords.hasOwnProperty(className))
              continue;
            flatten(className, mode.keywords[className]);
          }
        }
        mode.keywords = compiled_keywords;
      }
      if (parent) {
        if (mode.beginWithKeyword) {
          mode.begin = '\\b(' + keywords.join('|') + ')\\s';
        }
        mode.beginRe = langRe(mode.begin ? mode.begin : '\\B|\\b');
        if (!mode.end && !mode.endsWithParent)
          mode.end = '\\B|\\b';
        if (mode.end)
          mode.endRe = langRe(mode.end);
        mode.terminator_end = mode.end || '';
        if (mode.endsWithParent && parent.terminator_end)
          mode.terminator_end += (mode.end ? '|' : '') + parent.terminator_end;
      }
      if (mode.illegal)
        mode.illegalRe = langRe(mode.illegal);
      if (mode.relevance === undefined)
        mode.relevance = 1;
      if (!mode.contains) {
        mode.contains = [];
      }
      for (var i = 0; i < mode.contains.length; i++) {
        if (mode.contains[i] == 'self') {
          mode.contains[i] = mode;
        }
        compileMode(mode.contains[i], mode);
      }
      if (mode.starts) {
        compileMode(mode.starts, parent);
      }

      var terminators = [];
      for (var i = 0; i < mode.contains.length; i++) {
        terminators.push(mode.contains[i].begin);
      }
      if (mode.terminator_end) {
        terminators.push(mode.terminator_end);
      }
      if (mode.illegal) {
        terminators.push(mode.illegal);
      }
      mode.terminators = terminators.length ? langRe(terminators.join('|'), true) : {exec: function(s) {return null;}};
    }

    compileMode(language);
  }

  /*
  Core highlighting function. Accepts a language name and a string with the
  code to highlight. Returns an object with the following properties:

  - relevance (int)
  - keyword_count (int)
  - value (an HTML string with highlighting markup)

  */
  function highlight(language_name, value) {

    function subMode(lexem, mode) {
      for (var i = 0; i < mode.contains.length; i++) {
        var match = mode.contains[i].beginRe.exec(lexem);
        if (match && match.index == 0) {
          return mode.contains[i];
        }
      }
    }

    function endOfMode(mode, lexem) {
      if (mode.end && mode.endRe.test(lexem)) {
        return mode;
      }
      if (mode.endsWithParent) {
        return endOfMode(mode.parent, lexem);
      }
    }

    function isIllegal(lexem, mode) {
      return mode.illegal && mode.illegalRe.test(lexem);
    }

    function keywordMatch(mode, match) {
      var match_str = language.case_insensitive ? match[0].toLowerCase() : match[0];
      return mode.keywords.hasOwnProperty(match_str) && mode.keywords[match_str];
    }

    function processKeywords() {
      var buffer = escape(mode_buffer);
      if (!top.keywords)
        return buffer;
      var result = '';
      var last_index = 0;
      top.lexemsRe.lastIndex = 0;
      var match = top.lexemsRe.exec(buffer);
      while (match) {
        result += buffer.substr(last_index, match.index - last_index);
        var keyword_match = keywordMatch(top, match);
        if (keyword_match) {
          keyword_count += keyword_match[1];
          result += '<span class="'+ keyword_match[0] +'">' + match[0] + '</span>';
        } else {
          result += match[0];
        }
        last_index = top.lexemsRe.lastIndex;
        match = top.lexemsRe.exec(buffer);
      }
      return result + buffer.substr(last_index);
    }

    function processSubLanguage() {
      if (top.subLanguage && !languages[top.subLanguage]) {
        return escape(mode_buffer);
      }
      var result = top.subLanguage ? highlight(top.subLanguage, mode_buffer) : highlightAuto(mode_buffer);
      // Counting embedded language score towards the host language may be disabled
      // with zeroing the containing mode relevance. Usecase in point is Markdown that
      // allows XML everywhere and makes every XML snippet to have a much larger Markdown
      // score.
      if (top.relevance > 0) {
        keyword_count += result.keyword_count;
        relevance += result.relevance;
      }
      return '<span class="' + result.language  + '">' + result.value + '</span>';
    }

    function processBuffer() {
      return top.subLanguage !== undefined ? processSubLanguage() : processKeywords();
    }

    function startNewMode(mode, lexem) {
      var markup = mode.className? '<span class="' + mode.className + '">': '';
      if (mode.returnBegin) {
        result += markup;
        mode_buffer = '';
      } else if (mode.excludeBegin) {
        result += escape(lexem) + markup;
        mode_buffer = '';
      } else {
        result += markup;
        mode_buffer = lexem;
      }
      top = Object.create(mode, {parent: {value: top}});
      relevance += mode.relevance;
    }

    function processModeInfo(buffer, lexem) {
      mode_buffer += buffer;
      if (lexem === undefined) {
        result += processBuffer();
        return;
      }

      var new_mode = subMode(lexem, top);
      if (new_mode) {
        result += processBuffer();
        startNewMode(new_mode, lexem);
        return new_mode.returnBegin;
      }

      var end_mode = endOfMode(top, lexem);
      if (end_mode) {
        if (!(end_mode.returnEnd || end_mode.excludeEnd)) {
          mode_buffer += lexem;
        }
        result += processBuffer();
        do {
          if (top.className) {
            result += '</span>';
          }
          top = top.parent;
        } while (top != end_mode.parent);
        if (end_mode.excludeEnd) {
          result += escape(lexem);
        }
        mode_buffer = '';
        if (end_mode.starts) {
          startNewMode(end_mode.starts, '');
        }
        return end_mode.returnEnd;
      }

      if (isIllegal(lexem, top))
        throw 'Illegal';
    }

    var language = languages[language_name];
    compileLanguage(language);
    var top = language;
    var mode_buffer = '';
    var relevance = 0;
    var keyword_count = 0;
    var result = '';
    try {
      var match, index = 0;
      while (true) {
        top.terminators.lastIndex = index;
        match = top.terminators.exec(value);
        if (!match)
          break;
        var return_lexem = processModeInfo(value.substr(index, match.index - index), match[0]);
        index = match.index + (return_lexem ? 0 : match[0].length);
      }
      processModeInfo(value.substr(index), undefined);
      return {
        relevance: relevance,
        keyword_count: keyword_count,
        value: result,
        language: language_name
      };
    } catch (e) {
      if (e == 'Illegal') {
        return {
          relevance: 0,
          keyword_count: 0,
          value: escape(value)
        };
      } else {
        throw e;
      }
    }
  }

  /*
  Highlighting with language detection. Accepts a string with the code to
  highlight. Returns an object with the following properties:

  - language (detected language)
  - relevance (int)
  - keyword_count (int)
  - value (an HTML string with highlighting markup)
  - second_best (object with the same structure for second-best heuristically
    detected language, may be absent)

  */
  function highlightAuto(text) {
    var result = {
      keyword_count: 0,
      relevance: 0,
      value: escape(text)
    };
    var second_best = result;
    for (var key in languages) {
      if (!languages.hasOwnProperty(key))
        continue;
      var current = highlight(key, text);
      current.language = key;
      if (current.keyword_count + current.relevance > second_best.keyword_count + second_best.relevance) {
        second_best = current;
      }
      if (current.keyword_count + current.relevance > result.keyword_count + result.relevance) {
        second_best = result;
        result = current;
      }
    }
    if (second_best.language) {
      result.second_best = second_best;
    }
    return result;
  }

  /*
  Post-processing of the highlighted markup:

  - replace TABs with something more useful
  - replace real line-breaks with '<br>' for non-pre containers

  */
  function fixMarkup(value, tabReplace, useBR) {
    if (tabReplace) {
      value = value.replace(/^((<[^>]+>|\t)+)/gm, function(match, p1, offset, s) {
        return p1.replace(/\t/g, tabReplace);
      });
    }
    if (useBR) {
      value = value.replace(/\n/g, '<br>');
    }
    return value;
  }

  /*
  Applies highlighting to a DOM node containing code. Accepts a DOM node and
  two optional parameters for fixMarkup.
  */
  function highlightBlock(block, tabReplace, useBR) {
    var text = blockText(block, useBR);
    var language = blockLanguage(block);
    if (language == 'no-highlight')
        return;
    var result = language ? highlight(language, text) : highlightAuto(text);
    language = result.language;
    var original = nodeStream(block);
    if (original.length) {
      var pre = document.createElement('pre');
      pre.innerHTML = result.value;
      result.value = mergeStreams(original, nodeStream(pre), text);
    }
    result.value = fixMarkup(result.value, tabReplace, useBR);

    var class_name = block.className;
    if (!class_name.match('(\\s|^)(language-)?' + language + '(\\s|$)')) {
      class_name = class_name ? (class_name + ' ' + language) : language;
    }
    block.innerHTML = result.value;
    block.className = class_name;
    block.result = {
      language: language,
      kw: result.keyword_count,
      re: result.relevance
    };
    if (result.second_best) {
      block.second_best = {
        language: result.second_best.language,
        kw: result.second_best.keyword_count,
        re: result.second_best.relevance
      };
    }
  }

  /*
  Applies highlighting to all <pre><code>..</code></pre> blocks on a page.
  */
  function initHighlighting() {
    if (initHighlighting.called)
      return;
    initHighlighting.called = true;
    Array.prototype.map.call(document.getElementsByTagName('pre'), findCode).
      filter(Boolean).
      forEach(function(code){highlightBlock(code, hljs.tabReplace)});
  }

  /*
  Attaches highlighting to the page load event.
  */
  function initHighlightingOnLoad() {
    window.addEventListener('DOMContentLoaded', initHighlighting, false);
    window.addEventListener('load', initHighlighting, false);
  }

  var languages = {}; // a shortcut to avoid writing "this." everywhere

  /* Interface definition */

  this.LANGUAGES = languages;
  this.highlight = highlight;
  this.highlightAuto = highlightAuto;
  this.fixMarkup = fixMarkup;
  this.highlightBlock = highlightBlock;
  this.initHighlighting = initHighlighting;
  this.initHighlightingOnLoad = initHighlightingOnLoad;

  // Common regexps
  this.IDENT_RE = '[a-zA-Z][a-zA-Z0-9_]*';
  this.UNDERSCORE_IDENT_RE = '[a-zA-Z_][a-zA-Z0-9_]*';
  this.NUMBER_RE = '\\b\\d+(\\.\\d+)?';
  this.C_NUMBER_RE = '(\\b0[xX][a-fA-F0-9]+|(\\b\\d+(\\.\\d*)?|\\.\\d+)([eE][-+]?\\d+)?)'; // 0x..., 0..., decimal, float
  this.BINARY_NUMBER_RE = '\\b(0b[01]+)'; // 0b...
  this.RE_STARTERS_RE = '!|!=|!==|%|%=|&|&&|&=|\\*|\\*=|\\+|\\+=|,|\\.|-|-=|/|/=|:|;|<|<<|<<=|<=|=|==|===|>|>=|>>|>>=|>>>|>>>=|\\?|\\[|\\{|\\(|\\^|\\^=|\\||\\|=|\\|\\||~';

  // Common modes
  this.BACKSLASH_ESCAPE = {
    begin: '\\\\[\\s\\S]', relevance: 0
  };
  this.APOS_STRING_MODE = {
    className: 'string',
    begin: '\'', end: '\'',
    illegal: '\\n',
    contains: [this.BACKSLASH_ESCAPE],
    relevance: 0
  };
  this.QUOTE_STRING_MODE = {
    className: 'string',
    begin: '"', end: '"',
    illegal: '\\n',
    contains: [this.BACKSLASH_ESCAPE],
    relevance: 0
  };
  this.C_LINE_COMMENT_MODE = {
    className: 'comment',
    begin: '//', end: '$'
  };
  this.C_BLOCK_COMMENT_MODE = {
    className: 'comment',
    begin: '/\\*', end: '\\*/'
  };
  this.HASH_COMMENT_MODE = {
    className: 'comment',
    begin: '#', end: '$'
  };
  this.NUMBER_MODE = {
    className: 'number',
    begin: this.NUMBER_RE,
    relevance: 0
  };
  this.C_NUMBER_MODE = {
    className: 'number',
    begin: this.C_NUMBER_RE,
    relevance: 0
  };
  this.BINARY_NUMBER_MODE = {
    className: 'number',
    begin: this.BINARY_NUMBER_RE,
    relevance: 0
  };

  // Utility functions
  this.inherit = function(parent, obj) {
    var result = {}
    for (var key in parent)
      result[key] = parent[key];
    if (obj)
      for (var key in obj)
        result[key] = obj[key];
    return result;
  }
}
();
hljs.LANGUAGES.javascript = (/*
Language: JavaScript
*/

function(hljs) {
  return {
    keywords: {
      keyword:
        'in if for while finally var new function do return void else break catch ' +
        'instanceof with throw case default try this switch continue typeof delete ' +
        'let yield const',
      literal:
        'true false null undefined NaN Infinity'
    },
    contains: [
      hljs.APOS_STRING_MODE,
      hljs.QUOTE_STRING_MODE,
      hljs.C_LINE_COMMENT_MODE,
      hljs.C_BLOCK_COMMENT_MODE,
      hljs.C_NUMBER_MODE,
      { // "value" container
        begin: '(' + hljs.RE_STARTERS_RE + '|\\b(case|return|throw)\\b)\\s*',
        keywords: 'return throw case',
        contains: [
          hljs.C_LINE_COMMENT_MODE,
          hljs.C_BLOCK_COMMENT_MODE,
          {
            className: 'regexp',
            begin: '/', end: '/[gim]*',
            illegal: '\\n',
            contains: [{begin: '\\\\/'}]
          },
          { // E4X
            begin: '<', end: '>;',
            subLanguage: 'xml'
          }
        ],
        relevance: 0
      },
      {
        className: 'function',
        beginWithKeyword: true, end: '{',
        keywords: 'function',
        contains: [
          {
            className: 'title', begin: '[A-Za-z$_][0-9A-Za-z$_]*'
          },
          {
            className: 'params',
            begin: '\\(', end: '\\)',
            contains: [
              hljs.C_LINE_COMMENT_MODE,
              hljs.C_BLOCK_COMMENT_MODE
            ],
            illegal: '["\'\\(]'
          }
        ],
        illegal: '\\[|%'
      }
    ]
  };
}
)(hljs);
hljs.LANGUAGES.ruby = (/*
Language: Ruby
Author: Anton Kovalyov <anton@kovalyov.net>
Contributors: Peter Leonov <gojpeg@yandex.ru>, Vasily Polovnyov <vast@whiteants.net>, Loren Segal <lsegal@soen.ca>
*/

function(hljs) {
  var RUBY_IDENT_RE = '[a-zA-Z_][a-zA-Z0-9_]*(\\!|\\?)?';
  var RUBY_METHOD_RE = '[a-zA-Z_]\\w*[!?=]?|[-+~]\\@|<<|>>|=~|===?|<=>|[<>]=?|\\*\\*|[-/+%^&*~`|]|\\[\\]=?';
  var RUBY_KEYWORDS = {
    keyword:
      'and false then defined module in return redo if BEGIN retry end for true self when ' +
      'next until do begin unless END rescue nil else break undef not super class case ' +
      'require yield alias while ensure elsif or include'
  };
  var YARDOCTAG = {
    className: 'yardoctag',
    begin: '@[A-Za-z]+'
  };
  var COMMENTS = [
    {
      className: 'comment',
      begin: '#', end: '$',
      contains: [YARDOCTAG]
    },
    {
      className: 'comment',
      begin: '^\\=begin', end: '^\\=end',
      contains: [YARDOCTAG],
      relevance: 10
    },
    {
      className: 'comment',
      begin: '^__END__', end: '\\n$'
    }
  ];
  var SUBST = {
    className: 'subst',
    begin: '#\\{', end: '}',
    lexems: RUBY_IDENT_RE,
    keywords: RUBY_KEYWORDS
  };
  var STR_CONTAINS = [hljs.BACKSLASH_ESCAPE, SUBST];
  var STRINGS = [
    {
      className: 'string',
      begin: '\'', end: '\'',
      contains: STR_CONTAINS,
      relevance: 0
    },
    {
      className: 'string',
      begin: '"', end: '"',
      contains: STR_CONTAINS,
      relevance: 0
    },
    {
      className: 'string',
      begin: '%[qw]?\\(', end: '\\)',
      contains: STR_CONTAINS
    },
    {
      className: 'string',
      begin: '%[qw]?\\[', end: '\\]',
      contains: STR_CONTAINS
    },
    {
      className: 'string',
      begin: '%[qw]?{', end: '}',
      contains: STR_CONTAINS
    },
    {
      className: 'string',
      begin: '%[qw]?<', end: '>',
      contains: STR_CONTAINS,
      relevance: 10
    },
    {
      className: 'string',
      begin: '%[qw]?/', end: '/',
      contains: STR_CONTAINS,
      relevance: 10
    },
    {
      className: 'string',
      begin: '%[qw]?%', end: '%',
      contains: STR_CONTAINS,
      relevance: 10
    },
    {
      className: 'string',
      begin: '%[qw]?-', end: '-',
      contains: STR_CONTAINS,
      relevance: 10
    },
    {
      className: 'string',
      begin: '%[qw]?\\|', end: '\\|',
      contains: STR_CONTAINS,
      relevance: 10
    }
  ];
  var FUNCTION = {
    className: 'function',
    beginWithKeyword: true, end: ' |$|;',
    keywords: 'def',
    contains: [
      {
        className: 'title',
        begin: RUBY_METHOD_RE,
        lexems: RUBY_IDENT_RE,
        keywords: RUBY_KEYWORDS
      },
      {
        className: 'params',
        begin: '\\(', end: '\\)',
        lexems: RUBY_IDENT_RE,
        keywords: RUBY_KEYWORDS
      }
    ].concat(COMMENTS)
  };

  var RUBY_DEFAULT_CONTAINS = COMMENTS.concat(STRINGS.concat([
    {
      className: 'class',
      beginWithKeyword: true, end: '$|;',
      keywords: 'class module',
      contains: [
        {
          className: 'title',
          begin: '[A-Za-z_]\\w*(::\\w+)*(\\?|\\!)?',
          relevance: 0
        },
        {
          className: 'inheritance',
          begin: '<\\s*',
          contains: [{
            className: 'parent',
            begin: '(' + hljs.IDENT_RE + '::)?' + hljs.IDENT_RE
          }]
        }
      ].concat(COMMENTS)
    },
    FUNCTION,
    {
      className: 'constant',
      begin: '(::)?(\\b[A-Z]\\w*(::)?)+',
      relevance: 0
    },
    {
      className: 'symbol',
      begin: ':',
      contains: STRINGS.concat([{begin: RUBY_IDENT_RE}]),
      relevance: 0
    },
    {
      className: 'number',
      begin: '(\\b0[0-7_]+)|(\\b0x[0-9a-fA-F_]+)|(\\b[1-9][0-9_]*(\\.[0-9_]+)?)|[0_]\\b',
      relevance: 0
    },
    {
      className: 'number',
      begin: '\\?\\w'
    },
    {
      className: 'variable',
      begin: '(\\$\\W)|((\\$|\\@\\@?)(\\w+))'
    },
    { // regexp container
      begin: '(' + hljs.RE_STARTERS_RE + ')\\s*',
      contains: COMMENTS.concat([
        {
          className: 'regexp',
          begin: '/', end: '/[a-z]*',
          illegal: '\\n',
          contains: [hljs.BACKSLASH_ESCAPE]
        }
      ]),
      relevance: 0
    }
  ]));
  SUBST.contains = RUBY_DEFAULT_CONTAINS;
  FUNCTION.contains[1].contains = RUBY_DEFAULT_CONTAINS;

  return {
    lexems: RUBY_IDENT_RE,
    keywords: RUBY_KEYWORDS,
    contains: RUBY_DEFAULT_CONTAINS
  };
}
)(hljs);
hljs.LANGUAGES.python = (/*
Language: Python
*/

function(hljs) {
  var STRINGS = [
    {
      className: 'string',
      begin: '(u|b)?r?\'\'\'', end: '\'\'\'',
      relevance: 10
    },
    {
      className: 'string',
      begin: '(u|b)?r?"""', end: '"""',
      relevance: 10
    },
    {
      className: 'string',
      begin: '(u|r|ur)\'', end: '\'',
      contains: [hljs.BACKSLASH_ESCAPE],
      relevance: 10
    },
    {
      className: 'string',
      begin: '(u|r|ur)"', end: '"',
      contains: [hljs.BACKSLASH_ESCAPE],
      relevance: 10
    },
    {
      className: 'string',
      begin: '(b|br)\'', end: '\'',
      contains: [hljs.BACKSLASH_ESCAPE]
    },
    {
      className: 'string',
      begin: '(b|br)"', end: '"',
      contains: [hljs.BACKSLASH_ESCAPE]
    }
  ].concat([
    hljs.APOS_STRING_MODE,
    hljs.QUOTE_STRING_MODE
  ]);
  var TITLE = {
    className: 'title', begin: hljs.UNDERSCORE_IDENT_RE
  };
  var PARAMS = {
    className: 'params',
    begin: '\\(', end: '\\)',
    contains: ['self', hljs.C_NUMBER_MODE].concat(STRINGS)
  };
  var FUNC_CLASS_PROTO = {
    beginWithKeyword: true, end: ':',
    illegal: '[${=;\\n]',
    contains: [TITLE, PARAMS],
    relevance: 10
  };

  return {
    keywords: {
      keyword:
        'and elif is global as in if from raise for except finally print import pass return ' +
        'exec else break not with class assert yield try while continue del or def lambda ' +
        'nonlocal|10',
      built_in:
        'None True False Ellipsis NotImplemented'
    },
    illegal: '(</|->|\\?)',
    contains: STRINGS.concat([
      hljs.HASH_COMMENT_MODE,
      hljs.inherit(FUNC_CLASS_PROTO, {className: 'function', keywords: 'def'}),
      hljs.inherit(FUNC_CLASS_PROTO, {className: 'class', keywords: 'class'}),
      hljs.C_NUMBER_MODE,
      {
        className: 'decorator',
        begin: '@', end: '$'
      },
      {
        begin: '\\b(print|exec)\\(' // don’t highlight keywords-turned-functions in Python 3
      }
    ])
  };
}
)(hljs);
hljs.LANGUAGES.bash = (/*
Language: Bash
Author: vah <vahtenberg@gmail.com>
*/

function(hljs) {
  var BASH_LITERAL = 'true false';
  var VAR1 = {
    className: 'variable', begin: '\\$[a-zA-Z0-9_]+\\b'
  };
  var VAR2 = {
    className: 'variable', begin: '\\${([^}]|\\\\})+}'
  };
  var QUOTE_STRING = {
    className: 'string',
    begin: '"', end: '"',
    illegal: '\\n',
    contains: [hljs.BACKSLASH_ESCAPE, VAR1, VAR2],
    relevance: 0
  };
  var APOS_STRING = {
    className: 'string',
    begin: '\'', end: '\'',
    contains: [{begin: '\'\''}],
    relevance: 0
  };
  var TEST_CONDITION = {
    className: 'test_condition',
    begin: '', end: '',
    contains: [QUOTE_STRING, APOS_STRING, VAR1, VAR2],
    keywords: {
      literal: BASH_LITERAL
    },
    relevance: 0
  };

  return {
    keywords: {
      keyword: 'if then else fi for break continue while in do done echo exit return set declare',
      literal: BASH_LITERAL
    },
    contains: [
      {
        className: 'shebang',
        begin: '(#!\\/bin\\/bash)|(#!\\/bin\\/sh)',
        relevance: 10
      },
      VAR1,
      VAR2,
      hljs.HASH_COMMENT_MODE,
      QUOTE_STRING,
      APOS_STRING,
      hljs.inherit(TEST_CONDITION, {begin: '\\[ ', end: ' \\]', relevance: 0}),
      hljs.inherit(TEST_CONDITION, {begin: '\\[\\[ ', end: ' \\]\\]'})
    ]
  };
}
)(hljs);
hljs.LANGUAGES.java = (/*
Language: Java
Author: Vsevolod Solovyov <vsevolod.solovyov@gmail.com>
*/

function(hljs) {
  return {
    keywords:
      'false synchronized int abstract float private char boolean static null if const ' +
      'for true while long throw strictfp finally protected import native final return void ' +
      'enum else break transient new catch instanceof byte super volatile case assert short ' +
      'package default double public try this switch continue throws',
    contains: [
      {
        className: 'javadoc',
        begin: '/\\*\\*', end: '\\*/',
        contains: [{
          className: 'javadoctag', begin: '@[A-Za-z]+'
        }],
        relevance: 10
      },
      hljs.C_LINE_COMMENT_MODE,
      hljs.C_BLOCK_COMMENT_MODE,
      hljs.APOS_STRING_MODE,
      hljs.QUOTE_STRING_MODE,
      {
        className: 'class',
        beginWithKeyword: true, end: '{',
        keywords: 'class interface',
        illegal: ':',
        contains: [
          {
            beginWithKeyword: true,
            keywords: 'extends implements',
            relevance: 10
          },
          {
            className: 'title',
            begin: hljs.UNDERSCORE_IDENT_RE
          }
        ]
      },
      hljs.C_NUMBER_MODE,
      {
        className: 'annotation', begin: '@[A-Za-z]+'
      }
    ]
  };
}
)(hljs);
hljs.LANGUAGES.php = (/*
Language: PHP
Author: Victor Karamzin <Victor.Karamzin@enterra-inc.com>
Contributors: Evgeny Stepanischev <imbolk@gmail.com>, Ivan Sagalaev <maniac@softwaremaniacs.org>
*/

function(hljs) {
  var VARIABLE = {
    className: 'variable', begin: '\\$+[a-zA-Z_\x7f-\xff][a-zA-Z0-9_\x7f-\xff]*'
  };
  var STRINGS = [
    hljs.inherit(hljs.APOS_STRING_MODE, {illegal: null}),
    hljs.inherit(hljs.QUOTE_STRING_MODE, {illegal: null}),
    {
      className: 'string',
      begin: 'b"', end: '"',
      contains: [hljs.BACKSLASH_ESCAPE]
    },
    {
      className: 'string',
      begin: 'b\'', end: '\'',
      contains: [hljs.BACKSLASH_ESCAPE]
    }
  ];
  var NUMBERS = [hljs.BINARY_NUMBER_MODE, hljs.C_NUMBER_MODE];
  var TITLE = {
    className: 'title', begin: hljs.UNDERSCORE_IDENT_RE
  };
  return {
    case_insensitive: true,
    keywords:
      'and include_once list abstract global private echo interface as static endswitch ' +
      'array null if endwhile or const for endforeach self var while isset public ' +
      'protected exit foreach throw elseif include __FILE__ empty require_once do xor ' +
      'return implements parent clone use __CLASS__ __LINE__ else break print eval new ' +
      'catch __METHOD__ case exception php_user_filter default die require __FUNCTION__ ' +
      'enddeclare final try this switch continue endfor endif declare unset true false ' +
      'namespace trait goto instanceof insteadof __DIR__ __NAMESPACE__ __halt_compiler',
    contains: [
      hljs.C_LINE_COMMENT_MODE,
      hljs.HASH_COMMENT_MODE,
      {
        className: 'comment',
        begin: '/\\*', end: '\\*/',
        contains: [{
            className: 'phpdoc',
            begin: '\\s@[A-Za-z]+'
        }]
      },
      {
          className: 'comment',
          excludeBegin: true,
          begin: '__halt_compiler.+?;', endsWithParent: true
      },
      {
        className: 'string',
        begin: '<<<[\'"]?\\w+[\'"]?$', end: '^\\w+;',
        contains: [hljs.BACKSLASH_ESCAPE]
      },
      {
        className: 'preprocessor',
        begin: '<\\?php',
        relevance: 10
      },
      {
        className: 'preprocessor',
        begin: '\\?>'
      },
      VARIABLE,
      {
        className: 'function',
        beginWithKeyword: true, end: '{',
        keywords: 'function',
        illegal: '\\$|\\[|%',
        contains: [
          TITLE,
          {
            className: 'params',
            begin: '\\(', end: '\\)',
            contains: [
              'self',
              VARIABLE,
              hljs.C_BLOCK_COMMENT_MODE
            ].concat(STRINGS).concat(NUMBERS)
          }
        ]
      },
      {
        className: 'class',
        beginWithKeyword: true, end: '{',
        keywords: 'class',
        illegal: '[:\\(\\$]',
        contains: [
          {
            beginWithKeyword: true, endsWithParent: true,
            keywords: 'extends',
            contains: [TITLE]
          },
          TITLE
        ]
      },
      {
        begin: '=>' // No markup, just a relevance booster
      }
    ].concat(STRINGS).concat(NUMBERS)
  };
}
)(hljs);
hljs.LANGUAGES.perl = (/*
Language: Perl
Author: Peter Leonov <gojpeg@yandex.ru>
*/

function(hljs) {
  var PERL_KEYWORDS = 'getpwent getservent quotemeta msgrcv scalar kill dbmclose undef lc ' +
    'ma syswrite tr send umask sysopen shmwrite vec qx utime local oct semctl localtime ' +
    'readpipe do return format read sprintf dbmopen pop getpgrp not getpwnam rewinddir qq' +
    'fileno qw endprotoent wait sethostent bless s|0 opendir continue each sleep endgrent ' +
    'shutdown dump chomp connect getsockname die socketpair close flock exists index shmget' +
    'sub for endpwent redo lstat msgctl setpgrp abs exit select print ref gethostbyaddr ' +
    'unshift fcntl syscall goto getnetbyaddr join gmtime symlink semget splice x|0 ' +
    'getpeername recv log setsockopt cos last reverse gethostbyname getgrnam study formline ' +
    'endhostent times chop length gethostent getnetent pack getprotoent getservbyname rand ' +
    'mkdir pos chmod y|0 substr endnetent printf next open msgsnd readdir use unlink ' +
    'getsockopt getpriority rindex wantarray hex system getservbyport endservent int chr ' +
    'untie rmdir prototype tell listen fork shmread ucfirst setprotoent else sysseek link ' +
    'getgrgid shmctl waitpid unpack getnetbyname reset chdir grep split require caller ' +
    'lcfirst until warn while values shift telldir getpwuid my getprotobynumber delete and ' +
    'sort uc defined srand accept package seekdir getprotobyname semop our rename seek if q|0 ' +
    'chroot sysread setpwent no crypt getc chown sqrt write setnetent setpriority foreach ' +
    'tie sin msgget map stat getlogin unless elsif truncate exec keys glob tied closedir' +
    'ioctl socket readlink eval xor readline binmode setservent eof ord bind alarm pipe ' +
    'atan2 getgrent exp time push setgrent gt lt or ne m|0 break given say state when';
  var SUBST = {
    className: 'subst',
    begin: '[$@]\\{', end: '\\}',
    keywords: PERL_KEYWORDS,
    relevance: 10
  };
  var VAR1 = {
    className: 'variable',
    begin: '\\$\\d'
  };
  var VAR2 = {
    className: 'variable',
    begin: '[\\$\\%\\@\\*](\\^\\w\\b|#\\w+(\\:\\:\\w+)*|[^\\s\\w{]|{\\w+}|\\w+(\\:\\:\\w*)*)'
  };
  var STRING_CONTAINS = [hljs.BACKSLASH_ESCAPE, SUBST, VAR1, VAR2];
  var METHOD = {
    begin: '->',
    contains: [
      {begin: hljs.IDENT_RE},
      {begin: '{', end: '}'}
    ]
  };
  var COMMENT = {
    className: 'comment',
    begin: '^(__END__|__DATA__)', end: '\\n$',
    relevance: 5
  }
  var PERL_DEFAULT_CONTAINS = [
    VAR1, VAR2,
    hljs.HASH_COMMENT_MODE,
    COMMENT,
    {
      className: 'comment',
      begin: '^\\=\\w', end: '\\=cut', endsWithParent: true
    },
    METHOD,
    {
      className: 'string',
      begin: 'q[qwxr]?\\s*\\(', end: '\\)',
      contains: STRING_CONTAINS,
      relevance: 5
    },
    {
      className: 'string',
      begin: 'q[qwxr]?\\s*\\[', end: '\\]',
      contains: STRING_CONTAINS,
      relevance: 5
    },
    {
      className: 'string',
      begin: 'q[qwxr]?\\s*\\{', end: '\\}',
      contains: STRING_CONTAINS,
      relevance: 5
    },
    {
      className: 'string',
      begin: 'q[qwxr]?\\s*\\|', end: '\\|',
      contains: STRING_CONTAINS,
      relevance: 5
    },
    {
      className: 'string',
      begin: 'q[qwxr]?\\s*\\<', end: '\\>',
      contains: STRING_CONTAINS,
      relevance: 5
    },
    {
      className: 'string',
      begin: 'qw\\s+q', end: 'q',
      contains: STRING_CONTAINS,
      relevance: 5
    },
    {
      className: 'string',
      begin: '\'', end: '\'',
      contains: [hljs.BACKSLASH_ESCAPE],
      relevance: 0
    },
    {
      className: 'string',
      begin: '"', end: '"',
      contains: STRING_CONTAINS,
      relevance: 0
    },
    {
      className: 'string',
      begin: '`', end: '`',
      contains: [hljs.BACKSLASH_ESCAPE]
    },
    {
      className: 'string',
      begin: '{\\w+}',
      relevance: 0
    },
    {
      className: 'string',
      begin: '\-?\\w+\\s*\\=\\>',
      relevance: 0
    },
    {
      className: 'number',
      begin: '(\\b0[0-7_]+)|(\\b0x[0-9a-fA-F_]+)|(\\b[1-9][0-9_]*(\\.[0-9_]+)?)|[0_]\\b',
      relevance: 0
    },
    { // regexp container
      begin: '(' + hljs.RE_STARTERS_RE + '|\\b(split|return|print|reverse|grep)\\b)\\s*',
      keywords: 'split return print reverse grep',
      relevance: 0,
      contains: [
        hljs.HASH_COMMENT_MODE,
        COMMENT,
        {
          className: 'regexp',
          begin: '(s|tr|y)/(\\\\.|[^/])*/(\\\\.|[^/])*/[a-z]*',
          relevance: 10
        },
        {
          className: 'regexp',
          begin: '(m|qr)?/', end: '/[a-z]*',
          contains: [hljs.BACKSLASH_ESCAPE],
          relevance: 0 // allows empty "//" which is a common comment delimiter in other languages
        }
      ]
    },
    {
      className: 'sub',
      beginWithKeyword: true, end: '(\\s*\\(.*?\\))?[;{]',
      keywords: 'sub',
      relevance: 5
    },
    {
      className: 'operator',
      begin: '-\\w\\b',
      relevance: 0
    }
  ];
  SUBST.contains = PERL_DEFAULT_CONTAINS;
  METHOD.contains[1].contains = PERL_DEFAULT_CONTAINS;

  return {
    keywords: PERL_KEYWORDS,
    contains: PERL_DEFAULT_CONTAINS
  };
}
)(hljs);
hljs.LANGUAGES.cpp = (/*
Language: C++
Contributors: Evgeny Stepanischev <imbolk@gmail.com>
*/

function(hljs) {
  var CPP_KEYWORDS = {
    keyword: 'false int float while private char catch export virtual operator sizeof ' +
      'dynamic_cast|10 typedef const_cast|10 const struct for static_cast|10 union namespace ' +
      'unsigned long throw volatile static protected bool template mutable if public friend ' +
      'do return goto auto void enum else break new extern using true class asm case typeid ' +
      'short reinterpret_cast|10 default double register explicit signed typename try this ' +
      'switch continue wchar_t inline delete alignof char16_t char32_t constexpr decltype ' +
      'noexcept nullptr static_assert thread_local restrict _Bool complex',
    built_in: 'std string cin cout cerr clog stringstream istringstream ostringstream ' +
      'auto_ptr deque list queue stack vector map set bitset multiset multimap unordered_set ' +
      'unordered_map unordered_multiset unordered_multimap array shared_ptr'
  };
  return {
    keywords: CPP_KEYWORDS,
    illegal: '</',
    contains: [
      hljs.C_LINE_COMMENT_MODE,
      hljs.C_BLOCK_COMMENT_MODE,
      hljs.QUOTE_STRING_MODE,
      {
        className: 'string',
        begin: '\'\\\\?.', end: '\'',
        illegal: '.'
      },
      {
        className: 'number',
        begin: '\\b(\\d+(\\.\\d*)?|\\.\\d+)(u|U|l|L|ul|UL|f|F)'
      },
      hljs.C_NUMBER_MODE,
      {
        className: 'preprocessor',
        begin: '#', end: '$'
      },
      {
        className: 'stl_container',
        begin: '\\b(deque|list|queue|stack|vector|map|set|bitset|multiset|multimap|unordered_map|unordered_set|unordered_multiset|unordered_multimap|array)\\s*<', end: '>',
        keywords: CPP_KEYWORDS,
        relevance: 10,
        contains: ['self']
      }
    ]
  };
}
)(hljs);
hljs.LANGUAGES.objectivec = (/*
Language: Objective C
Author: Valerii Hiora <valerii.hiora@gmail.com>
Contributors: Angel G. Olloqui <angelgarcia.mail@gmail.com>
*/

function(hljs) {
  var OBJC_KEYWORDS = {
    keyword:
      'int float while private char catch export sizeof typedef const struct for union ' +
      'unsigned long volatile static protected bool mutable if public do return goto void ' +
      'enum else break extern class asm case short default double throw register explicit ' +
      'signed typename try this switch continue wchar_t inline readonly assign property ' +
      'protocol self synchronized end synthesize id optional required implementation ' +
      'nonatomic interface super unichar finally dynamic IBOutlet IBAction selector strong ' +
      'weak readonly',
    literal:
    	'false true FALSE TRUE nil YES NO NULL',
    built_in:
      'NSString NSDictionary CGRect CGPoint UIButton UILabel UITextView UIWebView MKMapView ' +
      'UISegmentedControl NSObject UITableViewDelegate UITableViewDataSource NSThread ' +
      'UIActivityIndicator UITabbar UIToolBar UIBarButtonItem UIImageView NSAutoreleasePool ' +
      'UITableView BOOL NSInteger CGFloat NSException NSLog NSMutableString NSMutableArray ' +
      'NSMutableDictionary NSURL NSIndexPath CGSize UITableViewCell UIView UIViewController ' +
      'UINavigationBar UINavigationController UITabBarController UIPopoverController ' +
      'UIPopoverControllerDelegate UIImage NSNumber UISearchBar NSFetchedResultsController ' +
      'NSFetchedResultsChangeType UIScrollView UIScrollViewDelegate UIEdgeInsets UIColor ' +
      'UIFont UIApplication NSNotFound NSNotificationCenter NSNotification ' +
      'UILocalNotification NSBundle NSFileManager NSTimeInterval NSDate NSCalendar ' +
      'NSUserDefaults UIWindow NSRange NSArray NSError NSURLRequest NSURLConnection class ' +
      'UIInterfaceOrientation MPMoviePlayerController dispatch_once_t ' +
      'dispatch_queue_t dispatch_sync dispatch_async dispatch_once'
  };
  return {
    keywords: OBJC_KEYWORDS,
    illegal: '</',
    contains: [
      hljs.C_LINE_COMMENT_MODE,
      hljs.C_BLOCK_COMMENT_MODE,
      hljs.C_NUMBER_MODE,
      hljs.QUOTE_STRING_MODE,
      {
        className: 'string',
        begin: '\'',
        end: '[^\\\\]\'',
        illegal: '[^\\\\][^\']'
      },

      {
        className: 'preprocessor',
        begin: '#import',
        end: '$',
        contains: [
        {
          className: 'title',
          begin: '\"',
          end: '\"'
        },
        {
          className: 'title',
          begin: '<',
          end: '>'
        }
        ]
      },
      {
        className: 'preprocessor',
        begin: '#',
        end: '$'
      },
      {
        className: 'class',
        beginWithKeyword: true,
        end: '({|$)',
        keywords: 'interface class protocol implementation',
        contains: [{
          className: 'id',
          begin: hljs.UNDERSCORE_IDENT_RE
        }
        ]
      },
      {
        className: 'variable',
        begin: '\\.'+hljs.UNDERSCORE_IDENT_RE
      }
    ]
  };
}
)(hljs);
hljs.LANGUAGES.cs = (/*
Language: C#
Author: Jason Diamond <jason@diamond.name>
*/

function(hljs) {
  return {
    keywords:
      // Normal keywords.
      'abstract as base bool break byte case catch char checked class const continue decimal ' +
      'default delegate do double else enum event explicit extern false finally fixed float ' +
      'for foreach goto if implicit in int interface internal is lock long namespace new null ' +
      'object operator out override params private protected public readonly ref return sbyte ' +
      'sealed short sizeof stackalloc static string struct switch this throw true try typeof ' +
      'uint ulong unchecked unsafe ushort using virtual volatile void while ' +
      // Contextual keywords.
      'ascending descending from get group into join let orderby partial select set value var '+
      'where yield',
    contains: [
      {
        className: 'comment',
        begin: '///', end: '$', returnBegin: true,
        contains: [
          {
            className: 'xmlDocTag',
            begin: '///|<!--|-->'
          },
          {
            className: 'xmlDocTag',
            begin: '</?', end: '>'
          }
        ]
      },
      hljs.C_LINE_COMMENT_MODE,
      hljs.C_BLOCK_COMMENT_MODE,
      {
        className: 'preprocessor',
        begin: '#', end: '$',
        keywords: 'if else elif endif define undef warning error line region endregion pragma checksum'
      },
      {
        className: 'string',
        begin: '@"', end: '"',
        contains: [{begin: '""'}]
      },
      hljs.APOS_STRING_MODE,
      hljs.QUOTE_STRING_MODE,
      hljs.C_NUMBER_MODE
    ]
  };
}
)(hljs);
hljs.LANGUAGES.sql = (/*
Language: SQL
*/

function(hljs) {
  return {
    case_insensitive: true,
    illegal: '[^\\s]',
    contains: [
      {
        className: 'operator',
        begin: '(begin|start|commit|rollback|savepoint|lock|alter|create|drop|rename|call|delete|do|handler|insert|load|replace|select|truncate|update|set|show|pragma|grant)\\b', end: ';', endsWithParent: true,
        keywords: {
          keyword: 'all partial global month current_timestamp using go revoke smallint ' +
            'indicator end-exec disconnect zone with character assertion to add current_user ' +
            'usage input local alter match collate real then rollback get read timestamp ' +
            'session_user not integer bit unique day minute desc insert execute like ilike|2 ' +
            'level decimal drop continue isolation found where constraints domain right ' +
            'national some module transaction relative second connect escape close system_user ' +
            'for deferred section cast current sqlstate allocate intersect deallocate numeric ' +
            'public preserve full goto initially asc no key output collation group by union ' +
            'session both last language constraint column of space foreign deferrable prior ' +
            'connection unknown action commit view or first into float year primary cascaded ' +
            'except restrict set references names table outer open select size are rows from ' +
            'prepare distinct leading create only next inner authorization schema ' +
            'corresponding option declare precision immediate else timezone_minute external ' +
            'varying translation true case exception join hour default double scroll value ' +
            'cursor descriptor values dec fetch procedure delete and false int is describe ' +
            'char as at in varchar null trailing any absolute current_time end grant ' +
            'privileges when cross check write current_date pad begin temporary exec time ' +
            'update catalog user sql date on identity timezone_hour natural whenever interval ' +
            'work order cascade diagnostics nchar having left call do handler load replace ' +
            'truncate start lock show pragma',
          aggregate: 'count sum min max avg'
        },
        contains: [
          {
            className: 'string',
            begin: '\'', end: '\'',
            contains: [hljs.BACKSLASH_ESCAPE, {begin: '\'\''}],
            relevance: 0
          },
          {
            className: 'string',
            begin: '"', end: '"',
            contains: [hljs.BACKSLASH_ESCAPE, {begin: '""'}],
            relevance: 0
          },
          {
            className: 'string',
            begin: '`', end: '`',
            contains: [hljs.BACKSLASH_ESCAPE]
          },
          hljs.C_NUMBER_MODE
        ]
      },
      hljs.C_BLOCK_COMMENT_MODE,
      {
        className: 'comment',
        begin: '--', end: '$'
      }
    ]
  };
}
)(hljs);
hljs.LANGUAGES.xml = (/*
Language: HTML, XML
*/

function(hljs) {
  var XML_IDENT_RE = '[A-Za-z0-9\\._:-]+';
  var TAG_INTERNALS = {
    endsWithParent: true,
    contains: [
      {
        className: 'attribute',
        begin: XML_IDENT_RE,
        relevance: 0
      },
      {
        begin: '="', returnBegin: true, end: '"',
        contains: [{
            className: 'value',
            begin: '"', endsWithParent: true
        }]
      },
      {
        begin: '=\'', returnBegin: true, end: '\'',
        contains: [{
          className: 'value',
          begin: '\'', endsWithParent: true
        }]
      },
      {
        begin: '=',
        contains: [{
          className: 'value',
          begin: '[^\\s/>]+'
        }]
      }
    ]
  };
  return {
    case_insensitive: true,
    contains: [
      {
        className: 'pi',
        begin: '<\\?', end: '\\?>',
        relevance: 10
      },
      {
        className: 'doctype',
        begin: '<!DOCTYPE', end: '>',
        relevance: 10,
        contains: [{begin: '\\[', end: '\\]'}]
      },
      {
        className: 'comment',
        begin: '<!--', end: '-->',
        relevance: 10
      },
      {
        className: 'cdata',
        begin: '<\\!\\[CDATA\\[', end: '\\]\\]>',
        relevance: 10
      },
      {
        className: 'tag',
        /*
        The lookahead pattern (?=...) ensures that 'begin' only matches
        '<style' as a single word, followed by a whitespace or an
        ending braket. The '$' is needed for the lexem to be recognized
        by hljs.subMode() that tests lexems outside the stream.
        */
        begin: '<style(?=\\s|>|$)', end: '>',
        keywords: {title: 'style'},
        contains: [TAG_INTERNALS],
        starts: {
          end: '</style>', returnEnd: true,
          subLanguage: 'css'
        }
      },
      {
        className: 'tag',
        // See the comment in the <style tag about the lookahead pattern
        begin: '<script(?=\\s|>|$)', end: '>',
        keywords: {title: 'script'},
        contains: [TAG_INTERNALS],
        starts: {
          end: '</script>', returnEnd: true,
          subLanguage: 'javascript'
        }
      },
      {
        begin: '<%', end: '%>',
        subLanguage: 'vbscript'
      },
      {
        className: 'tag',
        begin: '</?', end: '/?>',
        contains: [
          {
            className: 'title', begin: '[^ />]+'
          },
          TAG_INTERNALS
        ]
      }
    ]
  };
}
)(hljs);
hljs.LANGUAGES.css = (/*
Language: CSS
*/

function(hljs) {
  var FUNCTION = {
    className: 'function',
    begin: hljs.IDENT_RE + '\\(', end: '\\)',
    contains: [hljs.NUMBER_MODE, hljs.APOS_STRING_MODE, hljs.QUOTE_STRING_MODE]
  };
  return {
    case_insensitive: true,
    illegal: '[=/|\']',
    contains: [
      hljs.C_BLOCK_COMMENT_MODE,
      {
        className: 'id', begin: '\\#[A-Za-z0-9_-]+'
      },
      {
        className: 'class', begin: '\\.[A-Za-z0-9_-]+',
        relevance: 0
      },
      {
        className: 'attr_selector',
        begin: '\\[', end: '\\]',
        illegal: '$'
      },
      {
        className: 'pseudo',
        begin: ':(:)?[a-zA-Z0-9\\_\\-\\+\\(\\)\\"\\\']+'
      },
      {
        className: 'at_rule',
        begin: '@(font-face|page)',
        lexems: '[a-z-]+',
        keywords: 'font-face page'
      },
      {
        className: 'at_rule',
        begin: '@', end: '[{;]', // at_rule eating first "{" is a good thing
                                 // because it doesn’t let it to be parsed as
                                 // a rule set but instead drops parser into
                                 // the default mode which is how it should be.
        excludeEnd: true,
        keywords: 'import page media charset',
        contains: [
          FUNCTION,
          hljs.APOS_STRING_MODE, hljs.QUOTE_STRING_MODE,
          hljs.NUMBER_MODE
        ]
      },
      {
        className: 'tag', begin: hljs.IDENT_RE,
        relevance: 0
      },
      {
        className: 'rules',
        begin: '{', end: '}',
        illegal: '[^\\s]',
        relevance: 0,
        contains: [
          hljs.C_BLOCK_COMMENT_MODE,
          {
            className: 'rule',
            begin: '[^\\s]', returnBegin: true, end: ';', endsWithParent: true,
            contains: [
              {
                className: 'attribute',
                begin: '[A-Z\\_\\.\\-]+', end: ':',
                excludeEnd: true,
                illegal: '[^\\s]',
                starts: {
                  className: 'value',
                  endsWithParent: true, excludeEnd: true,
                  contains: [
                    FUNCTION,
                    hljs.NUMBER_MODE,
                    hljs.QUOTE_STRING_MODE,
                    hljs.APOS_STRING_MODE,
                    hljs.C_BLOCK_COMMENT_MODE,
                    {
                      className: 'hexcolor', begin: '\\#[0-9A-F]+'
                    },
                    {
                      className: 'important', begin: '!important'
                    }
                  ]
                }
              }
            ]
          }
        ]
      }
    ]
  };
}
)(hljs);
hljs.LANGUAGES.scala = (/*
Language: Scala
Author: Jan Berkel <jan.berkel@gmail.com>
*/

function(hljs) {
  var ANNOTATION = {
    className: 'annotation', begin: '@[A-Za-z]+'
  };
  var STRING = {
    className: 'string',
    begin: 'u?r?"""', end: '"""',
    relevance: 10
  };
  return {
    keywords:
      'type yield lazy override def with val var false true sealed abstract private trait ' +
      'object null if for while throw finally protected extends import final return else ' +
      'break new catch super class case package default try this match continue throws',
    contains: [
      {
        className: 'javadoc',
        begin: '/\\*\\*', end: '\\*/',
        contains: [{
          className: 'javadoctag',
          begin: '@[A-Za-z]+'
        }],
        relevance: 10
      },
      hljs.C_LINE_COMMENT_MODE, hljs.C_BLOCK_COMMENT_MODE,
      hljs.APOS_STRING_MODE, hljs.QUOTE_STRING_MODE, STRING,
      {
        className: 'class',
        begin: '((case )?class |object |trait )', end: '({|$)', // beginWithKeyword won't work because a single "case" shouldn't start this mode
        illegal: ':',
        keywords: 'case class trait object',
        contains: [
          {
            beginWithKeyword: true,
            keywords: 'extends with',
            relevance: 10
          },
          {
            className: 'title',
            begin: hljs.UNDERSCORE_IDENT_RE
          },
          {
            className: 'params',
            begin: '\\(', end: '\\)',
            contains: [
              hljs.APOS_STRING_MODE, hljs.QUOTE_STRING_MODE, STRING,
              ANNOTATION
            ]
          }
        ]
      },
      hljs.C_NUMBER_MODE,
      ANNOTATION
    ]
  };
}
)(hljs);
hljs.LANGUAGES.coffeescript = (/*
Language: CoffeeScript
Author: Dmytrii Nagirniak <dnagir@gmail.com>
Contributors: Oleg Efimov <efimovov@gmail.com>
Description: CoffeeScript is a programming language that transcompiles to JavaScript. For info about language see http://coffeescript.org/
*/

function(hljs) {
  var KEYWORDS = {
    keyword:
      // JS keywords
      'in if for while finally new do return else break catch instanceof throw try this ' +
      'switch continue typeof delete debugger super ' +
      // Coffee keywords
      'then unless until loop of by when and or is isnt not',
    literal:
      // JS literals
      'true false null undefined ' +
      // Coffee literals
      'yes no on off ',
    reserved: 'case default function var void with const let enum export import native ' +
      '__hasProp __extends __slice __bind __indexOf'
  };
  var JS_IDENT_RE = '[A-Za-z$_][0-9A-Za-z$_]*';
  var TITLE = {className: 'title', begin: JS_IDENT_RE};
  var SUBST = {
    className: 'subst',
    begin: '#\\{', end: '}',
    keywords: KEYWORDS,
    contains: [hljs.BINARY_NUMBER_MODE, hljs.C_NUMBER_MODE]
  };

  return {
    keywords: KEYWORDS,
    contains: [
      // Numbers
      hljs.BINARY_NUMBER_MODE,
      hljs.C_NUMBER_MODE,
      // Strings
      hljs.APOS_STRING_MODE,
      {
        className: 'string',
        begin: '"""', end: '"""',
        contains: [hljs.BACKSLASH_ESCAPE, SUBST]
      },
      {
        className: 'string',
        begin: '"', end: '"',
        contains: [hljs.BACKSLASH_ESCAPE, SUBST],
        relevance: 0
      },
      // Comments
      {
        className: 'comment',
        begin: '###', end: '###'
      },
      hljs.HASH_COMMENT_MODE,
      {
        className: 'regexp',
        begin: '///', end: '///',
        contains: [hljs.HASH_COMMENT_MODE]
      },
      {
        className: 'regexp', begin: '//[gim]*'
      },
      {
        className: 'regexp',
        begin: '/\\S(\\\\.|[^\\n])*/[gim]*' // \S is required to parse x / 2 / 3 as two divisions
      },
      {
        begin: '`', end: '`',
        excludeBegin: true, excludeEnd: true,
        subLanguage: 'javascript'
      },
      {
        className: 'function',
        begin: JS_IDENT_RE + '\\s*=\\s*(\\(.+\\))?\\s*[-=]>',
        returnBegin: true,
        contains: [
          TITLE,
          {
            className: 'params',
            begin: '\\(', end: '\\)'
          }
        ]
      },
      {
        className: 'class',
        beginWithKeyword: true, keywords: 'class',
        end: '$',
        illegal: ':',
        contains: [
          {
            beginWithKeyword: true, keywords: 'extends',
            endsWithParent: true,
            illegal: ':',
            contains: [TITLE]
          },
          TITLE
        ]
      },
      {
        className: 'property',
        begin: '@' + JS_IDENT_RE
      }
    ]
  };
}
)(hljs);
hljs.LANGUAGES.lisp = (/*
Language: Lisp
Description: Generic lisp syntax
Author: Vasily Polovnyov <vast@whiteants.net>
*/

function(hljs) {
  var LISP_IDENT_RE = '[a-zA-Z_\\-\\+\\*\\/\\<\\=\\>\\&\\#][a-zA-Z0-9_\\-\\+\\*\\/\\<\\=\\>\\&\\#]*';
  var LISP_SIMPLE_NUMBER_RE = '(\\-|\\+)?\\d+(\\.\\d+|\\/\\d+)?((d|e|f|l|s)(\\+|\\-)?\\d+)?';
  var LITERAL = {
    className: 'literal',
    begin: '\\b(t{1}|nil)\\b'
  };
  var NUMBERS = [
    {
      className: 'number', begin: LISP_SIMPLE_NUMBER_RE
    },
    {
      className: 'number', begin: '#b[0-1]+(/[0-1]+)?'
    },
    {
      className: 'number', begin: '#o[0-7]+(/[0-7]+)?'
    },
    {
      className: 'number', begin: '#x[0-9a-f]+(/[0-9a-f]+)?'
    },
    {
      className: 'number', begin: '#c\\(' + LISP_SIMPLE_NUMBER_RE + ' +' + LISP_SIMPLE_NUMBER_RE, end: '\\)'
    }
  ]
  var STRING = {
    className: 'string',
    begin: '"', end: '"',
    contains: [hljs.BACKSLASH_ESCAPE],
    relevance: 0
  };
  var COMMENT = {
    className: 'comment',
    begin: ';', end: '$'
  };
  var VARIABLE = {
    className: 'variable',
    begin: '\\*', end: '\\*'
  };
  var KEYWORD = {
    className: 'keyword',
    begin: '[:&]' + LISP_IDENT_RE
  };
  var QUOTED_LIST = {
    begin: '\\(', end: '\\)',
    contains: ['self', LITERAL, STRING].concat(NUMBERS)
  };
  var QUOTED1 = {
    className: 'quoted',
    begin: '[\'`]\\(', end: '\\)',
    contains: NUMBERS.concat([STRING, VARIABLE, KEYWORD, QUOTED_LIST])
  };
  var QUOTED2 = {
    className: 'quoted',
    begin: '\\(quote ', end: '\\)',
    keywords: {title: 'quote'},
    contains: NUMBERS.concat([STRING, VARIABLE, KEYWORD, QUOTED_LIST])
  };
  var LIST = {
    className: 'list',
    begin: '\\(', end: '\\)'
  };
  var BODY = {
    className: 'body',
    endsWithParent: true, excludeEnd: true
  };
  LIST.contains = [{className: 'title', begin: LISP_IDENT_RE}, BODY];
  BODY.contains = [QUOTED1, QUOTED2, LIST, LITERAL].concat(NUMBERS).concat([STRING, COMMENT, VARIABLE, KEYWORD]);

  return {
    illegal: '[^\\s]',
    contains: NUMBERS.concat([
      LITERAL,
      STRING,
      COMMENT,
      QUOTED1, QUOTED2,
      LIST
    ])
  };
}
)(hljs);
hljs.LANGUAGES.clojure = (/*
Language: Clojure
Description: Clojure syntax (based on lisp.js)
Author: mfornos
*/

function(hljs) {
  var keywords = {
    built_in:
      // Clojure keywords
      'def cond apply if-not if-let if not not= = &lt; < > &lt;= <= >= == + / * - rem '+
      'quot neg? pos? delay? symbol? keyword? true? false? integer? empty? coll? list? '+
      'set? ifn? fn? associative? sequential? sorted? counted? reversible? number? decimal? '+
      'class? distinct? isa? float? rational? reduced? ratio? odd? even? char? seq? vector? '+
      'string? map? nil? contains? zero? instance? not-every? not-any? libspec? -> ->> .. . '+
      'inc compare do dotimes mapcat take remove take-while drop letfn drop-last take-last '+
      'drop-while while intern condp case reduced cycle split-at split-with repeat replicate '+
      'iterate range merge zipmap declare line-seq sort comparator sort-by dorun doall nthnext '+
      'nthrest partition eval doseq await await-for let agent atom send send-off release-pending-sends '+
      'add-watch mapv filterv remove-watch agent-error restart-agent set-error-handler error-handler '+
      'set-error-mode! error-mode shutdown-agents quote var fn loop recur throw try monitor-enter '+
      'monitor-exit defmacro defn defn- macroexpand macroexpand-1 for doseq dosync dotimes and or '+
      'when when-not when-let comp juxt partial sequence memoize constantly complement identity assert '+
      'peek pop doto proxy defstruct first rest cons defprotocol cast coll deftype defrecord last butlast '+
      'sigs reify second ffirst fnext nfirst nnext defmulti defmethod meta with-meta ns in-ns create-ns import '+
      'intern refer keys select-keys vals key val rseq name namespace promise into transient persistent! conj! '+
      'assoc! dissoc! pop! disj! import use class type num float double short byte boolean bigint biginteger '+
      'bigdec print-method print-dup throw-if throw printf format load compile get-in update-in pr pr-on newline '+
      'flush read slurp read-line subvec with-open memfn time ns assert re-find re-groups rand-int rand mod locking '+
      'assert-valid-fdecl alias namespace resolve ref deref refset swap! reset! set-validator! compare-and-set! alter-meta! '+
      'reset-meta! commute get-validator alter ref-set ref-history-count ref-min-history ref-max-history ensure sync io! '+
      'new next conj set! memfn to-array future future-call into-array aset gen-class reduce merge map filter find empty '+
      'hash-map hash-set sorted-map sorted-map-by sorted-set sorted-set-by vec vector seq flatten reverse assoc dissoc list '+
      'disj get union difference intersection extend extend-type extend-protocol int nth delay count concat chunk chunk-buffer '+
      'chunk-append chunk-first chunk-rest max min dec unchecked-inc-int unchecked-inc unchecked-dec-inc unchecked-dec unchecked-negate '+
      'unchecked-add-int unchecked-add unchecked-subtract-int unchecked-subtract chunk-next chunk-cons chunked-seq? prn vary-meta '+
      'lazy-seq spread list* str find-keyword keyword symbol gensym force rationalize'
   };

  var CLJ_IDENT_RE = '[a-zA-Z_0-9\\!\\.\\?\\-\\+\\*\\/\\<\\=\\>\\&\\#\\$\';]+';
  var SIMPLE_NUMBER_RE = '[\\s:\\(\\{]+\\d+(\\.\\d+)?';

  var NUMBER = {
    className: 'number', begin: SIMPLE_NUMBER_RE,
    relevance: 0
  };
  var STRING = {
    className: 'string',
    begin: '"', end: '"',
    contains: [hljs.BACKSLASH_ESCAPE],
    relevance: 0
  };
  var COMMENT = {
    className: 'comment',
    begin: ';', end: '$',
    relevance: 0
  };
  var COLLECTION = {
    className: 'collection',
    begin: '[\\[\\{]', end: '[\\]\\}]'
  };
  var HINT = {
    className: 'comment',
    begin: '\\^' + CLJ_IDENT_RE
  };
  var HINT_COL = {
    className: 'comment',
    begin: '\\^\\{', end: '\\}'
  };
  var KEY = {
    className: 'attribute',
    begin: '[:]' + CLJ_IDENT_RE
  };
  var LIST = {
    className: 'list',
    begin: '\\(', end: '\\)',
    relevance: 0
  };
  var BODY = {
    endsWithParent: true, excludeEnd: true,
    keywords: {literal: 'true false nil'},
    relevance: 0
  };
  var TITLE = {
    keywords: keywords,
    lexems: CLJ_IDENT_RE,
    className: 'title', begin: CLJ_IDENT_RE,
    starts: BODY
  };

  LIST.contains = [{className: 'comment', begin: 'comment'}, TITLE];
  BODY.contains = [LIST, STRING, HINT, HINT_COL, COMMENT, KEY, COLLECTION, NUMBER];
  COLLECTION.contains = [LIST, STRING, HINT, COMMENT, KEY, COLLECTION, NUMBER];

  return {
    illegal: '\\S',
    contains: [
      COMMENT,
      LIST
    ]
  }
}
)(hljs);
return hljs;})();
});

require.define("/src/remark/models/slideshow.js",function(require,module,exports,__dirname,__filename,process,global){var Slide = require('./slide').Slide;

exports.Slideshow = Slideshow;

function Slideshow (source) {
  var slides = createSlides(source)
    , names = mapNamedSlides(slides)
    ;

  applyTemplates(slides, names);

  slides = stripLayoutSlides(slides);
  slides = indexSlides(slides);

  expandVariables(slides);

  this.slides = slides;
  this.slides.names = names;
}

Slideshow.prototype.getSlideByName = function (name) {
  return this.slides.names[name];
};

Slideshow.prototype.getSlideCount = function () {
  return this.slides.length;
};

function createSlides (source) {
  var slides = []
    , separatorFinder = /\n---?\n/
    , continuedSlide = false
    , match
    ;

  while ((match = separatorFinder.exec(source)) !== null) {
    slides.push(Slide.create(source.substr(0, match.index), {
      continued: continuedSlide.toString()
    }));
    source = source.substr(match.index + match[0].length);
    continuedSlide = match[0] === '\n--\n';
  }

  if (source !== '') {
    slides.push(Slide.create(source, {
      continued: continuedSlide.toString()
    }));
  }

  return slides;
}

function mapNamedSlides (slides) {
  var nameMap = {};

  slides.each(function (slide) {
    if (slide.properties.name) {
      nameMap[slide.properties.name] = slide;
    }
  });

  return nameMap;
}

function applyTemplates (slides, names) {
  var layoutSlide;

  slides.each(function (slide, index) {
    if (slide.properties.continued === 'true' && index > 0) {
      slide.inherit(slides[index - 1]);
    }
    else if (names[slide.properties.template]) {
      slide.inherit(names[slide.properties.template]);
    }
    else if (slide.properties.layout === 'false') {
      layoutSlide = undefined;
    }
    else if (layoutSlide && slide.properties.layout !== 'true') {
      slide.inherit(layoutSlide);
    }

    if (slide.properties.layout === 'true') {
      layoutSlide = slide;
    }
  });
}

function stripLayoutSlides (slides) {
  return slides.filter(function (slide) {
    return slide.properties.layout !== 'true';
  });
}

function indexSlides (slides) {
  return slides.map(function (slide, index) {
    slide.index = index;

    return slide;
  });
}

function expandVariables (slides) {
  slides.each(function (slide) {
    slide.expandVariables();
  });
}

});

require.define("/src/remark/models/slide.js",function(require,module,exports,__dirname,__filename,process,global){exports.Slide = Slide;

Slide.create = function (source, properties) {
  return new Slide(source, properties);
};

function Slide (source, properties) {
  this.properties = properties || {};
  this.source = extractProperties(source, this.properties);
}

function extractProperties (source, properties) {
  var propertyFinder = /^\n*(\w+):([^$\n]*)/i
    , match
    ;

  while ((match = propertyFinder.exec(source)) !== null) {
    source = source.substr(0, match.index) +
      source.substr(match.index + match[0].length);

    properties[match[1].trim()] = match[2].trim();

    propertyFinder.lastIndex = match.index;
  }

  return source;
}

Slide.prototype.inherit = function (template) {
  inheritProperties(this, template);
  inheritSource(this, template);
};

function inheritProperties (slide, template) {
  var property
    , value
    ;

  for (property in template.properties) {
    if (!template.properties.hasOwnProperty(property) ||
        ignoreProperty(property)) {
      continue;
    }

    value = [template.properties[property]];

    if (property === 'class' && slide.properties[property]) {
      value.push(slide.properties[property]);
    }

    if (property === 'class' || slide.properties[property] === undefined) {
      slide.properties[property] = value.join(', ');
    }
  }
}

function ignoreProperty (property) {
  return property === 'name' ||
    property === 'layout';
}

function inheritSource (slide, template) {
  var expandedVariables;

  slide.properties.content = slide.source;
  slide.source = template.source;

  expandedVariables = slide.expandVariables(/* contentOnly: */ true);

  if (expandedVariables.content === undefined) {
    slide.source += slide.properties.content;
  }

  delete slide.properties.content;
}

Slide.prototype.expandVariables = function (contentOnly) {
  var properties = this.properties
    , expandResult = {}
    ;

  this.source = this.source.replace(/(\\)?(\{\{([^\}\n]+)\}\})/g,
    function (match, escaped, unescapedMatch, property) {
      var propertyName = property.trim()
        , propertyValue
        ;

      if (escaped) {
        return contentOnly ? match[0] : unescapedMatch;
      }

      if (contentOnly && propertyName !== 'content') {
        return match;
      }

      propertyValue = properties[propertyName];

      if (propertyValue !== undefined) {
        expandResult[propertyName] = propertyValue;
        return propertyValue;
      }

      return propertyName === 'content' ? '' : unescapedMatch;
    });

  return expandResult;
};

});

require.define("/src/remark/views/slideshowView.js",function(require,module,exports,__dirname,__filename,process,global){var api = require('../api')
  , dispatcher = require('../dispatcher')
  , SlideView = require('./slideView').SlideView
  , dom = require('../dom')

  , scaleFactor = 227
  , heightFactor = 3
  , widthFactor = 4
  ;

exports.SlideshowView = SlideshowView;

function SlideshowView (slideshow, element) {
  this.slideViews = createSlideViews(slideshow.slides);

  this.slideViews.each(function (slideView) {
    element.appendChild(slideView.element);
  });

  this.positionElement = createPositionElement();
  element.appendChild(this.positionElement);

  mapStyles(element);
  mapEvents(this);
}

function createSlideViews (slides) {
  return slides.map(function (slide) {
    return new SlideView(slide);
  });
}

function createPositionElement () {
  var element = dom.createElement('div');

  element.className = 'position';

  return element;
}

function mapEvents (slideshowView) {
  dispatcher.on('hideSlide', function (slideIndex) {
    slideshowView.hideSlide(slideIndex);
  });

  dispatcher.on('showSlide', function (slideIndex) {
    slideshowView.showSlide(slideIndex);
  });
}

SlideshowView.prototype.showSlide =  function (slideIndex) {
  var slideView = this.slideViews[slideIndex];
  api.emit('slidein', slideView.element, slideIndex);
  slideView.show();
  this.positionElement.innerHTML = slideIndex + 1 + ' / ' + this.slideViews.length;
};

SlideshowView.prototype.hideSlide = function (slideIndex) {
  var slideView = this.slideViews[slideIndex];
  api.emit('slideout', slideView.element, slideIndex);
  slideView.hide();
};

function mapStyles (element) {
  var elementWidth = scaleFactor * widthFactor
    , elementHeight = scaleFactor * heightFactor
    ;

  var resize = function () {
    var containerHeight = dom.innerHeight
      , containerWidth = dom.innerWidth
      , scale
      ;

    if (containerWidth / widthFactor > containerHeight / heightFactor) {
      scale = containerHeight / (scaleFactor * heightFactor);
    }
    else {
      scale = containerWidth / (scaleFactor * widthFactor);
    }

    element.style['-webkit-transform'] = 'scale(' + scale + ')';
    element.style.MozTransform = 'scale(' + scale + ')';
    element.style.left = (containerWidth - elementWidth * scale) / 2 + 'px';
    element.style.top = (containerHeight - elementHeight * scale) / 2 + 'px';
  };

  element.style.width = scaleFactor * widthFactor + 'px';
  element.style.height = scaleFactor * heightFactor + 'px';

  dom.on('resize', resize);
  resize();
}

});

require.define("/src/remark/views/slideView.js",function(require,module,exports,__dirname,__filename,process,global){var converter = require('../converter')
  , dom = require('../dom')
  , highlighter = require('../highlighter')
  ;

exports.SlideView = SlideView;

function SlideView (slide) {
  this.slide = slide;
  this.element = createSlideElement();
  this.contentElement = createContentElement(slide.source, slide.properties);

  this.element.appendChild(this.contentElement);
}

SlideView.prototype.show = function () {
  this.element.style.display = 'table';
};

SlideView.prototype.hide = function () {
  this.element.style.display = 'none';
};

function createSlideElement () {
  var element = dom.createElement('div');

  element.className = 'slide';
  element.style.display = 'none';

  return element;
}

function createContentElement (source, properties) {
  var element = dom.createElement('div');

  if (properties.name) {
    element.id = "slide-" + properties.name;
  }

  element.innerHTML = source;

  setClassFromProperties(element, properties);

  converter.convertContentClasses(element);
  converter.convertMarkdown(element);
  converter.convertCodeClasses(element);
  converter.trimEmptySpace(element);

  highlighter.highlightCodeBlocks(element);

  return element;
}

function setClassFromProperties (element, properties) {
  var classes = (properties['class'] || '').split(/,| /)
        .filter(function (s) { return s !== ''; });

  element.className = ['content'].concat(classes).join(' ');
}

});

require.define("/src/remark/converter.js",function(require,module,exports,__dirname,__filename,process,global){var marked = require('marked')
  , config = require('./config')
  , converter = module.exports = {}
  ;

converter.convertContentClasses = function (content) {
  var classFinder = /(\\)?((?:\.[a-z_\-][a-z\-_0-9]*)+)\[/ig
    , match
    , classes
    , text
    , replacement
    , tag
    , after
    ;

  while ((match = classFinder.exec(content.innerHTML)) !== null) {
    text = getSquareBracketedText(content.innerHTML.substr(
          match.index + match[0].length));

    if (text === null) {
      continue;
    }

    if (match[1]) {
      // Simply remove escape slash
      replacement = match[2] + '[' + text + ']';
      classFinder.lastIndex = match.index + replacement.length;
    }
    else {
      classes = match[2].substr(1).split('.');
      tag = text.indexOf('\n') === -1 ? 'span' : 'div';

      replacement = "&lt;" + tag + " class=\"" +
        classes.join(' ') +
        "\"&gt;" +
        text +
        "&lt;/" + tag + "&gt;";

      classFinder.lastIndex = match.index +
        ("&lt;" + tag + " class=\"" + classes.join(' ') + "\"&gt;").length;
    }

    after = content.innerHTML.substr(
        match.index + match[0].length + text.length + 1);

    content.innerHTML = content.innerHTML.substr(0, match.index) +
      replacement + after;
  }
};

var getSquareBracketedText = function (text) {
  var count = 1
    , pos = 0
    , chr
    ;

  while (count > 0 && pos < text.length) {
    chr = text[pos++];
    count += (chr === '[' && 1) || (chr === ']' && -1) || 0;
  }

  return count === 0 && text.substr(0, pos - 1) || null;
};

converter.convertMarkdown = function (content) {
  // Store innerHTML in variable to allow intermediate conversion
  // into invalid HTML to handle block-quotes
  var source = content.innerHTML;

  // Unescape block-quotes before conversion (&gt; => >)
  source = source.replace(/(^|\n)( *)&gt;/, '$1$2>');

  // Perform the actual Markdown conversion
  content.innerHTML = marked(source.replace(/^\s+/, ''));

  // Unescape HTML escaped by the browser; &lt;, &gt;, ...
  content.innerHTML = content.innerHTML.replace(/&[l|g]t;/g,
    function (match) {
      return match === '&lt;' ? '<' : '>';
    });

  // ... and &amp;
  content.innerHTML = content.innerHTML.replace(/&amp;/g, '&');
};

converter.convertCodeClasses = function (content) {
  var codeBlocks = content.getElementsByTagName('code')
    , i
    ;

  for (i = 0; i < codeBlocks.length; i++) {
    convertCodeClass(codeBlocks[i]);
  }
};

var convertCodeClass = function (block) {
  var defaultClass = config.highlightLanguage
    , highlightInline = config.highlightInline
    , isInlineCode = block.parentNode.nodeName.toUpperCase() !== 'PRE'
    ;

    if (setCodeClass(block) || transformCodeClass(block)) {
      return;
    }

    if (isInlineCode && !highlightInline) {
      block.className = 'no-highlight';
    }
    else if (defaultClass) {
      block.className = defaultClass;
    }
};

var setCodeClass = function (block) {
  var classFinder = /^(\\)?\.([a-z_\-][a-z\-_0-9]*)(?:\n|\ )/i
    , match
    ;

  if ((match = classFinder.exec(block.innerHTML)) !== null) {
    if (match[1]) {
      block.innerHTML = block.innerHTML.substr(match[1].length);
    }
    else {
      block.innerHTML = block.innerHTML.substr(match[0].length);
      block.className = match[2];
      return true;
    }
  }

  return false;
};

var transformCodeClass = function (block) {
  var className = block.className || '';

  block.className = className.replace('lang-', '');

  return block.className !== className;
};

converter.trimEmptySpace = function (content) {
  content.innerHTML = content.innerHTML.replace(/<p>\s*<\/p>/g, '');
};

});

require.define("/node_modules/marked/package.json",function(require,module,exports,__dirname,__filename,process,global){module.exports = {"main":"./lib/marked.js"}
});

require.define("/node_modules/marked/lib/marked.js",function(require,module,exports,__dirname,__filename,process,global){/**
 * marked - A markdown parser (https://github.com/chjj/marked)
 * Copyright (c) 2011-2012, Christopher Jeffrey. (MIT Licensed)
 */

;(function() {

/**
 * Block-Level Grammar
 */

var block = {
  newline: /^\n+/,
  code: /^( {4}[^\n]+\n*)+/,
  fences: noop,
  hr: /^( *[-*_]){3,} *(?:\n+|$)/,
  heading: /^ *(#{1,6}) *([^\n]+?) *#* *(?:\n+|$)/,
  lheading: /^([^\n]+)\n *(=|-){3,} *\n*/,
  blockquote: /^( *>[^\n]+(\n[^\n]+)*\n*)+/,
  list: /^( *)(bull) [\s\S]+?(?:hr|\n{2,}(?! )(?!\1bull )\n*|\s*$)/,
  html: /^ *(?:comment|closed|closing) *(?:\n{2,}|\s*$)/,
  def: /^ *\[([^\]]+)\]: *([^\s]+)(?: +["(]([^\n]+)[")])? *(?:\n+|$)/,
  paragraph: /^([^\n]+\n?(?!hr|heading|lheading|blockquote|tag|def))+\n*/,
  text: /^[^\n]+/
};

block.bullet = /(?:[*+-]|\d+\.)/;
block.item = /^( *)(bull) [^\n]*(?:\n(?!\1bull )[^\n]*)*/;
block.item = replace(block.item, 'gm')
  (/bull/g, block.bullet)
  ();

block.list = replace(block.list)
  (/bull/g, block.bullet)
  ('hr', /\n+(?=(?: *[-*_]){3,} *(?:\n+|$))/)
  ();

block.html = replace(block.html)
  ('comment', /<!--[\s\S]*?-->/)
  ('closed', /<(tag)[\s\S]+?<\/\1>/)
  ('closing', /<tag(?:"[^"]*"|'[^']*'|[^'">])*?>/)
  (/tag/g, tag())
  ();

block.paragraph = replace(block.paragraph)
  ('hr', block.hr)
  ('heading', block.heading)
  ('lheading', block.lheading)
  ('blockquote', block.blockquote)
  ('tag', '<' + tag())
  ('def', block.def)
  ();

block.normal = {
  fences: block.fences,
  paragraph: block.paragraph
};

block.gfm = {
  fences: /^ *(```|~~~) *(\w+)? *\n([\s\S]+?)\s*\1 *(?:\n+|$)/,
  paragraph: /^/
};

block.gfm.paragraph = replace(block.paragraph)
  ('(?!', '(?!' + block.gfm.fences.source.replace('\\1', '\\2') + '|')
  ();

/**
 * Block Lexer
 */

block.lexer = function(src) {
  var tokens = [];

  tokens.links = {};

  src = src
    .replace(/\r\n|\r/g, '\n')
    .replace(/\t/g, '    ');

  return block.token(src, tokens, true);
};

block.token = function(src, tokens, top) {
  var src = src.replace(/^ +$/gm, '')
    , next
    , loose
    , cap
    , item
    , space
    , i
    , l;

  while (src) {
    // newline
    if (cap = block.newline.exec(src)) {
      src = src.substring(cap[0].length);
      if (cap[0].length > 1) {
        tokens.push({
          type: 'space'
        });
      }
    }

    // code
    if (cap = block.code.exec(src)) {
      src = src.substring(cap[0].length);
      cap = cap[0].replace(/^ {4}/gm, '');
      tokens.push({
        type: 'code',
        text: !options.pedantic
          ? cap.replace(/\n+$/, '')
          : cap
      });
      continue;
    }

    // fences (gfm)
    if (cap = block.fences.exec(src)) {
      src = src.substring(cap[0].length);
      tokens.push({
        type: 'code',
        lang: cap[2],
        text: cap[3]
      });
      continue;
    }

    // heading
    if (cap = block.heading.exec(src)) {
      src = src.substring(cap[0].length);
      tokens.push({
        type: 'heading',
        depth: cap[1].length,
        text: cap[2]
      });
      continue;
    }

    // lheading
    if (cap = block.lheading.exec(src)) {
      src = src.substring(cap[0].length);
      tokens.push({
        type: 'heading',
        depth: cap[2] === '=' ? 1 : 2,
        text: cap[1]
      });
      continue;
    }

    // hr
    if (cap = block.hr.exec(src)) {
      src = src.substring(cap[0].length);
      tokens.push({
        type: 'hr'
      });
      continue;
    }

    // blockquote
    if (cap = block.blockquote.exec(src)) {
      src = src.substring(cap[0].length);

      tokens.push({
        type: 'blockquote_start'
      });

      cap = cap[0].replace(/^ *> ?/gm, '');

      // Pass `top` to keep the current
      // "toplevel" state. This is exactly
      // how markdown.pl works.
      block.token(cap, tokens, top);

      tokens.push({
        type: 'blockquote_end'
      });

      continue;
    }

    // list
    if (cap = block.list.exec(src)) {
      src = src.substring(cap[0].length);

      tokens.push({
        type: 'list_start',
        ordered: isFinite(cap[2])
      });

      // Get each top-level item.
      cap = cap[0].match(block.item);

      next = false;
      l = cap.length;
      i = 0;

      for (; i < l; i++) {
        item = cap[i];

        // Remove the list item's bullet
        // so it is seen as the next token.
        space = item.length;
        item = item.replace(/^ *([*+-]|\d+\.) +/, '');

        // Outdent whatever the
        // list item contains. Hacky.
        if (~item.indexOf('\n ')) {
          space -= item.length;
          item = !options.pedantic
            ? item.replace(new RegExp('^ {1,' + space + '}', 'gm'), '')
            : item.replace(/^ {1,4}/gm, '');
        }

        // Determine whether item is loose or not.
        // Use: /(^|\n)(?! )[^\n]+\n\n(?!\s*$)/
        // for discount behavior.
        loose = next || /\n\n(?!\s*$)/.test(item);
        if (i !== l - 1) {
          next = item[item.length-1] === '\n';
          if (!loose) loose = next;
        }

        tokens.push({
          type: loose
            ? 'loose_item_start'
            : 'list_item_start'
        });

        // Recurse.
        block.token(item, tokens);

        tokens.push({
          type: 'list_item_end'
        });
      }

      tokens.push({
        type: 'list_end'
      });

      continue;
    }

    // html
    if (cap = block.html.exec(src)) {
      src = src.substring(cap[0].length);
      console.log(src);
      tokens.push({
        type: options.sanitize
          ? 'paragraph'
          : 'html',
        pre: cap[1] === 'pre',
        text: cap[0]
      });
      continue;
    }

    // def
    if (top && (cap = block.def.exec(src))) {
      src = src.substring(cap[0].length);
      tokens.links[cap[1].toLowerCase()] = {
        href: cap[2],
        title: cap[3]
      };
      continue;
    }

    // top-level paragraph
    if (top && (cap = block.paragraph.exec(src))) {
      src = src.substring(cap[0].length);
      tokens.push({
        type: 'paragraph',
        text: cap[0]
      });
      continue;
    }

    // text
    if (cap = block.text.exec(src)) {
      // Top-level should never reach here.
      src = src.substring(cap[0].length);
      tokens.push({
        type: 'text',
        text: cap[0]
      });
      continue;
    }
  }

  return tokens;
};

/**
 * Inline Processing
 */

var inline = {
  escape: /^\\([\\`*{}\[\]()#+\-.!_>])/,
  autolink: /^<([^ >]+(@|:\/)[^ >]+)>/,
  url: noop,
  tag: /^<!--[\s\S]*?-->|^<\/?\w+(?:"[^"]*"|'[^']*'|[^'">])*?>/,
  link: /^!?\[(inside)\]\(href\)/,
  reflink: /^!?\[(inside)\]\s*\[([^\]]*)\]/,
  nolink: /^!?\[((?:\[[^\]]*\]|[^\[\]])*)\]/,
  strong: /^__([\s\S]+?)__(?!_)|^\*\*([\s\S]+?)\*\*(?!\*)/,
  em: /^\b_((?:__|[\s\S])+?)_\b|^\*((?:\*\*|[\s\S])+?)\*(?!\*)/,
  code: /^(`+)([\s\S]*?[^`])\1(?!`)/,
  br: /^ {2,}\n(?!\s*$)/,
  text: /^[\s\S]+?(?=[\\<!\[_*`]| {2,}\n|$)/
};

inline._linkInside = /(?:\[[^\]]*\]|[^\]]|\](?=[^\[]*\]))*/;
inline._linkHref = /\s*<?([^\s]*?)>?(?:\s+['"]([\s\S]*?)['"])?\s*/;

inline.link = replace(inline.link)
  ('inside', inline._linkInside)
  ('href', inline._linkHref)
  ();

inline.reflink = replace(inline.reflink)
  ('inside', inline._linkInside)
  ();

inline.normal = {
  url: inline.url,
  strong: inline.strong,
  em: inline.em,
  text: inline.text
};

inline.pedantic = {
  strong: /^__(?=\S)([\s\S]*?\S)__(?!_)|^\*\*(?=\S)([\s\S]*?\S)\*\*(?!\*)/,
  em: /^_(?=\S)([\s\S]*?\S)_(?!_)|^\*(?=\S)([\s\S]*?\S)\*(?!\*)/
};

inline.gfm = {
  url: /^(https?:\/\/[^\s]+[^.,:;"')\]\s])/,
  text: /^[\s\S]+?(?=[\\<!\[_*`]|https?:\/\/| {2,}\n|$)/
};

/**
 * Inline Lexer
 */

inline.lexer = function(src) {
  var out = ''
    , links = tokens.links
    , link
    , text
    , href
    , cap;

  while (src) {
    // escape
    if (cap = inline.escape.exec(src)) {
      src = src.substring(cap[0].length);
      out += cap[1];
      continue;
    }

    // autolink
    if (cap = inline.autolink.exec(src)) {
      src = src.substring(cap[0].length);
      if (cap[2] === '@') {
        text = cap[1][6] === ':'
          ? mangle(cap[1].substring(7))
          : mangle(cap[1]);
        href = mangle('mailto:') + text;
      } else {
        text = escape(cap[1]);
        href = text;
      }
      out += '<a href="'
        + href
        + '">'
        + text
        + '</a>';
      continue;
    }

    // url (gfm)
    if (cap = inline.url.exec(src)) {
      src = src.substring(cap[0].length);
      text = escape(cap[1]);
      href = text;
      out += '<a href="'
        + href
        + '">'
        + text
        + '</a>';
      continue;
    }

    // tag
    if (cap = inline.tag.exec(src)) {
      src = src.substring(cap[0].length);
      out += options.sanitize
        ? escape(cap[0])
        : cap[0];
      continue;
    }

    // link
    if (cap = inline.link.exec(src)) {
      src = src.substring(cap[0].length);
      out += outputLink(cap, {
        href: cap[2],
        title: cap[3]
      });
      continue;
    }

    // reflink, nolink
    if ((cap = inline.reflink.exec(src))
        || (cap = inline.nolink.exec(src))) {
      src = src.substring(cap[0].length);
      link = (cap[2] || cap[1]).replace(/\s+/g, ' ');
      link = links[link.toLowerCase()];
      if (!link || !link.href) {
        out += cap[0][0];
        src = cap[0].substring(1) + src;
        continue;
      }
      out += outputLink(cap, link);
      continue;
    }

    // strong
    if (cap = inline.strong.exec(src)) {
      src = src.substring(cap[0].length);
      out += '<strong>'
        + inline.lexer(cap[2] || cap[1])
        + '</strong>';
      continue;
    }

    // em
    if (cap = inline.em.exec(src)) {
      src = src.substring(cap[0].length);
      out += '<em>'
        + inline.lexer(cap[2] || cap[1])
        + '</em>';
      continue;
    }

    // code
    if (cap = inline.code.exec(src)) {
      src = src.substring(cap[0].length);
      out += '<code>'
        + escape(cap[2], true)
        + '</code>';
      continue;
    }

    // br
    if (cap = inline.br.exec(src)) {
      src = src.substring(cap[0].length);
      out += '<br>';
      continue;
    }

    // text
    if (cap = inline.text.exec(src)) {
      src = src.substring(cap[0].length);
      out += escape(cap[0]);
      continue;
    }
  }

  return out;
};

function outputLink(cap, link) {
  if (cap[0][0] !== '!') {
    return '<a href="'
      + escape(link.href)
      + '"'
      + (link.title
      ? ' title="'
      + escape(link.title)
      + '"'
      : '')
      + '>'
      + inline.lexer(cap[1])
      + '</a>';
  } else {
    return '<img src="'
      + escape(link.href)
      + '" alt="'
      + escape(cap[1])
      + '"'
      + (link.title
      ? ' title="'
      + escape(link.title)
      + '"'
      : '')
      + '>';
  }
}

/**
 * Parsing
 */

var tokens
  , token;

function next() {
  return token = tokens.pop();
}

function tok() {
  switch (token.type) {
    case 'space': {
      return '';
    }
    case 'hr': {
      return '<hr>\n';
    }
    case 'heading': {
      return '<h'
        + token.depth
        + '>'
        + inline.lexer(token.text)
        + '</h'
        + token.depth
        + '>\n';
    }
    case 'code': {
      if (options.highlight) {
        token.code = options.highlight(token.text, token.lang);
        if (token.code != null && token.code !== token.text) {
          token.escaped = true;
          token.text = token.code;
        }
      }

      if (!token.escaped) {
        token.text = escape(token.text, true);
      }

      return '<pre><code'
        + (token.lang
        ? ' class="lang-'
        + token.lang
        + '"'
        : '')
        + '>'
        + token.text
        + '</code></pre>\n';
    }
    case 'blockquote_start': {
      var body = '';

      while (next().type !== 'blockquote_end') {
        body += tok();
      }

      return '<blockquote>\n'
        + body
        + '</blockquote>\n';
    }
    case 'list_start': {
      var type = token.ordered ? 'ol' : 'ul'
        , body = '';

      while (next().type !== 'list_end') {
        body += tok();
      }

      return '<'
        + type
        + '>\n'
        + body
        + '</'
        + type
        + '>\n';
    }
    case 'list_item_start': {
      var body = '';

      while (next().type !== 'list_item_end') {
        body += token.type === 'text'
          ? parseText()
          : tok();
      }

      return '<li>'
        + body
        + '</li>\n';
    }
    case 'loose_item_start': {
      var body = '';

      while (next().type !== 'list_item_end') {
        body += tok();
      }

      return '<li>'
        + body
        + '</li>\n';
    }
    case 'html': {
      return !token.pre && !options.pedantic
        ? inline.lexer(token.text)
        : token.text;
    }
    case 'paragraph': {
      return '<p>'
        + inline.lexer(token.text)
        + '</p>\n';
    }
    case 'text': {
      return '<p>'
        + parseText()
        + '</p>\n';
    }
  }
}

function parseText() {
  var body = token.text
    , top;

  while ((top = tokens[tokens.length-1])
         && top.type === 'text') {
    body += '\n' + next().text;
  }

  return inline.lexer(body);
}

function parse(src) {
  tokens = src.reverse();

  var out = '';
  while (next()) {
    out += tok();
  }

  tokens = null;
  token = null;

  return out;
}

/**
 * Helpers
 */

function escape(html, encode) {
  return html
    .replace(!encode ? /&(?!#?\w+;)/g : /&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function mangle(text) {
  var out = ''
    , l = text.length
    , i = 0
    , ch;

  for (; i < l; i++) {
    ch = text.charCodeAt(i);
    if (Math.random() > 0.5) {
      ch = 'x' + ch.toString(16);
    }
    out += '&#' + ch + ';';
  }

  return out;
}

function tag() {
  var tag = '(?!(?:'
    + 'a|em|strong|small|s|cite|q|dfn|abbr|data|time|code'
    + '|var|samp|kbd|sub|sup|i|b|u|mark|ruby|rt|rp|bdi|bdo'
    + '|span|br|wbr|ins|del|img)\\b)\\w+(?!:/|@)\\b';

  return tag;
}

function replace(regex, opt) {
  regex = regex.source;
  opt = opt || '';
  return function self(name, val) {
    if (!name) return new RegExp(regex, opt);
    val = val.source || val;
    val = val.replace(/(^|[^\[])\^/g, '$1');
    regex = regex.replace(name, val);
    return self;
  };
}

function noop() {}
noop.exec = noop;

/**
 * Marked
 */

function marked(src, opt) {
  setOptions(opt);
  return parse(block.lexer(src));
}

/**
 * Options
 */

var options
  , defaults;

function setOptions(opt) {
  if (!opt) opt = defaults;
  if (options === opt) return;
  options = opt;

  if (options.gfm) {
    block.fences = block.gfm.fences;
    block.paragraph = block.gfm.paragraph;
    inline.text = inline.gfm.text;
    inline.url = inline.gfm.url;
  } else {
    block.fences = block.normal.fences;
    block.paragraph = block.normal.paragraph;
    inline.text = inline.normal.text;
    inline.url = inline.normal.url;
  }

  if (options.pedantic) {
    inline.em = inline.pedantic.em;
    inline.strong = inline.pedantic.strong;
  } else {
    inline.em = inline.normal.em;
    inline.strong = inline.normal.strong;
  }
}

marked.options =
marked.setOptions = function(opt) {
  defaults = opt;
  setOptions(opt);
  return marked;
};

marked.setOptions({
  gfm: true,
  pedantic: false,
  sanitize: false,
  highlight: null
});

/**
 * Expose
 */

marked.parser = function(src, opt) {
  setOptions(opt);
  return parse(src);
};

marked.lexer = function(src, opt) {
  setOptions(opt);
  return block.lexer(src);
};

marked.parse = marked;

if (typeof module !== 'undefined') {
  module.exports = marked;
} else {
  this.marked = marked;
}

}).call(function() {
  return this || (typeof window !== 'undefined' ? window : global);
}());

});

require.define("/index.js",function(require,module,exports,__dirname,__filename,process,global){var remark = require('./src/remark');

});
require("/index.js");
})();
