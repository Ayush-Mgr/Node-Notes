
A **tensor in PyTorch** is a **generalized multi-dimensional array** (scalars → vectors → matrices → higher dimensions).  like Numpy.
	With the capability of utilizing GPU 
	tensors are the **data containers** you feed into neural networks



```python


torch.tensor(data,dtype=torch.float32) # convert the given  data (numpy, nest list, or other tensor) into tensor

```
---

---

### 1. **`torch.tensor()`**

- Converts existing data (like a list, NumPy array, etc.) into a tensor.
    
- You give it **data explicitly**.
    

```python
import torch

data = [[1, 2], [3, 4]]
t = torch.tensor(data)
print(t)
# tensor([[1, 2],
#         [3, 4]])
```

---

### 2. **`torch.zeros()`**

- Creates a new tensor filled with **0s**.
    
- You specify the **shape**, not the values.
    

```python
z = torch.zeros(2, 3)   # shape (2,3)
print(z)
# tensor([[0., 0., 0.],
#         [0., 0., 0.]])
```

---

### 3. **`torch.ones()`**

- Same idea, but fills the tensor with **1s**.
    

```python
o = torch.ones(2, 3)
print(o)
# tensor([[1., 1., 1.],
#         [1., 1., 1.]])
```

---

### ⚡ Key Difference

- `torch.tensor()` → **wraps/converts existing data** into a tensor.
    
- `torch.zeros()` / `torch.ones()` → **generates new data** of given size, filled with 0s or 1s.
    

---

💡 Tip:  
There’s also `torch.empty()` → gives you a tensor of uninitialized values (fast, but random garbage until you set them).

### .view()  , reshaping  
 `.view()` method in PyTorch is used to reshape a tensor without changing its data. It returns a new tensor with the same data as the original tensor but with a different shape. The new shape must be compatible with the original shape, meaning the total number of elements must remain the same.

For example, if you have a tensor of shape `(2, 3)` with 6 elements, you can use `.view(6)` to reshape it into a 1D tensor with 6 elements, or `.view(3, 2)` to reshape it into a tensor of shape `(3, 2)`.

In the code we discussed earlier, `img.view(-1)` reshapes the image tensor into a 1D tensor. The `-1` is a placeholder that tells PyTorch to infer the size of that dimension based on the other dimensions and the total number of elements in the tensor.


---
## Indexing


### 1. **Basic indexing** (like lists)

```python
import torch

t = torch.tensor([[10, 20, 30],
                  [40, 50, 60]])

print(t[0])      # first row → tensor([10, 20, 30])
print(t[1][2])   # row 1, col 2 → tensor(60)
```

---

### 2. **Slicing** (like Python slices)

```python
print(t[:, 1])    # all rows, 2nd column → tensor([20, 50])
print(t[0:2, :2]) # rows 0-1, cols 0-1 → tensor([[10,20],[40,50]])
```

---

### 3. **Fancy indexing** (pick specific indices)

```python
print(t[[0, 1], [1, 2]])  
# picks (0,1) and (1,2) → tensor([20, 60])
```

---

### 4. **Boolean masking**

```python
mask = t > 30
print(t[mask])   # tensor([40, 50, 60])
```

---

### 5. **Indexing with batch/channel dims**

If you have image tensors `(C, H, W)` or `(N, C, H, W)`:

```python
img = torch.ones(3, 4, 4)  # RGB (3 channels, 4x4)
print(img[0].shape)        # channel 0 (Red) → (4,4)
print(img[:, 0, 0])        # all channels at top-left pixel → (3,)
```

---

✅ **In short:**

- `[]` works like Python lists (rows first, then columns).
    
- `:` slices ranges.
    
- You can combine advanced tricks (boolean, lists of indices) for powerful selections.
    

---

## Data Type

```python
 t = torch.tensor([1,0])
 print(t.dtype) # outputs tensor's data time
 t2 = t.type(torch.float32) # changes the tensor type to torch.float32


```
---
## Tensor 2  numpy

```python
np_t = tensordata.numpy()# convert the given tensor data into data
tensor_t = torch.from_numpy(numpydata)# Converts The Given Number Data Into The tensor Data

```
## arithmetic operations


```python
import torch

a = torch.tensor([1, 2, 3], dtype=torch.float32)
b = torch.tensor([4, 5, 6], dtype=torch.float32)

print(a + b)   # addition → tensor([5., 7., 9.])
print(a - b)   # subtraction → tensor([-3., -3., -3.])
print(a * b)   # multiplication → tensor([ 4., 10., 18.])
print(a / b)   # division → tensor([0.2500, 0.4000, 0.5000])
print(a ** 2)  # power → tensor([1., 4., 9.])
```

---



Work with numbers directly.

```python
print(a + 10)   # tensor([11., 12., 13.])
print(a * 2)    # tensor([2., 4., 6.])
```

---



When tensors are 2D or more.

```python
A = torch.tensor([[1, 2], [3, 4]], dtype=torch.float32)
B = torch.tensor([[5, 6], [7, 8]], dtype=torch.float32)

print(A @ B)                # matrix multiplication
print(torch.matmul(A, B))   # same as above
print(torch.mm(A, B))       # same as above
print(A.T)                  # transpose
```

---

### In-place operations

Use `_` at the end. ⚠️ Changes the original tensor.

```python
a.add_(1)   # adds 1 to each element in a
print(a)
```

---

### . Broadcasting

PyTorch automatically “expands” shapes if compatible.

```python
x = torch.ones(3, 1)  # shape (3,1)
y = torch.ones(1, 4)  # shape (1,4)

print((x + y).shape)  # result is (3,4)
```

---
b * c✅ **Summary**:

- `+ - * / **` → element-wise
    
- `@` or `torch.matmul()` → matrix multiplication
    
- `_` suffix → in-place
    
- Broadcasting makes shapes flexible
    
---

## Cpu Vs Gpu 
   
```python

t=torch.tensor(data,device='cuda') # Device you could state CPU or CUDA which stands for GPU

t_cpu = t_gpu.to(device = 'cpu') # converts Gpu using tensor to use cpu 
t_gpu = t_cpu.to(device = 'gpu') # converts Gpu using tensor to use cpu 

```

---
Tags: #deep-learning #neural-networks


#Machine_Learning_Concepts_In_Programming
