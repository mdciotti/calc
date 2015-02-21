
Calculator = {
	el: null,
	expression: "",
	expressionEnd: "",
	result: null,
	history: [],
	memory: [],
	operators: {
		DIVIDE: '/',
		MULTIPLY: '*',
		ADD: '+',
		SUBTRACT: '-',
		UMINUS: '-',
		POWER: '^'
	},
	functions: {
		PAREN: '',
		EXP: 'exp',
		SQRT: 'sqrt',
		SIN: 'sin',
		COS: 'cos',
		TAN: 'tan',
		CSC: 'csc',
		SEC: 'sec',
		COT: 'cot',
		LOG: 'log',
		LN: 'ln',
		INT: 'int'
	},
	parser: null,
	initialize: function (el) {
		this.el = el;
		this.parser = parser;
		var self = this;
		this.addButtonHandlers({
			"zero":  function () { self.addDigit(0); },
			"one":   function () { self.addDigit(1); },
			"two":   function () { self.addDigit(2); },
			"three": function () { self.addDigit(3); },
			"four":  function () { self.addDigit(4); },
			"five":  function () { self.addDigit(5); },
			"six":   function () { self.addDigit(6); },
			"seven": function () { self.addDigit(7); },
			"eight": function () { self.addDigit(8); },
			"nine":  function () { self.addDigit(9); },
			"decimal":  function () { self.addDecimal(); },
			"divide": function () { self.addOperator(self.operators.DIVIDE); },
			"multiply": function () { self.addOperator(self.operators.MULTIPLY); },
			"subtract": function () { self.addOperator(self.operators.SUBTRACT); },
			"add": function () { self.addOperator(self.operators.ADD); },
			"uminus": function () { self.addOperator(self.operators.UMINUS); },
			"pow": function () { self.addOperator(self.operators.POWER); },
			"exp": function () { self.addFunction(self.functions.EXP); },
			"sqrt": function () { self.addFunction(self.functions.SQRT); },
			"log": function () { self.addFunction(self.functions.LOG); },
			"ln": function () { self.addFunction(self.functions.LN); },
			"sin": function () { self.addFunction(self.functions.SIN); },
			"paren": function () { self.addFunction(self.functions.PAREN); },
			"delete": function () { self.deleteChar(); }
		});
		this.el.querySelector('.result').addEventListener('click', function (e) {
			self.store();
		}, false);
		FastClick.attach(this.el);
	},
	addButtonHandlers: function (hash) {
		for (var b in hash) {
			if (hash.hasOwnProperty(b)) {
				this.el.querySelector('.button.' + b).addEventListener('click', hash[b], false);
			}
		}
	},
	store: function () {
		if (this.result === null) return;
		this.memory.push(this.result);
		var self = this;

		var $el = document.createElement('span');
		$el.classList.add('item');
		var $val = document.createElement('span');
		$val.classList.add('value');
		$val.textContent = this.result;
		var $del = document.createElement('span');
		$del.classList.add('delete');
		$del.innerHTML = "&times;";
		$del.addEventListener('click', function (e) {
			var i = Array.prototype.slice.call(self.el.querySelector('.memory').childNodes).indexOf(this.parentNode);
			self.memory.splice(i, 1);
			self.el.querySelector('.memory').removeChild(this.parentNode);
			e.stopPropagation();
		}, false);
		$el.appendChild($val);
		$el.appendChild($del);
		$el.addEventListener('click', function (e) {
			var i = Array.prototype.slice.call(self.el.querySelector('.memory').childNodes).indexOf(this);
			self.recall(i);
		}, false);
		this.el.querySelector('.memory').appendChild($el);
	},
	recall: function (i) {
		var value;
		try {
			value = this.memory[i];
		} catch (e) {
			console.error(e);
			return;
		}
		if (/^$|[+\-\/*]$/.test(this.expression))
			this.expression += value;
		else
			this.expression += "*" + value;
		this.evaluate();

		// this.memory.splice(i, 1);
		// var $el = this.el.querySelectorAll('.memory .item');
		// console.log($el, i);
		// this.el.querySelector('.memory').removeChild($el);
	},
	addDigit: function (d) {
		this.expression += d;
		this.evaluate();
	},
	addDecimal: function () {
		if (/(?:[.%)]|[0-9]\.[0-9]+)$/.test(this.expression)) return;
		if (/^$|[(+\-\/*]$/.test(this.expression)) this.expression += '0.';
		else if (/\)$/.test(this.expression)) this.expression += '*0.';
		else this.expression += '.';
		this.evaluate();
	},
	addFunction: function (func) {
		// if (func === this.functions.PAREN)
		// TODO: detect close paren, move ')' from expressionEnd to expression
		this.expression += func + "(";
		this.expressionEnd = ")" + this.expressionEnd;
		this.evaluate();
	},
	addOperator: function (op) {
		var notMinus = op !== this.operators.SUBTRACT;
		if (/^$/.test(this.expression) && notMinus) return;
		if (/[+\-\/*]/.test(this.expression.slice(-1)) && notMinus) return;
		this.expression += op;
		this.evaluate();
	},
	deleteChar: function () {
		if (/\($/.test(this.expression)) this.expressionEnd = this.expressionEnd.slice(1);
		if (/[+\-\/*]0\.$/.test(this.expression)) this.expression = this.expression.slice(0, -2);
		else this.expression = this.expression.slice(0, -1);
		this.evaluate();
	},
	prettyPrint: function () {
		
	},
	evaluate: function () {
		var result;
		this.el.querySelector('.expression').textContent = this.expression + this.expressionEnd;
		try {
			result = this.parser.parse(this.expression + this.expressionEnd);
			this.result = Math.abs(result - Math.round(result * 1000000) / 1000000) < 1e-15 ? Math.round(result * 1000000) / 1000000 : result;
		} catch (e) {
			console.error(e);
			this.el.querySelector('.result').textContent = "";
			return;
		}
		this.el.querySelector('.result').textContent = this.result;
	}
};

// HOWWWW
// maybe: http://stackoverflow.com/questions/3675390/
// or: http://stackoverflow.com/questions/5124743/
function detectRepeatingDecimal(f) {
	var fpart = f - Math.floor(f);
	var s = fpart.toString();
	var memory = [];
	var a = 0, b = 0, c = 0;
	while (s.length) {
		memory.push(s.charAt(0));
		s = s.slice(1);
	}
}

function toFraction(f, a, b) {
	var numerator,
		denominator,
		a, b, m1, m2,
		gcd, powers;

	powers = detectRepeatingDecimal(f);

	a = powers[0];
	b = powers[1];

	m1 = Math.pow(10, a + b);
	m2 = b !== 0 ? Math.pow(10, a) : 0;
	numerator = f * m1 - f * m2;
	denominator = m1 - m2;
	gcd = Math.gcd(numerator, denominator);
	return [Math.round(numerator / gcd), denominator / gcd];
}

Math.gcd = function (a, b) {
	while (a != b) {
		if (a > b) a -= b;
		if (b > a) b -= a;
		if (a <= 1 || b <= 1) return 1;
	}
	return a;
};

/* Approximates a decimal with a fraction.
 * Named after James Farey, an English surveyor.
 * No error checking on args -- lim = max denominator,
 * results are (numerator, denominator), (1,0) is infinity
 */
function farey(v, lim) {
	var f, z, upper, lower, mediant;

	if (v < 0) {
		f = farey(-v, lim);
		return [-f[0], f[1]];
	}

	z = 0;

	lower = [z, z+1]; 
	upper = [z+1, z];

	while (true) {
		mediant = [lower[0] + upper[0], lower[1] + upper[1]];
		if (v * mediant[1] > mediant[0]) {
			if (lim < mediant[1]) return upper;
			lower = mediant;
		} else if (v * mediant[1] == mediant[0]) {
			if (lim >= mediant[1]) return mediant;
			if (lower[1] < upper[1]) return lower;
			return upper;
		} else {
			if (lim < mediant[1]) return lower;
			upper = mediant;
		}
	}
}

window.addEventListener('load', function () {
	Calculator.initialize(document.getElementById('calculator'));
}, false);
