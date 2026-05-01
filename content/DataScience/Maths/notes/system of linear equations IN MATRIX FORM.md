 This is a **compact and efficient** way of writing and solving **[[system of linear equations]]**, especially when the system is large.

1. **system of linear equation**:

$$
\begin{aligned}
    a_{11}x_1 + a_{12}x_2 + \dots + a_{1n}x_n &= b_1 \\
    a_{21}x_1 + a_{22}x_2 + \dots + a_{2n}x_n &= b_2 \\
    \vdots \\
    a_{m1}x_1 + a_{m2}x_2 + \dots + a_{mn}x_n &= b_m
\end{aligned}
$$


2. **[[matrix]]-vector form** of a linear system:
 
$$
\begin{bmatrix}
a_{11} \\
\vdots \\
a_{m1}
\end{bmatrix} x_1 +
\begin{bmatrix}
a_{12} \\
\vdots \\
a_{m2}
\end{bmatrix} x_2 +
\cdots +
\begin{bmatrix}
a_{1n} \\
\vdots \\
a_{mn}
\end{bmatrix} x_n =
\begin{bmatrix}
b_1 \\
\vdots \\
b_m
\end{bmatrix}
$$

3. Simplifying and arranging **$a$** and **$x$** 

$$

\begin{bmatrix}

a_{11} & a_{12} & \cdots & a_{1n} \\

a_{21} & a_{22} & \cdots & a_{2n} \\

\vdots & \vdots & \ddots & \vdots \\

a_{m1} & a_{m2} & \cdots & a_{mn}

\end{bmatrix}

\begin{bmatrix}

x_1 \\

x_2 \\

\vdots \\

x_n

\end{bmatrix}

=

\begin{bmatrix}

b_1 \\

b_2 \\

\vdots \\

b_m

\end{bmatrix}

$$



- Here:

$$
A \vec{x} = \vec{b}
$$


Where:
- $A$ is an $m \times n$ matrix of coefficients,
- $\vec{x}$ is an $n \times 1$ column vector of variables,
- $\vec{b}$ is an $m \times 1$ column vector of constants.

### Why use this form?
- **Clarity**: It removes clutter from long equations and shows structure.
- **Efficiency**: Especially useful in programming, simulations, or when solving with software like MATLAB, NumPy (Python), R, etc.
- **Linear Algebra Tools**: It enables the use of matrix operations like Gaussian elimination, LU decomposition, or matrix inversion.

### Example:
A system like:
$$
\begin{aligned}
2x + 3y &= 5 \\
4x +  y &= 6
\end{aligned}
$$

Becomes:
$$
\begin{bmatrix}
2 & 3 \\
4 & 1
\end{bmatrix}
\begin{bmatrix}
x \\
y
\end{bmatrix}
=
\begin{bmatrix}
5 \\
6
\end{bmatrix}
$$


**when systems get long or complex, this matrix-vector form is the way to go**. 

---
Tags: #math #statistics


#Equations_and_Systems
