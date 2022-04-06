# pricer

`pricer` is a JS module that allows to define prices as formulae, and to evaluate them. These formulae can be written in a plain text file, a `pricing document`, following a simple language.

The pricing document is parsed by the module, so it can evaluate the price, given a hash of predetermined values.

## Use of the pricer

Several pricing documents may reside in the pricer, each designed to price a different product class.
Every pricing document is required to define the term `total`.
When attempting to price a given product, the pricer splits it into its components, and prices each component independently. To price a component, it evaluates the term `total` defined in the pricing document corresponding to the pricing class of said component.

Say we have a product with components `Product`, `Addon 1`, `Addon 2`, whose pricing classes are, respectively, `General product`, `General addon` and `Special addon`. In order to price this product, the pricer does the following:

1. retrieves the pricing document for `General product` and evaluates the term `total`, passing a series of values
2. retrieves the pricing document for `General addon` and evaluates the term `total`, passing a series of values
3. retrieves the pricing document for `Special addon` and evaluates the term `total`, passing a series of values

Then, the pricer adds up all the numbers and provides a `total`.

The pricer can also be called to evaluate specific terms, not only `total`.

## Structure of the pricing document

The pricing document consists of a preamble followed by a list of definitions.

The preamble consists of lines like:

```
$injectable_term = term, ..., term
```

that define a series of terms which are not defined in the document, but that take part in other terms definitions. These terms are to be substituted by values injected at the time of pricing.

Each definition is of the form:

```
term = expression
```

where `expression` is an expression that may involve the following types of data:

* numbers (all of them treated as floats)
* booleans `true` and `false`
* strings (in single or doble quotes)
* other terms which, in turn, are defined in the same pricing document, or are intended to be provided at pricing time.

The above values can be operated with the usual operators, in order of precedence, all of which of obvious meaning:

* `if` _condition_ `then` _expression_ `else` _expression `end`
* `-` and `!` (unary, in front of a value)
* `*` and `/`
* `+` and `-` (binary)
* `&&` and `||`

### Example of definition

The following is an example of a definition:

```
$injectable = cells
multiplier = if cells >= 5 then 1.5 else 1 end
price = 500 * cells * multiplier
```

when the pricer is requested to evaluate the term `price`, it first evaluates `multiplier`, which is provided above.
The term `cells`, however, is defined as an `$injectable`, so in order to evaluate `price`, a key-value pair must be provided indicating the value of `cells`.

The above document could also have been written as

```
$injectable = cells
price = 500 * cells * if cells >= 5 then 1.5 else 1 end
```

### Grammar of the pricing document

This is the grammar followed by `pricer`:

```
S = { Injectable } { Def }.
Injectable = "$" id = id { "," id }.
Def = id "=" Expr.
Expr = Pred { LogicOp Pred }.
Pred = Value [CompOp Value].
Value = Sum { ArithmeticOp0 Sum }.
Sum = Factor { ArithmeticOp1 Factor}.
Factor = [UnaryOp] Base.
Base = num
     | "true"
     | "false"
     | "(" Expr ")"
     | "if" Expr "then" Expr "else" Expr "end"
     | id.
UnaryOp = "-" | "!".
ArithmeticOp1 = "*" | "/".
ArithmeticOp0 = "+" | "-".
LogicOp = "&&" | "||".
CompOp = ">" | ">=" | "<" | "<=" | "==" | "!=".
```

Where

* id: `/[a-zA-Z_][a-zA-z0-9_]*/`,
* num: `/[0-9]+(\.[0-9]+)?/`,

## About this repo

### Testing

```
yarn test
```
