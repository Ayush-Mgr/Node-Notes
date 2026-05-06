

In Python classes, `super()` is used to call a method from a parent (or superclass), often in inheritance.



### 🔹 Use of `super()`

```python
class Dog(Animal):
    def speak(self):
        super().speak()     # Calls Animal's speak()
        print("Dog barks")  # Adds to it
```

Output:

```
Animal speaks
Dog barks
```

---

In short:

- **Parent class** defines general behavior.
    
- **Child class** inherits and customizes it.
    
- `super()` lets child access parent’s methods.

### Basic Use:


```python
class Parent:
    def __init__(self):
        print("Parent init")

class Child(Parent):
    def __init__(self):
        super().__init__()  # calls Parent's __init__
        print("Child init")

c = Child()
```

### Output:

```
Parent init
Child init
```




## setting parent attributes

 you can set or modify parent class attributes from a child class.

---

### 🔹 Example: Setting a Parent Attribute in Child

```python
class Parent:
    def __init__(self):
        self.value = 10

class Child(Parent):
    def __init__(self):
        super().__init__()
        self.value = 20  # modifies parent's 'value' attribute

c = Child()
print(c.value)  # Output: 20
```

> You're not modifying the parent **class itself**, but the **instance** created from it. Since the child inherits from the parent, it can access and change instance attributes.

---

### 🔹 Adding New Attributes in Child

```python
class Child(Parent):
    def __init__(self):
        super().__init__()
        self.new_attr = 99  # totally new attribute
```

✔️ Totally valid — child instances can have more attributes than the parent.

---

Want an example with method override or attribute shadowing?


### Key Points:

- `super()` gives you access to methods from the parent class without hardcoding the parent’s name.
    
- It's mostly used in `__init__`, but works with any method.
    
- It respects the method resolution order (MRO), important for multiple inheritance.
    

Let me know if you want a quick example with multiple inheritance.

---
Tags: #programming #tools


#Python_Basics
