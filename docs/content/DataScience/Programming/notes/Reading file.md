## Without With function 
```python
filename = "example.txt"

f = open(filename, 'r') 
file_content = f.read()

print(file_content)
f.close()
```


## **Python File Handling: Reading a File**  

#### **Overview**  
In Python, the `open()` function is used to open files for reading or writing. 
The following line of code reads the entire content of a file into a variable:

```python
with open(filename, 'r') as f:
    file_content = f.read()
```

#### **Breaking it Down**  

1. **`open(filename, 'r')`**  
   - `filename`: The path to the file being opened.  
   - `'r'`: The mode `'r'` stands for **read mode**, meaning the file is opened only for reading.  
   
2. **`with open(...) as f:`**  
   - The `with` statement ensures the file is properly closed after use, even if an error occurs.  
   - `f` is a file object used to interact with the file.  similar to `f = open(filename, 'r') `
1. **`f.read()`**  
   - Reads the entire content of the file and stores it in `file_content`.  
   - If the file is large, this could use a lot of memory. For large files, reading line by line with `f.readline()` or `f.readlines()` is better.  

#### **Example Usage**  

Assuming we have a file named **"example.txt"** with the content:  

```
Hello, Python!
```

We can read it like this:  

```python
filename = "example.txt"

with open(filename, 'r') as f:
    file_content = f.read()

print(file_content)
```

**Output:**  
```
Hello, Python!
```

#### **Key Takeaways**  
 `with open()` is the preferred way to open files to avoid forgetting to close them.  
 `'r'` mode allows reading, but not writing.  
`f.read()` reads the whole file into a string.  




---
Tags: #programming #tools


#Miscellaneous
