(function (window) {
    "use strict";

    function var_dump(...args) {
        for (let i = 0; i < args.length; i++) {
            const result = {
                dump: "",
                stack: [],
            };

            dump_value(args[i], result, 0);
            console.log(result.dump)
        }
    }

    var_dump.INDENT_CHAR = " ";
    var_dump.INDENT_LENGTH = 4;
    var_dump.ALLOW_WINDOW_DUMP = false;

    function dump_value(value, result, depth) {
        const type = typeof value;
        switch (type) {
            case "boolean":
            case "bigint":
            case "number":
                result.dump += `${type}(${value})`;
                break;
            case "string":
                result.dump += `string(${value.length}) "${value}"`;
                break;
            case "symbol":
                result.dump += value.toString();
                break;
            case "function":
                dump_function(value, result, depth);
                break;
            case "object":
                dump_object(value, result, depth);
                break;
            default:
                result.dump += value;
        }
    }

    function dump_function(value, result, depth) {
         /** @see https://stackoverflow.com/a/9924463 */
        const get_func_args = function (func) {
            const STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;
            const body = func.toString().replace(STRIP_COMMENTS, "");
            return body.slice(body.indexOf('(') + 1, body.indexOf(')')).split(',');
        };

        const name = value.name.length > 0 ? value.name : "(anonymous)";
        const args = get_func_args(value);
        const funcIndent = get_indentation(depth);
        const attrIndent = get_indentation(depth + 1);

        result.dump += `function {\n${attrIndent}[name] => `;
        dump_value(name, result, depth);

        if (args.length > 0) {
            result.dump += `\n${attrIndent}[parameters] => `;
            const parameters = {};

            for (let i = 0; i < args.length; i++) {
                let param = args[i];
                let state = '<required>';
                let ellipsis = -1;

                if (param.indexOf('=') !== -1) {
                    state = '<optional>';
                    param = param.split('=')[0];
                }
                else if ((ellipsis = param.indexOf('...')) !== -1) {
                    state = '<optional>';
                    param = param.substr(ellipsis + 3);
                }

                parameters[param.trim()] = state;
            }

            dump_object(parameters, result, depth + 1);
        }

        result.dump += `\n${funcIndent}}`;
    }

    function dump_object(value, result, depth) {
        if (result.stack.indexOf(value) !== -1) {
            result.dump += "*RECURSION*";
            return;
        }

        if (value === null) {
            result.dump += "NULL";
            return;
        }

        if (Array.isArray(value)) {
            dump_array(value, result, depth);
            return;
        }

        if (!var_dump.ALLOW_WINDOW_DUMP && typeof window === "object" && value === window) {
            result.dump += "object(window)";
            return;
        }

        if (is_html_element(value)) {
            result.dump += `HTMLElement(${value.nodeName})`;
            return;
        }

        result.stack.push(value);

        const name = typeof value.constructor === "function" && value.constructor.name.length > 0 ? value.constructor.name : "@anonymous";
        const keys = Object.keys(value);
        result.dump += `object(${name}) (${keys.length}) {\n`;

        const objIndent = get_indentation(depth);
        const propIndent = get_indentation(depth + 1);

        if (typeof value.hasOwnProperty === "function") {
            for (let i = 0; i < keys.length; i++) {
                try {
                    const key = keys[i];
                    result.dump += `${propIndent}["${key}"] => `;
                    dump_value(value[key], result, depth + 1);
                    result.dump += "\n";
                } catch (e) {}
            }
        }

        result.stack.pop();
        result.dump += `${objIndent}}`;
    }

    function dump_array(value, result, depth) {
        if (result.stack.indexOf(value) !== -1) {
            result.dump += "*RECURSION*";
            return;
        }

        result.dump += `array(${value.length}) {\n`;
        const arrayIndent = get_indentation(depth);
        const valueIndent = get_indentation(depth + 1);

        result.stack.push(value);
        for (let i = 0; i < value.length; i++) {
            result.dump += `${valueIndent}[${i}] => `;
            dump_value(value[i], result, depth + 1);
            result.dump += "\n";
        }

        result.stack.pop();
        result.dump += `${arrayIndent}}`;
    }

    function get_indentation(width) {
        if (width === 0) {
            return "";
        }

        const char = var_dump.INDENT_CHAR;
        const len  = var_dump.INDENT_LENGTH;
        return char.repeat(len * width);
    }

    function is_html_element(value) {
        if (typeof HTMLElement === "object") {
            return value instanceof HTMLElement;
        }

        return typeof value === "object" && value !== null && value.nodeType === 1 && typeof value.nodeName === "string";
    }

    window.var_dump = var_dump;
})(window);
