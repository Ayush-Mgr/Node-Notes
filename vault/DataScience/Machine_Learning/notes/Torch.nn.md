# PyTorch `torch.nn` Summary

## 🔹 What is `torch.nn`?
- A **module** in PyTorch that provides:
  - Building blocks for **neural networks** (layers, activations, losses).
  - A base class `nn.Module` for defining custom models.
- Think of it as a **Lego set** for building deep learning models.

---

## 🔹 Core Concepts
### 1. `nn.Module`
- Every model in PyTorch is a subclass of `nn.Module`.
- You define:
  - **Layers** in `__init__`.
  - **Forward pass** in `forward`.

```python
import torch.nn as nn

class SimpleMLP(nn.Module):
    def __init__(self):
        super().__init__()
        self.fc1 = nn.Linear(784, 128)
        self.relu = nn.ReLU()
        self.fc2 = nn.Linear(128, 10)

    def forward(self, x):
        x = self.fc1(x)
        x = self.relu(x)
        x = self.fc2(x)
        return x
````

---

### 2. Layers

- Common layers in `torch.nn`:
       
    - **Linear (Dense)**: `nn.Linear(in_features, out_features)`
        
    - **[[torch.nn.LAyers|Convolutional]]**: `nn.Conv2d(in_channels, out_channels, kernel_size)`
        
    - **Recurrent**: `nn.RNN`, `nn.LSTM`, `nn.GRU`
        
    - **Dropout**: `nn.Dropout(p)`
        
    - **BatchNorm**: `nn.BatchNorm1d`, `nn.BatchNorm2d`
        

---

### 3. Activations

- Available as layers or functions:
    
    - `nn.ReLU()`, `nn.Sigmoid()`, `nn.Tanh()`, `nn.Softmax(dim=1)`
        
- Typically used between layers.
    

---

### 4. Loss Functions

- Built-in loss functions for training:
    
    - `nn.CrossEntropyLoss()` (classification)
        
    - `nn.MSELoss()` (regression)
        
    - `nn.BCELoss()` (binary classification)
        
    - `nn.NLLLoss()` (negative log-likelihood)
        

---

### 5. Training Workflow

1. Define a model (subclass of `nn.Module`).
    
2. Pick a **loss function** from `nn`.
    
3. Pick an **optimizer** (from `torch.optim`).
    
4. Loop:
    
    - Forward pass → compute prediction.
        
    - Compute loss.
        
    - Backward pass (`loss.backward()`).
        
    - Optimizer step (`optimizer.step()`).
        

---

## 🔹 Key Takeaways

- `torch.nn` = **neural network toolkit** in PyTorch.
    
- `nn.Module` = **base class** for any model.
    
- Provides:
    
    - **Layers** (Linear, Conv, RNN…)
        
    - **Activations** (ReLU, Sigmoid…)
        
    - **Loss functions**
        
- Models are **composable like Lego blocks**.
    



---
Tags: #deep-learning #neural-networks


#PyTorch_and_Implementation
