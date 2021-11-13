(function (window) {
    "use strict";

    function StringBuilder()
    {
        if (!(this instanceof StringBuilder)) {
            return new StringBuilder();
        }

        this._str = "";
    }

    StringBuilder.prototype.toString = function ()
    {
        return this._str;
    };

    StringBuilder.prototype.length = function ()
    {
        return this._str.length;
    };

    StringBuilder.prototype.clear = function ()
    {
        this._str = "";
    }

    StringBuilder.prototype.append = function (value)
    {
        this._str += value;
    };

    StringBuilder.prototype.appendLine = function (value)
    {
        if (typeof value !== "undefined") {
            this._str += value;
        }

        this._str += "\n";
    };

    function var_dump(...args) {
        for (let i = 0; i < args.length; i++) {
            const result = {
                dump: new StringBuilder(),
                stack: [],
            };

            dump_value(args[i], result, 0);
            console.log(result.dump.toString())
        }
    }

    var_dump.INDENTATION = "    ";
    var_dump.ALLOW_WINDOW_DUMP = false;

    function dump_value(value, result, depth) {
        const type = typeof value;
        switch (type) {
            case "boolean":
            case "bigint":
            case "number":
                result.dump.append(`${type}(${value})`);
                break;
            case "string":
                result.dump.append(`string(${value.length}) "${value}"`);
                break;
            case "symbol":
                result.dump.append(value.toString());
                break;
            case "function":
                dump_function(value, result, depth);
                break;
            case "object":
                dump_object(value, result, depth);
                break;
            default:
                result.dump.append(value);
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

        result.dump.appendLine("function {");
        result.dump.append(`${attrIndent}[name] => `);
        dump_value(name, result, depth);

        if (args.length > 0) {
            result.dump.appendLine();
            result.dump.append(`${attrIndent}[parameters] => `);
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

        result.dump.appendLine();
        result.dump.append(`${funcIndent}}`);
    }

    function dump_object(value, result, depth) {
        if (result.stack.indexOf(value) !== -1) {
            result.dump.append("*RECURSION*");
            return;
        }

        if (value === null) {
            result.dump.append("NULL");
            return;
        }

        if (Array.isArray(value)) {
            dump_array(value, result, depth);
            return;
        }

        if (!var_dump.ALLOW_WINDOW_DUMP && typeof window === "object" && value === window) {
            result.dump.append("object(window)");
            return;
        }

        if (is_html_element(value)) {
            result.dump.append(`HTMLElement(${value.nodeName})`);
            return;
        }

        result.stack.push(value);
        const name = typeof value.constructor === "function" && value.constructor.name.length > 0 ? value.constructor.name : "@anonymous";
        const keys = Object.keys(value);
        result.dump.appendLine(`object(${name}) (${keys.length}) {`);

        const objIndent = get_indentation(depth);
        const propIndent = get_indentation(depth + 1);

        if (typeof value.hasOwnProperty === "function") {
            for (let i = 0; i < keys.length; i++) {
                try {
                    const key = keys[i];
                    result.dump.append(`${propIndent}["${key}"] => `);
                    dump_value(value[key], result, depth + 1);
                    result.dump.appendLine();
                } catch (e) {}
            }
        }

        result.stack.pop();
        result.dump.append(`${objIndent}}`);
    }

    function dump_array(value, result, depth) {
        if (result.stack.indexOf(value) !== -1) {
            result.dump.append("*RECURSION*");
            return;
        }

        result.dump.appendLine(`array(${value.length}) {`);
        const arrayIndent = get_indentation(depth);
        const valueIndent = get_indentation(depth + 1);

        result.stack.push(value);
        for (let i = 0; i < value.length; i++) {
            result.dump.append(`${valueIndent}[${i}] => `);
            dump_value(value[i], result, depth + 1);
            result.dump.appendLine();
        }

        result.stack.pop();
        result.dump.append(`${arrayIndent}}`);
    }

    function get_indentation(times) {
        return var_dump.INDENTATION.repeat(times);
    }

    function is_html_element(value) {
        if (typeof HTMLElement === "object") {
            return value instanceof HTMLElement;
        }

        return typeof value === "object" && value !== null && value.nodeType === 1 && typeof value.nodeName === "string";
    }

    window.var_dump = var_dump;
})(window);
