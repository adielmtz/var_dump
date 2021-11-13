# var_dump
PHP's var_dump function for JavaScript.

## Usage
```js
var_dump({
    string: "hello",
    array: ["world!"],
    object: {
        subkey: [1, 2, {deeply: "nested"}],
        empty: {}
    },
    number: 100,
    bigint: 100n,
    func: function (a, b = true, ...c) {},
    html: document.createElement("div")
});
```
will print...
```
object(Object) (7) {
    ["string"] => string(5) "hello"
    ["array"] => array(1) {
        [0] => string(6) "world!"
    }
    ["object"] => object(Object) (2) {
        ["subkey"] => array(3) {
            [0] => number(1)
            [1] => number(2)
            [2] => object(Object) (1) {
                ["deeply"] => string(6) "nested"
            }
        }
        ["empty"] => object(Object) (0) {
        }
    }
    ["number"] => number(100)
    ["bigint"] => bigint(100)
    ["func"] => function {
        [name] => string(4) "func"
        [parameters] => object(Object) (3) {
            ["a"] => string(10) "<required>"
            ["b"] => string(10) "<optional>"
            ["c"] => string(10) "<optional>"
        }
    }
    ["html"] => HTMLElement(DIV)
}
```

## Configuration
Use `var_dump.INDENTATION` to control the output format:

```js
var_dump.INDENTATION = "\t";
var_dump({key: ["foo", "var"]});

// Output:
object(Object) (1) {
	["key"] => array(2) {
		[0] => string(3) "foo"
		[1] => string(3) "var"
	}
}

var_dump.INDENTATION = "  "; // 2 spaces
var_dump({key: ["foo", "var"]});

// Output:
object(Object) (1) {
  ["key"] => array(2) {
    [0] => string(3) "foo"
    [1] => string(3) "var"
  }
}
```

### Other options
* Set `var_dump.ALLOW_WINDOW_DUMP` to `true` to allow var_dump to dump the Window object (though it may be really slow).
