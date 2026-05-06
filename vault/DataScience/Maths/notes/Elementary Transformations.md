When working with matrices, you're allowed to perform **3 main elementary transformations** — also called **elementary row operations**. These operations **do not change the solution** of the system; they simply make the matrix easier to work with.

---

#### ✅ 1. Multiply or Divide a Row by a Non-Zero Scalar  
(This is called **row scaling**)

###### 💡 Why?
You're just scaling the entire equation (row). The relationship between variables stays the same — it just becomes easier to read or simplify.

###### 🧪 Example:  
Original equation:  
```
2x + 4y = 10
```

Divide the entire row by `2`:  
```
(2x + 4y)/2 = 10/2 → x + 2y = 5
```

**Matrix form:**  
```
[2  4 | 10]   → divide by 2 →   [1  2 | 5]
```

---

#### ✅ 2. Add or Subtract a Multiple of One Row to Another  
(This is called **row replacement**)

###### 💡 Why?
This helps eliminate variables or simplify rows. You’re using one row to modify another without changing the solution.

###### 🧪 Example:  
Two equations:  
```
Row 1:   x + 2y = 5  
Row 2:   x + 3y = 6
```

Now subtract Row 1 from Row 2:  
```
(x + 3y) - (x + 2y) => 6 - 5 → y = 1
```

**Matrix form:**  
```
[1  2 | 5]
[1  3 | 6]
```

Now do: `R2 = R2 - R1`  
```
[1  2 | 5]
[0  1 | 1]   ← Clean!
```

---

#### ✅ 3. Swap Two Rows  
(This is called **row swapping**)

###### 💡 Why?
Sometimes it's easier to work with a row that has a leading 1, or just to organize your matrix better. Swapping rows changes the order, **not the solution**.

###### 🧪 Example:  
Before:  
```
[2  3 | 4]   (Row 1)  
[1  1 | 2]   (Row 2)
```

After swapping:  
```
[1  1 | 2]   (Now Row 1)  
[2  3 | 4]   (Now Row 2)
```

Still the **same system**, just rearranged.

---

---
Tags: #math #statistics


#Linear_Algebra_and_Matrices
