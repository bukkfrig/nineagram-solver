(function(scope){
'use strict';

function F(arity, fun, wrapper) {
  wrapper.a = arity;
  wrapper.f = fun;
  return wrapper;
}

function F2(fun) {
  return F(2, fun, function(a) { return function(b) { return fun(a,b); }; })
}
function F3(fun) {
  return F(3, fun, function(a) {
    return function(b) { return function(c) { return fun(a, b, c); }; };
  });
}
function F4(fun) {
  return F(4, fun, function(a) { return function(b) { return function(c) {
    return function(d) { return fun(a, b, c, d); }; }; };
  });
}
function F5(fun) {
  return F(5, fun, function(a) { return function(b) { return function(c) {
    return function(d) { return function(e) { return fun(a, b, c, d, e); }; }; }; };
  });
}
function F6(fun) {
  return F(6, fun, function(a) { return function(b) { return function(c) {
    return function(d) { return function(e) { return function(f) {
    return fun(a, b, c, d, e, f); }; }; }; }; };
  });
}
function F7(fun) {
  return F(7, fun, function(a) { return function(b) { return function(c) {
    return function(d) { return function(e) { return function(f) {
    return function(g) { return fun(a, b, c, d, e, f, g); }; }; }; }; }; };
  });
}
function F8(fun) {
  return F(8, fun, function(a) { return function(b) { return function(c) {
    return function(d) { return function(e) { return function(f) {
    return function(g) { return function(h) {
    return fun(a, b, c, d, e, f, g, h); }; }; }; }; }; }; };
  });
}
function F9(fun) {
  return F(9, fun, function(a) { return function(b) { return function(c) {
    return function(d) { return function(e) { return function(f) {
    return function(g) { return function(h) { return function(i) {
    return fun(a, b, c, d, e, f, g, h, i); }; }; }; }; }; }; }; };
  });
}

function A2(fun, a, b) {
  return fun.a === 2 ? fun.f(a, b) : fun(a)(b);
}
function A3(fun, a, b, c) {
  return fun.a === 3 ? fun.f(a, b, c) : fun(a)(b)(c);
}
function A4(fun, a, b, c, d) {
  return fun.a === 4 ? fun.f(a, b, c, d) : fun(a)(b)(c)(d);
}
function A5(fun, a, b, c, d, e) {
  return fun.a === 5 ? fun.f(a, b, c, d, e) : fun(a)(b)(c)(d)(e);
}
function A6(fun, a, b, c, d, e, f) {
  return fun.a === 6 ? fun.f(a, b, c, d, e, f) : fun(a)(b)(c)(d)(e)(f);
}
function A7(fun, a, b, c, d, e, f, g) {
  return fun.a === 7 ? fun.f(a, b, c, d, e, f, g) : fun(a)(b)(c)(d)(e)(f)(g);
}
function A8(fun, a, b, c, d, e, f, g, h) {
  return fun.a === 8 ? fun.f(a, b, c, d, e, f, g, h) : fun(a)(b)(c)(d)(e)(f)(g)(h);
}
function A9(fun, a, b, c, d, e, f, g, h, i) {
  return fun.a === 9 ? fun.f(a, b, c, d, e, f, g, h, i) : fun(a)(b)(c)(d)(e)(f)(g)(h)(i);
}




// EQUALITY

function _Utils_eq(x, y)
{
	for (
		var pair, stack = [], isEqual = _Utils_eqHelp(x, y, 0, stack);
		isEqual && (pair = stack.pop());
		isEqual = _Utils_eqHelp(pair.a, pair.b, 0, stack)
		)
	{}

	return isEqual;
}

function _Utils_eqHelp(x, y, depth, stack)
{
	if (depth > 100)
	{
		stack.push(_Utils_Tuple2(x,y));
		return true;
	}

	if (x === y)
	{
		return true;
	}

	if (typeof x !== 'object' || x === null || y === null)
	{
		typeof x === 'function' && _Debug_crash(5);
		return false;
	}

	/**_UNUSED/
	if (x.$ === 'Set_elm_builtin')
	{
		x = $elm$core$Set$toList(x);
		y = $elm$core$Set$toList(y);
	}
	if (x.$ === 'RBNode_elm_builtin' || x.$ === 'RBEmpty_elm_builtin')
	{
		x = $elm$core$Dict$toList(x);
		y = $elm$core$Dict$toList(y);
	}
	//*/

	/**/
	if (x.$ < 0)
	{
		x = $elm$core$Dict$toList(x);
		y = $elm$core$Dict$toList(y);
	}
	//*/

	for (var key in x)
	{
		if (!_Utils_eqHelp(x[key], y[key], depth + 1, stack))
		{
			return false;
		}
	}
	return true;
}

var _Utils_equal = F2(_Utils_eq);
var _Utils_notEqual = F2(function(a, b) { return !_Utils_eq(a,b); });



// COMPARISONS

// Code in Generate/JavaScript.hs, Basics.js, and List.js depends on
// the particular integer values assigned to LT, EQ, and GT.

function _Utils_cmp(x, y, ord)
{
	if (typeof x !== 'object')
	{
		return x === y ? /*EQ*/ 0 : x < y ? /*LT*/ -1 : /*GT*/ 1;
	}

	/**_UNUSED/
	if (x instanceof String)
	{
		var a = x.valueOf();
		var b = y.valueOf();
		return a === b ? 0 : a < b ? -1 : 1;
	}
	//*/

	/**/
	if (typeof x.$ === 'undefined')
	//*/
	/**_UNUSED/
	if (x.$[0] === '#')
	//*/
	{
		return (ord = _Utils_cmp(x.a, y.a))
			? ord
			: (ord = _Utils_cmp(x.b, y.b))
				? ord
				: _Utils_cmp(x.c, y.c);
	}

	// traverse conses until end of a list or a mismatch
	for (; x.b && y.b && !(ord = _Utils_cmp(x.a, y.a)); x = x.b, y = y.b) {} // WHILE_CONSES
	return ord || (x.b ? /*GT*/ 1 : y.b ? /*LT*/ -1 : /*EQ*/ 0);
}

var _Utils_lt = F2(function(a, b) { return _Utils_cmp(a, b) < 0; });
var _Utils_le = F2(function(a, b) { return _Utils_cmp(a, b) < 1; });
var _Utils_gt = F2(function(a, b) { return _Utils_cmp(a, b) > 0; });
var _Utils_ge = F2(function(a, b) { return _Utils_cmp(a, b) >= 0; });

var _Utils_compare = F2(function(x, y)
{
	var n = _Utils_cmp(x, y);
	return n < 0 ? $elm$core$Basics$LT : n ? $elm$core$Basics$GT : $elm$core$Basics$EQ;
});


// COMMON VALUES

var _Utils_Tuple0 = 0;
var _Utils_Tuple0_UNUSED = { $: '#0' };

function _Utils_Tuple2(a, b) { return { a: a, b: b }; }
function _Utils_Tuple2_UNUSED(a, b) { return { $: '#2', a: a, b: b }; }

function _Utils_Tuple3(a, b, c) { return { a: a, b: b, c: c }; }
function _Utils_Tuple3_UNUSED(a, b, c) { return { $: '#3', a: a, b: b, c: c }; }

function _Utils_chr(c) { return c; }
function _Utils_chr_UNUSED(c) { return new String(c); }


// RECORDS

function _Utils_update(oldRecord, updatedFields)
{
	var newRecord = {};

	for (var key in oldRecord)
	{
		newRecord[key] = oldRecord[key];
	}

	for (var key in updatedFields)
	{
		newRecord[key] = updatedFields[key];
	}

	return newRecord;
}


// APPEND

var _Utils_append = F2(_Utils_ap);

function _Utils_ap(xs, ys)
{
	// append Strings
	if (typeof xs === 'string')
	{
		return xs + ys;
	}

	// append Lists
	if (!xs.b)
	{
		return ys;
	}
	var root = _List_Cons(xs.a, ys);
	xs = xs.b
	for (var curr = root; xs.b; xs = xs.b) // WHILE_CONS
	{
		curr = curr.b = _List_Cons(xs.a, ys);
	}
	return root;
}



var _List_Nil = { $: 0 };
var _List_Nil_UNUSED = { $: '[]' };

function _List_Cons(hd, tl) { return { $: 1, a: hd, b: tl }; }
function _List_Cons_UNUSED(hd, tl) { return { $: '::', a: hd, b: tl }; }


var _List_cons = F2(_List_Cons);

function _List_fromArray(arr)
{
	var out = _List_Nil;
	for (var i = arr.length; i--; )
	{
		out = _List_Cons(arr[i], out);
	}
	return out;
}

function _List_toArray(xs)
{
	for (var out = []; xs.b; xs = xs.b) // WHILE_CONS
	{
		out.push(xs.a);
	}
	return out;
}

var _List_map2 = F3(function(f, xs, ys)
{
	for (var arr = []; xs.b && ys.b; xs = xs.b, ys = ys.b) // WHILE_CONSES
	{
		arr.push(A2(f, xs.a, ys.a));
	}
	return _List_fromArray(arr);
});

var _List_map3 = F4(function(f, xs, ys, zs)
{
	for (var arr = []; xs.b && ys.b && zs.b; xs = xs.b, ys = ys.b, zs = zs.b) // WHILE_CONSES
	{
		arr.push(A3(f, xs.a, ys.a, zs.a));
	}
	return _List_fromArray(arr);
});

var _List_map4 = F5(function(f, ws, xs, ys, zs)
{
	for (var arr = []; ws.b && xs.b && ys.b && zs.b; ws = ws.b, xs = xs.b, ys = ys.b, zs = zs.b) // WHILE_CONSES
	{
		arr.push(A4(f, ws.a, xs.a, ys.a, zs.a));
	}
	return _List_fromArray(arr);
});

var _List_map5 = F6(function(f, vs, ws, xs, ys, zs)
{
	for (var arr = []; vs.b && ws.b && xs.b && ys.b && zs.b; vs = vs.b, ws = ws.b, xs = xs.b, ys = ys.b, zs = zs.b) // WHILE_CONSES
	{
		arr.push(A5(f, vs.a, ws.a, xs.a, ys.a, zs.a));
	}
	return _List_fromArray(arr);
});

var _List_sortBy = F2(function(f, xs)
{
	return _List_fromArray(_List_toArray(xs).sort(function(a, b) {
		return _Utils_cmp(f(a), f(b));
	}));
});

var _List_sortWith = F2(function(f, xs)
{
	return _List_fromArray(_List_toArray(xs).sort(function(a, b) {
		var ord = A2(f, a, b);
		return ord === $elm$core$Basics$EQ ? 0 : ord === $elm$core$Basics$LT ? -1 : 1;
	}));
});



var _JsArray_empty = [];

function _JsArray_singleton(value)
{
    return [value];
}

function _JsArray_length(array)
{
    return array.length;
}

var _JsArray_initialize = F3(function(size, offset, func)
{
    var result = new Array(size);

    for (var i = 0; i < size; i++)
    {
        result[i] = func(offset + i);
    }

    return result;
});

var _JsArray_initializeFromList = F2(function (max, ls)
{
    var result = new Array(max);

    for (var i = 0; i < max && ls.b; i++)
    {
        result[i] = ls.a;
        ls = ls.b;
    }

    result.length = i;
    return _Utils_Tuple2(result, ls);
});

var _JsArray_unsafeGet = F2(function(index, array)
{
    return array[index];
});

var _JsArray_unsafeSet = F3(function(index, value, array)
{
    var length = array.length;
    var result = new Array(length);

    for (var i = 0; i < length; i++)
    {
        result[i] = array[i];
    }

    result[index] = value;
    return result;
});

var _JsArray_push = F2(function(value, array)
{
    var length = array.length;
    var result = new Array(length + 1);

    for (var i = 0; i < length; i++)
    {
        result[i] = array[i];
    }

    result[length] = value;
    return result;
});

var _JsArray_foldl = F3(function(func, acc, array)
{
    var length = array.length;

    for (var i = 0; i < length; i++)
    {
        acc = A2(func, array[i], acc);
    }

    return acc;
});

var _JsArray_foldr = F3(function(func, acc, array)
{
    for (var i = array.length - 1; i >= 0; i--)
    {
        acc = A2(func, array[i], acc);
    }

    return acc;
});

var _JsArray_map = F2(function(func, array)
{
    var length = array.length;
    var result = new Array(length);

    for (var i = 0; i < length; i++)
    {
        result[i] = func(array[i]);
    }

    return result;
});

var _JsArray_indexedMap = F3(function(func, offset, array)
{
    var length = array.length;
    var result = new Array(length);

    for (var i = 0; i < length; i++)
    {
        result[i] = A2(func, offset + i, array[i]);
    }

    return result;
});

var _JsArray_slice = F3(function(from, to, array)
{
    return array.slice(from, to);
});

var _JsArray_appendN = F3(function(n, dest, source)
{
    var destLen = dest.length;
    var itemsToCopy = n - destLen;

    if (itemsToCopy > source.length)
    {
        itemsToCopy = source.length;
    }

    var size = destLen + itemsToCopy;
    var result = new Array(size);

    for (var i = 0; i < destLen; i++)
    {
        result[i] = dest[i];
    }

    for (var i = 0; i < itemsToCopy; i++)
    {
        result[i + destLen] = source[i];
    }

    return result;
});



// LOG

var _Debug_log = F2(function(tag, value)
{
	return value;
});

var _Debug_log_UNUSED = F2(function(tag, value)
{
	console.log(tag + ': ' + _Debug_toString(value));
	return value;
});


// TODOS

function _Debug_todo(moduleName, region)
{
	return function(message) {
		_Debug_crash(8, moduleName, region, message);
	};
}

function _Debug_todoCase(moduleName, region, value)
{
	return function(message) {
		_Debug_crash(9, moduleName, region, value, message);
	};
}


// TO STRING

function _Debug_toString(value)
{
	return '<internals>';
}

function _Debug_toString_UNUSED(value)
{
	return _Debug_toAnsiString(false, value);
}

function _Debug_toAnsiString(ansi, value)
{
	if (typeof value === 'function')
	{
		return _Debug_internalColor(ansi, '<function>');
	}

	if (typeof value === 'boolean')
	{
		return _Debug_ctorColor(ansi, value ? 'True' : 'False');
	}

	if (typeof value === 'number')
	{
		return _Debug_numberColor(ansi, value + '');
	}

	if (value instanceof String)
	{
		return _Debug_charColor(ansi, "'" + _Debug_addSlashes(value, true) + "'");
	}

	if (typeof value === 'string')
	{
		return _Debug_stringColor(ansi, '"' + _Debug_addSlashes(value, false) + '"');
	}

	if (typeof value === 'object' && '$' in value)
	{
		var tag = value.$;

		if (typeof tag === 'number')
		{
			return _Debug_internalColor(ansi, '<internals>');
		}

		if (tag[0] === '#')
		{
			var output = [];
			for (var k in value)
			{
				if (k === '$') continue;
				output.push(_Debug_toAnsiString(ansi, value[k]));
			}
			return '(' + output.join(',') + ')';
		}

		if (tag === 'Set_elm_builtin')
		{
			return _Debug_ctorColor(ansi, 'Set')
				+ _Debug_fadeColor(ansi, '.fromList') + ' '
				+ _Debug_toAnsiString(ansi, $elm$core$Set$toList(value));
		}

		if (tag === 'RBNode_elm_builtin' || tag === 'RBEmpty_elm_builtin')
		{
			return _Debug_ctorColor(ansi, 'Dict')
				+ _Debug_fadeColor(ansi, '.fromList') + ' '
				+ _Debug_toAnsiString(ansi, $elm$core$Dict$toList(value));
		}

		if (tag === 'Array_elm_builtin')
		{
			return _Debug_ctorColor(ansi, 'Array')
				+ _Debug_fadeColor(ansi, '.fromList') + ' '
				+ _Debug_toAnsiString(ansi, $elm$core$Array$toList(value));
		}

		if (tag === '::' || tag === '[]')
		{
			var output = '[';

			value.b && (output += _Debug_toAnsiString(ansi, value.a), value = value.b)

			for (; value.b; value = value.b) // WHILE_CONS
			{
				output += ',' + _Debug_toAnsiString(ansi, value.a);
			}
			return output + ']';
		}

		var output = '';
		for (var i in value)
		{
			if (i === '$') continue;
			var str = _Debug_toAnsiString(ansi, value[i]);
			var c0 = str[0];
			var parenless = c0 === '{' || c0 === '(' || c0 === '[' || c0 === '<' || c0 === '"' || str.indexOf(' ') < 0;
			output += ' ' + (parenless ? str : '(' + str + ')');
		}
		return _Debug_ctorColor(ansi, tag) + output;
	}

	if (typeof DataView === 'function' && value instanceof DataView)
	{
		return _Debug_stringColor(ansi, '<' + value.byteLength + ' bytes>');
	}

	if (typeof File === 'function' && value instanceof File)
	{
		return _Debug_internalColor(ansi, '<' + value.name + '>');
	}

	if (typeof value === 'object')
	{
		var output = [];
		for (var key in value)
		{
			var field = key[0] === '_' ? key.slice(1) : key;
			output.push(_Debug_fadeColor(ansi, field) + ' = ' + _Debug_toAnsiString(ansi, value[key]));
		}
		if (output.length === 0)
		{
			return '{}';
		}
		return '{ ' + output.join(', ') + ' }';
	}

	return _Debug_internalColor(ansi, '<internals>');
}

function _Debug_addSlashes(str, isChar)
{
	var s = str
		.replace(/\\/g, '\\\\')
		.replace(/\n/g, '\\n')
		.replace(/\t/g, '\\t')
		.replace(/\r/g, '\\r')
		.replace(/\v/g, '\\v')
		.replace(/\0/g, '\\0');

	if (isChar)
	{
		return s.replace(/\'/g, '\\\'');
	}
	else
	{
		return s.replace(/\"/g, '\\"');
	}
}

function _Debug_ctorColor(ansi, string)
{
	return ansi ? '\x1b[96m' + string + '\x1b[0m' : string;
}

function _Debug_numberColor(ansi, string)
{
	return ansi ? '\x1b[95m' + string + '\x1b[0m' : string;
}

function _Debug_stringColor(ansi, string)
{
	return ansi ? '\x1b[93m' + string + '\x1b[0m' : string;
}

function _Debug_charColor(ansi, string)
{
	return ansi ? '\x1b[92m' + string + '\x1b[0m' : string;
}

function _Debug_fadeColor(ansi, string)
{
	return ansi ? '\x1b[37m' + string + '\x1b[0m' : string;
}

function _Debug_internalColor(ansi, string)
{
	return ansi ? '\x1b[94m' + string + '\x1b[0m' : string;
}

function _Debug_toHexDigit(n)
{
	return String.fromCharCode(n < 10 ? 48 + n : 55 + n);
}


// CRASH


function _Debug_crash(identifier)
{
	throw new Error('https://github.com/elm/core/blob/1.0.0/hints/' + identifier + '.md');
}


function _Debug_crash_UNUSED(identifier, fact1, fact2, fact3, fact4)
{
	switch(identifier)
	{
		case 0:
			throw new Error('What node should I take over? In JavaScript I need something like:\n\n    Elm.Main.init({\n        node: document.getElementById("elm-node")\n    })\n\nYou need to do this with any Browser.sandbox or Browser.element program.');

		case 1:
			throw new Error('Browser.application programs cannot handle URLs like this:\n\n    ' + document.location.href + '\n\nWhat is the root? The root of your file system? Try looking at this program with `elm reactor` or some other server.');

		case 2:
			var jsonErrorString = fact1;
			throw new Error('Problem with the flags given to your Elm program on initialization.\n\n' + jsonErrorString);

		case 3:
			var portName = fact1;
			throw new Error('There can only be one port named `' + portName + '`, but your program has multiple.');

		case 4:
			var portName = fact1;
			var problem = fact2;
			throw new Error('Trying to send an unexpected type of value through port `' + portName + '`:\n' + problem);

		case 5:
			throw new Error('Trying to use `(==)` on functions.\nThere is no way to know if functions are "the same" in the Elm sense.\nRead more about this at https://package.elm-lang.org/packages/elm/core/latest/Basics#== which describes why it is this way and what the better version will look like.');

		case 6:
			var moduleName = fact1;
			throw new Error('Your page is loading multiple Elm scripts with a module named ' + moduleName + '. Maybe a duplicate script is getting loaded accidentally? If not, rename one of them so I know which is which!');

		case 8:
			var moduleName = fact1;
			var region = fact2;
			var message = fact3;
			throw new Error('TODO in module `' + moduleName + '` ' + _Debug_regionToString(region) + '\n\n' + message);

		case 9:
			var moduleName = fact1;
			var region = fact2;
			var value = fact3;
			var message = fact4;
			throw new Error(
				'TODO in module `' + moduleName + '` from the `case` expression '
				+ _Debug_regionToString(region) + '\n\nIt received the following value:\n\n    '
				+ _Debug_toString(value).replace('\n', '\n    ')
				+ '\n\nBut the branch that handles it says:\n\n    ' + message.replace('\n', '\n    ')
			);

		case 10:
			throw new Error('Bug in https://github.com/elm/virtual-dom/issues');

		case 11:
			throw new Error('Cannot perform mod 0. Division by zero error.');
	}
}

function _Debug_regionToString(region)
{
	if (region.T.G === region.Y.G)
	{
		return 'on line ' + region.T.G;
	}
	return 'on lines ' + region.T.G + ' through ' + region.Y.G;
}



// MATH

var _Basics_add = F2(function(a, b) { return a + b; });
var _Basics_sub = F2(function(a, b) { return a - b; });
var _Basics_mul = F2(function(a, b) { return a * b; });
var _Basics_fdiv = F2(function(a, b) { return a / b; });
var _Basics_idiv = F2(function(a, b) { return (a / b) | 0; });
var _Basics_pow = F2(Math.pow);

var _Basics_remainderBy = F2(function(b, a) { return a % b; });

// https://www.microsoft.com/en-us/research/wp-content/uploads/2016/02/divmodnote-letter.pdf
var _Basics_modBy = F2(function(modulus, x)
{
	var answer = x % modulus;
	return modulus === 0
		? _Debug_crash(11)
		:
	((answer > 0 && modulus < 0) || (answer < 0 && modulus > 0))
		? answer + modulus
		: answer;
});


// TRIGONOMETRY

var _Basics_pi = Math.PI;
var _Basics_e = Math.E;
var _Basics_cos = Math.cos;
var _Basics_sin = Math.sin;
var _Basics_tan = Math.tan;
var _Basics_acos = Math.acos;
var _Basics_asin = Math.asin;
var _Basics_atan = Math.atan;
var _Basics_atan2 = F2(Math.atan2);


// MORE MATH

function _Basics_toFloat(x) { return x; }
function _Basics_truncate(n) { return n | 0; }
function _Basics_isInfinite(n) { return n === Infinity || n === -Infinity; }

var _Basics_ceiling = Math.ceil;
var _Basics_floor = Math.floor;
var _Basics_round = Math.round;
var _Basics_sqrt = Math.sqrt;
var _Basics_log = Math.log;
var _Basics_isNaN = isNaN;


// BOOLEANS

function _Basics_not(bool) { return !bool; }
var _Basics_and = F2(function(a, b) { return a && b; });
var _Basics_or  = F2(function(a, b) { return a || b; });
var _Basics_xor = F2(function(a, b) { return a !== b; });



var _String_cons = F2(function(chr, str)
{
	return chr + str;
});

function _String_uncons(string)
{
	var word = string.charCodeAt(0);
	return word
		? $elm$core$Maybe$Just(
			0xD800 <= word && word <= 0xDBFF
				? _Utils_Tuple2(_Utils_chr(string[0] + string[1]), string.slice(2))
				: _Utils_Tuple2(_Utils_chr(string[0]), string.slice(1))
		)
		: $elm$core$Maybe$Nothing;
}

var _String_append = F2(function(a, b)
{
	return a + b;
});

function _String_length(str)
{
	return str.length;
}

var _String_map = F2(function(func, string)
{
	var len = string.length;
	var array = new Array(len);
	var i = 0;
	while (i < len)
	{
		var word = string.charCodeAt(i);
		if (0xD800 <= word && word <= 0xDBFF)
		{
			array[i] = func(_Utils_chr(string[i] + string[i+1]));
			i += 2;
			continue;
		}
		array[i] = func(_Utils_chr(string[i]));
		i++;
	}
	return array.join('');
});

var _String_filter = F2(function(isGood, str)
{
	var arr = [];
	var len = str.length;
	var i = 0;
	while (i < len)
	{
		var char = str[i];
		var word = str.charCodeAt(i);
		i++;
		if (0xD800 <= word && word <= 0xDBFF)
		{
			char += str[i];
			i++;
		}

		if (isGood(_Utils_chr(char)))
		{
			arr.push(char);
		}
	}
	return arr.join('');
});

function _String_reverse(str)
{
	var len = str.length;
	var arr = new Array(len);
	var i = 0;
	while (i < len)
	{
		var word = str.charCodeAt(i);
		if (0xD800 <= word && word <= 0xDBFF)
		{
			arr[len - i] = str[i + 1];
			i++;
			arr[len - i] = str[i - 1];
			i++;
		}
		else
		{
			arr[len - i] = str[i];
			i++;
		}
	}
	return arr.join('');
}

var _String_foldl = F3(function(func, state, string)
{
	var len = string.length;
	var i = 0;
	while (i < len)
	{
		var char = string[i];
		var word = string.charCodeAt(i);
		i++;
		if (0xD800 <= word && word <= 0xDBFF)
		{
			char += string[i];
			i++;
		}
		state = A2(func, _Utils_chr(char), state);
	}
	return state;
});

var _String_foldr = F3(function(func, state, string)
{
	var i = string.length;
	while (i--)
	{
		var char = string[i];
		var word = string.charCodeAt(i);
		if (0xDC00 <= word && word <= 0xDFFF)
		{
			i--;
			char = string[i] + char;
		}
		state = A2(func, _Utils_chr(char), state);
	}
	return state;
});

var _String_split = F2(function(sep, str)
{
	return str.split(sep);
});

var _String_join = F2(function(sep, strs)
{
	return strs.join(sep);
});

var _String_slice = F3(function(start, end, str) {
	return str.slice(start, end);
});

function _String_trim(str)
{
	return str.trim();
}

function _String_trimLeft(str)
{
	return str.replace(/^\s+/, '');
}

function _String_trimRight(str)
{
	return str.replace(/\s+$/, '');
}

function _String_words(str)
{
	return _List_fromArray(str.trim().split(/\s+/g));
}

function _String_lines(str)
{
	return _List_fromArray(str.split(/\r\n|\r|\n/g));
}

function _String_toUpper(str)
{
	return str.toUpperCase();
}

function _String_toLower(str)
{
	return str.toLowerCase();
}

var _String_any = F2(function(isGood, string)
{
	var i = string.length;
	while (i--)
	{
		var char = string[i];
		var word = string.charCodeAt(i);
		if (0xDC00 <= word && word <= 0xDFFF)
		{
			i--;
			char = string[i] + char;
		}
		if (isGood(_Utils_chr(char)))
		{
			return true;
		}
	}
	return false;
});

var _String_all = F2(function(isGood, string)
{
	var i = string.length;
	while (i--)
	{
		var char = string[i];
		var word = string.charCodeAt(i);
		if (0xDC00 <= word && word <= 0xDFFF)
		{
			i--;
			char = string[i] + char;
		}
		if (!isGood(_Utils_chr(char)))
		{
			return false;
		}
	}
	return true;
});

var _String_contains = F2(function(sub, str)
{
	return str.indexOf(sub) > -1;
});

var _String_startsWith = F2(function(sub, str)
{
	return str.indexOf(sub) === 0;
});

var _String_endsWith = F2(function(sub, str)
{
	return str.length >= sub.length &&
		str.lastIndexOf(sub) === str.length - sub.length;
});

var _String_indexes = F2(function(sub, str)
{
	var subLen = sub.length;

	if (subLen < 1)
	{
		return _List_Nil;
	}

	var i = 0;
	var is = [];

	while ((i = str.indexOf(sub, i)) > -1)
	{
		is.push(i);
		i = i + subLen;
	}

	return _List_fromArray(is);
});


// TO STRING

function _String_fromNumber(number)
{
	return number + '';
}


// INT CONVERSIONS

function _String_toInt(str)
{
	var total = 0;
	var code0 = str.charCodeAt(0);
	var start = code0 == 0x2B /* + */ || code0 == 0x2D /* - */ ? 1 : 0;

	for (var i = start; i < str.length; ++i)
	{
		var code = str.charCodeAt(i);
		if (code < 0x30 || 0x39 < code)
		{
			return $elm$core$Maybe$Nothing;
		}
		total = 10 * total + code - 0x30;
	}

	return i == start
		? $elm$core$Maybe$Nothing
		: $elm$core$Maybe$Just(code0 == 0x2D ? -total : total);
}


// FLOAT CONVERSIONS

function _String_toFloat(s)
{
	// check if it is a hex, octal, or binary number
	if (s.length === 0 || /[\sxbo]/.test(s))
	{
		return $elm$core$Maybe$Nothing;
	}
	var n = +s;
	// faster isNaN check
	return n === n ? $elm$core$Maybe$Just(n) : $elm$core$Maybe$Nothing;
}

function _String_fromList(chars)
{
	return _List_toArray(chars).join('');
}




function _Char_toCode(char)
{
	var code = char.charCodeAt(0);
	if (0xD800 <= code && code <= 0xDBFF)
	{
		return (code - 0xD800) * 0x400 + char.charCodeAt(1) - 0xDC00 + 0x10000
	}
	return code;
}

function _Char_fromCode(code)
{
	return _Utils_chr(
		(code < 0 || 0x10FFFF < code)
			? '\uFFFD'
			:
		(code <= 0xFFFF)
			? String.fromCharCode(code)
			:
		(code -= 0x10000,
			String.fromCharCode(Math.floor(code / 0x400) + 0xD800, code % 0x400 + 0xDC00)
		)
	);
}

function _Char_toUpper(char)
{
	return _Utils_chr(char.toUpperCase());
}

function _Char_toLower(char)
{
	return _Utils_chr(char.toLowerCase());
}

function _Char_toLocaleUpper(char)
{
	return _Utils_chr(char.toLocaleUpperCase());
}

function _Char_toLocaleLower(char)
{
	return _Utils_chr(char.toLocaleLowerCase());
}



/**_UNUSED/
function _Json_errorToString(error)
{
	return $elm$json$Json$Decode$errorToString(error);
}
//*/


// CORE DECODERS

function _Json_succeed(msg)
{
	return {
		$: 0,
		a: msg
	};
}

function _Json_fail(msg)
{
	return {
		$: 1,
		a: msg
	};
}

function _Json_decodePrim(decoder)
{
	return { $: 2, b: decoder };
}

var _Json_decodeInt = _Json_decodePrim(function(value) {
	return (typeof value !== 'number')
		? _Json_expecting('an INT', value)
		:
	(-2147483647 < value && value < 2147483647 && (value | 0) === value)
		? $elm$core$Result$Ok(value)
		:
	(isFinite(value) && !(value % 1))
		? $elm$core$Result$Ok(value)
		: _Json_expecting('an INT', value);
});

var _Json_decodeBool = _Json_decodePrim(function(value) {
	return (typeof value === 'boolean')
		? $elm$core$Result$Ok(value)
		: _Json_expecting('a BOOL', value);
});

var _Json_decodeFloat = _Json_decodePrim(function(value) {
	return (typeof value === 'number')
		? $elm$core$Result$Ok(value)
		: _Json_expecting('a FLOAT', value);
});

var _Json_decodeValue = _Json_decodePrim(function(value) {
	return $elm$core$Result$Ok(_Json_wrap(value));
});

var _Json_decodeString = _Json_decodePrim(function(value) {
	return (typeof value === 'string')
		? $elm$core$Result$Ok(value)
		: (value instanceof String)
			? $elm$core$Result$Ok(value + '')
			: _Json_expecting('a STRING', value);
});

function _Json_decodeList(decoder) { return { $: 3, b: decoder }; }
function _Json_decodeArray(decoder) { return { $: 4, b: decoder }; }

function _Json_decodeNull(value) { return { $: 5, c: value }; }

var _Json_decodeField = F2(function(field, decoder)
{
	return {
		$: 6,
		d: field,
		b: decoder
	};
});

var _Json_decodeIndex = F2(function(index, decoder)
{
	return {
		$: 7,
		e: index,
		b: decoder
	};
});

function _Json_decodeKeyValuePairs(decoder)
{
	return {
		$: 8,
		b: decoder
	};
}

function _Json_mapMany(f, decoders)
{
	return {
		$: 9,
		f: f,
		g: decoders
	};
}

var _Json_andThen = F2(function(callback, decoder)
{
	return {
		$: 10,
		b: decoder,
		h: callback
	};
});

function _Json_oneOf(decoders)
{
	return {
		$: 11,
		g: decoders
	};
}


// DECODING OBJECTS

var _Json_map1 = F2(function(f, d1)
{
	return _Json_mapMany(f, [d1]);
});

var _Json_map2 = F3(function(f, d1, d2)
{
	return _Json_mapMany(f, [d1, d2]);
});

var _Json_map3 = F4(function(f, d1, d2, d3)
{
	return _Json_mapMany(f, [d1, d2, d3]);
});

var _Json_map4 = F5(function(f, d1, d2, d3, d4)
{
	return _Json_mapMany(f, [d1, d2, d3, d4]);
});

var _Json_map5 = F6(function(f, d1, d2, d3, d4, d5)
{
	return _Json_mapMany(f, [d1, d2, d3, d4, d5]);
});

var _Json_map6 = F7(function(f, d1, d2, d3, d4, d5, d6)
{
	return _Json_mapMany(f, [d1, d2, d3, d4, d5, d6]);
});

var _Json_map7 = F8(function(f, d1, d2, d3, d4, d5, d6, d7)
{
	return _Json_mapMany(f, [d1, d2, d3, d4, d5, d6, d7]);
});

var _Json_map8 = F9(function(f, d1, d2, d3, d4, d5, d6, d7, d8)
{
	return _Json_mapMany(f, [d1, d2, d3, d4, d5, d6, d7, d8]);
});


// DECODE

var _Json_runOnString = F2(function(decoder, string)
{
	try
	{
		var value = JSON.parse(string);
		return _Json_runHelp(decoder, value);
	}
	catch (e)
	{
		return $elm$core$Result$Err(A2($elm$json$Json$Decode$Failure, 'This is not valid JSON! ' + e.message, _Json_wrap(string)));
	}
});

var _Json_run = F2(function(decoder, value)
{
	return _Json_runHelp(decoder, _Json_unwrap(value));
});

function _Json_runHelp(decoder, value)
{
	switch (decoder.$)
	{
		case 2:
			return decoder.b(value);

		case 5:
			return (value === null)
				? $elm$core$Result$Ok(decoder.c)
				: _Json_expecting('null', value);

		case 3:
			if (!_Json_isArray(value))
			{
				return _Json_expecting('a LIST', value);
			}
			return _Json_runArrayDecoder(decoder.b, value, _List_fromArray);

		case 4:
			if (!_Json_isArray(value))
			{
				return _Json_expecting('an ARRAY', value);
			}
			return _Json_runArrayDecoder(decoder.b, value, _Json_toElmArray);

		case 6:
			var field = decoder.d;
			if (typeof value !== 'object' || value === null || !(field in value))
			{
				return _Json_expecting('an OBJECT with a field named `' + field + '`', value);
			}
			var result = _Json_runHelp(decoder.b, value[field]);
			return ($elm$core$Result$isOk(result)) ? result : $elm$core$Result$Err(A2($elm$json$Json$Decode$Field, field, result.a));

		case 7:
			var index = decoder.e;
			if (!_Json_isArray(value))
			{
				return _Json_expecting('an ARRAY', value);
			}
			if (index >= value.length)
			{
				return _Json_expecting('a LONGER array. Need index ' + index + ' but only see ' + value.length + ' entries', value);
			}
			var result = _Json_runHelp(decoder.b, value[index]);
			return ($elm$core$Result$isOk(result)) ? result : $elm$core$Result$Err(A2($elm$json$Json$Decode$Index, index, result.a));

		case 8:
			if (typeof value !== 'object' || value === null || _Json_isArray(value))
			{
				return _Json_expecting('an OBJECT', value);
			}

			var keyValuePairs = _List_Nil;
			// TODO test perf of Object.keys and switch when support is good enough
			for (var key in value)
			{
				if (value.hasOwnProperty(key))
				{
					var result = _Json_runHelp(decoder.b, value[key]);
					if (!$elm$core$Result$isOk(result))
					{
						return $elm$core$Result$Err(A2($elm$json$Json$Decode$Field, key, result.a));
					}
					keyValuePairs = _List_Cons(_Utils_Tuple2(key, result.a), keyValuePairs);
				}
			}
			return $elm$core$Result$Ok($elm$core$List$reverse(keyValuePairs));

		case 9:
			var answer = decoder.f;
			var decoders = decoder.g;
			for (var i = 0; i < decoders.length; i++)
			{
				var result = _Json_runHelp(decoders[i], value);
				if (!$elm$core$Result$isOk(result))
				{
					return result;
				}
				answer = answer(result.a);
			}
			return $elm$core$Result$Ok(answer);

		case 10:
			var result = _Json_runHelp(decoder.b, value);
			return (!$elm$core$Result$isOk(result))
				? result
				: _Json_runHelp(decoder.h(result.a), value);

		case 11:
			var errors = _List_Nil;
			for (var temp = decoder.g; temp.b; temp = temp.b) // WHILE_CONS
			{
				var result = _Json_runHelp(temp.a, value);
				if ($elm$core$Result$isOk(result))
				{
					return result;
				}
				errors = _List_Cons(result.a, errors);
			}
			return $elm$core$Result$Err($elm$json$Json$Decode$OneOf($elm$core$List$reverse(errors)));

		case 1:
			return $elm$core$Result$Err(A2($elm$json$Json$Decode$Failure, decoder.a, _Json_wrap(value)));

		case 0:
			return $elm$core$Result$Ok(decoder.a);
	}
}

function _Json_runArrayDecoder(decoder, value, toElmValue)
{
	var len = value.length;
	var array = new Array(len);
	for (var i = 0; i < len; i++)
	{
		var result = _Json_runHelp(decoder, value[i]);
		if (!$elm$core$Result$isOk(result))
		{
			return $elm$core$Result$Err(A2($elm$json$Json$Decode$Index, i, result.a));
		}
		array[i] = result.a;
	}
	return $elm$core$Result$Ok(toElmValue(array));
}

function _Json_isArray(value)
{
	return Array.isArray(value) || (typeof FileList !== 'undefined' && value instanceof FileList);
}

function _Json_toElmArray(array)
{
	return A2($elm$core$Array$initialize, array.length, function(i) { return array[i]; });
}

function _Json_expecting(type, value)
{
	return $elm$core$Result$Err(A2($elm$json$Json$Decode$Failure, 'Expecting ' + type, _Json_wrap(value)));
}


// EQUALITY

function _Json_equality(x, y)
{
	if (x === y)
	{
		return true;
	}

	if (x.$ !== y.$)
	{
		return false;
	}

	switch (x.$)
	{
		case 0:
		case 1:
			return x.a === y.a;

		case 2:
			return x.b === y.b;

		case 5:
			return x.c === y.c;

		case 3:
		case 4:
		case 8:
			return _Json_equality(x.b, y.b);

		case 6:
			return x.d === y.d && _Json_equality(x.b, y.b);

		case 7:
			return x.e === y.e && _Json_equality(x.b, y.b);

		case 9:
			return x.f === y.f && _Json_listEquality(x.g, y.g);

		case 10:
			return x.h === y.h && _Json_equality(x.b, y.b);

		case 11:
			return _Json_listEquality(x.g, y.g);
	}
}

function _Json_listEquality(aDecoders, bDecoders)
{
	var len = aDecoders.length;
	if (len !== bDecoders.length)
	{
		return false;
	}
	for (var i = 0; i < len; i++)
	{
		if (!_Json_equality(aDecoders[i], bDecoders[i]))
		{
			return false;
		}
	}
	return true;
}


// ENCODE

var _Json_encode = F2(function(indentLevel, value)
{
	return JSON.stringify(_Json_unwrap(value), null, indentLevel) + '';
});

function _Json_wrap_UNUSED(value) { return { $: 0, a: value }; }
function _Json_unwrap_UNUSED(value) { return value.a; }

function _Json_wrap(value) { return value; }
function _Json_unwrap(value) { return value; }

function _Json_emptyArray() { return []; }
function _Json_emptyObject() { return {}; }

var _Json_addField = F3(function(key, value, object)
{
	object[key] = _Json_unwrap(value);
	return object;
});

function _Json_addEntry(func)
{
	return F2(function(entry, array)
	{
		array.push(_Json_unwrap(func(entry)));
		return array;
	});
}

var _Json_encodeNull = _Json_wrap(null);



// TASKS

function _Scheduler_succeed(value)
{
	return {
		$: 0,
		a: value
	};
}

function _Scheduler_fail(error)
{
	return {
		$: 1,
		a: error
	};
}

function _Scheduler_binding(callback)
{
	return {
		$: 2,
		b: callback,
		c: null
	};
}

var _Scheduler_andThen = F2(function(callback, task)
{
	return {
		$: 3,
		b: callback,
		d: task
	};
});

var _Scheduler_onError = F2(function(callback, task)
{
	return {
		$: 4,
		b: callback,
		d: task
	};
});

function _Scheduler_receive(callback)
{
	return {
		$: 5,
		b: callback
	};
}


// PROCESSES

var _Scheduler_guid = 0;

function _Scheduler_rawSpawn(task)
{
	var proc = {
		$: 0,
		e: _Scheduler_guid++,
		f: task,
		g: null,
		h: []
	};

	_Scheduler_enqueue(proc);

	return proc;
}

function _Scheduler_spawn(task)
{
	return _Scheduler_binding(function(callback) {
		callback(_Scheduler_succeed(_Scheduler_rawSpawn(task)));
	});
}

function _Scheduler_rawSend(proc, msg)
{
	proc.h.push(msg);
	_Scheduler_enqueue(proc);
}

var _Scheduler_send = F2(function(proc, msg)
{
	return _Scheduler_binding(function(callback) {
		_Scheduler_rawSend(proc, msg);
		callback(_Scheduler_succeed(_Utils_Tuple0));
	});
});

function _Scheduler_kill(proc)
{
	return _Scheduler_binding(function(callback) {
		var task = proc.f;
		if (task.$ === 2 && task.c)
		{
			task.c();
		}

		proc.f = null;

		callback(_Scheduler_succeed(_Utils_Tuple0));
	});
}


/* STEP PROCESSES

type alias Process =
  { $ : tag
  , id : unique_id
  , root : Task
  , stack : null | { $: SUCCEED | FAIL, a: callback, b: stack }
  , mailbox : [msg]
  }

*/


var _Scheduler_working = false;
var _Scheduler_queue = [];


function _Scheduler_enqueue(proc)
{
	_Scheduler_queue.push(proc);
	if (_Scheduler_working)
	{
		return;
	}
	_Scheduler_working = true;
	while (proc = _Scheduler_queue.shift())
	{
		_Scheduler_step(proc);
	}
	_Scheduler_working = false;
}


function _Scheduler_step(proc)
{
	while (proc.f)
	{
		var rootTag = proc.f.$;
		if (rootTag === 0 || rootTag === 1)
		{
			while (proc.g && proc.g.$ !== rootTag)
			{
				proc.g = proc.g.i;
			}
			if (!proc.g)
			{
				return;
			}
			proc.f = proc.g.b(proc.f.a);
			proc.g = proc.g.i;
		}
		else if (rootTag === 2)
		{
			proc.f.c = proc.f.b(function(newRoot) {
				proc.f = newRoot;
				_Scheduler_enqueue(proc);
			});
			return;
		}
		else if (rootTag === 5)
		{
			if (proc.h.length === 0)
			{
				return;
			}
			proc.f = proc.f.b(proc.h.shift());
		}
		else // if (rootTag === 3 || rootTag === 4)
		{
			proc.g = {
				$: rootTag === 3 ? 0 : 1,
				b: proc.f.b,
				i: proc.g
			};
			proc.f = proc.f.d;
		}
	}
}



function _Process_sleep(time)
{
	return _Scheduler_binding(function(callback) {
		var id = setTimeout(function() {
			callback(_Scheduler_succeed(_Utils_Tuple0));
		}, time);

		return function() { clearTimeout(id); };
	});
}




// PROGRAMS


var _Platform_worker = F4(function(impl, flagDecoder, debugMetadata, args)
{
	return _Platform_initialize(
		flagDecoder,
		args,
		impl.aD,
		impl.aM,
		impl.aK,
		function() { return function() {} }
	);
});



// INITIALIZE A PROGRAM


function _Platform_initialize(flagDecoder, args, init, update, subscriptions, stepperBuilder)
{
	var result = A2(_Json_run, flagDecoder, _Json_wrap(args ? args['flags'] : undefined));
	$elm$core$Result$isOk(result) || _Debug_crash(2 /**_UNUSED/, _Json_errorToString(result.a) /**/);
	var managers = {};
	result = init(result.a);
	var model = result.a;
	var stepper = stepperBuilder(sendToApp, model);
	var ports = _Platform_setupEffects(managers, sendToApp);

	function sendToApp(msg, viewMetadata)
	{
		result = A2(update, msg, model);
		stepper(model = result.a, viewMetadata);
		_Platform_dispatchEffects(managers, result.b, subscriptions(model));
	}

	_Platform_dispatchEffects(managers, result.b, subscriptions(model));

	return ports ? { ports: ports } : {};
}



// TRACK PRELOADS
//
// This is used by code in elm/browser and elm/http
// to register any HTTP requests that are triggered by init.
//


var _Platform_preload;


function _Platform_registerPreload(url)
{
	_Platform_preload.add(url);
}



// EFFECT MANAGERS


var _Platform_effectManagers = {};


function _Platform_setupEffects(managers, sendToApp)
{
	var ports;

	// setup all necessary effect managers
	for (var key in _Platform_effectManagers)
	{
		var manager = _Platform_effectManagers[key];

		if (manager.a)
		{
			ports = ports || {};
			ports[key] = manager.a(key, sendToApp);
		}

		managers[key] = _Platform_instantiateManager(manager, sendToApp);
	}

	return ports;
}


function _Platform_createManager(init, onEffects, onSelfMsg, cmdMap, subMap)
{
	return {
		b: init,
		c: onEffects,
		d: onSelfMsg,
		e: cmdMap,
		f: subMap
	};
}


function _Platform_instantiateManager(info, sendToApp)
{
	var router = {
		g: sendToApp,
		h: undefined
	};

	var onEffects = info.c;
	var onSelfMsg = info.d;
	var cmdMap = info.e;
	var subMap = info.f;

	function loop(state)
	{
		return A2(_Scheduler_andThen, loop, _Scheduler_receive(function(msg)
		{
			var value = msg.a;

			if (msg.$ === 0)
			{
				return A3(onSelfMsg, router, value, state);
			}

			return cmdMap && subMap
				? A4(onEffects, router, value.i, value.j, state)
				: A3(onEffects, router, cmdMap ? value.i : value.j, state);
		}));
	}

	return router.h = _Scheduler_rawSpawn(A2(_Scheduler_andThen, loop, info.b));
}



// ROUTING


var _Platform_sendToApp = F2(function(router, msg)
{
	return _Scheduler_binding(function(callback)
	{
		router.g(msg);
		callback(_Scheduler_succeed(_Utils_Tuple0));
	});
});


var _Platform_sendToSelf = F2(function(router, msg)
{
	return A2(_Scheduler_send, router.h, {
		$: 0,
		a: msg
	});
});



// BAGS


function _Platform_leaf(home)
{
	return function(value)
	{
		return {
			$: 1,
			k: home,
			l: value
		};
	};
}


function _Platform_batch(list)
{
	return {
		$: 2,
		m: list
	};
}


var _Platform_map = F2(function(tagger, bag)
{
	return {
		$: 3,
		n: tagger,
		o: bag
	}
});



// PIPE BAGS INTO EFFECT MANAGERS


function _Platform_dispatchEffects(managers, cmdBag, subBag)
{
	var effectsDict = {};
	_Platform_gatherEffects(true, cmdBag, effectsDict, null);
	_Platform_gatherEffects(false, subBag, effectsDict, null);

	for (var home in managers)
	{
		_Scheduler_rawSend(managers[home], {
			$: 'fx',
			a: effectsDict[home] || { i: _List_Nil, j: _List_Nil }
		});
	}
}


function _Platform_gatherEffects(isCmd, bag, effectsDict, taggers)
{
	switch (bag.$)
	{
		case 1:
			var home = bag.k;
			var effect = _Platform_toEffect(isCmd, home, taggers, bag.l);
			effectsDict[home] = _Platform_insert(isCmd, effect, effectsDict[home]);
			return;

		case 2:
			for (var list = bag.m; list.b; list = list.b) // WHILE_CONS
			{
				_Platform_gatherEffects(isCmd, list.a, effectsDict, taggers);
			}
			return;

		case 3:
			_Platform_gatherEffects(isCmd, bag.o, effectsDict, {
				p: bag.n,
				q: taggers
			});
			return;
	}
}


function _Platform_toEffect(isCmd, home, taggers, value)
{
	function applyTaggers(x)
	{
		for (var temp = taggers; temp; temp = temp.q)
		{
			x = temp.p(x);
		}
		return x;
	}

	var map = isCmd
		? _Platform_effectManagers[home].e
		: _Platform_effectManagers[home].f;

	return A2(map, applyTaggers, value)
}


function _Platform_insert(isCmd, newEffect, effects)
{
	effects = effects || { i: _List_Nil, j: _List_Nil };

	isCmd
		? (effects.i = _List_Cons(newEffect, effects.i))
		: (effects.j = _List_Cons(newEffect, effects.j));

	return effects;
}



// PORTS


function _Platform_checkPortName(name)
{
	if (_Platform_effectManagers[name])
	{
		_Debug_crash(3, name)
	}
}



// OUTGOING PORTS


function _Platform_outgoingPort(name, converter)
{
	_Platform_checkPortName(name);
	_Platform_effectManagers[name] = {
		e: _Platform_outgoingPortMap,
		r: converter,
		a: _Platform_setupOutgoingPort
	};
	return _Platform_leaf(name);
}


var _Platform_outgoingPortMap = F2(function(tagger, value) { return value; });


function _Platform_setupOutgoingPort(name)
{
	var subs = [];
	var converter = _Platform_effectManagers[name].r;

	// CREATE MANAGER

	var init = _Process_sleep(0);

	_Platform_effectManagers[name].b = init;
	_Platform_effectManagers[name].c = F3(function(router, cmdList, state)
	{
		for ( ; cmdList.b; cmdList = cmdList.b) // WHILE_CONS
		{
			// grab a separate reference to subs in case unsubscribe is called
			var currentSubs = subs;
			var value = _Json_unwrap(converter(cmdList.a));
			for (var i = 0; i < currentSubs.length; i++)
			{
				currentSubs[i](value);
			}
		}
		return init;
	});

	// PUBLIC API

	function subscribe(callback)
	{
		subs.push(callback);
	}

	function unsubscribe(callback)
	{
		// copy subs into a new array in case unsubscribe is called within a
		// subscribed callback
		subs = subs.slice();
		var index = subs.indexOf(callback);
		if (index >= 0)
		{
			subs.splice(index, 1);
		}
	}

	return {
		subscribe: subscribe,
		unsubscribe: unsubscribe
	};
}



// INCOMING PORTS


function _Platform_incomingPort(name, converter)
{
	_Platform_checkPortName(name);
	_Platform_effectManagers[name] = {
		f: _Platform_incomingPortMap,
		r: converter,
		a: _Platform_setupIncomingPort
	};
	return _Platform_leaf(name);
}


var _Platform_incomingPortMap = F2(function(tagger, finalTagger)
{
	return function(value)
	{
		return tagger(finalTagger(value));
	};
});


function _Platform_setupIncomingPort(name, sendToApp)
{
	var subs = _List_Nil;
	var converter = _Platform_effectManagers[name].r;

	// CREATE MANAGER

	var init = _Scheduler_succeed(null);

	_Platform_effectManagers[name].b = init;
	_Platform_effectManagers[name].c = F3(function(router, subList, state)
	{
		subs = subList;
		return init;
	});

	// PUBLIC API

	function send(incomingValue)
	{
		var result = A2(_Json_run, converter, _Json_wrap(incomingValue));

		$elm$core$Result$isOk(result) || _Debug_crash(4, name, result.a);

		var value = result.a;
		for (var temp = subs; temp.b; temp = temp.b) // WHILE_CONS
		{
			sendToApp(temp.a(value));
		}
	}

	return { send: send };
}



// EXPORT ELM MODULES
//
// Have DEBUG and PROD versions so that we can (1) give nicer errors in
// debug mode and (2) not pay for the bits needed for that in prod mode.
//


function _Platform_export(exports)
{
	scope['Elm']
		? _Platform_mergeExportsProd(scope['Elm'], exports)
		: scope['Elm'] = exports;
}


function _Platform_mergeExportsProd(obj, exports)
{
	for (var name in exports)
	{
		(name in obj)
			? (name == 'init')
				? _Debug_crash(6)
				: _Platform_mergeExportsProd(obj[name], exports[name])
			: (obj[name] = exports[name]);
	}
}


function _Platform_export_UNUSED(exports)
{
	scope['Elm']
		? _Platform_mergeExportsDebug('Elm', scope['Elm'], exports)
		: scope['Elm'] = exports;
}


function _Platform_mergeExportsDebug(moduleName, obj, exports)
{
	for (var name in exports)
	{
		(name in obj)
			? (name == 'init')
				? _Debug_crash(6, moduleName)
				: _Platform_mergeExportsDebug(moduleName + '.' + name, obj[name], exports[name])
			: (obj[name] = exports[name]);
	}
}




// HELPERS


var _VirtualDom_divertHrefToApp;

var _VirtualDom_doc = typeof document !== 'undefined' ? document : {};


function _VirtualDom_appendChild(parent, child)
{
	parent.appendChild(child);
}

var _VirtualDom_init = F4(function(virtualNode, flagDecoder, debugMetadata, args)
{
	// NOTE: this function needs _Platform_export available to work

	/**/
	var node = args['node'];
	//*/
	/**_UNUSED/
	var node = args && args['node'] ? args['node'] : _Debug_crash(0);
	//*/

	node.parentNode.replaceChild(
		_VirtualDom_render(virtualNode, function() {}),
		node
	);

	return {};
});



// TEXT


function _VirtualDom_text(string)
{
	return {
		$: 0,
		a: string
	};
}



// NODE


var _VirtualDom_nodeNS = F2(function(namespace, tag)
{
	return F2(function(factList, kidList)
	{
		for (var kids = [], descendantsCount = 0; kidList.b; kidList = kidList.b) // WHILE_CONS
		{
			var kid = kidList.a;
			descendantsCount += (kid.b || 0);
			kids.push(kid);
		}
		descendantsCount += kids.length;

		return {
			$: 1,
			c: tag,
			d: _VirtualDom_organizeFacts(factList),
			e: kids,
			f: namespace,
			b: descendantsCount
		};
	});
});


var _VirtualDom_node = _VirtualDom_nodeNS(undefined);



// KEYED NODE


var _VirtualDom_keyedNodeNS = F2(function(namespace, tag)
{
	return F2(function(factList, kidList)
	{
		for (var kids = [], descendantsCount = 0; kidList.b; kidList = kidList.b) // WHILE_CONS
		{
			var kid = kidList.a;
			descendantsCount += (kid.b.b || 0);
			kids.push(kid);
		}
		descendantsCount += kids.length;

		return {
			$: 2,
			c: tag,
			d: _VirtualDom_organizeFacts(factList),
			e: kids,
			f: namespace,
			b: descendantsCount
		};
	});
});


var _VirtualDom_keyedNode = _VirtualDom_keyedNodeNS(undefined);



// CUSTOM


function _VirtualDom_custom(factList, model, render, diff)
{
	return {
		$: 3,
		d: _VirtualDom_organizeFacts(factList),
		g: model,
		h: render,
		i: diff
	};
}



// MAP


var _VirtualDom_map = F2(function(tagger, node)
{
	return {
		$: 4,
		j: tagger,
		k: node,
		b: 1 + (node.b || 0)
	};
});



// LAZY


function _VirtualDom_thunk(refs, thunk)
{
	return {
		$: 5,
		l: refs,
		m: thunk,
		k: undefined
	};
}

var _VirtualDom_lazy = F2(function(func, a)
{
	return _VirtualDom_thunk([func, a], function() {
		return func(a);
	});
});

var _VirtualDom_lazy2 = F3(function(func, a, b)
{
	return _VirtualDom_thunk([func, a, b], function() {
		return A2(func, a, b);
	});
});

var _VirtualDom_lazy3 = F4(function(func, a, b, c)
{
	return _VirtualDom_thunk([func, a, b, c], function() {
		return A3(func, a, b, c);
	});
});

var _VirtualDom_lazy4 = F5(function(func, a, b, c, d)
{
	return _VirtualDom_thunk([func, a, b, c, d], function() {
		return A4(func, a, b, c, d);
	});
});

var _VirtualDom_lazy5 = F6(function(func, a, b, c, d, e)
{
	return _VirtualDom_thunk([func, a, b, c, d, e], function() {
		return A5(func, a, b, c, d, e);
	});
});

var _VirtualDom_lazy6 = F7(function(func, a, b, c, d, e, f)
{
	return _VirtualDom_thunk([func, a, b, c, d, e, f], function() {
		return A6(func, a, b, c, d, e, f);
	});
});

var _VirtualDom_lazy7 = F8(function(func, a, b, c, d, e, f, g)
{
	return _VirtualDom_thunk([func, a, b, c, d, e, f, g], function() {
		return A7(func, a, b, c, d, e, f, g);
	});
});

var _VirtualDom_lazy8 = F9(function(func, a, b, c, d, e, f, g, h)
{
	return _VirtualDom_thunk([func, a, b, c, d, e, f, g, h], function() {
		return A8(func, a, b, c, d, e, f, g, h);
	});
});



// FACTS


var _VirtualDom_on = F2(function(key, handler)
{
	return {
		$: 'a0',
		n: key,
		o: handler
	};
});
var _VirtualDom_style = F2(function(key, value)
{
	return {
		$: 'a1',
		n: key,
		o: value
	};
});
var _VirtualDom_property = F2(function(key, value)
{
	return {
		$: 'a2',
		n: key,
		o: value
	};
});
var _VirtualDom_attribute = F2(function(key, value)
{
	return {
		$: 'a3',
		n: key,
		o: value
	};
});
var _VirtualDom_attributeNS = F3(function(namespace, key, value)
{
	return {
		$: 'a4',
		n: key,
		o: { f: namespace, o: value }
	};
});



// XSS ATTACK VECTOR CHECKS


function _VirtualDom_noScript(tag)
{
	return tag == 'script' ? 'p' : tag;
}

function _VirtualDom_noOnOrFormAction(key)
{
	return /^(on|formAction$)/i.test(key) ? 'data-' + key : key;
}

function _VirtualDom_noInnerHtmlOrFormAction(key)
{
	return key == 'innerHTML' || key == 'formAction' ? 'data-' + key : key;
}

function _VirtualDom_noJavaScriptUri(value)
{
	return /^javascript:/i.test(value.replace(/\s/g,'')) ? '' : value;
}

function _VirtualDom_noJavaScriptUri_UNUSED(value)
{
	return /^javascript:/i.test(value.replace(/\s/g,''))
		? 'javascript:alert("This is an XSS vector. Please use ports or web components instead.")'
		: value;
}

function _VirtualDom_noJavaScriptOrHtmlUri(value)
{
	return /^\s*(javascript:|data:text\/html)/i.test(value) ? '' : value;
}

function _VirtualDom_noJavaScriptOrHtmlUri_UNUSED(value)
{
	return /^\s*(javascript:|data:text\/html)/i.test(value)
		? 'javascript:alert("This is an XSS vector. Please use ports or web components instead.")'
		: value;
}



// MAP FACTS


var _VirtualDom_mapAttribute = F2(function(func, attr)
{
	return (attr.$ === 'a0')
		? A2(_VirtualDom_on, attr.n, _VirtualDom_mapHandler(func, attr.o))
		: attr;
});

function _VirtualDom_mapHandler(func, handler)
{
	var tag = $elm$virtual_dom$VirtualDom$toHandlerInt(handler);

	// 0 = Normal
	// 1 = MayStopPropagation
	// 2 = MayPreventDefault
	// 3 = Custom

	return {
		$: handler.$,
		a:
			!tag
				? A2($elm$json$Json$Decode$map, func, handler.a)
				:
			A3($elm$json$Json$Decode$map2,
				tag < 3
					? _VirtualDom_mapEventTuple
					: _VirtualDom_mapEventRecord,
				$elm$json$Json$Decode$succeed(func),
				handler.a
			)
	};
}

var _VirtualDom_mapEventTuple = F2(function(func, tuple)
{
	return _Utils_Tuple2(func(tuple.a), tuple.b);
});

var _VirtualDom_mapEventRecord = F2(function(func, record)
{
	return {
		q: func(record.q),
		U: record.U,
		R: record.R
	}
});



// ORGANIZE FACTS


function _VirtualDom_organizeFacts(factList)
{
	for (var facts = {}; factList.b; factList = factList.b) // WHILE_CONS
	{
		var entry = factList.a;

		var tag = entry.$;
		var key = entry.n;
		var value = entry.o;

		if (tag === 'a2')
		{
			(key === 'className')
				? _VirtualDom_addClass(facts, key, _Json_unwrap(value))
				: facts[key] = _Json_unwrap(value);

			continue;
		}

		var subFacts = facts[tag] || (facts[tag] = {});
		(tag === 'a3' && key === 'class')
			? _VirtualDom_addClass(subFacts, key, value)
			: subFacts[key] = value;
	}

	return facts;
}

function _VirtualDom_addClass(object, key, newClass)
{
	var classes = object[key];
	object[key] = classes ? classes + ' ' + newClass : newClass;
}



// RENDER


function _VirtualDom_render(vNode, eventNode)
{
	var tag = vNode.$;

	if (tag === 5)
	{
		return _VirtualDom_render(vNode.k || (vNode.k = vNode.m()), eventNode);
	}

	if (tag === 0)
	{
		return _VirtualDom_doc.createTextNode(vNode.a);
	}

	if (tag === 4)
	{
		var subNode = vNode.k;
		var tagger = vNode.j;

		while (subNode.$ === 4)
		{
			typeof tagger !== 'object'
				? tagger = [tagger, subNode.j]
				: tagger.push(subNode.j);

			subNode = subNode.k;
		}

		var subEventRoot = { j: tagger, p: eventNode };
		var domNode = _VirtualDom_render(subNode, subEventRoot);
		domNode.elm_event_node_ref = subEventRoot;
		return domNode;
	}

	if (tag === 3)
	{
		var domNode = vNode.h(vNode.g);
		_VirtualDom_applyFacts(domNode, eventNode, vNode.d);
		return domNode;
	}

	// at this point `tag` must be 1 or 2

	var domNode = vNode.f
		? _VirtualDom_doc.createElementNS(vNode.f, vNode.c)
		: _VirtualDom_doc.createElement(vNode.c);

	if (_VirtualDom_divertHrefToApp && vNode.c == 'a')
	{
		domNode.addEventListener('click', _VirtualDom_divertHrefToApp(domNode));
	}

	_VirtualDom_applyFacts(domNode, eventNode, vNode.d);

	for (var kids = vNode.e, i = 0; i < kids.length; i++)
	{
		_VirtualDom_appendChild(domNode, _VirtualDom_render(tag === 1 ? kids[i] : kids[i].b, eventNode));
	}

	return domNode;
}



// APPLY FACTS


function _VirtualDom_applyFacts(domNode, eventNode, facts)
{
	for (var key in facts)
	{
		var value = facts[key];

		key === 'a1'
			? _VirtualDom_applyStyles(domNode, value)
			:
		key === 'a0'
			? _VirtualDom_applyEvents(domNode, eventNode, value)
			:
		key === 'a3'
			? _VirtualDom_applyAttrs(domNode, value)
			:
		key === 'a4'
			? _VirtualDom_applyAttrsNS(domNode, value)
			:
		((key !== 'value' && key !== 'checked') || domNode[key] !== value) && (domNode[key] = value);
	}
}



// APPLY STYLES


function _VirtualDom_applyStyles(domNode, styles)
{
	var domNodeStyle = domNode.style;

	for (var key in styles)
	{
		domNodeStyle[key] = styles[key];
	}
}



// APPLY ATTRS


function _VirtualDom_applyAttrs(domNode, attrs)
{
	for (var key in attrs)
	{
		var value = attrs[key];
		typeof value !== 'undefined'
			? domNode.setAttribute(key, value)
			: domNode.removeAttribute(key);
	}
}



// APPLY NAMESPACED ATTRS


function _VirtualDom_applyAttrsNS(domNode, nsAttrs)
{
	for (var key in nsAttrs)
	{
		var pair = nsAttrs[key];
		var namespace = pair.f;
		var value = pair.o;

		typeof value !== 'undefined'
			? domNode.setAttributeNS(namespace, key, value)
			: domNode.removeAttributeNS(namespace, key);
	}
}



// APPLY EVENTS


function _VirtualDom_applyEvents(domNode, eventNode, events)
{
	var allCallbacks = domNode.elmFs || (domNode.elmFs = {});

	for (var key in events)
	{
		var newHandler = events[key];
		var oldCallback = allCallbacks[key];

		if (!newHandler)
		{
			domNode.removeEventListener(key, oldCallback);
			allCallbacks[key] = undefined;
			continue;
		}

		if (oldCallback)
		{
			var oldHandler = oldCallback.q;
			if (oldHandler.$ === newHandler.$)
			{
				oldCallback.q = newHandler;
				continue;
			}
			domNode.removeEventListener(key, oldCallback);
		}

		oldCallback = _VirtualDom_makeCallback(eventNode, newHandler);
		domNode.addEventListener(key, oldCallback,
			_VirtualDom_passiveSupported
			&& { passive: $elm$virtual_dom$VirtualDom$toHandlerInt(newHandler) < 2 }
		);
		allCallbacks[key] = oldCallback;
	}
}



// PASSIVE EVENTS


var _VirtualDom_passiveSupported;

try
{
	window.addEventListener('t', null, Object.defineProperty({}, 'passive', {
		get: function() { _VirtualDom_passiveSupported = true; }
	}));
}
catch(e) {}



// EVENT HANDLERS


function _VirtualDom_makeCallback(eventNode, initialHandler)
{
	function callback(event)
	{
		var handler = callback.q;
		var result = _Json_runHelp(handler.a, event);

		if (!$elm$core$Result$isOk(result))
		{
			return;
		}

		var tag = $elm$virtual_dom$VirtualDom$toHandlerInt(handler);

		// 0 = Normal
		// 1 = MayStopPropagation
		// 2 = MayPreventDefault
		// 3 = Custom

		var value = result.a;
		var message = !tag ? value : tag < 3 ? value.a : value.q;
		var stopPropagation = tag == 1 ? value.b : tag == 3 && value.U;
		var currentEventNode = (
			stopPropagation && event.stopPropagation(),
			(tag == 2 ? value.b : tag == 3 && value.R) && event.preventDefault(),
			eventNode
		);
		var tagger;
		var i;
		while (tagger = currentEventNode.j)
		{
			if (typeof tagger == 'function')
			{
				message = tagger(message);
			}
			else
			{
				for (var i = tagger.length; i--; )
				{
					message = tagger[i](message);
				}
			}
			currentEventNode = currentEventNode.p;
		}
		currentEventNode(message, stopPropagation); // stopPropagation implies isSync
	}

	callback.q = initialHandler;

	return callback;
}

function _VirtualDom_equalEvents(x, y)
{
	return x.$ == y.$ && _Json_equality(x.a, y.a);
}



// DIFF


// TODO: Should we do patches like in iOS?
//
// type Patch
//   = At Int Patch
//   | Batch (List Patch)
//   | Change ...
//
// How could it not be better?
//
function _VirtualDom_diff(x, y)
{
	var patches = [];
	_VirtualDom_diffHelp(x, y, patches, 0);
	return patches;
}


function _VirtualDom_pushPatch(patches, type, index, data)
{
	var patch = {
		$: type,
		r: index,
		s: data,
		t: undefined,
		u: undefined
	};
	patches.push(patch);
	return patch;
}


function _VirtualDom_diffHelp(x, y, patches, index)
{
	if (x === y)
	{
		return;
	}

	var xType = x.$;
	var yType = y.$;

	// Bail if you run into different types of nodes. Implies that the
	// structure has changed significantly and it's not worth a diff.
	if (xType !== yType)
	{
		if (xType === 1 && yType === 2)
		{
			y = _VirtualDom_dekey(y);
			yType = 1;
		}
		else
		{
			_VirtualDom_pushPatch(patches, 0, index, y);
			return;
		}
	}

	// Now we know that both nodes are the same $.
	switch (yType)
	{
		case 5:
			var xRefs = x.l;
			var yRefs = y.l;
			var i = xRefs.length;
			var same = i === yRefs.length;
			while (same && i--)
			{
				same = xRefs[i] === yRefs[i];
			}
			if (same)
			{
				y.k = x.k;
				return;
			}
			y.k = y.m();
			var subPatches = [];
			_VirtualDom_diffHelp(x.k, y.k, subPatches, 0);
			subPatches.length > 0 && _VirtualDom_pushPatch(patches, 1, index, subPatches);
			return;

		case 4:
			// gather nested taggers
			var xTaggers = x.j;
			var yTaggers = y.j;
			var nesting = false;

			var xSubNode = x.k;
			while (xSubNode.$ === 4)
			{
				nesting = true;

				typeof xTaggers !== 'object'
					? xTaggers = [xTaggers, xSubNode.j]
					: xTaggers.push(xSubNode.j);

				xSubNode = xSubNode.k;
			}

			var ySubNode = y.k;
			while (ySubNode.$ === 4)
			{
				nesting = true;

				typeof yTaggers !== 'object'
					? yTaggers = [yTaggers, ySubNode.j]
					: yTaggers.push(ySubNode.j);

				ySubNode = ySubNode.k;
			}

			// Just bail if different numbers of taggers. This implies the
			// structure of the virtual DOM has changed.
			if (nesting && xTaggers.length !== yTaggers.length)
			{
				_VirtualDom_pushPatch(patches, 0, index, y);
				return;
			}

			// check if taggers are "the same"
			if (nesting ? !_VirtualDom_pairwiseRefEqual(xTaggers, yTaggers) : xTaggers !== yTaggers)
			{
				_VirtualDom_pushPatch(patches, 2, index, yTaggers);
			}

			// diff everything below the taggers
			_VirtualDom_diffHelp(xSubNode, ySubNode, patches, index + 1);
			return;

		case 0:
			if (x.a !== y.a)
			{
				_VirtualDom_pushPatch(patches, 3, index, y.a);
			}
			return;

		case 1:
			_VirtualDom_diffNodes(x, y, patches, index, _VirtualDom_diffKids);
			return;

		case 2:
			_VirtualDom_diffNodes(x, y, patches, index, _VirtualDom_diffKeyedKids);
			return;

		case 3:
			if (x.h !== y.h)
			{
				_VirtualDom_pushPatch(patches, 0, index, y);
				return;
			}

			var factsDiff = _VirtualDom_diffFacts(x.d, y.d);
			factsDiff && _VirtualDom_pushPatch(patches, 4, index, factsDiff);

			var patch = y.i(x.g, y.g);
			patch && _VirtualDom_pushPatch(patches, 5, index, patch);

			return;
	}
}

// assumes the incoming arrays are the same length
function _VirtualDom_pairwiseRefEqual(as, bs)
{
	for (var i = 0; i < as.length; i++)
	{
		if (as[i] !== bs[i])
		{
			return false;
		}
	}

	return true;
}

function _VirtualDom_diffNodes(x, y, patches, index, diffKids)
{
	// Bail if obvious indicators have changed. Implies more serious
	// structural changes such that it's not worth it to diff.
	if (x.c !== y.c || x.f !== y.f)
	{
		_VirtualDom_pushPatch(patches, 0, index, y);
		return;
	}

	var factsDiff = _VirtualDom_diffFacts(x.d, y.d);
	factsDiff && _VirtualDom_pushPatch(patches, 4, index, factsDiff);

	diffKids(x, y, patches, index);
}



// DIFF FACTS


// TODO Instead of creating a new diff object, it's possible to just test if
// there *is* a diff. During the actual patch, do the diff again and make the
// modifications directly. This way, there's no new allocations. Worth it?
function _VirtualDom_diffFacts(x, y, category)
{
	var diff;

	// look for changes and removals
	for (var xKey in x)
	{
		if (xKey === 'a1' || xKey === 'a0' || xKey === 'a3' || xKey === 'a4')
		{
			var subDiff = _VirtualDom_diffFacts(x[xKey], y[xKey] || {}, xKey);
			if (subDiff)
			{
				diff = diff || {};
				diff[xKey] = subDiff;
			}
			continue;
		}

		// remove if not in the new facts
		if (!(xKey in y))
		{
			diff = diff || {};
			diff[xKey] =
				!category
					? (typeof x[xKey] === 'string' ? '' : null)
					:
				(category === 'a1')
					? ''
					:
				(category === 'a0' || category === 'a3')
					? undefined
					:
				{ f: x[xKey].f, o: undefined };

			continue;
		}

		var xValue = x[xKey];
		var yValue = y[xKey];

		// reference equal, so don't worry about it
		if (xValue === yValue && xKey !== 'value' && xKey !== 'checked'
			|| category === 'a0' && _VirtualDom_equalEvents(xValue, yValue))
		{
			continue;
		}

		diff = diff || {};
		diff[xKey] = yValue;
	}

	// add new stuff
	for (var yKey in y)
	{
		if (!(yKey in x))
		{
			diff = diff || {};
			diff[yKey] = y[yKey];
		}
	}

	return diff;
}



// DIFF KIDS


function _VirtualDom_diffKids(xParent, yParent, patches, index)
{
	var xKids = xParent.e;
	var yKids = yParent.e;

	var xLen = xKids.length;
	var yLen = yKids.length;

	// FIGURE OUT IF THERE ARE INSERTS OR REMOVALS

	if (xLen > yLen)
	{
		_VirtualDom_pushPatch(patches, 6, index, {
			v: yLen,
			i: xLen - yLen
		});
	}
	else if (xLen < yLen)
	{
		_VirtualDom_pushPatch(patches, 7, index, {
			v: xLen,
			e: yKids
		});
	}

	// PAIRWISE DIFF EVERYTHING ELSE

	for (var minLen = xLen < yLen ? xLen : yLen, i = 0; i < minLen; i++)
	{
		var xKid = xKids[i];
		_VirtualDom_diffHelp(xKid, yKids[i], patches, ++index);
		index += xKid.b || 0;
	}
}



// KEYED DIFF


function _VirtualDom_diffKeyedKids(xParent, yParent, patches, rootIndex)
{
	var localPatches = [];

	var changes = {}; // Dict String Entry
	var inserts = []; // Array { index : Int, entry : Entry }
	// type Entry = { tag : String, vnode : VNode, index : Int, data : _ }

	var xKids = xParent.e;
	var yKids = yParent.e;
	var xLen = xKids.length;
	var yLen = yKids.length;
	var xIndex = 0;
	var yIndex = 0;

	var index = rootIndex;

	while (xIndex < xLen && yIndex < yLen)
	{
		var x = xKids[xIndex];
		var y = yKids[yIndex];

		var xKey = x.a;
		var yKey = y.a;
		var xNode = x.b;
		var yNode = y.b;

		var newMatch = undefined;
		var oldMatch = undefined;

		// check if keys match

		if (xKey === yKey)
		{
			index++;
			_VirtualDom_diffHelp(xNode, yNode, localPatches, index);
			index += xNode.b || 0;

			xIndex++;
			yIndex++;
			continue;
		}

		// look ahead 1 to detect insertions and removals.

		var xNext = xKids[xIndex + 1];
		var yNext = yKids[yIndex + 1];

		if (xNext)
		{
			var xNextKey = xNext.a;
			var xNextNode = xNext.b;
			oldMatch = yKey === xNextKey;
		}

		if (yNext)
		{
			var yNextKey = yNext.a;
			var yNextNode = yNext.b;
			newMatch = xKey === yNextKey;
		}


		// swap x and y
		if (newMatch && oldMatch)
		{
			index++;
			_VirtualDom_diffHelp(xNode, yNextNode, localPatches, index);
			_VirtualDom_insertNode(changes, localPatches, xKey, yNode, yIndex, inserts);
			index += xNode.b || 0;

			index++;
			_VirtualDom_removeNode(changes, localPatches, xKey, xNextNode, index);
			index += xNextNode.b || 0;

			xIndex += 2;
			yIndex += 2;
			continue;
		}

		// insert y
		if (newMatch)
		{
			index++;
			_VirtualDom_insertNode(changes, localPatches, yKey, yNode, yIndex, inserts);
			_VirtualDom_diffHelp(xNode, yNextNode, localPatches, index);
			index += xNode.b || 0;

			xIndex += 1;
			yIndex += 2;
			continue;
		}

		// remove x
		if (oldMatch)
		{
			index++;
			_VirtualDom_removeNode(changes, localPatches, xKey, xNode, index);
			index += xNode.b || 0;

			index++;
			_VirtualDom_diffHelp(xNextNode, yNode, localPatches, index);
			index += xNextNode.b || 0;

			xIndex += 2;
			yIndex += 1;
			continue;
		}

		// remove x, insert y
		if (xNext && xNextKey === yNextKey)
		{
			index++;
			_VirtualDom_removeNode(changes, localPatches, xKey, xNode, index);
			_VirtualDom_insertNode(changes, localPatches, yKey, yNode, yIndex, inserts);
			index += xNode.b || 0;

			index++;
			_VirtualDom_diffHelp(xNextNode, yNextNode, localPatches, index);
			index += xNextNode.b || 0;

			xIndex += 2;
			yIndex += 2;
			continue;
		}

		break;
	}

	// eat up any remaining nodes with removeNode and insertNode

	while (xIndex < xLen)
	{
		index++;
		var x = xKids[xIndex];
		var xNode = x.b;
		_VirtualDom_removeNode(changes, localPatches, x.a, xNode, index);
		index += xNode.b || 0;
		xIndex++;
	}

	while (yIndex < yLen)
	{
		var endInserts = endInserts || [];
		var y = yKids[yIndex];
		_VirtualDom_insertNode(changes, localPatches, y.a, y.b, undefined, endInserts);
		yIndex++;
	}

	if (localPatches.length > 0 || inserts.length > 0 || endInserts)
	{
		_VirtualDom_pushPatch(patches, 8, rootIndex, {
			w: localPatches,
			x: inserts,
			y: endInserts
		});
	}
}



// CHANGES FROM KEYED DIFF


var _VirtualDom_POSTFIX = '_elmW6BL';


function _VirtualDom_insertNode(changes, localPatches, key, vnode, yIndex, inserts)
{
	var entry = changes[key];

	// never seen this key before
	if (!entry)
	{
		entry = {
			c: 0,
			z: vnode,
			r: yIndex,
			s: undefined
		};

		inserts.push({ r: yIndex, A: entry });
		changes[key] = entry;

		return;
	}

	// this key was removed earlier, a match!
	if (entry.c === 1)
	{
		inserts.push({ r: yIndex, A: entry });

		entry.c = 2;
		var subPatches = [];
		_VirtualDom_diffHelp(entry.z, vnode, subPatches, entry.r);
		entry.r = yIndex;
		entry.s.s = {
			w: subPatches,
			A: entry
		};

		return;
	}

	// this key has already been inserted or moved, a duplicate!
	_VirtualDom_insertNode(changes, localPatches, key + _VirtualDom_POSTFIX, vnode, yIndex, inserts);
}


function _VirtualDom_removeNode(changes, localPatches, key, vnode, index)
{
	var entry = changes[key];

	// never seen this key before
	if (!entry)
	{
		var patch = _VirtualDom_pushPatch(localPatches, 9, index, undefined);

		changes[key] = {
			c: 1,
			z: vnode,
			r: index,
			s: patch
		};

		return;
	}

	// this key was inserted earlier, a match!
	if (entry.c === 0)
	{
		entry.c = 2;
		var subPatches = [];
		_VirtualDom_diffHelp(vnode, entry.z, subPatches, index);

		_VirtualDom_pushPatch(localPatches, 9, index, {
			w: subPatches,
			A: entry
		});

		return;
	}

	// this key has already been removed or moved, a duplicate!
	_VirtualDom_removeNode(changes, localPatches, key + _VirtualDom_POSTFIX, vnode, index);
}



// ADD DOM NODES
//
// Each DOM node has an "index" assigned in order of traversal. It is important
// to minimize our crawl over the actual DOM, so these indexes (along with the
// descendantsCount of virtual nodes) let us skip touching entire subtrees of
// the DOM if we know there are no patches there.


function _VirtualDom_addDomNodes(domNode, vNode, patches, eventNode)
{
	_VirtualDom_addDomNodesHelp(domNode, vNode, patches, 0, 0, vNode.b, eventNode);
}


// assumes `patches` is non-empty and indexes increase monotonically.
function _VirtualDom_addDomNodesHelp(domNode, vNode, patches, i, low, high, eventNode)
{
	var patch = patches[i];
	var index = patch.r;

	while (index === low)
	{
		var patchType = patch.$;

		if (patchType === 1)
		{
			_VirtualDom_addDomNodes(domNode, vNode.k, patch.s, eventNode);
		}
		else if (patchType === 8)
		{
			patch.t = domNode;
			patch.u = eventNode;

			var subPatches = patch.s.w;
			if (subPatches.length > 0)
			{
				_VirtualDom_addDomNodesHelp(domNode, vNode, subPatches, 0, low, high, eventNode);
			}
		}
		else if (patchType === 9)
		{
			patch.t = domNode;
			patch.u = eventNode;

			var data = patch.s;
			if (data)
			{
				data.A.s = domNode;
				var subPatches = data.w;
				if (subPatches.length > 0)
				{
					_VirtualDom_addDomNodesHelp(domNode, vNode, subPatches, 0, low, high, eventNode);
				}
			}
		}
		else
		{
			patch.t = domNode;
			patch.u = eventNode;
		}

		i++;

		if (!(patch = patches[i]) || (index = patch.r) > high)
		{
			return i;
		}
	}

	var tag = vNode.$;

	if (tag === 4)
	{
		var subNode = vNode.k;

		while (subNode.$ === 4)
		{
			subNode = subNode.k;
		}

		return _VirtualDom_addDomNodesHelp(domNode, subNode, patches, i, low + 1, high, domNode.elm_event_node_ref);
	}

	// tag must be 1 or 2 at this point

	var vKids = vNode.e;
	var childNodes = domNode.childNodes;
	for (var j = 0; j < vKids.length; j++)
	{
		low++;
		var vKid = tag === 1 ? vKids[j] : vKids[j].b;
		var nextLow = low + (vKid.b || 0);
		if (low <= index && index <= nextLow)
		{
			i = _VirtualDom_addDomNodesHelp(childNodes[j], vKid, patches, i, low, nextLow, eventNode);
			if (!(patch = patches[i]) || (index = patch.r) > high)
			{
				return i;
			}
		}
		low = nextLow;
	}
	return i;
}



// APPLY PATCHES


function _VirtualDom_applyPatches(rootDomNode, oldVirtualNode, patches, eventNode)
{
	if (patches.length === 0)
	{
		return rootDomNode;
	}

	_VirtualDom_addDomNodes(rootDomNode, oldVirtualNode, patches, eventNode);
	return _VirtualDom_applyPatchesHelp(rootDomNode, patches);
}

function _VirtualDom_applyPatchesHelp(rootDomNode, patches)
{
	for (var i = 0; i < patches.length; i++)
	{
		var patch = patches[i];
		var localDomNode = patch.t
		var newNode = _VirtualDom_applyPatch(localDomNode, patch);
		if (localDomNode === rootDomNode)
		{
			rootDomNode = newNode;
		}
	}
	return rootDomNode;
}

function _VirtualDom_applyPatch(domNode, patch)
{
	switch (patch.$)
	{
		case 0:
			return _VirtualDom_applyPatchRedraw(domNode, patch.s, patch.u);

		case 4:
			_VirtualDom_applyFacts(domNode, patch.u, patch.s);
			return domNode;

		case 3:
			domNode.replaceData(0, domNode.length, patch.s);
			return domNode;

		case 1:
			return _VirtualDom_applyPatchesHelp(domNode, patch.s);

		case 2:
			if (domNode.elm_event_node_ref)
			{
				domNode.elm_event_node_ref.j = patch.s;
			}
			else
			{
				domNode.elm_event_node_ref = { j: patch.s, p: patch.u };
			}
			return domNode;

		case 6:
			var data = patch.s;
			for (var i = 0; i < data.i; i++)
			{
				domNode.removeChild(domNode.childNodes[data.v]);
			}
			return domNode;

		case 7:
			var data = patch.s;
			var kids = data.e;
			var i = data.v;
			var theEnd = domNode.childNodes[i];
			for (; i < kids.length; i++)
			{
				domNode.insertBefore(_VirtualDom_render(kids[i], patch.u), theEnd);
			}
			return domNode;

		case 9:
			var data = patch.s;
			if (!data)
			{
				domNode.parentNode.removeChild(domNode);
				return domNode;
			}
			var entry = data.A;
			if (typeof entry.r !== 'undefined')
			{
				domNode.parentNode.removeChild(domNode);
			}
			entry.s = _VirtualDom_applyPatchesHelp(domNode, data.w);
			return domNode;

		case 8:
			return _VirtualDom_applyPatchReorder(domNode, patch);

		case 5:
			return patch.s(domNode);

		default:
			_Debug_crash(10); // 'Ran into an unknown patch!'
	}
}


function _VirtualDom_applyPatchRedraw(domNode, vNode, eventNode)
{
	var parentNode = domNode.parentNode;
	var newNode = _VirtualDom_render(vNode, eventNode);

	if (!newNode.elm_event_node_ref)
	{
		newNode.elm_event_node_ref = domNode.elm_event_node_ref;
	}

	if (parentNode && newNode !== domNode)
	{
		parentNode.replaceChild(newNode, domNode);
	}
	return newNode;
}


function _VirtualDom_applyPatchReorder(domNode, patch)
{
	var data = patch.s;

	// remove end inserts
	var frag = _VirtualDom_applyPatchReorderEndInsertsHelp(data.y, patch);

	// removals
	domNode = _VirtualDom_applyPatchesHelp(domNode, data.w);

	// inserts
	var inserts = data.x;
	for (var i = 0; i < inserts.length; i++)
	{
		var insert = inserts[i];
		var entry = insert.A;
		var node = entry.c === 2
			? entry.s
			: _VirtualDom_render(entry.z, patch.u);
		domNode.insertBefore(node, domNode.childNodes[insert.r]);
	}

	// add end inserts
	if (frag)
	{
		_VirtualDom_appendChild(domNode, frag);
	}

	return domNode;
}


function _VirtualDom_applyPatchReorderEndInsertsHelp(endInserts, patch)
{
	if (!endInserts)
	{
		return;
	}

	var frag = _VirtualDom_doc.createDocumentFragment();
	for (var i = 0; i < endInserts.length; i++)
	{
		var insert = endInserts[i];
		var entry = insert.A;
		_VirtualDom_appendChild(frag, entry.c === 2
			? entry.s
			: _VirtualDom_render(entry.z, patch.u)
		);
	}
	return frag;
}


function _VirtualDom_virtualize(node)
{
	// TEXT NODES

	if (node.nodeType === 3)
	{
		return _VirtualDom_text(node.textContent);
	}


	// WEIRD NODES

	if (node.nodeType !== 1)
	{
		return _VirtualDom_text('');
	}


	// ELEMENT NODES

	var attrList = _List_Nil;
	var attrs = node.attributes;
	for (var i = attrs.length; i--; )
	{
		var attr = attrs[i];
		var name = attr.name;
		var value = attr.value;
		attrList = _List_Cons( A2(_VirtualDom_attribute, name, value), attrList );
	}

	var tag = node.tagName.toLowerCase();
	var kidList = _List_Nil;
	var kids = node.childNodes;

	for (var i = kids.length; i--; )
	{
		kidList = _List_Cons(_VirtualDom_virtualize(kids[i]), kidList);
	}
	return A3(_VirtualDom_node, tag, attrList, kidList);
}

function _VirtualDom_dekey(keyedNode)
{
	var keyedKids = keyedNode.e;
	var len = keyedKids.length;
	var kids = new Array(len);
	for (var i = 0; i < len; i++)
	{
		kids[i] = keyedKids[i].b;
	}

	return {
		$: 1,
		c: keyedNode.c,
		d: keyedNode.d,
		e: kids,
		f: keyedNode.f,
		b: keyedNode.b
	};
}




// ELEMENT


var _Debugger_element;

var _Browser_element = _Debugger_element || F4(function(impl, flagDecoder, debugMetadata, args)
{
	return _Platform_initialize(
		flagDecoder,
		args,
		impl.aD,
		impl.aM,
		impl.aK,
		function(sendToApp, initialModel) {
			var view = impl.aN;
			/**/
			var domNode = args['node'];
			//*/
			/**_UNUSED/
			var domNode = args && args['node'] ? args['node'] : _Debug_crash(0);
			//*/
			var currNode = _VirtualDom_virtualize(domNode);

			return _Browser_makeAnimator(initialModel, function(model)
			{
				var nextNode = view(model);
				var patches = _VirtualDom_diff(currNode, nextNode);
				domNode = _VirtualDom_applyPatches(domNode, currNode, patches, sendToApp);
				currNode = nextNode;
			});
		}
	);
});



// DOCUMENT


var _Debugger_document;

var _Browser_document = _Debugger_document || F4(function(impl, flagDecoder, debugMetadata, args)
{
	return _Platform_initialize(
		flagDecoder,
		args,
		impl.aD,
		impl.aM,
		impl.aK,
		function(sendToApp, initialModel) {
			var divertHrefToApp = impl.S && impl.S(sendToApp)
			var view = impl.aN;
			var title = _VirtualDom_doc.title;
			var bodyNode = _VirtualDom_doc.body;
			var currNode = _VirtualDom_virtualize(bodyNode);
			return _Browser_makeAnimator(initialModel, function(model)
			{
				_VirtualDom_divertHrefToApp = divertHrefToApp;
				var doc = view(model);
				var nextNode = _VirtualDom_node('body')(_List_Nil)(doc.aw);
				var patches = _VirtualDom_diff(currNode, nextNode);
				bodyNode = _VirtualDom_applyPatches(bodyNode, currNode, patches, sendToApp);
				currNode = nextNode;
				_VirtualDom_divertHrefToApp = 0;
				(title !== doc.aL) && (_VirtualDom_doc.title = title = doc.aL);
			});
		}
	);
});



// ANIMATION


var _Browser_cancelAnimationFrame =
	typeof cancelAnimationFrame !== 'undefined'
		? cancelAnimationFrame
		: function(id) { clearTimeout(id); };

var _Browser_requestAnimationFrame =
	typeof requestAnimationFrame !== 'undefined'
		? requestAnimationFrame
		: function(callback) { return setTimeout(callback, 1000 / 60); };


function _Browser_makeAnimator(model, draw)
{
	draw(model);

	var state = 0;

	function updateIfNeeded()
	{
		state = state === 1
			? 0
			: ( _Browser_requestAnimationFrame(updateIfNeeded), draw(model), 1 );
	}

	return function(nextModel, isSync)
	{
		model = nextModel;

		isSync
			? ( draw(model),
				state === 2 && (state = 1)
				)
			: ( state === 0 && _Browser_requestAnimationFrame(updateIfNeeded),
				state = 2
				);
	};
}



// APPLICATION


function _Browser_application(impl)
{
	var onUrlChange = impl.aF;
	var onUrlRequest = impl.aG;
	var key = function() { key.a(onUrlChange(_Browser_getUrl())); };

	return _Browser_document({
		S: function(sendToApp)
		{
			key.a = sendToApp;
			_Browser_window.addEventListener('popstate', key);
			_Browser_window.navigator.userAgent.indexOf('Trident') < 0 || _Browser_window.addEventListener('hashchange', key);

			return F2(function(domNode, event)
			{
				if (!event.ctrlKey && !event.metaKey && !event.shiftKey && event.button < 1 && !domNode.target && !domNode.hasAttribute('download'))
				{
					event.preventDefault();
					var href = domNode.href;
					var curr = _Browser_getUrl();
					var next = $elm$url$Url$fromString(href).a;
					sendToApp(onUrlRequest(
						(next
							&& curr.aj === next.aj
							&& curr.ab === next.ab
							&& curr.ag.a === next.ag.a
						)
							? $elm$browser$Browser$Internal(next)
							: $elm$browser$Browser$External(href)
					));
				}
			});
		},
		aD: function(flags)
		{
			return A3(impl.aD, flags, _Browser_getUrl(), key);
		},
		aN: impl.aN,
		aM: impl.aM,
		aK: impl.aK
	});
}

function _Browser_getUrl()
{
	return $elm$url$Url$fromString(_VirtualDom_doc.location.href).a || _Debug_crash(1);
}

var _Browser_go = F2(function(key, n)
{
	return A2($elm$core$Task$perform, $elm$core$Basics$never, _Scheduler_binding(function() {
		n && history.go(n);
		key();
	}));
});

var _Browser_pushUrl = F2(function(key, url)
{
	return A2($elm$core$Task$perform, $elm$core$Basics$never, _Scheduler_binding(function() {
		history.pushState({}, '', url);
		key();
	}));
});

var _Browser_replaceUrl = F2(function(key, url)
{
	return A2($elm$core$Task$perform, $elm$core$Basics$never, _Scheduler_binding(function() {
		history.replaceState({}, '', url);
		key();
	}));
});



// GLOBAL EVENTS


var _Browser_fakeNode = { addEventListener: function() {}, removeEventListener: function() {} };
var _Browser_doc = typeof document !== 'undefined' ? document : _Browser_fakeNode;
var _Browser_window = typeof window !== 'undefined' ? window : _Browser_fakeNode;

var _Browser_on = F3(function(node, eventName, sendToSelf)
{
	return _Scheduler_spawn(_Scheduler_binding(function(callback)
	{
		function handler(event)	{ _Scheduler_rawSpawn(sendToSelf(event)); }
		node.addEventListener(eventName, handler, _VirtualDom_passiveSupported && { passive: true });
		return function() { node.removeEventListener(eventName, handler); };
	}));
});

var _Browser_decodeEvent = F2(function(decoder, event)
{
	var result = _Json_runHelp(decoder, event);
	return $elm$core$Result$isOk(result) ? $elm$core$Maybe$Just(result.a) : $elm$core$Maybe$Nothing;
});



// PAGE VISIBILITY


function _Browser_visibilityInfo()
{
	return (typeof _VirtualDom_doc.hidden !== 'undefined')
		? { aB: 'hidden', ax: 'visibilitychange' }
		:
	(typeof _VirtualDom_doc.mozHidden !== 'undefined')
		? { aB: 'mozHidden', ax: 'mozvisibilitychange' }
		:
	(typeof _VirtualDom_doc.msHidden !== 'undefined')
		? { aB: 'msHidden', ax: 'msvisibilitychange' }
		:
	(typeof _VirtualDom_doc.webkitHidden !== 'undefined')
		? { aB: 'webkitHidden', ax: 'webkitvisibilitychange' }
		: { aB: 'hidden', ax: 'visibilitychange' };
}



// ANIMATION FRAMES


function _Browser_rAF()
{
	return _Scheduler_binding(function(callback)
	{
		var id = _Browser_requestAnimationFrame(function() {
			callback(_Scheduler_succeed(Date.now()));
		});

		return function() {
			_Browser_cancelAnimationFrame(id);
		};
	});
}


function _Browser_now()
{
	return _Scheduler_binding(function(callback)
	{
		callback(_Scheduler_succeed(Date.now()));
	});
}



// DOM STUFF


function _Browser_withNode(id, doStuff)
{
	return _Scheduler_binding(function(callback)
	{
		_Browser_requestAnimationFrame(function() {
			var node = document.getElementById(id);
			callback(node
				? _Scheduler_succeed(doStuff(node))
				: _Scheduler_fail($elm$browser$Browser$Dom$NotFound(id))
			);
		});
	});
}


function _Browser_withWindow(doStuff)
{
	return _Scheduler_binding(function(callback)
	{
		_Browser_requestAnimationFrame(function() {
			callback(_Scheduler_succeed(doStuff()));
		});
	});
}


// FOCUS and BLUR


var _Browser_call = F2(function(functionName, id)
{
	return _Browser_withNode(id, function(node) {
		node[functionName]();
		return _Utils_Tuple0;
	});
});



// WINDOW VIEWPORT


function _Browser_getViewport()
{
	return {
		an: _Browser_getScene(),
		aq: {
			as: _Browser_window.pageXOffset,
			at: _Browser_window.pageYOffset,
			ar: _Browser_doc.documentElement.clientWidth,
			aa: _Browser_doc.documentElement.clientHeight
		}
	};
}

function _Browser_getScene()
{
	var body = _Browser_doc.body;
	var elem = _Browser_doc.documentElement;
	return {
		ar: Math.max(body.scrollWidth, body.offsetWidth, elem.scrollWidth, elem.offsetWidth, elem.clientWidth),
		aa: Math.max(body.scrollHeight, body.offsetHeight, elem.scrollHeight, elem.offsetHeight, elem.clientHeight)
	};
}

var _Browser_setViewport = F2(function(x, y)
{
	return _Browser_withWindow(function()
	{
		_Browser_window.scroll(x, y);
		return _Utils_Tuple0;
	});
});



// ELEMENT VIEWPORT


function _Browser_getViewportOf(id)
{
	return _Browser_withNode(id, function(node)
	{
		return {
			an: {
				ar: node.scrollWidth,
				aa: node.scrollHeight
			},
			aq: {
				as: node.scrollLeft,
				at: node.scrollTop,
				ar: node.clientWidth,
				aa: node.clientHeight
			}
		};
	});
}


var _Browser_setViewportOf = F3(function(id, x, y)
{
	return _Browser_withNode(id, function(node)
	{
		node.scrollLeft = x;
		node.scrollTop = y;
		return _Utils_Tuple0;
	});
});



// ELEMENT


function _Browser_getElement(id)
{
	return _Browser_withNode(id, function(node)
	{
		var rect = node.getBoundingClientRect();
		var x = _Browser_window.pageXOffset;
		var y = _Browser_window.pageYOffset;
		return {
			an: _Browser_getScene(),
			aq: {
				as: x,
				at: y,
				ar: _Browser_doc.documentElement.clientWidth,
				aa: _Browser_doc.documentElement.clientHeight
			},
			az: {
				as: x + rect.left,
				at: y + rect.top,
				ar: rect.width,
				aa: rect.height
			}
		};
	});
}



// LOAD and RELOAD


function _Browser_reload(skipCache)
{
	return A2($elm$core$Task$perform, $elm$core$Basics$never, _Scheduler_binding(function(callback)
	{
		_VirtualDom_doc.location.reload(skipCache);
	}));
}

function _Browser_load(url)
{
	return A2($elm$core$Task$perform, $elm$core$Basics$never, _Scheduler_binding(function(callback)
	{
		try
		{
			_Browser_window.location = url;
		}
		catch(err)
		{
			// Only Firefox can throw a NS_ERROR_MALFORMED_URI exception here.
			// Other browsers reload the page, so let's be consistent about that.
			_VirtualDom_doc.location.reload(false);
		}
	}));
}


function _Url_percentEncode(string)
{
	return encodeURIComponent(string);
}

function _Url_percentDecode(string)
{
	try
	{
		return $elm$core$Maybe$Just(decodeURIComponent(string));
	}
	catch (e)
	{
		return $elm$core$Maybe$Nothing;
	}
}var $author$project$Main$NoOp = {$: 11};
var $elm$core$Basics$EQ = 1;
var $elm$core$Basics$GT = 2;
var $elm$core$Basics$LT = 0;
var $elm$core$List$cons = _List_cons;
var $elm$core$Dict$foldr = F3(
	function (func, acc, t) {
		foldr:
		while (true) {
			if (t.$ === -2) {
				return acc;
			} else {
				var key = t.b;
				var value = t.c;
				var left = t.d;
				var right = t.e;
				var $temp$func = func,
					$temp$acc = A3(
					func,
					key,
					value,
					A3($elm$core$Dict$foldr, func, acc, right)),
					$temp$t = left;
				func = $temp$func;
				acc = $temp$acc;
				t = $temp$t;
				continue foldr;
			}
		}
	});
var $elm$core$Dict$toList = function (dict) {
	return A3(
		$elm$core$Dict$foldr,
		F3(
			function (key, value, list) {
				return A2(
					$elm$core$List$cons,
					_Utils_Tuple2(key, value),
					list);
			}),
		_List_Nil,
		dict);
};
var $elm$core$Dict$keys = function (dict) {
	return A3(
		$elm$core$Dict$foldr,
		F3(
			function (key, value, keyList) {
				return A2($elm$core$List$cons, key, keyList);
			}),
		_List_Nil,
		dict);
};
var $elm$core$Set$toList = function (_v0) {
	var dict = _v0;
	return $elm$core$Dict$keys(dict);
};
var $elm$core$Elm$JsArray$foldr = _JsArray_foldr;
var $elm$core$Array$foldr = F3(
	function (func, baseCase, _v0) {
		var tree = _v0.c;
		var tail = _v0.d;
		var helper = F2(
			function (node, acc) {
				if (!node.$) {
					var subTree = node.a;
					return A3($elm$core$Elm$JsArray$foldr, helper, acc, subTree);
				} else {
					var values = node.a;
					return A3($elm$core$Elm$JsArray$foldr, func, acc, values);
				}
			});
		return A3(
			$elm$core$Elm$JsArray$foldr,
			helper,
			A3($elm$core$Elm$JsArray$foldr, func, baseCase, tail),
			tree);
	});
var $elm$core$Array$toList = function (array) {
	return A3($elm$core$Array$foldr, $elm$core$List$cons, _List_Nil, array);
};
var $elm$core$Result$Err = function (a) {
	return {$: 1, a: a};
};
var $elm$json$Json$Decode$Failure = F2(
	function (a, b) {
		return {$: 3, a: a, b: b};
	});
var $elm$json$Json$Decode$Field = F2(
	function (a, b) {
		return {$: 0, a: a, b: b};
	});
var $elm$json$Json$Decode$Index = F2(
	function (a, b) {
		return {$: 1, a: a, b: b};
	});
var $elm$core$Result$Ok = function (a) {
	return {$: 0, a: a};
};
var $elm$json$Json$Decode$OneOf = function (a) {
	return {$: 2, a: a};
};
var $elm$core$Basics$False = 1;
var $elm$core$Basics$add = _Basics_add;
var $elm$core$Maybe$Just = function (a) {
	return {$: 0, a: a};
};
var $elm$core$Maybe$Nothing = {$: 1};
var $elm$core$String$all = _String_all;
var $elm$core$Basics$and = _Basics_and;
var $elm$core$Basics$append = _Utils_append;
var $elm$json$Json$Encode$encode = _Json_encode;
var $elm$core$String$fromInt = _String_fromNumber;
var $elm$core$String$join = F2(
	function (sep, chunks) {
		return A2(
			_String_join,
			sep,
			_List_toArray(chunks));
	});
var $elm$core$String$split = F2(
	function (sep, string) {
		return _List_fromArray(
			A2(_String_split, sep, string));
	});
var $elm$json$Json$Decode$indent = function (str) {
	return A2(
		$elm$core$String$join,
		'\n    ',
		A2($elm$core$String$split, '\n', str));
};
var $elm$core$List$foldl = F3(
	function (func, acc, list) {
		foldl:
		while (true) {
			if (!list.b) {
				return acc;
			} else {
				var x = list.a;
				var xs = list.b;
				var $temp$func = func,
					$temp$acc = A2(func, x, acc),
					$temp$list = xs;
				func = $temp$func;
				acc = $temp$acc;
				list = $temp$list;
				continue foldl;
			}
		}
	});
var $elm$core$List$length = function (xs) {
	return A3(
		$elm$core$List$foldl,
		F2(
			function (_v0, i) {
				return i + 1;
			}),
		0,
		xs);
};
var $elm$core$List$map2 = _List_map2;
var $elm$core$Basics$le = _Utils_le;
var $elm$core$Basics$sub = _Basics_sub;
var $elm$core$List$rangeHelp = F3(
	function (lo, hi, list) {
		rangeHelp:
		while (true) {
			if (_Utils_cmp(lo, hi) < 1) {
				var $temp$lo = lo,
					$temp$hi = hi - 1,
					$temp$list = A2($elm$core$List$cons, hi, list);
				lo = $temp$lo;
				hi = $temp$hi;
				list = $temp$list;
				continue rangeHelp;
			} else {
				return list;
			}
		}
	});
var $elm$core$List$range = F2(
	function (lo, hi) {
		return A3($elm$core$List$rangeHelp, lo, hi, _List_Nil);
	});
var $elm$core$List$indexedMap = F2(
	function (f, xs) {
		return A3(
			$elm$core$List$map2,
			f,
			A2(
				$elm$core$List$range,
				0,
				$elm$core$List$length(xs) - 1),
			xs);
	});
var $elm$core$Char$toCode = _Char_toCode;
var $elm$core$Char$isLower = function (_char) {
	var code = $elm$core$Char$toCode(_char);
	return (97 <= code) && (code <= 122);
};
var $elm$core$Char$isUpper = function (_char) {
	var code = $elm$core$Char$toCode(_char);
	return (code <= 90) && (65 <= code);
};
var $elm$core$Basics$or = _Basics_or;
var $elm$core$Char$isAlpha = function (_char) {
	return $elm$core$Char$isLower(_char) || $elm$core$Char$isUpper(_char);
};
var $elm$core$Char$isDigit = function (_char) {
	var code = $elm$core$Char$toCode(_char);
	return (code <= 57) && (48 <= code);
};
var $elm$core$Char$isAlphaNum = function (_char) {
	return $elm$core$Char$isLower(_char) || ($elm$core$Char$isUpper(_char) || $elm$core$Char$isDigit(_char));
};
var $elm$core$List$reverse = function (list) {
	return A3($elm$core$List$foldl, $elm$core$List$cons, _List_Nil, list);
};
var $elm$core$String$uncons = _String_uncons;
var $elm$json$Json$Decode$errorOneOf = F2(
	function (i, error) {
		return '\n\n(' + ($elm$core$String$fromInt(i + 1) + (') ' + $elm$json$Json$Decode$indent(
			$elm$json$Json$Decode$errorToString(error))));
	});
var $elm$json$Json$Decode$errorToString = function (error) {
	return A2($elm$json$Json$Decode$errorToStringHelp, error, _List_Nil);
};
var $elm$json$Json$Decode$errorToStringHelp = F2(
	function (error, context) {
		errorToStringHelp:
		while (true) {
			switch (error.$) {
				case 0:
					var f = error.a;
					var err = error.b;
					var isSimple = function () {
						var _v1 = $elm$core$String$uncons(f);
						if (_v1.$ === 1) {
							return false;
						} else {
							var _v2 = _v1.a;
							var _char = _v2.a;
							var rest = _v2.b;
							return $elm$core$Char$isAlpha(_char) && A2($elm$core$String$all, $elm$core$Char$isAlphaNum, rest);
						}
					}();
					var fieldName = isSimple ? ('.' + f) : ('[\'' + (f + '\']'));
					var $temp$error = err,
						$temp$context = A2($elm$core$List$cons, fieldName, context);
					error = $temp$error;
					context = $temp$context;
					continue errorToStringHelp;
				case 1:
					var i = error.a;
					var err = error.b;
					var indexName = '[' + ($elm$core$String$fromInt(i) + ']');
					var $temp$error = err,
						$temp$context = A2($elm$core$List$cons, indexName, context);
					error = $temp$error;
					context = $temp$context;
					continue errorToStringHelp;
				case 2:
					var errors = error.a;
					if (!errors.b) {
						return 'Ran into a Json.Decode.oneOf with no possibilities' + function () {
							if (!context.b) {
								return '!';
							} else {
								return ' at json' + A2(
									$elm$core$String$join,
									'',
									$elm$core$List$reverse(context));
							}
						}();
					} else {
						if (!errors.b.b) {
							var err = errors.a;
							var $temp$error = err,
								$temp$context = context;
							error = $temp$error;
							context = $temp$context;
							continue errorToStringHelp;
						} else {
							var starter = function () {
								if (!context.b) {
									return 'Json.Decode.oneOf';
								} else {
									return 'The Json.Decode.oneOf at json' + A2(
										$elm$core$String$join,
										'',
										$elm$core$List$reverse(context));
								}
							}();
							var introduction = starter + (' failed in the following ' + ($elm$core$String$fromInt(
								$elm$core$List$length(errors)) + ' ways:'));
							return A2(
								$elm$core$String$join,
								'\n\n',
								A2(
									$elm$core$List$cons,
									introduction,
									A2($elm$core$List$indexedMap, $elm$json$Json$Decode$errorOneOf, errors)));
						}
					}
				default:
					var msg = error.a;
					var json = error.b;
					var introduction = function () {
						if (!context.b) {
							return 'Problem with the given value:\n\n';
						} else {
							return 'Problem with the value at json' + (A2(
								$elm$core$String$join,
								'',
								$elm$core$List$reverse(context)) + ':\n\n    ');
						}
					}();
					return introduction + ($elm$json$Json$Decode$indent(
						A2($elm$json$Json$Encode$encode, 4, json)) + ('\n\n' + msg));
			}
		}
	});
var $elm$core$Array$branchFactor = 32;
var $elm$core$Array$Array_elm_builtin = F4(
	function (a, b, c, d) {
		return {$: 0, a: a, b: b, c: c, d: d};
	});
var $elm$core$Elm$JsArray$empty = _JsArray_empty;
var $elm$core$Basics$ceiling = _Basics_ceiling;
var $elm$core$Basics$fdiv = _Basics_fdiv;
var $elm$core$Basics$logBase = F2(
	function (base, number) {
		return _Basics_log(number) / _Basics_log(base);
	});
var $elm$core$Basics$toFloat = _Basics_toFloat;
var $elm$core$Array$shiftStep = $elm$core$Basics$ceiling(
	A2($elm$core$Basics$logBase, 2, $elm$core$Array$branchFactor));
var $elm$core$Array$empty = A4($elm$core$Array$Array_elm_builtin, 0, $elm$core$Array$shiftStep, $elm$core$Elm$JsArray$empty, $elm$core$Elm$JsArray$empty);
var $elm$core$Elm$JsArray$initialize = _JsArray_initialize;
var $elm$core$Array$Leaf = function (a) {
	return {$: 1, a: a};
};
var $elm$core$Basics$apL = F2(
	function (f, x) {
		return f(x);
	});
var $elm$core$Basics$apR = F2(
	function (x, f) {
		return f(x);
	});
var $elm$core$Basics$eq = _Utils_equal;
var $elm$core$Basics$floor = _Basics_floor;
var $elm$core$Elm$JsArray$length = _JsArray_length;
var $elm$core$Basics$gt = _Utils_gt;
var $elm$core$Basics$max = F2(
	function (x, y) {
		return (_Utils_cmp(x, y) > 0) ? x : y;
	});
var $elm$core$Basics$mul = _Basics_mul;
var $elm$core$Array$SubTree = function (a) {
	return {$: 0, a: a};
};
var $elm$core$Elm$JsArray$initializeFromList = _JsArray_initializeFromList;
var $elm$core$Array$compressNodes = F2(
	function (nodes, acc) {
		compressNodes:
		while (true) {
			var _v0 = A2($elm$core$Elm$JsArray$initializeFromList, $elm$core$Array$branchFactor, nodes);
			var node = _v0.a;
			var remainingNodes = _v0.b;
			var newAcc = A2(
				$elm$core$List$cons,
				$elm$core$Array$SubTree(node),
				acc);
			if (!remainingNodes.b) {
				return $elm$core$List$reverse(newAcc);
			} else {
				var $temp$nodes = remainingNodes,
					$temp$acc = newAcc;
				nodes = $temp$nodes;
				acc = $temp$acc;
				continue compressNodes;
			}
		}
	});
var $elm$core$Tuple$first = function (_v0) {
	var x = _v0.a;
	return x;
};
var $elm$core$Array$treeFromBuilder = F2(
	function (nodeList, nodeListSize) {
		treeFromBuilder:
		while (true) {
			var newNodeSize = $elm$core$Basics$ceiling(nodeListSize / $elm$core$Array$branchFactor);
			if (newNodeSize === 1) {
				return A2($elm$core$Elm$JsArray$initializeFromList, $elm$core$Array$branchFactor, nodeList).a;
			} else {
				var $temp$nodeList = A2($elm$core$Array$compressNodes, nodeList, _List_Nil),
					$temp$nodeListSize = newNodeSize;
				nodeList = $temp$nodeList;
				nodeListSize = $temp$nodeListSize;
				continue treeFromBuilder;
			}
		}
	});
var $elm$core$Array$builderToArray = F2(
	function (reverseNodeList, builder) {
		if (!builder.a) {
			return A4(
				$elm$core$Array$Array_elm_builtin,
				$elm$core$Elm$JsArray$length(builder.c),
				$elm$core$Array$shiftStep,
				$elm$core$Elm$JsArray$empty,
				builder.c);
		} else {
			var treeLen = builder.a * $elm$core$Array$branchFactor;
			var depth = $elm$core$Basics$floor(
				A2($elm$core$Basics$logBase, $elm$core$Array$branchFactor, treeLen - 1));
			var correctNodeList = reverseNodeList ? $elm$core$List$reverse(builder.d) : builder.d;
			var tree = A2($elm$core$Array$treeFromBuilder, correctNodeList, builder.a);
			return A4(
				$elm$core$Array$Array_elm_builtin,
				$elm$core$Elm$JsArray$length(builder.c) + treeLen,
				A2($elm$core$Basics$max, 5, depth * $elm$core$Array$shiftStep),
				tree,
				builder.c);
		}
	});
var $elm$core$Basics$idiv = _Basics_idiv;
var $elm$core$Basics$lt = _Utils_lt;
var $elm$core$Array$initializeHelp = F5(
	function (fn, fromIndex, len, nodeList, tail) {
		initializeHelp:
		while (true) {
			if (fromIndex < 0) {
				return A2(
					$elm$core$Array$builderToArray,
					false,
					{d: nodeList, a: (len / $elm$core$Array$branchFactor) | 0, c: tail});
			} else {
				var leaf = $elm$core$Array$Leaf(
					A3($elm$core$Elm$JsArray$initialize, $elm$core$Array$branchFactor, fromIndex, fn));
				var $temp$fn = fn,
					$temp$fromIndex = fromIndex - $elm$core$Array$branchFactor,
					$temp$len = len,
					$temp$nodeList = A2($elm$core$List$cons, leaf, nodeList),
					$temp$tail = tail;
				fn = $temp$fn;
				fromIndex = $temp$fromIndex;
				len = $temp$len;
				nodeList = $temp$nodeList;
				tail = $temp$tail;
				continue initializeHelp;
			}
		}
	});
var $elm$core$Basics$remainderBy = _Basics_remainderBy;
var $elm$core$Array$initialize = F2(
	function (len, fn) {
		if (len <= 0) {
			return $elm$core$Array$empty;
		} else {
			var tailLen = len % $elm$core$Array$branchFactor;
			var tail = A3($elm$core$Elm$JsArray$initialize, tailLen, len - tailLen, fn);
			var initialFromIndex = (len - tailLen) - $elm$core$Array$branchFactor;
			return A5($elm$core$Array$initializeHelp, fn, initialFromIndex, len, _List_Nil, tail);
		}
	});
var $elm$core$Basics$True = 0;
var $elm$core$Result$isOk = function (result) {
	if (!result.$) {
		return true;
	} else {
		return false;
	}
};
var $elm$json$Json$Decode$map = _Json_map1;
var $elm$json$Json$Decode$map2 = _Json_map2;
var $elm$json$Json$Decode$succeed = _Json_succeed;
var $elm$virtual_dom$VirtualDom$toHandlerInt = function (handler) {
	switch (handler.$) {
		case 0:
			return 0;
		case 1:
			return 1;
		case 2:
			return 2;
		default:
			return 3;
	}
};
var $elm$browser$Browser$External = function (a) {
	return {$: 1, a: a};
};
var $elm$browser$Browser$Internal = function (a) {
	return {$: 0, a: a};
};
var $elm$core$Basics$identity = function (x) {
	return x;
};
var $elm$browser$Browser$Dom$NotFound = $elm$core$Basics$identity;
var $elm$url$Url$Http = 0;
var $elm$url$Url$Https = 1;
var $elm$url$Url$Url = F6(
	function (protocol, host, port_, path, query, fragment) {
		return {_: fragment, ab: host, aI: path, ag: port_, aj: protocol, ak: query};
	});
var $elm$core$String$contains = _String_contains;
var $elm$core$String$length = _String_length;
var $elm$core$String$slice = _String_slice;
var $elm$core$String$dropLeft = F2(
	function (n, string) {
		return (n < 1) ? string : A3(
			$elm$core$String$slice,
			n,
			$elm$core$String$length(string),
			string);
	});
var $elm$core$String$indexes = _String_indexes;
var $elm$core$String$isEmpty = function (string) {
	return string === '';
};
var $elm$core$String$left = F2(
	function (n, string) {
		return (n < 1) ? '' : A3($elm$core$String$slice, 0, n, string);
	});
var $elm$core$String$toInt = _String_toInt;
var $elm$url$Url$chompBeforePath = F5(
	function (protocol, path, params, frag, str) {
		if ($elm$core$String$isEmpty(str) || A2($elm$core$String$contains, '@', str)) {
			return $elm$core$Maybe$Nothing;
		} else {
			var _v0 = A2($elm$core$String$indexes, ':', str);
			if (!_v0.b) {
				return $elm$core$Maybe$Just(
					A6($elm$url$Url$Url, protocol, str, $elm$core$Maybe$Nothing, path, params, frag));
			} else {
				if (!_v0.b.b) {
					var i = _v0.a;
					var _v1 = $elm$core$String$toInt(
						A2($elm$core$String$dropLeft, i + 1, str));
					if (_v1.$ === 1) {
						return $elm$core$Maybe$Nothing;
					} else {
						var port_ = _v1;
						return $elm$core$Maybe$Just(
							A6(
								$elm$url$Url$Url,
								protocol,
								A2($elm$core$String$left, i, str),
								port_,
								path,
								params,
								frag));
					}
				} else {
					return $elm$core$Maybe$Nothing;
				}
			}
		}
	});
var $elm$url$Url$chompBeforeQuery = F4(
	function (protocol, params, frag, str) {
		if ($elm$core$String$isEmpty(str)) {
			return $elm$core$Maybe$Nothing;
		} else {
			var _v0 = A2($elm$core$String$indexes, '/', str);
			if (!_v0.b) {
				return A5($elm$url$Url$chompBeforePath, protocol, '/', params, frag, str);
			} else {
				var i = _v0.a;
				return A5(
					$elm$url$Url$chompBeforePath,
					protocol,
					A2($elm$core$String$dropLeft, i, str),
					params,
					frag,
					A2($elm$core$String$left, i, str));
			}
		}
	});
var $elm$url$Url$chompBeforeFragment = F3(
	function (protocol, frag, str) {
		if ($elm$core$String$isEmpty(str)) {
			return $elm$core$Maybe$Nothing;
		} else {
			var _v0 = A2($elm$core$String$indexes, '?', str);
			if (!_v0.b) {
				return A4($elm$url$Url$chompBeforeQuery, protocol, $elm$core$Maybe$Nothing, frag, str);
			} else {
				var i = _v0.a;
				return A4(
					$elm$url$Url$chompBeforeQuery,
					protocol,
					$elm$core$Maybe$Just(
						A2($elm$core$String$dropLeft, i + 1, str)),
					frag,
					A2($elm$core$String$left, i, str));
			}
		}
	});
var $elm$url$Url$chompAfterProtocol = F2(
	function (protocol, str) {
		if ($elm$core$String$isEmpty(str)) {
			return $elm$core$Maybe$Nothing;
		} else {
			var _v0 = A2($elm$core$String$indexes, '#', str);
			if (!_v0.b) {
				return A3($elm$url$Url$chompBeforeFragment, protocol, $elm$core$Maybe$Nothing, str);
			} else {
				var i = _v0.a;
				return A3(
					$elm$url$Url$chompBeforeFragment,
					protocol,
					$elm$core$Maybe$Just(
						A2($elm$core$String$dropLeft, i + 1, str)),
					A2($elm$core$String$left, i, str));
			}
		}
	});
var $elm$core$String$startsWith = _String_startsWith;
var $elm$url$Url$fromString = function (str) {
	return A2($elm$core$String$startsWith, 'http://', str) ? A2(
		$elm$url$Url$chompAfterProtocol,
		0,
		A2($elm$core$String$dropLeft, 7, str)) : (A2($elm$core$String$startsWith, 'https://', str) ? A2(
		$elm$url$Url$chompAfterProtocol,
		1,
		A2($elm$core$String$dropLeft, 8, str)) : $elm$core$Maybe$Nothing);
};
var $elm$core$Basics$never = function (_v0) {
	never:
	while (true) {
		var nvr = _v0;
		var $temp$_v0 = nvr;
		_v0 = $temp$_v0;
		continue never;
	}
};
var $elm$core$Task$Perform = $elm$core$Basics$identity;
var $elm$core$Task$succeed = _Scheduler_succeed;
var $elm$core$Task$init = $elm$core$Task$succeed(0);
var $elm$core$List$foldrHelper = F4(
	function (fn, acc, ctr, ls) {
		if (!ls.b) {
			return acc;
		} else {
			var a = ls.a;
			var r1 = ls.b;
			if (!r1.b) {
				return A2(fn, a, acc);
			} else {
				var b = r1.a;
				var r2 = r1.b;
				if (!r2.b) {
					return A2(
						fn,
						a,
						A2(fn, b, acc));
				} else {
					var c = r2.a;
					var r3 = r2.b;
					if (!r3.b) {
						return A2(
							fn,
							a,
							A2(
								fn,
								b,
								A2(fn, c, acc)));
					} else {
						var d = r3.a;
						var r4 = r3.b;
						var res = (ctr > 500) ? A3(
							$elm$core$List$foldl,
							fn,
							acc,
							$elm$core$List$reverse(r4)) : A4($elm$core$List$foldrHelper, fn, acc, ctr + 1, r4);
						return A2(
							fn,
							a,
							A2(
								fn,
								b,
								A2(
									fn,
									c,
									A2(fn, d, res))));
					}
				}
			}
		}
	});
var $elm$core$List$foldr = F3(
	function (fn, acc, ls) {
		return A4($elm$core$List$foldrHelper, fn, acc, 0, ls);
	});
var $elm$core$List$map = F2(
	function (f, xs) {
		return A3(
			$elm$core$List$foldr,
			F2(
				function (x, acc) {
					return A2(
						$elm$core$List$cons,
						f(x),
						acc);
				}),
			_List_Nil,
			xs);
	});
var $elm$core$Task$andThen = _Scheduler_andThen;
var $elm$core$Task$map = F2(
	function (func, taskA) {
		return A2(
			$elm$core$Task$andThen,
			function (a) {
				return $elm$core$Task$succeed(
					func(a));
			},
			taskA);
	});
var $elm$core$Task$map2 = F3(
	function (func, taskA, taskB) {
		return A2(
			$elm$core$Task$andThen,
			function (a) {
				return A2(
					$elm$core$Task$andThen,
					function (b) {
						return $elm$core$Task$succeed(
							A2(func, a, b));
					},
					taskB);
			},
			taskA);
	});
var $elm$core$Task$sequence = function (tasks) {
	return A3(
		$elm$core$List$foldr,
		$elm$core$Task$map2($elm$core$List$cons),
		$elm$core$Task$succeed(_List_Nil),
		tasks);
};
var $elm$core$Platform$sendToApp = _Platform_sendToApp;
var $elm$core$Task$spawnCmd = F2(
	function (router, _v0) {
		var task = _v0;
		return _Scheduler_spawn(
			A2(
				$elm$core$Task$andThen,
				$elm$core$Platform$sendToApp(router),
				task));
	});
var $elm$core$Task$onEffects = F3(
	function (router, commands, state) {
		return A2(
			$elm$core$Task$map,
			function (_v0) {
				return 0;
			},
			$elm$core$Task$sequence(
				A2(
					$elm$core$List$map,
					$elm$core$Task$spawnCmd(router),
					commands)));
	});
var $elm$core$Task$onSelfMsg = F3(
	function (_v0, _v1, _v2) {
		return $elm$core$Task$succeed(0);
	});
var $elm$core$Task$cmdMap = F2(
	function (tagger, _v0) {
		var task = _v0;
		return A2($elm$core$Task$map, tagger, task);
	});
_Platform_effectManagers['Task'] = _Platform_createManager($elm$core$Task$init, $elm$core$Task$onEffects, $elm$core$Task$onSelfMsg, $elm$core$Task$cmdMap);
var $elm$core$Task$command = _Platform_leaf('Task');
var $elm$core$Task$perform = F2(
	function (toMessage, task) {
		return $elm$core$Task$command(
			A2($elm$core$Task$map, toMessage, task));
	});
var $elm$browser$Browser$application = _Browser_application;
var $author$project$Main$DefaultPuzzleLoaded = F3(
	function (a, b, c) {
		return {$: 1, a: a, b: b, c: c};
	});
var $author$project$Main$DefaultPuzzleProblem = {$: 0};
var $author$project$Main$SubmitPuzzleLetters = function (a) {
	return {$: 2, a: a};
};
var $elm$core$Platform$Cmd$batch = _Platform_batch;
var $author$project$Main$Focussed = F2(
	function (a, b) {
		return {$: 0, a: a, b: b};
	});
var $elm$core$Basics$composeL = F3(
	function (g, f, x) {
		return g(
			f(x));
	});
var $elm$core$Task$onError = _Scheduler_onError;
var $elm$core$Task$attempt = F2(
	function (resultToMessage, task) {
		return $elm$core$Task$command(
			A2(
				$elm$core$Task$onError,
				A2(
					$elm$core$Basics$composeL,
					A2($elm$core$Basics$composeL, $elm$core$Task$succeed, resultToMessage),
					$elm$core$Result$Err),
				A2(
					$elm$core$Task$andThen,
					A2(
						$elm$core$Basics$composeL,
						A2($elm$core$Basics$composeL, $elm$core$Task$succeed, resultToMessage),
						$elm$core$Result$Ok),
					task)));
	});
var $elm$browser$Browser$Dom$focus = _Browser_call('focus');
var $author$project$Main$focus = function (id) {
	return A2(
		$elm$core$Task$attempt,
		$author$project$Main$Focussed(id),
		$elm$browser$Browser$Dom$focus(id));
};
var $author$project$Nineagram$ContainsNonAlphaCharacters = F2(
	function (a, b) {
		return {$: 0, a: a, b: b};
	});
var $author$project$Nineagram$LettersTooFew = function (a) {
	return {$: 1, a: a};
};
var $author$project$Nineagram$LettersTooMany = function (a) {
	return {$: 2, a: a};
};
var $author$project$Nineagram$NineagramPuzzle = $elm$core$Basics$identity;
var $elm$core$List$filter = F2(
	function (isGood, list) {
		return A3(
			$elm$core$List$foldr,
			F2(
				function (x, xs) {
					return isGood(x) ? A2($elm$core$List$cons, x, xs) : xs;
				}),
			_List_Nil,
			list);
	});
var $elm$core$List$maybeCons = F3(
	function (f, mx, xs) {
		var _v0 = f(mx);
		if (!_v0.$) {
			var x = _v0.a;
			return A2($elm$core$List$cons, x, xs);
		} else {
			return xs;
		}
	});
var $elm$core$List$filterMap = F2(
	function (f, xs) {
		return A3(
			$elm$core$List$foldr,
			$elm$core$List$maybeCons(f),
			_List_Nil,
			xs);
	});
var $elm$core$Basics$not = _Basics_not;
var $elm$core$Char$toLower = _Char_toLower;
var $author$project$Nineagram$fromCharList = function (letters) {
	var length = $elm$core$List$length(letters);
	var checks = _List_fromArray(
		[
			function () {
			var _v0 = A2(
				$elm$core$List$filter,
				A2($elm$core$Basics$composeL, $elm$core$Basics$not, $elm$core$Char$isAlpha),
				letters);
			if (_v0.b) {
				var x = _v0.a;
				var xs = _v0.b;
				return $elm$core$Maybe$Just(
					A2($author$project$Nineagram$ContainsNonAlphaCharacters, x, xs));
			} else {
				return $elm$core$Maybe$Nothing;
			}
		}(),
			(length < 9) ? $elm$core$Maybe$Just(
			$author$project$Nineagram$LettersTooFew(length)) : ((length > 9) ? $elm$core$Maybe$Just(
			$author$project$Nineagram$LettersTooMany(length)) : $elm$core$Maybe$Nothing)
		]);
	var problems = A2($elm$core$List$filterMap, $elm$core$Basics$identity, checks);
	return _Utils_eq(problems, _List_Nil) ? $elm$core$Result$Ok(
		A2($elm$core$List$map, $elm$core$Char$toLower, letters)) : $elm$core$Result$Err(problems);
};
var $elm$core$String$foldr = _String_foldr;
var $elm$core$String$toList = function (string) {
	return A3($elm$core$String$foldr, $elm$core$List$cons, _List_Nil, string);
};
var $elm$core$String$trim = _String_trim;
var $author$project$Nineagram$fromString = function (letters) {
	return $author$project$Nineagram$fromCharList(
		$elm$core$String$toList(
			$elm$core$String$trim(letters)));
};
var $author$project$Main$NoGuesses = {$: 0};
var $author$project$Main$initState = {t: _List_Nil, L: false, M: $elm$core$Maybe$Nothing, j: $author$project$Main$NoGuesses, N: $author$project$Main$NoGuesses, A: _List_Nil, B: '', F: _List_Nil, v: '', n: $elm$core$Maybe$Nothing, O: _List_Nil};
var $elm$core$Platform$Cmd$none = $elm$core$Platform$Cmd$batch(_List_Nil);
var $elm$url$Url$Parser$State = F5(
	function (visited, unvisited, params, frag, value) {
		return {u: frag, w: params, s: unvisited, o: value, y: visited};
	});
var $elm$url$Url$Parser$getFirstMatch = function (states) {
	getFirstMatch:
	while (true) {
		if (!states.b) {
			return $elm$core$Maybe$Nothing;
		} else {
			var state = states.a;
			var rest = states.b;
			var _v1 = state.s;
			if (!_v1.b) {
				return $elm$core$Maybe$Just(state.o);
			} else {
				if ((_v1.a === '') && (!_v1.b.b)) {
					return $elm$core$Maybe$Just(state.o);
				} else {
					var $temp$states = rest;
					states = $temp$states;
					continue getFirstMatch;
				}
			}
		}
	}
};
var $elm$url$Url$Parser$removeFinalEmpty = function (segments) {
	if (!segments.b) {
		return _List_Nil;
	} else {
		if ((segments.a === '') && (!segments.b.b)) {
			return _List_Nil;
		} else {
			var segment = segments.a;
			var rest = segments.b;
			return A2(
				$elm$core$List$cons,
				segment,
				$elm$url$Url$Parser$removeFinalEmpty(rest));
		}
	}
};
var $elm$url$Url$Parser$preparePath = function (path) {
	var _v0 = A2($elm$core$String$split, '/', path);
	if (_v0.b && (_v0.a === '')) {
		var segments = _v0.b;
		return $elm$url$Url$Parser$removeFinalEmpty(segments);
	} else {
		var segments = _v0;
		return $elm$url$Url$Parser$removeFinalEmpty(segments);
	}
};
var $elm$url$Url$Parser$addToParametersHelp = F2(
	function (value, maybeList) {
		if (maybeList.$ === 1) {
			return $elm$core$Maybe$Just(
				_List_fromArray(
					[value]));
		} else {
			var list = maybeList.a;
			return $elm$core$Maybe$Just(
				A2($elm$core$List$cons, value, list));
		}
	});
var $elm$url$Url$percentDecode = _Url_percentDecode;
var $elm$core$Basics$compare = _Utils_compare;
var $elm$core$Dict$get = F2(
	function (targetKey, dict) {
		get:
		while (true) {
			if (dict.$ === -2) {
				return $elm$core$Maybe$Nothing;
			} else {
				var key = dict.b;
				var value = dict.c;
				var left = dict.d;
				var right = dict.e;
				var _v1 = A2($elm$core$Basics$compare, targetKey, key);
				switch (_v1) {
					case 0:
						var $temp$targetKey = targetKey,
							$temp$dict = left;
						targetKey = $temp$targetKey;
						dict = $temp$dict;
						continue get;
					case 1:
						return $elm$core$Maybe$Just(value);
					default:
						var $temp$targetKey = targetKey,
							$temp$dict = right;
						targetKey = $temp$targetKey;
						dict = $temp$dict;
						continue get;
				}
			}
		}
	});
var $elm$core$Dict$Black = 1;
var $elm$core$Dict$RBNode_elm_builtin = F5(
	function (a, b, c, d, e) {
		return {$: -1, a: a, b: b, c: c, d: d, e: e};
	});
var $elm$core$Dict$RBEmpty_elm_builtin = {$: -2};
var $elm$core$Dict$Red = 0;
var $elm$core$Dict$balance = F5(
	function (color, key, value, left, right) {
		if ((right.$ === -1) && (!right.a)) {
			var _v1 = right.a;
			var rK = right.b;
			var rV = right.c;
			var rLeft = right.d;
			var rRight = right.e;
			if ((left.$ === -1) && (!left.a)) {
				var _v3 = left.a;
				var lK = left.b;
				var lV = left.c;
				var lLeft = left.d;
				var lRight = left.e;
				return A5(
					$elm$core$Dict$RBNode_elm_builtin,
					0,
					key,
					value,
					A5($elm$core$Dict$RBNode_elm_builtin, 1, lK, lV, lLeft, lRight),
					A5($elm$core$Dict$RBNode_elm_builtin, 1, rK, rV, rLeft, rRight));
			} else {
				return A5(
					$elm$core$Dict$RBNode_elm_builtin,
					color,
					rK,
					rV,
					A5($elm$core$Dict$RBNode_elm_builtin, 0, key, value, left, rLeft),
					rRight);
			}
		} else {
			if ((((left.$ === -1) && (!left.a)) && (left.d.$ === -1)) && (!left.d.a)) {
				var _v5 = left.a;
				var lK = left.b;
				var lV = left.c;
				var _v6 = left.d;
				var _v7 = _v6.a;
				var llK = _v6.b;
				var llV = _v6.c;
				var llLeft = _v6.d;
				var llRight = _v6.e;
				var lRight = left.e;
				return A5(
					$elm$core$Dict$RBNode_elm_builtin,
					0,
					lK,
					lV,
					A5($elm$core$Dict$RBNode_elm_builtin, 1, llK, llV, llLeft, llRight),
					A5($elm$core$Dict$RBNode_elm_builtin, 1, key, value, lRight, right));
			} else {
				return A5($elm$core$Dict$RBNode_elm_builtin, color, key, value, left, right);
			}
		}
	});
var $elm$core$Dict$insertHelp = F3(
	function (key, value, dict) {
		if (dict.$ === -2) {
			return A5($elm$core$Dict$RBNode_elm_builtin, 0, key, value, $elm$core$Dict$RBEmpty_elm_builtin, $elm$core$Dict$RBEmpty_elm_builtin);
		} else {
			var nColor = dict.a;
			var nKey = dict.b;
			var nValue = dict.c;
			var nLeft = dict.d;
			var nRight = dict.e;
			var _v1 = A2($elm$core$Basics$compare, key, nKey);
			switch (_v1) {
				case 0:
					return A5(
						$elm$core$Dict$balance,
						nColor,
						nKey,
						nValue,
						A3($elm$core$Dict$insertHelp, key, value, nLeft),
						nRight);
				case 1:
					return A5($elm$core$Dict$RBNode_elm_builtin, nColor, nKey, value, nLeft, nRight);
				default:
					return A5(
						$elm$core$Dict$balance,
						nColor,
						nKey,
						nValue,
						nLeft,
						A3($elm$core$Dict$insertHelp, key, value, nRight));
			}
		}
	});
var $elm$core$Dict$insert = F3(
	function (key, value, dict) {
		var _v0 = A3($elm$core$Dict$insertHelp, key, value, dict);
		if ((_v0.$ === -1) && (!_v0.a)) {
			var _v1 = _v0.a;
			var k = _v0.b;
			var v = _v0.c;
			var l = _v0.d;
			var r = _v0.e;
			return A5($elm$core$Dict$RBNode_elm_builtin, 1, k, v, l, r);
		} else {
			var x = _v0;
			return x;
		}
	});
var $elm$core$Dict$getMin = function (dict) {
	getMin:
	while (true) {
		if ((dict.$ === -1) && (dict.d.$ === -1)) {
			var left = dict.d;
			var $temp$dict = left;
			dict = $temp$dict;
			continue getMin;
		} else {
			return dict;
		}
	}
};
var $elm$core$Dict$moveRedLeft = function (dict) {
	if (((dict.$ === -1) && (dict.d.$ === -1)) && (dict.e.$ === -1)) {
		if ((dict.e.d.$ === -1) && (!dict.e.d.a)) {
			var clr = dict.a;
			var k = dict.b;
			var v = dict.c;
			var _v1 = dict.d;
			var lClr = _v1.a;
			var lK = _v1.b;
			var lV = _v1.c;
			var lLeft = _v1.d;
			var lRight = _v1.e;
			var _v2 = dict.e;
			var rClr = _v2.a;
			var rK = _v2.b;
			var rV = _v2.c;
			var rLeft = _v2.d;
			var _v3 = rLeft.a;
			var rlK = rLeft.b;
			var rlV = rLeft.c;
			var rlL = rLeft.d;
			var rlR = rLeft.e;
			var rRight = _v2.e;
			return A5(
				$elm$core$Dict$RBNode_elm_builtin,
				0,
				rlK,
				rlV,
				A5(
					$elm$core$Dict$RBNode_elm_builtin,
					1,
					k,
					v,
					A5($elm$core$Dict$RBNode_elm_builtin, 0, lK, lV, lLeft, lRight),
					rlL),
				A5($elm$core$Dict$RBNode_elm_builtin, 1, rK, rV, rlR, rRight));
		} else {
			var clr = dict.a;
			var k = dict.b;
			var v = dict.c;
			var _v4 = dict.d;
			var lClr = _v4.a;
			var lK = _v4.b;
			var lV = _v4.c;
			var lLeft = _v4.d;
			var lRight = _v4.e;
			var _v5 = dict.e;
			var rClr = _v5.a;
			var rK = _v5.b;
			var rV = _v5.c;
			var rLeft = _v5.d;
			var rRight = _v5.e;
			if (clr === 1) {
				return A5(
					$elm$core$Dict$RBNode_elm_builtin,
					1,
					k,
					v,
					A5($elm$core$Dict$RBNode_elm_builtin, 0, lK, lV, lLeft, lRight),
					A5($elm$core$Dict$RBNode_elm_builtin, 0, rK, rV, rLeft, rRight));
			} else {
				return A5(
					$elm$core$Dict$RBNode_elm_builtin,
					1,
					k,
					v,
					A5($elm$core$Dict$RBNode_elm_builtin, 0, lK, lV, lLeft, lRight),
					A5($elm$core$Dict$RBNode_elm_builtin, 0, rK, rV, rLeft, rRight));
			}
		}
	} else {
		return dict;
	}
};
var $elm$core$Dict$moveRedRight = function (dict) {
	if (((dict.$ === -1) && (dict.d.$ === -1)) && (dict.e.$ === -1)) {
		if ((dict.d.d.$ === -1) && (!dict.d.d.a)) {
			var clr = dict.a;
			var k = dict.b;
			var v = dict.c;
			var _v1 = dict.d;
			var lClr = _v1.a;
			var lK = _v1.b;
			var lV = _v1.c;
			var _v2 = _v1.d;
			var _v3 = _v2.a;
			var llK = _v2.b;
			var llV = _v2.c;
			var llLeft = _v2.d;
			var llRight = _v2.e;
			var lRight = _v1.e;
			var _v4 = dict.e;
			var rClr = _v4.a;
			var rK = _v4.b;
			var rV = _v4.c;
			var rLeft = _v4.d;
			var rRight = _v4.e;
			return A5(
				$elm$core$Dict$RBNode_elm_builtin,
				0,
				lK,
				lV,
				A5($elm$core$Dict$RBNode_elm_builtin, 1, llK, llV, llLeft, llRight),
				A5(
					$elm$core$Dict$RBNode_elm_builtin,
					1,
					k,
					v,
					lRight,
					A5($elm$core$Dict$RBNode_elm_builtin, 0, rK, rV, rLeft, rRight)));
		} else {
			var clr = dict.a;
			var k = dict.b;
			var v = dict.c;
			var _v5 = dict.d;
			var lClr = _v5.a;
			var lK = _v5.b;
			var lV = _v5.c;
			var lLeft = _v5.d;
			var lRight = _v5.e;
			var _v6 = dict.e;
			var rClr = _v6.a;
			var rK = _v6.b;
			var rV = _v6.c;
			var rLeft = _v6.d;
			var rRight = _v6.e;
			if (clr === 1) {
				return A5(
					$elm$core$Dict$RBNode_elm_builtin,
					1,
					k,
					v,
					A5($elm$core$Dict$RBNode_elm_builtin, 0, lK, lV, lLeft, lRight),
					A5($elm$core$Dict$RBNode_elm_builtin, 0, rK, rV, rLeft, rRight));
			} else {
				return A5(
					$elm$core$Dict$RBNode_elm_builtin,
					1,
					k,
					v,
					A5($elm$core$Dict$RBNode_elm_builtin, 0, lK, lV, lLeft, lRight),
					A5($elm$core$Dict$RBNode_elm_builtin, 0, rK, rV, rLeft, rRight));
			}
		}
	} else {
		return dict;
	}
};
var $elm$core$Dict$removeHelpPrepEQGT = F7(
	function (targetKey, dict, color, key, value, left, right) {
		if ((left.$ === -1) && (!left.a)) {
			var _v1 = left.a;
			var lK = left.b;
			var lV = left.c;
			var lLeft = left.d;
			var lRight = left.e;
			return A5(
				$elm$core$Dict$RBNode_elm_builtin,
				color,
				lK,
				lV,
				lLeft,
				A5($elm$core$Dict$RBNode_elm_builtin, 0, key, value, lRight, right));
		} else {
			_v2$2:
			while (true) {
				if ((right.$ === -1) && (right.a === 1)) {
					if (right.d.$ === -1) {
						if (right.d.a === 1) {
							var _v3 = right.a;
							var _v4 = right.d;
							var _v5 = _v4.a;
							return $elm$core$Dict$moveRedRight(dict);
						} else {
							break _v2$2;
						}
					} else {
						var _v6 = right.a;
						var _v7 = right.d;
						return $elm$core$Dict$moveRedRight(dict);
					}
				} else {
					break _v2$2;
				}
			}
			return dict;
		}
	});
var $elm$core$Dict$removeMin = function (dict) {
	if ((dict.$ === -1) && (dict.d.$ === -1)) {
		var color = dict.a;
		var key = dict.b;
		var value = dict.c;
		var left = dict.d;
		var lColor = left.a;
		var lLeft = left.d;
		var right = dict.e;
		if (lColor === 1) {
			if ((lLeft.$ === -1) && (!lLeft.a)) {
				var _v3 = lLeft.a;
				return A5(
					$elm$core$Dict$RBNode_elm_builtin,
					color,
					key,
					value,
					$elm$core$Dict$removeMin(left),
					right);
			} else {
				var _v4 = $elm$core$Dict$moveRedLeft(dict);
				if (_v4.$ === -1) {
					var nColor = _v4.a;
					var nKey = _v4.b;
					var nValue = _v4.c;
					var nLeft = _v4.d;
					var nRight = _v4.e;
					return A5(
						$elm$core$Dict$balance,
						nColor,
						nKey,
						nValue,
						$elm$core$Dict$removeMin(nLeft),
						nRight);
				} else {
					return $elm$core$Dict$RBEmpty_elm_builtin;
				}
			}
		} else {
			return A5(
				$elm$core$Dict$RBNode_elm_builtin,
				color,
				key,
				value,
				$elm$core$Dict$removeMin(left),
				right);
		}
	} else {
		return $elm$core$Dict$RBEmpty_elm_builtin;
	}
};
var $elm$core$Dict$removeHelp = F2(
	function (targetKey, dict) {
		if (dict.$ === -2) {
			return $elm$core$Dict$RBEmpty_elm_builtin;
		} else {
			var color = dict.a;
			var key = dict.b;
			var value = dict.c;
			var left = dict.d;
			var right = dict.e;
			if (_Utils_cmp(targetKey, key) < 0) {
				if ((left.$ === -1) && (left.a === 1)) {
					var _v4 = left.a;
					var lLeft = left.d;
					if ((lLeft.$ === -1) && (!lLeft.a)) {
						var _v6 = lLeft.a;
						return A5(
							$elm$core$Dict$RBNode_elm_builtin,
							color,
							key,
							value,
							A2($elm$core$Dict$removeHelp, targetKey, left),
							right);
					} else {
						var _v7 = $elm$core$Dict$moveRedLeft(dict);
						if (_v7.$ === -1) {
							var nColor = _v7.a;
							var nKey = _v7.b;
							var nValue = _v7.c;
							var nLeft = _v7.d;
							var nRight = _v7.e;
							return A5(
								$elm$core$Dict$balance,
								nColor,
								nKey,
								nValue,
								A2($elm$core$Dict$removeHelp, targetKey, nLeft),
								nRight);
						} else {
							return $elm$core$Dict$RBEmpty_elm_builtin;
						}
					}
				} else {
					return A5(
						$elm$core$Dict$RBNode_elm_builtin,
						color,
						key,
						value,
						A2($elm$core$Dict$removeHelp, targetKey, left),
						right);
				}
			} else {
				return A2(
					$elm$core$Dict$removeHelpEQGT,
					targetKey,
					A7($elm$core$Dict$removeHelpPrepEQGT, targetKey, dict, color, key, value, left, right));
			}
		}
	});
var $elm$core$Dict$removeHelpEQGT = F2(
	function (targetKey, dict) {
		if (dict.$ === -1) {
			var color = dict.a;
			var key = dict.b;
			var value = dict.c;
			var left = dict.d;
			var right = dict.e;
			if (_Utils_eq(targetKey, key)) {
				var _v1 = $elm$core$Dict$getMin(right);
				if (_v1.$ === -1) {
					var minKey = _v1.b;
					var minValue = _v1.c;
					return A5(
						$elm$core$Dict$balance,
						color,
						minKey,
						minValue,
						left,
						$elm$core$Dict$removeMin(right));
				} else {
					return $elm$core$Dict$RBEmpty_elm_builtin;
				}
			} else {
				return A5(
					$elm$core$Dict$balance,
					color,
					key,
					value,
					left,
					A2($elm$core$Dict$removeHelp, targetKey, right));
			}
		} else {
			return $elm$core$Dict$RBEmpty_elm_builtin;
		}
	});
var $elm$core$Dict$remove = F2(
	function (key, dict) {
		var _v0 = A2($elm$core$Dict$removeHelp, key, dict);
		if ((_v0.$ === -1) && (!_v0.a)) {
			var _v1 = _v0.a;
			var k = _v0.b;
			var v = _v0.c;
			var l = _v0.d;
			var r = _v0.e;
			return A5($elm$core$Dict$RBNode_elm_builtin, 1, k, v, l, r);
		} else {
			var x = _v0;
			return x;
		}
	});
var $elm$core$Dict$update = F3(
	function (targetKey, alter, dictionary) {
		var _v0 = alter(
			A2($elm$core$Dict$get, targetKey, dictionary));
		if (!_v0.$) {
			var value = _v0.a;
			return A3($elm$core$Dict$insert, targetKey, value, dictionary);
		} else {
			return A2($elm$core$Dict$remove, targetKey, dictionary);
		}
	});
var $elm$url$Url$Parser$addParam = F2(
	function (segment, dict) {
		var _v0 = A2($elm$core$String$split, '=', segment);
		if ((_v0.b && _v0.b.b) && (!_v0.b.b.b)) {
			var rawKey = _v0.a;
			var _v1 = _v0.b;
			var rawValue = _v1.a;
			var _v2 = $elm$url$Url$percentDecode(rawKey);
			if (_v2.$ === 1) {
				return dict;
			} else {
				var key = _v2.a;
				var _v3 = $elm$url$Url$percentDecode(rawValue);
				if (_v3.$ === 1) {
					return dict;
				} else {
					var value = _v3.a;
					return A3(
						$elm$core$Dict$update,
						key,
						$elm$url$Url$Parser$addToParametersHelp(value),
						dict);
				}
			}
		} else {
			return dict;
		}
	});
var $elm$core$Dict$empty = $elm$core$Dict$RBEmpty_elm_builtin;
var $elm$url$Url$Parser$prepareQuery = function (maybeQuery) {
	if (maybeQuery.$ === 1) {
		return $elm$core$Dict$empty;
	} else {
		var qry = maybeQuery.a;
		return A3(
			$elm$core$List$foldr,
			$elm$url$Url$Parser$addParam,
			$elm$core$Dict$empty,
			A2($elm$core$String$split, '&', qry));
	}
};
var $elm$url$Url$Parser$parse = F2(
	function (_v0, url) {
		var parser = _v0;
		return $elm$url$Url$Parser$getFirstMatch(
			parser(
				A5(
					$elm$url$Url$Parser$State,
					_List_Nil,
					$elm$url$Url$Parser$preparePath(url.aI),
					$elm$url$Url$Parser$prepareQuery(url.ak),
					url._,
					$elm$core$Basics$identity)));
	});
var $elm$url$Url$Parser$Parser = $elm$core$Basics$identity;
var $elm$url$Url$Parser$query = function (_v0) {
	var queryParser = _v0;
	return function (_v1) {
		var visited = _v1.y;
		var unvisited = _v1.s;
		var params = _v1.w;
		var frag = _v1.u;
		var value = _v1.o;
		return _List_fromArray(
			[
				A5(
				$elm$url$Url$Parser$State,
				visited,
				unvisited,
				params,
				frag,
				value(
					queryParser(params)))
			]);
	};
};
var $elm$url$Url$Parser$Internal$Parser = $elm$core$Basics$identity;
var $elm$core$Maybe$withDefault = F2(
	function (_default, maybe) {
		if (!maybe.$) {
			var value = maybe.a;
			return value;
		} else {
			return _default;
		}
	});
var $elm$url$Url$Parser$Query$custom = F2(
	function (key, func) {
		return function (dict) {
			return func(
				A2(
					$elm$core$Maybe$withDefault,
					_List_Nil,
					A2($elm$core$Dict$get, key, dict)));
		};
	});
var $elm$url$Url$Parser$Query$string = function (key) {
	return A2(
		$elm$url$Url$Parser$Query$custom,
		key,
		function (stringList) {
			if (stringList.b && (!stringList.b.b)) {
				var str = stringList.a;
				return $elm$core$Maybe$Just(str);
			} else {
				return $elm$core$Maybe$Nothing;
			}
		});
};
var $author$project$Main$parseQueryParameter = F2(
	function (target, url) {
		return A2(
			$elm$core$Maybe$withDefault,
			$elm$core$Maybe$Nothing,
			A2(
				$elm$url$Url$Parser$parse,
				$elm$url$Url$Parser$query(
					$elm$url$Url$Parser$Query$string(target)),
				_Utils_update(
					url,
					{aI: ''})));
	});
var $author$project$Main$init = F2(
	function (url, key) {
		var _v0 = $author$project$Nineagram$fromString('GRNAMNIEA');
		if (!_v0.$) {
			var defaultPuzzle = _v0.a;
			return _Utils_Tuple2(
				A3($author$project$Main$DefaultPuzzleLoaded, defaultPuzzle, key, $author$project$Main$initState),
				$elm$core$Platform$Cmd$batch(
					_List_fromArray(
						[
							$author$project$Main$focus('puzzleLetters'),
							function () {
							var _v1 = A2($author$project$Main$parseQueryParameter, 'letters', url);
							if (!_v1.$) {
								var letters = _v1.a;
								return A2(
									$elm$core$Task$perform,
									$author$project$Main$SubmitPuzzleLetters,
									$elm$core$Task$succeed(letters));
							} else {
								return $elm$core$Platform$Cmd$none;
							}
						}()
						])));
		} else {
			return _Utils_Tuple2($author$project$Main$DefaultPuzzleProblem, $elm$core$Platform$Cmd$none);
		}
	});
var $elm$core$Platform$Sub$batch = _Platform_batch;
var $elm$core$Platform$Sub$none = $elm$core$Platform$Sub$batch(_List_Nil);
var $author$project$Main$OneGuess = function (a) {
	return {$: 1, a: a};
};
var $author$project$Main$TwoGuesses = F2(
	function (a, b) {
		return {$: 2, a: a, b: b};
	});
var $elm$core$List$drop = F2(
	function (n, list) {
		drop:
		while (true) {
			if (n <= 0) {
				return list;
			} else {
				if (!list.b) {
					return list;
				} else {
					var x = list.a;
					var xs = list.b;
					var $temp$n = n - 1,
						$temp$list = xs;
					n = $temp$n;
					list = $temp$list;
					continue drop;
				}
			}
		}
	});
var $elm$core$List$takeReverse = F3(
	function (n, list, kept) {
		takeReverse:
		while (true) {
			if (n <= 0) {
				return kept;
			} else {
				if (!list.b) {
					return kept;
				} else {
					var x = list.a;
					var xs = list.b;
					var $temp$n = n - 1,
						$temp$list = xs,
						$temp$kept = A2($elm$core$List$cons, x, kept);
					n = $temp$n;
					list = $temp$list;
					kept = $temp$kept;
					continue takeReverse;
				}
			}
		}
	});
var $elm$core$List$takeTailRec = F2(
	function (n, list) {
		return $elm$core$List$reverse(
			A3($elm$core$List$takeReverse, n, list, _List_Nil));
	});
var $elm$core$List$takeFast = F3(
	function (ctr, n, list) {
		if (n <= 0) {
			return _List_Nil;
		} else {
			var _v0 = _Utils_Tuple2(n, list);
			_v0$1:
			while (true) {
				_v0$5:
				while (true) {
					if (!_v0.b.b) {
						return list;
					} else {
						if (_v0.b.b.b) {
							switch (_v0.a) {
								case 1:
									break _v0$1;
								case 2:
									var _v2 = _v0.b;
									var x = _v2.a;
									var _v3 = _v2.b;
									var y = _v3.a;
									return _List_fromArray(
										[x, y]);
								case 3:
									if (_v0.b.b.b.b) {
										var _v4 = _v0.b;
										var x = _v4.a;
										var _v5 = _v4.b;
										var y = _v5.a;
										var _v6 = _v5.b;
										var z = _v6.a;
										return _List_fromArray(
											[x, y, z]);
									} else {
										break _v0$5;
									}
								default:
									if (_v0.b.b.b.b && _v0.b.b.b.b.b) {
										var _v7 = _v0.b;
										var x = _v7.a;
										var _v8 = _v7.b;
										var y = _v8.a;
										var _v9 = _v8.b;
										var z = _v9.a;
										var _v10 = _v9.b;
										var w = _v10.a;
										var tl = _v10.b;
										return (ctr > 1000) ? A2(
											$elm$core$List$cons,
											x,
											A2(
												$elm$core$List$cons,
												y,
												A2(
													$elm$core$List$cons,
													z,
													A2(
														$elm$core$List$cons,
														w,
														A2($elm$core$List$takeTailRec, n - 4, tl))))) : A2(
											$elm$core$List$cons,
											x,
											A2(
												$elm$core$List$cons,
												y,
												A2(
													$elm$core$List$cons,
													z,
													A2(
														$elm$core$List$cons,
														w,
														A3($elm$core$List$takeFast, ctr + 1, n - 4, tl)))));
									} else {
										break _v0$5;
									}
							}
						} else {
							if (_v0.a === 1) {
								break _v0$1;
							} else {
								break _v0$5;
							}
						}
					}
				}
				return list;
			}
			var _v1 = _v0.b;
			var x = _v1.a;
			return _List_fromArray(
				[x]);
		}
	});
var $elm$core$List$take = F2(
	function (n, list) {
		return A3($elm$core$List$takeFast, 0, n, list);
	});
var $author$project$Nineagram$Guess$toString = function (_v0) {
	var s = _v0;
	return s;
};
var $author$project$Nineagram$getMiddleLetter = function (guess) {
	return A2(
		$elm$core$List$drop,
		2,
		A2(
			$elm$core$List$take,
			3,
			$elm$core$String$toList(
				$author$project$Nineagram$Guess$toString(guess))));
};
var $elm$core$Basics$neq = _Utils_notEqual;
var $author$project$Nineagram$LetterNotFound = $elm$core$Basics$identity;
var $author$project$Nineagram$removeLetter = F2(
	function (input, letter) {
		if (!input.b) {
			return $elm$core$Result$Err(letter);
		} else {
			var x = input.a;
			var rest = input.b;
			if (_Utils_eq(x, letter)) {
				return $elm$core$Result$Ok(rest);
			} else {
				var _v1 = A2($author$project$Nineagram$removeLetter, rest, letter);
				if (_v1.$ === 1) {
					var err = _v1.a;
					return $elm$core$Result$Err(err);
				} else {
					var remainingInput = _v1.a;
					return $elm$core$Result$Ok(
						A2($elm$core$List$cons, x, remainingInput));
				}
			}
		}
	});
var $author$project$Nineagram$removeLetters = F2(
	function (input, lettersToRemove) {
		removeLetters:
		while (true) {
			if (!lettersToRemove.b) {
				return $elm$core$Result$Ok(input);
			} else {
				var x = lettersToRemove.a;
				var rest = lettersToRemove.b;
				var _v1 = A2($author$project$Nineagram$removeLetter, input, x);
				if (_v1.$ === 1) {
					var problem = _v1.a;
					return $elm$core$Result$Err(
						_List_fromArray(
							[problem]));
				} else {
					var inputWithXRemoved = _v1.a;
					var $temp$input = inputWithXRemoved,
						$temp$lettersToRemove = rest;
					input = $temp$input;
					lettersToRemove = $temp$lettersToRemove;
					continue removeLetters;
				}
			}
		}
	});
var $author$project$Nineagram$removeMiddleLetter = function (guess) {
	return _Utils_ap(
		A2($elm$core$List$take, 2, guess),
		A2($elm$core$List$drop, 3, guess));
};
var $author$project$Nineagram$isSolution = F3(
	function (_v0, guess, otherGuess) {
		var puzzleLetters = _v0;
		if (!_Utils_eq(
			$author$project$Nineagram$getMiddleLetter(guess),
			$author$project$Nineagram$getMiddleLetter(otherGuess))) {
			return false;
		} else {
			var _v1 = A2(
				$author$project$Nineagram$removeLetters,
				puzzleLetters,
				$elm$core$String$toList(
					$author$project$Nineagram$Guess$toString(guess)));
			if (_v1.$ === 1) {
				return false;
			} else {
				var letters = _v1.a;
				var _v2 = A2(
					$author$project$Nineagram$removeLetters,
					letters,
					$author$project$Nineagram$removeMiddleLetter(
						$elm$core$String$toList(
							$author$project$Nineagram$Guess$toString(otherGuess))));
				if (_v2.$ === 1) {
					return false;
				} else {
					if (!_v2.a.b) {
						return true;
					} else {
						return false;
					}
				}
			}
		}
	});
var $author$project$Nineagram$remainingLetters = F2(
	function (_v0, guess) {
		var puzzleLetters = _v0;
		return A2(
			$author$project$Nineagram$removeLetters,
			puzzleLetters,
			$elm$core$String$toList(
				$author$project$Nineagram$Guess$toString(guess)));
	});
var $author$project$Nineagram$validateGuess = F2(
	function (nineagram, guess) {
		var _v0 = A2($author$project$Nineagram$remainingLetters, nineagram, guess);
		if (!_v0.$) {
			return $elm$core$Result$Ok(0);
		} else {
			var problems = _v0.a;
			return $elm$core$Result$Err(problems);
		}
	});
var $author$project$Main$addAttempt = F3(
	function (model, puzzle, guess) {
		var _v0 = A2($author$project$Nineagram$validateGuess, puzzle, guess);
		if (_v0.$ === 1) {
			var problems = _v0.a;
			return _Utils_update(
				model,
				{A: problems});
		} else {
			var newAttempt = function () {
				var _v1 = model.j;
				switch (_v1.$) {
					case 0:
						return $author$project$Main$OneGuess(guess);
					case 1:
						var firstGuess = _v1.a;
						return A3($author$project$Nineagram$isSolution, puzzle, firstGuess, guess) ? A2($author$project$Main$TwoGuesses, firstGuess, guess) : $author$project$Main$OneGuess(guess);
					default:
						return $author$project$Main$OneGuess(guess);
				}
			}();
			return _Utils_update(
				model,
				{
					t: A2($elm$core$List$cons, newAttempt, model.t),
					j: newAttempt,
					A: _List_Nil,
					B: ''
				});
		}
	});
var $author$project$Main$deleteAttempt = F2(
	function (attempt, state) {
		return _Utils_update(
			state,
			{
				t: A2(
					$elm$core$List$filter,
					function (a) {
						return !_Utils_eq(a, attempt);
					},
					state.t),
				j: _Utils_eq(state.j, attempt) ? state.N : state.j
			});
	});
var $author$project$Nineagram$Guess$Guess = $elm$core$Basics$identity;
var $author$project$Nineagram$Guess$TooLong = function (a) {
	return {$: 1, a: a};
};
var $author$project$Nineagram$Guess$TooShort = function (a) {
	return {$: 0, a: a};
};
var $elm$core$String$toLower = _String_toLower;
var $author$project$Nineagram$Guess$fromString = function (guess) {
	var length = $elm$core$String$length(guess);
	return (length < 5) ? $elm$core$Result$Err(
		_List_fromArray(
			[
				$author$project$Nineagram$Guess$TooShort(length)
			])) : ((length > 5) ? $elm$core$Result$Err(
		_List_fromArray(
			[
				$author$project$Nineagram$Guess$TooLong(length)
			])) : $elm$core$Result$Ok(
		$elm$core$String$toLower(guess)));
};
var $author$project$Main$ComputerSolved = function (a) {
	return {$: 10, a: a};
};
var $elm$core$String$fromList = _String_fromList;
var $author$project$Nineagram$getLetters = function (_v0) {
	var letters = _v0;
	return letters;
};
var $elm$browser$Browser$Navigation$pushUrl = _Browser_pushUrl;
var $elm$url$Url$Builder$toQueryPair = function (_v0) {
	var key = _v0.a;
	var value = _v0.b;
	return key + ('=' + value);
};
var $elm$url$Url$Builder$toQuery = function (parameters) {
	if (!parameters.b) {
		return '';
	} else {
		return '?' + A2(
			$elm$core$String$join,
			'&',
			A2($elm$core$List$map, $elm$url$Url$Builder$toQueryPair, parameters));
	}
};
var $elm$url$Url$Builder$relative = F2(
	function (pathSegments, parameters) {
		return _Utils_ap(
			A2($elm$core$String$join, '/', pathSegments),
			$elm$url$Url$Builder$toQuery(parameters));
	});
var $author$project$Main$ComputerSolution = F2(
	function (a, b) {
		return {$: 0, a: a, b: b};
	});
var $elm$core$Process$sleep = _Process_sleep;
var $author$project$Main$batchedFoldl = F4(
	function (batchSize, reducer, ini, list) {
		var remainingItems = A2($elm$core$List$drop, batchSize, list);
		var batchItems = A2($elm$core$List$take, batchSize, list);
		var workResult = A3($elm$core$List$foldl, reducer, ini, batchItems);
		if (!remainingItems.b) {
			return $elm$core$Task$succeed(workResult);
		} else {
			return A2(
				$elm$core$Task$andThen,
				function (_v1) {
					return A4($author$project$Main$batchedFoldl, batchSize, reducer, workResult, remainingItems);
				},
				$elm$core$Process$sleep(0));
		}
	});
var $author$project$Main$batchedFilter = F3(
	function (batchSize, fn, list) {
		return A4(
			$author$project$Main$batchedFoldl,
			batchSize,
			F2(
				function (a, acc) {
					return fn(a) ? A2($elm$core$List$cons, a, acc) : acc;
				}),
			_List_Nil,
			list);
	});
var $author$project$Main$batchedFilterMap = F3(
	function (batchSize, fn, list) {
		return A4(
			$author$project$Main$batchedFoldl,
			batchSize,
			F2(
				function (a, acc) {
					var _v0 = fn(a);
					if (!_v0.$) {
						var b = _v0.a;
						return A2($elm$core$List$cons, b, acc);
					} else {
						return acc;
					}
				}),
			_List_Nil,
			list);
	});
var $author$project$Cheat$cheatWords = _List_fromArray(
	['aahed', 'aalii', 'aargh', 'abaca', 'abaci', 'aback', 'abaft', 'abaka', 'abamp', 'abase', 'abash', 'abate', 'abaya', 'abbas', 'abbes', 'abbey', 'abbot', 'abeam', 'abele', 'abets', 'abhor', 'abide', 'abled', 'abler', 'ables', 'abmho', 'abode', 'abohm', 'aboil', 'aboma', 'aboon', 'abort', 'about', 'above', 'abris', 'abuse', 'abuts', 'abuzz', 'abyes', 'abysm', 'abyss', 'acari', 'acerb', 'aceta', 'ached', 'aches', 'achoo', 'acids', 'acidy', 'acing', 'acini', 'ackee', 'acmes', 'acmic', 'acned', 'acnes', 'acock', 'acold', 'acorn', 'acred', 'acres', 'acrid', 'acted', 'actin', 'actor', 'acute', 'acyls', 'adage', 'adapt', 'addax', 'added', 'adder', 'addle', 'adeem', 'adept', 'adieu', 'adios', 'adits', 'adman', 'admen', 'admit', 'admix', 'adobe', 'adobo', 'adopt', 'adore', 'adorn', 'adown', 'adoze', 'adult', 'adunc', 'adust', 'adyta', 'adzed', 'adzes', 'aecia', 'aedes', 'aegis', 'aeons', 'aerie', 'afars', 'affix', 'afire', 'afoot', 'afore', 'afoul', 'afrit', 'after', 'again', 'agama', 'agape', 'agars', 'agate', 'agave', 'agaze', 'agene', 'agent', 'agers', 'agger', 'aggie', 'aggro', 'aghas', 'agile', 'aging', 'agios', 'agism', 'agist', 'agita', 'aglee', 'aglet', 'agley', 'aglow', 'agmas', 'agone', 'agons', 'agony', 'agora', 'agree', 'agria', 'agues', 'ahead', 'ahing', 'ahold', 'ahull', 'aided', 'aider', 'aides', 'ailed', 'aimed', 'aimer', 'aioli', 'aired', 'airer', 'airns', 'airth', 'airts', 'aisle', 'aitch', 'aiver', 'ajiva', 'ajuga', 'akees', 'akela', 'akene', 'alack', 'alamo', 'aland', 'alane', 'alang', 'alans', 'alant', 'alarm', 'alary', 'alate', 'albas', 'album', 'alcid', 'alder', 'aldol', 'alecs', 'alefs', 'aleph', 'alert', 'alfas', 'algae', 'algal', 'algas', 'algid', 'algin', 'algor', 'algum', 'alias', 'alibi', 'alien', 'alifs', 'align', 'alike', 'aline', 'alist', 'alive', 'aliya', 'alkie', 'alkyd', 'alkyl', 'allay', 'allee', 'alley', 'allod', 'allot', 'allow', 'alloy', 'allyl', 'almah', 'almas', 'almeh', 'almes', 'almud', 'almug', 'aloes', 'aloft', 'aloha', 'aloin', 'alone', 'along', 'aloof', 'aloud', 'alpha', 'altar', 'alter', 'altho', 'altos', 'alula', 'alums', 'alway', 'amahs', 'amain', 'amass', 'amaze', 'amber', 'ambit', 'amble', 'ambos', 'ambry', 'ameba', 'ameer', 'amend', 'amens', 'ament', 'amias', 'amice', 'amici', 'amide', 'amido', 'amids', 'amies', 'amiga', 'amigo', 'amine', 'amino', 'amins', 'amirs', 'amiss', 'amity', 'ammos', 'amnia', 'amnic', 'amnio', 'amoks', 'amole', 'among', 'amort', 'amour', 'amped', 'ample', 'amply', 'ampul', 'amuck', 'amuse', 'amyls', 'ancho', 'ancon', 'andro', 'anear', 'anele', 'anent', 'angas', 'angel', 'anger', 'angle', 'anglo', 'angry', 'angst', 'anile', 'anils', 'anima', 'anime', 'animi', 'anion', 'anise', 'ankhs', 'ankle', 'ankus', 'anlas', 'annal', 'annas', 'annex', 'annoy', 'annul', 'anoas', 'anode', 'anole', 'anomy', 'ansae', 'antae', 'antas', 'anted', 'antes', 'antic', 'antis', 'antra', 'antre', 'antsy', 'anvil', 'anyon', 'aorta', 'apace', 'apart', 'apeak', 'apeek', 'apers', 'apery', 'aphid', 'aphis', 'apian', 'aping', 'apish', 'apnea', 'apods', 'aport', 'appal', 'appel', 'apple', 'apply', 'apres', 'apron', 'apses', 'apsis', 'apter', 'aptly', 'aquae', 'aquas', 'araks', 'arame', 'arbor', 'arced', 'arcus', 'ardeb', 'ardor', 'areae', 'areal', 'areas', 'areca', 'areic', 'arena', 'arene', 'arepa', 'arete', 'argal', 'argil', 'argle', 'argol', 'argon', 'argot', 'argue', 'argus', 'arhat', 'arias', 'ariel', 'arils', 'arise', 'arles', 'armed', 'armer', 'armet', 'armor', 'aroid', 'aroma', 'arose', 'arpen', 'arras', 'array', 'arris', 'arrow', 'arses', 'arsis', 'arson', 'artal', 'artel', 'artsy', 'arums', 'arval', 'arvos', 'aryls', 'asana', 'ascot', 'ascus', 'asdic', 'ashed', 'ashen', 'ashes', 'aside', 'asked', 'asker', 'askew', 'askoi', 'askos', 'aspen', 'asper', 'aspic', 'aspis', 'assai', 'assay', 'asses', 'asset', 'aster', 'astir', 'asyla', 'ataps', 'ataxy', 'atilt', 'atlas', 'atman', 'atmas', 'atoll', 'atoms', 'atomy', 'atone', 'atony', 'atopy', 'atria', 'atrip', 'attar', 'attic', 'audad', 'audio', 'audit', 'auger', 'aught', 'augur', 'aulic', 'aunts', 'aunty', 'aurae', 'aural', 'aurar', 'auras', 'aurei', 'aures', 'auric', 'auris', 'aurum', 'autos', 'auxin', 'avail', 'avant', 'avast', 'avens', 'avers', 'avert', 'avgas', 'avian', 'avion', 'aviso', 'avoid', 'avows', 'await', 'awake', 'award', 'aware', 'awash', 'awful', 'awing', 'awned', 'awoke', 'awols', 'axels', 'axial', 'axile', 'axils', 'axing', 'axiom', 'axion', 'axite', 'axled', 'axles', 'axman', 'axmen', 'axone', 'axons', 'ayahs', 'ayins', 'azans', 'azide', 'azido', 'azine', 'azlon', 'azoic', 'azole', 'azons', 'azote', 'azoth', 'azuki', 'azure', 'baaed', 'baals', 'babas', 'babel', 'babes', 'babka', 'baboo', 'babul', 'babus', 'bacca', 'backs', 'bacon', 'baddy', 'badge', 'badly', 'baffs', 'baffy', 'bagel', 'baggy', 'bahts', 'bails', 'bairn', 'baith', 'baits', 'baiza', 'baize', 'baked', 'baker', 'bakes', 'balas', 'balds', 'baldy', 'baled', 'baler', 'bales', 'balks', 'balky', 'balls', 'bally', 'balms', 'balmy', 'balsa', 'banal', 'banco', 'banda', 'bands', 'bandy', 'baned', 'banes', 'bangs', 'banjo', 'banks', 'banns', 'banty', 'barbe', 'barbs', 'barca', 'barde', 'bards', 'bared', 'barer', 'bares', 'barfs', 'barge', 'baric', 'barks', 'barky', 'barms', 'barmy', 'barns', 'barny', 'baron', 'barre', 'barye', 'basal', 'based', 'baser', 'bases', 'basic', 'basil', 'basin', 'basis', 'basks', 'bassi', 'basso', 'bassy', 'baste', 'basts', 'batch', 'bated', 'bates', 'bathe', 'baths', 'batik', 'baton', 'batts', 'battu', 'batty', 'bauds', 'baulk', 'bawds', 'bawdy', 'bawls', 'bawty', 'bayed', 'bayou', 'bazar', 'bazoo', 'beach', 'beads', 'beady', 'beaks', 'beaky', 'beams', 'beamy', 'beano', 'beans', 'beard', 'bears', 'beast', 'beats', 'beaus', 'beaut', 'beaux', 'bebop', 'becap', 'becks', 'bedel', 'bedew', 'bedim', 'beech', 'beedi', 'beefs', 'beefy', 'beeps', 'beers', 'beery', 'beets', 'befit', 'befog', 'began', 'begat', 'beget', 'begin', 'begot', 'begum', 'begun', 'beige', 'beigy', 'being', 'belay', 'belch', 'belga', 'belie', 'belle', 'bells', 'belly', 'belon', 'below', 'belts', 'bemas', 'bemix', 'bench', 'bends', 'bendy', 'benes', 'benne', 'benni', 'benny', 'bento', 'bents', 'beret', 'bergs', 'berks', 'berme', 'berms', 'berry', 'berth', 'beryl', 'beses', 'beset', 'besom', 'besot', 'bests', 'betas', 'betel', 'beths', 'beton', 'betta', 'bevel', 'bevor', 'bewig', 'bezel', 'bezil', 'bhang', 'bhoot', 'bhuts', 'biali', 'bialy', 'bibbs', 'bible', 'bicep', 'bices', 'biddy', 'bided', 'bider', 'bides', 'bidet', 'bidis', 'bield', 'biers', 'biffs', 'biffy', 'bifid', 'biggy', 'bight', 'bigly', 'bigos', 'bigot', 'bijou', 'biked', 'biker', 'bikes', 'bikie', 'bilbo', 'bilby', 'biles', 'bilge', 'bilgy', 'bilks', 'bills', 'billy', 'bimah', 'bimas', 'bimbo', 'binal', 'bindi', 'binds', 'biner', 'bines', 'binge', 'bingo', 'binit', 'bints', 'biogs', 'biome', 'biont', 'biota', 'biped', 'bipod', 'birch', 'birds', 'birks', 'birle', 'birls', 'biros', 'birrs', 'birse', 'birth', 'bises', 'bisks', 'bison', 'bitch', 'biter', 'bites', 'bitsy', 'bitts', 'bitty', 'bizes', 'blabs', 'black', 'blade', 'blaff', 'blahs', 'blain', 'blame', 'blams', 'bland', 'blank', 'blare', 'blase', 'blast', 'blate', 'blats', 'blawn', 'blaws', 'blaze', 'bleak', 'blear', 'bleat', 'blebs', 'bleed', 'bleep', 'blend', 'blent', 'bless', 'blest', 'blets', 'blimp', 'blimy', 'blind', 'blini', 'blink', 'blips', 'bliss', 'blite', 'blitz', 'bloat', 'blobs', 'block', 'blocs', 'blogs', 'bloke', 'blond', 'blood', 'bloom', 'bloop', 'blots', 'blown', 'blows', 'blowy', 'blubs', 'blued', 'bluer', 'blues', 'bluet', 'bluey', 'bluff', 'blume', 'blunt', 'blurb', 'blurs', 'blurt', 'blush', 'blype', 'board', 'boars', 'boart', 'boast', 'boats', 'bobby', 'bocce', 'bocci', 'boche', 'bocks', 'boded', 'bodes', 'boffo', 'boffs', 'bogan', 'bogey', 'boggy', 'bogie', 'bogle', 'bogus', 'bohea', 'bohos', 'boils', 'boing', 'boink', 'boite', 'bolar', 'bolas', 'bolds', 'boles', 'bolls', 'bolos', 'bolts', 'bolus', 'bombe', 'bombs', 'bonds', 'boned', 'boner', 'bones', 'boney', 'bongo', 'bongs', 'bonks', 'bonne', 'bonny', 'bonus', 'bonze', 'boobs', 'booby', 'boody', 'booed', 'boogy', 'books', 'booms', 'boomy', 'boons', 'boors', 'boost', 'booth', 'boots', 'booty', 'booze', 'boozy', 'boral', 'boras', 'borax', 'bored', 'borer', 'bores', 'boric', 'borks', 'borne', 'boron', 'borts', 'borty', 'bortz', 'bosks', 'bosky', 'bosom', 'boson', 'bossy', 'bosun', 'botas', 'botch', 'botel', 'bothy', 'botts', 'bough', 'boule', 'bound', 'bourg', 'bourn', 'bouse', 'bousy', 'bouts', 'bovid', 'bowed', 'bowel', 'bower', 'bowls', 'bowse', 'boxed', 'boxer', 'boxes', 'boyar', 'boyla', 'boyos', 'bozos', 'brace', 'brach', 'bract', 'brads', 'braes', 'brags', 'braid', 'brail', 'brain', 'brake', 'braky', 'brand', 'brank', 'brans', 'brant', 'brash', 'brass', 'brats', 'brava', 'brave', 'bravi', 'bravo', 'brawl', 'brawn', 'braws', 'braxy', 'brays', 'braza', 'braze', 'bread', 'break', 'bream', 'brede', 'breed', 'brees', 'brens', 'brent', 'breve', 'brews', 'briar', 'bribe', 'brick', 'bride', 'brief', 'brier', 'bries', 'brigs', 'brill', 'brims', 'brine', 'bring', 'brink', 'brins', 'briny', 'brios', 'brisk', 'briss', 'brith', 'brits', 'britt', 'broad', 'brock', 'broil', 'broke', 'brome', 'bromo', 'bronc', 'brood', 'brook', 'broom', 'broos', 'brose', 'brosy', 'broth', 'brown', 'brows', 'brugh', 'bruin', 'bruit', 'brume', 'brung', 'brunt', 'brush', 'brusk', 'brute', 'bruts', 'bubal', 'bubba', 'bubby', 'bubus', 'bucko', 'bucks', 'buddy', 'budge', 'buffi', 'buffo', 'buffs', 'buffy', 'buggy', 'bugle', 'buhls', 'buhrs', 'build', 'built', 'bulbs', 'bulge', 'bulgy', 'bulks', 'bulky', 'bulla', 'bulls', 'bully', 'bumfs', 'bumph', 'bumps', 'bumpy', 'bunas', 'bunch', 'bunco', 'bunds', 'bundt', 'bungs', 'bunko', 'bunks', 'bunns', 'bunny', 'bunts', 'bunya', 'buoys', 'buppy', 'buran', 'buras', 'burbs', 'burds', 'buret', 'burgh', 'burgs', 'burin', 'burka', 'burke', 'burls', 'burly', 'burns', 'burnt', 'burps', 'burqa', 'burro', 'burrs', 'burry', 'bursa', 'burse', 'burst', 'busby', 'bused', 'buses', 'bushy', 'busks', 'busts', 'busty', 'butch', 'buteo', 'butes', 'butle', 'butte', 'butts', 'butty', 'butut', 'butyl', 'buxom', 'buyer', 'bwana', 'bylaw', 'byres', 'byrls', 'byssi', 'bytes', 'byway', 'cabal', 'cabby', 'caber', 'cabin', 'cable', 'cabob', 'cacao', 'cacas', 'cache', 'cacti', 'caddy', 'cades', 'cadet', 'cadge', 'cadgy', 'cadis', 'cadre', 'caeca', 'cafes', 'caffs', 'caged', 'cager', 'cages', 'cagey', 'cahow', 'caids', 'cains', 'caird', 'cairn', 'cajon', 'caked', 'cakes', 'cakey', 'calfs', 'calif', 'calix', 'calks', 'calla', 'calls', 'calms', 'calos', 'calve', 'calyx', 'camas', 'camel', 'cameo', 'cames', 'camos', 'campi', 'campo', 'camps', 'campy', 'canal', 'candy', 'caned', 'caner', 'canes', 'canid', 'canna', 'canny', 'canoe', 'canon', 'canso', 'canst', 'canto', 'cants', 'canty', 'caped', 'caper', 'capes', 'caphs', 'capiz', 'capon', 'capos', 'caput', 'carat', 'carbo', 'carbs', 'cards', 'cared', 'carer', 'cares', 'caret', 'carex', 'cargo', 'carks', 'carle', 'carls', 'carns', 'carny', 'carob', 'carol', 'carom', 'carpi', 'carps', 'carrs', 'carry', 'carse', 'carte', 'carts', 'carve', 'casas', 'cased', 'cases', 'casks', 'casky', 'caste', 'casts', 'casus', 'catch', 'cater', 'cates', 'catty', 'cauld', 'caulk', 'cauls', 'cause', 'caved', 'caver', 'caves', 'cavie', 'cavil', 'cawed', 'cease', 'cebid', 'cecal', 'cecum', 'cedar', 'ceded', 'ceder', 'cedes', 'cedis', 'ceiba', 'ceili', 'ceils', 'celeb', 'cella', 'celli', 'cello', 'cells', 'celom', 'celts', 'cense', 'cento', 'cents', 'centu', 'ceorl', 'cepes', 'cerci', 'cered', 'ceres', 'ceria', 'ceric', 'ceros', 'cesta', 'cesti', 'cetes', 'chads', 'chafe', 'chaff', 'chain', 'chair', 'chais', 'chalk', 'champ', 'chams', 'chang', 'chant', 'chaos', 'chape', 'chaps', 'chapt', 'chard', 'chare', 'chark', 'charm', 'charr', 'chars', 'chart', 'chary', 'chase', 'chasm', 'chats', 'chaws', 'chays', 'cheap', 'cheat', 'check', 'cheek', 'cheep', 'cheer', 'chefs', 'chela', 'chemo', 'chert', 'chess', 'chest', 'cheth', 'chevy', 'chews', 'chewy', 'chiao', 'chias', 'chica', 'chick', 'chico', 'chics', 'chide', 'chief', 'chiel', 'child', 'chile', 'chili', 'chill', 'chimb', 'chime', 'chimp', 'china', 'chine', 'chink', 'chino', 'chins', 'chips', 'chirk', 'chirm', 'chiro', 'chirp', 'chirr', 'chiru', 'chits', 'chive', 'chivy', 'chock', 'choir', 'choke', 'choky', 'chola', 'cholo', 'chomp', 'chook', 'chops', 'chord', 'chore', 'chose', 'chott', 'chows', 'chubs', 'chuck', 'chufa', 'chuff', 'chugs', 'chump', 'chums', 'chunk', 'churl', 'churn', 'churr', 'chute', 'chyle', 'chyme', 'cibol', 'cider', 'cigar', 'cilia', 'cimex', 'cinch', 'cines', 'cions', 'circa', 'cires', 'cirri', 'cisco', 'cissy', 'cists', 'cited', 'citer', 'cites', 'civet', 'civic', 'civie', 'civil', 'civvy', 'clach', 'clack', 'clade', 'clads', 'clags', 'claim', 'clamp', 'clams', 'clang', 'clank', 'clans', 'claps', 'clapt', 'claro', 'clary', 'clash', 'clasp', 'class', 'clast', 'clave', 'clavi', 'claws', 'clays', 'clean', 'clear', 'cleat', 'cleek', 'clefs', 'cleft', 'clepe', 'clept', 'clerk', 'clews', 'click', 'cliff', 'clift', 'climb', 'clime', 'cline', 'cling', 'clink', 'clips', 'clipt', 'cloak', 'clock', 'clods', 'clogs', 'clomb', 'clomp', 'clone', 'clonk', 'clons', 'cloot', 'clops', 'close', 'cloth', 'clots', 'cloud', 'clour', 'clout', 'clove', 'clown', 'cloys', 'cloze', 'clubs', 'cluck', 'clued', 'clues', 'clump', 'clung', 'clunk', 'cnida', 'coach', 'coact', 'coala', 'coals', 'coaly', 'coapt', 'coast', 'coati', 'coats', 'cobbs', 'cobby', 'cobia', 'coble', 'cobra', 'cocas', 'cocci', 'cocks', 'cocky', 'cocoa', 'cocos', 'codas', 'codec', 'coded', 'coden', 'coder', 'codes', 'codex', 'codon', 'coeds', 'coffs', 'cogon', 'cohog', 'cohos', 'coifs', 'coign', 'coils', 'coins', 'coirs', 'coked', 'cokes', 'colas', 'colby', 'colds', 'coled', 'coles', 'colic', 'colin', 'colly', 'colog', 'colon', 'color', 'colts', 'colza', 'comae', 'comal', 'comas', 'combe', 'combo', 'combs', 'comer', 'comes', 'comet', 'comfy', 'comic', 'comix', 'comma', 'commy', 'compo', 'comps', 'compt', 'comte', 'conch', 'condo', 'coned', 'cones', 'coney', 'conga', 'conge', 'congo', 'conic', 'conin', 'conks', 'conky', 'conns', 'conte', 'conto', 'conus', 'cooch', 'cooed', 'cooee', 'cooer', 'cooey', 'coofs', 'cooks', 'cooky', 'cools', 'cooly', 'coomb', 'coons', 'coops', 'coopt', 'coots', 'copal', 'copay', 'coped', 'copen', 'coper', 'copes', 'copra', 'copse', 'coral', 'corby', 'cords', 'cored', 'corer', 'cores', 'corgi', 'coria', 'corks', 'corky', 'corms', 'corns', 'cornu', 'corny', 'corps', 'corse', 'cosec', 'coses', 'coset', 'cosey', 'cosie', 'costa', 'costs', 'cotan', 'coted', 'cotes', 'cotta', 'couch', 'coude', 'cough', 'could', 'count', 'coupe', 'coups', 'court', 'couth', 'coved', 'coven', 'cover', 'coves', 'covet', 'covey', 'covin', 'cowed', 'cower', 'cowls', 'cowry', 'coxae', 'coxal', 'coxed', 'coxes', 'coyed', 'coyer', 'coyly', 'coypu', 'cozen', 'cozes', 'cozey', 'cozie', 'craal', 'crabs', 'crack', 'craft', 'crags', 'crake', 'cramp', 'crams', 'crane', 'crank', 'crape', 'craps', 'crash', 'crass', 'crate', 'crave', 'crawl', 'craws', 'craze', 'crazy', 'creak', 'cream', 'credo', 'creds', 'creed', 'creek', 'creel', 'creep', 'creme', 'crepe', 'crept', 'crepy', 'cress', 'crest', 'crews', 'cribs', 'crick', 'cried', 'crier', 'cries', 'crime', 'crimp', 'cripe', 'crisp', 'crits', 'croak', 'croci', 'crock', 'crocs', 'croft', 'crone', 'crony', 'crook', 'croon', 'crops', 'crore', 'cross', 'croup', 'crowd', 'crown', 'crows', 'croze', 'cruck', 'crude', 'cruds', 'cruel', 'cruet', 'crumb', 'crump', 'cruor', 'crura', 'cruse', 'crush', 'crust', 'crwth', 'crypt', 'cubby', 'cubeb', 'cubed', 'cuber', 'cubes', 'cubic', 'cubit', 'cuddy', 'cuffs', 'cuifs', 'cuing', 'cuish', 'cukes', 'culch', 'culet', 'culex', 'culls', 'cully', 'culms', 'culpa', 'culti', 'cults', 'cumin', 'cunts', 'cupel', 'cupid', 'cuppa', 'cuppy', 'curbs', 'curch', 'curds', 'curdy', 'cured', 'curer', 'cures', 'curet', 'curfs', 'curia', 'curie', 'curio', 'curls', 'curly', 'curns', 'currs', 'curry', 'curse', 'curst', 'curve', 'curvy', 'cusec', 'cushy', 'cusks', 'cusps', 'cusso', 'cutch', 'cuter', 'cutes', 'cutey', 'cutie', 'cutin', 'cutis', 'cutty', 'cutup', 'cuvee', 'cyano', 'cyans', 'cyber', 'cycad', 'cycas', 'cycle', 'cyclo', 'cyder', 'cylix', 'cymae', 'cymar', 'cymas', 'cymes', 'cymol', 'cynic', 'cysts', 'cyton', 'czars', 'daces', 'dacha', 'dadas', 'daddy', 'dados', 'daffs', 'daffy', 'dagga', 'dagos', 'dahls', 'daily', 'dairy', 'daisy', 'dales', 'dally', 'daman', 'damar', 'dames', 'damns', 'damps', 'dance', 'dandy', 'dangs', 'danio', 'darbs', 'dared', 'darer', 'dares', 'daric', 'darks', 'darky', 'darns', 'darts', 'dashi', 'dashy', 'dated', 'dater', 'dates', 'datos', 'datto', 'datum', 'daube', 'daubs', 'dauby', 'daunt', 'dauts', 'daven', 'davit', 'dawed', 'dawen', 'dawks', 'dawns', 'dawts', 'dazed', 'dazes', 'deads', 'deair', 'deals', 'dealt', 'deans', 'dears', 'deary', 'deash', 'death', 'deave', 'debag', 'debar', 'debit', 'debts', 'debug', 'debut', 'debye', 'decaf', 'decal', 'decay', 'decks', 'decor', 'decos', 'decoy', 'decry', 'dedal', 'deeds', 'deedy', 'deems', 'deeps', 'deers', 'deets', 'defat', 'defer', 'defis', 'defog', 'degas', 'degum', 'deice', 'deify', 'deign', 'deils', 'deism', 'deist', 'deity', 'deked', 'dekes', 'dekko', 'delay', 'deled', 'deles', 'delfs', 'delft', 'delis', 'dells', 'delly', 'delta', 'delts', 'delve', 'demes', 'demic', 'demit', 'demob', 'demon', 'demos', 'demur', 'denar', 'denes', 'denim', 'dense', 'dents', 'deoxy', 'depot', 'depth', 'derat', 'deray', 'derby', 'derma', 'derms', 'derry', 'desex', 'desks', 'deter', 'detox', 'deuce', 'devas', 'devel', 'devil', 'devon', 'dewan', 'dewar', 'dewax', 'dewed', 'dexes', 'dexie', 'dhaks', 'dhals', 'dhobi', 'dhole', 'dhoti', 'dhows', 'dhuti', 'dials', 'diary', 'diazo', 'diced', 'dicer', 'dices', 'dicey', 'dicks', 'dicky', 'dicot', 'dicta', 'dicty', 'didie', 'didos', 'didst', 'diene', 'diets', 'diffs', 'dight', 'digit', 'diked', 'diker', 'dikes', 'dikey', 'dildo', 'dills', 'dilly', 'dimer', 'dimes', 'dimly', 'dinar', 'dined', 'diner', 'dines', 'dinge', 'dingo', 'dings', 'dingy', 'dinks', 'dinky', 'dinos', 'dints', 'diode', 'diols', 'dippy', 'dipso', 'diram', 'direr', 'dirge', 'dirks', 'dirls', 'dirts', 'dirty', 'disci', 'disco', 'discs', 'dishy', 'disks', 'disme', 'ditas', 'ditch', 'dites', 'ditsy', 'ditto', 'ditty', 'ditzy', 'divan', 'divas', 'dived', 'diver', 'dives', 'divot', 'divvy', 'diwan', 'dixit', 'dizen', 'dizzy', 'djinn', 'djins', 'doats', 'dobby', 'dobie', 'dobla', 'dobra', 'dobro', 'docks', 'dodge', 'dodgy', 'dodos', 'doers', 'doest', 'doeth', 'doffs', 'doges', 'dogey', 'doggo', 'doggy', 'dogie', 'dogma', 'doily', 'doing', 'doits', 'dojos', 'dolce', 'dolci', 'doled', 'doles', 'dolls', 'dolly', 'dolma', 'dolor', 'dolts', 'domal', 'domed', 'domes', 'domic', 'donas', 'donee', 'donga', 'dongs', 'donna', 'donne', 'donor', 'donsy', 'donut', 'doody', 'dooly', 'dooms', 'doomy', 'doors', 'doozy', 'dopas', 'doped', 'doper', 'dopes', 'dopey', 'dorks', 'dorky', 'dorms', 'dormy', 'dorps', 'dorrs', 'dorsa', 'dorty', 'dosed', 'doser', 'doses', 'dotal', 'doted', 'doter', 'dotes', 'dotty', 'doubt', 'douce', 'dough', 'doula', 'douma', 'doums', 'doura', 'douse', 'doven', 'doves', 'dowdy', 'dowed', 'dowel', 'dower', 'dowie', 'downs', 'downy', 'dowry', 'dowse', 'doxie', 'doyen', 'doyly', 'dozed', 'dozen', 'dozer', 'dozes', 'drabs', 'draff', 'draft', 'drags', 'drail', 'drain', 'drake', 'drama', 'drams', 'drank', 'drape', 'drats', 'drave', 'drawl', 'drawn', 'draws', 'drays', 'dread', 'dream', 'drear', 'dreck', 'dreed', 'drees', 'dregs', 'dreks', 'dress', 'drest', 'dribs', 'dried', 'drier', 'dries', 'drift', 'drill', 'drily', 'drink', 'drips', 'dript', 'drive', 'droid', 'droit', 'droll', 'drone', 'drool', 'droop', 'drops', 'dropt', 'dross', 'drouk', 'drove', 'drown', 'drubs', 'drugs', 'druid', 'drums', 'drunk', 'drupe', 'druse', 'dryad', 'dryer', 'dryly', 'duads', 'duals', 'ducal', 'ducat', 'duces', 'duchy', 'ducks', 'ducky', 'ducts', 'duddy', 'duded', 'dudes', 'duels', 'duets', 'duffs', 'dufus', 'duits', 'duked', 'dukes', 'dulia', 'dulls', 'dully', 'dulse', 'dumas', 'dumbo', 'dumbs', 'dumka', 'dumky', 'dummy', 'dumps', 'dumpy', 'dunam', 'dunce', 'dunch', 'dunes', 'dungs', 'dungy', 'dunks', 'dunts', 'duomi', 'duomo', 'duped', 'duper', 'dupes', 'duple', 'dural', 'duras', 'dured', 'dures', 'durns', 'duroc', 'duros', 'durra', 'durrs', 'durst', 'durum', 'dusks', 'dusky', 'dusts', 'dusty', 'dutch', 'duvet', 'dwarf', 'dweeb', 'dwell', 'dwelt', 'dwine', 'dyads', 'dyers', 'dying', 'dyked', 'dykes', 'dykey', 'dynel', 'dynes', 'eager', 'eagle', 'eagre', 'eared', 'earls', 'early', 'earns', 'earth', 'eased', 'easel', 'eases', 'easts', 'eaten', 'eater', 'eaved', 'eaves', 'ebbed', 'ebbet', 'ebons', 'ebony', 'ebook', 'eched', 'eches', 'echos', 'eclat', 'ecrus', 'edema', 'edged', 'edger', 'edges', 'edict', 'edify', 'edile', 'edits', 'educe', 'educt', 'eerie', 'egads', 'egers', 'egest', 'eggar', 'egged', 'egger', 'egret', 'eider', 'eidos', 'eight', 'eikon', 'eject', 'eking', 'elain', 'eland', 'elans', 'elate', 'elbow', 'elder', 'elect', 'elegy', 'elemi', 'elfin', 'elide', 'elint', 'elite', 'eloin', 'elope', 'elude', 'elute', 'elver', 'elves', 'email', 'embar', 'embay', 'embed', 'ember', 'embow', 'emcee', 'emeer', 'emend', 'emery', 'emeus', 'emirs', 'emits', 'emmer', 'emmet', 'emmys', 'emote', 'empty', 'emyde', 'emyds', 'enact', 'enate', 'ended', 'ender', 'endow', 'endue', 'enema', 'enemy', 'enjoy', 'ennui', 'enoki', 'enols', 'enorm', 'enows', 'enrol', 'ensky', 'ensue', 'enter', 'entia', 'entry', 'enure', 'envoi', 'envoy', 'enzym', 'eosin', 'epact', 'epees', 'ephah', 'ephas', 'ephod', 'ephor', 'epics', 'epoch', 'epode', 'epoxy', 'equal', 'equid', 'equip', 'erase', 'erect', 'ergot', 'erica', 'ernes', 'erode', 'erose', 'erred', 'error', 'erses', 'eruct', 'erugo', 'erupt', 'ervil', 'escar', 'escot', 'eskar', 'esker', 'esnes', 'essay', 'esses', 'ester', 'estop', 'etape', 'ether', 'ethic', 'ethos', 'ethyl', 'etnas', 'etude', 'etuis', 'etwee', 'etyma', 'euros', 'evade', 'evens', 'event', 'evert', 'every', 'evict', 'evils', 'evite', 'evoke', 'ewers', 'exact', 'exalt', 'exams', 'excel', 'execs', 'exert', 'exile', 'exine', 'exing', 'exist', 'exits', 'exons', 'expat', 'expel', 'expos', 'extol', 'extra', 'exude', 'exult', 'exurb', 'eyass', 'eyers', 'eying', 'eyras', 'eyres', 'eyrie', 'eyrir', 'fable', 'faced', 'facer', 'faces', 'facet', 'facia', 'facts', 'faddy', 'faded', 'fader', 'fades', 'fadge', 'fados', 'faena', 'faery', 'faggy', 'fagin', 'fagot', 'fails', 'faint', 'fairs', 'fairy', 'faith', 'faked', 'faker', 'fakes', 'fakey', 'fakir', 'falls', 'false', 'famed', 'fames', 'fancy', 'fanes', 'fanga', 'fangs', 'fanny', 'fanon', 'fanos', 'fanum', 'faqir', 'farad', 'farce', 'farci', 'farcy', 'fards', 'fared', 'farer', 'fares', 'farle', 'farls', 'farms', 'faros', 'farts', 'fasts', 'fatal', 'fated', 'fates', 'fatly', 'fatso', 'fatty', 'fatwa', 'faugh', 'fauld', 'fault', 'fauna', 'fauns', 'fauve', 'favas', 'faves', 'favor', 'favus', 'fawns', 'fawny', 'faxed', 'faxes', 'fayed', 'fazed', 'fazes', 'fears', 'fease', 'feast', 'feats', 'feaze', 'fecal', 'feces', 'fecks', 'fedex', 'feebs', 'feeds', 'feels', 'feeze', 'feign', 'feint', 'feist', 'felid', 'fella', 'fells', 'felly', 'felon', 'felts', 'femes', 'femme', 'femur', 'fence', 'fends', 'fenny', 'feods', 'feoff', 'feral', 'feres', 'feria', 'ferly', 'fermi', 'ferns', 'ferny', 'ferry', 'fesse', 'fests', 'fetal', 'fetas', 'fetch', 'feted', 'fetes', 'fetid', 'fetor', 'fetus', 'feuar', 'feuds', 'feued', 'fever', 'fewer', 'feyer', 'feyly', 'fezes', 'fezzy', 'fiars', 'fiats', 'fiber', 'fibre', 'fices', 'fiche', 'fichu', 'ficin', 'ficus', 'fidge', 'fidos', 'fiefs', 'field', 'fiend', 'fiery', 'fifed', 'fifer', 'fifes', 'fifth', 'fifty', 'fight', 'filar', 'filch', 'filed', 'filer', 'files', 'filet', 'fille', 'fillo', 'fills', 'filly', 'filmi', 'films', 'filmy', 'filos', 'filth', 'filum', 'final', 'finca', 'finch', 'finds', 'fined', 'finer', 'fines', 'finis', 'finks', 'finny', 'finos', 'fiord', 'fique', 'fired', 'firer', 'fires', 'firms', 'firns', 'firry', 'first', 'firth', 'fiscs', 'fishy', 'fists', 'fitch', 'fitly', 'fiver', 'fives', 'fixed', 'fixer', 'fixes', 'fixit', 'fizzy', 'fjeld', 'fjord', 'flabs', 'flack', 'flags', 'flail', 'flair', 'flake', 'flaky', 'flame', 'flams', 'flamy', 'flank', 'flans', 'flaps', 'flare', 'flash', 'flask', 'flats', 'flaws', 'flawy', 'flaxy', 'flays', 'fleam', 'fleas', 'fleck', 'fleer', 'flees', 'fleet', 'flesh', 'flews', 'fleys', 'flick', 'flics', 'flied', 'flier', 'flies', 'fling', 'flint', 'flips', 'flirs', 'flirt', 'flite', 'flits', 'float', 'flock', 'flocs', 'floes', 'flogs', 'flong', 'flood', 'floor', 'flops', 'flora', 'floss', 'flota', 'flour', 'flout', 'flown', 'flows', 'flubs', 'flued', 'flues', 'fluff', 'fluid', 'fluke', 'fluky', 'flume', 'flump', 'flung', 'flunk', 'fluor', 'flush', 'flute', 'fluty', 'fluyt', 'flyby', 'flyer', 'flyte', 'foals', 'foams', 'foamy', 'focal', 'focus', 'foehn', 'fogey', 'foggy', 'fogie', 'fohns', 'foils', 'foins', 'foist', 'folds', 'foley', 'folia', 'folic', 'folio', 'folks', 'folky', 'folly', 'fonds', 'fondu', 'fonts', 'foods', 'fools', 'foots', 'footy', 'foram', 'foray', 'forbs', 'forby', 'force', 'fordo', 'fords', 'fores', 'forge', 'forgo', 'forks', 'forky', 'forme', 'forms', 'forte', 'forth', 'forts', 'forty', 'forum', 'fossa', 'fosse', 'fouls', 'found', 'fount', 'fours', 'fovea', 'fowls', 'foxed', 'foxes', 'foyer', 'frags', 'frail', 'frame', 'franc', 'frank', 'fraps', 'frass', 'frats', 'fraud', 'frays', 'freak', 'freed', 'freer', 'frees', 'fremd', 'frena', 'frere', 'fresh', 'frets', 'friar', 'fried', 'frier', 'fries', 'frigs', 'frill', 'frise', 'frisk', 'frith', 'frits', 'fritt', 'fritz', 'frizz', 'frock', 'froes', 'frogs', 'frond', 'frons', 'front', 'frore', 'frosh', 'frost', 'froth', 'frown', 'frows', 'froze', 'frugs', 'fruit', 'frump', 'fryer', 'fubar', 'fubsy', 'fucks', 'fucus', 'fuddy', 'fudge', 'fuels', 'fugal', 'fuggy', 'fugio', 'fugle', 'fugue', 'fugus', 'fujis', 'fulls', 'fully', 'fumed', 'fumer', 'fumes', 'fumet', 'fundi', 'funds', 'fungi', 'fungo', 'funks', 'funky', 'funny', 'furan', 'furls', 'furor', 'furry', 'furze', 'furzy', 'fused', 'fusee', 'fusel', 'fuses', 'fusil', 'fussy', 'fusty', 'futon', 'fuzed', 'fuzee', 'fuzes', 'fuzil', 'fuzzy', 'fyces', 'fykes', 'fytte', 'gabby', 'gable', 'gaddi', 'gadid', 'gadis', 'gadje', 'gadjo', 'gaffe', 'gaffs', 'gaged', 'gager', 'gages', 'gaily', 'gains', 'gaits', 'galah', 'galas', 'galax', 'galea', 'gales', 'galls', 'gally', 'galop', 'gamas', 'gamay', 'gamba', 'gambe', 'gambs', 'gamed', 'gamer', 'games', 'gamey', 'gamic', 'gamin', 'gamma', 'gammy', 'gamps', 'gamut', 'ganef', 'ganev', 'gangs', 'ganja', 'ganof', 'gaols', 'gaped', 'gaper', 'gapes', 'gappy', 'garbs', 'garda', 'garni', 'garth', 'gases', 'gasps', 'gassy', 'gasts', 'gated', 'gater', 'gates', 'gator', 'gauds', 'gaudy', 'gauge', 'gault', 'gaums', 'gaunt', 'gaurs', 'gauss', 'gauze', 'gauzy', 'gavel', 'gavot', 'gawks', 'gawky', 'gawps', 'gawsy', 'gayal', 'gayer', 'gayly', 'gazar', 'gazed', 'gazer', 'gazes', 'gazoo', 'gears', 'gecko', 'gecks', 'geeks', 'geeky', 'geese', 'geest', 'gelds', 'gelee', 'gelid', 'gelts', 'gemma', 'gemmy', 'gemot', 'genes', 'genet', 'genic', 'genie', 'genii', 'genip', 'genoa', 'genom', 'genre', 'genro', 'gents', 'genua', 'genus', 'geode', 'geoid', 'gerah', 'germs', 'germy', 'gesso', 'geste', 'gests', 'getas', 'getup', 'geums', 'ghast', 'ghats', 'ghaut', 'ghazi', 'ghees', 'ghost', 'ghoul', 'ghyll', 'giant', 'gibed', 'giber', 'gibes', 'giddy', 'gifts', 'gigas', 'gighe', 'gigot', 'gigue', 'gilds', 'gills', 'gilly', 'gilts', 'gimel', 'gimme', 'gimps', 'gimpy', 'ginks', 'ginny', 'ginzo', 'gipon', 'gipsy', 'girds', 'girls', 'girly', 'girns', 'giron', 'giros', 'girsh', 'girth', 'girts', 'gismo', 'gists', 'gites', 'given', 'giver', 'gives', 'gizmo', 'glace', 'glade', 'glads', 'glady', 'glair', 'glams', 'gland', 'glans', 'glare', 'glary', 'glass', 'glaze', 'glazy', 'gleam', 'glean', 'gleba', 'glebe', 'glede', 'gleds', 'gleed', 'gleek', 'glees', 'gleet', 'glens', 'gleys', 'glial', 'glias', 'glide', 'gliff', 'glime', 'glims', 'glint', 'glitz', 'gloam', 'gloat', 'globe', 'globs', 'glogg', 'gloms', 'gloom', 'glops', 'glory', 'gloss', 'glost', 'glout', 'glove', 'glows', 'gloze', 'glued', 'gluer', 'glues', 'gluey', 'glugs', 'glume', 'glums', 'gluon', 'glute', 'gluts', 'glyph', 'gnarl', 'gnarr', 'gnars', 'gnash', 'gnats', 'gnawn', 'gnaws', 'gnome', 'goads', 'goals', 'goats', 'goban', 'gobos', 'godet', 'godly', 'goers', 'gofer', 'gogos', 'going', 'golds', 'golem', 'golfs', 'golly', 'gombo', 'gomer', 'gonad', 'gonef', 'goner', 'gongs', 'gonia', 'gonif', 'gonof', 'gonzo', 'goods', 'goody', 'gooey', 'goofs', 'goofy', 'gooks', 'gooky', 'goons', 'goony', 'goops', 'goopy', 'goose', 'goosy', 'gopik', 'goral', 'gored', 'gores', 'gorge', 'gorms', 'gorps', 'gorse', 'gorsy', 'goths', 'gouge', 'gourd', 'gouts', 'gouty', 'gowan', 'gowds', 'gowks', 'gowns', 'goxes', 'goyim', 'graal', 'grabs', 'grace', 'grade', 'grads', 'graft', 'grail', 'grain', 'grama', 'gramp', 'grams', 'grana', 'grand', 'grans', 'grant', 'grape', 'graph', 'grapy', 'grasp', 'grass', 'grate', 'grave', 'gravy', 'grays', 'graze', 'great', 'grebe', 'greed', 'greek', 'green', 'grees', 'greet', 'grego', 'greys', 'gride', 'grids', 'grief', 'griff', 'grift', 'grigs', 'grill', 'grime', 'grimy', 'grind', 'grins', 'griot', 'gripe', 'grips', 'gript', 'gripy', 'grist', 'grith', 'grits', 'groan', 'groat', 'grody', 'grogs', 'groin', 'groks', 'groom', 'grope', 'gross', 'grosz', 'grots', 'group', 'grout', 'grove', 'growl', 'grown', 'grows', 'grubs', 'gruel', 'grues', 'gruff', 'grume', 'grump', 'grunt', 'guaco', 'guano', 'guans', 'guard', 'guars', 'guava', 'gucks', 'gudes', 'guess', 'guest', 'guffs', 'guide', 'guids', 'guild', 'guile', 'guilt', 'guiro', 'guise', 'gulag', 'gular', 'gulch', 'gules', 'gulfs', 'gulfy', 'gulls', 'gully', 'gulps', 'gulpy', 'gumbo', 'gumma', 'gummy', 'gunks', 'gunky', 'gunny', 'guppy', 'gurge', 'gurry', 'gursh', 'gurus', 'gushy', 'gussy', 'gusto', 'gusts', 'gusty', 'gutsy', 'gutta', 'gutty', 'guyed', 'guyot', 'gwine', 'gybed', 'gybes', 'gyoza', 'gypsy', 'gyral', 'gyred', 'gyres', 'gyron', 'gyros', 'gyrus', 'gyved', 'gyves', 'haafs', 'haars', 'habit', 'habus', 'hacek', 'hacks', 'hadal', 'haded', 'hades', 'hadji', 'hadst', 'haems', 'haets', 'hafiz', 'hafts', 'hahas', 'haika', 'haiks', 'haiku', 'hails', 'haint', 'hairs', 'hairy', 'hajes', 'hajis', 'hajji', 'hakes', 'hakim', 'hakus', 'halal', 'haled', 'haler', 'hales', 'halid', 'hallo', 'halls', 'halma', 'halms', 'halon', 'halos', 'halts', 'halva', 'halve', 'hamal', 'hames', 'hammy', 'hamza', 'hance', 'hands', 'handy', 'hangs', 'hanks', 'hanky', 'hansa', 'hanse', 'hants', 'haole', 'hapax', 'haply', 'happy', 'hards', 'hardy', 'hared', 'harem', 'hares', 'harks', 'harls', 'harms', 'harps', 'harpy', 'harry', 'harsh', 'harts', 'hasps', 'haste', 'hasty', 'hatch', 'hated', 'hater', 'hates', 'haugh', 'haulm', 'hauls', 'haunt', 'haute', 'haven', 'haver', 'haves', 'havoc', 'hawed', 'hawks', 'hawse', 'hayed', 'hayer', 'hayey', 'hazan', 'hazed', 'hazel', 'hazer', 'hazes', 'heads', 'heady', 'heals', 'heaps', 'heapy', 'heard', 'hears', 'heart', 'heath', 'heats', 'heave', 'heavy', 'hebes', 'hecks', 'heder', 'hedge', 'hedgy', 'heeds', 'heels', 'heeze', 'hefts', 'hefty', 'heigh', 'heils', 'heirs', 'heist', 'helio', 'helix', 'hello', 'hells', 'helms', 'helos', 'helot', 'helps', 'helve', 'hemal', 'hemes', 'hemic', 'hemin', 'hemps', 'hempy', 'hence', 'henge', 'henna', 'henry', 'hents', 'herbs', 'herby', 'herds', 'heres', 'herls', 'herma', 'herms', 'herns', 'heron', 'heros', 'herry', 'hertz', 'hests', 'heths', 'heuch', 'heugh', 'hewed', 'hewer', 'hexad', 'hexed', 'hexer', 'hexes', 'hexyl', 'hicks', 'hided', 'hider', 'hides', 'highs', 'hight', 'hijab', 'hijra', 'hiked', 'hiker', 'hikes', 'hilar', 'hillo', 'hills', 'hilly', 'hilts', 'hilum', 'hilus', 'hinds', 'hinge', 'hinky', 'hinny', 'hints', 'hiply', 'hippo', 'hippy', 'hired', 'hiree', 'hirer', 'hires', 'hissy', 'hists', 'hitch', 'hived', 'hives', 'hoagy', 'hoard', 'hoars', 'hoary', 'hobby', 'hobos', 'hocks', 'hocus', 'hodad', 'hoers', 'hogan', 'hoggs', 'hoick', 'hoise', 'hoist', 'hoked', 'hokes', 'hokey', 'hokku', 'hokum', 'holds', 'holed', 'holes', 'holey', 'holks', 'holla', 'hollo', 'holly', 'holms', 'holts', 'homed', 'homer', 'homes', 'homey', 'homie', 'homos', 'honan', 'honda', 'honed', 'honer', 'hones', 'honey', 'hongi', 'hongs', 'honks', 'honky', 'honor', 'hooch', 'hoods', 'hoody', 'hooey', 'hoofs', 'hooka', 'hooks', 'hooky', 'hooly', 'hoops', 'hoots', 'hooty', 'hoped', 'hoper', 'hopes', 'hoppy', 'horah', 'horal', 'horas', 'horde', 'horns', 'horny', 'horse', 'horst', 'horsy', 'hosed', 'hosel', 'hosen', 'hoser', 'hoses', 'hosey', 'hosta', 'hosts', 'hotch', 'hotel', 'hotly', 'hound', 'houri', 'hours', 'house', 'hovel', 'hover', 'howdy', 'howes', 'howff', 'howfs', 'howks', 'howls', 'hoyas', 'hoyle', 'hubby', 'hucks', 'huffs', 'huffy', 'huger', 'hulas', 'hulks', 'hulky', 'hullo', 'hulls', 'human', 'humic', 'humid', 'humor', 'humph', 'humps', 'humpy', 'humus', 'hunch', 'hunks', 'hunky', 'hunts', 'hurds', 'hurls', 'hurly', 'hurry', 'hurst', 'hurts', 'husks', 'husky', 'hussy', 'hutch', 'huzza', 'hydra', 'hydro', 'hyena', 'hying', 'hylas', 'hymen', 'hymns', 'hyoid', 'hyped', 'hyper', 'hypes', 'hypha', 'hypos', 'hyrax', 'hyson', 'iambi', 'iambs', 'ichor', 'icier', 'icily', 'icing', 'icker', 'icons', 'ictic', 'ictus', 'ideal', 'ideas', 'idiom', 'idiot', 'idled', 'idler', 'idles', 'idols', 'idyll', 'idyls', 'igged', 'igloo', 'iglus', 'ihram', 'ikats', 'ikons', 'ileac', 'ileal', 'ileum', 'ileus', 'iliac', 'iliad', 'ilial', 'ilium', 'iller', 'image', 'imago', 'imams', 'imaum', 'imbed', 'imbue', 'imide', 'imido', 'imids', 'imine', 'imino', 'immix', 'imped', 'impel', 'impis', 'imply', 'inane', 'inapt', 'inarm', 'inbye', 'incog', 'incur', 'incus', 'index', 'indie', 'indol', 'indow', 'indri', 'indue', 'inept', 'inert', 'infer', 'infix', 'infos', 'infra', 'ingle', 'ingot', 'inion', 'inked', 'inker', 'inkle', 'inlay', 'inlet', 'inned', 'inner', 'input', 'inrun', 'inset', 'inter', 'intis', 'intro', 'inure', 'inurn', 'invar', 'iodic', 'iodid', 'iodin', 'ionic', 'iotas', 'irade', 'irate', 'irids', 'iring', 'irked', 'iroko', 'irone', 'irons', 'irony', 'isbas', 'isled', 'isles', 'islet', 'issei', 'issue', 'istle', 'itchy', 'items', 'ither', 'ivied', 'ivies', 'ivory', 'ixias', 'ixora', 'ixtle', 'izars', 'jabot', 'jacal', 'jacks', 'jacky', 'jaded', 'jades', 'jager', 'jaggs', 'jaggy', 'jagra', 'jails', 'jakes', 'jalap', 'jalop', 'jambe', 'jambs', 'jammy', 'janes', 'janty', 'japan', 'japed', 'japer', 'japes', 'jarls', 'jatos', 'jauks', 'jaunt', 'jaups', 'javas', 'jawan', 'jawed', 'jazzy', 'jeans', 'jebel', 'jeeps', 'jeers', 'jefes', 'jehad', 'jehus', 'jello', 'jells', 'jelly', 'jemmy', 'jenny', 'jerid', 'jerks', 'jerky', 'jerry', 'jesse', 'jests', 'jetes', 'jeton', 'jetty', 'jewed', 'jewel', 'jibbs', 'jibed', 'jiber', 'jibes', 'jiffs', 'jiffy', 'jiggy', 'jihad', 'jills', 'jilts', 'jimmy', 'jimpy', 'jingo', 'jinks', 'jinni', 'jinns', 'jisms', 'jived', 'jiver', 'jives', 'jivey', 'jnana', 'jocko', 'jocks', 'joeys', 'johns', 'joins', 'joint', 'joist', 'joked', 'joker', 'jokes', 'jokey', 'joles', 'jolly', 'jolts', 'jolty', 'jomon', 'jones', 'joram', 'jorum', 'jotas', 'jotty', 'joual', 'jouks', 'joule', 'joust', 'jowar', 'jowed', 'jowls', 'jowly', 'joyed', 'jubas', 'jubes', 'jucos', 'judas', 'judge', 'judos', 'jugal', 'jugum', 'juice', 'juicy', 'jujus', 'juked', 'jukes', 'jukus', 'julep', 'jumbo', 'jumps', 'jumpy', 'junco', 'junks', 'junky', 'junta', 'junto', 'jupes', 'jupon', 'jural', 'jurat', 'jurel', 'juror', 'justs', 'jutes', 'jutty', 'kabab', 'kabar', 'kabob', 'kadis', 'kafir', 'kagus', 'kaiak', 'kaifs', 'kails', 'kains', 'kakas', 'kakis', 'kalam', 'kales', 'kalif', 'kalpa', 'kames', 'kamik', 'kanas', 'kanes', 'kanji', 'kanzu', 'kaons', 'kapas', 'kaphs', 'kapok', 'kappa', 'kaput', 'karat', 'karma', 'karns', 'karoo', 'karst', 'karts', 'kasha', 'katas', 'kauri', 'kaury', 'kavas', 'kayak', 'kayos', 'kazoo', 'kbars', 'kebab', 'kebar', 'kebob', 'kecks', 'kedge', 'keefs', 'keeks', 'keels', 'keens', 'keeps', 'keets', 'keeve', 'kefir', 'keirs', 'kelep', 'kelim', 'kelly', 'kelps', 'kelpy', 'kelts', 'kemps', 'kempt', 'kenaf', 'kench', 'kendo', 'kenos', 'kente', 'kepis', 'kerbs', 'kerfs', 'kerne', 'kerns', 'kerry', 'ketch', 'ketol', 'kevel', 'kevil', 'kexes', 'keyed', 'khadi', 'khafs', 'khaki', 'khans', 'khaph', 'khats', 'kheda', 'kheth', 'khets', 'khoum', 'kiang', 'kibbe', 'kibbi', 'kibei', 'kibes', 'kibla', 'kicks', 'kicky', 'kiddo', 'kiddy', 'kiefs', 'kiers', 'kikes', 'kilim', 'kills', 'kilns', 'kilos', 'kilts', 'kilty', 'kinas', 'kinds', 'kines', 'kings', 'kinin', 'kinks', 'kinky', 'kinos', 'kiosk', 'kirks', 'kirns', 'kissy', 'kists', 'kited', 'kiter', 'kites', 'kithe', 'kiths', 'kitty', 'kivas', 'kiwis', 'klick', 'kliks', 'klong', 'kloof', 'kluge', 'klutz', 'knack', 'knaps', 'knars', 'knaur', 'knave', 'knawe', 'knead', 'kneed', 'kneel', 'knees', 'knell', 'knelt', 'knife', 'knish', 'knits', 'knobs', 'knock', 'knoll', 'knops', 'knosp', 'knots', 'knout', 'known', 'knows', 'knurl', 'knurs', 'koala', 'koans', 'kobos', 'koels', 'kohls', 'koine', 'kojis', 'kolas', 'kolos', 'kombu', 'konks', 'kooks', 'kooky', 'kopek', 'kophs', 'kopje', 'koppa', 'korai', 'koras', 'korat', 'korma', 'korun', 'kotos', 'kotow', 'kraal', 'kraft', 'krait', 'kraut', 'kreep', 'krewe', 'krill', 'krona', 'krone', 'kroon', 'krubi', 'kudos', 'kudus', 'kudzu', 'kufis', 'kugel', 'kukri', 'kulak', 'kumys', 'kurta', 'kurus', 'kusso', 'kvass', 'kvell', 'kyack', 'kyaks', 'kyars', 'kyats', 'kylix', 'kyrie', 'kytes', 'kythe', 'laari', 'label', 'labia', 'labor', 'labra', 'laced', 'lacer', 'laces', 'lacey', 'lacks', 'laded', 'laden', 'lader', 'lades', 'ladle', 'laevo', 'lagan', 'lager', 'lahar', 'laich', 'laics', 'laigh', 'laird', 'lairs', 'laith', 'laity', 'laked', 'laker', 'lakes', 'lakhs', 'lalls', 'lamas', 'lambs', 'lamby', 'lamed', 'lamer', 'lames', 'lamia', 'lamps', 'lanai', 'lance', 'lands', 'lanes', 'lanky', 'lapel', 'lapin', 'lapis', 'lapse', 'larch', 'lards', 'lardy', 'laree', 'lares', 'large', 'largo', 'laris', 'larks', 'larky', 'larum', 'larva', 'lased', 'laser', 'lases', 'lassi', 'lasso', 'lasts', 'latch', 'lated', 'laten', 'later', 'latex', 'lathe', 'lathi', 'laths', 'lathy', 'latke', 'latte', 'lauan', 'lauds', 'laugh', 'laura', 'lavas', 'laved', 'laver', 'laves', 'lawed', 'lawns', 'lawny', 'laxer', 'laxes', 'laxly', 'layed', 'layer', 'layin', 'layup', 'lazar', 'lazed', 'lazes', 'leach', 'leads', 'leady', 'leafs', 'leafy', 'leaks', 'leaky', 'leans', 'leant', 'leaps', 'leapt', 'learn', 'lears', 'leary', 'lease', 'leash', 'least', 'leave', 'leavy', 'leben', 'ledge', 'ledgy', 'leech', 'leeks', 'leers', 'leery', 'leets', 'lefts', 'lefty', 'legal', 'leger', 'leges', 'leggy', 'legit', 'lehrs', 'lehua', 'leman', 'lemma', 'lemon', 'lemur', 'lends', 'lenes', 'lenis', 'lenos', 'lense', 'lento', 'leone', 'leper', 'lepta', 'lesbo', 'leses', 'letch', 'lethe', 'letup', 'leuds', 'levee', 'level', 'lever', 'levin', 'levis', 'lewis', 'lexes', 'lexis', 'lezzy', 'liana', 'liane', 'liang', 'liard', 'liars', 'libel', 'liber', 'libra', 'libri', 'lichi', 'licht', 'licit', 'licks', 'lidar', 'lidos', 'liege', 'liens', 'liers', 'lieus', 'lieve', 'lifer', 'lifts', 'ligan', 'liger', 'light', 'liked', 'liken', 'liker', 'likes', 'lilac', 'lilos', 'lilts', 'liman', 'limas', 'limba', 'limbi', 'limbo', 'limbs', 'limby', 'limed', 'limen', 'limes', 'limey', 'limit', 'limns', 'limos', 'limpa', 'limps', 'linac', 'lindy', 'lined', 'linen', 'liner', 'lines', 'liney', 'linga', 'lingo', 'lings', 'lingy', 'linin', 'links', 'linky', 'linns', 'linos', 'lints', 'linty', 'linum', 'lions', 'lipid', 'lipin', 'lippy', 'liras', 'lirot', 'lisle', 'lisps', 'lists', 'litai', 'litas', 'liter', 'lithe', 'litho', 'litre', 'lived', 'liven', 'liver', 'lives', 'livid', 'livre', 'llama', 'llano', 'loach', 'loads', 'loafs', 'loams', 'loamy', 'loans', 'loath', 'lobar', 'lobby', 'lobed', 'lobes', 'lobos', 'local', 'lochs', 'locks', 'locos', 'locum', 'locus', 'loden', 'lodes', 'lodge', 'loess', 'lofts', 'lofty', 'logan', 'loges', 'loggy', 'logia', 'logic', 'login', 'logoi', 'logon', 'logos', 'loids', 'loins', 'lolls', 'lolly', 'loner', 'longe', 'longs', 'looby', 'looed', 'looey', 'loofa', 'loofs', 'looie', 'looks', 'looms', 'loons', 'loony', 'loops', 'loopy', 'loose', 'loots', 'loped', 'loper', 'lopes', 'loppy', 'loral', 'loran', 'lords', 'lores', 'loris', 'lorry', 'losel', 'loser', 'loses', 'lossy', 'lotah', 'lotas', 'lotic', 'lotos', 'lotte', 'lotto', 'lotus', 'lough', 'louie', 'louis', 'louma', 'loupe', 'loups', 'lours', 'loury', 'louse', 'lousy', 'louts', 'lovat', 'loved', 'lover', 'loves', 'lowed', 'lower', 'lowes', 'lowly', 'lowse', 'loxed', 'loxes', 'loyal', 'luaus', 'lubed', 'lubes', 'luces', 'lucid', 'lucks', 'lucky', 'lucre', 'ludes', 'ludic', 'luffa', 'luffs', 'luged', 'luger', 'luges', 'lulls', 'lulus', 'lumas', 'lumen', 'lumps', 'lumpy', 'lunar', 'lunas', 'lunch', 'lunes', 'lunet', 'lunge', 'lungi', 'lungs', 'lunks', 'lunts', 'lupin', 'lupus', 'lurch', 'lured', 'lurer', 'lures', 'lurex', 'lurid', 'lurks', 'lusts', 'lusty', 'lusus', 'lutea', 'luted', 'lutes', 'luxes', 'lweis', 'lyard', 'lyart', 'lyase', 'lycea', 'lycee', 'lycra', 'lying', 'lymph', 'lynch', 'lyres', 'lyric', 'lysed', 'lyses', 'lysin', 'lysis', 'lyssa', 'lytic', 'lytta', 'maars', 'mabes', 'macaw', 'maced', 'macer', 'maces', 'mache', 'macho', 'machs', 'macks', 'macle', 'macon', 'macro', 'madam', 'madly', 'madre', 'mafia', 'mafic', 'mages', 'magic', 'magma', 'magot', 'magus', 'mahoe', 'maids', 'maile', 'maill', 'mails', 'maims', 'mains', 'mairs', 'maist', 'maize', 'major', 'makar', 'maker', 'makes', 'makos', 'malar', 'males', 'malic', 'malls', 'malms', 'malmy', 'malts', 'malty', 'mamas', 'mamba', 'mambo', 'mamey', 'mamie', 'mamma', 'mammy', 'manas', 'manat', 'maned', 'manes', 'manga', 'mange', 'mango', 'mangy', 'mania', 'manic', 'manly', 'manna', 'manor', 'manos', 'manse', 'manta', 'manus', 'maple', 'maqui', 'maras', 'march', 'marcs', 'mares', 'marge', 'maria', 'marka', 'marks', 'marls', 'marly', 'marry', 'marse', 'marsh', 'marts', 'marvy', 'masas', 'maser', 'mashy', 'masks', 'mason', 'massa', 'masse', 'massy', 'masts', 'match', 'mated', 'mater', 'mates', 'matey', 'maths', 'matin', 'matte', 'matts', 'matza', 'matzo', 'mauds', 'mauls', 'maund', 'mauts', 'mauve', 'maven', 'mavie', 'mavin', 'mavis', 'mawed', 'maxed', 'maxes', 'maxim', 'maxis', 'mayan', 'mayas', 'maybe', 'mayed', 'mayor', 'mayos', 'mayst', 'mazed', 'mazer', 'mazes', 'mbira', 'meads', 'meals', 'mealy', 'means', 'meant', 'meany', 'meats', 'meaty', 'mecca', 'medal', 'media', 'medic', 'medii', 'meeds', 'meets', 'meiny', 'melds', 'melee', 'melic', 'mells', 'melon', 'melts', 'melty', 'memes', 'memos', 'menad', 'mends', 'mensa', 'mense', 'mensh', 'menta', 'menus', 'meous', 'meows', 'merch', 'mercs', 'mercy', 'merde', 'merer', 'meres', 'merge', 'merit', 'merks', 'merle', 'merls', 'merry', 'mesas', 'meshy', 'mesic', 'mesne', 'meson', 'messy', 'metal', 'meted', 'meter', 'metes', 'meths', 'metis', 'metol', 'metre', 'metro', 'mewed', 'mewls', 'mezes', 'mezzo', 'miaou', 'miaow', 'miasm', 'miaul', 'micas', 'miche', 'micks', 'micra', 'micro', 'middy', 'midge', 'midis', 'midst', 'miens', 'miffs', 'miffy', 'miggs', 'might', 'miked', 'mikes', 'mikra', 'milch', 'milds', 'miler', 'miles', 'milia', 'milks', 'milky', 'mille', 'mills', 'milos', 'milpa', 'milts', 'milty', 'mimed', 'mimeo', 'mimer', 'mimes', 'mimic', 'minae', 'minas', 'mince', 'mincy', 'minds', 'mined', 'miner', 'mines', 'mingy', 'minim', 'minis', 'minke', 'minks', 'minny', 'minor', 'mints', 'minty', 'minus', 'mired', 'mires', 'mirex', 'mirin', 'mirks', 'mirky', 'mirth', 'mirza', 'misdo', 'miser', 'mises', 'misos', 'missy', 'mists', 'misty', 'miter', 'mites', 'mitis', 'mitre', 'mitts', 'mixed', 'mixer', 'mixes', 'mixup', 'mizen', 'moans', 'moats', 'mocha', 'mocks', 'modal', 'model', 'modem', 'modes', 'modus', 'moggy', 'mogul', 'mohel', 'mohur', 'moils', 'moira', 'moire', 'moist', 'mojos', 'mokes', 'molal', 'molar', 'molas', 'molds', 'moldy', 'moles', 'molls', 'molly', 'molto', 'molts', 'momes', 'momma', 'mommy', 'momus', 'monad', 'monas', 'monde', 'mondo', 'money', 'mongo', 'monie', 'monks', 'monos', 'monte', 'month', 'mooch', 'moods', 'moody', 'mooed', 'moola', 'mools', 'moons', 'moony', 'moors', 'moory', 'moose', 'moots', 'moped', 'moper', 'mopes', 'mopey', 'morae', 'moral', 'moras', 'moray', 'morel', 'mores', 'morns', 'moron', 'morph', 'morro', 'morse', 'morts', 'mosey', 'mosks', 'mosso', 'mossy', 'moste', 'mosts', 'motel', 'motes', 'motet', 'motey', 'moths', 'mothy', 'motif', 'motor', 'motte', 'motto', 'motts', 'mouch', 'moues', 'mould', 'moult', 'mound', 'mount', 'mourn', 'mouse', 'mousy', 'mouth', 'moved', 'mover', 'moves', 'movie', 'mowed', 'mower', 'moxas', 'moxie', 'mozos', 'mucho', 'mucid', 'mucin', 'mucks', 'mucky', 'mucor', 'mucro', 'mucus', 'muddy', 'mudra', 'muffs', 'mufti', 'muggs', 'muggy', 'muhly', 'mujik', 'mulch', 'mulct', 'muled', 'mules', 'muley', 'mulla', 'mulls', 'mumms', 'mummy', 'mumps', 'mumus', 'munch', 'mungo', 'munis', 'muons', 'mural', 'muras', 'mured', 'mures', 'murex', 'murid', 'murks', 'murky', 'murra', 'murre', 'murrs', 'murry', 'musca', 'mused', 'muser', 'muses', 'mushy', 'music', 'musks', 'musky', 'mussy', 'musth', 'musts', 'musty', 'mutch', 'muted', 'muter', 'mutes', 'muton', 'mutts', 'muzzy', 'mylar', 'mynah', 'mynas', 'myoid', 'myoma', 'myope', 'myopy', 'myrrh', 'mysid', 'myths', 'mythy', 'naans', 'nabes', 'nabis', 'nabob', 'nacho', 'nacre', 'nadas', 'nadir', 'naevi', 'naffs', 'naggy', 'naiad', 'naifs', 'nails', 'naira', 'nairu', 'naive', 'naked', 'nakfa', 'nalas', 'naled', 'named', 'namer', 'names', 'nanas', 'nance', 'nancy', 'nanny', 'napas', 'napes', 'nappa', 'nappe', 'nappy', 'narco', 'narcs', 'nards', 'nares', 'naric', 'naris', 'narks', 'narky', 'nasal', 'nasty', 'natal', 'natch', 'nates', 'natty', 'naval', 'navar', 'navel', 'naves', 'navvy', 'nawab', 'nazis', 'neaps', 'nears', 'neath', 'neats', 'necks', 'neddy', 'needs', 'needy', 'neems', 'neeps', 'negus', 'neifs', 'neigh', 'neist', 'nelly', 'nemas', 'nenes', 'neons', 'nerds', 'nerdy', 'nerol', 'nerts', 'nertz', 'nerve', 'nervy', 'nests', 'netop', 'netts', 'netty', 'neuks', 'neume', 'neums', 'never', 'neves', 'nevus', 'newel', 'newer', 'newie', 'newly', 'newsy', 'newts', 'nexus', 'ngwee', 'nicad', 'nicer', 'niche', 'nicks', 'nicol', 'nidal', 'nided', 'nides', 'nidus', 'niece', 'nieve', 'nifty', 'nighs', 'night', 'nihil', 'nills', 'nimbi', 'nines', 'ninja', 'ninny', 'ninon', 'ninth', 'nipas', 'nippy', 'nisei', 'nisus', 'niter', 'nites', 'nitid', 'niton', 'nitre', 'nitro', 'nitty', 'nival', 'nixed', 'nixes', 'nixie', 'nizam', 'nobby', 'noble', 'nobly', 'nocks', 'nodal', 'noddy', 'nodes', 'nodus', 'noels', 'noggs', 'nohow', 'noils', 'noily', 'noirs', 'noise', 'noisy', 'nolos', 'nomad', 'nomas', 'nomen', 'nomes', 'nomoi', 'nomos', 'nonas', 'nonce', 'nones', 'nonet', 'nonyl', 'nooks', 'nooky', 'noons', 'noose', 'nopal', 'noria', 'noris', 'norms', 'north', 'nosed', 'noses', 'nosey', 'notal', 'notch', 'noted', 'noter', 'notes', 'notum', 'nouns', 'novae', 'novas', 'novel', 'noway', 'nowts', 'nubby', 'nubia', 'nucha', 'nuder', 'nudes', 'nudge', 'nudie', 'nudzh', 'nuked', 'nukes', 'nulls', 'numbs', 'numen', 'nurds', 'nurls', 'nurse', 'nutsy', 'nutty', 'nyala', 'nylon', 'nymph', 'oaken', 'oakum', 'oared', 'oases', 'oasis', 'oasts', 'oaten', 'oater', 'oaths', 'oaves', 'obeah', 'obeli', 'obese', 'obeys', 'obias', 'obits', 'objet', 'oboes', 'obole', 'oboli', 'obols', 'occur', 'ocean', 'ocher', 'ochre', 'ochry', 'ocker', 'ocrea', 'octad', 'octal', 'octan', 'octet', 'octyl', 'oculi', 'odahs', 'odder', 'oddly', 'odeon', 'odeum', 'odist', 'odium', 'odors', 'odour', 'odyle', 'odyls', 'ofays', 'offal', 'offed', 'offer', 'often', 'ofter', 'ogams', 'ogees', 'ogham', 'ogive', 'ogled', 'ogler', 'ogles', 'ogres', 'ohias', 'ohing', 'ohmic', 'oidia', 'oiled', 'oiler', 'oinks', 'okapi', 'okays', 'okehs', 'okras', 'olden', 'older', 'oldie', 'oleic', 'olein', 'oleos', 'oleum', 'olios', 'olive', 'ollas', 'ology', 'omasa', 'omber', 'ombre', 'omega', 'omens', 'omers', 'omits', 'oncet', 'onery', 'onion', 'onium', 'onlay', 'onset', 'ontic', 'oohed', 'oomph', 'oorie', 'ootid', 'oozed', 'oozes', 'opahs', 'opals', 'opens', 'opera', 'opine', 'oping', 'opium', 'opsin', 'opted', 'optic', 'orach', 'orals', 'orang', 'orate', 'orbed', 'orbit', 'orcas', 'orcin', 'order', 'ordos', 'oread', 'organ', 'orgic', 'oribi', 'oriel', 'orles', 'orlon', 'orlop', 'ormer', 'ornis', 'orpin', 'orris', 'ortho', 'orzos', 'osier', 'osmic', 'osmol', 'ossia', 'ostia', 'other', 'ottar', 'otter', 'ottos', 'ought', 'ounce', 'ouphe', 'ouphs', 'ourie', 'ousel', 'ousts', 'outby', 'outdo', 'outed', 'outer', 'outgo', 'outre', 'ouzel', 'ouzos', 'ovals', 'ovary', 'ovate', 'ovens', 'overs', 'overt', 'ovine', 'ovoid', 'ovoli', 'ovolo', 'ovule', 'owing', 'owlet', 'owned', 'owner', 'owsen', 'oxbow', 'oxeye', 'oxide', 'oxids', 'oxime', 'oxims', 'oxlip', 'oxter', 'oyers', 'ozone', 'pacas', 'paced', 'pacer', 'paces', 'pacey', 'pacha', 'packs', 'pacts', 'paddy', 'padis', 'padle', 'padre', 'padri', 'paean', 'paeon', 'pagan', 'paged', 'pager', 'pages', 'pagod', 'paiks', 'pails', 'pains', 'paint', 'pairs', 'paisa', 'paise', 'palea', 'paled', 'paler', 'pales', 'palet', 'palls', 'pally', 'palms', 'palmy', 'palpi', 'palps', 'palsy', 'pampa', 'panda', 'pandy', 'paned', 'panel', 'panes', 'panga', 'pangs', 'panic', 'panne', 'pansy', 'panto', 'pants', 'panty', 'papal', 'papas', 'papaw', 'paper', 'pappi', 'pappy', 'parae', 'paras', 'parch', 'pardi', 'pards', 'pardy', 'pared', 'pareo', 'parer', 'pares', 'pareu', 'parge', 'pargo', 'paris', 'parka', 'parks', 'parle', 'parol', 'parrs', 'parry', 'parse', 'parts', 'party', 'parve', 'parvo', 'paseo', 'pases', 'pasha', 'passe', 'pasta', 'paste', 'pasts', 'pasty', 'patch', 'pated', 'paten', 'pater', 'pates', 'paths', 'patin', 'patio', 'patly', 'patsy', 'patty', 'pause', 'pavan', 'paved', 'paver', 'paves', 'pavid', 'pavin', 'pavis', 'pawed', 'pawer', 'pawky', 'pawls', 'pawns', 'paxes', 'payed', 'payee', 'payer', 'payor', 'peace', 'peach', 'peage', 'peags', 'peaks', 'peaky', 'peals', 'peans', 'pearl', 'pears', 'peart', 'pease', 'peats', 'peaty', 'peavy', 'pecan', 'pechs', 'pecks', 'pecky', 'pedal', 'pedes', 'pedro', 'peeks', 'peels', 'peens', 'peeps', 'peers', 'peery', 'peeve', 'peins', 'peise', 'pekan', 'pekes', 'pekin', 'pekoe', 'peles', 'pelfs', 'pelon', 'pelts', 'penal', 'pence', 'pends', 'penes', 'pengo', 'penis', 'penna', 'penne', 'penni', 'penny', 'peons', 'peony', 'pepla', 'pepos', 'peppy', 'perch', 'perdu', 'perdy', 'perea', 'peres', 'peril', 'peris', 'perks', 'perky', 'perms', 'perps', 'perry', 'perse', 'pervs', 'pesky', 'pesos', 'pesto', 'pests', 'pesty', 'petal', 'peter', 'petit', 'petti', 'petto', 'petty', 'pewee', 'pewit', 'phage', 'phase', 'phial', 'phlox', 'phone', 'phono', 'phons', 'phony', 'photo', 'phots', 'phpht', 'phuts', 'phyla', 'phyle', 'piano', 'pians', 'pibal', 'pical', 'picas', 'picks', 'picky', 'picot', 'picul', 'piece', 'piers', 'pieta', 'piety', 'piggy', 'pigmy', 'piing', 'pikas', 'piked', 'piker', 'pikes', 'pikis', 'pilaf', 'pilar', 'pilau', 'pilaw', 'pilea', 'piled', 'pilei', 'piles', 'pilis', 'pills', 'pilot', 'pilus', 'pimas', 'pimps', 'pinas', 'pinch', 'pined', 'pines', 'piney', 'pingo', 'pings', 'pinko', 'pinks', 'pinky', 'pinna', 'pinny', 'pinon', 'pinot', 'pinta', 'pinto', 'pints', 'pinup', 'pions', 'pious', 'pipal', 'piped', 'piper', 'pipes', 'pipet', 'pipit', 'pique', 'pirns', 'pirog', 'pisco', 'pisos', 'piste', 'pitas', 'pitch', 'piths', 'pithy', 'piton', 'pitta', 'pivot', 'pixel', 'pixes', 'pixie', 'pizza', 'place', 'plack', 'plage', 'plaid', 'plain', 'plait', 'plane', 'plank', 'plans', 'plant', 'plash', 'plasm', 'plate', 'plats', 'platy', 'playa', 'plays', 'plaza', 'plead', 'pleas', 'pleat', 'plebe', 'plebs', 'plena', 'pleon', 'plews', 'plica', 'plied', 'plier', 'plies', 'plink', 'plods', 'plonk', 'plops', 'plots', 'plotz', 'plows', 'ploys', 'pluck', 'plugs', 'plumb', 'plume', 'plump', 'plums', 'plumy', 'plunk', 'plush', 'plyer', 'poach', 'poboy', 'pocks', 'pocky', 'podgy', 'podia', 'poems', 'poesy', 'poets', 'pogey', 'poilu', 'poind', 'point', 'poise', 'poked', 'poker', 'pokes', 'pokey', 'polar', 'poled', 'poler', 'poles', 'polio', 'polis', 'polka', 'polls', 'polos', 'polyp', 'polys', 'pomes', 'pommy', 'pomos', 'pomps', 'ponce', 'ponds', 'pones', 'pongs', 'pooch', 'poods', 'pooed', 'poofs', 'poofy', 'poohs', 'pools', 'poons', 'poops', 'poori', 'poove', 'popes', 'poppa', 'poppy', 'popsy', 'porch', 'pored', 'pores', 'porgy', 'porks', 'porky', 'porno', 'porns', 'porny', 'ports', 'posed', 'poser', 'poses', 'posit', 'posse', 'posts', 'potsy', 'potto', 'potty', 'pouch', 'pouff', 'poufs', 'poult', 'pound', 'pours', 'pouts', 'pouty', 'power', 'poxed', 'poxes', 'poyou', 'praam', 'prahu', 'prams', 'prang', 'prank', 'praos', 'prase', 'prate', 'prats', 'praus', 'prawn', 'prays', 'preed', 'preen', 'prees', 'preop', 'preps', 'presa', 'prese', 'press', 'prest', 'prexy', 'preys', 'price', 'prick', 'pricy', 'pride', 'pried', 'prier', 'pries', 'prigs', 'prill', 'prima', 'prime', 'primi', 'primo', 'primp', 'prims', 'prink', 'print', 'prion', 'prior', 'prise', 'prism', 'priss', 'privy', 'prize', 'proas', 'probe', 'prods', 'proem', 'profs', 'progs', 'prole', 'promo', 'proms', 'prone', 'prong', 'proof', 'props', 'prose', 'proso', 'pross', 'prost', 'prosy', 'proud', 'prove', 'prowl', 'prows', 'proxy', 'prude', 'prune', 'pruta', 'pryer', 'psalm', 'pseud', 'pshaw', 'psoae', 'psoai', 'psoas', 'psych', 'pubes', 'pubic', 'pubis', 'puces', 'pucka', 'pucks', 'pudgy', 'pudic', 'puffs', 'puffy', 'puggy', 'pujah', 'pujas', 'puked', 'pukes', 'pukka', 'puled', 'puler', 'pules', 'pulik', 'pulis', 'pulls', 'pulps', 'pulpy', 'pulse', 'pumas', 'pumps', 'punas', 'punch', 'pungs', 'punji', 'punka', 'punks', 'punky', 'punny', 'punto', 'punts', 'punty', 'pupae', 'pupal', 'pupas', 'pupil', 'puppy', 'pupus', 'purda', 'puree', 'purer', 'purge', 'purin', 'puris', 'purls', 'purrs', 'purse', 'pursy', 'purty', 'puses', 'pushy', 'pussy', 'puton', 'putti', 'putto', 'putts', 'putty', 'pygmy', 'pyins', 'pylon', 'pyoid', 'pyran', 'pyres', 'pyrex', 'pyric', 'pyros', 'pyxes', 'pyxie', 'pyxis', 'qadis', 'qaids', 'qanat', 'qophs', 'quack', 'quads', 'quaff', 'quags', 'quail', 'quais', 'quake', 'quaky', 'quale', 'qualm', 'quant', 'quare', 'quark', 'quart', 'quash', 'quasi', 'quass', 'quate', 'quays', 'qubit', 'quean', 'queen', 'queer', 'quell', 'quern', 'query', 'quest', 'queue', 'queys', 'quick', 'quids', 'quiet', 'quiff', 'quill', 'quilt', 'quins', 'quint', 'quips', 'quipu', 'quire', 'quirk', 'quirt', 'quite', 'quits', 'quods', 'quoin', 'quoit', 'quoll', 'quota', 'quote', 'quoth', 'qursh', 'rabat', 'rabbi', 'rabic', 'rabid', 'raced', 'racer', 'races', 'racks', 'racon', 'radar', 'radii', 'radio', 'radix', 'radon', 'raffs', 'rafts', 'ragas', 'raged', 'ragee', 'rages', 'raggs', 'raggy', 'ragis', 'raias', 'raids', 'rails', 'rains', 'rainy', 'raise', 'raita', 'rajah', 'rajas', 'rajes', 'raked', 'rakee', 'raker', 'rakes', 'rakis', 'rakus', 'rales', 'rally', 'ralph', 'ramal', 'ramee', 'ramen', 'ramet', 'ramie', 'rammy', 'ramps', 'ramus', 'rance', 'ranch', 'rands', 'randy', 'ranee', 'range', 'rangy', 'ranid', 'ranis', 'ranks', 'rants', 'raped', 'raper', 'rapes', 'raphe', 'rapid', 'rared', 'rarer', 'rares', 'rased', 'raser', 'rases', 'rasps', 'raspy', 'ratal', 'ratan', 'ratch', 'rated', 'ratel', 'rater', 'rates', 'rathe', 'ratio', 'ratos', 'ratty', 'raved', 'ravel', 'raven', 'raver', 'raves', 'ravin', 'rawer', 'rawin', 'rawly', 'raxed', 'raxes', 'rayah', 'rayas', 'rayed', 'rayon', 'razed', 'razee', 'razer', 'razes', 'razor', 'reach', 'react', 'readd', 'reads', 'ready', 'realm', 'reals', 'reams', 'reaps', 'rearm', 'rears', 'reata', 'reave', 'rebar', 'rebbe', 'rebec', 'rebel', 'rebid', 'rebop', 'rebus', 'rebut', 'rebuy', 'recap', 'recce', 'recit', 'recks', 'recon', 'recta', 'recti', 'recto', 'recur', 'recut', 'redan', 'redds', 'reded', 'redes', 'redia', 'redid', 'redip', 'redly', 'redon', 'redos', 'redox', 'redry', 'redub', 'redux', 'redye', 'reeds', 'reedy', 'reefs', 'reefy', 'reeks', 'reeky', 'reels', 'reest', 'reeve', 'refed', 'refel', 'refer', 'refit', 'refix', 'refly', 'refry', 'regal', 'reges', 'regma', 'regna', 'rehab', 'rehem', 'reifs', 'reify', 'reign', 'reink', 'reins', 'reive', 'rejig', 'rekey', 'relax', 'relay', 'relet', 'relic', 'relit', 'reman', 'remap', 'remet', 'remex', 'remit', 'remix', 'renal', 'rends', 'renew', 'renig', 'renin', 'rente', 'rents', 'reoil', 'repay', 'repeg', 'repel', 'repin', 'reply', 'repos', 'repot', 'repps', 'repro', 'reran', 'rerig', 'rerun', 'resat', 'resaw', 'resay', 'resee', 'reset', 'resew', 'resid', 'resin', 'resit', 'resod', 'resow', 'rests', 'retag', 'retax', 'retch', 'retem', 'retia', 'retie', 'retro', 'retry', 'reuse', 'revel', 'revet', 'revue', 'rewan', 'rewax', 'rewed', 'rewet', 'rewin', 'rewon', 'rexes', 'rheas', 'rheme', 'rheum', 'rhino', 'rhomb', 'rhumb', 'rhyme', 'rhyta', 'rials', 'riant', 'riata', 'ribby', 'ribes', 'riced', 'ricer', 'rices', 'ricin', 'ricks', 'rider', 'rides', 'ridge', 'ridgy', 'riels', 'rifer', 'riffs', 'rifle', 'rifts', 'right', 'rigid', 'rigor', 'riled', 'riles', 'riley', 'rille', 'rills', 'rimed', 'rimer', 'rimes', 'rinds', 'rindy', 'rings', 'rinks', 'rinse', 'rioja', 'riots', 'riped', 'ripen', 'riper', 'ripes', 'risen', 'riser', 'rises', 'rishi', 'risks', 'risky', 'risus', 'rites', 'ritzy', 'rival', 'rived', 'riven', 'river', 'rives', 'rivet', 'riyal', 'roach', 'roads', 'roams', 'roans', 'roars', 'roast', 'robed', 'robes', 'robin', 'roble', 'robot', 'rocks', 'rocky', 'rodeo', 'rodes', 'roger', 'rogue', 'roils', 'roily', 'roles', 'rolfs', 'rolls', 'roman', 'romeo', 'romps', 'rondo', 'roods', 'roofs', 'rooks', 'rooky', 'rooms', 'roomy', 'roose', 'roost', 'roots', 'rooty', 'roped', 'roper', 'ropes', 'ropey', 'roque', 'rosed', 'roses', 'roset', 'roshi', 'rosin', 'rotas', 'rotch', 'rotes', 'rotis', 'rotls', 'rotor', 'rotos', 'rotte', 'rouen', 'roues', 'rouge', 'rough', 'round', 'roups', 'roupy', 'rouse', 'roust', 'route', 'routh', 'routs', 'roved', 'roven', 'rover', 'roves', 'rowan', 'rowdy', 'rowed', 'rowel', 'rowen', 'rower', 'rowth', 'royal', 'ruana', 'rubby', 'rubel', 'rubes', 'ruble', 'rubus', 'ruche', 'rucks', 'rudds', 'ruddy', 'ruder', 'ruers', 'ruffe', 'ruffs', 'rugae', 'rugal', 'rugby', 'ruing', 'ruins', 'ruled', 'ruler', 'rules', 'rumba', 'rumen', 'rummy', 'rumor', 'rumps', 'runes', 'rungs', 'runic', 'runny', 'runts', 'runty', 'rupee', 'rural', 'ruses', 'rushy', 'rusks', 'rusts', 'rusty', 'ruths', 'rutin', 'rutty', 'ryked', 'rykes', 'rynds', 'ryots', 'sabal', 'sabed', 'saber', 'sabes', 'sabin', 'sabir', 'sable', 'sabot', 'sabra', 'sabre', 'sacks', 'sacra', 'sades', 'sadhe', 'sadhu', 'sadis', 'sadly', 'safer', 'safes', 'sagas', 'sager', 'sages', 'saggy', 'sagos', 'sagum', 'sahib', 'saice', 'saids', 'saiga', 'sails', 'sains', 'saint', 'saith', 'sajou', 'saker', 'sakes', 'sakis', 'salad', 'salal', 'salep', 'sales', 'salic', 'sally', 'salmi', 'salol', 'salon', 'salpa', 'salps', 'salsa', 'salts', 'salty', 'salve', 'salvo', 'samba', 'sambo', 'samek', 'samps', 'sands', 'sandy', 'saned', 'saner', 'sanes', 'sanga', 'sangh', 'santo', 'sapid', 'sapor', 'sappy', 'saran', 'sards', 'saree', 'sarge', 'sargo', 'sarin', 'saris', 'sarks', 'sarky', 'sarod', 'saros', 'sasin', 'sassy', 'satay', 'sated', 'satem', 'sates', 'satin', 'satis', 'satyr', 'sauce', 'sauch', 'saucy', 'saugh', 'sauls', 'sault', 'sauna', 'saury', 'saute', 'saved', 'saver', 'saves', 'savin', 'savor', 'savoy', 'savvy', 'sawed', 'sawer', 'saxes', 'sayed', 'sayer', 'sayid', 'sayst', 'scabs', 'scads', 'scags', 'scald', 'scale', 'scall', 'scalp', 'scaly', 'scamp', 'scams', 'scans', 'scant', 'scape', 'scare', 'scarf', 'scarp', 'scars', 'scart', 'scary', 'scats', 'scatt', 'scaup', 'scaur', 'scena', 'scend', 'scene', 'scent', 'schav', 'schmo', 'schul', 'schwa', 'scion', 'scoff', 'scold', 'scone', 'scoop', 'scoot', 'scope', 'scops', 'score', 'scorn', 'scots', 'scour', 'scout', 'scowl', 'scows', 'scrag', 'scram', 'scrap', 'scree', 'screw', 'scrim', 'scrip', 'scrod', 'scrub', 'scrum', 'scuba', 'scudi', 'scudo', 'scuds', 'scuff', 'sculk', 'scull', 'sculp', 'scums', 'scups', 'scurf', 'scuta', 'scute', 'scuts', 'scuzz', 'seals', 'seams', 'seamy', 'sears', 'seats', 'sebum', 'secco', 'sects', 'sedan', 'seder', 'sedge', 'sedgy', 'sedum', 'seeds', 'seedy', 'seeks', 'seels', 'seely', 'seems', 'seeps', 'seepy', 'seers', 'segni', 'segno', 'segos', 'segue', 'seifs', 'seine', 'seise', 'seism', 'seize', 'selah', 'selfs', 'selle', 'sells', 'selva', 'semen', 'semes', 'semis', 'sends', 'sengi', 'senna', 'senor', 'sensa', 'sense', 'sente', 'senti', 'sepal', 'sepia', 'sepic', 'sepoy', 'septa', 'septs', 'serac', 'serai', 'seral', 'sered', 'serer', 'seres', 'serfs', 'serge', 'serif', 'serin', 'serow', 'serry', 'serum', 'serve', 'servo', 'setae', 'setal', 'seton', 'setts', 'setup', 'seven', 'sever', 'sewan', 'sewar', 'sewed', 'sewer', 'sexed', 'sexes', 'sexto', 'sexts', 'shack', 'shade', 'shads', 'shady', 'shaft', 'shags', 'shahs', 'shake', 'shako', 'shaky', 'shale', 'shall', 'shalt', 'shaly', 'shame', 'shams', 'shank', 'shape', 'shard', 'share', 'shark', 'sharn', 'sharp', 'shaul', 'shave', 'shawl', 'shawm', 'shawn', 'shaws', 'shays', 'sheaf', 'sheal', 'shear', 'sheas', 'sheds', 'sheen', 'sheep', 'sheer', 'sheet', 'sheik', 'shelf', 'shell', 'shend', 'shent', 'sheol', 'sherd', 'shewn', 'shews', 'shied', 'shiel', 'shier', 'shies', 'shift', 'shill', 'shily', 'shims', 'shine', 'shins', 'shiny', 'ships', 'shire', 'shirk', 'shirr', 'shirt', 'shist', 'shits', 'shiva', 'shive', 'shivs', 'shlep', 'shlub', 'shoal', 'shoat', 'shock', 'shoed', 'shoer', 'shoes', 'shogi', 'shogs', 'shoji', 'shone', 'shook', 'shool', 'shoon', 'shoos', 'shoot', 'shops', 'shore', 'shorl', 'shorn', 'short', 'shote', 'shots', 'shott', 'shout', 'shove', 'shown', 'shows', 'showy', 'shoyu', 'shred', 'shrew', 'shris', 'shrub', 'shrug', 'shtik', 'shuck', 'shuln', 'shuls', 'shuns', 'shunt', 'shush', 'shute', 'shuts', 'shwas', 'shyer', 'shyly', 'sials', 'sibbs', 'sibyl', 'sices', 'sicko', 'sicks', 'sided', 'sides', 'sidhe', 'sidle', 'siege', 'sieur', 'sieve', 'sifts', 'sighs', 'sight', 'sigil', 'sigla', 'sigma', 'signa', 'signs', 'sikas', 'siker', 'sikes', 'silds', 'silex', 'silks', 'silky', 'sills', 'silly', 'silos', 'silts', 'silty', 'silva', 'simar', 'simas', 'simps', 'since', 'sines', 'sinew', 'singe', 'sings', 'sinhs', 'sinks', 'sinus', 'siped', 'sipes', 'sired', 'siree', 'siren', 'sires', 'sirra', 'sirup', 'sisal', 'sises', 'sissy', 'sitar', 'sited', 'sites', 'situp', 'situs', 'siver', 'sixes', 'sixmo', 'sixte', 'sixth', 'sixty', 'sizar', 'sized', 'sizer', 'sizes', 'skags', 'skald', 'skank', 'skate', 'skats', 'skean', 'skeed', 'skeen', 'skees', 'skeet', 'skegs', 'skein', 'skell', 'skelm', 'skelp', 'skene', 'skeps', 'skews', 'skids', 'skied', 'skier', 'skies', 'skiey', 'skiff', 'skill', 'skimo', 'skimp', 'skims', 'skink', 'skins', 'skint', 'skips', 'skirl', 'skirr', 'skirt', 'skite', 'skits', 'skive', 'skoal', 'skort', 'skosh', 'skuas', 'skulk', 'skull', 'skunk', 'skyed', 'skyey', 'slabs', 'slack', 'slags', 'slain', 'slake', 'slams', 'slang', 'slank', 'slant', 'slaps', 'slash', 'slate', 'slats', 'slaty', 'slave', 'slaws', 'slays', 'sleds', 'sleek', 'sleep', 'sleet', 'slept', 'slews', 'slice', 'slick', 'slide', 'slier', 'slily', 'slime', 'slims', 'slimy', 'sling', 'slink', 'slipe', 'slips', 'slipt', 'slits', 'slobs', 'sloes', 'slogs', 'sloid', 'slojd', 'sloop', 'slope', 'slops', 'slosh', 'sloth', 'slots', 'slows', 'sloyd', 'slubs', 'slued', 'slues', 'sluff', 'slugs', 'slump', 'slums', 'slung', 'slunk', 'slurb', 'slurp', 'slurs', 'slush', 'sluts', 'slyer', 'slyly', 'slype', 'smack', 'small', 'smalt', 'smarm', 'smart', 'smash', 'smaze', 'smear', 'smeek', 'smell', 'smelt', 'smerk', 'smews', 'smile', 'smirk', 'smite', 'smith', 'smock', 'smogs', 'smoke', 'smoky', 'smolt', 'smote', 'smush', 'smuts', 'snack', 'snafu', 'snags', 'snail', 'snake', 'snaky', 'snaps', 'snare', 'snarf', 'snark', 'snarl', 'snash', 'snath', 'snaws', 'sneak', 'sneap', 'sneck', 'sneds', 'sneer', 'snell', 'snibs', 'snick', 'snide', 'sniff', 'snipe', 'snips', 'snits', 'snobs', 'snogs', 'snood', 'snook', 'snool', 'snoop', 'snoot', 'snore', 'snort', 'snots', 'snout', 'snows', 'snowy', 'snubs', 'snuck', 'snuff', 'snugs', 'snyes', 'soaks', 'soaps', 'soapy', 'soars', 'soave', 'sobas', 'sober', 'socas', 'socko', 'socks', 'socle', 'sodas', 'soddy', 'sodic', 'sodom', 'sofar', 'sofas', 'softa', 'softs', 'softy', 'soggy', 'soils', 'sojas', 'sokes', 'sokol', 'solan', 'solar', 'soldi', 'soldo', 'soled', 'solei', 'soles', 'solid', 'solon', 'solos', 'solum', 'solus', 'solve', 'soman', 'somas', 'sonar', 'sonde', 'sones', 'songs', 'sonic', 'sonly', 'sonny', 'sonsy', 'sooey', 'sooks', 'sooth', 'soots', 'sooty', 'sophs', 'sophy', 'sopor', 'soppy', 'soras', 'sorbs', 'sords', 'sored', 'sorel', 'sorer', 'sores', 'sorgo', 'sorns', 'sorry', 'sorta', 'sorts', 'sorus', 'soths', 'sotol', 'sough', 'souks', 'souls', 'sound', 'soups', 'soupy', 'sours', 'souse', 'south', 'sowar', 'sowed', 'sower', 'soyas', 'soyuz', 'sozin', 'space', 'spacy', 'spade', 'spado', 'spaed', 'spaes', 'spahi', 'spail', 'spait', 'spake', 'spale', 'spall', 'spams', 'spang', 'spank', 'spans', 'spare', 'spark', 'spars', 'spasm', 'spate', 'spats', 'spawn', 'spays', 'spazz', 'speak', 'spean', 'spear', 'speck', 'specs', 'speed', 'speel', 'speer', 'speil', 'speir', 'spell', 'spelt', 'spend', 'spent', 'sperm', 'spews', 'spica', 'spice', 'spick', 'spics', 'spicy', 'spied', 'spiel', 'spier', 'spies', 'spiff', 'spike', 'spiks', 'spiky', 'spile', 'spill', 'spilt', 'spine', 'spins', 'spiny', 'spire', 'spirt', 'spiry', 'spite', 'spits', 'spitz', 'spivs', 'splat', 'splay', 'split', 'spode', 'spoil', 'spoke', 'spoof', 'spook', 'spool', 'spoon', 'spoor', 'spore', 'sport', 'spots', 'spout', 'sprag', 'sprat', 'spray', 'spree', 'sprig', 'sprit', 'sprue', 'sprug', 'spuds', 'spued', 'spues', 'spume', 'spumy', 'spunk', 'spurn', 'spurs', 'spurt', 'sputa', 'squab', 'squad', 'squat', 'squaw', 'squeg', 'squib', 'squid', 'stabs', 'stack', 'stade', 'staff', 'stage', 'stags', 'stagy', 'staid', 'staig', 'stain', 'stair', 'stake', 'stale', 'stalk', 'stall', 'stamp', 'stand', 'stane', 'stang', 'stank', 'staph', 'stare', 'stark', 'stars', 'start', 'stash', 'state', 'stats', 'stave', 'stays', 'stead', 'steak', 'steal', 'steam', 'steed', 'steek', 'steel', 'steep', 'steer', 'stein', 'stela', 'stele', 'stems', 'steno', 'stent', 'steps', 'stere', 'stern', 'stets', 'stews', 'stewy', 'stich', 'stick', 'stied', 'sties', 'stiff', 'stile', 'still', 'stilt', 'stime', 'stimy', 'sting', 'stink', 'stint', 'stipe', 'stirk', 'stirp', 'stirs', 'stoae', 'stoai', 'stoas', 'stoat', 'stobs', 'stock', 'stogy', 'stoic', 'stoke', 'stole', 'stoma', 'stomp', 'stone', 'stony', 'stood', 'stook', 'stool', 'stoop', 'stope', 'stops', 'stopt', 'store', 'stork', 'storm', 'story', 'stoss', 'stots', 'stott', 'stoup', 'stour', 'stout', 'stove', 'stowp', 'stows', 'strap', 'straw', 'stray', 'strep', 'strew', 'stria', 'strip', 'strop', 'strow', 'stroy', 'strum', 'strut', 'stubs', 'stuck', 'studs', 'study', 'stuff', 'stull', 'stump', 'stums', 'stung', 'stunk', 'stuns', 'stunt', 'stupa', 'stupe', 'sturt', 'styed', 'styes', 'style', 'styli', 'stymy', 'suave', 'subah', 'subas', 'suber', 'sucks', 'sucky', 'sucre', 'sudds', 'sudor', 'sudsy', 'suede', 'suers', 'suets', 'suety', 'sugar', 'sughs', 'suing', 'suint', 'suite', 'suits', 'sulci', 'sulfa', 'sulfo', 'sulks', 'sulky', 'sully', 'sulus', 'sumac', 'summa', 'sumos', 'sumps', 'sunna', 'sunns', 'sunny', 'sunup', 'super', 'supes', 'supra', 'surah', 'sural', 'suras', 'surds', 'surer', 'surfs', 'surfy', 'surge', 'surgy', 'surly', 'surra', 'sushi', 'sutra', 'sutta', 'swabs', 'swage', 'swags', 'swail', 'swain', 'swale', 'swami', 'swamp', 'swamy', 'swang', 'swank', 'swans', 'swaps', 'sward', 'sware', 'swarf', 'swarm', 'swart', 'swash', 'swath', 'swats', 'sways', 'swear', 'sweat', 'swede', 'sweep', 'sweer', 'sweet', 'swell', 'swept', 'swift', 'swigs', 'swill', 'swims', 'swine', 'swing', 'swink', 'swipe', 'swirl', 'swish', 'swiss', 'swith', 'swive', 'swobs', 'swoon', 'swoop', 'swops', 'sword', 'swore', 'sworn', 'swots', 'swoun', 'swung', 'sycee', 'syces', 'sykes', 'sylis', 'sylph', 'sylva', 'synch', 'syncs', 'synod', 'synth', 'syphs', 'syren', 'syrup', 'sysop', 'tabby', 'taber', 'tabes', 'tabid', 'tabla', 'table', 'taboo', 'tabor', 'tabun', 'tabus', 'taces', 'tacet', 'tache', 'tachs', 'tacit', 'tacks', 'tacky', 'tacos', 'tacts', 'taels', 'taffy', 'tafia', 'tahrs', 'taiga', 'tails', 'tains', 'taint', 'tajes', 'takas', 'taken', 'taker', 'takes', 'takin', 'talar', 'talas', 'talcs', 'taler', 'tales', 'talks', 'talky', 'talls', 'tally', 'talon', 'taluk', 'talus', 'tamal', 'tamed', 'tamer', 'tames', 'tamis', 'tammy', 'tamps', 'tanga', 'tango', 'tangs', 'tangy', 'tanka', 'tanks', 'tansy', 'tanto', 'tapas', 'taped', 'taper', 'tapes', 'tapir', 'tapis', 'tardo', 'tardy', 'tared', 'tares', 'targe', 'tarns', 'taroc', 'tarok', 'taros', 'tarot', 'tarps', 'tarre', 'tarry', 'tarsi', 'tarts', 'tarty', 'tasks', 'tasse', 'taste', 'tasty', 'tatar', 'tater', 'tates', 'tatty', 'taunt', 'tauon', 'taupe', 'tauts', 'tawed', 'tawer', 'tawie', 'tawny', 'tawse', 'taxed', 'taxer', 'taxes', 'taxis', 'taxol', 'taxon', 'taxus', 'tazza', 'tazze', 'teach', 'teaks', 'teals', 'teams', 'tears', 'teary', 'tease', 'teats', 'techs', 'techy', 'tecta', 'teddy', 'teels', 'teems', 'teens', 'teeny', 'teeth', 'teffs', 'teggs', 'tegua', 'teiid', 'teind', 'telae', 'telco', 'teles', 'telex', 'telia', 'telic', 'tells', 'telly', 'teloi', 'telos', 'tempi', 'tempo', 'temps', 'tempt', 'tench', 'tends', 'tendu', 'tenet', 'tenge', 'tenia', 'tenon', 'tenor', 'tense', 'tenth', 'tents', 'tenty', 'tepal', 'tepas', 'tepee', 'tepid', 'tepoy', 'terai', 'terce', 'terga', 'terms', 'terne', 'terns', 'terra', 'terry', 'terse', 'tesla', 'testa', 'tests', 'testy', 'teths', 'tetra', 'tetri', 'teuch', 'teugh', 'tewed', 'texas', 'texts', 'thack', 'thane', 'thank', 'tharm', 'thaws', 'thebe', 'theca', 'theft', 'thegn', 'thein', 'their', 'theme', 'thens', 'there', 'therm', 'these', 'thesp', 'theta', 'thews', 'thewy', 'thick', 'thief', 'thigh', 'thill', 'thine', 'thing', 'think', 'thins', 'thiol', 'third', 'thirl', 'thole', 'thong', 'thorn', 'thoro', 'thorp', 'those', 'thous', 'thraw', 'three', 'threw', 'thrip', 'throb', 'throe', 'throw', 'thrum', 'thuds', 'thugs', 'thuja', 'thumb', 'thump', 'thunk', 'thurl', 'thuya', 'thyme', 'thymi', 'thymy', 'tiara', 'tibia', 'tical', 'ticks', 'tidal', 'tided', 'tides', 'tiers', 'tiffs', 'tiger', 'tight', 'tigon', 'tikes', 'tikis', 'tikka', 'tilak', 'tilde', 'tiled', 'tiler', 'tiles', 'tills', 'tilth', 'tilts', 'timed', 'timer', 'times', 'timid', 'tinct', 'tinea', 'tined', 'tines', 'tinge', 'tings', 'tinny', 'tints', 'tipis', 'tippy', 'tipsy', 'tired', 'tires', 'tirls', 'tiros', 'titan', 'titer', 'tithe', 'titis', 'title', 'titre', 'titty', 'tizzy', 'toads', 'toady', 'toast', 'today', 'toddy', 'toeas', 'toffs', 'toffy', 'tofts', 'tofus', 'togae', 'togas', 'togue', 'toile', 'toils', 'toits', 'tokay', 'toked', 'token', 'toker', 'tokes', 'tolan', 'tolar', 'tolas', 'toled', 'toles', 'tolls', 'tolus', 'tolyl', 'toman', 'tombs', 'tomes', 'tommy', 'tonal', 'tondi', 'tondo', 'toned', 'toner', 'tones', 'toney', 'tonga', 'tongs', 'tonic', 'tonne', 'tonus', 'tools', 'toons', 'tooth', 'toots', 'topaz', 'toped', 'topee', 'toper', 'topes', 'tophe', 'tophi', 'tophs', 'topic', 'topis', 'topoi', 'topos', 'toque', 'torah', 'toras', 'torch', 'torcs', 'tores', 'toric', 'torii', 'toros', 'torot', 'torrs', 'torse', 'torsi', 'torsk', 'torso', 'torta', 'torte', 'torts', 'torus', 'total', 'toted', 'totem', 'toter', 'totes', 'touch', 'tough', 'tours', 'touse', 'touts', 'towed', 'towel', 'tower', 'towie', 'towns', 'towny', 'toxic', 'toxin', 'toyed', 'toyer', 'toyon', 'toyos', 'trace', 'track', 'tract', 'trade', 'tragi', 'traik', 'trail', 'train', 'trait', 'tramp', 'trams', 'trank', 'tranq', 'trans', 'traps', 'trapt', 'trash', 'trass', 'trave', 'trawl', 'trays', 'tread', 'treat', 'treed', 'treen', 'trees', 'treks', 'trend', 'tress', 'trets', 'trews', 'treys', 'triac', 'triad', 'trial', 'tribe', 'trice', 'trick', 'tried', 'trier', 'tries', 'trigo', 'trigs', 'trike', 'trill', 'trims', 'trine', 'triol', 'trios', 'tripe', 'trips', 'trite', 'troak', 'trock', 'trode', 'trogs', 'trois', 'troke', 'troll', 'tromp', 'trona', 'trone', 'troop', 'trooz', 'trope', 'troth', 'trots', 'trout', 'trove', 'trows', 'troys', 'truce', 'truck', 'trued', 'truer', 'trues', 'trugs', 'trull', 'truly', 'trump', 'trunk', 'truss', 'trust', 'truth', 'tryma', 'tryst', 'tsade', 'tsadi', 'tsars', 'tsked', 'tsuba', 'tubae', 'tubal', 'tubas', 'tubby', 'tubed', 'tuber', 'tubes', 'tucks', 'tufas', 'tuffs', 'tufts', 'tufty', 'tules', 'tulip', 'tulle', 'tumid', 'tummy', 'tumor', 'tumps', 'tunas', 'tuned', 'tuner', 'tunes', 'tungs', 'tunic', 'tunny', 'tupik', 'tuque', 'turbo', 'turds', 'turfs', 'turfy', 'turks', 'turns', 'turps', 'tushy', 'tusks', 'tutee', 'tutor', 'tutti', 'tutty', 'tutus', 'tuxes', 'tuyer', 'twaes', 'twain', 'twang', 'twats', 'tweak', 'tweed', 'tween', 'tweet', 'twerp', 'twice', 'twier', 'twigs', 'twill', 'twine', 'twins', 'twiny', 'twirl', 'twirp', 'twist', 'twits', 'twixt', 'twyer', 'tyees', 'tyers', 'tying', 'tyiyn', 'tykes', 'tyned', 'tynes', 'typal', 'typed', 'types', 'typey', 'typic', 'typos', 'typps', 'tyred', 'tyres', 'tyros', 'tythe', 'tzars', 'udder', 'udons', 'uhlan', 'ukase', 'ulama', 'ulans', 'ulcer', 'ulema', 'ulnad', 'ulnae', 'ulnar', 'ulnas', 'ulpan', 'ultra', 'ulvas', 'umami', 'umbel', 'umber', 'umbos', 'umbra', 'umiac', 'umiak', 'umiaq', 'umped', 'unais', 'unapt', 'unarm', 'unary', 'unaus', 'unban', 'unbar', 'unbid', 'unbox', 'uncap', 'uncia', 'uncle', 'uncos', 'uncoy', 'uncus', 'uncut', 'undee', 'under', 'undid', 'undue', 'unfed', 'unfit', 'unfix', 'ungot', 'unhat', 'unhip', 'unify', 'union', 'unite', 'units', 'unity', 'unjam', 'unlay', 'unled', 'unlet', 'unlit', 'unman', 'unmet', 'unmew', 'unmix', 'unpeg', 'unpen', 'unpin', 'unrig', 'unrip', 'unsay', 'unset', 'unsew', 'unsex', 'untie', 'until', 'unwed', 'unwet', 'unwit', 'unwon', 'unzip', 'upbow', 'upbye', 'updos', 'updry', 'upend', 'uplit', 'upped', 'upper', 'upset', 'uraei', 'urare', 'urari', 'urase', 'urate', 'urban', 'urbia', 'ureal', 'ureas', 'uredo', 'ureic', 'urged', 'urger', 'urges', 'urial', 'urine', 'urped', 'ursae', 'ursid', 'usage', 'users', 'usher', 'using', 'usnea', 'usque', 'usual', 'usurp', 'usury', 'uteri', 'utile', 'utter', 'uveal', 'uveas', 'uvula', 'vacua', 'vagal', 'vague', 'vagus', 'vails', 'vairs', 'vakil', 'vales', 'valet', 'valid', 'valor', 'valse', 'value', 'valve', 'vamps', 'vampy', 'vanda', 'vaned', 'vanes', 'vangs', 'vapid', 'vapor', 'varas', 'varia', 'varix', 'varna', 'varus', 'varve', 'vasal', 'vases', 'vasts', 'vasty', 'vatic', 'vatus', 'vault', 'vaunt', 'veals', 'vealy', 'veena', 'veeps', 'veers', 'veery', 'vegan', 'veges', 'vegie', 'veils', 'veins', 'veiny', 'velar', 'velds', 'veldt', 'velum', 'venae', 'venal', 'vends', 'venge', 'venin', 'venom', 'vents', 'venue', 'venus', 'verbs', 'verge', 'verse', 'verso', 'verst', 'verts', 'vertu', 'verve', 'vesta', 'vests', 'vetch', 'vexed', 'vexer', 'vexes', 'vexil', 'vials', 'viand', 'vibes', 'vicar', 'viced', 'vices', 'vichy', 'video', 'viers', 'views', 'viewy', 'vigas', 'vigia', 'vigil', 'vigor', 'viler', 'villa', 'villi', 'vills', 'vimen', 'vinal', 'vinas', 'vinca', 'vined', 'vines', 'vinic', 'vinos', 'vinyl', 'viola', 'viols', 'viper', 'viral', 'vireo', 'vires', 'virga', 'virid', 'virls', 'virtu', 'virus', 'visas', 'vised', 'vises', 'visit', 'visor', 'vista', 'vitae', 'vital', 'vitta', 'vivas', 'vivid', 'vixen', 'vizir', 'vizor', 'vocab', 'vocal', 'voces', 'vodka', 'vodou', 'vodun', 'vogie', 'vogue', 'voice', 'voids', 'voila', 'voile', 'volar', 'voled', 'voles', 'volta', 'volte', 'volti', 'volts', 'volva', 'vomer', 'vomit', 'voted', 'voter', 'votes', 'vouch', 'vowed', 'vowel', 'vower', 'vroom', 'vrouw', 'vrows', 'vuggs', 'vuggy', 'vughs', 'vulgo', 'vulva', 'vying', 'wacke', 'wacko', 'wacks', 'wacky', 'waddy', 'waded', 'wader', 'wades', 'wadis', 'wafer', 'waffs', 'wafts', 'waged', 'wager', 'wages', 'wagon', 'wahoo', 'waifs', 'wails', 'wains', 'wairs', 'waist', 'waits', 'waive', 'waked', 'waken', 'waker', 'wakes', 'waled', 'waler', 'wales', 'walks', 'walla', 'walls', 'wally', 'waltz', 'wames', 'wamus', 'wands', 'waned', 'wanes', 'waney', 'wanks', 'wanly', 'wants', 'wards', 'wared', 'wares', 'warks', 'warms', 'warns', 'warps', 'warts', 'warty', 'washy', 'wasps', 'waspy', 'waste', 'wasts', 'watap', 'watch', 'water', 'watts', 'waugh', 'wauks', 'wauls', 'waved', 'waver', 'waves', 'wavey', 'wawls', 'waxed', 'waxen', 'waxer', 'waxes', 'wazoo', 'weald', 'weals', 'weans', 'wears', 'weary', 'weave', 'webby', 'weber', 'wecht', 'wedel', 'wedge', 'wedgy', 'weeds', 'weedy', 'weeks', 'weens', 'weeny', 'weeps', 'weepy', 'weest', 'weets', 'wefts', 'weigh', 'weird', 'weirs', 'wekas', 'welch', 'welds', 'wells', 'welly', 'welsh', 'welts', 'wench', 'wends', 'wenny', 'wests', 'wetly', 'whack', 'whale', 'whamo', 'whams', 'whang', 'whaps', 'wharf', 'whats', 'whaup', 'wheal', 'wheat', 'wheel', 'wheen', 'wheep', 'whelk', 'whelm', 'whelp', 'whens', 'where', 'whets', 'whews', 'wheys', 'which', 'whids', 'whiff', 'whigs', 'while', 'whims', 'whine', 'whins', 'whiny', 'whips', 'whipt', 'whirl', 'whirr', 'whirs', 'whish', 'whisk', 'whist', 'white', 'whits', 'whity', 'whizz', 'whole', 'whomp', 'whoof', 'whoop', 'whops', 'whore', 'whorl', 'whort', 'whose', 'whoso', 'whump', 'whups', 'wicca', 'wicks', 'widdy', 'widen', 'wider', 'wides', 'widow', 'width', 'wield', 'wifed', 'wifes', 'wifey', 'wifty', 'wigan', 'wiggy', 'wight', 'wilco', 'wilds', 'wiled', 'wiles', 'wills', 'willy', 'wilts', 'wimps', 'wimpy', 'wince', 'winch', 'winds', 'windy', 'wined', 'wines', 'winey', 'wings', 'wingy', 'winks', 'winos', 'winze', 'wiped', 'wiper', 'wipes', 'wired', 'wirer', 'wires', 'wirra', 'wised', 'wiser', 'wises', 'wisha', 'wisps', 'wispy', 'wists', 'witan', 'witch', 'wited', 'wites', 'withe', 'withy', 'witty', 'wived', 'wiver', 'wives', 'wizen', 'wizes', 'woads', 'woald', 'wodge', 'woful', 'woken', 'wolds', 'wolfs', 'woman', 'wombs', 'womby', 'women', 'womyn', 'wonks', 'wonky', 'wonts', 'woods', 'woody', 'wooed', 'wooer', 'woofs', 'wools', 'wooly', 'woops', 'woosh', 'woozy', 'words', 'wordy', 'works', 'world', 'worms', 'wormy', 'worry', 'worse', 'worst', 'worth', 'worts', 'would', 'wound', 'woven', 'wowed', 'wrack', 'wrang', 'wraps', 'wrapt', 'wrath', 'wreak', 'wreck', 'wrens', 'wrest', 'wrick', 'wried', 'wrier', 'wries', 'wring', 'wrist', 'write', 'writs', 'wrong', 'wrote', 'wroth', 'wrung', 'wryer', 'wryly', 'wurst', 'wushu', 'wussy', 'wyled', 'wyles', 'wynds', 'wynns', 'wyted', 'wytes', 'xebec', 'xenia', 'xenic', 'xenon', 'xeric', 'xerox', 'xerus', 'xylan', 'xylem', 'xylol', 'xylyl', 'xysti', 'xysts', 'yabby', 'yacht', 'yacks', 'yaffs', 'yager', 'yagis', 'yahoo', 'yaird', 'yamen', 'yamun', 'yangs', 'yanks', 'yapok', 'yapon', 'yards', 'yarer', 'yarns', 'yauds', 'yauld', 'yaups', 'yawed', 'yawey', 'yawls', 'yawns', 'yawps', 'yclad', 'yeahs', 'yeans', 'yearn', 'years', 'yeast', 'yecch', 'yechs', 'yechy', 'yeggs', 'yelks', 'yells', 'yelps', 'yenta', 'yente', 'yerba', 'yerks', 'yeses', 'yetis', 'yetts', 'yeuks', 'yeuky', 'yield', 'yikes', 'yills', 'yince', 'yipes', 'yirds', 'yirrs', 'yirth', 'ylems', 'yobbo', 'yocks', 'yodel', 'yodhs', 'yodle', 'yogas', 'yogee', 'yoghs', 'yogic', 'yogin', 'yogis', 'yoked', 'yokel', 'yokes', 'yolks', 'yolky', 'yomim', 'yonic', 'yonis', 'yores', 'young', 'yourn', 'yours', 'youse', 'youth', 'yowed', 'yowes', 'yowie', 'yowls', 'yuans', 'yucas', 'yucca', 'yucch', 'yucks', 'yucky', 'yugas', 'yukky', 'yulan', 'yules', 'yummy', 'yupon', 'yuppy', 'yurta', 'yurts', 'zaire', 'zamia', 'zanza', 'zappy', 'zarfs', 'zaxes', 'zayin', 'zazen', 'zeals', 'zebec', 'zebra', 'zebus', 'zeins', 'zerks', 'zeros', 'zests', 'zesty', 'zetas', 'zibet', 'zilch', 'zills', 'zincs', 'zincy', 'zineb', 'zines', 'zings', 'zingy', 'zinky', 'zippy', 'ziram', 'zitis', 'zizit', 'zlote', 'zloty', 'zoeae', 'zoeal', 'zoeas', 'zombi', 'zonae', 'zonal', 'zoned', 'zoner', 'zones', 'zonks', 'zooey', 'zooid', 'zooks', 'zooms', 'zoons', 'zooty', 'zoril', 'zoris', 'zouks', 'zowie', 'zuzim', 'zymes']);
var $author$project$Nineagram$solutions = F3(
	function (nineagram, guesses, guess) {
		return A2(
			$elm$core$List$filter,
			A2($author$project$Nineagram$isSolution, nineagram, guess),
			guesses);
	});
var $elm$core$Result$toMaybe = function (result) {
	if (!result.$) {
		var v = result.a;
		return $elm$core$Maybe$Just(v);
	} else {
		return $elm$core$Maybe$Nothing;
	}
};
var $author$project$Main$solve = F2(
	function (tagger, puzzle) {
		return A2(
			$elm$core$Task$perform,
			tagger,
			A2(
				$elm$core$Task$andThen,
				function (validGuesses) {
					return A3(
						$author$project$Main$batchedFilterMap,
						200,
						function (guess) {
							var _v0 = A3($author$project$Nineagram$solutions, puzzle, validGuesses, guess);
							if (!_v0.b) {
								return $elm$core$Maybe$Nothing;
							} else {
								var solutions = _v0;
								return $elm$core$Maybe$Just(
									A2($author$project$Main$ComputerSolution, guess, solutions));
							}
						},
						validGuesses);
				},
				A2(
					$elm$core$Task$andThen,
					A2(
						$author$project$Main$batchedFilter,
						200,
						function (guess) {
							return _Utils_eq(
								A2($author$project$Nineagram$validateGuess, puzzle, guess),
								$elm$core$Result$Ok(0));
						}),
					A3(
						$author$project$Main$batchedFilterMap,
						200,
						A2($elm$core$Basics$composeL, $elm$core$Result$toMaybe, $author$project$Nineagram$Guess$fromString),
						$author$project$Cheat$cheatWords))));
	});
var $elm$url$Url$Builder$QueryParameter = F2(
	function (a, b) {
		return {$: 0, a: a, b: b};
	});
var $elm$url$Url$percentEncode = _Url_percentEncode;
var $elm$url$Url$Builder$string = F2(
	function (key, value) {
		return A2(
			$elm$url$Url$Builder$QueryParameter,
			$elm$url$Url$percentEncode(key),
			$elm$url$Url$percentEncode(value));
	});
var $elm$core$String$toUpper = _String_toUpper;
var $author$project$Main$startSolving = F2(
	function (key, puzzle) {
		var newModel = _Utils_update(
			$author$project$Main$initState,
			{
				v: $elm$core$String$toUpper(
					$elm$core$String$fromList(
						$author$project$Nineagram$getLetters(puzzle))),
				n: $elm$core$Maybe$Just(puzzle)
			});
		return _Utils_Tuple2(
			newModel,
			$elm$core$Platform$Cmd$batch(
				_List_fromArray(
					[
						$author$project$Main$focus('guess'),
						A2($author$project$Main$solve, $author$project$Main$ComputerSolved, puzzle),
						A2(
						$elm$core$Basics$composeL,
						$elm$browser$Browser$Navigation$pushUrl(key),
						$elm$url$Url$Builder$relative(_List_Nil))(
						_List_fromArray(
							[
								A2($elm$url$Url$Builder$string, 'letters', newModel.v)
							]))
					])));
	});
var $author$project$Main$updateState = F4(
	function (_v0, key, msg, model) {
		switch (msg.$) {
			case 0:
				return _Utils_Tuple2(model, $elm$core$Platform$Cmd$none);
			case 1:
				var letters = msg.a;
				return _Utils_Tuple2(
					_Utils_update(
						model,
						{
							v: $elm$core$String$toUpper(letters)
						}),
					$elm$core$Platform$Cmd$none);
			case 2:
				var letters = msg.a;
				var _v2 = $author$project$Nineagram$fromString(letters);
				if (!_v2.$) {
					var puzzle = _v2.a;
					return A2($author$project$Main$startSolving, key, puzzle);
				} else {
					var puzzleCreationProblems = _v2.a;
					return _Utils_Tuple2(
						_Utils_update(
							model,
							{O: puzzleCreationProblems}),
						$elm$core$Platform$Cmd$none);
				}
			case 4:
				var typing = msg.a;
				return _Utils_Tuple2(
					_Utils_update(
						model,
						{
							B: $elm$core$String$toUpper(typing)
						}),
					$elm$core$Platform$Cmd$none);
			case 5:
				var puzzle = msg.a;
				var typed = msg.b;
				var _v3 = $author$project$Nineagram$Guess$fromString(
					$elm$core$String$trim(typed));
				if (!_v3.$) {
					var newGuess = _v3.a;
					return _Utils_Tuple2(
						A3(
							$author$project$Main$addAttempt,
							_Utils_update(
								model,
								{F: _List_Nil}),
							puzzle,
							newGuess),
						$elm$core$Platform$Cmd$none);
				} else {
					var guessProblems = _v3.a;
					return _Utils_Tuple2(
						_Utils_update(
							model,
							{A: _List_Nil, F: guessProblems}),
						$elm$core$Platform$Cmd$none);
				}
			case 6:
				var attempt = msg.a;
				return _Utils_Tuple2(
					_Utils_update(
						model,
						{j: attempt}),
					$elm$core$Platform$Cmd$none);
			case 8:
				var attempt = msg.a;
				return _Utils_Tuple2(
					A2($author$project$Main$deleteAttempt, attempt, model),
					$elm$core$Platform$Cmd$none);
			case 9:
				return _Utils_Tuple2(
					_Utils_update(
						model,
						{L: true}),
					$elm$core$Platform$Cmd$none);
			case 7:
				return _Utils_Tuple2(
					_Utils_update(
						model,
						{j: model.N}),
					$elm$core$Platform$Cmd$none);
			case 3:
				return _Utils_Tuple2(
					$author$project$Main$initState,
					$author$project$Main$focus('puzzleLetters'));
			case 10:
				var solutions = msg.a;
				return _Utils_Tuple2(
					_Utils_update(
						model,
						{
							M: $elm$core$Maybe$Just(solutions)
						}),
					$elm$core$Platform$Cmd$none);
			default:
				return _Utils_Tuple2(model, $elm$core$Platform$Cmd$none);
		}
	});
var $author$project$Main$update = F2(
	function (msg, model) {
		if (!model.$) {
			return _Utils_Tuple2(model, $elm$core$Platform$Cmd$none);
		} else {
			var defaultPuzzle = model.a;
			var key = model.b;
			var state = model.c;
			var _v1 = A4($author$project$Main$updateState, defaultPuzzle, key, msg, state);
			var newState = _v1.a;
			var commands = _v1.b;
			return _Utils_Tuple2(
				A3($author$project$Main$DefaultPuzzleLoaded, defaultPuzzle, key, newState),
				commands);
		}
	});
var $elm$virtual_dom$VirtualDom$text = _VirtualDom_text;
var $elm$html$Html$text = $elm$virtual_dom$VirtualDom$text;
var $elm$json$Json$Encode$string = _Json_wrap;
var $elm$html$Html$Attributes$stringProperty = F2(
	function (key, string) {
		return A2(
			_VirtualDom_property,
			key,
			$elm$json$Json$Encode$string(string));
	});
var $elm$html$Html$Attributes$class = $elm$html$Html$Attributes$stringProperty('className');
var $elm$html$Html$div = _VirtualDom_node('div');
var $elm$html$Html$h1 = _VirtualDom_node('h1');
var $author$project$Main$SelectDefaultAttempt = {$: 7};
var $elm$json$Json$Decode$andThen = _Json_andThen;
var $elm$json$Json$Decode$fail = _Json_fail;
var $elm$json$Json$Decode$field = _Json_decodeField;
var $elm$json$Json$Decode$int = _Json_decodeInt;
var $elm$html$Html$Events$keyCode = A2($elm$json$Json$Decode$field, 'keyCode', $elm$json$Json$Decode$int);
var $elm$virtual_dom$VirtualDom$Normal = function (a) {
	return {$: 0, a: a};
};
var $elm$virtual_dom$VirtualDom$on = _VirtualDom_on;
var $elm$html$Html$Events$on = F2(
	function (event, decoder) {
		return A2(
			$elm$virtual_dom$VirtualDom$on,
			event,
			$elm$virtual_dom$VirtualDom$Normal(decoder));
	});
var $author$project$Main$keyHandlers = function (model) {
	var _v0 = model.n;
	if (!_v0.$) {
		return _List_fromArray(
			[
				A2(
				$elm$html$Html$Events$on,
				'keydown',
				A2(
					$elm$json$Json$Decode$andThen,
					function (keyCode) {
						return (keyCode === 27) ? $elm$json$Json$Decode$succeed($author$project$Main$SelectDefaultAttempt) : $elm$json$Json$Decode$fail('other key');
					},
					$elm$html$Html$Events$keyCode))
			]);
	} else {
		return _List_Nil;
	}
};
var $author$project$Main$EnableCheat = {$: 9};
var $elm$html$Html$br = _VirtualDom_node('br');
var $elm$html$Html$button = _VirtualDom_node('button');
var $elm$json$Json$Encode$bool = _Json_wrap;
var $elm$html$Html$Attributes$boolProperty = F2(
	function (key, bool) {
		return A2(
			_VirtualDom_property,
			key,
			$elm$json$Json$Encode$bool(bool));
	});
var $elm$html$Html$Attributes$disabled = $elm$html$Html$Attributes$boolProperty('disabled');
var $elm$html$Html$Events$onClick = function (msg) {
	return A2(
		$elm$html$Html$Events$on,
		'click',
		$elm$json$Json$Decode$succeed(msg));
};
var $elm$html$Html$Attributes$type_ = $elm$html$Html$Attributes$stringProperty('type');
var $elm$html$Html$li = _VirtualDom_node('li');
var $elm$core$List$singleton = function (value) {
	return _List_fromArray(
		[value]);
};
var $elm$html$Html$ul = _VirtualDom_node('ul');
var $elm$core$String$concat = function (strings) {
	return A2($elm$core$String$join, '', strings);
};
var $author$project$Main$viewSolution = function (_v0) {
	var first = _v0.a;
	var matches = _v0.b;
	return A2($elm$core$Basics$composeL, $elm$html$Html$text, $elm$core$String$concat)(
		_List_fromArray(
			[
				$author$project$Nineagram$Guess$toString(first),
				' ',
				'(',
				A2(
				$elm$core$String$join,
				', ',
				A2($elm$core$List$map, $author$project$Nineagram$Guess$toString, matches)),
				')'
			]));
};
var $author$project$Main$viewSolutions = A2(
	$elm$core$Basics$composeL,
	$elm$html$Html$ul(_List_Nil),
	$elm$core$List$map(
		A2(
			$elm$core$Basics$composeL,
			A2(
				$elm$core$Basics$composeL,
				$elm$html$Html$li(_List_Nil),
				$elm$core$List$singleton),
			$author$project$Main$viewSolution)));
var $author$project$Main$viewAllSolutions = function (model) {
	var viewNoPuzzleYet = A2(
		$elm$html$Html$div,
		_List_fromArray(
			[
				$elm$html$Html$Attributes$class('cheat')
			]),
		_List_fromArray(
			[
				$elm$html$Html$text('The computer will try to solve your puzzle. '),
				A2($elm$html$Html$br, _List_Nil, _List_Nil),
				A2(
				$elm$html$Html$button,
				_List_fromArray(
					[
						$elm$html$Html$Attributes$type_('button'),
						$elm$html$Html$Attributes$disabled(true)
					]),
				_List_fromArray(
					[
						$elm$html$Html$text('Show me!')
					]))
			]));
	var viewComputerStillSolving = A2(
		$elm$html$Html$div,
		_List_fromArray(
			[
				$elm$html$Html$Attributes$class('cheat')
			]),
		_List_fromArray(
			[
				$elm$html$Html$text('The computer is solving... '),
				A2($elm$html$Html$br, _List_Nil, _List_Nil),
				A2(
				$elm$html$Html$button,
				_List_fromArray(
					[
						$elm$html$Html$Attributes$type_('button'),
						$elm$html$Html$Attributes$disabled(true)
					]),
				_List_fromArray(
					[
						$elm$html$Html$text('Show me!')
					]))
			]));
	var viewComputerSolved = function (computerSolutions) {
		return A2(
			$elm$html$Html$div,
			_List_fromArray(
				[
					$elm$html$Html$Attributes$class('cheat')
				]),
			_List_fromArray(
				[
					$elm$html$Html$text(
					'The computer found ' + (A2($elm$core$Basics$composeL, $elm$core$String$fromInt, $elm$core$List$length)(computerSolutions) + ' solutions. ')),
					A2($elm$html$Html$br, _List_Nil, _List_Nil),
					(!model.L) ? A2(
					$elm$html$Html$button,
					_List_fromArray(
						[
							$elm$html$Html$Attributes$type_('button'),
							$elm$html$Html$Events$onClick($author$project$Main$EnableCheat)
						]),
					_List_fromArray(
						[
							$elm$html$Html$text('Show me!')
						])) : $author$project$Main$viewSolutions(computerSolutions)
				]));
	};
	var _v0 = _Utils_Tuple2(model.n, model.M);
	if (_v0.a.$ === 1) {
		var _v1 = _v0.a;
		return viewNoPuzzleYet;
	} else {
		if (_v0.b.$ === 1) {
			var _v2 = _v0.b;
			return viewComputerStillSolving;
		} else {
			var computerSolutions = _v0.b.a;
			return viewComputerSolved(computerSolutions);
		}
	}
};
var $author$project$Main$DeleteAttempt = function (a) {
	return {$: 8, a: a};
};
var $author$project$Main$SelectAttempt = function (a) {
	return {$: 6, a: a};
};
var $elm$html$Html$b = _VirtualDom_node('b');
var $elm$core$Basics$composeR = F3(
	function (f, g, x) {
		return g(
			f(x));
	});
var $elm$html$Html$i = _VirtualDom_node('i');
var $elm$core$Result$map = F2(
	function (func, ra) {
		if (!ra.$) {
			var a = ra.a;
			return $elm$core$Result$Ok(
				func(a));
		} else {
			var e = ra.a;
			return $elm$core$Result$Err(e);
		}
	});
var $elm$virtual_dom$VirtualDom$MayStopPropagation = function (a) {
	return {$: 1, a: a};
};
var $elm$html$Html$Events$stopPropagationOn = F2(
	function (event, decoder) {
		return A2(
			$elm$virtual_dom$VirtualDom$on,
			event,
			$elm$virtual_dom$VirtualDom$MayStopPropagation(decoder));
	});
var $author$project$Main$alwaysStopPropagationOn = F2(
	function (event, msg) {
		return A2(
			$elm$html$Html$Events$stopPropagationOn,
			event,
			$elm$json$Json$Decode$succeed(
				_Utils_Tuple2(msg, true)));
	});
var $author$project$Main$onClickStopPropagation = $author$project$Main$alwaysStopPropagationOn('click');
var $elm$core$Basics$negate = function (n) {
	return -n;
};
var $elm$core$String$right = F2(
	function (n, string) {
		return (n < 1) ? '' : A3(
			$elm$core$String$slice,
			-n,
			$elm$core$String$length(string),
			string);
	});
var $elm$core$Result$withDefault = F2(
	function (def, result) {
		if (!result.$) {
			var a = result.a;
			return a;
		} else {
			return def;
		}
	});
var $author$project$Main$viewAttempt = F2(
	function (puzzle, attempt) {
		switch (attempt.$) {
			case 0:
				return A2(
					$elm$html$Html$div,
					_List_fromArray(
						[
							$elm$html$Html$Attributes$class('attempt'),
							$elm$html$Html$Attributes$class('noguesses'),
							$elm$html$Html$Events$onClick(
							$author$project$Main$SelectAttempt(attempt))
						]),
					_List_fromArray(
						[
							A2(
							$elm$html$Html$i,
							_List_Nil,
							_List_fromArray(
								[
									$elm$html$Html$text('New word')
								]))
						]));
			case 1:
				var guess = attempt.a;
				var remaining = A2(
					$elm$core$Result$withDefault,
					'',
					A3(
						$elm$core$Basics$composeR,
						$author$project$Nineagram$remainingLetters(puzzle),
						$elm$core$Result$map($elm$core$String$fromList),
						guess));
				var middleLetter = A2(
					$elm$core$Basics$composeR,
					$author$project$Nineagram$Guess$toString,
					A2(
						$elm$core$Basics$composeR,
						$elm$core$String$left(3),
						$elm$core$String$right(1)))(guess);
				return A2(
					$elm$html$Html$div,
					_List_fromArray(
						[
							$elm$html$Html$Attributes$class('attempt'),
							$elm$html$Html$Attributes$class('oneguess'),
							$elm$html$Html$Events$onClick(
							$author$project$Main$SelectAttempt(attempt))
						]),
					_List_fromArray(
						[
							A2(
							$elm$core$Basics$composeL,
							A2(
								$elm$core$Basics$composeL,
								A2(
									$elm$core$Basics$composeL,
									$elm$html$Html$b(_List_Nil),
									$elm$core$List$singleton),
								$elm$html$Html$text),
							$elm$core$String$toUpper)(
							$author$project$Nineagram$Guess$toString(guess)),
							$elm$html$Html$text(' - '),
							A2($elm$core$Basics$composeL, $elm$html$Html$text, $elm$core$String$toUpper)(
							A2($elm$core$String$left, 2, remaining)),
							A2(
							$elm$core$Basics$composeL,
							A2(
								$elm$core$Basics$composeL,
								A2(
									$elm$core$Basics$composeL,
									$elm$html$Html$b(_List_Nil),
									$elm$core$List$singleton),
								$elm$html$Html$text),
							$elm$core$String$toUpper)(middleLetter),
							A2($elm$core$Basics$composeL, $elm$html$Html$text, $elm$core$String$toUpper)(
							A2($elm$core$String$right, 2, remaining)),
							A2(
							$elm$html$Html$button,
							_List_fromArray(
								[
									$author$project$Main$onClickStopPropagation(
									$author$project$Main$DeleteAttempt(attempt))
								]),
							_List_fromArray(
								[
									$elm$html$Html$text('x')
								]))
						]));
			default:
				var firstGuess = attempt.a;
				var secondGuess = attempt.b;
				return A2(
					$elm$html$Html$div,
					_List_fromArray(
						[
							$elm$html$Html$Attributes$class('attempt'),
							$elm$html$Html$Attributes$class('twoguesses'),
							$elm$html$Html$Events$onClick(
							$author$project$Main$SelectAttempt(attempt))
						]),
					_List_fromArray(
						[
							A2(
							$elm$core$Basics$composeL,
							A2(
								$elm$core$Basics$composeL,
								A2(
									$elm$core$Basics$composeL,
									$elm$html$Html$b(_List_Nil),
									$elm$core$List$singleton),
								$elm$html$Html$text),
							$elm$core$String$toUpper)(
							$author$project$Nineagram$Guess$toString(firstGuess)),
							$elm$html$Html$text(' - '),
							A2(
							$elm$core$Basics$composeL,
							A2(
								$elm$core$Basics$composeL,
								A2(
									$elm$core$Basics$composeL,
									$elm$html$Html$b(_List_Nil),
									$elm$core$List$singleton),
								$elm$html$Html$text),
							$elm$core$String$toUpper)(
							$author$project$Nineagram$Guess$toString(secondGuess)),
							A2(
							$elm$html$Html$button,
							_List_fromArray(
								[
									$author$project$Main$onClickStopPropagation(
									$author$project$Main$DeleteAttempt(attempt))
								]),
							_List_fromArray(
								[
									$elm$html$Html$text('x')
								]))
						]));
		}
	});
var $author$project$Main$viewAttempts = F2(
	function (model, puzzle) {
		return A2(
			$elm$html$Html$div,
			_List_fromArray(
				[
					$elm$html$Html$Attributes$class('attempts')
				]),
			A2(
				$elm$core$List$map,
				$author$project$Main$viewAttempt(puzzle),
				model.t));
	});
var $author$project$Main$SubmitAttempt = F2(
	function (a, b) {
		return {$: 5, a: a, b: b};
	});
var $author$project$Main$TypingGuess = function (a) {
	return {$: 4, a: a};
};
var $elm$html$Html$Attributes$autocomplete = function (bool) {
	return A2(
		$elm$html$Html$Attributes$stringProperty,
		'autocomplete',
		bool ? 'on' : 'off');
};
var $elm$html$Html$Attributes$for = $elm$html$Html$Attributes$stringProperty('htmlFor');
var $elm$html$Html$form = _VirtualDom_node('form');
var $elm$html$Html$Attributes$id = $elm$html$Html$Attributes$stringProperty('id');
var $elm$html$Html$input = _VirtualDom_node('input');
var $elm$html$Html$label = _VirtualDom_node('label');
var $elm$html$Html$Attributes$name = $elm$html$Html$Attributes$stringProperty('name');
var $elm$html$Html$Events$alwaysStop = function (x) {
	return _Utils_Tuple2(x, true);
};
var $elm$json$Json$Decode$at = F2(
	function (fields, decoder) {
		return A3($elm$core$List$foldr, $elm$json$Json$Decode$field, decoder, fields);
	});
var $elm$json$Json$Decode$string = _Json_decodeString;
var $elm$html$Html$Events$targetValue = A2(
	$elm$json$Json$Decode$at,
	_List_fromArray(
		['target', 'value']),
	$elm$json$Json$Decode$string);
var $elm$html$Html$Events$onInput = function (tagger) {
	return A2(
		$elm$html$Html$Events$stopPropagationOn,
		'input',
		A2(
			$elm$json$Json$Decode$map,
			$elm$html$Html$Events$alwaysStop,
			A2($elm$json$Json$Decode$map, tagger, $elm$html$Html$Events$targetValue)));
};
var $elm$html$Html$Events$alwaysPreventDefault = function (msg) {
	return _Utils_Tuple2(msg, true);
};
var $elm$virtual_dom$VirtualDom$MayPreventDefault = function (a) {
	return {$: 2, a: a};
};
var $elm$html$Html$Events$preventDefaultOn = F2(
	function (event, decoder) {
		return A2(
			$elm$virtual_dom$VirtualDom$on,
			event,
			$elm$virtual_dom$VirtualDom$MayPreventDefault(decoder));
	});
var $elm$html$Html$Events$onSubmit = function (msg) {
	return A2(
		$elm$html$Html$Events$preventDefaultOn,
		'submit',
		A2(
			$elm$json$Json$Decode$map,
			$elm$html$Html$Events$alwaysPreventDefault,
			$elm$json$Json$Decode$succeed(msg)));
};
var $elm$html$Html$Attributes$spellcheck = $elm$html$Html$Attributes$boolProperty('spellcheck');
var $elm$html$Html$Attributes$value = $elm$html$Html$Attributes$stringProperty('value');
var $elm$core$Maybe$andThen = F2(
	function (callback, maybeValue) {
		if (!maybeValue.$) {
			var value = maybeValue.a;
			return callback(value);
		} else {
			return $elm$core$Maybe$Nothing;
		}
	});
var $elm$core$String$cons = _String_cons;
var $elm$core$String$fromChar = function (_char) {
	return A2($elm$core$String$cons, _char, '');
};
var $author$project$Main$viewGuessForPuzzleProblem = function (problem) {
	var letter = problem;
	return A2(
		$elm$core$Basics$composeL,
		A2($elm$core$Basics$composeL, $elm$core$Maybe$Just, $elm$html$Html$text),
		$elm$core$String$concat)(
		_List_fromArray(
			[
				'There aren\'t enough ',
				'\'',
				A2($elm$core$Basics$composeL, $elm$core$String$toUpper, $elm$core$String$fromChar)(letter),
				'\'',
				' for that word.'
			]));
};
var $author$project$Main$viewGuessForPuzzleProblems = function (problems) {
	return A2(
		$elm$html$Html$div,
		_List_fromArray(
			[
				$elm$html$Html$Attributes$class('guessForPuzzleProblem')
			]),
		A2(
			$elm$core$List$filterMap,
			A2(
				$elm$core$Basics$composeR,
				$author$project$Main$viewGuessForPuzzleProblem,
				$elm$core$Maybe$andThen(
					A2(
						$elm$core$Basics$composeL,
						A2(
							$elm$core$Basics$composeL,
							$elm$core$Maybe$Just,
							$elm$html$Html$div(_List_Nil)),
						$elm$core$List$singleton))),
			problems));
};
var $author$project$Main$viewGuessProblems = function (problems) {
	var displayProblem = function (problem) {
		if (!problem.$) {
			if (!problem.a) {
				return $elm$core$Maybe$Nothing;
			} else {
				var n = problem.a;
				return $elm$core$Maybe$Just(
					'That\'s only ' + ($elm$core$String$fromInt(n) + ' letters. Your words should have exactly five letters.'));
			}
		} else {
			var n = problem.a;
			return $elm$core$Maybe$Just(
				'That\'s ' + ($elm$core$String$fromInt(n) + ' letters. Your words should have exactly five letters.'));
		}
	};
	return A2(
		$elm$html$Html$div,
		_List_fromArray(
			[
				$elm$html$Html$Attributes$class('guessProblem')
			]),
		A2(
			$elm$core$List$map,
			function (message) {
				return A2(
					$elm$html$Html$div,
					_List_Nil,
					_List_fromArray(
						[
							$elm$html$Html$text(message)
						]));
			},
			A2($elm$core$List$filterMap, displayProblem, problems)));
};
var $author$project$Main$viewGuessing = F2(
	function (state, puzzle) {
		return A2(
			$elm$html$Html$form,
			_List_fromArray(
				[
					$elm$html$Html$Attributes$class('guessForm'),
					$elm$html$Html$Events$onSubmit(
					A2($author$project$Main$SubmitAttempt, puzzle, state.B))
				]),
			_List_fromArray(
				[
					A2(
					$elm$html$Html$label,
					_List_fromArray(
						[
							$elm$html$Html$Attributes$for('guess')
						]),
					_List_fromArray(
						[
							A2(
							$elm$html$Html$b,
							_List_Nil,
							_List_fromArray(
								[
									$elm$html$Html$text('Next Guess')
								]))
						])),
					A2($elm$html$Html$br, _List_Nil, _List_Nil),
					A2(
					$elm$html$Html$input,
					_List_fromArray(
						[
							$elm$html$Html$Attributes$id('guess'),
							$elm$html$Html$Attributes$name('guess'),
							$elm$html$Html$Attributes$class('lettersInput'),
							$elm$html$Html$Attributes$autocomplete(false),
							$elm$html$Html$Attributes$spellcheck(false),
							$elm$html$Html$Attributes$disabled(
							_Utils_eq(state.n, $elm$core$Maybe$Nothing)),
							$elm$html$Html$Attributes$value(state.B),
							$elm$html$Html$Events$onInput($author$project$Main$TypingGuess)
						]),
					_List_Nil),
					A2(
					$elm$html$Html$div,
					_List_fromArray(
						[
							$elm$html$Html$Attributes$class('guessProblems')
						]),
					_List_fromArray(
						[
							$author$project$Main$viewGuessProblems(state.F),
							$author$project$Main$viewGuessForPuzzleProblems(state.A)
						])),
					A2(
					$elm$html$Html$button,
					_List_Nil,
					_List_fromArray(
						[
							$elm$html$Html$text('Guess')
						]))
				]));
	});
var $elm$html$Html$Attributes$placeholder = $elm$html$Html$Attributes$stringProperty('placeholder');
var $author$project$Main$viewNineagramNoGuesses = function (puzzle) {
	var letter = function (n) {
		return $elm$core$String$toUpper(
			$elm$core$String$fromList(
				A2(
					$elm$core$List$drop,
					n - 1,
					A2(
						$elm$core$List$take,
						n,
						$author$project$Nineagram$getLetters(puzzle)))));
	};
	var guess = function (_v0) {
		return '';
	};
	return A2(
		$elm$html$Html$div,
		_List_fromArray(
			[
				$elm$html$Html$Attributes$class('nineagram')
			]),
		_List_fromArray(
			[
				A2(
				$elm$html$Html$div,
				_List_fromArray(
					[
						$elm$html$Html$Attributes$class('letterbox')
					]),
				_List_fromArray(
					[
						A2(
						$elm$html$Html$input,
						_List_fromArray(
							[
								$elm$html$Html$Attributes$type_('text'),
								$elm$html$Html$Attributes$class('letter'),
								$elm$html$Html$Attributes$placeholder(
								letter(1)),
								$elm$html$Html$Attributes$value(
								guess(1))
							]),
						_List_Nil)
					])),
				A2($elm$html$Html$br, _List_Nil, _List_Nil),
				A2(
				$elm$html$Html$div,
				_List_fromArray(
					[
						$elm$html$Html$Attributes$class('letterbox')
					]),
				_List_fromArray(
					[
						A2(
						$elm$html$Html$input,
						_List_fromArray(
							[
								$elm$html$Html$Attributes$type_('text'),
								$elm$html$Html$Attributes$class('letter'),
								$elm$html$Html$Attributes$placeholder(
								letter(2)),
								$elm$html$Html$Attributes$value(
								guess(2))
							]),
						_List_Nil)
					])),
				A2($elm$html$Html$br, _List_Nil, _List_Nil),
				A2(
				$elm$html$Html$div,
				_List_fromArray(
					[
						$elm$html$Html$Attributes$class('letterbox')
					]),
				_List_fromArray(
					[
						A2(
						$elm$html$Html$input,
						_List_fromArray(
							[
								$elm$html$Html$Attributes$type_('text'),
								$elm$html$Html$Attributes$class('letter'),
								$elm$html$Html$Attributes$placeholder(
								letter(6)),
								$elm$html$Html$Attributes$value(
								guess(6))
							]),
						_List_Nil)
					])),
				A2(
				$elm$html$Html$div,
				_List_fromArray(
					[
						$elm$html$Html$Attributes$class('letterbox')
					]),
				_List_fromArray(
					[
						A2(
						$elm$html$Html$input,
						_List_fromArray(
							[
								$elm$html$Html$Attributes$type_('text'),
								$elm$html$Html$Attributes$class('letter'),
								$elm$html$Html$Attributes$placeholder(
								letter(7)),
								$elm$html$Html$Attributes$value(
								guess(7))
							]),
						_List_Nil)
					])),
				A2(
				$elm$html$Html$div,
				_List_fromArray(
					[
						$elm$html$Html$Attributes$class('letterbox')
					]),
				_List_fromArray(
					[
						A2(
						$elm$html$Html$input,
						_List_fromArray(
							[
								$elm$html$Html$Attributes$type_('text'),
								$elm$html$Html$Attributes$class('letter'),
								$elm$html$Html$Attributes$placeholder(
								letter(3)),
								$elm$html$Html$Attributes$value(
								guess(3))
							]),
						_List_Nil)
					])),
				A2(
				$elm$html$Html$div,
				_List_fromArray(
					[
						$elm$html$Html$Attributes$class('letterbox')
					]),
				_List_fromArray(
					[
						A2(
						$elm$html$Html$input,
						_List_fromArray(
							[
								$elm$html$Html$Attributes$type_('text'),
								$elm$html$Html$Attributes$class('letter'),
								$elm$html$Html$Attributes$placeholder(
								letter(8)),
								$elm$html$Html$Attributes$value(
								guess(8))
							]),
						_List_Nil)
					])),
				A2(
				$elm$html$Html$div,
				_List_fromArray(
					[
						$elm$html$Html$Attributes$class('letterbox')
					]),
				_List_fromArray(
					[
						A2(
						$elm$html$Html$input,
						_List_fromArray(
							[
								$elm$html$Html$Attributes$type_('text'),
								$elm$html$Html$Attributes$class('letter'),
								$elm$html$Html$Attributes$placeholder(
								letter(9)),
								$elm$html$Html$Attributes$value(
								guess(9))
							]),
						_List_Nil)
					])),
				A2($elm$html$Html$br, _List_Nil, _List_Nil),
				A2(
				$elm$html$Html$div,
				_List_fromArray(
					[
						$elm$html$Html$Attributes$class('letterbox')
					]),
				_List_fromArray(
					[
						A2(
						$elm$html$Html$input,
						_List_fromArray(
							[
								$elm$html$Html$Attributes$type_('text'),
								$elm$html$Html$Attributes$class('letter'),
								$elm$html$Html$Attributes$placeholder(
								letter(4)),
								$elm$html$Html$Attributes$value(
								guess(4))
							]),
						_List_Nil)
					])),
				A2($elm$html$Html$br, _List_Nil, _List_Nil),
				A2(
				$elm$html$Html$div,
				_List_fromArray(
					[
						$elm$html$Html$Attributes$class('letterbox')
					]),
				_List_fromArray(
					[
						A2(
						$elm$html$Html$input,
						_List_fromArray(
							[
								$elm$html$Html$Attributes$type_('text'),
								$elm$html$Html$Attributes$class('letter'),
								$elm$html$Html$Attributes$placeholder(
								letter(5)),
								$elm$html$Html$Attributes$value(
								guess(5))
							]),
						_List_Nil)
					]))
			]));
};
var $elm$core$List$repeatHelp = F3(
	function (result, n, value) {
		repeatHelp:
		while (true) {
			if (n <= 0) {
				return result;
			} else {
				var $temp$result = A2($elm$core$List$cons, value, result),
					$temp$n = n - 1,
					$temp$value = value;
				result = $temp$result;
				n = $temp$n;
				value = $temp$value;
				continue repeatHelp;
			}
		}
	});
var $elm$core$List$repeat = F2(
	function (n, value) {
		return A3($elm$core$List$repeatHelp, _List_Nil, n, value);
	});
var $author$project$Main$viewNineagramOneGuess = F2(
	function (puzzle, guess) {
		var remain = A2(
			$elm$core$Result$withDefault,
			_List_Nil,
			A2($author$project$Nineagram$remainingLetters, puzzle, guess));
		var letter = function (n) {
			return $elm$core$String$toUpper(
				$elm$core$String$fromList(
					A2(
						$elm$core$List$drop,
						n - 1,
						A2(
							$elm$core$List$take,
							n,
							_Utils_ap(
								A2(
									$elm$core$List$repeat,
									$elm$core$String$length(
										$author$project$Nineagram$Guess$toString(guess)),
									' '),
								remain)))));
		};
		var guessLetter = function (n) {
			return $elm$core$String$toUpper(
				$elm$core$String$fromList(
					A2(
						$elm$core$List$drop,
						n - 1,
						A2(
							$elm$core$List$take,
							n,
							$elm$core$String$toList(
								$author$project$Nineagram$Guess$toString(guess))))));
		};
		return A2(
			$elm$html$Html$div,
			_List_fromArray(
				[
					$elm$html$Html$Attributes$class('nineagram')
				]),
			_List_fromArray(
				[
					A2(
					$elm$html$Html$div,
					_List_fromArray(
						[
							$elm$html$Html$Attributes$class('letterbox')
						]),
					_List_fromArray(
						[
							A2(
							$elm$html$Html$input,
							_List_fromArray(
								[
									$elm$html$Html$Attributes$type_('text'),
									$elm$html$Html$Attributes$class('letter'),
									$elm$html$Html$Attributes$placeholder(
									letter(1)),
									$elm$html$Html$Attributes$value(
									guessLetter(1))
								]),
							_List_Nil)
						])),
					A2($elm$html$Html$br, _List_Nil, _List_Nil),
					A2(
					$elm$html$Html$div,
					_List_fromArray(
						[
							$elm$html$Html$Attributes$class('letterbox')
						]),
					_List_fromArray(
						[
							A2(
							$elm$html$Html$input,
							_List_fromArray(
								[
									$elm$html$Html$Attributes$type_('text'),
									$elm$html$Html$Attributes$class('letter'),
									$elm$html$Html$Attributes$placeholder(
									letter(2)),
									$elm$html$Html$Attributes$value(
									guessLetter(2))
								]),
							_List_Nil)
						])),
					A2($elm$html$Html$br, _List_Nil, _List_Nil),
					A2(
					$elm$html$Html$div,
					_List_fromArray(
						[
							$elm$html$Html$Attributes$class('letterbox')
						]),
					_List_fromArray(
						[
							A2(
							$elm$html$Html$input,
							_List_fromArray(
								[
									$elm$html$Html$Attributes$type_('text'),
									$elm$html$Html$Attributes$class('letter'),
									$elm$html$Html$Attributes$placeholder(
									letter(6)),
									$elm$html$Html$Attributes$value(
									guessLetter(6))
								]),
							_List_Nil)
						])),
					A2(
					$elm$html$Html$div,
					_List_fromArray(
						[
							$elm$html$Html$Attributes$class('letterbox')
						]),
					_List_fromArray(
						[
							A2(
							$elm$html$Html$input,
							_List_fromArray(
								[
									$elm$html$Html$Attributes$type_('text'),
									$elm$html$Html$Attributes$class('letter'),
									$elm$html$Html$Attributes$placeholder(
									letter(7)),
									$elm$html$Html$Attributes$value(
									guessLetter(7))
								]),
							_List_Nil)
						])),
					A2(
					$elm$html$Html$div,
					_List_fromArray(
						[
							$elm$html$Html$Attributes$class('letterbox')
						]),
					_List_fromArray(
						[
							A2(
							$elm$html$Html$input,
							_List_fromArray(
								[
									$elm$html$Html$Attributes$type_('text'),
									$elm$html$Html$Attributes$class('letter'),
									$elm$html$Html$Attributes$placeholder(
									letter(3)),
									$elm$html$Html$Attributes$value(
									guessLetter(3))
								]),
							_List_Nil)
						])),
					A2(
					$elm$html$Html$div,
					_List_fromArray(
						[
							$elm$html$Html$Attributes$class('letterbox')
						]),
					_List_fromArray(
						[
							A2(
							$elm$html$Html$input,
							_List_fromArray(
								[
									$elm$html$Html$Attributes$type_('text'),
									$elm$html$Html$Attributes$class('letter'),
									$elm$html$Html$Attributes$placeholder(
									letter(8)),
									$elm$html$Html$Attributes$value(
									guessLetter(8))
								]),
							_List_Nil)
						])),
					A2(
					$elm$html$Html$div,
					_List_fromArray(
						[
							$elm$html$Html$Attributes$class('letterbox')
						]),
					_List_fromArray(
						[
							A2(
							$elm$html$Html$input,
							_List_fromArray(
								[
									$elm$html$Html$Attributes$type_('text'),
									$elm$html$Html$Attributes$class('letter'),
									$elm$html$Html$Attributes$placeholder(
									letter(9)),
									$elm$html$Html$Attributes$value(
									guessLetter(9))
								]),
							_List_Nil)
						])),
					A2($elm$html$Html$br, _List_Nil, _List_Nil),
					A2(
					$elm$html$Html$div,
					_List_fromArray(
						[
							$elm$html$Html$Attributes$class('letterbox')
						]),
					_List_fromArray(
						[
							A2(
							$elm$html$Html$input,
							_List_fromArray(
								[
									$elm$html$Html$Attributes$type_('text'),
									$elm$html$Html$Attributes$class('letter'),
									$elm$html$Html$Attributes$placeholder(
									letter(4)),
									$elm$html$Html$Attributes$value(
									guessLetter(4))
								]),
							_List_Nil)
						])),
					A2($elm$html$Html$br, _List_Nil, _List_Nil),
					A2(
					$elm$html$Html$div,
					_List_fromArray(
						[
							$elm$html$Html$Attributes$class('letterbox')
						]),
					_List_fromArray(
						[
							A2(
							$elm$html$Html$input,
							_List_fromArray(
								[
									$elm$html$Html$Attributes$type_('text'),
									$elm$html$Html$Attributes$class('letter'),
									$elm$html$Html$Attributes$placeholder(
									letter(5)),
									$elm$html$Html$Attributes$value(
									guessLetter(5))
								]),
							_List_Nil)
						]))
				]));
	});
var $author$project$Main$viewNineagramTwoGuesses = F3(
	function (_v0, firstGuess, secondGuess) {
		var secondGuessLetter = function (n) {
			return $elm$core$String$toUpper(
				$elm$core$String$fromList(
					A2(
						$elm$core$List$drop,
						n - 1,
						A2(
							$elm$core$List$take,
							n,
							$elm$core$String$toList(
								$author$project$Nineagram$Guess$toString(secondGuess))))));
		};
		var letter = function (_v1) {
			return '';
		};
		var firstGuessLetter = function (n) {
			return $elm$core$String$toUpper(
				$elm$core$String$fromList(
					A2(
						$elm$core$List$drop,
						n - 1,
						A2(
							$elm$core$List$take,
							n,
							$elm$core$String$toList(
								$author$project$Nineagram$Guess$toString(firstGuess))))));
		};
		return A2(
			$elm$html$Html$div,
			_List_fromArray(
				[
					$elm$html$Html$Attributes$class('nineagram'),
					$elm$html$Html$Attributes$class('solution')
				]),
			_List_fromArray(
				[
					A2(
					$elm$html$Html$div,
					_List_fromArray(
						[
							$elm$html$Html$Attributes$class('letterbox')
						]),
					_List_fromArray(
						[
							A2(
							$elm$html$Html$input,
							_List_fromArray(
								[
									$elm$html$Html$Attributes$type_('text'),
									$elm$html$Html$Attributes$class('letter'),
									$elm$html$Html$Attributes$placeholder(
									letter(1)),
									$elm$html$Html$Attributes$value(
									firstGuessLetter(1))
								]),
							_List_Nil)
						])),
					A2($elm$html$Html$br, _List_Nil, _List_Nil),
					A2(
					$elm$html$Html$div,
					_List_fromArray(
						[
							$elm$html$Html$Attributes$class('letterbox')
						]),
					_List_fromArray(
						[
							A2(
							$elm$html$Html$input,
							_List_fromArray(
								[
									$elm$html$Html$Attributes$type_('text'),
									$elm$html$Html$Attributes$class('letter'),
									$elm$html$Html$Attributes$placeholder(
									letter(2)),
									$elm$html$Html$Attributes$value(
									firstGuessLetter(2))
								]),
							_List_Nil)
						])),
					A2($elm$html$Html$br, _List_Nil, _List_Nil),
					A2(
					$elm$html$Html$div,
					_List_fromArray(
						[
							$elm$html$Html$Attributes$class('letterbox')
						]),
					_List_fromArray(
						[
							A2(
							$elm$html$Html$input,
							_List_fromArray(
								[
									$elm$html$Html$Attributes$type_('text'),
									$elm$html$Html$Attributes$class('letter'),
									$elm$html$Html$Attributes$placeholder(
									letter(6)),
									$elm$html$Html$Attributes$value(
									secondGuessLetter(1))
								]),
							_List_Nil)
						])),
					A2(
					$elm$html$Html$div,
					_List_fromArray(
						[
							$elm$html$Html$Attributes$class('letterbox')
						]),
					_List_fromArray(
						[
							A2(
							$elm$html$Html$input,
							_List_fromArray(
								[
									$elm$html$Html$Attributes$type_('text'),
									$elm$html$Html$Attributes$class('letter'),
									$elm$html$Html$Attributes$placeholder(
									letter(7)),
									$elm$html$Html$Attributes$value(
									secondGuessLetter(2))
								]),
							_List_Nil)
						])),
					A2(
					$elm$html$Html$div,
					_List_fromArray(
						[
							$elm$html$Html$Attributes$class('letterbox')
						]),
					_List_fromArray(
						[
							A2(
							$elm$html$Html$input,
							_List_fromArray(
								[
									$elm$html$Html$Attributes$type_('text'),
									$elm$html$Html$Attributes$class('letter'),
									$elm$html$Html$Attributes$placeholder(
									letter(3)),
									$elm$html$Html$Attributes$value(
									secondGuessLetter(3))
								]),
							_List_Nil)
						])),
					A2(
					$elm$html$Html$div,
					_List_fromArray(
						[
							$elm$html$Html$Attributes$class('letterbox')
						]),
					_List_fromArray(
						[
							A2(
							$elm$html$Html$input,
							_List_fromArray(
								[
									$elm$html$Html$Attributes$type_('text'),
									$elm$html$Html$Attributes$class('letter'),
									$elm$html$Html$Attributes$placeholder(
									letter(8)),
									$elm$html$Html$Attributes$value(
									secondGuessLetter(4))
								]),
							_List_Nil)
						])),
					A2(
					$elm$html$Html$div,
					_List_fromArray(
						[
							$elm$html$Html$Attributes$class('letterbox')
						]),
					_List_fromArray(
						[
							A2(
							$elm$html$Html$input,
							_List_fromArray(
								[
									$elm$html$Html$Attributes$type_('text'),
									$elm$html$Html$Attributes$class('letter'),
									$elm$html$Html$Attributes$placeholder(
									letter(9)),
									$elm$html$Html$Attributes$value(
									secondGuessLetter(5))
								]),
							_List_Nil)
						])),
					A2($elm$html$Html$br, _List_Nil, _List_Nil),
					A2(
					$elm$html$Html$div,
					_List_fromArray(
						[
							$elm$html$Html$Attributes$class('letterbox')
						]),
					_List_fromArray(
						[
							A2(
							$elm$html$Html$input,
							_List_fromArray(
								[
									$elm$html$Html$Attributes$type_('text'),
									$elm$html$Html$Attributes$class('letter'),
									$elm$html$Html$Attributes$placeholder(
									letter(4)),
									$elm$html$Html$Attributes$value(
									firstGuessLetter(4))
								]),
							_List_Nil)
						])),
					A2($elm$html$Html$br, _List_Nil, _List_Nil),
					A2(
					$elm$html$Html$div,
					_List_fromArray(
						[
							$elm$html$Html$Attributes$class('letterbox')
						]),
					_List_fromArray(
						[
							A2(
							$elm$html$Html$input,
							_List_fromArray(
								[
									$elm$html$Html$Attributes$type_('text'),
									$elm$html$Html$Attributes$class('letter'),
									$elm$html$Html$Attributes$placeholder(
									letter(5)),
									$elm$html$Html$Attributes$value(
									firstGuessLetter(5))
								]),
							_List_Nil)
						]))
				]));
	});
var $author$project$Main$viewNineagram = F2(
	function (puzzle, attempt) {
		switch (attempt.$) {
			case 0:
				return $author$project$Main$viewNineagramNoGuesses(puzzle);
			case 1:
				var guess = attempt.a;
				return A2($author$project$Main$viewNineagramOneGuess, puzzle, guess);
			default:
				var firstGuess = attempt.a;
				var secondGuess = attempt.b;
				return A3($author$project$Main$viewNineagramTwoGuesses, puzzle, firstGuess, secondGuess);
		}
	});
var $author$project$Main$Reset = {$: 3};
var $author$project$Main$TypedPuzzleLetters = function (a) {
	return {$: 1, a: a};
};
var $author$project$Main$viewCreationProblems = function (problems) {
	var displayProblem = function (problem) {
		switch (problem.$) {
			case 1:
				if (!problem.a) {
					return $elm$core$Maybe$Nothing;
				} else {
					var n = problem.a;
					return $elm$core$Maybe$Just(
						'That\'s only ' + ($elm$core$String$fromInt(n) + ' letters. A puzzle should have exactly nine letters.'));
				}
			case 2:
				var n = problem.a;
				return $elm$core$Maybe$Just(
					'That\'s ' + ($elm$core$String$fromInt(n) + ' letters. A puzzle should have exactly nine letters.'));
			default:
				var first = problem.a;
				return $elm$core$Maybe$Just(
					'That\'s got a \'' + ($elm$core$String$fromChar(first) + '\'. A puzzle should only have letters.'));
		}
	};
	return A2(
		$elm$html$Html$div,
		_List_fromArray(
			[
				$elm$html$Html$Attributes$class('creationProblem')
			]),
		A2(
			$elm$core$List$map,
			function (message) {
				return A2(
					$elm$html$Html$div,
					_List_Nil,
					_List_fromArray(
						[
							$elm$html$Html$text(message)
						]));
			},
			A2($elm$core$List$filterMap, displayProblem, problems)));
};
var $author$project$Main$viewPuzzleCreation = function (model) {
	return A2(
		$elm$html$Html$form,
		_List_fromArray(
			[
				$elm$html$Html$Attributes$class('puzzleform'),
				$elm$html$Html$Events$onSubmit(
				$author$project$Main$SubmitPuzzleLetters(model.v))
			]),
		_List_fromArray(
			[
				A2(
				$elm$html$Html$div,
				_List_fromArray(
					[
						$elm$html$Html$Attributes$class('lettersInput')
					]),
				_List_fromArray(
					[
						A2(
						$elm$html$Html$label,
						_List_fromArray(
							[
								$elm$html$Html$Attributes$for('puzzleLetters')
							]),
						_List_fromArray(
							[
								A2(
								$elm$html$Html$b,
								_List_Nil,
								_List_fromArray(
									[
										$elm$html$Html$text('Nineagram Letters')
									]))
							])),
						A2($elm$html$Html$br, _List_Nil, _List_Nil),
						A2(
						$elm$html$Html$input,
						_List_fromArray(
							[
								$elm$html$Html$Attributes$type_('text'),
								$elm$html$Html$Attributes$id('puzzleLetters'),
								$elm$html$Html$Attributes$class('lettersInput'),
								$elm$html$Html$Attributes$spellcheck(false),
								$elm$html$Html$Attributes$autocomplete(false),
								$elm$html$Html$Attributes$value(model.v),
								$elm$html$Html$Attributes$disabled(
								!_Utils_eq(model.n, $elm$core$Maybe$Nothing)),
								$elm$html$Html$Events$onInput($author$project$Main$TypedPuzzleLetters)
							]),
						_List_Nil),
						A2(
						$elm$html$Html$div,
						_List_fromArray(
							[
								$elm$html$Html$Attributes$class('creationProblems')
							]),
						_List_fromArray(
							[
								$author$project$Main$viewCreationProblems(model.O)
							]))
					])),
				A2(
				$elm$html$Html$div,
				_List_Nil,
				_List_fromArray(
					[
						A2(
						$elm$html$Html$button,
						_List_fromArray(
							[
								$elm$html$Html$Attributes$disabled(
								!_Utils_eq(model.n, $elm$core$Maybe$Nothing))
							]),
						_List_fromArray(
							[
								$elm$html$Html$text('Submit')
							])),
						A2(
						$elm$html$Html$button,
						_List_fromArray(
							[
								$elm$html$Html$Attributes$type_('button'),
								$elm$html$Html$Events$onClick($author$project$Main$Reset)
							]),
						_List_fromArray(
							[
								$elm$html$Html$text('Clear')
							]))
					]))
			]));
};
var $author$project$Main$viewState = F2(
	function (defaultPuzzle, model) {
		var puzzle = A2($elm$core$Maybe$withDefault, defaultPuzzle, model.n);
		return A2(
			$elm$html$Html$div,
			A2(
				$elm$core$List$cons,
				$elm$html$Html$Attributes$class('nineagramSolver'),
				$author$project$Main$keyHandlers(model)),
			_List_fromArray(
				[
					$author$project$Main$viewPuzzleCreation(model),
					A2($author$project$Main$viewNineagram, puzzle, model.j),
					A2($author$project$Main$viewGuessing, model, puzzle),
					A2($author$project$Main$viewAttempts, model, puzzle),
					$author$project$Main$viewAllSolutions(model),
					A2(
					$elm$html$Html$h1,
					_List_Nil,
					_List_fromArray(
						[
							$elm$html$Html$text('Nineagram Solver')
						]))
				]));
	});
var $author$project$Main$view = function (model) {
	return {
		aw: _List_fromArray(
			[
				function () {
				if (!model.$) {
					return $elm$html$Html$text('Sorry, something went wrong.');
				} else {
					var defaultPuzzle = model.a;
					var state = model.c;
					return A2($author$project$Main$viewState, defaultPuzzle, state);
				}
			}()
			]),
		aL: 'Nineagram Solver'
	};
};
var $author$project$Main$main = $elm$browser$Browser$application(
	{
		aD: F3(
			function (_v0, url, key) {
				return A2($author$project$Main$init, url, key);
			}),
		aF: function (_v1) {
			return $author$project$Main$NoOp;
		},
		aG: function (_v2) {
			return $author$project$Main$NoOp;
		},
		aK: function (_v3) {
			return $elm$core$Platform$Sub$none;
		},
		aM: $author$project$Main$update,
		aN: $author$project$Main$view
	});
_Platform_export({'Main':{'init':$author$project$Main$main(
	$elm$json$Json$Decode$succeed(0))(0)}});}(this));