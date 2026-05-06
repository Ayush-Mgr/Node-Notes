### **[Probability Density Function (PDF) -> yt]( https://www.youtube.com/watch?v=jUFbY5u-DMs)**

A **Probability Density Function (PDF)** describes the likelihood of a continuous random variable taking on a particular value within a range. Unlike discrete random variables (where probabilities are assigned to specific values), for continuous random variables, probabilities are defined over intervals.

#### **Key Properties of PDF**
1. **Definition**:
   The PDF of a continuous random variable $X$, denoted as $f(x)$, satisfies:
   $$
   P(a \leq X \leq b) = \int_a^b f(x) \, dx
   $$
   This means the probability of $X$ lying between $a$ and $b$ is the area under the curve $f(x)$ over the interval \([a, b]\).

2. **Non-Negativity**:
   $$
   f(x) \geq 0 \quad \text{for all } x.
   $$

3. **Normalization**:
   The total area under the curve of $f(x)$ over the entire range of $X$ equals 1:
   $$
   \int_{-\infty}^\infty f(x) \, dx = 1.
   $$

4. **Point Probabilities**:
   For a continuous random variable, the probability of $X$ being exactly equal to a specific value $c$ is zero:
   $$
   P(X = c) = 0.
   $$
   Instead, we consider probabilities over intervals.

#### **Relationship to Cumulative Distribution Function (CDF)**:
The PDF is the derivative of the Cumulative Distribution Function (CDF), $F(x)$:
$$
f(x) = \frac{d}{dx} F(x),
$$
where $F(x) = P(X \leq x)$.

#### **Examples**:
1. **Uniform Distribution**:
   - $X \sim \text{Uniform}(a, b)$.
   - PDF:
     $$
     f(x) = \begin{cases} 
     \frac{1}{b-a}, & a \leq x \leq b \\
     0, & \text{otherwise}.
     \end{cases}
     $$

2. **Normal Distribution**:
   - $X \sim N(\mu, \sigma^2)$.
   - PDF:
     $$
     f(x) = \frac{1}{\sqrt{2\pi\sigma^2}} e^{-\frac{(x-\mu)^2}{2\sigma^2}}.
     $$

#### **Applications**:
- PDF is widely used in:
  - **Physics**: Modeling random phenomena (e.g., particle velocities).
  - **Statistics**: Describing distributions like normal, exponential, or gamma.
  - **Machine Learning**: For probabilistic models and Bayesian inference.


---
Tags: #math #statistics


#Distributions_and_Random_Variables
