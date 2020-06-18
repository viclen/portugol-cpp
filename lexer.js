var lex = function (input) {
	var keywords = [
		'inicio',
		'fim',
		'se',
		'fimse',
		'senao',
		'entao',
		'enquanto',
		'fimenquanto',
		'para',
		'fimpara',
		'faca',
		'variaveis',
		'fimvariaveis',
		'algoritmo'
	];

	var boolean = [
		'verdadeiro',
		'falso'
	];

	var funcoes = [
		'imprima',
		'leia',
	];

	const isOperator = (c) => {
		return /[+\-*\/\^%=(),<>:]/.test(c);
	};
	const isBinOperator = (c) => {
		if (c === "ou") {
			return true;
		} else if (c === "e") {
			return true;
		}
		return false;
	};
	const isDigit = function (c) {
		return /[0-9]/.test(c);
	};
	const isFunction = function (c) {
		return funcoes.includes(c)
	};
	const isKeyWord = function (c) {
		return keywords.includes(c)
	};
	const isBoolean = function (c) {
		return boolean.includes(c)
	};
	const isWhiteSpace = function (c) {
		return /\s/.test(c) || c === ";";
	};
	const isIdentifier = function (c) {
		return typeof c === "string" && !isOperator(c) && !isWhiteSpace(c);
	};
	const isType = function (c) {
		if (c === "inteiro"
			|| c === "real"
			|| c === "literal") {
			return true;
		}
		return false;
	}

	var tokens = [], c, i = 0;
	var advance = function () { return c = input[++i]; };
	var addToken = function (type, value) {
		tokens.push({
			type: type,
			value: value
		});
	};

	while (i < input.length) {
		c = input[i];
		if (isWhiteSpace(c)) advance();
		else if (isOperator(c)) {
			addToken(c);
			advance();
		} else if (isDigit(c)) {
			var num = c;
			while (isDigit(advance())) num += c;
			if (c === ".") {
				do num += c; while (isDigit(advance()));
			}
			num = parseFloat(num);
			if (!isFinite(num)) throw "Number is too large or too small for a 64-bit double.";
			addToken("number", num);
		} else if (c === '"') {
			var idn = "";
			c = advance();
			while (c !== '"') {
				idn += c;
				c = advance();
				if (c === "\\") {
					idn += c;
					c = advance();
					idn += c;
					c = advance();
				}
			}
			advance();
			addToken("string", idn);
		} else if (isIdentifier(c)) {
			var idn = c;
			while (isIdentifier(advance())) idn += c;

			if (isKeyWord(idn)) {
				addToken("keyword", idn);
			} else if (isFunction(idn)) {
				addToken("function", idn);
			} else if (isBinOperator(idn)) {
				addToken(idn);
			} else if (isType(idn)) {
				addToken("type", idn)
			} else if (isBoolean(idn)) {
				addToken("boolean", idn);
			} else {
				addToken("identifier", idn);
			}
		} else throw "Unrecognized token.";
	}
	addToken("(end)");
	return tokens;
};