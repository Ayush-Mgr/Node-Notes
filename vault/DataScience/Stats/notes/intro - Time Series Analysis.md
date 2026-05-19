---
title: "intro - Time Series Analysis"
date: 2026-05-19T11:13:30.598Z
tags: [vault, web]
---


time seres is a *series* of datas collected on certain time over a period , so the data contains the value and time

it is denoted as 
$$\left\{y_t\right\}_{t=1}^N$$

Here:
- $\left\{y_t\right\}$ : y  is the variable   data, and  t is the  time data  of record , {} represts variable data  and   time data as a whole
- $N$ :  total data set
- $t=1$: means the sequence starts at time step 1 (t=1) and continues up to the final time step $(N)$.
- over all it says that ${y_t}$ is the var in that time , $t=1^N$ and that var in that time is the one step $t=1$ of entire dataset or where the time ends  $N$

---
three types of data:

- Cross-sectional data : Tracking many things over a single point of time.
    
- Time series data : Tracking _one_ thing over _many_ time periods (e.g., watching a single stock's price every day for a year).
    
- Panel/Longitudinal data: A mashup of both. Tracking _many_ things over _many_ time periods (e.g., tracking 500 different stocks every day for a year).
---
**Classical Approach** to time series

It states that from dataset  $\left\{y_t\right\}_{t=1}^N$  any single data point you look at  $Y_t$ is actually built by adding four hidden pieces together:

$$Y_t​=T_t​+S_t​+C_t​+I_t​$$
Here:
- **$T_t$​ (Trend):** The overall long-term direction (is the data generally going up or down over a long time?).
    
- **$S_t$​ (Seasonality):** A repeating pattern that happens at regular, fixed intervals, usually within a year (like ice cream sales spiking every summer).
    
- **$C_t$​ (Cyclicity):** Repeating patterns that take _longer_ than a year and aren't perfectly fixed (like an economic recession that happens every 5 to 10 years).
    
- **$I_t$​ (Irregular/Noise):** The random, unpredictable blips and bumps that you just can't explain.


Trend:
types of trends:
- **Upward / Downward Trend:** A steady climb or fall over time.
    
- **Horizontal Trend:** The data stays mostly flat over the long term (also called a "Constant Level").
    
- **Non-linear Trend:** The data curves, perhaps growing slowly at first and then accelerating.
    
- **Damped Trend:** The data grows quickly at first, but then loses momentum and flattens out over time.
    
- **Exponential Trend:** The data multiplies over time, curving upward aggressively.
<img src=trend-in-time-series.png style="filter: invert(1);">

## ways to find trend 
- [[DataScience/Stats/notes/Parametric and Non - Parametric]]


