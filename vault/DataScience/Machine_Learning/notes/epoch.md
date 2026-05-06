

### 🔹 What is an **epoch**?

An **epoch** = **one full pass of the training dataset through the model**.

---

### Example

- Suppose you have **1,000 training samples**.
    
- You train with **batch size = 100**.
    
- That means:
    $$1 epoch = \frac{n}{ b}$$
	    n = total training samples
	    b =  batch size
    - 1 epoch = 10 batches (100 samples × 10 = 1,000).
        
    - After 1 epoch, the model has seen **every training sample once**.
        

---

### Why do we need multiple epochs?

- One pass usually isn’t enough for the model to learn patterns.
    
- With each epoch, weights adjust based on errors.
    
- Typically we train for **many epochs** until the loss stops improving.
    

---

👉 So in short:

- **Batch** = small group of samples.
    
- **Iteration/step** = one update on a batch.
    
- **Epoch** = complete run over the whole dataset.
    

---

Do you want me to show you a **mini PyTorch training loop** with epochs, batches, and iterations labeled so you see where “epoch” fits in?

---
Tags: #deep-learning #neural-networks


#Neural_Networks_and_Deep_Learning
