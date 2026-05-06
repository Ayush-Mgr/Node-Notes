- Moments give us the central tendency [[mean]] the [[variance  & its coefficient|variance]] this [[Bowley’s Coefficient of Skewness|skewness]] and [[kurtosis|kurtosis]] of a data.
## Understanding Moments
- If $X1, X2, X3, X4,… XN$ and constant $A$  , (Xn = Xi)
	- First moment about A = $\frac{1}{n}  \sum(Xn - A)$
	- Second moment about A = $\frac{1}{n}  \sum(Xn - A)^2$ it gets squared 
	- third meant about A = $\frac{1}{n}  \sum(Xn - A)^3$ gets cubed 
	- so on.....
- now we change constant A to $\bar{X}$ mean
	- First moment about $\bar{X}$ = $\frac{1}{n}  \sum(Xn - \bar{X})$ 
	- Second moment about $\bar{X}$= $\frac{1}{n}  \sum(Xn - \bar{X})^2$ it gets squared 
	- third meant about $\bar{X}$= $\frac{1}{n}  \sum(Xn - \bar{X})^3$ gets cubed 
	- fourth meant about $\bar{X}$= $\frac{1}{n}  \sum(Xn - \bar{X})^4$ gets cubed
	- so on.....
- First moment about$\bar{X}$ = *mean* if $\bar{X}$ = 0
	- $m'_1$ = $\frac{1}{n}  \sum(Xn - \bar{X})$ = 0 (since mean is  0)
	- $\frac{1}{n}  \sum(Xn - 0)$
	- $\frac{1}{n}  \sum(Xn )$
- Second moment about $\bar{X}$ = is *Variance* ($\sigma^2$)
	- $m'_2$ = $\frac{1}{n}  \sum(Xn - \bar{X})^2$
- third meant about $\bar{X}$ is used to measure *skewness*
	- $m'_3$ =  $\frac{1}{n}  \sum(Xn - \bar{X})^3$ 
- fourth meant about $\bar{X}$ is used to measure  *kurtosis*
	- $m'_4$ = $\frac{1}{n}  \sum(Xn - \bar{X})^4$
---
- Type of moments  
	- $r^{th}$ moments about a =  $\frac{1}{n}  \sum(Xn - A)^r$ (NON central)
		- denoted as $m$
	- $r^{th}$ moments about 0 or Raw moments  = $\frac{1}{n}  \sum(Xn)^r$ (NON central)
		- denoted as $m$
	- $r^{th}$ moments about $\bar{X}$ or ***Central moments*** = $\frac{1}{n}  \sum(Xn-\bar{X})^r$ ( central)
		- $m'$
---
## skewness and kurtosis from beta - coefficient and gamma - coefficients

^cde9b9

### **Beta Coefficients**  
- **Definition:**
  - Beta coefficients are used in statistics to measure skewness and kurtosis.
  - formula:
	  - $beta_1  = \frac{m_2^3}{m_2^3}$
		  - related to skewness
	  - $beta_2= \frac{m_4}{m_2^2}$
		  - related to kurtosis.
  - **Properties:**  
  - it is a relative measure 
  - Beta coefficients cannot be negative.  
  - They are pure numbers (dimensionless, without units).  
  - They are independent of the origin and scale of the data.  
  - Used specifically to measure skewness ($beta_1$) and kurtosis ($beta_2$).

---

### **Gamma Coefficients**  
- **Definition:**
  - Gamma coefficients provide direct measures of skewness and kurtosis.  
  - Formula:
	  - $\gamma_1 = \sqrt{\beta_1}$
		  - represents skewness, 
	- $\gamma_2 =\beta_2 - 3$
		- represents kurtosis.

- **Interpretation:**  
  - **For $\\gamma_1$ (Skewness):**  
    - If $\\\gamma_1 < 0$: Negatively skewed.  
    - If $\\\gamma_1 > 0$: Positively skewed.  
    - If $\\\gamma_1 = 0$: Symmetrical distribution.  

  - **For $\\gamma_2$ (Kurtosis):**  
    - If $\gamma_2 = 0$: Mesokurtic (normal distribution).  
    - If $\gamma_2 > 0$: Leptokurtic (sharper peak).  
    - If $\gamma_2 < 0$: Platykurtic (flatter peak).  
    - If $\gamma_2 = 3$: Mesokurtic (normal kurtosis).  
    - If $\gamma_2 > 3$: Leptokurtic (high kurtosis).  

--- 

---
Tags: #math #statistics


#Descriptive_Statistics
