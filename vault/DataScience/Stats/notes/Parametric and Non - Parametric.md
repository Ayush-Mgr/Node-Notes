---
title: "Parametric and Non - Parametric"
date: 2026-05-18T11:33:49.240Z
tags: [vault, web]
---

# We find Trend using
## Parametric 

we use regression functions to find the trends. 

 1. Linear equation:

$$y = mx+b $$

guessing the average  flow of data points using [[Linear regression]] method.

![[pending:img_mpb2wh5j_1c45]]



2. Quadratic Trend : 
$$T_t = a +bt+ct^2$$
getting the flow  of trend using Quadratic regression

![[pending:img_mpb36c6p_2m4v]]

3. Exponential Trend :
$$T_t ​   =e^{α+βt}$$
getting the flow  of trend using Exponential regression![[pending:img_mpb39lo9_j7r8]]

# NON-Parametric

smoothing messy datapoints to the point it starts to show trend  

1. K-moving Averages:
$$\hat{T} = \frac{1}{k} \sum_{i=d-1}^{d} y_t+i$$

$k$: The size of your window (how many total points you are averaging).  

$d$: How many points you look at backwards and forwards from your current day. (The rule is $k=2d+1$) .

