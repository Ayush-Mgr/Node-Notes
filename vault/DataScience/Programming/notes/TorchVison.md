## 🔹 What is `torchvision`?

- `torchvision` is a **companion package** to PyTorch, focused on **Visual stuffs**.
    
- It gives you:
    
    1. **Datasets** (popular image datasets like CIFAR, MNIST, COCO, ImageNet…).
        
    2. **Transforms** (image preprocessing utilities).
        
    3. **Models** (pretrained CNN architectures like ResNet, VGG, MobileNet…).
        
    4. **I/O tools** (for reading, writing, displaying images).
        

---



---

## 🔹 Key Components of `torchvision`

### 1. **Datasets**

- Ready-to-use datasets:
    
    - `torchvision.datasets.MNIST`
        
    - `torchvision.datasets.CIFAR10`
        
    - `torchvision.datasets.FashionMNIST`
        
    - `torchvision.datasets.ImageNet` (download manually due to size)
        
- Works with `torch.utils.data.DataLoader` for batching/shuffling.
    

```python
from torchvision import datasets, transforms

train_data = datasets.CIFAR10(
    root="data", train=True, download=True,
    transform=transforms.ToTensor()
)
```

---

### 2. **Transforms**

- Preprocessing for images (like resizing, normalizing, augmentations).
    
- Examples:
    
    - `transforms.Resize((224,224))`
        
    - `transforms.Normalize(mean, std)`
        
    - `transforms.RandomHorizontalFlip()`
        
    - `transforms.ToTensor()`
        

```python
transform = transforms.Compose([
    transforms.Resize((224,224)),
    transforms.RandomHorizontalFlip(),
    transforms.ToTensor()
])
```



---

### 3. **Pretrained Models**

- Popular CNNs already trained on ImageNet:
    
    - `torchvision.models.resnet18(pretrained=True)`
        
    - `torchvision.models.vgg16(pretrained=True)`
        
    - `torchvision.models.mobilenet_v2(pretrained=True)`
        
- You can fine-tune them on your dataset.
    

```python
from torchvision import models

model = models.resnet18(pretrained=True)
```

---

### 4. **Image I/O**

- Read and manipulate images.
    
- `torchvision.io.read_image()`
    
- Integrates nicely with `PIL` for image handling.
    

---

## 🔹 Reality Check

- **Use `torch` for math + autograd.**
    
- **Use `torch.nn` to build models.**
    
- **Use `torch.optim` to train models.**
    
- **Use `torchvision` when working with images** (datasets, transforms, pretrained CNNs).
    

---
## **transforms.Compose()**

`transforms.Compose` is a class from the `torchvision.transforms`module that acts as a container for a sequence of image transformations. Its primary purpose is to chain multiple transformations together so they can be applied to an image in a specific order as a single operation.

Imagine you want to first resize an image to a specific size and then convert it to a tensor. You would create a `Compose` object like this:

  
```  python
import torchvision.transforms as transforms
my_transform = transforms.Compose([  
    transforms.Resize((256, 256)),  # Resize to 256x256  
    transforms.ToTensor()           # Convert to tensor  
])  
```
Then, when you apply `my_transform` to an image, it will first resize the image and then convert the resized image to a tensor.

In essence, `transforms.Compose` simplifies the process of applying multiple transformations by allowing you to define them in a list and execute them sequentially with a single call. This is very useful in image processing pipelines, especially when working with datasets for deep learning.

---

### 📑 Common PyTorch Transforms

| **Transform**                                        | **What it does**         | **Key Parameters**         | **Example**                                     |
| ---------------------------------------------------- | ------------------------ | -------------------------- | ----------------------------------------------- |
| `Resize(size)`                                       | Resizes image            | `size=(H,W)` or int        | `Resize((128,128))`                             |
| `CenterCrop(size)`                                   | Crops center region      | `size=(H,W)`               | `CenterCrop(64)`                                |
| `RandomCrop(size)`                                   | Crops randomly           | `size=(H,W)`               | `RandomCrop((64,64))`                           |
| `RandomResizedCrop(size)`                            | Crop +  resize           | `size`, `scale`, `ratio`   | `RandomResizedCrop(224, scale=(0.8,1.0))`       |
| `Pad(padding)`                                       | Adds padding             | int or tuple               | `Pad(4)`                                        |
| `RandomRotation(degrees)`                            | Rotate randomly          | `degrees`                  | `RandomRotation(15)`                            |
| `RandomHorizontalFlip(p)`                            | Flip left-right          | `p=0.5` by default         | `RandomHorizontalFlip(p=1)`                     |
| `RandomVerticalFlip(p)`                              | Flip up-down             | `p=0.5`                    | `RandomVerticalFlip()`                          |
| `RandomAffine(degrees, translate, scale, shear)`     | Random affine transform  | angles, translation, scale | `RandomAffine(15, translate=(0.1,0.1))`         |
| `ColorJitter(brightness, contrast, saturation, hue)` | Change color properties  | floats (0–1 range usually) | `ColorJitter(0.2, 0.2, 0.2, 0.1)`               |
| `Grayscale(num_output_channels)`                     | Convert to grayscale     | `1` or `3`                 | `Grayscale(1)`                                  |
| `RandomGrayscale(p)`                                 | Randomly grayscale       | `p=0.1`                    | `RandomGrayscale(0.3)`                          |
| `GaussianBlur(kernel_size)`                          | Blurs image              | int or tuple               | `GaussianBlur(5)`                               |
| `RandomAdjustSharpness(factor, p)`                   | Adjust sharpness         | `factor`                   | `RandomAdjustSharpness(2)`                      |
| `ToTensor()`                                         | PIL/numpy → Tensor       | –                          | `ToTensor()`                                    |
| `ToPILImage()`                                       | Tensor → PIL             | –                          | `ToPILImage()`                                  |
| `Normalize(mean, std)`                               | Normalize per channel    | tuples                     | `Normalize((0.5,), (0.5,))`                     |
| `Lambda(func)`                                       | Custom transform         | function                   | `Lambda(lambda x: x*255)`                       |
| `RandomApply([transforms], p)`                       | Apply transforms w/ prob | list, `p`                  | `RandomApply([ColorJitter()], p=0.3)`           |
| `RandomChoice([transforms])`                         | Pick one randomly        | list                       | `RandomChoice([Grayscale(3), GaussianBlur(3)])` |
| `RandomOrder([transforms])`                          | Shuffle order            | list                       | `RandomOrder([Flip(), Jitter()])`               |

---

### 🔥 Example Training vs Validation Transforms

**Training (with augmentation):**

```python
train_transform = transforms.Compose([
    transforms.RandomResizedCrop(224),
    transforms.RandomHorizontalFlip(),
    transforms.ColorJitter(brightness=0.2, contrast=0.2, saturation=0.2),
    transforms.ToTensor(),
    transforms.Normalize((0.5, 0.5, 0.5), (0.5, 0.5, 0.5))
])
```

**Validation (no augmentation, just scaling):**

```python
val_transform = transforms.Compose([
    transforms.Resize(256),
    transforms.CenterCrop(224),
    transforms.ToTensor(),
    transforms.Normalize((0.5, 0.5, 0.5), (0.5, 0.5, 0.5))
])
```

---

👉 This way, your **training data** gets randomized transformations (helps generalization),  
while **validation/test data** stays consistent for fair evaluation.

---

---
Tags: #deep-learning #neural-networks


#Machine_Learning_Concepts_In_Programming
