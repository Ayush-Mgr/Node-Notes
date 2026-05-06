**Euclidean Distance** is a measure of the straight-line distance between two points in Euclidean space. It's commonly used in **kNN** (k-Nearest Neighbors) and other machine learning algorithms.
 
### Formula:

For two points $P(x_1, y_1)$ and $Q(x_2, y_2)$ in 2D space, the Euclidean distance $d(P, Q)$ is calculated as:

$$
d(P, Q) = \sqrt{(x_2 - x_1)^2 + (y_2 - y_1)^2}
$$

In general, for two points $P(x_1, x_2, \ldots, x_n)$ and $Q(y_1, y_2, \ldots, y_n)$ in $n$-dimensional space, the formula is:

$$
d(P, Q) = \sqrt{\sum_{i=1}^{n} (y_i - x_i)^2}
$$

### Example:

Let's calculate the Euclidean distance between two points in 2D space:

- Point $P(1, 2)$
- Point $Q(4, 6)$

Using the formula for 2D:

$$
d(P, Q) = \sqrt{(4 - 1)^2 + (6 - 2)^2}
$$
$$
d(P, Q) = \sqrt{3^2 + 4^2}
$$
$$
d(P, Q) = \sqrt{9 + 16}
$$
$$
d(P, Q) = \sqrt{25} = 5
$$

Thus, the Euclidean distance between points $P(1, 2)$ and $Q(4, 6)$ is **5**.

### For Higher Dimensions:

If the points are in a higher-dimensional space (e.g., 3D), the same formula applies, but with an additional term for the third coordinate. For example, for points $P(x_1, y_1, z_1)$ and $Q(x_2, y_2, z_2)$ in 3D space:

$$
d(P, Q) = \sqrt{(x_2 - x_1)^2 + (y_2 - y_1)^2 + (z_2 - z_1)^2}
$$

---
Tags: #machine-learning


#Models_and_Techniques
