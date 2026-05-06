This is a shortcut trick to find the solution of homogeneous system
## ✅ **Step 1: Understand the Structure of the Matrix**

We are given a **[[Homogeneous Linear Systems|homogeneous system of equations]]** in the form:

$$
A \mathbf{x} = 0
$$

where  
- $A \in \mathbb{R}^{3 \times 5}$ is already in **Reduced Row Echelon Form (RREF)**  
- $\mathbf{x} = [x_1, x_2, x_3, x_4, x_5]^T$  
- There are **3 equations** and **5 unknowns**

---
## EXAMPLE

### 🧩 The Given Matrix $A$:

$$
A = 
\begin{bmatrix}
\boxed{1} & 3 & 0 & 0 & 3 \\
0 & 0 & \boxed{1} & 0 & 9 \\
0 & 0 & 0 & \boxed{1} & -4 \\
\end{bmatrix}
$$

Let’s analyze it:

- **Leading 1s (pivots)** appear in **columns 1, 3, and 4**, due to pivots matching the columns 
- These correspond to the **pivot variables**:  
  → $x_1, x_3, x_4$
- The **remaining columns** (columns 2 and 5) **do not contain pivots**
  → These correspond to the **free variables**:  
  → $x_2, x_5$

---

### 🎯 Objective

We want to **find all solutions** $\mathbf{x} \in \mathbb{R}^5$ to $A \mathbf{x} = 0$.  
But instead of solving by hand (substitution), we use the **Minus-1 Trick** to construct a matrix $\tilde{A}$, from which we can **read off** the solution vectors that **span the null space** (kernel) of $A$.

---

## 🧾 **Step 2: Build the Extended Matrix $\tilde{A}$** 

We start with the given RREF matrix $A \in \mathbb{R}^{3 \times 5}$:

$$
A = 
\begin{bmatrix}
\boxed{1} & 3 & 0 & 0 & 3 \\
0 & 0 & \boxed{1} & 0 & 9 \\
0 & 0 & 0 & \boxed{1} & -4
\end{bmatrix}
$$

**Pivot columns**: 1, 3, 4  
**Free columns**: 2, 5 → correspond to $x_2$ and $x_5$

Now, to construct $\tilde{A} \in \mathbb{R}^{5 \times 5}$, we **insert rows** ( `[00...-1...00]` ) so that:

- Each diagonal has either a 1 (for pivots) or a −1 (for free variables)
- The matrix becomes square $(n \times n)$, with rows aligned to columns by index

---

### 🧮 How to Insert Minus-1 Rows

We scan **column-wise** from left to right (for 5 variables), and do:

- If the column is a **pivot column** (has a leading 1 in some row), keep that row.
- If the column is **free** (no leading 1), we **insert** a new row with a −1 at that column’s position.

In nutshell we look of stair case pattern it a row is offset we add above it the  -1 row 

---

### ✅ **Constructing $\tilde{A}$:**

$$
\tilde{A} =
\begin{bmatrix}
1 & 3 & 0 & 0 & 3 \\
\color{blue}{0} & \color{blue}{\mathbf{-1}} & \color{blue}{0} & \color{blue}{0} & \color{blue}{0} \\
0 & 0 & 1 & 0 & 9 \\
0 & 0 & 0 & 1 & -4 \\
\color{blue}{0} & \color{blue}{0} & \color{blue}{0} & \color{blue}{0} & \color{blue}{\mathbf{-1}}
\end{bmatrix}
$$

- Row 1: original (pivot in column 1)
- Row 2: **inserted** for **free variable** $x_2$ → −1 at column 2
- Row 3: original (pivot in column 3)
- Row 4: original (pivot in column 4)
- Row 5: **inserted** for **free variable** $x_5$ → −1 at column 5

---

### 🔍 Tip for Placement

To keep structure clean, **insert minus-1 rows** in the positions where **pivot columns are missing** in the natural diagonal order.

Think of it as building a **staircase**: when a step is missing (non-pivot), plug in a −1 row so the "step" appears on the diagonal.

---

## ✅ **Step 3: Read the Null Space Vectors from $\tilde{A}$**

Recall from Step 2, we constructed the **extended matrix $\tilde{A}$** by appending rows with `-1` in the diagonal positions corresponding to the **non-pivot (free)** variables:

$$
\tilde{A} =
\begin{bmatrix}
\boxed{1} & 3 & 0 & 0 & 3 \\
0 & \mathbf{-1} & 0 & 0 & 0 \\
0 & 0 & \boxed{1} & 0 & 9 \\
0 & 0 & 0 & \boxed{1} & -4 \\
0 & 0 & 0 & 0 & \mathbf{-1} \\
\end{bmatrix}
$$

---

### 🔎 Step-by-step Breakdown

We now **extract the columns** of $\tilde{A}$ that have **-1 on the diagonal**.  
These columns represent the **basis vectors of the null space** of $A$, i.e., the **general solution** to the equation $A\mathbf{x} = 0$.

### 👇 Free variables and their columns

- Column **2** → Corresponds to **$x_2$** (free variable)
- Column **5** → Corresponds to **$x_5$** (free variable)

---

### 🧮 Null space basis vectors

#### For $x_2 = \lambda_1$:
Take **column 2** from $\tilde{A}$:

$$
\mathbf{v}_1 =
\begin{bmatrix}
3 \\
-1 \\
0 \\
0 \\
0 \\
\end{bmatrix}
$$

This gives one solution direction:
$$
x = \lambda_1 \cdot 
\begin{bmatrix}
3 \\
-1 \\
0 \\
0 \\
0 \\
\end{bmatrix}
$$

---

#### For $x_5 = \lambda_2$:
Take **column 5** from $\tilde{A}$:

$$
\mathbf{v}_2 =
\begin{bmatrix}
3 \\
0 \\
9 \\
-4 \\
-1 \\
\end{bmatrix}
$$

This gives the second solution direction:
$$
x = \lambda_2 \cdot 
\begin{bmatrix}
3 \\
0 \\
9 \\
-4 \\
-1 \\
\end{bmatrix}
$$

---

## ✅ Final Solution

The general solution to the homogeneous system $A\mathbf{x} = 0$ is:

$$
\mathbf{x} = \lambda_1
\begin{bmatrix}
3 \\
-1 \\
0 \\
0 \\
0 \\
\end{bmatrix}
+ \lambda_2
\begin{bmatrix}
3 \\
0 \\
9 \\
-4 \\
-1 \\
\end{bmatrix}
\quad \text{for } \lambda_1, \lambda_2 \in \mathbb{R}
$$

---

---
Tags: #math #statistics


#Equations_and_Systems
