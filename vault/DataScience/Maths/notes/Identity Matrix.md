Here's a well-formatted note on the **Identity Matrix**:  

---

# **Identity Matrix**  

## **Definition**  
An **identity matrix** is a square matrix in which all the main diagonal elements are **1**, and all other elements are **0**. It is denoted by **Iₙ**, where **n** represents the matrix's size.  

## **General Form**  
For an **n × n** identity matrix:  

$$
I_n =
\begin{bmatrix}
1 & 0 & 0 & \dots & 0 \\
0 & 1 & 0 & \dots & 0 \\
0 & 0 & 1 & \dots & 0 \\
\vdots & \vdots & \vdots & \ddots & \vdots \\
0 & 0 & 0 & \dots & 1
\end{bmatrix}
$$

For example, a **3 × 3** identity matrix:  

$$
I_3 =
\begin{bmatrix}
1 & 0 & 0 \\
0 & 1 & 0 \\
0 & 0 & 1
\end{bmatrix}
$$

## **Properties**  
1. **Multiplicative Identity**:  
   - For any **n × n** matrix **A**, multiplying it by the identity matrix gives **A**:  
     $$
     A I_n = I_n A = A
     $$  

2. **Inverse Property**:  
   - The identity matrix acts as the inverse of itself:  
     $$
     I_n^{-1} = I_n
     $$  

2. **[[Determinant (Det) of a Matrix|Determinant]]**:  
   - The determinant of the identity matrix is always **1**:  
     $$
     \det(I_n) = 1
     $$  

4. **Eigenvalues**:  
   - All eigenvalues of **Iₙ** are **1**.  

## **Applications**  
- Used in solving **linear equations** (as part of **Gaussian elimination**).  
- Acts as the **neutral element** in matrix multiplication.  
- Helps in defining **inverse matrices**.  
- Important in **computer graphics** and **machine learning** for transformations.  

---

---
Tags: #math #statistics


#Linear_Algebra_and_Matrices
