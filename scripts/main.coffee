
class Calculator
	el: null
	expression: ""
	expressionEnd: ""
	result: null
	history: []
	memory: []
	operators:
		DIVIDE: '/'
		MULTIPLY: '*'
		ADD: '+'
		SUBTRACT: '-'
		UMINUS: '-'
		POWER: '^'
	functions:
		PAREN: ''
		EXP: 'exp'
		SQRT: 'sqrt'
		SIN: 'sin'
		COS: 'cos'
		TAN: 'tan'
		CSC: 'csc'
		SEC: 'sec'
		COT: 'cot'
		LOG: 'log'
		LN: 'ln'
		INT: 'int'
	parser: parser

	constructor: (@el) ->
		@addButtonHandlers
			"zero":  => @addDigit 0
			"one":   => @addDigit 1
			"two":   => @addDigit 2
			"three": => @addDigit 3
			"four":  => @addDigit 4
			"five":  => @addDigit 5
			"six":   => @addDigit 6
			"seven": => @addDigit 7
			"eight": => @addDigit 8
			"nine":  => @addDigit 9
			"decimal":  => @addDecimal()
			"divide": => @addOperator @operators.DIVIDE
			"multiply": => @addOperator @operators.MULTIPLY
			"subtract": => @addOperator @operators.SUBTRACT
			"add": => @addOperator @operators.ADD
			"uminus": => @addOperator @operators.UMINUS
			"pow": => @addOperator @operators.POWER
			"exp": => @addFunction @functions.EXP
			"sqrt": => @addFunction @functions.SQRT
			"log": => @addFunction @functions.LOG
			"ln": => @addFunction @functions.LN
			"sin": => @addFunction @functions.SIN
			"paren": => @addFunction @functions.PAREN
			"delete": => @deleteChar()
		
		@el.querySelector('.result').addEventListener 'click', (e) =>
			@store()
		, false

		FastClick.attach @el
	
	createHMTL: () ->
		###
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
		###


	addButtonHandlers: (hash) ->
		for own button, cb of hash
			@el.querySelector('.button.' + button).addEventListener 'click', cb, false
	
	store: ->
		return if @result is null
		@memory.push @result
		self = @

		$el = document.createElement 'span'
		$el.classList.add 'item'
		$val = document.createElement 'span'
		$val.classList.add 'value'
		$val.textContent = @result
		$del = document.createElement 'span'
		$del.classList.add 'delete'
		$del.innerHTML = "&times;"
		$del.addEventListener 'click', (e) ->
			i = Array.prototype.slice.call(self.el.querySelector('.memory').childNodes).indexOf @parentNode
			self.memory.splice i, 1
			self.el.querySelector('.memory').removeChild @parentNode
			e.stopPropagation()
		, false
		$el.appendChild $val
		$el.appendChild $del
		$el.addEventListener 'click', (e) ->
			i = Array.prototype.slice.call(self.el.querySelector('.memory').childNodes).indexOf @
			self.recall i
		, false
		@el.querySelector('.memory').appendChild $el
	
	recall: (i) ->
		value = null

		try
			value = @memory[i]
		catch e
			console.error e
			return

		if /^$|[+\-\/*]$/.test @expression
			@expression += value
		else
			@expression += "*#{value}"

		@evaluate()

		# @memory.splice i, 1
		# $el = @el.querySelectorAll '.memory .item'
		# console.log $el, i
		# @el.querySelector('.memory').removeChild $el
	
	addDigit: (d) ->
		@expression += d
		@evaluate()
	
	addDecimal: () ->
		return if /(?:[.%)]|[0-9]\.[0-9]+)$/.test @expression
		if /^$|[(+\-\/*]$/.test @expression then @expression += '0.'
		else if /\)$/.test @expression then @expression += '*0.'
		else this.expression += '.'

		@evaluate()
	
	addFunction: (func) ->
		# if func is @functions.PAREN
		# TODO: detect close paren, move ')' from expressionEnd to expression
		@expression += "#{func}("
		@expressionEnd = ")#{this.expressionEnd}"
		@evaluate()
	
	addOperator: (op) ->
		notMinus = op isnt @operators.SUBTRACT
		return if /^$/.test(@expression) && notMinus
		return if /[+\-\/*]/.test(@expression.slice -1) && notMinus
		@expression += op
		@evaluate()
	
	deleteChar: () ->
		@expressionEnd = @expressionEnd.slice(1) if /\($/.test @expression
		if /[+\-\/*]0\.$/.test @expression then @expression = @expression.slice 0, -2
		else @expression = @expression.slice 0, -1
		@evaluate()
	
	prettyPrint: () ->
		
	evaluate: () ->
		result = null
		rounded = null
		@el.querySelector('.expression').textContent = @expression + @expressionEnd
		try
			result = @parser.parse @expression + @expressionEnd
			rounded = Math.round(result * 1000000) / 1000000
			@result = if Math.abs(result - rounded) < 1e-15 then rounded else result
		catch e
			console.error e
			@el.querySelector('.result').textContent = ""
			return
		
		@el.querySelector('.result').textContent = @result

# HOWWWW
# maybe: http://stackoverflow.com/questions/3675390/
# or: http://stackoverflow.com/questions/5124743/
detectRepeatingDecimal = (f) ->
	fpart = f - Math.floor f
	s = fpart.toString()
	memory = []
	a = 0
	b = 0
	c = 0
	while s.length
		memory.push s.charAt 0
		s = s.slice 1

	[0, 0]

toFraction = (f, a, b) ->
	powers = detectRepeatingDecimal f

	a = powers[0]
	b = powers[1]

	m1 = Math.pow 10, a + b
	m2 = if b isnt 0 then Math.pow(10, a) else 0
	numerator = f * m1 - f * m2
	denominator = m1 - m2
	gcd = Math.gcd numerator, denominator
	return [Math.round(numerator / gcd), denominator / gcd]

Math.gcd = (a, b) ->
	while a isnt b
		a -= b if a > b 
		b -= a if b > a
		return 1 if a <= 1 or b <= 1
	a

###
Approximates a decimal with a fraction.
Named after James Farey, an English surveyor.
No error checking on args -- lim = max denominator,
results are (numerator, denominator), (1,0) is infinity
###
farey = (v, lim) ->

	if v < 0
		f = farey -v, lim
		return [-f[0], f[1]]

	z = 0

	lower = [z, z+1]
	upper = [z+1, z]

	while true
		mediant = [lower[0] + upper[0], lower[1] + upper[1]]
		if v * mediant[1] > mediant[0]
			return upper if lim < mediant[1]
			lower = mediant
		else if v * mediant[1] is mediant[0]
			return mediant if lim >= mediant[1]
			return lower if lower[1] < upper[1]
			return upper
		else
			return lower if lim < mediant[1]
			upper = mediant

window.addEventListener 'load', () ->
	window.calc = new Calculator document.getElementById 'calculator'
, false
