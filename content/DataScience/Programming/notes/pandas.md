
# 📊 Pandas Quick Reference

## 🛠️ Creating, Reading and Writing

### *DATAFRAMES*

- **Importing pandas**
```python
import pandas as pd
````

- **Creating a DataFrame**
    

```python
pd.DataFrame({'column1': [50, 21], 'column2': [131, 2]})
```

- **Updating Index**
    

```python
pd.DataFrame({
    'Bob': ['I liked it.', 'It was awful.'],
    'Sue': ['Pretty good.', 'Bland.']
}, index=['Product A', 'Product B'])
```

---

### _SERIES_

- **Creating a simple Series**
    

```python
pd.Series([1, 2, 3, 4, 5])
```

- **Series with index and name**
    

```python
pd.Series(
    [30, 35, 40],
    index=['2015 Sales', '2016 Sales', '2017 Sales'],
    name='Product A'
)
```

---

### _READING FILES_

- **Read a CSV file**
    

```python
df = pd.read_csv("../input/wine-reviews/winemag-data-130k-v2.csv")
```

- **With custom index and parsing dates**
    

```python
df = pd.read_csv("file.csv", index_col="Date", parse_dates=True)
```

- `index_col="Date"` → sets the index to the "Date" column
    
- `parse_dates=True` → parses "Date" strings into `datetime64` type
    
- **Check size** → `df.shape`
    
- **Preview rows** → `df.head()`
    

---

## 🔍 Indexing, Selecting & Assigning

### _Native Accessors_

- **View entire DataFrame**
    

```python
Df #df is name of Dataframe
```

- **Get a column**
    

```python
df.column_name
# or
df['column_name'] #df is name of Dataframe
```

- **Get a specific value**
    

```python
df['column_name'][index] #df is name of Dataframe
df['column_x']  = df['column_y'] # copies all the value of column_Y to column_X

```

-  indexing by [[pandas#^9e18de|loc]] 
```python
df.loc[row_condition on column , column_labels]
```
- __Renaming columns__
	
```python
df.rename(columns={col_old_name:col_new_name},inplace = True)
#inplace = True, make updates current df permannly
```

- Shorting dataFrame by values
```Python
sale.sort_values(by='quantity',ascending=False)
```

---

## 🔗 Concatenation in Pandas

### 1. **Vertical (row-wise) concat**

```python
df1 = pd.DataFrame({'A': [1, 2]})
df2 = pd.DataFrame({'A': [3, 4]})
result = pd.concat([df1, df2], axis=0)
```

### 2. **Horizontal (column-wise) concat**

```python
result = pd.concat([df1, df2], axis=1)
```

### 3. **Reset index after concat & ignore**

```python
result = pd.concat([df1, df2], axis=0).reset_index(drop=True)
```


```python
result = pd.concat([df1, df2], ignore_index=True)#  you will ignore the index present in each date of frame before combining
```


### 4. **Concatenate a list of DataFrames**

```python
dfs = []
for season in seasons:
    df = pd.read_csv(f"data_{season}.csv")
    dfs.append(df)

all_data = pd.concat(dfs, axis=0).reset_index(drop=True)
```
## Merge
```Python
pd.merge(left, right, how='join_type', on='key_column')
```

Merge joints, the two data frames according to a given condition or value similar to SQL joints



The types of the merge are:

|id|prod|quantity|
|---|---|---|
|1|A|NaN|
|2|B|5|
|3|C|10|
|4|NaN|15|

---
## apply , Map  , Apply Map

- apply()
```python

df['col'].apply(Funcion) ## functions maybe SUM AVG or def

```






---
## group by()
```Python
groups=df.groupby('col') # creates a separate Groupby_type_dataFrame of  data grouped by the column
groups.get_group('key') # the keys are the unique values of the given column in the group by and this syntax returns the group based on A given key
```
### Split apply combine 

```Python
groups.function()# we could apply any function on groups, and it will be applied as aggregation to each group 
groups.plot() # gives us a separate plot for each groups
```



---

## Loc & iloc

^9e18de

Always structured as: `df.loc[ Rows_I_Want , Columns_I_Want ]`

- **To find rows:** Use a logical condition (e.g., `df['credit_score'] < 650`). This acts as your filter.
    
- **To edit columns:** Name the exact column you want to target (e.g., `'credit_score_'`).
    
- **To change the data:** Set it equal to your new value.
    

**Cheat Sheet Examples:**

- **Update 1 column (1  row condition):** `df.loc[df['credit_score'] < 650, 'credit_score_'] = 'Poor'`
    
- **Update 1 column (Multiple row condition):** `df.loc[(df['zip'].isna()) & (df['merchant_city'] == 'ONLINE'), 'zip'] = '0000'`
    
- **Update multiple columns at once:** `df.loc[df['merchant_city'] == 'ONLINE', ['zip', 'merchant_state']] = ['0000', 'N/A']`

---

#### 🔹 Example DataFrames

```python
import pandas as pd

sales = pd.DataFrame({
    'prods': ['prod1', 'prod2', 'prod3'],
    'quantity': [2, 3, 5]
})

````

**Resulting DataFrames:**

`sales`

| index | prods | quantity |
| ----- | ----- | -------- |
| 0     | prod1 | 2        |
| 1     | prod2 | 3        |
| 2     | prod3 | 5        |

---

#### 🔹 Selecting by Row Label(s)

- **Single row**
    
```python
    sales.loc[2]
```
    
    eturns row with index label **2** (`prod3, 5`).
    
- **Multiple rows (list of labels)**

```python  
     sales.loc[[0, 2]]
```
    
- **Range of rows (inclusive)**
    
```python
    sales.loc[0:1]
```


---

#### 🔹 Selecting by Column Label(s)

- **Single column**
    
```python
    sales.loc[2, 'prods']
```
    
- **Multiple columns**
    
```python
    sales.loc[:, ['prods', 'quantity']]
```
    

---

#### 🔹 Selecting Specific Cells

- **Single cell (row + column intersection)**
    
```python
    sales.loc[1, 'quantity']  ## returns 3
```
    

---

#### 🔹 Selecting with a Condition (Boolean Indexing)

- **Syntax**
    
```python
    df.loc[df['column_name'] condition value]
```
    
- **Example**
    
```python
    sales.loc[sales['quantity'] == 5]
```
    
    Returns all rows where `quantity == 5`.
    

---

#### 📝 Basic Syntax Summary

```python
## Select a single row by index label
df.loc[row_label]

## Select multiple rows by a list of index labels
df.loc[[label1, label2, ...]]

## Select a range of rows by index labels (inclusive)
df.loc[start_label : end_label]

## Select a single column by label
df.loc[:, column_label]

## Select multiple columns by labels
df.loc[:, [label1, label2, ...]]

## Select a specific cell by row and column label
df.loc[row_label, column_label]

## Select rows based on a condition in a column
df.loc[df['column_name'] condition value]
```

---

###### ILOC



 ILOC is same as LOC but only Takes index column as row input  ,
 only accepts the int and i doesn't use condition instead jump straight to given input , hence its _super fast_ 
 
 
### 📌 Difference Between `.loc[]` and `.iloc[]`

###### 🔹 `.loc[]` → **Label-based indexing**

- Uses the **row and column labels** (names/index values).
    
- First parameter = row labels
    
- Second parameter = column labels
    
- Works great when your DataFrame index has **meaningful labels** (like dates, IDs, custom names).
    
- **Row ranges are inclusive** (both start and end labels are included).
    

👉 Example:

```python
sales.loc[0:2, 'prods']  
```

Returns rows 0 through 2 from the **'prods'** column.

---

###### 🔹 `.iloc[]` → **Integer position-based indexing**

- Uses the **integer positions** of rows and columns (like a Python list).
    
- First parameter = row number(s)
    
- Second parameter = column number(s)
    
- Works great when your index is **not sequential** or is **jumbled**.
    
- **Row ranges are exclusive at the end** (like normal Python slicing).
    

👉 Example:

```python
sales.iloc[0:2, 0]
```

Returns rows **0 and 1** from the **first column**.

---

### 🔎 Why This Matters

Suppose your index is **not sequential**:

```python
import pandas as pd

sales = pd.DataFrame({
    'prods': ['prod1', 'prod2', 'prod3'],
    'quantity': [2, 3, 5]
}, index=[10, 20, 30])

print(sales)
```

|index|prods|quantity|
|---|---|---|
|10|prod1|2|
|20|prod2|3|
|30|prod3|5|

---

- **Using `.loc[]` (labels)**
    
```python
    sales.loc[20, 'prods']  
```
    
    → Looks up the row with **label `20`** → returns `"prod2"`.
    
- **Using `.iloc[]` (positions)**
    
```python
    sales.iloc[1, 0]  
```
    
    → Looks at the **second row, first column** (row position 1, column position 0) → `"prod2"`.
    

---

✅ So the key difference:

- `.loc[]` → works with **labels** (index names, column names).
    
- `.iloc[]` → works with **positions** (row numbers, column numbers).
    

---

Would you like me to make a **side-by-side table (loc vs iloc with the same examples)** so you can quickly compare them in one glance?
#### ✅ Key Takeaway

- `.loc[]` uses **labels** (row/column names).
    
- `.iloc[]` uses **integer positions**.
    




---

## null 

df.isnull() it  give us the missing values of data frame SUM functional along with this to get the total no value in each  column

df.fillna(df.mean(), inplace=True)  it feels the missing value with given function like average , mean

it

---
Tags: #programming #tools


#Data_Science_Libraries_NumPy_Pandas_Matplotlib
