# missing values
- `missing_values_count = data.isnull().sum()` get the number of missing data points per column
	- `data` data frame
	- `.isnull()` checks is there is null or not in data frame
	- `.sum()` sums the null
- `total_cells = np.product(data.shape)`  [[NumPy#^8caefa|np.product]]
- `total_missing = missing_values_count.sum()` how many total missing values do we have?
- `percent_missing = (total_missing/total_cells) * 100` percent of data that is missing

-  if a value is missing because it doesn't exist we call `NaN`
	-   `data.dropna(axis=1)` remove all the rows that contain a missing value
		- `axis=1` remove column with at least one `NaN`

-  if a value is missing because it wasn't recorded, then you can try to guess what it might have been based on the other values in that column and row. This is called **imputation**
	- `data.fillna(0)` to fill `NaN` with `0` 
		- `data.fillna(method='bfill', axis=0).fillna(0)` 
		- `.fillna(method='bfill', axis=0)` Fills `NaN` from back column
		- `.fillna(0)`  fill remaining(one without  columns with data nearby ) `Nan` to `0`
# scaling and Normalization 

- **Scaling**: means that you're transforming your data so that it fits within a specific scale, like 0-100 or 0-1 ( range )
	- `from mlxtend.preprocessing import minmax_scaling`
	- `scaled_data = minmax_scaling(original_data, columns=['usd_goal_real'])`
	- `minmax_scaling(original_data, columns=['column_name'])` Transforms  values of column to the range `[0, 1]`.
	- used when different features of data set has top be similar in range  
- **normalization (Statistical)**  transforms your observations (Data Noise) so that they can be described as a normal distribution


| **Term**                        | **example**                                              | **Range** | **When to Use**                                    |
| ------------------------------- | -------------------------------------------------------- | --------- | -------------------------------------------------- |
| **Scaling**                     | Varies (Normalization(not statical one),Standardization) | Varies    | General term for any kind of rescaling.            |
| **Normalization (Statistical)** | Varies (e.g., Box-Cox, log)                              | Varies    | When you need to make data more normal (Gaussian). |

**SCALING METHODS**

| **Term**                    | **Formula**                        | **Range**         | **When to Use**                                 |
| --------------------------- | ---------------------------------- | ----------------- | ----------------------------------------------- |
| **Normalization (Scaling)** | $\frac {x−min(x)}{max(x)−min(x)​}$ | [0, 1] or [-1, 1] | When feature values need a specific range.      |
| **Standardization**         | $\frac{x−mean(x)}{std(x)}​$​       | Centered around 0 | When data should have a mean of 0 and std of 1. |



---
Tags: #web-dev


#Other_Data_Operations
