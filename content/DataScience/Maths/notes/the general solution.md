the general solution consist of 
- _**[[the general solution#^4d088e|particular solution]] $Ax_n = b$**_ :  a particular solution is a solution that has particular $x_1,...,x_n$ value because it has a constant result which is $b$ ($Ax_n = b$)

- _**[[the general solution#^cf7f42|infinite or Homogenous solutions]] $Ax_p = 0$**_ :  it is a set of all the possible combination of the equation that result our $b=0$ , ($Ax_n = 0$)

>[!NOTE]
Here the equation is already in its [[Gaussian Elimination#^bdb5c0|simplest form]], if it isn't in the simplest form, we shall use [[Gaussian Elimination|gaussian elimination]] to get it in simple  form


## particular solution

^4d088e

### 🧠 **What is going on in this example?**

We are given a system of equations written as a matrix equation:

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
42 \\
8
\end{bmatrix}
$$

This means:

- Equation 1: $x_1 + 8x_3 - 4x_4 = 42$  
- Equation 2: $x_2 + 2x_3 + 12x_4 = 8$

There are **2 equations** and **4 unknowns**, which usually means **[[system of linear equations IN MATRIX FORM|infinite solutions]]**.

---

### 🔍 **What does the solution look like?**

We can rewrite the solution in terms of the **columns** of the matrix.

Let the matrix columns be:

- $c_1 = \begin{bmatrix} 1 \\ 0 \end{bmatrix}$
- $c_2 = \begin{bmatrix} 0 \\ 1 \end{bmatrix}$
- $c_3 = \begin{bmatrix} 8 \\ 2 \end{bmatrix}$
- $c_4 = \begin{bmatrix} -4 \\ 12 \end{bmatrix}$

We're trying to find values $x_1, x_2, x_3, x_4$ such that:

$$
x_1c_1 + x_2c_2 + x_3c_3 + x_4c_4 = b = \begin{bmatrix} 42 \\ 8 \end{bmatrix}
$$

---

### ✅ **Finding a Particular Solution**

If we just want **one** solution that works (not all of them), we can try setting some variables to 0 to make things easier.

Let’s try:
- $x_3 = 0$
- $x_4 = 0$

#### Then the equations become :


##### **Equation 1:**
$$
x_1 + 8x_3 - 4x_4 = 42
$$

Substitute $x_3 = 0$, $x_4 = 0$:

$$
x_1 + 8(0) - 4(0) = 42 \Rightarrow x_1 = 42
$$

---

##### **Equation 2:**
$$
x_2 + 2x_3 + 12x_4 = 8
$$

Substitute $x_3 = 0$, $x_4 = 0$:

$$
x_2 + 2(0) + 12(0) = 8 \Rightarrow x_2 = 8
$$


So a **particular solution** is:

$$
\begin{bmatrix}
x_1 \\
x_2 \\
x_3 \\
x_4
\end{bmatrix}
=
\begin{bmatrix}
42 \\
8 \\
0 \\
0
\end{bmatrix}
$$

This is called the **particular solution** or **special solution**.

---

### 📌 Summary:

- A **particular solution** is one example of a solution that satisfies the system.
- Since there are more variables than equations, there are **infinitely many solutions** (this will be discussed when finding the **general solution**).
- The example just gives us one nice and simple solution by setting the "free variables" $x_3$ and $x_4$ to 0.

---
# 🔍 Solving the [[Homogeneous Linear Systems|Homogeneous System]](infinity ): $AX = 0$
^cf7f42
We are given:

$$
A = 
\begin{bmatrix}
1 & 0 & 8 & -4 \\
0 & 1 & 2 & 12
\end{bmatrix}, \quad
X =
\begin{bmatrix}
x_1 \\
x_2 \\
x_3 \\
x_4
\end{bmatrix}, \quad
AX = 
\begin{bmatrix}
0 \\
0
\end{bmatrix}
$$

---

## ✅ Step 1: Matrix Multiplication

Multiply the matrix $A$ with vector $X$:

- Row 1: $x_1 + 8x_3 - 4x_4 = 0$ ➡️ (**Equation A**)
- Row 2: $x_2 + 2x_3 + 12x_4 = 0$ ➡️ (**Equation B**)

---

## ✅ Step 2: Identify Free and Leading Variables

Let:

- $x_3 = a$  _(free variable)_
- $x_4 = b$  _(free variable)_

We will express $x_1$ and $x_2$ in terms of $a$ and $b$.

---

## ✅ Step 3: Solve for Leading Variables

### From **Equation A**:
$$
x_1 = -8a + 4b
$$

### From **Equation B**:
$$
x_2 = -2a - 12b
$$

---

## 🔥 **Step 4: Write the Homogeneous Solution**

Substitute all variables into a single vector:

$$
X = 
\begin{bmatrix}
x_1 \\
x_2 \\
x_3 \\
x_4
\end{bmatrix}
=
\begin{bmatrix}
-8a + 4b \\
-2a - 12b \\
a \\
b
\end{bmatrix}
$$

Now express it as a **linear combination**:

$$
X = 
a \cdot 
\begin{bmatrix}
-8 + 0 \\
-2 - 0\\
1 \\
0
\end{bmatrix}
+
b \cdot 
\begin{bmatrix}
0+ 4 \\
-0-12 \\
0 \\
1
\end{bmatrix}
$$

---

## ✅ **Final Answer: Homogeneous Solution**

The complete solution to $AX = 0$ is:

$$
X_h = 
a
\begin{bmatrix}
-8 \\
-2 \\
1 \\
0
\end{bmatrix}
+
b
\begin{bmatrix}
4 \\
-12 \\
0 \\
1
\end{bmatrix}
\quad \text{for all } a, b \in \mathbb{R}
$$

This represents the **null space** of matrix $A$ — a plane through the origin defined by two vectors.

---
# General solution
$$\text{General solution}=\text{particular solution
($Ax_n = b$)}+\text{infinitly many solutions ($Ax_p=0$)}$$

$$\text{General solution}=\begin{bmatrix}
42 \\
8 \\
0 \\
0
\end{bmatrix}
+a
\begin{bmatrix}
-8 \\
-2 \\
1 \\
0
\end{bmatrix}
+
b
\begin{bmatrix}
4 \\
-12 \\
0 \\
1
\end{bmatrix}$$

---
Tags: #math #statistics


#Equations_and_Systems
