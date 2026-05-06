# **Determinant (Det) of a Matrix**  
[yt](https://www.youtube.com/watch?v=CcbyMH3Noow)
The **determinant** of a square matrix is a single number that summarizes important properties of the matrix, such as whether it is invertible. It is denoted as **det(A)** or **|A|**.  

---

## **1. Determinant of a 2×2 Matrix**  

For a matrix:  

$$
A = \begin{bmatrix} a & b \\ c & d \end{bmatrix}
$$

The determinant is:  

$$
\det(A) = ad - bc
$$

**Example:**  

$$
A = \begin{bmatrix} 3 & 2 \\ 5 & 4 \end{bmatrix}
$$

$$
\det(A) = (3 \times 4) - (2 \times 5) = 12 - 10 = 2
$$

---

## **2. Determinant of a 3×3 Matrix**  

For a **3×3** matrix:  

$$
A = \begin{bmatrix} 
a & b & c \\ 
d & e & f \\ 
g & h & i 
\end{bmatrix}
$$

The determinant is calculated as:  

$$
\det(A) = a(ei - fh) - b(di - fg) + c(dh - eg)
$$

**Example:**  

$$
A = \begin{bmatrix} 
1 & 2 & 3 \\ 
4 & 5 & 6 \\ 
7 & 8 & 9 
\end{bmatrix}
$$

$$
\det(A) = 1(5 \times 9 - 6 \times 8) - 2(4 \times 9 - 6 \times 7) + 3(4 \times 8 - 5 \times 7)
$$

$$
= 1(45 - 48) - 2(36 - 42) + 3(32 - 35)
$$

$$
= 1(-3) - 2(-6) + 3(-3) = -3 + 12 - 9 = 0
$$

So, **det(A) = 0**, meaning **A is singular (not invertible).**


## **2. Determinant of a 4×4 Matrix**  

### **Determinant of a 4×4 Matrix Example**  

For a **4×4** matrix:

$$
A =
\begin{bmatrix} 
1 & 2 & 3 & 4 \\ 
5 & 6 & 7 & 8 \\ 
9 & 10 & 11 & 12 \\ 
13 & 14 & 15 & 16 
\end{bmatrix}
$$

The determinant of a **4×4 matrix** can be found using **cofactor expansion** (Laplace expansion). We expand along the **first row**:

$$
\det(A) = a_{11}C_{11} + a_{12}C_{12} + a_{13}C_{13} + a_{14}C_{14}
$$

where **$C_{ij}$** is the determinant of the **3×3 minor** obtained by removing the **i-th row and j-th column**.

---

### **Step-by-Step Expansion**  

Expanding along the first row:

$$
\det(A) = 1 \cdot
\begin{vmatrix} 
6 & 7 & 8 \\ 
10 & 11 & 12 \\ 
14 & 15 & 16 
\end{vmatrix}
- 2 \cdot
\begin{vmatrix} 
5 & 7 & 8 \\ 
9 & 11 & 12 \\ 
13 & 15 & 16 
\end{vmatrix}
+ 3 \cdot
\begin{vmatrix} 
5 & 6 & 8 \\ 
9 & 10 & 12 \\ 
13 & 14 & 16 
\end{vmatrix}
- 4 \cdot
\begin{vmatrix} 
5 & 6 & 7 \\ 
9 & 10 & 11 \\ 
13 & 14 & 15 
\end{vmatrix}
$$

---

### **Step 1: Compute Each 3×3 Determinant**  

Using the determinant formula for a 3×3 matrix:

$$
\begin{vmatrix} 
a & b & c \\ 
d & e & f \\ 
g & h & i 
\end{vmatrix}
= a(ei - fh) - b(di - fg) + c(dh - eg)
$$

#### **First minor**:

$$
\begin{vmatrix} 
6 & 7 & 8 \\ 
10 & 11 & 12 \\ 
14 & 15 & 16 
\end{vmatrix}
$$

$$
= 6(11 \times 16 - 12 \times 15) - 7(10 \times 16 - 12 \times 14) + 8(10 \times 15 - 11 \times 14)
$$

$$
= 6(176 - 180) - 7(160 - 168) + 8(150 - 154)
$$

$$
= 6(-4) - 7(-8) + 8(-4) = -24 + 56 - 32 = 0
$$

#### **Other minors**:

Since all the **3×3 determinants evaluate to 0**, it means:

$$
\det(A) = 0
$$

---

### **Final Answer**
$$
\det(A) = 0
$$

Since the determinant is **0**, matrix **A is singular** (not invertible).  


---

## **3. Determinant of an n×n Matrix**  

For larger matrices (**n ≥ 4**), the determinant is found using **cofactor expansion** (Laplace expansion) or **row reduction**.  

### **General Properties of Determinants**  

1. **If det(A) = 0**, the matrix **is singular** (not invertible).  
2. **If det(A) ≠ 0**, the matrix **is invertible** (has an inverse).  
3. **det(AB) = det(A) × det(B)** (multiplicative property).  
4. **det(A⁻¹) = 1 / det(A)**, if A is invertible.  
5. Swapping two rows **multiplies det(A) by -1**.  
6. Multiplying a row by a scalar **multiplies det(A) by that scalar**.  

---


---
Tags: #math #statistics


#Linear_Algebra_and_Matrices
