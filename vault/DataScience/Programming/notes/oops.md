## DEFINATION & CONTENT 

**Classes** are blueprints that define the properties and behaviors of objects. They act as templates for creating objects.

**Objects** are instances of classes. They represent specific things in the real world that have properties (attributes) and behaviors (methods).

**Inheritance** allows you to create new classes (subclasses) that inherit properties and behaviors from existing classes (parent classes). This

### use OOPS
- **Reusability:** You can avoid code duplication by inheriting common properties and behaviors from parent classes.
- **Maintainability:** Changes made to the parent class are automatically reflected in its subclasses.
- **Organization:** Inheritance helps you structure your code in a logical way, making it easier to understand and manage.
## CLASS AND OBJECT
- class (dog) : name, age , behavior  ,  object (D1) : Woofie  , 21 , angry.

``` 
class Dog:
    def __init__(self, name, age,behaviour):
        self.name = name
        self.age = age
        self.behaviour = behaviour
        
    def getname(self):
        return self.name
        
    def getage(self):
        return self.age
        
    def get_behaviour(self):
	    return self.behaviour
	    
D1 = Dog("woofie", 21,"angry")
print(D1.getname(),D1.getage())
``` 

### Explanation:
- The class `Dog` serves as a blueprint for creating dog objects with attributes like `name`, `age`, and `behaviour`.
- When you create `D1 = Dog("woofie", 21, "angry")`, you're creating a specific dog object (`D1`) with those attributes.
- You then use the methods `getname()` and `getage()` to access and print the attributes of the `D1` object.

### Code Breakdown:

1. **Class Definition**:
   - `class Dog:`: This defines a class named `Dog`.
   
2. **`__init__()` Method**:
   - The `__init__` method is a constructor in Python, used to initialize an object's attributes when it is created. In this case, `name`, `age`, and `behaviour` are initialized as attributes of the `Dog` class.
   - `self.name = name`: This assigns the value of the `name` parameter to the `name` attribute of the object.
   - Similarly, `self.age` and `self.behaviour` are initialized with the values passed to the constructor.

3. **Methods to Get Attributes**:
   - `getname()`, `getage()`, and `get_behaviour()` are methods that return the respective attributes of the `Dog` object.

4. **Creating an Object**:
   - `D1 = Dog("woofie", 21, "angry")`: This creates an object `D1` of the `Dog` class with `name` set to `"woofie"`, `age` set to `21`, and `behaviour` set to `"angry"`.

5. **Printing Attributes**:
   - `print(D1.getname(), D1.getage())`: This calls the `getname()` and `getage()` methods of the `D1` object and prints the `name` and `age` attributes.

### Output:
```
woofie 21
```

This prints the `name` and `age` of the `D1` object, which is `"woofie"` and `21`, respectively.

---
Tags: #programming #tools


#Python_Basics
