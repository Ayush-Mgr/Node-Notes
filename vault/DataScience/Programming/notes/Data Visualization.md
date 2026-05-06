most commonly used library for data visualization is [[matplotlib]] and seaborn
**IMPORT**
	- `import pandas as pd ` [[pandas#^1d928d|Reading a CSV]] for data manipulation 
	-  `import matplotlib.pyplot as plt` for handling and manipulating data in structured formats (like DataFrames).
	-  `import seaborn as sns` makes it easier to create informative and attractive statistical graphics.
- - when to use where to use ![[image (1).png]]
- `sns.set_style("dark")` To set Dark theme.
	-  list of themes,  (1)`"darkgrid"`, (2)`"whitegrid"`, (3)`"dark"`, (4)`"white"`, and (5)`"ticks"`.
- `plt.figure(figsize=(16,6))` Set the width and height of the figure
- `plt.title("Title_here")` Adds title
- `plt.show()` Displays the bar plot
- `plt.ylabel("Lable_here")` Adds label on y axis
- `plt.xlabel('Lable_here')` Adds label on x  axis

## Plots
- **LINE PLOT**
	- `sns.lineplot(data=fifa_data,x='Year', y='Goals')`  fifa_data from read_csv , prints the chart
- **BAR PLOT**
	- `sns.barplot(x='Category', y='Values', data=data)`
- **HEAT MAPS**
	- `sns.heatmap(data, annot=True, cmap='coolwarm')`
	- `annot=True`: Adds numeric labels inside the cells.
	- `cmap`: Colormap to control the color scheme (e.g., `'coolwarm'`, `'viridis'`).
	- `fmt` (optional): Format the annotation text (e.g., `fmt=".1f"` for one decimal place).
- **SCATTER PLOT**
	- `sns.scatterplot(x=VALUE-1, y=VALUE-2],hue=df.col)` 
		- **Regular scatter plot**
		- `hue=df.col` Highlights col in plot
	- `sns.regplot(x=VALUE-1, y=VALUE-2)` Scatter plot with **regression line** (*if line has slope `/` positive if `\` negative relation*)
	- `sns.lmplot(x="col-1", y="col-2", hue="col-1", data=insurance_data)` **Linear model plot**  visualize linear relationships between two variables along with their regression line.
	-   `sns.swarmplot(x=data.column-1,y=data.column-2)`**categorical scatter plot**
- HISTOGRAMS  
	- `sns.histplot(df.column)`  
	- `sns.kdeplot(data=data['column'], shade=True)` **kernel density estimate (KDE)** plot you can think of it as a smoothed histogram  
		- `shade=True` colors the area below the curve  
	- `sns.jointplot(x=data['column 1'], y=data['column 2'], kind="kde")` 2D KDE  
		-  the curve at the top of the figure is a KDE plot for the data on the x-axis (in this case,  `data['col 1']`)  
		-   the curve on the right of the figure is a KDE plot for the data on the y-axis (in this case,  `data['col 2']`).  
	- `sns.histplot(data=data, x='col 1', hue='col 2')`&  `sns.kdeplot(x=data['col 1'], hue=data['col2'], shade=True)` **colour coding**  
		-  `hue=`  sets the column we'll use to split the data into different histograms
-  **SUBPLOTS** **(*Multiple Plots*)**
	- `fig, ax = plt.subplots(1, 2, figsize=(15, 3))` to plot multiple plots at once 
	- **`plt.subplots()`**: This function creates a figure and a grid of subplots (plots within the figure) and returns two objects:
	    - **Figure** (`fig`): The overall container that holds the subplots.
	    - **Axes array** (`ax`): An array of individual plot areas, allowing us to control each subplot separately.
	- **`1, 2`**: These numbers define the layout of the grid of subplots:
	    - The first number (`1`) is the number of rows (here, just one row).
	    - The second number (`2`) is the number of columns (two columns for two subplots side-by-side).
	- `ax[0]` and `ax[1]` refer to the left and right subplots, respectively.
	- For example:
	    - `sns.histplot(original_data, ax=ax[0])` plots the original data on the left subplot.
	    - `sns.histplot(scaled_data, ax=ax[1])` plots the scaled data on the right subplot.
		-  `ax[0].set_title("Original Data")`
		- `ax[1].set_title("Scaled data")


---
Tags: #programming #tools
