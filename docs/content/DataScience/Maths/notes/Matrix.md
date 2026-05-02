You're on the right track, but let's refine your definition for better clarity and accuracy.

### Corrected Definition:
A **matrix** is a rectangular array of numbers, arranged in rows and columns. Each row or column can be considered a vector in some cases. Matrices are widely used in mathematics, physics, computer science, and machine learning to represent and manipulate large amounts of data efficiently.

### Matrix Representation:
An $m \times n$ (read as "m by n") matrix has **m rows** and **n columns**:
$$
A =
\begin{bmatrix}
a_{11} & a_{12} & \dots & a_{1n} \\
a_{21} & a_{22} & \dots & a_{2n} \\
\vdots & \vdots & \ddots & \vdots \\
a_{m1} & a_{m2} & \dots & a_{mn}
\end{bmatrix}
$$
Each **column** can be treated as a vector:
$$
A = \begin{bmatrix} v_1 & v_2 & \dots & v_n \end{bmatrix}
$$
where $v_i$ represents a column vector.

### Basic Matrix Operations:
1. **[[Addition & Subtraction of Matrix|Addition & Subtraction]]**: Possible when matrices have the same dimensions.
2. **[[Matrix Multiplication|Multiplication ]]**:
   - **Scalar multiplication** (each element is multiplied by a number).
   - **Matrix multiplication** (dot product of rows and columns).
3. **[[Transpose of Matrix & Symmetric Matrix|Transpose]]**: Flipping rows and columns.

## properties of Matrix
Here’s a detailed explanation of each property:

---

## **1. Associativity of Matrix Multiplication**
$$
\forall A \in \mathbb{R}^{m \times n}, B \in \mathbb{R}^{n \times p}, C \in \mathbb{R}^{p \times q}: (AB)C = A(BC) \quad (2.18)
$$

### **Understanding the Equation**
This property states that **matrix multiplication is associative**, meaning the order of grouping does not matter.  

If we have three matrices:  
- $A$ of size **$m \times n$**
- $B$ of size **$n \times p$**
- $C$ of size **$p \times q$**  

Then, we can multiply them in **either** of the following ways:  
1. First, multiply **$A$ and $B$** to get **$AB$** (which is of size $m \times p$), then multiply that with $C$.
2. First, multiply **$B$ and $C$** to get **$BC$** (which is of size $n \times q$), then multiply that with $A$.

The result remains the same:
$$
(AB)C = A(BC)
$$

### **Example**
Let:
$$
A = \begin{bmatrix} 1 & 2 \\ 3 & 4 \end{bmatrix}, \quad
B = \begin{bmatrix} 5 & 6 \\ 7 & 8 \end{bmatrix}, \quad
C = \begin{bmatrix} 9 & 10 \\ 11 & 12 \end{bmatrix}
$$

Calculate **(AB)C**:
1. Compute **$AB$**:
   $$
   AB =
   \begin{bmatrix} 1(5) + 2(7) & 1(6) + 2(8) \\ 3(5) + 4(7) & 3(6) + 4(8) \end{bmatrix}
   =
   \begin{bmatrix} 19 & 22 \\ 43 & 50 \end{bmatrix}
   $$

2. Compute **$(AB)C$**:
   $$
   (AB)C =
   \begin{bmatrix} 19(9) + 22(11) & 19(10) + 22(12) \\ 43(9) + 50(11) & 43(10) + 50(12) \end{bmatrix}
   =
   \begin{bmatrix} 379 & 418 \\ 857 & 946 \end{bmatrix}
   $$

Now, calculate **A(BC)**:
1. Compute **$BC$**:
   $$
   BC =
   \begin{bmatrix} 5(9) + 6(11) & 5(10) + 6(12) \\ 7(9) + 8(11) & 7(10) + 8(12) \end{bmatrix}
   =
   \begin{bmatrix} 99 & 114 \\ 149 & 172 \end{bmatrix}
   $$

2. Compute **$A(BC)$**:
   $$
   A(BC) =
   \begin{bmatrix} 1(99) + 2(149) & 1(114) + 2(172) \\ 3(99) + 4(149) & 3(114) + 4(172) \end{bmatrix}
   =
   \begin{bmatrix} 379 & 418 \\ 857 & 946 \end{bmatrix}
   $$

Since $(AB)C = A(BC)$, associativity holds.

---

## **2. Distributivity of Matrix Multiplication**
$$
\forall A, B \in \mathbb{R}^{m \times n}, C, D \in \mathbb{R}^{n \times p}:
$$

$$
(A + B)C = AC + BC \quad (2.19a)
$$
$$
A(C + D) = AC + AD \quad (2.19b)
$$

### **Understanding the Equations**
This property states that matrix multiplication distributes over matrix addition.

- **Left Distributive Property (2.19a)**:  
  When you add two matrices and then multiply by another matrix, you get the same result as if you had multiplied each matrix separately and then added the results.
  
- **Right Distributive Property (2.19b)**:  
  When a matrix is multiplied by the sum of two matrices, it is the same as multiplying it by each separately and adding them.

### **Example**
Let:
$$
A = \begin{bmatrix} 1 & 2 \\ 3 & 4 \end{bmatrix}, \quad
B = \begin{bmatrix} 5 & 6 \\ 7 & 8 \end{bmatrix}, \quad
C = \begin{bmatrix} 9 & 10 \\ 11 & 12 \end{bmatrix}
$$

Compute **(A + B)C**:
1. Add $A$ and $B$:
   $$
   A + B =
   \begin{bmatrix} 1+5 & 2+6 \\ 3+7 & 4+8 \end{bmatrix}
   =
   \begin{bmatrix} 6 & 8 \\ 10 & 12 \end{bmatrix}
   $$

2. Multiply by $C$:
   $$
   (A + B)C =
   \begin{bmatrix} 6(9) + 8(11) & 6(10) + 8(12) \\ 10(9) + 12(11) & 10(10) + 12(12) \end{bmatrix}
   =
   \begin{bmatrix} 150 & 168 \\ 222 & 248 \end{bmatrix}
   $$

Now, compute **AC + BC** separately:
- Compute **$AC$** and **$BC$** (using the same multiplication rules).
- Add the results.

The result will match **(A + B)C**, proving distributivity.

---

## **3. Multiplication with the Identity Matrix**
$$
\forall A \in \mathbb{R}^{m \times n} : I_m A = A I_n = A \quad (2.20)
$$

### **Understanding the Equation**
- $I_m$ is the **identity matrix** of size $m \times m$.
- $I_n$ is the **identity matrix** of size $n \times n$.
- When you multiply any matrix $A$ with the identity matrix, it remains unchanged.

$$
I_m A = A
$$
$$
A I_n = A
$$

However, **$I_m \neq I_n$ if $m \neq n$** because their sizes differ.

### **Example**
Let:
$$
A = \begin{bmatrix} 2 & 3 \\ 4 & 5 \end{bmatrix}, \quad
I_2 = \begin{bmatrix} 1 & 0 \\ 0 & 1 \end{bmatrix}
$$

Compute $I_2 A$:

$$
I_2 A =
\begin{bmatrix} 1 & 0 \\ 0 & 1 \end{bmatrix}
\begin{bmatrix} 2 & 3 \\ 4 & 5 \end{bmatrix}
=
\begin{bmatrix} 2(1) + 3(0) & 2(0) + 3(1) \\ 4(1) + 5(0) & 4(0) + 5(1) \end{bmatrix}
=
\begin{bmatrix} 2 & 3 \\ 4 & 5 \end{bmatrix} = A
$$

The identity matrix behaves like **1** in number multiplication.

---

### **Summary**
✔ **Associativity**: Matrix multiplication is associative.  
✔ **Distributivity**: Matrix multiplication distributes over addition.  
✔ **Identity Matrix**: Multiplying a matrix by an identity matrix leaves it unchanged.  


---
Tags: #math #statistics


#Linear_Algebra_and_Matrices
