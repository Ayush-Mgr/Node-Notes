### **Matrix Transpose**  

The **transpose** of a matrix is obtained by **flipping it over its diagonal**, meaning **rows become columns, and columns become rows**.  

#### **Notation**  
The transpose of a matrix $A$ is written as $A^T$.  

---

### **Example 1: Transpose of a $2 \times 3$ Matrix**  

$$
A =
\begin{bmatrix}
1 & 2 & 3 \\
4 & 5 & 6
\end{bmatrix}
$$

**Step-by-step Transpose:**  
- The **first row** $[1, 2, 3]$ becomes the **first column**.  
- The **second row** $[4, 5, 6]$ becomes the **second column**.  

$$
A^T =
\begin{bmatrix}
1 & 4 \\
2 & 5 \\
3 & 6
\end{bmatrix}
$$

---

### **Example 2: Transpose of a $3 \times 3$ Matrix**  

$$
B =
\begin{bmatrix}
7 & 8 & 9 \\
10 & 11 & 12 \\
13 & 14 & 15
\end{bmatrix}
$$

$$
B^T =
\begin{bmatrix}
7 & 10 & 13 \\
8 & 11 & 14 \\
9 & 12 & 15
\end{bmatrix}
$$

---

### **Key Properties of Transpose:**
1. **Double Transpose**: $(A^T)^T = A$  
2. **Transpose of a Sum**: $(A + B)^T = A^T + B^T$  
3. **Transpose of a Product**: $(AB)^T = B^T A^T$  


# Symmetric Matrix
when matrix: 
- $A =A^{T}$: when the matrix a is equals to its transpose
- $A_{n \times {n}}$ only square metrics could be semantic matrix 
- The sum of symmetric matrices is always symmetric
	- $$\begin{bmatrix}2&3\\3&4\end{bmatrix}+
		\begin{bmatrix}1&5\\5&6\end{bmatrix}=
		\begin{bmatrix}3&8\\8&10\end{bmatrix}$$
- the. Product of two symmetric metrics are *not* always symmetric.
	- $$\begin{bmatrix}1&0\\0&0\end{bmatrix}+
		\begin{bmatrix}0&0\\0&0\end{bmatrix}=
		\begin{bmatrix}1&1\\0&0\end{bmatrix}$$


---
Tags: #math #statistics


#Linear_Algebra_and_Matrices
