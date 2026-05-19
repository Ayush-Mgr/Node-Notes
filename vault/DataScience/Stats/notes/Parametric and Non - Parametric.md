---
title: "Parametric and Non - Parametric"
date: 2026-05-19T11:17:42.876Z
tags: [vault, web]
---




# We find Trend using
## Parametric 

we use regression functions to find the trends. 

 1. Linear equation:

$$y = mx+b $$

guessing the average  flow of data points using [[Linear regression]] method.

![[Pasted_image_2026-05-18T11-36-03-144Z_63v4_Unknown.jpeg]]



2. Quadratic Trend : 
$$T_t = a +bt+ct^2$$
getting the flow  of trend using Quadratic regression

![[Pasted_image_2026-05-18T11-36-30-104Z_k65g_Unknown.png]]

3. Exponential Trend :
$$T_t ​   =e^{α+βt}$$
getting the flow  of trend using Exponential regression

![[Pasted_image_2026-05-19T11-17-36-295Z_ofqg_2bd608cad84afa821404ab94f9cab1db4783afdd.svg]]

# NON-Parametric

smoothing messy datapoints to the point it starts to show trend  

1. K-moving Averages:
$$\hat{T} = \frac{1}{k} \sum_{i=d-1}^{d} y_t+i$$

$k$: The size of your window (how many total points you are averaging).  

$d$: How many points you look at backwards and forwards from your current day. (The rule is $k=2d+1$) .
![[Pasted_image_2026-05-18T11-34-29-953Z_vg3h_movingaverage1.png]]
