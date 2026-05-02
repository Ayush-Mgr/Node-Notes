## Torch info
### 🔎 What is `torchinfo`?

- A **PyTorch utility** (previously called `torchsummary`) that **summarizes your model architecture**.
    
- It prints a **layer-by-layer breakdown** including:
    
    - Layer type (Conv, Linear, etc.)
        
    - Input/output shapes
        
    - Number of parameters
        
    - Trainable vs non-trainable params
        

Basically, it’s like **Keras `model.summary()`** but for PyTorch.

---
## 🔹 What `torchinfo` actually does

- `torchinfo` is **just a model summarizer**.
    
- You give it a model (your `nn.Module`) + an input size.
    
- It runs a **fake forward pass** and then prints:
    
    - Layer by layer architecture.
        
    - Input/output shape per layer.
        
    - Number of parameters per layer.
        
    - Total parameters, trainable params, non-trainable params.
        
    - Estimated memory usage.
        

So, it’s like **“X-ray goggles”** for your model. 🕶️

---

## 🔹 When is it used?

👉 **At the beginning**, right after you’ve defined your model.

- Purpose: to **verify architecture** before training.
    
- Make sure:
    
    - Shapes match.
        
    - Parameters are as expected.
        
    - No accidental mistakes in layer
---
### ⚙️ Install

```bash
pip install torchinfo
```

---

### 📝 Usage

```python
import torch
import torch.nn as nn
from torchinfo import summary

class SimpleCNN(nn.Module):
    def __init__(self):
        super(SimpleCNN, self).__init__()
        self.conv1 = nn.Conv2d(3, 16, 3)
        self.fc1 = nn.Linear(16*30*30, 10)

    def forward(self, x):
        x = self.conv1(x)
        x = torch.flatten(x, 1)
        x = self.fc1(x)
        return x

model = SimpleCNN()
summary(model, input_size=(1, 3, 32, 32))  # batch=1, 3-channel, 32x32 image
```

✅ Output:

- Conv2d layer details
    
- Flatten shape
    
- Fully connected layer shape
    
- Param counts
    

---

### 📊 Why use it?

- Quick sanity check for model dimensions.
    
- Helps catch shape mismatches early.
    
- Shows model complexity (#params, memory usage).
    

---

⚡ Reality check: `torchinfo` is **super useful during prototyping**. After your model works, you won’t need it much, but it can save hours of debugging shape errors.

---

---
Tags: #deep-learning #neural-networks


#PyTorch_and_Implementation
