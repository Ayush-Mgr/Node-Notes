- It is commonly use when you want to perform a loop and you _know how many times_

- Basic for loop iterate till given range
	- counts from 0 till 10 ,
	- here 2 is step , meaning it will skip 2 int 
```python
for x in range(0,10,2)
	print(x)
```
- to reverse 
```python
for x in reversed(range(0,10))
	print(x)
```
- iterate over var
	- the four look for iterate over the variable's data till it's length
```python
var_ = 'this is variable '
for x in name
	print(x)
```

# Tqdm
```pyhon
x = np.ones((10,1))

for s in tqdm(x,desc='loading'):
    print(s)
    time.sleep(2)
    
    
    
# oputput:  loading:  70%|███████   | 7/10 [00:14<00:06,  2.00s/it]
```

---
Tags: #programming #tools


#Python_Basics
