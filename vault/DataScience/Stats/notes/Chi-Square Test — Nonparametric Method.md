## 🧠 What is the Chi-Square (χ²) Test?

The **Chi-Square ($χ²$) Test** is a **nonparametric** test used for **categorical data**. It compares **observed frequencies** to **expected frequencies** to determine whether deviations are due to chance.

---

## 🎯 Types of Chi-Square Tests

1. **Goodness-of-Fit Test**  
   → Checks if a sample matches a specified distribution.

2. **Test of Independence**  
   → Checks if two categorical variables are independent.

3. **Test of Homogeneity**  
   → Checks if different populations have the same categorical distribution.

---

## ✅ Assumptions

- Data consists of **frequencies**, not percentages.
- Observations are **independent**.
- Categories are **mutually exclusive and exhaustive**.
- **Expected frequency** in each cell should be **at least 5**.

---

## 📐 General Formula

$$
\chi^2 = \sum \frac{(O_i - E_i)^2}{E_i}
$$

**Where:**

- $O_i$: Observed frequency  
- $E_i$: Expected frequency

---

## 🧪 1. Goodness-of-Fit Test

### Purpose:
To test whether an observed frequency distribution fits a theoretical one.

### Example:

A die is rolled 60 times. Observed frequencies for faces 1–6:  
[8, 10, 9, 11, 12, 10]

Expected for each face:

$$
E_i = \frac{60}{6} = 10
$$

### Compute χ²:

$$
\chi^2 = \frac{(8 - 10)^2}{10} + \frac{(10 - 10)^2}{10} + \cdots + \frac{(10 - 10)^2}{10} = 1.0
$$

### Degrees of Freedom:
$$
df = k - 1 = 6 - 1 = 5
$$

Critical value at $α = 0.05$: $χ^2_{0.05,5} = 11.07$  _(which you get from [[Chi-square - distribution table]])_

Since $1.0 < 11.07$, **fail to reject $H_0$** → the die is likely fair.

---

## 🔄 2. Test of Independence

### Purpose:
To test if **two categorical variables** are **independent**.

### Example:

|              | Likes Coffee | Likes Tea | Total |
|--------------|--------------|-----------|-------|
| Men          | 40           | 10        | 50    |
| Women        | 20           | 30        | 50    |
| **Total**    | 60           | 40        | 100   |

Expected frequency (e.g., Men-Coffee):

$$
E = \frac{(Row~Total) \times (Column~Total)}{Grand~Total} = \frac{50 \times 60}{100} = 30
$$

|              | Coffee | Tea   |
|--------------|--------|--------|
| Men          | 30     | 20     |
| Women        | 30     | 20     |

### Compute χ²:

$$
\chi^2 = \frac{(40 - 30)^2}{30} + \frac{(10 - 20)^2}{20} + \frac{(20 - 30)^2}{30} + \frac{(30 - 20)^2}{20} = 16.66
$$

### Degrees of Freedom:
$$
df = (r - 1)(c - 1) = (2 - 1)(2 - 1) = 1
$$

Critical value at $α = 0.05$: $χ^2_{0.05,1} = 3.84$  
Since $16.66 > 3.84$, **reject $H_0$** → beverage preference is **associated** with gender.

---

## 📊 3. Test of Homogeneity

### Purpose:
To determine if **different populations** have the **same distribution** of a categorical variable.

- **Mathematically identical** to the Test of Independence.
- Use a **contingency table** and compute $\chi^2$ the same way.

---

## 📋 Summary Table

| Test Type           | Use Case                                | df                | Requirement               |
|---------------------|-------------------------------------------|-------------------|---------------------------|
| Goodness-of-Fit     | Fit to theoretical distribution           | $k - 1$           | Each $E_i \geq 5$         |
| Independence        | Association between 2 variables           | $(r - 1)(c - 1)$  | Each $E_{ij} \geq 5$      |
| Homogeneity         | Comparing distributions across groups     | $(r - 1)(c - 1)$  | Each $E_{ij} \geq 5$      |

---

---
Tags: #math #statistics


#Hypothesis_Testing_and_PValues
