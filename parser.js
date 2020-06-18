var parse = function (tokens) {
	var escopo = "";
	var simbolos = {},
		simbolo = function (id, nud, lbp, led) {
			var simb = simbolos[id] || {};
			simbolos[id] = {
				lbp: simb.lbp || lbp,
				nud: simb.nud || nud,
				led: simb.lef || led
			};
		};

	var interpretarToken = function (token) {
		var simb = Object.create(simbolos[token.type]);
		simb.type = token.type;
		simb.value = token.value;
		return simb;
	};

	var i = 0, token = function () { return interpretarToken(tokens[i]); };
	var avancar = function () { i++; return token(); };

	var expressao = function (rbp) {
		var left, t = token();
		avancar();
		if (!t.nud) throw "Inesperado: " + t.type;
		left = t.nud(t);
		while (rbp < token().lbp) {
			t = token();
			avancar();
			if (!t.led) throw "Inesperado: " + t.type;
			left = t.led(left);
		}
		return left;
	};

	var infix = function (id, lbp, rbp, led) {
		rbp = rbp || lbp;
		simbolo(id, null, lbp, led || function (left) {
			return {
				type: id,
				left: left,
				right: expressao(rbp)
			};
		});
	},
		prefix = function (id, rbp) {
			simbolo(id, function () {
				return {
					type: id,
					right: expressao(rbp)
				};
			});
		};


	simbolo(",");
	simbolo(")");
	simbolo("(end)");

	simbolo("number", function (number) {
		return number;
	});
	simbolo("identifier", function (name) {
		if (token().type === "(") {
			var args = [];
			if (tokens[i + 1].type === ")") avancar();
			else {
				do {
					avancar();
					args.push(expressao(2));
				} while (token().type === ",");
				if (token().type !== ")") throw "Esperando ')'";
			}
			avancar();
			return {
				type: "call",
				args: args,
				name: name.value
			};
		}
		return name;
	});

	simbolo("(", function () {
		value = expressao(2);

		if (token().type !== ")") throw "Esperando ')'";
		avancar();
		return value;
	});

	simbolo("keyword", function (node) {
		if (node.value == "inicio") {
			escopo = "inicio";
			let body = [];
			while (token().value !== "fim") {
				body.push(expressao(0));
			}
			avancar();

			return {
				type: "program",
				body
			};
		} else if (node.value == "se") {
			const expr = expressao(2);

			if (token().value !== "entao") {
				throw "Esperando 'entao'";
			}
			avancar();

			let body = [];
			while (token().value !== "fimse") {
				body.push(expressao(0));
			}
			avancar();

			return {
				type: "if",
				expr,
				body
			};
		} else if (node.value == "variaveis") {
			escopo = "variaveis";

			let body = [];
			while (token().value !== "fimvariaveis") {
				body.push(expressao(0));
			}
			avancar();

			return {
				type: "variaveis",
				body
			};
		} else if (node.value == "algoritmo") {
			if (token().type !== "identifier") {
				throw "Esperando nome do algoritmo";
			}

			return {
				type: "algoritmo",
				value: expressao(2)
			};
		}

		return node;
	});

	simbolo("string", (node) => ({
		type: "string",
		value: node.value
	}));

	simbolo("function", ({ type, value }) => {
		if (token().type === "(") {
			let expr = expressao(2);

			if (value === "leia" && expr.type != 'identifier') {
				throw "Esperando variavel";
			}

			return {
				type,
				value,
				expr
			};
		}
	});

	simbolo("boolean", (node) => ({
		type: "boolean",
		value: node.value === "verdadeiro"
	}));

	simbolo("type", (node) => ({
		type: "type",
		value: node.value
	}));

	prefix("-", 7);
	infix("e", 3);
	infix("ou", 3);
	infix("<", 3);
	infix(">", 3);
	infix("=", 3);
	infix("^", 6, 5);
	infix("*", 4);
	infix("/", 4);
	infix("%", 4);
	infix("+", 3);
	infix("-", 3);

	infix(":", 1, 2, function (left) {
		a = token();
		if (left.type !== "identifier") {
			throw "Esperando nome da variavel";
		}
		if (a.type === "=") {
			avancar();
			return {
				type: "assign",
				name: left.value,
				value: expressao(2)
			};
		} else {
			if (escopo === "variaveis") {
				return {
					type: "declare",
					name: left.value,
					value: expressao(2)
				};
			} else {
				throw "Você só pode declarar variáveis no escopo de variáveis";
			}
		}
	});

	var parseTree = [];
	while (token().type !== "(end)") {
		parseTree.push(expressao(0));
	}
	return parseTree;
};