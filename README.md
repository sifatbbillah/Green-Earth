#### 1) What is the difference between var, let, and const?

**Ans:**
`var` is the old way—function-scoped and can be redeclared or updated.

`let` is block-scoped and can be updated but not redeclared.

`const` is block-scoped, must be initialized, and can’t be reassigned though object contents can still change.

#### 2) What is the difference between map(), forEach(), and filter()?

**Ans:**
`.forEach()` runs a function on each array item but returns nothing (undefined).

`.map()` transforms each item and returns a new array, leaving the original untouched.

`.filter()` returns a new array containing only items that pass a given test.

#### 3) What are arrow functions in ES6?

**Ans:**
Arrow functions are a short, neat way to write functions using `=>`. It gives us the power to write short code than traditional function method.

#### 4) How does destructuring assignment work in ES6?

**Ans:**
Destructuring lets you grab values from arrays or objects into variables easily.
For example: `const [a, b] = [10, 20]` or `const {name, age} = person;`

#### 5) Explain template literals in ES6. How are they different from string concatenation?

**Ans:**
Template literals use backticks `and let us embed expressions like`${...}`.
They’re easier to read and write, support multi-line text, short and cleaner than using `+` to join strings.
