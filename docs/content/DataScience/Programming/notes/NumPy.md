[source📽️](https://www.youtube.com/watch?v=QUT1VHiLmmI&t=18s))
# Array

#### Array funs
1. `a.ndim`: Returns the number of dimensions of array `a` (e.g., for 2D arrays, it returns 2).
2. `a.shape`: Provides the shape of the array (i.e., the number of rows and columns).
3. `a.dtype`: Returns the data type of the array elements.

##### Matrix creation:
- `np.zeros((rows, columns))`: Generates a matrix filled with zeros.
- `np.ones((rows, columns))`: Generates a matrix filled with ones.
- `np.full((rows, columns), value)`: Creates a matrix where every element is set to the specified `value`.
- `np.random.rand(rows, columns)`: Generates a matrix with random numbers between 0 and 1.
- `np.random.randint(range, size=(rows, columns))`: Generates a matrix with random integers within a given `range`.
- `np.identity(columns)`: Creates an identity matrix (square matrix with 1s on the diagonal and 0s elsewhere).

##### Repeating an array:
- `np.repeat(arr, times, axis)`: Repeats the elements of `arr` a specified number of times along the given axis.

##### Copying arrays:
- If you assign `b = a`, both `a` and `b` will reference the same array, meaning changes in `b` will affect `a`.
- To prevent this, use `b = a.copy()` to create an independent copy of `a`.

##### Basic operations:
- If `a` is an array, then `a + 2` adds 2 to each element. Similarly, you can use `*`, `/`, and other operators to perform element-wise operations.
- You can also add two arrays `a + b` if they have compatible shapes, resulting in element-wise addition.
- `np.product(a)` multiplies every elements in array  ^8caefa

## 1d & 2d
`a = np.array([])`  1 dimension
`a = np.array( [[],[]])` 2d array , rows and columns should be same 
`a[row,coloum]` get elements 
`a[row,:]` get only row, vice Versa
`a[row, element point no:ele pt no :ele pt no ]`
to get specific element no  from row 
`a[row,column] = data`, to change element 

## 3d
`a = np.array([[ ], [ ] ,[ ]])`




## Load-From-File





## Idk

**`np.random.choice(number_of_objects, number_of_choices, rechoosable)`**

Where:

- `number_of_objects`: Represents the total number of items you have to choose from (like the marbles in the bag).
- `number_of_choices`: Specifies how many items you want to pick (how many times you draw from the bag).
- `rechoosable`: Determines whether an item can be chosen more than once (`replace=True` means rechoosable, `replace=False` means not rechoosable).



---
Tags: #cs #dsa


#Data_Science_Libraries_NumPy_Pandas_Matplotlib
