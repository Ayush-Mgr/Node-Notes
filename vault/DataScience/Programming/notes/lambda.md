## What is a Lambda Function?

A **lambda function** in Python is a small anonymous function defined using the `lambda` keyword. It can take any number of arguments but can only have one expression.

## Syntax

```python
lambda arguments: expression
```

## Example

```python
# Regular function
def add(x, y):
    return x + y

# Equivalent lambda function
add_lambda = lambda x, y: x + y

# Using the lambda function
print(add_lambda(3, 5))  # Output: 8
```

## Where to Use Lambda Functions?

Lambda functions are commonly used in places where small functions are needed for a short duration, such as:

### 1. In `map()`

```python
numbers = [1, 2, 3, 4]
squared = list(map(lambda x: x ** 2, numbers))
print(squared)  # Output: [1, 4, 9, 16]
```

### 2. In `filter()`

```python
numbers = [1, 2, 3, 4, 5, 6]
even_numbers = list(filter(lambda x: x % 2 == 0, numbers))
print(even_numbers)  # Output: [2, 4, 6]
```

### 3. In `sorted()`

```python
students = [("Alice", 90), ("Bob", 75), ("Charlie", 85)]
sorted_students = sorted(students, key=lambda x: x[1])
print(sorted_students)  # Output: [('Bob', 75), ('Charlie', 85), ('Alice', 90)]
```

## Limitations of Lambda Functions

- They can only contain a single expression.
- They are less readable than normal functions when complex logic is involved.
- Debugging is harder because they lack function names.

## When to Use Lambda Functions?

Use lambda functions when you need a short function for immediate use, especially in functional programming methods like `map()`, `filter()`, and `sorted()`. However, for more complex operations, use `def` to define a proper function.

---


---
Tags: #programming #tools


#Python_Basics
