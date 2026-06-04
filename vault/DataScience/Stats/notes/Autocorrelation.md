---
title: "Autocorrelation"
date: 2026-06-04T05:47:02.551Z
tags: [vault, web]
---


so autocorrelation check the correlation of yesterday and today according to average of past records.

example how much similar todays and yesterdays temperature after finding difference in todays temperature and yesterdays temperature and finding how similar the difference is.

$$
\rho_k = \frac{\sum (X_t - \mu)(X_{t-k} - \mu)}{\sum (X_t - \mu)^2}
$$

The Numerator: The "Sync" Engine (Autocovariance)

The top half of the fraction is where the actual detective work happens.

* $X_t$: Today's data point (e.g., today's temperature).
* $X_{t-k}$: The past data point you are checking (e.g., yesterday's temperature).
* $\mu$: The overall average of your entire dataset (the 70°F baseline).
* $(X_t-\mu)$: Today minus the average.
* $(X_{t-k}-\mu)$: The past day minus the average.
* The multiplication $(X_t-\mu)(X_{t-k}-\mu)$ mathematically forces them to interact.
  * If both are above average $(+\times+)$, the result is positive.
  * If both are below average $(-\times-)$, the result is positive.
  * If they move in opposite directions $(+\times-)$, the result is negative.
* $\sum$ (Sigma): The calculation is repeated for every valid pair in the dataset, and all results are added together into one cumulative score.

The Denominator: The "Scaler" (Variance)

If you only used the numerator, you would get a large raw number that is difficult to interpret.

The denominator

$$
\sum (X_t-\mu)^2
$$

is the variance-related scaling term.

* It measures the overall variability of the dataset.
* It scales the numerator to a standardized range.
* This guarantees that the final autocorrelation coefficient $(\rho_k)$ always lies between $-1$ and $1$.

Interpretation of $\rho_k$

* $\rho_k = 1$: Perfect positive autocorrelation.
* $\rho_k = 0$: No linear relationship with the past.
* $\rho_k = -1$: Perfect negative autocorrelation.

Putting it all together:

"Measure how far each observation is from the mean, compare those deviations with observations from $k$ periods ago, multiply them to check whether they move together or apart, add all those comparisons together, and finally divide by the overall variance to obtain a normalized score between $-1$ and $1$."

---
source: "https://www.geeksforgeeks.org/machine-learning/autocorrelation/"
