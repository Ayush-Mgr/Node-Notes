Box-Cox transformation is a statistical technique used to stabilize [[variance  & its coefficient|VARIANCE]] and make a dataset more closely approximate a normal distribution

### Formula

The Box-Cox transformation is defined as:

$$​y(\lambda) = \begin{cases} \frac{y^\lambda - 1}{\lambda}, & \text{if } \lambda \neq 0 \\ \ln(y), & \text{if } \lambda = 0 \end{cases}$$

Here:

- $y$: Original data (must be positive).
- $\lambda$: Transformation parameter, which determines the form of the transformation.

### HOW TO 
The **Box-Cox transformation** works by applying a power transformation to your data to stabilize variance and make the distribution more normal. It does this by transforming each value $y$ in your dataset using a parameter $\lambda$, which determines the exact transformation applied.
#### Steps in the Box-Cox Transformation:

1. **Ensure Positive Values**:
    
    - Box-Cox only works with positive values ($y>0$). If your data includes zeros or negatives, shift the data by adding a constant before applying the transformation.
2. **Determine Optimal $\lambda$:
    
    - The key step in the Box-Cox transformation is choosing the $\lambda$ value that makes the data as close to normal as possible.
    - This is done using **maximum likelihood estimation (MLE)**, which tests different $\lambda$ values and selects the one that minimizes deviations from normality.
3. **Transform the Data**:
    
    - Apply the Box-Cox formula to each data point using the optimal $\lambda$.

---

### How $\lambda$ Affects the Transformation:

- $\lambda = 1$: No transformation (original data is used).
- $\lambda = 0$: Log transformation (ln⁡(y)\ln(y)ln(y)), commonly used for skewed data.
- $\lambda > 1$: Expands higher values, compresses lower values.
- $\lambda < 0$: Compresses higher values, expands lower values.

---

### Intuition Behind Box-Cox:

The goal of the Box-Cox transformation is to handle:

1. **Heteroscedasticity**: Stabilizing variance across the range of data.
2. **Skewness**: Reducing the asymmetry of the distribution to make it closer to normal.

---
Tags: #math #statistics


#Advanced_Statistics_and_Models
