It is the process of batching multiple data in a single tensor for efficient processing of multiple samples, 
```python

Batch_1 = torch.stack([data1,data2]) #Here batch1  is the list of two datas
```
The reason we do it because instead of applying loss correction with gradient to each and every single tensors, we could apply to a batch wise. It makes the computation efficient effective, and noise reducion

---


- **Tabular data** → shape = `(N, features)`
    
    - `N = batch size` (number of rows at once)
        
    - `features = number of columns per row`
        
- **Image data (PyTorch convention)** → shape = `(N, C, H, W)`
    
    - `N = batch size` (number of data)
        
    - `C = channels` (1 for grayscale, 3 for RGB)
        
    - `H, W = height & width`
        
- **Text / sequence data** → often `(N, sequence_length)` or `(sequence_length, N)` depending on framework.
    

---

## 📦 Why "flow" differs between libraries

- **NumPy / OpenCV** → images are `(H, W, C)`
    
- **PyTorch** → expects `(C, H, W)` (channel-first)
    
- When batching:
    
    - NumPy style: `(N, H, W, C)`
        
    - PyTorch style: `(N, C, H, W)`
        

So you often need to **permute / transpose axes**:

```python
import torch
import cv2

img = cv2.imread("cat.jpg")            # (H, W, C)
tensor_img = torch.tensor(img).permute(2, 0, 1)  # (C, H, W)

# add batch dimension
batch = tensor_img.unsqueeze(0)        # (1, C, H, W)
```

---


---
Tags: #deep-learning #neural-networks


#Machine_Learning_Concepts_In_Programming
