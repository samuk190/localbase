(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.Localbase = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _localbase = _interopRequireDefault(require("./localbase/localbase"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var _default = _localbase["default"];
exports["default"] = _default;
module.exports = exports.default;

},{"./localbase/localbase":18}],2:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = error;

var _logger = _interopRequireDefault(require("../utils/logger"));

var _reset = _interopRequireDefault(require("../api-utils/reset"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function error(message) {
  _reset["default"].call(this);

  _logger["default"].error.call(this, message);

  return "Error: ".concat(message);
}

module.exports = exports.default;

},{"../api-utils/reset":3,"../utils/logger":20}],3:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = reset;

function reset() {
  this.collectionName = null;
  this.orderByProperty = null;
  this.orderByDirection = null;
  this.limitBy = null;
  this.docSelectionCriteria = null;
  this.userErrors = [];
  this.containsProperty = null;
  this.containsValue = null;
}

module.exports = exports.default;

},{}],4:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = selectionLevel;

function selectionLevel() {
  var level;
  if (!this.collectionName && !this.docSelectionCriteria) level = 'db';else if (this.collectionName && !this.docSelectionCriteria) level = 'collection';else if (this.collectionName && this.docSelectionCriteria) level = 'doc';
  return level;
}

module.exports = exports.default;

},{}],5:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = showUserErrors;

var _logger = _interopRequireDefault(require("../utils/logger"));

var _reset = _interopRequireDefault(require("./reset"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function showUserErrors() {
  for (var i = 0; i < this.userErrors.length; i++) {
    _logger["default"].error.call(this, this.userErrors[i]);
  }

  _reset["default"].call(this);
}

module.exports = exports.default;

},{"../utils/logger":20,"./reset":3}],6:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = success;

var _logger = _interopRequireDefault(require("../utils/logger"));

var _reset = _interopRequireDefault(require("../api-utils/reset"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function success(message, data) {
  _reset["default"].call(this);

  _logger["default"].log.call(this, message, data);

  return {
    success: true,
    message: message,
    data: data
  };
}

module.exports = exports.default;

},{"../api-utils/reset":3,"../utils/logger":20}],7:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = add;

var _success = _interopRequireDefault(require("../../api-utils/success"));

var _error = _interopRequireDefault(require("../../api-utils/error"));

var _showUserErrors = _interopRequireDefault(require("../../api-utils/showUserErrors"));

var _fuzzysort = require("fuzzysort");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }

function _regeneratorRuntime() { "use strict"; /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/facebook/regenerator/blob/main/LICENSE */ _regeneratorRuntime = function _regeneratorRuntime() { return exports; }; var exports = {}, Op = Object.prototype, hasOwn = Op.hasOwnProperty, $Symbol = "function" == typeof Symbol ? Symbol : {}, iteratorSymbol = $Symbol.iterator || "@@iterator", asyncIteratorSymbol = $Symbol.asyncIterator || "@@asyncIterator", toStringTagSymbol = $Symbol.toStringTag || "@@toStringTag"; function define(obj, key, value) { return Object.defineProperty(obj, key, { value: value, enumerable: !0, configurable: !0, writable: !0 }), obj[key]; } try { define({}, ""); } catch (err) { define = function define(obj, key, value) { return obj[key] = value; }; } function wrap(innerFn, outerFn, self, tryLocsList) { var protoGenerator = outerFn && outerFn.prototype instanceof Generator ? outerFn : Generator, generator = Object.create(protoGenerator.prototype), context = new Context(tryLocsList || []); return generator._invoke = function (innerFn, self, context) { var state = "suspendedStart"; return function (method, arg) { if ("executing" === state) throw new Error("Generator is already running"); if ("completed" === state) { if ("throw" === method) throw arg; return doneResult(); } for (context.method = method, context.arg = arg;;) { var delegate = context.delegate; if (delegate) { var delegateResult = maybeInvokeDelegate(delegate, context); if (delegateResult) { if (delegateResult === ContinueSentinel) continue; return delegateResult; } } if ("next" === context.method) context.sent = context._sent = context.arg;else if ("throw" === context.method) { if ("suspendedStart" === state) throw state = "completed", context.arg; context.dispatchException(context.arg); } else "return" === context.method && context.abrupt("return", context.arg); state = "executing"; var record = tryCatch(innerFn, self, context); if ("normal" === record.type) { if (state = context.done ? "completed" : "suspendedYield", record.arg === ContinueSentinel) continue; return { value: record.arg, done: context.done }; } "throw" === record.type && (state = "completed", context.method = "throw", context.arg = record.arg); } }; }(innerFn, self, context), generator; } function tryCatch(fn, obj, arg) { try { return { type: "normal", arg: fn.call(obj, arg) }; } catch (err) { return { type: "throw", arg: err }; } } exports.wrap = wrap; var ContinueSentinel = {}; function Generator() {} function GeneratorFunction() {} function GeneratorFunctionPrototype() {} var IteratorPrototype = {}; define(IteratorPrototype, iteratorSymbol, function () { return this; }); var getProto = Object.getPrototypeOf, NativeIteratorPrototype = getProto && getProto(getProto(values([]))); NativeIteratorPrototype && NativeIteratorPrototype !== Op && hasOwn.call(NativeIteratorPrototype, iteratorSymbol) && (IteratorPrototype = NativeIteratorPrototype); var Gp = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(IteratorPrototype); function defineIteratorMethods(prototype) { ["next", "throw", "return"].forEach(function (method) { define(prototype, method, function (arg) { return this._invoke(method, arg); }); }); } function AsyncIterator(generator, PromiseImpl) { function invoke(method, arg, resolve, reject) { var record = tryCatch(generator[method], generator, arg); if ("throw" !== record.type) { var result = record.arg, value = result.value; return value && "object" == _typeof(value) && hasOwn.call(value, "__await") ? PromiseImpl.resolve(value.__await).then(function (value) { invoke("next", value, resolve, reject); }, function (err) { invoke("throw", err, resolve, reject); }) : PromiseImpl.resolve(value).then(function (unwrapped) { result.value = unwrapped, resolve(result); }, function (error) { return invoke("throw", error, resolve, reject); }); } reject(record.arg); } var previousPromise; this._invoke = function (method, arg) { function callInvokeWithMethodAndArg() { return new PromiseImpl(function (resolve, reject) { invoke(method, arg, resolve, reject); }); } return previousPromise = previousPromise ? previousPromise.then(callInvokeWithMethodAndArg, callInvokeWithMethodAndArg) : callInvokeWithMethodAndArg(); }; } function maybeInvokeDelegate(delegate, context) { var method = delegate.iterator[context.method]; if (undefined === method) { if (context.delegate = null, "throw" === context.method) { if (delegate.iterator["return"] && (context.method = "return", context.arg = undefined, maybeInvokeDelegate(delegate, context), "throw" === context.method)) return ContinueSentinel; context.method = "throw", context.arg = new TypeError("The iterator does not provide a 'throw' method"); } return ContinueSentinel; } var record = tryCatch(method, delegate.iterator, context.arg); if ("throw" === record.type) return context.method = "throw", context.arg = record.arg, context.delegate = null, ContinueSentinel; var info = record.arg; return info ? info.done ? (context[delegate.resultName] = info.value, context.next = delegate.nextLoc, "return" !== context.method && (context.method = "next", context.arg = undefined), context.delegate = null, ContinueSentinel) : info : (context.method = "throw", context.arg = new TypeError("iterator result is not an object"), context.delegate = null, ContinueSentinel); } function pushTryEntry(locs) { var entry = { tryLoc: locs[0] }; 1 in locs && (entry.catchLoc = locs[1]), 2 in locs && (entry.finallyLoc = locs[2], entry.afterLoc = locs[3]), this.tryEntries.push(entry); } function resetTryEntry(entry) { var record = entry.completion || {}; record.type = "normal", delete record.arg, entry.completion = record; } function Context(tryLocsList) { this.tryEntries = [{ tryLoc: "root" }], tryLocsList.forEach(pushTryEntry, this), this.reset(!0); } function values(iterable) { if (iterable) { var iteratorMethod = iterable[iteratorSymbol]; if (iteratorMethod) return iteratorMethod.call(iterable); if ("function" == typeof iterable.next) return iterable; if (!isNaN(iterable.length)) { var i = -1, next = function next() { for (; ++i < iterable.length;) { if (hasOwn.call(iterable, i)) return next.value = iterable[i], next.done = !1, next; } return next.value = undefined, next.done = !0, next; }; return next.next = next; } } return { next: doneResult }; } function doneResult() { return { value: undefined, done: !0 }; } return GeneratorFunction.prototype = GeneratorFunctionPrototype, define(Gp, "constructor", GeneratorFunctionPrototype), define(GeneratorFunctionPrototype, "constructor", GeneratorFunction), GeneratorFunction.displayName = define(GeneratorFunctionPrototype, toStringTagSymbol, "GeneratorFunction"), exports.isGeneratorFunction = function (genFun) { var ctor = "function" == typeof genFun && genFun.constructor; return !!ctor && (ctor === GeneratorFunction || "GeneratorFunction" === (ctor.displayName || ctor.name)); }, exports.mark = function (genFun) { return Object.setPrototypeOf ? Object.setPrototypeOf(genFun, GeneratorFunctionPrototype) : (genFun.__proto__ = GeneratorFunctionPrototype, define(genFun, toStringTagSymbol, "GeneratorFunction")), genFun.prototype = Object.create(Gp), genFun; }, exports.awrap = function (arg) { return { __await: arg }; }, defineIteratorMethods(AsyncIterator.prototype), define(AsyncIterator.prototype, asyncIteratorSymbol, function () { return this; }), exports.AsyncIterator = AsyncIterator, exports.async = function (innerFn, outerFn, self, tryLocsList, PromiseImpl) { void 0 === PromiseImpl && (PromiseImpl = Promise); var iter = new AsyncIterator(wrap(innerFn, outerFn, self, tryLocsList), PromiseImpl); return exports.isGeneratorFunction(outerFn) ? iter : iter.next().then(function (result) { return result.done ? result.value : iter.next(); }); }, defineIteratorMethods(Gp), define(Gp, toStringTagSymbol, "Generator"), define(Gp, iteratorSymbol, function () { return this; }), define(Gp, "toString", function () { return "[object Generator]"; }), exports.keys = function (object) { var keys = []; for (var key in object) { keys.push(key); } return keys.reverse(), function next() { for (; keys.length;) { var key = keys.pop(); if (key in object) return next.value = key, next.done = !1, next; } return next.done = !0, next; }; }, exports.values = values, Context.prototype = { constructor: Context, reset: function reset(skipTempReset) { if (this.prev = 0, this.next = 0, this.sent = this._sent = undefined, this.done = !1, this.delegate = null, this.method = "next", this.arg = undefined, this.tryEntries.forEach(resetTryEntry), !skipTempReset) for (var name in this) { "t" === name.charAt(0) && hasOwn.call(this, name) && !isNaN(+name.slice(1)) && (this[name] = undefined); } }, stop: function stop() { this.done = !0; var rootRecord = this.tryEntries[0].completion; if ("throw" === rootRecord.type) throw rootRecord.arg; return this.rval; }, dispatchException: function dispatchException(exception) { if (this.done) throw exception; var context = this; function handle(loc, caught) { return record.type = "throw", record.arg = exception, context.next = loc, caught && (context.method = "next", context.arg = undefined), !!caught; } for (var i = this.tryEntries.length - 1; i >= 0; --i) { var entry = this.tryEntries[i], record = entry.completion; if ("root" === entry.tryLoc) return handle("end"); if (entry.tryLoc <= this.prev) { var hasCatch = hasOwn.call(entry, "catchLoc"), hasFinally = hasOwn.call(entry, "finallyLoc"); if (hasCatch && hasFinally) { if (this.prev < entry.catchLoc) return handle(entry.catchLoc, !0); if (this.prev < entry.finallyLoc) return handle(entry.finallyLoc); } else if (hasCatch) { if (this.prev < entry.catchLoc) return handle(entry.catchLoc, !0); } else { if (!hasFinally) throw new Error("try statement without catch or finally"); if (this.prev < entry.finallyLoc) return handle(entry.finallyLoc); } } } }, abrupt: function abrupt(type, arg) { for (var i = this.tryEntries.length - 1; i >= 0; --i) { var entry = this.tryEntries[i]; if (entry.tryLoc <= this.prev && hasOwn.call(entry, "finallyLoc") && this.prev < entry.finallyLoc) { var finallyEntry = entry; break; } } finallyEntry && ("break" === type || "continue" === type) && finallyEntry.tryLoc <= arg && arg <= finallyEntry.finallyLoc && (finallyEntry = null); var record = finallyEntry ? finallyEntry.completion : {}; return record.type = type, record.arg = arg, finallyEntry ? (this.method = "next", this.next = finallyEntry.finallyLoc, ContinueSentinel) : this.complete(record); }, complete: function complete(record, afterLoc) { if ("throw" === record.type) throw record.arg; return "break" === record.type || "continue" === record.type ? this.next = record.arg : "return" === record.type ? (this.rval = this.arg = record.arg, this.method = "return", this.next = "end") : "normal" === record.type && afterLoc && (this.next = afterLoc), ContinueSentinel; }, finish: function finish(finallyLoc) { for (var i = this.tryEntries.length - 1; i >= 0; --i) { var entry = this.tryEntries[i]; if (entry.finallyLoc === finallyLoc) return this.complete(entry.completion, entry.afterLoc), resetTryEntry(entry), ContinueSentinel; } }, "catch": function _catch(tryLoc) { for (var i = this.tryEntries.length - 1; i >= 0; --i) { var entry = this.tryEntries[i]; if (entry.tryLoc === tryLoc) { var record = entry.completion; if ("throw" === record.type) { var thrown = record.arg; resetTryEntry(entry); } return thrown; } } throw new Error("illegal catch attempt"); }, delegateYield: function delegateYield(iterable, resultName, nextLoc) { return this.delegate = { iterator: values(iterable), resultName: resultName, nextLoc: nextLoc }, "next" === this.method && (this.arg = undefined), ContinueSentinel; } }, exports; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

var UUID = require('cuid');

var searchStringInObject = function searchStringInObject(value) {
  var keys = [];
  Object.keys(value).forEach( /*#__PURE__*/function () {
    var _ref = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee(k) {
      return _regeneratorRuntime().wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              if (typeof value[k] === 'string' && value[k].length > 200) {
                if (isNaN(Number(value[k]))) {
                  keys.push(k);
                }
              }

            case 1:
            case "end":
              return _context.stop();
          }
        }
      }, _callee);
    }));

    return function (_x) {
      return _ref.apply(this, arguments);
    };
  }());
  var str = '';
  keys.forEach(function (k2) {
    return str += "".concat(value[k2], " ");
  });
  return str;
};

function add(data, keyProvided) {
  var _this = this;

  var keys = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : ['nombre', 'category'];

  // check for user errors
  if (!data) {
    this.userErrors.push('No data specified in add() method. You must use an object, e.g { id: 1, name: "Bill", age: 47 }');
  } else if (!(_typeof(data) == 'object' && data instanceof Array == false)) {
    this.userErrors.push('Data passed to .add() must be an object. Not an array, string, number or boolean.');
  } // no user errors, do the add


  if (!this.userErrors.length) {
    var collectionName = this.collectionName;
    return new Promise(function (resolve, reject) {
      var key = null; // if no key provided, generate random, ordered key

      if (!keyProvided) {
        key = UUID.generate();
      } else {
        key = keyProvided;
      }

      try {
        if (Array.isArray(keys)) {
          if (typeof data === 'string') data.___prepared___ = (0, _fuzzysort.prepare)(data);

          if (!Array.isArray(data) && _typeof(data) === 'object' && Object.keys(data).some(function (k) {
            return keys.some(function (k2) {
              return k2 === k;
            });
          })) {
            var str = '';
            keys.forEach(function (k2) {
              return str += "".concat(data[k2], " ");
            });
            data.___prepared___ = (0, _fuzzysort.prepare)(str);
          } else if (!Array.isArray(data) && _typeof(data) === 'object') {
            data.___prepared___ = (0, _fuzzysort.prepare)(searchStringInObject(data));
          } else if (Array.isArray(data)) {
            var _str = '';
            data.forEach(function (v) {
              if (typeof v === 'string') {
                if (_str.length > 500) {
                  _str += v;
                }
              } else if (!Array.isArray(v) && _typeof(v) === 'object') {
                _str += searchStringInObject(v);
              }
            });
            data.___prepared___ = (0, _fuzzysort.prepare)(_str);
          }
        }
      } catch (error) {
        console.trace(error);
      }

      return _this.lf[collectionName].setItem(key, data).then( /*#__PURE__*/_asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee2() {
        return _regeneratorRuntime().wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                resolve(_success["default"].call(_this, "Document added to \"".concat(collectionName, "\" collection."), {
                  key: key,
                  data: data
                }));

              case 1:
              case "end":
                return _context2.stop();
            }
          }
        }, _callee2);
      })))["catch"](function (err) {
        reject(_error["default"].call(_this, "Could not add Document to ".concat(collectionName, " collection.")));
      });
    });
  } else {
    _showUserErrors["default"].call(this);
  }
}

module.exports = exports.default;

},{"../../api-utils/error":2,"../../api-utils/showUserErrors":5,"../../api-utils/success":6,"cuid":22,"fuzzysort":26}],8:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = deleteIt;

var _isSubset = _interopRequireDefault(require("../../utils/isSubset"));

var _logger = _interopRequireDefault(require("../../utils/logger"));

var _selectionLevel = _interopRequireDefault(require("../../api-utils/selectionLevel"));

var _success = _interopRequireDefault(require("../../api-utils/success"));

var _error = _interopRequireDefault(require("../../api-utils/error"));

var _showUserErrors = _interopRequireDefault(require("../../api-utils/showUserErrors"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }

function deleteIt() {
  var _this = this;

  return new Promise(function (resolve, reject) {
    // delete database
    _this.deleteDatabase = function () {
      var dbName = _this.dbName;
      indexedDB.deleteDatabase(dbName);
      resolve(_success["default"].call(_this, "Database \"".concat(dbName, "\" deleted."), {
        database: dbName
      }));
    }; // delete collection


    _this.deleteCollection = function () {
      var dbName = _this.dbName;
      var collectionName = _this.collectionName; // we can only delete one collection at a time, which is why we need a queue

      _this.addToDeleteCollectionQueue = function (collectionName) {
        _this.deleteCollectionQueue.queue.push(collectionName);

        _this.runDeleteCollectionQueue();
      };

      _this.runDeleteCollectionQueue = function () {
        if (_this.deleteCollectionQueue.running == false) {
          _this.deleteCollectionQueue.running = true;

          _this.deleteNextCollectionFromQueue();
        }
      };

      _this.deleteNextCollectionFromQueue = function () {
        if (_this.deleteCollectionQueue.queue.length) {
          var collectionToDelete = _this.deleteCollectionQueue.queue[0];

          _this.deleteCollectionQueue.queue.shift();

          _this.lf[collectionToDelete].dropInstance({
            name: dbName,
            storeName: collectionToDelete
          }).then(function () {
            _this.deleteNextCollectionFromQueue();

            resolve(_success["default"].call(_this, "Collection \"".concat(collectionToDelete, "\" deleted."), {
              collection: collectionToDelete
            }));
          })["catch"](function (error) {
            reject(error.call(_this, "Collection \"".concat(collectionToDelete, "\" could not be deleted.")));
          });
        } else {
          _this.deleteCollectionQueue.running = false;
        }
      };

      _this.addToDeleteCollectionQueue(collectionName);
    }; // delete document


    _this.deleteDocument = function () {
      var collectionName = _this.collectionName;
      var docSelectionCriteria = _this.docSelectionCriteria; // delete document by criteria

      _this.deleteDocumentByCriteria = function () {
        var keysForDeletion = [];

        _this.lf[collectionName].iterate(function (value, key) {
          if ((0, _isSubset["default"])(value, docSelectionCriteria)) {
            keysForDeletion.push(key);
          }
        }).then(function () {
          if (!keysForDeletion.length) {
            reject(_error["default"].call(_this, "No Documents found in \"".concat(collectionName, "\" Collection with criteria ").concat(JSON.stringify(docSelectionCriteria), ". No documents deleted.")));
          }

          if (keysForDeletion.length > 1) {
            _logger["default"].warn.call(_this, "Multiple documents (".concat(keysForDeletion.length, ") with ").concat(JSON.stringify(docSelectionCriteria), " found."));
          }
        }).then(function () {
          keysForDeletion.forEach(function (key, index) {
            _this.lf[collectionName].removeItem(key).then(function () {
              if (index === keysForDeletion.length - 1) {
                resolve(_success["default"].call(_this, "".concat(keysForDeletion.length, " Document").concat(keysForDeletion.length > 1 ? 's' : '', " with ").concat(JSON.stringify(docSelectionCriteria), " deleted."), {
                  keys: keysForDeletion
                }));
              }
            })["catch"](function (err) {
              reject(_error["default"].call(_this, "Could not delete ".concat(keysForDeletion.length, " Documents in ").concat(collectionName, " Collection.")));
            });
          });
        });
      }; // delete document by key


      _this.deleteDocumentByKey = function () {
        _this.lf[collectionName].getItem(docSelectionCriteria).then(function (value) {
          if (value) {
            _this.lf[collectionName].removeItem(docSelectionCriteria).then(function () {
              resolve(_success["default"].call(_this, "Document with key ".concat(JSON.stringify(docSelectionCriteria), " deleted."), {
                key: docSelectionCriteria
              }));
            })["catch"](function (err) {
              reject(_error["default"].call(this, "No Document found in \"".concat(collectionName, "\" Collection with key ").concat(JSON.stringify(docSelectionCriteria), ". No document was deleted.")));
            });
          } else {
            reject(_error["default"].call(_this, "No Document found in \"".concat(collectionName, "\" Collection with key ").concat(JSON.stringify(docSelectionCriteria), ". No document was deleted.")));
          }
        });
      };

      if (_typeof(docSelectionCriteria) == 'object') {
        return _this.deleteDocumentByCriteria();
      } else {
        return _this.deleteDocumentByKey();
      }
    };

    if (!_this.userErrors.length) {
      var currentSelectionLevel = _selectionLevel["default"].call(_this);

      if (currentSelectionLevel == 'db') {
        return _this.deleteDatabase();
      } else if (currentSelectionLevel == 'collection') {
        return _this.deleteCollection();
      } else if (currentSelectionLevel == 'doc') {
        return _this.deleteDocument();
      }
    } else {
      _showUserErrors["default"].call(_this);
    }
  });
}

module.exports = exports.default;

},{"../../api-utils/error":2,"../../api-utils/selectionLevel":4,"../../api-utils/showUserErrors":5,"../../api-utils/success":6,"../../utils/isSubset":19,"../../utils/logger":20}],9:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = get;

var _isSubset = _interopRequireDefault(require("../../utils/isSubset"));

var _logger = _interopRequireDefault(require("../../utils/logger"));

var _reset = _interopRequireDefault(require("../../api-utils/reset"));

var _selectionLevel = _interopRequireDefault(require("../../api-utils/selectionLevel"));

var _showUserErrors = _interopRequireDefault(require("../../api-utils/showUserErrors"));

var _fuzzysort = require("fuzzysort");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }

function get() {
  var _this = this;

  var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {
    keys: false
  };

  // get collection
  this.getCollection = function () {
    var collectionName = _this.collectionName;
    var orderByProperty = _this.orderByProperty;
    var orderByDirection = _this.orderByDirection;
    var limitBy = _this.limitBy;
    var containsProperty = _this.containsProperty;
    var containsValue = _this.containsValue;
    var containsExact = _this.containsExact;
    var containsSinError = _this.containsSinError;
    var collection = [];
    var logMessage;
    return _this.lf[collectionName].iterate(function (value, key) {
      var collectionItem = {};

      if (!options.keys) {
        collectionItem = value;
      } else {
        collectionItem = {
          key: key,
          data: value
        };
      }

      logMessage = "Got \"".concat(collectionName, "\" collection");

      if (containsProperty && containsValue) {
        var valor = value[containsProperty];

        try {
          if (typeof valor === 'boolean' && typeof containsValue === 'boolean') {
            if (valor === containsValue) collection.push(collectionItem);
          } else if (typeof valor === 'string' && typeof containsValue === 'string') {
            var val = String(valor).toLowerCase();
            var cVal = String(containsValue).toLowerCase();

            if (!containsExact) {
              if (containsSinError && val.includes(cVal)) {
                collection.push(collectionItem);
              } else {
                var search = (0, _fuzzysort.single)(cVal, val);

                if (search) {
                  collection.push(collectionItem);
                }
              }
            } else if (val === cVal) collection.push(collectionItem);

            if (limitBy) {
              if (collection.length > limitBy + 10) {
                logMessage += ", limited to contains is ".concat(limitBy, " ");
                return collection;
              }
            }
          } else if (typeof valor === 'number' && typeof containsValue === 'number') {
            if (valor === containsValue) collection.push(collectionItem);
          }

          logMessage += ", contains: \"".concat(containsValue, "\" in \"").concat(containsProperty, "\"");
        } catch (error) {
          _this.userErrors.push("Constain():".concat(error.message));
        }
      } else {
        collection.push(collectionItem);
      }
    }).then(function () {
      // orderBy
      if (orderByProperty) {
        logMessage += ", ordered by \"".concat(orderByProperty, "\"");

        if (!options.keys) {
          collection.sort(function (a, b) {
            return a[orderByProperty].toString().localeCompare(b[orderByProperty].toString());
          });
        } else {
          collection.sort(function (a, b) {
            return a.data[orderByProperty].toString().localeCompare(b.data[orderByProperty].toString());
          });
        }
      }

      if (orderByDirection == 'desc') {
        logMessage += " (descending)";
        collection.reverse();
      } // limit


      if (limitBy) {
        logMessage += ", limited to ".concat(limitBy);
        collection = collection.splice(0, limitBy);
      }

      logMessage += ":";

      _logger["default"].log.call(_this, logMessage, collection);

      _reset["default"].call(_this);

      return collection;
    });
  }; // get document


  this.getDocument = function () {
    var collectionName = _this.collectionName;
    var docSelectionCriteria = _this.docSelectionCriteria;
    var collection = [];
    var document = {}; // get document by criteria

    _this.getDocumentByCriteria = function () {
      return _this.lf[collectionName].iterate(function (value, key) {
        if ((0, _isSubset["default"])(value, docSelectionCriteria)) {
          collection.push(value);
        }
      }).then(function () {
        if (!collection.length) {
          _logger["default"].error.call(_this, "Could not find Document in \"".concat(collectionName, "\" collection with criteria: ").concat(JSON.stringify(docSelectionCriteria)));
        } else {
          document = collection[0];

          _logger["default"].log.call(_this, "Got Document with ".concat(JSON.stringify(docSelectionCriteria), ":"), document);

          _reset["default"].call(_this);

          return document;
        }
      });
    }; // get document by key


    _this.getDocumentByKey = function () {
      return _this.lf[collectionName].getItem(docSelectionCriteria).then(function (value) {
        document = value;

        if (document) {
          _logger["default"].log.call(_this, "Got Document with key ".concat(JSON.stringify(docSelectionCriteria), ":"), document);
        } else {
          _logger["default"].error.call(_this, "Could not find Document in \"".concat(collectionName, "\" collection with Key: ").concat(JSON.stringify(docSelectionCriteria)));
        }

        _reset["default"].call(_this);

        return document;
      })["catch"](function (err) {
        _logger["default"].error.call(_this, "Could not find Document in \"".concat(collectionName, "\" collection with Key: ").concat(JSON.stringify(docSelectionCriteria)));

        _reset["default"].call(_this);
      });
    };

    if (_typeof(docSelectionCriteria) == 'object') {
      return _this.getDocumentByCriteria();
    } else {
      return _this.getDocumentByKey();
    }
  }; // check for user errors


  if (!(_typeof(options) == 'object' && options instanceof Array == false)) {
    this.userErrors.push('Data passed to .get() must be an object. Not an array, string, number or boolean. The object must contain a "keys" property set to true or false, e.g. { keys: true }');
  } else {
    if (!options.hasOwnProperty('keys')) {
      this.userErrors.push('Object passed to get() method must contain a "keys" property set to boolean true or false, e.g. { keys: true }');
    } else {
      if (typeof options.keys !== 'boolean') {
        this.userErrors.push('Property "keys" passed into get() method must be assigned a boolean value (true or false). Not a string or integer.');
      }
    }
  }

  if (!this.userErrors.length) {
    var currentSelectionLevel = _selectionLevel["default"].call(this);

    if (currentSelectionLevel == 'collection') {
      return this.getCollection();
    } else if (currentSelectionLevel == 'doc') {
      return this.getDocument();
    }
  } else {
    _showUserErrors["default"].call(this);

    return null;
  }
}

module.exports = exports.default;

},{"../../api-utils/reset":3,"../../api-utils/selectionLevel":4,"../../api-utils/showUserErrors":5,"../../utils/isSubset":19,"../../utils/logger":20,"fuzzysort":26}],10:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = search;

var _logger = _interopRequireDefault(require("../../utils/logger"));

var _reset = _interopRequireDefault(require("../../api-utils/reset"));

var _selectionLevel = _interopRequireDefault(require("../../api-utils/selectionLevel"));

var _showUserErrors = _interopRequireDefault(require("../../api-utils/showUserErrors"));

var _fuzzysort = require("fuzzysort");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _regeneratorRuntime() { "use strict"; /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/facebook/regenerator/blob/main/LICENSE */ _regeneratorRuntime = function _regeneratorRuntime() { return exports; }; var exports = {}, Op = Object.prototype, hasOwn = Op.hasOwnProperty, $Symbol = "function" == typeof Symbol ? Symbol : {}, iteratorSymbol = $Symbol.iterator || "@@iterator", asyncIteratorSymbol = $Symbol.asyncIterator || "@@asyncIterator", toStringTagSymbol = $Symbol.toStringTag || "@@toStringTag"; function define(obj, key, value) { return Object.defineProperty(obj, key, { value: value, enumerable: !0, configurable: !0, writable: !0 }), obj[key]; } try { define({}, ""); } catch (err) { define = function define(obj, key, value) { return obj[key] = value; }; } function wrap(innerFn, outerFn, self, tryLocsList) { var protoGenerator = outerFn && outerFn.prototype instanceof Generator ? outerFn : Generator, generator = Object.create(protoGenerator.prototype), context = new Context(tryLocsList || []); return generator._invoke = function (innerFn, self, context) { var state = "suspendedStart"; return function (method, arg) { if ("executing" === state) throw new Error("Generator is already running"); if ("completed" === state) { if ("throw" === method) throw arg; return doneResult(); } for (context.method = method, context.arg = arg;;) { var delegate = context.delegate; if (delegate) { var delegateResult = maybeInvokeDelegate(delegate, context); if (delegateResult) { if (delegateResult === ContinueSentinel) continue; return delegateResult; } } if ("next" === context.method) context.sent = context._sent = context.arg;else if ("throw" === context.method) { if ("suspendedStart" === state) throw state = "completed", context.arg; context.dispatchException(context.arg); } else "return" === context.method && context.abrupt("return", context.arg); state = "executing"; var record = tryCatch(innerFn, self, context); if ("normal" === record.type) { if (state = context.done ? "completed" : "suspendedYield", record.arg === ContinueSentinel) continue; return { value: record.arg, done: context.done }; } "throw" === record.type && (state = "completed", context.method = "throw", context.arg = record.arg); } }; }(innerFn, self, context), generator; } function tryCatch(fn, obj, arg) { try { return { type: "normal", arg: fn.call(obj, arg) }; } catch (err) { return { type: "throw", arg: err }; } } exports.wrap = wrap; var ContinueSentinel = {}; function Generator() {} function GeneratorFunction() {} function GeneratorFunctionPrototype() {} var IteratorPrototype = {}; define(IteratorPrototype, iteratorSymbol, function () { return this; }); var getProto = Object.getPrototypeOf, NativeIteratorPrototype = getProto && getProto(getProto(values([]))); NativeIteratorPrototype && NativeIteratorPrototype !== Op && hasOwn.call(NativeIteratorPrototype, iteratorSymbol) && (IteratorPrototype = NativeIteratorPrototype); var Gp = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(IteratorPrototype); function defineIteratorMethods(prototype) { ["next", "throw", "return"].forEach(function (method) { define(prototype, method, function (arg) { return this._invoke(method, arg); }); }); } function AsyncIterator(generator, PromiseImpl) { function invoke(method, arg, resolve, reject) { var record = tryCatch(generator[method], generator, arg); if ("throw" !== record.type) { var result = record.arg, value = result.value; return value && "object" == _typeof(value) && hasOwn.call(value, "__await") ? PromiseImpl.resolve(value.__await).then(function (value) { invoke("next", value, resolve, reject); }, function (err) { invoke("throw", err, resolve, reject); }) : PromiseImpl.resolve(value).then(function (unwrapped) { result.value = unwrapped, resolve(result); }, function (error) { return invoke("throw", error, resolve, reject); }); } reject(record.arg); } var previousPromise; this._invoke = function (method, arg) { function callInvokeWithMethodAndArg() { return new PromiseImpl(function (resolve, reject) { invoke(method, arg, resolve, reject); }); } return previousPromise = previousPromise ? previousPromise.then(callInvokeWithMethodAndArg, callInvokeWithMethodAndArg) : callInvokeWithMethodAndArg(); }; } function maybeInvokeDelegate(delegate, context) { var method = delegate.iterator[context.method]; if (undefined === method) { if (context.delegate = null, "throw" === context.method) { if (delegate.iterator["return"] && (context.method = "return", context.arg = undefined, maybeInvokeDelegate(delegate, context), "throw" === context.method)) return ContinueSentinel; context.method = "throw", context.arg = new TypeError("The iterator does not provide a 'throw' method"); } return ContinueSentinel; } var record = tryCatch(method, delegate.iterator, context.arg); if ("throw" === record.type) return context.method = "throw", context.arg = record.arg, context.delegate = null, ContinueSentinel; var info = record.arg; return info ? info.done ? (context[delegate.resultName] = info.value, context.next = delegate.nextLoc, "return" !== context.method && (context.method = "next", context.arg = undefined), context.delegate = null, ContinueSentinel) : info : (context.method = "throw", context.arg = new TypeError("iterator result is not an object"), context.delegate = null, ContinueSentinel); } function pushTryEntry(locs) { var entry = { tryLoc: locs[0] }; 1 in locs && (entry.catchLoc = locs[1]), 2 in locs && (entry.finallyLoc = locs[2], entry.afterLoc = locs[3]), this.tryEntries.push(entry); } function resetTryEntry(entry) { var record = entry.completion || {}; record.type = "normal", delete record.arg, entry.completion = record; } function Context(tryLocsList) { this.tryEntries = [{ tryLoc: "root" }], tryLocsList.forEach(pushTryEntry, this), this.reset(!0); } function values(iterable) { if (iterable) { var iteratorMethod = iterable[iteratorSymbol]; if (iteratorMethod) return iteratorMethod.call(iterable); if ("function" == typeof iterable.next) return iterable; if (!isNaN(iterable.length)) { var i = -1, next = function next() { for (; ++i < iterable.length;) { if (hasOwn.call(iterable, i)) return next.value = iterable[i], next.done = !1, next; } return next.value = undefined, next.done = !0, next; }; return next.next = next; } } return { next: doneResult }; } function doneResult() { return { value: undefined, done: !0 }; } return GeneratorFunction.prototype = GeneratorFunctionPrototype, define(Gp, "constructor", GeneratorFunctionPrototype), define(GeneratorFunctionPrototype, "constructor", GeneratorFunction), GeneratorFunction.displayName = define(GeneratorFunctionPrototype, toStringTagSymbol, "GeneratorFunction"), exports.isGeneratorFunction = function (genFun) { var ctor = "function" == typeof genFun && genFun.constructor; return !!ctor && (ctor === GeneratorFunction || "GeneratorFunction" === (ctor.displayName || ctor.name)); }, exports.mark = function (genFun) { return Object.setPrototypeOf ? Object.setPrototypeOf(genFun, GeneratorFunctionPrototype) : (genFun.__proto__ = GeneratorFunctionPrototype, define(genFun, toStringTagSymbol, "GeneratorFunction")), genFun.prototype = Object.create(Gp), genFun; }, exports.awrap = function (arg) { return { __await: arg }; }, defineIteratorMethods(AsyncIterator.prototype), define(AsyncIterator.prototype, asyncIteratorSymbol, function () { return this; }), exports.AsyncIterator = AsyncIterator, exports.async = function (innerFn, outerFn, self, tryLocsList, PromiseImpl) { void 0 === PromiseImpl && (PromiseImpl = Promise); var iter = new AsyncIterator(wrap(innerFn, outerFn, self, tryLocsList), PromiseImpl); return exports.isGeneratorFunction(outerFn) ? iter : iter.next().then(function (result) { return result.done ? result.value : iter.next(); }); }, defineIteratorMethods(Gp), define(Gp, toStringTagSymbol, "Generator"), define(Gp, iteratorSymbol, function () { return this; }), define(Gp, "toString", function () { return "[object Generator]"; }), exports.keys = function (object) { var keys = []; for (var key in object) { keys.push(key); } return keys.reverse(), function next() { for (; keys.length;) { var key = keys.pop(); if (key in object) return next.value = key, next.done = !1, next; } return next.done = !0, next; }; }, exports.values = values, Context.prototype = { constructor: Context, reset: function reset(skipTempReset) { if (this.prev = 0, this.next = 0, this.sent = this._sent = undefined, this.done = !1, this.delegate = null, this.method = "next", this.arg = undefined, this.tryEntries.forEach(resetTryEntry), !skipTempReset) for (var name in this) { "t" === name.charAt(0) && hasOwn.call(this, name) && !isNaN(+name.slice(1)) && (this[name] = undefined); } }, stop: function stop() { this.done = !0; var rootRecord = this.tryEntries[0].completion; if ("throw" === rootRecord.type) throw rootRecord.arg; return this.rval; }, dispatchException: function dispatchException(exception) { if (this.done) throw exception; var context = this; function handle(loc, caught) { return record.type = "throw", record.arg = exception, context.next = loc, caught && (context.method = "next", context.arg = undefined), !!caught; } for (var i = this.tryEntries.length - 1; i >= 0; --i) { var entry = this.tryEntries[i], record = entry.completion; if ("root" === entry.tryLoc) return handle("end"); if (entry.tryLoc <= this.prev) { var hasCatch = hasOwn.call(entry, "catchLoc"), hasFinally = hasOwn.call(entry, "finallyLoc"); if (hasCatch && hasFinally) { if (this.prev < entry.catchLoc) return handle(entry.catchLoc, !0); if (this.prev < entry.finallyLoc) return handle(entry.finallyLoc); } else if (hasCatch) { if (this.prev < entry.catchLoc) return handle(entry.catchLoc, !0); } else { if (!hasFinally) throw new Error("try statement without catch or finally"); if (this.prev < entry.finallyLoc) return handle(entry.finallyLoc); } } } }, abrupt: function abrupt(type, arg) { for (var i = this.tryEntries.length - 1; i >= 0; --i) { var entry = this.tryEntries[i]; if (entry.tryLoc <= this.prev && hasOwn.call(entry, "finallyLoc") && this.prev < entry.finallyLoc) { var finallyEntry = entry; break; } } finallyEntry && ("break" === type || "continue" === type) && finallyEntry.tryLoc <= arg && arg <= finallyEntry.finallyLoc && (finallyEntry = null); var record = finallyEntry ? finallyEntry.completion : {}; return record.type = type, record.arg = arg, finallyEntry ? (this.method = "next", this.next = finallyEntry.finallyLoc, ContinueSentinel) : this.complete(record); }, complete: function complete(record, afterLoc) { if ("throw" === record.type) throw record.arg; return "break" === record.type || "continue" === record.type ? this.next = record.arg : "return" === record.type ? (this.rval = this.arg = record.arg, this.method = "return", this.next = "end") : "normal" === record.type && afterLoc && (this.next = afterLoc), ContinueSentinel; }, finish: function finish(finallyLoc) { for (var i = this.tryEntries.length - 1; i >= 0; --i) { var entry = this.tryEntries[i]; if (entry.finallyLoc === finallyLoc) return this.complete(entry.completion, entry.afterLoc), resetTryEntry(entry), ContinueSentinel; } }, "catch": function _catch(tryLoc) { for (var i = this.tryEntries.length - 1; i >= 0; --i) { var entry = this.tryEntries[i]; if (entry.tryLoc === tryLoc) { var record = entry.completion; if ("throw" === record.type) { var thrown = record.arg; resetTryEntry(entry); } return thrown; } } throw new Error("illegal catch attempt"); }, delegateYield: function delegateYield(iterable, resultName, nextLoc) { return this.delegate = { iterator: values(iterable), resultName: resultName, nextLoc: nextLoc }, "next" === this.method && (this.arg = undefined), ContinueSentinel; } }, exports; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }

function search() {
  var _this = this;

  var query = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';
  var opciones = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {
    destacado: true
  };
  if (!query) return _logger["default"].error.call(this, 'query in search is empty');
  if (_typeof(opciones) !== 'object') return _logger["default"].error.call(this, 'no valid opciones');
  this.go = /*#__PURE__*/_asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee() {
    var collectionName, targets, options, results;
    return _regeneratorRuntime().wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            collectionName = _this.collectionName;
            _context.next = 3;
            return new Promise(function (res, rej) {
              var targets = [];

              _this.lf[collectionName].iterate(function (value, key) {
                var si = (0, _fuzzysort.single)(query, value.___prepared___);

                if (si) {
                  if (si.score > -200) {
                    if (opciones.destacado) {
                      value.__destacado = (0, _fuzzysort.highlight)(si, '<strong>', '</strong>');
                    }

                    if (targets.push(value) > 100) return targets;
                  }
                }
              }).then(function () {
                res(targets);
              })["catch"](function (e) {
                return rej(e);
              });
            });

          case 3:
            targets = _context.sent;
            options = {
              limit: 100,
              // don't return more results than you need!
              threshold: -10000,
              // don't return bad results
              key: '___prepared___'
            };
            results = (0, _fuzzysort.go)(query, targets, options);

            _reset["default"].call(_this);

            _logger["default"].log.call(_this, 'SEARCHS', results.length);

            return _context.abrupt("return", results.map(function (o) {
              return o.obj;
            }));

          case 9:
          case "end":
            return _context.stop();
        }
      }
    }, _callee);
  })); // check for user errors

  if (!((typeof options === "undefined" ? "undefined" : _typeof(options)) == 'object' && options instanceof Array == false)) {
    this.userErrors.push('Data passed to .get() must be an object. Not an array, string, number or boolean. The object must contain a "keys" property set to true or false, e.g. { keys: true }');
  } else {
    if (!options.hasOwnProperty('keys')) {
      this.userErrors.push('Object passed to get() method must contain a "keys" property set to boolean true or false, e.g. { keys: true }');
    } else {
      if (typeof options.keys !== 'boolean') {
        this.userErrors.push('Property "keys" passed into get() method must be assigned a boolean value (true or false). Not a string or integer.');
      }
    }
  }

  var currentSelectionLevel = _selectionLevel["default"].call(this);

  if (currentSelectionLevel == 'collection') {
    return this.go();
  } else if (currentSelectionLevel == 'doc') {
    this.userErrors.push('Function no avalible in doc');
  }

  if (this.userErrors.length) {
    _showUserErrors["default"].call(this);

    return null;
  }
}

module.exports = exports.default;

},{"../../api-utils/reset":3,"../../api-utils/selectionLevel":4,"../../api-utils/showUserErrors":5,"../../utils/logger":20,"fuzzysort":26}],11:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = set;

var _logger = _interopRequireDefault(require("../../utils/logger"));

var _isSubset = _interopRequireDefault(require("../../utils/isSubset"));

var _success = _interopRequireDefault(require("../../api-utils/success"));

var _error = _interopRequireDefault(require("../../api-utils/error"));

var _showUserErrors = _interopRequireDefault(require("../../api-utils/showUserErrors"));

var _selectionLevel = _interopRequireDefault(require("../../api-utils/selectionLevel"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }

function set(newDocument) {
  var _this = this;

  var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {
    keys: false
  };
  var collectionName = this.collectionName;
  var docSelectionCriteria = this.docSelectionCriteria;

  var currentSelectionLevel = _selectionLevel["default"].call(this);

  return new Promise(function (resolve, reject) {
    // set collection
    _this.setCollection = function () {
      _this.lf[collectionName].clear().then(function () {
        if (!options.keys) {
          newDocument.forEach(function (doc) {
            _this.add(doc);
          });
          resolve(_success["default"].call(_this, "Collection \"".concat(collectionName, "\" set with ").concat(newDocument.length, " Documents."), newDocument));
        } else {
          console.log('keys provided'); // check that every document in array has a _key property

          var docsWithoutKey = 0;
          newDocument.forEach(function (doc) {
            if (!doc.hasOwnProperty('_key')) {
              docsWithoutKey++;
            }
          });

          if (docsWithoutKey) {
            reject(_error["default"].call(_this, "Documents provided to .set() in an array must each have a _key property set to a string."));
          } else {
            newDocument.forEach(function (doc) {
              var key = doc._key;
              delete doc._key;

              _this.add(doc, key);
            });
            resolve(_success["default"].call(_this, "Collection \"".concat(collectionName, "\" set with ").concat(newDocument.length, " Documents."), newDocument));
          }
        }
      })["catch"](function (err) {
        reject(_error["default"].call(_this, "Could not set ".concat(collectionName, " Collection with data ").concat(JSON.stringify(newDocument), ".")));
      });
    }; // set document


    _this.setDocument = function () {
      // set document by criteria
      _this.setDocumentByCriteria = function () {
        var docsToSet = [];

        _this.lf[collectionName].iterate(function (value, key) {
          if ((0, _isSubset["default"])(value, docSelectionCriteria)) {
            docsToSet.push({
              key: key,
              newDocument: newDocument
            });
          }
        }).then(function () {
          if (!docsToSet.length) {
            reject(_error["default"].call(_this, "No Documents found in ".concat(collectionName, " Collection with criteria ").concat(JSON.stringify(docSelectionCriteria), ".")));
          }

          if (docsToSet.length > 1) {
            _logger["default"].warn.call(_this, "Multiple documents (".concat(docsToSet.length, ") with ").concat(JSON.stringify(docSelectionCriteria), " found for setting."));
          }
        }).then(function () {
          docsToSet.forEach(function (docToSet, index) {
            _this.lf[collectionName].setItem(docToSet.key, docToSet.newDocument).then(function (value) {
              if (index === docsToSet.length - 1) {
                resolve(_success["default"].call(_this, "".concat(docsToSet.length, " Document").concat(docsToSet.length > 1 ? 's' : '', " in \"").concat(collectionName, "\" collection with ").concat(JSON.stringify(docSelectionCriteria), " was set."), newDocument));
              }
            })["catch"](function (err) {
              reject(_error["default"].call(_this, "Could not set ".concat(docsToSet.length, " Documents in ").concat(collectionName, " Collection.")));
            });
          });
        });
      }; // set document by key


      _this.setDocumentByKey = function () {
        _this.lf[collectionName].setItem(docSelectionCriteria, newDocument).then(function (value) {
          resolve(_success["default"].call(_this, "Document in \"".concat(collectionName, "\" collection with key ").concat(JSON.stringify(docSelectionCriteria), " was set."), newDocument));
        })["catch"](function (err) {
          reject(_error["default"].call(_this, "Document in \"".concat(collectionName, "\" collection with key ").concat(JSON.stringify(docSelectionCriteria), " could not be set.")));
        });
      };

      if (_typeof(docSelectionCriteria) == 'object') {
        return _this.setDocumentByCriteria();
      } else {
        return _this.setDocumentByKey();
      }
    }; // check for user errors


    if (!newDocument) {
      _this.userErrors.push('No new Document object provided to set() method. Use an object e.g. { id: 1, name: "Bill", age: 47 }');
    } else if (currentSelectionLevel === 'doc') {
      if (!(_typeof(newDocument) == 'object' && newDocument instanceof Array == false)) {
        _this.userErrors.push('Data passed to .set() must be an object. Not an array, string, number or boolean.');
      }
    } else if (currentSelectionLevel === 'collection') {
      if (!(_typeof(newDocument) == 'object' && newDocument instanceof Array == true)) {
        _this.userErrors.push('Data passed to .set() must be an array of objects. Not an object, string, number or boolean.');
      }
    }

    if (!_this.userErrors.length) {
      if (currentSelectionLevel == 'collection') {
        return _this.setCollection();
      } else if (currentSelectionLevel == 'doc') {
        return _this.setDocument();
      }
    } else {
      _showUserErrors["default"].call(_this);
    }
  });
}

module.exports = exports.default;

},{"../../api-utils/error":2,"../../api-utils/selectionLevel":4,"../../api-utils/showUserErrors":5,"../../api-utils/success":6,"../../utils/isSubset":19,"../../utils/logger":20}],12:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = update;

var _logger = _interopRequireDefault(require("../../utils/logger"));

var _isSubset = _interopRequireDefault(require("../../utils/isSubset"));

var _updateObject = _interopRequireDefault(require("../../utils/updateObject"));

var _success = _interopRequireDefault(require("../../api-utils/success"));

var _error = _interopRequireDefault(require("../../api-utils/error"));

var _showUserErrors = _interopRequireDefault(require("../../api-utils/showUserErrors"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }

function update(docUpdates) {
  var _this = this;

  var collectionName = this.collectionName;
  var docSelectionCriteria = this.docSelectionCriteria;
  return new Promise(function (resolve, reject) {
    // update document by criteria
    _this.updateDocumentByCriteria = function () {
      var docsToUpdate = [];

      _this.lf[collectionName].iterate(function (value, key) {
        if ((0, _isSubset["default"])(value, docSelectionCriteria)) {
          var newDocument = (0, _updateObject["default"])(value, docUpdates);
          docsToUpdate.push({
            key: key,
            newDocument: newDocument
          });
        }
      }).then(function () {
        if (!docsToUpdate.length) {
          reject(_error["default"].call(_this, "No Documents found in ".concat(collectionName, " Collection with criteria ").concat(JSON.stringify(docSelectionCriteria), ".")));
        }

        if (docsToUpdate.length > 1) {
          _logger["default"].warn.call(_this, "Multiple documents (".concat(docsToUpdate.length, ") with ").concat(JSON.stringify(docSelectionCriteria), " found for updating."));
        }
      }).then(function () {
        docsToUpdate.forEach(function (docToUpdate, index) {
          _this.lf[collectionName].setItem(docToUpdate.key, docToUpdate.newDocument).then(function (value) {
            if (index === docsToUpdate.length - 1) {
              resolve(_success["default"].call(_this, "".concat(docsToUpdate.length, " Document").concat(docsToUpdate.length > 1 ? 's' : '', " in \"").concat(collectionName, "\" collection with ").concat(JSON.stringify(docSelectionCriteria), " updated."), docUpdates));
            }
          })["catch"](function (err) {
            reject(_error["default"].call(_this, "Could not update ".concat(docsToUpdate.length, " Documents in ").concat(collectionName, " Collection.")));
          });
        });
      });
    }; // update document by key


    _this.updateDocumentByKey = function () {
      var newDocument = {};

      _this.lf[collectionName].getItem(docSelectionCriteria).then(function (value) {
        newDocument = (0, _updateObject["default"])(value, docUpdates);

        _this.lf[collectionName].setItem(docSelectionCriteria, newDocument);

        resolve(_success["default"].call(_this, "Document in \"".concat(collectionName, "\" collection with key ").concat(JSON.stringify(docSelectionCriteria), " updated."), newDocument));
      })["catch"](function (err) {
        reject(_error["default"].call(_this, "No Document found in \"".concat(collectionName, "\" collection with key ").concat(JSON.stringify(docSelectionCriteria))));
      });
    }; // check for user errors


    if (!docUpdates) {
      _this.userErrors.push('No update object provided to update() method. Use an object e.g. { name: "William" }');
    } else if (!(_typeof(docUpdates) == 'object' && docUpdates instanceof Array == false)) {
      _this.userErrors.push('Data passed to .update() must be an object. Not an array, string, number or boolean.');
    }

    if (!_this.userErrors.length) {
      if (_typeof(docSelectionCriteria) == 'object') {
        _this.updateDocumentByCriteria();
      } else {
        _this.updateDocumentByKey();
      }
    } else {
      _showUserErrors["default"].call(_this);
    }
  });
}

module.exports = exports.default;

},{"../../api-utils/error":2,"../../api-utils/showUserErrors":5,"../../api-utils/success":6,"../../utils/isSubset":19,"../../utils/logger":20,"../../utils/updateObject":21}],13:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = contains;

function contains(property, value) {
  var exact = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
  var sinError = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;

  if (!property || typeof property !== 'string') {
    this.userErrors.push('Propiedad no valida');
    return this;
  } else if (typeof value !== 'boolean' && typeof value !== 'string' && typeof value !== 'number') {
    this.userErrors.push('Valor a buscar no es valido');
  } else {
    this.containsProperty = property;
    this.containsValue = value;
    this.containsExact = exact;
    this.containsSinError = sinError;
    return this;
  }
}

module.exports = exports.default;

},{}],14:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = limit;

function limit(limitBy) {
  if (!limitBy) {
    this.userErrors.push("No integer specified in limit() method.");
  } else if (!Number.isInteger(limitBy)) {
    this.userErrors.push("Limit parameter in limit() method must be an integer (e.g. 3) and not a float, boolean, string or object.");
  } else {
    this.limitBy = limitBy;
  }

  return this;
}

module.exports = exports.default;

},{}],15:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = orderBy;

function orderBy(property, direction) {
  if (!property) {
    this.userErrors.push("No field name specified in orderBy() method. Use a string e.g. 'name'");
  } else if (typeof property !== 'string') {
    this.userErrors.push("First parameter in orderBy() method must be a string (a field name) e.g. 'name'");
  } else {
    this.orderByProperty = property;
  }

  if (direction) {
    if (direction !== 'asc' && direction !== 'desc') {
      this.userErrors.push("Second parameter in orderBy() method must be a string set to 'asc' or 'desc'.");
    } else {
      this.orderByDirection = direction;
    }
  }

  return this;
}

module.exports = exports.default;

},{}],16:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = collection;

var _localforage = _interopRequireDefault(require("localforage"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function collection(collectionName) {
  if (!collectionName) {
    this.userErrors.push('No collection name specified in collection() method.');
    return this;
  } else if (typeof collectionName !== 'string') {
    this.userErrors.push('Collection name in collection() method must be a string and not an object, number or boolean.');
    return this;
  } else {
    this.collectionName = collectionName;
    var dbName = this.dbName; // if we've not created a localForage instance 
    // for this collection, create one

    if (!(collectionName in this.lf)) {
      this.lf[collectionName] = _localforage["default"].createInstance({
        driver: _localforage["default"].INDEXEDDB,
        name: dbName,
        storeName: collectionName
      });
    }

    return this;
  }
}

module.exports = exports.default;

},{"localforage":27}],17:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = doc;

function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }

function doc(docSelectionCriteria) {
  if (!docSelectionCriteria) {
    this.userErrors.push('No document criteria specified in doc() method. Use a string (with a key) or an object (with criteria) e.g. { id: 1 }');
  } else if (typeof docSelectionCriteria !== 'string' && _typeof(docSelectionCriteria) !== 'object') {
    this.userErrors.push('Document criteria specified in doc() method must not be a number or boolean. Use a string (with a key) or an object (with criteria) e.g. { id: 1 }');
  } else {
    this.docSelectionCriteria = docSelectionCriteria;
  }

  return this;
}

module.exports = exports.default;

},{}],18:[function(require,module,exports){
"use strict"; // import api methods

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _collection = _interopRequireDefault(require("./api/selectors/collection"));

var _doc = _interopRequireDefault(require("./api/selectors/doc"));

var _orderBy = _interopRequireDefault(require("./api/filters/orderBy"));

var _limit = _interopRequireDefault(require("./api/filters/limit"));

var _contains = _interopRequireDefault(require("./api/filters/contains"));

var _get = _interopRequireDefault(require("./api/actions/get"));

var _add = _interopRequireDefault(require("./api/actions/add"));

var _update = _interopRequireDefault(require("./api/actions/update"));

var _set = _interopRequireDefault(require("./api/actions/set"));

var _delete = _interopRequireDefault(require("./api/actions/delete"));

var _search = _interopRequireDefault(require("./api/actions/search"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

// Localbase
var Localbase = /*#__PURE__*/_createClass(function Localbase(dbName) {
  _classCallCheck(this, Localbase);

  // properties
  this.dbName = dbName;
  this.lf = {}; // where we store our localForage instances

  this.collectionName = null;
  this.orderByProperty = null;
  this.orderByDirection = null;
  this.limitBy = null;
  this.docSelectionCriteria = null;
  this.containsProperty = null;
  this.containsValue = null;
  this.containsExact = false;
  this.containsSinError = false; // queues

  this.deleteCollectionQueue = {
    queue: [],
    running: false
  }; // config

  this.config = {
    debug: true
  }; // user errors - e.g. wrong type or no value passed to a method

  this.userErrors = []; // api - selectors

  this.collection = _collection["default"].bind(this);
  this.doc = _doc["default"].bind(this); // api - filters

  this.orderBy = _orderBy["default"].bind(this);
  this.limit = _limit["default"].bind(this);
  this.contains = _contains["default"].bind(this); // api - actions

  this.get = _get["default"].bind(this);
  this.add = _add["default"].bind(this);
  this.update = _update["default"].bind(this);
  this.set = _set["default"].bind(this);
  this["delete"] = _delete["default"].bind(this);
  this.search = _search["default"].bind(this);
});

exports["default"] = Localbase;
module.exports = exports.default;

},{"./api/actions/add":7,"./api/actions/delete":8,"./api/actions/get":9,"./api/actions/search":10,"./api/actions/set":11,"./api/actions/update":12,"./api/filters/contains":13,"./api/filters/limit":14,"./api/filters/orderBy":15,"./api/selectors/collection":16,"./api/selectors/doc":17}],19:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = isSubset;

function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }

function isSubset(superObj, subObj) {
  return Object.keys(subObj).every(function (ele) {
    if (_typeof(subObj[ele]) == 'object') {
      return isSubset(superObj[ele], subObj[ele]);
    }

    return subObj[ele] === superObj[ele];
  });
}

module.exports = exports.default;

},{}],20:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
var logger = {
  baseStyle: "\n    padding: 2px 5px;\n    background-color: #124F5C;\n    border-radius: 4px;\n    color: white; \n  ",
  colors: {
    log: '#124F5C',
    error: '#ed2939',
    warn: '#f39c12'
  },
  log: function log(message, secondary) {
    if ("development" == 'development' && this.config.debug) {
      var style = logger.baseStyle + "background-color: ".concat(logger.colors.log);

      if (secondary) {
        console.log('%clocalbase', style, message, secondary);
      } else {
        console.log('%clocalbase', style, message);
      }
    }
  },
  error: function error(message, secondary) {
    if ("development" == 'development' && this.config.debug) {
      var style = logger.baseStyle + "background-color: ".concat(logger.colors.error);
      console.error('%clocalbase', style, message);
    }
  },
  warn: function warn(message, secondary) {
    if ("development" == 'development' && this.config.debug) {
      var style = logger.baseStyle + "background-color: ".concat(logger.colors.warn);
      console.warn('%clocalbase', style, message);
    }
  }
};
var _default = logger;
exports["default"] = _default;
module.exports = exports.default;

},{}],21:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = updateObject;

function updateObject(obj
/*, …*/
) {
  for (var i = 1; i < arguments.length; i++) {
    for (var prop in arguments[i]) {
      var val = arguments[i][prop]; // if (typeof val == "object") // this also applies to arrays or null!
      //   updateObject(obj[prop], val);
      // else
      //    obj[prop] = val;

      obj[prop] = val;
    }
  }

  return obj;
}

module.exports = exports.default;

},{}],22:[function(require,module,exports){
/**
 * cuid.js
 * Collision-resistant UID generator for browsers and node.
 * Sequential for fast db lookups and recency sorting.
 * Safe for element IDs and server-side lookups.
 *
 * Extracted from CLCTR
 *
 * Copyright (c) Eric Elliott 2012
 * MIT License
 */

var fingerprint = require('./lib/fingerprint.js');
var pad = require('./lib/pad.js');
var getRandomValue = require('./lib/getRandomValue.js');

var c = 0,
  blockSize = 4,
  base = 36,
  discreteValues = Math.pow(base, blockSize);

function randomBlock () {
  return pad((getRandomValue() *
    discreteValues << 0)
    .toString(base), blockSize);
}

function safeCounter () {
  c = c < discreteValues ? c : 0;
  c++; // this is not subliminal
  return c - 1;
}

function cuid () {
  // Starting with a lowercase letter makes
  // it HTML element ID friendly.
  var letter = 'c', // hard-coded allows for sequential access

    // timestamp
    // warning: this exposes the exact date and time
    // that the uid was created.
    timestamp = (new Date().getTime()).toString(base),

    // Prevent same-machine collisions.
    counter = pad(safeCounter().toString(base), blockSize),

    // A few chars to generate distinct ids for different
    // clients (so different computers are far less
    // likely to generate the same id)
    print = fingerprint(),

    // Grab some more chars from Math.random()
    random = randomBlock() + randomBlock();

  return letter + timestamp + counter + print + random;
}

cuid.slug = function slug () {
  var date = new Date().getTime().toString(36),
    counter = safeCounter().toString(36).slice(-4),
    print = fingerprint().slice(0, 1) +
      fingerprint().slice(-1),
    random = randomBlock().slice(-2);

  return date.slice(-2) +
    counter + print + random;
};

cuid.isCuid = function isCuid (stringToCheck) {
  if (typeof stringToCheck !== 'string') return false;
  if (stringToCheck.startsWith('c')) return true;
  return false;
};

cuid.isSlug = function isSlug (stringToCheck) {
  if (typeof stringToCheck !== 'string') return false;
  var stringLength = stringToCheck.length;
  if (stringLength >= 7 && stringLength <= 10) return true;
  return false;
};

cuid.fingerprint = fingerprint;

module.exports = cuid;

},{"./lib/fingerprint.js":23,"./lib/getRandomValue.js":24,"./lib/pad.js":25}],23:[function(require,module,exports){
var pad = require('./pad.js');

var env = typeof window === 'object' ? window : self;
var globalCount = Object.keys(env).length;
var mimeTypesLength = navigator.mimeTypes ? navigator.mimeTypes.length : 0;
var clientId = pad((mimeTypesLength +
  navigator.userAgent.length).toString(36) +
  globalCount.toString(36), 4);

module.exports = function fingerprint () {
  return clientId;
};

},{"./pad.js":25}],24:[function(require,module,exports){

var getRandomValue;

var crypto = typeof window !== 'undefined' &&
  (window.crypto || window.msCrypto) ||
  typeof self !== 'undefined' &&
  self.crypto;

if (crypto) {
    var lim = Math.pow(2, 32) - 1;
    getRandomValue = function () {
        return Math.abs(crypto.getRandomValues(new Uint32Array(1))[0] / lim);
    };
} else {
    getRandomValue = Math.random;
}

module.exports = getRandomValue;

},{}],25:[function(require,module,exports){
module.exports = function pad (num, size) {
  var s = '000000000' + num;
  return s.substr(s.length - size);
};

},{}],26:[function(require,module,exports){
// https://github.com/farzher/fuzzysort v2.0.0
/*
  SublimeText-like Fuzzy Search

  fuzzysort.single('fs', 'Fuzzy Search') // {score: -16}
  fuzzysort.single('test', 'test') // {score: 0}
  fuzzysort.single('doesnt exist', 'target') // null

  fuzzysort.go('mr', [{file:'Monitor.cpp'}, {file:'MeshRenderer.cpp'}], {key:'file'})
  // [{score:-18, obj:{file:'MeshRenderer.cpp'}}, {score:-6009, obj:{file:'Monitor.cpp'}}]

  fuzzysort.go('mr', ['Monitor.cpp', 'MeshRenderer.cpp'])
  // [{score: -18, target: "MeshRenderer.cpp"}, {score: -6009, target: "Monitor.cpp"}]

  fuzzysort.highlight(fuzzysort.single('fs', 'Fuzzy Search'), '<b>', '</b>')
  // <b>F</b>uzzy <b>S</b>earch
*/

// UMD (Universal Module Definition) for fuzzysort
;((root, UMD) => {
  if(typeof define === 'function' && define.amd) define([], UMD)
  else if(typeof module === 'object' && module.exports) module.exports = UMD()
  else root['fuzzysort'] = UMD()
})(this, _ => {


  var single = (search, target) => {                                                                                                                                                                                                                        if(search=='farzher')return{target:"farzher was here (^-^*)/",score:0,_indexes:[0]}
    if(!search || !target) return NULL

    var preparedSearch = getPreparedSearch(search)
    if(!isObj(target)) target = getPrepared(target)

    var searchBitflags = preparedSearch.bitflags
    if((searchBitflags & target._bitflags) !== searchBitflags) return NULL

    return algorithm(preparedSearch, target)
  }


  var go = (search, targets, options) => {                                                                                                                                                                                                                  if(search=='farzher')return[{target:"farzher was here (^-^*)/",score:0,_indexes:[0],obj:targets?targets[0]:NULL}]
    if(!search) return options&&options.all ? all(search, targets, options) : noResults

    var preparedSearch = getPreparedSearch(search)
    var searchBitflags = preparedSearch.bitflags
    var containsSpace  = preparedSearch.containsSpace

    var threshold = options&&options.threshold || INT_MIN
    var limit     = options&&options['limit']  || INT_MAX // for some reason only limit breaks when minified

    var resultsLen = 0; var limitedCount = 0
    var targetsLen = targets.length

    // This code is copy/pasted 3 times for performance reasons [options.keys, options.key, no keys]

    // options.key
    if(options && options.key) {
      var key = options.key
      for(var i = 0; i < targetsLen; ++i) { var obj = targets[i]
        var target = getValue(obj, key)
        if(!target) continue
        if(!isObj(target)) target = getPrepared(target)

        if((searchBitflags & target._bitflags) !== searchBitflags) continue
        var result = algorithm(preparedSearch, target)
        if(result === NULL) continue
        if(result.score < threshold) continue

        // have to clone result so duplicate targets from different obj can each reference the correct obj
        result = {target:result.target, _targetLower:'', _targetLowerCodes:NULL, _nextBeginningIndexes:NULL, _bitflags:0, score:result.score, _indexes:result._indexes, obj:obj} // hidden

        if(resultsLen < limit) { q.add(result); ++resultsLen }
        else {
          ++limitedCount
          if(result.score > q.peek().score) q.replaceTop(result)
        }
      }

    // options.keys
    } else if(options && options.keys) {
      var scoreFn = options['scoreFn'] || defaultScoreFn
      var keys = options.keys
      var keysLen = keys.length
      for(var i = 0; i < targetsLen; ++i) { var obj = targets[i]
        var objResults = new Array(keysLen)
        for (var keyI = 0; keyI < keysLen; ++keyI) {
          var key = keys[keyI]
          var target = getValue(obj, key)
          if(!target) { objResults[keyI] = NULL; continue }
          if(!isObj(target)) target = getPrepared(target)

          if((searchBitflags & target._bitflags) !== searchBitflags) objResults[keyI] = NULL
          else objResults[keyI] = algorithm(preparedSearch, target)
        }
        objResults.obj = obj // before scoreFn so scoreFn can use it
        var score = scoreFn(objResults)
        if(score === NULL) continue
        if(score < threshold) continue
        objResults.score = score
        if(resultsLen < limit) { q.add(objResults); ++resultsLen }
        else {
          ++limitedCount
          if(score > q.peek().score) q.replaceTop(objResults)
        }
      }

    // no keys
    } else {
      for(var i = 0; i < targetsLen; ++i) { var target = targets[i]
        if(!target) continue
        if(!isObj(target)) target = getPrepared(target)

        if((searchBitflags & target._bitflags) !== searchBitflags) continue
        var result = algorithm(preparedSearch, target)
        if(result === NULL) continue
        if(result.score < threshold) continue
        if(resultsLen < limit) { q.add(result); ++resultsLen }
        else {
          ++limitedCount
          if(result.score > q.peek().score) q.replaceTop(result)
        }
      }
    }

    if(resultsLen === 0) return noResults
    var results = new Array(resultsLen)
    for(var i = resultsLen - 1; i >= 0; --i) results[i] = q.poll()
    results.total = resultsLen + limitedCount
    return results
  }


  var highlight = (result, hOpen, hClose) => {
    if(typeof hOpen === 'function') return highlightCallback(result, hOpen)
    if(result === NULL) return NULL
    if(hOpen === undefined) hOpen = '<b>'
    if(hClose === undefined) hClose = '</b>'
    var highlighted = ''
    var matchesIndex = 0
    var opened = false
    var target = result.target
    var targetLen = target.length
    var indexes = result._indexes
    indexes = indexes.slice(0, indexes.len).sort((a,b)=>a-b)
    for(var i = 0; i < targetLen; ++i) { var char = target[i]
      if(indexes[matchesIndex] === i) {
        ++matchesIndex
        if(!opened) { opened = true
          highlighted += hOpen
        }

        if(matchesIndex === indexes.length) {
          highlighted += char + hClose + target.substr(i+1)
          break
        }
      } else {
        if(opened) { opened = false
          highlighted += hClose
        }
      }
      highlighted += char
    }

    return highlighted
  }
  var highlightCallback = (result, cb) => {
    if(result === NULL) return NULL
    var target = result.target
    var targetLen = target.length
    var indexes = result._indexes
    indexes = indexes.slice(0, indexes.len).sort((a,b)=>a-b)
    var highlighted = ''
    var matchI = 0
    var indexesI = 0
    var opened = false
    var result = []
    for(var i = 0; i < targetLen; ++i) { var char = target[i]
      if(indexes[indexesI] === i) {
        ++indexesI
        if(!opened) { opened = true
          result.push(highlighted); highlighted = ''
        }

        if(indexesI === indexes.length) {
          highlighted += char
          result.push(cb(highlighted, matchI++)); highlighted = ''
          result.push(target.substr(i+1))
          break
        }
      } else {
        if(opened) { opened = false
          result.push(cb(highlighted, matchI++)); highlighted = ''
        }
      }
      highlighted += char
    }
    return result
  }


  var indexes = result => result._indexes.slice(0, result._indexes.len).sort((a,b)=>a-b)


  var prepare = (target) => {
    if(typeof target !== 'string') target = ''
    var info = prepareLowerInfo(target)
    return {'target':target, _targetLower:info._lower, _targetLowerCodes:info.lowerCodes, _nextBeginningIndexes:NULL, _bitflags:info.bitflags, 'score':NULL, _indexes:[0], 'obj':NULL} // hidden
  }


  // Below this point is only internal code
  // Below this point is only internal code
  // Below this point is only internal code
  // Below this point is only internal code


  var prepareSearch = (search) => {
    if(typeof search !== 'string') search = ''
    search = search.trim()
    var info = prepareLowerInfo(search)

    var spaceSearches = []
    if(info.containsSpace) {
      var searches = search.split(/\s+/)
      searches = [...new Set(searches)] // distinct
      for(var i=0; i<searches.length; i++) {
        if(searches[i] === '') continue
        var _info = prepareLowerInfo(searches[i])
        spaceSearches.push({lowerCodes:_info.lowerCodes, _lower:searches[i].toLowerCase(), containsSpace:false})
      }
    }

    return {lowerCodes: info.lowerCodes, bitflags: info.bitflags, containsSpace: info.containsSpace, _lower: info._lower, spaceSearches: spaceSearches}
  }



  var getPrepared = (target) => {
    if(target.length > 999) return prepare(target) // don't cache huge targets
    var targetPrepared = preparedCache.get(target)
    if(targetPrepared !== undefined) return targetPrepared
    targetPrepared = prepare(target)
    preparedCache.set(target, targetPrepared)
    return targetPrepared
  }
  var getPreparedSearch = (search) => {
    if(search.length > 999) return prepareSearch(search) // don't cache huge searches
    var searchPrepared = preparedSearchCache.get(search)
    if(searchPrepared !== undefined) return searchPrepared
    searchPrepared = prepareSearch(search)
    preparedSearchCache.set(search, searchPrepared)
    return searchPrepared
  }


  var all = (search, targets, options) => {
    var results = []; results.total = targets.length

    var limit = options && options.limit || INT_MAX

    if(options && options.key) {
      for(var i=0;i<targets.length;i++) { var obj = targets[i]
        var target = getValue(obj, options.key)
        if(!target) continue
        if(!isObj(target)) target = getPrepared(target)
        target.score = INT_MIN
        target._indexes.len = 0
        var result = target
        result = {target:result.target, _targetLower:'', _targetLowerCodes:NULL, _nextBeginningIndexes:NULL, _bitflags:0, score:target.score, _indexes:NULL, obj:obj} // hidden
        results.push(result); if(results.length >= limit) return results
      }
    } else if(options && options.keys) {
      for(var i=0;i<targets.length;i++) { var obj = targets[i]
        var objResults = new Array(options.keys.length)
        for (var keyI = options.keys.length - 1; keyI >= 0; --keyI) {
          var target = getValue(obj, options.keys[keyI])
          if(!target) { objResults[keyI] = NULL; continue }
          if(!isObj(target)) target = getPrepared(target)
          target.score = INT_MIN
          target._indexes.len = 0
          objResults[keyI] = target
        }
        objResults.obj = obj
        objResults.score = INT_MIN
        results.push(objResults); if(results.length >= limit) return results
      }
    } else {
      for(var i=0;i<targets.length;i++) { var target = targets[i]
        if(!target) continue
        if(!isObj(target)) target = getPrepared(target)
        target.score = INT_MIN
        target._indexes.len = 0
        results.push(target); if(results.length >= limit) return results
      }
    }

    return results
  }


  var algorithm = (preparedSearch, prepared) => {
    if(preparedSearch.containsSpace) return algorithmSpaces(preparedSearch, prepared)

    var searchLower = preparedSearch._lower
    var searchLowerCodes = preparedSearch.lowerCodes
    var searchLowerCode = searchLowerCodes[0]
    var targetLowerCodes = prepared._targetLowerCodes
    var searchLen = searchLowerCodes.length
    var targetLen = targetLowerCodes.length
    var searchI = 0 // where we at
    var targetI = 0 // where you at
    var matchesSimpleLen = 0

    // very basic fuzzy match; to remove non-matching targets ASAP!
    // walk through target. find sequential matches.
    // if all chars aren't found then exit
    for(;;) {
      var isMatch = searchLowerCode === targetLowerCodes[targetI]
      if(isMatch) {
        matchesSimple[matchesSimpleLen++] = targetI
        ++searchI; if(searchI === searchLen) break
        searchLowerCode = searchLowerCodes[searchI]
      }
      ++targetI; if(targetI >= targetLen) return NULL // Failed to find searchI
    }

    var searchI = 0
    var successStrict = false
    var matchesStrictLen = 0

    var nextBeginningIndexes = prepared._nextBeginningIndexes
    if(nextBeginningIndexes === NULL) nextBeginningIndexes = prepared._nextBeginningIndexes = prepareNextBeginningIndexes(prepared.target)
    var firstPossibleI = targetI = matchesSimple[0]===0 ? 0 : nextBeginningIndexes[matchesSimple[0]-1]

    // Our target string successfully matched all characters in sequence!
    // Let's try a more advanced and strict test to improve the score
    // only count it as a match if it's consecutive or a beginning character!
    var backtrackCount = 0
    if(targetI !== targetLen) for(;;) {
      if(targetI >= targetLen) {
        // We failed to find a good spot for this search char, go back to the previous search char and force it forward
        if(searchI <= 0) break // We failed to push chars forward for a better match

        ++backtrackCount; if(backtrackCount > 200) break // exponential backtracking is taking too long, just give up and return a bad match

        --searchI
        var lastMatch = matchesStrict[--matchesStrictLen]
        targetI = nextBeginningIndexes[lastMatch]

      } else {
        var isMatch = searchLowerCodes[searchI] === targetLowerCodes[targetI]
        if(isMatch) {
          matchesStrict[matchesStrictLen++] = targetI
          ++searchI; if(searchI === searchLen) { successStrict = true; break }
          ++targetI
        } else {
          targetI = nextBeginningIndexes[targetI]
        }
      }
    }

    // check if it's a substring match
    var substringIndex = prepared._targetLower.indexOf(searchLower, matchesSimple[0]) // perf: this is slow
    var isSubstring = ~substringIndex
    if(isSubstring && !successStrict) { // rewrite the indexes from basic to the substring
      for(var i=0; i<matchesSimpleLen; ++i) matchesSimple[i] = substringIndex+i
    }
    var isSubstringBeginning = false
    if(isSubstring) {
      isSubstringBeginning = prepared._nextBeginningIndexes[substringIndex-1] === substringIndex
    }

    { // tally up the score & keep track of matches for highlighting later
      if(successStrict) { var matchesBest = matchesStrict; var matchesBestLen = matchesStrictLen }
      else { var matchesBest = matchesSimple; var matchesBestLen = matchesSimpleLen }

      var score = 0

      var extraMatchGroupCount = 0
      for(var i = 1; i < searchLen; ++i) {
        if(matchesBest[i] - matchesBest[i-1] !== 1) {score -= matchesBest[i]; ++extraMatchGroupCount}
      }
      var unmatchedDistance = matchesBest[searchLen-1] - matchesBest[0] - (searchLen-1)

      score -= (12+unmatchedDistance) * extraMatchGroupCount // penality for more groups

      if(matchesBest[0] !== 0) score -= matchesBest[0]*10 // penality for not starting near the beginning

      if(!successStrict) {
        score *= 1000
      } else {
        // successStrict on a target with too many beginning indexes loses points for being a bad target
        var uniqueBeginningIndexes = 1
        for(var i = nextBeginningIndexes[0]; i < targetLen; i=nextBeginningIndexes[i]) ++uniqueBeginningIndexes

        if(uniqueBeginningIndexes > 24) score *= (uniqueBeginningIndexes-24)*10 // quite arbitrary numbers here ...
      }

      if(isSubstring)          score /= 10 // bonus for being a full substring
      if(isSubstringBeginning) score /= 10 // bonus for substring starting on a beginningIndex

      score -= targetLen - searchLen // penality for longer targets
      prepared.score = score

      for(var i = 0; i < matchesBestLen; ++i) prepared._indexes[i] = matchesBest[i]
      prepared._indexes.len = matchesBestLen

      return prepared
    }
  }
  var algorithmSpaces = (preparedSearch, target) => {
    var seen_indexes = new Set()
    var score = 0
    var result = NULL

    var first_seen_index_last_search = 0
    var searches = preparedSearch.spaceSearches
    for(var i=0; i<searches.length; ++i) {
      var search = searches[i]

      result = algorithm(search, target)
      if(result === NULL) return NULL

      score += result.score

      // dock points based on order otherwise "c man" returns Manifest.cpp instead of CheatManager.h
      if(result._indexes[0] < first_seen_index_last_search) {
        score -= first_seen_index_last_search - result._indexes[0]
      }
      first_seen_index_last_search = result._indexes[0]

      for(var j=0; j<result._indexes.len; ++j) seen_indexes.add(result._indexes[j])
    }

    result.score = score

    var i = 0
    for (let index of seen_indexes) result._indexes[i++] = index
    result._indexes.len = i

    return result
  }


  var prepareLowerInfo = (str) => {
    var strLen = str.length
    var lower = str.toLowerCase()
    var lowerCodes = [] // new Array(strLen)    sparse array is too slow
    var bitflags = 0
    var containsSpace = false // space isn't stored in bitflags because of how searching with a space works

    for(var i = 0; i < strLen; ++i) {
      var lowerCode = lowerCodes[i] = lower.charCodeAt(i)

      if(lowerCode === 32) {
        containsSpace = true
        continue // it's important that we don't set any bitflags for space
      }

      var bit = lowerCode>=97&&lowerCode<=122 ? lowerCode-97 // alphabet
              : lowerCode>=48&&lowerCode<=57  ? 26           // numbers
                                                             // 3 bits available
              : lowerCode<=127                ? 30           // other ascii
              :                                 31           // other utf8
      bitflags |= 1<<bit
    }

    return {lowerCodes:lowerCodes, bitflags:bitflags, containsSpace:containsSpace, _lower:lower}
  }
  var prepareBeginningIndexes = (target) => {
    var targetLen = target.length
    var beginningIndexes = []; var beginningIndexesLen = 0
    var wasUpper = false
    var wasAlphanum = false
    for(var i = 0; i < targetLen; ++i) {
      var targetCode = target.charCodeAt(i)
      var isUpper = targetCode>=65&&targetCode<=90
      var isAlphanum = isUpper || targetCode>=97&&targetCode<=122 || targetCode>=48&&targetCode<=57
      var isBeginning = isUpper && !wasUpper || !wasAlphanum || !isAlphanum
      wasUpper = isUpper
      wasAlphanum = isAlphanum
      if(isBeginning) beginningIndexes[beginningIndexesLen++] = i
    }
    return beginningIndexes
  }
  var prepareNextBeginningIndexes = (target) => {
    var targetLen = target.length
    var beginningIndexes = prepareBeginningIndexes(target)
    var nextBeginningIndexes = [] // new Array(targetLen)     sparse array is too slow
    var lastIsBeginning = beginningIndexes[0]
    var lastIsBeginningI = 0
    for(var i = 0; i < targetLen; ++i) {
      if(lastIsBeginning > i) {
        nextBeginningIndexes[i] = lastIsBeginning
      } else {
        lastIsBeginning = beginningIndexes[++lastIsBeginningI]
        nextBeginningIndexes[i] = lastIsBeginning===undefined ? targetLen : lastIsBeginning
      }
    }
    return nextBeginningIndexes
  }


  var cleanup = () => { preparedCache.clear(); preparedSearchCache.clear(); matchesSimple = []; matchesStrict = [] }

  var preparedCache       = new Map()
  var preparedSearchCache = new Map()
  var matchesSimple = []; var matchesStrict = []


  // for use with keys. just returns the maximum score
  var defaultScoreFn = (a) => {
    var max = INT_MIN
    var len = a.length
    for (var i = 0; i < len; ++i) {
      var result = a[i]; if(result === NULL) continue
      var score = result.score
      if(score > max) max = score
    }
    if(max === INT_MIN) return NULL
    return max
  }

  // prop = 'key'              2.5ms optimized for this case, seems to be about as fast as direct obj[prop]
  // prop = 'key1.key2'        10ms
  // prop = ['key1', 'key2']   27ms
  var getValue = (obj, prop) => {
    var tmp = obj[prop]; if(tmp !== undefined) return tmp
    var segs = prop
    if(!Array.isArray(prop)) segs = prop.split('.')
    var len = segs.length
    var i = -1
    while (obj && (++i < len)) obj = obj[segs[i]]
    return obj
  }

  var isObj = (x) => { return typeof x === 'object' } // faster as a function
  // var INT_MAX = 9007199254740991; var INT_MIN = -INT_MAX
  var INT_MAX = Infinity; var INT_MIN = -INT_MAX
  var noResults = []; noResults.total = 0
  var NULL = null


  // Hacked version of https://github.com/lemire/FastPriorityQueue.js
  var fastpriorityqueue=r=>{var e=[],o=0,a={},v=r=>{for(var a=0,v=e[a],c=1;c<o;){var s=c+1;a=c,s<o&&e[s].score<e[c].score&&(a=s),e[a-1>>1]=e[a],c=1+(a<<1)}for(var f=a-1>>1;a>0&&v.score<e[f].score;f=(a=f)-1>>1)e[a]=e[f];e[a]=v};return a.add=(r=>{var a=o;e[o++]=r;for(var v=a-1>>1;a>0&&r.score<e[v].score;v=(a=v)-1>>1)e[a]=e[v];e[a]=r}),a.poll=(r=>{if(0!==o){var a=e[0];return e[0]=e[--o],v(),a}}),a.peek=(r=>{if(0!==o)return e[0]}),a.replaceTop=(r=>{e[0]=r,v()}),a}
  var q = fastpriorityqueue() // reuse this


  // fuzzysort is written this way for minification. all names are mangeled unless quoted
  return {'single':single, 'go':go, 'highlight':highlight, 'prepare':prepare, 'indexes':indexes, 'cleanup':cleanup}
}) // UMD

// TODO: (feature) frecency
// TODO: (perf) use different sorting algo depending on the # of results?
// TODO: (perf) preparedCache is a memory leak
// TODO: (like sublime) backslash === forwardslash
// TODO: (perf) prepareSearch seems slow

},{}],27:[function(require,module,exports){
(function (global){(function (){
/*!
    localForage -- Offline Storage, Improved
    Version 1.10.0
    https://localforage.github.io/localForage
    (c) 2013-2017 Mozilla, Apache License 2.0
*/
(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.localforage = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw (f.code="MODULE_NOT_FOUND", f)}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(_dereq_,module,exports){
(function (global){
'use strict';
var Mutation = global.MutationObserver || global.WebKitMutationObserver;

var scheduleDrain;

{
  if (Mutation) {
    var called = 0;
    var observer = new Mutation(nextTick);
    var element = global.document.createTextNode('');
    observer.observe(element, {
      characterData: true
    });
    scheduleDrain = function () {
      element.data = (called = ++called % 2);
    };
  } else if (!global.setImmediate && typeof global.MessageChannel !== 'undefined') {
    var channel = new global.MessageChannel();
    channel.port1.onmessage = nextTick;
    scheduleDrain = function () {
      channel.port2.postMessage(0);
    };
  } else if ('document' in global && 'onreadystatechange' in global.document.createElement('script')) {
    scheduleDrain = function () {

      // Create a <script> element; its readystatechange event will be fired asynchronously once it is inserted
      // into the document. Do so, thus queuing up the task. Remember to clean up once it's been called.
      var scriptEl = global.document.createElement('script');
      scriptEl.onreadystatechange = function () {
        nextTick();

        scriptEl.onreadystatechange = null;
        scriptEl.parentNode.removeChild(scriptEl);
        scriptEl = null;
      };
      global.document.documentElement.appendChild(scriptEl);
    };
  } else {
    scheduleDrain = function () {
      setTimeout(nextTick, 0);
    };
  }
}

var draining;
var queue = [];
//named nextTick for less confusing stack traces
function nextTick() {
  draining = true;
  var i, oldQueue;
  var len = queue.length;
  while (len) {
    oldQueue = queue;
    queue = [];
    i = -1;
    while (++i < len) {
      oldQueue[i]();
    }
    len = queue.length;
  }
  draining = false;
}

module.exports = immediate;
function immediate(task) {
  if (queue.push(task) === 1 && !draining) {
    scheduleDrain();
  }
}

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],2:[function(_dereq_,module,exports){
'use strict';
var immediate = _dereq_(1);

/* istanbul ignore next */
function INTERNAL() {}

var handlers = {};

var REJECTED = ['REJECTED'];
var FULFILLED = ['FULFILLED'];
var PENDING = ['PENDING'];

module.exports = Promise;

function Promise(resolver) {
  if (typeof resolver !== 'function') {
    throw new TypeError('resolver must be a function');
  }
  this.state = PENDING;
  this.queue = [];
  this.outcome = void 0;
  if (resolver !== INTERNAL) {
    safelyResolveThenable(this, resolver);
  }
}

Promise.prototype["catch"] = function (onRejected) {
  return this.then(null, onRejected);
};
Promise.prototype.then = function (onFulfilled, onRejected) {
  if (typeof onFulfilled !== 'function' && this.state === FULFILLED ||
    typeof onRejected !== 'function' && this.state === REJECTED) {
    return this;
  }
  var promise = new this.constructor(INTERNAL);
  if (this.state !== PENDING) {
    var resolver = this.state === FULFILLED ? onFulfilled : onRejected;
    unwrap(promise, resolver, this.outcome);
  } else {
    this.queue.push(new QueueItem(promise, onFulfilled, onRejected));
  }

  return promise;
};
function QueueItem(promise, onFulfilled, onRejected) {
  this.promise = promise;
  if (typeof onFulfilled === 'function') {
    this.onFulfilled = onFulfilled;
    this.callFulfilled = this.otherCallFulfilled;
  }
  if (typeof onRejected === 'function') {
    this.onRejected = onRejected;
    this.callRejected = this.otherCallRejected;
  }
}
QueueItem.prototype.callFulfilled = function (value) {
  handlers.resolve(this.promise, value);
};
QueueItem.prototype.otherCallFulfilled = function (value) {
  unwrap(this.promise, this.onFulfilled, value);
};
QueueItem.prototype.callRejected = function (value) {
  handlers.reject(this.promise, value);
};
QueueItem.prototype.otherCallRejected = function (value) {
  unwrap(this.promise, this.onRejected, value);
};

function unwrap(promise, func, value) {
  immediate(function () {
    var returnValue;
    try {
      returnValue = func(value);
    } catch (e) {
      return handlers.reject(promise, e);
    }
    if (returnValue === promise) {
      handlers.reject(promise, new TypeError('Cannot resolve promise with itself'));
    } else {
      handlers.resolve(promise, returnValue);
    }
  });
}

handlers.resolve = function (self, value) {
  var result = tryCatch(getThen, value);
  if (result.status === 'error') {
    return handlers.reject(self, result.value);
  }
  var thenable = result.value;

  if (thenable) {
    safelyResolveThenable(self, thenable);
  } else {
    self.state = FULFILLED;
    self.outcome = value;
    var i = -1;
    var len = self.queue.length;
    while (++i < len) {
      self.queue[i].callFulfilled(value);
    }
  }
  return self;
};
handlers.reject = function (self, error) {
  self.state = REJECTED;
  self.outcome = error;
  var i = -1;
  var len = self.queue.length;
  while (++i < len) {
    self.queue[i].callRejected(error);
  }
  return self;
};

function getThen(obj) {
  // Make sure we only access the accessor once as required by the spec
  var then = obj && obj.then;
  if (obj && (typeof obj === 'object' || typeof obj === 'function') && typeof then === 'function') {
    return function appyThen() {
      then.apply(obj, arguments);
    };
  }
}

function safelyResolveThenable(self, thenable) {
  // Either fulfill, reject or reject with error
  var called = false;
  function onError(value) {
    if (called) {
      return;
    }
    called = true;
    handlers.reject(self, value);
  }

  function onSuccess(value) {
    if (called) {
      return;
    }
    called = true;
    handlers.resolve(self, value);
  }

  function tryToUnwrap() {
    thenable(onSuccess, onError);
  }

  var result = tryCatch(tryToUnwrap);
  if (result.status === 'error') {
    onError(result.value);
  }
}

function tryCatch(func, value) {
  var out = {};
  try {
    out.value = func(value);
    out.status = 'success';
  } catch (e) {
    out.status = 'error';
    out.value = e;
  }
  return out;
}

Promise.resolve = resolve;
function resolve(value) {
  if (value instanceof this) {
    return value;
  }
  return handlers.resolve(new this(INTERNAL), value);
}

Promise.reject = reject;
function reject(reason) {
  var promise = new this(INTERNAL);
  return handlers.reject(promise, reason);
}

Promise.all = all;
function all(iterable) {
  var self = this;
  if (Object.prototype.toString.call(iterable) !== '[object Array]') {
    return this.reject(new TypeError('must be an array'));
  }

  var len = iterable.length;
  var called = false;
  if (!len) {
    return this.resolve([]);
  }

  var values = new Array(len);
  var resolved = 0;
  var i = -1;
  var promise = new this(INTERNAL);

  while (++i < len) {
    allResolver(iterable[i], i);
  }
  return promise;
  function allResolver(value, i) {
    self.resolve(value).then(resolveFromAll, function (error) {
      if (!called) {
        called = true;
        handlers.reject(promise, error);
      }
    });
    function resolveFromAll(outValue) {
      values[i] = outValue;
      if (++resolved === len && !called) {
        called = true;
        handlers.resolve(promise, values);
      }
    }
  }
}

Promise.race = race;
function race(iterable) {
  var self = this;
  if (Object.prototype.toString.call(iterable) !== '[object Array]') {
    return this.reject(new TypeError('must be an array'));
  }

  var len = iterable.length;
  var called = false;
  if (!len) {
    return this.resolve([]);
  }

  var i = -1;
  var promise = new this(INTERNAL);

  while (++i < len) {
    resolver(iterable[i]);
  }
  return promise;
  function resolver(value) {
    self.resolve(value).then(function (response) {
      if (!called) {
        called = true;
        handlers.resolve(promise, response);
      }
    }, function (error) {
      if (!called) {
        called = true;
        handlers.reject(promise, error);
      }
    });
  }
}

},{"1":1}],3:[function(_dereq_,module,exports){
(function (global){
'use strict';
if (typeof global.Promise !== 'function') {
  global.Promise = _dereq_(2);
}

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"2":2}],4:[function(_dereq_,module,exports){
'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function getIDB() {
    /* global indexedDB,webkitIndexedDB,mozIndexedDB,OIndexedDB,msIndexedDB */
    try {
        if (typeof indexedDB !== 'undefined') {
            return indexedDB;
        }
        if (typeof webkitIndexedDB !== 'undefined') {
            return webkitIndexedDB;
        }
        if (typeof mozIndexedDB !== 'undefined') {
            return mozIndexedDB;
        }
        if (typeof OIndexedDB !== 'undefined') {
            return OIndexedDB;
        }
        if (typeof msIndexedDB !== 'undefined') {
            return msIndexedDB;
        }
    } catch (e) {
        return;
    }
}

var idb = getIDB();

function isIndexedDBValid() {
    try {
        // Initialize IndexedDB; fall back to vendor-prefixed versions
        // if needed.
        if (!idb || !idb.open) {
            return false;
        }
        // We mimic PouchDB here;
        //
        // We test for openDatabase because IE Mobile identifies itself
        // as Safari. Oh the lulz...
        var isSafari = typeof openDatabase !== 'undefined' && /(Safari|iPhone|iPad|iPod)/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent) && !/BlackBerry/.test(navigator.platform);

        var hasFetch = typeof fetch === 'function' && fetch.toString().indexOf('[native code') !== -1;

        // Safari <10.1 does not meet our requirements for IDB support
        // (see: https://github.com/pouchdb/pouchdb/issues/5572).
        // Safari 10.1 shipped with fetch, we can use that to detect it.
        // Note: this creates issues with `window.fetch` polyfills and
        // overrides; see:
        // https://github.com/localForage/localForage/issues/856
        return (!isSafari || hasFetch) && typeof indexedDB !== 'undefined' &&
        // some outdated implementations of IDB that appear on Samsung
        // and HTC Android devices <4.4 are missing IDBKeyRange
        // See: https://github.com/mozilla/localForage/issues/128
        // See: https://github.com/mozilla/localForage/issues/272
        typeof IDBKeyRange !== 'undefined';
    } catch (e) {
        return false;
    }
}

// Abstracts constructing a Blob object, so it also works in older
// browsers that don't support the native Blob constructor. (i.e.
// old QtWebKit versions, at least).
// Abstracts constructing a Blob object, so it also works in older
// browsers that don't support the native Blob constructor. (i.e.
// old QtWebKit versions, at least).
function createBlob(parts, properties) {
    /* global BlobBuilder,MSBlobBuilder,MozBlobBuilder,WebKitBlobBuilder */
    parts = parts || [];
    properties = properties || {};
    try {
        return new Blob(parts, properties);
    } catch (e) {
        if (e.name !== 'TypeError') {
            throw e;
        }
        var Builder = typeof BlobBuilder !== 'undefined' ? BlobBuilder : typeof MSBlobBuilder !== 'undefined' ? MSBlobBuilder : typeof MozBlobBuilder !== 'undefined' ? MozBlobBuilder : WebKitBlobBuilder;
        var builder = new Builder();
        for (var i = 0; i < parts.length; i += 1) {
            builder.append(parts[i]);
        }
        return builder.getBlob(properties.type);
    }
}

// This is CommonJS because lie is an external dependency, so Rollup
// can just ignore it.
if (typeof Promise === 'undefined') {
    // In the "nopromises" build this will just throw if you don't have
    // a global promise object, but it would throw anyway later.
    _dereq_(3);
}
var Promise$1 = Promise;

function executeCallback(promise, callback) {
    if (callback) {
        promise.then(function (result) {
            callback(null, result);
        }, function (error) {
            callback(error);
        });
    }
}

function executeTwoCallbacks(promise, callback, errorCallback) {
    if (typeof callback === 'function') {
        promise.then(callback);
    }

    if (typeof errorCallback === 'function') {
        promise["catch"](errorCallback);
    }
}

function normalizeKey(key) {
    // Cast the key to a string, as that's all we can set as a key.
    if (typeof key !== 'string') {
        console.warn(key + ' used as a key, but it is not a string.');
        key = String(key);
    }

    return key;
}

function getCallback() {
    if (arguments.length && typeof arguments[arguments.length - 1] === 'function') {
        return arguments[arguments.length - 1];
    }
}

// Some code originally from async_storage.js in
// [Gaia](https://github.com/mozilla-b2g/gaia).

var DETECT_BLOB_SUPPORT_STORE = 'local-forage-detect-blob-support';
var supportsBlobs = void 0;
var dbContexts = {};
var toString = Object.prototype.toString;

// Transaction Modes
var READ_ONLY = 'readonly';
var READ_WRITE = 'readwrite';

// Transform a binary string to an array buffer, because otherwise
// weird stuff happens when you try to work with the binary string directly.
// It is known.
// From http://stackoverflow.com/questions/14967647/ (continues on next line)
// encode-decode-image-with-base64-breaks-image (2013-04-21)
function _binStringToArrayBuffer(bin) {
    var length = bin.length;
    var buf = new ArrayBuffer(length);
    var arr = new Uint8Array(buf);
    for (var i = 0; i < length; i++) {
        arr[i] = bin.charCodeAt(i);
    }
    return buf;
}

//
// Blobs are not supported in all versions of IndexedDB, notably
// Chrome <37 and Android <5. In those versions, storing a blob will throw.
//
// Various other blob bugs exist in Chrome v37-42 (inclusive).
// Detecting them is expensive and confusing to users, and Chrome 37-42
// is at very low usage worldwide, so we do a hacky userAgent check instead.
//
// content-type bug: https://code.google.com/p/chromium/issues/detail?id=408120
// 404 bug: https://code.google.com/p/chromium/issues/detail?id=447916
// FileReader bug: https://code.google.com/p/chromium/issues/detail?id=447836
//
// Code borrowed from PouchDB. See:
// https://github.com/pouchdb/pouchdb/blob/master/packages/node_modules/pouchdb-adapter-idb/src/blobSupport.js
//
function _checkBlobSupportWithoutCaching(idb) {
    return new Promise$1(function (resolve) {
        var txn = idb.transaction(DETECT_BLOB_SUPPORT_STORE, READ_WRITE);
        var blob = createBlob(['']);
        txn.objectStore(DETECT_BLOB_SUPPORT_STORE).put(blob, 'key');

        txn.onabort = function (e) {
            // If the transaction aborts now its due to not being able to
            // write to the database, likely due to the disk being full
            e.preventDefault();
            e.stopPropagation();
            resolve(false);
        };

        txn.oncomplete = function () {
            var matchedChrome = navigator.userAgent.match(/Chrome\/(\d+)/);
            var matchedEdge = navigator.userAgent.match(/Edge\//);
            // MS Edge pretends to be Chrome 42:
            // https://msdn.microsoft.com/en-us/library/hh869301%28v=vs.85%29.aspx
            resolve(matchedEdge || !matchedChrome || parseInt(matchedChrome[1], 10) >= 43);
        };
    })["catch"](function () {
        return false; // error, so assume unsupported
    });
}

function _checkBlobSupport(idb) {
    if (typeof supportsBlobs === 'boolean') {
        return Promise$1.resolve(supportsBlobs);
    }
    return _checkBlobSupportWithoutCaching(idb).then(function (value) {
        supportsBlobs = value;
        return supportsBlobs;
    });
}

function _deferReadiness(dbInfo) {
    var dbContext = dbContexts[dbInfo.name];

    // Create a deferred object representing the current database operation.
    var deferredOperation = {};

    deferredOperation.promise = new Promise$1(function (resolve, reject) {
        deferredOperation.resolve = resolve;
        deferredOperation.reject = reject;
    });

    // Enqueue the deferred operation.
    dbContext.deferredOperations.push(deferredOperation);

    // Chain its promise to the database readiness.
    if (!dbContext.dbReady) {
        dbContext.dbReady = deferredOperation.promise;
    } else {
        dbContext.dbReady = dbContext.dbReady.then(function () {
            return deferredOperation.promise;
        });
    }
}

function _advanceReadiness(dbInfo) {
    var dbContext = dbContexts[dbInfo.name];

    // Dequeue a deferred operation.
    var deferredOperation = dbContext.deferredOperations.pop();

    // Resolve its promise (which is part of the database readiness
    // chain of promises).
    if (deferredOperation) {
        deferredOperation.resolve();
        return deferredOperation.promise;
    }
}

function _rejectReadiness(dbInfo, err) {
    var dbContext = dbContexts[dbInfo.name];

    // Dequeue a deferred operation.
    var deferredOperation = dbContext.deferredOperations.pop();

    // Reject its promise (which is part of the database readiness
    // chain of promises).
    if (deferredOperation) {
        deferredOperation.reject(err);
        return deferredOperation.promise;
    }
}

function _getConnection(dbInfo, upgradeNeeded) {
    return new Promise$1(function (resolve, reject) {
        dbContexts[dbInfo.name] = dbContexts[dbInfo.name] || createDbContext();

        if (dbInfo.db) {
            if (upgradeNeeded) {
                _deferReadiness(dbInfo);
                dbInfo.db.close();
            } else {
                return resolve(dbInfo.db);
            }
        }

        var dbArgs = [dbInfo.name];

        if (upgradeNeeded) {
            dbArgs.push(dbInfo.version);
        }

        var openreq = idb.open.apply(idb, dbArgs);

        if (upgradeNeeded) {
            openreq.onupgradeneeded = function (e) {
                var db = openreq.result;
                try {
                    db.createObjectStore(dbInfo.storeName);
                    if (e.oldVersion <= 1) {
                        // Added when support for blob shims was added
                        db.createObjectStore(DETECT_BLOB_SUPPORT_STORE);
                    }
                } catch (ex) {
                    if (ex.name === 'ConstraintError') {
                        console.warn('The database "' + dbInfo.name + '"' + ' has been upgraded from version ' + e.oldVersion + ' to version ' + e.newVersion + ', but the storage "' + dbInfo.storeName + '" already exists.');
                    } else {
                        throw ex;
                    }
                }
            };
        }

        openreq.onerror = function (e) {
            e.preventDefault();
            reject(openreq.error);
        };

        openreq.onsuccess = function () {
            var db = openreq.result;
            db.onversionchange = function (e) {
                // Triggered when the database is modified (e.g. adding an objectStore) or
                // deleted (even when initiated by other sessions in different tabs).
                // Closing the connection here prevents those operations from being blocked.
                // If the database is accessed again later by this instance, the connection
                // will be reopened or the database recreated as needed.
                e.target.close();
            };
            resolve(db);
            _advanceReadiness(dbInfo);
        };
    });
}

function _getOriginalConnection(dbInfo) {
    return _getConnection(dbInfo, false);
}

function _getUpgradedConnection(dbInfo) {
    return _getConnection(dbInfo, true);
}

function _isUpgradeNeeded(dbInfo, defaultVersion) {
    if (!dbInfo.db) {
        return true;
    }

    var isNewStore = !dbInfo.db.objectStoreNames.contains(dbInfo.storeName);
    var isDowngrade = dbInfo.version < dbInfo.db.version;
    var isUpgrade = dbInfo.version > dbInfo.db.version;

    if (isDowngrade) {
        // If the version is not the default one
        // then warn for impossible downgrade.
        if (dbInfo.version !== defaultVersion) {
            console.warn('The database "' + dbInfo.name + '"' + " can't be downgraded from version " + dbInfo.db.version + ' to version ' + dbInfo.version + '.');
        }
        // Align the versions to prevent errors.
        dbInfo.version = dbInfo.db.version;
    }

    if (isUpgrade || isNewStore) {
        // If the store is new then increment the version (if needed).
        // This will trigger an "upgradeneeded" event which is required
        // for creating a store.
        if (isNewStore) {
            var incVersion = dbInfo.db.version + 1;
            if (incVersion > dbInfo.version) {
                dbInfo.version = incVersion;
            }
        }

        return true;
    }

    return false;
}

// encode a blob for indexeddb engines that don't support blobs
function _encodeBlob(blob) {
    return new Promise$1(function (resolve, reject) {
        var reader = new FileReader();
        reader.onerror = reject;
        reader.onloadend = function (e) {
            var base64 = btoa(e.target.result || '');
            resolve({
                __local_forage_encoded_blob: true,
                data: base64,
                type: blob.type
            });
        };
        reader.readAsBinaryString(blob);
    });
}

// decode an encoded blob
function _decodeBlob(encodedBlob) {
    var arrayBuff = _binStringToArrayBuffer(atob(encodedBlob.data));
    return createBlob([arrayBuff], { type: encodedBlob.type });
}

// is this one of our fancy encoded blobs?
function _isEncodedBlob(value) {
    return value && value.__local_forage_encoded_blob;
}

// Specialize the default `ready()` function by making it dependent
// on the current database operations. Thus, the driver will be actually
// ready when it's been initialized (default) *and* there are no pending
// operations on the database (initiated by some other instances).
function _fullyReady(callback) {
    var self = this;

    var promise = self._initReady().then(function () {
        var dbContext = dbContexts[self._dbInfo.name];

        if (dbContext && dbContext.dbReady) {
            return dbContext.dbReady;
        }
    });

    executeTwoCallbacks(promise, callback, callback);
    return promise;
}

// Try to establish a new db connection to replace the
// current one which is broken (i.e. experiencing
// InvalidStateError while creating a transaction).
function _tryReconnect(dbInfo) {
    _deferReadiness(dbInfo);

    var dbContext = dbContexts[dbInfo.name];
    var forages = dbContext.forages;

    for (var i = 0; i < forages.length; i++) {
        var forage = forages[i];
        if (forage._dbInfo.db) {
            forage._dbInfo.db.close();
            forage._dbInfo.db = null;
        }
    }
    dbInfo.db = null;

    return _getOriginalConnection(dbInfo).then(function (db) {
        dbInfo.db = db;
        if (_isUpgradeNeeded(dbInfo)) {
            // Reopen the database for upgrading.
            return _getUpgradedConnection(dbInfo);
        }
        return db;
    }).then(function (db) {
        // store the latest db reference
        // in case the db was upgraded
        dbInfo.db = dbContext.db = db;
        for (var i = 0; i < forages.length; i++) {
            forages[i]._dbInfo.db = db;
        }
    })["catch"](function (err) {
        _rejectReadiness(dbInfo, err);
        throw err;
    });
}

// FF doesn't like Promises (micro-tasks) and IDDB store operations,
// so we have to do it with callbacks
function createTransaction(dbInfo, mode, callback, retries) {
    if (retries === undefined) {
        retries = 1;
    }

    try {
        var tx = dbInfo.db.transaction(dbInfo.storeName, mode);
        callback(null, tx);
    } catch (err) {
        if (retries > 0 && (!dbInfo.db || err.name === 'InvalidStateError' || err.name === 'NotFoundError')) {
            return Promise$1.resolve().then(function () {
                if (!dbInfo.db || err.name === 'NotFoundError' && !dbInfo.db.objectStoreNames.contains(dbInfo.storeName) && dbInfo.version <= dbInfo.db.version) {
                    // increase the db version, to create the new ObjectStore
                    if (dbInfo.db) {
                        dbInfo.version = dbInfo.db.version + 1;
                    }
                    // Reopen the database for upgrading.
                    return _getUpgradedConnection(dbInfo);
                }
            }).then(function () {
                return _tryReconnect(dbInfo).then(function () {
                    createTransaction(dbInfo, mode, callback, retries - 1);
                });
            })["catch"](callback);
        }

        callback(err);
    }
}

function createDbContext() {
    return {
        // Running localForages sharing a database.
        forages: [],
        // Shared database.
        db: null,
        // Database readiness (promise).
        dbReady: null,
        // Deferred operations on the database.
        deferredOperations: []
    };
}

// Open the IndexedDB database (automatically creates one if one didn't
// previously exist), using any options set in the config.
function _initStorage(options) {
    var self = this;
    var dbInfo = {
        db: null
    };

    if (options) {
        for (var i in options) {
            dbInfo[i] = options[i];
        }
    }

    // Get the current context of the database;
    var dbContext = dbContexts[dbInfo.name];

    // ...or create a new context.
    if (!dbContext) {
        dbContext = createDbContext();
        // Register the new context in the global container.
        dbContexts[dbInfo.name] = dbContext;
    }

    // Register itself as a running localForage in the current context.
    dbContext.forages.push(self);

    // Replace the default `ready()` function with the specialized one.
    if (!self._initReady) {
        self._initReady = self.ready;
        self.ready = _fullyReady;
    }

    // Create an array of initialization states of the related localForages.
    var initPromises = [];

    function ignoreErrors() {
        // Don't handle errors here,
        // just makes sure related localForages aren't pending.
        return Promise$1.resolve();
    }

    for (var j = 0; j < dbContext.forages.length; j++) {
        var forage = dbContext.forages[j];
        if (forage !== self) {
            // Don't wait for itself...
            initPromises.push(forage._initReady()["catch"](ignoreErrors));
        }
    }

    // Take a snapshot of the related localForages.
    var forages = dbContext.forages.slice(0);

    // Initialize the connection process only when
    // all the related localForages aren't pending.
    return Promise$1.all(initPromises).then(function () {
        dbInfo.db = dbContext.db;
        // Get the connection or open a new one without upgrade.
        return _getOriginalConnection(dbInfo);
    }).then(function (db) {
        dbInfo.db = db;
        if (_isUpgradeNeeded(dbInfo, self._defaultConfig.version)) {
            // Reopen the database for upgrading.
            return _getUpgradedConnection(dbInfo);
        }
        return db;
    }).then(function (db) {
        dbInfo.db = dbContext.db = db;
        self._dbInfo = dbInfo;
        // Share the final connection amongst related localForages.
        for (var k = 0; k < forages.length; k++) {
            var forage = forages[k];
            if (forage !== self) {
                // Self is already up-to-date.
                forage._dbInfo.db = dbInfo.db;
                forage._dbInfo.version = dbInfo.version;
            }
        }
    });
}

function getItem(key, callback) {
    var self = this;

    key = normalizeKey(key);

    var promise = new Promise$1(function (resolve, reject) {
        self.ready().then(function () {
            createTransaction(self._dbInfo, READ_ONLY, function (err, transaction) {
                if (err) {
                    return reject(err);
                }

                try {
                    var store = transaction.objectStore(self._dbInfo.storeName);
                    var req = store.get(key);

                    req.onsuccess = function () {
                        var value = req.result;
                        if (value === undefined) {
                            value = null;
                        }
                        if (_isEncodedBlob(value)) {
                            value = _decodeBlob(value);
                        }
                        resolve(value);
                    };

                    req.onerror = function () {
                        reject(req.error);
                    };
                } catch (e) {
                    reject(e);
                }
            });
        })["catch"](reject);
    });

    executeCallback(promise, callback);
    return promise;
}

// Iterate over all items stored in database.
function iterate(iterator, callback) {
    var self = this;

    var promise = new Promise$1(function (resolve, reject) {
        self.ready().then(function () {
            createTransaction(self._dbInfo, READ_ONLY, function (err, transaction) {
                if (err) {
                    return reject(err);
                }

                try {
                    var store = transaction.objectStore(self._dbInfo.storeName);
                    var req = store.openCursor();
                    var iterationNumber = 1;

                    req.onsuccess = function () {
                        var cursor = req.result;

                        if (cursor) {
                            var value = cursor.value;
                            if (_isEncodedBlob(value)) {
                                value = _decodeBlob(value);
                            }
                            var result = iterator(value, cursor.key, iterationNumber++);

                            // when the iterator callback returns any
                            // (non-`undefined`) value, then we stop
                            // the iteration immediately
                            if (result !== void 0) {
                                resolve(result);
                            } else {
                                cursor["continue"]();
                            }
                        } else {
                            resolve();
                        }
                    };

                    req.onerror = function () {
                        reject(req.error);
                    };
                } catch (e) {
                    reject(e);
                }
            });
        })["catch"](reject);
    });

    executeCallback(promise, callback);

    return promise;
}

function setItem(key, value, callback) {
    var self = this;

    key = normalizeKey(key);

    var promise = new Promise$1(function (resolve, reject) {
        var dbInfo;
        self.ready().then(function () {
            dbInfo = self._dbInfo;
            if (toString.call(value) === '[object Blob]') {
                return _checkBlobSupport(dbInfo.db).then(function (blobSupport) {
                    if (blobSupport) {
                        return value;
                    }
                    return _encodeBlob(value);
                });
            }
            return value;
        }).then(function (value) {
            createTransaction(self._dbInfo, READ_WRITE, function (err, transaction) {
                if (err) {
                    return reject(err);
                }

                try {
                    var store = transaction.objectStore(self._dbInfo.storeName);

                    // The reason we don't _save_ null is because IE 10 does
                    // not support saving the `null` type in IndexedDB. How
                    // ironic, given the bug below!
                    // See: https://github.com/mozilla/localForage/issues/161
                    if (value === null) {
                        value = undefined;
                    }

                    var req = store.put(value, key);

                    transaction.oncomplete = function () {
                        // Cast to undefined so the value passed to
                        // callback/promise is the same as what one would get out
                        // of `getItem()` later. This leads to some weirdness
                        // (setItem('foo', undefined) will return `null`), but
                        // it's not my fault localStorage is our baseline and that
                        // it's weird.
                        if (value === undefined) {
                            value = null;
                        }

                        resolve(value);
                    };
                    transaction.onabort = transaction.onerror = function () {
                        var err = req.error ? req.error : req.transaction.error;
                        reject(err);
                    };
                } catch (e) {
                    reject(e);
                }
            });
        })["catch"](reject);
    });

    executeCallback(promise, callback);
    return promise;
}

function removeItem(key, callback) {
    var self = this;

    key = normalizeKey(key);

    var promise = new Promise$1(function (resolve, reject) {
        self.ready().then(function () {
            createTransaction(self._dbInfo, READ_WRITE, function (err, transaction) {
                if (err) {
                    return reject(err);
                }

                try {
                    var store = transaction.objectStore(self._dbInfo.storeName);
                    // We use a Grunt task to make this safe for IE and some
                    // versions of Android (including those used by Cordova).
                    // Normally IE won't like `.delete()` and will insist on
                    // using `['delete']()`, but we have a build step that
                    // fixes this for us now.
                    var req = store["delete"](key);
                    transaction.oncomplete = function () {
                        resolve();
                    };

                    transaction.onerror = function () {
                        reject(req.error);
                    };

                    // The request will be also be aborted if we've exceeded our storage
                    // space.
                    transaction.onabort = function () {
                        var err = req.error ? req.error : req.transaction.error;
                        reject(err);
                    };
                } catch (e) {
                    reject(e);
                }
            });
        })["catch"](reject);
    });

    executeCallback(promise, callback);
    return promise;
}

function clear(callback) {
    var self = this;

    var promise = new Promise$1(function (resolve, reject) {
        self.ready().then(function () {
            createTransaction(self._dbInfo, READ_WRITE, function (err, transaction) {
                if (err) {
                    return reject(err);
                }

                try {
                    var store = transaction.objectStore(self._dbInfo.storeName);
                    var req = store.clear();

                    transaction.oncomplete = function () {
                        resolve();
                    };

                    transaction.onabort = transaction.onerror = function () {
                        var err = req.error ? req.error : req.transaction.error;
                        reject(err);
                    };
                } catch (e) {
                    reject(e);
                }
            });
        })["catch"](reject);
    });

    executeCallback(promise, callback);
    return promise;
}

function length(callback) {
    var self = this;

    var promise = new Promise$1(function (resolve, reject) {
        self.ready().then(function () {
            createTransaction(self._dbInfo, READ_ONLY, function (err, transaction) {
                if (err) {
                    return reject(err);
                }

                try {
                    var store = transaction.objectStore(self._dbInfo.storeName);
                    var req = store.count();

                    req.onsuccess = function () {
                        resolve(req.result);
                    };

                    req.onerror = function () {
                        reject(req.error);
                    };
                } catch (e) {
                    reject(e);
                }
            });
        })["catch"](reject);
    });

    executeCallback(promise, callback);
    return promise;
}

function key(n, callback) {
    var self = this;

    var promise = new Promise$1(function (resolve, reject) {
        if (n < 0) {
            resolve(null);

            return;
        }

        self.ready().then(function () {
            createTransaction(self._dbInfo, READ_ONLY, function (err, transaction) {
                if (err) {
                    return reject(err);
                }

                try {
                    var store = transaction.objectStore(self._dbInfo.storeName);
                    var advanced = false;
                    var req = store.openKeyCursor();

                    req.onsuccess = function () {
                        var cursor = req.result;
                        if (!cursor) {
                            // this means there weren't enough keys
                            resolve(null);

                            return;
                        }

                        if (n === 0) {
                            // We have the first key, return it if that's what they
                            // wanted.
                            resolve(cursor.key);
                        } else {
                            if (!advanced) {
                                // Otherwise, ask the cursor to skip ahead n
                                // records.
                                advanced = true;
                                cursor.advance(n);
                            } else {
                                // When we get here, we've got the nth key.
                                resolve(cursor.key);
                            }
                        }
                    };

                    req.onerror = function () {
                        reject(req.error);
                    };
                } catch (e) {
                    reject(e);
                }
            });
        })["catch"](reject);
    });

    executeCallback(promise, callback);
    return promise;
}

function keys(callback) {
    var self = this;

    var promise = new Promise$1(function (resolve, reject) {
        self.ready().then(function () {
            createTransaction(self._dbInfo, READ_ONLY, function (err, transaction) {
                if (err) {
                    return reject(err);
                }

                try {
                    var store = transaction.objectStore(self._dbInfo.storeName);
                    var req = store.openKeyCursor();
                    var keys = [];

                    req.onsuccess = function () {
                        var cursor = req.result;

                        if (!cursor) {
                            resolve(keys);
                            return;
                        }

                        keys.push(cursor.key);
                        cursor["continue"]();
                    };

                    req.onerror = function () {
                        reject(req.error);
                    };
                } catch (e) {
                    reject(e);
                }
            });
        })["catch"](reject);
    });

    executeCallback(promise, callback);
    return promise;
}

function dropInstance(options, callback) {
    callback = getCallback.apply(this, arguments);

    var currentConfig = this.config();
    options = typeof options !== 'function' && options || {};
    if (!options.name) {
        options.name = options.name || currentConfig.name;
        options.storeName = options.storeName || currentConfig.storeName;
    }

    var self = this;
    var promise;
    if (!options.name) {
        promise = Promise$1.reject('Invalid arguments');
    } else {
        var isCurrentDb = options.name === currentConfig.name && self._dbInfo.db;

        var dbPromise = isCurrentDb ? Promise$1.resolve(self._dbInfo.db) : _getOriginalConnection(options).then(function (db) {
            var dbContext = dbContexts[options.name];
            var forages = dbContext.forages;
            dbContext.db = db;
            for (var i = 0; i < forages.length; i++) {
                forages[i]._dbInfo.db = db;
            }
            return db;
        });

        if (!options.storeName) {
            promise = dbPromise.then(function (db) {
                _deferReadiness(options);

                var dbContext = dbContexts[options.name];
                var forages = dbContext.forages;

                db.close();
                for (var i = 0; i < forages.length; i++) {
                    var forage = forages[i];
                    forage._dbInfo.db = null;
                }

                var dropDBPromise = new Promise$1(function (resolve, reject) {
                    var req = idb.deleteDatabase(options.name);

                    req.onerror = function () {
                        var db = req.result;
                        if (db) {
                            db.close();
                        }
                        reject(req.error);
                    };

                    req.onblocked = function () {
                        // Closing all open connections in onversionchange handler should prevent this situation, but if
                        // we do get here, it just means the request remains pending - eventually it will succeed or error
                        console.warn('dropInstance blocked for database "' + options.name + '" until all open connections are closed');
                    };

                    req.onsuccess = function () {
                        var db = req.result;
                        if (db) {
                            db.close();
                        }
                        resolve(db);
                    };
                });

                return dropDBPromise.then(function (db) {
                    dbContext.db = db;
                    for (var i = 0; i < forages.length; i++) {
                        var _forage = forages[i];
                        _advanceReadiness(_forage._dbInfo);
                    }
                })["catch"](function (err) {
                    (_rejectReadiness(options, err) || Promise$1.resolve())["catch"](function () {});
                    throw err;
                });
            });
        } else {
            promise = dbPromise.then(function (db) {
                if (!db.objectStoreNames.contains(options.storeName)) {
                    return;
                }

                var newVersion = db.version + 1;

                _deferReadiness(options);

                var dbContext = dbContexts[options.name];
                var forages = dbContext.forages;

                db.close();
                for (var i = 0; i < forages.length; i++) {
                    var forage = forages[i];
                    forage._dbInfo.db = null;
                    forage._dbInfo.version = newVersion;
                }

                var dropObjectPromise = new Promise$1(function (resolve, reject) {
                    var req = idb.open(options.name, newVersion);

                    req.onerror = function (err) {
                        var db = req.result;
                        db.close();
                        reject(err);
                    };

                    req.onupgradeneeded = function () {
                        var db = req.result;
                        db.deleteObjectStore(options.storeName);
                    };

                    req.onsuccess = function () {
                        var db = req.result;
                        db.close();
                        resolve(db);
                    };
                });

                return dropObjectPromise.then(function (db) {
                    dbContext.db = db;
                    for (var j = 0; j < forages.length; j++) {
                        var _forage2 = forages[j];
                        _forage2._dbInfo.db = db;
                        _advanceReadiness(_forage2._dbInfo);
                    }
                })["catch"](function (err) {
                    (_rejectReadiness(options, err) || Promise$1.resolve())["catch"](function () {});
                    throw err;
                });
            });
        }
    }

    executeCallback(promise, callback);
    return promise;
}

var asyncStorage = {
    _driver: 'asyncStorage',
    _initStorage: _initStorage,
    _support: isIndexedDBValid(),
    iterate: iterate,
    getItem: getItem,
    setItem: setItem,
    removeItem: removeItem,
    clear: clear,
    length: length,
    key: key,
    keys: keys,
    dropInstance: dropInstance
};

function isWebSQLValid() {
    return typeof openDatabase === 'function';
}

// Sadly, the best way to save binary data in WebSQL/localStorage is serializing
// it to Base64, so this is how we store it to prevent very strange errors with less
// verbose ways of binary <-> string data storage.
var BASE_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

var BLOB_TYPE_PREFIX = '~~local_forage_type~';
var BLOB_TYPE_PREFIX_REGEX = /^~~local_forage_type~([^~]+)~/;

var SERIALIZED_MARKER = '__lfsc__:';
var SERIALIZED_MARKER_LENGTH = SERIALIZED_MARKER.length;

// OMG the serializations!
var TYPE_ARRAYBUFFER = 'arbf';
var TYPE_BLOB = 'blob';
var TYPE_INT8ARRAY = 'si08';
var TYPE_UINT8ARRAY = 'ui08';
var TYPE_UINT8CLAMPEDARRAY = 'uic8';
var TYPE_INT16ARRAY = 'si16';
var TYPE_INT32ARRAY = 'si32';
var TYPE_UINT16ARRAY = 'ur16';
var TYPE_UINT32ARRAY = 'ui32';
var TYPE_FLOAT32ARRAY = 'fl32';
var TYPE_FLOAT64ARRAY = 'fl64';
var TYPE_SERIALIZED_MARKER_LENGTH = SERIALIZED_MARKER_LENGTH + TYPE_ARRAYBUFFER.length;

var toString$1 = Object.prototype.toString;

function stringToBuffer(serializedString) {
    // Fill the string into a ArrayBuffer.
    var bufferLength = serializedString.length * 0.75;
    var len = serializedString.length;
    var i;
    var p = 0;
    var encoded1, encoded2, encoded3, encoded4;

    if (serializedString[serializedString.length - 1] === '=') {
        bufferLength--;
        if (serializedString[serializedString.length - 2] === '=') {
            bufferLength--;
        }
    }

    var buffer = new ArrayBuffer(bufferLength);
    var bytes = new Uint8Array(buffer);

    for (i = 0; i < len; i += 4) {
        encoded1 = BASE_CHARS.indexOf(serializedString[i]);
        encoded2 = BASE_CHARS.indexOf(serializedString[i + 1]);
        encoded3 = BASE_CHARS.indexOf(serializedString[i + 2]);
        encoded4 = BASE_CHARS.indexOf(serializedString[i + 3]);

        /*jslint bitwise: true */
        bytes[p++] = encoded1 << 2 | encoded2 >> 4;
        bytes[p++] = (encoded2 & 15) << 4 | encoded3 >> 2;
        bytes[p++] = (encoded3 & 3) << 6 | encoded4 & 63;
    }
    return buffer;
}

// Converts a buffer to a string to store, serialized, in the backend
// storage library.
function bufferToString(buffer) {
    // base64-arraybuffer
    var bytes = new Uint8Array(buffer);
    var base64String = '';
    var i;

    for (i = 0; i < bytes.length; i += 3) {
        /*jslint bitwise: true */
        base64String += BASE_CHARS[bytes[i] >> 2];
        base64String += BASE_CHARS[(bytes[i] & 3) << 4 | bytes[i + 1] >> 4];
        base64String += BASE_CHARS[(bytes[i + 1] & 15) << 2 | bytes[i + 2] >> 6];
        base64String += BASE_CHARS[bytes[i + 2] & 63];
    }

    if (bytes.length % 3 === 2) {
        base64String = base64String.substring(0, base64String.length - 1) + '=';
    } else if (bytes.length % 3 === 1) {
        base64String = base64String.substring(0, base64String.length - 2) + '==';
    }

    return base64String;
}

// Serialize a value, afterwards executing a callback (which usually
// instructs the `setItem()` callback/promise to be executed). This is how
// we store binary data with localStorage.
function serialize(value, callback) {
    var valueType = '';
    if (value) {
        valueType = toString$1.call(value);
    }

    // Cannot use `value instanceof ArrayBuffer` or such here, as these
    // checks fail when running the tests using casper.js...
    //
    // TODO: See why those tests fail and use a better solution.
    if (value && (valueType === '[object ArrayBuffer]' || value.buffer && toString$1.call(value.buffer) === '[object ArrayBuffer]')) {
        // Convert binary arrays to a string and prefix the string with
        // a special marker.
        var buffer;
        var marker = SERIALIZED_MARKER;

        if (value instanceof ArrayBuffer) {
            buffer = value;
            marker += TYPE_ARRAYBUFFER;
        } else {
            buffer = value.buffer;

            if (valueType === '[object Int8Array]') {
                marker += TYPE_INT8ARRAY;
            } else if (valueType === '[object Uint8Array]') {
                marker += TYPE_UINT8ARRAY;
            } else if (valueType === '[object Uint8ClampedArray]') {
                marker += TYPE_UINT8CLAMPEDARRAY;
            } else if (valueType === '[object Int16Array]') {
                marker += TYPE_INT16ARRAY;
            } else if (valueType === '[object Uint16Array]') {
                marker += TYPE_UINT16ARRAY;
            } else if (valueType === '[object Int32Array]') {
                marker += TYPE_INT32ARRAY;
            } else if (valueType === '[object Uint32Array]') {
                marker += TYPE_UINT32ARRAY;
            } else if (valueType === '[object Float32Array]') {
                marker += TYPE_FLOAT32ARRAY;
            } else if (valueType === '[object Float64Array]') {
                marker += TYPE_FLOAT64ARRAY;
            } else {
                callback(new Error('Failed to get type for BinaryArray'));
            }
        }

        callback(marker + bufferToString(buffer));
    } else if (valueType === '[object Blob]') {
        // Conver the blob to a binaryArray and then to a string.
        var fileReader = new FileReader();

        fileReader.onload = function () {
            // Backwards-compatible prefix for the blob type.
            var str = BLOB_TYPE_PREFIX + value.type + '~' + bufferToString(this.result);

            callback(SERIALIZED_MARKER + TYPE_BLOB + str);
        };

        fileReader.readAsArrayBuffer(value);
    } else {
        try {
            callback(JSON.stringify(value));
        } catch (e) {
            console.error("Couldn't convert value into a JSON string: ", value);

            callback(null, e);
        }
    }
}

// Deserialize data we've inserted into a value column/field. We place
// special markers into our strings to mark them as encoded; this isn't
// as nice as a meta field, but it's the only sane thing we can do whilst
// keeping localStorage support intact.
//
// Oftentimes this will just deserialize JSON content, but if we have a
// special marker (SERIALIZED_MARKER, defined above), we will extract
// some kind of arraybuffer/binary data/typed array out of the string.
function deserialize(value) {
    // If we haven't marked this string as being specially serialized (i.e.
    // something other than serialized JSON), we can just return it and be
    // done with it.
    if (value.substring(0, SERIALIZED_MARKER_LENGTH) !== SERIALIZED_MARKER) {
        return JSON.parse(value);
    }

    // The following code deals with deserializing some kind of Blob or
    // TypedArray. First we separate out the type of data we're dealing
    // with from the data itself.
    var serializedString = value.substring(TYPE_SERIALIZED_MARKER_LENGTH);
    var type = value.substring(SERIALIZED_MARKER_LENGTH, TYPE_SERIALIZED_MARKER_LENGTH);

    var blobType;
    // Backwards-compatible blob type serialization strategy.
    // DBs created with older versions of localForage will simply not have the blob type.
    if (type === TYPE_BLOB && BLOB_TYPE_PREFIX_REGEX.test(serializedString)) {
        var matcher = serializedString.match(BLOB_TYPE_PREFIX_REGEX);
        blobType = matcher[1];
        serializedString = serializedString.substring(matcher[0].length);
    }
    var buffer = stringToBuffer(serializedString);

    // Return the right type based on the code/type set during
    // serialization.
    switch (type) {
        case TYPE_ARRAYBUFFER:
            return buffer;
        case TYPE_BLOB:
            return createBlob([buffer], { type: blobType });
        case TYPE_INT8ARRAY:
            return new Int8Array(buffer);
        case TYPE_UINT8ARRAY:
            return new Uint8Array(buffer);
        case TYPE_UINT8CLAMPEDARRAY:
            return new Uint8ClampedArray(buffer);
        case TYPE_INT16ARRAY:
            return new Int16Array(buffer);
        case TYPE_UINT16ARRAY:
            return new Uint16Array(buffer);
        case TYPE_INT32ARRAY:
            return new Int32Array(buffer);
        case TYPE_UINT32ARRAY:
            return new Uint32Array(buffer);
        case TYPE_FLOAT32ARRAY:
            return new Float32Array(buffer);
        case TYPE_FLOAT64ARRAY:
            return new Float64Array(buffer);
        default:
            throw new Error('Unkown type: ' + type);
    }
}

var localforageSerializer = {
    serialize: serialize,
    deserialize: deserialize,
    stringToBuffer: stringToBuffer,
    bufferToString: bufferToString
};

/*
 * Includes code from:
 *
 * base64-arraybuffer
 * https://github.com/niklasvh/base64-arraybuffer
 *
 * Copyright (c) 2012 Niklas von Hertzen
 * Licensed under the MIT license.
 */

function createDbTable(t, dbInfo, callback, errorCallback) {
    t.executeSql('CREATE TABLE IF NOT EXISTS ' + dbInfo.storeName + ' ' + '(id INTEGER PRIMARY KEY, key unique, value)', [], callback, errorCallback);
}

// Open the WebSQL database (automatically creates one if one didn't
// previously exist), using any options set in the config.
function _initStorage$1(options) {
    var self = this;
    var dbInfo = {
        db: null
    };

    if (options) {
        for (var i in options) {
            dbInfo[i] = typeof options[i] !== 'string' ? options[i].toString() : options[i];
        }
    }

    var dbInfoPromise = new Promise$1(function (resolve, reject) {
        // Open the database; the openDatabase API will automatically
        // create it for us if it doesn't exist.
        try {
            dbInfo.db = openDatabase(dbInfo.name, String(dbInfo.version), dbInfo.description, dbInfo.size);
        } catch (e) {
            return reject(e);
        }

        // Create our key/value table if it doesn't exist.
        dbInfo.db.transaction(function (t) {
            createDbTable(t, dbInfo, function () {
                self._dbInfo = dbInfo;
                resolve();
            }, function (t, error) {
                reject(error);
            });
        }, reject);
    });

    dbInfo.serializer = localforageSerializer;
    return dbInfoPromise;
}

function tryExecuteSql(t, dbInfo, sqlStatement, args, callback, errorCallback) {
    t.executeSql(sqlStatement, args, callback, function (t, error) {
        if (error.code === error.SYNTAX_ERR) {
            t.executeSql('SELECT name FROM sqlite_master ' + "WHERE type='table' AND name = ?", [dbInfo.storeName], function (t, results) {
                if (!results.rows.length) {
                    // if the table is missing (was deleted)
                    // re-create it table and retry
                    createDbTable(t, dbInfo, function () {
                        t.executeSql(sqlStatement, args, callback, errorCallback);
                    }, errorCallback);
                } else {
                    errorCallback(t, error);
                }
            }, errorCallback);
        } else {
            errorCallback(t, error);
        }
    }, errorCallback);
}

function getItem$1(key, callback) {
    var self = this;

    key = normalizeKey(key);

    var promise = new Promise$1(function (resolve, reject) {
        self.ready().then(function () {
            var dbInfo = self._dbInfo;
            dbInfo.db.transaction(function (t) {
                tryExecuteSql(t, dbInfo, 'SELECT * FROM ' + dbInfo.storeName + ' WHERE key = ? LIMIT 1', [key], function (t, results) {
                    var result = results.rows.length ? results.rows.item(0).value : null;

                    // Check to see if this is serialized content we need to
                    // unpack.
                    if (result) {
                        result = dbInfo.serializer.deserialize(result);
                    }

                    resolve(result);
                }, function (t, error) {
                    reject(error);
                });
            });
        })["catch"](reject);
    });

    executeCallback(promise, callback);
    return promise;
}

function iterate$1(iterator, callback) {
    var self = this;

    var promise = new Promise$1(function (resolve, reject) {
        self.ready().then(function () {
            var dbInfo = self._dbInfo;

            dbInfo.db.transaction(function (t) {
                tryExecuteSql(t, dbInfo, 'SELECT * FROM ' + dbInfo.storeName, [], function (t, results) {
                    var rows = results.rows;
                    var length = rows.length;

                    for (var i = 0; i < length; i++) {
                        var item = rows.item(i);
                        var result = item.value;

                        // Check to see if this is serialized content
                        // we need to unpack.
                        if (result) {
                            result = dbInfo.serializer.deserialize(result);
                        }

                        result = iterator(result, item.key, i + 1);

                        // void(0) prevents problems with redefinition
                        // of `undefined`.
                        if (result !== void 0) {
                            resolve(result);
                            return;
                        }
                    }

                    resolve();
                }, function (t, error) {
                    reject(error);
                });
            });
        })["catch"](reject);
    });

    executeCallback(promise, callback);
    return promise;
}

function _setItem(key, value, callback, retriesLeft) {
    var self = this;

    key = normalizeKey(key);

    var promise = new Promise$1(function (resolve, reject) {
        self.ready().then(function () {
            // The localStorage API doesn't return undefined values in an
            // "expected" way, so undefined is always cast to null in all
            // drivers. See: https://github.com/mozilla/localForage/pull/42
            if (value === undefined) {
                value = null;
            }

            // Save the original value to pass to the callback.
            var originalValue = value;

            var dbInfo = self._dbInfo;
            dbInfo.serializer.serialize(value, function (value, error) {
                if (error) {
                    reject(error);
                } else {
                    dbInfo.db.transaction(function (t) {
                        tryExecuteSql(t, dbInfo, 'INSERT OR REPLACE INTO ' + dbInfo.storeName + ' ' + '(key, value) VALUES (?, ?)', [key, value], function () {
                            resolve(originalValue);
                        }, function (t, error) {
                            reject(error);
                        });
                    }, function (sqlError) {
                        // The transaction failed; check
                        // to see if it's a quota error.
                        if (sqlError.code === sqlError.QUOTA_ERR) {
                            // We reject the callback outright for now, but
                            // it's worth trying to re-run the transaction.
                            // Even if the user accepts the prompt to use
                            // more storage on Safari, this error will
                            // be called.
                            //
                            // Try to re-run the transaction.
                            if (retriesLeft > 0) {
                                resolve(_setItem.apply(self, [key, originalValue, callback, retriesLeft - 1]));
                                return;
                            }
                            reject(sqlError);
                        }
                    });
                }
            });
        })["catch"](reject);
    });

    executeCallback(promise, callback);
    return promise;
}

function setItem$1(key, value, callback) {
    return _setItem.apply(this, [key, value, callback, 1]);
}

function removeItem$1(key, callback) {
    var self = this;

    key = normalizeKey(key);

    var promise = new Promise$1(function (resolve, reject) {
        self.ready().then(function () {
            var dbInfo = self._dbInfo;
            dbInfo.db.transaction(function (t) {
                tryExecuteSql(t, dbInfo, 'DELETE FROM ' + dbInfo.storeName + ' WHERE key = ?', [key], function () {
                    resolve();
                }, function (t, error) {
                    reject(error);
                });
            });
        })["catch"](reject);
    });

    executeCallback(promise, callback);
    return promise;
}

// Deletes every item in the table.
// TODO: Find out if this resets the AUTO_INCREMENT number.
function clear$1(callback) {
    var self = this;

    var promise = new Promise$1(function (resolve, reject) {
        self.ready().then(function () {
            var dbInfo = self._dbInfo;
            dbInfo.db.transaction(function (t) {
                tryExecuteSql(t, dbInfo, 'DELETE FROM ' + dbInfo.storeName, [], function () {
                    resolve();
                }, function (t, error) {
                    reject(error);
                });
            });
        })["catch"](reject);
    });

    executeCallback(promise, callback);
    return promise;
}

// Does a simple `COUNT(key)` to get the number of items stored in
// localForage.
function length$1(callback) {
    var self = this;

    var promise = new Promise$1(function (resolve, reject) {
        self.ready().then(function () {
            var dbInfo = self._dbInfo;
            dbInfo.db.transaction(function (t) {
                // Ahhh, SQL makes this one soooooo easy.
                tryExecuteSql(t, dbInfo, 'SELECT COUNT(key) as c FROM ' + dbInfo.storeName, [], function (t, results) {
                    var result = results.rows.item(0).c;
                    resolve(result);
                }, function (t, error) {
                    reject(error);
                });
            });
        })["catch"](reject);
    });

    executeCallback(promise, callback);
    return promise;
}

// Return the key located at key index X; essentially gets the key from a
// `WHERE id = ?`. This is the most efficient way I can think to implement
// this rarely-used (in my experience) part of the API, but it can seem
// inconsistent, because we do `INSERT OR REPLACE INTO` on `setItem()`, so
// the ID of each key will change every time it's updated. Perhaps a stored
// procedure for the `setItem()` SQL would solve this problem?
// TODO: Don't change ID on `setItem()`.
function key$1(n, callback) {
    var self = this;

    var promise = new Promise$1(function (resolve, reject) {
        self.ready().then(function () {
            var dbInfo = self._dbInfo;
            dbInfo.db.transaction(function (t) {
                tryExecuteSql(t, dbInfo, 'SELECT key FROM ' + dbInfo.storeName + ' WHERE id = ? LIMIT 1', [n + 1], function (t, results) {
                    var result = results.rows.length ? results.rows.item(0).key : null;
                    resolve(result);
                }, function (t, error) {
                    reject(error);
                });
            });
        })["catch"](reject);
    });

    executeCallback(promise, callback);
    return promise;
}

function keys$1(callback) {
    var self = this;

    var promise = new Promise$1(function (resolve, reject) {
        self.ready().then(function () {
            var dbInfo = self._dbInfo;
            dbInfo.db.transaction(function (t) {
                tryExecuteSql(t, dbInfo, 'SELECT key FROM ' + dbInfo.storeName, [], function (t, results) {
                    var keys = [];

                    for (var i = 0; i < results.rows.length; i++) {
                        keys.push(results.rows.item(i).key);
                    }

                    resolve(keys);
                }, function (t, error) {
                    reject(error);
                });
            });
        })["catch"](reject);
    });

    executeCallback(promise, callback);
    return promise;
}

// https://www.w3.org/TR/webdatabase/#databases
// > There is no way to enumerate or delete the databases available for an origin from this API.
function getAllStoreNames(db) {
    return new Promise$1(function (resolve, reject) {
        db.transaction(function (t) {
            t.executeSql('SELECT name FROM sqlite_master ' + "WHERE type='table' AND name <> '__WebKitDatabaseInfoTable__'", [], function (t, results) {
                var storeNames = [];

                for (var i = 0; i < results.rows.length; i++) {
                    storeNames.push(results.rows.item(i).name);
                }

                resolve({
                    db: db,
                    storeNames: storeNames
                });
            }, function (t, error) {
                reject(error);
            });
        }, function (sqlError) {
            reject(sqlError);
        });
    });
}

function dropInstance$1(options, callback) {
    callback = getCallback.apply(this, arguments);

    var currentConfig = this.config();
    options = typeof options !== 'function' && options || {};
    if (!options.name) {
        options.name = options.name || currentConfig.name;
        options.storeName = options.storeName || currentConfig.storeName;
    }

    var self = this;
    var promise;
    if (!options.name) {
        promise = Promise$1.reject('Invalid arguments');
    } else {
        promise = new Promise$1(function (resolve) {
            var db;
            if (options.name === currentConfig.name) {
                // use the db reference of the current instance
                db = self._dbInfo.db;
            } else {
                db = openDatabase(options.name, '', '', 0);
            }

            if (!options.storeName) {
                // drop all database tables
                resolve(getAllStoreNames(db));
            } else {
                resolve({
                    db: db,
                    storeNames: [options.storeName]
                });
            }
        }).then(function (operationInfo) {
            return new Promise$1(function (resolve, reject) {
                operationInfo.db.transaction(function (t) {
                    function dropTable(storeName) {
                        return new Promise$1(function (resolve, reject) {
                            t.executeSql('DROP TABLE IF EXISTS ' + storeName, [], function () {
                                resolve();
                            }, function (t, error) {
                                reject(error);
                            });
                        });
                    }

                    var operations = [];
                    for (var i = 0, len = operationInfo.storeNames.length; i < len; i++) {
                        operations.push(dropTable(operationInfo.storeNames[i]));
                    }

                    Promise$1.all(operations).then(function () {
                        resolve();
                    })["catch"](function (e) {
                        reject(e);
                    });
                }, function (sqlError) {
                    reject(sqlError);
                });
            });
        });
    }

    executeCallback(promise, callback);
    return promise;
}

var webSQLStorage = {
    _driver: 'webSQLStorage',
    _initStorage: _initStorage$1,
    _support: isWebSQLValid(),
    iterate: iterate$1,
    getItem: getItem$1,
    setItem: setItem$1,
    removeItem: removeItem$1,
    clear: clear$1,
    length: length$1,
    key: key$1,
    keys: keys$1,
    dropInstance: dropInstance$1
};

function isLocalStorageValid() {
    try {
        return typeof localStorage !== 'undefined' && 'setItem' in localStorage &&
        // in IE8 typeof localStorage.setItem === 'object'
        !!localStorage.setItem;
    } catch (e) {
        return false;
    }
}

function _getKeyPrefix(options, defaultConfig) {
    var keyPrefix = options.name + '/';

    if (options.storeName !== defaultConfig.storeName) {
        keyPrefix += options.storeName + '/';
    }
    return keyPrefix;
}

// Check if localStorage throws when saving an item
function checkIfLocalStorageThrows() {
    var localStorageTestKey = '_localforage_support_test';

    try {
        localStorage.setItem(localStorageTestKey, true);
        localStorage.removeItem(localStorageTestKey);

        return false;
    } catch (e) {
        return true;
    }
}

// Check if localStorage is usable and allows to save an item
// This method checks if localStorage is usable in Safari Private Browsing
// mode, or in any other case where the available quota for localStorage
// is 0 and there wasn't any saved items yet.
function _isLocalStorageUsable() {
    return !checkIfLocalStorageThrows() || localStorage.length > 0;
}

// Config the localStorage backend, using options set in the config.
function _initStorage$2(options) {
    var self = this;
    var dbInfo = {};
    if (options) {
        for (var i in options) {
            dbInfo[i] = options[i];
        }
    }

    dbInfo.keyPrefix = _getKeyPrefix(options, self._defaultConfig);

    if (!_isLocalStorageUsable()) {
        return Promise$1.reject();
    }

    self._dbInfo = dbInfo;
    dbInfo.serializer = localforageSerializer;

    return Promise$1.resolve();
}

// Remove all keys from the datastore, effectively destroying all data in
// the app's key/value store!
function clear$2(callback) {
    var self = this;
    var promise = self.ready().then(function () {
        var keyPrefix = self._dbInfo.keyPrefix;

        for (var i = localStorage.length - 1; i >= 0; i--) {
            var key = localStorage.key(i);

            if (key.indexOf(keyPrefix) === 0) {
                localStorage.removeItem(key);
            }
        }
    });

    executeCallback(promise, callback);
    return promise;
}

// Retrieve an item from the store. Unlike the original async_storage
// library in Gaia, we don't modify return values at all. If a key's value
// is `undefined`, we pass that value to the callback function.
function getItem$2(key, callback) {
    var self = this;

    key = normalizeKey(key);

    var promise = self.ready().then(function () {
        var dbInfo = self._dbInfo;
        var result = localStorage.getItem(dbInfo.keyPrefix + key);

        // If a result was found, parse it from the serialized
        // string into a JS object. If result isn't truthy, the key
        // is likely undefined and we'll pass it straight to the
        // callback.
        if (result) {
            result = dbInfo.serializer.deserialize(result);
        }

        return result;
    });

    executeCallback(promise, callback);
    return promise;
}

// Iterate over all items in the store.
function iterate$2(iterator, callback) {
    var self = this;

    var promise = self.ready().then(function () {
        var dbInfo = self._dbInfo;
        var keyPrefix = dbInfo.keyPrefix;
        var keyPrefixLength = keyPrefix.length;
        var length = localStorage.length;

        // We use a dedicated iterator instead of the `i` variable below
        // so other keys we fetch in localStorage aren't counted in
        // the `iterationNumber` argument passed to the `iterate()`
        // callback.
        //
        // See: github.com/mozilla/localForage/pull/435#discussion_r38061530
        var iterationNumber = 1;

        for (var i = 0; i < length; i++) {
            var key = localStorage.key(i);
            if (key.indexOf(keyPrefix) !== 0) {
                continue;
            }
            var value = localStorage.getItem(key);

            // If a result was found, parse it from the serialized
            // string into a JS object. If result isn't truthy, the
            // key is likely undefined and we'll pass it straight
            // to the iterator.
            if (value) {
                value = dbInfo.serializer.deserialize(value);
            }

            value = iterator(value, key.substring(keyPrefixLength), iterationNumber++);

            if (value !== void 0) {
                return value;
            }
        }
    });

    executeCallback(promise, callback);
    return promise;
}

// Same as localStorage's key() method, except takes a callback.
function key$2(n, callback) {
    var self = this;
    var promise = self.ready().then(function () {
        var dbInfo = self._dbInfo;
        var result;
        try {
            result = localStorage.key(n);
        } catch (error) {
            result = null;
        }

        // Remove the prefix from the key, if a key is found.
        if (result) {
            result = result.substring(dbInfo.keyPrefix.length);
        }

        return result;
    });

    executeCallback(promise, callback);
    return promise;
}

function keys$2(callback) {
    var self = this;
    var promise = self.ready().then(function () {
        var dbInfo = self._dbInfo;
        var length = localStorage.length;
        var keys = [];

        for (var i = 0; i < length; i++) {
            var itemKey = localStorage.key(i);
            if (itemKey.indexOf(dbInfo.keyPrefix) === 0) {
                keys.push(itemKey.substring(dbInfo.keyPrefix.length));
            }
        }

        return keys;
    });

    executeCallback(promise, callback);
    return promise;
}

// Supply the number of keys in the datastore to the callback function.
function length$2(callback) {
    var self = this;
    var promise = self.keys().then(function (keys) {
        return keys.length;
    });

    executeCallback(promise, callback);
    return promise;
}

// Remove an item from the store, nice and simple.
function removeItem$2(key, callback) {
    var self = this;

    key = normalizeKey(key);

    var promise = self.ready().then(function () {
        var dbInfo = self._dbInfo;
        localStorage.removeItem(dbInfo.keyPrefix + key);
    });

    executeCallback(promise, callback);
    return promise;
}

// Set a key's value and run an optional callback once the value is set.
// Unlike Gaia's implementation, the callback function is passed the value,
// in case you want to operate on that value only after you're sure it
// saved, or something like that.
function setItem$2(key, value, callback) {
    var self = this;

    key = normalizeKey(key);

    var promise = self.ready().then(function () {
        // Convert undefined values to null.
        // https://github.com/mozilla/localForage/pull/42
        if (value === undefined) {
            value = null;
        }

        // Save the original value to pass to the callback.
        var originalValue = value;

        return new Promise$1(function (resolve, reject) {
            var dbInfo = self._dbInfo;
            dbInfo.serializer.serialize(value, function (value, error) {
                if (error) {
                    reject(error);
                } else {
                    try {
                        localStorage.setItem(dbInfo.keyPrefix + key, value);
                        resolve(originalValue);
                    } catch (e) {
                        // localStorage capacity exceeded.
                        // TODO: Make this a specific error/event.
                        if (e.name === 'QuotaExceededError' || e.name === 'NS_ERROR_DOM_QUOTA_REACHED') {
                            reject(e);
                        }
                        reject(e);
                    }
                }
            });
        });
    });

    executeCallback(promise, callback);
    return promise;
}

function dropInstance$2(options, callback) {
    callback = getCallback.apply(this, arguments);

    options = typeof options !== 'function' && options || {};
    if (!options.name) {
        var currentConfig = this.config();
        options.name = options.name || currentConfig.name;
        options.storeName = options.storeName || currentConfig.storeName;
    }

    var self = this;
    var promise;
    if (!options.name) {
        promise = Promise$1.reject('Invalid arguments');
    } else {
        promise = new Promise$1(function (resolve) {
            if (!options.storeName) {
                resolve(options.name + '/');
            } else {
                resolve(_getKeyPrefix(options, self._defaultConfig));
            }
        }).then(function (keyPrefix) {
            for (var i = localStorage.length - 1; i >= 0; i--) {
                var key = localStorage.key(i);

                if (key.indexOf(keyPrefix) === 0) {
                    localStorage.removeItem(key);
                }
            }
        });
    }

    executeCallback(promise, callback);
    return promise;
}

var localStorageWrapper = {
    _driver: 'localStorageWrapper',
    _initStorage: _initStorage$2,
    _support: isLocalStorageValid(),
    iterate: iterate$2,
    getItem: getItem$2,
    setItem: setItem$2,
    removeItem: removeItem$2,
    clear: clear$2,
    length: length$2,
    key: key$2,
    keys: keys$2,
    dropInstance: dropInstance$2
};

var sameValue = function sameValue(x, y) {
    return x === y || typeof x === 'number' && typeof y === 'number' && isNaN(x) && isNaN(y);
};

var includes = function includes(array, searchElement) {
    var len = array.length;
    var i = 0;
    while (i < len) {
        if (sameValue(array[i], searchElement)) {
            return true;
        }
        i++;
    }

    return false;
};

var isArray = Array.isArray || function (arg) {
    return Object.prototype.toString.call(arg) === '[object Array]';
};

// Drivers are stored here when `defineDriver()` is called.
// They are shared across all instances of localForage.
var DefinedDrivers = {};

var DriverSupport = {};

var DefaultDrivers = {
    INDEXEDDB: asyncStorage,
    WEBSQL: webSQLStorage,
    LOCALSTORAGE: localStorageWrapper
};

var DefaultDriverOrder = [DefaultDrivers.INDEXEDDB._driver, DefaultDrivers.WEBSQL._driver, DefaultDrivers.LOCALSTORAGE._driver];

var OptionalDriverMethods = ['dropInstance'];

var LibraryMethods = ['clear', 'getItem', 'iterate', 'key', 'keys', 'length', 'removeItem', 'setItem'].concat(OptionalDriverMethods);

var DefaultConfig = {
    description: '',
    driver: DefaultDriverOrder.slice(),
    name: 'localforage',
    // Default DB size is _JUST UNDER_ 5MB, as it's the highest size
    // we can use without a prompt.
    size: 4980736,
    storeName: 'keyvaluepairs',
    version: 1.0
};

function callWhenReady(localForageInstance, libraryMethod) {
    localForageInstance[libraryMethod] = function () {
        var _args = arguments;
        return localForageInstance.ready().then(function () {
            return localForageInstance[libraryMethod].apply(localForageInstance, _args);
        });
    };
}

function extend() {
    for (var i = 1; i < arguments.length; i++) {
        var arg = arguments[i];

        if (arg) {
            for (var _key in arg) {
                if (arg.hasOwnProperty(_key)) {
                    if (isArray(arg[_key])) {
                        arguments[0][_key] = arg[_key].slice();
                    } else {
                        arguments[0][_key] = arg[_key];
                    }
                }
            }
        }
    }

    return arguments[0];
}

var LocalForage = function () {
    function LocalForage(options) {
        _classCallCheck(this, LocalForage);

        for (var driverTypeKey in DefaultDrivers) {
            if (DefaultDrivers.hasOwnProperty(driverTypeKey)) {
                var driver = DefaultDrivers[driverTypeKey];
                var driverName = driver._driver;
                this[driverTypeKey] = driverName;

                if (!DefinedDrivers[driverName]) {
                    // we don't need to wait for the promise,
                    // since the default drivers can be defined
                    // in a blocking manner
                    this.defineDriver(driver);
                }
            }
        }

        this._defaultConfig = extend({}, DefaultConfig);
        this._config = extend({}, this._defaultConfig, options);
        this._driverSet = null;
        this._initDriver = null;
        this._ready = false;
        this._dbInfo = null;

        this._wrapLibraryMethodsWithReady();
        this.setDriver(this._config.driver)["catch"](function () {});
    }

    // Set any config values for localForage; can be called anytime before
    // the first API call (e.g. `getItem`, `setItem`).
    // We loop through options so we don't overwrite existing config
    // values.


    LocalForage.prototype.config = function config(options) {
        // If the options argument is an object, we use it to set values.
        // Otherwise, we return either a specified config value or all
        // config values.
        if ((typeof options === 'undefined' ? 'undefined' : _typeof(options)) === 'object') {
            // If localforage is ready and fully initialized, we can't set
            // any new configuration values. Instead, we return an error.
            if (this._ready) {
                return new Error("Can't call config() after localforage " + 'has been used.');
            }

            for (var i in options) {
                if (i === 'storeName') {
                    options[i] = options[i].replace(/\W/g, '_');
                }

                if (i === 'version' && typeof options[i] !== 'number') {
                    return new Error('Database version must be a number.');
                }

                this._config[i] = options[i];
            }

            // after all config options are set and
            // the driver option is used, try setting it
            if ('driver' in options && options.driver) {
                return this.setDriver(this._config.driver);
            }

            return true;
        } else if (typeof options === 'string') {
            return this._config[options];
        } else {
            return this._config;
        }
    };

    // Used to define a custom driver, shared across all instances of
    // localForage.


    LocalForage.prototype.defineDriver = function defineDriver(driverObject, callback, errorCallback) {
        var promise = new Promise$1(function (resolve, reject) {
            try {
                var driverName = driverObject._driver;
                var complianceError = new Error('Custom driver not compliant; see ' + 'https://mozilla.github.io/localForage/#definedriver');

                // A driver name should be defined and not overlap with the
                // library-defined, default drivers.
                if (!driverObject._driver) {
                    reject(complianceError);
                    return;
                }

                var driverMethods = LibraryMethods.concat('_initStorage');
                for (var i = 0, len = driverMethods.length; i < len; i++) {
                    var driverMethodName = driverMethods[i];

                    // when the property is there,
                    // it should be a method even when optional
                    var isRequired = !includes(OptionalDriverMethods, driverMethodName);
                    if ((isRequired || driverObject[driverMethodName]) && typeof driverObject[driverMethodName] !== 'function') {
                        reject(complianceError);
                        return;
                    }
                }

                var configureMissingMethods = function configureMissingMethods() {
                    var methodNotImplementedFactory = function methodNotImplementedFactory(methodName) {
                        return function () {
                            var error = new Error('Method ' + methodName + ' is not implemented by the current driver');
                            var promise = Promise$1.reject(error);
                            executeCallback(promise, arguments[arguments.length - 1]);
                            return promise;
                        };
                    };

                    for (var _i = 0, _len = OptionalDriverMethods.length; _i < _len; _i++) {
                        var optionalDriverMethod = OptionalDriverMethods[_i];
                        if (!driverObject[optionalDriverMethod]) {
                            driverObject[optionalDriverMethod] = methodNotImplementedFactory(optionalDriverMethod);
                        }
                    }
                };

                configureMissingMethods();

                var setDriverSupport = function setDriverSupport(support) {
                    if (DefinedDrivers[driverName]) {
                        console.info('Redefining LocalForage driver: ' + driverName);
                    }
                    DefinedDrivers[driverName] = driverObject;
                    DriverSupport[driverName] = support;
                    // don't use a then, so that we can define
                    // drivers that have simple _support methods
                    // in a blocking manner
                    resolve();
                };

                if ('_support' in driverObject) {
                    if (driverObject._support && typeof driverObject._support === 'function') {
                        driverObject._support().then(setDriverSupport, reject);
                    } else {
                        setDriverSupport(!!driverObject._support);
                    }
                } else {
                    setDriverSupport(true);
                }
            } catch (e) {
                reject(e);
            }
        });

        executeTwoCallbacks(promise, callback, errorCallback);
        return promise;
    };

    LocalForage.prototype.driver = function driver() {
        return this._driver || null;
    };

    LocalForage.prototype.getDriver = function getDriver(driverName, callback, errorCallback) {
        var getDriverPromise = DefinedDrivers[driverName] ? Promise$1.resolve(DefinedDrivers[driverName]) : Promise$1.reject(new Error('Driver not found.'));

        executeTwoCallbacks(getDriverPromise, callback, errorCallback);
        return getDriverPromise;
    };

    LocalForage.prototype.getSerializer = function getSerializer(callback) {
        var serializerPromise = Promise$1.resolve(localforageSerializer);
        executeTwoCallbacks(serializerPromise, callback);
        return serializerPromise;
    };

    LocalForage.prototype.ready = function ready(callback) {
        var self = this;

        var promise = self._driverSet.then(function () {
            if (self._ready === null) {
                self._ready = self._initDriver();
            }

            return self._ready;
        });

        executeTwoCallbacks(promise, callback, callback);
        return promise;
    };

    LocalForage.prototype.setDriver = function setDriver(drivers, callback, errorCallback) {
        var self = this;

        if (!isArray(drivers)) {
            drivers = [drivers];
        }

        var supportedDrivers = this._getSupportedDrivers(drivers);

        function setDriverToConfig() {
            self._config.driver = self.driver();
        }

        function extendSelfWithDriver(driver) {
            self._extend(driver);
            setDriverToConfig();

            self._ready = self._initStorage(self._config);
            return self._ready;
        }

        function initDriver(supportedDrivers) {
            return function () {
                var currentDriverIndex = 0;

                function driverPromiseLoop() {
                    while (currentDriverIndex < supportedDrivers.length) {
                        var driverName = supportedDrivers[currentDriverIndex];
                        currentDriverIndex++;

                        self._dbInfo = null;
                        self._ready = null;

                        return self.getDriver(driverName).then(extendSelfWithDriver)["catch"](driverPromiseLoop);
                    }

                    setDriverToConfig();
                    var error = new Error('No available storage method found.');
                    self._driverSet = Promise$1.reject(error);
                    return self._driverSet;
                }

                return driverPromiseLoop();
            };
        }

        // There might be a driver initialization in progress
        // so wait for it to finish in order to avoid a possible
        // race condition to set _dbInfo
        var oldDriverSetDone = this._driverSet !== null ? this._driverSet["catch"](function () {
            return Promise$1.resolve();
        }) : Promise$1.resolve();

        this._driverSet = oldDriverSetDone.then(function () {
            var driverName = supportedDrivers[0];
            self._dbInfo = null;
            self._ready = null;

            return self.getDriver(driverName).then(function (driver) {
                self._driver = driver._driver;
                setDriverToConfig();
                self._wrapLibraryMethodsWithReady();
                self._initDriver = initDriver(supportedDrivers);
            });
        })["catch"](function () {
            setDriverToConfig();
            var error = new Error('No available storage method found.');
            self._driverSet = Promise$1.reject(error);
            return self._driverSet;
        });

        executeTwoCallbacks(this._driverSet, callback, errorCallback);
        return this._driverSet;
    };

    LocalForage.prototype.supports = function supports(driverName) {
        return !!DriverSupport[driverName];
    };

    LocalForage.prototype._extend = function _extend(libraryMethodsAndProperties) {
        extend(this, libraryMethodsAndProperties);
    };

    LocalForage.prototype._getSupportedDrivers = function _getSupportedDrivers(drivers) {
        var supportedDrivers = [];
        for (var i = 0, len = drivers.length; i < len; i++) {
            var driverName = drivers[i];
            if (this.supports(driverName)) {
                supportedDrivers.push(driverName);
            }
        }
        return supportedDrivers;
    };

    LocalForage.prototype._wrapLibraryMethodsWithReady = function _wrapLibraryMethodsWithReady() {
        // Add a stub for each driver API method that delays the call to the
        // corresponding driver method until localForage is ready. These stubs
        // will be replaced by the driver methods as soon as the driver is
        // loaded, so there is no performance impact.
        for (var i = 0, len = LibraryMethods.length; i < len; i++) {
            callWhenReady(this, LibraryMethods[i]);
        }
    };

    LocalForage.prototype.createInstance = function createInstance(options) {
        return new LocalForage(options);
    };

    return LocalForage;
}();

// The actual localForage object that we expose as a module or via a
// global. It's extended by pulling in one of our other libraries.


var localforage_js = new LocalForage();

module.exports = localforage_js;

},{"3":3}]},{},[4])(4)
});

}).call(this)}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}]},{},[1])(1)
});
