`pip install torchviz  - installs the torch visualizer`

## What `torchviz` actually does

- It **only visualizes the autograd computation graph**.
    
- That means:
    
    - Tensors involved in a forward pass.
        
    - The operations applied to them.
        
    - How gradients will flow backward.
        

👉 It doesn’t visualize datasets, layers, or training progress.  
👉 It’s **not an official PyTorch companion library** like `torchvision`.

---
Tags: #deep-learning #neural-networks


#Machine_Learning_and_AI
