**Formula:**

$$\text{Skewness} = \frac{Q_3 + Q_1 - 2Q_2}{Q_3 - Q_1}​​$$
### Explanation of the Components:

1. **[[4. Partition Values - quartiles, deciles, and percentiles|Quartiles]]**:
    
    - $Q1$​: Represents the value below which 25% of the data lies.
    - $Q2$​: Represents the median, the midpoint of the data where 50% of observations are below and 50% are above.
    - $Q3$​: Represents the value below which 75% of the data lies.
2. **[[interquartile range & quartile deviation   & Coefficient|Interquartile Range]] (IQR)**:
    
    - $Q3−Q1$​: The spread of the middle 50% of the data, used to normalize the skewness measure to make it scale-independent.
3. **Asymmetry**:
    
    - The term $Q_3​+Q_1​−2Q_2$​ captures how far the median is from the mid-point of $Q1$​ and $Q3​$. In a symmetric distribution, the median is equidistant from $Q1$​ and $Q3$​, making this term zero. A non-zero value indicates asymmetry.

### Interpretation:

- **Symmetric Distribution**:
    
    - If the distribution is symmetric, the median ($Q2$​) lies exactly midway between $Q1$​ and $Q3$​, resulting in:$Q_3+Q_1−2Q_2$=0 Therefore, Bowley’s skewness = 0.
- **Positively Skewed Distribution**:
    
    - In a positively skewed distribution, the upper tail is longer. Here, $Q3$​ is farther from the median ($Q2$​) than $Q1$​, making $Q_3+Q_1−2Q_2$>0  which results in positive skewness.
- **Negatively Skewed Distribution**:
    
    - In a negatively skewed distribution, the lower tail is longer. Here, $Q1$​ is farther from the median ($Q2$​) than $Q3$​, making $Q_3+Q_1−2Q_2$<0 , which results in negative skewness.

---
Tags: #math #statistics


#Descriptive_Statistics
