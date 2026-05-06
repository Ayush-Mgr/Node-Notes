

### 1. **Definition of Homogeneous Linear Systems**

A **homogeneous linear system** is a [[system of linear equations]] where **all the constant terms are equal to zero**.

The general form looks like this:

$$
a_{11}x_1 + a_{12}x_2 + \cdots + a_{1n}x_n = 0
$$
$$
a_{21}x_1 + a_{22}x_2 + \cdots + a_{2n}x_n = 0
$$
$$
\vdots
$$
$$
a_{m1}x_1 + a_{m2}x_2 + \cdots + a_{mn}x_n = 0
$$

Where:
- `m` is the number of equations,
- `n` is the number of unknowns (`x₁`, `x₂`, ..., `xn`),
- The right-hand side of all equations is zero.

Alternatively, it can be written in matrix form as:

$$
Ax = 0
$$

Where:
- `A` is the **coefficient matrix**,
- `x` is the vector of unknowns,
- `0` is the **zero vector**.

$$
A = \begin{bmatrix}
a_{11} & a_{12} & \cdots & a_{1n} \\
a_{21} & a_{22} & \cdots & a_{2n} \\
\vdots & \vdots & \ddots & \vdots \\
a_{m1} & a_{m2} & \cdots & a_{mn}
\end{bmatrix}
$$

$$
x = \begin{bmatrix} 
x_1 \\
x_2 \\
\vdots \\
x_n 
\end{bmatrix}
$$

---

### 2. **Consistency and the Trivial Solution**

Every homogeneous system is **always consistent**. This means there is **at least one solution** to the system. The simplest solution is called the **trivial solution**.

- **Trivial Solution:** The solution where all the unknowns are set to zero:
  
 $$
  x_1 = 0, x_2 = 0, \dots, x_n = 0
 $$

Thus, for every homogeneous system, the trivial solution exists and satisfies the system.

---

### 3. **Types of Solutions: Trivial vs Non-Trivial**

A homogeneous system has **two possibilities** for its solution set:

#### **1. Only the Trivial Solution**
- The only solution is the one where all variables are zero.

#### **2. Infinitely Many Solutions**
- There are infinitely many solutions, including the trivial solution. This happens when the system has **free variables** (variables that can take on many different values).

**Note:** A homogeneous system **cannot** have no solutions. There will always be at least the trivial solution.

---

### 4. **Condition for Infinitely Many Solutions**

A homogeneous system will have **infinitely many solutions** if the number of unknowns (`n`) is **greater than** the number of equations (`m`), i.e., if `n > m`.

This is because there are not enough equations to uniquely determine all the unknowns, leaving at least one variable as "free" to take on multiple values.

**Example:**

Consider the following system:

$$
\begin{bmatrix}
1 & 0 & 8 & -4 \\
0 & 1 & 2 & 12
\end{bmatrix}
\begin{bmatrix}
x_1 \\
x_2 \\
x_3 \\
x_4
\end{bmatrix}
=
\begin{bmatrix}
0 \\
0
\end{bmatrix}
$$

The system of equations is:

1.$x_1 + 8x_3 - 4x_4 = 0$
2.$x_2 + 2x_3 + 12x_4 = 0$

Here, there are **4 unknowns** (`x₁, x₂, x₃, x₄`) but only **2 equations**. Since there are more unknowns than equations, we expect **infinitely many solutions**.

You can express two of the variables (say `x₃` and `x₄`) in terms of free variables. This leads to an infinite number of possible values for `x₃` and `x₄`, creating an infinite number of solutions.

---

### 5. **Solving/Analyzing Homogeneous Systems**

To solve a homogeneous system, you can follow these general steps:

#### **1. Inspection** (for simple cases)
- Check if the system has more unknowns than equations (`n > m`). If so, it's likely to have infinitely many solutions.

#### **2. [[Gaussian Elimination]]**
- Apply **Gaussian elimination** (or **Gauss-Jordan elimination**) to the system to reduce the coefficient matrix to a simpler form (like row echelon form or reduced row echelon form).
- This process helps you identify free variables and determine if there are infinitely many solutions.

#### **3. Analyze the Result**
- If the elimination process results in free variables, there are **infinitely many solutions**.
- If it leads to a unique solution where all variables are zero, then the system only has the **trivial solution**.
- [[-1 trick for Homogeneous system|shortcut method]]

**Example:**
  
For the system:

$$
\begin{bmatrix}
1 & 0 & 8 & -4 \\
0 & 1 & 2 & 12
\end{bmatrix}
\begin{bmatrix}
x_1 \\
x_2 \\
x_3 \\
x_4
\end{bmatrix}
=
\begin{bmatrix}
0 \\
0
\end{bmatrix}
$$

By solving this system, we can observe that `x₃` and `x₄` are free variables, which means there are infinitely many solutions.

---
#### **Example 1: Homogeneous System with Infinitely Many Solutions**

Let's solve the following homogeneous system using **Gaussian Elimination**:

$$

\begin{bmatrix}

1 & 2 & 3 \\

4 & 5 & 6 \\

7 & 8 & 9

\end{bmatrix}

\begin{bmatrix}

x_1 \\

x_2 \\

x_3

\end{bmatrix}

=

\begin{bmatrix}

0 \\

0 \\

0

\end{bmatrix}

$$

##### **Step 1: Set up the augmented matrix**

The system can be written in augmented matrix form:

$$

\begin{bmatrix}

1 & 2 & 3 & | & 0 \\

4 & 5 & 6 & | & 0 \\

7 & 8 & 9 & | & 0

\end{bmatrix}

$$

##### **Step 2: Perform Gaussian Elimination**

- Subtract 4 times the first row from the second row to eliminate the first column in the second row:

$$

R_2 = R_2 - 4R_1

$$

This gives:

$$

\begin{bmatrix}

1 & 2 & 3 & | & 0 \\

0 & -3 & -6 & | & 0 \\

7 & 8 & 9 & | & 0

\end{bmatrix}

$$

- Now subtract 7 times the first row from the third row:

$$

R_3 = R_3 - 7R_1

$$

This gives:

$$

\begin{bmatrix}

1 & 2 & 3 & | & 0 \\

0 & -3 & -6 & | & 0 \\

0 & -6 & -12 & | & 0

\end{bmatrix}

$$

- Next, simplify the second and third rows by dividing them by -3 and -6 respectively:

$$

R_2 = \frac{1}{-3}R_2, \quad R_3 = \frac{1}{-6}R_3

$$

This gives:

$$

\begin{bmatrix}

1 & 2 & 3 & | & 0 \\

0 & 1 & 2 & | & 0 \\

0 & 1 & 2 & | & 0

\end{bmatrix}

$$

- Now subtract the second row from the third row to eliminate the second column in the third row:

$$

R_3 = R_3 - R_2

$$

This gives:

$$

\begin{bmatrix}

1 & 2 & 3 & | & 0 \\

0 & 1 & 2 & | & 0 \\

0 & 0 & 0 & | & 0

\end{bmatrix}

$$

##### **Step 3: Analyze the Result**

We have the matrix in row echelon form:

$$

\begin{bmatrix}

1 & 2 & 3 & | & 0 \\

0 & 1 & 2 & | & 0 \\

0 & 0 & 0 & | & 0

\end{bmatrix}

$$

- The last row is all zeros, meaning the system has **free variables**.

- The second column (corresponding to$x_2$) is a pivot column, and the third column (corresponding to$x_3$) is a **free variable**.

This system has **infinitely many solutions**, as$x_3$can take any value. You can express$x_1$and$x_2$in terms of$x_3$:

$$

x_2 = -2x_3

$$

$$

x_1 = -3x_3

$$

Thus, the solution is:

$$

x_1 = -3t, \quad x_2 = -2t, \quad x_3 = t

$$

where$t$is any real number. Hence, there are infinitely many solutions.

---

#### **Example 2: Homogeneous System with Only the Trivial Solution**

Now, let's solve another homogeneous system:

$$

\begin{bmatrix}

1 & 2 \\

3 & 4

\end{bmatrix}

\begin{bmatrix}

x_1 \\

x_2

\end{bmatrix}

=

\begin{bmatrix}

0 \\

0

\end{bmatrix}

$$

##### **Step 1: Set up the augmented matrix**

The system can be written as:

$$

\begin{bmatrix}

1 & 2 & | & 0 \\

3 & 4 & | & 0

\end{bmatrix}

$$

##### **Step 2: Perform Gaussian Elimination**

- Subtract 3 times the first row from the second row to eliminate the first column in the second row:

$$

R_2 = R_2 - 3R_1

$$

This gives:

$$

\begin{bmatrix}

1 & 2 & | & 0 \\

0 & -2 & | & 0

\end{bmatrix}

$$

- Divide the second row by -2 to simplify:

$$

R_2 = \frac{1}{-2} R_2

$$

This gives:

$$

\begin{bmatrix}

1 & 2 & | & 0 \\

0 & 1 & | & 0

\end{bmatrix}

$$

##### **Step 3: Analyze the Result**

Now, the matrix is in reduced row echelon form (RREF):

$$

\begin{bmatrix}

1 & 2 & | & 0 \\

0 & 1 & | & 0

\end{bmatrix}

$$

- There are **no free variables** because both columns have pivots (leading 1's).

- This means the system has **only the trivial solution**: 

$$

x_1 = 0, \quad x_2 = 0

$$

Thus, the system has only the trivial solution.

---

### **Conclusion**

1. **Infinitely Many Solutions**: If there are free variables (indicating that there is not enough information to uniquely determine all the unknowns), the system has **infinitely many solutions**.

2. **Only the Trivial Solution**: If there are no free variables and the system is consistent, it only has the **trivial solution**, where all variables are zero.
---

### **Conclusion**

A **homogeneous linear system** is characterized by zero constant terms and always has at least one solution (the trivial solution). It will have either:

- **Only the trivial solution** (when `n = m` and no free variables exist).
- **Infinitely many solutions** (when `n > m` and free variables exist).

Understanding when the system has infinitely many solutions is crucial for solving these types of systems, and methods like Gaussian elimination are key tools in this process.

--- 


---
Tags: #math #statistics


#Equations_and_Systems
