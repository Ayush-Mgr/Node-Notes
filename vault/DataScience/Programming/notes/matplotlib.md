# Matplotlib

Matplotlib is a widely used Python library for creating static, animated, and interactive [[Data Visualization]]. It provides functionalities similar to MATLAB and is especially useful for data visualization in data science, machine learning, and scientific computing.

## matplotlib.pyplot

`matplotlib.pyplot` is a module in Matplotlib that provides a MATLAB-like interface for creating figures, plots, and graphs.
- in a nutshell it all allows you to plot data

### 1. Types of Plots

Matplotlib supports various types of plots for different data visualization needs:

- **Line Plot**: Used to visualize trends over time.
  ```python
  plt.plot(x, y, marker='o', linestyle='-', color='b', label='Line Plot')
  ```
- **Scatter Plot**: Shows relationships between two variables.
  ```python
  plt.scatter(x, y, color='red', marker='x')
  ```
- **Bar Chart**: Used for categorical data visualization.
  ```python
  plt.bar(categories, values, color='green')
  ```
- **Histogram**: Visualizes data distribution.
  ```python
  plt.hist(data, bins=10, color='purple', edgecolor='black')
  ```
- **Pie Chart**: Displays proportions.
  ```python
  plt.pie(sizes, labels=labels, autopct='%1.1f%%', startangle=90)
  ```
- **Box Plot**: Helps in statistical analysis.
  ```python
  plt.boxplot(data)
  ```
- **Heatmap**: Used for matrix visualization.
  ```python
  plt.imshow(matrix, cmap='viridis', interpolation='nearest')
  ```

### 2. Ticks and Labels

Ticks and labels help in making the plots more readable.

- **Customizing Ticks**:
  ```python
  plt.xticks([0, 1, 2, 3], ['A', 'B', 'C', 'D'])
  plt.yticks([10, 20, 30, 40])
  ```
- **Setting Labels and Titles**:
  ```python
  plt.xlabel('X-axis Label')
  plt.ylabel('Y-axis Label')
  plt.title('Plot Title')
  ```
- **Adding a Legend**:
  ```python
  plt.legend(['Data 1', 'Data 2'])
  ```
- **Grid Lines**:
  ```python
  plt.grid(True, linestyle='--', alpha=0.6)
  ```

### 3. Multi-Figure and Subplots

#### Creating Multiple Figures

```python
plt.figure(1)
plt.plot([1, 2, 3], [4, 5, 6])
plt.figure(2)
plt.plot([1, 2, 3], [10, 20, 30])
plt.show()
```

#### Creating Subplots

```python
fig, axs = plt.subplots(2, 2, figsize=(10, 6))
axs[0, 0].plot([1, 2, 3], [4, 5, 6], 'r')
axs[0, 1].scatter([1, 2, 3], [4, 5, 6], color='b')
axs[1, 0].bar([1, 2, 3], [4, 5, 6], color='g')
axs[1, 1].hist([1, 2, 3, 4, 5, 6], bins=3, color='orange')
plt.tight_layout()
plt.show()
```

Well, in a nutshell fake is a plot a bigger plot, inside it you could plot data or _plot the plots itself_

Think of `fig` as a **big canvas** (the entire figure) and `ax` as a **specific area (subplot) inside that canvas** where you actually draw the plots.

---

##### **Breaking it Down:**
```python
fig, ax = plt.subplots()
```
- `fig` (**Figure Object**) → The **entire** figure (like a big sheet of paper).
- `ax` (**Axes Object**) → A **specific plotting area** inside the figure (where you draw your data).

---

##### **Example: One Plot (Single Axes)**
```python
import matplotlib.pyplot as plt

fig, ax = plt.subplots()  # Create a figure and one plot area (axes)
ax.plot([1, 2, 3], [4, 5, 6])  # Plot inside the Axes (plot area)

plt.show()
```
✅ Here, the **figure** exists, but the plot is drawn **inside the axes**.

---

##### **Example: Multiple Subplots (Multiple Axes)**
```python
fig, ax = plt.subplots(2, 2)  # Create a 2x2 grid of plots

ax[0, 0].plot([1, 2, 3], [4, 5, 6])  # Top-left plot
ax[0, 1].plot([1, 2, 3], [6, 5, 4])  # Top-right plot
ax[1, 0].plot([1, 2, 3], [2, 4, 6])  # Bottom-left plot
ax[1, 1].plot([1, 2, 3], [3, 3, 3])  # Bottom-right plot

plt.show()
```
✅ Now, we have **four separate plots (axes) inside the same figure!**

---

##### **Key Takeaways**
1. **`fig` (Figure)** = The whole canvas 🖼️
2. **`ax` (Axes)** = The smaller areas where you draw actual plots 📊
3. **Multiple `ax` inside `fig`** = Multiple subplots (useful for comparisons!)

### 4. Figure Size and Layout

- `plt.figure(figsize=(width, height))` - Adjusts the overall figure size.
- `plt.tight_layout()` - Automatically adjusts subplot spacing to prevent overlapping.
- `figsize=(width, height)` - Used in `plt.subplots()` or `plt.figure()` to control figure dimensions.

### 5. Saving Figures

Matplotlib allows saving figures in multiple formats:

```python
plt.savefig('plot.png', dpi=300, bbox_inches='tight')
```

Supported formats include PNG, SVG, PDF, and EPS.

---

## Matplotlib.animation

The `matplotlib.animation` module allows the creation of animated plots, useful for visualizing changing data over time.

### Example: Simple Animation

```python
import numpy as np
import matplotlib.pyplot as plt
import matplotlib.animation as animation

fig, ax = plt.subplots()
x = np.linspace(0, 2*np.pi, 100)
line, = ax.plot(x, np.sin(x))

# Animation function
def update(frame):
    line.set_ydata(np.sin(x + frame / 10.0))  # Update y values
    return line,

# Create animation
ani = animation.FuncAnimation(fig, update, frames=100, interval=50)
plt.show()
```

### Key Animation Functions

### FuncAnimation(fig, func, frames, interval)
- importing : `from matplotlib import funcanimation`
it  Creates an animation by calling func at each frame.
-  syntax:
	```python 
	animation = funcanimation(fig=fig,func=fun,frames=n,init_fun=,interval=n ms,repeat=bool)
	```
	-  `fig` : the figure
	- `func` : the function that will update the frames data
	- `frames` : no of total frames
	- `init_func=` : additional fun that comes once before animation starts 
	- interval : delay between frames in each seconds

- `ArtistAnimation(fig, frames, interval)`: Uses precomputed frames instead of updating dynamically.
- `ani.save('animation.mp4', writer='ffmpeg')`: Saves the animation as a video file.

### Advanced Animations

#### Animating a Scatter Plot

```python
import numpy as np
import matplotlib.pyplot as plt
import matplotlib.animation as animation

fig, ax = plt.subplots()
x_data, y_data = [], []
scatter = ax.scatter([], [])# settng plot to blank at start 

# Initialization function
def init():#setting the size limit of animations
    ax.set_xlim(0, 10)
    ax.set_ylim(0, 10)
    return scatter,

# Update function
def update(frame): # updating plots from blank to animation
    x_data.append(np.random.randint(0, 10))
    y_data.append(np.random.randint(0, 10))
    scatter.set_offsets(np.c_[x_data, y_data])
    return scatter,

ani = animation.FuncAnimation(fig, update, frames=20, init_func=init, blit=True)
plt.show()
```



## plot customization and viz

```python
import matplotlib.pyplot as plt  # Import Matplotlib for plotting

# Sample data
x = [1, 2, 3]
y = [4, 5, 6]

# Create figure and axes (object-oriented approach)
fig, ax = plt.subplots()  

# 🎨 Customize the plot line
ax.plot(x, y, linestyle='--', color='red', marker='o', markersize=8, label="Data Line")  
# - `linestyle='--'` → Dashed line
# - `color='red'` → Red color for the line
# - `marker='o'` → Circular markers at data points
# - `markersize=8` → Increase the marker size
# - `label="Data Line"` → Label for legend

# 🌟 Set background colors
fig.set_facecolor('black')     # Background of the entire figure
ax.set_facecolor('black')      # Background of the plotting area (inside the axes)

# 📏 Add grid lines with custom styles
ax.grid(color='gray', linestyle=':', linewidth=0.7, alpha=0.6)  
# - `color='gray'` → Light gray grid lines
# - `linestyle=':'` → Dotted grid lines
# - `linewidth=0.7` → Thin grid lines
# - `alpha=0.6` → Semi-transparent grid

# 🔠 Add axis labels
ax.set_xlabel("X-Axis Label", fontsize=12, fontweight='bold', color='white')  
ax.set_ylabel("Y-Axis Label", fontsize=12, fontweight='bold', color='white')  
# - `fontsize=12` → Set font size
# - `fontweight='bold'` → Make the text bold
# - `color='white'` → Set text color to white for better contrast

# 🏷️ Add title to the plot
ax.set_title("Customized Matplotlib Plot", fontsize=14, fontweight='bold', color='white')  

# 🏷️ Display legend
ax.legend(loc="upper left", fontsize=10, facecolor="black", edgecolor="white", labelcolor="white")  
# - `loc="upper left"` → Position the legend
# - `fontsize=10` → Font size for legend text
# - `facecolor="black"` → Legend background color
# - `edgecolor="white"` → White border around the legend box
# - `labelcolor="white"` → Change legend text color to white

# 🔠 Customize tick labels (numbers on the axes)
ax.tick_params(axis='x', colors='white', labelsize=10, labelrotation=0)  
ax.tick_params(axis='y', colors='white', labelsize=10, labelrotation=0)  
# - `colors='white'` → Change tick label color
# - `labelsize=10` → Change font size
# - `labelrotation=0` → Keep labels horizontal (rotate for better readability if needed)

# 📏 Customize axis spines (borders)
ax.spines['bottom'].set_color('white')  # Bottom border color
ax.spines['left'].set_color('white')    # Left border color
ax.spines['top'].set_color('gray')      # Top border color
ax.spines['right'].set_color('gray')    # Right border color
ax.spines['bottom'].set_linewidth(1.5)  # Make bottom border thicker
ax.spines['left'].set_linewidth(1.5)    # Make left border thicker

# 🎉 Display the final customized plot
plt.show()  


```

---
Tags: #programming #tools


#Data_Science_Libraries_NumPy_Pandas_Matplotlib
