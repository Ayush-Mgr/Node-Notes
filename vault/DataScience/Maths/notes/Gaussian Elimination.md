## **What is Gaussian Elimination?**

**Gaussian elimination** is a method used to solve systems of linear equations. The goal of Gaussian elimination is to transform the system of equations (represented as an [[augmented matrix]]) into an upper triangular form using [[Elementary Transformations]]
upper triangular form: ^bdb5c0

$$

\begin{bmatrix}
a_{11} & a_{12} & a_{13} & \cdots & a_{1n} \\
\textcolor{yellow}{0} & a_{22} & a_{23} & \cdots & a_{2n} \\
\textcolor{yellow}{0} & \textcolor{yellow}{0} & a_{33} & \cdots & a_{3n} \\
\vdots & \vdots & \vdots & \ddots & \vdots \\
\textcolor{yellow}{0} & \textcolor{yellow}{0} & \textcolor{yellow}{0} & \cdots & a_{nn}
\end{bmatrix}
$$
- where all the elements below the main diagonal are zero.
- From this form, the system can be solved easily using **back-substitution**.

### **Steps of Gaussian Elimination:**
1. **Form the [[augmented matrix]]** of the system of equations.
2. **Use row operations** to create zeros below the main diagonal of the matrix (i.e., make the matrix upper triangular).
3. **Back-substitution**: Once the matrix is in upper triangular form, solve the system by substituting back from the last row upwards.

### **Row Operations in Gaussian Elimination:**
1. **Swap rows**: You can swap two rows if needed.
2. **Multiply a row by a non-zero scalar**: This is used to simplify the coefficients.
3. **Add a multiple of one row to another**: This operation eliminates terms in a column below the pivot.

---

### **Example:**

Let's solve the following system of linear equations using Gaussian elimination:

$$
\begin{aligned}
x + 2y + 3z &= 9 \\
2x + 3y + 1z &= 8 \\
3x + y + 2z &= 7
\end{aligned}
$$

#### **Step 1: Write the augmented matrix**

The system can be written as the following augmented matrix:

$$
\begin{bmatrix}
1 & 2 & 3 & | & 9 \\
2 & 3 & 1 & | & 8 \\
3 & 1 & 2 & | & 7
\end{bmatrix}
$$

#### **Step 2: Eliminate terms below the pivot in the first column**

The first pivot is $1$ in the first row, first column. We will use it to make the elements below it zero.

- To eliminate the $2$ in the second row, first column, perform the row operation:
  $$
  R_2 = R_2 - 2R_1
  $$
  This gives:
  $$
  R_2 = [2, 3, 1 | 8] - 2 \times [1, 2, 3 | 9]
  $$
  $$
  R_2 = [2 - 2, 3 - 4, 1 - 6 | 8 - 18]
  $$
  $$
  R_2 = [0, -1, -5 | -10]
  $$

- To eliminate the $3$ in the third row, first column, perform the row operation:
  $$
  R_3 = R_3 - 3R_1
  $$
  This gives:
  $$
  R_3 = [3, 1, 2 | 7] - 3 \times [1, 2, 3 | 9]
  $$
  $$
  R_3 = [3 - 3, 1 - 6, 2 - 9 | 7 - 27]
  $$
  $$
  R_3 = [0, -5, -7 | -20]
  $$

Now, the augmented matrix looks like this:

$$
\begin{bmatrix}
1 & 2 & 3 & | & 9 \\
0 & -1 & -5 & | & -10 \\
0 & -5 & -7 & | & -20
\end{bmatrix}
$$

#### **Step 3: Eliminate the terms below the second pivot in the second column**

Now, the second pivot is $-1$ in the second row, second column. We will use it to eliminate the $-5$ in the third row, second column.

- To eliminate the $-5$ in the third row, second column, perform the row operation:
  $$
  R_3 = R_3 - 5R_2
  $$
  This gives:
  $$
  R_3 = [0, -5, -7 | -20] - 5 \times [0, -1, -5 | -10]
  $$
  $$
  R_3 = [0 - 0, -5 + 5, -7 + 25 | -20 + 50]
  $$
  $$
  R_3 = [0, 0, 18 | 30]
  $$

Now, the augmented matrix looks like this:

$$
\begin{bmatrix}
1 & 2 & 3 & | & 9 \\
0 & -1 & -5 & | & -10 \\
0 & 0 & 18 & | & 30
\end{bmatrix}
$$

#### **Step 4: Back-substitution**

Now that the matrix is in upper triangular form, we can solve for the variables using back-substitution.

From the third row:
$$
18z = 30
$$
$$
z = \frac{30}{18} = \frac{5}{3}
$$

From the second row:
$$
-y - 5z = -10
$$
Substitute $z = \frac{5}{3}$:
$$
-y - 5 \times \frac{5}{3} = -10
$$
$$
-y - \frac{25}{3} = -10
$$
$$
-y = -10 + \frac{25}{3} = \frac{-30 + 25}{3} = \frac{-5}{3}
$$
$$
y = \frac{5}{3}
$$

From the first row:
$$
x + 2y + 3z = 9
$$
Substitute $y = \frac{5}{3}$ and $z = \frac{5}{3}$:
$$
x + 2 \times \frac{5}{3} + 3 \times \frac{5}{3} = 9
$$
$$
x + \frac{10}{3} + \frac{15}{3} = 9
$$
$$
x + \frac{25}{3} = 9
$$
$$
x = 9 - \frac{25}{3} = \frac{27}{3} - \frac{25}{3} = \frac{2}{3}
$$

#### **Final Solution:**

The solution to the system of equations is:

$$
x = \frac{2}{3}, \quad y = \frac{5}{3}, \quad z = \frac{5}{3}
$$

---

### **Summary of Gaussian Elimination:**
- **Gaussian Elimination** transforms the system of equations into an upper triangular matrix (or row echelon form).
- Once the system is in upper triangular form, you can solve for the variables using **back-substitution**.
- The process involves using **row operations** to eliminate terms below the pivots, creating a system that is easier to solve.

This is a systematic method that can be used for both **[[Homogeneous Linear Systems|homogeneous]]** and **[[system of linear equations|non-homogeneous]]** systems of linear equations.

---
Tags: #math #statistics


#Linear_Algebra_and_Matrices
