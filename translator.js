const translate = function (parseTree) {
    let variaveis = [];
    let identacao = 1;

    let operadores = [
        "e",
        "ou",
        "<",
        ">",
        "=",
        "^",
        "*",
        "/",
        "%",
        "+",
        "-",
    ];

    let tipos = {
        inteiro: 'int',
        real: 'float',
        literal: 'string'
    };

    var parseNode = function (node) {
        if (node.type === "number") return node.value;
        else if (operadores.includes(node.type)) {
            let op = node.type;

            if (op === "=") {
                op = "==";
            } else if (op === "ou") {
                op = "||"
            } else if (op === "e") {
                op = "&&"
            } else if (op === "^") {
                return `pow(${parseNode(node.left)}, ${parseNode(node.right)})`;
            }

            return `${parseNode(node.left)} ${op} ${parseNode(node.right)}`;
        } else if (node.type === "identifier") {
            return node.value;
        } else if (node.type === "type") {
            return node.value;
        } else if (node.type === "boolean") {
            return node.value ? "true" : "false";
        } else if (node.type === "declare") {
            variaveis[node.name] = node.value.value;
            return `${tipos[parseNode(node.value)]} ${node.name};`;
        } else if (node.type === "assign") {
            if (!variaveis[node.name]) {
                throw node.name + " nao declarada";
            }

            if ((node.value.type == 'number' && variaveis[node.name] == 'literal') ||
                (node.value.type == 'string' && variaveis[node.name] != 'literal')) {
                throw node.name + " e do tipo " + variaveis[node.name];
            }

            return `${node.name} = ${parseNode(node.value)};`;
        } else if (node.type === "variaveis") {
            return node.body.map((n) => tab(identacao) + parseNode(n) + "\n").toString().replace(/,/g, "");
        } else if (node.type === "program") {
            return `${tab(identacao++)}int main() {\n${
                node.body.map((n) => tab(identacao) + parseNode(n) + "\n").toString().replace(/,/g, "")
                }${tab(identacao)}return 0;\n${tab(--identacao)}}\n`;
        } else if (node.type === "if") {
            identacao++;
            return `if (${parseNode(node.expr)}) {\n${
                node.body.map((n) => tab(identacao) + parseNode(n) + "\n").toString().replace(/,/g, "")
                }${tab(--identacao)}}`;
        } else if (node.type === "string") {
            return `"${node.value}"`;
        } else if (node.type === "algoritmo") {
            return `// algoritmo ${parseNode(node.value)}\n`;
        } else if (node.type === "function") {
            if (node.value === "imprima") {
                return `cout << ${parseNode(node.expr)};`;
            } else if (node.value === "leia") {
                return `cin >> ${parseNode(node.expr)};`;
            }
        }
    };

    const tab = (q) => {
        return Array(q).join("\t");
    }

    let output = `#include &lt;iostream&gt;\nusing namespace std;\n\n`;
    for (let i = 0; i < parseTree.length; i++) {
        let value = parseNode(parseTree[i]);
        if (typeof value !== "undefined") output += value + "\n";
    }
    return output;
}