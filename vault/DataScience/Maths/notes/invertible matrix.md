you can think of an **invertible matrix** as being similar to the **reciprocal** of a number, but for matrices.  
- not every matrix A possesses an inverse $A ^{−1}$
- AB = [[Identity Matrix|I]] = BA
	- B = inverse of A

Two ways to Calculate :
1. [[invertible matrix#^c212d7|Finding]] Invertible matrix with [[Gaussian Elimination|Gaussian method]]
2. [[invertible matrix#^2ca463|Formula]]

---

## **What Does "Invertible" Mean?**  
A **square matrix $A$ is invertible** if there exists another matrix $A^{-1}$ (called the **inverse** of $A$) such that:  

$$
A \cdot A^{-1} = I_n
$$

where **$I_n$ is the [[identity matrix]]** of the same size as $A$.  

Just like how for a number $x$, its reciprocal satisfies:  

$$
x \cdot \frac{1}{x} = 1, \quad \text{if } x \neq 0
$$

For a matrix, the inverse $A^{-1}$ satisfies:  

$$
A \cdot A^{-1} = I
$$


---
## inverse matrix

An **inverse matrix** $A^{-1}$ is a special matrix that, when multiplied by the original matrix $A$, gives the **identity matrix** $I_n$:  

$$
A \cdot A^{-1} = A^{-1} \cdot A = I_n
$$

This is similar to how multiplying a number by its reciprocal gives **1**:  

$$
x \times \frac{1}{x} = 1, \quad \text{(if $x \neq 0$)}
$$

For example, with a **2×2 matrix**:  

$$
A =
\begin{bmatrix} 
2 & 3 \\ 
1 & 4 
\end{bmatrix}
$$

The inverse is:  

$$
A^{-1} =
\begin{bmatrix} 
\frac{4}{5} & -\frac{3}{5} \\ 
-\frac{1}{5} & \frac{2}{5} 
\end{bmatrix}
$$

When you multiply them:

$$
A \cdot A^{-1} =
\begin{bmatrix} 
2 & 3 \\ 
1 & 4 
\end{bmatrix}
\cdot
\begin{bmatrix} 
\frac{4}{5} & -\frac{3}{5} \\ 
-\frac{1}{5} & \frac{2}{5} 
\end{bmatrix}
$$

$$
=
\begin{bmatrix} 
(2 \times \frac{4}{5}) + (3 \times -\frac{1}{5}) & (2 \times -\frac{3}{5}) + (3 \times \frac{2}{5}) \\ 
(1 \times \frac{4}{5}) + (4 \times -\frac{1}{5}) & (1 \times -\frac{3}{5}) + (4 \times \frac{2}{5}) 
\end{bmatrix}
$$

$$
=
\begin{bmatrix} 
\frac{8}{5} - \frac{3}{5} & -\frac{6}{5} + \frac{6}{5} \\ 
\frac{4}{5} - \frac{4}{5} & -\frac{3}{5} + \frac{8}{5} 
\end{bmatrix}
$$

$$
=
\begin{bmatrix} 
1 & 0 \\ 
0 & 1 
\end{bmatrix} = I_2
$$

Since the result is the **identity matrix**, this proves $A^{-1}$ is the correct inverse of $A$. 🎯  








---

## **Formula Formation**  
^2ca463
#### **Step 1: Given Matrix and Its [[Adjoint]]**
We start with the $2 \times 2$ matrix $A$:

$$
A = \begin{bmatrix} a_{11} & a_{12} \\ a_{21} & a_{22} \end{bmatrix}
$$

We define another matrix ( Adjoint of A ) $A'$ as:

$$
A' = \begin{bmatrix} a_{22} & -a_{12} \\ -a_{21} & a_{11} \end{bmatrix}
$$
here we:
- add this sign
$$
\begin{bmatrix}
+ & - & + \\
- & + & - \\
+ & - & +
\end{bmatrix}
$$
-  then Transpose the result

#### **Step 2: Multiply $AA'$**
Multiplying $A$ and $A'$:

$$
AA' = \begin{bmatrix} a_{11} & a_{12} \\ a_{21} & a_{22} \end{bmatrix} \begin{bmatrix} a_{22} & -a_{12} \\ -a_{21} & a_{11} \end{bmatrix}
$$

Computing each element:

- First row, first column:
  
  $$
  (a_{11} \cdot a_{22}) + (a_{12} \cdot -a_{21}) = a_{11} a_{22} - a_{12} a_{21}
  $$

- First row, second column:

  $$
  (a_{11} \cdot -a_{12}) + (a_{12} \cdot a_{11}) = -a_{11} a_{12} + a_{12} a_{11} = 0
  $$

- Second row, first column:

  $$
  (a_{21} \cdot a_{22}) + (a_{22} \cdot -a_{21}) = a_{21} a_{22} - a_{21} a_{22} = 0
  $$

- Second row, second column:

  $$
  (a_{21} \cdot -a_{12}) + (a_{22} \cdot a_{11}) = -a_{21} a_{12} + a_{22} a_{11} = a_{11} a_{22} - a_{12} a_{21}
  $$

Thus, we get:

$$
AA' = \begin{bmatrix} a_{11} a_{22} - a_{12} a_{21} & 0 \\ 0 & a_{11} a_{22} - a_{12} a_{21} \end{bmatrix}
$$

This simplifies to:

$$
AA' = (a_{11} a_{22} - a_{12} a_{21}) I
$$

where:

$$
I = \begin{bmatrix} 1 & 0 \\ 0 & 1 \end{bmatrix}
$$

#### **Step 3: Computing the Inverse**
Since we have:

$$
AA' = (\det A) I
$$

where the [[Determinant (Det) of a Matrix|determinant]] of $A$ is:

$$
\det(A) = a_{11} a_{22} - a_{12} a_{21}
$$

We solve for $A^{-1}$ by dividing both sides by $\det(A)$:

$$
A^{-1} = \frac{1}{\det A} A'
$$

Substituting $A'$:

$$
A^{-1} = \frac{1}{a_{11} a_{22} - a_{12} a_{21}} \begin{bmatrix} a_{22} & -a_{12} \\ -a_{21} & a_{11} \end{bmatrix}
$$

#### **Conclusion**
The inverse of a $2 \times 2$ matrix is:

$$
A^{-1} = \frac{1}{\det A} \begin{bmatrix} a_{22} & -a_{12} \\ -a_{21} & a_{11} \end{bmatrix}, \quad \text{where } \det A \neq 0.
$$

This formula is only valid if the determinant is **nonzero** (i.e., $\det A \neq 0$), ensuring that $A$ is invertible.

### **Example Calculation**  
Let:

$$
A =
\begin{bmatrix} 
2 & 3 \\ 
1 & 4 
\end{bmatrix}
$$

First, find $\det(A)$:  

$$
\det(A) = (2 \times 4) - (3 \times 1) = 8 - 3 = 5
$$

Since $\det(A) \neq 0$, the matrix **is invertible**, and its inverse is:

$$
A^{-1} = \frac{1}{5}
\begin{bmatrix} 
4 & -3 \\ 
-1 & 2 
\end{bmatrix}
$$

$$
A^{-1} =
\begin{bmatrix} 
\frac{4}{5} & -\frac{3}{5} \\ 
-\frac{1}{5} & \frac{2}{5} 
\end{bmatrix}
$$

---


## Finding Invertible matrix with [[Gaussian Elimination|Gaussian method]] 

^c212d7

### Goal:
Turn  
$$
[A \,|\, I]
$$  
into  
$$
[I \,|\, A^{-1}]
$$  
by applying row operations to both sides.

---


---

### 🧊 Crystal Clear Example

Let’s take a **2×2 matrix** for simplicity:

$$
A =
\begin{bmatrix}
2 & 1 \\
5 & 3
\end{bmatrix}
$$

### Step 1: Create the augmented matrix   $[A \,|\, I]$ 

$$
\left[
\begin{array}{cc|cc}
2 & 1 & 1 & 0 \\
5 & 3 & 0 & 1 \\
\end{array}
\right]
$$

---

### Step 2: Apply row operations to turn the **left** into identity

We’ll do Gaussian elimination here:

#### 1️⃣ Make the top-left element a 1:  
Divide row 1 by 2:

$$
R_1 \gets \frac{1}{2} R_1
\Rightarrow
\left[
\begin{array}{cc|cc}
1 & 0.5 & 0.5 & 0 \\
5 & 3 & 0 & 1 \\
\end{array}
\right]
$$

#### 2️⃣ Eliminate below the pivot (make 5 → 0):  
$$
R_2 \gets R_2 - 5 \times R_1
\Rightarrow
\left[
\begin{array}{cc|cc}
1 & 0.5 & 0.5 & 0 \\
0 & 0.5 & -2.5 & 1 \\
\end{array}
\right]
$$

#### 3️⃣ Make pivot 0.5 into 1:  
$$
R_2 \gets 2 \times R_2
\Rightarrow
\left[
\begin{array}{cc|cc}
1 & 0.5 & 0.5 & 0 \\
0 & 1 & -5 & 2 \\
\end{array}
\right]
$$

#### 4️⃣ Eliminate above the pivot (make 0.5 → 0):  
$$
R_1 \gets R_1 - 0.5 \times R_2
\Rightarrow
\left[
\begin{array}{cc|cc}
1 & 0 & 3 & -1 \\
0 & 1 & -5 & 2 \\
\end{array}
\right]
$$

---

### ✅ Result:
Left side is now identity →  
Right side is the **inverse of A**:

$$
A^{-1} =
\begin{bmatrix}
3 & -1 \\
-5 & 2
\end{bmatrix}
$$

---

| Step | Action                | Goal            |
| ---- | --------------------- | --------------- |
| 1    | Form   $[A \,\|\, I]$ | $[ I\|A^{-1} ]$ |


---

---
### **Non-Invertible (Singular) Matrices**  
A matrix is **not invertible** (also called **singular**) if its determinant is **0**.  

For example:

$$
B =
\begin{bmatrix} 
1 & 2 \\ 
2 & 4 
\end{bmatrix}
$$

$$
\det(B) = (1 \times 4) - (2 \times 2) = 4 - 4 = 0
$$

Since $\det(B) = 0$, matrix **B is singular** and has **no inverse**.  

##  Inverse of Transpose
if $A$ is invertible, then so is $A^⊤$, and  
$$(A^{−1})^⊤ = (A^⊤)^{−1} =: A^{−⊤}$$

---

### **Key Takeaways**  
✅ **Invertible (Non-Singular) Matrix**: $\det(A) \neq 0$, has an inverse $A^{-1}$.  
❌ **Non-Invertible (Singular) Matrix**: $\det(A) = 0$, no inverse exists.  




---
Tags: #math #statistics


#Linear_Algebra_and_Matrices
