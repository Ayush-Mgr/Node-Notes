 

📌 **Lists** are ordered, mutable collections that can store multiple data types.

---

## **🛠 Creating a List**  
```python
# Empty list
my_list = []

# List with elements
numbers = [1, 2, 3, 4, 5]
mixed = [1, "hello", 3.14, True]
```

---

## **🔄 Accessing Elements**  
```python
my_list = ["apple", "banana", "cherry"]

print(my_list[0])   # First element → apple
print(my_list[-1])  # Last element → cherry
```

---

## **✏️ Modifying a List**  
```python
my_list[1] = "orange"  # Change element
my_list.append("grape") # Add at the end
my_list.insert(1, "kiwi") # Insert at index
my_list.extend((3,1),(3,2)) # add 3,1,3,2 as int not tuple
```

---

## **❌ Removing Elements**  
```python
my_list.remove("banana")  # Remove by value
popped = my_list.pop()    # Remove last item
del my_list[0]            # Delete by index
```

---

## **📌 List Operations**  
```python
numbers = [1, 2, 3]
print(len(numbers))        # Length of list
print(numbers + [4, 5])    # Concatenation
print(numbers * 2)         # Repetition
```

---

## **📌 Looping Through a List**  
```python
for item in my_list:
    print(item)
```

---

## **🔍 Checking for an Element**  
```python
if "apple" in my_list:
    print("Found!")
```

---

## **🧹 List Comprehension**  
```python
squares = [x**2 for x in range(5)]
print(squares)  # [0, 1, 4, 9, 16]
```


---

📌 **Lists are one of the most powerful and flexible data structures in Python!** 🚀  

---
Tags: #programming #tools


#Python_Basics
