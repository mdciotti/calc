(function() {
  var Calculator, detectRepeatingDecimal, farey, toFraction,
    __hasProp = {}.hasOwnProperty;

  Calculator = (function() {
    Calculator.prototype.el = null;

    Calculator.prototype.expression = "";

    Calculator.prototype.expressionEnd = "";

    Calculator.prototype.result = null;

    Calculator.prototype.history = [];

    Calculator.prototype.memory = [];

    Calculator.prototype.operators = {
      DIVIDE: '/',
      MULTIPLY: '*',
      ADD: '+',
      SUBTRACT: '-',
      UMINUS: '-',
      POWER: '^'
    };

    Calculator.prototype.functions = {
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
    };

    Calculator.prototype.parser = parser;

    function Calculator(el) {
      var _this = this;
      this.el = el;
      this.addButtonHandlers({
        "zero": function() {
          return _this.addDigit(0);
        },
        "one": function() {
          return _this.addDigit(1);
        },
        "two": function() {
          return _this.addDigit(2);
        },
        "three": function() {
          return _this.addDigit(3);
        },
        "four": function() {
          return _this.addDigit(4);
        },
        "five": function() {
          return _this.addDigit(5);
        },
        "six": function() {
          return _this.addDigit(6);
        },
        "seven": function() {
          return _this.addDigit(7);
        },
        "eight": function() {
          return _this.addDigit(8);
        },
        "nine": function() {
          return _this.addDigit(9);
        },
        "decimal": function() {
          return _this.addDecimal();
        },
        "divide": function() {
          return _this.addOperator(_this.operators.DIVIDE);
        },
        "multiply": function() {
          return _this.addOperator(_this.operators.MULTIPLY);
        },
        "subtract": function() {
          return _this.addOperator(_this.operators.SUBTRACT);
        },
        "add": function() {
          return _this.addOperator(_this.operators.ADD);
        },
        "uminus": function() {
          return _this.addOperator(_this.operators.UMINUS);
        },
        "pow": function() {
          return _this.addOperator(_this.operators.POWER);
        },
        "exp": function() {
          return _this.addFunction(_this.functions.EXP);
        },
        "sqrt": function() {
          return _this.addFunction(_this.functions.SQRT);
        },
        "log": function() {
          return _this.addFunction(_this.functions.LOG);
        },
        "ln": function() {
          return _this.addFunction(_this.functions.LN);
        },
        "sin": function() {
          return _this.addFunction(_this.functions.SIN);
        },
        "paren": function() {
          return _this.addFunction(_this.functions.PAREN);
        },
        "delete": function() {
          return _this.deleteChar();
        }
      });
      this.el.querySelector('.result').addEventListener('click', function(e) {
        return _this.store();
      }, false);
      FastClick.attach(this.el);
    }

    Calculator.prototype.createHMTL = function() {
      /*
      		c = document.createElement
      		$calc = c 'div'
      		col = () -> c('div').classList.add 'col'
      		btn = (type, name, txt) ->
      			$btn = c('div').classList.add 'button', type, name
      			$btn.innerHTML = txt
      
      		col
      			btn('ui', 'more', '&hellip;'),
      			btn 'op', 'pow', '^'
      			btn 'func', 'sqrt', '&#8730;'
      			btn 'log', 'log', 'log'
      			btn 'const', 'pi', '&pi;'
      
      		btn 'func', 'paren', '( )'
      		btn 'numeric', 'seven', '7'
      		btn 'numeric', 'four', '4'
      		btn 'numeric', 'one', '1'
      		btn 'numeric', 'zero', '0'
      
      		btn 'func', 'sin', 'sin'
      		btn 'numeric', 'eight', '8'
      		btn 'numeric', 'five', '5'
      		btn 'numeric', 'two', '2'
      		btn 'numeric', 'decimal', '.'
      
      		btn '', '', ''
      		btn 'numeric', 'nine', '9'
      		btn 'numeric', 'six', '6'
      		btn 'numeric', 'three', '3'
      		btn 'numeric', 'uminus', '(-)'
      
      		btn '', 'del', 'del'
      		btn 'op', 'divide', '&divide;'
      		btn 'op', 'multiply', '&times;'
      		btn 'op', 'subtract', '&minus;'
      		btn 'op', 'add', '+'
      */

    };

    Calculator.prototype.addButtonHandlers = function(hash) {
      var button, cb, _results;
      _results = [];
      for (button in hash) {
        if (!__hasProp.call(hash, button)) continue;
        cb = hash[button];
        _results.push(this.el.querySelector('.button.' + button).addEventListener('click', cb, false));
      }
      return _results;
    };

    Calculator.prototype.store = function() {
      var $del, $el, $val, self;
      if (this.result === null) {
        return;
      }
      this.memory.push(this.result);
      self = this;
      $el = document.createElement('span');
      $el.classList.add('item');
      $val = document.createElement('span');
      $val.classList.add('value');
      $val.textContent = this.result;
      $del = document.createElement('span');
      $del.classList.add('delete');
      $del.innerHTML = "&times;";
      $del.addEventListener('click', function(e) {
        var i;
        i = Array.prototype.slice.call(self.el.querySelector('.memory').childNodes).indexOf(this.parentNode);
        self.memory.splice(i, 1);
        self.el.querySelector('.memory').removeChild(this.parentNode);
        return e.stopPropagation();
      }, false);
      $el.appendChild($val);
      $el.appendChild($del);
      $el.addEventListener('click', function(e) {
        var i;
        i = Array.prototype.slice.call(self.el.querySelector('.memory').childNodes).indexOf(this);
        return self.recall(i);
      }, false);
      return this.el.querySelector('.memory').appendChild($el);
    };

    Calculator.prototype.recall = function(i) {
      var e, value;
      value = null;
      try {
        value = this.memory[i];
      } catch (_error) {
        e = _error;
        console.error(e);
        return;
      }
      if (/^$|[+\-\/*]$/.test(this.expression)) {
        this.expression += value;
      } else {
        this.expression += "*" + value;
      }
      return this.evaluate();
    };

    Calculator.prototype.addDigit = function(d) {
      this.expression += d;
      return this.evaluate();
    };

    Calculator.prototype.addDecimal = function() {
      if (/(?:[.%)]|[0-9]\.[0-9]+)$/.test(this.expression)) {
        return;
      }
      if (/^$|[(+\-\/*]$/.test(this.expression)) {
        this.expression += '0.';
      } else if (/\)$/.test(this.expression)) {
        this.expression += '*0.';
      } else {
        this.expression += '.';
      }
      return this.evaluate();
    };

    Calculator.prototype.addFunction = function(func) {
      this.expression += "" + func + "(";
      this.expressionEnd = ")" + this.expressionEnd;
      return this.evaluate();
    };

    Calculator.prototype.addOperator = function(op) {
      var notMinus;
      notMinus = op !== this.operators.SUBTRACT;
      if (/^$/.test(this.expression) && notMinus) {
        return;
      }
      if (/[+\-\/*]/.test(this.expression.slice(-1)) && notMinus) {
        return;
      }
      this.expression += op;
      return this.evaluate();
    };

    Calculator.prototype.deleteChar = function() {
      if (/\($/.test(this.expression)) {
        this.expressionEnd = this.expressionEnd.slice(1);
      }
      if (/[+\-\/*]0\.$/.test(this.expression)) {
        this.expression = this.expression.slice(0, -2);
      } else {
        this.expression = this.expression.slice(0, -1);
      }
      return this.evaluate();
    };

    Calculator.prototype.prettyPrint = function() {};

    Calculator.prototype.evaluate = function() {
      var e, result, rounded;
      result = null;
      rounded = null;
      this.el.querySelector('.expression').textContent = this.expression + this.expressionEnd;
      try {
        result = this.parser.parse(this.expression + this.expressionEnd);
        rounded = Math.round(result * 1000000) / 1000000;
        this.result = Math.abs(result - rounded) < 1e-15 ? rounded : result;
      } catch (_error) {
        e = _error;
        console.error(e);
        this.el.querySelector('.result').textContent = "";
        return;
      }
      return this.el.querySelector('.result').textContent = this.result;
    };

    return Calculator;

  })();

  detectRepeatingDecimal = function(f) {
    var a, b, c, fpart, memory, s;
    fpart = f - Math.floor(f);
    s = fpart.toString();
    memory = [];
    a = 0;
    b = 0;
    c = 0;
    while (s.length) {
      memory.push(s.charAt(0));
      s = s.slice(1);
    }
    return [0, 0];
  };

  toFraction = function(f, a, b) {
    var denominator, gcd, m1, m2, numerator, powers;
    powers = detectRepeatingDecimal(f);
    a = powers[0];
    b = powers[1];
    m1 = Math.pow(10, a + b);
    m2 = b !== 0 ? Math.pow(10, a) : 0;
    numerator = f * m1 - f * m2;
    denominator = m1 - m2;
    gcd = Math.gcd(numerator, denominator);
    return [Math.round(numerator / gcd), denominator / gcd];
  };

  Math.gcd = function(a, b) {
    while (a !== b) {
      if (a > b) {
        a -= b;
      }
      if (b > a) {
        b -= a;
      }
      if (a <= 1 || b <= 1) {
        return 1;
      }
    }
    return a;
  };

  /*
  Approximates a decimal with a fraction.
  Named after James Farey, an English surveyor.
  No error checking on args -- lim = max denominator,
  results are (numerator, denominator), (1,0) is infinity
  */


  farey = function(v, lim) {
    var f, lower, mediant, upper, z;
    if (v < 0) {
      f = farey(-v, lim);
      return [-f[0], f[1]];
    }
    z = 0;
    lower = [z, z + 1];
    upper = [z + 1, z];
    while (true) {
      mediant = [lower[0] + upper[0], lower[1] + upper[1]];
      if (v * mediant[1] > mediant[0]) {
        if (lim < mediant[1]) {
          return upper;
        }
        lower = mediant;
      } else if (v * mediant[1] === mediant[0]) {
        if (lim >= mediant[1]) {
          return mediant;
        }
        if (lower[1] < upper[1]) {
          return lower;
        }
        return upper;
      } else {
        if (lim < mediant[1]) {
          return lower;
        }
        upper = mediant;
      }
    }
  };

  window.addEventListener('load', function() {
    return window.calc = new Calculator(document.getElementById('calculator'));
  }, false);

}).call(this);
