# Contributing Guidelines

## Code of Conduct

All contributors are expected to adhere to the [Contributor Covenant](http://contributor-covenant.org) code of conduct. Thank you for being kind to each other!

## Contributions welcome!

**Before spending lots of time on something, ask for feedback on your idea first!**

- Please search [issues](../../issues/) and [pull requests](../../pulls/) before adding something new! This helps avoid duplicating efforts and conversations.
- When opening an issue, you will be presented with a template. Follow it and provide all information that is requested.

## Code Style

**This are more guidelines than rules written into stone.**

#### Indentation and whitespace

Use four-space indents. Braces are on the same line as their associated statements. You should only omit braces if *both* sides of the statement are on one line.

One space after the `function` keyword.  No space between the function name in a declaration or a call. One space before the parens in the `if` statements, or `while`, or `for` loops.

```javascript
function foo(a, b) {
    let bar;

    if (a > b)
        bar = do_thing(a);
    else
        bar = do_thing(b);

    if (var == 5) {
        for (let i = 0; i < 10; i++) {
            print(i);
        }
    } else {
        print(20);
    }
}
```

#### Semicolons

JavaScript allows omitting semicolons at the end of lines, but don't. Always end statements with a semicolon.

#### Imports

Use UpperCamelCase when importing modules to distinguish them from ordinary variables, e.g.

```javascript
const GLib = imports.gi.GLib;
```

#### Constants

Use CONSTANTS_CASE to define constants. All constants should be directly under the imports:

```javascript
const MY_DBUS_INTERFACE = 'org.my.Interface';
```

#### Variable declaration

Always use either `const` or `let` when defining a variable.

```javascript
// Iterating over an array
for (let i = 0; i < arr.length; ++i) {
    let item = arr[i];
}

// Iterating over an object's properties
for (let prop in someobj) {
    ...
}
```

If you use "var" then the variable is added to function scope, not block scope. See [What's new in JavaScript 1.7](https://developer.mozilla.org/en/JavaScript/New_in_JavaScript/1.7#Block_scope_with_let_%28Merge_into_let_Statement%29)
