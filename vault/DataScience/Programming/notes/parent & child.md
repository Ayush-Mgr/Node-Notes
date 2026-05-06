Here's a **concise explanation** of parent and child classes in Python:

---

### 🔹 **Parent Class (Base Class)**

A general class that defines common behavior.

```python
class Animal:  # Parent class
    def speak(self):
        print("Animal speaks")
```

---

### 🔹 **Child Class (Derived Class)**

A class that **inherits** from the parent and can:

- Reuse its methods
    
- Override or extend them
    

```python
class Dog(Animal):  # Child class
    def speak(self):
        print("Dog barks")  # Overrides parent method
```

---

### 🔹 Example in Action

```python
a = Animal()
a.speak()  # Output: Animal speaks

d = Dog()
d.speak()  # Output: Dog barks
```

---

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

---
Tags: #programming #tools


#Python_Basics
