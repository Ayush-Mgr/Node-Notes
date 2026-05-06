Lets you generate random variable 
- `Import Random as rd` : imports random lib. as rd
- functions
	- `rd.random()` : `rd` is the random lib. and  `random()` is the function which allows you to generate random variable. 
	- `rd.randint(x , y)`  :  returns random variable between the range  `x` and  `y`
	- `rd.choise(x)`  : return  random index of the `x`  where `x`  = Lists , Tuples , Strings , Ranges or Any custom object that implements the sequence protocol
	- `rd.randrange(x,y,s)` : returns random variable between the range  `x` and  `y`
		- `y`  is exclusive 
		- `s` :  the steps  it is optional and defines the no of steps or no of var to skip eg, $1,2,3,4,5,6,7,8,9,10$ skipping 2 steps     $1, 3, 5, 7, 9$
	- 
	- 
### **`random.choices()` 

**Definition:**  
`random.choices()` is a function in Python’s **`random`** module used to randomly select **multiple elements** from a sequence (like a list, tuple, or string) — **with replacement**.

---

**Syntax:**

```python
random.choices(population, weights=None, *, cum_weights=None, k=1)
```

**Parameters:**

- **`population`** → The list or sequence to choose elements from.
    
- **`weights`** _(optional)_ → Assigns relative probabilities to each element.
    
- **`cum_weights`** _(optional)_ → Cumulative weights (alternative to `weights`).
    
- **`k`** → Number of elements to pick (default is `1`).
    

---

**Key Point:**  
Unlike `random.choice()`, which returns **a single random element**,  
`random.choices()` returns a **list** and allows **repetition** (sampling with replacement).

---

**Example:**

```python
import random

fruits = ['apple', 'banana', 'cherry']
result = random.choices(fruits, weights=[10, 5, 1], k=5)
print(result)
```

Output (example):

```
['apple', 'apple', 'banana', 'apple', 'cherry']
```

---

**Use Cases:**

- Weighted random sampling (e.g., simulating biased outcomes).
    
- Creating random datasets.
    
- Monte Carlo simulations.
    

---

**Summary Table:**

|Method|Returns|Replacement|Supports Weights|
|---|---|---|---|
|`random.choice()`|Single item|No|No|
|`random.choices()`|List of items|Yes|Yes|

---
Tags: #web-dev


#Miscellaneous
