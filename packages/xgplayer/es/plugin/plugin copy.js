var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
* an ui Plugin class
*
**/
import delegate from 'delegate-events';
import pluginsManager from './pluginsManager';
import BasePlugin from './basePlugin';

function _createElement(tag, name) {
  var dom = document.createElement(tag);
  dom.name = name;
  return dom;
}
/**
 * 插入dom结构
 * @param {String} html html字符串
 * @param {DocumentElemebt } parent
 * @param {*} index
 */
function insert(html, parent, index) {
  var len = parent.children.length;
  var insertIdx = parseInt(index);
  if (typeof index === 'undefined' || len <= insertIdx) {
    parent.insertAdjacentHTML('beforeend', html);
    return parent.children[parent.children.length - 1];
  } else if (insertIdx === 0) {
    parent.insertAdjacentHTML('afterbegin', html);
    return parent.children[0];
  }
  var el = parent.children[insertIdx];
  if (el && el.insertAdjacentHTML) {
    el.insertAdjacentHTML('beforebegin', html);
    return parent.children[insertIdx];
  }
}

function registerIconsObj(iconsConfig, plugin) {
  Object.keys(iconsConfig).map(function (iconKey) {
    Object.defineProperty(plugin.icons, iconKey, {
      get: function get() {
        var _icons = plugin.config.icons || plugin.playerConfig.icons;
        if (_icons && _icons[iconKey]) {
          return _icons[iconKey];
        } else {
          return iconsConfig[iconKey];
        }
      }
    });
  });
}

function registerTextObj(textConfig, plugin) {
  Object.keys(textConfig).map(function (key) {
    Object.defineProperty(plugin.text, key, {
      get: function get() {
        var lang = plugin.playerConfig.lang || 'zh';
        console.log(textConfig[key][lang]);
        return textConfig[key][lang];
      }
    });
  });
}

var Plugin = function (_BasePlugin) {
  _inherits(Plugin, _BasePlugin);

  function Plugin() {
    var args = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    _classCallCheck(this, Plugin);

    return _possibleConstructorReturn(this, (Plugin.__proto__ || Object.getPrototypeOf(Plugin)).call(this, args));
  }

  _createClass(Plugin, [{
    key: '__init',
    value: function __init(args) {
      _get(Plugin.prototype.__proto__ || Object.getPrototypeOf(Plugin.prototype), '__init', this).call(this, args);
      var _parent = args.root;
      var _el = null;
      this.icons = {};
      var defaultIcons = this.registerIcons() || {};
      registerIconsObj(defaultIcons, this);

      this.text = {};
      var defaultTexConfig = this.registerLangauageTexts() || {};
      console.log('registerLangauageTexts', defaultTexConfig);
      registerTextObj(defaultTexConfig, this);
      var renderStr = '';
      try {
        renderStr = this.render();
      } catch (e) {
        throw new Error('Plugin:' + this.pluginName + ':render:' + e.message);
      }

      if (renderStr) {
        _el = insert(renderStr, _parent, args.index);
      } else if (args.tag) {
        _el = _createElement(args.tag, args.name);
        _parent.appendChild(_el);
      }

      Plugin.defineGetterOrSetter(this, {
        'el': {
          get: function get() {
            return _el;
          }
        },
        'parent': {
          get: function get() {
            return _parent;
          }
        }
      });

      var attr = this.config.attr || {};
      var style = this.config.style || {};

      this.setAttr(attr);
      this.setStyle(style);
      this.registeChildren();
    }
  }, {
    key: 'registeChildren',
    value: function registeChildren() {
      var children = this.children();
      if (children && (typeof children === 'undefined' ? 'undefined' : _typeof(children)) === 'object') {
        if (!this._children) {
          this._children = [];
        }
        if (Array.isArray(children)) {
          children.map(function (item) {});
        } else {
          if (Object.keys(children).length > 0) {
            var _iteratorNormalCompletion = true;
            var _didIteratorError = false;
            var _iteratorError = undefined;

            try {
              for (var _iterator = Object.keys(children)[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                var item = _step.value;

                var name = item;
                var c = this._registerPlugin(name, children[item], this.config[name]);
                this._children.push(c);
              }
            } catch (err) {
              _didIteratorError = true;
              _iteratorError = err;
            } finally {
              try {
                if (!_iteratorNormalCompletion && _iterator.return) {
                  _iterator.return();
                }
              } finally {
                if (_didIteratorError) {
                  throw _iteratorError;
                }
              }
            }
          }
        }
      }
    }
  }, {
    key: 'plugins',
    value: function plugins() {
      return this._children;
    }
  }, {
    key: 'children',
    value: function children() {
      return {};
    }
  }, {
    key: '_registerPlugin',
    value: function _registerPlugin(name, item, options) {
      var opts = (typeof options === 'undefined' ? 'undefined' : _typeof(options)) === 'object' ? options : {};
      opts.root = options.root || this.el;
      opts.pluginName = name;
      return pluginsManager.register(this.player, item, opts);
    }
  }, {
    key: 'registerIcons',
    value: function registerIcons() {
      return {};
    }
  }, {
    key: 'registerLangauageTexts',
    value: function registerLangauageTexts() {
      return {};
    }
  }, {
    key: 'getPlugin',
    value: function getPlugin(name) {
      return pluginsManager.findPlugin(this.player, name);
    }
  }, {
    key: 'find',
    value: function find(qs) {
      return this.el.querySelector(qs);
    }
  }, {
    key: 'bind',
    value: function bind(querySelector, eventType, callback) {
      // if no querySelector passed to the method
      if (arguments.length < 3 && typeof eventType === 'function') {
        this.bindEL(querySelector, eventType);
      } else if (arguments.length === 3 && typeof callback === 'function') {
        delegate.bind(this.el, querySelector, eventType, callback, false);
      }
    }
  }, {
    key: 'unbind',
    value: function unbind(querySelector, eventType, callback) {
      // if no querySelector passed to the method
      if (arguments.length < 3 && typeof eventType === 'function') {
        this.unbindEL(querySelector, eventType);
      } else if (typeof callback === 'function') {
        delegate.ubind(this.el, querySelector, eventType, callback, false);
      }
    }
  }, {
    key: 'setStyle',
    value: function setStyle(name, value) {
      if (typeof name === 'string') {
        this.style[name] = value;
        return this.el.style[name] = value;
      } else if ((typeof name === 'undefined' ? 'undefined' : _typeof(name)) === 'object') {
        var obj = name;
        var _iteratorNormalCompletion2 = true;
        var _didIteratorError2 = false;
        var _iteratorError2 = undefined;

        try {
          for (var _iterator2 = Object.keys(obj)[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
            var item = _step2.value;

            this.el.style[item] = obj[item];
          }
        } catch (err) {
          _didIteratorError2 = true;
          _iteratorError2 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion2 && _iterator2.return) {
              _iterator2.return();
            }
          } finally {
            if (_didIteratorError2) {
              throw _iteratorError2;
            }
          }
        }
      }
    }
  }, {
    key: 'setAttr',
    value: function setAttr(name, value) {
      if (typeof name === 'string') {
        return this.el.setAttribute(name, value);
      } else if ((typeof name === 'undefined' ? 'undefined' : _typeof(name)) === 'object') {
        var obj = name;
        var _iteratorNormalCompletion3 = true;
        var _didIteratorError3 = false;
        var _iteratorError3 = undefined;

        try {
          for (var _iterator3 = Object.keys(obj)[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
            var item = _step3.value;

            this.el.setAttribute(item, obj[item]);
          }
        } catch (err) {
          _didIteratorError3 = true;
          _iteratorError3 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion3 && _iterator3.return) {
              _iterator3.return();
            }
          } finally {
            if (_didIteratorError3) {
              throw _iteratorError3;
            }
          }
        }
      }
    }
  }, {
    key: 'setHtml',
    value: function setHtml(htmlStr, callback) {
      this.el.innerHtml = htmlStr;
      if (typeof callback === 'function') {
        callback();
      }
    }
  }, {
    key: 'bindEL',
    value: function bindEL(event, eventHandle) {
      var isBubble = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;

      if ('on' + event in this.el && typeof eventHandle === 'function') {
        this.el.addEventListener(event, eventHandle, isBubble);
      }
    }
  }, {
    key: 'unbindEL',
    value: function unbindEL(event, eventHandle) {
      var isBubble = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;

      if ('on' + event in this.el && typeof eventHandle === 'function') {
        this.el.removeEventListener(event, eventHandle, isBubble);
      }
    }
  }, {
    key: 'show',
    value: function show(value) {
      this.el.style.display = value !== undefined ? value : 'block';
      var cs = window.getComputedStyle(this.el, null);
      var cssDisplayValue = cs.getPropertyValue('display');
      if (cssDisplayValue === 'none') {
        return this.el.style.display = 'block';
      }
    }
  }, {
    key: 'hide',
    value: function hide() {
      this.el.style.display = 'none';
    }
  }, {
    key: 'render',
    value: function render() {
      return '';
    }
  }, {
    key: '_destroy',
    value: function _destroy() {
      this.offAll();
      if (BasePlugin.Util.checkIsFunction(this.destroy)) {
        this.destroy();
      }
      if (this.el) {
        if (this.el.hasOwnProperty('remove')) {
          this.el.remove();
        } else if (this.el.parentNode) {
          this.el.parentNode.removeChild(this.el);
        }
      }
    }
  }]);

  return Plugin;
}(BasePlugin);

export default Plugin;