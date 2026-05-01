### What is `torch.autograd`?

> basically, it shows us the correlation of each elements of the tensor with the results

`autograd` stands for **automatic [[gradient]]** calculation. It's like a magical accountant for your math operations. 🤖

Imagine you're baking a cake (`z`) using several ingredients (`x` and `y`). The recipe is `z = x * y + y²`.

1. **Mark Your Ingredients (`requires_grad=True`)**: You tell PyTorch, "Hey, I care about these two ingredients, `x`and `y`. Please watch them closely." , by default, it is false
    
2. **Bake the Cake (Perform Operations)**: You follow the recipe and combine `x` and `y` to get your final cake, `z`. As you do this, `torch.autograd` secretly watches every single step and keeps a detailed record of how `x` and `y` were mixed, added, and multiplied to create `z`.
    
3. **Ask the Big Question (`z.backward()`)**: This is the magic part. You tell `autograd`, "Based on the final cake `z`, go **backward** through your records and figure out how much each original ingredient (`x` and `y`) was responsible for the final taste."
    

`autograd` then automatically calculates those "steepness" or "sensitivity" values (the gradients) for you. It figures out that nudging `y` has a much bigger effect on the final result than nudging `x`.

4. **See the Results (`.grad`)**: It stores these results directly in your original ingredients. So, `x.grad` will hold the value `3.0`, and `y.grad` will hold the value `8.0`.
    

> **Why is this important?** In AI, we want to adjust our inputs (called "weights") to make our model's error (`z`) as small as possible. The gradient tells us exactly which direction to "nudge" our inputs to go "downhill" and reduce the error. `torch.autograd` does all this complicated "steepness" calculation for us automatically, which is the engine that powers how AI models learn.

---

## Example 

```Python
# Create tensors with requires_grad=True
x = torch. tensor (12.0, 5.01, requires_grad=True)
y = torch. tensor( [3.0, 7.0], rectires_grad=True)
# Perform some operations
z = x * y + y**2
z. retain_grad() #By default intermediate layer weight updation is not shown.
# Compute the gradients
z_sum = z. sum ( ).backward(retain_graph = True ) #PyTorch **frees the computation graph** to save memory , retain_graph retains the computation graph after the backward pass for further backward calls.

print(f"Gradient of x: {x.grad}")
print (f"Gradient of y: {y-grad}")
print(f"Gradient of z: {z.grad}")
print(f"Result of the operation: z = {z. detach ( )}")

```

This code is a great example of how PyTorch's automatic differentiation engine, `Autograd`, works. Let's break it down step-by-step.

### 1. Creating the Tensors

Python

```Python
x = torch.tensor([2.0, 5.0], requires_grad=True)
y = torch.tensor([3.0, 7.0], requires_grad=True)
```

- Here, we create two tensors, `x` and `y`.
    
- The crucial part is **`requires_grad=True`**. This is like telling PyTorch: "Pay close attention to `x` and `y` and every calculation they are involved in. I will need to know how our final result changes with respect to them." These are often called "leaf" tensors because they are the starting points of our graph.
    

---

### 2. Performing the Operation

Python

```Python
z = x * y + y**2
```

- This is a standard mathematical operation. Since `x` and `y` are tensors, PyTorch performs these operations element-wise.
    
    - `x * y` results in `[2.0*3.0, 5.0*7.0]` which is `[6.0, 35.0]`
        
    - `y**2` results in `[3.0*3.0, 7.0*7.0]` which is `[9.0, 49.0]`
        
    - `z` becomes `[6.0 + 9.0, 35.0 + 49.0]` which is `[15.0, 84.0]`
        
- In the background, `Autograd` is building a computation graph, like a family tree, remembering that `z` was created from `x` and `y`.
    
<img src  = "Screenshot 2025-09-01 at 3.37.21 PM.png" style="filter: invert(1);">


---

### 3. Preparing for Gradient Calculation

Python

```Python
z.retain_grad()
z_sum = z.sum()
```

- **`z.retain_grad()`**: By default, PyTorch saves memory by only storing gradients for the leaf tensors (our original `x` and `y`). Since `z` is an intermediate result, its gradient would normally be discarded. This line explicitly tells PyTorch: "Please calculate and save the gradient for `z` as well." This is mostly used for debugging.
    
- **`z_sum = z.sum()`**: The `backward()` function can only be started from a **scalar** (a single value). Our tensor `z` has two values `[15.0, 84.0]`. We use `.sum()` to add them together (`15.0 + 84.0 = 99.0`) to get a single number. In a real neural network, this final single number would be the **loss**.
    

---

### 4. The Magic Step: `backward()`

Python

```Python
z_sum.backward()
```

This is the main event. 🚀

This one command tells `Autograd` to:

1. Start at `z_sum`.
    
2. Travel backward through the computation graph it recorded.
    
3. Calculate the gradient (the "rate of change" or "steepness") of `z_sum` with respect to every tensor that was marked with `requires_grad=True`.
    
4. Store these calculated gradients in the `.grad` attribute of each tensor.
    

---

### 5. Viewing the Results

Python

```Python
print(f"Gradient of x: {x.grad}")
print(f"Gradient of y: {y.grad}")
print(f"Gradient of z: {z.grad}")
print(f"Result of the operation: z = {z.detach()}")
```

This section prints the values that `backward()` just calculated.

- **`x.grad`**: This shows how much `z_sum` would change for a tiny nudge in each element of `x`.
    
- **`y.grad`**: This shows how much `z_sum` would change for a tiny nudge in each element of `y`.
    
- **`z.grad`**: This shows the gradient of `z` itself. It's `[1., 1.]` because `z_sum = z[0] + z[1]`, so a nudge in `z[0]`changes the sum by exactly that amount (a rate of 1). This is only visible because we used `z.retain_grad()`.
    
- **`z.detach()`**: The `.detach()` method creates a new tensor that shares the same data but is "detached" from the computation graph. It's a clean way to view the final numerical result without its gradient history.
    

### Code Output

When you run this code, you get:

```Python
Gradient of x: tensor([3., 7.])
Gradient of y: tensor([ 8., 19.])
Gradient of z: tensor([1., 1.])
Result of the operation: z = tensor([15., 84.])
```

This tells us, for example, that the second element of `y` (the `7.0`) has the largest impact on the final sum, with a gradient of `19.0`.

## Detach()

### 🔹 Why `.detach()` exists

- In PyTorch, when `requires_grad=True`, every operation you do on that tensor gets **recorded** in the computation graph (so backprop can calculate gradients).
    
- Sometimes you want to use the values of that tensor, **but you don’t want those extra operations to affect the gradient calculation**.
    

That’s where `.detach()` comes in.

---

### 🔹 What `.detach()` does

- It creates a **new tensor** that **shares the same underlying data** with the original,
    
- but **gradient tracking is turned off** (`requires_grad=False`).
    
- So, no matter what experiments you do on the detached tensor, they won’t affect backpropagation.
    

---

### 🔹 Example

```python
import torch

x = torch.tensor([2.0], requires_grad=True)
y = x ** 2   # y = 4, tracked in graph

z = y.detach()  # z shares data but no grad tracking
z += 10         # experiment: add 10

print(y.requires_grad)  # True
print(z.requires_grad)  # False
```

- `y` is still part of the graph → used in backprop
    
- `z` is now free to play with (no gradient history)
    

---

✅ **Key use case**: When you want to log, visualize, or test things on intermediate results **without messing up training gradients**.

---

## Torch VIz

---
Tags: #deep-learning #neural-networks


#Machine_Learning_Concepts_In_Programming
