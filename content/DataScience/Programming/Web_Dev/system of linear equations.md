### **System of Linear Equations: Explanation**  

A **system of linear equations** is a set of two or more linear equations that involve the same variables. The goal is to find values for the variables that satisfy all equations **simultaneously**.

#### **General Form**
A system of $m$ linear equations in $n$ variables looks like:

$$
\begin{aligned}
    a_{11}x_1 + a_{12}x_2 + \dots + a_{1n}x_n &= b_1 \\
    a_{21}x_1 + a_{22}x_2 + \dots + a_{2n}x_n &= b_2 \\
    \vdots \\
    a_{m1}x_1 + a_{m2}x_2 + \dots + a_{mn}x_n &= b_m
\end{aligned}
$$

where:
- $x_1, x_2, ..., x_n$ are the **variables** (unknowns).
- $a_{ij}$ are the **coefficients**.
- $b_i$ are the **constant terms**.
- $m$ = number of equations, $n$ = number of variables.

---

## **Types of Solutions**
A system of linear equations can have:

1️⃣ **Unique Solution**: A single set of values for $x_1, x_2, ..., x_n$ satisfies all equations.  
2️⃣ **Infinite Solutions**: Many values satisfy the system (e.g., dependent equations, [[Homogeneous Linear Systems|Homogenous equations]]).  
3️⃣ **No Solution**: The equations contradict each other (e.g., parallel lines that never intersect).  

---

## **Example 1: Unique Solution**
### Example 1.1
Solve:
$$
\begin{aligned}
    x + y = 3 \\
    x - y = 1
\end{aligned}
$$

**Step 1: Add both equations**
$$
(x + y) + (x - y) = 3 + 1
$$
$$
2x = 4  \quad \Rightarrow \quad x = 2
$$

**Step 2: Substitute $x = 2$ into the first equation**
$$
2 + y = 3  \quad \Rightarrow \quad y = 1
$$

**Solution:** $(2,1)$ ✅ (Only one solution exists.)

---

### Example 1.2


$$
\begin{aligned}
1. & \quad x_1 + x_2 + x_3 = 3 \quad \text{(Equation 1)} \\
2. & \quad x_1 - x_2 + 2x_3 = 2 \quad \text{(Equation 2)} \\
3. & \quad x_2 + x_3 = 2 \quad \text{(Equation 3)}
\end{aligned}
$$

#### **Step 1: Express $x_1$ in terms of $x_2$ and $x_3$**
From **Equation (1)**:
$$
x_1 = 3 - x_2 - x_3
$$
We'll use this expression later.

#### **Step 2: Combine Equation (1) and Equation (2)**
We add **Equation (1) and Equation (2)**:

$$
(x_1 + x_2 + x_3) + (x_1 - x_2 + 2x_3) = 3 + 2
$$

$$
x_1 + x_2 + x_3 + x_1 - x_2 + 2x_3 = 5
$$

Simplify:

$$
2x_1 + 3x_3 = 5
$$

Now we have:

$$
2x_1 + 3x_3 = 5 \quad \text{(Equation 4)}
$$

#### **Step 3: Solve for $x_3$**
From **Equation (3)**:
$$
x_2 + x_3 = 2
$$

Solving for $x_2$:

$$
x_2 = 2 - x_3
$$

#### **Step 4: Express $x_1$ in terms of $x_3$**
Substituting $x_2 = 2 - x_3$ into our earlier expression for $x_1$:

$$
x_1 = 3 - (2 - x_3) - x_3
$$

$$
x_1 = 3 - 2 + x_3 - x_3
$$

$$
x_1 = 1
$$

So, we have **found** $x_1 = 1$.

#### **Step 5: Solve for $x_3$**
Substituting $x_1 = 1$ into **Equation (4)**:

$$
2(1) + 3x_3 = 5
$$

$$
2 + 3x_3 = 5
$$

$$
3x_3 = 3
$$

$$
x_3 = 1
$$

So, $x_3 = 1$.

#### **Step 6: Solve for $x_2$**
Using **Equation (3)**:

$$
x_2 + x_3 = 2
$$

$$
x_2 + 1 = 2
$$

$$
x_2 = 1
$$

#### **Final Answer:**
$$
(x_1, x_2, x_3) = (1,1,1)
$$

This is the **unique** solution. You can verify by substituting these values back into the original equations.


---

## **Example 2: No Solution**
Solve:
$$
\begin{aligned}
    x + y = 2 \\
    x + y = 5
\end{aligned}
$$
Both equations have the **same left-hand side** but different right-hand sides.  
This means they represent **parallel lines** that never intersect, so there is **no solution**.

---

## **Example 3: Infinite Solutions**
Solve:
$$
\begin{aligned}
    x + y = 3 \\
    2x + 2y = 6
\end{aligned}
$$

Dividing the second equation by 2:
$$
x + y = 3
$$

This is the **same equation repeated**, meaning there are **infinite solutions** (all points on the line).
- ---
### **Example 3.2: Redundant equation** 

$$
\begin{aligned}
1. & \quad x_1 + x_2 + x_3 = 3 \quad \text{(Equation 1)} \\
2. & \quad x_1 - x_2 + 2x_3 = 2 \quad \text{(Equation 2)} \\
3. & \quad 2x_1 + 3x_3 = 5 \quad \text{(Equation 3)}
\end{aligned}
$$



#### **Step 1: Count the Number of Equations and Variables**
We have three variables: $x_1, x_2, x_3$.

Initially, we were given three equations:

$$
\begin{aligned}
1. & \quad x_1 + x_2 + x_3 = 3 \quad \text{(Equation 1)} \\
2. & \quad x_1 - x_2 + 2x_3 = 2 \quad \text{(Equation 2)} \\
3. & \quad 2x_1 + 3x_3 = 5 \quad \text{(Equation 3)}
\end{aligned}
$$

However, we found that **Equation (3) is redundant** because it can be obtained by adding **Equation (1) and Equation (2)**. So, we are left with **only two independent equations** but **three unknowns**.

#### **Check for Redundancy**

We observe that:

$$

\text{(Equation 1) + (Equation 2)} = (x_1 + x_2 + x_3) + (x_1 - x_2 + 2x_3) = 3 + 2

$$

$$

x_1 + x_2 + x_3 + x_1 - x_2 + 2x_3 = 5

$$

$$

2x_1 + 3x_3 = 5

$$

This is exactly **Equation 3**, meaning it does not provide new information and is **redundant**. So, we can ignore it.

#### **Step 2: Solve for Two Variables in Terms of the Third**
Since we have **fewer independent equations than unknowns**, _one variable must be **free**_—meaning we can assign it any real value. 

>[!note]
>_( since equation one and equation 2 is valid, we could get the value for $x_1$ and $x_2$ but the equation 3 is  ==**redundant**== which leads to $x_3$ value to be unknown so we assign it as ==*$a$*== which could be any number in a real number set)_

1. From adding Equation (1) and (2):

   $$
   2x_1 + 3x_3 = 5
   $$

   Solve for $x_1$:

   $$
   x_1 = \frac{5}{2} - \frac{3}{2}x_3
   $$

2. Using Equation (1):

   $$
   x_2 = 3 - x_1 - x_3
   $$

   Substituting $x_1 = \frac{5}{2} - \frac{3}{2}x_3$:

   $$
   x_2 = 3 - \left(\frac{5}{2} - \frac{3}{2}x_3\right) - x_3
   $$

   $$
   x_2 = \frac{1}{2} + \frac{1}{2}x_3
   $$

#### **Step 3: Introduce a Free Variable**
Since $x_3$ can take **any real value**, we introduce a free parameter:

$$
x_3 = a, \quad a \in \mathbb{R}
$$

Now we rewrite our solutions in terms of $a$:

$$
x_1 = \frac{5}{2} - \frac{3}{2}a
$$

$$
x_2 = \frac{1}{2} + \frac{1}{2}a
$$

$$
x_3 = a
$$

Thus, our general solution is:

$$
\left( \frac{5}{2} - \frac{3}{2}a, \frac{1}{2} + \frac{1}{2}a, a \right), \quad a \in \mathbb{R}
$$

#### **Conclusion: Where Does $a$ Come From?**
- $a$ is a **free variable** because we have **more unknowns (3) than independent equations (2)**.
- We let $x_3 = a$ because we can assign any value to $x_3$, and the other variables adjust accordingly.
- This means the system has **infinitely many solutions**, forming a **straight line** in 3D space.

---

## **Applications**
✅ **Production Planning:** How many products to produce given limited resources.  
✅ **Finance:** Investment portfolios that balance risk and return.  
✅ **Physics:** Calculating forces in equilibrium.  
✅ **Machine Learning:** Solving for weights in regression models.  


---
Tags: #math #statistics


#Uncategorized
