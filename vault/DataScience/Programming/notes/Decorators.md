# Python Decorators

A **decorator** is a design pattern in Python that allows you to **modify or extend the behavior of a function, method, or class without changing its original source code**.

### 1. How Decorators Work

A decorator is essentially a function that:

1. Takes another function as an argument.
    
2. Defines a **wrapper function** that adds extra behavior.
    
3. Returns the wrapper.
    

```python
def scream(func):
    def wrapper(*args, **kwargs):
        print("HELLO!")
        return func(*args, **kwargs)
    return wrapper
```

### 2. `@` Syntax

Instead of manually writing:

```python
f = scream(f)
```

Python provides syntactic sugar:

```python
@scream
def f(a, b):
    return a + b
```

This is internally equivalent to:

```python
def f(a, b):
    return a + b

f = scream(f)
```

So, **`@decorator` simply means `function = decorator(function)`**.

### 3. What Happens During Execution?

```python
@scream
def f(a, b):
    return a + b
```

- `f` is passed to `scream`.
    
- `scream` creates and returns `wrapper`.
    
- The name `f` now refers to `wrapper`.
    
- When you call `f(3, 4)`, you are actually calling `wrapper(3, 4)`.
    
- The wrapper then calls the **original `f`**.
    

### 4. `*args` and `**kwargs`

These make decorators flexible enough to work with functions having different arguments.

- `*args` → collects positional arguments into a **tuple**.
    
- `**kwargs` → collects keyword arguments into a **dictionary**.
    

```python
def decorator(func):
    def wrapper(*args, **kwargs):
        print("Before")
        result = func(*args, **kwargs)
        print("After")
        return result
    return wrapper
```

### 5. Why Use Decorators?

- **Code Reuse** → apply the same behavior to many functions.
    
- **Separation of Concerns** → keep additional logic separate from core logic.
    
- **Maintainability** → add/remove behavior without modifying the original function.
    

### Common Uses

Decorators are commonly used for:

- Logging
    
- Timing functions
    
- Authentication/access control
    
- Caching
    
- Validation
    
- Debugging
    

### Key Idea

> **Decorator = function that takes a function, adds behavior through a wrapper, and returns the wrapper.**

**Mental model:**

```text
Original Function
       ↓
   Decorator
       ↓
     Wrapper
       ↓
Modified Behavior
```