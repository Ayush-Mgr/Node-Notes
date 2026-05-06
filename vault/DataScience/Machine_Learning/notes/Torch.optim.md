# PyTorch `torch.optim` Summary

> updates the parameters vibha based on the gradient given by Autograd

## 🔹 What is `torch.optim`?
- A module in PyTorch that provides **optimization algorithms** for training neural networks.
- Works with `torch.nn` by updating the model’s parameters based on gradients computed by backpropagation.

---

## 🔹 Core Concepts

### 1. Optimizer
- An **optimizer** updates the parameters (`weights, biases`) of a model.
- You create it by passing:
  1. The model parameters (`model.parameters()`).
  2. Hyperparameters like **learning rate**.

```python
import torch.optim as optim

optimizer = optim.SGD(model.parameters(), lr=0.01, momentum=0.9)
````

---

### 2. Common Optimizers

- **SGD**: `optim.SGD` (Stochastic Gradient Descent)
    
    - With or without momentum.
        
- **[[Adam optimizer|Adam]]**: `optim.Adam` (adaptive learning rate, very popular).
    
- **RMSprop**: `optim.RMSprop` (handles non-stationary objectives).
    
- **Adagrad**, **Adadelta**, **AdamW**, etc.
    

---

### 3. Training Workflow with Optimizer

Typical loop:

```python
for data, target in train_loader:
    # Forward pass
    output = model(data)
    loss = criterion(output, target)

    # Backward pass
    optimizer.zero_grad()   # clear old gradients
    loss.backward()         # compute new gradients
    optimizer.step()        # update weights
```

---

### 4. Learning Rate Scheduling

- PyTorch has `torch.optim.lr_scheduler` for adjusting learning rates during training.
    
- Example:
    

```python
from torch.optim.lr_scheduler import StepLR

scheduler = StepLR(optimizer, step_size=10, gamma=0.1)

for epoch in range(30):
    train(...)
    scheduler.step()
```

---

## 🔹 Key Takeaways

- `torch.optim` = **where you pick your optimizer** (SGD, Adam, RMSprop…).
    
- Every training step:
    
    1. Zero gradients → `optimizer.zero_grad()`
        
    2. Backpropagate → `loss.backward()`
        
    3. Update params → `optimizer.step()`
        
- Learning rate scheduling available via `torch.optim.lr_scheduler`.
    
---

---
Tags: #deep-learning #neural-networks


#PyTorch_and_Implementation
