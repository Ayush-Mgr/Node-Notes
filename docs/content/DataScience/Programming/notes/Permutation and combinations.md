-  Permutation the order of object matters if the order of an object is changed, the Permutation will count. the changed object as well.
	- $$P^n_r= \frac{n !}{(n-r)!} $$
	- $P^n_r:$ is the permutation
	- $n:$ is the no of object
	- $r:$  The number of objects selected
- In combination, the order of object does not matter if the order of object is changed, the combination will not count the changed object
	- $$C^n_r = \binom{n}{r} = \frac{n!}{r!(n-r)!}$$
	- $C^n_r$: The number of combinations.
	- $n$: The total number of objects.
	- $r$: The number of objects selected.
	- $n!$: Factorial of $n$, the product of all positive integers from 1 to $n$.
	- $\binom{n}{r}$: The binomial coefficient, often read as "n choose r."
---
**The "MISSISSIPPI" Rule (Permutation with Duplicates)**

- **Problem:** How many ways can you arrange the letters in "DATA"?
    
- **Analysis:** "A" appears twice. Swapping the two As doesn't change the look of the word.
    
- **Formula:** Duplicate1!×Duplicate2!...Total!​
    
- **Calculation:**
    
    - Total letters = 4. 'A' repeats 2 times.
        
    - 2!4!​=224​=12.
        

---

 Common Mistakes

- **Confusing P and C:**
    
    - Ask yourself: "If I swap the position of two items, does the outcome change?"
        
    - **Yes** → Permutation (Ranking, Line-up, Words, Digits).
        
    - **No** → Combination (Committees, Hands of cards, Pizza toppings).
        
- **Factorial 0:** Remember that 0!=1.

---
Tags: #programming #tools


#Algorithms_and_Data_Structures
