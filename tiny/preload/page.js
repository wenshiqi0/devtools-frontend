/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// identity function for calling harmony imports with the correct context
/******/ 	__webpack_require__.i = function(value) { return value; };
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 126);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports) {

var core = module.exports = {version: '2.4.0'};
if(typeof __e == 'number')__e = core; // eslint-disable-line no-undef

/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

var store      = __webpack_require__(42)('wks')
  , uid        = __webpack_require__(25)
  , Symbol     = __webpack_require__(5).Symbol
  , USE_SYMBOL = typeof Symbol == 'function';

var $exports = module.exports = function(name){
  return store[name] || (store[name] =
    USE_SYMBOL && Symbol[name] || (USE_SYMBOL ? Symbol : uid)('Symbol.' + name));
};

$exports.store = store;

/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

var anObject       = __webpack_require__(9)
  , IE8_DOM_DEFINE = __webpack_require__(53)
  , toPrimitive    = __webpack_require__(44)
  , dP             = Object.defineProperty;

exports.f = __webpack_require__(3) ? Object.defineProperty : function defineProperty(O, P, Attributes){
  anObject(O);
  P = toPrimitive(P, true);
  anObject(Attributes);
  if(IE8_DOM_DEFINE)try {
    return dP(O, P, Attributes);
  } catch(e){ /* empty */ }
  if('get' in Attributes || 'set' in Attributes)throw TypeError('Accessors not supported!');
  if('value' in Attributes)O[P] = Attributes.value;
  return O;
};

/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

// Thank's IE8 for his funny defineProperty
module.exports = !__webpack_require__(10)(function(){
  return Object.defineProperty({}, 'a', {get: function(){ return 7; }}).a != 7;
});

/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

var global    = __webpack_require__(5)
  , core      = __webpack_require__(0)
  , ctx       = __webpack_require__(14)
  , hide      = __webpack_require__(7)
  , PROTOTYPE = 'prototype';

var $export = function(type, name, source){
  var IS_FORCED = type & $export.F
    , IS_GLOBAL = type & $export.G
    , IS_STATIC = type & $export.S
    , IS_PROTO  = type & $export.P
    , IS_BIND   = type & $export.B
    , IS_WRAP   = type & $export.W
    , exports   = IS_GLOBAL ? core : core[name] || (core[name] = {})
    , expProto  = exports[PROTOTYPE]
    , target    = IS_GLOBAL ? global : IS_STATIC ? global[name] : (global[name] || {})[PROTOTYPE]
    , key, own, out;
  if(IS_GLOBAL)source = name;
  for(key in source){
    // contains in native
    own = !IS_FORCED && target && target[key] !== undefined;
    if(own && key in exports)continue;
    // export native or passed
    out = own ? target[key] : source[key];
    // prevent global pollution for namespaces
    exports[key] = IS_GLOBAL && typeof target[key] != 'function' ? source[key]
    // bind timers to global for call from export context
    : IS_BIND && own ? ctx(out, global)
    // wrap global constructors for prevent change them in library
    : IS_WRAP && target[key] == out ? (function(C){
      var F = function(a, b, c){
        if(this instanceof C){
          switch(arguments.length){
            case 0: return new C;
            case 1: return new C(a);
            case 2: return new C(a, b);
          } return new C(a, b, c);
        } return C.apply(this, arguments);
      };
      F[PROTOTYPE] = C[PROTOTYPE];
      return F;
    // make static versions for prototype methods
    })(out) : IS_PROTO && typeof out == 'function' ? ctx(Function.call, out) : out;
    // export proto methods to core.%CONSTRUCTOR%.methods.%NAME%
    if(IS_PROTO){
      (exports.virtual || (exports.virtual = {}))[key] = out;
      // export proto methods to core.%CONSTRUCTOR%.prototype.%NAME%
      if(type & $export.R && expProto && !expProto[key])hide(expProto, key, out);
    }
  }
};
// type bitmap
$export.F = 1;   // forced
$export.G = 2;   // global
$export.S = 4;   // static
$export.P = 8;   // proto
$export.B = 16;  // bind
$export.W = 32;  // wrap
$export.U = 64;  // safe
$export.R = 128; // real proto method for `library` 
module.exports = $export;

/***/ }),
/* 5 */
/***/ (function(module, exports) {

// https://github.com/zloirock/core-js/issues/86#issuecomment-115759028
var global = module.exports = typeof window != 'undefined' && window.Math == Math
  ? window : typeof self != 'undefined' && self.Math == Math ? self : Function('return this')();
if(typeof __g == 'number')__g = global; // eslint-disable-line no-undef

/***/ }),
/* 6 */
/***/ (function(module, exports) {

var hasOwnProperty = {}.hasOwnProperty;
module.exports = function(it, key){
  return hasOwnProperty.call(it, key);
};

/***/ }),
/* 7 */
/***/ (function(module, exports, __webpack_require__) {

var dP         = __webpack_require__(2)
  , createDesc = __webpack_require__(17);
module.exports = __webpack_require__(3) ? function(object, key, value){
  return dP.f(object, key, createDesc(1, value));
} : function(object, key, value){
  object[key] = value;
  return object;
};

/***/ }),
/* 8 */
/***/ (function(module, exports) {

module.exports = function(it){
  return typeof it === 'object' ? it !== null : typeof it === 'function';
};

/***/ }),
/* 9 */
/***/ (function(module, exports, __webpack_require__) {

var isObject = __webpack_require__(8);
module.exports = function(it){
  if(!isObject(it))throw TypeError(it + ' is not an object!');
  return it;
};

/***/ }),
/* 10 */
/***/ (function(module, exports) {

module.exports = function(exec){
  try {
    return !!exec();
  } catch(e){
    return true;
  }
};

/***/ }),
/* 11 */
/***/ (function(module, exports, __webpack_require__) {

// to indexed object, toObject with fallback for non-array-like ES3 strings
var IObject = __webpack_require__(35)
  , defined = __webpack_require__(19);
module.exports = function(it){
  return IObject(defined(it));
};

/***/ }),
/* 12 */
/***/ (function(module, exports) {

module.exports = require("electron");

/***/ }),
/* 13 */
/***/ (function(module, exports, __webpack_require__) {

// 19.1.2.14 / 15.2.3.14 Object.keys(O)
var $keys       = __webpack_require__(60)
  , enumBugKeys = __webpack_require__(34);

module.exports = Object.keys || function keys(O){
  return $keys(O, enumBugKeys);
};

/***/ }),
/* 14 */
/***/ (function(module, exports, __webpack_require__) {

// optional / simple context binding
var aFunction = __webpack_require__(76);
module.exports = function(fn, that, length){
  aFunction(fn);
  if(that === undefined)return fn;
  switch(length){
    case 1: return function(a){
      return fn.call(that, a);
    };
    case 2: return function(a, b){
      return fn.call(that, a, b);
    };
    case 3: return function(a, b, c){
      return fn.call(that, a, b, c);
    };
  }
  return function(/* ...args */){
    return fn.apply(that, arguments);
  };
};

/***/ }),
/* 15 */
/***/ (function(module, exports) {

module.exports = {};

/***/ }),
/* 16 */
/***/ (function(module, exports, __webpack_require__) {

var META     = __webpack_require__(25)('meta')
  , isObject = __webpack_require__(8)
  , has      = __webpack_require__(6)
  , setDesc  = __webpack_require__(2).f
  , id       = 0;
var isExtensible = Object.isExtensible || function(){
  return true;
};
var FREEZE = !__webpack_require__(10)(function(){
  return isExtensible(Object.preventExtensions({}));
});
var setMeta = function(it){
  setDesc(it, META, {value: {
    i: 'O' + ++id, // object ID
    w: {}          // weak collections IDs
  }});
};
var fastKey = function(it, create){
  // return primitive with prefix
  if(!isObject(it))return typeof it == 'symbol' ? it : (typeof it == 'string' ? 'S' : 'P') + it;
  if(!has(it, META)){
    // can't set metadata to uncaught frozen object
    if(!isExtensible(it))return 'F';
    // not necessary to add metadata
    if(!create)return 'E';
    // add missing metadata
    setMeta(it);
  // return object ID
  } return it[META].i;
};
var getWeak = function(it, create){
  if(!has(it, META)){
    // can't set metadata to uncaught frozen object
    if(!isExtensible(it))return true;
    // not necessary to add metadata
    if(!create)return false;
    // add missing metadata
    setMeta(it);
  // return hash weak collections IDs
  } return it[META].w;
};
// add metadata on freeze-family methods calling
var onFreeze = function(it){
  if(FREEZE && meta.NEED && isExtensible(it) && !has(it, META))setMeta(it);
  return it;
};
var meta = module.exports = {
  KEY:      META,
  NEED:     false,
  fastKey:  fastKey,
  getWeak:  getWeak,
  onFreeze: onFreeze
};

/***/ }),
/* 17 */
/***/ (function(module, exports) {

module.exports = function(bitmap, value){
  return {
    enumerable  : !(bitmap & 1),
    configurable: !(bitmap & 2),
    writable    : !(bitmap & 4),
    value       : value
  };
};

/***/ }),
/* 18 */
/***/ (function(module, exports, __webpack_require__) {

// 7.1.13 ToObject(argument)
var defined = __webpack_require__(19);
module.exports = function(it){
  return Object(defined(it));
};

/***/ }),
/* 19 */
/***/ (function(module, exports) {

// 7.2.1 RequireObjectCoercible(argument)
module.exports = function(it){
  if(it == undefined)throw TypeError("Can't call method on  " + it);
  return it;
};

/***/ }),
/* 20 */
/***/ (function(module, exports, __webpack_require__) {

var ctx         = __webpack_require__(14)
  , call        = __webpack_require__(56)
  , isArrayIter = __webpack_require__(54)
  , anObject    = __webpack_require__(9)
  , toLength    = __webpack_require__(24)
  , getIterFn   = __webpack_require__(61)
  , BREAK       = {}
  , RETURN      = {};
var exports = module.exports = function(iterable, entries, fn, that, ITERATOR){
  var iterFn = ITERATOR ? function(){ return iterable; } : getIterFn(iterable)
    , f      = ctx(fn, that, entries ? 2 : 1)
    , index  = 0
    , length, step, iterator, result;
  if(typeof iterFn != 'function')throw TypeError(iterable + ' is not iterable!');
  // fast case for arrays with default iterator
  if(isArrayIter(iterFn))for(length = toLength(iterable.length); length > index; index++){
    result = entries ? f(anObject(step = iterable[index])[0], step[1]) : f(iterable[index]);
    if(result === BREAK || result === RETURN)return result;
  } else for(iterator = iterFn.call(iterable); !(step = iterator.next()).done; ){
    result = call(iterator, f, step.value, entries);
    if(result === BREAK || result === RETURN)return result;
  }
};
exports.BREAK  = BREAK;
exports.RETURN = RETURN;

/***/ }),
/* 21 */
/***/ (function(module, exports, __webpack_require__) {

// 19.1.2.2 / 15.2.3.5 Object.create(O [, Properties])
var anObject    = __webpack_require__(9)
  , dPs         = __webpack_require__(89)
  , enumBugKeys = __webpack_require__(34)
  , IE_PROTO    = __webpack_require__(41)('IE_PROTO')
  , Empty       = function(){ /* empty */ }
  , PROTOTYPE   = 'prototype';

// Create object with fake `null` prototype: use iframe Object with cleared prototype
var createDict = function(){
  // Thrash, waste and sodomy: IE GC bug
  var iframe = __webpack_require__(52)('iframe')
    , i      = enumBugKeys.length
    , lt     = '<'
    , gt     = '>'
    , iframeDocument;
  iframe.style.display = 'none';
  __webpack_require__(85).appendChild(iframe);
  iframe.src = 'javascript:'; // eslint-disable-line no-script-url
  // createDict = iframe.contentWindow.Object;
  // html.removeChild(iframe);
  iframeDocument = iframe.contentWindow.document;
  iframeDocument.open();
  iframeDocument.write(lt + 'script' + gt + 'document.F=Object' + lt + '/script' + gt);
  iframeDocument.close();
  createDict = iframeDocument.F;
  while(i--)delete createDict[PROTOTYPE][enumBugKeys[i]];
  return createDict();
};

module.exports = Object.create || function create(O, Properties){
  var result;
  if(O !== null){
    Empty[PROTOTYPE] = anObject(O);
    result = new Empty;
    Empty[PROTOTYPE] = null;
    // add "__proto__" for Object.getPrototypeOf polyfill
    result[IE_PROTO] = O;
  } else result = createDict();
  return Properties === undefined ? result : dPs(result, Properties);
};


/***/ }),
/* 22 */
/***/ (function(module, exports) {

exports.f = {}.propertyIsEnumerable;

/***/ }),
/* 23 */
/***/ (function(module, exports, __webpack_require__) {

var def = __webpack_require__(2).f
  , has = __webpack_require__(6)
  , TAG = __webpack_require__(1)('toStringTag');

module.exports = function(it, tag, stat){
  if(it && !has(it = stat ? it : it.prototype, TAG))def(it, TAG, {configurable: true, value: tag});
};

/***/ }),
/* 24 */
/***/ (function(module, exports, __webpack_require__) {

// 7.1.15 ToLength
var toInteger = __webpack_require__(43)
  , min       = Math.min;
module.exports = function(it){
  return it > 0 ? min(toInteger(it), 0x1fffffffffffff) : 0; // pow(2, 53) - 1 == 9007199254740991
};

/***/ }),
/* 25 */
/***/ (function(module, exports) {

var id = 0
  , px = Math.random();
module.exports = function(key){
  return 'Symbol('.concat(key === undefined ? '' : key, ')_', (++id + px).toString(36));
};

/***/ }),
/* 26 */
/***/ (function(module, exports) {



/***/ }),
/* 27 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var $at  = __webpack_require__(95)(true);

// 21.1.3.27 String.prototype[@@iterator]()
__webpack_require__(36)(String, 'String', function(iterated){
  this._t = String(iterated); // target
  this._i = 0;                // next index
// 21.1.5.2.1 %StringIteratorPrototype%.next()
}, function(){
  var O     = this._t
    , index = this._i
    , point;
  if(index >= O.length)return {value: undefined, done: true};
  point = $at(O, index);
  this._i += point.length;
  return {value: point, done: false};
});

/***/ }),
/* 28 */
/***/ (function(module, exports, __webpack_require__) {

__webpack_require__(98);
var global        = __webpack_require__(5)
  , hide          = __webpack_require__(7)
  , Iterators     = __webpack_require__(15)
  , TO_STRING_TAG = __webpack_require__(1)('toStringTag');

for(var collections = ['NodeList', 'DOMTokenList', 'MediaList', 'StyleSheetList', 'CSSRuleList'], i = 0; i < 5; i++){
  var NAME       = collections[i]
    , Collection = global[NAME]
    , proto      = Collection && Collection.prototype;
  if(proto && !proto[TO_STRING_TAG])hide(proto, TO_STRING_TAG, NAME);
  Iterators[NAME] = Iterators.Array;
}

/***/ }),
/* 29 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = { "default": __webpack_require__(71), __esModule: true };

/***/ }),
/* 30 */
/***/ (function(module, exports) {

module.exports = function(it, Constructor, name, forbiddenField){
  if(!(it instanceof Constructor) || (forbiddenField !== undefined && forbiddenField in it)){
    throw TypeError(name + ': incorrect invocation!');
  } return it;
};

/***/ }),
/* 31 */
/***/ (function(module, exports, __webpack_require__) {

// 0 -> Array#forEach
// 1 -> Array#map
// 2 -> Array#filter
// 3 -> Array#some
// 4 -> Array#every
// 5 -> Array#find
// 6 -> Array#findIndex
var ctx      = __webpack_require__(14)
  , IObject  = __webpack_require__(35)
  , toObject = __webpack_require__(18)
  , toLength = __webpack_require__(24)
  , asc      = __webpack_require__(81);
module.exports = function(TYPE, $create){
  var IS_MAP        = TYPE == 1
    , IS_FILTER     = TYPE == 2
    , IS_SOME       = TYPE == 3
    , IS_EVERY      = TYPE == 4
    , IS_FIND_INDEX = TYPE == 6
    , NO_HOLES      = TYPE == 5 || IS_FIND_INDEX
    , create        = $create || asc;
  return function($this, callbackfn, that){
    var O      = toObject($this)
      , self   = IObject(O)
      , f      = ctx(callbackfn, that, 3)
      , length = toLength(self.length)
      , index  = 0
      , result = IS_MAP ? create($this, length) : IS_FILTER ? create($this, 0) : undefined
      , val, res;
    for(;length > index; index++)if(NO_HOLES || index in self){
      val = self[index];
      res = f(val, index, O);
      if(TYPE){
        if(IS_MAP)result[index] = res;            // map
        else if(res)switch(TYPE){
          case 3: return true;                    // some
          case 5: return val;                     // find
          case 6: return index;                   // findIndex
          case 2: result.push(val);               // filter
        } else if(IS_EVERY)return false;          // every
      }
    }
    return IS_FIND_INDEX ? -1 : IS_SOME || IS_EVERY ? IS_EVERY : result;
  };
};

/***/ }),
/* 32 */
/***/ (function(module, exports) {

var toString = {}.toString;

module.exports = function(it){
  return toString.call(it).slice(8, -1);
};

/***/ }),
/* 33 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var global         = __webpack_require__(5)
  , $export        = __webpack_require__(4)
  , meta           = __webpack_require__(16)
  , fails          = __webpack_require__(10)
  , hide           = __webpack_require__(7)
  , redefineAll    = __webpack_require__(39)
  , forOf          = __webpack_require__(20)
  , anInstance     = __webpack_require__(30)
  , isObject       = __webpack_require__(8)
  , setToStringTag = __webpack_require__(23)
  , dP             = __webpack_require__(2).f
  , each           = __webpack_require__(31)(0)
  , DESCRIPTORS    = __webpack_require__(3);

module.exports = function(NAME, wrapper, methods, common, IS_MAP, IS_WEAK){
  var Base  = global[NAME]
    , C     = Base
    , ADDER = IS_MAP ? 'set' : 'add'
    , proto = C && C.prototype
    , O     = {};
  if(!DESCRIPTORS || typeof C != 'function' || !(IS_WEAK || proto.forEach && !fails(function(){
    new C().entries().next();
  }))){
    // create collection constructor
    C = common.getConstructor(wrapper, NAME, IS_MAP, ADDER);
    redefineAll(C.prototype, methods);
    meta.NEED = true;
  } else {
    C = wrapper(function(target, iterable){
      anInstance(target, C, NAME, '_c');
      target._c = new Base;
      if(iterable != undefined)forOf(iterable, IS_MAP, target[ADDER], target);
    });
    each('add,clear,delete,forEach,get,has,set,keys,values,entries,toJSON'.split(','),function(KEY){
      var IS_ADDER = KEY == 'add' || KEY == 'set';
      if(KEY in proto && !(IS_WEAK && KEY == 'clear'))hide(C.prototype, KEY, function(a, b){
        anInstance(this, C, KEY);
        if(!IS_ADDER && IS_WEAK && !isObject(a))return KEY == 'get' ? undefined : false;
        var result = this._c[KEY](a === 0 ? 0 : a, b);
        return IS_ADDER ? this : result;
      });
    });
    if('size' in proto)dP(C.prototype, 'size', {
      get: function(){
        return this._c.size;
      }
    });
  }

  setToStringTag(C, NAME);

  O[NAME] = C;
  $export($export.G + $export.W + $export.F, O);

  if(!IS_WEAK)common.setStrong(C, NAME, IS_MAP);

  return C;
};

/***/ }),
/* 34 */
/***/ (function(module, exports) {

// IE 8- don't enum bug keys
module.exports = (
  'constructor,hasOwnProperty,isPrototypeOf,propertyIsEnumerable,toLocaleString,toString,valueOf'
).split(',');

/***/ }),
/* 35 */
/***/ (function(module, exports, __webpack_require__) {

// fallback for non-array-like ES3 and non-enumerable old V8 strings
var cof = __webpack_require__(32);
module.exports = Object('z').propertyIsEnumerable(0) ? Object : function(it){
  return cof(it) == 'String' ? it.split('') : Object(it);
};

/***/ }),
/* 36 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var LIBRARY        = __webpack_require__(37)
  , $export        = __webpack_require__(4)
  , redefine       = __webpack_require__(40)
  , hide           = __webpack_require__(7)
  , has            = __webpack_require__(6)
  , Iterators      = __webpack_require__(15)
  , $iterCreate    = __webpack_require__(86)
  , setToStringTag = __webpack_require__(23)
  , getPrototypeOf = __webpack_require__(92)
  , ITERATOR       = __webpack_require__(1)('iterator')
  , BUGGY          = !([].keys && 'next' in [].keys()) // Safari has buggy iterators w/o `next`
  , FF_ITERATOR    = '@@iterator'
  , KEYS           = 'keys'
  , VALUES         = 'values';

var returnThis = function(){ return this; };

module.exports = function(Base, NAME, Constructor, next, DEFAULT, IS_SET, FORCED){
  $iterCreate(Constructor, NAME, next);
  var getMethod = function(kind){
    if(!BUGGY && kind in proto)return proto[kind];
    switch(kind){
      case KEYS: return function keys(){ return new Constructor(this, kind); };
      case VALUES: return function values(){ return new Constructor(this, kind); };
    } return function entries(){ return new Constructor(this, kind); };
  };
  var TAG        = NAME + ' Iterator'
    , DEF_VALUES = DEFAULT == VALUES
    , VALUES_BUG = false
    , proto      = Base.prototype
    , $native    = proto[ITERATOR] || proto[FF_ITERATOR] || DEFAULT && proto[DEFAULT]
    , $default   = $native || getMethod(DEFAULT)
    , $entries   = DEFAULT ? !DEF_VALUES ? $default : getMethod('entries') : undefined
    , $anyNative = NAME == 'Array' ? proto.entries || $native : $native
    , methods, key, IteratorPrototype;
  // Fix native
  if($anyNative){
    IteratorPrototype = getPrototypeOf($anyNative.call(new Base));
    if(IteratorPrototype !== Object.prototype){
      // Set @@toStringTag to native iterators
      setToStringTag(IteratorPrototype, TAG, true);
      // fix for some old engines
      if(!LIBRARY && !has(IteratorPrototype, ITERATOR))hide(IteratorPrototype, ITERATOR, returnThis);
    }
  }
  // fix Array#{values, @@iterator}.name in V8 / FF
  if(DEF_VALUES && $native && $native.name !== VALUES){
    VALUES_BUG = true;
    $default = function values(){ return $native.call(this); };
  }
  // Define iterator
  if((!LIBRARY || FORCED) && (BUGGY || VALUES_BUG || !proto[ITERATOR])){
    hide(proto, ITERATOR, $default);
  }
  // Plug for library
  Iterators[NAME] = $default;
  Iterators[TAG]  = returnThis;
  if(DEFAULT){
    methods = {
      values:  DEF_VALUES ? $default : getMethod(VALUES),
      keys:    IS_SET     ? $default : getMethod(KEYS),
      entries: $entries
    };
    if(FORCED)for(key in methods){
      if(!(key in proto))redefine(proto, key, methods[key]);
    } else $export($export.P + $export.F * (BUGGY || VALUES_BUG), NAME, methods);
  }
  return methods;
};

/***/ }),
/* 37 */
/***/ (function(module, exports) {

module.exports = true;

/***/ }),
/* 38 */
/***/ (function(module, exports) {

exports.f = Object.getOwnPropertySymbols;

/***/ }),
/* 39 */
/***/ (function(module, exports, __webpack_require__) {

var hide = __webpack_require__(7);
module.exports = function(target, src, safe){
  for(var key in src){
    if(safe && target[key])target[key] = src[key];
    else hide(target, key, src[key]);
  } return target;
};

/***/ }),
/* 40 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__(7);

/***/ }),
/* 41 */
/***/ (function(module, exports, __webpack_require__) {

var shared = __webpack_require__(42)('keys')
  , uid    = __webpack_require__(25);
module.exports = function(key){
  return shared[key] || (shared[key] = uid(key));
};

/***/ }),
/* 42 */
/***/ (function(module, exports, __webpack_require__) {

var global = __webpack_require__(5)
  , SHARED = '__core-js_shared__'
  , store  = global[SHARED] || (global[SHARED] = {});
module.exports = function(key){
  return store[key] || (store[key] = {});
};

/***/ }),
/* 43 */
/***/ (function(module, exports) {

// 7.1.4 ToInteger
var ceil  = Math.ceil
  , floor = Math.floor;
module.exports = function(it){
  return isNaN(it = +it) ? 0 : (it > 0 ? floor : ceil)(it);
};

/***/ }),
/* 44 */
/***/ (function(module, exports, __webpack_require__) {

// 7.1.1 ToPrimitive(input [, PreferredType])
var isObject = __webpack_require__(8);
// instead of the ES6 spec version, we didn't implement @@toPrimitive case
// and the second argument - flag - preferred type is a string
module.exports = function(it, S){
  if(!isObject(it))return it;
  var fn, val;
  if(S && typeof (fn = it.toString) == 'function' && !isObject(val = fn.call(it)))return val;
  if(typeof (fn = it.valueOf) == 'function' && !isObject(val = fn.call(it)))return val;
  if(!S && typeof (fn = it.toString) == 'function' && !isObject(val = fn.call(it)))return val;
  throw TypeError("Can't convert object to primitive value");
};

/***/ }),
/* 45 */
/***/ (function(module, exports, __webpack_require__) {

var global         = __webpack_require__(5)
  , core           = __webpack_require__(0)
  , LIBRARY        = __webpack_require__(37)
  , wksExt         = __webpack_require__(46)
  , defineProperty = __webpack_require__(2).f;
module.exports = function(name){
  var $Symbol = core.Symbol || (core.Symbol = LIBRARY ? {} : global.Symbol || {});
  if(name.charAt(0) != '_' && !(name in $Symbol))defineProperty($Symbol, name, {value: wksExt.f(name)});
};

/***/ }),
/* 46 */
/***/ (function(module, exports, __webpack_require__) {

exports.f = __webpack_require__(1);

/***/ }),
/* 47 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = { "default": __webpack_require__(68), __esModule: true };

/***/ }),
/* 48 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


exports.__esModule = true;

var _iterator = __webpack_require__(118);

var _iterator2 = _interopRequireDefault(_iterator);

var _symbol = __webpack_require__(117);

var _symbol2 = _interopRequireDefault(_symbol);

var _typeof = typeof _symbol2.default === "function" && typeof _iterator2.default === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof _symbol2.default === "function" && obj.constructor === _symbol2.default && obj !== _symbol2.default.prototype ? "symbol" : typeof obj; };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = typeof _symbol2.default === "function" && _typeof(_iterator2.default) === "symbol" ? function (obj) {
  return typeof obj === "undefined" ? "undefined" : _typeof(obj);
} : function (obj) {
  return obj && typeof _symbol2.default === "function" && obj.constructor === _symbol2.default && obj !== _symbol2.default.prototype ? "symbol" : typeof obj === "undefined" ? "undefined" : _typeof(obj);
};

/***/ }),
/* 49 */
/***/ (function(module, exports, __webpack_require__) {

// getting tag from 19.1.3.6 Object.prototype.toString()
var cof = __webpack_require__(32)
  , TAG = __webpack_require__(1)('toStringTag')
  // ES3 wrong here
  , ARG = cof(function(){ return arguments; }()) == 'Arguments';

// fallback for IE11 Script Access Denied error
var tryGet = function(it, key){
  try {
    return it[key];
  } catch(e){ /* empty */ }
};

module.exports = function(it){
  var O, T, B;
  return it === undefined ? 'Undefined' : it === null ? 'Null'
    // @@toStringTag case
    : typeof (T = tryGet(O = Object(it), TAG)) == 'string' ? T
    // builtinTag case
    : ARG ? cof(O)
    // ES3 arguments fallback
    : (B = cof(O)) == 'Object' && typeof O.callee == 'function' ? 'Arguments' : B;
};

/***/ }),
/* 50 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var dP          = __webpack_require__(2).f
  , create      = __webpack_require__(21)
  , redefineAll = __webpack_require__(39)
  , ctx         = __webpack_require__(14)
  , anInstance  = __webpack_require__(30)
  , defined     = __webpack_require__(19)
  , forOf       = __webpack_require__(20)
  , $iterDefine = __webpack_require__(36)
  , step        = __webpack_require__(57)
  , setSpecies  = __webpack_require__(94)
  , DESCRIPTORS = __webpack_require__(3)
  , fastKey     = __webpack_require__(16).fastKey
  , SIZE        = DESCRIPTORS ? '_s' : 'size';

var getEntry = function(that, key){
  // fast case
  var index = fastKey(key), entry;
  if(index !== 'F')return that._i[index];
  // frozen object case
  for(entry = that._f; entry; entry = entry.n){
    if(entry.k == key)return entry;
  }
};

module.exports = {
  getConstructor: function(wrapper, NAME, IS_MAP, ADDER){
    var C = wrapper(function(that, iterable){
      anInstance(that, C, NAME, '_i');
      that._i = create(null); // index
      that._f = undefined;    // first entry
      that._l = undefined;    // last entry
      that[SIZE] = 0;         // size
      if(iterable != undefined)forOf(iterable, IS_MAP, that[ADDER], that);
    });
    redefineAll(C.prototype, {
      // 23.1.3.1 Map.prototype.clear()
      // 23.2.3.2 Set.prototype.clear()
      clear: function clear(){
        for(var that = this, data = that._i, entry = that._f; entry; entry = entry.n){
          entry.r = true;
          if(entry.p)entry.p = entry.p.n = undefined;
          delete data[entry.i];
        }
        that._f = that._l = undefined;
        that[SIZE] = 0;
      },
      // 23.1.3.3 Map.prototype.delete(key)
      // 23.2.3.4 Set.prototype.delete(value)
      'delete': function(key){
        var that  = this
          , entry = getEntry(that, key);
        if(entry){
          var next = entry.n
            , prev = entry.p;
          delete that._i[entry.i];
          entry.r = true;
          if(prev)prev.n = next;
          if(next)next.p = prev;
          if(that._f == entry)that._f = next;
          if(that._l == entry)that._l = prev;
          that[SIZE]--;
        } return !!entry;
      },
      // 23.2.3.6 Set.prototype.forEach(callbackfn, thisArg = undefined)
      // 23.1.3.5 Map.prototype.forEach(callbackfn, thisArg = undefined)
      forEach: function forEach(callbackfn /*, that = undefined */){
        anInstance(this, C, 'forEach');
        var f = ctx(callbackfn, arguments.length > 1 ? arguments[1] : undefined, 3)
          , entry;
        while(entry = entry ? entry.n : this._f){
          f(entry.v, entry.k, this);
          // revert to the last existing entry
          while(entry && entry.r)entry = entry.p;
        }
      },
      // 23.1.3.7 Map.prototype.has(key)
      // 23.2.3.7 Set.prototype.has(value)
      has: function has(key){
        return !!getEntry(this, key);
      }
    });
    if(DESCRIPTORS)dP(C.prototype, 'size', {
      get: function(){
        return defined(this[SIZE]);
      }
    });
    return C;
  },
  def: function(that, key, value){
    var entry = getEntry(that, key)
      , prev, index;
    // change existing entry
    if(entry){
      entry.v = value;
    // create new entry
    } else {
      that._l = entry = {
        i: index = fastKey(key, true), // <- index
        k: key,                        // <- key
        v: value,                      // <- value
        p: prev = that._l,             // <- previous entry
        n: undefined,                  // <- next entry
        r: false                       // <- removed
      };
      if(!that._f)that._f = entry;
      if(prev)prev.n = entry;
      that[SIZE]++;
      // add to index
      if(index !== 'F')that._i[index] = entry;
    } return that;
  },
  getEntry: getEntry,
  setStrong: function(C, NAME, IS_MAP){
    // add .keys, .values, .entries, [@@iterator]
    // 23.1.3.4, 23.1.3.8, 23.1.3.11, 23.1.3.12, 23.2.3.5, 23.2.3.8, 23.2.3.10, 23.2.3.11
    $iterDefine(C, NAME, function(iterated, kind){
      this._t = iterated;  // target
      this._k = kind;      // kind
      this._l = undefined; // previous
    }, function(){
      var that  = this
        , kind  = that._k
        , entry = that._l;
      // revert to the last existing entry
      while(entry && entry.r)entry = entry.p;
      // get next entry
      if(!that._t || !(that._l = entry = entry ? entry.n : that._t._f)){
        // or finish the iteration
        that._t = undefined;
        return step(1);
      }
      // return step by kind
      if(kind == 'keys'  )return step(0, entry.k);
      if(kind == 'values')return step(0, entry.v);
      return step(0, [entry.k, entry.v]);
    }, IS_MAP ? 'entries' : 'values' , !IS_MAP, true);

    // add [@@species], 23.1.2.2, 23.2.2.2
    setSpecies(NAME);
  }
};

/***/ }),
/* 51 */
/***/ (function(module, exports, __webpack_require__) {

// https://github.com/DavidBruant/Map-Set.prototype.toJSON
var classof = __webpack_require__(49)
  , from    = __webpack_require__(78);
module.exports = function(NAME){
  return function toJSON(){
    if(classof(this) != NAME)throw TypeError(NAME + "#toJSON isn't generic");
    return from(this);
  };
};

/***/ }),
/* 52 */
/***/ (function(module, exports, __webpack_require__) {

var isObject = __webpack_require__(8)
  , document = __webpack_require__(5).document
  // in old IE typeof document.createElement is 'object'
  , is = isObject(document) && isObject(document.createElement);
module.exports = function(it){
  return is ? document.createElement(it) : {};
};

/***/ }),
/* 53 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = !__webpack_require__(3) && !__webpack_require__(10)(function(){
  return Object.defineProperty(__webpack_require__(52)('div'), 'a', {get: function(){ return 7; }}).a != 7;
});

/***/ }),
/* 54 */
/***/ (function(module, exports, __webpack_require__) {

// check on default Array iterator
var Iterators  = __webpack_require__(15)
  , ITERATOR   = __webpack_require__(1)('iterator')
  , ArrayProto = Array.prototype;

module.exports = function(it){
  return it !== undefined && (Iterators.Array === it || ArrayProto[ITERATOR] === it);
};

/***/ }),
/* 55 */
/***/ (function(module, exports, __webpack_require__) {

// 7.2.2 IsArray(argument)
var cof = __webpack_require__(32);
module.exports = Array.isArray || function isArray(arg){
  return cof(arg) == 'Array';
};

/***/ }),
/* 56 */
/***/ (function(module, exports, __webpack_require__) {

// call something on iterator step with safe closing on error
var anObject = __webpack_require__(9);
module.exports = function(iterator, fn, value, entries){
  try {
    return entries ? fn(anObject(value)[0], value[1]) : fn(value);
  // 7.4.6 IteratorClose(iterator, completion)
  } catch(e){
    var ret = iterator['return'];
    if(ret !== undefined)anObject(ret.call(iterator));
    throw e;
  }
};

/***/ }),
/* 57 */
/***/ (function(module, exports) {

module.exports = function(done, value){
  return {value: value, done: !!done};
};

/***/ }),
/* 58 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

// 19.1.2.1 Object.assign(target, source, ...)
var getKeys  = __webpack_require__(13)
  , gOPS     = __webpack_require__(38)
  , pIE      = __webpack_require__(22)
  , toObject = __webpack_require__(18)
  , IObject  = __webpack_require__(35)
  , $assign  = Object.assign;

// should work with symbols and should have deterministic property order (V8 bug)
module.exports = !$assign || __webpack_require__(10)(function(){
  var A = {}
    , B = {}
    , S = Symbol()
    , K = 'abcdefghijklmnopqrst';
  A[S] = 7;
  K.split('').forEach(function(k){ B[k] = k; });
  return $assign({}, A)[S] != 7 || Object.keys($assign({}, B)).join('') != K;
}) ? function assign(target, source){ // eslint-disable-line no-unused-vars
  var T     = toObject(target)
    , aLen  = arguments.length
    , index = 1
    , getSymbols = gOPS.f
    , isEnum     = pIE.f;
  while(aLen > index){
    var S      = IObject(arguments[index++])
      , keys   = getSymbols ? getKeys(S).concat(getSymbols(S)) : getKeys(S)
      , length = keys.length
      , j      = 0
      , key;
    while(length > j)if(isEnum.call(S, key = keys[j++]))T[key] = S[key];
  } return T;
} : $assign;

/***/ }),
/* 59 */
/***/ (function(module, exports, __webpack_require__) {

// 19.1.2.7 / 15.2.3.4 Object.getOwnPropertyNames(O)
var $keys      = __webpack_require__(60)
  , hiddenKeys = __webpack_require__(34).concat('length', 'prototype');

exports.f = Object.getOwnPropertyNames || function getOwnPropertyNames(O){
  return $keys(O, hiddenKeys);
};

/***/ }),
/* 60 */
/***/ (function(module, exports, __webpack_require__) {

var has          = __webpack_require__(6)
  , toIObject    = __webpack_require__(11)
  , arrayIndexOf = __webpack_require__(79)(false)
  , IE_PROTO     = __webpack_require__(41)('IE_PROTO');

module.exports = function(object, names){
  var O      = toIObject(object)
    , i      = 0
    , result = []
    , key;
  for(key in O)if(key != IE_PROTO)has(O, key) && result.push(key);
  // Don't enum bug & hidden keys
  while(names.length > i)if(has(O, key = names[i++])){
    ~arrayIndexOf(result, key) || result.push(key);
  }
  return result;
};

/***/ }),
/* 61 */
/***/ (function(module, exports, __webpack_require__) {

var classof   = __webpack_require__(49)
  , ITERATOR  = __webpack_require__(1)('iterator')
  , Iterators = __webpack_require__(15);
module.exports = __webpack_require__(0).getIteratorMethod = function(it){
  if(it != undefined)return it[ITERATOR]
    || it['@@iterator']
    || Iterators[classof(it)];
};

/***/ }),
/* 62 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = { "default": __webpack_require__(75), __esModule: true };

/***/ }),
/* 63 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


exports.__esModule = true;

var _from = __webpack_require__(112);

var _from2 = _interopRequireDefault(_from);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = function (arr) {
  if (Array.isArray(arr)) {
    for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) {
      arr2[i] = arr[i];
    }

    return arr2;
  } else {
    return (0, _from2.default)(arr);
  }
};

/***/ }),
/* 64 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _keys = __webpack_require__(29);

var _keys2 = _interopRequireDefault(_keys);

var _electron = __webpack_require__(12);

var _overlay = __webpack_require__(125);

var _overlay2 = _interopRequireDefault(_overlay);

var _installReactHook = __webpack_require__(127);

var _installReactHook2 = _interopRequireDefault(_installReactHook);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Now we only support one overlay for one dom selected.
(0, _installReactHook2.default)();
var disposes = [];
window.ipc = _electron.ipcRenderer;
var container = void 0;
// We can not get styales form the context of react component.
// So we make it by ourselves.
var globalClassStyleMap = {};
var globalElementStyleMap = {};
var reactElementIds = void 0;
var realPropsTree = void 0;
var componentElementMapping = void 0;
var getNativeFromReactElement = void 0;
// React devtools gloabl hook.
// The hook is setupped before the <head> dom ready,
// so it can not be install here.
// See installReactHook.js.
var globalHook = window.__REACT_DEVTOOLS_GLOBAL_HOOK__;
// React dev tool
var attachRenderer = __webpack_require__(121);
function setupBackend(hook) {
    console.log('devicePixelRatio: ', window.devicePixelRatio);
    for (var rid in hook._renderers) {
        var ids = {};
        hook.helpers[rid] = attachRenderer(hook, rid, hook._renderers[rid]);
        var mapping = hook.helpers[rid].mapCurrentComponentToElement();
        componentElementMapping = mapping;
        var tree = hook.helpers[rid].rebuildTinyTree(ids);
        var root = {
            attributes: [],
            backendNodeId: 1,
            nodeName: 'document'.toUpperCase(),
            localName: 'document'.toLowerCase(),
            nodeType: 9,
            nodeId: 0,
            nodeValue: '',
            children: tree,
            childNodeCount: tree.length
        };
        reactElementIds = ids;
        realPropsTree = root;
        getNativeFromReactElement = hook.helpers[rid].getNativeFromReactElement;
        // hook.helpers[rid].buildStylesContext(globalClassStyleMap);
        // hook.helpers[rid].buildElementStyles(globalElementStyleMap, reactElementIds);
        sendMessage({
            method: 'documentUpdated',
            payload: {
                root: root
            }
        });
    }
}
var loadCheckInterval = setInterval(function () {
    checkTinyAndReact();
}, 500);
// console.log('tiny-devtools is start to work');
var checkTinyAndReact = function checkTinyAndReact() {
    // check if react is rendered.
    if (window.$page && window.__REACT_DEVTOOLS_GLOBAL_HOOK__ && window.__REACT_DEVTOOLS_GLOBAL_HOOK__._renderers && (0, _keys2.default)(window.__REACT_DEVTOOLS_GLOBAL_HOOK__._renderers).length > 0) {
        clearInterval(loadCheckInterval);
        try {
            setupBackend(globalHook);
            loadCheckInterval = null;
        } catch (e) {
            // In this time actually react is not ready, so we catch the error and restart the interval.
            console.log(e);
            loadCheckInterval = setInterval(function () {
                checkTinyAndReact();
            }, 500);
        }
    }
};
var sendMessage = function sendMessage(_ref) {
    var method = _ref.method,
        payload = _ref.payload;

    _electron.ipcRenderer.sendToHost('devtools', {
        method: method, payload: payload
    });
};
function getStyle(className_) {
    var ret = [];
    var styleSheets = window.document.styleSheets;
    var styleSheetsLength = styleSheets.length;
    for (var i = 0; i < styleSheetsLength; i++) {
        var classes = styleSheets[i].rules || styleSheets[i].cssRules;
        if (!classes) continue;
        var classesLength = classes.length;
        for (var x = 0; x < classesLength; x++) {
            if (classes[x].selectorText == className_) {
                console.log(classes[x]);
                var j = 0;
                var styleKey = void 0;
                while (styleKey = classes[x].style[j++]) {
                    var newProperty = {};
                    newProperty[styleKey] = classes[x].style[styleKey];
                    ret.push({
                        name: styleKey,
                        value: classes[x].style[styleKey]
                    });
                }
                return {
                    shorthandEntries: [],
                    cssProperties: ret
                };
            }
        }
    }
}
function createMathedStyle(nodeId, element) {
    var payload = [];
    var classList = element.classList;
    for (var i = 0; i < classList.length; i++) {
        var prop = getStyle('.' + classList[i]);
        if (prop) {
            payload.push({
                matchingSelectors: [0],
                rule: {
                    media: [],
                    origin: 'regular',
                    selectorList: {
                        text: '.' + classList[i],
                        selectors: [{ text: '.' + classList[i] }]
                    },
                    style: prop
                }
            });
        }
    }
    return payload;
}
function createInlineStyle(nodeId, realDom) {
    var style = realDom.style;
    var cssProperties = [];
    style.cssText.split(';').forEach(function (text) {
        var splited = text.split(':');
        var name = splited[0];
        var value = splited[1];
        if (value) {
            cssProperties.push({
                disabled: false,
                implicit: false,
                value: value.replace(/^\s/g, '').replace(/\s$/g, ''),
                name: name.replace(/\s/g, ''),
                text: text
            });
        }
    });
    return {
        cssText: style.cssText,
        shorthandEntries: [],
        cssProperties: cssProperties,
        styleSheetId: nodeId * 10 + 1
    };
}
var messageHandler = {
    refresh: function refresh() {
        sendMessage({
            method: 'refresh',
            payload: {
                root: realPropsTree
            }
        });
    },
    enable: function enable() {
        // console.log('tiny enable');
        // enable tiny
        checkTinyAndReact();
    },
    getDocument: function getDocument() {
        if (loadCheckInterval) return;else sendMessage({
            method: 'documentUpdated',
            payload: {
                root: realPropsTree
            }
        });
    },
    highlight: function highlight(_ref2) {
        var nodeId = _ref2.nodeId;

        var id = parseInt(nodeId);

        var _ref3 = reactElementIds[id] || {},
            element = _ref3.element,
            node = _ref3.node;

        if (element) {
            var realReact = componentElementMapping.get(element);
            var realDom = getNativeFromReactElement(realReact);
            if (realDom) {
                if (!container) {
                    container = new _overlay2.default(window);
                }
                container.inspect(realDom, node.name);
            }
        }
    },
    unhighlight: function unhighlight() {
        if (container) {
            container.remove();
            container = null;
        }
    },
    inlineStyleOnce: function inlineStyleOnce(_ref4) {
        var nodeId = _ref4.nodeId;

        var id = parseInt(nodeId);

        var _ref5 = reactElementIds[id] || {},
            element = _ref5.element,
            node = _ref5.node;

        if (element) {
            var realReact = componentElementMapping.get(element);
            var realDom = getNativeFromReactElement(realReact);
            sendMessage({
                method: 'inlineStyleOnce',
                payload: createInlineStyle(nodeId, realDom)
            });
        }
    },
    matchedStyleOnce: function matchedStyleOnce(_ref6) {
        var nodeId = _ref6.nodeId;

        var id = parseInt(nodeId);

        var _ref7 = reactElementIds[id] || {},
            element = _ref7.element,
            node = _ref7.node;

        if (element) {
            var realReact = componentElementMapping.get(element);
            var realDom = getNativeFromReactElement(realReact);
            sendMessage({
                method: 'matchedStyleOnce',
                payload: createMathedStyle(nodeId, realDom)
            });
        }
    },
    styleOnce: function styleOnce(_ref8) {
        var nodeId = _ref8.nodeId;

        var id = parseInt(nodeId);

        var _ref9 = reactElementIds[id] || {},
            element = _ref9.element,
            node = _ref9.node;

        if (element) {
            var realReact = componentElementMapping.get(element);
            var realDom = getNativeFromReactElement(realReact);
            var inlineStyle = createInlineStyle(nodeId, realDom);
            var matchedStyle = createMathedStyle(nodeId, realDom);
            console.log({
                inlineStyle: inlineStyle, matchedStyle: matchedStyle
            });
            sendMessage({
                method: 'styleOnce',
                payload: {
                    inlineStyle: inlineStyle, matchedStyle: matchedStyle
                }
            });
        }
    }
};
// handle all messages from devtools
_electron.ipcRenderer.on('devtools', function (event, args) {
    var method = args.method,
        payload = args.payload;

    if (messageHandler[method]) {
        messageHandler[method](payload);
    } else {
        throw neww;
        Error('Error: method ' + method + ' is not defined');
    }
});

/***/ }),
/* 65 */
/***/ (function(module, exports) {

module.exports = require("nprogress");

/***/ }),
/* 66 */
/***/ (function(module, exports, __webpack_require__) {

__webpack_require__(27);
__webpack_require__(97);
module.exports = __webpack_require__(0).Array.from;

/***/ }),
/* 67 */
/***/ (function(module, exports, __webpack_require__) {

__webpack_require__(26);
__webpack_require__(27);
__webpack_require__(28);
__webpack_require__(99);
__webpack_require__(107);
module.exports = __webpack_require__(0).Map;

/***/ }),
/* 68 */
/***/ (function(module, exports, __webpack_require__) {

__webpack_require__(100);
module.exports = __webpack_require__(0).Object.assign;

/***/ }),
/* 69 */
/***/ (function(module, exports, __webpack_require__) {

__webpack_require__(101);
var $Object = __webpack_require__(0).Object;
module.exports = function create(P, D){
  return $Object.create(P, D);
};

/***/ }),
/* 70 */
/***/ (function(module, exports, __webpack_require__) {

__webpack_require__(102);
var $Object = __webpack_require__(0).Object;
module.exports = function defineProperty(it, key, desc){
  return $Object.defineProperty(it, key, desc);
};

/***/ }),
/* 71 */
/***/ (function(module, exports, __webpack_require__) {

__webpack_require__(103);
module.exports = __webpack_require__(0).Object.keys;

/***/ }),
/* 72 */
/***/ (function(module, exports, __webpack_require__) {

__webpack_require__(26);
__webpack_require__(27);
__webpack_require__(28);
__webpack_require__(104);
__webpack_require__(108);
module.exports = __webpack_require__(0).Set;

/***/ }),
/* 73 */
/***/ (function(module, exports, __webpack_require__) {

__webpack_require__(105);
__webpack_require__(26);
__webpack_require__(109);
__webpack_require__(110);
module.exports = __webpack_require__(0).Symbol;

/***/ }),
/* 74 */
/***/ (function(module, exports, __webpack_require__) {

__webpack_require__(27);
__webpack_require__(28);
module.exports = __webpack_require__(46).f('iterator');

/***/ }),
/* 75 */
/***/ (function(module, exports, __webpack_require__) {

__webpack_require__(26);
__webpack_require__(28);
__webpack_require__(106);
module.exports = __webpack_require__(0).WeakMap;

/***/ }),
/* 76 */
/***/ (function(module, exports) {

module.exports = function(it){
  if(typeof it != 'function')throw TypeError(it + ' is not a function!');
  return it;
};

/***/ }),
/* 77 */
/***/ (function(module, exports) {

module.exports = function(){ /* empty */ };

/***/ }),
/* 78 */
/***/ (function(module, exports, __webpack_require__) {

var forOf = __webpack_require__(20);

module.exports = function(iter, ITERATOR){
  var result = [];
  forOf(iter, false, result.push, result, ITERATOR);
  return result;
};


/***/ }),
/* 79 */
/***/ (function(module, exports, __webpack_require__) {

// false -> Array#indexOf
// true  -> Array#includes
var toIObject = __webpack_require__(11)
  , toLength  = __webpack_require__(24)
  , toIndex   = __webpack_require__(96);
module.exports = function(IS_INCLUDES){
  return function($this, el, fromIndex){
    var O      = toIObject($this)
      , length = toLength(O.length)
      , index  = toIndex(fromIndex, length)
      , value;
    // Array#includes uses SameValueZero equality algorithm
    if(IS_INCLUDES && el != el)while(length > index){
      value = O[index++];
      if(value != value)return true;
    // Array#toIndex ignores holes, Array#includes - not
    } else for(;length > index; index++)if(IS_INCLUDES || index in O){
      if(O[index] === el)return IS_INCLUDES || index || 0;
    } return !IS_INCLUDES && -1;
  };
};

/***/ }),
/* 80 */
/***/ (function(module, exports, __webpack_require__) {

var isObject = __webpack_require__(8)
  , isArray  = __webpack_require__(55)
  , SPECIES  = __webpack_require__(1)('species');

module.exports = function(original){
  var C;
  if(isArray(original)){
    C = original.constructor;
    // cross-realm fallback
    if(typeof C == 'function' && (C === Array || isArray(C.prototype)))C = undefined;
    if(isObject(C)){
      C = C[SPECIES];
      if(C === null)C = undefined;
    }
  } return C === undefined ? Array : C;
};

/***/ }),
/* 81 */
/***/ (function(module, exports, __webpack_require__) {

// 9.4.2.3 ArraySpeciesCreate(originalArray, length)
var speciesConstructor = __webpack_require__(80);

module.exports = function(original, length){
  return new (speciesConstructor(original))(length);
};

/***/ }),
/* 82 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var redefineAll       = __webpack_require__(39)
  , getWeak           = __webpack_require__(16).getWeak
  , anObject          = __webpack_require__(9)
  , isObject          = __webpack_require__(8)
  , anInstance        = __webpack_require__(30)
  , forOf             = __webpack_require__(20)
  , createArrayMethod = __webpack_require__(31)
  , $has              = __webpack_require__(6)
  , arrayFind         = createArrayMethod(5)
  , arrayFindIndex    = createArrayMethod(6)
  , id                = 0;

// fallback for uncaught frozen keys
var uncaughtFrozenStore = function(that){
  return that._l || (that._l = new UncaughtFrozenStore);
};
var UncaughtFrozenStore = function(){
  this.a = [];
};
var findUncaughtFrozen = function(store, key){
  return arrayFind(store.a, function(it){
    return it[0] === key;
  });
};
UncaughtFrozenStore.prototype = {
  get: function(key){
    var entry = findUncaughtFrozen(this, key);
    if(entry)return entry[1];
  },
  has: function(key){
    return !!findUncaughtFrozen(this, key);
  },
  set: function(key, value){
    var entry = findUncaughtFrozen(this, key);
    if(entry)entry[1] = value;
    else this.a.push([key, value]);
  },
  'delete': function(key){
    var index = arrayFindIndex(this.a, function(it){
      return it[0] === key;
    });
    if(~index)this.a.splice(index, 1);
    return !!~index;
  }
};

module.exports = {
  getConstructor: function(wrapper, NAME, IS_MAP, ADDER){
    var C = wrapper(function(that, iterable){
      anInstance(that, C, NAME, '_i');
      that._i = id++;      // collection id
      that._l = undefined; // leak store for uncaught frozen objects
      if(iterable != undefined)forOf(iterable, IS_MAP, that[ADDER], that);
    });
    redefineAll(C.prototype, {
      // 23.3.3.2 WeakMap.prototype.delete(key)
      // 23.4.3.3 WeakSet.prototype.delete(value)
      'delete': function(key){
        if(!isObject(key))return false;
        var data = getWeak(key);
        if(data === true)return uncaughtFrozenStore(this)['delete'](key);
        return data && $has(data, this._i) && delete data[this._i];
      },
      // 23.3.3.4 WeakMap.prototype.has(key)
      // 23.4.3.4 WeakSet.prototype.has(value)
      has: function has(key){
        if(!isObject(key))return false;
        var data = getWeak(key);
        if(data === true)return uncaughtFrozenStore(this).has(key);
        return data && $has(data, this._i);
      }
    });
    return C;
  },
  def: function(that, key, value){
    var data = getWeak(anObject(key), true);
    if(data === true)uncaughtFrozenStore(that).set(key, value);
    else data[that._i] = value;
    return that;
  },
  ufstore: uncaughtFrozenStore
};

/***/ }),
/* 83 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var $defineProperty = __webpack_require__(2)
  , createDesc      = __webpack_require__(17);

module.exports = function(object, index, value){
  if(index in object)$defineProperty.f(object, index, createDesc(0, value));
  else object[index] = value;
};

/***/ }),
/* 84 */
/***/ (function(module, exports, __webpack_require__) {

// all enumerable object keys, includes symbols
var getKeys = __webpack_require__(13)
  , gOPS    = __webpack_require__(38)
  , pIE     = __webpack_require__(22);
module.exports = function(it){
  var result     = getKeys(it)
    , getSymbols = gOPS.f;
  if(getSymbols){
    var symbols = getSymbols(it)
      , isEnum  = pIE.f
      , i       = 0
      , key;
    while(symbols.length > i)if(isEnum.call(it, key = symbols[i++]))result.push(key);
  } return result;
};

/***/ }),
/* 85 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__(5).document && document.documentElement;

/***/ }),
/* 86 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var create         = __webpack_require__(21)
  , descriptor     = __webpack_require__(17)
  , setToStringTag = __webpack_require__(23)
  , IteratorPrototype = {};

// 25.1.2.1.1 %IteratorPrototype%[@@iterator]()
__webpack_require__(7)(IteratorPrototype, __webpack_require__(1)('iterator'), function(){ return this; });

module.exports = function(Constructor, NAME, next){
  Constructor.prototype = create(IteratorPrototype, {next: descriptor(1, next)});
  setToStringTag(Constructor, NAME + ' Iterator');
};

/***/ }),
/* 87 */
/***/ (function(module, exports, __webpack_require__) {

var ITERATOR     = __webpack_require__(1)('iterator')
  , SAFE_CLOSING = false;

try {
  var riter = [7][ITERATOR]();
  riter['return'] = function(){ SAFE_CLOSING = true; };
  Array.from(riter, function(){ throw 2; });
} catch(e){ /* empty */ }

module.exports = function(exec, skipClosing){
  if(!skipClosing && !SAFE_CLOSING)return false;
  var safe = false;
  try {
    var arr  = [7]
      , iter = arr[ITERATOR]();
    iter.next = function(){ return {done: safe = true}; };
    arr[ITERATOR] = function(){ return iter; };
    exec(arr);
  } catch(e){ /* empty */ }
  return safe;
};

/***/ }),
/* 88 */
/***/ (function(module, exports, __webpack_require__) {

var getKeys   = __webpack_require__(13)
  , toIObject = __webpack_require__(11);
module.exports = function(object, el){
  var O      = toIObject(object)
    , keys   = getKeys(O)
    , length = keys.length
    , index  = 0
    , key;
  while(length > index)if(O[key = keys[index++]] === el)return key;
};

/***/ }),
/* 89 */
/***/ (function(module, exports, __webpack_require__) {

var dP       = __webpack_require__(2)
  , anObject = __webpack_require__(9)
  , getKeys  = __webpack_require__(13);

module.exports = __webpack_require__(3) ? Object.defineProperties : function defineProperties(O, Properties){
  anObject(O);
  var keys   = getKeys(Properties)
    , length = keys.length
    , i = 0
    , P;
  while(length > i)dP.f(O, P = keys[i++], Properties[P]);
  return O;
};

/***/ }),
/* 90 */
/***/ (function(module, exports, __webpack_require__) {

var pIE            = __webpack_require__(22)
  , createDesc     = __webpack_require__(17)
  , toIObject      = __webpack_require__(11)
  , toPrimitive    = __webpack_require__(44)
  , has            = __webpack_require__(6)
  , IE8_DOM_DEFINE = __webpack_require__(53)
  , gOPD           = Object.getOwnPropertyDescriptor;

exports.f = __webpack_require__(3) ? gOPD : function getOwnPropertyDescriptor(O, P){
  O = toIObject(O);
  P = toPrimitive(P, true);
  if(IE8_DOM_DEFINE)try {
    return gOPD(O, P);
  } catch(e){ /* empty */ }
  if(has(O, P))return createDesc(!pIE.f.call(O, P), O[P]);
};

/***/ }),
/* 91 */
/***/ (function(module, exports, __webpack_require__) {

// fallback for IE11 buggy Object.getOwnPropertyNames with iframe and window
var toIObject = __webpack_require__(11)
  , gOPN      = __webpack_require__(59).f
  , toString  = {}.toString;

var windowNames = typeof window == 'object' && window && Object.getOwnPropertyNames
  ? Object.getOwnPropertyNames(window) : [];

var getWindowNames = function(it){
  try {
    return gOPN(it);
  } catch(e){
    return windowNames.slice();
  }
};

module.exports.f = function getOwnPropertyNames(it){
  return windowNames && toString.call(it) == '[object Window]' ? getWindowNames(it) : gOPN(toIObject(it));
};


/***/ }),
/* 92 */
/***/ (function(module, exports, __webpack_require__) {

// 19.1.2.9 / 15.2.3.2 Object.getPrototypeOf(O)
var has         = __webpack_require__(6)
  , toObject    = __webpack_require__(18)
  , IE_PROTO    = __webpack_require__(41)('IE_PROTO')
  , ObjectProto = Object.prototype;

module.exports = Object.getPrototypeOf || function(O){
  O = toObject(O);
  if(has(O, IE_PROTO))return O[IE_PROTO];
  if(typeof O.constructor == 'function' && O instanceof O.constructor){
    return O.constructor.prototype;
  } return O instanceof Object ? ObjectProto : null;
};

/***/ }),
/* 93 */
/***/ (function(module, exports, __webpack_require__) {

// most Object methods by ES6 should accept primitives
var $export = __webpack_require__(4)
  , core    = __webpack_require__(0)
  , fails   = __webpack_require__(10);
module.exports = function(KEY, exec){
  var fn  = (core.Object || {})[KEY] || Object[KEY]
    , exp = {};
  exp[KEY] = exec(fn);
  $export($export.S + $export.F * fails(function(){ fn(1); }), 'Object', exp);
};

/***/ }),
/* 94 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var global      = __webpack_require__(5)
  , core        = __webpack_require__(0)
  , dP          = __webpack_require__(2)
  , DESCRIPTORS = __webpack_require__(3)
  , SPECIES     = __webpack_require__(1)('species');

module.exports = function(KEY){
  var C = typeof core[KEY] == 'function' ? core[KEY] : global[KEY];
  if(DESCRIPTORS && C && !C[SPECIES])dP.f(C, SPECIES, {
    configurable: true,
    get: function(){ return this; }
  });
};

/***/ }),
/* 95 */
/***/ (function(module, exports, __webpack_require__) {

var toInteger = __webpack_require__(43)
  , defined   = __webpack_require__(19);
// true  -> String#at
// false -> String#codePointAt
module.exports = function(TO_STRING){
  return function(that, pos){
    var s = String(defined(that))
      , i = toInteger(pos)
      , l = s.length
      , a, b;
    if(i < 0 || i >= l)return TO_STRING ? '' : undefined;
    a = s.charCodeAt(i);
    return a < 0xd800 || a > 0xdbff || i + 1 === l || (b = s.charCodeAt(i + 1)) < 0xdc00 || b > 0xdfff
      ? TO_STRING ? s.charAt(i) : a
      : TO_STRING ? s.slice(i, i + 2) : (a - 0xd800 << 10) + (b - 0xdc00) + 0x10000;
  };
};

/***/ }),
/* 96 */
/***/ (function(module, exports, __webpack_require__) {

var toInteger = __webpack_require__(43)
  , max       = Math.max
  , min       = Math.min;
module.exports = function(index, length){
  index = toInteger(index);
  return index < 0 ? max(index + length, 0) : min(index, length);
};

/***/ }),
/* 97 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var ctx            = __webpack_require__(14)
  , $export        = __webpack_require__(4)
  , toObject       = __webpack_require__(18)
  , call           = __webpack_require__(56)
  , isArrayIter    = __webpack_require__(54)
  , toLength       = __webpack_require__(24)
  , createProperty = __webpack_require__(83)
  , getIterFn      = __webpack_require__(61);

$export($export.S + $export.F * !__webpack_require__(87)(function(iter){ Array.from(iter); }), 'Array', {
  // 22.1.2.1 Array.from(arrayLike, mapfn = undefined, thisArg = undefined)
  from: function from(arrayLike/*, mapfn = undefined, thisArg = undefined*/){
    var O       = toObject(arrayLike)
      , C       = typeof this == 'function' ? this : Array
      , aLen    = arguments.length
      , mapfn   = aLen > 1 ? arguments[1] : undefined
      , mapping = mapfn !== undefined
      , index   = 0
      , iterFn  = getIterFn(O)
      , length, result, step, iterator;
    if(mapping)mapfn = ctx(mapfn, aLen > 2 ? arguments[2] : undefined, 2);
    // if object isn't iterable or it's array with default iterator - use simple case
    if(iterFn != undefined && !(C == Array && isArrayIter(iterFn))){
      for(iterator = iterFn.call(O), result = new C; !(step = iterator.next()).done; index++){
        createProperty(result, index, mapping ? call(iterator, mapfn, [step.value, index], true) : step.value);
      }
    } else {
      length = toLength(O.length);
      for(result = new C(length); length > index; index++){
        createProperty(result, index, mapping ? mapfn(O[index], index) : O[index]);
      }
    }
    result.length = index;
    return result;
  }
});


/***/ }),
/* 98 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var addToUnscopables = __webpack_require__(77)
  , step             = __webpack_require__(57)
  , Iterators        = __webpack_require__(15)
  , toIObject        = __webpack_require__(11);

// 22.1.3.4 Array.prototype.entries()
// 22.1.3.13 Array.prototype.keys()
// 22.1.3.29 Array.prototype.values()
// 22.1.3.30 Array.prototype[@@iterator]()
module.exports = __webpack_require__(36)(Array, 'Array', function(iterated, kind){
  this._t = toIObject(iterated); // target
  this._i = 0;                   // next index
  this._k = kind;                // kind
// 22.1.5.2.1 %ArrayIteratorPrototype%.next()
}, function(){
  var O     = this._t
    , kind  = this._k
    , index = this._i++;
  if(!O || index >= O.length){
    this._t = undefined;
    return step(1);
  }
  if(kind == 'keys'  )return step(0, index);
  if(kind == 'values')return step(0, O[index]);
  return step(0, [index, O[index]]);
}, 'values');

// argumentsList[@@iterator] is %ArrayProto_values% (9.4.4.6, 9.4.4.7)
Iterators.Arguments = Iterators.Array;

addToUnscopables('keys');
addToUnscopables('values');
addToUnscopables('entries');

/***/ }),
/* 99 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var strong = __webpack_require__(50);

// 23.1 Map Objects
module.exports = __webpack_require__(33)('Map', function(get){
  return function Map(){ return get(this, arguments.length > 0 ? arguments[0] : undefined); };
}, {
  // 23.1.3.6 Map.prototype.get(key)
  get: function get(key){
    var entry = strong.getEntry(this, key);
    return entry && entry.v;
  },
  // 23.1.3.9 Map.prototype.set(key, value)
  set: function set(key, value){
    return strong.def(this, key === 0 ? 0 : key, value);
  }
}, strong, true);

/***/ }),
/* 100 */
/***/ (function(module, exports, __webpack_require__) {

// 19.1.3.1 Object.assign(target, source)
var $export = __webpack_require__(4);

$export($export.S + $export.F, 'Object', {assign: __webpack_require__(58)});

/***/ }),
/* 101 */
/***/ (function(module, exports, __webpack_require__) {

var $export = __webpack_require__(4)
// 19.1.2.2 / 15.2.3.5 Object.create(O [, Properties])
$export($export.S, 'Object', {create: __webpack_require__(21)});

/***/ }),
/* 102 */
/***/ (function(module, exports, __webpack_require__) {

var $export = __webpack_require__(4);
// 19.1.2.4 / 15.2.3.6 Object.defineProperty(O, P, Attributes)
$export($export.S + $export.F * !__webpack_require__(3), 'Object', {defineProperty: __webpack_require__(2).f});

/***/ }),
/* 103 */
/***/ (function(module, exports, __webpack_require__) {

// 19.1.2.14 Object.keys(O)
var toObject = __webpack_require__(18)
  , $keys    = __webpack_require__(13);

__webpack_require__(93)('keys', function(){
  return function keys(it){
    return $keys(toObject(it));
  };
});

/***/ }),
/* 104 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var strong = __webpack_require__(50);

// 23.2 Set Objects
module.exports = __webpack_require__(33)('Set', function(get){
  return function Set(){ return get(this, arguments.length > 0 ? arguments[0] : undefined); };
}, {
  // 23.2.3.1 Set.prototype.add(value)
  add: function add(value){
    return strong.def(this, value = value === 0 ? 0 : value, value);
  }
}, strong);

/***/ }),
/* 105 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

// ECMAScript 6 symbols shim
var global         = __webpack_require__(5)
  , has            = __webpack_require__(6)
  , DESCRIPTORS    = __webpack_require__(3)
  , $export        = __webpack_require__(4)
  , redefine       = __webpack_require__(40)
  , META           = __webpack_require__(16).KEY
  , $fails         = __webpack_require__(10)
  , shared         = __webpack_require__(42)
  , setToStringTag = __webpack_require__(23)
  , uid            = __webpack_require__(25)
  , wks            = __webpack_require__(1)
  , wksExt         = __webpack_require__(46)
  , wksDefine      = __webpack_require__(45)
  , keyOf          = __webpack_require__(88)
  , enumKeys       = __webpack_require__(84)
  , isArray        = __webpack_require__(55)
  , anObject       = __webpack_require__(9)
  , toIObject      = __webpack_require__(11)
  , toPrimitive    = __webpack_require__(44)
  , createDesc     = __webpack_require__(17)
  , _create        = __webpack_require__(21)
  , gOPNExt        = __webpack_require__(91)
  , $GOPD          = __webpack_require__(90)
  , $DP            = __webpack_require__(2)
  , $keys          = __webpack_require__(13)
  , gOPD           = $GOPD.f
  , dP             = $DP.f
  , gOPN           = gOPNExt.f
  , $Symbol        = global.Symbol
  , $JSON          = global.JSON
  , _stringify     = $JSON && $JSON.stringify
  , PROTOTYPE      = 'prototype'
  , HIDDEN         = wks('_hidden')
  , TO_PRIMITIVE   = wks('toPrimitive')
  , isEnum         = {}.propertyIsEnumerable
  , SymbolRegistry = shared('symbol-registry')
  , AllSymbols     = shared('symbols')
  , OPSymbols      = shared('op-symbols')
  , ObjectProto    = Object[PROTOTYPE]
  , USE_NATIVE     = typeof $Symbol == 'function'
  , QObject        = global.QObject;
// Don't use setters in Qt Script, https://github.com/zloirock/core-js/issues/173
var setter = !QObject || !QObject[PROTOTYPE] || !QObject[PROTOTYPE].findChild;

// fallback for old Android, https://code.google.com/p/v8/issues/detail?id=687
var setSymbolDesc = DESCRIPTORS && $fails(function(){
  return _create(dP({}, 'a', {
    get: function(){ return dP(this, 'a', {value: 7}).a; }
  })).a != 7;
}) ? function(it, key, D){
  var protoDesc = gOPD(ObjectProto, key);
  if(protoDesc)delete ObjectProto[key];
  dP(it, key, D);
  if(protoDesc && it !== ObjectProto)dP(ObjectProto, key, protoDesc);
} : dP;

var wrap = function(tag){
  var sym = AllSymbols[tag] = _create($Symbol[PROTOTYPE]);
  sym._k = tag;
  return sym;
};

var isSymbol = USE_NATIVE && typeof $Symbol.iterator == 'symbol' ? function(it){
  return typeof it == 'symbol';
} : function(it){
  return it instanceof $Symbol;
};

var $defineProperty = function defineProperty(it, key, D){
  if(it === ObjectProto)$defineProperty(OPSymbols, key, D);
  anObject(it);
  key = toPrimitive(key, true);
  anObject(D);
  if(has(AllSymbols, key)){
    if(!D.enumerable){
      if(!has(it, HIDDEN))dP(it, HIDDEN, createDesc(1, {}));
      it[HIDDEN][key] = true;
    } else {
      if(has(it, HIDDEN) && it[HIDDEN][key])it[HIDDEN][key] = false;
      D = _create(D, {enumerable: createDesc(0, false)});
    } return setSymbolDesc(it, key, D);
  } return dP(it, key, D);
};
var $defineProperties = function defineProperties(it, P){
  anObject(it);
  var keys = enumKeys(P = toIObject(P))
    , i    = 0
    , l = keys.length
    , key;
  while(l > i)$defineProperty(it, key = keys[i++], P[key]);
  return it;
};
var $create = function create(it, P){
  return P === undefined ? _create(it) : $defineProperties(_create(it), P);
};
var $propertyIsEnumerable = function propertyIsEnumerable(key){
  var E = isEnum.call(this, key = toPrimitive(key, true));
  if(this === ObjectProto && has(AllSymbols, key) && !has(OPSymbols, key))return false;
  return E || !has(this, key) || !has(AllSymbols, key) || has(this, HIDDEN) && this[HIDDEN][key] ? E : true;
};
var $getOwnPropertyDescriptor = function getOwnPropertyDescriptor(it, key){
  it  = toIObject(it);
  key = toPrimitive(key, true);
  if(it === ObjectProto && has(AllSymbols, key) && !has(OPSymbols, key))return;
  var D = gOPD(it, key);
  if(D && has(AllSymbols, key) && !(has(it, HIDDEN) && it[HIDDEN][key]))D.enumerable = true;
  return D;
};
var $getOwnPropertyNames = function getOwnPropertyNames(it){
  var names  = gOPN(toIObject(it))
    , result = []
    , i      = 0
    , key;
  while(names.length > i){
    if(!has(AllSymbols, key = names[i++]) && key != HIDDEN && key != META)result.push(key);
  } return result;
};
var $getOwnPropertySymbols = function getOwnPropertySymbols(it){
  var IS_OP  = it === ObjectProto
    , names  = gOPN(IS_OP ? OPSymbols : toIObject(it))
    , result = []
    , i      = 0
    , key;
  while(names.length > i){
    if(has(AllSymbols, key = names[i++]) && (IS_OP ? has(ObjectProto, key) : true))result.push(AllSymbols[key]);
  } return result;
};

// 19.4.1.1 Symbol([description])
if(!USE_NATIVE){
  $Symbol = function Symbol(){
    if(this instanceof $Symbol)throw TypeError('Symbol is not a constructor!');
    var tag = uid(arguments.length > 0 ? arguments[0] : undefined);
    var $set = function(value){
      if(this === ObjectProto)$set.call(OPSymbols, value);
      if(has(this, HIDDEN) && has(this[HIDDEN], tag))this[HIDDEN][tag] = false;
      setSymbolDesc(this, tag, createDesc(1, value));
    };
    if(DESCRIPTORS && setter)setSymbolDesc(ObjectProto, tag, {configurable: true, set: $set});
    return wrap(tag);
  };
  redefine($Symbol[PROTOTYPE], 'toString', function toString(){
    return this._k;
  });

  $GOPD.f = $getOwnPropertyDescriptor;
  $DP.f   = $defineProperty;
  __webpack_require__(59).f = gOPNExt.f = $getOwnPropertyNames;
  __webpack_require__(22).f  = $propertyIsEnumerable;
  __webpack_require__(38).f = $getOwnPropertySymbols;

  if(DESCRIPTORS && !__webpack_require__(37)){
    redefine(ObjectProto, 'propertyIsEnumerable', $propertyIsEnumerable, true);
  }

  wksExt.f = function(name){
    return wrap(wks(name));
  }
}

$export($export.G + $export.W + $export.F * !USE_NATIVE, {Symbol: $Symbol});

for(var symbols = (
  // 19.4.2.2, 19.4.2.3, 19.4.2.4, 19.4.2.6, 19.4.2.8, 19.4.2.9, 19.4.2.10, 19.4.2.11, 19.4.2.12, 19.4.2.13, 19.4.2.14
  'hasInstance,isConcatSpreadable,iterator,match,replace,search,species,split,toPrimitive,toStringTag,unscopables'
).split(','), i = 0; symbols.length > i; )wks(symbols[i++]);

for(var symbols = $keys(wks.store), i = 0; symbols.length > i; )wksDefine(symbols[i++]);

$export($export.S + $export.F * !USE_NATIVE, 'Symbol', {
  // 19.4.2.1 Symbol.for(key)
  'for': function(key){
    return has(SymbolRegistry, key += '')
      ? SymbolRegistry[key]
      : SymbolRegistry[key] = $Symbol(key);
  },
  // 19.4.2.5 Symbol.keyFor(sym)
  keyFor: function keyFor(key){
    if(isSymbol(key))return keyOf(SymbolRegistry, key);
    throw TypeError(key + ' is not a symbol!');
  },
  useSetter: function(){ setter = true; },
  useSimple: function(){ setter = false; }
});

$export($export.S + $export.F * !USE_NATIVE, 'Object', {
  // 19.1.2.2 Object.create(O [, Properties])
  create: $create,
  // 19.1.2.4 Object.defineProperty(O, P, Attributes)
  defineProperty: $defineProperty,
  // 19.1.2.3 Object.defineProperties(O, Properties)
  defineProperties: $defineProperties,
  // 19.1.2.6 Object.getOwnPropertyDescriptor(O, P)
  getOwnPropertyDescriptor: $getOwnPropertyDescriptor,
  // 19.1.2.7 Object.getOwnPropertyNames(O)
  getOwnPropertyNames: $getOwnPropertyNames,
  // 19.1.2.8 Object.getOwnPropertySymbols(O)
  getOwnPropertySymbols: $getOwnPropertySymbols
});

// 24.3.2 JSON.stringify(value [, replacer [, space]])
$JSON && $export($export.S + $export.F * (!USE_NATIVE || $fails(function(){
  var S = $Symbol();
  // MS Edge converts symbol values to JSON as {}
  // WebKit converts symbol values to JSON as null
  // V8 throws on boxed symbols
  return _stringify([S]) != '[null]' || _stringify({a: S}) != '{}' || _stringify(Object(S)) != '{}';
})), 'JSON', {
  stringify: function stringify(it){
    if(it === undefined || isSymbol(it))return; // IE8 returns string on undefined
    var args = [it]
      , i    = 1
      , replacer, $replacer;
    while(arguments.length > i)args.push(arguments[i++]);
    replacer = args[1];
    if(typeof replacer == 'function')$replacer = replacer;
    if($replacer || !isArray(replacer))replacer = function(key, value){
      if($replacer)value = $replacer.call(this, key, value);
      if(!isSymbol(value))return value;
    };
    args[1] = replacer;
    return _stringify.apply($JSON, args);
  }
});

// 19.4.3.4 Symbol.prototype[@@toPrimitive](hint)
$Symbol[PROTOTYPE][TO_PRIMITIVE] || __webpack_require__(7)($Symbol[PROTOTYPE], TO_PRIMITIVE, $Symbol[PROTOTYPE].valueOf);
// 19.4.3.5 Symbol.prototype[@@toStringTag]
setToStringTag($Symbol, 'Symbol');
// 20.2.1.9 Math[@@toStringTag]
setToStringTag(Math, 'Math', true);
// 24.3.3 JSON[@@toStringTag]
setToStringTag(global.JSON, 'JSON', true);

/***/ }),
/* 106 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var each         = __webpack_require__(31)(0)
  , redefine     = __webpack_require__(40)
  , meta         = __webpack_require__(16)
  , assign       = __webpack_require__(58)
  , weak         = __webpack_require__(82)
  , isObject     = __webpack_require__(8)
  , getWeak      = meta.getWeak
  , isExtensible = Object.isExtensible
  , uncaughtFrozenStore = weak.ufstore
  , tmp          = {}
  , InternalMap;

var wrapper = function(get){
  return function WeakMap(){
    return get(this, arguments.length > 0 ? arguments[0] : undefined);
  };
};

var methods = {
  // 23.3.3.3 WeakMap.prototype.get(key)
  get: function get(key){
    if(isObject(key)){
      var data = getWeak(key);
      if(data === true)return uncaughtFrozenStore(this).get(key);
      return data ? data[this._i] : undefined;
    }
  },
  // 23.3.3.5 WeakMap.prototype.set(key, value)
  set: function set(key, value){
    return weak.def(this, key, value);
  }
};

// 23.3 WeakMap Objects
var $WeakMap = module.exports = __webpack_require__(33)('WeakMap', wrapper, methods, weak, true, true);

// IE11 WeakMap frozen keys fix
if(new $WeakMap().set((Object.freeze || Object)(tmp), 7).get(tmp) != 7){
  InternalMap = weak.getConstructor(wrapper);
  assign(InternalMap.prototype, methods);
  meta.NEED = true;
  each(['delete', 'has', 'get', 'set'], function(key){
    var proto  = $WeakMap.prototype
      , method = proto[key];
    redefine(proto, key, function(a, b){
      // store frozen objects on internal weakmap shim
      if(isObject(a) && !isExtensible(a)){
        if(!this._f)this._f = new InternalMap;
        var result = this._f[key](a, b);
        return key == 'set' ? this : result;
      // store all the rest on native weakmap
      } return method.call(this, a, b);
    });
  });
}

/***/ }),
/* 107 */
/***/ (function(module, exports, __webpack_require__) {

// https://github.com/DavidBruant/Map-Set.prototype.toJSON
var $export  = __webpack_require__(4);

$export($export.P + $export.R, 'Map', {toJSON: __webpack_require__(51)('Map')});

/***/ }),
/* 108 */
/***/ (function(module, exports, __webpack_require__) {

// https://github.com/DavidBruant/Map-Set.prototype.toJSON
var $export  = __webpack_require__(4);

$export($export.P + $export.R, 'Set', {toJSON: __webpack_require__(51)('Set')});

/***/ }),
/* 109 */
/***/ (function(module, exports, __webpack_require__) {

__webpack_require__(45)('asyncIterator');

/***/ }),
/* 110 */
/***/ (function(module, exports, __webpack_require__) {

__webpack_require__(45)('observable');

/***/ }),
/* 111 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/*
object-assign
(c) Sindre Sorhus
@license MIT
*/


/* eslint-disable no-unused-vars */
var getOwnPropertySymbols = Object.getOwnPropertySymbols;
var hasOwnProperty = Object.prototype.hasOwnProperty;
var propIsEnumerable = Object.prototype.propertyIsEnumerable;

function toObject(val) {
	if (val === null || val === undefined) {
		throw new TypeError('Object.assign cannot be called with null or undefined');
	}

	return Object(val);
}

function shouldUseNative() {
	try {
		if (!Object.assign) {
			return false;
		}

		// Detect buggy property enumeration order in older V8 versions.

		// https://bugs.chromium.org/p/v8/issues/detail?id=4118
		var test1 = new String('abc');  // eslint-disable-line no-new-wrappers
		test1[5] = 'de';
		if (Object.getOwnPropertyNames(test1)[0] === '5') {
			return false;
		}

		// https://bugs.chromium.org/p/v8/issues/detail?id=3056
		var test2 = {};
		for (var i = 0; i < 10; i++) {
			test2['_' + String.fromCharCode(i)] = i;
		}
		var order2 = Object.getOwnPropertyNames(test2).map(function (n) {
			return test2[n];
		});
		if (order2.join('') !== '0123456789') {
			return false;
		}

		// https://bugs.chromium.org/p/v8/issues/detail?id=3056
		var test3 = {};
		'abcdefghijklmnopqrst'.split('').forEach(function (letter) {
			test3[letter] = letter;
		});
		if (Object.keys(Object.assign({}, test3)).join('') !==
				'abcdefghijklmnopqrst') {
			return false;
		}

		return true;
	} catch (err) {
		// We don't expect any of the above to throw, but better to be safe.
		return false;
	}
}

module.exports = shouldUseNative() ? Object.assign : function (target, source) {
	var from;
	var to = toObject(target);
	var symbols;

	for (var s = 1; s < arguments.length; s++) {
		from = Object(arguments[s]);

		for (var key in from) {
			if (hasOwnProperty.call(from, key)) {
				to[key] = from[key];
			}
		}

		if (getOwnPropertySymbols) {
			symbols = getOwnPropertySymbols(from);
			for (var i = 0; i < symbols.length; i++) {
				if (propIsEnumerable.call(from, symbols[i])) {
					to[symbols[i]] = from[symbols[i]];
				}
			}
		}
	}

	return to;
};


/***/ }),
/* 112 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = { "default": __webpack_require__(66), __esModule: true };

/***/ }),
/* 113 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = { "default": __webpack_require__(67), __esModule: true };

/***/ }),
/* 114 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = { "default": __webpack_require__(69), __esModule: true };

/***/ }),
/* 115 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = { "default": __webpack_require__(70), __esModule: true };

/***/ }),
/* 116 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = { "default": __webpack_require__(72), __esModule: true };

/***/ }),
/* 117 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = { "default": __webpack_require__(73), __esModule: true };

/***/ }),
/* 118 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = { "default": __webpack_require__(74), __esModule: true };

/***/ }),
/* 119 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


exports.__esModule = true;

exports.default = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};

/***/ }),
/* 120 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


exports.__esModule = true;

var _defineProperty = __webpack_require__(115);

var _defineProperty2 = _interopRequireDefault(_defineProperty);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      (0, _defineProperty2.default)(target, descriptor.key, descriptor);
    }
  }

  return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);
    if (staticProps) defineProperties(Constructor, staticProps);
    return Constructor;
  };
}();

/***/ }),
/* 121 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _assign = __webpack_require__(47);

var _assign2 = _interopRequireDefault(_assign);

var _keys = __webpack_require__(29);

var _keys2 = _interopRequireDefault(_keys);

var _weakMap = __webpack_require__(62);

var _weakMap2 = _interopRequireDefault(_weakMap);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var getData = __webpack_require__(123);
var getTinyData = __webpack_require__(124);
var nodeId = 1;
function attachRenderer(bridge, rid, renderer) {
    var extras = {};
    // only support React Dom 15+
    // 由于我们不需要向下兼容，所以只需要考虑15+的api
    if (renderer.ComponentTree) {
        extras.getNativeFromReactElement = function (component) {
            return renderer.ComponentTree.getNodeFromInstance(component);
        };
        extras.getReactElementFromNative = function (node) {
            return renderer.ComponentTree.getClosestInstanceFromNode(node);
        };
    }
    // currentComponent到react dom instance的映射
    extras.mapCurrentComponentToElement = function () {
        var roots = renderer.Mount._instancesByReactRootID;
        var ret = [];
        var map = new _weakMap2.default();
        for (var i in roots) {
            ret = initRoots(roots[i], ret);
        }
        for (var _i in ret) {
            window.reactRootElement = ret[_i];
            makeMapping(map, ret[_i]);
        }
        return map;
    };
    // 这里是根据compoennt的props来生成树的
    // 由于component不含有任何的react runtime api，所以我们需要上面的映射
    extras.rebuildTinyTree = function (ids) {
        var roots = renderer.Mount._instancesByReactRootID;
        var ret = [];
        var tree = [];
        for (var i in roots) {
            ret = initRoots(roots[i], ret);
        }
        for (var _i2 in ret) {
            window.reactRootElement = ret[_i2];
            scanNode(tree, ret[_i2]._currentElement.props.children, ids, [0]);
        }
        return tree;
    };
    extras.buildStylesContext = function (styleMap) {
        var $styles = document.styleSheets;
        for (var i = $styles.length - 1; i > -1; --i) {
            var rules = $styles[i].cssRules || $styles[i].rules;
            for (var j = 0; j < rules.length; ++j) {
                var styleObject = textToStyleObject(rules[j].cssText);
                styleMap[styleObject.name] = {
                    style: styleObject.style,
                    cssRule: rules[j]
                };
            }
        }
    };
    extras.buildElementStyles = function (styleMap, reactElements) {
        (0, _keys2.default)(reactElements).forEach(function (key) {
            styleMap[key] = {
                style: contentToStyleObject(reactElements[key].data.props.style || ''),
                element: reactElements[key].element
            };
        });
    };
    return extras;
}
// 这个函数用于过滤react dom tree上面的一些无用的wrapper
function initRoots(root, ret) {
    nodeId = 1;
    if (root._renderedComponent._tag === 'div') {
        return [root._renderedComponent];
    } else {
        return initRoots(root._renderedComponent, ret);
    }
}
// 将object和string都normalize成数组的形势
var normalize = function normalize(children) {
    if (!children) return null;
    if (Array.isArray(children)) {
        return children;
    }
    return [children];
};
// 遍历生成component -> instance的weakmap
// key: compoennt; value: instance
function makeMapping(map, element) {
    var data = getData(element);
    var normalized = normalize(data.children);
    if (normalized) {
        if (data.nodeType === 'Composite') {
            map.set(element._currentElement, element);
        }
        normalized.forEach(function (child) {
            makeMapping(map, child);
        });
    }
}
// 遍历component的props.children，生成实际显示的dom tree
function scanNode(tree, element, ids, guids) {
    var data = getTinyData(element);
    if (!data) return;
    var length = guids.length;
    /*
    const node = {
      props: data.props,
      name: data.name,
      guid: guids.join('-'),
      parent: length === 0 ? null : guids.slice(0, length - 1).join('-'),
      children: [],
    };
    */
    var node = newNode({
        name: data.name,
        props: data.props,
        nodeType: 1,
        nodeValue: ''
    });
    if (Array.isArray(element)) {
        element.forEach(function (el, i) {
            scanNode(tree, el, ids, guids.concat([i]));
        });
    } else if (data.children) {
        data.children.forEach(function (child, i) {
            if (typeof child !== 'string') {
                scanNode(node.children, child, ids, guids.concat([i]));
            }
        });
        ids[node.nodeId] = {
            element: element,
            node: node
        };
        var completeNode = setChildren(node, data.children);
        tree.push(completeNode);
    }
}
function newNode(_ref) {
    var name = _ref.name,
        nodeType = _ref.nodeType,
        nodeValue = _ref.nodeValue,
        props = _ref.props;

    var attributes = [];
    (0, _keys2.default)(props).forEach(function (key) {
        attributes.push(key);
        attributes.push(props[key]);
    });
    return {
        attributes: attributes,
        nodeName: name.toUpperCase(),
        localName: name.toLowerCase(),
        nodeType: nodeType,
        nodeId: nodeId,
        backendNodeId: ++nodeId,
        nodeValue: nodeValue,
        children: []
    };
}
function setChildren(node, children) {
    return (0, _assign2.default)({}, node, {
        childNodeCount: children.length
    });
}
function textToStyleObject(text) {
    var styleArray = text.split('{');
    var name = styleArray[0];
    var stylesText = styleArray[1].replace('}', '').replace(/\s*$/, '');
    var styleObject = contentToStyleObject(stylesText);
    return {
        name: name.replace(/\s*$/, ''),
        style: styleObject
    };
}
function contentToStyleObject(stylesText) {
    if (!stylesText) return {};
    var styleObject = {};
    stylesText.split(';').forEach(function (style) {
        var splitStyle = style.split(':');
        if (splitStyle.length > 1) {
            styleObject[splitStyle[0].replace(/^\s*/, '')] = splitStyle[1].replace(/^\s*/, '');
        }
    });
    return styleObject;
}
module.exports = attachRenderer;

/***/ }),
/* 122 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @flow
 */


var _assign = __webpack_require__(47);

var _assign2 = _interopRequireDefault(_assign);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function copyWithSetImpl(obj, path, idx, value) {
    if (idx >= path.length) {
        return value;
    }
    var key = path[idx];
    var updated = Array.isArray(obj) ? obj.slice() : (0, _assign2.default)({}, obj);
    // $FlowFixMe number or string is fine here
    updated[key] = copyWithSetImpl(obj[key], path, idx + 1, value);
    return updated;
}
function copyWithSet(obj, path, value) {
    return copyWithSetImpl(obj, path, 0, value);
}
module.exports = copyWithSet;

/***/ }),
/* 123 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @flow
 */


var _assign = __webpack_require__(47);

var _assign2 = _interopRequireDefault(_assign);

var _keys = __webpack_require__(29);

var _keys2 = _interopRequireDefault(_keys);

var _typeof2 = __webpack_require__(48);

var _typeof3 = _interopRequireDefault(_typeof2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var copyWithSet = __webpack_require__(122);
var topWrapper = true;
/**
 * Convert a react internal instance to a sanitized data object.
 */
function getData(element) {
    var children = null;
    var props = null;
    var state = null;
    var context = null;
    var updater = null;
    var name = null;
    var type = null;
    var key = null;
    var ref = null;
    var source = null;
    var text = null;
    var publicInstance = null;
    var nodeType = 'Native';
    // If the parent is a native node without rendered children, but with
    // multiple string children, then the `element` that gets passed in here is
    // a plain value -- a string or number.
    if ((typeof element === 'undefined' ? 'undefined' : (0, _typeof3.default)(element)) !== 'object') {
        nodeType = 'Text';
        text = element + '';
    } else if (element._currentElement === null || element._currentElement === false) {
        nodeType = 'Empty';
    } else if (element._renderedComponent) {
        nodeType = 'NativeWrapper';
        children = [element._renderedComponent];
        props = element._instance.props;
        state = element._instance.state;
        context = element._instance.context;
        if (context && (0, _keys2.default)(context).length === 0) {
            context = null;
        }
    } else if (element._renderedChildren) {
        children = childrenList(element._renderedChildren);
    } else if (element._currentElement && element._currentElement.props) {
        // This is a native node without rendered children -- meaning the children
        // prop is just a string or (in the case of the <option>) a list of
        // strings & numbers.
        children = element._currentElement.props.children;
    }
    if (!props && element._currentElement && element._currentElement.props) {
        props = element._currentElement.props;
    }
    // != used deliberately here to catch undefined and null
    if (element._currentElement != null) {
        type = element._currentElement.type;
        if (element._currentElement.key) {
            key = String(element._currentElement.key);
        }
        source = element._currentElement._source;
        ref = element._currentElement.ref;
        if (typeof type === 'string') {
            name = type;
        } else if (element.getName) {
            nodeType = 'Composite';
            name = element.getName();
            // 0.14 top-level wrapper
            // TODO(jared): The backend should just act as if these don't exist.
            if (element._currentElement.props) {
                if (typeof element._currentElement.props.children === 'string' || !element._currentElement.props.children) {
                    children = [];
                    text = element._currentElement.props.children;
                }
            }
            if (element._renderedComponent && (element._currentElement.props === element._renderedComponent._currentElement || element._currentElement.type.isReactTopLevelWrapper)) {
                nodeType = 'Wrapper';
                children = [element._renderedComponent];
            }
            if (name === null) {
                name = 'No display name';
            }
        } else if (typeof element._stringText === 'string') {
            nodeType = 'Text';
            text = element._stringText;
        } else {
            name = type.displayName || type.name || 'Unknown';
        }
    }
    if (element._instance) {
        var inst = element._instance;
        updater = {
            setState: inst.setState && inst.setState.bind(inst),
            forceUpdate: inst.forceUpdate && inst.forceUpdate.bind(inst),
            setInProps: inst.forceUpdate && setInProps.bind(null, element),
            setInState: inst.forceUpdate && setInState.bind(null, inst),
            setInContext: inst.forceUpdate && setInContext.bind(null, inst)
        };
        publicInstance = inst;
        // TODO: React ART currently falls in this bucket, but this doesn't
        // actually make sense and we should clean this up after stabilizing our
        // API for backends
        if (inst._renderedChildren) {
            children = childrenList(inst._renderedChildren);
        }
    }
    return {
        nodeType: nodeType,
        type: type,
        key: key,
        ref: ref,
        source: source,
        name: name,
        props: props,
        state: state,
        context: context,
        children: children,
        text: text,
        updater: updater,
        publicInstance: publicInstance
    };
}
function setInProps(internalInst, path, value) {
    var element = internalInst._currentElement;
    internalInst._currentElement = (0, _assign2.default)({}, element, { props: copyWithSet(element.props, path, value) });
    internalInst._instance.forceUpdate();
}
function setInState(inst, path, value) {
    setIn(inst.state, path, value);
    inst.forceUpdate();
}
function setInContext(inst, path, value) {
    setIn(inst.context, path, value);
    inst.forceUpdate();
}
function setIn(obj, path, value) {
    var last = path.pop();
    var parent = path.reduce(function (obj_, attr) {
        return obj_ ? obj_[attr] : null;
    }, obj);
    if (parent) {
        parent[last] = value;
    }
}
function childrenList(children) {
    var res = [];
    for (var name in children) {
        res.push(children[name]);
    }
    return res;
}
module.exports = getData;

/***/ }),
/* 124 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});

var _keys = __webpack_require__(29);

var _keys2 = _interopRequireDefault(_keys);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var normalize = function normalize(children) {
    if (Array.isArray(children)) {
        return children;
    }
    return [children];
};

exports.default = function (element) {
    var props = {};
    if (!element || !element.props) return element;
    var name = element.props.$tag;
    var children = normalize(element.props.children);
    (0, _keys2.default)(element.props).forEach(function (prop) {
        if (!(typeof element.props[prop] === 'function' || prop === 'children' || prop === '$tag')) {
            props[prop] = element.props[prop];
        }
    });
    return {
        name: name,
        props: props,
        children: children
    };
};

module.exports = exports['default'];

/***/ }),
/* 125 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @flow
 */


var _classCallCheck2 = __webpack_require__(119);

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = __webpack_require__(120);

var _createClass3 = _interopRequireDefault(_createClass2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var assign = __webpack_require__(111);

var Overlay = function () {
    function Overlay(window) {
        (0, _classCallCheck3.default)(this, Overlay);

        var doc = window.document;
        this.win = window;
        this.container = doc.createElement('div');
        this.node = doc.createElement('div');
        this.border = doc.createElement('div');
        this.padding = doc.createElement('div');
        this.content = doc.createElement('div');
        this.border.style.borderColor = overlayStyles.border;
        this.padding.style.borderColor = overlayStyles.padding;
        this.content.style.backgroundColor = overlayStyles.background;
        assign(this.node.style, {
            borderColor: overlayStyles.margin,
            pointerEvents: 'none',
            position: 'fixed'
        });
        this.tip = doc.createElement('div');
        assign(this.tip.style, {
            border: '1px solid #aaa',
            backgroundColor: 'rgb(255, 255, 178)',
            fontFamily: 'sans-serif',
            color: 'orange',
            padding: '3px 5px',
            position: 'fixed',
            fontSize: '10px'
        });
        this.nameSpan = doc.createElement('span');
        this.tip.appendChild(this.nameSpan);
        assign(this.nameSpan.style, {
            color: 'rgb(136, 18, 128)',
            marginRight: '5px'
        });
        this.dimSpan = doc.createElement('span');
        this.tip.appendChild(this.dimSpan);
        assign(this.dimSpan.style, {
            color: '#888'
        });
        this.container.style.zIndex = 10000000;
        this.node.style.zIndex = 10000000;
        this.tip.style.zIndex = 10000000;
        this.container.appendChild(this.node);
        this.container.appendChild(this.tip);
        this.node.appendChild(this.border);
        this.border.appendChild(this.padding);
        this.padding.appendChild(this.content);
        doc.body.appendChild(this.container);
    }

    (0, _createClass3.default)(Overlay, [{
        key: 'remove',
        value: function remove() {
            if (this.container.parentNode) {
                this.container.parentNode.removeChild(this.container);
            }
        }
    }, {
        key: 'inspect',
        value: function inspect(node, name, string) {
            // We can't get the size of text nodes or comment nodes. React as of v15
            // heavily uses comment nodes to delimit text.
            if (node.nodeType !== Node.ELEMENT_NODE) {
                return;
            }
            var box = node.getBoundingClientRect();
            var dims = getElementDimensions(node);
            boxWrap(dims, 'margin', this.node);
            boxWrap(dims, 'border', this.border);
            boxWrap(dims, 'padding', this.padding);
            assign(this.content.style, {
                height: box.height - dims.borderTop - dims.borderBottom - dims.paddingTop - dims.paddingBottom + 'px',
                width: box.width - dims.borderLeft - dims.borderRight - dims.paddingLeft - dims.paddingRight + 'px'
            });
            assign(this.node.style, {
                top: box.top - dims.marginTop + 'px',
                left: box.left - dims.marginLeft + 'px'
            });
            this.nameSpan.textContent = name || node.nodeName.toLowerCase();
            this.dimSpan.textContent = box.width + 'px × ' + box.height + 'px';
            var tipPos = findTipPos({
                top: box.top - dims.marginTop,
                left: box.left - dims.marginLeft,
                height: box.height + dims.marginTop + dims.marginBottom,
                width: box.width + dims.marginLeft + dims.marginRight
            }, this.win);
            assign(this.tip.style, tipPos);
        }
    }]);
    return Overlay;
}();

function findTipPos(dims, win) {
    var tipHeight = 20;
    var margin = 5;
    var top;
    if (dims.top + dims.height + tipHeight <= win.innerHeight) {
        if (dims.top + dims.height < 0) {
            top = margin;
        } else {
            top = dims.top + dims.height + margin;
        }
    } else if (dims.top - tipHeight <= win.innerHeight) {
        if (dims.top - tipHeight - margin < margin) {
            top = margin;
        } else {
            top = dims.top - tipHeight - margin;
        }
    } else {
        top = win.innerHeight - tipHeight - margin;
    }
    top += 'px';
    if (dims.left < 0) {
        return { top: top, left: margin };
    }
    if (dims.left + 200 > win.innerWidth) {
        return { top: top, right: margin };
    }
    return { top: top, left: dims.left + margin + 'px' };
}
function getElementDimensions(element) {
    var calculatedStyle = window.getComputedStyle(element);
    return {
        borderLeft: +calculatedStyle.borderLeftWidth.match(/[0-9]*/)[0],
        borderRight: +calculatedStyle.borderRightWidth.match(/[0-9]*/)[0],
        borderTop: +calculatedStyle.borderTopWidth.match(/[0-9]*/)[0],
        borderBottom: +calculatedStyle.borderBottomWidth.match(/[0-9]*/)[0],
        marginLeft: +calculatedStyle.marginLeft.match(/[0-9]*/)[0],
        marginRight: +calculatedStyle.marginRight.match(/[0-9]*/)[0],
        marginTop: +calculatedStyle.marginTop.match(/[0-9]*/)[0],
        marginBottom: +calculatedStyle.marginBottom.match(/[0-9]*/)[0],
        paddingLeft: +calculatedStyle.paddingLeft.match(/[0-9]*/)[0],
        paddingRight: +calculatedStyle.paddingRight.match(/[0-9]*/)[0],
        paddingTop: +calculatedStyle.paddingTop.match(/[0-9]*/)[0],
        paddingBottom: +calculatedStyle.paddingBottom.match(/[0-9]*/)[0]
    };
}
function boxWrap(dims, what, node) {
    assign(node.style, {
        borderTopWidth: dims[what + 'Top'] + 'px',
        borderLeftWidth: dims[what + 'Left'] + 'px',
        borderRightWidth: dims[what + 'Right'] + 'px',
        borderBottomWidth: dims[what + 'Bottom'] + 'px',
        borderStyle: 'solid'
    });
}
var overlayStyles = {
    background: 'rgba(120, 170, 210, 0.7)',
    padding: 'rgba(77, 200, 0, 0.3)',
    margin: 'rgba(255, 155, 0, 0.3)',
    border: 'rgba(255, 200, 50, 0.3)'
};
module.exports = Overlay;

/***/ }),
/* 126 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _toConsumableArray2 = __webpack_require__(63);

var _toConsumableArray3 = _interopRequireDefault(_toConsumableArray2);

var _typeof2 = __webpack_require__(48);

var _typeof3 = _interopRequireDefault(_typeof2);

__webpack_require__(64);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var NProgress = __webpack_require__(65);
window.NProgress = NProgress;
var CALL_PREFIX = 'tea-fn';
var callCount = 0;
window.sendToHost = function () {
    var ipcRenderer = __webpack_require__(12).ipcRenderer;
    ipcRenderer.sendToHost.apply(ipcRenderer, arguments);
};
window.listenToHost = function () {
    var ipcRenderer = __webpack_require__(12).ipcRenderer;
    ipcRenderer.on.apply(ipcRenderer, arguments);
};
window.callElectron = function () {
    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
    }

    var ipcRenderer = __webpack_require__(12).ipcRenderer;
    var len = args.length;
    var lastArg = args[len - 1];
    var hasCallback = (typeof lastArg === 'undefined' ? 'undefined' : (0, _typeof3.default)(lastArg)) === 'object' && (lastArg.success || lastArg.fail);
    if (hasCallback) {
        var success = lastArg.success,
            fail = lastArg.fail;

        var id = CALL_PREFIX + '-' + callCount;
        callCount += 1;
        if (success) {
            ipcRenderer.on(id + '-success', success);
        }
        if (fail) {
            ipcRenderer.on(id + '-fail', fail);
        }
        var newArgs = [].slice.call(args, 0, -1).concat({
            type: 'callElectronArgs',
            id: id
        });
        ipcRenderer.sendToHost.apply(ipcRenderer, (0, _toConsumableArray3.default)(newArgs));
    } else {
        ipcRenderer.sendToHost.apply(ipcRenderer, args);
    }
};
console.log('page load');

/***/ }),
/* 127 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _set = __webpack_require__(116);

var _set2 = _interopRequireDefault(_set);

var _weakMap = __webpack_require__(62);

var _weakMap2 = _interopRequireDefault(_weakMap);

var _map = __webpack_require__(113);

var _map2 = _interopRequireDefault(_map);

var _create = __webpack_require__(114);

var _create2 = _interopRequireDefault(_create);

exports.default = installGlobalReactHook;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function installGlobalReactHook() {
  if (window.__REACT_DEVTOOLS_GLOBAL_HOOK__) {
    return;
  }
  Object.defineProperty(window, '__REACT_DEVTOOLS_GLOBAL_HOOK__', {
    value: {
      _renderers: {},
      helpers: {},
      inject: function inject(renderer) {
        var id = Math.random().toString(16).slice(2);
        this._renderers[id] = renderer;
        this.emit('renderer', { id: id, renderer: renderer });
      },
      _listeners: {},
      sub: function sub(evt, fn) {
        var _this = this;

        this.on(evt, fn);
        return function () {
          return _this.off(evt, fn);
        };
      },
      on: function on(evt, fn) {
        if (!this._listeners[evt]) {
          this._listeners[evt] = [];
        }
        this._listeners[evt].push(fn);
      },
      off: function off(evt, fn) {
        if (!this._listeners[evt]) {
          return;
        }
        var ix = this._listeners[evt].indexOf(fn);
        if (ix !== -1) {
          this._listeners[evt].splice(ix, 1);
        }
        if (!this._listeners[evt].length) {
          this._listeners[evt] = null;
        }
      },
      emit: function emit(evt, data) {
        if (this._listeners[evt]) {
          this._listeners[evt].map(function (fn) {
            return fn(data);
          });
        }
      }
    }
  });
  window.__REACT_DEVTOOLS_GLOBAL_HOOK__.nativeObjectCreate = _create2.default;
  window.__REACT_DEVTOOLS_GLOBAL_HOOK__.nativeMap = _map2.default;
  window.__REACT_DEVTOOLS_GLOBAL_HOOK__.nativeWeakMap = _weakMap2.default;
  window.__REACT_DEVTOOLS_GLOBAL_HOOK__.nativeSet = _set2.default;
}

/*
var saveNativeValues = `
window.__REACT_DEVTOOLS_GLOBAL_HOOK__.nativeObjectCreate = Object.create;
window.__REACT_DEVTOOLS_GLOBAL_HOOK__.nativeMap = Map;
window.__REACT_DEVTOOLS_GLOBAL_HOOK__.nativeWeakMap = WeakMap;
window.__REACT_DEVTOOLS_GLOBAL_HOOK__.nativeSet = Set;
`;

var js = (
  ';(' + installGlobalReactHook.toString() + '(window))' +
  saveNativeValues
);

// This script runs before the <head> element is created, so we add the script
// to <html> instead.
var script = document.createElement('script');
script.textContent = js;
document.documentElement.appendChild(script);
script.parentNode.removeChild(script);
*/

module.exports = exports['default'];

/***/ })
/******/ ]);