
### 🔹 What a `DataLoader` actually does

1. **Loads data from a `Dataset`** (like `ImageFolder` or a custom one).
    
2. **Divides it into mini-batches** → instead of giving you one sample at a time, you get `[batch_size]` samples together (better for training on GPUs).
    
3. **Shuffles** data if you want (`shuffle=True`) → makes training less biased.
    
4. **Splits into train/test (indirectly)** → not by itself, but you can create separate datasets (`train_dataset`, `test_dataset`) and then separate loaders (`train_loader`, `test_loader`).
    
5. **Handles parallelism** → loads data faster using multiple workers (`num_workers`).
    
6. **Transform ->** transforms your data into  Tensor.

---

### 🔹 Example flow

```python
# Step 1: Dataset
dataset = datasets.ImageFolder("data/train", transform=transform)

# Step 2: Train loader (mini-batches + shuffle)
train_loader = DataLoader(dataset, batch_size=32, shuffle=True)

# Step 3: Iterate
for images, labels in train_loader:
    # images: batch of 32 images
    # labels: batch of 32 labels
    ...
```

---

👉 So in short:

- **Dataset = “storage” of samples** (like all your images + labels).
    
- **DataLoader = “delivery system”** → feeds those samples in batches to your model, with options like shuffling and parallel loading.
    

---

---
Tags: #programming #tools


#PyTorch_and_Implementation
