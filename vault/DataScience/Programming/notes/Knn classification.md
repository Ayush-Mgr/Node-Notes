**k-Nearest Neighbors (kNN) Classification** is a simple and intuitive machine learning algorithm used for classification tasks. It works by finding the $k$ training examples that are closest to a new data point and then assigning the most common label among those $k$ neighbors to the new point.

### How kNN Works:

1. **Choose the number of neighbors $k$**: Select a value for $k$, which represents the number of neighbors you want to consider when making a classification decision.
2. **Compute the distance**: For each new data point, calculate the distance (typically [[Euclidean distance]]) between the new point and all other points in the training data.
3. **Sort neighbors**: Sort the distances in ascending order and select the top $k$ nearest neighbors.
4. **Assign a label**: The new data point is classified based on the majority label of the $k$ nearest neighbors. For example, if most of the $k$ neighbors belong to class A, the new data point will be assigned to class A.

### Example:

Let's use a simple 2D example with a dataset of points in a 2D plane:

**Training Data**:

| Point (x, y) | Label |
|--------------|-------|
| (1, 2)       | A     |
| (2, 3)       | A     |
| (3, 3)       | B     |
| (6, 5)       | B     |
| (7, 8)       | B     |

Now, we want to classify the new point $(4, 4)$.

1. **Choose $k = 3$**: Let's look at the 3 nearest neighbors.
   
2. **Compute the distance** between $(4, 4)$ and all points:
   - Distance to $(1, 2)$: $\sqrt{(4-1)^2 + (4-2)^2} = \sqrt{9 + 4} = \sqrt{13}$
   - Distance to $(2, 3)$: $\sqrt{(4-2)^2 + (4-3)^2} = \sqrt{4 + 1} = \sqrt{5}$
   - Distance to $(3, 3)$: $\sqrt{(4-3)^2 + (4-3)^2} = \sqrt{1 + 1} = \sqrt{2}$
   - Distance to $(6, 5)$: $\sqrt{(4-6)^2 + (4-5)^2} = \sqrt{4 + 1} = \sqrt{5}$
   - Distance to $(7, 8)$: $\sqrt{(4-7)^2 + (4-8)^2} = \sqrt{9 + 16} = \sqrt{25}$

3. **Sort the points by distance**:
   - Nearest points: $(3, 3)$, $(2, 3)$, $(6, 5)$

4. **Assign a label**: Among the 3 nearest neighbors, 2 belong to class A, and 1 belongs to class B. Since the majority (2 out of 3) belong to class A, the new point $(4, 4)$ will be classified as **A**.

### Summary:

- **kNN** is a simple, instance-based learning algorithm.
- The value of $k$ can be adjusted for performance, with larger $k$ values leading to smoother decision boundaries.
- It works well when the decision boundary is highly non-linear and doesn't require training (as it’s based on the data directly).
- **Cons**: The algorithm can be computationally expensive for large datasets and may be sensitive to irrelevant features.

Would you like to see a code example or more details on how to implement kNN?

---
Tags: #machine-learning


#Algorithms_and_Data_Structures
