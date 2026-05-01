### **Matrix Multiplication**  

There are two types of matrix multiplication:  

1. **Scalar Multiplication** (each element is multiplied by a number).  
2. **Matrix Multiplication** (dot product of rows and columns).  

---

### **1. Scalar Multiplication**  
Each element of the matrix is multiplied by a scalar (a single number).  

#### **Example:**  
$$
A =
\begin{bmatrix}
1 & 2 \\
3 & 4
\end{bmatrix}
$$
Multiply by scalar $k = 3$:  

$$
3A =
\begin{bmatrix}
3 \times 1 & 3 \times 2 \\
3 \times 3 & 3 \times 4
\end{bmatrix}
=
\begin{bmatrix}
3 & 6 \\
9 & 12
\end{bmatrix}
$$

---

### **2. Matrix Multiplication (Dot Product)**
To multiply two matrices **$A \times B$**, the **number of columns in $A$** must match the **number of rows in $B$**.  

#### **Example:**  
Multiply **$A_{2×3}$** and **$B_{3×2}$**:  
$$
A =
\begin{bmatrix}
1 & 2 & 3 \\
4 & 5 & 6
\end{bmatrix}
$$

$$
B =
\begin{bmatrix}
7 & 8 \\
9 & 10 \\
11 & 12
\end{bmatrix}
$$

**Step-by-step multiplication:**  
Each element in the result is the **dot product** of the corresponding row from $A$ and column from $B$.

$$
AB =
\begin{bmatrix}
(1 \times 7 + 2 \times 9 + 3 \times 11) & (1 \times 8 + 2 \times 10 + 3 \times 12) \\
(4 \times 7 + 5 \times 9 + 6 \times 11) & (4 \times 8 + 5 \times 10 + 6 \times 12)
\end{bmatrix}
$$

$$
=
\begin{bmatrix}
(7+18+33) & (8+20+36) \\
(28+45+66) & (32+50+72)
\end{bmatrix}
$$

$$
=
\begin{bmatrix}
58 & 64 \\
139 & 154
\end{bmatrix}
$$

---

### **Key Points:**
✅ Matrix multiplication follows the **row-by-column** rule.   Matrix multiplication is only possible if the **number of columns in the first matrix** matches the **number of rows in the second matrix**.

✅ Scalar multiplication is simple (multiply each element by a number).  
✅ Matrix multiplication follows the **row-by-column** rule.  
✅ The resulting matrix has dimensions **(rows of A) × (columns of B)**.  

---
Tags: #math #statistics


#Linear_Algebra_and_Matrices
