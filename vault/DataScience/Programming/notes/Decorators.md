# Python Decorators

A **decorator** is a design pattern in Python that allows us to **add or modify behavior of a function without changing its original code**.

## 1. Why Use Decorators?

- **Code Reuse:** Add the same behavior to multiple functions without copying the code.
    
- **Separation of Concerns:** Keep extra logic separate from the main function.
    
- **Maintainability:** Easily add/remove behavior without modifying the original function.
    

Common uses:

- Logging
    
- Timing
    
- Authentication
    
- Validation
    
- Caching
    

---

## 2. Basic Decorator Structure

A decorator is a function that:

1. Takes another function as an argument.
    
2. Creates a **wrapper function**.
    
3. Adds extra behavior inside the wrapper.
    
4. Returns the wrapper.
    

```python
def greet(fx): # function greet is a decorator 
    def mffix():
        print("Good Morning")
        fx()
        print("Thanks for using this function")

    return mffix
```

Here:

```python
fx
```

is the **original function** (function we will decorate on ), while:

```python
mffix
```

is the **wrapper function**.

The wrapper controls what happens **before and after** the original function.

---

## 3. Using `@decorator`

```python
@greet
def hello():
    print("Hello World")

hello()
```

The `@greet` syntax is equivalent to:

```python
def hello():
    print("Hello World")

hello = greet(hello)
```

### What happens?

```text
Original hello()
       ↓
   greet(hello)
       ↓
   returns mffix
       ↓
hello now points to mffix
       ↓
     hello()
       ↓
    mffix()
       ↓
Extra code → Original hello() → Extra code
```

So when we call:

```python
hello()
```

we are actually calling the **wrapper `mffix()`**.

---

## 4. `function(function_another)`

You can manually apply a decorator:

```python
hello = greet(hello)
```

This is the proper equivalent of:

```python
@greet
def hello():
    ...
```

You might also see:

```python
greet(hello)()
```

This calls the returned wrapper **immediately**, but it does **not replace `hello`**.

Therefore:

```python
hello = greet(hello)
```

is the important equivalent to remember.

---

## 5. Decorators with Arguments

If the original function accepts arguments, the wrapper should usually use:

```python
*args
**kwargs
```

Example:

```python
def greet(fx):
    def mffix(*args, **kwargs):
        print("Good Morning")
        fx(*args, **kwargs)
        print("Thanks for using this function")

    return mffix


@greet
def add(a, b):
    print(a + b)


add(1, 2)
```

### `*args` and `**kwargs`

- `*args` → collects positional arguments into a **tuple**.
    
- `**kwargs` → collects keyword arguments into a **dictionary**.
    

They allow the wrapper to work with functions having different arguments.

```python
fx(*args, **kwargs)
```

passes those arguments to the original function.

---

## 6. The Most Important Concept

Remember:

```python
@greet
def hello():
    ...
```

is simply:

```python
def hello():
    ...

hello = greet(hello)
```

The decorator receives the **original function** and returns a **wrapper function**.

### Mental Model

```text
             Original Function
                    ↓
              greet(function)
                    ↓
                 Wrapper
                    ↓
             Modified Behavior
```

**Decorator = a function that takes a function, wraps it with additional behavior, and returns the wrapper.**