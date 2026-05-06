## 🧠 What is ANOVA?

**Analysis of Variance (ANOVA)** helps determine whether **group means are significantly different**, using variance as the basis for comparison.

---

## 🎯 One-Way ANOVA

Used when there is **one factor** (independent variable) with **multiple levels (groups)**.

### ✅ Assumptions

- Observations are independent.
- Populations are normally distributed.
- Variances are equal across groups (homogeneity of variance).


### 📐 Formula Breakdown

1. **Total Sum of Squares (SST):**

  $$
  SST = \sum_{i=1}^{k} \sum_{j=1}^{n_i} (x_{ij} - \bar{x})^2
  $$
	 Meaning:  
	 - $k$ = number of groups  
	- $x_{ij}$ = value of the $j$-th observation in the $i$-th group
	- Total variability in the dataset — every data point’s distance from the overall (grand) mean $\hat{x}$.
	- $$

\text{Grand Mean} = \frac{\text{Sum of all values in all groups}}{\text{Total number of observations}}

$$
---

2. **Between-Group Sum of Squares (SSB):**

  $$
  SSB = \sum_{i=1}^{k} n_i (\bar{x}_i - \bar{x})^2
  $$
	 Meaning:
    - $\bar{x}_i$ = mean of group $i$   
	- $n_i$ = number of observations in group $i$   
    - How much the **group means** deviate from the overall grand mean  $\hat{x}$.
    
	**Represents**:  
    - The variation explained by the **differences between the groups**  $\hat{x}$ .
---

 3. **Within-Group Sum of Squares (SSW):**

  $$
  SSW = \sum_{i=1}^{k} \sum_{j=1}^{n_i} (x_{ij} - \bar{x}_i)^2
  $$

	Meaning:  
    - How much the data points **within each group** vary from their **own group mean**.
    
	 **Represents**:  
    - **Unexplained variation** — due to randomness or individual differences, **not group membership**.
    

---


- **Degrees of Freedom:**

  - $df_{SSB} = k - 1$
  - $df_{SSW} = N - k$
  - $df_{SST} = N - 1$
where
- $N$ = total number of observations across all groups
- $k$ = number of groups  


- **Mean Squares:**

  $$
  MSB = \frac{SSB}{k - 1}, \quad MSW = \frac{SSW}{N - k}
  $$

- **F-statistic:**

  $$
  F = \frac{MSB}{MSW}
  $$

---

### 📋 Example

**Three teaching methods (A, B, C):**

- Method A: 85, 87, 90, 88, 86
- Method B: 78, 80, 82, 79
- Method C: 92, 94, 93

Steps:

- $SST = 408.67$
- $SSB = 258.97$
- $SSW = 149.70$
- $df_{SSB} = 2$, $df_{SSW} = 9$
- $MSB = 129.485$, $MSW = 16.633$
- $F = 7.785$

**Conclusion**: Since $F > F_{crit} = 4.26$, we **reject $H_0$**. Teaching methods differ significantly.

---

Here's your **Two-Way ANOVA (Equal Observations per Cell)** section formatted consistently with your previous style:  

---

## 🧪 Two-Way ANOVA (Equal Observations per Cell)  

Used to study the effect of **two factors and their interaction**.  

### ✅ Model  

$$  
x_{ijk} = \mu + \alpha_i + \beta_j + (\alpha\beta)_{ij} + \epsilon_{ijk}  
$$  

**Where:**  
- $\mu$ = **overall mean**  
- $\alpha_i$ = effect of **Factor A (level $i$)**  
- $\beta_j$ = effect of **Factor B (level $j$)**  
- $(\alpha\beta)_{ij}$ = **interaction effect** between Factor A and Factor B  
- $\epsilon_{ijk}$ = **random error** (residual variation)  

---  

### 📊 Total Variability Decomposition  

$$  
SST = SSA + SSB + SSAB + SSE  
$$  

#### 1. **Sum of Squares for Factor A (SSA)**  

$$  
SSA = bn \sum_{i=1}^{a} (\bar{x}_{i..} - \bar{x})^2  
$$  

**Meaning:**  
- $a$ = number of levels in **Factor A**  
- $b$ = number of levels in **Factor B**  
- $n$ = number of observations **per cell**  
- $\bar{x}_{i..}$ = mean of **all observations in level $i$ of Factor A**  
- $\bar{x}$ = **grand mean**  

**Represents:**  
- Variation due to **Factor A alone**.  

---  

#### 2. **Sum of Squares for Factor B (SSB)**  

$$  
SSB = an \sum_{j=1}^{b} (\bar{x}_{.j.} - \bar{x})^2  
$$  

**Meaning:**  
- $\bar{x}_{.j.}$ = mean of **all observations in level $j$ of Factor B**  

**Represents:**  
- Variation due to **Factor B alone**.  

---  

#### 3. **Sum of Squares for Interaction (SSAB)**  

$$  
SSAB = n \sum_{i=1}^{a} \sum_{j=1}^{b} (\bar{x}_{ij.} - \bar{x}_{i..} - \bar{x}_{.j.} + \bar{x})^2  
$$  

**Meaning:**  
- $\bar{x}_{ij.}$ = mean of observations in **cell $(i,j)$** (combination of Factor A level $i$ and Factor B level $j$)  

**Represents:**  
- Variation due to the **interaction effect** between Factor A and Factor B.  

---  

#### 4. **Sum of Squares for Error (SSE)**  

$$  
SSE = \sum_{i=1}^{a} \sum_{j=1}^{b} \sum_{k=1}^{n} (x_{ijk} - \bar{x}_{ij.})^2  
$$  

**Represents:**  
- **Unexplained variation** (residual error) after accounting for Factor A, Factor B, and their interaction.  

---  

Let me know if you'd like any modifications! 🔍
### 📋 Example

**Factors**:
- Teaching Method: A, B
- Study Time: 1 hr, 2 hrs
- 2 students per cell

Data table:

|             | 1 hr | 2 hrs |
|-------------|------|-------|
| Method A    | 85, 87 | 90, 92 |
| Method B    | 78, 80 | 82, 84 |

Results:

- $SST = 242$
- $SSA = 112$
- $SSB = 50$
- $SSAB = 1$
- $SSE = 79$
- $df_{A} = 1$, $df_{B} = 1$, $df_{AB} = 1$, $df_{E} = 4$
- $MSA = 112$, $MSB = 50$, $MSAB = 1$, $MSE = 19.75$
- $F_A = 5.67$, $F_B = 2.53$, $F_{AB} = 0.050$

### Decision

At $\alpha = 0.05$, $F_{crit} = 7.71$.  
All $F$-values are less than $F_{crit}$ → **Fail to reject $H_0$** for both factors and interaction.

---

---
Tags: #math #statistics


#Advanced_Statistics_and_Models
