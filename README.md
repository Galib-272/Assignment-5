### 1️⃣ What is the difference between var, let, and const?

**var** is function-scoped and can be redeclared and updated. It is the older way of declaring variables in JavaScript.

**let** is block-scoped and can be updated but cannot be redeclared in the same scope.

**const** is also block-scoped but cannot be updated or redeclared after it is assigned.

---

### 2️⃣ What is the spread operator (...)?

The spread operator (`...`) is used to expand elements of an array or object into individual elements. It is commonly used to copy or merge arrays and objects.

Example:

```javascript
const arr1 = [1, 2];
const arr2 = [...arr1, 3];
```

---

### 3️⃣ What is the difference between map(), filter(), and forEach()?

**map()** creates a new array by applying a function to every element in the original array.

**filter()** creates a new array that contains only the elements that satisfy a specific condition.

**forEach()** runs a function for each element in the array but does not return a new array.

---

### 4️⃣ What is an arrow function?

An arrow function is a shorter syntax for writing functions in JavaScript using the `=>` operator.

Example:

```javascript
const add = (a, b) => a + b;
```

---

### 5️⃣ What are template literals?

Template literals are strings written using backticks (`` ` ``). They allow embedding variables and expressions inside a string using `${}`.

Example:

```javascript
const name = "John";
console.log(`Hello ${name}`);